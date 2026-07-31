import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";

const read = (file) => readFile(new URL(`../${file}`, import.meta.url), "utf8");
const exists = async (file) => {
  try {
    await access(new URL(`../${file}`, import.meta.url));
    return true;
  } catch {
    return false;
  }
};

const [
  packageJson,
  buildScript,
  workPage,
  bridgeHtml,
  bridgeScript,
  previewHtml,
  previewScript,
  sitePreviewScript,
  serverScript,
  layerSyncScript,
  manifestText,
  legacyLayoutText
] = await Promise.all([
  read("package.json"),
  read("scripts/cloudflare-build.mjs"),
  read("work.html"),
  read("tools/work-photopea/index.html"),
  read("tools/work-photopea/photopea.js"),
  read("tools/work-photopea/preview.html"),
  read("tools/work-photopea/preview.js"),
  read("tools/work-photopea/site-preview.js"),
  read("scripts/work-photopea-server.mjs"),
  read("scripts/sync-work-photopea-layers.py"),
  read("workbench/photopea/manifest.json"),
  read("workbench/work-layout.json")
]);

const packageData = JSON.parse(packageJson);
const manifest = JSON.parse(manifestText);
const legacyLayout = JSON.parse(legacyLayoutText);

assert.equal(packageData.scripts["work:photopea"], "node scripts/work-photopea-server.mjs");
assert.equal(packageData.scripts["test:work-photopea"], "node tests/work-photopea-check.mjs");

