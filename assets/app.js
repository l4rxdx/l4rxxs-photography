let photos = [];
let overviewPhotos = [];
let overviewOrder = [];
const DEFAULT_PHOTO_NOTE_CN = "\u8fd9\u5730\u65b9\u672c\u6765\u662f\u7ed9\u6bcf\u4e2a\u7167\u7247\u5199\u70b9\u968f\u8bb0\u7684\uff0c\u4f46\u662f\u53c9\u6ef4\u53c9\u6709\u70b9\u61d2\u6ca1\u5199\u51e0\u4e2a";
const DEFAULT_PHOTO_NOTE_EN = "This space was meant for small notes for each photo, but XDX got lazy and only wrote a few.";
const DEFAULT_PHOTO_NOTE = DEFAULT_PHOTO_NOTE_CN;
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
    "focus.menuAbout": "I tried to stop obsessing over settings and return to the record itself.",
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
    "focus.menuAbout": "\u6211\u8bd5\u7740\u4e0d\u518d\u7ea0\u7ed3\u53c2\u6570\uff0c\u56de\u5f52\u8bb0\u5f55\u672c\u8eab",
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
  initThemeSwitch();
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
    note: photo.note || photo.notes || DEFAULT_PHOTO_NOTE_CN,
    noteCn: photo.noteCn || photo.note_cn || photo.note || photo.notes || DEFAULT_PHOTO_NOTE_CN,
    noteEn: photo.noteEn || photo.note_en || photo.noteEnglish || (isDefaultPhotoNote(photo.note || photo.notes) ? DEFAULT_PHOTO_NOTE_EN : photo.note || photo.notes || DEFAULT_PHOTO_NOTE_EN),
    alt: photo.alt || `l4rxx photo ${String(id).padStart(2, "0")} - ${title}`,
    original: photo.original || full,
    full,
    thumb,
    date: photo.date || ""
  };
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
  const toggle = switcher?.matches("[data-language-toggle]") ? switcher : switcher?.querySelector("[data-language-toggle]");
  let currentLanguage = "en";
  let saved = "en";
  try {
    saved = localStorage.getItem("l4rxx-language") || "en";
  } catch (error) {
    saved = "en";
  }

  const setLanguage = (language) => {
    const next = language === "cn" ? "cn" : "en";
    currentLanguage = next;
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
      localStorage.setItem("l4rxx-language", next);
    } catch (error) {
      return;
    }
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
  let saved = null;
  let themeTransitionTimer = 0;
  try {
    saved = localStorage.getItem("l4rxx-theme");
  } catch (error) {
    saved = null;
  }
  let followsSystem = !saved;

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

  const applyTheme = (theme, animate = false) => {
    const next = theme === "dark" ? "dark" : "light";
    if (animate && next !== currentTheme) startThemeTransition();
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

  const setTheme = (theme, persist = true, animate = true) => {
    applyTheme(theme, animate);
    if (!persist) return;
    followsSystem = false;
    try {
      localStorage.setItem("l4rxx-theme", currentTheme);
    } catch (error) {
      return;
    }
  };

  if (toggle) {
    toggle.addEventListener("click", () => setTheme(currentTheme === "dark" ? "light" : "dark", true, true));
  }

  systemTheme?.addEventListener?.("change", (event) => {
    if (followsSystem) applyTheme(event.matches ? "dark" : "light", true);
  });

  setTheme(saved || getSystemTheme(), Boolean(saved), false);
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

  let fillIndex = 0;
  while (items.length % 5 !== 0) {
    const photoIndexToFill = fillIndex % sourcePhotos.length;
    items.push(createOverviewLink(sourcePhotos[photoIndexToFill], photoIndexToFill, isOriginal, items.length, "infinity-item--fill"));
    fillIndex++;
  }
  return items;
}

