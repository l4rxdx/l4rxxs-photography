const PHOTOPEA_ORIGIN = "https://www.photopea.com";
const DOCUMENT_TARGET_PATTERN = /^work-(\d{2})-(desktop|mobile)(?:\.[^.]+)?$/i;
const AUTOSAVE_POLL_INTERVAL = 6000;
const AUTOSAVE_IDLE_DELAY = 10000;
const EXPORT_FORMATS = [
  { stage: "webp", format: "webp", command: 'app.activeDocument.saveToOE("webp:0.92");' }
];

const frame = document.querySelector("[data-photopea-frame]");
const loading = document.querySelector("[data-loading]");
const statusElement = document.querySelector("[data-status]");
const sectionInput = document.querySelector("[data-section]");
const exportButton = document.querySelector("[data-export]");
const previewLink = document.querySelector("[data-preview]");
const modeButtons = [...document.querySelectorAll("[data-mode]")];
const previewChannel = "BroadcastChannel" in window
  ? new BroadcastChannel("l4rxx-work-preview")
  : null;

let activeMode = "desktop";
let photopeaReady = false;
let exportTask = null;
let autosaveTask = null;
let autosaveScanInFlight = false;
let autosaveForceScan = false;
let autosavePollTimer = 0;
let autosaveIdleTimer = 0;
let exportAfterAutosave = false;
const autosaveQueue = new Map();
const autosaveFingerprints = new Map();

const setStatus = (message, type = "") => {
  statusElement.textContent = message;
  statusElement.classList.toggle("is-error", type === "error");
  statusElement.classList.toggle("is-success", type === "success");
};

const buildPhotopeaUrl = () => {
  const configuration = {
    environment: {
      theme: 2,
      lang: "zh",
      intro: true
    }
  };
  return `${PHOTOPEA_ORIGIN}#${encodeURIComponent(JSON.stringify(configuration))}`;
};

const postPhotopeaScript = (script) => {
  frame.contentWindow?.postMessage(script, PHOTOPEA_ORIGIN);
};

const normalizeSection = () => {
  const value = Math.min(99, Math.max(1, Number.parseInt(sectionInput.value || "1", 10) || 1));
  sectionInput.value = String(value);
  return value;
};

const syncPreviewLink = () => {
  const sitePreviewUrl = new URL(window.location.href);
  sitePreviewUrl.port = "8778";
  sitePreviewUrl.pathname = "/work.html";
  sitePreviewUrl.search = `?mode=${activeMode}`;
  sitePreviewUrl.hash = "";
  previewLink.href = sitePreviewUrl.href;
  previewLink.textContent = activeMode === "mobile" ? "预览手机" : "预览电脑";
};

const setActiveMode = (mode) => {
  if (!["desktop", "mobile"].includes(mode)) return;
  activeMode = mode;
  modeButtons.forEach((item) => {
    item.setAttribute("aria-pressed", String(item.dataset.mode === activeMode));
  });
  syncPreviewLink();
};

const getDocumentTarget = (name) => {
  const match = String(name || "").trim().match(DOCUMENT_TARGET_PATTERN);
  if (!match) return null;
  return {
    section: Number.parseInt(match[1], 10),
    mode: match[2].toLowerCase()
  };
};

const resetExportTask = () => {
  exportTask = null;
  exportButton.disabled = !photopeaReady;
  if (autosaveQueue.size && !autosaveTask) scheduleAutosaveFlush(800);
};

const failExport = (message) => {
  setStatus(message, "error");
  resetExportTask();
};

const scheduleAutosavePoll = (delay = AUTOSAVE_POLL_INTERVAL) => {
  window.clearTimeout(autosavePollTimer);
  autosavePollTimer = window.setTimeout(() => requestAutosaveScan(), delay);
};

const scheduleAutosaveFlush = (delay = AUTOSAVE_IDLE_DELAY) => {
  window.clearTimeout(autosaveIdleTimer);
  autosaveIdleTimer = window.setTimeout(beginNextAutosave, delay);
};

