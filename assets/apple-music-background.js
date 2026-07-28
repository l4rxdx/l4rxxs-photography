(function initializeAppleMusicBackground(global) {
  "use strict";

  const colorCache = new Map();
  const targetRuns = new WeakMap();
  const sampleSize = 48;

  function clamp(min, value, max) {
    return Math.max(min, Math.min(value, max));
  }

  function getSourceKey(source) {
    const value = source instanceof HTMLImageElement
      ? source.currentSrc || source.getAttribute("src")
      : source;
    if (!value) return "";
    try {
      return new URL(value, window.location.href).href;
    } catch (error) {
      return String(value);
    }
  }

  function isImageReady(image) {
    return image instanceof HTMLImageElement && image.complete && image.naturalWidth > 0;
  }

  function waitForImage(image) {
    if (isImageReady(image)) return Promise.resolve(image);
    return new Promise((resolve, reject) => {
      const finish = () => isImageReady(image) ? resolve(image) : reject(new Error("Image did not load"));
      image.addEventListener("load", finish, { once: true });
      image.addEventListener("error", () => reject(new Error("Image did not load")), { once: true });
    });
  }

  function loadImage(source) {
    const image = new Image();
    const url = getSourceKey(source);
    try {
      if (new URL(url).origin !== window.location.origin) image.crossOrigin = "anonymous";
    } catch (error) {
      image.crossOrigin = "anonymous";
    }
    image.decoding = "async";
    image.src = url;
    return waitForImage(image);
  }

  function rgbToHsl(red, green, blue) {
    const r = red / 255;
    const g = green / 255;
    const b = blue / 255;
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const lightness = (max + min) / 2;
    const delta = max - min;
    if (delta === 0) return { hue: 0, saturation: 0, lightness };
    const saturation = delta / (1 - Math.abs(2 * lightness - 1));
    let hue = 0;
    if (max === r) hue = ((g - b) / delta) % 6;
    else if (max === g) hue = (b - r) / delta + 2;
    else hue = (r - g) / delta + 4;
    return { hue: hue * 60, saturation, lightness };
  }

  function hslToRgb(hue, saturation, lightness) {
    const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation;
    const segment = ((hue % 360) + 360) % 360 / 60;
    const secondary = chroma * (1 - Math.abs(segment % 2 - 1));
    let r = 0;
    let g = 0;
    let b = 0;
    if (segment < 1) [r, g] = [chroma, secondary];
    else if (segment < 2) [r, g] = [secondary, chroma];
    else if (segment < 3) [g, b] = [chroma, secondary];
    else if (segment < 4) [g, b] = [secondary, chroma];
    else if (segment < 5) [r, b] = [secondary, chroma];
    else [r, b] = [chroma, secondary];
    const match = lightness - chroma / 2;
    return [r, g, b].map((value) => Math.round((value + match) * 255));
  }

  function getRelativeLuminance(rgb) {
    const channels = rgb.map((value) => {
      const channel = value / 255;
      return channel <= 0.04045 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
    });
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  }

  function getContrastRatio(first, second) {
    const lighter = Math.max(getRelativeLuminance(first), getRelativeLuminance(second));
    const darker = Math.min(getRelativeLuminance(first), getRelativeLuminance(second));
    return (lighter + 0.05) / (darker + 0.05);
  }

  function createSceneColor(hue, saturation, sourceLightness) {
    const themedSaturation = clamp(0, saturation * 1.08, 0.78);
    const candidates = [
      { foreground: [12, 12, 12], direction: 1 },
      { foreground: [235, 231, 223], direction: -1 }
    ].map(({ foreground, direction }) => {
      let lightness = sourceLightness;
      let rgb = hslToRgb(hue, themedSaturation, lightness);
      for (let attempt = 0; attempt < 24 && getContrastRatio(rgb, foreground) < 5.5; attempt += 1) {
        lightness = clamp(0.08, lightness + direction * 0.015, 0.86);
        rgb = hslToRgb(hue, themedSaturation, lightness);
      }
      return {
        rgb,
        foreground,
        distance: Math.abs(lightness - sourceLightness),
        contrast: getContrastRatio(rgb, foreground)
      };
    });
    candidates.sort((first, second) => first.distance - second.distance || second.contrast - first.contrast);
    const selected = candidates[0];
    return {
      backgroundCss: `rgb(${selected.rgb[0]}, ${selected.rgb[1]}, ${selected.rgb[2]})`,
      foregroundCss: `rgb(${selected.foreground[0]}, ${selected.foreground[1]}, ${selected.foreground[2]})`
    };
  }

  function createPreferredColor(value) {
    const match = /^#([0-9a-f]{6})$/i.exec(String(value || "").trim());
    if (!match) return null;
    const rgb = [0, 2, 4].map((offset) => parseInt(match[1].slice(offset, offset + 2), 16));
    const darkForeground = [12, 12, 12];
    const lightForeground = [235, 231, 223];
    const foreground = getContrastRatio(rgb, darkForeground) >= getContrastRatio(rgb, lightForeground)
      ? darkForeground
      : lightForeground;
    const css = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
    return {
      rgb,
      css,
      sceneCss: css,
      foregroundCss: `rgb(${foreground[0]}, ${foreground[1]}, ${foreground[2]})`
    };
  }

  function createSampledColor(value) {
    const match = /^#([0-9a-f]{6})$/i.exec(String(value || "").trim());
    if (!match) return null;
    const rgb = [0, 2, 4].map((offset) => parseInt(match[1].slice(offset, offset + 2), 16));
    const hsl = rgbToHsl(rgb[0], rgb[1], rgb[2]);
    const saturation = clamp(0, hsl.saturation, 0.72);
    const lightness = clamp(0.18, hsl.lightness, 0.72);
    const scene = createSceneColor(hsl.hue, saturation, lightness);
    return {
      rgb,
      css: `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`,
      sceneCss: scene.backgroundCss,
      foregroundCss: scene.foregroundCss
    };
  }

  function extractColor(image) {
    const canvas = document.createElement("canvas");
    canvas.width = sampleSize;
    canvas.height = sampleSize;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("Canvas is unavailable");
    context.drawImage(image, 0, 0, sampleSize, sampleSize);
    const pixels = context.getImageData(0, 0, sampleSize, sampleSize).data;
    const buckets = new Map();
    let averageRed = 0;
    let averageGreen = 0;
    let averageBlue = 0;
    let averageCount = 0;

    for (let offset = 0; offset < pixels.length; offset += 4) {
      const alpha = pixels[offset + 3];
      if (alpha < 180) continue;
      const red = pixels[offset];
      const green = pixels[offset + 1];
      const blue = pixels[offset + 2];
      const max = Math.max(red, green, blue) / 255;
      const min = Math.min(red, green, blue) / 255;
      const lightness = (max + min) / 2;
      const saturation = max === min ? 0 : (max - min) / (1 - Math.abs(2 * lightness - 1));
      const exposure = 1 - Math.min(1, Math.abs(lightness - 0.52) / 0.52);
      const weight = 0.45 + saturation * 0.85 + exposure * 0.35;
      const key = `${red >> 5}-${green >> 5}-${blue >> 5}`;
      const bucket = buckets.get(key) || { red: 0, green: 0, blue: 0, weight: 0 };
      bucket.red += red * weight;
      bucket.green += green * weight;
      bucket.blue += blue * weight;
      bucket.weight += weight;
      buckets.set(key, bucket);
      averageRed += red;
      averageGreen += green;
      averageBlue += blue;
      averageCount += 1;
    }

    if (!averageCount || !buckets.size) throw new Error("Image has no readable colors");
    const dominant = [...buckets.values()].sort((first, second) => second.weight - first.weight)[0];
    const dominantRgb = [dominant.red, dominant.green, dominant.blue].map((value) => value / dominant.weight);
    const averageRgb = [averageRed, averageGreen, averageBlue].map((value) => value / averageCount);
    const blended = dominantRgb.map((value, index) => value * 0.74 + averageRgb[index] * 0.26);
    const hsl = rgbToHsl(blended[0], blended[1], blended[2]);
    const saturation = clamp(0, hsl.saturation, 0.72);
    const lightness = clamp(0.18, hsl.lightness, 0.72);
    const rgb = hslToRgb(
      hsl.hue,
      saturation,
      lightness
    );
    const scene = createSceneColor(hsl.hue, saturation, lightness);
    return {
      rgb,
      css: `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`,
      sceneCss: scene.backgroundCss,
      foregroundCss: scene.foregroundCss
    };
  }

  async function from(source, target = document.body, options = {}) {
    if (!target?.style) throw new TypeError("AppleMusicBackground target must be an element");
    const sourceKey = getSourceKey(source);
    if (!sourceKey) throw new TypeError("AppleMusicBackground source is required");
    const preferredColor = createPreferredColor(options.preferredColor);
    const sampledColor = preferredColor ? null : createSampledColor(options.sampledColor);
    const localColor = preferredColor || sampledColor;
    const key = localColor ? `${sourceKey}|${localColor.css}|${localColor.sceneCss}` : sourceKey;
    const runId = (targetRuns.get(target) || 0) + 1;
    targetRuns.set(target, runId);
    try {
      let color = colorCache.get(key);
      if (!color) {
        color = localColor;
        if (!color) {
          let sourceImage = isImageReady(source) ? source : null;
          if (!sourceImage) sourceImage = source instanceof HTMLImageElement ? await waitForImage(source) : await loadImage(source);
          color = extractColor(sourceImage);
        }
        colorCache.set(key, color);
      }
      if (targetRuns.get(target) !== runId) return { ...color, applied: false };
      target.style.setProperty("--apple-music-background-color", color.css);
      target.style.setProperty("--apple-music-background-scene", color.sceneCss);
      target.style.setProperty("--apple-music-background-foreground", color.foregroundCss);
      target.dataset.appleMusicBackgroundReady = "true";
      target.dispatchEvent(new CustomEvent("applemusicbackgroundchange", { detail: color }));
      return { ...color, applied: true };
    } catch (error) {
      return { applied: false, error };
    }
  }

  function clear(target = document.body) {
    targetRuns.set(target, (targetRuns.get(target) || 0) + 1);
    target.style.removeProperty("--apple-music-background-color");
    target.style.removeProperty("--apple-music-background-scene");
    target.style.removeProperty("--apple-music-background-foreground");
    delete target.dataset.appleMusicBackgroundReady;
  }

  global.AppleMusicBackground = Object.freeze({ from, clear });
})(window);
