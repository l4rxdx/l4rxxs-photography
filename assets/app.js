const photos = [
  { src: "images/DSC00081.jpg", title: "FIELD 01", category: "OPEN AIR", caption: "A quiet frame from the local archive." },
  { src: "images/DSC00049.jpg", title: "FIELD 02", category: "OPEN AIR", caption: "Distance, weather, and a low horizon." },
  { src: "images/Desktop Screenshot 2026.01.04 - 23.3.23.04-2.jpg", title: "SCREEN 03", category: "SCREEN", caption: "A captured screen becomes part of the image rhythm." },
  { src: "images/DSC03004.jpg", title: "FIELD 04", category: "STILL", caption: "Muted light with a photographic pause." },
  { src: "images/DSC02865.jpg", title: "FIELD 05", category: "STILL", caption: "Large negative space and a held center." },
  { src: "images/DSC02785.jpg", title: "FIELD 06", category: "STILL", caption: "A dense frame for the index wall." },
  { src: "images/R0010684.jpg", title: "TRACE 07", category: "WALK", caption: "A walking note from the local roll." },
  { src: "images/DSC02468.jpg", title: "TRACE 08", category: "WALK", caption: "The image sits like a found page." },
  { src: "images/R0010682.jpg", title: "TRACE 09", category: "WALK", caption: "A low contrast moment with soft edges." },
  { src: "images/DSC01843.jpg", title: "TRACE 10", category: "PORTRAIT", caption: "Human scale against a plain field." },
  { src: "images/My-YE-cover.png", title: "COVER 11", category: "GRAPHIC", caption: "A cover image placed into the same visual system." },
  { src: "images/DSC00811.jpg", title: "TRACE 12", category: "PORTRAIT", caption: "A vertical image for the focus viewer." },
  { src: "images/image.jpg", title: "IMAGE 13", category: "FOUND", caption: "A small found image in the wider sequence." },
  { src: "images/DSC00323.jpg", title: "TRACE 14", category: "PORTRAIT", caption: "A quiet pause before the next frame." },
  { src: "images/grok-image-dd0c889a-a430-408a-8e1c-e13496ad3005.jpg", title: "SYNTH 15", category: "GENERATED", caption: "A synthetic image held in the same grid." },
  { src: "images/DSC00261.jpg", title: "TRACE 16", category: "PORTRAIT", caption: "A portrait scale frame from the folder." },
  { src: "images/R0010826.jpg", title: "ROLL 17", category: "ROLL", caption: "A textured image from the R roll." },
  { src: "images/R0010821.jpg", title: "ROLL 18", category: "ROLL", caption: "A second roll image without repeating the file." },
  { src: "images/R0010715.jpg", title: "ROLL 19", category: "ROLL", caption: "The frame is kept raw and full." },
  { src: "images/R0010914-2.jpg", title: "ROLL 20", category: "ROLL", caption: "An alternate frame with its own position." },
  { src: "images/R0011072.jpg", title: "ROLL 21", category: "ROLL", caption: "A later roll image for the list view." },
  { src: "images/R0011370.jpg", title: "ROLL 22", category: "ROLL", caption: "A large frame at the end of the wall." },
  { src: "images/R0011216.jpg", title: "ROLL 23", category: "ROLL", caption: "A dense image with a generous margin." },
  { src: "images/R0011206.jpg", title: "ROLL 24", category: "ROLL", caption: "The last stretch of the local sequence." },
  { src: "images/R0011157.jpg", title: "ROLL 25", category: "ROLL", caption: "A final still before closing the set." },
  { src: "images/R0011079.jpg", title: "ROLL 26", category: "ROLL", caption: "The final unique photo in this build." }
];

const overviewSkipCells = new Set([2, 7]);

const languageCopy = {
  en: {
    "nav.overview": "OVERVIEW",
    "nav.work": "WORK",
    "home.about": "l4rxx is a visual maker collecting still moments, weathered surfaces, portraits, screens, and quiet fragments.",
    contact: "CONTACT ME",
    "social.douyin": "TIKTOK",
    rights: "\u00a9 2026 - all rights reserved"
  },
  cn: {
    "nav.overview": "\u603b\u89c8",
    "nav.work": "\u4f5c\u54c1",
    "home.about": "l4rxx \u662f\u4e00\u4f4d\u89c6\u89c9\u521b\u4f5c\u8005\uff0c\u6536\u96c6\u9759\u6b62\u77ac\u95f4\u3001\u98ce\u5316\u8868\u9762\u3001\u8096\u50cf\u3001\u5c4f\u5e55\u4e0e\u5b89\u9759\u788e\u7247\u3002",
    contact: "\u8054\u7cfb\u6211",
    "social.douyin": "\u6296\u97f3",
    rights: "\u00a9 2026 - \u4fdd\u7559\u6240\u6709\u6743\u5229"
  }
};