const requestAutosaveScan = (force = false) => {
  if (!photopeaReady) return;
  if (exportTask || autosaveTask || autosaveScanInFlight) {
    if (force) autosaveForceScan = true;
    scheduleAutosavePoll();
    return;
  }
  autosaveScanInFlight = true;
  autosaveForceScan = force;
  postPhotopeaScript(`
    var autosaveDocuments = [];
    for (var autosaveIndex = 0; autosaveIndex < app.documents.length; autosaveIndex += 1) {
      var autosaveDocument = app.documents[autosaveIndex];
      var autosaveHistory = autosaveDocument.historyStates || [];
      var autosaveState = autosaveDocument.activeHistoryState;
      autosaveDocuments.push({
        name: String(autosaveDocument.name || ""),
        historyLength: Number(autosaveHistory.length || 0),
        historyName: autosaveState ? String(autosaveState.name || "") : "",
        layerCount: Number((autosaveDocument.layers || []).length || 0),
        width: Math.round(autosaveDocument.width.as ? autosaveDocument.width.as("px") : Number(autosaveDocument.width)),
        height: Math.round(autosaveDocument.height.as ? autosaveDocument.height.as("px") : Number(autosaveDocument.height))
      });
    }
    app.echoToOE("L4RXX_AUTOSAVE_META|" + encodeURIComponent(JSON.stringify(autosaveDocuments)));
  `);
};

const handleAutosaveMetadata = (payload) => {
  let documents = [];
  try {
    documents = JSON.parse(decodeURIComponent(payload || "")) || [];
  } catch {
    return;
  }

  documents.forEach((document) => {
    const target = getDocumentTarget(document?.name);
    if (!target) return;
    const key = `${String(target.section).padStart(2, "0")}-${target.mode}`;
    const fingerprint = [
      document.historyLength,
      document.historyName,
      document.layerCount,
      document.width,
      document.height
    ].join("|");
    if (autosaveFingerprints.get(key) === fingerprint) return;
    autosaveQueue.set(key, {
      key,
      name: document.name,
      section: target.section,
      mode: target.mode,
      fingerprint
    });
  });
};

const maybeAdvanceAutosave = () => {
  if (!autosaveTask || !autosaveTask.commandDone || !autosaveTask.uploadDone) return;
  autosaveFingerprints.set(autosaveTask.key, autosaveTask.fingerprint);
  autosaveTask = null;
  if (exportAfterAutosave) {
    exportAfterAutosave = false;
    startExport();
    return;
  }
  if (autosaveQueue.size) {
    beginNextAutosave();
    return;
  }
  exportButton.disabled = false;
  setStatus("所有已修改的 WORK PSD 已自动保存", "success");
};

const failAutosave = (message) => {
  autosaveTask = null;
  setStatus(message, "error");
  if (autosaveQueue.size) scheduleAutosaveFlush(800);
  else exportButton.disabled = false;
  scheduleAutosavePoll();
};

