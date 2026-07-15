let photos = [];
let overviewPhotos = [];
let overviewOrder = [];
let overviewImageObserver = null;
const DEFAULT_PHOTO_NOTE_CN = "\u8fd9\u5730\u65b9\u672c\u6765\u662f\u7ed9\u6bcf\u4e2a\u7167\u7247\u5199\u70b9\u968f\u8bb0\u7684\uff0c\u4f46\u662f\u53c9\u6ef4\u53c9\u6709\u70b9\u61d2\u6ca1\u5199\u51e0\u4e2a";
const DEFAULT_PHOTO_NOTE_EN = "This space was meant for small notes for each photo, but XDX got lazy and only wrote a few.";
const DEFAULT_PHOTO_NOTE = DEFAULT_PHOTO_NOTE_CN;
const overviewSkipCells = new Set([2, 7]);
const OVERVIEW_RETURN_STORAGE_KEY = "l4rxx-overview-return";
const LANGUAGE_SESSION_STORAGE_KEY = "l4rxx-language";
const PHOTO_MANIFEST_VERSION = "20260714-4";

const languageCopy = {
  en: {
    "nav.overview": "OVERVIEW",
    "nav.work": "WORK",
    "nav.logs": "LOGS",
    "logs.kicker": "Release history",
    "logs.title": "LOGS",
    "logs.intro": "Visible site changes, organized by date and category.",
    "home.about": "l4rxx is a visual maker collecting still moments, weathered surfaces, portraits, screens, and quiet fragments.",
    "work.menuAbout": "l4rxx works with available light, found color, and scenes that feel almost still.",
    "work.photographs": "PHOTOGRAPHS",
    "work.grid": "GRID",
    "work.list": "LIST",
    contact: "CONTACT ME",
    "contact.copied": "EMAIL COPIED",
    "contact.copyStatus": "Email address copied to clipboard.",
    "contact.copyFailed": "Clipboard access is blocked. The email address is selected for manual copy.",
    "social.douyin": "TIKTOK",
    "social.instagram": "INS",
    "focus.back": "BACK",
    "focus.index": "INDEX",
    "focus.menuAbout": "I tried to stop obsessing over settings and return to the record itself.",
    rights: "\u00a9 2026 - all rights reserved"
  },
  cn: {
    "nav.overview": "\u603b\u89c8",
    "nav.work": "\u4f5c\u54c1",
    "nav.logs": "\u65e5\u5fd7",
    "logs.kicker": "\u6b63\u5f0f\u66f4\u65b0\u8bb0\u5f55",
    "logs.title": "\u65e5\u5fd7",
    "logs.intro": "\u53ef\u89c1\u7684\u7f51\u7ad9\u66f4\u65b0\uff0c\u6309\u65e5\u671f\u4e0e\u7c7b\u522b\u6574\u7406\u3002",
    "home.about": "l4rxx \u662f\u4e00\u4f4d\u89c6\u89c9\u521b\u4f5c\u8005\uff0c\u6536\u96c6\u9759\u6b62\u77ac\u95f4\u3001\u98ce\u5316\u8868\u9762\u3001\u8096\u50cf\u3001\u5c4f\u5e55\u4e0e\u5b89\u9759\u788e\u7247\u3002",
    "work.menuAbout": "l4rxx \u7528\u81ea\u7136\u5149\u3001\u88ab\u770b\u89c1\u7684\u989c\u8272\uff0c\u548c\u90a3\u4e9b\u5dee\u4e00\u70b9\u5c31\u9759\u6b62\u7684\u573a\u666f\u5de5\u4f5c\u3002",
    "work.photographs": "\u5f20\u7167\u7247",
    "work.grid": "\u7f51\u683c",
    "work.list": "\u5217\u8868",
    contact: "\u8054\u7cfb\u6211",
    "contact.copied": "\u90ae\u7bb1\u5df2\u590d\u5236",
    "contact.copyStatus": "\u90ae\u7bb1\u5730\u5740\u5df2\u590d\u5236\u5230\u526a\u8d34\u677f\u3002",
    "contact.copyFailed": "\u6d4f\u89c8\u5668\u5df2\u963b\u6b62\u526a\u8d34\u677f\u6743\u9650\uff0c\u90ae\u7bb1\u5df2\u9009\u4e2d\uff0c\u53ef\u624b\u52a8\u590d\u5236\u3002",
    "social.douyin": "\u6296\u97f3",
    "social.instagram": "INS",
    "focus.back": "\u8fd4\u56de",
    "focus.index": "\u7d22\u5f15",
    "focus.menuAbout": "\u6211\u8bd5\u7740\u4e0d\u518d\u7ea0\u7ed3\u53c2\u6570\uff0c\u56de\u5f52\u8bb0\u5f55\u672c\u8eab",
    rights: "\u00a9 2026 - \u4fdd\u7559\u6240\u6709\u6743\u5229"
  }
};

const releaseLogCategories = [
  { key: "optimizations", cn: "优化", en: "Optimizations" },
  { key: "fixes", cn: "修复", en: "Fixes" },
  { key: "removals", cn: "删除", en: "Removals" },
  { key: "additions", cn: "增加", en: "Additions" }
];

const releaseLogEntries = [
  {
    versions: ["v1.4.1", "v1.4.0", "v1.3.0"],
    date: "2026-07-14",
    categories: {
      optimizations: {
        cn: [
          "移动端大图连续滑动与缩略图同步更跟手，快速反向也能从当前画面继续。",
          "索引图库开合、纵向滚动与图片加载更稳定，移动端动画更柔和；随记背景会根据当前照片取色。",
          "首页非方形照片会按画幅适度放大以减少留白，1:1 照片保持原尺寸。",
          "新会话默认使用英语，手动切换的语言会在当前会话内跨页面保持。"
        ],
        en: [
          "Mobile photo swiping and thumbnail tracking now respond continuously, including rapid reversals.",
          "INDEX opening, vertical scrolling, and loading are more stable, with softer mobile motion; notes backgrounds now follow the active photo.",
          "Non-square home photos now scale with their aspect ratio to reduce excess whitespace, while 1:1 photos keep their original size.",
          "New sessions now start in English, while manual language changes persist across pages within the current session."
        ]
      },
      fixes: {
        cn: [
          "修复索引图库偶发缺图、纵向滑动时画面横移和快速开合错位。",
          "修复退出随记后立即切图时大图消失，以及慢网下旧请求覆盖当前图片。",
          "修复随记切图未完整滑出、滑入屏幕的问题。"
        ],
        en: [
          "Fixed occasional missing INDEX images, horizontal drift during vertical scrolling, and misalignment after rapid toggles.",
          "Fixed photos disappearing after notes exit and stale slow-network requests overriding the current selection.",
          "Fixed notes photos not completing their off-screen exit and entry during swipes."
        ]
      },
      removals: {
        cn: ["移除桌面端大图滑动与首页倾斜透视。"],
        en: ["Removed desktop main-photo swiping and home-page tilt perspective."]
      },
      additions: {
        cn: [
          "新增索引图库、照片取色随记背景和第 44 张照片，并为 14 张照片补充双语地点与随记。",
          "新增第 45 张照片 WATER 46 及其双语随记。"
        ],
        en: [
          "Added the INDEX gallery, photo-derived notes backgrounds, and the 44th photo, plus bilingual locations and notes for 14 photos.",
          "Added the 45th photo, WATER 46, with its bilingual note."
        ]
      }
    }
  },
  {
    versions: ["v1.2.1", "v1.2.0"],
    date: "2026-07-12",
    categories: {
      optimizations: {
        cn: [
          "增强手机倾斜对首页文字重力的双轴控制，并统一全站主题切换节奏。",
          "优化移动端连续滑动与 rel 返回首页的照片落位。"
        ],
        en: [
          "Improved two-axis mobile letter gravity and unified theme-transition timing across the site.",
          "Improved continuous mobile swiping and the rel-to-home photo landing."
        ]
      },
      fixes: {
        cn: [
          "修复快速滑动丢手势、边界闪烁、首页开场跳图和返回二段跳。",
          "修复菜单文字、图标与头像主题切换不同步。"
        ],
        en: [
          "Fixed dropped rapid gestures, edge flashes, home intro jumps, and two-stage return motion.",
          "Fixed theme timing differences between menu text, icons, and the avatar."
        ]
      },
      removals: {
        cn: ["移除顶部图标各自的模糊底板，改用共享渐隐背景。"],
        en: ["Replaced separate blurred plates behind the top icons with one shared fading background."]
      },
      additions: {
        cn: ["新增 L4RXX 合体彩蛋和最多三步的连续滑动记忆。"],
        en: ["Added the L4RXX reunion easter egg and a bounded three-step swipe memory."]
      }
    }
  },
  {
    versions: ["v1.1.3"],
    date: "2026-07-10",
    categories: {
      optimizations: {
        cn: ["优化移动端大图滑动、随记图文布局、语言主题过渡与设备方向文字重力。"],
        en: ["Improved mobile photo swiping, notes layout, language and theme transitions, and device-driven letter gravity."]
      },
      fixes: {
        cn: ["修复首尾绕回、取消手势闪烁、缩略图失效、系统主题不同步和随记重复切换错位。"],
        en: ["Fixed edge wrapping, cancelled-swipe flashes, thumbnail failures, theme desynchronization, and notes layout shifts."]
      },
      removals: {
        cn: ["移除移动端下滑沉浸大图手势，保留随记下滑退出。"],
        en: ["Removed the downward immersive-photo gesture while keeping swipe-down notes exit."]
      },
      additions: {
        cn: ["新增移动端随记上滑进入、下滑退出和菜单日志入口。"],
        en: ["Added mobile swipe-up notes entry, swipe-down exit, and the menu log entry."]
      }
    }
  },
  {
    versions: ["v1.1.2", "v1.1.1", "v1.1.0"],
    date: "2026-07-09",
    categories: {
      optimizations: {
        cn: [
          "优化首页图片顺序、返回位置、L4RXX 重力范围和随记图文比例。",
          "统一日志、语言与主题切换的过渡。"
        ],
        en: [
          "Improved home photo order, return position, L4RXX gravity range, and notes proportions.",
          "Unified log, language, and theme transitions."
        ]
      },
      fixes: {
        cn: ["修复首页刷新与返回状态、错误 rel 编号、随记重复切换和日志主题闪烁。"],
        en: ["Fixed home refresh and return state, incorrect rel ids, repeated notes switching, and log theme flicker."]
      },
      removals: {
        cn: ["移除旧 INFO 按钮和面向访客的技术日志预览。"],
        en: ["Removed the old INFO button and visitor-facing technical log previews."]
      },
      additions: {
        cn: ["新增随记模式、暗色主题、语言切换、菜单日志和首页彩蛋。"],
        en: ["Added notes mode, dark theme, language switching, menu logs, and a home-page easter egg."]
      }
    }
  },
  {
    versions: ["v1.0.1", "v1.0.0"],
    date: "2026-07-07",
    categories: {
      optimizations: {
        cn: ["建立首页、作品页和 rel 页的浏览结构，并生成适合网页加载的图片与缩略图。"],
        en: ["Established the home, work, and rel browsing structure with web-ready images and thumbnails."]
      },
      fixes: {
        cn: ["修复新增照片与图库数据不同步。"],
        en: ["Fixed synchronization between new photos and gallery data."]
      },
      removals: {
        cn: ["移除一张不再展示的照片。"],
        en: ["Removed one photo that was no longer displayed."]
      },
      additions: {
        cn: ["上线摄影作品集，并将公开图库扩展到 43 张照片。"],
        en: ["Launched the photography portfolio and expanded the public gallery to 43 photos."]
      }
    }
  }
];

prepareOverviewScrollRestoration();

function prepareOverviewScrollRestoration() {
  if (document.body?.dataset.page !== "home") return;
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  if (isOverviewReturnNavigation()) return;
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  window.addEventListener("pageshow", () => {
    if (!isOverviewReturnNavigation()) window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, { once: true });
}

function isOverviewReturnNavigation() {
  if (document.body?.dataset.page !== "home") return false;
  return new URLSearchParams(window.location.search).get("from") === "rel";
}

const languageLabels = {
  en: { cn: "\u4e2d\u6587", en: "\u82f1\u8bed" },
  cn: { cn: "CN", en: "EN" }
};

document.addEventListener("DOMContentLoaded", async () => {
  initChrome();
  initLanguageSwitch();
  initEmailCopy();
  initThemeSwitch();
  initReleaseLogs();
  initNavLogsMode();
  const page = document.body.dataset.page;
  if (page === "logs") {
    startLoadingSequence();
    return;
  }
  try {
    photos = await loadPhotos();
    if (page === "home") renderOverview();
    if (page === "work") renderWork();
    if (page === "focus") renderFocus();
    startLoadingSequence();
  } catch (error) {
    showGalleryLoadError(error);
  }
});

async function loadPhotos() {
  const hostname = window.location.hostname;
  const isLocalPreview = hostname === "localhost"
    || hostname === "::1"
    || /^127\./.test(hostname)
    || /^10\./.test(hostname)
    || /^192\.168\./.test(hostname)
    || /^172\.(1[6-9]|2\d|3[01])\./.test(hostname);
  const manifestUrl = isLocalPreview
    ? "content/photos.json"
    : `content/photos.json?v=${PHOTO_MANIFEST_VERSION}`;
  const response = await fetch(manifestUrl, { cache: isLocalPreview ? "no-cache" : "default" });
  if (!response.ok) throw new Error(`Could not load content/photos.json (${response.status})`);
  const data = await response.json();
  const records = Array.isArray(data) ? data : data.items;
  if (!Array.isArray(records) || records.length === 0) throw new Error("content/photos.json has no photos");
  return records.map(normalizePhoto);
}

function normalizePhoto(photo, index) {
  const id = Number(photo.id) || index + 1;
  const title = photo.title || `IMAGE ${String(id).padStart(2, "0")}`;
  const full = photo.full || photo.src || photo.thumb;
  const thumb = photo.thumb || full;
  return {
    id,
    title,
    category: photo.category || "IMAGE",
    caption: photo.caption || "A frame from the local archive.",
    note: photo.note || photo.notes || DEFAULT_PHOTO_NOTE_CN,
    noteCn: photo.noteCn || photo.note_cn || photo.note || photo.notes || DEFAULT_PHOTO_NOTE_CN,
    noteEn: photo.noteEn || photo.note_en || photo.noteEnglish || (isDefaultPhotoNote(photo.note || photo.notes) ? DEFAULT_PHOTO_NOTE_EN : photo.note || photo.notes || DEFAULT_PHOTO_NOTE_EN),
    locationCn: String(photo.locationCn || photo.location_cn || photo.location || "").trim(),
    locationEn: String(photo.locationEn || photo.location_en || photo.locationEnglish || photo.location || "").trim(),
    alt: photo.alt || `l4rxx photo ${String(id).padStart(2, "0")} - ${title}`,
    original: photo.original || full,
    full,
    thumb,
    width: Math.max(0, Number(photo.width) || 0),
    height: Math.max(0, Number(photo.height) || 0),
    thumbWidth: Math.max(0, Number(photo.thumbWidth) || Number(photo.width) || 0),
    thumbHeight: Math.max(0, Number(photo.thumbHeight) || Number(photo.height) || 0),
    date: photo.date || ""
  };
}

function getPhotoImageSizeAttributes(photo, useThumb = false) {
  const width = useThumb ? photo?.thumbWidth : photo?.width;
  const height = useThumb ? photo?.thumbHeight : photo?.height;
  return width > 0 && height > 0 ? ` width="${width}" height="${height}"` : "";
}

function hydrateDeferredImage(image) {
  const src = image?.dataset?.src;
  const srcset = image?.dataset?.srcset;
  if (!src && !srcset) return;
  if (srcset) {
    image.removeAttribute("data-srcset");
    image.srcset = srcset;
  }
  if (src) {
    image.removeAttribute("data-src");
    image.src = src;
  }
}

function createDeferredImageObserver(rootMargin = "600px") {
  if (!("IntersectionObserver" in window)) return null;
  return new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      hydrateDeferredImage(entry.target);
      observer.unobserve(entry.target);
    });
  }, { root: null, rootMargin, threshold: 0.01 });
}

function observeDeferredImages(root, observer) {
  const images = [...root.querySelectorAll("img[data-src]")];
  if (!observer) {
    images.forEach(hydrateDeferredImage);
    return;
  }
  images.forEach((image) => observer.observe(image));
}

function isDefaultPhotoNote(note) {
  return !note || note === DEFAULT_PHOTO_NOTE_CN || note.includes("\u53c9\u6ef4\u53c9");
}

function getCurrentLanguage() {
  return document.body?.dataset.language === "cn" ? "cn" : "en";
}

function getPhotoNote(photo) {
  if (!photo) return getCurrentLanguage() === "cn" ? DEFAULT_PHOTO_NOTE_CN : DEFAULT_PHOTO_NOTE_EN;
  return getCurrentLanguage() === "cn"
    ? photo.noteCn || photo.note || DEFAULT_PHOTO_NOTE_CN
    : photo.noteEn || DEFAULT_PHOTO_NOTE_EN;
}

function getPhotoLocation(photo) {
  if (!photo) return "";
  return getCurrentLanguage() === "cn"
    ? photo.locationCn || photo.locationEn || ""
    : photo.locationEn || photo.locationCn || "";
}

function showGalleryLoadError(error) {
  document.body.classList.add("has-loaded", "has-finished");
  const target = document.querySelector("main") || document.body;
  const message = document.createElement("p");
  message.className = "site-error";
  message.textContent = "Gallery data could not be loaded. Preview this site through the local server.";
  target.appendChild(message);
  console.error(error);
}

function initChrome() {
  const toggle = document.querySelector(".js-nav-toggle");
  const screen = document.querySelector(".js-nav-screen");
  if (!toggle || !screen) return;
  toggle.addEventListener("click", () => {
    if (document.body.classList.contains("is-nav-logs")) {
      document.body.classList.remove("nav-open", "is-nav-logs");
      setNavLogsOpen(false);
      screen.setAttribute("aria-hidden", "true");
      toggle.setAttribute("aria-label", "Open navigation");
      return;
    }
    const open = document.body.classList.toggle("nav-open");
    if (!open) setNavLogsOpen(false);
    toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    screen.setAttribute("aria-hidden", String(!open));
  });
  screen.addEventListener("click", (event) => {
    if (event.target === screen) {
      document.body.classList.remove("nav-open", "is-nav-logs");
      setNavLogsOpen(false);
      screen.setAttribute("aria-hidden", "true");
      toggle.setAttribute("aria-label", "Open navigation");
    }
  });
}

async function copyText(value) {
  let clipboardWrite = null;
  if (navigator.clipboard && window.isSecureContext) {
    try {
      clipboardWrite = navigator.clipboard.writeText(value).then(() => true, () => false);
    } catch (error) {
      clipboardWrite = null;
    }
  }

  const activeElement = document.activeElement;
  const field = document.createElement("textarea");
  field.value = value;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.left = "0";
  field.style.top = "0";
  field.style.width = "1px";
  field.style.height = "1px";
  field.style.padding = "0";
  field.style.border = "0";
  field.style.opacity = ".01";
  field.style.pointerEvents = "none";
  document.body.appendChild(field);
  field.focus({ preventScroll: true });
  field.select();
  field.setSelectionRange(0, value.length);
  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch (error) {
    copied = false;
  }
  field.remove();
  if (activeElement instanceof HTMLElement) activeElement.focus({ preventScroll: true });
  if (copied) return true;
  return clipboardWrite ? clipboardWrite : false;
}

function selectEmailFallback(label) {
  const selection = window.getSelection();
  if (!selection) return;
  const range = document.createRange();
  range.selectNodeContents(label);
  selection.removeAllRanges();
  selection.addRange(range);
}

function initEmailCopy() {
  document.querySelectorAll("[data-copy-email]").forEach((button) => {
    const label = button.querySelector("[data-copy-email-label]");
    const status = button.querySelector("[data-copy-email-status]");
    let resetTimer = 0;

    button.addEventListener("click", async () => {
      const email = String(button.dataset.copyEmail || "").trim();
      if (!email || !label) return;
      const language = getCurrentLanguage();
      const copied = await copyText(email);
      window.clearTimeout(resetTimer);
      label.textContent = copied ? languageCopy[language]["contact.copied"] : email;
      if (status) status.textContent = copied ? languageCopy[language]["contact.copyStatus"] : languageCopy[language]["contact.copyFailed"];
      button.classList.toggle("is-copied", copied);
      button.classList.toggle("is-copy-failed", !copied);
      if (!copied) selectEmailFallback(label);
      resetTimer = window.setTimeout(() => {
        const currentLanguage = getCurrentLanguage();
        label.textContent = languageCopy[currentLanguage].contact;
        if (status) status.textContent = "";
        button.classList.remove("is-copied", "is-copy-failed");
      }, copied ? 1600 : 6000);
    });
  });
}

function escapeReleaseLogHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderReleaseLogSurface(target, language = getCurrentLanguage()) {
  if (!target) return;
  const next = language === "cn" ? "cn" : "en";
  target.innerHTML = releaseLogEntries.map((entry) => {
    const categories = releaseLogCategories.map((category) => {
      const localizedItems = entry.categories?.[category.key]?.[next] || [];
      if (!localizedItems.length) return "";
      const items = localizedItems
        .map((item) => `<li>${escapeReleaseLogHtml(item)}</li>`)
        .join("");
      return `
        <section class="release-category">
          <h3 class="release-category__title">${escapeReleaseLogHtml(category[next])}</h3>
          <ul class="release-category__items">${items}</ul>
        </section>
      `;
    }).join("");
    return `
      <article class="release-entry">
        <header class="release-entry__heading">
          <h2 class="release-entry__date"><time datetime="${escapeReleaseLogHtml(entry.date)}">${escapeReleaseLogHtml(entry.date)}</time></h2>
        </header>
        <div class="release-entry__categories">${categories}</div>
      </article>
    `;
  }).join("");
}

function renderReleaseLogSurfaces(language = getCurrentLanguage()) {
  document.querySelectorAll("[data-release-entries], [data-nav-release-entries]").forEach((target) => {
    renderReleaseLogSurface(target, language);
  });
}

function initReleaseLogs() {
  renderReleaseLogSurfaces();
  window.addEventListener("l4rxx:languagechange", (event) => {
    const language = event.detail?.language || getCurrentLanguage();
    const page = document.querySelector("[data-release-log]");
    if (page && document.body.classList.contains("has-loaded") && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.clearTimeout(initReleaseLogs.transitionTimer);
      page.classList.add("is-logs-copy-swapping");
      initReleaseLogs.transitionTimer = window.setTimeout(() => {
        renderReleaseLogSurfaces(language);
        requestAnimationFrame(() => page.classList.remove("is-logs-copy-swapping"));
      }, 160);
      return;
    }
    renderReleaseLogSurfaces(language);
  });
}

function setNavLogsOpen(open) {
  document.body.classList.toggle("is-nav-logs", open);
  document.querySelectorAll(".js-nav-logs-toggle").forEach((button) => {
    button.setAttribute("aria-pressed", String(open));
  });
  if (open) renderReleaseLogSurfaces();
}

function initNavLogsMode() {
  const screen = document.querySelector(".js-nav-screen");
  const navToggle = document.querySelector(".js-nav-toggle");
  const buttons = [...document.querySelectorAll(".js-nav-logs-toggle")];
  if (!screen || !buttons.length) return;

  const setMenuOpen = () => {
    document.body.classList.add("nav-open");
    screen.setAttribute("aria-hidden", "false");
    if (navToggle) navToggle.setAttribute("aria-label", "Close navigation");
  };

  buttons.forEach((button) => {
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => {
      const logsOpen = document.body.classList.contains("is-nav-logs");
      setMenuOpen();
      setNavLogsOpen(!logsOpen);
    });
  });
}

function initLanguageSwitch() {
  const switcher = document.querySelector("[data-language-switch]");
  const translatable = [...document.querySelectorAll("[data-i18n]")];
  if (!switcher && !translatable.length) return;

  const buttons = switcher ? [...switcher.querySelectorAll("[data-lang-option]")] : [];
  const toggle = switcher?.matches("[data-language-toggle]") ? switcher : switcher?.querySelector("[data-language-toggle]");
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  let currentLanguage = "en";
  let saved = "en";
  let hasAppliedLanguage = false;
  let languageApplyTimer = 0;
  let languageTransitionTimer = 0;
  let languageTransitionRunId = 0;
  try {
    saved = sessionStorage.getItem(LANGUAGE_SESSION_STORAGE_KEY) || "en";
  } catch (error) {
    saved = "en";
  }

  const clearLanguageTransition = () => {
    document.documentElement.classList.remove("is-language-transitioning");
    document.body.classList.remove("is-language-transitioning");
  };

  const startLanguageTransition = () => {
    if (reduceMotion?.matches || !hasAppliedLanguage || !document.body.classList.contains("has-loaded")) return false;
    window.clearTimeout(languageTransitionTimer);
    document.documentElement.classList.add("is-language-transitioning");
    document.body.classList.add("is-language-transitioning");
    document.body.offsetHeight;
    return true;
  };

  const applyLanguage = (next) => {
    document.documentElement.lang = next === "cn" ? "zh-CN" : "en";
    document.body.dataset.language = next;
    document.body.dataset.lang = next;

    translatable.forEach((node) => {
      const key = node.dataset.i18n;
      if (key && languageCopy[next][key]) node.textContent = languageCopy[next][key];
    });

    buttons.forEach((button) => {
      const option = button.dataset.langOption;
      if (option && languageLabels[next][option]) button.textContent = languageLabels[next][option];
      const active = option === next;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });

    if (toggle) {
      toggle.setAttribute("aria-pressed", String(next === "cn"));
      toggle.setAttribute("aria-label", next === "cn" ? "Switch language to English" : "Switch language to Chinese");
    }

    window.dispatchEvent(new CustomEvent("l4rxx:languagechange", { detail: { language: next } }));

    try {
      sessionStorage.setItem(LANGUAGE_SESSION_STORAGE_KEY, next);
    } catch (error) {
      return;
    }
  };

  const setLanguage = (language) => {
    const next = language === "cn" ? "cn" : "en";
    currentLanguage = next;
    const runId = ++languageTransitionRunId;
    const shouldAnimate = startLanguageTransition();
    window.clearTimeout(languageApplyTimer);
    const finish = () => {
      if (runId !== languageTransitionRunId) return;
      applyLanguage(next);
      hasAppliedLanguage = true;
      if (shouldAnimate) languageTransitionTimer = window.setTimeout(clearLanguageTransition, 280);
      else clearLanguageTransition();
    };
    if (shouldAnimate) languageApplyTimer = window.setTimeout(finish, 90);
    else finish();
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.dataset.langOption));
  });
  if (toggle) {
    toggle.addEventListener("click", () => setLanguage(currentLanguage === "cn" ? "en" : "cn"));
  }
  setLanguage(saved);
}

function initThemeSwitch() {
  const toggle = document.querySelector("[data-theme-toggle]");
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  const systemTheme = window.matchMedia?.("(prefers-color-scheme: dark)");
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  let currentTheme = "light";
  let savedMode = "auto";
  let savedTheme = null;
  let themeTransitionTimer = 0;
  let navThemeColorAnimation = null;
  let logsThemeTransitionTimers = [];
  let logsThemeTransitionCleanups = [];
  try {
    savedMode = localStorage.getItem("l4rxx-theme-mode") || "auto";
    savedTheme = localStorage.getItem("l4rxx-theme");
  } catch (error) {
    savedMode = "auto";
    savedTheme = null;
  }
  if (savedMode !== "light" && savedMode !== "dark" && savedMode !== "auto") savedMode = "auto";

  const getSystemTheme = () => systemTheme?.matches ? "dark" : "light";

  const clearThemeTransition = () => {
    document.documentElement.classList.remove("is-theme-transitioning");
    document.body.classList.remove("is-theme-transitioning");
  };

  const startThemeTransition = () => {
    if (reduceMotion?.matches || !document.body.classList.contains("has-loaded")) return;
    window.clearTimeout(themeTransitionTimer);
    document.documentElement.classList.add("is-theme-transitioning");
    document.body.classList.add("is-theme-transitioning");
    document.body.offsetHeight;
    themeTransitionTimer = window.setTimeout(clearThemeTransition, 940);
  };

  const clearLogsThemeTransitionTimers = () => {
    logsThemeTransitionTimers.forEach((timer) => window.clearTimeout(timer));
    logsThemeTransitionTimers = [];
    logsThemeTransitionCleanups.forEach((cleanup) => cleanup());
    logsThemeTransitionCleanups = [];
  };

  const animateNavThemeColor = (next, animate) => {
    const navScreen = document.querySelector(".nav-screen");
    if (!navScreen) return;
    const currentColor = getComputedStyle(navScreen).color;
    navThemeColorAnimation?.cancel();
    navThemeColorAnimation = null;
    if (reduceMotion?.matches || !animate || !document.body.classList.contains("has-loaded")) return;
    const targetColor = next === "dark" ? "#ebe7df" : "#0c0c0c";
    const animation = navScreen.animate(
      [{ color: currentColor }, { color: targetColor }],
      { duration: 720, easing: "cubic-bezier(.5, 0, .5, 1)", fill: "both" }
    );
    navThemeColorAnimation = animation;
    animation.finished.then(() => {
      if (navThemeColorAnimation !== animation) return;
      navThemeColorAnimation = null;
      animation.cancel();
    }).catch(() => {});
  };

  const animateLogsThemeColor = (next, animate) => {
    clearLogsThemeTransitionTimers();
    const shells = [...document.querySelectorAll(".logs-shell")];
    if (!shells.length) return;
    const targetColor = next === "dark" ? "#ebe7df" : "#0c0c0c";
    if (reduceMotion?.matches || !animate || !document.body.classList.contains("has-loaded")) {
      shells.forEach((shell) => {
        shell.style.transition = "";
        shell.style.color = "";
      });
      return;
    }
    shells.forEach((shell) => {
      const currentColor = getComputedStyle(shell).color;
      shell.style.transition = "none";
      shell.style.color = currentColor;
      shell.offsetHeight;
      shell.style.transition = "color .72s var(--ease-soft), border-color .72s var(--ease-soft)";
      requestAnimationFrame(() => {
        shell.style.color = targetColor;
      });
      let didFinish = false;
      const finish = (event) => {
        if (event && event.propertyName !== "color") return;
        if (didFinish) return;
        didFinish = true;
        shell.removeEventListener("transitionend", finish);
        shell.style.transition = "none";
        shell.style.color = targetColor;
        shell.offsetHeight;
        shell.style.transition = "";
        shell.style.color = "";
      };
      shell.addEventListener("transitionend", finish);
      logsThemeTransitionCleanups.push(() => finish());
      logsThemeTransitionTimers.push(window.setTimeout(finish, 1800));
    });
  };

  const applyTheme = (theme, animate = false) => {
    const next = theme === "dark" ? "dark" : "light";
    const shouldAnimate = animate && next !== currentTheme;
    if (shouldAnimate) startThemeTransition();
    animateNavThemeColor(next, shouldAnimate);
    animateLogsThemeColor(next, shouldAnimate);
    currentTheme = next;
    document.documentElement.dataset.theme = next;
    document.body.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    if (metaTheme) metaTheme.setAttribute("content", next === "dark" ? "#10100f" : "#f5f3f0");
    if (toggle) {
      toggle.setAttribute("aria-pressed", String(next === "dark"));
      toggle.setAttribute("aria-label", next === "dark" ? "Switch to light theme" : "Switch to dark theme");
    }
  };

  const applySystemTheme = (animate = true) => {
    applyTheme(getSystemTheme(), animate);
  };

  const persistThemeMode = (mode) => {
    try {
      localStorage.setItem("l4rxx-theme-mode", mode);
      if (mode === "auto") localStorage.removeItem("l4rxx-theme");
      else localStorage.setItem("l4rxx-theme", mode);
    } catch (error) {
      return;
    }
  };

  const setTheme = (theme, persist = true, animate = true) => {
    applyTheme(theme, animate);
    if (!persist) return;
    savedMode = currentTheme;
    persistThemeMode(savedMode);
  };

  if (toggle) {
    toggle.addEventListener("click", () => setTheme(currentTheme === "dark" ? "light" : "dark", true, true));
  }

  systemTheme?.addEventListener?.("change", (event) => {
    if (savedMode === "auto") applySystemTheme(true);
  });

  if (savedMode === "auto") {
    applySystemTheme(false);
    persistThemeMode("auto");
  } else {
    applyTheme(savedMode || savedTheme || getSystemTheme(), false);
  }
}

