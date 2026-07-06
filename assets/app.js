let photos = [];
const overviewSkipCells = new Set([2, 7]);
const OVERVIEW_RETURN_STORAGE_KEY = "l4rxx-overview-return";

const languageCopy = {
  en: {
    "nav.overview": "OVERVIEW",
    "nav.work": "WORK",
    "home.about": "l4rxx is a visual maker collecting still moments, weathered surfaces, portraits, screens, and quiet fragments.",
    contact: "CONTACT ME",
    "social.douyin": "TIKTOK",
    "focus.back": "BACK",
    "focus.index": "INDEX",
    "focus.info": "INFO",
    "focus.about": "l4rxx keeps the gallery sparse: a centered frame, a small index, and enough empty space for the image to breathe.",
    "focus.menuAbout": "Every frame here is loaded from the local images folder and addressed through the rel query.",
    rights: "\u00a9 2026 - all rights reserved"
  },
  cn: {
    "nav.overview": "\u603b\u89c8",
    "nav.work": "\u4f5c\u54c1",
    "home.about": "l4rxx \u662f\u4e00\u4f4d\u89c6\u89c9\u521b\u4f5c\u8005\uff0c\u6536\u96c6\u9759\u6b62\u77ac\u95f4\u3001\u98ce\u5316\u8868\u9762\u3001\u8096\u50cf\u3001\u5c4f\u5e55\u4e0e\u5b89\u9759\u788e\u7247\u3002",
    contact: "\u8054\u7cfb\u6211",
    "social.douyin": "\u6296\u97f3",
    "focus.back": "\u8fd4\u56de",
    "focus.index": "\u7d22\u5f15",
    "focus.info": "\u4fe1\u606f",
    "focus.about": "l4rxx \u4fdd\u6301\u753b\u5eca\u7684\u758f\u6717\uff1a\u5c45\u4e2d\u7684\u753b\u9762\u3001\u8f7b\u7684\u7d22\u5f15\uff0c\u4ee5\u53ca\u8ba9\u56fe\u50cf\u547c\u5438\u7684\u7a7a\u767d\u3002",
    "focus.menuAbout": "\u6bcf\u4e00\u5e27\u90fd\u6765\u81ea\u672c\u5730\u56fe\u7247\u6587\u4ef6\u5939\uff0c\u5e76\u901a\u8fc7 rel \u67e5\u8be2\u8fdb\u5165\u3002",
    rights: "\u00a9 2026 - \u4fdd\u7559\u6240\u6709\u6743\u5229"
  }
};


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
  try {
    photos = await loadPhotos();
    const page = document.body.dataset.page;
    if (page === "home") renderOverview();
    if (page === "work") renderWork();
    if (page === "focus") renderFocus();
    startLoadingSequence();
  } catch (error) {
    showGalleryLoadError(error);
  }
});

async function loadPhotos() {
  const response = await fetch("content/photos.json");
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
    alt: photo.alt || `l4rxx photo ${String(id).padStart(2, "0")} - ${title}`,
    original: photo.original || full,
    full,
    thumb,
    date: photo.date || ""
  };
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
    const open = document.body.classList.toggle("nav-open");
    toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    screen.setAttribute("aria-hidden", String(!open));
  });
  screen.addEventListener("click", (event) => {
    if (event.target === screen) {
      document.body.classList.remove("nav-open");
      screen.setAttribute("aria-hidden", "true");
    }
  });
}

function initLanguageSwitch() {
  const switcher = document.querySelector("[data-language-switch]");
  const translatable = [...document.querySelectorAll("[data-i18n]")];
  if (!switcher && !translatable.length) return;

  const buttons = switcher ? [...switcher.querySelectorAll("[data-lang-option]")] : [];
  let saved = "en";
  try {
    saved = localStorage.getItem("l4rxx-language") || "en";
  } catch (error) {
    saved = "en";
  }

  const setLanguage = (language) => {
    const next = language === "cn" ? "cn" : "en";
    document.documentElement.lang = next === "cn" ? "zh-CN" : "en";
    document.body.dataset.language = next;

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

    try {
      localStorage.setItem("l4rxx-language", next);
    } catch (error) {
      return;
    }
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.dataset.langOption));
  });
  setLanguage(saved);
}