const uploadAutosaveFile = async (buffer) => {
  if (!autosaveTask || autosaveTask.uploading) return;
  autosaveTask.uploading = true;
  const params = new URLSearchParams({
    section: String(autosaveTask.section),
    mode: autosaveTask.mode,
    format: "psd",
    name: autosaveTask.name
  });
  try {
    const response = await fetch(`/__work/photopea/export?${params}`, {
      method: "POST",
      headers: { "Content-Type": "application/octet-stream" },
      body: buffer
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "PSD 自动保存失败");
    autosaveTask.uploadDone = true;
    autosaveTask.uploading = false;
    maybeAdvanceAutosave();
  } catch (error) {
    failAutosave(error instanceof Error ? error.message : "PSD 自动保存失败");
  }
};

const beginNextAutosave = () => {
  window.clearTimeout(autosaveIdleTimer);
  autosaveIdleTimer = 0;
  if (!photopeaReady || exportTask || autosaveTask) return;
  const next = autosaveQueue.entries().next();
  if (next.done) {
    if (exportAfterAutosave) {
      exportAfterAutosave = false;
      startExport();
    }
    return;
  }
  const [key, document] = next.value;
  autosaveQueue.delete(key);
  autosaveTask = {
    ...document,
    commandDone: false,
    uploadDone: false,
    uploading: false
  };
  setStatus(`正在自动保存 ${document.name}…`);
  const encodedName = encodeURIComponent(document.name);
  postPhotopeaScript(`
    var autosaveTargetName = decodeURIComponent("${encodedName}");
    var autosaveTarget = null;
    var autosavePreviousDocument = app.documents.length ? app.activeDocument : null;
    for (var autosaveIndex = 0; autosaveIndex < app.documents.length; autosaveIndex += 1) {
      if (String(app.documents[autosaveIndex].name || "") === autosaveTargetName) {
        autosaveTarget = app.documents[autosaveIndex];
        break;
      }
    }
    if (!autosaveTarget) {
      app.echoToOE("L4RXX_AUTOSAVE_ERROR|找不到需要自动保存的文档");
    } else {
      try {
        app.activeDocument = autosaveTarget;
        autosaveTarget.saveToOE("psd");
      } finally {
        if (autosavePreviousDocument) app.activeDocument = autosavePreviousDocument;
      }
    }
  `);
};

const sendMetadataRequest = () => {
  exportTask.stage = "meta";
  postPhotopeaScript(`
    if (!app.documents.length) {
      app.echoToOE("L4RXX_ERROR|请先打开或新建文档");
    } else {
      var d = app.activeDocument;
      var w = Math.round(d.width.as ? d.width.as("px") : Number(d.width));
      var h = Math.round(d.height.as ? d.height.as("px") : Number(d.height));
      var sectionIds = {};
      var scanLayers = function (layers) {
        for (var i = 0; i < layers.length; i += 1) {
          var layer = layers[i];
          var match = String(layer.name || "").match(/^(?:PHOTO|PERSON)(?:__|[._ -])(\d{2})$/i);
          if (match) sectionIds[match[1]] = true;
          if (layer.typename === "LayerSet") scanLayers(layer.layers);
        }
      };
      scanLayers(d.layers);
      app.echoToOE(
        "L4RXX_META|" + encodeURIComponent(d.name) + "|" + w + "|" + h + "|" +
        Object.keys(sectionIds).sort().join(",")
      );
    }
  `);
};

const startFileStage = (descriptor) => {
  exportTask.stage = descriptor.stage;
  exportTask.format = descriptor.format;
  exportTask.commandDone = false;
  exportTask.uploadDone = false;
  exportTask.uploading = false;
  setStatus("正在生成 WORK 平面图…");
  postPhotopeaScript(descriptor.command);
};

const maybeAdvanceExport = () => {
  if (!exportTask || exportTask.uploading || !exportTask.commandDone) return;
  if (exportTask.stage === "meta") {
    if (!exportTask.meta) {
      failExport("无法读取当前文档信息");
      return;
    }
    startFileStage(EXPORT_FORMATS[0]);
    return;
  }
  if (!exportTask.uploadDone) return;
  const index = EXPORT_FORMATS.findIndex((item) => item.stage === exportTask.stage);
  if (index >= 0 && index < EXPORT_FORMATS.length - 1) {
    startFileStage(EXPORT_FORMATS[index + 1]);
    return;
  }

  const completed = {
    section: String(exportTask.section).padStart(2, "0"),
    mode: exportTask.mode
  };
  setStatus(`章节 ${completed.section} · ${completed.mode === "desktop" ? "电脑" : "手机"} 已更新`, "success");
  previewChannel?.postMessage({ type: "reload" });
  resetExportTask();
};

const uploadPhotopeaFile = async (buffer) => {
  if (!exportTask || !["psd", "webp"].includes(exportTask.format)) return;
  exportTask.uploading = true;
  const params = new URLSearchParams({
    section: String(exportTask.section),
    mode: exportTask.mode,
    format: exportTask.format,
    width: String(exportTask.meta.width),
    height: String(exportTask.meta.height),
    name: exportTask.meta.name
  });

  try {
    const response = await fetch(`/__work/photopea/export?${params}`, {
      method: "POST",
      headers: { "Content-Type": "application/octet-stream" },
      body: buffer
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "保存失败");
    exportTask.uploadDone = true;
    exportTask.uploading = false;
    maybeAdvanceExport();
  } catch (error) {
    failExport(error instanceof Error ? error.message : "保存失败");
  }
};

const startExport = () => {
  if (!photopeaReady || exportTask) return;
  if (autosaveTask || autosaveScanInFlight) {
    exportAfterAutosave = true;
    exportButton.disabled = true;
    setStatus("当前自动备份完成后导出到 WORK…");
    return;
  }
  window.clearTimeout(autosaveIdleTimer);
  autosaveIdleTimer = 0;
  exportTask = {
    section: normalizeSection(),
    mode: activeMode,
    stage: "meta",
    meta: null,
    format: null,
    commandDone: false,
    uploadDone: false,
    uploading: false
  };
  exportButton.disabled = true;
  setStatus("正在检查当前文档…");
  sendMetadataRequest();
};

const handlePhotopeaString = (message) => {
  if (message.startsWith("L4RXX_AUTOSAVE_META|")) {
    handleAutosaveMetadata(message.slice("L4RXX_AUTOSAVE_META|".length));
    return;
  }
  if (message.startsWith("L4RXX_AUTOSAVE_ERROR|")) {
    failAutosave(message.slice("L4RXX_AUTOSAVE_ERROR|".length));
    return;
  }
  if (message.startsWith("L4RXX_ERROR|")) {
    failExport(message.slice("L4RXX_ERROR|".length));
    return;
  }
  if (message.startsWith("L4RXX_META|") && exportTask?.stage === "meta") {
    const [, encodedName, widthText, heightText, sectionIdsText = ""] = message.split("|");
    const documentName = decodeURIComponent(encodedName || "WORK");
    const documentTarget = getDocumentTarget(documentName);
    const width = Number.parseInt(widthText, 10);
    const height = Number.parseInt(heightText, 10);
    if (!Number.isInteger(width) || !Number.isInteger(height)) {
      failExport("文档尺寸无效");
      return;
    }
    const documentSections = sectionIdsText.split(",").filter((value) => /^\d{2}$/.test(value));
    if (documentTarget) {
      exportTask.section = documentTarget.section;
      sectionInput.value = String(documentTarget.section);
      exportTask.mode = documentTarget.mode;
      setActiveMode(documentTarget.mode);
    } else if (documentSections.length === 1) {
      const detectedSection = Number.parseInt(documentSections[0], 10);
      exportTask.section = detectedSection;
      sectionInput.value = String(detectedSection);
    }
    const targetSection = String(exportTask.section).padStart(2, "0");
    if (documentSections.length && !documentSections.includes(targetSection)) {
      failExport(
        `当前文档属于章节 ${documentSections.join("、")}，不能覆盖章节 ${targetSection}。请切换正确文档或修改章节编号。`
      );
      return;
    }
    exportTask.meta = {
      name: documentName,
      width,
      height
    };
    return;
  }
  if (message !== "done") return;

  if (!photopeaReady) {
    photopeaReady = true;
    exportButton.disabled = false;
    loading.classList.add("is-hidden");
    setStatus("Photopea 已连接");
    scheduleAutosavePoll(2500);
    return;
  }
  if (autosaveScanInFlight) {
    const force = autosaveForceScan;
    autosaveScanInFlight = false;
    autosaveForceScan = false;
    if (autosaveQueue.size && !exportAfterAutosave) {
      scheduleAutosaveFlush(force ? 0 : AUTOSAVE_IDLE_DELAY);
    }
    scheduleAutosavePoll();
    if (exportAfterAutosave) {
      exportAfterAutosave = false;
      startExport();
    }
    return;
  }
  if (exportTask) {
    exportTask.commandDone = true;
    maybeAdvanceExport();
    return;
  }
  if (autosaveTask) {
    autosaveTask.commandDone = true;
    maybeAdvanceAutosave();
  }
};

window.addEventListener("message", (event) => {
  if (event.source !== frame.contentWindow || event.origin !== PHOTOPEA_ORIGIN) return;
  if (typeof event.data === "string") {
    handlePhotopeaString(event.data);
    return;
  }
  if (event.data instanceof ArrayBuffer) {
    if (exportTask) uploadPhotopeaFile(event.data);
    else if (autosaveTask) uploadAutosaveFile(event.data);
  }
});

modeButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (exportTask) return;
    setActiveMode(button.dataset.mode);
  });
});

sectionInput.addEventListener("change", normalizeSection);
exportButton.addEventListener("click", startExport);
previewLink.addEventListener("click", () => {
  const previewUrl = new URL(previewLink.href);
  previewUrl.searchParams.set("refresh", String(Date.now()));
  previewLink.href = previewUrl.href;
});

document.addEventListener("visibilitychange", () => {
  if (document.hidden) requestAutosaveScan(true);
  else scheduleAutosavePoll(1200);
});
window.addEventListener("pagehide", () => requestAutosaveScan(true));

syncPreviewLink();
frame.src = buildPhotopeaUrl();