function getPhotoRel(photo, fallbackIndex = 0) {
  return Number(photo?.id) || fallbackIndex + 1;
}

function readOverviewReturnState() {
  try {
    const state = JSON.parse(sessionStorage.getItem(OVERVIEW_RETURN_STORAGE_KEY) || "null");
    return state && typeof state === "object" ? state : null;
  } catch (error) {
    return null;
  }
}

function shuffleOverviewPhotos(source) {
  const items = [...source];
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

function resolveOverviewPhotosFromOrder(order) {
  const byRel = new Map(photos.map((photo, index) => [getPhotoRel(photo, index), photo]));
  const seen = new Set();
  const ordered = [];
  if (Array.isArray(order)) {
    order.forEach((value) => {
      const rel = Number(value);
      const photo = byRel.get(rel);
      if (!photo || seen.has(rel)) return;
      ordered.push(photo);
      seen.add(rel);
    });
  }
  const remaining = photos.filter((photo, index) => !seen.has(getPhotoRel(photo, index)));
  return ordered.concat(shuffleOverviewPhotos(remaining));
}

function prepareOverviewPhotos(returnState) {
  const returnOrder = Array.isArray(returnState?.order) ? returnState.order : null;
  overviewPhotos = returnOrder ? resolveOverviewPhotosFromOrder(returnOrder) : shuffleOverviewPhotos(photos);
  overviewOrder = overviewPhotos.map((photo, index) => getPhotoRel(photo, index));
}

function getOverviewOrder() {
  return overviewOrder.length ? overviewOrder : photos.map((photo, index) => getPhotoRel(photo, index));
}
function renderOverview() {
  const grid = document.querySelector("[data-overview-grid]");
  if (!grid) return;
  grid.innerHTML = "";
  grid.style.minHeight = "";

  const returnState = readOverviewReturnState();
  prepareOverviewPhotos(returnState);
  overviewImageObserver?.disconnect();
  overviewImageObserver = createDeferredImageObserver("720px");
  appendOverviewBatch(grid, createOverviewBatch(true), true);
  const isReturning = handleOverviewReturn(grid, returnState);
  if (!isReturning) initializeOverviewItems();
  initializeInfinityScroll(grid);
  initializeOverviewInteraction(grid);

  const captureOverviewReturn = (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const link = target?.closest("a[href*='focus.html?rel=']");
    if (!link || !grid.contains(link)) return;
    storeOverviewReturn(link);
  };
  grid.addEventListener("pointerdown", captureOverviewReturn, { capture: true, passive: true });
  grid.addEventListener("click", captureOverviewReturn, { capture: true });
}

function createOverviewBatch(isOriginal = false) {
  const sourcePhotos = overviewPhotos.length ? overviewPhotos : photos;
  const items = [];
  let photoIndex = 0;
  const cellCount = sourcePhotos.length + (isOriginal ? overviewSkipCells.size : 0);
  for (let cellIndex = 0; cellIndex < cellCount; cellIndex++) {
    if (isOriginal && overviewSkipCells.has(cellIndex)) {
      const spacer = document.createElement("div");
      spacer.className = "overview-item infinity-item--skip infinity-item--batch";
      items.push(spacer);
      continue;
    }

    const photo = sourcePhotos[photoIndex];
    items.push(createOverviewLink(photo, photoIndex, isOriginal, cellIndex));
    photoIndex++;
  }

  const fillCount = (5 - (items.length % 5)) % 5;
  const fillStart = Math.max(0, Math.floor((sourcePhotos.length - fillCount) / 2));
  for (let fillIndex = 0; fillIndex < fillCount; fillIndex++) {
    const photoIndexToFill = (fillStart + fillIndex) % sourcePhotos.length;
    items.push(createOverviewLink(sourcePhotos[photoIndexToFill], photoIndexToFill, isOriginal, items.length, "infinity-item--fill"));
  }
  return items;
}

function getOverviewPhotoSizeClass(photo) {
  const width = Number(photo?.width || 0);
  const height = Number(photo?.height || 0);
  if (!(width > 0 && height > 0)) return "overview-size--natural";
  const ratio = width / height;
  if (ratio >= .96 && ratio <= 1.04) return "overview-size--square";
  if (ratio > 2) return "overview-size--panorama";
  if (ratio > 1.65) return "overview-size--wide";
  if (ratio >= 1.15) return "overview-size--landscape";
  if (ratio > 1.04) return "overview-size--landscape-soft";
  if (ratio < .68) return "overview-size--tall";
  return "overview-size--portrait";
}

function createOverviewLink(photo, index, isOriginal, cellIndex, extraClass = "") {
  const link = document.createElement("a");
  link.className = `overview-item infinity-item--batch infinity-item--original${extraClass ? ` ${extraClass}` : ""}`;
  link.classList.add(getOverviewPhotoSizeClass(photo));
  const columnIndex = ((cellIndex % 5) + 5) % 5;
  if (columnIndex === 0 || columnIndex === 4) link.classList.add("overview-size--edge");
  if (isOriginal && cellIndex <= 14) link.classList.add("is-visible");
  const photoRel = getPhotoRel(photo, index);
  const prioritize = isOriginal && cellIndex < 5;
  link.href = `focus.html?rel=${photoRel}`;
  link.dataset.rel = String(photoRel);
  const thumbSource = prioritize ? `src="${photo.thumb}"` : `data-src="${photo.thumb}"`;
  link.innerHTML = `<span class="fs-media"><img ${thumbSource} alt="${photo.alt}"${getPhotoImageSizeAttributes(photo, true)} loading="${prioritize ? "eager" : "lazy"}" fetchpriority="${prioritize ? "high" : "low"}" decoding="async"></span>`;
  return link;
}

function appendOverviewBatch(grid, batch, isInitial = false) {
  batch.forEach((item) => {
    const clone = isInitial ? item : item.cloneNode(true);
    if (!isInitial) {
      clone.classList.remove("infinity-item--original", "is-visible", "is-return-target");
      clone.classList.add("infinity-item--clone");
      clone.removeAttribute("style");
      clone.querySelectorAll("[style]").forEach((child) => child.removeAttribute("style"));
    }
    grid.appendChild(clone);
  });
  observeDeferredImages(grid, overviewImageObserver);
}

function storeOverviewReturn(source) {
  const link = source?.currentTarget || (source?.target ? source.target.closest("a") : source);
  if (!link) return;
  let rel = Number(link.dataset.rel || 0);
  if (!rel) {
    try {
      rel = Number(new URL(link.href, window.location.href).searchParams.get("rel"));
    } catch (error) {
      rel = 0;
    }
  }
  const state = {
    rel: rel || 1,
    scrollY: window.scrollY || document.documentElement.scrollTop || 0,
    createdAt: Date.now(),
    order: getOverviewOrder()
  };
  try {
    sessionStorage.setItem(OVERVIEW_RETURN_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    return;
  }
}

function handleOverviewReturn(grid, returnState = null) {
  const params = new URLSearchParams(window.location.search);
  const state = returnState || readOverviewReturnState();

  const shouldReturn = params.get("from") === "rel" || !!state;
  if (!shouldReturn) return false;


  document.body.classList.add("is-returning-from-rel", "has-loaded", "has-finished");
  document.documentElement.classList.add("has-landed");

  const rel = Number(params.get("rel") || state?.rel || 1);
  const targetY = Math.max(0, Number(state?.scrollY || 0));
  while (grid.offsetTop + grid.scrollHeight - (targetY + window.innerHeight) <= 700) {
    appendOverviewBatch(grid, createOverviewBatch(false), false);
  }

  requestAnimationFrame(() => {
    window.scrollTo({ top: targetY, left: 0, behavior: "auto" });
    const target = findReturnTarget(grid, rel, targetY);
    if (target) {
      target.classList.add("is-return-target");
      runOverviewReturnFlight(target, state);
    }
  });

  if (params.has("from")) {
    params.delete("from");
    params.delete("rel");
    const nextSearch = params.toString();
    window.history.replaceState({}, "", `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ""}`);
  }
  try {
    sessionStorage.removeItem(OVERVIEW_RETURN_STORAGE_KEY);
  } catch (error) {
    return true;
  }
  return true;
}

function findReturnTarget(grid, rel, targetY) {
  const candidates = [...grid.querySelectorAll(`a[data-rel="${rel}"]`)];
  if (!candidates.length) return null;
  const viewportCenter = targetY + window.innerHeight / 2;
  return candidates.reduce((best, candidate) => {
    const candidateDistance = Math.abs(candidate.offsetTop + candidate.offsetHeight / 2 - viewportCenter);
    const bestDistance = Math.abs(best.offsetTop + best.offsetHeight / 2 - viewportCenter);
    return candidateDistance < bestDistance ? candidate : best;
  }, candidates[0]);
}

function initializeOverviewItems() {
  const items = [...document.querySelectorAll(".overview-item.is-visible")];
  if (!items.length) return;
  const zOrder = shuffledRange(items.length);
  const delays = shuffledRange(items.length);
  items.forEach((item, index) => {
    const rect = item.getBoundingClientRect();
    const centerX = (window.innerWidth - rect.width) / 2;
    const centerY = (window.innerHeight - rect.height) / 2;
    const duration = (0.8 + ((index * 7) % 9) * 0.07).toFixed(2);
    item.style.setProperty("--translate-x", `${centerX - rect.left}px`);
    item.style.setProperty("--translate-y", `${centerY - rect.top}px`);
    item.style.setProperty("--z-index", zOrder[index]);
    item.style.setProperty("--delay", delays[index]);
    item.style.setProperty("--duration", `${duration}s`);
  });
}

function shuffledRange(count) {
  const values = Array.from({ length: count }, (_, index) => index + 1);
  for (let i = values.length - 1; i > 0; i--) {
    const j = (i * 7 + 3) % (i + 1);
    [values[i], values[j]] = [values[j], values[i]];
  }
  return values;
}

let overviewScrollHandler = null;
let overviewInteractionCleanup = null;

function initializeInfinityScroll(grid) {
  if (overviewScrollHandler) {
    window.removeEventListener("scroll", overviewScrollHandler);
    overviewScrollHandler = null;
  }
  if (!grid) return;

  const batch = createOverviewBatch(false);

  overviewScrollHandler = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    if (grid.offsetTop + grid.scrollHeight - (scrollTop + window.innerHeight) <= 500) {
      appendOverviewBatch(grid, batch, false);
    }
  };
  window.addEventListener("scroll", overviewScrollHandler, { passive: true });
}

function initializeOverviewAttraction(grid) {
  if (overviewInteractionCleanup) {
    overviewInteractionCleanup();
    overviewInteractionCleanup = null;
  }
  const title = document.querySelector(".brand-title");
  const letters = title ? [...title.querySelectorAll(".brand-letter")] : [];
  const figure = document.querySelector(".brand-fall-figure");
  if (!grid || !title || !letters.length) return;

  let frame = 0;
  let readyTimer = 0;
  let waitTimer = 0;
  let started = false;
  let activeItems = [];
  let pieces = [];
  let lastScrollY = window.scrollY || document.documentElement.scrollTop || 0;
  let scrollVelocity = 0;

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const isMobile = () => window.innerWidth <= 768;

  const clearPhotoStates = () => {
    activeItems.forEach((item) => {
      item.classList.remove("is-home-active", "is-home-near", "is-home-hit");
      item.style.removeProperty("--home-photo-x");
      item.style.removeProperty("--home-photo-y");
    });
    activeItems = [];
  };

  const applyIdleState = () => {
    document.body.classList.remove("is-letter-attraction", "is-letter-gravity");
    title.style.setProperty("--brand-shift-x", "0px");
    title.style.setProperty("--brand-shift-y", "0px");
    title.style.setProperty("--brand-tilt", "0deg");
    title.style.setProperty("--brand-scale", "1");
    letters.forEach((letter) => {
      letter.style.setProperty("--letter-x", "0px");
      letter.style.setProperty("--letter-y", "0px");
      letter.style.setProperty("--letter-rotate", "0deg");
    });
    clearPhotoStates();
  };

  const getVisiblePhotos = () => {
    const margin = isMobile() ? 180 : 220;
    return [...grid.querySelectorAll(".overview-item[href]")].map((item) => {
      const image = item.querySelector("img");
      const media = item.querySelector(".fs-media");
      const rect = image && image.complete && image.naturalWidth > 0
        ? image.getBoundingClientRect()
        : media?.getBoundingClientRect();
      if (!rect || rect.width < 8 || rect.height < 8) return null;
      return { item, rect };
    }).filter((photo) => {
      const rect = photo.rect;
      return rect.right > -margin &&
        rect.left < window.innerWidth + margin &&
        rect.bottom > -margin &&
        rect.top < window.innerHeight + margin;
    }).sort((a, b) => {
      const centerY = window.innerHeight / 2;
      const aDistance = Math.abs(a.rect.top + a.rect.height / 2 - centerY);
      const bDistance = Math.abs(b.rect.top + b.rect.height / 2 - centerY);
      return aDistance - bDistance;
    }).slice(0, Math.max(letters.length + 2, 7));
  };

  const getFallbackTarget = (piece, index) => {
    const totalWidth = pieces.reduce((sum, current) => sum + current.width, 0) + (pieces.length - 1) * (isMobile() ? 4 : 9);
    const startX = (window.innerWidth - totalWidth) / 2;
    const x = startX + pieces.slice(0, index).reduce((sum, current) => sum + current.width + (isMobile() ? 4 : 9), 0);
    return {
      x: clamp(x, 8, Math.max(8, window.innerWidth - piece.width - 8)),
      y: window.innerHeight * (isMobile() ? 0.58 : 0.54),
      angle: (index - 2) * (isMobile() ? 1.2 : 1.6),
      item: null
    };
  };

  const getAttractionTarget = (piece, index, photos, time) => {
    if (!photos.length) return getFallbackTarget(piece, index);
    const photo = photos[index % photos.length];
    const rect = photo.rect;
    const scrollDrift = clamp(scrollVelocity * 0.015, -14, 14);
    const breathing = Math.sin(time * 0.001 + index * 1.8) * (isMobile() ? 2.5 : 4);
    const margin = isMobile() ? 10 : 16;
    const layouts = [
      { x: rect.left - piece.width - margin, y: rect.top + rect.height * 0.18 },
      { x: rect.right + margin, y: rect.top + rect.height * 0.42 },
      { x: rect.left + rect.width * 0.52 - piece.width / 2, y: rect.top - piece.height - margin },
      { x: rect.left - piece.width - margin, y: rect.bottom - piece.height * 1.08 },
      { x: rect.right + margin, y: rect.bottom - piece.height * 1.05 }
    ];
    const layout = layouts[index % layouts.length];
    return {
      x: clamp(layout.x + breathing * 0.5, 8, Math.max(8, window.innerWidth - piece.width - 8)),
      y: clamp(layout.y + scrollDrift + breathing, 8, Math.max(8, window.innerHeight - piece.height - 14)),
      angle: (index - 2) * (isMobile() ? 1.8 : 2.4) + clamp(scrollVelocity * 0.012, -2.8, 2.8),
      item: photo.item
    };
  };

  const updatePhotoStates = (targets) => {
    clearPhotoStates();
    const uniqueItems = [...new Set(targets.map((target) => target.item).filter(Boolean))];
    activeItems = uniqueItems;
    activeItems.forEach((item, index) => {
      item.classList.add(index === 0 ? "is-home-active" : "is-home-near");
      const direction = index % 2 === 0 ? 1 : -1;
      item.style.setProperty("--home-photo-x", `${(direction * (isMobile() ? 1.4 : 2.4)).toFixed(2)}px`);
      item.style.setProperty("--home-photo-y", `${(Math.sin(index + scrollVelocity * 0.01) * 1.8).toFixed(2)}px`);
    });
  };

  const tick = (time) => {
    const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
    scrollVelocity = scrollVelocity * 0.82 + (scrollY - lastScrollY) * 0.18;
    lastScrollY = scrollY;

    const photos = getVisiblePhotos();
    const targets = pieces.map((piece, index) => getAttractionTarget(piece, index, photos, time));
    const follow = isMobile() ? 0.052 : 0.046;
    pieces.forEach((piece, index) => {
      const target = targets[index];
      const lag = follow * (1 - index * 0.035);
      piece.x += (target.x - piece.x) * lag;
      piece.y += (target.y - piece.y) * lag;
      piece.angle += (target.angle - piece.angle) * (lag * 0.72);
      setPieceTransform(piece);
    });
    updatePhotoStates(targets);
    frame = requestAnimationFrame(tick);
  };

  const start = () => {
    if (started) return;
    started = true;
    pieces = letters.map((letter) => {
      const rect = letter.getBoundingClientRect();
      return {
        el: letter,
        glyph: letter.textContent.trim().toLowerCase(),
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
        angle: 0
      };
    });
    title.style.setProperty("--brand-shift-x", "0px");
    title.style.setProperty("--brand-shift-y", "0px");
    title.style.setProperty("--brand-tilt", "0deg");
    title.style.setProperty("--brand-scale", "1");
    pieces.forEach((piece) => {
      piece.angle = piece.angle || 0;
      setPieceTransform(piece);
    });
    document.body.classList.add("is-letter-attraction");
    lastScrollY = window.scrollY || document.documentElement.scrollTop || 0;
    frame = requestAnimationFrame(tick);
  };

  const waitForIntro = () => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      applyIdleState();
      return;
    }
    if (document.body.classList.contains("is-returning-from-rel")) {
      readyTimer = window.setTimeout(start, 260);
      return;
    }
    if (document.body.classList.contains("has-finished")) {
      readyTimer = window.setTimeout(start, 950);
      return;
    }
    waitTimer = window.setTimeout(waitForIntro, 80);
  };

  const handleResize = () => {
    if (!started) return;
    pieces.forEach((piece) => {
      const rect = piece.el.getBoundingClientRect();
      piece.width = rect.width;
      piece.height = rect.height;
      piece.x = clamp(piece.x, 8, Math.max(8, window.innerWidth - piece.width - 8));
      piece.y = clamp(piece.y, 8, Math.max(8, window.innerHeight - piece.height - 8));
    });
  };

  window.addEventListener("resize", handleResize);
  waitForIntro();

  overviewInteractionCleanup = () => {
    if (frame) cancelAnimationFrame(frame);
    window.clearTimeout(readyTimer);
    window.clearTimeout(waitTimer);
    window.removeEventListener("resize", handleResize);
    applyIdleState();
  };
}