function renderOverview() {
  const grid = document.querySelector("[data-overview-grid]");
  if (!grid) return;
  grid.innerHTML = "";
  grid.style.minHeight = "";

  appendOverviewBatch(grid, createOverviewBatch(true), true);
  const isReturning = handleOverviewReturn(grid);
  if (!isReturning) initializeOverviewItems();
  initializeInfinityScroll(grid);

  grid.addEventListener("click", (event) => {
    const link = event.target.closest("a[href*='focus.html?rel=']");
    if (!link || !grid.contains(link)) return;
    storeOverviewReturn(link);
  });
}

function createOverviewBatch(isOriginal = false) {
  const items = [];
  let photoIndex = 0;
  const cellCount = photos.length + (isOriginal ? overviewSkipCells.size : 0);
  for (let cellIndex = 0; cellIndex < cellCount; cellIndex++) {
    if (isOriginal && overviewSkipCells.has(cellIndex)) {
      const spacer = document.createElement("div");
      spacer.className = "overview-item infinity-item--skip infinity-item--batch";
      items.push(spacer);
      continue;
    }

    const photo = photos[photoIndex];
    items.push(createOverviewLink(photo, photoIndex, isOriginal, cellIndex));
    photoIndex++;
  }

  let fillIndex = 0;
  while (items.length % 5 !== 0) {
    const photoIndexToFill = fillIndex % photos.length;
    items.push(createOverviewLink(photos[photoIndexToFill], photoIndexToFill, isOriginal, items.length, "infinity-item--fill"));
    fillIndex++;
  }
  return items;
}

function createOverviewLink(photo, index, isOriginal, cellIndex, extraClass = "") {
  const link = document.createElement("a");
  link.className = `overview-item infinity-item--batch infinity-item--original${extraClass ? ` ${extraClass}` : ""}`;
  if (isOriginal && cellIndex <= 14) link.classList.add("is-visible");
  link.href = `focus.html?rel=${index + 1}`;
  link.dataset.rel = String(index + 1);
  link.innerHTML = `<span class="fs-media"><img src="${photo.thumb}" alt="${photo.alt}" loading="lazy" decoding="async"></span>`;
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
    createdAt: Date.now()
  };
  try {
    sessionStorage.setItem(OVERVIEW_RETURN_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    return;
  }
}

function handleOverviewReturn(grid) {
  const params = new URLSearchParams(window.location.search);
  let state = null;
  try {
    state = JSON.parse(sessionStorage.getItem(OVERVIEW_RETURN_STORAGE_KEY) || "null");
  } catch (error) {
    state = null;
  }

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
      setTimeout(() => target.classList.remove("is-return-target"), 900);
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
  photos.forEach((photo, index) => {
    const item = document.createElement("a");
    item.className = "work-item";
    item.href = `focus.html?rel=${index + 1}`;
    item.style.setProperty("--delay", `${(index % 10) * 0.03}s`);
    item.innerHTML = `
      <span class="work-item__image"><img src="${photo.thumb}" alt="${photo.alt}" loading="lazy" decoding="async"></span>
      <span class="work-item__text">
        <span class="work-item__name">${photo.title}</span>
        <span class="work-item__meta">${photo.category}</span>
      </span>
    `;
    board.appendChild(item);
  });

  document.querySelectorAll("[data-work-view]").forEach((button) => {
    button.addEventListener("click", () => setWorkView(button.dataset.workView));
  });
  setWorkView(new URLSearchParams(window.location.search).get("view") || "grid");
}

