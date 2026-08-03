import { copyFile, cp, mkdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");

const copyFileIfPresent = async (from, to) => {
  const source = path.join(root, from);
  if (!existsSync(source)) return;
  await mkdir(path.dirname(path.join(dist, to)), { recursive: true });
  await copyFile(source, path.join(dist, to));
};

const copyDirIfPresent = async (from, to) => {
  const source = path.join(root, from);
  if (!existsSync(source)) return;
  await cp(source, path.join(dist, to), { recursive: true });
};

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

for (const file of [
  "index.html",
  "focus.html",
  "work.html",
  "logs.html",
  "404.html",
  "robots.txt",
  "sitemap.xml",
  "site.webmanifest",
  "_headers",
  "UPDATE_LOG.md",
  "RELEASE_LOG.md",
  "WORK_LOG.md",
  "README.md"
]) {
  await copyFileIfPresent(file, file);
}

await copyFileIfPresent("logs.html", "logs/index.html");

await copyDirIfPresent("assets", "assets");
await copyDirIfPresent("content", "content");
await copyDirIfPresent("images/web", "images/web");
await copyDirIfPresent("images/medium", "images/medium");
await copyDirIfPresent("images/thumbs", "images/thumbs");
await copyDirIfPresent("images/design", "images/design");
await copyFileIfPresent("images/og-image.jpg", "images/og-image.jpg");

console.log(`Built static site to ${path.relative(root, dist)}`);
