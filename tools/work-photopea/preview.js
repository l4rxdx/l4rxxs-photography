const root = document.querySelector("[data-work-preview]");
const channel = "BroadcastChannel" in window
  ? new BroadcastChannel("l4rxx-work-preview")
  : null;
const requestedMode = new URLSearchParams(window.location.search).get("mode");
const previewMode = ["desktop", "mobile"].includes(requestedMode)
  ? requestedMode
  : "auto";

document.documentElement.dataset.previewMode = previewMode;

const createSection = (section, index) => {
  const responsiveDesktop = section.desktop || section.mobile;
  const responsiveMobile = section.mobile;
  const primary = previewMode === "mobile"
    ? section.mobile || section.desktop
    : responsiveDesktop;
  const mobile = previewMode === "auto" ? responsiveMobile : null;
  if (!primary) return null;

  const container = document.createElement("section");
  container.className = "work-preview__section";
  container.dataset.section = section.id;

  const picture = document.createElement("picture");
  picture.className = "work-preview__picture";

  if (mobile) {
    const source = document.createElement("source");
    source.media = "(max-width: 768px)";
    source.srcset = `${mobile.src}?t=${encodeURIComponent(mobile.updatedAt || "")}`;
    picture.appendChild(source);
  }

  const image = document.createElement("img");
  image.className = "work-preview__image";
  image.src = `${primary.src}?t=${encodeURIComponent(primary.updatedAt || "")}`;
  image.width = primary.width;
  image.height = primary.height;
  image.alt = "";
  image.decoding = "async";
  image.loading = index === 0 ? "eager" : "lazy";
  picture.appendChild(image);
  container.appendChild(picture);
  return container;
};

const render = async () => {
  try {
    const response = await fetch("/__work/photopea/manifest", { cache: "no-store" });
    if (!response.ok) throw new Error("Manifest unavailable");
    const manifest = await response.json();
    const fragment = document.createDocumentFragment();
    manifest.sections.forEach((section, index) => {
      const node = createSection(section, index);
      if (node) fragment.appendChild(node);
    });

    root.replaceChildren();
    if (fragment.childNodes.length) {
      root.appendChild(fragment);
    } else {
      const empty = document.createElement("div");
      empty.className = "work-preview__empty";
      empty.textContent = "尚未导出 WORK 画板";
      root.appendChild(empty);
    }
  } catch {
    root.innerHTML = '<div class="work-preview__empty">无法读取 WORK 草稿</div>';
  }
};

channel?.addEventListener("message", (event) => {
  if (event.data?.type === "reload") render();
});

render();
