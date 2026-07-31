const root = document.querySelector(".work-page");
const requestedMode = new URLSearchParams(window.location.search).get("mode");
const previewMode = ["desktop", "mobile"].includes(requestedMode)
  ? requestedMode
  : "auto";
const bridgeOrigin = new URL(window.location.href);

bridgeOrigin.port = "8780";
bridgeOrigin.pathname = "/";
bridgeOrigin.search = "";
bridgeOrigin.hash = "";

document.documentElement.dataset.localWorkMode = previewMode;
root.classList.add("is-local-photopea-preview");
root.removeAttribute("aria-hidden");

const stylesheet = document.createElement("link");
stylesheet.rel = "stylesheet";
stylesheet.href = "tools/work-photopea/site-preview.css";
document.head.appendChild(stylesheet);

let currentSignature = "";
let pollTimer = 0;
let lightbox = null;

const resolveDraftUrl = (path) => new URL(path, bridgeOrigin).href;

const closeLightbox = () => {
  if (!lightbox) return;
  lightbox.hidden = true;
  lightbox.querySelector("img").removeAttribute("src");
  document.body.classList.remove("is-work-lightbox-open");
  window.l4rxxSmoothScroll?.unlock();
};

const ensureLightbox = () => {
  if (lightbox) return lightbox;
  lightbox = document.createElement("div");
  lightbox.className = "local-work-lightbox";
  lightbox.hidden = true;
  lightbox.innerHTML = `
    <button class="local-work-lightbox__close" type="button" aria-label="Close image" title="Close">×</button>
    <img class="local-work-lightbox__image" alt="">
  `;
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox || event.target.closest(".local-work-lightbox__close")) {
      closeLightbox();
    }
  });
  document.body.appendChild(lightbox);
  return lightbox;
};

const openLightbox = (src, alt) => {
  const overlay = ensureLightbox();
  const image = overlay.querySelector("img");
  image.src = src;
  image.alt = alt;
  overlay.hidden = false;
  document.body.classList.add("is-work-lightbox-open");
  window.l4rxxSmoothScroll?.lock();
  overlay.querySelector("button").focus({ preventScroll: true });
};

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && lightbox && !lightbox.hidden) closeLightbox();
});

const getLayeredLayout = (section) => {
  const useMobile = previewMode === "mobile" ||
    (previewMode === "auto" && window.matchMedia("(max-width: 768px)").matches);
  const layout = useMobile
    ? section.mobileLayout || section.desktopLayout
    : section.desktopLayout || section.mobileLayout;
  const completeExport = useMobile
    ? section.mobile || section.desktop
    : section.desktop || section.mobile;
  if (!layout || !completeExport?.updatedAt) return layout;

  const layoutUpdatedAt = Date.parse(layout.updatedAt || "");
  const exportUpdatedAt = Date.parse(completeExport.updatedAt);
  return Number.isFinite(layoutUpdatedAt) &&
    Number.isFinite(exportUpdatedAt) &&
    layoutUpdatedAt >= exportUpdatedAt
    ? layout
    : null;
};

