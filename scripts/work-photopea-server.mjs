import { createServer } from "node:http";
import { copyFile, mkdir, readFile, rename, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { networkInterfaces } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { randomUUID } from "node:crypto";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const legacyAssetRoot = path.join(root, "workbench", "assets");
const legacyLayoutPath = path.join(root, "workbench", "work-layout.json");
const photopeaRoot = path.join(root, "workbench", "photopea");
const photopeaSourceRoot = path.join(photopeaRoot, "sources");
const photopeaExportRoot = path.join(photopeaRoot, "exports");
const photopeaManifestPath = path.join(photopeaRoot, "manifest.json");
const port = Number.parseInt(process.env.PORT || "8780", 10);
const host = process.env.HOST || "0.0.0.0";

const mimeTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".png", "image/png"],
  [".psd", "application/octet-stream"],
  [".webp", "image/webp"]
]);

const legacyImageExtensions = new Map([
  ["image/jpeg", ".jpg"],
  ["image/png", ".png"],
  ["image/webp", ".webp"]
]);

const sendJson = (response, statusCode, data, headers = {}) => {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
    ...headers
  });
  response.end(JSON.stringify(data));
};

const readBody = (request, maxBytes) =>
  new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    request.on("data", (chunk) => {
      size += chunk.length;
      if (size > maxBytes) {
        reject(new Error("Request body is too large."));
        request.destroy();
        return;
      }
      chunks.push(chunk);
    });
    request.on("end", () => resolve(Buffer.concat(chunks)));
    request.on("error", reject);
  });

const readJsonBody = async (request, maxBytes) => {
  const body = await readBody(request, maxBytes);
  try {
    return JSON.parse(body.toString("utf8"));
  } catch {
    throw new Error("Request body is not valid JSON.");
  }
};

const writeAtomically = async (targetPath, body) => {
  const temporaryPath = `${targetPath}.${randomUUID()}.tmp`;
  await writeFile(temporaryPath, body);
  await rename(temporaryPath, targetPath);
};

const writeWithPreviousBackup = async (targetPath, body) => {
  if (existsSync(targetPath)) {
    await copyFile(targetPath, `${targetPath}.previous`);
  }
  await writeAtomically(targetPath, body);
};

const writeJsonAtomically = (targetPath, value) =>
  writeAtomically(targetPath, `${JSON.stringify(value, null, 2)}\n`);

const createEmptyManifest = () => ({
  version: 1,
  updatedAt: null,
  sections: []
});

const readPhotopeaManifest = async () => {
  if (!existsSync(photopeaManifestPath)) return createEmptyManifest();
  try {
    const manifest = JSON.parse(await readFile(photopeaManifestPath, "utf8"));
    return manifest?.version === 1 && Array.isArray(manifest.sections)
      ? manifest
      : createEmptyManifest();
  } catch {
    return createEmptyManifest();
  }
};

const isValidLegacyLayout = (layout) => {
  if (!layout || layout.version !== 1 || !layout.artboards || !Array.isArray(layout.assets)) {
    return false;
  }
  return ["desktop", "mobile"].every((mode) => {
    const artboard = layout.artboards[mode];
    return (
      artboard &&
      Number.isFinite(artboard.width) &&
      Number.isFinite(artboard.height) &&
      artboard.width > 0 &&
      artboard.height > 0 &&
      Array.isArray(artboard.elements) &&
      artboard.elements.length <= 500
    );
  });
};

const safeStaticPath = (pathname) => {
  const decoded = decodeURIComponent(pathname).replaceAll("\\", "/");
  const allowedRoots = [
    ["/tools/work-photopea/", path.join(root, "tools", "work-photopea")],
    ["/tools/work-editor/", path.join(root, "tools", "work-editor")],
    ["/workbench/assets/", legacyAssetRoot],
    ["/workbench/photopea/exports/", photopeaExportRoot]
  ];
  const match = allowedRoots.find(([prefix]) => decoded.startsWith(prefix));
  if (!match) return null;

  const [prefix, allowedRoot] = match;
  const relativePath = decoded.slice(prefix.length);
  const absolutePath = path.resolve(allowedRoot, relativePath);
  return absolutePath === allowedRoot || absolutePath.startsWith(`${allowedRoot}${path.sep}`)
    ? absolutePath
    : null;
};