function setWorkView(view) {
  const next = view === "list" ? "list" : "grid";
  document.body.setAttribute("data-view", next);
  document.querySelectorAll("[data-work-view]").forEach((button) => {
    button.classList.toggle("is-active", button.dataset.workView === next);
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
  const image = document.querySelector("[data-focus-image]");
  const caption = document.querySelector("[data-focus-caption]");
  const indexToggle = document.querySelector("[data-focus-index]");
  const infoToggle = document.querySelector("[data-focus-info-toggle]");
  const backLink = document.querySelector(".js-back");
  if (!shell || !title || !thumbs || !image || !caption) return;
  let mobileRailMaxOffset = 0;
  let focusSyncHoldUntil = 0;
  let focusTouchStartX = 0;
  let focusTouchStartY = 0;
  let focusTouchLastX = 0;
  let focusTouchMode = "";
  const focusShiftPositions = new Map();
  const focusFollowRate = 0.08;

  photos.forEach((photo, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "focus-thumb";
    button.dataset.index = String(index + 1);
    button.style.setProperty("--delay", `${Math.min(index, 24) * 0.018}s`);
    button.innerHTML = `<span class="focus-thumb__media"><img src="${photo.thumb}" alt="${photo.alt}" loading="eager" decoding="async"></span>`;
    button.addEventListener("click", () => {
      const wasIndexOpen = shell.classList.contains("is-index");
      setFocus(index, true);
      shell.classList.remove("is-index");
      if (wasIndexOpen) requestAnimationFrame(() => scrollToFocusIndex(index, true));
      else scrollToFocusIndex(index, true);
    });
    thumbs.appendChild(button);
  });

  indexToggle?.addEventListener("click", () => {
    const wasIndexOpen = shell.classList.contains("is-index");
    shell.classList.toggle("is-index", !wasIndexOpen);
    shell.classList.remove("is-info");
    requestAnimationFrame(() => {
      if (wasIndexOpen) {
        scrollToFocusIndex(Number(shell.dataset.activeIndex || 0), false);
      } else {
        thumbs.scrollLeft = 0;
        thumbs.scrollTop = 0;
      }
    });
  });
  infoToggle?.addEventListener("click", () => {
    shell.classList.toggle("is-info");
    shell.classList.remove("is-index");
  });
  backLink?.addEventListener("click", (event) => {
    event.preventDefault();
    const activeRel = Number(shell.dataset.activeIndex || 0) + 1;
    try {
      const existing = JSON.parse(sessionStorage.getItem(OVERVIEW_RETURN_STORAGE_KEY) || "null") || {};
      sessionStorage.setItem(OVERVIEW_RETURN_STORAGE_KEY, JSON.stringify({
        rel: activeRel,
        scrollY: Number(existing.scrollY || 0),
        createdAt: Date.now()
      }));
    } catch (error) {
      returnFocusToOverview(activeRel, true);
      return;
    }
    document.body.classList.add("is-focus-leaving");
    window.setTimeout(() => returnFocusToOverview(activeRel, true), 360);
  });
  thumbs.addEventListener("touchstart", handleFocusTouchStart, { passive: true });
  thumbs.addEventListener("touchmove", handleFocusTouchMove, { passive: false });
  thumbs.addEventListener("wheel", handleFocusWheel, { passive: false });
  window.addEventListener("keydown", (event) => {
    const current = Number(shell.dataset.activeIndex || 0);
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      const next = (current + 1) % photos.length;
      setFocus(next, true);
      scrollToFocusIndex(next, true);
    }
    if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      const next = (current - 1 + photos.length) % photos.length;
      setFocus(next, true);
      scrollToFocusIndex(next, true);
    }
    if (event.key === "Escape") shell.classList.remove("is-index", "is-info");
  });

  const rel = Number(new URLSearchParams(window.location.search).get("rel"));
  const initial = Number.isFinite(rel) && rel > 0 ? Math.min(rel - 1, photos.length - 1) : 0;
  focusInitialLockUntil = Date.now() + 1800;
  setFocus(initial, false);
  thumbs.querySelectorAll("img").forEach((thumbImage) => {
    thumbImage.addEventListener("load", () => {
      updateFocusRailMetrics();
      updateMobileFocusRail();
      scrollToFocusIndex(Date.now() < focusInitialLockUntil ? initial : Number(shell.dataset.activeIndex || initial), false);
    }, { once: true });
  });
  requestAnimationFrame(() => {
    updateFocusRailMetrics();
    updateMobileFocusRail();
    scrollToFocusIndex(initial, false);
    window.setTimeout(() => scrollToFocusIndex(initial, false), 520);
    requestAnimationFrame(syncFocusFromScroll);
  });
  window.addEventListener("resize", () => {
    updateFocusRailMetrics();
    updateMobileFocusRail();
    scrollToFocusIndex(Number(shell.dataset.activeIndex || initial), false);
  });

  function setFocus(index, replaceUrl) {
    const photo = photos[index];
    shell.dataset.activeIndex = String(index);
    image.src = photo.full;
    image.alt = photo.alt;
    caption.textContent = `${photo.title} / ${photo.category} / ${index + 1} of ${photos.length}`;
    title.textContent = photo.title;
    thumbs.querySelectorAll(".focus-thumb").forEach((thumb, thumbIndex) => {
      const active = thumbIndex === index;
      thumb.classList.toggle("is-active", active);
    });
    if (replaceUrl) {
      window.history.replaceState({}, "", `focus.html?rel=${index + 1}`);
    }
  }

  function scrollToFocusIndex(index, smooth) {
    const thumb = thumbs.querySelector(`.focus-thumb[data-index="${index + 1}"]`);
    if (!thumb) return;
    focusSyncHoldUntil = Date.now() + (smooth ? 700 : 320);
    if (window.innerWidth <= 768) {
      updateMobileFocusRail();
      const left = thumb.offsetLeft + thumb.offsetWidth / 2 - window.innerWidth / 2;
      const clampedLeft = Math.max(0, Math.min(left, mobileRailMaxOffset));
      thumbs.scrollTo({ left: clampedLeft, behavior: smooth ? "smooth" : "auto" });
      return;
    }
    const rect = thumb.getBoundingClientRect();
    const top = window.scrollY + rect.top + rect.height / 2 - window.innerHeight / 2;
    window.scrollTo({ top, behavior: smooth ? "smooth" : "auto" });
  }

  function updateFocusRailMetrics() {
    const allThumbs = [...thumbs.querySelectorAll(".focus-thumb")];
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
    return allThumbs.every((thumb) => thumb.offsetWidth > 0 && thumb.offsetHeight > 0);
  }

  function handleFocusTouchStart(event) {
    if (window.innerWidth > 768 || !event.touches.length) return;
    const touch = event.touches[0];
    focusTouchStartX = touch.clientX;
    focusTouchStartY = touch.clientY;
    focusTouchLastX = touch.clientX;
    focusTouchMode = "";
  }

  function handleFocusTouchMove(event) {
    if (window.innerWidth > 768 || shell.classList.contains("is-index") || shell.classList.contains("is-info") || !event.touches.length) return;
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
    if (window.innerWidth > 768 || Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
    event.preventDefault();
    thumbs.scrollLeft = Math.max(0, Math.min(thumbs.scrollLeft + event.deltaX, mobileRailMaxOffset));
  }

  function syncFocusFromScroll() {
    if (!document.body.contains(shell)) return;
    const isMobile = window.innerWidth <= 768;
    if (isMobile) updateMobileFocusRail();
    if (!shell.classList.contains("is-index") && !shell.classList.contains("is-info")) {
      const allThumbs = [...thumbs.querySelectorAll(".focus-thumb")];
      const viewportCenter = isMobile ? window.innerWidth / 2 : window.innerHeight / 2;
      const range = isMobile ? 220 : 280;
      const maxShift = isMobile ? 24 : 64;
      let activeIndex = Number(shell.dataset.activeIndex || 0);
      let nearestDistance = Infinity;
      const syncPaused = Date.now() < focusSyncHoldUntil || Date.now() < focusInitialLockUntil || (isMobile && !isMobileFocusRailReady(allThumbs));

      allThumbs.forEach((thumb, index) => {
        const rect = thumb.getBoundingClientRect();
        const center = isMobile ? rect.left + rect.width / 2 : rect.top + rect.height / 2;
        const distance = Math.abs(center - viewportCenter);
        const strength = distance < range ? 1 - distance / range : 0;
        const targetShift = strength * strength * maxShift;
        const currentShift = focusShiftPositions.get(thumb) || 0;
        const shift = currentShift + (targetShift - currentShift) * focusFollowRate;
        focusShiftPositions.set(thumb, shift);
        thumb.style.setProperty("--focus-shift", `${shift.toFixed(2)}px`);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          activeIndex = index;
        }
      });

      if (!syncPaused && activeIndex !== Number(shell.dataset.activeIndex || 0)) {
        setFocus(activeIndex, true);
      }
    }
    requestAnimationFrame(syncFocusFromScroll);
  }
}

function returnFocusToOverview(rel, immediate) {
  const delay = immediate || window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 360;
  window.setTimeout(() => {
    window.location.href = `index.html?from=rel&rel=${rel}`;
  }, delay);
}