function createOverviewLink(photo, index, isOriginal, cellIndex, extraClass = "") {
  const link = document.createElement("a");
  link.className = `overview-item infinity-item--batch infinity-item--original${extraClass ? ` ${extraClass}` : ""}`;
  if (isOriginal && cellIndex <= 14) link.classList.add("is-visible");
  const photoRel = getPhotoRel(photo, index);
  link.href = `focus.html?rel=${photoRel}`;
  link.dataset.rel = String(photoRel);
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

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const isMobile = () => window.innerWidth <= 768;
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

  const handleDeviceOrientation = (event) => {
    const gamma = Number(event.gamma || 0);
    const beta = Number(event.beta || 0);
    const alpha = Number(event.alpha || 0);
    blendMotion(gamma / 38, (beta - 25) / 55, Math.sin(alpha * Math.PI / 180), 0.16);
  };

  const handleDeviceMotion = (event) => {
    const acceleration = event.accelerationIncludingGravity || event.acceleration;
    if (!acceleration) return;
    const x = Number(acceleration.x || 0) / 14;
    const y = Number(acceleration.y || 0) / -18;
    blendMotion(x, y, 0, 0.08);
  };

  const startMotionListening = () => {
    if (motionListening) return;
    motionListening = true;
    window.addEventListener("deviceorientation", handleDeviceOrientation, true);
    window.addEventListener("devicemotion", handleDeviceMotion, true);
  };

  const requestMotionAccess = async () => {
    if (motionPermissionRequested || motionListening) return;
    motionPermissionRequested = true;
    const orientationEvent = window.DeviceOrientationEvent;
    const motionEvent = window.DeviceMotionEvent;
    try {
      if (orientationEvent && typeof orientationEvent.requestPermission === "function") {
        const state = await orientationEvent.requestPermission();
        if (state !== "granted") return;
      }
      if (motionEvent && typeof motionEvent.requestPermission === "function") {
        const state = await motionEvent.requestPermission();
        if (state !== "granted") return;
      }
      startMotionListening();
    } catch (error) {
      return;
    }
  };

  const setupMotionAccess = () => {
    if (!("DeviceOrientationEvent" in window) && !("DeviceMotionEvent" in window)) return;
    const needsGesture = Boolean(window.DeviceOrientationEvent?.requestPermission || window.DeviceMotionEvent?.requestPermission);
    if (!needsGesture) {
      startMotionListening();
      return;
    }
    window.addEventListener("pointerdown", requestMotionAccess, { once: true, passive: true });
    window.addEventListener("touchend", requestMotionAccess, { once: true, passive: true });
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

  const getRestTargets = (floor, sidePadding, colliders) => {
    const settlingPieces = pieces.filter((piece) => piece.settles !== false);
    const gap = isMobile() ? 9 : 12;
    const totalWidth = settlingPieces.reduce((sum, piece) => sum + piece.width, 0) + gap * Math.max(0, settlingPieces.length - 1);
    const maxHeight = settlingPieces.reduce((height, piece) => Math.max(height, piece.height), 0);
    const lowerTop = window.innerHeight * (isMobile() ? 0.56 : 0.58);
    const lowerBottom = Math.max(lowerTop, floor - maxHeight - (isMobile() ? 4 : 8));
    const preferredY = clamp(window.innerHeight * (isMobile() ? 0.76 : 0.74), lowerTop, lowerBottom);
    const currentGroup = settlingPieces.reduce((sum, piece) => ({
      x: sum.x + piece.x + piece.width / 2,
      y: sum.y + piece.y + piece.height / 2
    }), { x: 0, y: 0 });
    currentGroup.x /= Math.max(1, settlingPieces.length);
    currentGroup.y /= Math.max(1, settlingPieces.length);

    const padding = isMobile() ? 26 : 34;
    const blockedRects = colliders.map((collider) => ({
      left: collider.rect.left - padding,
      right: collider.rect.right + padding,
      top: collider.rect.top - padding,
      bottom: collider.rect.bottom + padding
    }));
    const overlapsPhoto = (rect) => blockedRects.some((blocked) => {
      return rect.right > blocked.left && rect.left < blocked.right && rect.bottom > blocked.top && rect.top < blocked.bottom;
    });
    const candidateXs = [
      currentGroup.x - totalWidth / 2,
      (window.innerWidth - totalWidth) / 2,
      window.innerWidth * 0.18,
      window.innerWidth * 0.32,
      window.innerWidth * 0.5 - totalWidth / 2,
      window.innerWidth * 0.68 - totalWidth,
      window.innerWidth * 0.82 - totalWidth
    ];
    const candidateYs = [
      preferredY,
      window.innerHeight * 0.64,
      window.innerHeight * 0.7,
      window.innerHeight * 0.8,
      lowerBottom
    ];

    let best = null;
    candidateYs.forEach((rawY) => {
      candidateXs.forEach((rawX) => {
        const x = clamp(rawX, sidePadding, Math.max(sidePadding, window.innerWidth - sidePadding - totalWidth));
        const y = clamp(rawY, lowerTop, lowerBottom);
        const rect = { left: x, right: x + totalWidth, top: y, bottom: y + maxHeight };
        if (overlapsPhoto(rect)) return;
        const centerX = x + totalWidth / 2;
        const centerY = y + maxHeight / 2;
        const score = Math.hypot(centerX - currentGroup.x, centerY - currentGroup.y) * 0.58 + Math.abs(y - preferredY) * 0.42;
        if (!best || score < best.score) best = { x, y, score };
      });
    });

    if (!best) return new Map();
    const targetGroup = best;
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
    return targets;
  };

  const avoidPhotosSoftly = (piece, colliders, dt) => {
    colliders.forEach((collider) => {
      const padding = isMobile() ? 18 : 24;
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

  const collideLetters = (dt) => {
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

          if (overlapX < overlapY) {
            const effectiveOverlap = overlapX - slop;
            if (effectiveOverlap <= 0) continue;
            const direction = firstCenterX < secondCenterX ? -1 : 1;
            const push = (effectiveOverlap * 0.62 + 0.62) * dt;
            const relativeSpeed = Math.abs(first.vx - second.vx);
            const reboundScale = ((first.rebound || 1) + (second.rebound || 1)) * 0.5;
            const rebound = clamp(0.18 + relativeSpeed * 0.2 + effectiveOverlap * 0.016, 0.14, isMobile() ? 0.72 : 0.92) * reboundScale * dt;
            first.x += direction * push * firstShare;
            second.x -= direction * push * secondShare;
            first.vx += direction * rebound * firstShare;
            second.vx -= direction * rebound * secondShare;
            first.vx *= 0.86;
            second.vx *= 0.86;
            first.va += direction * rebound * 0.018;
            second.va -= direction * rebound * 0.018;
          } else {
            const effectiveOverlap = overlapY - slop;
            if (effectiveOverlap <= 0) continue;
            const direction = firstCenterY < secondCenterY ? -1 : 1;
            const push = (effectiveOverlap * 0.6 + 0.58) * dt;
            const relativeSpeed = Math.abs(first.vy - second.vy);
            const reboundScale = ((first.rebound || 1) + (second.rebound || 1)) * 0.5;
            const rebound = clamp(0.16 + relativeSpeed * 0.17 + effectiveOverlap * 0.014, 0.12, isMobile() ? 0.64 : 0.82) * reboundScale * dt;
            first.y += direction * push * firstShare;
            second.y -= direction * push * secondShare;
            first.vy += direction * rebound * firstShare;
            second.vy -= direction * rebound * secondShare;
            first.vy *= 0.82;
            second.vy *= 0.82;
            first.va += (firstCenterX < secondCenterX ? -1 : 1) * rebound * 0.014;
            second.va -= (firstCenterX < secondCenterX ? -1 : 1) * rebound * 0.014;
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
    const groupHasNaturallyDropped = groupCenterY > window.innerHeight * (isMobile() ? 0.58 : 0.6) || settlingPieces.some((piece) => piece.floorHits > 0);
    const shouldSettle = settleAge > 0 && idleAge > (isMobile() ? 520 : 680) && groupHasNaturallyDropped;
    const restTargets = getRestTargets(floor, sidePadding, colliders);
    let touchedItem = null;

    pieces.forEach((piece, index) => {
      piece.onFloor = false;
      if (piece.sleeping && Math.abs(scrollDelta) < 1.5 && !shouldSettle) {
        piece.vx = 0;
        piece.vy = 0;
        piece.va = 0;
        piece.angle += (piece.restAngle - piece.angle) * 0.055;
        setPieceTransform(piece);
        return;
      }

      if (Math.abs(scrollDelta) >= 1.5) piece.sleeping = false;
      piece.vy += (gravity + scrollForce) * dt;
      piece.vx += motionInfluence.x * (isMobile() ? 0.052 : 0.034) * dt;
      piece.vy += motionInfluence.y * (isMobile() ? 0.034 : 0.022) * dt;
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

    collideLetters(dt);
    pieces.forEach((piece) => {
      const minY = piece.type === "figure" ? -piece.height * 1.35 : 0;
      piece.x = clamp(piece.x, sidePadding, Math.max(sidePadding, window.innerWidth - sidePadding - piece.width));
      piece.y = clamp(piece.y, minY, Math.max(minY, floor - piece.height));
      setPieceTransform(piece);
    });

    setActiveItem(touchedItem || getNearestCollider(colliders), colliders);
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
    window.removeEventListener("touchend", requestMotionAccess);
    applyIdleState();
  };
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
  const noteText = document.querySelector("[data-focus-note-text]");
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
  const focusShiftPositions = new Map();
  const focusFollowRate = 0.08;
  let focusSwitchToken = 0;
  let focusSwitchTimer = 0;
  let returnToNotesAfterIndex = false;
  let focusIndexTransitionTimer = 0;
  let focusRailScrollFrame = 0;
  let focusManualSelectionIndex = null;
  let focusManualSelectionTimer = 0;
  let focusIndexAnimations = [];
  let focusIndexHandoffTimer = 0;
  let focusIndexHiddenCardTimer = 0;
  let focusIndexStartTimer = 0;
  let focusIndexMainReleaseTimer = 0;
  let focusMainDockedIndex = null;
  const focusPhotoRatios = new Map();
  const indexEnabled = Boolean(indexToggle);
  const indexGallery = indexEnabled ? document.createElement("section") : null;
  if (indexGallery) {
    indexGallery.className = "focus-index-gallery";
    indexGallery.dataset.focusIndexGallery = "";
    indexGallery.setAttribute("aria-label", "Photo index gallery");
    indexGallery?.setAttribute("aria-hidden", "true");
    shell.insertBefore(indexGallery, shell.querySelector(".focus-actions"));
  }
  photos.forEach((photo, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "focus-thumb";
    button.dataset.index = String(index + 1);
    button.style.setProperty("--delay", `${Math.min(index, 24) * 0.018}s`);
    button.innerHTML = `<span class="focus-thumb__media"><img src="${photo.thumb}" alt="${photo.alt}" loading="eager" decoding="async"></span>`;
    const thumbImage = button.querySelector("img");
    thumbImage?.addEventListener("load", () => rememberFocusPhotoRatio(index, thumbImage), { once: true });
    if (thumbImage?.complete) requestAnimationFrame(() => rememberFocusPhotoRatio(index, thumbImage));
    button.addEventListener("click", () => {
      if (shell.classList.contains("is-index")) return;
      setFocus(index, true);
      setNotesOpen(false);
      glideFocusRailAfterThumbClick(index);
    });
    thumbs.appendChild(button);

    if (indexGallery) {
      const indexButton = document.createElement("button");
      indexButton.type = "button";
      indexButton.className = "focus-index-card";
      indexButton.dataset.index = String(index + 1);
      indexButton.style.setProperty("--delay", `${Math.min(index, 28) * 0.012}s`);
      indexButton.innerHTML = `<span class="focus-index-card__media"><img src="${photo.full}" alt="${photo.alt}" loading="eager" decoding="async"></span>`;
      const indexImage = indexButton.querySelector("img");
      indexImage?.addEventListener("load", () => rememberFocusPhotoRatio(index, indexImage), { once: true });
      if (indexImage?.complete) requestAnimationFrame(() => rememberFocusPhotoRatio(index, indexImage));
      indexButton.addEventListener("click", () => selectFocusIndexCard(index));
      indexGallery.appendChild(indexButton);
    }
  });

  indexToggle?.addEventListener("click", () => {
    if (!indexEnabled) return;
    const activeIndex = Number(shell.dataset.activeIndex || 0);
    if (shell.classList.contains("is-index-closing")) {
      openFocusIndex(activeIndex);
      return;
    }
    if (shell.classList.contains("is-index")) {
      closeFocusIndex(activeIndex, { restoreNotes: returnToNotesAfterIndex });
      return;
    }
    openFocusIndex(activeIndex);
  });
  imageToggle.addEventListener("click", () => {
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
    const activeIndex = Number(shell.dataset.activeIndex || 0);
    const activeRel = activeIndex + 1;
    if (shell.classList.contains("is-index")) {
      closeFocusIndex(activeIndex, { restoreNotes: returnToNotesAfterIndex });
      return;
    }
    try {
      const existing = JSON.parse(sessionStorage.getItem(OVERVIEW_RETURN_STORAGE_KEY) || "null") || {};
      sessionStorage.setItem(OVERVIEW_RETURN_STORAGE_KEY, JSON.stringify({
        rel: activeRel,
        scrollY: Number(existing.scrollY || 0),
        createdAt: Date.now(),
        order: Array.isArray(existing.order) ? existing.order : undefined
      }));
    } catch (error) {
      returnFocusToOverview(activeRel, true);
      return;
    }
    document.body.classList.add("is-focus-leaving");
    window.setTimeout(() => returnFocusToOverview(activeRel, true), 360);
  });
  window.addEventListener("wheel", clearFocusManualSelection, { passive: true });
  thumbs.addEventListener("touchstart", handleFocusTouchStart, { passive: true });
  thumbs.addEventListener("touchmove", handleFocusTouchMove, { passive: false });
  thumbs.addEventListener("wheel", handleFocusWheel, { passive: false });
  window.addEventListener("keydown", (event) => {
    const current = Number(shell.dataset.activeIndex || 0);
    if (shell.classList.contains("is-index")) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeFocusIndex(current, { restoreNotes: returnToNotesAfterIndex });
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
    updateNotesLayout();
    scrollToFocusIndex(Number(shell.dataset.activeIndex || initial), false);
  });
  window.addEventListener("l4rxx:languagechange", () => {
    const active = Number(shell.dataset.activeIndex || initial);
    const activePhoto = photos[active] || photos[0];
    if (noteText) noteText.textContent = getPhotoNote(activePhoto);
    updateNotesLayout();
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
    return getRectRatio(fallbackRect) || getImageElementRatio(image) || getRectRatio(getFocusRect(image)) || 1;
  }

  function getCssPixelValue(node, name, fallback = 0) {
    const value = getComputedStyle(node).getPropertyValue(name).trim();
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function getCssNumberValue(node, name, fallback = 1) {
    const value = getComputedStyle(node).getPropertyValue(name).trim();
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
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
      rect = scaleRectFromCenter(rect, 0.985);
    }
    return rect;
  }

  function getFocusImageContentRectForPhoto(photo, index, options = {}) {
    const box = getFocusMainTargetRect({ notes: Boolean(options.notes) }) || getFocusRect(image) || getFocusRect(imageToggle);
    const ratio = getFocusPhotoRatio(index, options.sourceRect);
    if (!box || !ratio) return box;
    return getContentRectWithin(box, ratio);
  }

  function getFocusIndexCardByIndex(index) {
    return indexGallery?.querySelector(`.focus-index-card[data-index="${index + 1}"]`) || null;
  }

  function getFocusIndexCardRect(card) {
    const cardImage = card?.querySelector("img");
    return getFocusRect(cardImage) || getFocusRect(card);
  }

  function getFocusImageAbsoluteUrl(src) {
    if (!src) return "";
    try {
      return new URL(src, window.location.href).href;
    } catch (error) {
      return src;
    }
  }

  function getCurrentFocusIndexTravelLayer() {
    return [...document.querySelectorAll(".focus-index-travel-layer")]
      .reverse()
      .find((layer) => !layer.classList.contains("is-releasing")) || null;
  }

  function getReusableFocusIndexTravelLayer(photo, allowCurrent = false) {
    const expected = getFocusImageAbsoluteUrl(photo?.full || photo?.thumb);
    const layers = [...document.querySelectorAll(".focus-index-travel-layer")].reverse();
    if (!expected) return allowCurrent ? getCurrentFocusIndexTravelLayer() : null;
    return layers.find((layer) => !layer.classList.contains("is-releasing") && getFocusImageAbsoluteUrl(layer.getAttribute("src")) === expected)
      || (allowCurrent ? getCurrentFocusIndexTravelLayer() : null);
  }

  function freezeFocusIndexTravelLayer(layer) {
    if (!layer) return null;
    const rect = getFocusRect(layer);
    if (!rect) return null;
    layer.classList.remove("is-releasing");
    layer.style.opacity = "1";
    layer.style.left = `${rect.left}px`;
    layer.style.top = `${rect.top}px`;
    layer.style.width = `${rect.width}px`;
    layer.style.height = `${rect.height}px`;
    layer.style.transform = "translate3d(0, 0, 0) scaleX(1) scaleY(1)";
    return rect;
  }

  function setFocusMainTravelRect(rect) {
    if (!rect) return null;
    focusMain.classList.add("is-main-traveling");
    focusMain.style.left = `${rect.left}px`;
    focusMain.style.top = `${rect.top}px`;
    focusMain.style.width = `${rect.width}px`;
    focusMain.style.height = `${rect.height}px`;
    focusMain.style.transform = "translate3d(0, 0, 0) scaleX(1) scaleY(1)";
    focusMain.style.opacity = "1";
    focusMain.style.filter = "none";
    focusMain.style.pointerEvents = "none";
    focusMain.style.zIndex = "1300";
    return rect;
  }

  function freezeFocusMainAtCurrentRect() {
    const currentRect = focusMain.classList.contains("is-main-traveling")
      ? getFocusRect(focusMain)
      : getFocusImageContentRect() || getFocusRect(focusMain);
    return setFocusMainTravelRect(currentRect);
  }

  function clearFocusMainTravel() {
    focusMain.classList.remove("is-main-traveling", "is-index-docked", "is-flight-active");
    focusMainDockedIndex = null;
    ["left", "top", "width", "height", "transform", "opacity", "filter", "pointerEvents", "zIndex"].forEach((name) => {
      focusMain.style[name] = "";
    });
    focusMain.style.removeProperty("--focus-flight-duration");
    focusMain.style.removeProperty("--focus-flight-x");
    focusMain.style.removeProperty("--focus-flight-y");
    focusMain.style.removeProperty("--focus-flight-scale");
    imageToggle.style.removeProperty("transform");
    imageToggle.style.removeProperty("transition");
  }

  function dockFocusMainToIndexCard(index, preparedRect = null) {
    const card = getFocusIndexCardByIndex(index);
    const rect = preparedRect || positionFocusIndexGalleryOnActive(index) || getFocusIndexCardRect(card);
    if (!rect) return null;
    setFocusMainTravelRect(rect);
    focusMain.classList.add("is-index-docked");
    focusMainDockedIndex = index;
    card?.classList.add("is-index-hidden", "is-index-anchor");
    return rect;
  }

  function releaseFocusMainToIndexCard(index) {
    const card = getFocusIndexCardByIndex(index);
    if (!card) {
      clearFocusMainTravel();
      return;
    }
    let released = false;
    const release = () => {
      if (released || !shell.classList.contains("is-index") || shell.classList.contains("is-index-closing")) return;
      released = true;
      clearFocusMainTravel();
    };
    card.classList.remove("is-index-hidden", "is-index-anchor");
    requestAnimationFrame(() => requestAnimationFrame(release));
    window.setTimeout(release, 80);
  }

  function animateFocusMainToRect(fromRect, toRect, options = {}) {
    if (!fromRect || !toRect) return null;
    const isMobile = window.innerWidth <= 768;
    const duration = options.duration || (isMobile ? 720 : 860);
    const delay = options.delay || 0;
    const sourceRatio = fromRect.width / Math.max(1, fromRect.height);
    const finalRect = normalizeFocusTravelRect(toRect, sourceRatio) || toRect;
    const dx = finalRect.left - fromRect.left;
    const dy = finalRect.top - fromRect.top;
    const scale = Math.min(finalRect.width / Math.max(1, fromRect.width), finalRect.height / Math.max(1, fromRect.height));
    let startTimer = 0;
    let finishTimer = 0;
    let cancelled = false;
    let cleaned = false;

    setFocusMainTravelRect(fromRect);
    focusMain.classList.remove("is-flight-active");
    imageToggle.style.setProperty("transition", "none", "important");
    imageToggle.style.setProperty("transform", "translate3d(0, 0, 0) scale(1)", "important");
    imageToggle.offsetHeight;

    const clearFlightVisual = () => {
      imageToggle.style.removeProperty("transform");
      imageToggle.style.removeProperty("transition");
    };

    const controller = {
      focusMain: true,
      cancel(cancelOptions = {}) {
        cancelled = true;
        window.clearTimeout(startTimer);
        window.clearTimeout(finishTimer);
        const currentRect = cancelOptions.keepMain ? getFocusRect(imageToggle) || getFocusRect(focusMain) : null;
        imageToggle.removeEventListener("transitionend", handleTransitionEnd);
        focusMain.classList.remove("is-flight-active");
        clearFlightVisual();
        if (cancelOptions.keepMain) setFocusMainTravelRect(currentRect);
        else clearFocusMainTravel();
      }
    };
    focusIndexAnimations.push(controller);

    const cleanup = () => {
      if (cleaned || cancelled) return;
      cleaned = true;
      window.clearTimeout(startTimer);
      window.clearTimeout(finishTimer);
      imageToggle.removeEventListener("transitionend", handleTransitionEnd);
      focusMain.classList.remove("is-flight-active");
      setFocusMainTravelRect(finalRect);
      clearFlightVisual();
      focusIndexAnimations = focusIndexAnimations.filter((item) => item !== controller);
      options.onArrive?.(finalRect);
    };

    const handleTransitionEnd = (event) => {
      if (event.target === imageToggle && event.propertyName === "transform") cleanup();
    };

    const start = () => {
      if (cancelled || cleaned) return;
      imageToggle.addEventListener("transitionend", handleTransitionEnd);
      focusMain.classList.add("is-flight-active");
      imageToggle.style.setProperty("transition", `transform ${duration}ms cubic-bezier(.16, .92, .18, 1)`, "important");
      imageToggle.offsetHeight;
      imageToggle.style.setProperty("transform", `translate3d(${dx}px, ${dy}px, 0) scale(${scale})`, "important");
      finishTimer = window.setTimeout(cleanup, duration + 260);
    };

    if (delay > 0) startTimer = window.setTimeout(start, delay);
    else start();
    return controller;
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
      const galleryRect = indexGallery.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      const targetTop = indexGallery.scrollTop + cardRect.top - galleryRect.top + cardRect.height / 2 - galleryRect.height / 2;
      const maxTop = Math.max(0, indexGallery.scrollHeight - indexGallery.clientHeight);
      indexGallery.scrollTop = Math.max(0, Math.min(targetTop, maxTop));
    };
    align();
    indexGallery.offsetHeight;
    align();
    return getFocusIndexCardRect(card);
  }

  function selectFocusIndexCard(index) {
    if (!shell.classList.contains("is-index")) return;
    closeFocusIndex(index, { restoreNotes: returnToNotesAfterIndex });
  }

  function openFocusIndex(activeIndex) {
    if (!indexEnabled || !indexGallery) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      returnToNotesAfterIndex = shell.classList.contains("is-notes");
      setNotesOpen(false);
      setFocusIndexGalleryActive(activeIndex);
      indexGallery.setAttribute("aria-hidden", "false");
      shell.classList.add("is-index");
      positionFocusIndexGalleryOnActive(activeIndex);
      dockFocusMainToIndexCard(activeIndex);
      return;
    }
    const interruptedNotesReturn = returnToNotesAfterIndex && shell.classList.contains("is-index-closing");
    const mainRect = freezeFocusMainAtCurrentRect() || getFocusImageContentRect();
    cancelFocusIndexAnimations({ keepFocusMain: true });
    returnToNotesAfterIndex = interruptedNotesReturn || shell.classList.contains("is-notes");
    setNotesOpen(false);
    setFocusIndexGalleryActive(activeIndex);
    indexGallery.setAttribute("aria-hidden", "false");
    positionFocusIndexGalleryOnActive(activeIndex);
    shell.classList.add("is-index", "is-index-opening");
    positionFocusIndexGalleryOnActive(activeIndex);
    setIndexTransitioning(1320);
    focusSyncHoldUntil = Date.now() + 1500;
    window.clearTimeout(focusIndexStartTimer);
    let didStartEnter = false;
    const startIndexEnter = () => {
      if (didStartEnter || !shell.classList.contains("is-index-opening")) return;
      didStartEnter = true;
      window.clearTimeout(focusIndexStartTimer);
      const activeTargetRect = positionFocusIndexGalleryOnActive(activeIndex);
      playFocusIndexGalleryEnter(activeIndex, mainRect, activeTargetRect);
    };
    focusIndexStartTimer = window.setTimeout(startIndexEnter, 80);
    requestAnimationFrame(() => {
      positionFocusIndexGalleryOnActive(activeIndex);
      requestAnimationFrame(startIndexEnter);
    });
  }

  function playFocusIndexGalleryEnter(activeIndex, mainRect, preparedTargetRect = null) {
    const cards = [...indexGallery.querySelectorAll(".focus-index-card")];
    const activeCard = getFocusIndexCardByIndex(activeIndex);
    const activeTargetRect = preparedTargetRect || positionFocusIndexGalleryOnActive(activeIndex) || getFocusIndexCardRect(activeCard);
    const isMobile = window.innerWidth <= 768;
    if (activeCard && mainRect && activeTargetRect) {
      activeCard.classList.add("is-index-hidden", "is-index-anchor");
      animateFocusMainToRect(mainRect, activeTargetRect, {
        duration: isMobile ? 780 : 980,
        onArrive: (finalRect) => {
          dockFocusMainToIndexCard(activeIndex, finalRect || activeTargetRect);
          releaseFocusMainToIndexCard(activeIndex);
          shell.classList.remove("is-index-opening");
        }
      });
    } else {
      clearFocusMainTravel();
      shell.classList.remove("is-index-opening");
    }

    cards.forEach((card, visualIndex) => {
      if (visualIndex === activeIndex) return;
      const rect = getFocusIndexCardRect(card);
      if (!rect || !mainRect) return;
      const orderDistance = Math.abs(visualIndex - activeIndex);
      const drift = Math.max(-180, Math.min(180, (visualIndex - activeIndex) * (isMobile ? 8 : 11)));
      const fromCenterX = mainRect.left + mainRect.width / 2 + drift;
      const fromCenterY = mainRect.top + mainRect.height / 2 + (visualIndex % 5 - 2) * (isMobile ? 10 : 16);
      const toCenterX = rect.left + rect.width / 2;
      const toCenterY = rect.top + rect.height / 2;
      const dx = fromCenterX - toCenterX;
      const dy = fromCenterY - toCenterY;
      const scale = Math.max(.36, Math.min(3.2, Math.min(mainRect.width / rect.width, mainRect.height / rect.height) * .72));
      const delay = Math.min(isMobile ? 230 : 320, 58 + orderDistance * (isMobile ? 8 : 11) + (visualIndex % 7) * 13);
      const duration = Math.min(isMobile ? 980 : 1180, (isMobile ? 560 : 640) + Math.hypot(dx, dy) * .18);
      const animation = card.animate([
        {
          transform: `translate(${dx}px, ${dy}px) scale(${scale})`,
          opacity: 0,
          filter: `blur(${Math.min(12, 4 + orderDistance * .25)}px) saturate(.78)`
        },
        {
          transform: "translate(0, 0) scale(1)",
          opacity: 1,
          filter: "blur(0) saturate(1)"
        }
      ], {
        duration,
        delay,
        easing: "cubic-bezier(.18, .92, .2, 1)",
        fill: "both"
      });
      focusIndexAnimations.push(animation);
      animation.finished.then(() => {
        focusIndexAnimations = focusIndexAnimations.filter((item) => item !== animation);
      }).catch(() => {});
    });

    window.setTimeout(() => shell.classList.remove("is-index-opening"), isMobile ? 1220 : 1400);
  }

  function closeFocusIndex(index, options = {}) {
    const targetIndex = Math.max(0, Math.min(index, photos.length - 1));
    if (!indexEnabled || !indexGallery || !shell.classList.contains("is-index")) return;
    setFocusManualSelection(targetIndex, 1800);
    const sourceCard = getFocusIndexCardByIndex(targetIndex);
    const sourceImage = sourceCard?.querySelector("img");
    let sourceRect = targetIndex === focusMainDockedIndex ? freezeFocusMainAtCurrentRect() : getFocusIndexCardRect(sourceCard);
    rememberFocusPhotoRatio(targetIndex, sourceImage);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setFocus(targetIndex, true, { instant: true });
      finishFocusIndexClose(targetIndex, options);
      clearFocusMainTravel();
      return;
    }

    cancelFocusIndexAnimations({ keepFocusMain: true });
    sourceRect = sourceRect || freezeFocusMainAtCurrentRect() || getFocusIndexCardRect(sourceCard);
    sourceCard?.classList.add("is-index-hidden", "is-index-anchor");
    setFocusIndexGalleryActive(targetIndex);
    shell.classList.add("is-index-closing", "is-index-exiting");
    setIndexTransitioning(1260);
    focusSyncHoldUntil = Date.now() + 1500;
    setFocus(targetIndex, true, { instant: true });
    setFocusMainTravelRect(sourceRect);
    if (options.restoreNotes) updateNotesLayout();
    const targetRect = getFocusImageContentRectForPhoto(photos[targetIndex], targetIndex, {
      notes: options.restoreNotes,
      sourceRect: sourceRect
    }) || getFocusMainTargetRect({ notes: options.restoreNotes }) || getFocusRect(imageToggle);

    if (!sourceRect || !targetRect) {
      finishFocusIndexClose(targetIndex, options);
      clearFocusMainTravel();
      return;
    }

    playFocusIndexGalleryExit(targetIndex, sourceRect);
    animateFocusMainToRect(sourceRect, targetRect, {
      duration: window.innerWidth <= 768 ? 820 : 1040,
      onArrive: () => {
        finishFocusIndexClose(targetIndex, options);
        requestAnimationFrame(clearFocusMainTravel);
      }
    });
  }

  function playFocusIndexGalleryExit(targetIndex, sourceRect) {
    const cards = [...indexGallery.querySelectorAll(".focus-index-card")];
    const isMobile = window.innerWidth <= 768;
    cards.forEach((card, visualIndex) => {
      if (visualIndex === targetIndex) return;
      const rect = getFocusIndexCardRect(card);
      if (!rect || !sourceRect) return;
      const orderDistance = Math.abs(visualIndex - targetIndex);
      const fromCenterX = rect.left + rect.width / 2;
      const fromCenterY = rect.top + rect.height / 2;
      const toCenterX = sourceRect.left + sourceRect.width / 2 + (visualIndex - targetIndex) * (isMobile ? 5 : 8);
      const toCenterY = sourceRect.top + sourceRect.height / 2 + (visualIndex % 5 - 2) * (isMobile ? 8 : 12);
      const dx = toCenterX - fromCenterX;
      const dy = toCenterY - fromCenterY;
      const delay = Math.min(isMobile ? 170 : 230, 18 + orderDistance * (isMobile ? 5 : 7) + (visualIndex % 6) * 9);
      const duration = Math.min(isMobile ? 760 : 900, (isMobile ? 420 : 500) + Math.hypot(dx, dy) * .13);
      const animation = card.animate([
        {
          transform: "translate(0, 0) scale(1)",
          opacity: 1,
          filter: "blur(0) saturate(1)"
        },
        {
          transform: `translate(${dx}px, ${dy}px) scale(.68)`,
          opacity: 0,
          filter: `blur(${Math.min(12, 4 + orderDistance * .18)}px) saturate(.78)`
        }
      ], {
        duration,
        delay,
        easing: "cubic-bezier(.2, .78, .22, 1)",
        fill: "forwards"
      });
      focusIndexAnimations.push(animation);
      animation.finished.then(() => {
        focusIndexAnimations = focusIndexAnimations.filter((item) => item !== animation);
      }).catch(() => {});
    });
  }

  function finishFocusIndexClose(index, options = {}) {
    const activeCard = getFocusIndexCardByIndex(index);
    window.clearTimeout(focusIndexHandoffTimer);
    window.clearTimeout(focusIndexHiddenCardTimer);
    window.clearTimeout(focusIndexStartTimer);
    window.clearTimeout(focusIndexMainReleaseTimer);
    shell.classList.add("is-index-handoff");
    if (options.restoreNotes) setNotesOpen(true);
    shell.classList.remove("is-index", "is-index-opening", "is-index-closing", "is-index-exiting");
    indexGallery?.setAttribute("aria-hidden", "true");
    indexGallery?.querySelectorAll(".focus-index-card").forEach((card) => {
      if (card !== activeCard) card.classList.remove("is-index-hidden", "is-index-anchor");
    });
    scrollToFocusIndex(index, false);
    returnToNotesAfterIndex = false;
    const restoreDelay = window.innerWidth <= 768 ? 940 : 900;
    focusIndexHiddenCardTimer = window.setTimeout(() => {
      activeCard?.classList.remove("is-index-hidden", "is-index-anchor");
    }, restoreDelay);
    const releaseMainAfterClose = () => {
      if (!shell.classList.contains("is-index")) clearFocusMainTravel();
    };
    requestAnimationFrame(() => requestAnimationFrame(releaseMainAfterClose));
    focusIndexMainReleaseTimer = window.setTimeout(releaseMainAfterClose, 180);
    focusIndexHandoffTimer = window.setTimeout(() => {
      shell.classList.remove("is-index-handoff");
    }, 360);
  }

  function createFocusIndexTravelLayer(photo, rect, mode = "enter") {
    if (!photo || !rect || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return null;
    const layer = document.createElement("img");
    layer.className = `focus-index-travel-layer is-${mode}`;
    layer.src = photo.full || photo.thumb;
    layer.alt = "";
    layer.setAttribute("aria-hidden", "true");
    layer.style.left = `${rect.left}px`;
    layer.style.top = `${rect.top}px`;
    layer.style.width = `${rect.width}px`;
    layer.style.height = `${rect.height}px`;
    layer.style.transform = "translate3d(0, 0, 0) scaleX(1) scaleY(1)";
    document.body.appendChild(layer);
    return layer;
  }

  function waitForFocusIndexTravelLayerPaint(layer) {
    if (!layer) return Promise.resolve();
    const imageReady = layer.complete
      ? Promise.resolve()
      : new Promise((resolve) => {
        let settled = false;
        const settle = () => {
          if (settled) return;
          settled = true;
          window.clearTimeout(timer);
          layer.removeEventListener("load", settle);
          layer.removeEventListener("error", settle);
          resolve();
        };
        const timer = window.setTimeout(settle, 220);
        layer.addEventListener("load", settle, { once: true });
        layer.addEventListener("error", settle, { once: true });
        layer.decode?.().then(settle).catch(settle);
      });
    return imageReady.then(() => new Promise((resolve) => {
      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        resolve();
      };
      const timer = window.setTimeout(done, 180);
      if (document.visibilityState === "hidden") return;
      requestAnimationFrame(() => requestAnimationFrame(done));
    }));
  }

  function releaseFocusIndexTravelLayer(layer, delay = 0) {
    if (!layer) return;
    window.setTimeout(() => {
      layer.classList.add("is-releasing");
      window.setTimeout(() => layer.remove(), 360);
    }, delay);
  }

  function waitForFocusIndexTransitionReady(ready, timeout = 320) {
    return new Promise((resolve) => {
      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        resolve();
      };
      const timer = window.setTimeout(done, timeout);
      Promise.resolve(ready).then(done).catch(done);
    });
  }

  function waitForFocusIndexLayoutFrame(timeout = 180) {
    return new Promise((resolve) => {
      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        resolve();
      };
      const timer = window.setTimeout(done, timeout);
      if (document.visibilityState === "hidden") return;
      requestAnimationFrame(() => requestAnimationFrame(done));
    });
  }

  function animateFocusIndexTravelLayer(layer, fromRect, toRect, options = {}) {
    if (!layer || !fromRect || !toRect) return null;
    const isMobile = window.innerWidth <= 768;
    const duration = options.duration || (isMobile ? 860 : 980);
    const delay = options.delay || 0;
    const holdDelay = Math.max(0, Number(options.holdDelay || 0));
    const dx = toRect.left - fromRect.left;
    const dy = toRect.top - fromRect.top;
    const scaleX = toRect.width / Math.max(1, fromRect.width);
    const scaleY = toRect.height / Math.max(1, fromRect.height);
    let frame = 0;
    let releaseTimer = 0;
    let finishTimer = 0;
    let releaseFallbackTimer = 0;
    let cleaned = false;
    let cancelled = false;
    let released = false;
    const startedAt = performance.now() + delay;
    const ease = (t) => 1 - Math.pow(1 - t, 4);

    const applyFrame = (amount) => {
      const eased = ease(amount);
      const nextX = dx * eased;
      const nextY = dy * eased;
      const nextScaleX = 1 + (scaleX - 1) * eased;
      const nextScaleY = 1 + (scaleY - 1) * eased;
      layer.style.transform = `translate3d(${nextX}px, ${nextY}px, 0) scaleX(${nextScaleX}) scaleY(${nextScaleY})`;
    };

    const controller = {
      layer,
      cancel(options = {}) {
        cancelled = true;
        window.cancelAnimationFrame(frame);
        window.clearTimeout(releaseTimer);
        window.clearTimeout(releaseFallbackTimer);
        window.clearTimeout(finishTimer);
        if (options.keepLayer) freezeFocusIndexTravelLayer(layer);
        else layer.remove();
      }
    };
    focusIndexAnimations.push(controller);

    const releaseLayer = () => {
      if (released) return;
      released = true;
      window.clearTimeout(releaseTimer);
      window.clearTimeout(releaseFallbackTimer);
      window.clearTimeout(finishTimer);
      focusIndexAnimations = focusIndexAnimations.filter((item) => item !== controller);
      if (options.release === false) return;
      releaseFocusIndexTravelLayer(layer, options.releaseDelay || 0);
    };

    const scheduleReleaseLayer = () => {
      if (cancelled || released) return;
      if (holdDelay > 0) releaseTimer = window.setTimeout(releaseLayer, holdDelay);
      else releaseLayer();
    };

    const settleFocusIndexTravelLayer = () => {
      const getFinalRect = typeof options.getFinalRect === "function" ? options.getFinalRect : null;
      const finalRect = getFinalRect?.() || toRect;
      if (!finalRect) return;
      const currentRect = freezeFocusIndexTravelLayer(layer) || finalRect;
      const settleDuration = window.innerWidth > 768 ? 150 : 72;
      if (Math.abs(currentRect.left - finalRect.left) < .5
        && Math.abs(currentRect.top - finalRect.top) < .5
        && Math.abs(currentRect.width - finalRect.width) < .5
        && Math.abs(currentRect.height - finalRect.height) < .5) return;
      animateFocusIndexTravelLayer(layer, currentRect, finalRect, {
        duration: settleDuration,
        holdDelay: 0,
        release: false
      });
    };

    const releaseAfterDestinationPaint = () => {
      const fallbackDelay = Math.max(760, holdDelay + (options.readyTimeout || 420) + (window.innerWidth > 768 ? 560 : 360));
      releaseFallbackTimer = window.setTimeout(releaseLayer, fallbackDelay);
      waitForFocusIndexTransitionReady(options.ready, options.readyTimeout || 420)
        .then(() => waitForFocusIndexLayoutFrame())
        .then(() => waitForFocusIndexTravelLayerPaint(layer))
        .then(settleFocusIndexTravelLayer)
        .catch(() => {})
        .then(scheduleReleaseLayer);
    };

    const cleanup = () => {
      if (cleaned || cancelled) return;
      cleaned = true;
      applyFrame(1);
      options.onArrive?.(layer);
      releaseAfterDestinationPaint();
    };

    const step = (now) => {
      if (cancelled) return;
      if (now < startedAt) {
        frame = requestAnimationFrame(step);
        return;
      }
      const progress = Math.min(1, (now - startedAt) / duration);
      applyFrame(progress);
      if (progress < 1) frame = requestAnimationFrame(step);
      else cleanup();
    };

    applyFrame(0);
    finishTimer = window.setTimeout(cleanup, delay + duration + 260);
    frame = requestAnimationFrame(step);
    return controller;
  }

  function cancelFocusIndexAnimations(options = {}) {
    focusIndexAnimations.forEach((animation) => {
      if (animation?.focusMain) animation.cancel({ keepMain: Boolean(options.keepFocusMain) });
      else if (animation?.layer && animation.layer === options.keepTravelLayer) animation.cancel({ keepLayer: true });
      else animation.cancel();
    });
    focusIndexAnimations = [];
    window.clearTimeout(focusIndexHandoffTimer);
    window.clearTimeout(focusIndexHiddenCardTimer);
    window.clearTimeout(focusIndexStartTimer);
    window.clearTimeout(focusIndexMainReleaseTimer);
    shell.classList.remove("is-index-opening", "is-index-closing", "is-index-exiting", "is-index-handoff");
    document.querySelectorAll(".focus-index-travel-layer").forEach((layer) => {
      if (layer !== options.keepTravelLayer) layer.remove();
    });
    indexGallery?.querySelectorAll(".focus-index-card.is-index-anchor, .focus-index-card.is-index-hidden").forEach((card) => {
      card.classList.remove("is-index-anchor", "is-index-hidden");
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
  function setNotesOpen(open) {
    const isOpen = Boolean(open);
    shell.classList.toggle("is-notes", isOpen);
    document.body.classList.toggle("focus-notes-open", isOpen);
    imageToggle.setAttribute("aria-expanded", String(isOpen));
    imageToggle.setAttribute("aria-label", isOpen ? "Close notes" : "Open notes");
    if (navToggle) {
      navToggle.setAttribute("aria-label", isOpen ? "Close notes" : document.body.classList.contains("nav-open") ? "Close navigation" : "Open navigation");
    }
    if (isOpen) {
      updateNotesLayout();
    }
  }

  function updateNotesLayout() {
    if (!noteText) return;
    const active = Number(shell.dataset.activeIndex || 0);
    const photo = photos[active] || photos[0];
    const note = getPhotoNote(photo);
    const length = [...note].length;
    const isMobile = window.innerWidth <= 768;
    const mainBox = document.querySelector("[data-focus-main]");
    const railBox = thumbs;
    const mainRectForNotes = mainBox?.classList.contains("is-main-traveling") || shell.classList.contains("is-index")
      ? measureFocusMainBaseRect() || getFocusRect(mainBox)
      : getFocusRect(mainBox);
    const mainWidth = mainRectForNotes?.width || mainBox?.offsetWidth || window.innerWidth * 0.64;
    const mainHeight = mainRectForNotes?.height || mainBox?.offsetHeight || window.innerHeight * 0.62;
    const cachedRatio = getFocusPhotoRatio(active);
    const imageRatio = cachedRatio || (image.naturalWidth && image.naturalHeight ? image.naturalWidth / image.naturalHeight : mainWidth / Math.max(1, mainHeight));
    const clamp = (min, value, max) => Math.max(min, Math.min(value, max));

    if (isMobile) {
      const focusTop = mainRectForNotes ? mainRectForNotes.top : 104;
      const railTop = railBox?.getBoundingClientRect().top || window.innerHeight - 200;
      const scaleFromText = 0.72 - clamp(0, Math.max(0, length - 30) * 0.004, 0.08);
      const scaleFromRatio = imageRatio < 0.78 ? -0.03 : imageRatio > 1.18 ? 0.02 : 0;
      const photoScale = clamp(0.6, scaleFromText + scaleFromRatio, 0.73);
      const shiftY = -clamp(26, mainHeight * 0.08 + Math.max(0, length - 30) * 0.7, 52);
      const visualBottom = focusTop + shiftY + mainHeight - (mainHeight * (1 - photoScale) / 2);
      const gap = clamp(30, 40 + Math.max(0, length - 32) * 0.2, 56);
      const copySize = clamp(1.16, 1.46 - Math.max(0, length - 34) * 0.012, 1.46);
      const copyWidth = Math.max(240, window.innerWidth - 32);
      const charsPerLine = Math.max(8, Math.floor(copyWidth / (copySize * 9.4)));
      const copyLines = Math.max(1, Math.ceil(length / charsPerLine));
      const requiredNotesHeight = 28 + copyLines * copySize * 10 * 1.35;
      const lineBottom = Math.max(150, window.innerHeight - railTop + 8);
      const maxLineTop = window.innerHeight - lineBottom - requiredNotesHeight;
      const minLineTop = Math.min(window.innerHeight * 0.43, maxLineTop);
      const lineTop = clamp(minLineTop, visualBottom + gap, maxLineTop);

      shell.style.setProperty("--notes-photo-scale", photoScale.toFixed(3));
      shell.style.setProperty("--notes-photo-shift-y", `${shiftY.toFixed(1)}px`);
      shell.style.setProperty("--notes-line-top", `${lineTop.toFixed(1)}px`);
      shell.style.setProperty("--notes-line-bottom", `${lineBottom.toFixed(1)}px`);
      shell.style.setProperty("--notes-copy-size", `${copySize.toFixed(2)}rem`);
      shell.style.setProperty("--notes-copy-width", `${copyWidth.toFixed(1)}px`);
      shell.style.setProperty("--notes-panel-width", "auto");
      shell.style.setProperty("--notes-photo-shift-x", "0px");
      return;
    }

    const isCompactWide = window.innerWidth < 940;
    const copySize = clamp(1.12, 1.5 - Math.max(0, length - 44) * 0.006, 1.5);
    const rightInset = clamp(isCompactWide ? 24 : 40, window.innerWidth * 0.035, isCompactWide ? 44 : 80);
    const railRect = railBox?.getBoundingClientRect();
    const railRight = railRect && railRect.width > 0 ? railRect.right : 136;
    const railGap = clamp(isCompactWide ? 22 : 56, window.innerWidth * 0.042, isCompactWide ? 40 : 108);
    const noteGap = clamp(isCompactWide ? 24 : 64, window.innerWidth * 0.04, isCompactWide ? 42 : 110);
    const minPanel = isCompactWide ? 252 : 340;
    const maxPanel = Math.max(minPanel, Math.min(isCompactWide ? 292 : 520, window.innerWidth * (isCompactWide ? 0.36 : 0.34)));
    const idealCopyWidth = clamp(isCompactWide ? 218 : 300, length * copySize * 8.2, isCompactWide ? 244 : 450);
    const panelWidth = clamp(minPanel, idealCopyWidth + (isCompactWide ? 38 : 64), maxPanel);
    const noteLeft = window.innerWidth - rightInset - panelWidth;
    const leftLimit = railRight + railGap;
    const rightLimit = noteLeft - noteGap;
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
    const copyWidth = clamp(isCompactWide ? 218 : 280, panelWidth - (isCompactWide ? 38 : 64), isCompactWide ? 248 : 460);

    shell.style.setProperty("--notes-photo-scale", photoScale.toFixed(3));
    shell.style.setProperty("--notes-photo-shift-x", `${shiftX.toFixed(1)}px`);
    shell.style.setProperty("--notes-photo-shift-y", "0px");
    shell.style.setProperty("--notes-panel-width", `${panelWidth.toFixed(1)}px`);
    shell.style.setProperty("--notes-copy-size", `${copySize.toFixed(2)}rem`);
    shell.style.setProperty("--notes-copy-width", `${copyWidth.toFixed(1)}px`);
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

  function preloadFocusImage(src) {
    return new Promise((resolve) => {
      const next = new Image();
      next.decoding = "async";
      next.onload = () => waitForImageReady(next).then(resolve);
      next.onerror = resolve;
      next.src = src;
    });
  }

  function updateFocusChrome(index, replaceUrl) {
    shell.dataset.activeIndex = String(index);
    thumbs.querySelectorAll(".focus-thumb").forEach((thumb, thumbIndex) => {
      const active = thumbIndex === index;
      thumb.classList.toggle("is-active", active);
    });
    if (replaceUrl) {
      window.history.replaceState({}, "", `focus.html?rel=${index + 1}`);
    }
  }

  function commitFocusPhoto(photo) {
    image.src = photo.full;
    image.alt = photo.alt;
    caption.textContent = "";
    if (noteText) noteText.textContent = getPhotoNote(photo);
    title.textContent = photo.title;
    updateNotesLayout();
  }

  function setFocus(index, replaceUrl, options = {}) {
    const photo = photos[index];
    if (!photo) return;
    const previousIndex = Number(shell.dataset.activeIndex || 0);
    const canAnimate = document.body.classList.contains("has-loaded")
      && !options.instant
      && image.getAttribute("src")
      && index !== previousIndex
      && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const token = ++focusSwitchToken;
    window.clearTimeout(focusSwitchTimer);

    updateFocusChrome(index, replaceUrl);

    if (!canAnimate) {
      shell.classList.remove("is-switching-image");
      commitFocusPhoto(photo);
      return;
    }

    shell.classList.add("is-switching-image");
    focusSwitchTimer = window.setTimeout(() => {
      if (token === focusSwitchToken) shell.classList.remove("is-switching-image");
    }, 760);
    const startedAt = performance.now();
    preloadFocusImage(photo.full).then(() => {
      const remaining = Math.max(0, 135 - (performance.now() - startedAt));
      window.setTimeout(() => {
        if (token !== focusSwitchToken) return;
        commitFocusPhoto(photo);
        requestAnimationFrame(() => {
          if (token === focusSwitchToken) {
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
    cancelFocusRailScroll();
    clearFocusManualSelection();
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
    if (window.innerWidth > 768 || Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
    cancelFocusRailScroll();
    event.preventDefault();
    thumbs.scrollLeft = Math.max(0, Math.min(thumbs.scrollLeft + event.deltaX, mobileRailMaxOffset));
  }

  function syncFocusFromScroll() {
    if (!document.body.contains(shell)) return;
    const isMobile = window.innerWidth <= 768;
    if (isMobile) updateMobileFocusRail();
    if (!shell.classList.contains("is-index") && !shell.classList.contains("is-notes")) {
      const allThumbs = [...thumbs.querySelectorAll(".focus-thumb")];
      const viewportCenter = isMobile ? window.innerWidth / 2 : window.innerHeight / 2;
      const range = isMobile ? 220 : 280;
      const maxShift = isMobile ? 24 : 64;
      let activeIndex = Number(shell.dataset.activeIndex || 0);
      let nearestDistance = Infinity;
      const manualSelected = focusManualSelectionIndex !== null && Number(shell.dataset.activeIndex || 0) === focusManualSelectionIndex;
      const syncPaused = manualSelected || Date.now() < focusSyncHoldUntil || Date.now() < focusInitialLockUntil || (isMobile && !isMobileFocusRailReady(allThumbs));

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