const sendFile = async (response, filePath) => {
  try {
    const fileStats = await stat(filePath);
    const resolvedPath = fileStats.isDirectory() ? path.join(filePath, "index.html") : filePath;
    const body = await readFile(resolvedPath);
    response.writeHead(200, {
      "Content-Type": mimeTypes.get(path.extname(resolvedPath).toLowerCase()) || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    response.end(body);
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
};

const updatePhotopeaManifest = async ({ sectionId, mode, width, height, documentName }) => {
  const manifest = await readPhotopeaManifest();
  let section = manifest.sections.find((item) => item.id === sectionId);
  if (!section) {
    section = { id: sectionId, desktop: null, mobile: null };
    manifest.sections.push(section);
  }

  const updatedAt = new Date().toISOString();
  section[mode] = {
    src: `/workbench/photopea/exports/work-${sectionId}-${mode}.webp`,
    width,
    height,
    documentName,
    updatedAt
  };
  manifest.sections.sort((a, b) => Number(a.id) - Number(b.id));
  manifest.updatedAt = updatedAt;
  await writeJsonAtomically(photopeaManifestPath, manifest);
  return manifest;
};

await Promise.all([
  mkdir(legacyAssetRoot, { recursive: true }),
  mkdir(photopeaSourceRoot, { recursive: true }),
  mkdir(photopeaExportRoot, { recursive: true })
]);

if (!existsSync(photopeaManifestPath)) {
  await writeJsonAtomically(photopeaManifestPath, createEmptyManifest());
}

const server = createServer(async (request, response) => {
  const url = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);

  try {
    if (request.method === "GET" && url.pathname === "/") {
      response.writeHead(302, { Location: "/tools/work-photopea/" });
      response.end();
      return;
    }

    if (request.method === "GET" && url.pathname === "/work.html") {
      await sendFile(response, path.join(root, "tools", "work-photopea", "preview.html"));
      return;
    }

    if (request.method === "GET" && url.pathname === "/__work/photopea/manifest") {
      sendJson(response, 200, await readPhotopeaManifest(), {
        "Access-Control-Allow-Origin": "*"
      });
      return;
    }

    if (request.method === "POST" && url.pathname === "/__work/photopea/export") {
      const sectionNumber = Number.parseInt(url.searchParams.get("section") || "", 10);
      const sectionId = Number.isInteger(sectionNumber) && sectionNumber >= 1 && sectionNumber <= 99
        ? String(sectionNumber).padStart(2, "0")
        : null;
      const mode = url.searchParams.get("mode");
      const format = url.searchParams.get("format");
      const width = Number.parseInt(url.searchParams.get("width") || "", 10);
      const height = Number.parseInt(url.searchParams.get("height") || "", 10);
      const documentName = String(url.searchParams.get("name") || "").slice(0, 160);

      if (!sectionId || !["desktop", "mobile"].includes(mode) || !["psd", "webp"].includes(format)) {
        sendJson(response, 400, { error: "Invalid Photopea export metadata." });
        return;
      }
      if (
        format === "webp" &&
        (!Number.isInteger(width) || !Number.isInteger(height) || width < 1 || height < 1 || width > 30000 || height > 30000)
      ) {
        sendJson(response, 400, { error: "Invalid Photopea document dimensions." });
        return;
      }

      const body = await readBody(request, format === "psd" ? 400 * 1024 * 1024 : 160 * 1024 * 1024);
      if (!body.length) {
        sendJson(response, 400, { error: "Photopea returned an empty file." });
        return;
      }

      const targetRoot = format === "psd" ? photopeaSourceRoot : photopeaExportRoot;
      const targetPath = path.join(targetRoot, `work-${sectionId}-${mode}.${format}`);
      await writeWithPreviousBackup(targetPath, body);
      const manifest = format === "webp"
        ? await updatePhotopeaManifest({ sectionId, mode, width, height, documentName })
        : await readPhotopeaManifest();
      sendJson(response, 201, {
        ok: true,
        section: sectionId,
        mode,
        format,
        bytes: body.length,
        manifestUpdatedAt: manifest.updatedAt
      });
      return;
    }

    // Preserve the user's existing local editor and drafts as a migration backup.
    if (request.method === "GET" && url.pathname === "/__work/layout") {
      if (!existsSync(legacyLayoutPath)) {
        sendJson(response, 404, { error: "No legacy draft layout exists." });
        return;
      }
      sendJson(response, 200, JSON.parse(await readFile(legacyLayoutPath, "utf8")));
      return;
    }

    if (request.method === "POST" && url.pathname === "/__work/layout") {
      const layout = await readJsonBody(request, 5 * 1024 * 1024);
      if (!isValidLegacyLayout(layout)) {
        sendJson(response, 400, { error: "Invalid legacy WORK layout." });
        return;
      }
      layout.updatedAt = new Date().toISOString();
      await writeJsonAtomically(legacyLayoutPath, layout);
      sendJson(response, 200, { ok: true, updatedAt: layout.updatedAt });
      return;
    }

    if (request.method === "POST" && url.pathname === "/__work/asset") {
      const body = await readJsonBody(request, 70 * 1024 * 1024);
      const extension = legacyImageExtensions.get(body?.type);
      if (!extension || typeof body?.data !== "string") {
        sendJson(response, 400, { error: "Only JPEG, PNG and WebP images are supported." });
        return;
      }
      const buffer = Buffer.from(body.data, "base64");
      if (!buffer.length || buffer.length > 50 * 1024 * 1024) {
        sendJson(response, 400, { error: "Image is empty or exceeds 50 MB." });
        return;
      }
      const fileName = `legacy-${randomUUID().slice(0, 8)}${extension}`;
      await writeFile(path.join(legacyAssetRoot, fileName), buffer);
      sendJson(response, 201, {
        name: String(body.name || fileName),
        src: `/workbench/assets/${fileName}`
      });
      return;
    }

    if (request.method === "GET") {
      const staticPath = safeStaticPath(url.pathname);
      if (staticPath) {
        await sendFile(response, staticPath);
        return;
      }
    }

    response.writeHead(404);
    response.end("Not found");
  } catch (error) {
    sendJson(response, 500, {
      error: error instanceof Error ? error.message : "Unexpected server error."
    });
  }
});

server.listen(port, host, () => {
  console.log(`Photopea WORK: http://127.0.0.1:${port}/tools/work-photopea/`);
  console.log(`WORK preview: http://127.0.0.1:${port}/work.html`);
  for (const addresses of Object.values(networkInterfaces())) {
    for (const address of addresses || []) {
      if (address.family === "IPv4" && !address.internal) {
        console.log(`LAN preview: http://${address.address}:${port}/work.html`);
      }
    }
  }
});
