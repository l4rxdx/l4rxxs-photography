const LOCAL_STORAGE_KEY = "l4rxx-work-editor-draft";
const HISTORY_LIMIT = 80;
const SNAP_DISTANCE_PX = 7;
const MIN_ELEMENT_SIZE = 24;

const createDefaultLayout = () => ({
  version: 1,
  updatedAt: null,
  assets: [],
  artboards: {
    desktop: {
      width: 1440,
      height: 1800,
      background: "#ffffff",
      elements: []
    },
    mobile: {
      width: 390,
      height: 1200,
      background: "#ffffff",
      elements: []
    }
  }
});

const editor = document.querySelector("[data-editor]");
const stage = document.querySelector("[data-stage]");
const stageSurface = document.querySelector("[data-stage-surface]");
const artboardShell = document.querySelector(".artboard-shell");
const artboardElement = document.querySelector("[data-artboard]");
const artboardLabel = document.querySelector("[data-artboard-label]");
const assetInput = document.querySelector("[data-asset-input]");
const assetGrid = document.querySelector("[data-asset-grid]");
const assetEmpty = document.querySelector("[data-asset-empty]");
const layerList = document.querySelector("[data-layer-list]");
const statusElement = document.querySelector("[data-status]");
const selectionCount = document.querySelector("[data-selection-count]");
const propertyGrid = document.querySelector("[data-element-properties]");
const styleProperties = document.querySelector("[data-style-properties]");
const artboardHeightInput = document.querySelector("[data-artboard-height]");
const artboardBackgroundInput = document.querySelector("[data-artboard-background]");
const copyDesktopButton = document.querySelector('[data-command="copy-desktop"]');
const zoomValue = document.querySelector(".zoom-value");
const marqueeElement = document.querySelector("[data-selection-marquee]");
const verticalGuide = document.querySelector("[data-guide-vertical]");
const horizontalGuide = document.querySelector("[data-guide-horizontal]");
const previewOverlay = document.querySelector("[data-preview-overlay]");
const previewCanvas = document.querySelector("[data-preview-canvas]");

let layout = createDefaultLayout();
let activeMode = "desktop";
let selectedIds = new Set();
let primaryId = null;
let zoom = 1;
let history = [];
let future = [];
let interaction = null;
let saveTimer = 0;
let spacePressed = false;
let previewResizeFrame = 0;
let textEditBefore = null;