function initializeOverviewInteraction(grid) {
  if (overviewInteractionCleanup) {
    overviewInteractionCleanup();
    overviewInteractionCleanup = null;
  }
  const title = document.querySelector(".brand-title");
  const letters = title ? [...title.querySelectorAll(".brand-letter")] : [];
  const figure = document.querySelector(".brand-fall-figure");
  if (!grid || !title || !letters.length) return;

  let frame = 0;
  let readyTimer = 0;
  let waitTimer = 0;
  let started = false;
  let activeItem = null;
  let nearItems = [];
  let pieces = [];
  const photoHitTimers = new Map();
  let lastTime = 0;
  let lastScrollY = window.scrollY || document.documentElement.scrollTop || 0;
  let physicsStartedAt = 0;
  let lastScrollMoveAt = 0;
  let scrollLift = 0;
  let motionInfluence = { x: 0, y: 0, twist: 0 };
  let motionListening = false;
  let motionPermissionRequested = false;
  let motionGestureListenersActive = false;
  let photoEffectsReady = false;
  let lastOrientationAt = 0;
  let motionNeutral = { x: 0, y: 0, angle: null, samples: 0 };
  let reunionStableSince = 0;
  let reunionEndsAt = 0;
  let reunionCooldownUntil = 0;
  let reunionPhoto = null;
  let reunionArmed = true;
  let restTargetKey = "";
  let cachedRestTargets = new Map();
  const ORIENTATION_LOW_PASS_RATE = 0.12;
  const MOTION_LOW_PASS_RATE = 0.08;
  const motionGestureOptions = { passive: true };

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const isMobile = () => window.innerWidth <= 768;
  const idleAttractionRadius = () => window.innerHeight * (isMobile() ? 0.66 : 0.68);
  const photoAvoidRadius = () => isMobile() ? 10 : 16;
  const getSoftCollisionThreshold = () => isMobile() ? 0.82 : 0.98;
  const scheduleFrame = (callback) => {
    return window.setTimeout(() => callback(Date.now()), 16);
  };
  const cancelFrame = (id) => {
    window.clearTimeout(id);
  };
  const blendMotion = (nextX, nextY, nextTwist = 0, rate = 0.18) => {
    motionInfluence.x += (clamp(nextX, -1, 1) - motionInfluence.x) * rate;
    motionInfluence.y += (clamp(nextY, -1, 1) - motionInfluence.y) * rate;
    motionInfluence.twist += (clamp(nextTwist, -1, 1) - motionInfluence.twist) * rate;
  };
  const getMotionWakeStrength = () => Math.abs(motionInfluence.x) + Math.abs(motionInfluence.y) + Math.abs(motionInfluence.twist) * 0.28;
  const getPieceBox = (piece) => {
    if (piece.type === "figure") {
      const hitbox = piece.hitbox || { left: 0.18, right: 0.18, top: 0.075, bottom: 0.025 };
      return {
        left: piece.x + piece.width * hitbox.left,
        right: piece.x + piece.width * (1 - hitbox.right),
        top: piece.y + piece.height * hitbox.top,
        bottom: piece.y + piece.height * (1 - hitbox.bottom),
        offsetLeft: piece.width * hitbox.left,
        offsetRight: piece.width * hitbox.right,
        offsetTop: piece.height * hitbox.top,
        offsetBottom: piece.height * hitbox.bottom
      };
    }

    const glyph = piece.glyph || "";
    const narrowInset = glyph === "l" ? 0.42 : glyph === "r" ? 0.29 : glyph === "4" ? 0.26 : 0.24;
    const topInset = glyph === "4" ? 0.15 : 0.18;
    const bottomInset = glyph === "l" ? 0.18 : 0.16;
    return {
      left: piece.x + piece.width * narrowInset,
      right: piece.x + piece.width * (1 - narrowInset),
      top: piece.y + piece.height * topInset,
      bottom: piece.y + piece.height * (1 - bottomInset),
      offsetLeft: piece.width * narrowInset,
      offsetRight: piece.width * narrowInset,
      offsetTop: piece.height * topInset,
      offsetBottom: piece.height * bottomInset
    };
  };

  const setPieceTransform = (piece) => {
    if (piece.type === "figure") {
      piece.el.style.setProperty("--figure-x", `${piece.x.toFixed(2)}px`);
      piece.el.style.setProperty("--figure-y", `${piece.y.toFixed(2)}px`);
      piece.el.style.setProperty("--figure-rotate", `${piece.angle.toFixed(2)}deg`);
      return;
    }
    piece.el.style.setProperty("--letter-x", `${piece.x.toFixed(2)}px`);
    piece.el.style.setProperty("--letter-y", `${piece.y.toFixed(2)}px`);
    piece.el.style.setProperty("--letter-rotate", `${piece.angle.toFixed(2)}deg`);
  };

  const getScreenAngle = () => {
    const raw = Number(window.screen?.orientation?.angle ?? window.orientation ?? 0);
    return ((raw % 360) + 360) % 360;
  };

  const mapDeviceTiltToScreen = (beta, gamma, angle) => {
    if (angle === 90) return { x: beta, y: -gamma };
    if (angle === 270) return { x: -beta, y: gamma };
    if (angle === 180) return { x: -gamma, y: -beta };
    return { x: gamma, y: beta };
  };

  const handleDeviceOrientation = (event) => {
    const gamma = Number(event.gamma || 0);
    const beta = Number(event.beta || 0);
    const alpha = Number(event.alpha || 0);
    const angle = getScreenAngle();
    const mapped = mapDeviceTiltToScreen(beta, gamma, angle);
    lastOrientationAt = performance.now();
    if (motionNeutral.angle !== angle) {
      motionNeutral = { x: mapped.x, y: mapped.y, angle, samples: 1 };
      blendMotion(0, 0, 0, 1);
      return;
    }
    if (motionNeutral.samples < 8) {
      const samples = motionNeutral.samples + 1;
      motionNeutral.x += (mapped.x - motionNeutral.x) / samples;
      motionNeutral.y += (mapped.y - motionNeutral.y) / samples;
      motionNeutral.samples = samples;
      blendMotion(0, 0, 0, ORIENTATION_LOW_PASS_RATE);
      return;
    }
    const screenX = (mapped.x - motionNeutral.x) / 30;
    const screenY = (mapped.y - motionNeutral.y) / 32;
    blendMotion(screenX, screenY, Math.sin(alpha * Math.PI / 180) * 0.34, ORIENTATION_LOW_PASS_RATE);
  };

  const handleDeviceMotion = (event) => {
    if (performance.now() - lastOrientationAt < 520) return;
    const acceleration = event.accelerationIncludingGravity || event.acceleration;
    if (!acceleration) return;
    const x = Number(acceleration.x || 0) / 14;
    const y = Number(acceleration.y || 0) / -18;
    blendMotion(x, y, 0, MOTION_LOW_PASS_RATE);
  };

  const startMotionListening = () => {
    if (motionListening) return;
    motionListening = true;
    removeMotionGestureListeners();
    window.addEventListener("deviceorientation", handleDeviceOrientation, true);
    window.addEventListener("devicemotion", handleDeviceMotion, true);
  };

  const removeMotionGestureListeners = () => {
    if (!motionGestureListenersActive) return;
    motionGestureListenersActive = false;
    window.removeEventListener("pointerdown", requestMotionAccess);
    window.removeEventListener("touchstart", requestMotionAccess);
    window.removeEventListener("touchend", requestMotionAccess);
    window.removeEventListener("click", requestMotionAccess);
  };

  const requestMotionAccess = async (event) => {
    if (motionPermissionRequested || motionListening) return;
    if (event && event.isTrusted === false) return;
    motionPermissionRequested = true;
    const orientationEvent = window.DeviceOrientationEvent;
    const motionEvent = window.DeviceMotionEvent;
    try {
      const permissionRequests = [];
      if (orientationEvent && typeof orientationEvent.requestPermission === "function") {
        permissionRequests.push(orientationEvent.requestPermission());
      }
      if (motionEvent && typeof motionEvent.requestPermission === "function") {
        permissionRequests.push(motionEvent.requestPermission());
      }
      if (!permissionRequests.length) {
        startMotionListening();
        return;
      }
      const states = await Promise.all(permissionRequests);
      if (states.some((state) => state !== "granted")) {
        motionPermissionRequested = false;
        return;
      }
      startMotionListening();
    } catch (error) {
      motionPermissionRequested = false;
      return;
    }
  };

  const addMotionGestureListeners = () => {
    if (motionGestureListenersActive) return;
    motionGestureListenersActive = true;
    window.addEventListener("pointerdown", requestMotionAccess, motionGestureOptions);
    window.addEventListener("touchstart", requestMotionAccess, motionGestureOptions);
    window.addEventListener("touchend", requestMotionAccess, motionGestureOptions);
    window.addEventListener("click", requestMotionAccess, motionGestureOptions);
  };

  const setupMotionAccess = () => {
    if (!("DeviceOrientationEvent" in window) && !("DeviceMotionEvent" in window)) return;
    const needsGesture = Boolean(window.DeviceOrientationEvent?.requestPermission || window.DeviceMotionEvent?.requestPermission);
    if (!needsGesture) {
      startMotionListening();
      return;
    }
    addMotionGestureListeners();
  };

  const clearStates = () => {
    if (activeItem) activeItem.classList.remove("is-home-active");
    nearItems.forEach((item) => item.classList.remove("is-home-near"));
    photoHitTimers.forEach((timer, item) => {
      window.clearTimeout(timer);
      item.classList.remove("is-home-hit");
      item.style.removeProperty("--home-photo-x");
      item.style.removeProperty("--home-photo-y");
    });
    photoHitTimers.clear();
    activeItem = null;
    nearItems = [];
  };

  const clearReunionState = () => {
    document.body.classList.remove("is-letter-reunion");
    reunionPhoto?.classList.remove("is-home-reunion");
    reunionPhoto = null;
  };

  const applyIdleState = () => {
    document.body.classList.remove("is-letter-gravity");
    title.style.setProperty("--brand-shift-x", "0px");
    title.style.setProperty("--brand-shift-y", "0px");
    title.style.setProperty("--brand-tilt", "0deg");
    title.style.setProperty("--brand-scale", "1");
    letters.forEach((letter) => {
      letter.style.setProperty("--letter-x", "0px");
      letter.style.setProperty("--letter-y", "0px");
      letter.style.setProperty("--letter-rotate", "0deg");
    });
    if (figure) {
      figure.style.setProperty("--figure-x", "50vw");
      figure.style.setProperty("--figure-y", "-120%");
      figure.style.setProperty("--figure-rotate", "0deg");
    }
    clearStates();
  };

  const setActiveItem = (item, colliders) => {
    if (activeItem !== item) {
      if (activeItem) activeItem.classList.remove("is-home-active");
      activeItem = item || null;
      if (activeItem) activeItem.classList.add("is-home-active");
    }

    nearItems.forEach((nearItem) => nearItem.classList.remove("is-home-near"));
    nearItems = [];
    if (!item) return;

    const activeCollider = colliders.find((collider) => collider.item === item);
    if (!activeCollider) return;
    const activeCenterX = activeCollider.rect.left + activeCollider.rect.width / 2;
    const activeCenterY = activeCollider.rect.top + activeCollider.rect.height / 2;
    nearItems = colliders.filter((collider) => {
      if (collider.item === item) return false;
      const centerX = collider.rect.left + collider.rect.width / 2;
      const centerY = collider.rect.top + collider.rect.height / 2;
      return Math.hypot(centerX - activeCenterX, centerY - activeCenterY) < Math.min(window.innerWidth, window.innerHeight) * 0.46;
    }).slice(0, 3).map((collider) => collider.item);
    nearItems.forEach((nearItem) => nearItem.classList.add("is-home-near"));
  };

  const getPhotoColliders = () => {
    const edgeBuffer = isMobile() ? 110 : 160;
    return [...grid.querySelectorAll(".overview-item[href]")].map((item) => {
      const image = item.querySelector("img");
      const media = item.querySelector(".fs-media");
      const rect = image && image.complete && image.naturalWidth > 0
        ? image.getBoundingClientRect()
        : media?.getBoundingClientRect();
      return rect ? { item, rect } : null;
    }).filter((collider) => {
      const rect = collider.rect;
      return rect.width > 8 &&
        rect.height > 8 &&
        rect.right > -edgeBuffer &&
        rect.left < window.innerWidth + edgeBuffer &&
        rect.bottom > -edgeBuffer &&
        rect.top < window.innerHeight + edgeBuffer;
    });
  };

  const getTopDropX = (pieceWidth, sidePadding, hitbox = { left: 0.18, right: 0.18 }) => {
    const hitLeft = pieceWidth * hitbox.left;
    const hitRight = pieceWidth * (1 - hitbox.right);
    const maxStart = Math.max(sidePadding, window.innerWidth - sidePadding - pieceWidth);
    const corridorLimit = Math.min(window.innerHeight * (isMobile() ? 0.34 : 0.3), isMobile() ? 286 : 330);
    const clearMargin = isMobile() ? 1.5 : 4;
    const blocked = getPhotoColliders().map((collider) => collider.rect).filter((rect) => {
      return rect.width > 8 && rect.height > 8 && rect.bottom > -80 && rect.top < corridorLimit;
    }).map((rect) => ({
      left: clamp(rect.left - clearMargin - hitRight, sidePadding, maxStart),
      right: clamp(rect.right + clearMargin - hitLeft, sidePadding, maxStart)
    })).filter((range) => range.right > range.left + 1).sort((a, b) => a.left - b.left);

    const merged = [];
    blocked.forEach((range) => {
      const last = merged[merged.length - 1];
      if (!last || range.left > last.right) merged.push({ ...range });
      else last.right = Math.max(last.right, range.right);
    });

    const gaps = [];
    let cursor = sidePadding;
    merged.forEach((range) => {
      if (range.left - cursor > Math.max(6, pieceWidth * 0.1)) gaps.push({ left: cursor, right: range.left });
      cursor = Math.max(cursor, range.right);
    });
    if (maxStart - cursor > Math.max(6, pieceWidth * 0.1)) gaps.push({ left: cursor, right: maxStart });

    const centerStart = clamp((window.innerWidth - pieceWidth) / 2, sidePadding, maxStart);
    if (!gaps.length) {
      const jitter = Math.min(26, window.innerWidth * 0.055);
      return clamp(centerStart + (Math.random() - 0.5) * jitter, sidePadding, maxStart);
    }

    if (isMobile()) {
      const centerGap = gaps.reduce((best, gap) => {
        const gapCenter = gap.left + (gap.right - gap.left) / 2;
        const distance = Math.abs(gapCenter - centerStart);
        return !best || distance < best.distance ? { gap, distance } : best;
      }, null).gap;
      const halfWidth = Math.max(0, (centerGap.right - centerGap.left) / 2);
      const jitter = Math.min(28, Math.max(8, halfWidth));
      return clamp(centerStart + (Math.random() - 0.5) * jitter * 2, centerGap.left, centerGap.right);
    }

    const total = gaps.reduce((sum, gap) => sum + Math.max(0, gap.right - gap.left), 0);
    let pick = Math.random() * total;
    for (const gap of gaps) {
      const width = Math.max(0, gap.right - gap.left);
      if (pick <= width) return gap.left + Math.random() * width;
      pick -= width;
    }
    const lastGap = gaps[gaps.length - 1];
    return lastGap.left + Math.random() * Math.max(0, lastGap.right - lastGap.left);
  };
  const getNearestCollider = (colliders) => {
    if (!colliders.length || !pieces.length) return null;
    const group = pieces.reduce((sum, piece) => ({
      x: sum.x + piece.x + piece.width / 2,
      y: sum.y + piece.y + piece.height / 2
    }), { x: 0, y: 0 });
    group.x /= pieces.length;
    group.y /= pieces.length;

    return colliders.reduce((best, collider) => {
      const centerX = collider.rect.left + collider.rect.width / 2;
      const centerY = collider.rect.top + collider.rect.height / 2;
      const distance = Math.hypot(centerX - group.x, centerY - group.y);
      return !best || distance < best.distance ? { item: collider.item, distance } : best;
    }, null)?.item || null;
  };

  const syncPieceMetrics = () => {
    pieces.forEach((piece) => {
      const rect = piece.el.getBoundingClientRect();
      piece.width = rect.width || piece.width;
      piece.height = rect.height || piece.height;
      const minY = piece.type === "figure" ? -piece.height * 1.35 : 0;
      piece.x = clamp(piece.x, 0, Math.max(0, window.innerWidth - piece.width));
      piece.y = clamp(piece.y, minY, Math.max(minY, window.innerHeight - piece.height));
    });
  };

  const getWhitespaceRestCandidate = (floor, sidePadding, colliders, totalWidth, maxHeight, currentGroup) => {
    const lowerTop = window.innerHeight * (isMobile() ? 0.56 : 0.58);
    const lowerBottom = Math.max(lowerTop, floor - maxHeight - (isMobile() ? 4 : 8));
    const preferredY = clamp(window.innerHeight * (isMobile() ? 0.76 : 0.74), lowerTop, lowerBottom);
    const photoClearance = photoAvoidRadius() + (isMobile() ? 5 : 8);
    const blockedRects = colliders.map((collider) => ({
      left: collider.rect.left - photoClearance,
      right: collider.rect.right + photoClearance,
      top: collider.rect.top - photoClearance,
      bottom: collider.rect.bottom + photoClearance
    }));
    const overlapsPhoto = (rect) => blockedRects.some((blocked) => {
      return rect.right > blocked.left && rect.left < blocked.right && rect.bottom > blocked.top && rect.top < blocked.bottom;
    });
    const maxX = Math.max(sidePadding, window.innerWidth - sidePadding - totalWidth);
    const emptyBandStep = Math.max(isMobile() ? 20 : 28, totalWidth * 0.14);
    const emptyBandYStep = Math.max(isMobile() ? 24 : 32, maxHeight * 0.28);
    let best = null;
    for (let y = lowerTop; y <= lowerBottom + 0.5; y += emptyBandYStep) {
      for (let x = sidePadding; x <= maxX + 0.5; x += emptyBandStep) {
        const rect = { left: x, right: x + totalWidth, top: y, bottom: y + maxHeight };
        if (overlapsPhoto(rect)) continue;
        const centerX = x + totalWidth / 2;
        const centerY = y + maxHeight / 2;
        const score = Math.hypot(centerX - currentGroup.x, centerY - currentGroup.y) * 0.48
          + Math.abs(y - preferredY) * 0.34
          + Math.abs(centerX - window.innerWidth / 2) * 0.12;
        if (!best || score < best.score) best = { x, y, score };
      }
    }
    return best;
  };

  const getRestTargets = (floor, sidePadding, colliders) => {
    const settlingPieces = pieces.filter((piece) => piece.settles !== false);
    const gap = isMobile() ? 9 : 12;
    const totalWidth = settlingPieces.reduce((sum, piece) => sum + piece.width, 0) + gap * Math.max(0, settlingPieces.length - 1);
    const maxHeight = settlingPieces.reduce((height, piece) => Math.max(height, piece.height), 0);
    const currentGroup = settlingPieces.reduce((sum, piece) => ({
      x: sum.x + piece.x + piece.width / 2,
      y: sum.y + piece.y + piece.height / 2
    }), { x: 0, y: 0 });
    currentGroup.x /= Math.max(1, settlingPieces.length);
    currentGroup.y /= Math.max(1, settlingPieces.length);

    const viewportKey = `${Math.round(window.innerWidth)}:${Math.round(window.innerHeight)}:${Math.round(window.scrollY / 80)}`;
    if (viewportKey !== restTargetKey) {
      restTargetKey = viewportKey;
      cachedRestTargets = new Map();
    }
    if (cachedRestTargets.size) return cachedRestTargets;
    const targetGroup = getWhitespaceRestCandidate(floor, sidePadding, colliders, totalWidth, maxHeight, currentGroup);
    if (!targetGroup) return new Map();
    let cursor = targetGroup.x;
    const targets = new Map();
    settlingPieces.forEach((piece, index) => {
      targets.set(piece, {
        x: cursor,
        y: targetGroup.y + (maxHeight - piece.height) * 0.48 + (index % 2) * (isMobile() ? 1.2 : 1.8),
        angle: piece.restAngle * 0.24
      });
      cursor += piece.width + gap;
    });
    if (!cachedRestTargets.size) cachedRestTargets = targets;
    return cachedRestTargets;
  };

  const avoidPhotosSoftly = (piece, colliders, dt) => {
    colliders.forEach((collider) => {
      const padding = photoAvoidRadius();
      const rect = {
        left: collider.rect.left - padding,
        right: collider.rect.right + padding,
        top: collider.rect.top - padding,
        bottom: collider.rect.bottom + padding
      };
      const pieceBox = getPieceBox(piece);
      if (pieceBox.right < rect.left || pieceBox.left > rect.right || pieceBox.bottom < rect.top || pieceBox.top > rect.bottom) return;

      const overlapLeft = pieceBox.right - rect.left;
      const overlapRight = rect.right - pieceBox.left;
      const overlapTop = pieceBox.bottom - rect.top;
      const overlapBottom = rect.bottom - pieceBox.top;
      const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
      const strength = (isMobile() ? 0.34 : 0.42) * dt;
      if (minOverlap === overlapLeft) piece.x -= overlapLeft * strength;
      else if (minOverlap === overlapRight) piece.x += overlapRight * strength;
      else if (minOverlap === overlapTop) piece.y -= overlapTop * strength;
      else piece.y += overlapBottom * strength;
      piece.vx *= 0.78;
      piece.vy *= 0.78;
      piece.va *= 0.82;
    });
  };

  const markPhotoHit = (collider, pieceCenterX, pieceCenterY) => {
    if (!photoEffectsReady) return;
    const rect = collider.rect;
    const photoCenterX = rect.left + rect.width / 2;
    const photoCenterY = rect.top + rect.height / 2;
    const driftX = clamp((photoCenterX - pieceCenterX) * 0.018, -5.5, 5.5);
    const driftY = clamp((photoCenterY - pieceCenterY) * 0.014, -3.5, 3.5);
    collider.item.style.setProperty("--home-photo-x", `${driftX.toFixed(2)}px`);
    collider.item.style.setProperty("--home-photo-y", `${driftY.toFixed(2)}px`);
    collider.item.classList.add("is-home-hit");
    const previousTimer = photoHitTimers.get(collider.item);
    if (previousTimer) window.clearTimeout(previousTimer);
    photoHitTimers.set(collider.item, window.setTimeout(() => {
      collider.item.classList.remove("is-home-hit");
      collider.item.style.removeProperty("--home-photo-x");
      collider.item.style.removeProperty("--home-photo-y");
      photoHitTimers.delete(collider.item);
    }, 720));
  };

  const collideWithPhoto = (piece, collider, dt) => {
    const rect = collider.rect;
    const pieceBox = getPieceBox(piece);
    if (pieceBox.right <= rect.left || pieceBox.left >= rect.right || pieceBox.bottom <= rect.top || pieceBox.top >= rect.bottom) return false;

    const overlapLeft = pieceBox.right - rect.left;
    const overlapRight = rect.right - pieceBox.left;
    const overlapTop = pieceBox.bottom - rect.top;
    const overlapBottom = rect.bottom - pieceBox.top;
    const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
    const photoCenterX = rect.left + rect.width / 2;
    const pieceCenterX = pieceBox.left + (pieceBox.right - pieceBox.left) / 2;
    const pieceCenterY = pieceBox.top + (pieceBox.bottom - pieceBox.top) / 2;
    const bounce = (isMobile() ? 0.24 : 0.28) * (piece.rebound || 1);
    piece.sleeping = false;
    piece.floorHits = 0;

    if (minOverlap === overlapTop && piece.vy >= -2) {
      let rollDirection = pieceCenterX < photoCenterX ? -1 : 1;
      if (piece.x < 22) rollDirection = 1;
      if (piece.x + piece.width > window.innerWidth - 22) rollDirection = -1;
      piece.y = rect.top - (piece.height - pieceBox.offsetBottom);
      piece.vy = -Math.min(Math.abs(piece.vy) * bounce + (isMobile() ? 0.38 : 0.48), isMobile() ? 1.8 : 2.25);
      piece.vx += (rollDirection * (isMobile() ? 0.92 : 1.12) + (Math.random() - 0.5) * 0.22) * (piece.rebound || 1) * dt;
    } else if (minOverlap === overlapBottom) {
      piece.y = rect.bottom - pieceBox.offsetTop;
      piece.vy = Math.abs(piece.vy) * 0.18 + 0.32;
    } else if (minOverlap === overlapLeft) {
      piece.x = rect.left - (piece.width - pieceBox.offsetRight);
      piece.vx = -Math.abs(piece.vx) * bounce - (0.54 + Math.random() * 0.16);
    } else {
      piece.x = rect.right - pieceBox.offsetLeft;
      piece.vx = Math.abs(piece.vx) * bounce + (0.54 + Math.random() * 0.16);
    }
    piece.va += clamp((pieceCenterX - photoCenterX) * 0.0035, -0.45, 0.45);
    markPhotoHit(collider, pieceCenterX, pieceCenterY);
    return true;
  };

  const collideLetters = (dt, restTargets = null) => {
    for (let pass = 0; pass < 2; pass++) {
      for (let i = 0; i < pieces.length; i++) {
        for (let j = i + 1; j < pieces.length; j++) {
          const first = pieces[i];
          const second = pieces[j];
          const firstBox = getPieceBox(first);
          const secondBox = getPieceBox(second);
          if (firstBox.right <= secondBox.left || firstBox.left >= secondBox.right || firstBox.bottom <= secondBox.top || firstBox.top >= secondBox.bottom) continue;

          const firstCenterX = firstBox.left + (firstBox.right - firstBox.left) / 2;
          const secondCenterX = secondBox.left + (secondBox.right - secondBox.left) / 2;
          const firstCenterY = firstBox.top + (firstBox.bottom - firstBox.top) / 2;
          const secondCenterY = secondBox.top + (secondBox.bottom - secondBox.top) / 2;
          const overlapX = Math.min(firstBox.right - secondBox.left, secondBox.right - firstBox.left);
          const overlapY = Math.min(firstBox.bottom - secondBox.top, secondBox.bottom - firstBox.top);
          const firstMass = first.mass || 1;
          const secondMass = second.mass || 1;
          const massTotal = firstMass + secondMass;
          const firstShare = secondMass / massTotal;
          const secondShare = firstMass / massTotal;
          const slop = isMobile() ? 2.2 : 1.8;
          const firstTarget = restTargets?.get(first);
          const secondTarget = restTargets?.get(second);
          const settleDirectionX = firstTarget && secondTarget && firstTarget.x !== secondTarget.x
            ? (firstTarget.x < secondTarget.x ? -1 : 1)
            : 0;

          if (overlapX < overlapY) {
            const effectiveOverlap = overlapX - slop;
            if (effectiveOverlap <= 0) continue;
            const direction = settleDirectionX || (firstCenterX < secondCenterX ? -1 : 1);
            const relativeSpeed = Math.abs(first.vx - second.vx);
            const isSoftContact = relativeSpeed < getSoftCollisionThreshold();
            const push = (effectiveOverlap * 0.62 + 0.62) * dt;
            const reboundScale = ((first.rebound || 1) + (second.rebound || 1)) * 0.5;
            first.x += direction * push * firstShare;
            second.x -= direction * push * secondShare;
            if (isSoftContact) {
              const slideDamping = isMobile() ? 0.7 : 0.74;
              const angleDamping = isMobile() ? 0.62 : 0.68;
              first.vx *= slideDamping;
              second.vx *= slideDamping;
              first.va *= angleDamping;
              second.va *= angleDamping;
              first.angle += (first.restAngle - first.angle) * 0.026 * dt;
              second.angle += (second.restAngle - second.angle) * 0.026 * dt;
            } else {
              const rebound = clamp(0.18 + relativeSpeed * 0.2 + effectiveOverlap * 0.016, 0.14, isMobile() ? 0.72 : 0.92) * reboundScale * dt;
              first.vx += direction * rebound * firstShare;
              second.vx -= direction * rebound * secondShare;
              first.vx *= 0.86;
              second.vx *= 0.86;
              first.va += direction * rebound * 0.018;
              second.va -= direction * rebound * 0.018;
            }
          } else {
            const effectiveOverlap = overlapY - slop;
            if (effectiveOverlap <= 0) continue;
            const direction = firstCenterY < secondCenterY ? -1 : 1;
            const relativeSpeed = Math.abs(first.vy - second.vy);
            const isSoftContact = relativeSpeed < getSoftCollisionThreshold();
            const push = (effectiveOverlap * 0.6 + 0.58) * dt;
            const reboundScale = ((first.rebound || 1) + (second.rebound || 1)) * 0.5;
            first.y += direction * push * firstShare;
            second.y -= direction * push * secondShare;
            if (isSoftContact) {
              const slideDamping = isMobile() ? 0.68 : 0.72;
              const angleDamping = isMobile() ? 0.6 : 0.66;
              first.vy *= slideDamping;
              second.vy *= slideDamping;
              first.va *= angleDamping;
              second.va *= angleDamping;
              first.angle += (first.restAngle - first.angle) * 0.024 * dt;
              second.angle += (second.restAngle - second.angle) * 0.024 * dt;
            } else {
              const rebound = clamp(0.16 + relativeSpeed * 0.17 + effectiveOverlap * 0.014, 0.12, isMobile() ? 0.64 : 0.82) * reboundScale * dt;
              first.vy += direction * rebound * firstShare;
              second.vy -= direction * rebound * secondShare;
              first.vy *= 0.82;
              second.vy *= 0.82;
              first.va += (firstCenterX < secondCenterX ? -1 : 1) * rebound * 0.014;
              second.va -= (firstCenterX < secondCenterX ? -1 : 1) * rebound * 0.014;
            }
          }
          first.va *= 0.9;
          second.va *= 0.9;
          first.sleeping = false;
          second.sleeping = false;
        }
      }
    }
  };

  const tick = (time) => {
    if (!lastTime) lastTime = time;
    if (!physicsStartedAt) physicsStartedAt = time;
    const dt = clamp((time - lastTime) / 16.67, 0.5, 1.35);
    lastTime = time;

    const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
    const scrollDelta = clamp(scrollY - lastScrollY, -90, 90);
    lastScrollY = scrollY;
    scrollLift = clamp((scrollLift + scrollDelta * 0.055) * 0.88, -42, 12);

    const floor = window.innerHeight - (isMobile() ? 18 : 24);
    const sidePadding = isMobile() ? 6 : 14;
    const gravity = isMobile() ? 0.095 : 0.11;
    const scrollForce = clamp(scrollDelta * 0.0036, -0.34, 0.26);
    const colliders = getPhotoColliders();
    if (Math.abs(scrollDelta) > 1.5) lastScrollMoveAt = time;
    if (!lastScrollMoveAt) lastScrollMoveAt = time;
    const settleDelay = isMobile() ? 2800 : 3400;
    const settleAge = Math.max(0, time - physicsStartedAt - settleDelay);
    const settleEase = clamp(settleAge / 3600, 0, 1);
    const idleAge = time - lastScrollMoveAt;
    const settlingPieces = pieces.filter((piece) => piece.settles !== false);
    const groupCenterY = settlingPieces.reduce((sum, piece) => sum + piece.y + piece.height / 2, 0) / Math.max(1, settlingPieces.length);
    const groupHasNaturallyDropped = groupCenterY > idleAttractionRadius() || settlingPieces.some((piece) => piece.floorHits > 0);
    const shouldSettle = settleAge > 0
      && idleAge > (isMobile() ? 520 : 680)
      && groupHasNaturallyDropped
      && time >= reunionCooldownUntil;
    if (!shouldSettle) {
      restTargetKey = "";
      cachedRestTargets = new Map();
    }
    const restTargets = shouldSettle ? getRestTargets(floor, sidePadding, colliders) : new Map();
    let touchedItem = null;
    const motionWakeStrength = isMobile() && motionListening ? getMotionWakeStrength() : 0;

    pieces.forEach((piece, index) => {
      piece.onFloor = false;
      if (piece.sleeping && motionWakeStrength > 0.08 && piece.type === "letter") {
        piece.sleeping = false;
        piece.vx += motionInfluence.x * 0.48;
        piece.vy += motionInfluence.y * 0.42;
        piece.va += (motionInfluence.x + motionInfluence.twist * 0.36) * 0.022;
      }
      if (piece.sleeping && Math.abs(scrollDelta) < 1.5 && !shouldSettle) {
        piece.vx = 0;
        piece.vy = 0;
        piece.va = 0;
        piece.angle += (piece.restAngle - piece.angle) * 0.055;
        setPieceTransform(piece);
        return;
      }

      if (Math.abs(scrollDelta) >= 1.5) piece.sleeping = false;
      const passiveGravity = isMobile() && motionListening ? gravity * 0.72 : gravity;
      piece.vy += (passiveGravity + scrollForce) * dt;
      piece.vx += motionInfluence.x * (isMobile() ? 0.068 : 0.034) * dt;
      piece.vy += motionInfluence.y * (isMobile() ? 0.11 : 0.022) * dt;
      piece.va += (motionInfluence.x + motionInfluence.twist * 0.4) * 0.006 * dt;
      if (scrollDelta < -1) {
        piece.y += scrollDelta * 0.045;
        piece.vx *= 0.92;
        piece.va *= 0.72;
      }
      piece.vx += Math.sin(time * 0.001 + (piece.wanderSeed || index * 1.7)) * (piece.type === "figure" ? 0.011 : 0.008) * dt;
      piece.vx *= 0.965;
      piece.vy *= 0.985;
      piece.va *= 0.93;

      piece.x += piece.vx * dt;
      piece.y += piece.vy * dt;
      piece.angle += piece.va * dt;

      if (piece.type === "figure" && isMobile() && piece.y < 0) {
        const entryCenter = clamp((window.innerWidth - piece.width) / 2, sidePadding, Math.max(sidePadding, window.innerWidth - sidePadding - piece.width));
        const entrySpread = Math.min(34, Math.max(18, piece.width * 0.48));
        const minEntryX = entryCenter - entrySpread;
        const maxEntryX = entryCenter + entrySpread;
        if (piece.x < minEntryX) {
          piece.x += (minEntryX - piece.x) * 0.24 * dt;
          piece.vx = Math.max(piece.vx, 0) * 0.76;
        } else if (piece.x > maxEntryX) {
          piece.x += (maxEntryX - piece.x) * 0.24 * dt;
          piece.vx = Math.min(piece.vx, 0) * 0.76;
        }
      }

      if (piece.x < sidePadding) {
        piece.x = sidePadding;
        piece.vx = Math.abs(piece.vx) * 0.18;
        piece.va += 0.06;
      }
      if (piece.x + piece.width > window.innerWidth - sidePadding) {
        piece.x = window.innerWidth - sidePadding - piece.width;
        piece.vx = -Math.abs(piece.vx) * 0.18;
        piece.va -= 0.06;
      }

      colliders.forEach((collider) => {
        if (collideWithPhoto(piece, collider, dt)) touchedItem = collider.item;
      });
      avoidPhotosSoftly(piece, colliders, dt);

      piece.vx = clamp(piece.vx, -3.6, 3.6);
      piece.vy = clamp(piece.vy, -3.8, 5.8);

      if (piece.y + piece.height > floor) {
        piece.y = floor - piece.height;
        piece.onFloor = true;
        piece.floorHits += 1;
        const restEnergy = Math.abs(piece.vy) + Math.abs(piece.vx) * 0.4 + Math.abs(piece.va) * 0.2;
        if (restEnergy < 1.35 || piece.floorHits > 2) {
          piece.sleeping = true;
          piece.vx = 0;
          piece.vy = 0;
          piece.va = 0;
        } else {
          piece.vy = -Math.abs(piece.vy) * (isMobile() ? 0.14 : 0.16);
          piece.vx += (Math.random() - 0.5) * 0.18 * (piece.rebound || 1);
          piece.va = piece.va * 0.42 + (Math.random() - 0.5) * 0.035;
        }
        piece.vx *= 0.58;
        piece.angle += (piece.restAngle - piece.angle) * 0.04;
      }

      const target = shouldSettle ? restTargets.get(piece) : null;
      if (target) {
        const baseSettleRate = Math.abs(scrollDelta) > 1.5 ? 0.008 : 0.014;
        const settleRate = (baseSettleRate + settleEase * 0.018) * dt;
        piece.x += (target.x - piece.x) * settleRate;
        piece.y += (target.y - piece.y) * settleRate;
        piece.angle += (target.angle - piece.angle) * (settleRate * 0.72);
        piece.vx *= 0.9;
        piece.vy *= 0.9;
        piece.va *= 0.84;
        if (Math.abs(target.x - piece.x) < 0.45 && Math.abs(target.y - piece.y) < 0.45 && Math.abs(target.angle - piece.angle) < 0.18) {
          piece.sleeping = true;
          piece.x = target.x;
          piece.y = target.y;
          piece.angle = target.angle;
          piece.vx = 0;
          piece.vy = 0;
          piece.va = 0;
        }
      }

      setPieceTransform(piece);
    });

    collideLetters(dt, restTargets);
    pieces.forEach((piece) => {
      const minY = piece.type === "figure" ? -piece.height * 1.35 : 0;
      piece.x = clamp(piece.x, sidePadding, Math.max(sidePadding, window.innerWidth - sidePadding - piece.width));
      piece.y = clamp(piece.y, minY, Math.max(minY, floor - piece.height));
      setPieceTransform(piece);
    });

    const returningFromRel = document.body.classList.contains("is-returning-from-rel");
    const photoEffectDelay = returningFromRel ? 1180 : 520;
    photoEffectsReady = time - physicsStartedAt >= photoEffectDelay;

    const letterPieces = pieces.filter((piece) => piece.type === "letter");
    const reunionDistance = isMobile() ? 11 : 14;
    const reunionSpeed = isMobile() ? 0.48 : 0.56;
    const reunionReady = shouldSettle
      && restTargets.size === letterPieces.length
      && letterPieces.every((piece) => {
        const target = restTargets.get(piece);
        return target
          && Math.hypot(target.x - piece.x, target.y - piece.y) < reunionDistance
          && Math.abs(piece.vx) + Math.abs(piece.vy) < reunionSpeed;
      });
    if (!reunionReady) {
      reunionStableSince = 0;
      if (time >= reunionCooldownUntil && !reunionEndsAt) reunionArmed = true;
    } else if (!reunionStableSince) {
      reunionStableSince = time;
    } else if (reunionArmed && !reunionEndsAt && time - reunionStableSince > 420) {
      reunionArmed = false;
      reunionEndsAt = time + 920;
      document.body.classList.add("is-letter-reunion");
      reunionPhoto = getNearestCollider(colliders) || null;
      reunionPhoto?.classList.add("is-home-reunion");
    }
    if (reunionEndsAt && time >= reunionEndsAt) {
      clearReunionState();
      reunionEndsAt = 0;
      reunionStableSince = 0;
      reunionCooldownUntil = time + 1800;
      const midpoint = (letterPieces.length - 1) / 2;
      letterPieces.forEach((piece, index) => {
        piece.sleeping = false;
        piece.vx += (index - midpoint) * (isMobile() ? 0.16 : 0.2) + motionInfluence.x * 0.22;
        piece.vy -= isMobile() ? 0.42 : 0.5;
        piece.va += (index - midpoint) * 0.012;
      });
    }

    if (photoEffectsReady) setActiveItem(touchedItem || getNearestCollider(colliders), colliders);
    else clearStates();
    frame = scheduleFrame(tick);
  };

  const startPhysics = () => {
    if (started || !letters.length) return;
    started = true;
    const midpoint = (letters.length - 1) / 2;
    const letterPieces = letters.map((letter, index) => {
      const rect = letter.getBoundingClientRect();
      const offset = index - midpoint;
      return {
        type: "letter",
        settles: true,
        mass: 0.94 + Math.random() * 0.16,
        rebound: 0.92 + Math.random() * 0.22,
        wanderSeed: Math.random() * Math.PI * 2,
        glyph: letter.textContent.trim().toLowerCase(),
        el: letter,
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
        vx: offset * (isMobile() ? 0.28 : 0.42) + (Math.random() - 0.5) * (isMobile() ? 0.18 : 0.28),
        vy: -0.28 + Math.abs(offset) * 0.07 + Math.random() * 0.12,
        angle: 0,
        va: offset * (isMobile() ? 0.045 : 0.065) + (Math.random() - 0.5) * (isMobile() ? 0.03 : 0.04),
        restAngle: offset * (isMobile() ? 2.1 : 2.8) + (Math.random() - 0.5) * (isMobile() ? 1.1 : 1.4),
        floorHits: 0,
        onFloor: false,
        sleeping: false
      };
    });

    pieces = [...letterPieces];
    if (figure) {
      const rect = figure.getBoundingClientRect();
      const width = rect.width || Math.min(window.innerWidth * 0.28, 150);
      const height = rect.height || width * 1.57;
      const sidePadding = isMobile() ? 8 : 16;
      const figureHitbox = { left: 0.18, right: 0.18, top: 0.075, bottom: 0.025 };
      pieces.push({
        type: "figure",
        settles: false,
        mass: 1.18 + Math.random() * 0.22,
        rebound: 1.02 + Math.random() * 0.24,
        wanderSeed: Math.random() * Math.PI * 2,
        hitbox: figureHitbox,
        glyph: "figure",
        el: figure,
        x: getTopDropX(width, sidePadding, figureHitbox),
        y: -height - 32 - Math.random() * (isMobile() ? 96 : 150),
        width,
        height,
        vx: (Math.random() - 0.5) * (isMobile() ? 0.38 : 0.62),
        vy: 0.08 + Math.random() * 0.24,
        angle: (Math.random() - 0.5) * 10,
        va: (Math.random() - 0.5) * (isMobile() ? 0.055 : 0.075),
        restAngle: 0,
        floorHits: 0,
        onFloor: false,
        sleeping: false
      });
    }

    title.style.setProperty("--brand-shift-x", "0px");
    title.style.setProperty("--brand-shift-y", "0px");
    title.style.setProperty("--brand-tilt", "0deg");
    title.style.setProperty("--brand-scale", "1");
    pieces.forEach((piece) => {
      piece.angle = piece.angle || 0;
      setPieceTransform(piece);
    });

    document.body.classList.add("is-letter-gravity");
    syncPieceMetrics();
    lastTime = 0;
    physicsStartedAt = 0;
    photoEffectsReady = false;
    lastScrollMoveAt = 0;
    scrollLift = 0;
    lastScrollY = window.scrollY || document.documentElement.scrollTop || 0;
    frame = scheduleFrame(tick);
  };

  const waitForIntro = () => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      applyIdleState();
      return;
    }
    if (document.body.classList.contains("is-returning-from-rel")) {
      readyTimer = window.setTimeout(startPhysics, 360);
      return;
    }
    if (document.body.classList.contains("has-finished")) {
      readyTimer = window.setTimeout(startPhysics, 1250);
      return;
    }
    waitTimer = window.setTimeout(waitForIntro, 80);
  };

  const handleResize = () => {
    if (!started) return;
    syncPieceMetrics();
  };

  window.addEventListener("resize", handleResize);
  setupMotionAccess();
  waitForIntro();

  overviewInteractionCleanup = () => {
    if (frame) cancelFrame(frame);
    window.clearTimeout(readyTimer);
    window.clearTimeout(waitTimer);
    window.removeEventListener("resize", handleResize);
    window.removeEventListener("deviceorientation", handleDeviceOrientation, true);
    window.removeEventListener("devicemotion", handleDeviceMotion, true);
    window.removeEventListener("pointerdown", requestMotionAccess);
    window.removeEventListener("touchstart", requestMotionAccess);
    window.removeEventListener("touchend", requestMotionAccess);
    window.removeEventListener("click", requestMotionAccess);
    clearReunionState();
    applyIdleState();
  };
}

function isValidOverviewFlightRect(rect) {
  return rect
    && [rect.left, rect.top, rect.width, rect.height].every(Number.isFinite)
    && rect.width > 8
    && rect.height > 8;
}

function finishOverviewReturnTarget(target, overlay = null, onComplete = null) {
  if (!overlay) {
    target.classList.remove("is-return-flight-target", "is-return-target");
    onComplete?.();
    return;
  }
  target.classList.add("is-return-flight-handoff");
  target.classList.remove("is-return-flight-target", "is-return-target");
  requestAnimationFrame(() => {
    overlay.remove();
    requestAnimationFrame(() => {
      target.classList.remove("is-return-flight-handoff");
      onComplete?.();
    });
  });
}

