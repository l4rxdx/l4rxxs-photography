(() => {
  "use strict";

  const MANIFEST_URL = "content/design.json";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  async function initializeDesignGallery() {
    if (document.body.dataset.page !== "work") return;

    const canvas = document.querySelector("[data-design-canvas]");
    const lightbox = document.querySelector("[data-design-lightbox]");
    if (!canvas || !lightbox) return;

    try {
      const manifest = await loadManifest();
      renderCanvas(canvas, manifest);
      initializeLightbox(lightbox);
      document.body.classList.add("has-design-overview");
    } catch (error) {
      console.error("Could not initialize Design page", error);
      document.body.classList.add("has-design-error");
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeDesignGallery, { once: true });
  } else {
    queueMicrotask(initializeDesignGallery);
  }

  async function loadManifest() {
    const response = await fetch(MANIFEST_URL, { cache: "no-cache" });
    if (!response.ok) throw new Error(`Design manifest failed (${response.status})`);
    const manifest = await response.json();
    if (!manifest.canvas || !Array.isArray(manifest.layers) || !manifest.layers.length) {
      throw new Error("Design manifest is incomplete");
    }
    return manifest;
  }

  function renderCanvas(canvas, manifest) {
    canvas.style.aspectRatio = `${manifest.canvas.width} / ${manifest.canvas.height}`;
    const fragment = document.createDocumentFragment();
    const artworkLayers = [];

    manifest.layers.forEach((layer, index) => {
      const element = createLayer(layer, manifest.canvas, index);
      fragment.appendChild(element);
      if (layer.interactive) artworkLayers.push(element);
    });

    canvas.replaceChildren(fragment);
    initializeReveals(artworkLayers);
  }

  function createLayer(layer, canvas, index) {
    const element = document.createElement(layer.interactive ? "button" : "div");
    element.className = `design-layer design-layer--${layer.interactive ? "artwork" : "decor"} design-layer--${layer.id}`;
    element.style.left = `${(layer.x / canvas.width) * 100}%`;
    element.style.top = `${(layer.y / canvas.height) * 100}%`;
    element.style.width = `${(layer.width / canvas.width) * 100}%`;
    element.style.height = `${(layer.height / canvas.height) * 100}%`;
    element.style.zIndex = String(layer.z ?? index + 1);
    element.dataset.designLayer = layer.id;

    if (layer.interactive) {
      element.type = "button";
      element.dataset.designArtwork = "";
      element.dataset.designSource = layer.src;
      element.dataset.designAltCn = layer.altCn || "";
      element.dataset.designAltEn = layer.altEn || "";
      element.setAttribute("aria-label", getLayerAlt(layer));
    } else {
      element.setAttribute("aria-hidden", "true");
      element.classList.add("is-revealed", "is-reveal-complete");
    }

    const reveal = document.createElement("span");
    reveal.className = "design-layer__reveal";
    const media = document.createElement("span");
    media.className = "design-layer__media";
    media.style.setProperty("--design-placeholder", layer.color || "transparent");
    const image = document.createElement("img");
    image.src = layer.src;
    image.alt = layer.interactive ? getLayerAlt(layer) : "";
    image.width = layer.sourceWidth || layer.width;
    image.height = layer.sourceHeight || layer.height;
    image.loading = "eager";
    image.decoding = "async";
    if (index < 3) image.fetchPriority = "high";
    watchImage(image, element);
    media.appendChild(image);
    reveal.appendChild(media);
    element.appendChild(reveal);
    return element;
  }

  function watchImage(image, layer) {
    let settled = false;
    const ready = () => {
      if (settled || !image.naturalWidth) return;
      settled = true;
      const reveal = () => {
        layer.classList.add("is-ready");
        if (layer.dataset.designVisible === "true") revealLayer(layer);
      };
      if (typeof image.decode === "function") image.decode().then(reveal).catch(reveal);
      else reveal();
    };
    image.addEventListener("load", ready, { once: true });
    image.addEventListener("error", () => layer.classList.add("is-load-error"), { once: true });
    if (image.complete && image.naturalWidth) ready();
  }

  function initializeReveals(layers) {
    if (reducedMotion.matches || !("IntersectionObserver" in window)) {
      layers.forEach((layer) => {
        layer.dataset.designVisible = "true";
        revealLayer(layer, { immediate: true });
      });
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const layer = entry.target;
        layer.dataset.designVisible = "true";
        if (layer.classList.contains("is-ready")) revealLayer(layer);
        observer.unobserve(layer);
      });
    }, {
      rootMargin: "0px 0px -8%",
      threshold: .08
    });

    layers.forEach((layer) => observer.observe(layer));
  }

  function revealLayer(layer, options = {}) {
    if (layer.classList.contains("is-reveal-complete")) return;
    layer.classList.add("is-revealed");
    if (options.immediate || reducedMotion.matches) {
      layer.classList.add("is-reveal-complete");
      return;
    }

    const reveal = layer.querySelector(".design-layer__reveal");
    if (!reveal) {
      layer.classList.add("is-reveal-complete");
      return;
    }

    let completed = false;
    const complete = () => {
      if (completed) return;
      completed = true;
      window.clearTimeout(fallbackTimer);
      layer.classList.add("is-reveal-complete");
    };
    const fallbackTimer = window.setTimeout(complete, 1280);
    reveal.addEventListener("transitionend", complete, { once: true });
  }

  function initializeLightbox(dialog) {
    const image = dialog.querySelector("[data-design-lightbox-image]");
    const stage = dialog.querySelector("[data-design-lightbox-stage]");
    const navToggle = document.querySelector(".js-nav-toggle");
    if (!image || !stage || !navToggle) return;
    let closeTimer = 0;
    let closeTransitionHandler = null;

    const setDockState = (open) => {
      navToggle.setAttribute("aria-expanded", String(open));
      navToggle.setAttribute("aria-label", open ? "Close preview" : "Open navigation");
    };

    const cancelPendingDismiss = () => {
      window.clearTimeout(closeTimer);
      closeTimer = 0;
      if (!closeTransitionHandler) return;
      dialog.removeEventListener("transitionend", closeTransitionHandler);
      closeTransitionHandler = null;
    };

    const finishDismiss = () => {
      cancelPendingDismiss();
      dialog.classList.remove("is-ready", "is-closing");
      if (dialog.open) dialog.close();
      document.body.classList.remove("design-lightbox-open");
      setDockState(false);
      window.l4rxxSmoothScroll?.unlock?.();
    };

    const open = (source) => {
      const language = document.body.dataset.language === "cn" ? "cn" : "en";
      cancelPendingDismiss();
      dialog.classList.remove("is-ready", "is-closing");
      image.removeAttribute("src");
      image.alt = language === "cn" ? source.dataset.designAltCn : source.dataset.designAltEn;
      image.src = source.dataset.designSource;
      document.body.classList.add("design-lightbox-open");
      setDockState(true);
      window.l4rxxSmoothScroll?.lock?.();
      dialog.show();
      const reveal = () => {
        const ready = () => dialog.classList.add("is-ready");
        if (typeof image.decode === "function") image.decode().then(ready).catch(ready);
        else ready();
      };
      if (image.complete && image.naturalWidth) reveal();
      else image.addEventListener("load", reveal, { once: true });
    };

    const dismiss = () => {
      if (!dialog.open || dialog.classList.contains("is-closing")) return;
      dialog.classList.add("is-closing");
      dialog.classList.remove("is-ready");
      if (reducedMotion.matches) {
        finishDismiss();
        return;
      }
      closeTransitionHandler = (event) => {
        if (event.target !== dialog || event.propertyName !== "opacity") return;
        finishDismiss();
      };
      dialog.addEventListener("transitionend", closeTransitionHandler);
      closeTimer = window.setTimeout(finishDismiss, 440);
    };

    document.addEventListener("click", (event) => {
      const artwork = event.target.closest("[data-design-artwork]");
      if (artwork) open(artwork);
    });
    navToggle.addEventListener("click", (event) => {
      if (!dialog.open) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      dismiss();
    }, true);
    stage.addEventListener("click", (event) => {
      if (event.target === stage) dismiss();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && dialog.open) dismiss();
    });
    dialog.addEventListener("close", () => {
      cancelPendingDismiss();
      dialog.classList.remove("is-ready", "is-closing");
      document.body.classList.remove("design-lightbox-open");
      setDockState(false);
      window.l4rxxSmoothScroll?.unlock?.();
    });
    window.addEventListener("l4rxx:languagechange", () => {
      document.querySelectorAll("[data-design-artwork]").forEach((artwork) => {
        const language = document.body.dataset.language === "cn" ? "cn" : "en";
        const alt = language === "cn" ? artwork.dataset.designAltCn : artwork.dataset.designAltEn;
        artwork.setAttribute("aria-label", alt || "Design artwork");
        artwork.querySelector("img")?.setAttribute("alt", alt || "");
      });
    });
  }

  function getLayerAlt(layer) {
    return document.body.dataset.language === "cn"
      ? (layer.altCn || layer.altEn || layer.id)
      : (layer.altEn || layer.altCn || layer.id);
  }
})();