const makeLayerDraggable = (element, container) => {
  let offsetX = 0;
  let offsetY = 0;
  let startX = 0;
  let startY = 0;
  let startOffsetX = 0;
  let startOffsetY = 0;
  let activePointerId = null;
  let pendingOffset = null;
  let animationFrame = 0;
  let previousContainerWidth = container.clientWidth;
  let previousContainerHeight = container.clientHeight;

  const clampOffset = (x, y) => ({
    x: Math.min(
      container.clientWidth - element.offsetLeft - element.offsetWidth,
      Math.max(-element.offsetLeft, x)
    ),
    y: Math.min(
      container.clientHeight - element.offsetTop - element.offsetHeight,
      Math.max(-element.offsetTop, y)
    )
  });

  const applyOffset = (x, y) => {
    const next = clampOffset(x, y);
    offsetX = next.x;
    offsetY = next.y;
    element.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0) scale(var(--work-drag-scale, 1))`;
  };

  const flushPendingOffset = () => {
    animationFrame = 0;
    if (!pendingOffset) return;
    applyOffset(pendingOffset.x, pendingOffset.y);
    pendingOffset = null;
  };

  const stopDragging = (event) => {
    if (event.pointerId !== activePointerId) return;
    if (animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    }
    if (pendingOffset) flushPendingOffset();
    if (element.hasPointerCapture(event.pointerId)) {
      element.releasePointerCapture(event.pointerId);
    }
    activePointerId = null;
    element.classList.remove("is-dragging");
  };

  element.addEventListener("pointerdown", (event) => {
    if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) return;
    event.preventDefault();
    activePointerId = event.pointerId;
    startX = event.clientX;
    startY = event.clientY;
    startOffsetX = offsetX;
    startOffsetY = offsetY;
    element.setPointerCapture(event.pointerId);
    element.classList.add("is-dragging");
  });

  element.addEventListener("pointermove", (event) => {
    if (event.pointerId !== activePointerId) return;
    pendingOffset = {
      x: startOffsetX + event.clientX - startX,
      y: startOffsetY + event.clientY - startY
    };
    if (!animationFrame) animationFrame = requestAnimationFrame(flushPendingOffset);
  });

  element.addEventListener("pointerup", stopDragging);
  element.addEventListener("pointercancel", stopDragging);

  element.addEventListener("keydown", (event) => {
    const directions = {
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
      ArrowUp: [0, -1],
      ArrowDown: [0, 1]
    };
    const direction = directions[event.key];
    if (!direction) return;
    event.preventDefault();
    const step = event.shiftKey ? 16 : 4;
    applyOffset(offsetX + direction[0] * step, offsetY + direction[1] * step);
  });

  if ("ResizeObserver" in window) {
    const resizeObserver = new ResizeObserver(() => {
      const nextWidth = container.clientWidth;
      const nextHeight = container.clientHeight;
      if (!nextWidth || !nextHeight) return;
      const scaledX = previousContainerWidth
        ? offsetX * (nextWidth / previousContainerWidth)
        : offsetX;
      const scaledY = previousContainerHeight
        ? offsetY * (nextHeight / previousContainerHeight)
        : offsetY;
      previousContainerWidth = nextWidth;
      previousContainerHeight = nextHeight;
      applyOffset(scaledX, scaledY);
    });
    resizeObserver.observe(container);
  }
};

const createLayeredSection = (section, index, layout) => {
  if (!layout?.width || !layout?.height || !layout?.background?.src) return null;

  const container = document.createElement("section");
  container.className = "local-work-section local-work-section--layered";
  container.dataset.section = section.id;
  container.style.setProperty("--work-layout-width", layout.width);
  container.style.setProperty("--work-layout-height", layout.height);

  const background = document.createElement("img");
  background.className = "local-work-background";
  background.src = `${resolveDraftUrl(layout.background.src)}?t=${encodeURIComponent(layout.updatedAt || "")}`;
  background.width = layout.width;
  background.height = layout.height;
  background.alt = "";
  background.decoding = "async";
  background.loading = index === 0 ? "eager" : "lazy";
  container.appendChild(background);

  [...(layout.layers || [])]
    .sort((a, b) => (a.z || 0) - (b.z || 0))
    .forEach((layer) => {
      if (!layer?.src || !layer.width || !layer.height) return;
      const isPhoto = layer.role === "photo";
      const isDraggable = layer.role === "draggable";
      const isInteractive = isPhoto || isDraggable;
      const element = document.createElement(isInteractive ? "button" : "div");
      element.className = [
        "local-work-layer",
        isPhoto ? "local-work-layer--photo" : "",
        isDraggable ? "local-work-layer--draggable" : ""
      ].filter(Boolean).join(" ");
      element.style.left = `${(layer.x / layout.width) * 100}%`;
      element.style.top = `${(layer.y / layout.height) * 100}%`;
      element.style.width = `${(layer.width / layout.width) * 100}%`;
      element.style.height = `${(layer.height / layout.height) * 100}%`;
      element.style.zIndex = String(layer.z || 1);
      if (isInteractive) {
        element.type = "button";
        element.setAttribute(
          "aria-label",
          layer.label || (isDraggable ? "Move figure" : "Open image")
        );
      }

      const image = document.createElement("img");
      image.src = `${resolveDraftUrl(layer.src)}?t=${encodeURIComponent(layout.updatedAt || "")}`;
      image.width = layer.width;
      image.height = layer.height;
      image.alt = layer.alt || "";
      image.decoding = "async";
      image.loading = index === 0 ? "eager" : "lazy";
      image.draggable = false;
      element.appendChild(image);

      if (isPhoto) {
        element.addEventListener("click", () => openLightbox(image.src, image.alt));
      }
      container.appendChild(element);
      if (isDraggable) makeLayerDraggable(element, container);
    });

  return container;
};

const createSection = (section, index) => {
  const layeredLayout = getLayeredLayout(section);
  if (layeredLayout) {
    const layeredSection = createLayeredSection(section, index, layeredLayout);
    if (layeredSection) return layeredSection;
  }

  const desktop = section.desktop || section.mobile;
  const mobile = section.mobile;
  const primary = previewMode === "mobile"
    ? mobile || section.desktop
    : desktop;
  if (!primary) return null;

  const container = document.createElement("section");
  container.className = "local-work-section";
  container.dataset.section = section.id;

  const picture = document.createElement("picture");
  picture.className = "local-work-picture";

  if (previewMode === "auto" && mobile) {
    const source = document.createElement("source");
    source.media = "(max-width: 768px)";
    source.srcset = `${resolveDraftUrl(mobile.src)}?t=${encodeURIComponent(mobile.updatedAt || "")}`;
    picture.appendChild(source);
  }

  const image = document.createElement("img");
  image.className = "local-work-image";
  image.src = `${resolveDraftUrl(primary.src)}?t=${encodeURIComponent(primary.updatedAt || "")}`;
  image.width = primary.width;
  image.height = primary.height;
  image.alt = "";
  image.decoding = "async";
  image.loading = index === 0 ? "eager" : "lazy";
  picture.appendChild(image);
  container.appendChild(picture);
  return container;
};

const showMessage = (message) => {
  const empty = document.createElement("div");
  empty.className = "local-work-empty";
  empty.textContent = message;
  root.replaceChildren(empty);
};

const render = async () => {
  window.clearTimeout(pollTimer);
  try {
    const manifestUrl = new URL("/__work/photopea/manifest", bridgeOrigin);
    const response = await fetch(manifestUrl, { cache: "no-store" });
    if (!response.ok) throw new Error("Manifest unavailable");
    const manifest = await response.json();
    const signature = JSON.stringify({
      updatedAt: manifest.updatedAt,
      sections: manifest.sections
    });
    if (signature !== currentSignature) {
      currentSignature = signature;
      const fragment = document.createDocumentFragment();
      manifest.sections.forEach((section, index) => {
        const node = createSection(section, index);
        if (node) fragment.appendChild(node);
      });
      if (fragment.childNodes.length) {
        root.replaceChildren(fragment);
      } else {
        showMessage("尚未导出 WORK 画板");
      }
    }
  } catch {
    currentSignature = "";
    showMessage("请先启动 Photopea WORK 服务");
  } finally {
    pollTimer = window.setTimeout(render, document.hidden ? 5000 : 2000);
  }
};

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) render();
});
window.addEventListener("focus", render);

render();