assert.match(bridgeHtml, /data-photopea-frame/);
assert.match(bridgeHtml, /data-section/);
assert.match(bridgeHtml, /data-mode="desktop"/);
assert.match(bridgeHtml, /data-mode="mobile"/);
assert.match(bridgeHtml, /data-preview/);
assert.match(bridgeHtml, /data-export/);
assert.match(bridgeScript, /https:\/\/www\.photopea\.com/);
assert.doesNotMatch(bridgeScript, /customIO/);
assert.doesNotMatch(bridgeScript, /L4RXX_SAVE/);
assert.match(bridgeScript, /autosaveTarget\.saveToOE\("psd"\)/);
assert.match(bridgeScript, /saveToOE\("webp:0\.92"\)/);
assert.match(bridgeScript, /const EXPORT_FORMATS = \[\s*\{ stage: "webp"/);
assert.match(bridgeScript, /exportButton\.addEventListener\("click", startExport\)/);
assert.match(bridgeScript, /AUTOSAVE_POLL_INTERVAL/);
assert.match(bridgeScript, /AUTOSAVE_IDLE_DELAY/);
assert.match(bridgeScript, /L4RXX_AUTOSAVE_META/);
assert.match(bridgeScript, /autosaveTarget\.saveToOE\("psd"\)/);
assert.match(bridgeScript, /autosavePreviousDocument/);
assert.match(bridgeScript, /app\.activeDocument = autosavePreviousDocument/);
assert.match(bridgeScript, /format: "psd"/);
assert.match(bridgeScript, /document\.addEventListener\("visibilitychange"/);
assert.match(bridgeScript, /window\.addEventListener\("pagehide"/);
assert.match(bridgeScript, /exportAfterAutosave/);
assert.match(bridgeScript, /if \(autosaveTask \|\| autosaveScanInFlight\)/);
assert.doesNotMatch(bridgeScript, /if \(autosaveTask \|\| autosaveQueue\.size\)/);
assert.match(bridgeScript, /\/__work\/photopea\/export/);
assert.match(bridgeScript, /PHOTO\|PERSON/);
assert.match(bridgeScript, /DOCUMENT_TARGET_PATTERN/);
assert.match(bridgeScript, /getDocumentTarget/);
assert.match(bridgeScript, /exportTask\.mode = documentTarget\.mode/);
assert.match(bridgeScript, /\[\._ -\]/);
assert.match(bridgeScript, /documentSections\.length === 1/);
assert.match(bridgeScript, /sectionInput\.value = String\(detectedSection\)/);
assert.match(bridgeScript, /不能覆盖章节/);
assert.match(bridgeScript, /sitePreviewUrl\.port = "8778"/);
assert.match(bridgeScript, /sitePreviewUrl\.pathname = "\/work\.html"/);
assert.match(bridgeScript, /searchParams\.set\("refresh", String\(Date\.now\(\)\)\)/);
assert.match(bridgeScript, /预览手机/);

assert.match(serverScript, /\/__work\/photopea\/manifest/);
assert.match(serverScript, /\/__work\/photopea\/export/);
assert.match(serverScript, /writeWithPreviousBackup/);
assert.match(serverScript, /\.previous/);
assert.doesNotMatch(serverScript, /syncPhotopeaLayerLayout/);
assert.doesNotMatch(serverScript, /layersUpdated/);
assert.match(serverScript, /updatePhotopeaManifest\(\{/);
assert.doesNotMatch(serverScript, /updatePhotopeaLayerLayout/);
assert.match(layerSyncScript, /PHOTO_PATTERN/);
assert.match(layerSyncScript, /\[\._ -\]/);
assert.match(layerSyncScript, /f"PHOTO__\{section_id\}"/);
assert.match(layerSyncScript, /PERSON_ALIASES/);
assert.match(layerSyncScript, /"draggable", 20/);
assert.match(layerSyncScript, /background_target/);
assert.match(layerSyncScript, /--flat-background/);
assert.match(layerSyncScript, /dominant_color/);
assert.match(serverScript, /Access-Control-Allow-Origin/);
assert.match(serverScript, /work-\$\{sectionId\}-\$\{mode\}\.\$\{format\}/);
assert.match(serverScript, /absolutePath\.startsWith\(`\$\{allowedRoot\}\$\{path\.sep\}`\)/);
assert.match(serverScript, /url\.pathname === "\/work\.html"/);
assert.match(previewHtml, /data-work-preview/);
assert.match(previewScript, /createElement\("source"\)/);
assert.match(previewScript, /max-width: 768px/);
assert.match(previewScript, /BroadcastChannel/);
assert.match(previewScript, /previewMode === "mobile"/);
assert.match(previewScript, /documentElement\.dataset\.previewMode/);
assert.match(workPage, /host === "127\.0\.0\.1"/);
assert.match(workPage, /tools\/work-photopea\/site-preview\.js\?v=work-preview3/);
assert.doesNotMatch(workPage, /script\.type = "module"/);
assert.match(sitePreviewScript, /bridgeOrigin\.port = "8780"/);
assert.match(sitePreviewScript, /is-local-photopea-preview/);
assert.match(sitePreviewScript, /desktopLayout/);
assert.match(sitePreviewScript, /layoutUpdatedAt >= exportUpdatedAt/);
assert.match(sitePreviewScript, /layer\.role === "photo"/);
assert.match(sitePreviewScript, /layer\.role === "draggable"/);
assert.match(sitePreviewScript, /setPointerCapture/);
assert.match(sitePreviewScript, /translate3d/);
assert.match(sitePreviewScript, /openLightbox/);
assert.match(sitePreviewScript, /setTimeout\(render, document\.hidden \? 5000 : 2000\)/);

assert.doesNotMatch(buildScript, /tools\/work-photopea|workbench\/photopea/);
assert.match(
  workPage,
  /<main class="work-page">\s*<p class="design-placeholder">xdx\u8fd8\u6ca1\u8bbe\u8ba1\u5b8c<\/p>\s*<\/main>/
);

assert.equal(manifest.version, 1);
assert.ok(Array.isArray(manifest.sections));
assert.equal(manifest.sections[0]?.desktopLayout?.width, 2048);
assert.ok(Array.isArray(manifest.sections[0]?.desktopLayout?.layers));
assert.ok(manifest.sections[0]?.desktopLayout?.layers.some((layer) => layer.role === "draggable"));
const firstSectionLayers = manifest.sections[0]?.desktopLayout?.layers || [];
const firstSectionPhoto = firstSectionLayers.find((layer) => layer.role === "photo");
const firstSectionDraggable = firstSectionLayers.find((layer) => layer.role === "draggable");
assert.ok(firstSectionDraggable.z > firstSectionPhoto.z);
assert.ok(firstSectionDraggable.z > 10);
assert.equal(legacyLayout.version, 1);
assert.ok(Array.isArray(legacyLayout.assets));
assert.ok(await exists("tools/work-editor/index.html"));
assert.ok(await exists("workbench/assets/asset-01d8f125.png"));
assert.ok(await exists("workbench/assets/1-032487b9.png"));

console.log("Photopea WORK bridge checks passed.");