const languageLabels = {
  en: { cn: "\u4e2d\u6587", en: "\u82f1\u8bed" },
  cn: { cn: "CN", en: "EN" }
};

document.addEventListener("DOMContentLoaded", () => {
  initChrome();
  initLanguageSwitch();
  const page = document.body.dataset.page;
  if (page === "home") renderOverview();
  if (page === "work") renderWork();
  if (page === "focus") renderFocus();
  startLoadingSequence();
});

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

  let photoIndex = 0;
  const cellCount = photos.length + overviewSkipCells.size;
  for (let cellIndex = 0; cellIndex < cellCount; cellIndex++) {
    if (overviewSkipCells.has(cellIndex)) {
      const spacer = document.createElement("div");
      spacer.className = "overview-item infinity-item--skip";
      grid.appendChild(spacer);
      continue;
    }

    const photo = photos[photoIndex];
    const index = photoIndex;
    const link = document.createElement("a");
    link.className = "overview-item infinity-item--original";
    if (cellIndex <= 14) link.classList.add("is-visible");
    link.dataset.index = String(index + 1);
    link.href = `focus.html?rel=${index + 1}`;
    link.innerHTML = `<span class="fs-media"><img src="${photo.src}" alt="${photo.title}"></span>`;
    grid.appendChild(link);
    photoIndex++;
  }

  initializeOverviewItems();
  handleOverviewReturn(grid);
  initializeInfinityScroll(grid);
}