const clone = (value) => JSON.parse(JSON.stringify(value));
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const round = (value, precision = 1) => {
  const scale = 10 ** precision;
  return Math.round(value * scale) / scale;
};
const makeId = (prefix) => `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
const getArtboard = () => layout.artboards[activeMode];
const getElements = () => getArtboard().elements;
const getElementById = (id) => getElements().find((element) => element.id === id);
const getPrimaryElement = () => getElementById(primaryId);
const snapshot = () => JSON.stringify(layout);

const setStatus = (message) => {
  statusElement.textContent = message;
};

const normalizeElement = (element) => ({
  id: typeof element.id === "string" ? element.id : makeId("layer"),
  type: ["image", "text", "rectangle"].includes(element.type) ? element.type : "rectangle",
  name: typeof element.name === "string" ? element.name : "图层",
  x: Number.isFinite(element.x) ? element.x : 0,
  y: Number.isFinite(element.y) ? element.y : 0,
  width: Number.isFinite(element.width) ? Math.max(MIN_ELEMENT_SIZE, element.width) : 200,
  height: Number.isFinite(element.height) ? Math.max(MIN_ELEMENT_SIZE, element.height) : 200,
  rotation: Number.isFinite(element.rotation) ? element.rotation : 0,
  opacity: Number.isFinite(element.opacity) ? clamp(element.opacity, 0, 1) : 1,
  hidden: Boolean(element.hidden),
  locked: Boolean(element.locked),
  src: typeof element.src === "string" ? element.src : "",
  text: typeof element.text === "string" ? element.text : "文字",
  color: typeof element.color === "string" ? element.color : "#111111",
  fontSize: Number.isFinite(element.fontSize) ? element.fontSize : 40
});

const normalizeLayout = (candidate) => {
  const fallback = createDefaultLayout();
  if (!candidate || candidate.version !== 1) return fallback;

  fallback.updatedAt = candidate.updatedAt || null;
  fallback.assets = Array.isArray(candidate.assets)
    ? candidate.assets
        .filter((asset) => asset && typeof asset.src === "string")
        .map((asset) => ({
          id: typeof asset.id === "string" ? asset.id : makeId("asset"),
          name: typeof asset.name === "string" ? asset.name : "素材",
          src: asset.src,
          width: Number.isFinite(asset.width) ? asset.width : 1,
          height: Number.isFinite(asset.height) ? asset.height : 1
        }))
    : [];

  for (const mode of ["desktop", "mobile"]) {
    const source = candidate.artboards?.[mode];
    if (!source) continue;
    fallback.artboards[mode].width = mode === "desktop" ? 1440 : 390;
    fallback.artboards[mode].height = clamp(Number(source.height) || fallback.artboards[mode].height, 480, 12000);
    fallback.artboards[mode].background = /^#[0-9a-f]{6}$/i.test(source.background)
      ? source.background
      : "#ffffff";
    fallback.artboards[mode].elements = Array.isArray(source.elements)
      ? source.elements.slice(0, 500).map(normalizeElement)
      : [];
  }

  return fallback;
};

const loadLayout = async () => {
  try {
    const response = await fetch("/__work/layout", { cache: "no-store" });
    if (!response.ok) throw new Error("Draft not found");
    layout = normalizeLayout(await response.json());
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(layout));
    setStatus("文件草稿已载入");
  } catch {
    try {
      const localDraft = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "null");
      layout = normalizeLayout(localDraft);
      setStatus(localDraft ? "浏览器草稿已载入" : "新草稿");
    } catch {
      layout = createDefaultLayout();
      setStatus("新草稿");
    }
  }
};

const saveLayout = async ({ quiet = false } = {}) => {
  window.clearTimeout(saveTimer);
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(layout));
  if (!quiet) setStatus("正在保存…");

  try {
    const response = await fetch("/__work/layout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(layout)
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "保存失败");
    layout.updatedAt = result.updatedAt;
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(layout));
    setStatus(quiet ? "已自动保存" : "已保存到文件");
  } catch {
    setStatus("已保存到浏览器，文件服务未连接");
  }
};

const queueSave = () => {
  window.clearTimeout(saveTimer);
  setStatus("有未保存更改");
  saveTimer = window.setTimeout(() => saveLayout({ quiet: true }), 900);
};

const recordChange = (before) => {
  if (!before || before === snapshot()) return false;
  history.push(before);
  if (history.length > HISTORY_LIMIT) history.shift();
  future = [];
  queueSave();
  updateHistoryButtons();
  return true;
};

const updateHistoryButtons = () => {
  document.querySelector('[data-command="undo"]').disabled = history.length === 0;
  document.querySelector('[data-command="redo"]').disabled = future.length === 0;
};

const restoreSnapshot = (serialized) => {
  layout = normalizeLayout(JSON.parse(serialized));
  selectedIds = new Set([...selectedIds].filter((id) => getElementById(id)));
  if (!selectedIds.has(primaryId)) primaryId = selectedIds.values().next().value || null;
  renderAll();
  queueSave();
};

const undo = () => {
  if (!history.length) return;
  future.push(snapshot());
  restoreSnapshot(history.pop());
  updateHistoryButtons();
};

const redo = () => {
  if (!future.length) return;
  history.push(snapshot());
  restoreSnapshot(future.pop());
  updateHistoryButtons();
};

const getArtboardPoint = (clientX, clientY) => {
  const rect = artboardElement.getBoundingClientRect();
  return {
    x: (clientX - rect.left) * (getArtboard().width / rect.width),
    y: (clientY - rect.top) * (getArtboard().height / rect.height)
  };
};

const createElementNode = (element, interactive = true) => {
  const node = document.createElement("div");
  node.className = "canvas-element";
  node.dataset.id = element.id;
  node.dataset.type = element.type;
  node.style.left = `${element.x}px`;
  node.style.top = `${element.y}px`;
  node.style.width = `${element.width}px`;
  node.style.height = `${element.height}px`;
  node.style.opacity = String(element.opacity);
  node.style.transform = `rotate(${element.rotation}deg)`;
  node.classList.toggle("is-hidden", element.hidden);
  node.classList.toggle("is-locked", element.locked);

  let content;
  if (element.type === "image") {
    content = document.createElement("img");
    content.src = element.src;
    content.alt = "";
    content.draggable = false;
  } else {
    content = document.createElement("div");
    if (element.type === "text") {
      content.textContent = element.text;
      content.style.color = element.color;
      content.style.fontSize = `${element.fontSize}px`;
    } else {
      content.style.backgroundColor = element.color;
    }
  }
  content.className = "canvas-element__content";
  node.appendChild(content);

  if (interactive) {
    node.classList.toggle("is-selected", selectedIds.has(element.id));
    node.classList.toggle("is-primary", primaryId === element.id);
    for (const handle of ["nw", "ne", "sw", "se"]) {
      const resizeHandle = document.createElement("span");
      resizeHandle.className = "resize-handle";
      resizeHandle.dataset.handle = handle;
      resizeHandle.setAttribute("aria-hidden", "true");
      node.appendChild(resizeHandle);
    }
    const rotateHandle = document.createElement("span");
    rotateHandle.className = "rotate-handle";
    rotateHandle.dataset.rotateHandle = "";
    rotateHandle.setAttribute("aria-hidden", "true");
    node.appendChild(rotateHandle);
  }

  return node;
};

const updateElementNode = (element) => {
  const node = artboardElement.querySelector(`.canvas-element[data-id="${CSS.escape(element.id)}"]`);
  if (!node) return;
  node.style.left = `${element.x}px`;
  node.style.top = `${element.y}px`;
  node.style.width = `${element.width}px`;
  node.style.height = `${element.height}px`;
  node.style.opacity = String(element.opacity);
  node.style.transform = `rotate(${element.rotation}deg)`;
};

const renderArtboard = () => {
  const artboard = getArtboard();
  artboardElement.querySelectorAll(".canvas-element").forEach((node) => node.remove());
  artboardElement.style.width = `${artboard.width}px`;
  artboardElement.style.height = `${artboard.height}px`;
  artboardElement.style.backgroundColor = artboard.background;
  artboardElement.style.transform = `scale(${zoom})`;
  artboardShell.style.width = `${artboard.width * zoom}px`;
  artboardShell.style.height = `${artboard.height * zoom}px`;
  artboardLabel.textContent = `${activeMode.toUpperCase()} · ${artboard.width} × ${Math.round(artboard.height)}`;
  artboard.elements.forEach((element) => artboardElement.insertBefore(createElementNode(element), marqueeElement));
  artboardHeightInput.value = String(Math.round(artboard.height));
  artboardBackgroundInput.value = artboard.background;
  copyDesktopButton.hidden = activeMode !== "mobile";
  zoomValue.textContent = `${Math.round(zoom * 100)}%`;
};

const renderAssets = () => {
  assetGrid.replaceChildren();
  assetEmpty.hidden = layout.assets.length > 0;
  for (const asset of layout.assets) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "asset-item";
    button.draggable = true;
    button.dataset.assetId = asset.id;
    button.title = asset.name;
    button.innerHTML = `<img src="${asset.src}" alt="">`;
    button.addEventListener("dragstart", (event) => {
      event.dataTransfer.effectAllowed = "copy";
      event.dataTransfer.setData("application/x-work-asset", asset.id);
    });
    button.addEventListener("dblclick", () => addImageElement(asset));
    assetGrid.appendChild(button);
  }
};

const renderLayers = () => {
  layerList.replaceChildren();
  const elements = [...getElements()].reverse();
  for (const element of elements) {
    const item = document.createElement("div");
    item.className = "layer-item";
    item.classList.toggle("is-selected", selectedIds.has(element.id));
    item.dataset.layerId = element.id;
    item.draggable = true;
    item.innerHTML = `
      <button type="button" data-layer-action="visibility" title="${element.hidden ? "显示" : "隐藏"}">${element.hidden ? "○" : "●"}</button>
      <button type="button" data-layer-action="lock" title="${element.locked ? "解锁" : "锁定"}">${element.locked ? "锁" : "开"}</button>
      <span class="layer-name">${element.name}</span>
    `;
    item.addEventListener("click", (event) => {
      const action = event.target.closest("[data-layer-action]")?.dataset.layerAction;
      if (action) {
        const before = snapshot();
        if (action === "visibility") element.hidden = !element.hidden;
        if (action === "lock") element.locked = !element.locked;
        recordChange(before);
        renderAll();
        return;
      }
      selectElement(element.id, event.shiftKey);
    });
    item.addEventListener("dragstart", (event) => {
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("application/x-work-layer", element.id);
    });
    item.addEventListener("dragover", (event) => {
      if (event.dataTransfer.types.includes("application/x-work-layer")) event.preventDefault();
    });
    item.addEventListener("drop", (event) => {
      event.preventDefault();
      reorderLayer(event.dataTransfer.getData("application/x-work-layer"), element.id);
    });
    layerList.appendChild(item);
  }
};

const renderProperties = () => {
  const element = selectedIds.size === 1 ? getPrimaryElement() : null;
  propertyGrid.classList.toggle("is-disabled", !element);
  selectionCount.textContent = selectedIds.size ? `已选择 ${selectedIds.size}` : "未选择";

  for (const input of propertyGrid.querySelectorAll("[data-property]")) {
    const property = input.dataset.property;
    if (!element) {
      input.value = "";
      continue;
    }
    input.value = property === "opacity"
      ? String(Math.round(element.opacity * 100))
      : String(round(element[property] ?? 0));
  }

  const showStyle = Boolean(element && element.type !== "image");
  styleProperties.classList.toggle("is-visible", showStyle);
  const textControl = styleProperties.querySelector("[data-text-control]");
  const fontSizeControl = styleProperties.querySelector("[data-font-size-control]");
  textControl.hidden = !element || element.type !== "text";
  fontSizeControl.hidden = !element || element.type !== "text";

  if (element) {
    const textInput = styleProperties.querySelector('[data-style-property="text"]');
    const colorInput = styleProperties.querySelector('[data-style-property="color"]');
    const fontSizeInput = styleProperties.querySelector('[data-style-property="fontSize"]');
    textInput.value = element.text;
    colorInput.value = element.color;
    fontSizeInput.value = String(element.fontSize);
  }
};

const renderAll = () => {
  renderArtboard();
  renderAssets();
  renderLayers();
  renderProperties();
  document.querySelectorAll("[data-mode]").forEach((button) => {
    button.setAttribute("aria-pressed", String(button.dataset.mode === activeMode));
  });
  updateHistoryButtons();
};

const selectElement = (id, additive = false) => {
  if (!additive) selectedIds.clear();
  if (additive && selectedIds.has(id)) {
    selectedIds.delete(id);
  } else {
    selectedIds.add(id);
    primaryId = id;
  }
  if (!selectedIds.size) primaryId = null;
  if (!selectedIds.has(primaryId)) primaryId = selectedIds.values().next().value || null;
  renderAll();
};

const clearSelection = () => {
  selectedIds.clear();
  primaryId = null;
  renderAll();
};

const addElement = (element) => {
  const before = snapshot();
  getElements().push(normalizeElement(element));
  selectedIds = new Set([element.id]);
  primaryId = element.id;
  recordChange(before);
  renderAll();
};

const addImageElement = (asset, point = null) => {
  const artboard = getArtboard();
  const ratio = asset.width / asset.height || 1;
  const maxWidth = Math.min(activeMode === "desktop" ? 480 : 260, artboard.width * .72);
  const width = ratio >= 1 ? maxWidth : maxWidth * ratio;
  const height = width / ratio;
  const position = point || {
    x: (artboard.width - width) / 2,
    y: Math.max(40, (Math.min(artboard.height, 900) - height) / 2)
  };
  const id = makeId("image");
  addElement({
    id,
    type: "image",
    name: asset.name,
    src: asset.src,
    x: clamp(position.x - (point ? width / 2 : 0), 0, Math.max(0, artboard.width - width)),
    y: clamp(position.y - (point ? height / 2 : 0), 0, Math.max(0, artboard.height - height)),
    width,
    height,
    rotation: 0,
    opacity: 1
  });
};

const addTextElement = () => {
  const artboard = getArtboard();
  const width = Math.min(420, artboard.width - 40);
  const id = makeId("text");
  addElement({
    id,
    type: "text",
    name: "文字",
    text: "文字",
    color: "#111111",
    fontSize: activeMode === "desktop" ? 48 : 28,
    x: (artboard.width - width) / 2,
    y: 120,
    width,
    height: activeMode === "desktop" ? 80 : 48,
    rotation: 0,
    opacity: 1
  });
};

const addRectangleElement = () => {
  const artboard = getArtboard();
  const width = Math.min(280, artboard.width * .5);
  const id = makeId("rectangle");
  addElement({
    id,
    type: "rectangle",
    name: "色块",
    color: "#111111",
    x: (artboard.width - width) / 2,
    y: 120,
    width,
    height: width,
    rotation: 0,
    opacity: 1
  });
};

const duplicateSelection = () => {
  if (!selectedIds.size) return [];
  const elements = getElements();
  const before = snapshot();
  const copies = [];
  for (const id of selectedIds) {
    const source = getElementById(id);
    if (!source) continue;
    const copy = clone(source);
    copy.id = makeId(source.type);
    copy.name = `${source.name} 副本`;
    copy.x += 18;
    copy.y += 18;
    elements.push(copy);
    copies.push(copy.id);
  }
  selectedIds = new Set(copies);
  primaryId = copies.at(-1) || null;
  recordChange(before);
  renderAll();
  return copies;
};

const deleteSelection = () => {
  if (!selectedIds.size) return;
  const before = snapshot();
  getArtboard().elements = getElements().filter((element) => !selectedIds.has(element.id) || element.locked);
  selectedIds = new Set([...selectedIds].filter((id) => getElementById(id)));
  primaryId = selectedIds.values().next().value || null;
  if (recordChange(before)) renderAll();
};

const reorderLayer = (sourceId, targetId) => {
  if (!sourceId || sourceId === targetId) return;
  const elements = getElements();
  const sourceIndex = elements.findIndex((element) => element.id === sourceId);
  const targetIndex = elements.findIndex((element) => element.id === targetId);
  if (sourceIndex < 0 || targetIndex < 0) return;
  const before = snapshot();
  const [source] = elements.splice(sourceIndex, 1);
  elements.splice(targetIndex, 0, source);
  recordChange(before);
  renderAll();
};

const alignSelection = (alignment) => {
  const selected = getElements().filter((element) => selectedIds.has(element.id) && !element.locked);
  if (!selected.length) return;
  const before = snapshot();
  const artboard = getArtboard();
  const bounds = selected.length === 1
    ? { left: 0, top: 0, right: artboard.width, bottom: artboard.height }
    : {
        left: Math.min(...selected.map((element) => element.x)),
        top: Math.min(...selected.map((element) => element.y)),
        right: Math.max(...selected.map((element) => element.x + element.width)),
        bottom: Math.max(...selected.map((element) => element.y + element.height))
      };
  const centerX = (bounds.left + bounds.right) / 2;
  const centerY = (bounds.top + bounds.bottom) / 2;

  for (const element of selected) {
    if (alignment === "left") element.x = bounds.left;
    if (alignment === "center") element.x = centerX - element.width / 2;
    if (alignment === "right") element.x = bounds.right - element.width;
    if (alignment === "top") element.y = bounds.top;
    if (alignment === "middle") element.y = centerY - element.height / 2;
    if (alignment === "bottom") element.y = bounds.bottom - element.height;
  }
  recordChange(before);
  renderAll();
};

const getSnapResult = (primary, proposedX, proposedY) => {
  const artboard = getArtboard();
  const threshold = SNAP_DISTANCE_PX / zoom;
  const xCandidates = [0, artboard.width / 2, artboard.width];
  const yCandidates = [0, artboard.height / 2, artboard.height];

  for (const element of getElements()) {
    if (selectedIds.has(element.id) || element.hidden) continue;
    xCandidates.push(element.x, element.x + element.width / 2, element.x + element.width);
    yCandidates.push(element.y, element.y + element.height / 2, element.y + element.height);
  }

  const ownX = [proposedX, proposedX + primary.width / 2, proposedX + primary.width];
  const ownY = [proposedY, proposedY + primary.height / 2, proposedY + primary.height];
  let bestX = { distance: Infinity, delta: 0, guide: null };
  let bestY = { distance: Infinity, delta: 0, guide: null };

  for (const own of ownX) {
    for (const candidate of xCandidates) {
      const delta = candidate - own;
      if (Math.abs(delta) < bestX.distance && Math.abs(delta) <= threshold) {
        bestX = { distance: Math.abs(delta), delta, guide: candidate };
      }
    }
  }
  for (const own of ownY) {
    for (const candidate of yCandidates) {
      const delta = candidate - own;
      if (Math.abs(delta) < bestY.distance && Math.abs(delta) <= threshold) {
        bestY = { distance: Math.abs(delta), delta, guide: candidate };
      }
    }
  }

  return {
    dx: bestX.delta,
    dy: bestY.delta,
    guideX: bestX.guide,
    guideY: bestY.guide
  };
};

const showGuides = (guideX, guideY) => {
  verticalGuide.style.display = guideX === null ? "none" : "block";
  horizontalGuide.style.display = guideY === null ? "none" : "block";
  if (guideX !== null) verticalGuide.style.left = `${guideX}px`;
  if (guideY !== null) horizontalGuide.style.top = `${guideY}px`;
};

const hideGuides = () => showGuides(null, null);

const startMove = (event, element) => {
  if (element.locked) return;
  const before = snapshot();
  if (event.altKey) {
    const sourceIds = selectedIds.has(element.id) ? [...selectedIds] : [element.id];
    const copies = [];
    for (const id of sourceIds) {
      const source = getElementById(id);
      if (!source || source.locked) continue;
      const copy = clone(source);
      copy.id = makeId(source.type);
      copy.name = `${source.name} 副本`;
      getElements().push(copy);
      copies.push(copy.id);
    }
    selectedIds = new Set(copies);
    primaryId = copies.at(-1) || null;
    element = getPrimaryElement();
    renderAll();
  }

  const startPoint = getArtboardPoint(event.clientX, event.clientY);
  interaction = {
    type: "move",
    before,
    startPoint,
    primaryId: primaryId || element.id,
    startElements: [...selectedIds]
      .map((id) => getElementById(id))
      .filter((item) => item && !item.locked)
      .map((item) => ({ id: item.id, x: item.x, y: item.y }))
  };
};

const startResize = (event, element, handle) => {
  if (element.locked) return;
  interaction = {
    type: "resize",
    before: snapshot(),
    startPoint: getArtboardPoint(event.clientX, event.clientY),
    handle,
    elementId: element.id,
    start: clone(element),
    preserveRatio: element.type === "image"
  };
};

const startRotate = (event, element) => {
  if (element.locked) return;
  const center = {
    x: element.x + element.width / 2,
    y: element.y + element.height / 2
  };
  const point = getArtboardPoint(event.clientX, event.clientY);
  interaction = {
    type: "rotate",
    before: snapshot(),
    elementId: element.id,
    center,
    startRotation: element.rotation,
    startAngle: Math.atan2(point.y - center.y, point.x - center.x)
  };
};

const updateMove = (event) => {
  const point = getArtboardPoint(event.clientX, event.clientY);
  let dx = point.x - interaction.startPoint.x;
  let dy = point.y - interaction.startPoint.y;
  const primaryStart = interaction.startElements.find((item) => item.id === interaction.primaryId)
    || interaction.startElements.at(-1);
  const primary = getElementById(primaryStart?.id);

  if (primary && !event.ctrlKey && !event.metaKey) {
    const snap = getSnapResult(primary, primaryStart.x + dx, primaryStart.y + dy);
    dx += snap.dx;
    dy += snap.dy;
    showGuides(snap.guideX, snap.guideY);
  } else {
    hideGuides();
  }

  for (const start of interaction.startElements) {
    const element = getElementById(start.id);
    if (!element) continue;
    element.x = round(start.x + dx);
    element.y = round(start.y + dy);
    updateElementNode(element);
  }
  renderProperties();
};

const updateResize = (event) => {
  const element = getElementById(interaction.elementId);
  if (!element) return;
  const point = getArtboardPoint(event.clientX, event.clientY);
  const dx = point.x - interaction.startPoint.x;
  const dy = point.y - interaction.startPoint.y;
  const west = interaction.handle.includes("w");
  const north = interaction.handle.includes("n");
  let width = interaction.start.width + (west ? -dx : dx);
  let height = interaction.start.height + (north ? -dy : dy);
  const preserve = interaction.preserveRatio || event.shiftKey;

  if (preserve) {
    const ratio = interaction.start.width / interaction.start.height;
    if (Math.abs(dx) >= Math.abs(dy * ratio)) {
      height = width / ratio;
    } else {
      width = height * ratio;
    }
  }

  width = Math.max(MIN_ELEMENT_SIZE, width);
  height = Math.max(MIN_ELEMENT_SIZE, height);
  element.width = round(width);
  element.height = round(height);
  element.x = round(west ? interaction.start.x + interaction.start.width - width : interaction.start.x);
  element.y = round(north ? interaction.start.y + interaction.start.height - height : interaction.start.y);
  updateElementNode(element);
  renderProperties();
};

const updateRotate = (event) => {
  const element = getElementById(interaction.elementId);
  if (!element) return;
  const point = getArtboardPoint(event.clientX, event.clientY);
  const currentAngle = Math.atan2(point.y - interaction.center.y, point.x - interaction.center.x);
  let rotation = interaction.startRotation + ((currentAngle - interaction.startAngle) * 180) / Math.PI;
  if (event.shiftKey) rotation = Math.round(rotation / 15) * 15;
  element.rotation = round(rotation);
  updateElementNode(element);
  renderProperties();
};

const updateMarquee = (event) => {
  const point = getArtboardPoint(event.clientX, event.clientY);
  const left = Math.min(interaction.startPoint.x, point.x);
  const top = Math.min(interaction.startPoint.y, point.y);
  const width = Math.abs(point.x - interaction.startPoint.x);
  const height = Math.abs(point.y - interaction.startPoint.y);
  interaction.rect = { left, top, right: left + width, bottom: top + height };
  marqueeElement.style.display = "block";
  marqueeElement.style.left = `${left}px`;
  marqueeElement.style.top = `${top}px`;
  marqueeElement.style.width = `${width}px`;
  marqueeElement.style.height = `${height}px`;
};

const updatePan = (event) => {
  stage.scrollLeft = interaction.scrollLeft - (event.clientX - interaction.clientX);
  stage.scrollTop = interaction.scrollTop - (event.clientY - interaction.clientY);
};

const finishInteraction = () => {
  if (!interaction) return;
  if (interaction.type === "marquee") {
    const next = interaction.additive ? new Set(interaction.previousSelection) : new Set();
    const rect = interaction.rect;
    if (rect) {
      for (const element of getElements()) {
        if (element.hidden) continue;
        const intersects = (
          element.x < rect.right &&
          element.x + element.width > rect.left &&
          element.y < rect.bottom &&
          element.y + element.height > rect.top
        );
        if (intersects) next.add(element.id);
      }
    }
    selectedIds = next;
    primaryId = [...selectedIds].at(-1) || null;
    marqueeElement.style.display = "none";
    renderAll();
  } else if (interaction.type !== "pan") {
    if (recordChange(interaction.before)) {
      renderLayers();
      renderProperties();
    }
  }
  hideGuides();
  interaction = null;
};

const setZoom = (nextZoom, keepCenter = true) => {
  const oldZoom = zoom;
  const centerX = stage.scrollLeft + stage.clientWidth / 2;
  const centerY = stage.scrollTop + stage.clientHeight / 2;
  zoom = clamp(nextZoom, .15, 2);
  renderArtboard();
  if (keepCenter && oldZoom > 0) {
    const ratio = zoom / oldZoom;
    stage.scrollLeft = centerX * ratio - stage.clientWidth / 2;
    stage.scrollTop = centerY * ratio - stage.clientHeight / 2;
  }
};

const fitZoom = () => {
  const artboard = getArtboard();
  const availableWidth = Math.max(180, stage.clientWidth - 144);
  setZoom(clamp(availableWidth / artboard.width, .15, 1), false);
  requestAnimationFrame(() => {
    stage.scrollLeft = Math.max(0, (stageSurface.scrollWidth - stage.clientWidth) / 2);
    stage.scrollTop = 0;
  });
};

const switchMode = (mode) => {
  if (!layout.artboards[mode] || mode === activeMode) return;
  activeMode = mode;
  selectedIds.clear();
  primaryId = null;
  renderAll();
  fitZoom();
};

const copyDesktopLayout = () => {
  if (activeMode !== "mobile") return;
  const before = snapshot();
  const source = layout.artboards.desktop;
  const target = layout.artboards.mobile;
  const scale = target.width / source.width;
  target.height = Math.max(1200, round(source.height * scale));
  target.background = source.background;
  target.elements = source.elements.map((element) => {
    const copy = clone(element);
    copy.id = makeId(copy.type);
    copy.x = round(copy.x * scale);
    copy.y = round(copy.y * scale);
    copy.width = round(copy.width * scale);
    copy.height = round(copy.height * scale);
    if (copy.type === "text") copy.fontSize = Math.max(12, round(copy.fontSize * scale));
    return copy;
  });
  selectedIds.clear();
  primaryId = null;
  recordChange(before);
  renderAll();
  fitZoom();
};

const readImageDimensions = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = reject;
    image.src = src;
  });

const uploadAsset = async (file) => {
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  const data = String(dataUrl).split(",")[1];
  const response = await fetch("/__work/asset", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: file.name, type: file.type, data })
  });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || "导入失败");
  const dimensions = await readImageDimensions(result.src);
  return {
    id: makeId("asset"),
    name: result.name,
    src: result.src,
    width: dimensions.width,
    height: dimensions.height
  };
};

const importAssets = async (files) => {
  const accepted = [...files].filter((file) => ["image/jpeg", "image/png", "image/webp"].includes(file.type));
  if (!accepted.length) return;
  setStatus(`正在导入 ${accepted.length} 张图片…`);
  const before = snapshot();
  try {
    for (const file of accepted) {
      layout.assets.push(await uploadAsset(file));
    }
    recordChange(before);
    renderAssets();
    setStatus(`已导入 ${accepted.length} 张图片`);
  } catch (error) {
    setStatus(error instanceof Error ? error.message : "导入失败");
  } finally {
    assetInput.value = "";
  }
};

const applyPropertyChange = (input) => {
  const element = getPrimaryElement();
  if (!element || selectedIds.size !== 1) return;
  const property = input.dataset.property;
  let value = Number(input.value);
  if (!Number.isFinite(value)) return;
  const before = snapshot();
  if (property === "opacity") value = clamp(value / 100, 0, 1);
  if (property === "width" || property === "height") value = Math.max(MIN_ELEMENT_SIZE, value);
  element[property] = value;
  recordChange(before);
  renderAll();
};

const applyStyleChange = (input) => {
  const element = getPrimaryElement();
  if (!element || selectedIds.size !== 1) return;
  const property = input.dataset.styleProperty;
  const before = snapshot();
  if (property === "fontSize") {
    const value = Number(input.value);
    if (!Number.isFinite(value)) return;
    element.fontSize = clamp(value, 8, 400);
  } else {
    element[property] = input.value;
  }
  recordChange(before);
  renderAll();
};

const updateTextLive = (input) => {
  const element = getPrimaryElement();
  if (!element || element.type !== "text" || selectedIds.size !== 1) return;
  element.text = input.value;
  const content = artboardElement.querySelector(
    `.canvas-element[data-id="${CSS.escape(element.id)}"] .canvas-element__content`
  );
  if (content) content.textContent = element.text;
  setStatus("有未保存更改");
};

const renderPreview = () => {
  const artboard = getArtboard();
  const availableWidth = Math.min(window.innerWidth, artboard.width);
  const scale = availableWidth / artboard.width;
  previewCanvas.replaceChildren();
  previewCanvas.style.width = `${availableWidth}px`;
  previewCanvas.style.height = `${artboard.height * scale}px`;
  previewCanvas.style.backgroundColor = artboard.background;

  const canvas = document.createElement("div");
  canvas.style.position = "absolute";
  canvas.style.inset = "0 auto auto 0";
  canvas.style.width = `${artboard.width}px`;
  canvas.style.height = `${artboard.height}px`;
  canvas.style.transform = `scale(${scale})`;
  canvas.style.transformOrigin = "top left";
  for (const element of artboard.elements) {
    if (!element.hidden) canvas.appendChild(createElementNode(element, false));
  }
  previewCanvas.appendChild(canvas);
};

const openPreview = () => {
  renderPreview();
  previewOverlay.classList.add("is-open");
  previewOverlay.setAttribute("aria-hidden", "false");
};

const closePreview = () => {
  previewOverlay.classList.remove("is-open");
  previewOverlay.setAttribute("aria-hidden", "true");
};

artboardElement.addEventListener("pointerdown", (event) => {
  if (event.button !== 0) return;
  const rotateHandle = event.target.closest("[data-rotate-handle]");
  const resizeHandle = event.target.closest("[data-handle]");
  const node = event.target.closest(".canvas-element");

  if (node) {
    event.preventDefault();
    const element = getElementById(node.dataset.id);
    if (!element) return;
    if (!selectedIds.has(element.id)) {
      if (event.shiftKey) {
        selectedIds.add(element.id);
      } else {
        selectedIds = new Set([element.id]);
      }
      primaryId = element.id;
      renderAll();
    } else {
      primaryId = element.id;
      renderAll();
    }
    if (rotateHandle) startRotate(event, element);
    else if (resizeHandle) startResize(event, element, resizeHandle.dataset.handle);
    else startMove(event, element);
    return;
  }

  event.preventDefault();
  interaction = {
    type: "marquee",
    startPoint: getArtboardPoint(event.clientX, event.clientY),
    rect: null,
    additive: event.shiftKey,
    previousSelection: new Set(selectedIds)
  };
});

stage.addEventListener("pointerdown", (event) => {
  if (event.button !== 1 && !(event.button === 0 && spacePressed)) return;
  event.preventDefault();
  interaction = {
    type: "pan",
    clientX: event.clientX,
    clientY: event.clientY,
    scrollLeft: stage.scrollLeft,
    scrollTop: stage.scrollTop
  };
});

window.addEventListener("pointermove", (event) => {
  if (!interaction) return;
  if (interaction.type === "move") updateMove(event);
  if (interaction.type === "resize") updateResize(event);
  if (interaction.type === "rotate") updateRotate(event);
  if (interaction.type === "marquee") updateMarquee(event);
  if (interaction.type === "pan") updatePan(event);
});

window.addEventListener("pointerup", finishInteraction);
window.addEventListener("pointercancel", finishInteraction);

artboardElement.addEventListener("dragover", (event) => {
  if (event.dataTransfer.types.includes("application/x-work-asset")) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }
});

artboardElement.addEventListener("drop", (event) => {
  const assetId = event.dataTransfer.getData("application/x-work-asset");
  if (!assetId) return;
  event.preventDefault();
  const asset = layout.assets.find((item) => item.id === assetId);
  if (asset) addImageElement(asset, getArtboardPoint(event.clientX, event.clientY));
});

assetInput.addEventListener("change", () => importAssets(assetInput.files));

propertyGrid.addEventListener("change", (event) => {
  const input = event.target.closest("[data-property]");
  if (input) applyPropertyChange(input);
});

styleProperties.addEventListener("change", (event) => {
  const input = event.target.closest("[data-style-property]");
  if (!input) return;
  if (input.dataset.styleProperty === "text") {
    if (recordChange(textEditBefore)) renderAll();
    textEditBefore = null;
    return;
  }
  applyStyleChange(input);
});

styleProperties.addEventListener("focusin", (event) => {
  const input = event.target.closest('[data-style-property="text"]');
  if (input && textEditBefore === null) textEditBefore = snapshot();
});

styleProperties.addEventListener("input", (event) => {
  const input = event.target.closest('[data-style-property="text"]');
  if (input) updateTextLive(input);
});

styleProperties.addEventListener("focusout", (event) => {
  const input = event.target.closest('[data-style-property="text"]');
  if (!input || textEditBefore === null) return;
  if (recordChange(textEditBefore)) renderAll();
  textEditBefore = null;
});

artboardHeightInput.addEventListener("change", () => {
  const value = Number(artboardHeightInput.value);
  if (!Number.isFinite(value)) return;
  const before = snapshot();
  getArtboard().height = clamp(value, 480, 12000);
  recordChange(before);
  renderAll();
});

artboardBackgroundInput.addEventListener("change", () => {
  const before = snapshot();
  getArtboard().background = artboardBackgroundInput.value;
  recordChange(before);
  renderAll();
});

document.querySelectorAll("[data-align]").forEach((button) => {
  button.addEventListener("click", () => alignSelection(button.dataset.align));
});

document.querySelectorAll("[data-mode]").forEach((button) => {
  button.addEventListener("click", () => switchMode(button.dataset.mode));
});

document.addEventListener("click", (event) => {
  const command = event.target.closest("[data-command]")?.dataset.command;
  if (!command) return;
  if (command === "undo") undo();
  if (command === "redo") redo();
  if (command === "zoom-in") setZoom(zoom + .1);
  if (command === "zoom-out") setZoom(zoom - .1);
  if (command === "zoom-fit") fitZoom();
  if (command === "preview") openPreview();
  if (command === "close-preview") closePreview();
  if (command === "save") saveLayout();
  if (command === "add-text") addTextElement();
  if (command === "add-rectangle") addRectangleElement();
  if (command === "copy-desktop") copyDesktopLayout();
});

stage.addEventListener("wheel", (event) => {
  if (!event.ctrlKey && !event.metaKey) return;
  event.preventDefault();
  setZoom(zoom + (event.deltaY < 0 ? .08 : -.08));
}, { passive: false });

window.addEventListener("keydown", (event) => {
  const editingText = event.target.matches("input, textarea, [contenteditable]");
  if (event.code === "Space" && !editingText) {
    spacePressed = true;
    stage.style.cursor = "grab";
    event.preventDefault();
  }
  if (editingText) return;

  const commandKey = event.ctrlKey || event.metaKey;
  if (commandKey && event.key.toLowerCase() === "s") {
    event.preventDefault();
    saveLayout();
  } else if (commandKey && event.key.toLowerCase() === "z" && event.shiftKey) {
    event.preventDefault();
    redo();
  } else if (commandKey && event.key.toLowerCase() === "z") {
    event.preventDefault();
    undo();
  } else if (commandKey && event.key.toLowerCase() === "y") {
    event.preventDefault();
    redo();
  } else if (commandKey && event.key.toLowerCase() === "d") {
    event.preventDefault();
    duplicateSelection();
  } else if (event.key === "Delete" || event.key === "Backspace") {
    event.preventDefault();
    deleteSelection();
  } else if (event.key === "Escape") {
    if (previewOverlay.classList.contains("is-open")) closePreview();
    else clearSelection();
  } else if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key) && selectedIds.size) {
    event.preventDefault();
    const before = snapshot();
    const amount = event.shiftKey ? 10 : 1;
    for (const element of getElements()) {
      if (!selectedIds.has(element.id) || element.locked) continue;
      if (event.key === "ArrowLeft") element.x -= amount;
      if (event.key === "ArrowRight") element.x += amount;
      if (event.key === "ArrowUp") element.y -= amount;
      if (event.key === "ArrowDown") element.y += amount;
    }
    if (recordChange(before)) renderAll();
  }
});

window.addEventListener("keyup", (event) => {
  if (event.code === "Space") {
    spacePressed = false;
    stage.style.cursor = "";
  }
});

window.addEventListener("resize", () => {
  if (previewOverlay.classList.contains("is-open")) {
    cancelAnimationFrame(previewResizeFrame);
    previewResizeFrame = requestAnimationFrame(renderPreview);
  }
});

await loadLayout();
renderAll();
fitZoom();