function runOverviewReturnFlight(target, state) {
  const flight = state?.flight;
  const targetImage = target.querySelector("img");
  const sourceRect = flight?.sourceRect;
  const photoSrc = typeof flight?.photoSrc === "string" ? flight.photoSrc : "";
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  if (!targetImage || !photoSrc || !isValidOverviewFlightRect(sourceRect) || reducedMotion) {
    window.setTimeout(() => finishOverviewReturnTarget(target), reducedMotion ? 40 : 900);
    return;
  }

  const overlay = document.createElement("img");
  overlay.className = "overview-return-flight";
  overlay.alt = "";
  overlay.decoding = "async";
  overlay.src = photoSrc;
  overlay.setAttribute("aria-hidden", "true");
  document.body.appendChild(overlay);

  let finished = false;
  let started = false;
  let safetyTimer = 0;
  let loadTimer = 0;
  let scrollLocked = false;
  const lockedScrollY = window.scrollY || document.documentElement.scrollTop || 0;
  const preventScrollInput = (event) => event.preventDefault();
  const keepReturnScrollPosition = () => {
    const currentScrollY = window.scrollY || document.documentElement.scrollTop || 0;
    if (Math.abs(currentScrollY - lockedScrollY) > 0.5) {
      window.scrollTo({ top: lockedScrollY, left: 0, behavior: "auto" });
    }
  };
  const lockReturnScroll = () => {
    if (scrollLocked) return;
    scrollLocked = true;
    document.body.classList.add("is-return-flight-active");
    window.addEventListener("wheel", preventScrollInput, { passive: false, capture: true });
    window.addEventListener("touchmove", preventScrollInput, { passive: false, capture: true });
    window.addEventListener("scroll", keepReturnScrollPosition, { passive: true });
  };
  const unlockReturnScroll = () => {
    if (!scrollLocked) return;
    scrollLocked = false;
    document.body.classList.remove("is-return-flight-active");
    window.removeEventListener("wheel", preventScrollInput, true);
    window.removeEventListener("touchmove", preventScrollInput, true);
    window.removeEventListener("scroll", keepReturnScrollPosition);
  };
  const finish = () => {
    if (finished) return;
    finished = true;
    window.clearTimeout(safetyTimer);
    window.clearTimeout(loadTimer);
    finishOverviewReturnTarget(target, overlay, unlockReturnScroll);
  };
  const start = () => {
    if (started || finished) return;
    started = true;
    window.clearTimeout(loadTimer);
    const destination = targetImage.getBoundingClientRect();
    if (!isValidOverviewFlightRect(destination)) {
      finish();
      return;
    }
    const perspective = 1200;
    const depth = 540;
    const perspectiveCompensation = (perspective - depth) / perspective;
    const dx = (sourceRect.left - destination.left) * perspectiveCompensation;
    const dy = (sourceRect.top - destination.top) * perspectiveCompensation;
    const scaleX = sourceRect.width / destination.width * perspectiveCompensation;
    const scaleY = sourceRect.height / destination.height * perspectiveCompensation;
    overlay.style.left = `${destination.left}px`;
    overlay.style.top = `${destination.top}px`;
    overlay.style.width = `${destination.width}px`;
    overlay.style.height = `${destination.height}px`;
    overlay.style.setProperty("--return-flight-perspective", `${perspective}px`);
    overlay.style.setProperty("--return-flight-depth", `${depth}px`);
    overlay.style.setProperty("--return-flight-x", `${dx}px`);
    overlay.style.setProperty("--return-flight-y", `${dy}px`);
    overlay.style.setProperty("--return-flight-scale-x", scaleX.toFixed(5));
    overlay.style.setProperty("--return-flight-scale-y", scaleY.toFixed(5));
    lockReturnScroll();
    target.classList.add("is-return-flight-target");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (finished) return;
        overlay.classList.add("is-active");
        safetyTimer = window.setTimeout(finish, 1700);
      });
    });
  };
  overlay.addEventListener("animationend", finish, { once: true });
  overlay.addEventListener("animationcancel", finish, { once: true });
  const waitForImage = (image) => new Promise((resolve, reject) => {
    if (image.complete) {
      if (image.naturalWidth <= 0) {
        reject(new Error("image unavailable"));
        return;
      }
      if (typeof image.decode === "function") image.decode().then(resolve).catch(resolve);
      else resolve();
      return;
    }
    image.addEventListener("load", resolve, { once: true });
    image.addEventListener("error", reject, { once: true });
  });
  hydrateDeferredImage(targetImage);
  targetImage.loading = "eager";
  targetImage.fetchPriority = "high";
  target.classList.remove("is-return-target");
  Promise.all([waitForImage(overlay), waitForImage(targetImage)]).then(start).catch(finish);
  loadTimer = window.setTimeout(finish, 2400);
}
function startLoadingSequence() {
  if (document.body.classList.contains("is-returning-from-rel")) {
    document.body.classList.add("has-loaded", "has-finished");
    document.documentElement.classList.add("has-landed");
    return;
  }
  const finish = () => {
    document.body.classList.add("has-loaded");
    setTimeout(() => {
      document.body.classList.add("has-finished");
      document.documentElement.classList.add("has-landed");
    }, 1000);
  };
  setTimeout(() => {
    if (document.readyState === "complete") finish();
    else window.addEventListener("load", finish, { once: true });
  }, 300);
}

function renderWork() {
  const board = document.querySelector("[data-work-items]");
  if (!board) return;
  const count = document.querySelector("[data-work-count]");
  if (count) count.textContent = String(photos.length);
  const years = photos
    .map((photo) => String(photo.date || "").slice(0, 4))
    .filter((year) => /^\d{4}$/.test(year))
    .map(Number);
  const yearRange = document.querySelector("[data-work-years]");
  if (yearRange && years.length) {
    const firstYear = Math.min(...years);
    const lastYear = Math.max(...years);
    yearRange.textContent = firstYear === lastYear ? String(firstYear) : `${firstYear}-${lastYear}`;
  }
  const desktopSizes = ["42vw", "34vw", "26vw", "34vw", "42vw", "26vw", "58vw", "34vw", "26vw", "42vw", "26vw", "82vw"];
  const mobileSizes = ["calc(100vw - 3.2rem)", "calc(50vw - 2.2rem)", "calc(50vw - 2.2rem)", "82vw", "calc(50vw - 2.2rem)", "calc(50vw - 2.2rem)"];
  const tabletSizes = ["66vw", "32vw", "32vw", "66vw", "100vw", "50vw", "50vw", "82vw"];
  photos.forEach((photo, index) => {
    const item = document.createElement("a");
    item.className = "work-item";
    const photoRatio = Number(photo.width) > 0 && Number(photo.height) > 0
      ? Number(photo.width) / Number(photo.height)
      : 1.5;
    const isPanorama = photoRatio >= 2;
    if (isPanorama) item.classList.add("work-item--panorama");
    const rel = getPhotoRel(photo, index);
    item.href = `focus.html?rel=${rel}`;
    item.dataset.workRel = String(rel);
    item.style.setProperty("--delay", `${(index % 10) * 0.03}s`);
    const itemNumber = String(rel).padStart(2, "0");
    const category = String(photo.category || "ARCHIVE").trim() || "ARCHIVE";
    const year = String(photo.date || "2026").slice(0, 4) || "2026";
    const thumbSource = index < 4 ? `src="${photo.thumb}"` : `data-src="${photo.thumb}"`;
    const fullWidth = Math.max(480, Number(photo.width) || 1920);
    const responsiveSource = `${photo.thumb} 480w, ${photo.full} ${fullWidth}w`;
    const sourceSet = index < 4 ? `srcset="${responsiveSource}"` : `data-srcset="${responsiveSource}"`;
    const mobileSize = mobileSizes[index % mobileSizes.length];
    const tabletSize = isPanorama ? "100vw" : tabletSizes[index % tabletSizes.length];
    const desktopSize = isPanorama ? "82vw" : desktopSizes[index % desktopSizes.length];
    const gridSizes = `(min-width: 600px) and (max-width: 768px) ${tabletSize}, (max-width: 768px) ${mobileSize}, ${desktopSize}`;
    item.innerHTML = `
      <span class="work-item__image"><img ${thumbSource} ${sourceSet} sizes="${gridSizes}" data-grid-sizes="${gridSizes}" alt="${photo.alt}"${getPhotoImageSizeAttributes(photo, true)} loading="${index < 4 ? "eager" : "lazy"}" fetchpriority="${index < 2 ? "high" : "low"}" decoding="async"></span>
      <span class="work-item__text">
        <span class="work-item__index">${itemNumber}</span>
        <span class="work-item__name">${photo.title}</span>
        <span class="work-item__meta"><span>${category}</span><span>${year}</span></span>
      </span>
    `;
    board.appendChild(item);
  });
  const deferredObserver = createDeferredImageObserver("720px");
  observeDeferredImages(board, deferredObserver);

  document.querySelectorAll("[data-work-view]").forEach((button) => {
    button.addEventListener("click", () => setWorkView(button.dataset.workView));
  });
  setWorkView(new URLSearchParams(window.location.search).get("view") || "grid");
}

function setWorkView(view) {
  const next = view === "list" ? "list" : "grid";
  document.body.setAttribute("data-view", next);
  document.querySelectorAll(".work-item img").forEach((image) => {
    image.sizes = next === "list"
      ? "(max-width: 768px) 7.2rem, min(36vw, 52rem)"
      : image.dataset.gridSizes || "100vw";
  });
  document.querySelectorAll("[data-work-view]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.workView === next);
    button.setAttribute("aria-pressed", String(button.dataset.workView === next));
  });
  const url = new URL(window.location.href);
  if (next === "list") url.searchParams.set("view", "list");
  else url.searchParams.delete("view");
  window.history.replaceState({}, "", url.pathname + url.search);
}