function handleOverviewReturn(grid) {
  const params = new URLSearchParams(window.location.search);
  if (params.get("from") !== "rel") return;
  const rel = Number(params.get("rel"));
  if (!Number.isFinite(rel) || rel <= 0) return;
  const target = grid.querySelector(`.overview-item[data-index="${rel}"]`);
  if (!target) return;

  document.body.classList.add("is-returning-from-rel");
  target.classList.add("is-return-target");

  requestAnimationFrame(() => {
    const rect = target.getBoundingClientRect();
    const top = Math.max(0, window.scrollY + rect.top + rect.height / 2 - window.innerHeight / 2);
    window.scrollTo({ top, behavior: "auto" });
    requestAnimationFrame(() => document.body.classList.add("has-return-landed"));
  });

  setTimeout(() => {
    document.body.classList.remove("is-returning-from-rel", "has-return-landed");
    target.classList.remove("is-return-target");
    const url = new URL(window.location.href);
    url.searchParams.delete("from");
    url.searchParams.delete("rel");
    window.history.replaceState({}, "", url.href);
  }, 2600);
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

function initializeInfinityScroll(grid) {
  [...grid.children].forEach((item) => {
    if (!item.classList.contains("infinity-item--skip")) item.classList.add("infinity-item--original");
  });
  window.addEventListener("scroll", () => {
    const nearEnd = grid.offsetTop + grid.scrollHeight - (window.scrollY + window.innerHeight) <= 500;
    if (!nearEnd || grid.dataset.extended === "true") return;
    grid.dataset.extended = "true";
    grid.querySelectorAll(".infinity-item--original").forEach((item) => {
      const clone = item.cloneNode(true);
      clone.classList.remove("infinity-item--original", "is-visible");
      clone.removeAttribute("style");
      grid.appendChild(clone);
    });
  }, { passive: true });
}

function startLoadingSequence() {
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
      <span class="work-item__image"><img src="${photo.src}" alt="${photo.title}"></span>
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
  const focusShiftPositions = new Map();
  const focusFollowRate = 0.18;
  let mobileRailMaxOffset = 0;
  let focusTouchStartX = 0;
  let focusTouchStartY = 0;
  let focusTouchLastX = 0;
  let focusTouchMode = "";

  photos.forEach((photo, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "focus-thumb";
    button.dataset.index = String(index + 1);
    button.style.setProperty("--delay", `${Math.min(index, 24) * 0.018}s`);
    button.innerHTML = `<img src="${photo.src}" alt="${photo.title}">`;
    button.addEventListener("click", () => {
      setFocus(index, true);
      scrollToFocusIndex(index, true);
      shell.classList.remove("is-index");
    });
    thumbs.appendChild(button);
  });

  indexToggle?.addEventListener("click", () => {
    shell.classList.toggle("is-index");
    shell.classList.remove("is-info");
  });
  infoToggle?.addEventListener("click", () => {
    shell.classList.toggle("is-info");
    shell.classList.remove("is-index");
  });
  backLink?.addEventListener("click", (event) => {
    event.preventDefault();
    const index = Number(shell.dataset.activeIndex || 0);
    document.body.classList.add("is-focus-leaving");
    window.setTimeout(() => {
      window.location.href = `index.html?from=rel&rel=${index + 1}`;
    }, 320);
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
  setFocus(initial, false);
  thumbs.querySelectorAll("img").forEach((thumbImage) => {
    thumbImage.addEventListener("load", () => {
      updateFocusRailMetrics();
      updateMobileFocusRail();
      scrollToFocusIndex(Number(shell.dataset.activeIndex || initial), false);
    }, { once: true });
  });
  requestAnimationFrame(() => {
    updateFocusRailMetrics();
    updateMobileFocusRail();
    scrollToFocusIndex(initial, false);
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
    image.src = photo.src;
    image.alt = photo.title;
    caption.textContent = `${photo.title} / ${photo.category} / ${index + 1} of ${photos.length}`;
    title.textContent = photo.title;
    if (backLink) backLink.href = `index.html?from=rel&rel=${index + 1}`;
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
    if (window.innerWidth <= 768) {
      updateMobileFocusRail();
      const top = thumb.offsetLeft + thumb.offsetWidth / 2 - window.innerWidth / 2;
      const clampedTop = Math.max(0, Math.min(top, mobileRailMaxOffset));
      window.scrollTo({ top: clampedTop, behavior: smooth ? "smooth" : "auto" });
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
  }

  function updateMobileFocusRail() {
    if (window.innerWidth > 768) {
      mobileRailMaxOffset = 0;
      shell.style.removeProperty("--mobile-rail-offset");
      shell.style.removeProperty("--mobile-scroll-height");
      return 0;
    }
    mobileRailMaxOffset = Math.max(0, Math.ceil(thumbs.scrollWidth - window.innerWidth));
    shell.style.setProperty("--mobile-scroll-height", `${mobileRailMaxOffset + window.innerHeight}px`);
    const offset = Math.max(0, Math.min(window.scrollY, mobileRailMaxOffset));
    shell.style.setProperty("--mobile-rail-offset", `${offset}px`);
    return offset;
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
      const nextTop = Math.max(0, Math.min(window.scrollY + focusTouchLastX - touch.clientX, mobileRailMaxOffset));
      window.scrollTo({ top: nextTop, behavior: "auto" });
      focusTouchLastX = touch.clientX;
    }
  }

  function handleFocusWheel(event) {
    if (window.innerWidth > 768 || Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
    event.preventDefault();
    const nextTop = Math.max(0, Math.min(window.scrollY + event.deltaX, mobileRailMaxOffset));
    window.scrollTo({ top: nextTop, behavior: "auto" });
  }

  function syncFocusFromScroll() {
    if (!document.body.contains(shell)) return;
    const isMobile = window.innerWidth <= 768;
    if (isMobile) updateMobileFocusRail();
    if (!shell.classList.contains("is-index") && !shell.classList.contains("is-info")) {
      const allThumbs = [...thumbs.querySelectorAll(".focus-thumb")];
      const viewportCenter = isMobile ? window.innerWidth / 2 : window.innerHeight / 2;
      const range = isMobile ? 220 : 280;
      const maxShift = isMobile ? 32 : 64;
      let activeIndex = Number(shell.dataset.activeIndex || 0);
      let nearestDistance = Infinity;

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

      if (activeIndex !== Number(shell.dataset.activeIndex || 0)) {
        setFocus(activeIndex, true);
      }
    }
    requestAnimationFrame(syncFocusFromScroll);
  }
}
