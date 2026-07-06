import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const dist = join(root, "dist");

const rootFiles = [
  "404.html",
  "focus.html",
  "index.html",
  "robots.txt",
  "UPDATE_LOG.md",
  "site.webmanifest",
  "sitemap.xml",
  "work.html"
];

const rootImageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".ico"]);

function copyPath(from, to) {
  if (!existsSync(from)) {
    throw new Error(`Missing build input: ${from}`);
  }
  cpSync(from, to, { recursive: true });
}

rmSync(dist, { recursive: true, force: true });
mkdirSync(dist, { recursive: true });

for (const file of rootFiles) {
  copyPath(join(root, file), join(dist, file));
}

for (const file of readdirSync(root)) {
  if (rootImageExtensions.has(extname(file).toLowerCase())) {
    copyPath(join(root, file), join(dist, file));
  }
}

for (const dir of ["assets", "content"]) {
  copyPath(join(root, dir), join(dist, dir));
}

mkdirSync(join(dist, "images"), { recursive: true });
copyPath(join(root, "images", "og-image.jpg"), join(dist, "images", "og-image.jpg"));

for (const dir of ["thumbs", "web"]) {
  copyPath(join(root, "images", dir), join(dist, "images", dir));
}

console.log("Built static site to dist/");

