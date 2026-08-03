(() => {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const nativeTouchScroll = window.matchMedia("(max-width: 768px), (hover: none) and (pointer: coarse)");
  const linearScrollOptions = {
    autoRaf: true,
    lerp: 0.045,
    smoothWheel: true,
    wheelMultiplier: 0.8,
    syncTouch: true,
    touchMultiplier: 0.8,
    orientation: "vertical",
    gestureOrientation: "vertical",
    overscroll: false
  };
  const nestedControllers = new Set();
  let lenis = null;
  let lockDepth = 0;
  let lockedScrollY = 0;
  let savedHtmlOverflow = "";
  let lockedScrollFrame = 0;

  const isInsideLockedScrollRegion = (event) => {
    const target = event.target instanceof Element ? event.target : event.target?.parentElement;
    return Boolean(target?.closest("[data-lenis-prevent]"));
  };

  const preventLockedViewportWheel = (event) => {
    if (lockDepth <= 0 || nativeTouchScroll.matches || isInsideLockedScrollRegion(event)) return;
    event.preventDefault();
  };

  const restoreLockedDesktopScroll = () => {
    if (lockDepth <= 0 || nativeTouchScroll.matches) return;
    const currentScrollY = window.scrollY || document.documentElement.scrollTop || 0;
    if (Math.abs(currentScrollY - lockedScrollY) < .5 || lockedScrollFrame) return;
    lockedScrollFrame = requestAnimationFrame(() => {
      lockedScrollFrame = 0;
      window.scrollTo({ top: lockedScrollY, left: 0, behavior: "auto" });
      lenis?.scrollTo(lockedScrollY, { immediate: true, force: true });
    });
  };

  const applyDocumentScrollLock = () => {
    window.removeEventListener("scroll", restoreLockedDesktopScroll);
    window.removeEventListener("wheel", preventLockedViewportWheel);
    document.documentElement.classList.toggle("l4rxx-scrollbar-lock", !nativeTouchScroll.matches);
    if (nativeTouchScroll.matches) {
      document.documentElement.style.overflow = "hidden";
      return;
    }
    document.documentElement.style.overflow = savedHtmlOverflow;
    window.addEventListener("scroll", restoreLockedDesktopScroll, { passive: true });
    window.addEventListener("wheel", preventLockedViewportWheel, { passive: false });
  };

  const releaseDocumentScrollLock = () => {
    cancelAnimationFrame(lockedScrollFrame);
    lockedScrollFrame = 0;
    window.removeEventListener("scroll", restoreLockedDesktopScroll);
    window.removeEventListener("wheel", preventLockedViewportWheel);
    document.documentElement.classList.remove("l4rxx-scrollbar-lock");
    document.documentElement.style.overflow = savedHtmlOverflow;
  };

  const getNativeTargetTop = (target) => {
    if (typeof target === "number") return target;
    if (typeof target === "string") {
      const element = document.querySelector(target);
      return element ? window.scrollY + element.getBoundingClientRect().top : 0;
    }
    if (target instanceof Element) {
      return window.scrollY + target.getBoundingClientRect().top;
    }
    return 0;
  };

  const getNestedTargetTop = (wrapper, target) => {
    if (typeof target === "number") return target;
    if (typeof target === "string") {
      const element = wrapper.querySelector(target);
      return element ? wrapper.scrollTop + element.getBoundingClientRect().top - wrapper.getBoundingClientRect().top : 0;
    }
    if (target instanceof Element) {
      return wrapper.scrollTop + target.getBoundingClientRect().top - wrapper.getBoundingClientRect().top;
    }
    return 0;
  };

  const shouldUseNativeScroll = (node) => {
    const element = node instanceof Element ? node : node?.parentElement;
    if (!element) return false;
    if (element.closest("[data-lenis-prevent]")) return true;
    if (element.closest(".local-work-layer--draggable")) return true;
    return window.innerWidth <= 768 && Boolean(element.closest(".focus-rail"));
  };

  const createNestedInstance = (handle) => {
    if (handle.instance || reducedMotion.matches || nativeTouchScroll.matches || typeof window.Lenis !== "function") return;
    handle.instance = new window.Lenis({
      ...linearScrollOptions,
      wrapper: handle.wrapper,
      content: handle.wrapper,
      eventsTarget: handle.wrapper
    });
  };

  const controller = {
    enabled: false,
    instance: null,
    scrollTo(target, options = {}) {
      if (lenis) {
        lenis.scrollTo(target, {
          force: true,
          ...options
        });
        return;
      }
      window.scrollTo({
        top: getNativeTargetTop(target),
        left: 0,
        behavior: options.immediate === false && !reducedMotion.matches ? "smooth" : "auto"
      });
      options.onComplete?.();
    },
    sync(top = window.scrollY || document.documentElement.scrollTop || 0) {
      if (!lenis) return;
      lenis.scrollTo(top, { immediate: true, force: true });
    },
    start() {
      lenis?.start();
    },
    stop() {
      lenis?.stop();
    },
    resize() {
      lenis?.resize();
    },
    createNested(wrapper) {
      if (!(wrapper instanceof HTMLElement)) return null;
      const handle = {
        wrapper,
        instance: null,
        scrollTo(target, options = {}) {
          if (this.instance) {
            this.instance.scrollTo(target, {
              force: true,
              ...options
            });
            return;
          }
          wrapper.scrollTo({
            top: getNestedTargetTop(wrapper, target),
            left: 0,
            behavior: options.immediate === false && !reducedMotion.matches ? "smooth" : "auto"
          });
          options.onComplete?.();
        },
        resize() {
          this.instance?.resize();
        },
        destroy() {
          this.instance?.destroy();
          this.instance = null;
          nestedControllers.delete(this);
        }
      };
      nestedControllers.add(handle);
      createNestedInstance(handle);
      return handle;
    },
    lock() {
      lockDepth += 1;
      if (lockDepth > 1) return;
      lockedScrollY = window.scrollY || document.documentElement.scrollTop || 0;
      savedHtmlOverflow = document.documentElement.style.overflow;
      applyDocumentScrollLock();
      lenis?.stop();
    },
    unlock(top = lockedScrollY) {
      lockDepth = Math.max(0, lockDepth - 1);
      if (lockDepth > 0) return;
      releaseDocumentScrollLock();
      lenis?.start();
      const targetTop = Number.isFinite(top) ? top : lockedScrollY;
      if (lenis) {
        lenis.resize();
        lenis.scrollTo(targetTop, { immediate: true, force: true });
      }
      else window.scrollTo({ top: targetTop, left: 0, behavior: "auto" });
    }
  };

  const destroy = () => {
    nestedControllers.forEach((handle) => {
      handle.instance?.destroy();
      handle.instance = null;
    });
    if (lenis) {
      lenis.destroy();
      lenis = null;
    }
    controller.enabled = false;
    controller.instance = null;
    if (window.lenis && typeof window.lenis === "object") delete window.lenis;
  };

  const create = () => {
    if (lenis || reducedMotion.matches || nativeTouchScroll.matches || typeof window.Lenis !== "function") return;
    lenis = new window.Lenis({
      ...linearScrollOptions,
      stopInertiaOnNavigate: true,
      prevent: shouldUseNativeScroll
    });
    nestedControllers.forEach(createNestedInstance);
    if (lockDepth > 0) lenis.stop();
    controller.enabled = true;
    controller.instance = lenis;
    window.lenis = lenis;
  };

  window.l4rxxSmoothScroll = controller;
  create();

  reducedMotion.addEventListener?.("change", (event) => {
    if (event.matches) destroy();
    else create();
  });

  nativeTouchScroll.addEventListener?.("change", (event) => {
    if (lockDepth > 0) applyDocumentScrollLock();
    if (event.matches) destroy();
    else create();
  });
})();