function renderFocus() {
  const shell = document.querySelector("[data-focus-shell]");
  const title = document.querySelector("[data-focus-title]");
  const thumbs = document.querySelector("[data-focus-thumbs]");
  let image = document.querySelector("[data-focus-image]");
  const caption = document.querySelector("[data-focus-caption]");
  const noteText = document.querySelector("[data-focus-note-text]");
  const noteLocation = document.querySelector("[data-focus-note-location]");
  const notesBackground = document.querySelector("[data-focus-notes-background]");
  const imageToggle = document.querySelector("[data-focus-image-toggle]");
  const focusMain = document.querySelector("[data-focus-main]");
  const indexToggle = document.querySelector("[data-focus-index]");
  const navToggle = document.querySelector(".js-nav-toggle");
  const backLink = document.querySelector(".js-back");
  if (!shell || !title || !thumbs || !image || !caption || !imageToggle || !focusMain) return;
  let mobileRailMaxOffset = 0;
  let focusSyncHoldUntil = 0;
  let focusTouchStartX = 0;
  let focusTouchStartY = 0;
  let focusTouchLastX = 0;
  let focusTouchMode = "";
  let focusMainTouchStartX = 0;
  let focusMainTouchStartY = 0;
  let focusMainTouchLastX = 0;
  let focusMainTouchLastY = 0;
  let focusMainTouchLastMoveAt = 0;
  let focusMainTouchVelocityX = 0;
  let focusMainTouchMode = "";
  let focusMainTouchMoved = false;
  let focusMainTouchPreventClickUntil = 0;
  let focusMainTouchBaseOffset = 0;
  let focusMainTouchContinuationDirection = 0;
  let focusMainTouchGestureDirection = 0;
  let focusIndexTouchStartX = 0;
  let focusIndexTouchStartY = 0;
  let focusIndexTouchLastY = 0;
  let focusIndexTouchLastMoveAt = 0;
  let focusIndexTouchVelocityY = 0;
  let focusIndexTouchMoved = false;
  let focusIndexTouchPreventClickUntil = 0;
  let focusIndexTouchMode = "";
  let focusIndexMomentumFrame = 0;
  let focusLastNavigationDirection = 1;
  const focusMainSwipe = {
    active: false,
    animating: false,
    frame: 0,
    offset: 0,
    extent: 1,
    travel: 1,
    progress: 0,
    axis: "x",
    direction: 0,
    fromIndex: 0,
    targetIndex: 0,
    startedAt: 0,
    fromOffset: 0,
    toOffset: 0,
    commit: false,
    edge: false,
    chained: false,
    handoffPending: false,
    railAxis: "",
    railFrom: 0,
    railTo: 0,
    railReady: false
  };
  let focusQueuedSwipe = null;
  let focusMainSwipeClearSequence = 0;
  const focusShiftPositions = new Map();
  const focusFollowRate = 0.08;
  let focusSwitchSequence = 0;
  let focusSwitchTimer = 0;
  let focusSwitchHandoffTimer = 0;
  let focusIndexTransitionTimer = 0;
  let focusRailScrollFrame = 0;
  let focusRailSyncFrame = 0;
  let focusRailSyncUntil = 0;
  let focusRailThumbMetrics = [];
  let focusIndexPreparedIndex = -1;
  let focusIndexIdleWarmTimer = 0;
  let focusIndexPreparedRect = null;
  let focusIndexPreparedViewportWidth = 0;
  let focusIndexPreparedViewportHeight = 0;
  let focusManualSelectionIndex = null;
  let focusManualSelectionTimer = 0;
  let focusSwipeSyncTimer = 0;
  let focusMainSwipeLockUntil = 0;
  let focusNoteCopyTransitionTimer = 0;
  let focusNotesTransitionTimer = 0;
  let focusNotesPaletteTimer = 0;
  let focusIndexReturnSettleTimer = 0;
  const focusPhotoRatios = new Map();
  const focusImagePreloadCache = new Map();
  const rel = Number(new URLSearchParams(window.location.search).get("rel"));
  const initial = Number.isFinite(rel) && rel > 0 ? Math.min(rel - 1, photos.length - 1) : 0;
  const focusIndexState = {
    mode: "rel",
    phase: "idle",
    returnMode: "rel",
    activeIndex: initial,
    runId: 0,
    imageAnimation: null,
    cardAnimations: [],
    cardMotionFrames: new Map(),
    cardMotionIndex: initial,
    cardMotionEndTime: 0,
    cardMotionViewportWidth: 0,
    cardMotionViewportHeight: 0,
    returnBoxRect: null,
    returnImageRect: null,
    returnImageIndex: initial,
    returnViewportWidth: 0,
    returnViewportHeight: 0,
    pendingSelection: null,
    resizeFrame: 0,
    loadFrame: 0,
    savedScrollY: 0,
    savedBodyTop: "",
    savedBodyPosition: "",
    savedBodyWidth: "",
    savedBodyOverflow: "",
    savedBodyPaddingRight: ""
  };
  const indexEnabled = Boolean(indexToggle);
  const indexGallery = indexEnabled ? document.createElement("section") : null;
  if (indexGallery) {
    indexGallery.className = "focus-index-gallery";
    indexGallery.dataset.focusIndexGallery = "";
    indexGallery.setAttribute("aria-label", "Photo index gallery");
    indexGallery?.setAttribute("aria-hidden", "true");
    shell.insertBefore(indexGallery, shell.querySelector(".focus-actions"));
  }
  image.loading = "eager";
  image.fetchPriority = "high";
  photos.forEach((photo, index) => {
    if (photo.width > 0 && photo.height > 0) focusPhotoRatios.set(index, photo.width / photo.height);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "focus-thumb";
    button.dataset.index = String(index + 1);
    button.style.setProperty("--delay", `${Math.min(index, 24) * 0.018}s`);
    const prioritizeThumb = Math.abs(index - initial) <= 2;
    const thumbSource = prioritizeThumb ? `src="${photo.thumb}"` : `data-src="${photo.thumb}"`;
    button.innerHTML = `<span class="focus-thumb__media"><img ${thumbSource} alt="${photo.alt}"${getPhotoImageSizeAttributes(photo, true)} loading="${prioritizeThumb ? "eager" : "lazy"}" fetchpriority="${index === initial ? "high" : "low"}" decoding="async"></span>`;
    const thumbImage = button.querySelector("img");
    thumbImage?.addEventListener("load", () => rememberFocusPhotoRatio(index, thumbImage), { once: true });
    if (thumbImage?.complete) requestAnimationFrame(() => rememberFocusPhotoRatio(index, thumbImage));
    button.addEventListener("click", () => {
      if (shell.classList.contains("is-index")) return;
      setNotesOpen(false);
      setFocus(index, true, { source: "thumb" });
      glideFocusRailAfterThumbClick(index);
    });
    thumbs.appendChild(button);

    if (indexGallery) {
      const indexButton = document.createElement("button");
      indexButton.type = "button";
      indexButton.className = "focus-index-card";
      indexButton.dataset.index = String(index + 1);
      indexButton.style.setProperty("--delay", `${Math.min(index, 28) * 0.012}s`);
      if (photo.width > 0 && photo.height > 0) {
        const indexRatio = photo.width / photo.height;
        indexButton.style.setProperty("--focus-index-ratio", indexRatio.toFixed(5));
        indexButton.style.setProperty("--focus-index-mobile-width", `${(indexRatio * 8).toFixed(3)}rem`);
      }
      const prewarmIndexThumb = Math.abs(index - initial) <= 4;
      const indexThumbSource = prewarmIndexThumb ? `src="${photo.thumb}"` : "";
      indexButton.innerHTML = `<span class="focus-index-card__media"><img ${indexThumbSource} data-focus-index-full="${photo.full}" data-focus-index-thumb="${photo.thumb}" alt="${photo.alt}"${getPhotoImageSizeAttributes(photo)} loading="${prewarmIndexThumb ? "eager" : "lazy"}" fetchpriority="low" decoding="async"></span>`;
      const indexImage = indexButton.querySelector("img");
      indexImage?.addEventListener("load", () => rememberFocusPhotoRatio(index, indexImage), { once: true });
      if (indexImage?.complete) requestAnimationFrame(() => rememberFocusPhotoRatio(index, indexImage));
      indexButton.addEventListener("click", () => {
        if (Date.now() < focusIndexTouchPreventClickUntil) return;
        selectFocusIndexCard(index);
      });
      indexGallery.appendChild(indexButton);
    }
  });

  const hydrateFocusThumbRange = (centerIndex, radius = 2) => {
    const start = Math.max(0, centerIndex - radius);
    const end = Math.min(photos.length - 1, centerIndex + radius);
    for (let index = start; index <= end; index++) {
      hydrateDeferredImage(thumbs.querySelector(`.focus-thumb[data-index="${index + 1}"] img`));
    }
  };
  const deferredThumbImages = [...thumbs.querySelectorAll("img[data-src]")];
  if ("IntersectionObserver" in window) {
    const thumbObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        hydrateDeferredImage(entry.target);
        thumbObserver.unobserve(entry.target);
      });
    }, { root: null, rootMargin: "320px", threshold: 0.01 });
    deferredThumbImages.forEach((thumbImage) => thumbObserver.observe(thumbImage));
  } else {
    deferredThumbImages.forEach(hydrateDeferredImage);
  }
  indexGallery?.addEventListener("scroll", () => {
    resetFocusIndexHorizontalOffset();
    scheduleFocusIndexImageWindow();
  }, { passive: true });
  indexGallery?.addEventListener("wheel", (event) => event.stopPropagation(), { passive: true });
  indexGallery?.addEventListener("touchstart", handleFocusIndexTouchStart, { passive: true });
  indexGallery?.addEventListener("touchmove", handleFocusIndexTouchMove, { passive: false });
  indexGallery?.addEventListener("touchend", handleFocusIndexTouchEnd, { passive: true });
  indexGallery?.addEventListener("touchcancel", handleFocusIndexTouchCancel, { passive: true });

  indexToggle?.addEventListener("pointerdown", () => {
    if (focusIndexState.mode === "index" || focusIndexState.phase !== "idle" || shell.classList.contains("is-index")) return;
    const activeIndex = Number(shell.dataset.activeIndex || 0);
    if (focusIndexPreparedIndex !== activeIndex) warmFocusIndexCardThumbs(activeIndex);
  }, { passive: true });

  if (indexGallery && window.innerWidth <= 768) {
    const scheduleWarmup = () => {
      const warmup = () => warmFocusIndexCardThumbs(Number(shell.dataset.activeIndex || 0));
      if ("requestIdleCallback" in window) window.requestIdleCallback(warmup, { timeout: 1800 });
      else window.setTimeout(warmup, 900);
    };
    if (document.readyState === "complete") scheduleWarmup();
    else window.addEventListener("load", scheduleWarmup, { once: true });
  }

  indexToggle?.addEventListener("click", () => {
    if (!indexEnabled) return;
    const activeIndex = Number(shell.dataset.activeIndex || 0);
    if (focusIndexState.phase === "closing") {
      openFocusIndex(focusIndexState.activeIndex);
      return;
    }
    if (focusIndexState.mode === "index" || focusIndexState.phase === "opening") {
      closeFocusIndex(focusIndexState.activeIndex, { restoreNotes: focusIndexState.returnMode === "notes" });
      return;
    }
    openFocusIndex(activeIndex);
  });
  imageToggle.addEventListener("click", () => {
    if (Date.now() < focusMainTouchPreventClickUntil) return;
    setNotesOpen(!shell.classList.contains("is-notes"));
  });
  navToggle?.addEventListener("click", (event) => {
    if (!shell.classList.contains("is-notes")) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    setNotesOpen(false);
  }, true);

  backLink?.addEventListener("click", (event) => {
    event.preventDefault();
    cancelFocusImageSwitch({ restoreVisualSelection: true });
    const activeIndex = Number(shell.dataset.activeIndex || 0);
    const activeRel = activeIndex + 1;
    if (focusIndexState.mode === "index" || focusIndexState.phase !== "idle" || shell.classList.contains("is-index")) {
      closeFocusIndex(focusIndexState.activeIndex, { restoreNotes: focusIndexState.returnMode === "notes" });
      return;
    }
    try {
      const existing = JSON.parse(sessionStorage.getItem(OVERVIEW_RETURN_STORAGE_KEY) || "null") || {};
      const activePhoto = photos[activeIndex] || photos[0];
      const sourceRect = getFocusImageContentRect();
      sessionStorage.setItem(OVERVIEW_RETURN_STORAGE_KEY, JSON.stringify({
        rel: activeRel,
        scrollY: Number(existing.scrollY || 0),
        createdAt: Date.now(),
        order: Array.isArray(existing.order) ? existing.order : undefined,
        flight: activePhoto && sourceRect ? {
          photoSrc: activePhoto.full,
          sourceRect,
          axis: window.innerWidth <= 768 ? "x" : "y",
          direction: focusLastNavigationDirection
        } : undefined
      }));
    } catch (error) {
      returnFocusToOverview(activeRel, true);
      return;
    }
    document.body.classList.add("is-focus-leaving");
    window.setTimeout(() => returnFocusToOverview(activeRel, true), 360);
  });
  window.addEventListener("wheel", () => {
    clearFocusManualSelection();
    if (!isFocusMainSwipeBusy()) cancelFocusRailScroll();
  }, { passive: true });
  thumbs.addEventListener("scroll", () => scheduleFocusRailSync(220), { passive: true });
  window.addEventListener("scroll", () => {
    if (window.innerWidth > 768) scheduleFocusRailSync(220);
  }, { passive: true });
  thumbs.addEventListener("touchstart", handleFocusTouchStart, { passive: true });
  thumbs.addEventListener("touchmove", handleFocusTouchMove, { passive: false });
  imageToggle.addEventListener("touchstart", handleFocusMainTouchStart, { passive: true });
  imageToggle.addEventListener("touchmove", handleFocusMainTouchMove, { passive: false });
  imageToggle.addEventListener("touchend", handleFocusMainTouchEnd, { passive: true });
  imageToggle.addEventListener("touchcancel", handleFocusMainTouchCancel, { passive: true });
  ensureFocusMainSwipeLayer();
  thumbs.addEventListener("wheel", handleFocusWheel, { passive: false });
  window.addEventListener("keydown", (event) => {
    const current = Number(shell.dataset.activeIndex || 0);
    if (focusIndexState.mode === "index" || focusIndexState.phase !== "idle" || shell.classList.contains("is-index")) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeFocusIndex(focusIndexState.activeIndex, { restoreNotes: focusIndexState.returnMode === "notes" });
      }
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      clearFocusManualSelection();
      const next = (current + 1) % photos.length;
      setFocus(next, true);
      scrollToFocusIndex(next, true);
    }
    if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      clearFocusManualSelection();
      const next = (current - 1 + photos.length) % photos.length;
      setFocus(next, true);
      scrollToFocusIndex(next, true);
    }
    if (event.key === "Escape" && shell.classList.contains("is-notes")) {
      event.preventDefault();
      setNotesOpen(false);
    }
  });
  focusInitialLockUntil = Date.now() + 1800;
  setFocus(initial, false);
  thumbs.querySelectorAll("img").forEach((thumbImage) => {
    thumbImage.addEventListener("load", () => {
      updateFocusRailMetrics();
      updateMobileFocusRail();
      if (Date.now() < focusInitialLockUntil) scrollToFocusIndex(initial, false);
      scheduleFocusRailSync(320);
    }, { once: true });
  });
  requestAnimationFrame(() => {
    updateFocusRailMetrics();
    updateMobileFocusRail();
    scrollToFocusIndex(initial, false);
    window.setTimeout(() => scrollToFocusIndex(initial, false), 520);
    scheduleFocusRailSync(720);
  });
  window.addEventListener("resize", () => {
    updateFocusRailMetrics();
    updateMobileFocusRail();
    scheduleFocusRailSync(420);
    scheduleNotesLayoutUpdate();
    if (focusIndexState.mode === "index" || focusIndexState.phase !== "idle") {
      scheduleFocusIndexResize();
    } else {
      const activeIndex = Number(shell.dataset.activeIndex || initial);
      focusIndexPreparedIndex = -1;
      focusIndexPreparedRect = null;
      scrollToFocusIndex(activeIndex, false);
      scheduleFocusIndexCardWarmup(activeIndex, 260);
    }
  });
  window.addEventListener("l4rxx:languagechange", () => {
    const active = Number(shell.dataset.activeIndex || initial);
    const activePhoto = photos[active] || photos[0];
    transitionFocusNoteCopy(() => {
      updateFocusNoteContent(activePhoto);
    });
  });


  function getFocusRect(node) {
    const rect = node?.getBoundingClientRect?.();
    if (!rect || rect.width <= 0 || rect.height <= 0) return null;
    return {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height
    };
  }

  function getFocusImageContentRect() {
    const rect = getFocusRect(image);
    if (!rect || !image.naturalWidth || !image.naturalHeight) return getFocusRect(imageToggle) || rect;
    const imageRatio = image.naturalWidth / image.naturalHeight;
    const boxRatio = rect.width / rect.height;
    if (imageRatio > boxRatio) {
      const height = rect.width / imageRatio;
      return {
        left: rect.left,
        top: rect.top + (rect.height - height) / 2,
        width: rect.width,
        height
      };
    }
    const width = rect.height * imageRatio;
    return {
      left: rect.left + (rect.width - width) / 2,
      top: rect.top,
      width,
      height: rect.height
    };
  }

  function getContentRectWithin(boxRect, ratio) {
    if (!boxRect || !ratio || !Number.isFinite(ratio)) return boxRect;
    const boxRatio = boxRect.width / boxRect.height;
    if (ratio > boxRatio) {
      const height = boxRect.width / ratio;
      return {
        left: boxRect.left,
        top: boxRect.top + (boxRect.height - height) / 2,
        width: boxRect.width,
        height
      };
    }
    const width = boxRect.height * ratio;
    return {
      left: boxRect.left + (boxRect.width - width) / 2,
      top: boxRect.top,
      width,
      height: boxRect.height
    };
  }

  function normalizeFocusTravelRect(rect, ratio) {
    if (!rect || !ratio || !Number.isFinite(ratio)) return rect;
    return getContentRectWithin(rect, ratio);
  }

  function getImageElementRatio(img) {
    if (!img) return null;
    if (img.naturalWidth > 0 && img.naturalHeight > 0) return img.naturalWidth / img.naturalHeight;
    return null;
  }

  function getRectRatio(rect) {
    return rect && rect.width > 0 && rect.height > 0 ? rect.width / rect.height : null;
  }

  function rememberFocusPhotoRatio(index, img) {
    const ratio = getImageElementRatio(img) || getRectRatio(getFocusRect(img));
    if (ratio && Number.isFinite(ratio)) focusPhotoRatios.set(index, ratio);
  }

  function getFocusPhotoRatio(index, fallbackRect) {
    const galleryImage = getFocusIndexCardByIndex(index)?.querySelector("img");
    const galleryRatio = getImageElementRatio(galleryImage);
    if (galleryRatio) {
      focusPhotoRatios.set(index, galleryRatio);
      return galleryRatio;
    }
    const cachedRatio = focusPhotoRatios.get(index);
    if (cachedRatio) return cachedRatio;
    const photo = photos[index];
    if (photo?.width > 0 && photo?.height > 0) {
      const ratio = photo.width / photo.height;
      focusPhotoRatios.set(index, ratio);
      return ratio;
    }
    return getRectRatio(fallbackRect) || getImageElementRatio(image) || getRectRatio(getFocusRect(image)) || 1;
  }

  function getCssPixelValue(node, name, fallback = 0) {
    const value = getComputedStyle(node).getPropertyValue(name).trim();
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function getCssLengthValue(node, name, fallback = 0) {
    if (!node) return fallback;
    const value = getComputedStyle(node).getPropertyValue(name).trim();
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed) && value.endsWith("px")) return parsed;
    const probe = document.createElement("span");
    probe.style.position = "absolute";
    probe.style.visibility = "hidden";
    probe.style.pointerEvents = "none";
    probe.style.width = `var(${name})`;
    node.appendChild(probe);
    const width = probe.getBoundingClientRect().width;
    probe.remove();
    return Number.isFinite(width) && width > 0 ? width : fallback;
  }

  function getCssNumberValue(node, name, fallback = 1) {
    const value = getComputedStyle(node).getPropertyValue(name).trim();
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function getElementTranslateY(node) {
    if (!node) return 0;
    const transform = getComputedStyle(node).transform;
    if (!transform || transform === "none") return 0;
    try {
      return new DOMMatrixReadOnly(transform).m42 || 0;
    } catch (error) {
      const matrix = transform.match(/matrix\(([^)]+)\)/);
      if (!matrix) return 0;
      const values = matrix[1].split(",").map((item) => Number.parseFloat(item.trim()));
      return Number.isFinite(values[5]) ? values[5] : 0;
    }
  }


  function scaleRectFromCenter(rect, scale) {
    if (!rect || !Number.isFinite(scale)) return rect;
    const width = rect.width * scale;
    const height = rect.height * scale;
    return {
      left: rect.left + (rect.width - width) / 2,
      top: rect.top + (rect.height - height) / 2,
      width,
      height
    };
  }

  function measureFocusMainBaseRect() {
    if (!focusMain) return null;
    const measure = document.createElement(focusMain.tagName?.toLowerCase() || "figure");
    measure.className = "focus-main is-measuring-base";
    measure.setAttribute("aria-hidden", "true");
    measure.style.visibility = "hidden";
    measure.style.opacity = "0";
    measure.style.pointerEvents = "none";
    measure.style.transition = "none";
    measure.style.filter = "none";
    measure.style.zIndex = "-1";
    (shell || document.body).appendChild(measure);
    const rect = getFocusRect(measure);
    measure.remove();
    return rect;
  }

  function getFocusMainTargetRect(options = {}) {
    if (options.notes) updateNotesLayout();
    let rect = measureFocusMainBaseRect() || getFocusRect(imageToggle) || getFocusRect(image);
    if (!rect) return null;
    if (options.notes) {
      const shiftX = getCssPixelValue(shell, "--notes-photo-shift-x", 0);
      const shiftY = getCssPixelValue(shell, "--notes-photo-shift-y", 0);
      const notesScale = getCssNumberValue(shell, "--notes-photo-scale", 1);
      rect = scaleRectFromCenter({
        left: rect.left + shiftX,
        top: rect.top + shiftY,
        width: rect.width,
        height: rect.height
      }, notesScale);
    }
    return rect;
  }

  function getFocusImageContentRectForPhoto(photo, index, options = {}) {
    const box = getFocusMainTargetRect({ notes: Boolean(options.notes) }) || getFocusRect(image) || getFocusRect(imageToggle);
    const ratio = getFocusPhotoRatio(index, options.sourceRect);
    if (!box || !ratio) return box;
    return getContentRectWithin(box, ratio);
  }

  function copyFocusRect(rect) {
    if (!rect) return null;
    return {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height
    };
  }

  function measureUnlockedFocusMainTargetRect(notes) {
    const body = document.body;
    const locked = body.classList.contains("focus-index-scroll-lock");
    if (!locked) return getFocusMainTargetRect({ notes });
    const lockedStyles = {
      top: body.style.top,
      position: body.style.position,
      width: body.style.width,
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight
    };
    body.classList.remove("focus-index-scroll-lock");
    body.style.top = focusIndexState.savedBodyTop;
    body.style.position = focusIndexState.savedBodyPosition;
    body.style.width = focusIndexState.savedBodyWidth;
    body.style.overflow = focusIndexState.savedBodyOverflow;
    body.style.paddingRight = focusIndexState.savedBodyPaddingRight;
    const rect = getFocusMainTargetRect({ notes });
    body.classList.add("focus-index-scroll-lock");
    body.style.top = lockedStyles.top;
    body.style.position = lockedStyles.position;
    body.style.width = lockedStyles.width;
    body.style.overflow = lockedStyles.overflow;
    body.style.paddingRight = lockedStyles.paddingRight;
    return rect;
  }

  function getFocusIndexReturnRect(index, sourceRect, restoreNotes) {
    const sameViewport = focusIndexState.returnViewportWidth === window.innerWidth
      && focusIndexState.returnViewportHeight === window.innerHeight;
    if (sameViewport && index === focusIndexState.returnImageIndex && focusIndexState.returnImageRect) {
      return copyFocusRect(focusIndexState.returnImageRect);
    }
    const box = sameViewport
      ? focusIndexState.returnBoxRect
      : measureUnlockedFocusMainTargetRect(restoreNotes);
    const ratio = getFocusPhotoRatio(index, sourceRect);
    if (box && ratio) return getContentRectWithin(box, ratio);
    return getFocusImageContentRectForPhoto(photos[index], index, {
      notes: restoreNotes,
      sourceRect
    });
  }

  function getFocusIndexCardByIndex(index) {
    return indexGallery?.querySelector(`.focus-index-card[data-index="${index + 1}"]`) || null;
  }

  function getFocusIndexCardRect(card) {
    const media = card?.querySelector(".focus-index-card__media");
    return getFocusRect(media) || getFocusRect(card?.querySelector("img")) || getFocusRect(card);
  }

  function getFocusImageAbsoluteUrl(src) {
    if (!src) return "";
    try {
      return new URL(src, window.location.href).href;
    } catch (error) {
      return src;
    }
  }

  function setFocusIndexGalleryActive(index) {
    if (!indexGallery) return;
    indexGallery.querySelectorAll(".focus-index-card").forEach((card, cardIndex) => {
      const active = cardIndex === index;
      card.classList.toggle("is-active", active);
      card.setAttribute("aria-current", active ? "true" : "false");
    });
  }

  function lockFocusIndexCardRatio(index) {
    const card = getFocusIndexCardByIndex(index);
    if (!card) return;
    rememberFocusPhotoRatio(index, image);
    const ratio = getFocusPhotoRatio(index);
    if (!ratio) return;
    card.style.setProperty("--focus-index-ratio", ratio.toFixed(5));
  }

  function positionFocusIndexGalleryOnActive(activeIndex) {
    if (!indexGallery) return null;
    const card = getFocusIndexCardByIndex(activeIndex);
    if (!card) return null;
    lockFocusIndexCardRatio(activeIndex);
    indexGallery.scrollLeft = 0;
    const align = () => {
      const targetTop = card.offsetTop + card.offsetHeight / 2 - indexGallery.clientHeight / 2;
      const maxTop = Math.max(0, indexGallery.scrollHeight - indexGallery.clientHeight);
      indexGallery.scrollTop = Math.max(0, Math.min(targetTop, maxTop));
    };
    align();
    indexGallery.offsetHeight;
    align();
    scheduleFocusIndexImageWindow();
    return getFocusIndexCardRect(card);
  }

  function getBoundedFocusIndex(index) {
    return Math.max(0, Math.min(Number(index) || 0, photos.length - 1));
  }

  function isFocusIndexReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function prepareFocusIndexImage(node, index) {
    const photo = photos[index];
    if (!node || !photo) return node;
    node.dataset.focusIndexPhoto = String(index);
    node.dataset.focusIndexFull = photo.full;
    node.dataset.focusIndexThumb = photo.thumb;
    node.alt = photo.alt || "";
    node.decoding = "async";
    if (photo.width > 0 && photo.height > 0) {
      node.width = photo.width;
      node.height = photo.height;
    }
    return node;
  }

  function createFocusIndexCardImage(index) {
    const photo = photos[index];
    if (!photo) return null;
    const node = document.createElement("img");
    node.src = photo.thumb;
    node.loading = "lazy";
    node.fetchPriority = "low";
    return prepareFocusIndexImage(node, index);
  }

  function hydrateFocusIndexCardThumb(node, index, prioritize = false) {
    const photo = photos[index];
    if (!node || !photo?.thumb) return false;
    const thumb = getFocusImageAbsoluteUrl(photo.thumb);
    const current = getFocusImageAbsoluteUrl(node.currentSrc || node.getAttribute("src"));
    if (current && current !== thumb) return node.complete && node.naturalWidth > 0;
    const watchThumbAttempt = () => {
      if (node.dataset.focusIndexThumbWatching === thumb) return;
      node.dataset.focusIndexThumbWatching = thumb;
      const onLoad = () => {
        if (getFocusImageAbsoluteUrl(node.currentSrc || node.getAttribute("src")) !== thumb) return;
        delete node.dataset.focusIndexThumbWatching;
        node.dataset.focusIndexThumbAttempts = "0";
      };
      const onError = () => {
        if (getFocusImageAbsoluteUrl(node.currentSrc || node.getAttribute("src")) !== thumb) return;
        delete node.dataset.focusIndexThumbWatching;
        node.removeAttribute("src");
        if (Number(node.dataset.focusIndexThumbAttempts || 0) >= 3) return;
        window.setTimeout(() => {
          if (focusIndexState.mode === "index" || focusIndexState.phase === "opening") {
            scheduleFocusIndexImageWindow();
          }
        }, 160);
      };
      node.addEventListener("load", onLoad, { once: true });
      node.addEventListener("error", onError, { once: true });
    };
    if (current === thumb && node.complete && node.naturalWidth > 0) {
      node.dataset.focusIndexThumbAttempts = "0";
      return true;
    }
    if (current === thumb && !node.complete) {
      watchThumbAttempt();
      return false;
    }
    const attempts = Number(node.dataset.focusIndexThumbAttempts || 0);
    if (attempts >= 3) return false;
    node.loading = "eager";
    node.fetchPriority = prioritize ? "high" : "low";
    node.dataset.focusIndexThumbAttempts = String(attempts + 1);
    watchThumbAttempt();
    if (node.getAttribute("src")) node.removeAttribute("src");
    node.src = photo.thumb;
    return false;
  }

  function requestFocusIndexFullImage(node, index, prioritize = false) {
    const photo = photos[index];
    if (!node || !photo?.full) return;
    prepareFocusIndexImage(node, index);
    hydrateFocusIndexCardThumb(node, index, prioritize);
    const full = getFocusImageAbsoluteUrl(photo.full);
    const current = getFocusImageAbsoluteUrl(node.currentSrc || node.getAttribute("src"));
    const thumb = getFocusImageAbsoluteUrl(photo.thumb);
    if (current === thumb && (!node.complete || node.naturalWidth <= 0) && node.dataset.focusIndexThumbFailed !== thumb) {
      node.fetchPriority = prioritize ? "high" : "low";
      if (node.dataset.focusIndexWaitingForThumb === thumb) return;
      node.dataset.focusIndexWaitingForThumb = thumb;
      const resume = () => {
        if (node.dataset.focusIndexWaitingForThumb !== thumb) return;
        delete node.dataset.focusIndexWaitingForThumb;
        requestFocusIndexFullImage(node, index, prioritize);
      };
      const resumeAfterError = () => {
        node.dataset.focusIndexThumbFailed = thumb;
        resume();
      };
      node.addEventListener("load", resume, { once: true });
      node.addEventListener("error", resumeAfterError, { once: true });
      return;
    }
    if (current === full && node.complete && node.naturalWidth > 0) {
      if (node.decode) node.decode().catch(() => {}).then(() => node.style.removeProperty("background-image"));
      else node.style.removeProperty("background-image");
      return;
    }
    if (node.dataset.focusIndexLoading === full) return;
    node.dataset.focusIndexLoading = full;
    node.fetchPriority = prioritize ? "high" : "low";
    if (photo.thumb) node.style.backgroundImage = `url("${photo.thumb}")`;

    const finish = () => {
      if (node.dataset.focusIndexLoading !== full) return;
      delete node.dataset.focusIndexLoading;
      const clearFallback = () => node.style.removeProperty("background-image");
      if (node.decode) node.decode().then(clearFallback).catch(clearFallback);
      else clearFallback();
    };
    const fail = () => {
      if (node.dataset.focusIndexLoading !== full) return;
      delete node.dataset.focusIndexLoading;
      if (photo.thumb && getFocusImageAbsoluteUrl(node.getAttribute("src")) !== getFocusImageAbsoluteUrl(photo.thumb)) {
        node.src = photo.thumb;
      }
    };
    node.addEventListener("load", finish, { once: true });
    node.addEventListener("error", fail, { once: true });
    node.src = photo.full;
    if (node.complete && node.naturalWidth > 0) finish();
  }

  function hydrateFocusIndexVisibleThumbs(prioritizedIndex = focusIndexState.activeIndex) {
    if (!indexGallery) return;
    const galleryRect = getFocusRect(indexGallery);
    if (!galleryRect) return;
    const buffer = indexGallery.clientHeight * 0.25;
    const visibleTop = indexGallery.scrollTop - buffer;
    const visibleBottom = indexGallery.scrollTop + indexGallery.clientHeight + buffer;
    indexGallery.querySelectorAll(".focus-index-card img").forEach((node) => {
      const card = node.closest(".focus-index-card");
      if (!card) return;
      const cardTop = card.offsetTop;
      const cardBottom = cardTop + card.offsetHeight;
      if (cardBottom < visibleTop || cardTop > visibleBottom) return;
      const index = Number(card.dataset.index || 1) - 1;
      hydrateFocusIndexCardThumb(node, index, index === prioritizedIndex);
    });
  }

  function resetFocusIndexHorizontalOffset() {
    if (indexGallery && indexGallery.scrollLeft !== 0) indexGallery.scrollLeft = 0;
    if (document.documentElement.scrollLeft !== 0) document.documentElement.scrollLeft = 0;
    if (document.body.scrollLeft !== 0) document.body.scrollLeft = 0;
  }

  function cancelFocusIndexMomentum() {
    if (focusIndexMomentumFrame) cancelAnimationFrame(focusIndexMomentumFrame);
    focusIndexMomentumFrame = 0;
    focusIndexTouchVelocityY = 0;
  }

  function resetFocusIndexTouch() {
    focusIndexTouchStartX = 0;
    focusIndexTouchStartY = 0;
    focusIndexTouchLastY = 0;
    focusIndexTouchLastMoveAt = 0;
    focusIndexTouchVelocityY = 0;
    focusIndexTouchMoved = false;
    focusIndexTouchMode = "";
    resetFocusIndexHorizontalOffset();
  }

  function startFocusIndexMomentum(initialVelocity) {
    cancelFocusIndexMomentum();
    if (!indexGallery || Math.abs(initialVelocity) < 0.025) return;
    let velocity = Math.max(-2.2, Math.min(2.2, initialVelocity));
    let lastTime = performance.now();
    const step = (now) => {
      focusIndexMomentumFrame = 0;
      if (!indexGallery || focusIndexState.mode !== "index" || focusIndexState.phase !== "idle") return;
      const elapsed = Math.max(1, Math.min(32, now - lastTime));
      lastTime = now;
      const maxTop = Math.max(0, indexGallery.scrollHeight - indexGallery.clientHeight);
      const previousTop = indexGallery.scrollTop;
      const nextTop = Math.max(0, Math.min(maxTop, previousTop + velocity * elapsed));
      indexGallery.scrollTop = nextTop;
      resetFocusIndexHorizontalOffset();
      scheduleFocusIndexImageWindow();
      if (Math.abs(nextTop - previousTop) < 0.01 || nextTop <= 0 || nextTop >= maxTop) return;
      velocity *= Math.pow(0.92, elapsed / 16.67);
      if (Math.abs(velocity) < 0.025) return;
      focusIndexMomentumFrame = requestAnimationFrame(step);
    };
    focusIndexMomentumFrame = requestAnimationFrame(step);
  }

  function handleFocusIndexTouchStart(event) {
    if (window.innerWidth > 768 || focusIndexState.mode !== "index" || focusIndexState.phase !== "idle") return;
    if (event.touches.length !== 1) {
      cancelFocusIndexMomentum();
      resetFocusIndexTouch();
      focusIndexTouchMode = "multitouch";
      return;
    }
    cancelFocusIndexMomentum();
    const touch = event.touches[0];
    focusIndexTouchStartX = touch.clientX;
    focusIndexTouchStartY = touch.clientY;
    focusIndexTouchLastY = touch.clientY;
    focusIndexTouchLastMoveAt = event.timeStamp || performance.now();
    focusIndexTouchVelocityY = 0;
    focusIndexTouchMoved = false;
    focusIndexTouchMode = "";
    resetFocusIndexHorizontalOffset();
  }

  function handleFocusIndexTouchMove(event) {
    if (window.innerWidth > 768 || focusIndexState.mode !== "index" || focusIndexState.phase !== "idle") {
      resetFocusIndexTouch();
      return;
    }
    if (event.touches.length !== 1 || !focusIndexTouchLastMoveAt) return;
    const touch = event.touches[0];
    const deltaX = touch.clientX - focusIndexTouchStartX;
    const deltaY = touch.clientY - focusIndexTouchStartY;
    if (!focusIndexTouchMoved && Math.max(Math.abs(deltaX), Math.abs(deltaY)) <= 4) return;
    if (!focusIndexTouchMode) {
      focusIndexTouchMode = Math.abs(deltaY) >= Math.abs(deltaX) ? "vertical" : "horizontal";
    }
    if (event.cancelable) event.preventDefault();
    const eventTime = event.timeStamp || performance.now();
    const elapsed = Math.max(8, Math.min(40, eventTime - focusIndexTouchLastMoveAt || 16));
    const previousTop = indexGallery.scrollTop;
    const maxTop = Math.max(0, indexGallery.scrollHeight - indexGallery.clientHeight);
    const nextTop = Math.max(0, Math.min(maxTop, previousTop - (touch.clientY - focusIndexTouchLastY)));
    indexGallery.scrollTop = nextTop;
    const sampledVelocity = (nextTop - previousTop) / elapsed;
    focusIndexTouchVelocityY = focusIndexTouchVelocityY * 0.68 + sampledVelocity * 0.32;
    focusIndexTouchLastY = touch.clientY;
    focusIndexTouchLastMoveAt = eventTime;
    focusIndexTouchMoved = true;
    focusIndexTouchPreventClickUntil = Date.now() + 320;
    resetFocusIndexHorizontalOffset();
    scheduleFocusIndexImageWindow();
  }

  function handleFocusIndexTouchEnd() {
    const velocity = focusIndexTouchVelocityY;
    const shouldContinue = focusIndexState.mode === "index"
      && focusIndexState.phase === "idle"
      && focusIndexTouchMoved
      && Math.abs(velocity) >= 0.025;
    resetFocusIndexTouch();
    if (shouldContinue) startFocusIndexMomentum(velocity);
  }

  function handleFocusIndexTouchCancel() {
    cancelFocusIndexMomentum();
    resetFocusIndexTouch();
  }

  function hydrateFocusIndexImageWindow() {
    focusIndexState.loadFrame = 0;
    if (!indexGallery || (focusIndexState.mode !== "index" && focusIndexState.phase === "idle")) return;
    hydrateFocusIndexVisibleThumbs();
  }

  function warmFocusIndexCardThumbs(centerIndex) {
    if (!indexGallery) return;
    const boundedIndex = getBoundedFocusIndex(centerIndex);
    focusIndexPreparedRect = copyFocusRect(positionFocusIndexGalleryOnActive(boundedIndex));
    focusIndexPreparedViewportWidth = window.innerWidth;
    focusIndexPreparedViewportHeight = window.innerHeight;
    hydrateFocusIndexVisibleThumbs(boundedIndex);
    focusIndexPreparedIndex = boundedIndex;
  }

  function scheduleFocusIndexCardWarmup(index, delay = 420) {
    window.clearTimeout(focusIndexIdleWarmTimer);
    focusIndexIdleWarmTimer = window.setTimeout(() => {
      focusIndexIdleWarmTimer = 0;
      if (focusIndexState.phase !== "idle" || focusIndexState.mode === "index") return;
      if (Number(shell.dataset.activeIndex || 0) !== index) return;
      warmFocusIndexCardThumbs(index);
    }, delay);
  }

  function scheduleFocusIndexImageWindow() {
    if (focusIndexState.loadFrame) return;
    focusIndexState.loadFrame = requestAnimationFrame(hydrateFocusIndexImageWindow);
  }

  function lockFocusIndexPageScroll() {
    if (document.body.classList.contains("focus-index-scroll-lock")) return;
    const body = document.body;
    focusIndexState.savedScrollY = window.scrollY || document.documentElement.scrollTop || 0;
    focusIndexState.savedBodyTop = body.style.top;
    focusIndexState.savedBodyPosition = body.style.position;
    focusIndexState.savedBodyWidth = body.style.width;
    focusIndexState.savedBodyOverflow = body.style.overflow;
    focusIndexState.savedBodyPaddingRight = body.style.paddingRight;
    const scrollbarGap = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
    document.documentElement.classList.add("focus-index-scroll-lock");
    body.classList.add("focus-index-scroll-lock");
    body.style.position = "fixed";
    body.style.top = `${-focusIndexState.savedScrollY}px`;
    body.style.width = "100%";
    body.style.overflow = "hidden";
    if (scrollbarGap > 0) body.style.paddingRight = `${scrollbarGap}px`;
  }

  function unlockFocusIndexPageScroll() {
    const body = document.body;
    if (!body.classList.contains("focus-index-scroll-lock")) return;
    document.documentElement.classList.remove("focus-index-scroll-lock");
    body.classList.remove("focus-index-scroll-lock");
    body.style.top = focusIndexState.savedBodyTop;
    body.style.position = focusIndexState.savedBodyPosition;
    body.style.width = focusIndexState.savedBodyWidth;
    body.style.overflow = focusIndexState.savedBodyOverflow;
    body.style.paddingRight = focusIndexState.savedBodyPaddingRight;
    window.scrollTo({ top: focusIndexState.savedScrollY, left: 0, behavior: "auto" });
  }

  function clearFocusIndexCardMotionStyles(card) {
    if (!card) return;
    card.style.removeProperty("transform");
    card.style.removeProperty("opacity");
    card.style.removeProperty("filter");
    card.style.removeProperty("will-change");
  }

  function cancelFocusIndexCardAnimations(commit = false) {
    focusIndexState.cardAnimations.forEach(({ animation, card }) => {
      if (commit) {
        try {
          animation.commitStyles();
        } catch (error) {
          const style = getComputedStyle(card);
          card.style.transform = style.transform === "none" ? "none" : style.transform;
          card.style.opacity = style.opacity;
        }
      }
      animation.cancel();
    });
    focusIndexState.cardAnimations = [];
  }

  function getFocusIndexCardBaseRects(cards) {
    const snapshots = [];
    let resetTransforms = false;
    cards.forEach((card) => {
      const transform = card.style.getPropertyValue("transform");
      const priority = card.style.getPropertyPriority("transform");
      snapshots.push({ card, transform, priority });
      if (!transform || transform === "none") return;
      card.style.setProperty("transform", "none", "important");
      resetTransforms = true;
    });
    if (resetTransforms) indexGallery?.offsetHeight;
    const rects = new Map(cards.map((card) => [card, getFocusIndexCardRect(card)]));
    if (resetTransforms) {
      snapshots.forEach(({ card, transform, priority }) => {
        if (transform) card.style.setProperty("transform", transform, priority);
        else card.style.removeProperty("transform");
      });
    }
    return rects;
  }

  const focusIndexMotionCurve = window.innerWidth <= 768
    ? [.24, .64, .34, 1]
    : [.18, .82, .24, 1];
  const focusIndexMotionEasing = `cubic-bezier(${focusIndexMotionCurve.join(", ")})`;
  const focusIndexMotionSampleCount = window.innerWidth <= 768 ? 20 : 32;

  function getFocusIndexPrimaryDuration() {
    return 1080;
  }

  function getFocusIndexCardTiming(cardRect, anchorRect, totalDuration = getFocusIndexPrimaryDuration()) {
    const cardX = cardRect.left + cardRect.width / 2;
    const cardY = cardRect.top + cardRect.height / 2;
    const anchorX = anchorRect.left + anchorRect.width / 2;
    const anchorY = anchorRect.top + anchorRect.height / 2;
    const viewportDistance = Math.max(1, Math.hypot(window.innerWidth, window.innerHeight) * .58);
    const distanceRatio = Math.max(0, Math.min(1, Math.hypot(cardX - anchorX, cardY - anchorY) / viewportDistance));
    return {
      duration: Math.max(180, Math.round(totalDuration)),
      delay: 0,
      distanceRatio
    };
  }

  function getFocusIndexCubicProgress(progress) {
    const target = Math.max(0, Math.min(1, progress));
    const [x1, y1, x2, y2] = focusIndexMotionCurve;
    let low = 0;
    let high = 1;
    let parameter = target;
    for (let iteration = 0; iteration < 10; iteration += 1) {
      parameter = (low + high) / 2;
      const inverse = 1 - parameter;
      const x = 3 * inverse * inverse * parameter * x1
        + 3 * inverse * parameter * parameter * x2
        + parameter * parameter * parameter;
      if (x < target) low = parameter;
      else high = parameter;
    }
    const inverse = 1 - parameter;
    return 3 * inverse * inverse * parameter * y1
      + 3 * inverse * parameter * parameter * y2
      + parameter * parameter * parameter;
  }

  function getFocusIndexMotionRectForProgress(motion, progress) {
    const { spawn, cardRect } = motion;
    if (progress <= .01) return null;
    if (progress >= 1) return cardRect;
    const finalX = cardRect.left + cardRect.width / 2;
    const finalY = cardRect.top + cardRect.height / 2;
    const centerX = spawn.x + (finalX - spawn.x) * progress;
    const centerY = spawn.y + (finalY - spawn.y) * progress;
    const scale = spawn.scale + (1 - spawn.scale) * progress;
    const width = cardRect.width * scale;
    const height = cardRect.height * scale;
    return {
      left: centerX - width / 2,
      top: centerY - height / 2,
      width,
      height
    };
  }

  function getFocusIndexMainMotionRectForProgress(mainMotion, progress) {
    if (!mainMotion?.fromRect || !mainMotion?.toRect || mainMotion.duration <= 0) return null;
    return {
      left: mainMotion.fromRect.left + (mainMotion.toRect.left - mainMotion.fromRect.left) * progress,
      top: mainMotion.fromRect.top + (mainMotion.toRect.top - mainMotion.fromRect.top) * progress,
      width: mainMotion.fromRect.width + (mainMotion.toRect.width - mainMotion.fromRect.width) * progress,
      height: mainMotion.fromRect.height + (mainMotion.toRect.height - mainMotion.fromRect.height) * progress
    };
  }

  function focusIndexRectsOverlap(first, second, clearance = 2) {
    if (!first || !second) return false;
    return first.left < second.left + second.width + clearance
      && first.left + first.width + clearance > second.left
      && first.top < second.top + second.height + clearance
      && first.top + first.height + clearance > second.top;
  }

  function focusIndexRectTouchesViewport(rect) {
    return rect
      && rect.left < window.innerWidth
      && rect.left + rect.width > 0
      && rect.top < window.innerHeight
      && rect.top + rect.height > 0;
  }

  function getFocusIndexMotionLane(cardRect, anchorRect, index) {
    const cardX = cardRect.left + cardRect.width / 2;
    const cardY = cardRect.top + cardRect.height / 2;
    const anchorX = anchorRect.left + anchorRect.width / 2;
    const anchorY = anchorRect.top + anchorRect.height / 2;
    const dx = cardX - anchorX;
    const dy = cardY - anchorY;
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return index % 2 ? "right" : "left";
    if (Math.abs(dy) >= Math.abs(dx) * .72) return dy < 0 ? "top" : "bottom";
    return dx < 0 ? "left" : "right";
  }

  function setFocusIndexMotionSpawn(motion, offsetX, offsetY) {
    const cardX = motion.cardRect.left + motion.cardRect.width / 2;
    const cardY = motion.cardRect.top + motion.cardRect.height / 2;
    const scale = .58;
    motion.spawn = {
      x: cardX + offsetX,
      y: cardY + offsetY,
      scale,
      transform: `translate3d(${offsetX}px, ${offsetY}px, 0) scale(${scale})`,
      opacity: "0"
    };
    motion.travelDistance = Math.hypot(offsetX, offsetY);
  }

  function assignFocusIndexConcurrentLanes(motions, anchorRect) {
    const groups = { top: [], right: [], bottom: [], left: [] };
    motions.forEach((motion) => {
      motion.lane = getFocusIndexMotionLane(motion.cardRect, anchorRect, motion.visualIndex);
      groups[motion.lane].push(motion);
    });
    const overscan = window.innerWidth <= 768 ? 28 : 42;
    Object.entries(groups).forEach(([lane, group]) => {
      if (!group.length) return;
      const maxRight = Math.max(...group.map((motion) => motion.cardRect.left + motion.cardRect.width));
      const minLeft = Math.min(...group.map((motion) => motion.cardRect.left));
      const maxBottom = Math.max(...group.map((motion) => motion.cardRect.top + motion.cardRect.height));
      const minTop = Math.min(...group.map((motion) => motion.cardRect.top));
      let offsetX = 0;
      let offsetY = 0;
      if (lane === "top") offsetY = -maxBottom - overscan;
      if (lane === "bottom") offsetY = window.innerHeight + overscan - minTop;
      if (lane === "left") offsetX = -maxRight - overscan;
      if (lane === "right") offsetX = window.innerWidth + overscan - minLeft;
      group.forEach((motion) => setFocusIndexMotionSpawn(motion, offsetX, offsetY));
    });
  }

  function planFocusIndexConcurrentMotions(motions, mainMotion) {
    const totalDuration = Math.max(1, mainMotion?.duration || getFocusIndexPrimaryDuration());
    const ordered = [...motions].sort((first, second) => first.distance - second.distance);
    const sampleCount = focusIndexMotionSampleCount * 2;
    const progressSamples = Array.from({ length: sampleCount + 1 }, (_, sample) => (
      getFocusIndexCubicProgress(sample / sampleCount)
    ));
    const rectSamples = new Map(motions.map((motion) => [
      motion,
      progressSamples.map((progress) => getFocusIndexMotionRectForProgress(motion, progress))
    ]));
    const mainSamples = progressSamples.map((progress) => getFocusIndexMainMotionRectForProgress(mainMotion, progress));
    const visibleSamples = new Map(motions.map((motion) => [
      motion,
      rectSamples.get(motion).map((rect) => focusIndexRectTouchesViewport(rect))
    ]));
    const mainVisibleSamples = mainSamples.map((rect) => focusIndexRectTouchesViewport(rect));
    const planned = [];
    ordered.forEach((motion) => {
      let lastCollisionProgress = -1;
      const currentSamples = rectSamples.get(motion);
      for (let sample = 0; sample <= sampleCount; sample += 1) {
        const rawProgress = sample / sampleCount;
        const currentRect = currentSamples[sample];
        if (!visibleSamples.get(motion)[sample]) continue;
        const mainRect = mainSamples[sample];
        if (mainVisibleSamples[sample] && focusIndexRectsOverlap(currentRect, mainRect, 8)) {
          lastCollisionProgress = rawProgress;
          continue;
        }
        for (const previous of planned) {
          if (rawProgress + .001 < previous.revealStart) continue;
          const previousRect = rectSamples.get(previous)[sample];
          if (visibleSamples.get(previous)[sample] && focusIndexRectsOverlap(currentRect, previousRect, 8)) {
            lastCollisionProgress = rawProgress;
            break;
          }
        }
      }
      motion.revealStart = lastCollisionProgress < 0
        ? 0
        : Math.min(.985, lastCollisionProgress + 1 / focusIndexMotionSampleCount);
      planned.push(motion);
    });
    return motions;
  }

  function getFocusIndexMotionTransformForProgress(motion, progress) {
    if (progress >= 1) return "none";
    const finalX = motion.cardRect.left + motion.cardRect.width / 2;
    const finalY = motion.cardRect.top + motion.cardRect.height / 2;
    const translateX = (motion.spawn.x - finalX) * (1 - progress);
    const translateY = (motion.spawn.y - finalY) * (1 - progress);
    const scale = motion.spawn.scale + (1 - motion.spawn.scale) * progress;
    return `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`;
  }

  function getFocusIndexMotionTransformAt(motion, rawProgress) {
    return getFocusIndexMotionTransformForProgress(motion, getFocusIndexCubicProgress(rawProgress));
  }

  function getFocusIndexCardKeyframes(motion, direction) {
    const revealStart = Math.max(0, Math.min(.985, Number(motion.revealStart) || 0));
    const fadeEnd = Math.min(1, revealStart + .16 + (motion.distanceRatio || 0) * .08);
    const revealSpatialStart = getFocusIndexCubicProgress(revealStart);
    const fadeSpatialEnd = getFocusIndexCubicProgress(fadeEnd);
    const fadeSpan = Math.max(.0001, fadeSpatialEnd - revealSpatialStart);
    const frames = [];
    const addFrame = (spatialProgress, opacity, offset) => {
      const frame = {
        transform: getFocusIndexMotionTransformForProgress(motion, spatialProgress),
        opacity,
        offset: Math.max(0, Math.min(1, offset))
      };
      const previous = frames[frames.length - 1];
      if (previous && Math.abs(previous.offset - frame.offset) < .0001) frames[frames.length - 1] = frame;
      else frames.push(frame);
    };
    if (direction === "open") {
      addFrame(0, 0, 0);
      addFrame(revealSpatialStart, 0, revealSpatialStart);
      addFrame(revealSpatialStart + fadeSpan * .25, .15625, revealSpatialStart + fadeSpan * .25);
      addFrame(revealSpatialStart + fadeSpan * .75, .84375, revealSpatialStart + fadeSpan * .75);
      addFrame(fadeSpatialEnd, 1, fadeSpatialEnd);
      addFrame(1, 1, 1);
      return frames;
    }
    addFrame(1, 1, 0);
    addFrame(fadeSpatialEnd, 1, 1 - fadeSpatialEnd);
    addFrame(fadeSpatialEnd - fadeSpan * .25, .84375, 1 - fadeSpatialEnd + fadeSpan * .25);
    addFrame(fadeSpatialEnd - fadeSpan * .75, .15625, 1 - fadeSpatialEnd + fadeSpan * .75);
    addFrame(revealSpatialStart, 0, 1 - revealSpatialStart);
    addFrame(0, 0, 1);
    return frames;
  }

  function resetFocusIndexCardMotionFrames(index) {
    focusIndexState.cardMotionFrames.clear();
    focusIndexState.cardMotionIndex = index;
    focusIndexState.cardMotionEndTime = 0;
    focusIndexState.cardMotionViewportWidth = window.innerWidth;
    focusIndexState.cardMotionViewportHeight = window.innerHeight;
  }

  function canReuseFocusIndexCardMotionFrames(index) {
    return focusIndexState.cardMotionIndex === index
      && focusIndexState.cardMotionViewportWidth === window.innerWidth
      && focusIndexState.cardMotionViewportHeight === window.innerHeight;
  }

  function getFocusIndexSpawnFrame(cardRect, index, savedFrame = null) {
    const cardX = cardRect.left + cardRect.width / 2;
    const cardY = cardRect.top + cardRect.height / 2;
    const savedX = Number(savedFrame?.x);
    const savedY = Number(savedFrame?.y);
    const savedScale = Number(savedFrame?.scale);
    if (savedFrame && Number.isFinite(savedX) && Number.isFinite(savedY)) {
      const scale = Number.isFinite(savedScale) ? savedScale : .52;
      return {
        x: savedX,
        y: savedY,
        scale,
        transform: `translate3d(${savedX - cardX}px, ${savedY - cardY}px, 0) scale(${scale})`,
        opacity: "0"
      };
    }
    return {
      x: cardX,
      y: cardY,
      scale: .58,
      transform: "none",
      opacity: "0"
    };
  }

  function playFocusIndexCardMotion(direction, anchorRect, selectedIndex, resume = false, options = {}) {
    if (!indexGallery || !anchorRect || isFocusIndexReducedMotion()) return 0;
    cancelFocusIndexCardAnimations(resume);
    const galleryRect = getFocusRect(indexGallery);
    if (!galleryRect) return 0;
    const totalDuration = Math.max(180, Number(options.totalDuration) || getFocusIndexPrimaryDuration());
    const reusableFrames = canReuseFocusIndexCardMotionFrames(selectedIndex);
    const needsPlan = !reusableFrames;
    if (needsPlan) {
      resetFocusIndexCardMotionFrames(selectedIndex);
    }
    const buffer = Math.min(96, indexGallery.clientHeight * .12);
    const motions = [];
    const cards = [...indexGallery.querySelectorAll(".focus-index-card")];
    const baseRects = getFocusIndexCardBaseRects(cards);
    cards.forEach((card, visualIndex) => {
      if (visualIndex === selectedIndex) {
        clearFocusIndexCardMotionStyles(card);
        return;
      }
      const cardRect = baseRects.get(card);
      const visible = cardRect
        && cardRect.left + cardRect.width >= galleryRect.left - buffer
        && cardRect.left <= galleryRect.left + galleryRect.width + buffer
        && cardRect.top + cardRect.height >= galleryRect.top - buffer
        && cardRect.top <= galleryRect.top + galleryRect.height + buffer;
      if (!visible) {
        if (direction === "open") clearFocusIndexCardMotionStyles(card);
        return;
      }
      const savedFrame = focusIndexState.cardMotionFrames.get(visualIndex);
      const spawn = getFocusIndexSpawnFrame(cardRect, visualIndex, savedFrame);
      const baseTiming = getFocusIndexCardTiming(cardRect, anchorRect, totalDuration);
      const timing = {
        duration: totalDuration,
        delay: 0,
        distanceRatio: Number(savedFrame?.distanceRatio) || baseTiming.distanceRatio
      };
      const cardX = cardRect.left + cardRect.width / 2;
      const cardY = cardRect.top + cardRect.height / 2;
      const anchorX = anchorRect.left + anchorRect.width / 2;
      const anchorY = anchorRect.top + anchorRect.height / 2;
      motions.push({
        card,
        visualIndex,
        spawn,
        timing,
        cardRect,
        distance: Math.hypot(cardX - anchorX, cardY - anchorY),
        distanceRatio: timing.distanceRatio,
        revealStart: Number(savedFrame?.revealStart) || 0
      });
    });
    if (needsPlan) {
      assignFocusIndexConcurrentLanes(motions, anchorRect);
      const mainMotion = direction === "open"
        ? { fromRect: options.mainFromRect, toRect: options.mainToRect, duration: totalDuration }
        : { fromRect: options.mainToRect, toRect: options.mainFromRect, duration: totalDuration };
      planFocusIndexConcurrentMotions(motions, mainMotion);
    }
    motions.forEach((motion) => {
      if (!resume) {
        motion.currentTransform = direction === "open" ? motion.spawn.transform : "none";
        motion.currentOpacity = direction === "open" ? motion.spawn.opacity : "1";
        return;
      }
      const computed = getComputedStyle(motion.card);
      motion.currentTransform = computed.transform === "none" ? "none" : computed.transform;
      motion.currentOpacity = computed.opacity;
    });
    focusIndexState.cardMotionEndTime = 0;
    motions.forEach(({ visualIndex, spawn, timing, revealStart, distanceRatio }) => {
      focusIndexState.cardMotionFrames.set(visualIndex, {
        x: spawn.x,
        y: spawn.y,
        scale: spawn.scale,
        duration: timing.duration,
        delay: timing.delay,
        revealStart,
        distanceRatio
      });
      focusIndexState.cardMotionEndTime = Math.max(
        focusIndexState.cardMotionEndTime,
        timing.delay + timing.duration
      );
    });
    const timelineEnd = focusIndexState.cardMotionEndTime;
    const motionStartedAt = performance.now();
    motions.forEach((motion) => {
      const { card, visualIndex, spawn, timing, currentTransform, currentOpacity } = motion;
      const finalTransform = direction === "open" ? "none" : spawn.transform;
      const finalOpacity = direction === "open" ? "1" : spawn.opacity;
      const delay = 0;
      const motionRunId = focusIndexState.runId;
      const startCardMotion = (startTransform, startOpacity, motionDelay = delay, motionDuration = timing.duration) => {
        if (focusIndexState.runId !== motionRunId || (direction === "open" && focusIndexState.mode !== "index")) return;
        const duration = Math.max(180, motionDuration);
        const keyframes = resume
          ? [
            { transform: startTransform, opacity: startOpacity },
            { transform: finalTransform, opacity: finalOpacity }
          ]
          : getFocusIndexCardKeyframes(motion, direction);
        card.style.willChange = "transform, opacity";
        const animation = card.animate(keyframes, {
          duration,
          delay: motionDelay,
          easing: focusIndexMotionEasing,
          fill: "both"
        });
        const entry = { animation, card };
        focusIndexState.cardAnimations.push(entry);
        animation.finished.then(() => {
          focusIndexState.cardAnimations = focusIndexState.cardAnimations.filter((item) => item !== entry);
          if (focusIndexState.runId !== motionRunId) {
            animation.cancel();
            return;
          }
          if (direction === "open" && focusIndexState.mode === "index") {
            clearFocusIndexCardMotionStyles(card);
          } else if (direction === "close") {
            card.style.transform = finalTransform;
            card.style.opacity = finalOpacity;
            card.style.removeProperty("will-change");
          }
          animation.cancel();
        }).catch(() => {});
      };
      const cardImage = card.querySelector("img");
      if (direction === "open" && cardImage) {
        hydrateFocusIndexCardThumb(cardImage, visualIndex, false);
        const visualReady = cardImage.complete && cardImage.naturalWidth > 0;
        if (!visualReady) {
          card.style.transform = currentTransform;
          card.style.opacity = "0";
          card.style.willChange = "transform, opacity";
          cardImage.addEventListener("load", () => {
            if (focusIndexState.runId !== motionRunId || focusIndexState.mode !== "index") return;
            if (focusIndexState.phase !== "opening") {
              clearFocusIndexCardMotionStyles(card);
              return;
            }
            const remainingDuration = timing.duration - (performance.now() - motionStartedAt);
            if (remainingDuration >= 240) {
              startCardMotion(currentTransform, "0", 0, remainingDuration);
              return;
            }
            card.style.transform = "none";
            card.style.opacity = "0";
            card.style.willChange = "opacity";
            const animation = card.animate([
              { opacity: 0 },
              { opacity: 1 }
            ], {
              duration: 240,
              easing: focusIndexMotionEasing,
              fill: "both"
            });
            const entry = { animation, card };
            focusIndexState.cardAnimations.push(entry);
            animation.finished.then(() => {
              focusIndexState.cardAnimations = focusIndexState.cardAnimations.filter((item) => item !== entry);
              if (focusIndexState.runId === motionRunId) clearFocusIndexCardMotionStyles(card);
              animation.cancel();
            }).catch(() => {});
          }, { once: true });
          cardImage.addEventListener("error", () => {
            if (focusIndexState.runId !== motionRunId || focusIndexState.mode !== "index") return;
            clearFocusIndexCardMotionStyles(card);
            scheduleFocusIndexImageWindow();
          }, { once: true });
          return;
        }
      }
      startCardMotion(currentTransform, currentOpacity);
    });
    return motions.length ? timelineEnd : 0;
  }

  function setFocusIndexMovingRect(node, rect) {
    if (!node || !rect) return null;
    if (node.parentElement !== document.body) document.body.appendChild(node);
    node.classList.add("focus-index-moving-image");
    node.style.left = `${rect.left}px`;
    node.style.top = `${rect.top}px`;
    node.style.width = `${rect.width}px`;
    node.style.height = `${rect.height}px`;
    node.style.transform = "translate3d(0, 0, 0) scaleX(1) scaleY(1)";
    node.style.opacity = "1";
    return rect;
  }

  function clearFocusIndexMovingStyles(node) {
    if (!node) return;
    node.classList.remove("focus-index-moving-image");
    ["left", "top", "width", "height", "transform", "opacity", "filter", "zIndex", "pointerEvents"].forEach((name) => {
      node.style[name] = "";
    });
  }

  function cancelFocusIndexImageAnimation(freeze = true) {
    const currentRect = getFocusRect(image);
    const active = focusIndexState.imageAnimation;
    if (active?.animation) active.animation.cancel();
    focusIndexState.imageAnimation = null;
    if (freeze && currentRect) setFocusIndexMovingRect(image, currentRect);
    return currentRect;
  }

  function getFocusIndexMotionDuration(fromRect, toRect, baseDuration, resumed = false) {
    if (!resumed || !fromRect || !toRect) return baseDuration;
    const centerDistance = Math.hypot(
      toRect.left + toRect.width / 2 - fromRect.left - fromRect.width / 2,
      toRect.top + toRect.height / 2 - fromRect.top - fromRect.height / 2
    );
    const viewportDistance = Math.max(1, Math.hypot(window.innerWidth, window.innerHeight));
    const sizeDistance = Math.abs(toRect.width - fromRect.width) + Math.abs(toRect.height - fromRect.height);
    const remaining = Math.max(0.12, Math.min(1, centerDistance / viewportDistance + sizeDistance / viewportDistance));
    return Math.max(180, Math.round(baseDuration * Math.sqrt(remaining)));
  }

  function getFocusIndexImageMotionDuration(index, fromRect, targetRect, baseDuration, resumed = false) {
    if (isFocusIndexReducedMotion()) return 0;
    const ratio = getFocusPhotoRatio(index, fromRect);
    const finalRect = normalizeFocusTravelRect(targetRect, ratio) || targetRect;
    return getFocusIndexMotionDuration(fromRect, finalRect, baseDuration, resumed);
  }

  function animateFocusIndexImageTo(index, targetRect, options = {}) {
    if (!image || !targetRect) {
      options.onArrive?.(targetRect);
      return null;
    }
    const fromRect = getFocusRect(image);
    if (!fromRect) {
      setFocusIndexMovingRect(image, targetRect);
      options.onArrive?.(targetRect);
      return null;
    }
    const ratio = getFocusPhotoRatio(index, fromRect);
    const finalRect = normalizeFocusTravelRect(targetRect, ratio) || targetRect;
    setFocusIndexMovingRect(image, fromRect);
    const motionDuration = Number.isFinite(options.motionDuration)
      ? Math.max(0, options.motionDuration)
      : getFocusIndexMotionDuration(
        fromRect,
        finalRect,
        options.duration || 900,
        Boolean(options.resumed)
      );
    if (motionDuration <= 0) {
      setFocusIndexMovingRect(image, finalRect);
      options.onArrive?.(finalRect);
      return null;
    }
    const translateX = finalRect.left - fromRect.left;
    const translateY = finalRect.top - fromRect.top;
    const scaleX = finalRect.width / Math.max(1, fromRect.width);
    const scaleY = finalRect.height / Math.max(1, fromRect.height);
    const startTransform = "translate3d(0, 0, 0) scaleX(1) scaleY(1)";
    const finalTransform = `translate3d(${translateX}px, ${translateY}px, 0) scaleX(${scaleX}) scaleY(${scaleY})`;
    const animation = image.animate([
      { transform: startTransform },
      { transform: finalTransform }
    ], {
      duration: motionDuration,
      easing: focusIndexMotionEasing,
      fill: "both"
    });
    const runId = focusIndexState.runId;
    focusIndexState.imageAnimation = { animation, runId };
    animation.finished.then(() => {
      if (focusIndexState.runId !== runId || focusIndexState.imageAnimation?.animation !== animation) return;
      setFocusIndexMovingRect(image, finalRect);
      animation.cancel();
      focusIndexState.imageAnimation = null;
      options.onArrive?.(finalRect);
    }).catch(() => {});
    return animation;
  }

  function getOrCreateFocusIndexCardImage(index) {
    const card = getFocusIndexCardByIndex(index);
    const media = card?.querySelector(".focus-index-card__media");
    if (!media) return null;
    let node = media.querySelector("img");
    if (!node) {
      node = createFocusIndexCardImage(index);
      if (node) media.appendChild(node);
    }
    prepareFocusIndexImage(node, index);
    return node;
  }

  function promoteFocusIndexCardImage(index) {
    const nextImage = getOrCreateFocusIndexCardImage(index);
    if (!nextImage) return image;
    if (nextImage !== image) {
      const previousCard = image.closest?.(".focus-index-card");
      const previousIndex = Number(previousCard?.dataset.index || 1) - 1;
      image.removeAttribute("data-focus-image");
      image.loading = "lazy";
      image.fetchPriority = "low";
      if (previousCard) prepareFocusIndexImage(image, previousIndex);
      nextImage.setAttribute("data-focus-image", "");
      image = nextImage;
    }
    image.loading = "eager";
    image.fetchPriority = "high";
    prepareFocusIndexImage(image, index);
    return image;
  }

  function dockFocusIndexImage(index, finalRect) {
    const card = getFocusIndexCardByIndex(index);
    const media = card?.querySelector(".focus-index-card__media");
    if (!card || !media || !image) return;
    if (finalRect) setFocusIndexMovingRect(image, finalRect);
    media.querySelectorAll("img").forEach((node) => {
      if (node !== image) {
        node.remove();
      }
    });
    media.appendChild(image);
    image.setAttribute("data-focus-image", "");
    prepareFocusIndexImage(image, index);
    clearFocusIndexMovingStyles(image);
    card.classList.remove("is-index-hidden", "is-index-anchor");
  }

  function restoreFocusIndexImageToMain(finalRect) {
    if (!image) return;
    if (finalRect) setFocusIndexMovingRect(image, finalRect);
    const swipeLayer = imageToggle.querySelector(".focus-swipe-layer");
    imageToggle.insertBefore(image, swipeLayer || null);
    image.setAttribute("data-focus-image", "");
    clearFocusIndexMovingStyles(image);
  }

  function beginFocusIndexNodeHandoff() {
    window.clearTimeout(focusIndexReturnSettleTimer);
    focusIndexReturnSettleTimer = 0;
    shell.classList.remove("is-index-return-settling");
    focusSwitchSequence += 1;
    window.clearTimeout(focusSwitchTimer);
    shell.classList.remove("is-switching-image", "is-main-swipe-handoff", "is-main-swipe-returning");
    clearFocusSwitchHandoff();
    shell.classList.add("is-index-reparenting");
  }

  function releaseFocusIndexNodeHandoff(runId, settleDuration = 0) {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (focusIndexState.runId !== runId) return;
      shell.classList.remove("is-index-reparenting");
      if (settleDuration <= 0) return;
      focusIndexReturnSettleTimer = window.setTimeout(() => {
        if (focusIndexState.runId === runId) shell.classList.remove("is-index-return-settling");
        focusIndexReturnSettleTimer = 0;
      }, settleDuration);
    }));
  }

  function syncFocusIndexSelection(index) {
    const photo = photos[index];
    if (!photo) return;
    clearFocusQueuedSwipe();
    clearFocusMainSwipe();
    focusSwitchSequence += 1;
    window.clearTimeout(focusSwitchTimer);
    shell.classList.remove("is-switching-image");
    updateFocusChrome(index, true);
    if (photo.width > 0 && photo.height > 0) {
      image.width = photo.width;
      image.height = photo.height;
    }
    image.alt = photo.alt || "";
    caption.textContent = "";
    updateFocusNoteContent(photo);
    title.textContent = photo.title;
    focusIndexState.activeIndex = index;
    preloadFocusNeighbors(index);
    scheduleNotesLayoutUpdate();
  }

  function finishFocusIndexOpen(index, finalRect, runId) {
    if (focusIndexState.runId !== runId || focusIndexState.phase !== "opening") return;
    beginFocusIndexNodeHandoff();
    dockFocusIndexImage(index, finalRect);
    cancelFocusIndexCardAnimations(false);
    indexGallery?.querySelectorAll(".focus-index-card").forEach(clearFocusIndexCardMotionStyles);
    resetFocusIndexHorizontalOffset();
    shell.classList.remove("is-index-opening", "is-index-closing", "is-index-exiting");
    focusIndexState.phase = "idle";
    focusIndexState.mode = "index";
    focusIndexState.activeIndex = index;
    scheduleFocusIndexImageWindow();
    releaseFocusIndexNodeHandoff(runId);
    const pending = focusIndexState.pendingSelection;
    focusIndexState.pendingSelection = null;
    if (pending !== null) {
      requestAnimationFrame(() => closeFocusIndex(pending, { restoreNotes: focusIndexState.returnMode === "notes" }));
    }
  }

  function finishFocusIndexClose(index, options = {}, runId = focusIndexState.runId, arrivedRect = null) {
    if (focusIndexState.runId !== runId || focusIndexState.phase !== "closing") return;
    cancelFocusIndexMomentum();
    const restoreNotes = Boolean(options.restoreNotes);
    beginFocusIndexNodeHandoff();
    shell.classList.add("is-index-return-settling");
    shell.classList.remove("is-index", "is-index-opening", "is-index-closing", "is-index-exiting");
    indexGallery?.setAttribute("aria-hidden", "true");
    setNotesOpen(restoreNotes);
    unlockFocusIndexPageScroll();
    if (restoreNotes) updateNotesLayout();
    shell.offsetHeight;
    const finalRect = copyFocusRect(arrivedRect)
      || getFocusIndexReturnRect(index, getFocusRect(image), restoreNotes)
      || getFocusImageContentRectForPhoto(photos[index], index, {
        notes: restoreNotes,
        sourceRect: getFocusRect(image)
      })
      || getFocusMainTargetRect({ notes: restoreNotes });
    restoreFocusIndexImageToMain(finalRect);
    indexGallery?.querySelectorAll(".focus-index-card").forEach((card) => {
      card.classList.remove("is-index-hidden", "is-index-anchor");
      clearFocusIndexCardMotionStyles(card);
    });
    cancelFocusIndexCardAnimations(false);
    focusIndexState.phase = "idle";
    focusIndexState.mode = restoreNotes ? "notes" : "rel";
    focusIndexState.returnMode = focusIndexState.mode;
    focusIndexState.activeIndex = index;
    focusIndexState.pendingSelection = null;
    focusSyncHoldUntil = Date.now() + 900;
    scrollToFocusIndex(index, false);
    requestFocusIndexFullImage(image, index, true);
    scheduleFocusIndexCardWarmup(index, 560);
    releaseFocusIndexNodeHandoff(runId, restoreNotes ? 1460 : 560);
  }

  function scheduleFocusIndexResize() {
    window.cancelAnimationFrame(focusIndexState.resizeFrame);
    focusIndexState.resizeFrame = requestAnimationFrame(() => {
      focusIndexState.resizeFrame = requestAnimationFrame(() => {
        focusIndexState.resizeFrame = 0;
        if (focusIndexState.phase === "idle" && focusIndexState.mode === "index") {
          positionFocusIndexGalleryOnActive(focusIndexState.activeIndex);
          scheduleFocusIndexImageWindow();
          return;
        }
        if (focusIndexState.phase !== "opening" && focusIndexState.phase !== "closing") return;
        const phase = focusIndexState.phase;
        const index = focusIndexState.activeIndex;
        const runId = ++focusIndexState.runId;
        cancelFocusIndexImageAnimation(true);
        cancelFocusIndexCardAnimations(true);
        if (phase === "opening") {
          const targetRect = positionFocusIndexGalleryOnActive(index);
          const sourceRect = getFocusRect(image);
          const motionDuration = getFocusIndexImageMotionDuration(
            index,
            sourceRect,
            targetRect,
            getFocusIndexPrimaryDuration(),
            true
          );
          playFocusIndexCardMotion("open", targetRect, index, true, {
            totalDuration: motionDuration,
            mainFromRect: sourceRect,
            mainToRect: targetRect
          });
          animateFocusIndexImageTo(index, targetRect, {
            motionDuration,
            resumed: true,
            onArrive: (rect) => finishFocusIndexOpen(index, rect, runId)
          });
          return;
        }
        const restoreNotes = focusIndexState.returnMode === "notes";
        if (restoreNotes) updateNotesLayout();
        const sourceRect = getFocusRect(image);
        const targetRect = getFocusIndexReturnRect(index, sourceRect, restoreNotes)
          || getFocusImageContentRectForPhoto(photos[index], index, {
            notes: restoreNotes,
            sourceRect
          });
        const motionDuration = getFocusIndexImageMotionDuration(
          index,
          sourceRect,
          targetRect,
          getFocusIndexPrimaryDuration(),
          true
        );
        const cardAnchor = getFocusIndexCardRect(getFocusIndexCardByIndex(index)) || sourceRect;
        playFocusIndexCardMotion("close", cardAnchor, index, true, {
          totalDuration: motionDuration,
          mainFromRect: sourceRect,
          mainToRect: targetRect
        });
        animateFocusIndexImageTo(index, targetRect, {
          motionDuration,
          resumed: true,
          direction: "close",
          onArrive: (arrivedRect) => finishFocusIndexClose(index, { restoreNotes }, runId, arrivedRect)
        });
      });
    });
  }

  function selectFocusIndexCard(index) {
    if (focusIndexState.phase === "opening") {
      focusIndexState.pendingSelection = getBoundedFocusIndex(index);
      return;
    }
    if (focusIndexState.phase !== "idle" || focusIndexState.mode !== "index") return;
    closeFocusIndex(index, { restoreNotes: focusIndexState.returnMode === "notes" });
  }

  function openFocusIndex(activeIndex) {
    if (!indexEnabled || !indexGallery) return;
    const resumed = focusIndexState.phase === "closing";
    if (focusIndexState.phase === "opening" || (focusIndexState.phase === "idle" && focusIndexState.mode === "index")) return;
    cancelFocusIndexMomentum();
    if (!resumed) {
      cancelFocusImageSwitch({ restoreVisualSelection: true });
      activeIndex = Number(shell.dataset.activeIndex || 0);
    }
    const index = getBoundedFocusIndex(activeIndex);
    window.clearTimeout(focusIndexReturnSettleTimer);
    focusIndexReturnSettleTimer = 0;
    shell.classList.remove("is-index-return-settling");
    const sourceRect = resumed
      ? cancelFocusIndexImageAnimation(true)
      : getFocusImageContentRect() || getFocusRect(image);
    cancelFocusIndexCardAnimations(resumed);
    if (!resumed) {
      focusIndexState.returnMode = shell.classList.contains("is-notes") ? "notes" : "rel";
      const restoreNotes = focusIndexState.returnMode === "notes";
      focusIndexState.returnImageRect = copyFocusRect(sourceRect);
      focusIndexState.returnImageIndex = index;
      focusIndexState.returnBoxRect = copyFocusRect(getFocusMainTargetRect({ notes: restoreNotes }));
      focusIndexState.returnViewportWidth = window.innerWidth;
      focusIndexState.returnViewportHeight = window.innerHeight;
    }
    focusIndexState.runId += 1;
    const runId = focusIndexState.runId;
    focusIndexState.mode = "index";
    focusIndexState.phase = "opening";
    focusIndexState.activeIndex = index;
    focusIndexState.pendingSelection = null;
    clearFocusQueuedSwipe();
    clearFocusMainSwipe();
    indexGallery.querySelectorAll(".focus-index-card img:not([src])").forEach((node) => {
      if (Number(node.dataset.focusIndexThumbAttempts || 0) >= 3) {
        node.dataset.focusIndexThumbAttempts = "0";
      }
    });
    if (focusIndexPreparedIndex !== index) warmFocusIndexCardThumbs(index);
    setFocusIndexGalleryActive(index);
    getFocusIndexCardByIndex(index)?.classList.add("is-index-hidden", "is-index-anchor");
    if (!resumed) setFocusIndexMovingRect(image, sourceRect);
    setNotesOpen(false);
    indexGallery.setAttribute("aria-hidden", "false");
    lockFocusIndexPageScroll();
    shell.classList.add("is-index", "is-index-opening");
    shell.classList.remove("is-index-closing", "is-index-exiting", "is-index-reparenting");
    const canUsePreparedRect = !resumed
      && focusIndexPreparedIndex === index
      && focusIndexPreparedViewportWidth === window.innerWidth
      && focusIndexPreparedViewportHeight === window.innerHeight
      && focusIndexPreparedRect;
    const targetRect = canUsePreparedRect
      ? copyFocusRect(focusIndexPreparedRect)
      : positionFocusIndexGalleryOnActive(index);
    requestFocusIndexFullImage(image, index, true);
    scheduleFocusIndexImageWindow();
    const cardAnchor = targetRect || getFocusIndexCardRect(getFocusIndexCardByIndex(index));
    const motionDuration = getFocusIndexImageMotionDuration(
      index,
      sourceRect,
      targetRect,
      getFocusIndexPrimaryDuration(),
      resumed
    );
    const cardTimeline = playFocusIndexCardMotion("open", cardAnchor, index, resumed, {
      totalDuration: motionDuration,
      mainFromRect: sourceRect,
      mainToRect: targetRect
    });
    const totalDuration = Math.max(motionDuration, cardTimeline);
    setIndexTransitioning(totalDuration + 180);
    focusSyncHoldUntil = Date.now() + totalDuration + 220;
    animateFocusIndexImageTo(index, targetRect, {
      motionDuration: totalDuration,
      resumed,
      onArrive: (rect) => finishFocusIndexOpen(index, rect, runId)
    });
  }

  function closeFocusIndex(index, options = {}) {
    const targetIndex = Math.max(0, Math.min(index, photos.length - 1));
    if (!indexEnabled || !indexGallery) return;
    if (focusIndexState.phase === "closing") return;
    if (focusIndexState.phase === "idle" && focusIndexState.mode !== "index") return;
    cancelFocusIndexMomentum();
    resetFocusIndexTouch();
    const resumed = focusIndexState.phase === "opening";
    const restoreNotes = options.restoreNotes ?? focusIndexState.returnMode === "notes";
    let sourceRect = null;
    if (resumed) {
      sourceRect = cancelFocusIndexImageAnimation(true);
      cancelFocusIndexCardAnimations(true);
    } else {
      promoteFocusIndexCardImage(targetIndex);
      sourceRect = getFocusRect(image) || getFocusIndexCardRect(getFocusIndexCardByIndex(targetIndex));
      cancelFocusIndexCardAnimations(false);
      setFocusIndexMovingRect(image, sourceRect);
    }
    focusIndexState.runId += 1;
    const runId = focusIndexState.runId;
    focusIndexState.mode = restoreNotes ? "notes" : "rel";
    focusIndexState.phase = "closing";
    focusIndexState.returnMode = restoreNotes ? "notes" : "rel";
    focusIndexState.activeIndex = targetIndex;
    focusIndexState.pendingSelection = null;
    setFocusManualSelection(targetIndex, 1800);
    const sourceCard = getFocusIndexCardByIndex(targetIndex);
    sourceCard?.classList.add("is-index-hidden", "is-index-anchor");
    setFocusIndexGalleryActive(targetIndex);
    shell.classList.add("is-index-closing", "is-index-exiting");
    shell.classList.remove("is-index-opening", "is-index-reparenting");
    syncFocusIndexSelection(targetIndex);
    if (restoreNotes) updateNotesLayout();
    const targetRect = getFocusIndexReturnRect(targetIndex, sourceRect, restoreNotes)
      || getFocusMainTargetRect({ notes: restoreNotes })
      || getFocusRect(imageToggle);
    if (!sourceRect || !targetRect) {
      finishFocusIndexClose(targetIndex, { restoreNotes }, runId);
      return;
    }
    const motionDuration = getFocusIndexImageMotionDuration(
      targetIndex,
      sourceRect,
      targetRect,
      getFocusIndexPrimaryDuration(),
      resumed
    );
    const cardAnchor = getFocusIndexCardRect(sourceCard) || sourceRect;
    const cardTimeline = playFocusIndexCardMotion("close", cardAnchor, targetIndex, resumed, {
      totalDuration: motionDuration,
      mainFromRect: sourceRect,
      mainToRect: targetRect
    });
    const totalDuration = Math.max(motionDuration, cardTimeline);
    setIndexTransitioning(totalDuration + 180);
    focusSyncHoldUntil = Date.now() + totalDuration + 220;
    animateFocusIndexImageTo(targetIndex, targetRect, {
      motionDuration: totalDuration,
      resumed,
      direction: "close",
      onArrive: (arrivedRect) => {
        finishFocusIndexClose(targetIndex, { restoreNotes }, runId, arrivedRect);
      }
    });
  }

  function getFocusThumbByIndex(index) {
    return [...thumbs.querySelectorAll(".focus-thumb")].find((thumb) => Number(thumb.dataset.index) === index + 1) || null;
  }

  function setIndexTransitioning(duration = 760) {
    shell.classList.add("is-index-transitioning");
    window.clearTimeout(focusIndexTransitionTimer);
    focusIndexTransitionTimer = window.setTimeout(() => {
      shell.classList.remove("is-index-transitioning");
    }, duration);
  }

  function getWrappedFocusIndex(index) {
    if (!photos.length) return 0;
    return (index + photos.length) % photos.length;
  }

  function getBoundedFocusSwipeIndex(index) {
    if (!photos.length || index < 0 || index >= photos.length) return null;
    return index;
  }

  function getFocusMainSwipeAxis() {
    return "x";
  }

  function getFocusMainSwipeExtent(axis = getFocusMainSwipeAxis()) {
    const rect = getFocusRect(imageToggle) || getFocusRect(focusMain);
    const width = imageToggle.clientWidth || focusMain.clientWidth || rect?.width || window.innerWidth || 1;
    const height = imageToggle.clientHeight || focusMain.clientHeight || rect?.height || window.innerHeight || 1;
    return Math.max(1, axis === "y" ? height : width);
  }

  function getFocusMainSwipeTravelMetrics(fromIndex, targetIndex, axis, edge = false, direction = 1) {
    const width = Math.max(1, imageToggle.clientWidth || focusMain.clientWidth || window.innerWidth || 1);
    const height = Math.max(1, imageToggle.clientHeight || focusMain.clientHeight || window.innerHeight || 1);
    const box = { left: 0, top: 0, width, height };
    const containerExtent = axis === "y" ? height : width;
    if (edge) {
      return {
        extent: containerExtent,
        travel: Math.min(138, Math.max(54, containerExtent * 0.2))
      };
    }
    const currentRect = getContentRectWithin(box, getFocusPhotoRatio(fromIndex, box)) || box;
    const targetRect = getContentRectWithin(box, getFocusPhotoRatio(targetIndex, box)) || box;
    const currentExtent = axis === "y" ? currentRect.height : currentRect.width;
    const targetExtent = axis === "y" ? targetRect.height : targetRect.width;
    const gap = Math.min(96, Math.max(26, Math.min(currentExtent, targetExtent) * 0.18));
    const visibleTravel = currentExtent / 2 + targetExtent / 2 + gap;
    const minimumTravel = containerExtent * (axis === "y" ? 0.7 : 0.72);
    if (axis === "x" && window.innerWidth <= 768 && shell.classList.contains("is-notes")) {
      const visualBox = getFocusRect(imageToggle);
      if (visualBox) {
        const currentVisualRect = getContentRectWithin(visualBox, getFocusPhotoRatio(fromIndex, visualBox)) || visualBox;
        const targetVisualRect = getContentRectWithin(visualBox, getFocusPhotoRatio(targetIndex, visualBox)) || visualBox;
        const visualGap = Math.min(72, Math.max(24, Math.min(currentVisualRect.width, targetVisualRect.width) * 0.14));
        const viewportWidth = window.visualViewport?.width || window.innerWidth;
        const screenTravel = direction > 0
          ? Math.max(currentVisualRect.left + currentVisualRect.width + visualGap, viewportWidth - targetVisualRect.left + visualGap)
          : Math.max(viewportWidth - currentVisualRect.left + visualGap, targetVisualRect.left + targetVisualRect.width + visualGap);
        const renderedScale = Math.max(0.01, visualBox.width / width);
        return {
          extent: containerExtent,
          travel: Math.max(minimumTravel, screenTravel / renderedScale)
        };
      }
    }
    return {
      extent: containerExtent,
      travel: Math.min(containerExtent + gap, Math.max(minimumTravel, visibleTravel))
    };
  }

  function getFocusMainSwipeRailPosition(index) {
    const thumb = thumbs.querySelector(`.focus-thumb[data-index="${index + 1}"]`);
    if (!thumb) return null;
    const rect = thumb.getBoundingClientRect();
    if (window.innerWidth <= 768) {
      updateMobileFocusRail();
      const current = thumbs.scrollLeft;
      const target = current + rect.left + rect.width / 2 - window.innerWidth / 2;
      return {
        axis: "x",
        current,
        target: Math.max(0, Math.min(target, mobileRailMaxOffset))
      };
    }
    const current = window.scrollY || document.documentElement.scrollTop || 0;
    const maxTop = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const target = current + rect.top + rect.height / 2 - window.innerHeight / 2;
    return {
      axis: "y",
      current,
      target: Math.max(0, Math.min(target, maxTop))
    };
  }

  function configureFocusMainSwipeRail(targetIndex, edge = false) {
    focusMainSwipe.railReady = false;
    focusMainSwipe.railAxis = "";
    focusMainSwipe.railFrom = 0;
    focusMainSwipe.railTo = 0;
    if (edge) return;
    const rail = getFocusMainSwipeRailPosition(targetIndex);
    if (!rail) return;
    focusMainSwipe.railReady = true;
    focusMainSwipe.railAxis = rail.axis;
    focusMainSwipe.railFrom = rail.current;
    focusMainSwipe.railTo = rail.target;
  }

  function getFocusMainSwipeProgress(value, start = 0, end = 1) {
    if (end <= start) return value >= end ? 1 : 0;
    const normalized = Math.max(0, Math.min(1, (value - start) / (end - start)));
    return normalized * normalized * (3 - 2 * normalized);
  }

  function updateFocusMainSwipeRail(progress) {
    if (!focusMainSwipe.railReady || focusMainSwipe.edge) return;
    const follow = getFocusMainSwipeProgress(progress, 0.06, 0.94);
    const position = focusMainSwipe.railFrom + (focusMainSwipe.railTo - focusMainSwipe.railFrom) * follow;
    if (focusMainSwipe.railAxis === "x") {
      thumbs.scrollLeft = Math.max(0, Math.min(position, mobileRailMaxOffset));
      return;
    }
    if (focusMainSwipe.railAxis === "y") {
      window.scrollTo({ top: position, left: 0, behavior: "auto" });
    }
  }

  function ensureFocusMainSwipeLayer() {
    let layer = imageToggle.querySelector(".focus-swipe-layer");
    if (!layer) {
      layer = document.createElement("span");
      layer.className = "focus-swipe-layer";
      layer.setAttribute("aria-hidden", "true");
      layer.innerHTML = `
        <img class="focus-swipe-image focus-swipe-image--current" alt="" decoding="async">
        <img class="focus-swipe-image focus-swipe-image--next" alt="" decoding="async">
      `;
      imageToggle.appendChild(layer);
    }
    return {
      layer,
      current: layer.querySelector(".focus-swipe-image--current"),
      next: layer.querySelector(".focus-swipe-image--next")
    };
  }

  function setFocusMainSwipeFrame(offset, direction = focusMainSwipe.direction) {
    if (!direction) return;
    const axis = focusMainSwipe.axis || getFocusMainSwipeAxis();
    const isEdge = Boolean(focusMainSwipe.edge);
    const travel = Math.max(1, focusMainSwipe.travel || focusMainSwipe.extent || getFocusMainSwipeExtent(axis));
    const clamped = Math.max(-travel, Math.min(travel, offset));
    const nextBase = direction > 0 ? travel : -travel;
    const progress = Math.min(1, Math.abs(clamped) / Math.max(1, travel));
    const currentDepth = getFocusMainSwipeProgress(progress, 0.02, 1);
    const currentFade = getFocusMainSwipeProgress(progress, 0.18, 0.98);
    const nextFade = getFocusMainSwipeProgress(progress, 0.05, 0.8);
    const nextDepth = getFocusMainSwipeProgress(progress, 0, 0.96);
    const currentOpacity = isEdge ? 1 : Math.max(0, 1 - currentFade);
    const nextOpacity = isEdge ? 0 : nextFade;
    const currentScale = isEdge ? Math.max(0.975, 1 - progress * 0.025) : 1 - currentDepth * 0.06;
    const nextScale = isEdge ? 1 : 0.93 + nextDepth * 0.07;
    const currentX = axis === "x" ? clamped : 0;
    const currentY = axis === "y" ? clamped : 0;
    const nextPosition = nextBase + clamped;
    const nextX = axis === "x" ? nextPosition : 0;
    const nextY = axis === "y" ? nextPosition : 0;
    focusMainSwipe.offset = clamped;
    focusMainSwipe.progress = progress;
    shell.style.setProperty("--focus-swipe-current-x", `${currentX.toFixed(2)}px`);
    shell.style.setProperty("--focus-swipe-current-y", `${currentY.toFixed(2)}px`);
    shell.style.setProperty("--focus-swipe-next-x", `${nextX.toFixed(2)}px`);
    shell.style.setProperty("--focus-swipe-next-y", `${nextY.toFixed(2)}px`);
    shell.style.setProperty("--focus-swipe-progress", progress.toFixed(3));
    shell.style.setProperty("--focus-swipe-current-opacity", currentOpacity.toFixed(3));
    shell.style.setProperty("--focus-swipe-next-opacity", nextOpacity.toFixed(3));
    shell.style.setProperty("--focus-swipe-current-scale", currentScale.toFixed(3));
    shell.style.setProperty("--focus-swipe-next-scale", nextScale.toFixed(3));
    const notesTimelineProgress = focusMainSwipe.chained ? Math.max(progress, 0.76) : progress;
    const notesTextProgress = getFocusMainSwipeProgress(notesTimelineProgress, 0.1, 0.74);
    const notesLineProgress = getFocusMainSwipeProgress(notesTimelineProgress, 0.18, 0.86);
    const notesShift = (direction > 0 ? -1 : 1) * notesTextProgress * 7;
    shell.style.setProperty("--focus-swipe-notes-opacity", (1 - notesTextProgress).toFixed(3));
    shell.style.setProperty("--focus-swipe-line-opacity", (1 - notesLineProgress * 0.86).toFixed(3));
    shell.style.setProperty("--focus-swipe-notes-x", `${(axis === "x" ? notesShift : 0).toFixed(2)}px`);
    shell.style.setProperty("--focus-swipe-notes-y", `${(axis === "y" ? notesShift : 0).toFixed(2)}px`);
    updateFocusMainSwipeRail(progress);
  }

  function cancelFocusMainSwipeAnimation() {
    if (focusMainSwipe.frame) cancelAnimationFrame(focusMainSwipe.frame);
    focusMainSwipe.frame = 0;
    focusMainSwipe.animating = false;
    shell.classList.remove("is-main-swipe-animating");
  }

  function clearFocusQueuedSwipe() {
    focusQueuedSwipe = null;
  }

  function queueFocusMainSwipe(direction, velocity = 0) {
    if (!direction || focusMainSwipe.edge) return false;
    const baseIndex = focusMainSwipe.active
      ? focusMainSwipe.targetIndex
      : Number(shell.dataset.activeIndex || 0);
    preloadFocusDirection(baseIndex, direction, 3);
    if (focusQueuedSwipe) {
      if (focusQueuedSwipe.direction !== direction || focusQueuedSwipe.steps >= 3) return false;
      const queuedTarget = baseIndex + direction * (focusQueuedSwipe.steps + 1);
      if (getBoundedFocusSwipeIndex(queuedTarget) === null) return false;
      focusQueuedSwipe.steps += 1;
      focusQueuedSwipe.velocity = Math.max(
        focusQueuedSwipe.velocity,
        Math.max(0.42, Math.min(1.5, Math.abs(velocity || 0)))
      );
      return true;
    }
    if (getBoundedFocusSwipeIndex(baseIndex + direction) === null) return false;
    focusQueuedSwipe = {
      direction,
      velocity: Math.max(0.42, Math.min(1.5, Math.abs(velocity || 0))),
      steps: 1
    };
    return true;
  }

  function startQueuedFocusMainSwipe(completedIndex) {
    const queued = focusQueuedSwipe;
    if (!queued || getBoundedFocusSwipeIndex(completedIndex + queued.direction) === null) {
      clearFocusQueuedSwipe();
      return false;
    }
    focusQueuedSwipe = queued.steps > 1
      ? { ...queued, steps: queued.steps - 1 }
      : null;
    clearFocusMainSwipe();
    if (!configureFocusMainSwipe(queued.direction)) return false;
    focusMainSwipe.chained = true;
    focusMainTouchVelocityX = (queued.direction > 0 ? -1 : 1) * queued.velocity;
    setFocusMainSwipeFrame(0, queued.direction);
    const targetOffset = (queued.direction > 0 ? -1 : 1) * focusMainSwipe.travel;
    startFocusMainSwipeAnimation(targetOffset, true);
    return true;
  }

  function interruptFocusMainSwipeForNewGesture() {
    focusMainSwipeClearSequence += 1;
    if (focusMainSwipe.active && focusMainSwipe.animating && !focusMainSwipe.handoffPending) {
      const continuationDirection = focusMainSwipe.commit ? focusMainSwipe.direction : 0;
      cancelFocusMainSwipeAnimation();
      focusMainSwipe.commit = false;
      shell.classList.add("is-main-swiping");
      return {
        offset: focusMainSwipe.offset || 0,
        continuationDirection
      };
    }
    if (focusMainSwipe.active
      && !focusMainSwipe.handoffPending
      && !shell.classList.contains("is-main-swipe-handoff")
      && !shell.classList.contains("is-main-swipe-fading")
      && !shell.classList.contains("is-main-swipe-returning")) {
      return {
        offset: focusMainSwipe.offset || 0,
        continuationDirection: 0
      };
    }
    clearFocusQueuedSwipe();
    clearFocusMainSwipe();
    window.clearTimeout(focusSwipeSyncTimer);
    focusSwipeSyncTimer = 0;
    focusMainSwipeLockUntil = 0;
    focusSyncHoldUntil = 0;
    return { offset: 0, continuationDirection: 0 };
  }

  function isFocusMainSwipeBusy() {
    return focusMainSwipe.active
      || focusMainSwipe.animating
      || focusMainTouchMode === "horizontal"
      || shell.classList.contains("is-main-swipe-handoff")
      || shell.classList.contains("is-main-swipe-fading")
      || shell.classList.contains("is-main-swipe-returning");
  }

  function clearFocusMainSwipe(options = {}) {
    cancelFocusMainSwipeAnimation();
    focusMainSwipe.active = false;
    focusMainSwipe.offset = 0;
    focusMainSwipe.progress = 0;
    focusMainSwipe.direction = 0;
    focusMainSwipe.axis = getFocusMainSwipeAxis();
    focusMainSwipe.fromIndex = Number(shell.dataset.activeIndex || 0);
    focusMainSwipe.targetIndex = focusMainSwipe.fromIndex;
    focusMainSwipe.edge = false;
    focusMainSwipe.commit = false;
    focusMainSwipe.chained = false;
    focusMainSwipe.handoffPending = false;
    focusMainSwipe.railReady = false;
    focusMainSwipe.railAxis = "";
    shell.classList.remove("is-main-swiping", "is-main-swipe-animating", "is-main-swipe-edge");
    if (!options.keepHandoff) shell.classList.remove("is-main-swipe-handoff");
    if (!options.keepFade) shell.classList.remove("is-main-swipe-fading");
    if (!options.keepReturn) shell.classList.remove("is-main-swipe-returning");
    if (!options.keepFrame) {
      shell.style.removeProperty("--focus-swipe-current-x");
      shell.style.removeProperty("--focus-swipe-current-y");
      shell.style.removeProperty("--focus-swipe-next-x");
      shell.style.removeProperty("--focus-swipe-next-y");
      shell.style.removeProperty("--focus-swipe-progress");
      shell.style.removeProperty("--focus-swipe-current-opacity");
      shell.style.removeProperty("--focus-swipe-next-opacity");
      shell.style.removeProperty("--focus-swipe-current-scale");
      shell.style.removeProperty("--focus-swipe-next-scale");
      shell.style.removeProperty("--focus-swipe-notes-opacity");
      shell.style.removeProperty("--focus-swipe-line-opacity");
      shell.style.removeProperty("--focus-swipe-notes-x");
      shell.style.removeProperty("--focus-swipe-notes-y");
      imageToggle.querySelectorAll(".focus-swipe-layer img").forEach((swipeImage) => {
        clearFocusSwipeImage(swipeImage);
      });
    }
  }

  function finishCancelledFocusMainSwipe() {
    clearFocusQueuedSwipe();
    const clearRunId = ++focusMainSwipeClearSequence;
    if (focusMainSwipe.direction) setFocusMainSwipeFrame(0, focusMainSwipe.direction);
    shell.classList.add("is-main-swipe-returning");
    requestAnimationFrame(() => {
      if (clearRunId !== focusMainSwipeClearSequence) return;
      clearFocusMainSwipe({ keepFrame: true, keepReturn: true });
      window.setTimeout(() => {
        if (clearRunId !== focusMainSwipeClearSequence) return;
        clearFocusMainSwipe();
      }, 160);
    });
  }

  function configureFocusMainSwipe(direction) {
    if (!direction || photos.length < 2) return false;
    cancelFocusImageSwitch({ restoreVisualSelection: true });
    focusMainSwipeClearSequence += 1;
    const fromIndex = Number(shell.dataset.activeIndex || 0);
    const targetIndex = getBoundedFocusSwipeIndex(fromIndex + direction);
    const isEdgeSwipe = targetIndex === null;
    const photo = isEdgeSwipe ? null : photos[targetIndex];
    if (!isEdgeSwipe && !photo) return false;
    const { current, next } = ensureFocusMainSwipeLayer();
    shell.classList.remove("is-main-swipe-handoff", "is-main-swipe-fading", "is-main-swipe-returning", "is-main-swipe-edge");
    preloadFocusDirection(fromIndex, direction, 3);
    setFocusSwipeImage(current, photos[fromIndex]);
    if (isEdgeSwipe) {
      clearFocusSwipeImage(next);
    } else {
      setFocusSwipeImage(next, photo);
    }
    focusMainSwipe.active = true;
    focusMainSwipe.axis = getFocusMainSwipeAxis();
    focusMainSwipe.direction = direction;
    focusMainSwipe.fromIndex = fromIndex;
    focusMainSwipe.targetIndex = isEdgeSwipe ? fromIndex : targetIndex;
    focusMainSwipe.edge = isEdgeSwipe;
    focusMainSwipe.chained = false;
    focusMainSwipe.handoffPending = false;
    const travelMetrics = getFocusMainSwipeTravelMetrics(fromIndex, focusMainSwipe.targetIndex, focusMainSwipe.axis, isEdgeSwipe, direction);
    focusMainSwipe.extent = travelMetrics.extent;
    focusMainSwipe.travel = travelMetrics.travel;
    configureFocusMainSwipeRail(focusMainSwipe.targetIndex, isEdgeSwipe);
    shell.classList.add("is-main-swiping");
    shell.classList.toggle("is-main-swipe-edge", isEdgeSwipe);
    return true;
  }

  function advanceFocusMainSwipeDuringDrag(direction, overflow) {
    if (!focusMainSwipe.active || focusMainSwipe.edge) {
      return { offset: focusMainSwipe.offset || 0, advanced: false };
    }
    const completedIndex = focusMainSwipe.targetIndex;
    const travel = focusMainSwipe.travel || focusMainSwipe.extent || getFocusMainSwipeExtent(focusMainSwipe.axis);
    const finalOffset = direction > 0 ? -travel : travel;
    setFocusMainSwipeFrame(finalOffset, direction);
    clearFocusQueuedSwipe();
    focusMainSwipeClearSequence += 1;
    cancelFocusMainSwipeAnimation();
    setFocus(completedIndex, true, { instant: true, source: "swipe" });
    lockFocusRailAfterMainSwipe(completedIndex);
    clearFocusMainSwipe({ keepFrame: true });
    if (!configureFocusMainSwipe(direction)) {
      clearFocusMainSwipe();
      return { offset: 0, advanced: true };
    }
    focusMainSwipe.chained = true;
    const nextTravel = focusMainSwipe.travel || focusMainSwipe.extent || getFocusMainSwipeExtent(focusMainSwipe.axis);
    const nextOffset = focusMainSwipe.edge
      ? Math.max(-nextTravel, Math.min(nextTravel, overflow * 0.36))
      : Math.max(-nextTravel * 0.94, Math.min(nextTravel * 0.94, overflow));
    setFocusMainSwipeFrame(nextOffset, direction);
    return { offset: nextOffset, advanced: true };
  }

  function updateFocusMainSwipeDrag(offset, allowAdvance = false) {
    if (photos.length < 2) return { offset: 0, advanced: false };
    if (!offset) {
      if (focusMainSwipe.active && focusMainSwipe.direction) {
        setFocusMainSwipeFrame(0, focusMainSwipe.direction);
      }
      return { offset: 0, advanced: false };
    }
    const direction = offset < 0 ? 1 : -1;
    if (!focusMainSwipe.active || focusMainSwipe.direction !== direction) {
      if (!configureFocusMainSwipe(direction)) return { offset: 0, advanced: false };
    }
    const travel = focusMainSwipe.travel || focusMainSwipe.extent || getFocusMainSwipeExtent(focusMainSwipe.axis);
    const finalOffset = direction > 0 ? -travel : travel;
    if (allowAdvance && !focusMainSwipe.edge && Math.abs(offset) >= travel) {
      return advanceFocusMainSwipeDuringDrag(direction, offset - finalOffset);
    }
    const dragLimit = travel * 0.94;
    const edgeLimit = travel;
    const nextOffset = focusMainSwipe.edge
      ? Math.max(-edgeLimit, Math.min(edgeLimit, offset * 0.36))
      : Math.max(-dragLimit, Math.min(dragLimit, offset));
    setFocusMainSwipeFrame(nextOffset, direction);
    return { offset: nextOffset, advanced: false };
  }

  function commitFocusMainSwipe(targetIndex) {
    const clearRunId = ++focusMainSwipeClearSequence;
    let didFinishClear = false;
    const finishClear = () => {
      if (clearRunId !== focusMainSwipeClearSequence) return;
      if (didFinishClear) return;
      didFinishClear = true;
      if (startQueuedFocusMainSwipe(targetIndex)) return;
      shell.classList.add("is-main-swipe-handoff");
      requestAnimationFrame(() => {
        if (clearRunId !== focusMainSwipeClearSequence) return;
        clearFocusMainSwipe({ keepHandoff: true, keepFrame: true });
        requestAnimationFrame(() => {
          if (clearRunId !== focusMainSwipeClearSequence) return;
          shell.classList.remove("is-main-swipe-handoff");
          shell.classList.add("is-main-swipe-fading");
          window.setTimeout(() => {
            if (clearRunId !== focusMainSwipeClearSequence) return;
            clearFocusMainSwipe();
          }, 420);
        });
      });
    };
    focusMainSwipe.handoffPending = true;
    setFocus(targetIndex, true, { instant: true, source: "swipe" });
    lockFocusRailAfterMainSwipe(targetIndex);
    if (focusQueuedSwipe && startQueuedFocusMainSwipe(targetIndex)) return;
    waitForImageDecoded(image, 0).then((ready) => {
      if (ready) finishClear();
    });
  }

  function startFocusMainSwipeAnimation(toOffset, commit = false) {
    if (!focusMainSwipe.active) return;
    cancelFocusMainSwipeAnimation();
    focusMainSwipe.animating = true;
    focusMainSwipe.startedAt = performance.now();
    focusMainSwipe.fromOffset = focusMainSwipe.offset || 0;
    focusMainSwipe.toOffset = toOffset;
    focusMainSwipe.commit = Boolean(commit);
    const distance = Math.abs(focusMainSwipe.toOffset - focusMainSwipe.fromOffset);
    if (distance < 0.5) {
      focusMainSwipe.animating = false;
      focusMainSwipe.frame = 0;
      if (focusMainSwipe.commit) commitFocusMainSwipe(focusMainSwipe.targetIndex);
      else clearFocusMainSwipe();
      return;
    }
    const velocity = Math.abs(focusMainTouchVelocityX || 0);
    const travel = Math.max(1, focusMainSwipe.travel || focusMainSwipe.extent || distance || 1);
    const remainingRatio = Math.max(0.08, Math.min(1, distance / travel));
    const velocityFactor = Math.min(1.6, velocity);
    const distanceFactor = 0.2 + Math.sqrt(remainingRatio) * 0.8;
    const duration = commit
      ? Math.max(120, Math.min(620, (610 - velocityFactor * 72) * distanceFactor))
      : Math.max(110, Math.min(420, (390 - velocityFactor * 46) * distanceFactor));
    shell.classList.add("is-main-swipe-animating");
    const ease = (t) => {
      const smooth = t * t * (3 - 2 * t);
      const glide = 1 - Math.pow(1 - t, 2.35);
      const velocityBlend = Math.min(1, velocityFactor / 1.4);
      const glideWeight = 0.52 + velocityBlend * 0.18;
      return smooth * (1 - glideWeight) + glide * glideWeight;
    };
    const step = (now) => {
      const progress = Math.min(1, (now - focusMainSwipe.startedAt) / duration);
      const nextOffset = focusMainSwipe.fromOffset + (focusMainSwipe.toOffset - focusMainSwipe.fromOffset) * ease(progress);
      setFocusMainSwipeFrame(nextOffset);
      if (progress < 1 && focusMainSwipe.animating) {
        focusMainSwipe.frame = requestAnimationFrame(step);
        return;
      }
      focusMainSwipe.frame = 0;
      focusMainSwipe.animating = false;
      shell.classList.remove("is-main-swipe-animating");
      if (focusMainSwipe.commit) commitFocusMainSwipe(focusMainSwipe.targetIndex);
      else finishCancelledFocusMainSwipe();
    };
    focusMainSwipe.frame = requestAnimationFrame(step);
  }

  function finishFocusMainSwipe(queuedDirection = 0) {
    if (!focusMainSwipe.active || !focusMainSwipe.direction) {
      clearFocusMainSwipe();
      return;
    }
    const extent = focusMainSwipe.extent || getFocusMainSwipeExtent(focusMainSwipe.axis);
    const travel = focusMainSwipe.travel || extent;
    const offset = focusMainSwipe.offset || 0;
    const expectedSign = focusMainSwipe.direction > 0 ? -1 : 1;
    const projectedOffset = offset + focusMainTouchVelocityX * 140;
    const distanceMatches = Math.abs(offset) > extent * 0.13 && Math.sign(offset) === expectedSign;
    const projectedMatches = Math.abs(projectedOffset) > extent * 0.2 && Math.sign(projectedOffset) === expectedSign;
    const velocityMatches = Math.abs(focusMainTouchVelocityX) > 0.32 && Math.sign(focusMainTouchVelocityX) === expectedSign;
    const shouldCommit = !focusMainSwipe.edge && (distanceMatches || projectedMatches || velocityMatches);
    if (shouldCommit && queuedDirection === focusMainSwipe.direction) {
      queueFocusMainSwipe(queuedDirection, focusMainTouchVelocityX);
    }
    const targetOffset = shouldCommit ? (focusMainSwipe.direction > 0 ? -travel : travel) : 0;
    startFocusMainSwipeAnimation(targetOffset, shouldCommit);
  }

  function setNotesOpen(open, options = {}) {
    const isOpen = Boolean(open);
    const wasOpen = shell.classList.contains("is-notes");
    if (wasOpen === isOpen) {
      if (isOpen) updateNotesLayout();
      return;
    }
    if (isOpen) {
      syncFocusNotesBackground(Number(shell.dataset.activeIndex || 0));
      updateNotesLayout();
    }
    window.clearTimeout(focusNotesPaletteTimer);
    const reduceNotesMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const applyNotesPalette = () => document.body.classList.toggle("focus-notes-palette-active", isOpen);
    if (reduceNotesMotion || !document.body.classList.contains("has-loaded")) applyNotesPalette();
    else focusNotesPaletteTimer = window.setTimeout(applyNotesPalette, 460);
    window.clearTimeout(focusNotesTransitionTimer);
    shell.classList.add("is-notes-transitioning");
    shell.classList.toggle("is-notes", isOpen);
    document.body.classList.toggle("focus-notes-open", isOpen);
    imageToggle.setAttribute("aria-expanded", String(isOpen));
    imageToggle.setAttribute("aria-label", isOpen ? "Close notes" : "Open notes");
    if (navToggle) {
      navToggle.setAttribute("aria-label", isOpen ? "Close notes" : document.body.classList.contains("nav-open") ? "Close navigation" : "Open navigation");
    }
    if (focusIndexState.phase === "idle" && focusIndexState.mode !== "index") {
      focusIndexState.mode = isOpen ? "notes" : "rel";
      focusIndexState.returnMode = focusIndexState.mode;
    }
    const transitionCleanupDelay = isOpen ? 1380 : 1120;
    focusNotesTransitionTimer = window.setTimeout(() => {
      shell.classList.remove("is-notes-transitioning");
    }, transitionCleanupDelay);
  }

  function scheduleNotesLayoutUpdate() {
    updateNotesLayout();
    requestAnimationFrame(() => updateNotesLayout());
    requestAnimationFrame(() => requestAnimationFrame(() => updateNotesLayout()));
    window.setTimeout(updateNotesLayout, 180);
  }

  function transitionFocusNoteCopy(update) {
    const canAnimate = noteText
      && shell.classList.contains("is-notes")
      && document.body.classList.contains("has-loaded")
      && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.clearTimeout(focusNoteCopyTransitionTimer);
    shell.classList.remove("is-note-copy-updating", "is-note-copy-swapping", "is-note-copy-returning");
    if (!canAnimate) {
      update();
      scheduleNotesLayoutUpdate();
      return;
    }

    shell.classList.add("is-note-copy-swapping");
    focusNoteCopyTransitionTimer = window.setTimeout(() => {
      update();
      if (shell.classList.contains("is-notes")) {
        updateNotesCopyMetricsOnly();
      } else {
        updateNotesLayout();
      }
      requestAnimationFrame(() => {
        if (shell.classList.contains("is-notes")) {
          updateNotesCopyMetricsOnly();
        } else {
          updateNotesLayout();
        }
        shell.classList.remove("is-note-copy-swapping");
        shell.classList.add("is-note-copy-returning");
        focusNoteCopyTransitionTimer = window.setTimeout(() => {
          shell.classList.remove("is-note-copy-returning");
        }, 240);
      });
    }, 110);
  }

  function updateNotesCopyMetricsOnly() {
    if (!noteText) return;
    const note = noteText.textContent || "";
    const length = [...note].length;
    const isMobile = window.innerWidth <= 768;
    const clamp = (min, value, max) => Math.max(min, Math.min(value, max));
    const notesRect = getFocusRect(document.querySelector("[data-focus-notes]"));
    const currentCopyWidth = getCssPixelValue(shell, "--notes-copy-width", isMobile ? window.innerWidth - 32 : 320);
    const currentCopyGap = getCssPixelValue(shell, "--notes-copy-gap", isMobile ? 14 : 24);
    const locationReserve = noteLocation && !noteLocation.hidden ? 20 : 0;
    const baseCopySize = isMobile ? 1.42 : window.innerWidth < 940 ? 1.34 : 1.46;
    const minCopySize = isMobile ? 1.05 : window.innerWidth < 940 ? 1.06 : 1.12;
    const charWidth = isMobile ? 9.4 : 8.8;
    const charsPerLine = Math.max(isMobile ? 8 : 12, Math.floor(currentCopyWidth / (baseCopySize * charWidth)));
    const copyLines = Math.max(1, Math.ceil(length / charsPerLine));
    const copyAvailableHeight = Math.max(isMobile ? 66 : 140, (notesRect?.height || 180) - currentCopyGap - locationReserve - 12);
    const requiredNotesHeight = copyLines * baseCopySize * 10 * 1.35;
    const copySize = clamp(minCopySize, baseCopySize * Math.min(1, copyAvailableHeight / Math.max(1, requiredNotesHeight)), baseCopySize);
    shell.style.setProperty("--notes-copy-size", `${copySize.toFixed(2)}rem`);
  }

  function updateNotesLayout() {
    if (!noteText) return;
    const active = Number(shell.dataset.activeIndex || 0);
    const photo = photos[active] || photos[0];
    const note = getPhotoNote(photo);
    const length = [...note].length;
    const locationReserve = noteLocation && !noteLocation.hidden ? 20 : 0;
    const isMobile = window.innerWidth <= 768;
    const mainBox = document.querySelector("[data-focus-main]");
    const railBox = thumbs;
    const mainRectForNotes = measureFocusMainBaseRect() || getFocusRect(mainBox);
    const mainWidth = mainRectForNotes?.width || mainBox?.offsetWidth || window.innerWidth * 0.64;
    const mainHeight = mainRectForNotes?.height || mainBox?.offsetHeight || window.innerHeight * 0.62;
    const cachedRatio = getFocusPhotoRatio(active);
    const imageRatio = cachedRatio || (image.naturalWidth && image.naturalHeight ? image.naturalWidth / image.naturalHeight : mainWidth / Math.max(1, mainHeight));
    const clamp = (min, value, max) => Math.max(min, Math.min(value, max));
    const notesImageLineGap = isMobile
      ? clamp(26, window.innerHeight * 0.04, 42)
      : clamp(38, window.innerWidth * 0.038, 76);
    const notesLineCopyGap = isMobile
      ? clamp(13, window.innerHeight * 0.02, 22)
      : clamp(18, window.innerWidth * 0.018, 34);

    if (isMobile) {
      const focusTop = mainRectForNotes ? mainRectForNotes.top : 104;
      const railRect = railBox?.getBoundingClientRect();
      const notesRailShift = getCssLengthValue(shell, "--space-4", 16);
      const railTop = railRect
        ? railRect.top - getElementTranslateY(railBox) + notesRailShift
        : window.innerHeight - 200;
      const lineBottom = Math.max(150, window.innerHeight - railTop + 8);
      const fixedCopyReserve = clamp(88, window.innerHeight * 0.16, 136);
      const maxLineTop = window.innerHeight - lineBottom - fixedCopyReserve;
      const scaleFromRatio = imageRatio < 0.78 ? -0.04 : imageRatio > 1.18 ? 0.015 : 0;
      const basePhotoScale = clamp(0.58, 0.7 + scaleFromRatio, 0.72);
      const shiftY = -clamp(28, mainHeight * 0.085, 48);
      const maxVisualBottom = maxLineTop - notesImageLineGap;
      const maxScaleFromFixedSpace = 2 * (maxVisualBottom - focusTop - shiftY - mainHeight / 2) / Math.max(1, mainHeight);
      const minimumPhotoScale = window.innerHeight <= 620 ? 0.52 : 0.54;
      const photoScale = clamp(minimumPhotoScale, Math.min(basePhotoScale, maxScaleFromFixedSpace), basePhotoScale);
      const visualBottom = focusTop + shiftY + mainHeight - (mainHeight * (1 - photoScale) / 2);
      const lineTop = visualBottom + notesImageLineGap;
      const copyWidth = Math.max(240, window.innerWidth - 32);
      const copyAvailableHeight = Math.max(66, window.innerHeight - lineBottom - lineTop - notesLineCopyGap - locationReserve);
      const baseCopySize = 1.42;
      const charsPerLine = Math.max(8, Math.floor(copyWidth / (baseCopySize * 9.4)));
      const copyLines = Math.max(1, Math.ceil(length / charsPerLine));
      const requiredNotesHeight = copyLines * baseCopySize * 10 * 1.35;
      const copySize = clamp(1.05, baseCopySize * Math.min(1, copyAvailableHeight / Math.max(1, requiredNotesHeight)), baseCopySize);

      shell.style.setProperty("--notes-photo-scale", photoScale.toFixed(3));
      shell.style.setProperty("--notes-photo-shift-y", `${shiftY.toFixed(1)}px`);
      shell.style.setProperty("--notes-line-top", `${lineTop.toFixed(1)}px`);
      shell.style.setProperty("--notes-line-bottom", `${lineBottom.toFixed(1)}px`);
      shell.style.setProperty("--notes-copy-size", `${copySize.toFixed(2)}rem`);
      shell.style.setProperty("--notes-copy-width", `${copyWidth.toFixed(1)}px`);
      shell.style.setProperty("--notes-copy-gap", `${notesLineCopyGap.toFixed(1)}px`);
      shell.style.setProperty("--notes-panel-width", "auto");
      shell.style.setProperty("--notes-photo-shift-x", "0px");
      return;
    }

    const isCompactWide = window.innerWidth < 940;
    const rightInset = clamp(isCompactWide ? 24 : 40, window.innerWidth * 0.035, isCompactWide ? 44 : 80);
    const railRect = railBox?.getBoundingClientRect();
    const railRight = railRect && railRect.width > 0 ? railRect.right : 136;
    const railGap = clamp(isCompactWide ? 22 : 56, window.innerWidth * 0.042, isCompactWide ? 40 : 108);
    const minPanel = isCompactWide ? 252 : 340;
    const maxPanel = Math.max(minPanel, Math.min(isCompactWide ? 292 : 520, window.innerWidth * (isCompactWide ? 0.36 : 0.34)));
    const notesStablePanelWidth = clamp(minPanel, window.innerWidth * (isCompactWide ? 0.32 : 0.3), maxPanel);
    const panelWidth = notesStablePanelWidth;
    const idealCopyWidth = notesStablePanelWidth - notesLineCopyGap - (isCompactWide ? 20 : 32);
    const noteLeft = window.innerWidth - rightInset - panelWidth;
    const leftLimit = railRight + railGap;
    const rightLimit = noteLeft - notesImageLineGap;
    const availablePhotoWidth = Math.max(160, rightLimit - leftLimit);
    const ratioBoost = imageRatio < 0.82 ? 0.08 : imageRatio > 1.35 ? -0.02 : 0;
    const baseMax = clamp(isCompactWide ? 0.54 : 0.74, (isCompactWide ? 0.62 : 0.84) + ratioBoost, isCompactWide ? 0.68 : 0.92);
    const minScale = isCompactWide ? 0.44 : 0.62;
    const photoScale = clamp(minScale, Math.min(baseMax, availablePhotoWidth / Math.max(1, mainWidth)), baseMax);
    const scaledWidth = mainWidth * photoScale;
    const minCenter = leftLimit + scaledWidth / 2;
    const maxCenter = rightLimit - scaledWidth / 2;
    const rightAlignedCenter = rightLimit - scaledWidth / 2;
    const balancedCenter = leftLimit + availablePhotoWidth * (isCompactWide ? 0.52 : 0.66);
    const desiredCenter = clamp(minCenter, Math.min(rightAlignedCenter, balancedCenter), maxCenter);
    const shiftX = desiredCenter - window.innerWidth / 2;
    const copyWidth = clamp(isCompactWide ? 218 : 280, idealCopyWidth, isCompactWide ? 248 : 460);
    const baseCopySize = isCompactWide ? 1.34 : 1.46;
    const charsPerLine = Math.max(12, Math.floor(copyWidth / (baseCopySize * 8.8)));
    const copyLines = Math.max(1, Math.ceil(length / charsPerLine));
    const copyAvailableHeight = Math.max(140, mainHeight - 56 - locationReserve);
    const requiredNotesHeight = copyLines * baseCopySize * 10 * 1.35;
    const copySize = clamp(isCompactWide ? 1.06 : 1.12, baseCopySize * Math.min(1, copyAvailableHeight / Math.max(1, requiredNotesHeight)), baseCopySize);

    shell.style.setProperty("--notes-photo-scale", photoScale.toFixed(3));
    shell.style.setProperty("--notes-photo-shift-x", `${shiftX.toFixed(1)}px`);
    shell.style.setProperty("--notes-photo-shift-y", "0px");
    shell.style.setProperty("--notes-panel-width", `${panelWidth.toFixed(1)}px`);
    shell.style.setProperty("--notes-copy-size", `${copySize.toFixed(2)}rem`);
    shell.style.setProperty("--notes-copy-width", `${copyWidth.toFixed(1)}px`);
    shell.style.setProperty("--notes-copy-gap", `${notesLineCopyGap.toFixed(1)}px`);
    shell.style.removeProperty("--notes-line-top");
    shell.style.removeProperty("--notes-line-bottom");
  }
  function waitForImageReady(img, timeout = 900) {
    return new Promise((resolve) => {
      if (!img) {
        resolve();
        return;
      }
      let finished = false;
      const done = () => {
        if (finished) return;
        finished = true;
        window.clearTimeout(timer);
        resolve();
      };
      const decode = () => {
        if (img.decode) img.decode().then(done).catch(done);
        else done();
      };
      const timer = window.setTimeout(done, timeout);
      if (img.complete && img.naturalWidth > 0) {
        decode();
        return;
      }
      img.addEventListener("load", decode, { once: true });
      img.addEventListener("error", done, { once: true });
    });
  }

  function waitForImageDecoded(img, timeout = 2400) {
    if (!img) return Promise.resolve(false);
    const decoded = new Promise((resolve) => {
      const decode = () => {
        if (img.complete && img.naturalWidth > 0) {
          if (img.decode) img.decode().then(() => resolve(true)).catch(() => resolve(true));
          else resolve(true);
          return;
        }
        img.addEventListener("load", decode, { once: true });
        img.addEventListener("error", () => resolve(false), { once: true });
      };
      decode();
    });
    if (timeout <= 0) return decoded;
    const safety = new Promise((resolve) => {
      window.setTimeout(() => resolve(false), timeout);
    });
    return Promise.race([decoded, safety]);
  }

  function updateFocusNoteContent(photo) {
    if (noteText) noteText.textContent = getPhotoNote(photo);
    if (!noteLocation) return;
    const location = getPhotoLocation(photo);
    noteLocation.textContent = location;
    noteLocation.hidden = !location;
    shell.classList.toggle("has-note-location", Boolean(location));
  }

  function syncFocusNotesBackground(index) {
    const photo = photos[index];
    if (!notesBackground || !photo?.full || !window.AppleMusicBackground?.from) return;
    const currentSource = getFocusImageAbsoluteUrl(image.currentSrc || image.getAttribute("src"));
    const expectedSource = getFocusImageAbsoluteUrl(photo.full);
    const source = image.complete && image.naturalWidth > 0 && currentSource === expectedSource
      ? image
      : photo.full;
    window.AppleMusicBackground.from(source, document.body).catch(() => {});
  }

  function preloadFocusImage(src) {
    if (!src) return Promise.resolve();
    if (focusImagePreloadCache.has(src)) return focusImagePreloadCache.get(src);
    const request = new Promise((resolve) => {
      const next = new Image();
      next.decoding = "async";
      next.onload = () => waitForImageReady(next).then(resolve);
      next.onerror = resolve;
      next.src = src;
    });
    focusImagePreloadCache.set(src, request);
    return request;
  }

  function preloadFocusDirection(index, direction, count = 3) {
    if (!direction) return;
    for (let step = 1; step <= count; step++) {
      const photoIndex = index + direction * step;
      const photo = photos[photoIndex];
      if (!photo) break;
      preloadFocusImage(photo.full);
      hydrateDeferredImage(thumbs.querySelector(`.focus-thumb[data-index="${photoIndex + 1}"] img`));
    }
  }

  function clearFocusSwipeImage(target) {
    if (!target) return;
    target.removeAttribute("src");
    target.removeAttribute("data-swipe-source");
    target.style.removeProperty("background-image");
    target.alt = "";
  }

  function setFocusSwipeImage(target, photo) {
    if (!target || !photo?.full) {
      clearFocusSwipeImage(target);
      return;
    }
    const source = photo.full;
    target.dataset.swipeSource = source;
    target.fetchPriority = "high";
    target.alt = photo.alt || "";
    target.style.backgroundImage = photo.thumb ? `url("${photo.thumb}")` : "none";
    target.src = source;

    const removePlaceholder = () => {
      if (target.dataset.swipeSource !== source || target.naturalWidth <= 0) return;
      const finish = () => {
        if (target.dataset.swipeSource === source) target.style.removeProperty("background-image");
      };
      if (typeof target.decode === "function") target.decode().then(finish).catch(finish);
      else finish();
    };
    if (target.complete) removePlaceholder();
    else target.addEventListener("load", removePlaceholder, { once: true });
  }

  function preloadFocusNeighbors(index) {
    [index - 1, index + 1].forEach((neighborIndex) => {
      const neighbor = photos[neighborIndex];
      if (neighbor?.full) preloadFocusImage(neighbor.full);
    });
  }

  function ensureFocusSwitchHoldImage() {
    let holdImage = imageToggle.querySelector(".focus-switch-hold-image");
    if (holdImage) return holdImage;
    holdImage = document.createElement("img");
    holdImage.className = "focus-switch-hold-image";
    holdImage.alt = "";
    holdImage.decoding = "async";
    holdImage.setAttribute("aria-hidden", "true");
    const swipeLayer = imageToggle.querySelector(".focus-swipe-layer");
    imageToggle.insertBefore(holdImage, swipeLayer || null);
    return holdImage;
  }

  function clearFocusSwitchHandoff() {
    window.clearTimeout(focusSwitchHandoffTimer);
    focusSwitchHandoffTimer = 0;
    shell.classList.remove("is-focus-switch-holding", "is-focus-switch-fading");
    const holdImage = imageToggle.querySelector(".focus-switch-hold-image");
    if (!holdImage) return;
    holdImage.removeAttribute("src");
    holdImage.removeAttribute("width");
    holdImage.removeAttribute("height");
  }

  function getFocusPhotoIndexForSource(source) {
    const absoluteSource = getFocusImageAbsoluteUrl(source);
    if (!absoluteSource) return -1;
    return photos.findIndex((photo) => getFocusImageAbsoluteUrl(photo.full) === absoluteSource);
  }

  function getVisibleFocusPhotoIndex() {
    const holdImage = imageToggle.querySelector(".focus-switch-hold-image");
    const holdOpacity = holdImage ? Number.parseFloat(getComputedStyle(holdImage).opacity || "0") : 0;
    const holdDominates = shell.classList.contains("is-focus-switch-holding")
      || (shell.classList.contains("is-focus-switch-fading") && holdOpacity >= 0.5);
    const visibleSource = holdDominates
      ? holdImage?.currentSrc || holdImage?.getAttribute("src")
      : image.currentSrc || image.getAttribute("src");
    return getFocusPhotoIndexForSource(visibleSource);
  }

  function cancelFocusImageSwitch(options = {}) {
    const hadPendingSwitch = shell.classList.contains("is-switching-image")
      || shell.classList.contains("is-focus-switch-holding")
      || shell.classList.contains("is-focus-switch-fading");
    const visibleIndex = hadPendingSwitch ? getVisibleFocusPhotoIndex() : -1;
    focusSwitchSequence += 1;
    window.clearTimeout(focusSwitchTimer);
    focusSwitchTimer = 0;
    shell.classList.remove("is-switching-image");
    clearFocusSwitchHandoff();
    if (options.restoreVisualSelection && visibleIndex >= 0) {
      const committedIndex = getFocusPhotoIndexForSource(image.currentSrc || image.getAttribute("src"));
      if (visibleIndex !== committedIndex) commitFocusPhoto(photos[visibleIndex], visibleIndex);
      if (visibleIndex !== Number(shell.dataset.activeIndex || 0)) updateFocusChrome(visibleIndex, true);
    }
    return visibleIndex;
  }

  function beginFocusSwitchHandoff() {
    window.clearTimeout(focusSwitchHandoffTimer);
    focusSwitchHandoffTimer = 0;
    const holdImage = ensureFocusSwitchHoldImage();
    const source = image.currentSrc || image.getAttribute("src");
    if (source && holdImage.getAttribute("src") !== source) holdImage.src = source;
    if (image.width > 0) holdImage.width = image.width;
    if (image.height > 0) holdImage.height = image.height;
    shell.classList.remove("is-focus-switch-fading");
    shell.classList.add("is-focus-switch-holding");
  }

  function finishFocusSwitchHandoff(runId) {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (runId !== focusSwitchSequence) return;
      shell.classList.remove("is-focus-switch-holding");
      shell.classList.add("is-focus-switch-fading");
      focusSwitchHandoffTimer = window.setTimeout(() => {
        if (runId === focusSwitchSequence) clearFocusSwitchHandoff();
      }, 320);
    }));
  }

  function preloadFocusImageDecoded(src) {
    if (!src) return Promise.resolve(false);
    const next = new Image();
    next.decoding = "async";
    next.src = src;
    return waitForImageDecoded(next, 0);
  }

  function updateFocusChrome(index, replaceUrl) {
    shell.dataset.activeIndex = String(index);
    if (focusIndexState.phase === "idle" && focusIndexState.mode !== "index") focusIndexState.activeIndex = index;
    hydrateFocusThumbRange(index);
    if (indexEnabled && document.body.classList.contains("has-loaded") && focusIndexState.phase === "idle" && focusIndexState.mode !== "index") {
      scheduleFocusIndexCardWarmup(index);
    }
    thumbs.querySelectorAll(".focus-thumb").forEach((thumb, thumbIndex) => {
      const active = thumbIndex === index;
      thumb.classList.toggle("is-active", active);
    });
    if (replaceUrl) {
      window.history.replaceState({}, "", `focus.html?rel=${index + 1}`);
    }
  }

  function commitFocusPhoto(photo, index) {
    if (photo.width > 0 && photo.height > 0) {
      image.width = photo.width;
      image.height = photo.height;
    }
    image.src = photo.full;
    image.alt = photo.alt;
    caption.textContent = "";
    updateFocusNoteContent(photo);
    title.textContent = photo.title;
    if (shell.classList.contains("is-notes")) syncFocusNotesBackground(index);
    preloadFocusNeighbors(index);
    scheduleNotesLayoutUpdate();
  }

  function setFocus(index, replaceUrl, options = {}) {
    const photo = photos[index];
    if (!photo) return;
    if (options.source !== "swipe") {
      clearFocusQueuedSwipe();
      clearFocusMainSwipe();
    }
    const previousIndex = Number(shell.dataset.activeIndex || 0);
    if (index !== previousIndex) focusLastNavigationDirection = index > previousIndex ? 1 : -1;
    const currentImageSource = getFocusImageAbsoluteUrl(image.currentSrc || image.getAttribute("src"));
    const targetImageSource = getFocusImageAbsoluteUrl(photo.full);
    const imageNeedsCommit = currentImageSource !== targetImageSource;
    const canAnimate = document.body.classList.contains("has-loaded")
      && !options.instant
      && image.getAttribute("src")
      && imageNeedsCommit
      && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isNotesClosing = shell.classList.contains("is-notes-transitioning")
      && !shell.classList.contains("is-notes");
    const hasHeldSwitch = shell.classList.contains("is-focus-switch-holding")
      || shell.classList.contains("is-focus-switch-fading");
    const useHeldSwitch = canAnimate
      && options.source !== "swipe"
      && (isNotesClosing || hasHeldSwitch);
    const switchRunId = ++focusSwitchSequence;
    window.clearTimeout(focusSwitchTimer);

    if (useHeldSwitch) beginFocusSwitchHandoff();
    else clearFocusSwitchHandoff();

    updateFocusChrome(index, replaceUrl);

    if (!canAnimate) {
      shell.classList.remove("is-switching-image");
      commitFocusPhoto(photo, index);
      return;
    }

    if (useHeldSwitch) {
      shell.classList.remove("is-switching-image");
      preloadFocusImage(photo.full);
      preloadFocusImageDecoded(photo.full).then((ready) => {
        if (switchRunId !== focusSwitchSequence) return;
        if (!ready) {
          clearFocusSwitchHandoff();
          commitFocusPhoto(photo, index);
          return;
        }
        commitFocusPhoto(photo, index);
        finishFocusSwitchHandoff(switchRunId);
      });
      return;
    }

    shell.classList.add("is-switching-image");
    focusSwitchTimer = window.setTimeout(() => {
      if (switchRunId === focusSwitchSequence) shell.classList.remove("is-switching-image");
    }, 760);
    const startedAt = performance.now();
    const switchOutDelay = options.source === "swipe" ? 160 : 260;
    preloadFocusImage(photo.full).then(() => {
      const remaining = Math.max(0, switchOutDelay - (performance.now() - startedAt));
      window.setTimeout(() => {
        if (switchRunId !== focusSwitchSequence) return;
        commitFocusPhoto(photo, index);
        requestAnimationFrame(() => {
          if (switchRunId === focusSwitchSequence) {
            window.clearTimeout(focusSwitchTimer);
            shell.classList.remove("is-switching-image");
          }
        });
      }, remaining);
    });
  }

  function cancelFocusRailScroll() {
    if (!focusRailScrollFrame) return;
    cancelAnimationFrame(focusRailScrollFrame);
    focusRailScrollFrame = 0;
  }

  function animateFocusRailTo(left, smooth) {
    cancelFocusRailScroll();
    const clampedLeft = Math.max(0, Math.min(left, mobileRailMaxOffset));
    thumbs.dataset.glideTarget = clampedLeft.toFixed(2);
    thumbs.dataset.glideMode = smooth ? "smooth" : "auto";
    if (!smooth || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      thumbs.scrollLeft = clampedLeft;
      return;
    }
    const startLeft = thumbs.scrollLeft;
    const distance = clampedLeft - startLeft;
    if (Math.abs(distance) < 1) return;
    const duration = Math.max(420, Math.min(920, 420 + Math.abs(distance) * 0.85));
    const startedAt = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const step = (now) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      thumbs.scrollLeft = startLeft + distance * ease(progress);
      if (progress < 1) {
        focusRailScrollFrame = requestAnimationFrame(step);
      } else {
        focusRailScrollFrame = 0;
      }
    };
    focusRailScrollFrame = requestAnimationFrame(step);
  }

  function animateFocusDesktopRailTo(top, smooth) {
    cancelFocusRailScroll();
    const maxTop = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const clampedTop = Math.max(0, Math.min(top, maxTop));
    if (!smooth || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.scrollTo({ top: clampedTop, left: 0, behavior: "auto" });
      return;
    }
    const startTop = window.scrollY || document.documentElement.scrollTop || 0;
    const distance = clampedTop - startTop;
    if (Math.abs(distance) < 1) return;
    const duration = Math.max(360, Math.min(680, 360 + Math.abs(distance) * 0.34));
    const startedAt = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3.2);
    const step = (now) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      window.scrollTo({ top: startTop + distance * ease(progress), left: 0, behavior: "auto" });
      if (progress < 1) focusRailScrollFrame = requestAnimationFrame(step);
      else focusRailScrollFrame = 0;
    };
    focusRailScrollFrame = requestAnimationFrame(step);
  }

  function setFocusManualSelection(index, duration = 1600) {
    focusManualSelectionIndex = index;
    window.clearTimeout(focusManualSelectionTimer);
    focusManualSelectionTimer = window.setTimeout(() => {
      if (focusManualSelectionIndex === index) focusManualSelectionIndex = null;
      focusManualSelectionTimer = 0;
    }, duration);
  }

  function clearFocusManualSelection() {
    window.clearTimeout(focusManualSelectionTimer);
    focusManualSelectionTimer = 0;
    focusManualSelectionIndex = null;
  }

  function glideFocusRailAfterThumbClick(index) {
    const thumb = thumbs.querySelector(`.focus-thumb[data-index="${index + 1}"]`);
    if (!thumb) return;
    setFocusManualSelection(index, 1700);
    thumbs.dataset.glideIndex = String(index + 1);
    scrollToFocusIndex(index, true);
    focusSyncHoldUntil = Date.now() + 1400;
  }

  function lockFocusRailAfterMainSwipe(targetIndex) {
    window.clearTimeout(focusSwipeSyncTimer);
    cancelFocusRailScroll();
    setFocusManualSelection(targetIndex, 520);
    scrollToFocusIndex(targetIndex, false);
    focusMainSwipeLockUntil = Date.now() + 520;
    focusSyncHoldUntil = Date.now() + 520;
    focusSwipeSyncTimer = window.setTimeout(() => {
      if (Number(shell.dataset.activeIndex || 0) !== targetIndex || shell.classList.contains("is-index")) return;
      scrollToFocusIndex(targetIndex, false);
      focusMainSwipeLockUntil = Date.now() + 120;
      focusSyncHoldUntil = Date.now() + 120;
    }, 320);
  }

  function releaseFocusRailUserControl() {
    window.clearTimeout(focusSwipeSyncTimer);
    focusSwipeSyncTimer = 0;
    focusMainSwipeLockUntil = 0;
    focusSyncHoldUntil = 0;
  }

  function holdFocusRailForMainSwipeGesture(duration = 420) {
    cancelFocusRailScroll();
    window.clearTimeout(focusSwipeSyncTimer);
    focusSwipeSyncTimer = 0;
    const currentIndex = Number(shell.dataset.activeIndex || 0);
    setFocusManualSelection(currentIndex, duration);
    focusMainSwipeLockUntil = Date.now() + duration;
    focusSyncHoldUntil = Date.now() + duration;
  }

  function scrollToFocusIndex(index, smooth) {
    const thumb = thumbs.querySelector(`.focus-thumb[data-index="${index + 1}"]`);
    if (!thumb) return;
    focusSyncHoldUntil = Date.now() + (smooth ? 1100 : 320);
    if (window.innerWidth <= 768) {
      updateMobileFocusRail();
      const rect = thumb.getBoundingClientRect();
      const left = thumbs.scrollLeft + rect.left + rect.width / 2 - window.innerWidth / 2;
      thumbs.dataset.glideIndex = String(index + 1);
      animateFocusRailTo(left, smooth);
      return;
    }
    const rect = thumb.getBoundingClientRect();
    const top = window.scrollY + rect.top + rect.height / 2 - window.innerHeight / 2;
    animateFocusDesktopRailTo(top, smooth);
  }

  function updateFocusRailMetrics() {
    const allThumbs = [...thumbs.querySelectorAll(".focus-thumb")];
    focusRailThumbMetrics = allThumbs.map((thumb) => ({
      left: thumb.offsetLeft,
      top: thumb.offsetTop,
      width: thumb.offsetWidth,
      height: thumb.offsetHeight
    }));
    const first = allThumbs[0];
    const last = allThumbs[allThumbs.length - 1];
    if (first && first.offsetHeight > 0) shell.style.setProperty("--first-thumb-height", `${first.offsetHeight}px`);
    if (last && last.offsetHeight > 0) shell.style.setProperty("--last-thumb-height", `${last.offsetHeight}px`);
    if (first && first.offsetWidth > 0) shell.style.setProperty("--first-thumb-width", `${first.offsetWidth}px`);
    if (last && last.offsetWidth > 0) shell.style.setProperty("--last-thumb-width", `${last.offsetWidth}px`);
  }

  function updateMobileFocusRail() {
    if (window.innerWidth > 768) {
      mobileRailMaxOffset = 0;
      return 0;
    }
    mobileRailMaxOffset = Math.max(0, Math.ceil(thumbs.scrollWidth - thumbs.clientWidth));
    return Math.max(0, Math.min(thumbs.scrollLeft, mobileRailMaxOffset));
  }

  function isMobileFocusRailReady(allThumbs) {
    if (window.innerWidth > 768) return true;
    if (!allThumbs.length || !thumbs.clientWidth || thumbs.scrollWidth <= thumbs.clientWidth) return false;
    return focusRailThumbMetrics.length === allThumbs.length
      && focusRailThumbMetrics.every((metric) => metric.width > 0 && metric.height > 0);
  }

  function resetFocusMainTouch() {
    focusMainTouchStartX = 0;
    focusMainTouchStartY = 0;
    focusMainTouchLastX = 0;
    focusMainTouchLastY = 0;
    focusMainTouchLastMoveAt = 0;
    focusMainTouchVelocityX = 0;
    focusMainTouchMode = "";
    focusMainTouchMoved = false;
    focusMainTouchBaseOffset = 0;
    focusMainTouchContinuationDirection = 0;
    focusMainTouchGestureDirection = 0;
  }

  function updateFocusMainTouchVelocity(clientX, eventTime) {
    const now = Number.isFinite(eventTime) ? eventTime : performance.now();
    if (!focusMainTouchLastMoveAt) {
      focusMainTouchLastX = clientX;
      focusMainTouchLastMoveAt = now;
      focusMainTouchVelocityX = 0;
      return;
    }
    const dt = Math.max(8, now - focusMainTouchLastMoveAt);
    const instantVelocity = (clientX - focusMainTouchLastX) / dt;
    focusMainTouchVelocityX = focusMainTouchVelocityX * 0.28 + instantVelocity * 0.72;
    focusMainTouchLastX = clientX;
    focusMainTouchLastMoveAt = now;
  }

  function handleFocusMainTouchStart(event) {
    if (window.innerWidth > 768 || shell.classList.contains("is-index") || !event.touches.length) {
      clearFocusMainSwipe();
      resetFocusMainTouch();
      return;
    }
    const interruption = isFocusMainSwipeBusy()
      ? interruptFocusMainSwipeForNewGesture()
      : { offset: 0, continuationDirection: 0 };
    holdFocusRailForMainSwipeGesture();
    const touch = event.touches[0];
    focusMainTouchStartX = touch.clientX;
    focusMainTouchStartY = touch.clientY;
    focusMainTouchLastX = touch.clientX;
    focusMainTouchLastY = touch.clientY;
    focusMainTouchLastMoveAt = Number.isFinite(event.timeStamp) ? event.timeStamp : performance.now();
    focusMainTouchVelocityX = 0;
    focusMainTouchBaseOffset = interruption.offset;
    focusMainTouchContinuationDirection = interruption.continuationDirection;
    focusMainTouchMode = "";
    focusMainTouchMoved = false;
  }

  function handleFocusMainTouchMove(event) {
    if (window.innerWidth > 768 || shell.classList.contains("is-index") || !event.touches.length) return;
    const touch = event.touches[0];
    const deltaX = touch.clientX - focusMainTouchStartX;
    const deltaY = touch.clientY - focusMainTouchStartY;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    focusMainTouchLastY = touch.clientY;
    updateFocusMainTouchVelocity(touch.clientX, event.timeStamp);

    if (!focusMainTouchMode) {
      if (absX > 3 && absX > absY * 0.72) focusMainTouchMode = "horizontal";
      else if (absY > 10 && absY > absX * 1.18) focusMainTouchMode = "vertical";
    }
    if (focusMainTouchMode === "horizontal") {
      focusMainTouchMoved = true;
      event.preventDefault();
      const gestureDirection = deltaX < 0 ? 1 : -1;
      focusMainTouchGestureDirection = gestureDirection;
      const canAdvance = focusMainTouchContinuationDirection === gestureDirection;
      const dragResult = updateFocusMainSwipeDrag(focusMainTouchBaseOffset + deltaX, canAdvance);
      if (dragResult.advanced) {
        focusMainTouchStartX = touch.clientX;
        focusMainTouchBaseOffset = dragResult.offset;
        focusMainTouchContinuationDirection = 0;
      }
      return;
    }
    if (focusMainTouchMode === "vertical") {
      focusMainTouchMoved = true;
      event.preventDefault();

      if (shell.classList.contains("is-notes")) return;
    }
  }

  function handleFocusMainTouchEnd(event) {
    if (window.innerWidth > 768 || shell.classList.contains("is-index")) {
      resetFocusMainTouch();
      return;
    }
    const touch = event.changedTouches?.[0];
    const endY = touch ? touch.clientY : focusMainTouchLastY;
    const endX = touch ? touch.clientX : focusMainTouchStartX;
    const deltaX = endX - focusMainTouchStartX;
    const deltaY = endY - focusMainTouchStartY;
    const absY = Math.abs(deltaY);
    const absX = Math.abs(deltaX);
    const wasVertical = focusMainTouchMode === "vertical" && (focusMainTouchMoved || absY > 24);
    const wasHorizontal = focusMainTouchMode === "horizontal" && (focusMainTouchMoved || absX > 6);

    if (wasHorizontal) {
      focusMainTouchPreventClickUntil = Date.now() + 520;
      const gestureDirection = focusMainTouchGestureDirection || (deltaX < 0 ? 1 : -1);
      if (focusMainTouchContinuationDirection
        && focusMainTouchContinuationDirection !== gestureDirection) {
        clearFocusQueuedSwipe();
      }
      const queuedDirection = focusMainTouchContinuationDirection === gestureDirection
        && (absX > 28 || Math.abs(focusMainTouchVelocityX) > 0.24)
        ? gestureDirection
        : 0;
      finishFocusMainSwipe(queuedDirection);
    } else if (wasVertical) {
      focusMainTouchPreventClickUntil = Date.now() + 520;
      if (shell.classList.contains("is-notes") && deltaY > 44) {
        setNotesOpen(false, { source: "swipe" });
      } else if (!shell.classList.contains("is-notes") && deltaY < -46) {
        setNotesOpen(true, { source: "swipe" });
      }
    } else {
      if (focusMainSwipe.active && !focusMainSwipe.animating) startFocusMainSwipeAnimation(0, false);
    }
    resetFocusMainTouch();
  }

  function handleFocusMainTouchCancel() {
    if (focusMainSwipe.active) startFocusMainSwipeAnimation(0, false);
    resetFocusMainTouch();
  }

  function handleFocusTouchStart(event) {
    cancelFocusRailScroll();
    clearFocusManualSelection();
    releaseFocusRailUserControl();
    if (window.innerWidth > 768 || !event.touches.length) return;
    const touch = event.touches[0];
    focusTouchStartX = touch.clientX;
    focusTouchStartY = touch.clientY;
    focusTouchLastX = touch.clientX;
    focusTouchMode = "";
  }

  function handleFocusTouchMove(event) {
    if (window.innerWidth > 768 || shell.classList.contains("is-index") || shell.classList.contains("is-notes") || !event.touches.length) return;
    const touch = event.touches[0];
    const deltaX = touch.clientX - focusTouchStartX;
    const deltaY = touch.clientY - focusTouchStartY;
    if (!focusTouchMode) {
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 5) focusTouchMode = "horizontal";
      else if (Math.abs(deltaY) > 5) focusTouchMode = "vertical";
    }
    if (focusTouchMode === "horizontal") {
      event.preventDefault();
      thumbs.scrollLeft = Math.max(0, Math.min(thumbs.scrollLeft + focusTouchLastX - touch.clientX, mobileRailMaxOffset));
      focusTouchLastX = touch.clientX;
    }
  }

  function handleFocusWheel(event) {
    clearFocusManualSelection();
    releaseFocusRailUserControl();
    if (window.innerWidth > 768 || Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
    cancelFocusRailScroll();
    event.preventDefault();
    thumbs.scrollLeft = Math.max(0, Math.min(thumbs.scrollLeft + event.deltaX, mobileRailMaxOffset));
  }

  function scheduleFocusRailSync(duration = 260) {
    focusRailSyncUntil = Math.max(focusRailSyncUntil, performance.now() + duration);
    if (focusRailSyncFrame) return;
    focusRailSyncFrame = requestAnimationFrame(syncFocusFromScroll);
  }

  function syncFocusFromScroll() {
    focusRailSyncFrame = 0;
    if (!document.body.contains(shell)) return;
    const isMobile = window.innerWidth <= 768;
    if (!shell.classList.contains("is-index") && !shell.classList.contains("is-notes")) {
      const allThumbs = [...thumbs.querySelectorAll(".focus-thumb")];
      const viewportCenter = isMobile ? window.innerWidth / 2 : window.innerHeight / 2;
      const range = isMobile ? 220 : 280;
      const maxShift = isMobile ? 24 : 64;
      let activeIndex = Number(shell.dataset.activeIndex || 0);
      let nearestDistance = Infinity;
      let needsAnotherFrame = false;
      const manualSelected = focusManualSelectionIndex !== null && Number(shell.dataset.activeIndex || 0) === focusManualSelectionIndex;
      const syncPaused = isFocusMainSwipeBusy() || manualSelected || Date.now() < focusSyncHoldUntil || Date.now() < focusMainSwipeLockUntil || Date.now() < focusInitialLockUntil || (isMobile && !isMobileFocusRailReady(allThumbs));

      allThumbs.forEach((thumb, index) => {
        const metric = focusRailThumbMetrics[index];
        const rect = metric ? null : thumb.getBoundingClientRect();
        const center = metric
          ? isMobile
            ? metric.left - thumbs.scrollLeft + metric.width / 2
            : metric.top - (window.scrollY || document.documentElement.scrollTop || 0) + metric.height / 2
          : isMobile
            ? rect.left + rect.width / 2
            : rect.top + rect.height / 2;
        const distance = Math.abs(center - viewportCenter);
        const strength = distance < range ? 1 - distance / range : 0;
        const targetShift = strength * strength * maxShift;
        const currentShift = focusShiftPositions.get(thumb) || 0;
        const delta = targetShift - currentShift;
        const shift = Math.abs(delta) <= .04 ? targetShift : currentShift + delta * focusFollowRate;
        if (Math.abs(delta) > .04) needsAnotherFrame = true;
        focusShiftPositions.set(thumb, shift);
        if (Math.abs(shift - currentShift) > .005) thumb.style.setProperty("--focus-shift", `${shift.toFixed(2)}px`);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          activeIndex = index;
        }
      });

      if (!syncPaused && activeIndex !== Number(shell.dataset.activeIndex || 0)) {
        setFocus(activeIndex, true);
      }
      if (needsAnotherFrame || performance.now() < focusRailSyncUntil) {
        focusRailSyncFrame = requestAnimationFrame(syncFocusFromScroll);
        return;
      }
    }
    focusRailSyncUntil = 0;
  }
}

function returnFocusToOverview(rel, immediate) {
  const delay = immediate || window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 360;
  window.setTimeout(() => {
    window.location.href = `index.html?from=rel&rel=${rel}`;
  }, delay);
}
