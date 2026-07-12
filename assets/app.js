let photos = [];
let overviewPhotos = [];
let overviewOrder = [];
const DEFAULT_PHOTO_NOTE_CN = "\u8fd9\u5730\u65b9\u672c\u6765\u662f\u7ed9\u6bcf\u4e2a\u7167\u7247\u5199\u70b9\u968f\u8bb0\u7684\uff0c\u4f46\u662f\u53c9\u6ef4\u53c9\u6709\u70b9\u61d2\u6ca1\u5199\u51e0\u4e2a";
const DEFAULT_PHOTO_NOTE_EN = "This space was meant for small notes for each photo, but XDX got lazy and only wrote a few.";
const DEFAULT_PHOTO_NOTE = DEFAULT_PHOTO_NOTE_CN;
const overviewSkipCells = new Set([2, 7]);
const OVERVIEW_RETURN_STORAGE_KEY = "l4rxx-overview-return";

const languageCopy = {
  en: {
    "nav.overview": "OVERVIEW",
    "nav.work": "WORK",
    "nav.logs": "LOGS",
    "logs.kicker": "Release history",
    "logs.title": "LOGS",
    "logs.intro": "User-facing release notes for visible site changes. Each version is grouped by optimizations, fixes, removals, and additions.",
    "home.about": "l4rxx is a visual maker collecting still moments, weathered surfaces, portraits, screens, and quiet fragments.",
    "work.menuAbout": "l4rxx works with available light, found color, and scenes that feel almost still.",
    contact: "CONTACT ME",
    "social.douyin": "TIKTOK",
    "social.instagram": "INS",
    "focus.back": "BACK",
    "focus.index": "INDEX",
    "focus.menuAbout": "I tried to stop obsessing over settings and return to the record itself.",
    rights: "\u00a9 2026 - all rights reserved"
  },
  cn: {
    "nav.overview": "\u603b\u89c8",
    "nav.work": "\u4f5c\u54c1",
    "nav.logs": "\u65e5\u5fd7",
    "logs.kicker": "\u6b63\u5f0f\u66f4\u65b0\u8bb0\u5f55",
    "logs.title": "\u65e5\u5fd7",
    "logs.intro": "\u9762\u5411\u8bbf\u95ee\u8005\u7684\u7f51\u7ad9\u66f4\u65b0\u8bb0\u5f55\u3002\u6bcf\u4e2a\u7248\u672c\u6309\u4f18\u5316\u3001\u4fee\u590d\u3001\u5220\u9664\u3001\u589e\u52a0\u5206\u7c7b\u5448\u73b0\u3002",
    "home.about": "l4rxx \u662f\u4e00\u4f4d\u89c6\u89c9\u521b\u4f5c\u8005\uff0c\u6536\u96c6\u9759\u6b62\u77ac\u95f4\u3001\u98ce\u5316\u8868\u9762\u3001\u8096\u50cf\u3001\u5c4f\u5e55\u4e0e\u5b89\u9759\u788e\u7247\u3002",
    "work.menuAbout": "l4rxx \u7528\u81ea\u7136\u5149\u3001\u88ab\u770b\u89c1\u7684\u989c\u8272\uff0c\u548c\u90a3\u4e9b\u5dee\u4e00\u70b9\u5c31\u9759\u6b62\u7684\u573a\u666f\u5de5\u4f5c\u3002",
    contact: "\u8054\u7cfb\u6211",
    "social.douyin": "\u6296\u97f3",
    "social.instagram": "INS",
    "focus.back": "\u8fd4\u56de",
    "focus.index": "\u7d22\u5f15",
    "focus.menuAbout": "\u6211\u8bd5\u7740\u4e0d\u518d\u7ea0\u7ed3\u53c2\u6570\uff0c\u56de\u5f52\u8bb0\u5f55\u672c\u8eab",
    rights: "\u00a9 2026 - \u4fdd\u7559\u6240\u6709\u6743\u5229"
  }
};

const releaseLogCategories = [
  { key: "optimizations", cn: "优化", en: "Optimizations" },
  { key: "fixes", cn: "修复", en: "Fixes" },
  { key: "removals", cn: "删除", en: "Removals" },
  { key: "additions", cn: "增加", en: "Additions" }
];

const releaseLogEntries = [
  {
    version: "v1.2.0",
    date: "2026-07-12",
    categories: {
      optimizations: {
        cn: [
          "优化首页 L4RXX 重力系统：增强移动端横纵倾斜响应，让文字在照片空白区域自然靠拢，并降低静止阶段的抖动与误碰。",
          "优化 rel 大图切换：移动端横向、桌面端纵向滑动，并依据相邻照片的真实可见尺寸计算间距、缩放、淡入淡出与纵深变化。",
          "优化快速连续滑动：新手势可从当前画面位置继续，主图与缩略图轨道分离推进，连续手势不再等待轨道动画结束。",
          "统一全站明暗主题的颜色过渡，并以共享渐隐雾化边缘和轻微轮廓阴影提升顶部导航图标的可读性。",
          "优化从 rel 返回首页的照片落位，使当前原图沿单段高 Z 轴轨迹回到原位置，并稳定交接给首页照片。"
        ],
        en: [
          "Refined the home L4RXX gravity system with stronger two-axis mobile tilt response, calmer settling, and whitespace-aware grouping around photos.",
          "Refined rel photo switching to use horizontal motion on mobile and vertical motion on desktop, with spacing, scale, fade, and depth derived from each photo's visible size.",
          "Improved rapid consecutive swipes so a new gesture continues from the current frame while the main photo and thumbnail rail advance independently.",
          "Unified light and dark theme color transitions across the site, with a shared fading edge haze and restrained contour shadows for clearer top controls.",
          "Improved the rel-to-home return so the active full photo follows one high-Z descent and hands off cleanly to its home position."
        ]
      },
      fixes: {
        cn: [
          "修复快速连续滑动被缩略图轨道动画阻塞、手势被吞掉，以及反向打断后仍继续播放旧队列的问题。",
          "修复 rel 大图取消滑动、首尾边界回弹和图层交接时可能出现的闪亮、残留帧或错误绕回。",
          "修复首页开场个别照片乱跳，以及从 rel 返回首页时照片二段跳和落位交接不连续的问题。",
          "修复菜单切换主题时文字、地球图标细线与头像变色时点不一致的问题。"
        ],
        en: [
          "Fixed rapid swipes being blocked by thumbnail motion, dropped gestures, and stale queued steps continuing after a reverse interruption.",
          "Fixed flashes, retained frames, and unintended wrapping during cancelled rel swipes, edge rebound, and visual-layer handoff.",
          "Fixed occasional home intro photo jumps and the two-stage rel-to-home landing handoff.",
          "Fixed menu theme timing differences between text, the globe's inner lines, and the avatar."
        ]
      },
      removals: {
        cn: [
          "删除顶部三个导航图标各自独立的模糊底板，改用一条共享且渐隐的背景雾化区域。"
        ],
        en: [
          "Removed the three separate blurred plates behind the top controls and replaced them with one shared fading haze."
        ]
      },
      additions: {
        cn: [
          "新增首页照片层随手机倾斜产生的轻微透视位移，以及 L4RXX 再次合体后的呼吸释放彩蛋。",
          "新增桌面端 rel 大图纵向鼠标拖动、触控笔和滚轮切换，并保留移动端横向手势。",
          "新增 rel 大图连续滑动队列，支持最多三步有边界的快速输入，并兼容普通 rel 与随记状态。"
        ],
        en: [
          "Added subtle device-tilt perspective to the home photo field and a breathing release moment when L4RXX reunites.",
          "Added vertical mouse, pen, and wheel switching for desktop rel photos while retaining horizontal mobile gestures.",
          "Added a bounded three-step rel swipe queue for rapid input in both the standard rel and notes states."
        ]
      }
    }
  },
  {
    version: "v1.1.3",
    date: "2026-07-10",
    categories: {
      optimizations: {
        cn: [
          "优化 rel 页面大图横向滑动，支持一张一张切换、缩略图同步、快速连续手势与更柔和的释放动画。",
          "优化随记页语言与主题切换时的文案过渡和布局稳定性，减少图片、随记线和文字跳动。",
          "优化菜单日志入口，改为更清晰的纸张图标，并让日志内容直接占用菜单页面。",
          "优化移动端首页 L4RXX 类重力互动，接入设备方向并加入低通滤波。"
        ],
        en: [
          "Refined rel main-photo horizontal swiping with one-photo navigation, thumbnail sync, rapid repeated gestures, and a softer release motion.",
          "Improved notes language and theme transitions so copy, note line, and image layout stay more stable.",
          "Improved the menu log entry with a clearer document icon and an in-menu release-log view.",
          "Improved the mobile home L4RXX gravity interaction with device-orientation input and low-pass filtering."
        ]
      },
      fixes: {
        cn: [
          "修复 rel 大图滑动后缩略图轨道失效、首尾图片绕回、取消滑动闪烁等问题。",
          "修复系统主题变化时网站自动主题未跟随的问题。",
          "修复随记页面多次切换语言后不自适应的问题。",
          "修复日志页切换主题时文字闪烁，以及桌面端菜单加号头像显示异常的问题。"
        ],
        en: [
          "Fixed rel main-photo swipes breaking thumbnail control, wrapping at the first or last image, and flashing after cancelled gestures.",
          "Fixed auto theme mode not following system theme changes.",
          "Fixed notes layout adaptation after repeated language switches.",
          "Fixed log-page copy flicker during theme changes and the incorrect desktop menu avatar rendering."
        ]
      },
      removals: {
        cn: ["移除移动端 rel 页面下滑进入沉浸大图模式的手势，保留随记页面下滑退出。"],
        en: ["Removed the mobile rel downward immersive-photo gesture while keeping swipe-down notes exit."]
      },
      additions: {
        cn: [
          "新增移动端随记上滑进入、下滑退出手势。",
          "新增 rel 页面大图横向滑动切换，支持普通 rel 状态，并兼容随记状态。"
        ],
        en: [
          "Added mobile swipe-up notes entry and swipe-down notes exit.",
          "Added rel main-photo horizontal swiping for the standard rel view, with notes-state compatibility."
        ]
      }
    }
  },
  {
    version: "v1.1.2",
    date: "2026-07-09",
    categories: {
      optimizations: {
        cn: [
          "日志入口改为右下角单页纸张图标，保持菜单界面的简洁性。",
          "正式日志页改为面向访问者的版本记录，按版本、类别、条目分级阅读。"
        ],
        en: [
          "Changed the log entry to a lower-right single-page document icon to keep the menu interface concise.",
          "Rebuilt the public log page as versioned release notes grouped by version, category, and item."
        ]
      },
      fixes: {
        cn: [
          "修正旧日志预览在浏览器中可能出现乱码、内容过细的问题。",
          "保持日志入口参与语言切换、主题切换与菜单动效。"
        ],
        en: [
          "Resolved the old browser log preview problem where markdown could appear garbled or overly technical.",
          "Kept the log entry connected to language switching, theme switching, and menu motion."
        ]
      },
      removals: {
        cn: ["移除面向访问者的 Work / Release / Index Markdown 预览切换界面。"],
        en: ["Removed the visitor-facing Work / Release / Index markdown preview switcher."]
      },
      additions: {
        cn: ["新增正式用户向日志页面与独立日志图标入口。"],
        en: ["Added a public release log page and an independent log icon entry."]
      }
    }
  },
  {
    version: "v1.1.1",
    date: "2026-07-09",
    categories: {
      optimizations: {
        cn: [
          "随记页语言切换时只过渡文字，避免图片与随记线跟随抖动。",
          "主题切换改为柔和过渡，黑夜主题为关键文字加入克制辉光。"
        ],
        en: [
          "Limited note-language transitions to the copy itself so the image and note line stay stable.",
          "Softened theme transitions and added a restrained glow to key dark-theme typography."
        ]
      },
      fixes: {
        cn: [
          "修复随记页面多次切换语言后自适应失效的问题。",
          "修复系统主题变化后网站未自动跟随的问题。"
        ],
        en: [
          "Fixed note layout adaptation after repeated language switches.",
          "Fixed system theme changes not being reflected by the site when auto mode is active."
        ]
      },
      removals: {
        cn: ["本版本无面向访问者的删除项。"],
        en: ["No visitor-facing removals in this version."]
      },
      additions: {
        cn: ["新增菜单日志入口，为正式版本记录提供稳定访问路径。"],
        en: ["Added a stable menu path for the official release log."]
      }
    }
  },
  {
    version: "v1.1.0",
    date: "2026-07-09",
    categories: {
      optimizations: {
        cn: [
          "首页照片普通进入时随机排列，从 rel 页面返回时保持原来的滚动位置与照片顺序。",
          "优化 L4RXX 类重力互动，降低吸附范围，并让移动端设备动作影响字母运动。",
          "优化 rel 随记页的大图、随记线和文字比例，使桌面端与移动端更协调。"
        ],
        en: [
          "Randomized the home photo order on normal entry while preserving scroll position and order after returning from rel pages.",
          "Refined the L4RXX gravity interaction with a smaller attraction range and mobile device-motion influence.",
          "Balanced the rel notes image, note line, and copy proportions across desktop and mobile."
        ]
      },
      fixes: {
        cn: [
          "修复首页刷新后页面状态混乱的问题。",
          "修复从 rel 页面返回首页时回到第一页并重播动画的问题。",
          "修复移动端点击首页照片可能进入错误 rel 编号的问题。"
        ],
        en: [
          "Fixed unstable home state after refreshing away from the first viewport.",
          "Fixed rel back navigation returning to the first home screen and replaying the opening animation.",
          "Fixed mobile home taps sometimes opening the wrong rel id."
        ]
      },
      removals: {
        cn: [
          "删除 rel 页面旧 INFO 按钮。",
          "暂时移除未稳定的 rel INDEX 入口，避免影响正式访问体验。"
        ],
        en: [
          "Removed the old rel INFO button.",
          "Temporarily removed the unstable rel INDEX entry from the public release."
        ]
      },
      additions: {
        cn: [
          "新增 rel 页面内随记模式，点击大图即可展开或收回。",
          "新增黑夜主题、主题按钮、语言按钮与首页人物彩蛋。"
        ],
        en: [
          "Added inline rel notes that open and close from the main photo.",
          "Added dark theme support, theme and language controls, and the home-page figure easter egg."
        ]
      }
    }
  },
  {
    version: "v1.0.1",
    date: "2026-07-07",
    categories: {
      optimizations: {
        cn: [
          "统一生成 web 图与缩略图，降低公开页面加载压力。",
          "保持新增照片拥有稳定 rel 编号，方便后续继续补充随记。"
        ],
        en: [
          "Generated optimized web images and thumbnails to reduce public-page loading pressure.",
          "Kept stable rel ids for the expanded photo set so notes can be completed later."
        ]
      },
      fixes: {
        cn: ["修复新增照片资源与图库数据之间的同步问题。"],
        en: ["Fixed synchronization between newly added photo assets and gallery data."]
      },
      removals: {
        cn: ["删除选定的 001-dsc00081 / DSC00081 图片条目。"],
        en: ["Removed the selected 001-dsc00081 / DSC00081 image entry."]
      },
      additions: {
        cn: [
          "新增 18 个公开 rel 照片条目，公开图库从 25 张扩展到 43 张。",
          "新增 DSC02934-2、DSC01690、R0010392 等后续批次照片。"
        ],
        en: [
          "Added 18 public rel photo entries, expanding the gallery from 25 to 43 photos.",
          "Added later-batch photos including DSC02934-2, DSC01690, and R0010392."
        ]
      }
    }
  },
  {
    version: "v1.0.0",
    date: "2026-07-07",
    categories: {
      optimizations: {
        cn: ["建立首页、作品页与 rel 页之间的基础浏览节奏。"],
        en: ["Established the base browsing rhythm across the home, work, and rel pages."]
      },
      fixes: {
        cn: ["本版本为初始正式上线版，无历史修复项。"],
        en: ["Initial public release, with no prior fixes."]
      },
      removals: {
        cn: ["本版本无面向访问者的删除项。"],
        en: ["No visitor-facing removals in this version."]
      },
      additions: {
        cn: [
          "新增静态摄影作品集基础结构。",
          "新增首批公开照片、rel 查询访问、部署文件与基础检查脚本。"
        ],
        en: [
          "Added the base static photography portfolio structure.",
          "Added the initial public photo set, rel query navigation, deployment files, and basic site checks."
        ]
      }
    }
  }
];

prepareOverviewScrollRestoration();

function prepareOverviewScrollRestoration() {
  if (document.body?.dataset.page !== "home") return;
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  if (isOverviewReturnNavigation()) return;
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  window.addEventListener("pageshow", () => {
    if (!isOverviewReturnNavigation()) window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, { once: true });
}

function isOverviewReturnNavigation() {
  if (document.body?.dataset.page !== "home") return false;
  return new URLSearchParams(window.location.search).get("from") === "rel";
}

const languageLabels = {
  en: { cn: "\u4e2d\u6587", en: "\u82f1\u8bed" },
  cn: { cn: "CN", en: "EN" }
};

document.addEventListener("DOMContentLoaded", async () => {
  initChrome();
  initLanguageSwitch();
  initThemeSwitch();
  initReleaseLogs();
  initNavLogsMode();
  const page = document.body.dataset.page;
  if (page === "logs") {
    startLoadingSequence();
    return;
  }
  try {
    photos = await loadPhotos();
    if (page === "home") renderOverview();
    if (page === "work") renderWork();
    if (page === "focus") renderFocus();
    startLoadingSequence();
  } catch (error) {
    showGalleryLoadError(error);
  }
});

async function loadPhotos() {
  const response = await fetch("content/photos.json");
  if (!response.ok) throw new Error(`Could not load content/photos.json (${response.status})`);
  const data = await response.json();
  const records = Array.isArray(data) ? data : data.items;
  if (!Array.isArray(records) || records.length === 0) throw new Error("content/photos.json has no photos");
  return records.map(normalizePhoto);
}

function normalizePhoto(photo, index) {
  const id = Number(photo.id) || index + 1;
  const title = photo.title || `IMAGE ${String(id).padStart(2, "0")}`;
  const full = photo.full || photo.src || photo.thumb;
  const thumb = photo.thumb || full;
  return {
    id,
    title,
    category: photo.category || "IMAGE",
    caption: photo.caption || "A frame from the local archive.",
    note: photo.note || photo.notes || DEFAULT_PHOTO_NOTE_CN,
    noteCn: photo.noteCn || photo.note_cn || photo.note || photo.notes || DEFAULT_PHOTO_NOTE_CN,
    noteEn: photo.noteEn || photo.note_en || photo.noteEnglish || (isDefaultPhotoNote(photo.note || photo.notes) ? DEFAULT_PHOTO_NOTE_EN : photo.note || photo.notes || DEFAULT_PHOTO_NOTE_EN),
    alt: photo.alt || `l4rxx photo ${String(id).padStart(2, "0")} - ${title}`,
    original: photo.original || full,
    full,
    thumb,
    date: photo.date || ""
  };
}

function isDefaultPhotoNote(note) {
  return !note || note === DEFAULT_PHOTO_NOTE_CN || note.includes("\u53c9\u6ef4\u53c9");
}

function getCurrentLanguage() {
  return document.body?.dataset.language === "cn" ? "cn" : "en";
}

function getPhotoNote(photo) {
  if (!photo) return getCurrentLanguage() === "cn" ? DEFAULT_PHOTO_NOTE_CN : DEFAULT_PHOTO_NOTE_EN;
  return getCurrentLanguage() === "cn"
    ? photo.noteCn || photo.note || DEFAULT_PHOTO_NOTE_CN
    : photo.noteEn || DEFAULT_PHOTO_NOTE_EN;
}

function showGalleryLoadError(error) {
  document.body.classList.add("has-loaded", "has-finished");
  const target = document.querySelector("main") || document.body;
  const message = document.createElement("p");
  message.className = "site-error";
  message.textContent = "Gallery data could not be loaded. Preview this site through the local server.";
  target.appendChild(message);
  console.error(error);
}

function initChrome() {
  const toggle = document.querySelector(".js-nav-toggle");
  const screen = document.querySelector(".js-nav-screen");
  if (!toggle || !screen) return;
  toggle.addEventListener("click", () => {
    if (document.body.classList.contains("is-nav-logs")) {
      document.body.classList.remove("nav-open", "is-nav-logs");
      setNavLogsOpen(false);
      screen.setAttribute("aria-hidden", "true");
      toggle.setAttribute("aria-label", "Open navigation");
      return;
    }
    const open = document.body.classList.toggle("nav-open");
    if (!open) setNavLogsOpen(false);
    toggle.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
    screen.setAttribute("aria-hidden", String(!open));
  });
  screen.addEventListener("click", (event) => {
    if (event.target === screen) {
      document.body.classList.remove("nav-open", "is-nav-logs");
      setNavLogsOpen(false);
      screen.setAttribute("aria-hidden", "true");
      toggle.setAttribute("aria-label", "Open navigation");
    }
  });
}

function escapeReleaseLogHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function renderReleaseLogSurface(target, language = getCurrentLanguage()) {
  if (!target) return;
  const next = language === "cn" ? "cn" : "en";
  target.innerHTML = releaseLogEntries.map((entry) => {
    const categories = releaseLogCategories.map((category) => {
      const items = entry.categories[category.key][next]
        .map((item) => `<li>${escapeReleaseLogHtml(item)}</li>`)
        .join("");
      return `
        <section class="release-category">
          <h3 class="release-category__title">${escapeReleaseLogHtml(category[next])}</h3>
          <ul class="release-category__items">${items}</ul>
        </section>
      `;
    }).join("");
    return `
      <article class="release-entry">
        <header class="release-entry__heading">
          <h2 class="release-entry__version">${escapeReleaseLogHtml(entry.version)}</h2>
          <p class="release-entry__date">${escapeReleaseLogHtml(entry.date)}</p>
        </header>
        <div class="release-entry__categories">${categories}</div>
      </article>
    `;
  }).join("");
}

function renderReleaseLogSurfaces(language = getCurrentLanguage()) {
  document.querySelectorAll("[data-release-entries], [data-nav-release-entries]").forEach((target) => {
    renderReleaseLogSurface(target, language);
  });
}

function initReleaseLogs() {
  renderReleaseLogSurfaces();
  window.addEventListener("l4rxx:languagechange", (event) => {
    const language = event.detail?.language || getCurrentLanguage();
    const page = document.querySelector("[data-release-log]");
    if (page && document.body.classList.contains("has-loaded") && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.clearTimeout(initReleaseLogs.transitionTimer);
      page.classList.add("is-logs-copy-swapping");
      initReleaseLogs.transitionTimer = window.setTimeout(() => {
        renderReleaseLogSurfaces(language);
        requestAnimationFrame(() => page.classList.remove("is-logs-copy-swapping"));
      }, 160);
      return;
    }
    renderReleaseLogSurfaces(language);
  });
}

function setNavLogsOpen(open) {
  document.body.classList.toggle("is-nav-logs", open);
  document.querySelectorAll(".js-nav-logs-toggle").forEach((button) => {
    button.setAttribute("aria-pressed", String(open));
  });
  if (open) renderReleaseLogSurfaces();
}

function initNavLogsMode() {
  const screen = document.querySelector(".js-nav-screen");
  const navToggle = document.querySelector(".js-nav-toggle");
  const buttons = [...document.querySelectorAll(".js-nav-logs-toggle")];
  if (!screen || !buttons.length) return;

  const setMenuOpen = () => {
    document.body.classList.add("nav-open");
    screen.setAttribute("aria-hidden", "false");
    if (navToggle) navToggle.setAttribute("aria-label", "Close navigation");
  };

  buttons.forEach((button) => {
    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => {
      const logsOpen = document.body.classList.contains("is-nav-logs");
      setMenuOpen();
      setNavLogsOpen(!logsOpen);
    });
  });
}

function initLanguageSwitch() {
  const switcher = document.querySelector("[data-language-switch]");
  const translatable = [...document.querySelectorAll("[data-i18n]")];
  if (!switcher && !translatable.length) return;

  const buttons = switcher ? [...switcher.querySelectorAll("[data-lang-option]")] : [];
  const toggle = switcher?.matches("[data-language-toggle]") ? switcher : switcher?.querySelector("[data-language-toggle]");
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  let currentLanguage = "en";
  let saved = "en";
  let hasAppliedLanguage = false;
  let languageApplyTimer = 0;
  let languageTransitionTimer = 0;
  let languageTransitionRunId = 0;
  try {
    saved = localStorage.getItem("l4rxx-language") || "en";
  } catch (error) {
    saved = "en";
  }

  const clearLanguageTransition = () => {
    document.documentElement.classList.remove("is-language-transitioning");
    document.body.classList.remove("is-language-transitioning");
  };

  const startLanguageTransition = () => {
    if (reduceMotion?.matches || !hasAppliedLanguage || !document.body.classList.contains("has-loaded")) return false;
    window.clearTimeout(languageTransitionTimer);
    document.documentElement.classList.add("is-language-transitioning");
    document.body.classList.add("is-language-transitioning");
    document.body.offsetHeight;
    return true;
  };

  const applyLanguage = (next) => {
    document.documentElement.lang = next === "cn" ? "zh-CN" : "en";
    document.body.dataset.language = next;
    document.body.dataset.lang = next;

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

    if (toggle) {
      toggle.setAttribute("aria-pressed", String(next === "cn"));
      toggle.setAttribute("aria-label", next === "cn" ? "Switch language to English" : "Switch language to Chinese");
    }

    window.dispatchEvent(new CustomEvent("l4rxx:languagechange", { detail: { language: next } }));

    try {
      localStorage.setItem("l4rxx-language", next);
    } catch (error) {
      return;
    }
  };

  const setLanguage = (language) => {
    const next = language === "cn" ? "cn" : "en";
    currentLanguage = next;
    const runId = ++languageTransitionRunId;
    const shouldAnimate = startLanguageTransition();
    window.clearTimeout(languageApplyTimer);
    const finish = () => {
      if (runId !== languageTransitionRunId) return;
      applyLanguage(next);
      hasAppliedLanguage = true;
      if (shouldAnimate) languageTransitionTimer = window.setTimeout(clearLanguageTransition, 280);
      else clearLanguageTransition();
    };
    if (shouldAnimate) languageApplyTimer = window.setTimeout(finish, 90);
    else finish();
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => setLanguage(button.dataset.langOption));
  });
  if (toggle) {
    toggle.addEventListener("click", () => setLanguage(currentLanguage === "cn" ? "en" : "cn"));
  }
  setLanguage(saved);
}

function initThemeSwitch() {
  const toggle = document.querySelector("[data-theme-toggle]");
  const metaTheme = document.querySelector('meta[name="theme-color"]');
  const systemTheme = window.matchMedia?.("(prefers-color-scheme: dark)");
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  let currentTheme = "light";
  let savedMode = "auto";
  let savedTheme = null;
  let themeTransitionTimer = 0;
  let navThemeColorAnimation = null;
  let logsThemeTransitionTimers = [];
  let logsThemeTransitionCleanups = [];
  try {
    savedMode = localStorage.getItem("l4rxx-theme-mode") || "auto";
    savedTheme = localStorage.getItem("l4rxx-theme");
  } catch (error) {
    savedMode = "auto";
    savedTheme = null;
  }
  if (savedMode !== "light" && savedMode !== "dark" && savedMode !== "auto") savedMode = "auto";

  const getSystemTheme = () => systemTheme?.matches ? "dark" : "light";

  const clearThemeTransition = () => {
    document.documentElement.classList.remove("is-theme-transitioning");
    document.body.classList.remove("is-theme-transitioning");
  };

  const startThemeTransition = () => {
    if (reduceMotion?.matches || !document.body.classList.contains("has-loaded")) return;
    window.clearTimeout(themeTransitionTimer);
    document.documentElement.classList.add("is-theme-transitioning");
    document.body.classList.add("is-theme-transitioning");
    document.body.offsetHeight;
    themeTransitionTimer = window.setTimeout(clearThemeTransition, 940);
  };

  const clearLogsThemeTransitionTimers = () => {
    logsThemeTransitionTimers.forEach((timer) => window.clearTimeout(timer));
    logsThemeTransitionTimers = [];
    logsThemeTransitionCleanups.forEach((cleanup) => cleanup());
    logsThemeTransitionCleanups = [];
  };

  const animateNavThemeColor = (next, animate) => {
    const navScreen = document.querySelector(".nav-screen");
    if (!navScreen) return;
    const currentColor = getComputedStyle(navScreen).color;
    navThemeColorAnimation?.cancel();
    navThemeColorAnimation = null;
    if (reduceMotion?.matches || !animate || !document.body.classList.contains("has-loaded")) return;
    const targetColor = next === "dark" ? "#ebe7df" : "#0c0c0c";
    const animation = navScreen.animate(
      [{ color: currentColor }, { color: targetColor }],
      { duration: 720, easing: "cubic-bezier(.5, 0, .5, 1)", fill: "both" }
    );
    navThemeColorAnimation = animation;
    animation.finished.then(() => {
      if (navThemeColorAnimation !== animation) return;
      navThemeColorAnimation = null;
      animation.cancel();
    }).catch(() => {});
  };

  const animateLogsThemeColor = (next, animate) => {
    clearLogsThemeTransitionTimers();
    const shells = [...document.querySelectorAll(".logs-shell")];
    if (!shells.length) return;
    const targetColor = next === "dark" ? "#ebe7df" : "#0c0c0c";
    if (reduceMotion?.matches || !animate || !document.body.classList.contains("has-loaded")) {
      shells.forEach((shell) => {
        shell.style.transition = "";
        shell.style.color = "";
      });
      return;
    }
    shells.forEach((shell) => {
      const currentColor = getComputedStyle(shell).color;
      shell.style.transition = "none";
      shell.style.color = currentColor;
      shell.offsetHeight;
      shell.style.transition = "color .72s var(--ease-soft), border-color .72s var(--ease-soft)";
      requestAnimationFrame(() => {
        shell.style.color = targetColor;
      });
      let didFinish = false;
      const finish = (event) => {
        if (event && event.propertyName !== "color") return;
        if (didFinish) return;
        didFinish = true;
        shell.removeEventListener("transitionend", finish);
        shell.style.transition = "none";
        shell.style.color = targetColor;
        shell.offsetHeight;
        shell.style.transition = "";
        shell.style.color = "";
      };
      shell.addEventListener("transitionend", finish);
      logsThemeTransitionCleanups.push(() => finish());
      logsThemeTransitionTimers.push(window.setTimeout(finish, 1800));
    });
  };

  const applyTheme = (theme, animate = false) => {
    const next = theme === "dark" ? "dark" : "light";
    const shouldAnimate = animate && next !== currentTheme;
    if (shouldAnimate) startThemeTransition();
    animateNavThemeColor(next, shouldAnimate);
    animateLogsThemeColor(next, shouldAnimate);
    currentTheme = next;
    document.documentElement.dataset.theme = next;
    document.body.dataset.theme = next;
    document.documentElement.style.colorScheme = next;
    if (metaTheme) metaTheme.setAttribute("content", next === "dark" ? "#10100f" : "#f5f3f0");
    if (toggle) {
      toggle.setAttribute("aria-pressed", String(next === "dark"));
      toggle.setAttribute("aria-label", next === "dark" ? "Switch to light theme" : "Switch to dark theme");
    }
  };

  const applySystemTheme = (animate = true) => {
    applyTheme(getSystemTheme(), animate);
  };

  const persistThemeMode = (mode) => {
    try {
      localStorage.setItem("l4rxx-theme-mode", mode);
      if (mode === "auto") localStorage.removeItem("l4rxx-theme");
      else localStorage.setItem("l4rxx-theme", mode);
    } catch (error) {
      return;
    }
  };

  const setTheme = (theme, persist = true, animate = true) => {
    applyTheme(theme, animate);
    if (!persist) return;
    savedMode = currentTheme;
    persistThemeMode(savedMode);
  };

  if (toggle) {
    toggle.addEventListener("click", () => setTheme(currentTheme === "dark" ? "light" : "dark", true, true));
  }

  systemTheme?.addEventListener?.("change", (event) => {
    if (savedMode === "auto") applySystemTheme(true);
  });

  if (savedMode === "auto") {
    applySystemTheme(false);
    persistThemeMode("auto");
  } else {
    applyTheme(savedMode || savedTheme || getSystemTheme(), false);
  }
}

function getPhotoRel(photo, fallbackIndex = 0) {
  return Number(photo?.id) || fallbackIndex + 1;
}

function readOverviewReturnState() {
  try {
    const state = JSON.parse(sessionStorage.getItem(OVERVIEW_RETURN_STORAGE_KEY) || "null");
    return state && typeof state === "object" ? state : null;
  } catch (error) {
    return null;
  }
}

function shuffleOverviewPhotos(source) {
  const items = [...source];
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

function resolveOverviewPhotosFromOrder(order) {
  const byRel = new Map(photos.map((photo, index) => [getPhotoRel(photo, index), photo]));
  const seen = new Set();
  const ordered = [];
  if (Array.isArray(order)) {
    order.forEach((value) => {
      const rel = Number(value);
      const photo = byRel.get(rel);
      if (!photo || seen.has(rel)) return;
      ordered.push(photo);
      seen.add(rel);
    });
  }
  const remaining = photos.filter((photo, index) => !seen.has(getPhotoRel(photo, index)));
  return ordered.concat(shuffleOverviewPhotos(remaining));
}

function prepareOverviewPhotos(returnState) {
  const returnOrder = Array.isArray(returnState?.order) ? returnState.order : null;
  overviewPhotos = returnOrder ? resolveOverviewPhotosFromOrder(returnOrder) : shuffleOverviewPhotos(photos);
  overviewOrder = overviewPhotos.map((photo, index) => getPhotoRel(photo, index));
}

function getOverviewOrder() {
  return overviewOrder.length ? overviewOrder : photos.map((photo, index) => getPhotoRel(photo, index));
}
function renderOverview() {
  const grid = document.querySelector("[data-overview-grid]");
  if (!grid) return;
  grid.innerHTML = "";
  grid.style.minHeight = "";

  const returnState = readOverviewReturnState();
  prepareOverviewPhotos(returnState);
  appendOverviewBatch(grid, createOverviewBatch(true), true);
  const isReturning = handleOverviewReturn(grid, returnState);
  if (!isReturning) initializeOverviewItems();
  initializeInfinityScroll(grid);
  initializeOverviewInteraction(grid);

  const captureOverviewReturn = (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const link = target?.closest("a[href*='focus.html?rel=']");
    if (!link || !grid.contains(link)) return;
    storeOverviewReturn(link);
  };
  grid.addEventListener("pointerdown", captureOverviewReturn, { capture: true, passive: true });
  grid.addEventListener("click", captureOverviewReturn, { capture: true });
}

function createOverviewBatch(isOriginal = false) {
  const sourcePhotos = overviewPhotos.length ? overviewPhotos : photos;
  const items = [];
  let photoIndex = 0;
  const cellCount = sourcePhotos.length + (isOriginal ? overviewSkipCells.size : 0);
  for (let cellIndex = 0; cellIndex < cellCount; cellIndex++) {
    if (isOriginal && overviewSkipCells.has(cellIndex)) {
      const spacer = document.createElement("div");
      spacer.className = "overview-item infinity-item--skip infinity-item--batch";
      items.push(spacer);
      continue;
    }

    const photo = sourcePhotos[photoIndex];
    items.push(createOverviewLink(photo, photoIndex, isOriginal, cellIndex));
    photoIndex++;
  }

  let fillIndex = 0;
  while (items.length % 5 !== 0) {
    const photoIndexToFill = fillIndex % sourcePhotos.length;
    items.push(createOverviewLink(sourcePhotos[photoIndexToFill], photoIndexToFill, isOriginal, items.length, "infinity-item--fill"));
    fillIndex++;
  }
  return items;
}

function createOverviewLink(photo, index, isOriginal, cellIndex, extraClass = "") {
  const link = document.createElement("a");
  link.className = `overview-item infinity-item--batch infinity-item--original${extraClass ? ` ${extraClass}` : ""}`;
  if (isOriginal && cellIndex <= 14) link.classList.add("is-visible");
  const photoRel = getPhotoRel(photo, index);
  link.href = `focus.html?rel=${photoRel}`;
  link.dataset.rel = String(photoRel);
  link.innerHTML = `<span class="fs-media"><img src="${photo.thumb}" alt="${photo.alt}" loading="lazy" decoding="async"></span>`;
  return link;
}

function appendOverviewBatch(grid, batch, isInitial = false) {
  batch.forEach((item) => {
    const clone = isInitial ? item : item.cloneNode(true);
    if (!isInitial) {
      clone.classList.remove("infinity-item--original", "is-visible", "is-return-target");
      clone.classList.add("infinity-item--clone");
      clone.removeAttribute("style");
      clone.querySelectorAll("[style]").forEach((child) => child.removeAttribute("style"));
    }
    grid.appendChild(clone);
  });
}

function storeOverviewReturn(source) {
  const link = source?.currentTarget || (source?.target ? source.target.closest("a") : source);
  if (!link) return;
  let rel = Number(link.dataset.rel || 0);
  if (!rel) {
    try {
      rel = Number(new URL(link.href, window.location.href).searchParams.get("rel"));
    } catch (error) {
      rel = 0;
    }
  }
  const state = {
    rel: rel || 1,
    scrollY: window.scrollY || document.documentElement.scrollTop || 0,
    createdAt: Date.now(),
    order: getOverviewOrder()
  };
  try {
    sessionStorage.setItem(OVERVIEW_RETURN_STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    return;
  }
}

function handleOverviewReturn(grid, returnState = null) {
  const params = new URLSearchParams(window.location.search);
  const state = returnState || readOverviewReturnState();

  const shouldReturn = params.get("from") === "rel" || !!state;
  if (!shouldReturn) return false;


  document.body.classList.add("is-returning-from-rel", "has-loaded", "has-finished");
  document.documentElement.classList.add("has-landed");

  const rel = Number(params.get("rel") || state?.rel || 1);
  const targetY = Math.max(0, Number(state?.scrollY || 0));
  while (grid.offsetTop + grid.scrollHeight - (targetY + window.innerHeight) <= 700) {
    appendOverviewBatch(grid, createOverviewBatch(false), false);
  }

  requestAnimationFrame(() => {
    window.scrollTo({ top: targetY, left: 0, behavior: "auto" });
    const target = findReturnTarget(grid, rel, targetY);
    if (target) {
      target.classList.add("is-return-target");
      runOverviewReturnFlight(target, state);
    }
  });

  if (params.has("from")) {
    params.delete("from");
    params.delete("rel");
    const nextSearch = params.toString();
    window.history.replaceState({}, "", `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ""}`);
  }
  try {
    sessionStorage.removeItem(OVERVIEW_RETURN_STORAGE_KEY);
  } catch (error) {
    return true;
  }
  return true;
}

function findReturnTarget(grid, rel, targetY) {
  const candidates = [...grid.querySelectorAll(`a[data-rel="${rel}"]`)];
  if (!candidates.length) return null;
  const viewportCenter = targetY + window.innerHeight / 2;
  return candidates.reduce((best, candidate) => {
    const candidateDistance = Math.abs(candidate.offsetTop + candidate.offsetHeight / 2 - viewportCenter);
    const bestDistance = Math.abs(best.offsetTop + best.offsetHeight / 2 - viewportCenter);
    return candidateDistance < bestDistance ? candidate : best;
  }, candidates[0]);
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

let overviewScrollHandler = null;
let overviewInteractionCleanup = null;

function initializeInfinityScroll(grid) {
  if (overviewScrollHandler) {
    window.removeEventListener("scroll", overviewScrollHandler);
    overviewScrollHandler = null;
  }
  if (!grid) return;

  const batch = createOverviewBatch(false);

  overviewScrollHandler = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    if (grid.offsetTop + grid.scrollHeight - (scrollTop + window.innerHeight) <= 500) {
      appendOverviewBatch(grid, batch, false);
    }
  };
  window.addEventListener("scroll", overviewScrollHandler, { passive: true });
}

function initializeOverviewAttraction(grid) {
  if (overviewInteractionCleanup) {
    overviewInteractionCleanup();
    overviewInteractionCleanup = null;
  }
  const title = document.querySelector(".brand-title");
  const letters = title ? [...title.querySelectorAll(".brand-letter")] : [];
  const figure = document.querySelector(".brand-fall-figure");
  if (!grid || !title || !letters.length) return;

  let frame = 0;
  let readyTimer = 0;
  let waitTimer = 0;
  let started = false;
  let activeItems = [];
  let pieces = [];
  let lastScrollY = window.scrollY || document.documentElement.scrollTop || 0;
  let scrollVelocity = 0;

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const isMobile = () => window.innerWidth <= 768;

  const clearPhotoStates = () => {
    activeItems.forEach((item) => {
      item.classList.remove("is-home-active", "is-home-near", "is-home-hit");
      item.style.removeProperty("--home-photo-x");
      item.style.removeProperty("--home-photo-y");
    });
    activeItems = [];
  };

  const applyIdleState = () => {
    document.body.classList.remove("is-letter-attraction", "is-letter-gravity");
    title.style.setProperty("--brand-shift-x", "0px");
    title.style.setProperty("--brand-shift-y", "0px");
    title.style.setProperty("--brand-tilt", "0deg");
    title.style.setProperty("--brand-scale", "1");
    letters.forEach((letter) => {
      letter.style.setProperty("--letter-x", "0px");
      letter.style.setProperty("--letter-y", "0px");
      letter.style.setProperty("--letter-rotate", "0deg");
    });
    clearPhotoStates();
  };

  const getVisiblePhotos = () => {
    const margin = isMobile() ? 180 : 220;
    return [...grid.querySelectorAll(".overview-item[href]")].map((item) => {
      const image = item.querySelector("img");
      const media = item.querySelector(".fs-media");
      const rect = image && image.complete && image.naturalWidth > 0
        ? image.getBoundingClientRect()
        : media?.getBoundingClientRect();
      if (!rect || rect.width < 8 || rect.height < 8) return null;
      return { item, rect };
    }).filter((photo) => {
      const rect = photo.rect;
      return rect.right > -margin &&
        rect.left < window.innerWidth + margin &&
        rect.bottom > -margin &&
        rect.top < window.innerHeight + margin;
    }).sort((a, b) => {
      const centerY = window.innerHeight / 2;
      const aDistance = Math.abs(a.rect.top + a.rect.height / 2 - centerY);
      const bDistance = Math.abs(b.rect.top + b.rect.height / 2 - centerY);
      return aDistance - bDistance;
    }).slice(0, Math.max(letters.length + 2, 7));
  };

  const getFallbackTarget = (piece, index) => {
    const totalWidth = pieces.reduce((sum, current) => sum + current.width, 0) + (pieces.length - 1) * (isMobile() ? 4 : 9);
    const startX = (window.innerWidth - totalWidth) / 2;
    const x = startX + pieces.slice(0, index).reduce((sum, current) => sum + current.width + (isMobile() ? 4 : 9), 0);
    return {
      x: clamp(x, 8, Math.max(8, window.innerWidth - piece.width - 8)),
      y: window.innerHeight * (isMobile() ? 0.58 : 0.54),
      angle: (index - 2) * (isMobile() ? 1.2 : 1.6),
      item: null
    };
  };

  const getAttractionTarget = (piece, index, photos, time) => {
    if (!photos.length) return getFallbackTarget(piece, index);
    const photo = photos[index % photos.length];
    const rect = photo.rect;
    const scrollDrift = clamp(scrollVelocity * 0.015, -14, 14);
    const breathing = Math.sin(time * 0.001 + index * 1.8) * (isMobile() ? 2.5 : 4);
    const margin = isMobile() ? 10 : 16;
    const layouts = [
      { x: rect.left - piece.width - margin, y: rect.top + rect.height * 0.18 },
      { x: rect.right + margin, y: rect.top + rect.height * 0.42 },
      { x: rect.left + rect.width * 0.52 - piece.width / 2, y: rect.top - piece.height - margin },
      { x: rect.left - piece.width - margin, y: rect.bottom - piece.height * 1.08 },
      { x: rect.right + margin, y: rect.bottom - piece.height * 1.05 }
    ];
    const layout = layouts[index % layouts.length];
    return {
      x: clamp(layout.x + breathing * 0.5, 8, Math.max(8, window.innerWidth - piece.width - 8)),
      y: clamp(layout.y + scrollDrift + breathing, 8, Math.max(8, window.innerHeight - piece.height - 14)),
      angle: (index - 2) * (isMobile() ? 1.8 : 2.4) + clamp(scrollVelocity * 0.012, -2.8, 2.8),
      item: photo.item
    };
  };

  const updatePhotoStates = (targets) => {
    clearPhotoStates();
    const uniqueItems = [...new Set(targets.map((target) => target.item).filter(Boolean))];
    activeItems = uniqueItems;
    activeItems.forEach((item, index) => {
      item.classList.add(index === 0 ? "is-home-active" : "is-home-near");
      const direction = index % 2 === 0 ? 1 : -1;
      item.style.setProperty("--home-photo-x", `${(direction * (isMobile() ? 1.4 : 2.4)).toFixed(2)}px`);
      item.style.setProperty("--home-photo-y", `${(Math.sin(index + scrollVelocity * 0.01) * 1.8).toFixed(2)}px`);
    });
  };

  const tick = (time) => {
    const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
    scrollVelocity = scrollVelocity * 0.82 + (scrollY - lastScrollY) * 0.18;
    lastScrollY = scrollY;

    const photos = getVisiblePhotos();
    const targets = pieces.map((piece, index) => getAttractionTarget(piece, index, photos, time));
    const follow = isMobile() ? 0.052 : 0.046;
    pieces.forEach((piece, index) => {
      const target = targets[index];
      const lag = follow * (1 - index * 0.035);
      piece.x += (target.x - piece.x) * lag;
      piece.y += (target.y - piece.y) * lag;
      piece.angle += (target.angle - piece.angle) * (lag * 0.72);
      setPieceTransform(piece);
    });
    updatePhotoStates(targets);
    frame = requestAnimationFrame(tick);
  };

  const start = () => {
    if (started) return;
    started = true;
    pieces = letters.map((letter) => {
      const rect = letter.getBoundingClientRect();
      return {
        el: letter,
        glyph: letter.textContent.trim().toLowerCase(),
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
        angle: 0
      };
    });
    title.style.setProperty("--brand-shift-x", "0px");
    title.style.setProperty("--brand-shift-y", "0px");
    title.style.setProperty("--brand-tilt", "0deg");
    title.style.setProperty("--brand-scale", "1");
    pieces.forEach((piece) => {
      piece.angle = piece.angle || 0;
      setPieceTransform(piece);
    });
    document.body.classList.add("is-letter-attraction");
    lastScrollY = window.scrollY || document.documentElement.scrollTop || 0;
    frame = requestAnimationFrame(tick);
  };

  const waitForIntro = () => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      applyIdleState();
      return;
    }
    if (document.body.classList.contains("is-returning-from-rel")) {
      readyTimer = window.setTimeout(start, 260);
      return;
    }
    if (document.body.classList.contains("has-finished")) {
      readyTimer = window.setTimeout(start, 950);
      return;
    }
    waitTimer = window.setTimeout(waitForIntro, 80);
  };

  const handleResize = () => {
    if (!started) return;
    pieces.forEach((piece) => {
      const rect = piece.el.getBoundingClientRect();
      piece.width = rect.width;
      piece.height = rect.height;
      piece.x = clamp(piece.x, 8, Math.max(8, window.innerWidth - piece.width - 8));
      piece.y = clamp(piece.y, 8, Math.max(8, window.innerHeight - piece.height - 8));
    });
  };

  window.addEventListener("resize", handleResize);
  waitForIntro();

  overviewInteractionCleanup = () => {
    if (frame) cancelAnimationFrame(frame);
    window.clearTimeout(readyTimer);
    window.clearTimeout(waitTimer);
    window.removeEventListener("resize", handleResize);
    applyIdleState();
  };
}

function initializeOverviewInteraction(grid) {
  if (overviewInteractionCleanup) {
    overviewInteractionCleanup();
    overviewInteractionCleanup = null;
  }
  const title = document.querySelector(".brand-title");
  const letters = title ? [...title.querySelectorAll(".brand-letter")] : [];
  const figure = document.querySelector(".brand-fall-figure");
  if (!grid || !title || !letters.length) return;

  let frame = 0;
  let readyTimer = 0;
  let waitTimer = 0;
  let started = false;
  let activeItem = null;
  let nearItems = [];
  let pieces = [];
  const photoHitTimers = new Map();
  let lastTime = 0;
  let lastScrollY = window.scrollY || document.documentElement.scrollTop || 0;
  let physicsStartedAt = 0;
  let lastScrollMoveAt = 0;
  let scrollLift = 0;
  let motionInfluence = { x: 0, y: 0, twist: 0 };
  let motionListening = false;
  let motionPermissionRequested = false;
  let motionGestureListenersActive = false;
  let photoEffectsReady = false;
  let lastOrientationAt = 0;
  let motionNeutral = { x: 0, y: 0, angle: null, samples: 0 };
  let reunionStableSince = 0;
  let reunionEndsAt = 0;
  let reunionCooldownUntil = 0;
  let reunionPhoto = null;
  let reunionArmed = true;
  let restTargetKey = "";
  let cachedRestTargets = new Map();
  const ORIENTATION_LOW_PASS_RATE = 0.12;
  const MOTION_LOW_PASS_RATE = 0.08;
  const motionGestureOptions = { passive: true };

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const isMobile = () => window.innerWidth <= 768;
  const idleAttractionRadius = () => window.innerHeight * (isMobile() ? 0.66 : 0.68);
  const photoAvoidRadius = () => isMobile() ? 10 : 16;
  const getSoftCollisionThreshold = () => isMobile() ? 0.82 : 0.98;
  const scheduleFrame = (callback) => {
    return window.setTimeout(() => callback(Date.now()), 16);
  };
  const cancelFrame = (id) => {
    window.clearTimeout(id);
  };
  const blendMotion = (nextX, nextY, nextTwist = 0, rate = 0.18) => {
    motionInfluence.x += (clamp(nextX, -1, 1) - motionInfluence.x) * rate;
    motionInfluence.y += (clamp(nextY, -1, 1) - motionInfluence.y) * rate;
    motionInfluence.twist += (clamp(nextTwist, -1, 1) - motionInfluence.twist) * rate;
  };
  const getMotionWakeStrength = () => Math.abs(motionInfluence.x) + Math.abs(motionInfluence.y) + Math.abs(motionInfluence.twist) * 0.28;
  const getPieceBox = (piece) => {
    if (piece.type === "figure") {
      const hitbox = piece.hitbox || { left: 0.18, right: 0.18, top: 0.075, bottom: 0.025 };
      return {
        left: piece.x + piece.width * hitbox.left,
        right: piece.x + piece.width * (1 - hitbox.right),
        top: piece.y + piece.height * hitbox.top,
        bottom: piece.y + piece.height * (1 - hitbox.bottom),
        offsetLeft: piece.width * hitbox.left,
        offsetRight: piece.width * hitbox.right,
        offsetTop: piece.height * hitbox.top,
        offsetBottom: piece.height * hitbox.bottom
      };
    }

    const glyph = piece.glyph || "";
    const narrowInset = glyph === "l" ? 0.42 : glyph === "r" ? 0.29 : glyph === "4" ? 0.26 : 0.24;
    const topInset = glyph === "4" ? 0.15 : 0.18;
    const bottomInset = glyph === "l" ? 0.18 : 0.16;
    return {
      left: piece.x + piece.width * narrowInset,
      right: piece.x + piece.width * (1 - narrowInset),
      top: piece.y + piece.height * topInset,
      bottom: piece.y + piece.height * (1 - bottomInset),
      offsetLeft: piece.width * narrowInset,
      offsetRight: piece.width * narrowInset,
      offsetTop: piece.height * topInset,
      offsetBottom: piece.height * bottomInset
    };
  };

  const setPieceTransform = (piece) => {
    if (piece.type === "figure") {
      piece.el.style.setProperty("--figure-x", `${piece.x.toFixed(2)}px`);
      piece.el.style.setProperty("--figure-y", `${piece.y.toFixed(2)}px`);
      piece.el.style.setProperty("--figure-rotate", `${piece.angle.toFixed(2)}deg`);
      return;
    }
    piece.el.style.setProperty("--letter-x", `${piece.x.toFixed(2)}px`);
    piece.el.style.setProperty("--letter-y", `${piece.y.toFixed(2)}px`);
    piece.el.style.setProperty("--letter-rotate", `${piece.angle.toFixed(2)}deg`);
  };

  const getScreenAngle = () => {
    const raw = Number(window.screen?.orientation?.angle ?? window.orientation ?? 0);
    return ((raw % 360) + 360) % 360;
  };

  const mapDeviceTiltToScreen = (beta, gamma, angle) => {
    if (angle === 90) return { x: beta, y: -gamma };
    if (angle === 270) return { x: -beta, y: gamma };
    if (angle === 180) return { x: -gamma, y: -beta };
    return { x: gamma, y: beta };
  };

  const handleDeviceOrientation = (event) => {
    const gamma = Number(event.gamma || 0);
    const beta = Number(event.beta || 0);
    const alpha = Number(event.alpha || 0);
    const angle = getScreenAngle();
    const mapped = mapDeviceTiltToScreen(beta, gamma, angle);
    lastOrientationAt = performance.now();
    if (motionNeutral.angle !== angle) {
      motionNeutral = { x: mapped.x, y: mapped.y, angle, samples: 1 };
      blendMotion(0, 0, 0, 1);
      return;
    }
    if (motionNeutral.samples < 8) {
      const samples = motionNeutral.samples + 1;
      motionNeutral.x += (mapped.x - motionNeutral.x) / samples;
      motionNeutral.y += (mapped.y - motionNeutral.y) / samples;
      motionNeutral.samples = samples;
      blendMotion(0, 0, 0, ORIENTATION_LOW_PASS_RATE);
      return;
    }
    const screenX = (mapped.x - motionNeutral.x) / 30;
    const screenY = (mapped.y - motionNeutral.y) / 32;
    blendMotion(screenX, screenY, Math.sin(alpha * Math.PI / 180) * 0.34, ORIENTATION_LOW_PASS_RATE);
  };

  const handleDeviceMotion = (event) => {
    if (performance.now() - lastOrientationAt < 520) return;
    const acceleration = event.accelerationIncludingGravity || event.acceleration;
    if (!acceleration) return;
    const x = Number(acceleration.x || 0) / 14;
    const y = Number(acceleration.y || 0) / -18;
    blendMotion(x, y, 0, MOTION_LOW_PASS_RATE);
  };

  const startMotionListening = () => {
    if (motionListening) return;
    motionListening = true;
    removeMotionGestureListeners();
    window.addEventListener("deviceorientation", handleDeviceOrientation, true);
    window.addEventListener("devicemotion", handleDeviceMotion, true);
  };

  const removeMotionGestureListeners = () => {
    if (!motionGestureListenersActive) return;
    motionGestureListenersActive = false;
    window.removeEventListener("pointerdown", requestMotionAccess);
    window.removeEventListener("touchstart", requestMotionAccess);
    window.removeEventListener("touchend", requestMotionAccess);
    window.removeEventListener("click", requestMotionAccess);
  };

  const requestMotionAccess = async (event) => {
    if (motionPermissionRequested || motionListening) return;
    if (event && event.isTrusted === false) return;
    motionPermissionRequested = true;
    const orientationEvent = window.DeviceOrientationEvent;
    const motionEvent = window.DeviceMotionEvent;
    try {
      const permissionRequests = [];
      if (orientationEvent && typeof orientationEvent.requestPermission === "function") {
        permissionRequests.push(orientationEvent.requestPermission());
      }
      if (motionEvent && typeof motionEvent.requestPermission === "function") {
        permissionRequests.push(motionEvent.requestPermission());
      }
      if (!permissionRequests.length) {
        startMotionListening();
        return;
      }
      const states = await Promise.all(permissionRequests);
      if (states.some((state) => state !== "granted")) {
        motionPermissionRequested = false;
        return;
      }
      startMotionListening();
    } catch (error) {
      motionPermissionRequested = false;
      return;
    }
  };

  const addMotionGestureListeners = () => {
    if (motionGestureListenersActive) return;
    motionGestureListenersActive = true;
    window.addEventListener("pointerdown", requestMotionAccess, motionGestureOptions);
    window.addEventListener("touchstart", requestMotionAccess, motionGestureOptions);
    window.addEventListener("touchend", requestMotionAccess, motionGestureOptions);
    window.addEventListener("click", requestMotionAccess, motionGestureOptions);
  };

  const setupMotionAccess = () => {
    if (!("DeviceOrientationEvent" in window) && !("DeviceMotionEvent" in window)) return;
    const needsGesture = Boolean(window.DeviceOrientationEvent?.requestPermission || window.DeviceMotionEvent?.requestPermission);
    if (!needsGesture) {
      startMotionListening();
      return;
    }
    addMotionGestureListeners();
  };

  const clearStates = () => {
    if (activeItem) activeItem.classList.remove("is-home-active");
    nearItems.forEach((item) => item.classList.remove("is-home-near"));
    photoHitTimers.forEach((timer, item) => {
      window.clearTimeout(timer);
      item.classList.remove("is-home-hit");
      item.style.removeProperty("--home-photo-x");
      item.style.removeProperty("--home-photo-y");
    });
    photoHitTimers.clear();
    activeItem = null;
    nearItems = [];
  };

  const clearReunionState = () => {
    document.body.classList.remove("is-letter-reunion");
    reunionPhoto?.classList.remove("is-home-reunion");
    reunionPhoto = null;
  };

  const applyIdleState = () => {
    document.body.classList.remove("is-letter-gravity");
    title.style.setProperty("--brand-shift-x", "0px");
    title.style.setProperty("--brand-shift-y", "0px");
    title.style.setProperty("--brand-tilt", "0deg");
    title.style.setProperty("--brand-scale", "1");
    letters.forEach((letter) => {
      letter.style.setProperty("--letter-x", "0px");
      letter.style.setProperty("--letter-y", "0px");
      letter.style.setProperty("--letter-rotate", "0deg");
    });
    if (figure) {
      figure.style.setProperty("--figure-x", "50vw");
      figure.style.setProperty("--figure-y", "-120%");
      figure.style.setProperty("--figure-rotate", "0deg");
    }
    clearStates();
  };

  const setActiveItem = (item, colliders) => {
    if (activeItem !== item) {
      if (activeItem) activeItem.classList.remove("is-home-active");
      activeItem = item || null;
      if (activeItem) activeItem.classList.add("is-home-active");
    }

    nearItems.forEach((nearItem) => nearItem.classList.remove("is-home-near"));
    nearItems = [];
    if (!item) return;

    const activeCollider = colliders.find((collider) => collider.item === item);
    if (!activeCollider) return;
    const activeCenterX = activeCollider.rect.left + activeCollider.rect.width / 2;
    const activeCenterY = activeCollider.rect.top + activeCollider.rect.height / 2;
    nearItems = colliders.filter((collider) => {
      if (collider.item === item) return false;
      const centerX = collider.rect.left + collider.rect.width / 2;
      const centerY = collider.rect.top + collider.rect.height / 2;
      return Math.hypot(centerX - activeCenterX, centerY - activeCenterY) < Math.min(window.innerWidth, window.innerHeight) * 0.46;
    }).slice(0, 3).map((collider) => collider.item);
    nearItems.forEach((nearItem) => nearItem.classList.add("is-home-near"));
  };

  const getPhotoColliders = () => {
    const edgeBuffer = isMobile() ? 110 : 160;
    return [...grid.querySelectorAll(".overview-item[href]")].map((item) => {
      const image = item.querySelector("img");
      const media = item.querySelector(".fs-media");
      const rect = image && image.complete && image.naturalWidth > 0
        ? image.getBoundingClientRect()
        : media?.getBoundingClientRect();
      return rect ? { item, rect } : null;
    }).filter((collider) => {
      const rect = collider.rect;
      return rect.width > 8 &&
        rect.height > 8 &&
        rect.right > -edgeBuffer &&
        rect.left < window.innerWidth + edgeBuffer &&
        rect.bottom > -edgeBuffer &&
        rect.top < window.innerHeight + edgeBuffer;
    });
  };

  const getTopDropX = (pieceWidth, sidePadding, hitbox = { left: 0.18, right: 0.18 }) => {
    const hitLeft = pieceWidth * hitbox.left;
    const hitRight = pieceWidth * (1 - hitbox.right);
    const maxStart = Math.max(sidePadding, window.innerWidth - sidePadding - pieceWidth);
    const corridorLimit = Math.min(window.innerHeight * (isMobile() ? 0.34 : 0.3), isMobile() ? 286 : 330);
    const clearMargin = isMobile() ? 1.5 : 4;
    const blocked = getPhotoColliders().map((collider) => collider.rect).filter((rect) => {
      return rect.width > 8 && rect.height > 8 && rect.bottom > -80 && rect.top < corridorLimit;
    }).map((rect) => ({
      left: clamp(rect.left - clearMargin - hitRight, sidePadding, maxStart),
      right: clamp(rect.right + clearMargin - hitLeft, sidePadding, maxStart)
    })).filter((range) => range.right > range.left + 1).sort((a, b) => a.left - b.left);

    const merged = [];
    blocked.forEach((range) => {
      const last = merged[merged.length - 1];
      if (!last || range.left > last.right) merged.push({ ...range });
      else last.right = Math.max(last.right, range.right);
    });

    const gaps = [];
    let cursor = sidePadding;
    merged.forEach((range) => {
      if (range.left - cursor > Math.max(6, pieceWidth * 0.1)) gaps.push({ left: cursor, right: range.left });
      cursor = Math.max(cursor, range.right);
    });
    if (maxStart - cursor > Math.max(6, pieceWidth * 0.1)) gaps.push({ left: cursor, right: maxStart });

    const centerStart = clamp((window.innerWidth - pieceWidth) / 2, sidePadding, maxStart);
    if (!gaps.length) {
      const jitter = Math.min(26, window.innerWidth * 0.055);
      return clamp(centerStart + (Math.random() - 0.5) * jitter, sidePadding, maxStart);
    }

    if (isMobile()) {
      const centerGap = gaps.reduce((best, gap) => {
        const gapCenter = gap.left + (gap.right - gap.left) / 2;
        const distance = Math.abs(gapCenter - centerStart);
        return !best || distance < best.distance ? { gap, distance } : best;
      }, null).gap;
      const halfWidth = Math.max(0, (centerGap.right - centerGap.left) / 2);
      const jitter = Math.min(28, Math.max(8, halfWidth));
      return clamp(centerStart + (Math.random() - 0.5) * jitter * 2, centerGap.left, centerGap.right);
    }

    const total = gaps.reduce((sum, gap) => sum + Math.max(0, gap.right - gap.left), 0);
    let pick = Math.random() * total;
    for (const gap of gaps) {
      const width = Math.max(0, gap.right - gap.left);
      if (pick <= width) return gap.left + Math.random() * width;
      pick -= width;
    }
    const lastGap = gaps[gaps.length - 1];
    return lastGap.left + Math.random() * Math.max(0, lastGap.right - lastGap.left);
  };
  const getNearestCollider = (colliders) => {
    if (!colliders.length || !pieces.length) return null;
    const group = pieces.reduce((sum, piece) => ({
      x: sum.x + piece.x + piece.width / 2,
      y: sum.y + piece.y + piece.height / 2
    }), { x: 0, y: 0 });
    group.x /= pieces.length;
    group.y /= pieces.length;

    return colliders.reduce((best, collider) => {
      const centerX = collider.rect.left + collider.rect.width / 2;
      const centerY = collider.rect.top + collider.rect.height / 2;
      const distance = Math.hypot(centerX - group.x, centerY - group.y);
      return !best || distance < best.distance ? { item: collider.item, distance } : best;
    }, null)?.item || null;
  };

  const syncPieceMetrics = () => {
    pieces.forEach((piece) => {
      const rect = piece.el.getBoundingClientRect();
      piece.width = rect.width || piece.width;
      piece.height = rect.height || piece.height;
      const minY = piece.type === "figure" ? -piece.height * 1.35 : 0;
      piece.x = clamp(piece.x, 0, Math.max(0, window.innerWidth - piece.width));
      piece.y = clamp(piece.y, minY, Math.max(minY, window.innerHeight - piece.height));
    });
  };

  const getWhitespaceRestCandidate = (floor, sidePadding, colliders, totalWidth, maxHeight, currentGroup) => {
    const lowerTop = window.innerHeight * (isMobile() ? 0.56 : 0.58);
    const lowerBottom = Math.max(lowerTop, floor - maxHeight - (isMobile() ? 4 : 8));
    const preferredY = clamp(window.innerHeight * (isMobile() ? 0.76 : 0.74), lowerTop, lowerBottom);
    const photoClearance = photoAvoidRadius() + (isMobile() ? 5 : 8);
    const blockedRects = colliders.map((collider) => ({
      left: collider.rect.left - photoClearance,
      right: collider.rect.right + photoClearance,
      top: collider.rect.top - photoClearance,
      bottom: collider.rect.bottom + photoClearance
    }));
    const overlapsPhoto = (rect) => blockedRects.some((blocked) => {
      return rect.right > blocked.left && rect.left < blocked.right && rect.bottom > blocked.top && rect.top < blocked.bottom;
    });
    const maxX = Math.max(sidePadding, window.innerWidth - sidePadding - totalWidth);
    const emptyBandStep = Math.max(isMobile() ? 20 : 28, totalWidth * 0.14);
    const emptyBandYStep = Math.max(isMobile() ? 24 : 32, maxHeight * 0.28);
    let best = null;
    for (let y = lowerTop; y <= lowerBottom + 0.5; y += emptyBandYStep) {
      for (let x = sidePadding; x <= maxX + 0.5; x += emptyBandStep) {
        const rect = { left: x, right: x + totalWidth, top: y, bottom: y + maxHeight };
        if (overlapsPhoto(rect)) continue;
        const centerX = x + totalWidth / 2;
        const centerY = y + maxHeight / 2;
        const score = Math.hypot(centerX - currentGroup.x, centerY - currentGroup.y) * 0.48
          + Math.abs(y - preferredY) * 0.34
          + Math.abs(centerX - window.innerWidth / 2) * 0.12;
        if (!best || score < best.score) best = { x, y, score };
      }
    }
    return best;
  };

  const getRestTargets = (floor, sidePadding, colliders) => {
    const settlingPieces = pieces.filter((piece) => piece.settles !== false);
    const gap = isMobile() ? 9 : 12;
    const totalWidth = settlingPieces.reduce((sum, piece) => sum + piece.width, 0) + gap * Math.max(0, settlingPieces.length - 1);
    const maxHeight = settlingPieces.reduce((height, piece) => Math.max(height, piece.height), 0);
    const currentGroup = settlingPieces.reduce((sum, piece) => ({
      x: sum.x + piece.x + piece.width / 2,
      y: sum.y + piece.y + piece.height / 2
    }), { x: 0, y: 0 });
    currentGroup.x /= Math.max(1, settlingPieces.length);
    currentGroup.y /= Math.max(1, settlingPieces.length);

    const viewportKey = `${Math.round(window.innerWidth)}:${Math.round(window.innerHeight)}:${Math.round(window.scrollY / 80)}`;
    if (viewportKey !== restTargetKey) {
      restTargetKey = viewportKey;
      cachedRestTargets = new Map();
    }
    if (cachedRestTargets.size) return cachedRestTargets;
    const targetGroup = getWhitespaceRestCandidate(floor, sidePadding, colliders, totalWidth, maxHeight, currentGroup);
    if (!targetGroup) return new Map();
    let cursor = targetGroup.x;
    const targets = new Map();
    settlingPieces.forEach((piece, index) => {
      targets.set(piece, {
        x: cursor,
        y: targetGroup.y + (maxHeight - piece.height) * 0.48 + (index % 2) * (isMobile() ? 1.2 : 1.8),
        angle: piece.restAngle * 0.24
      });
      cursor += piece.width + gap;
    });
    if (!cachedRestTargets.size) cachedRestTargets = targets;
    return cachedRestTargets;
  };

  const avoidPhotosSoftly = (piece, colliders, dt) => {
    colliders.forEach((collider) => {
      const padding = photoAvoidRadius();
      const rect = {
        left: collider.rect.left - padding,
        right: collider.rect.right + padding,
        top: collider.rect.top - padding,
        bottom: collider.rect.bottom + padding
      };
      const pieceBox = getPieceBox(piece);
      if (pieceBox.right < rect.left || pieceBox.left > rect.right || pieceBox.bottom < rect.top || pieceBox.top > rect.bottom) return;

      const overlapLeft = pieceBox.right - rect.left;
      const overlapRight = rect.right - pieceBox.left;
      const overlapTop = pieceBox.bottom - rect.top;
      const overlapBottom = rect.bottom - pieceBox.top;
      const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
      const strength = (isMobile() ? 0.34 : 0.42) * dt;
      if (minOverlap === overlapLeft) piece.x -= overlapLeft * strength;
      else if (minOverlap === overlapRight) piece.x += overlapRight * strength;
      else if (minOverlap === overlapTop) piece.y -= overlapTop * strength;
      else piece.y += overlapBottom * strength;
      piece.vx *= 0.78;
      piece.vy *= 0.78;
      piece.va *= 0.82;
    });
  };

  const markPhotoHit = (collider, pieceCenterX, pieceCenterY) => {
    if (!photoEffectsReady) return;
    const rect = collider.rect;
    const photoCenterX = rect.left + rect.width / 2;
    const photoCenterY = rect.top + rect.height / 2;
    const driftX = clamp((photoCenterX - pieceCenterX) * 0.018, -5.5, 5.5);
    const driftY = clamp((photoCenterY - pieceCenterY) * 0.014, -3.5, 3.5);
    collider.item.style.setProperty("--home-photo-x", `${driftX.toFixed(2)}px`);
    collider.item.style.setProperty("--home-photo-y", `${driftY.toFixed(2)}px`);
    collider.item.classList.add("is-home-hit");
    const previousTimer = photoHitTimers.get(collider.item);
    if (previousTimer) window.clearTimeout(previousTimer);
    photoHitTimers.set(collider.item, window.setTimeout(() => {
      collider.item.classList.remove("is-home-hit");
      collider.item.style.removeProperty("--home-photo-x");
      collider.item.style.removeProperty("--home-photo-y");
      photoHitTimers.delete(collider.item);
    }, 720));
  };

  const collideWithPhoto = (piece, collider, dt) => {
    const rect = collider.rect;
    const pieceBox = getPieceBox(piece);
    if (pieceBox.right <= rect.left || pieceBox.left >= rect.right || pieceBox.bottom <= rect.top || pieceBox.top >= rect.bottom) return false;

    const overlapLeft = pieceBox.right - rect.left;
    const overlapRight = rect.right - pieceBox.left;
    const overlapTop = pieceBox.bottom - rect.top;
    const overlapBottom = rect.bottom - pieceBox.top;
    const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);
    const photoCenterX = rect.left + rect.width / 2;
    const pieceCenterX = pieceBox.left + (pieceBox.right - pieceBox.left) / 2;
    const pieceCenterY = pieceBox.top + (pieceBox.bottom - pieceBox.top) / 2;
    const bounce = (isMobile() ? 0.24 : 0.28) * (piece.rebound || 1);
    piece.sleeping = false;
    piece.floorHits = 0;

    if (minOverlap === overlapTop && piece.vy >= -2) {
      let rollDirection = pieceCenterX < photoCenterX ? -1 : 1;
      if (piece.x < 22) rollDirection = 1;
      if (piece.x + piece.width > window.innerWidth - 22) rollDirection = -1;
      piece.y = rect.top - (piece.height - pieceBox.offsetBottom);
      piece.vy = -Math.min(Math.abs(piece.vy) * bounce + (isMobile() ? 0.38 : 0.48), isMobile() ? 1.8 : 2.25);
      piece.vx += (rollDirection * (isMobile() ? 0.92 : 1.12) + (Math.random() - 0.5) * 0.22) * (piece.rebound || 1) * dt;
    } else if (minOverlap === overlapBottom) {
      piece.y = rect.bottom - pieceBox.offsetTop;
      piece.vy = Math.abs(piece.vy) * 0.18 + 0.32;
    } else if (minOverlap === overlapLeft) {
      piece.x = rect.left - (piece.width - pieceBox.offsetRight);
      piece.vx = -Math.abs(piece.vx) * bounce - (0.54 + Math.random() * 0.16);
    } else {
      piece.x = rect.right - pieceBox.offsetLeft;
      piece.vx = Math.abs(piece.vx) * bounce + (0.54 + Math.random() * 0.16);
    }
    piece.va += clamp((pieceCenterX - photoCenterX) * 0.0035, -0.45, 0.45);
    markPhotoHit(collider, pieceCenterX, pieceCenterY);
    return true;
  };

  const collideLetters = (dt, restTargets = null) => {
    for (let pass = 0; pass < 2; pass++) {
      for (let i = 0; i < pieces.length; i++) {
        for (let j = i + 1; j < pieces.length; j++) {
          const first = pieces[i];
          const second = pieces[j];
          const firstBox = getPieceBox(first);
          const secondBox = getPieceBox(second);
          if (firstBox.right <= secondBox.left || firstBox.left >= secondBox.right || firstBox.bottom <= secondBox.top || firstBox.top >= secondBox.bottom) continue;

          const firstCenterX = firstBox.left + (firstBox.right - firstBox.left) / 2;
          const secondCenterX = secondBox.left + (secondBox.right - secondBox.left) / 2;
          const firstCenterY = firstBox.top + (firstBox.bottom - firstBox.top) / 2;
          const secondCenterY = secondBox.top + (secondBox.bottom - secondBox.top) / 2;
          const overlapX = Math.min(firstBox.right - secondBox.left, secondBox.right - firstBox.left);
          const overlapY = Math.min(firstBox.bottom - secondBox.top, secondBox.bottom - firstBox.top);
          const firstMass = first.mass || 1;
          const secondMass = second.mass || 1;
          const massTotal = firstMass + secondMass;
          const firstShare = secondMass / massTotal;
          const secondShare = firstMass / massTotal;
          const slop = isMobile() ? 2.2 : 1.8;
          const firstTarget = restTargets?.get(first);
          const secondTarget = restTargets?.get(second);
          const settleDirectionX = firstTarget && secondTarget && firstTarget.x !== secondTarget.x
            ? (firstTarget.x < secondTarget.x ? -1 : 1)
            : 0;

          if (overlapX < overlapY) {
            const effectiveOverlap = overlapX - slop;
            if (effectiveOverlap <= 0) continue;
            const direction = settleDirectionX || (firstCenterX < secondCenterX ? -1 : 1);
            const relativeSpeed = Math.abs(first.vx - second.vx);
            const isSoftContact = relativeSpeed < getSoftCollisionThreshold();
            const push = (effectiveOverlap * 0.62 + 0.62) * dt;
            const reboundScale = ((first.rebound || 1) + (second.rebound || 1)) * 0.5;
            first.x += direction * push * firstShare;
            second.x -= direction * push * secondShare;
            if (isSoftContact) {
              const slideDamping = isMobile() ? 0.7 : 0.74;
              const angleDamping = isMobile() ? 0.62 : 0.68;
              first.vx *= slideDamping;
              second.vx *= slideDamping;
              first.va *= angleDamping;
              second.va *= angleDamping;
              first.angle += (first.restAngle - first.angle) * 0.026 * dt;
              second.angle += (second.restAngle - second.angle) * 0.026 * dt;
            } else {
              const rebound = clamp(0.18 + relativeSpeed * 0.2 + effectiveOverlap * 0.016, 0.14, isMobile() ? 0.72 : 0.92) * reboundScale * dt;
              first.vx += direction * rebound * firstShare;
              second.vx -= direction * rebound * secondShare;
              first.vx *= 0.86;
              second.vx *= 0.86;
              first.va += direction * rebound * 0.018;
              second.va -= direction * rebound * 0.018;
            }
          } else {
            const effectiveOverlap = overlapY - slop;
            if (effectiveOverlap <= 0) continue;
            const direction = firstCenterY < secondCenterY ? -1 : 1;
            const relativeSpeed = Math.abs(first.vy - second.vy);
            const isSoftContact = relativeSpeed < getSoftCollisionThreshold();
            const push = (effectiveOverlap * 0.6 + 0.58) * dt;
            const reboundScale = ((first.rebound || 1) + (second.rebound || 1)) * 0.5;
            first.y += direction * push * firstShare;
            second.y -= direction * push * secondShare;
            if (isSoftContact) {
              const slideDamping = isMobile() ? 0.68 : 0.72;
              const angleDamping = isMobile() ? 0.6 : 0.66;
              first.vy *= slideDamping;
              second.vy *= slideDamping;
              first.va *= angleDamping;
              second.va *= angleDamping;
              first.angle += (first.restAngle - first.angle) * 0.024 * dt;
              second.angle += (second.restAngle - second.angle) * 0.024 * dt;
            } else {
              const rebound = clamp(0.16 + relativeSpeed * 0.17 + effectiveOverlap * 0.014, 0.12, isMobile() ? 0.64 : 0.82) * reboundScale * dt;
              first.vy += direction * rebound * firstShare;
              second.vy -= direction * rebound * secondShare;
              first.vy *= 0.82;
              second.vy *= 0.82;
              first.va += (firstCenterX < secondCenterX ? -1 : 1) * rebound * 0.014;
              second.va -= (firstCenterX < secondCenterX ? -1 : 1) * rebound * 0.014;
            }
          }
          first.va *= 0.9;
          second.va *= 0.9;
          first.sleeping = false;
          second.sleeping = false;
        }
      }
    }
  };

  const tick = (time) => {
    if (!lastTime) lastTime = time;
    if (!physicsStartedAt) physicsStartedAt = time;
    const dt = clamp((time - lastTime) / 16.67, 0.5, 1.35);
    lastTime = time;

    const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
    const scrollDelta = clamp(scrollY - lastScrollY, -90, 90);
    lastScrollY = scrollY;
    scrollLift = clamp((scrollLift + scrollDelta * 0.055) * 0.88, -42, 12);

    const floor = window.innerHeight - (isMobile() ? 18 : 24);
    const sidePadding = isMobile() ? 6 : 14;
    const gravity = isMobile() ? 0.095 : 0.11;
    const scrollForce = clamp(scrollDelta * 0.0036, -0.34, 0.26);
    const colliders = getPhotoColliders();
    if (Math.abs(scrollDelta) > 1.5) lastScrollMoveAt = time;
    if (!lastScrollMoveAt) lastScrollMoveAt = time;
    const settleDelay = isMobile() ? 2800 : 3400;
    const settleAge = Math.max(0, time - physicsStartedAt - settleDelay);
    const settleEase = clamp(settleAge / 3600, 0, 1);
    const idleAge = time - lastScrollMoveAt;
    const settlingPieces = pieces.filter((piece) => piece.settles !== false);
    const groupCenterY = settlingPieces.reduce((sum, piece) => sum + piece.y + piece.height / 2, 0) / Math.max(1, settlingPieces.length);
    const groupHasNaturallyDropped = groupCenterY > idleAttractionRadius() || settlingPieces.some((piece) => piece.floorHits > 0);
    const shouldSettle = settleAge > 0
      && idleAge > (isMobile() ? 520 : 680)
      && groupHasNaturallyDropped
      && time >= reunionCooldownUntil;
    if (!shouldSettle) {
      restTargetKey = "";
      cachedRestTargets = new Map();
    }
    const restTargets = shouldSettle ? getRestTargets(floor, sidePadding, colliders) : new Map();
    let touchedItem = null;
    const motionWakeStrength = isMobile() && motionListening ? getMotionWakeStrength() : 0;

    pieces.forEach((piece, index) => {
      piece.onFloor = false;
      if (piece.sleeping && motionWakeStrength > 0.08 && piece.type === "letter") {
        piece.sleeping = false;
        piece.vx += motionInfluence.x * 0.48;
        piece.vy += motionInfluence.y * 0.42;
        piece.va += (motionInfluence.x + motionInfluence.twist * 0.36) * 0.022;
      }
      if (piece.sleeping && Math.abs(scrollDelta) < 1.5 && !shouldSettle) {
        piece.vx = 0;
        piece.vy = 0;
        piece.va = 0;
        piece.angle += (piece.restAngle - piece.angle) * 0.055;
        setPieceTransform(piece);
        return;
      }

      if (Math.abs(scrollDelta) >= 1.5) piece.sleeping = false;
      const passiveGravity = isMobile() && motionListening ? gravity * 0.72 : gravity;
      piece.vy += (passiveGravity + scrollForce) * dt;
      piece.vx += motionInfluence.x * (isMobile() ? 0.068 : 0.034) * dt;
      piece.vy += motionInfluence.y * (isMobile() ? 0.11 : 0.022) * dt;
      piece.va += (motionInfluence.x + motionInfluence.twist * 0.4) * 0.006 * dt;
      if (scrollDelta < -1) {
        piece.y += scrollDelta * 0.045;
        piece.vx *= 0.92;
        piece.va *= 0.72;
      }
      piece.vx += Math.sin(time * 0.001 + (piece.wanderSeed || index * 1.7)) * (piece.type === "figure" ? 0.011 : 0.008) * dt;
      piece.vx *= 0.965;
      piece.vy *= 0.985;
      piece.va *= 0.93;

      piece.x += piece.vx * dt;
      piece.y += piece.vy * dt;
      piece.angle += piece.va * dt;

      if (piece.type === "figure" && isMobile() && piece.y < 0) {
        const entryCenter = clamp((window.innerWidth - piece.width) / 2, sidePadding, Math.max(sidePadding, window.innerWidth - sidePadding - piece.width));
        const entrySpread = Math.min(34, Math.max(18, piece.width * 0.48));
        const minEntryX = entryCenter - entrySpread;
        const maxEntryX = entryCenter + entrySpread;
        if (piece.x < minEntryX) {
          piece.x += (minEntryX - piece.x) * 0.24 * dt;
          piece.vx = Math.max(piece.vx, 0) * 0.76;
        } else if (piece.x > maxEntryX) {
          piece.x += (maxEntryX - piece.x) * 0.24 * dt;
          piece.vx = Math.min(piece.vx, 0) * 0.76;
        }
      }

      if (piece.x < sidePadding) {
        piece.x = sidePadding;
        piece.vx = Math.abs(piece.vx) * 0.18;
        piece.va += 0.06;
      }
      if (piece.x + piece.width > window.innerWidth - sidePadding) {
        piece.x = window.innerWidth - sidePadding - piece.width;
        piece.vx = -Math.abs(piece.vx) * 0.18;
        piece.va -= 0.06;
      }

      colliders.forEach((collider) => {
        if (collideWithPhoto(piece, collider, dt)) touchedItem = collider.item;
      });
      avoidPhotosSoftly(piece, colliders, dt);

      piece.vx = clamp(piece.vx, -3.6, 3.6);
      piece.vy = clamp(piece.vy, -3.8, 5.8);

      if (piece.y + piece.height > floor) {
        piece.y = floor - piece.height;
        piece.onFloor = true;
        piece.floorHits += 1;
        const restEnergy = Math.abs(piece.vy) + Math.abs(piece.vx) * 0.4 + Math.abs(piece.va) * 0.2;
        if (restEnergy < 1.35 || piece.floorHits > 2) {
          piece.sleeping = true;
          piece.vx = 0;
          piece.vy = 0;
          piece.va = 0;
        } else {
          piece.vy = -Math.abs(piece.vy) * (isMobile() ? 0.14 : 0.16);
          piece.vx += (Math.random() - 0.5) * 0.18 * (piece.rebound || 1);
          piece.va = piece.va * 0.42 + (Math.random() - 0.5) * 0.035;
        }
        piece.vx *= 0.58;
        piece.angle += (piece.restAngle - piece.angle) * 0.04;
      }

      const target = shouldSettle ? restTargets.get(piece) : null;
      if (target) {
        const baseSettleRate = Math.abs(scrollDelta) > 1.5 ? 0.008 : 0.014;
        const settleRate = (baseSettleRate + settleEase * 0.018) * dt;
        piece.x += (target.x - piece.x) * settleRate;
        piece.y += (target.y - piece.y) * settleRate;
        piece.angle += (target.angle - piece.angle) * (settleRate * 0.72);
        piece.vx *= 0.9;
        piece.vy *= 0.9;
        piece.va *= 0.84;
        if (Math.abs(target.x - piece.x) < 0.45 && Math.abs(target.y - piece.y) < 0.45 && Math.abs(target.angle - piece.angle) < 0.18) {
          piece.sleeping = true;
          piece.x = target.x;
          piece.y = target.y;
          piece.angle = target.angle;
          piece.vx = 0;
          piece.vy = 0;
          piece.va = 0;
        }
      }

      setPieceTransform(piece);
    });

    collideLetters(dt, restTargets);
    pieces.forEach((piece) => {
      const minY = piece.type === "figure" ? -piece.height * 1.35 : 0;
      piece.x = clamp(piece.x, sidePadding, Math.max(sidePadding, window.innerWidth - sidePadding - piece.width));
      piece.y = clamp(piece.y, minY, Math.max(minY, floor - piece.height));
      setPieceTransform(piece);
    });

    const returningFromRel = document.body.classList.contains("is-returning-from-rel");
    const photoEffectDelay = returningFromRel ? 1180 : 520;
    const sceneDelay = returningFromRel ? 1280 : 680;
    photoEffectsReady = time - physicsStartedAt >= photoEffectDelay;
    const sceneRamp = clamp((time - physicsStartedAt - sceneDelay) / 720, 0, 1);
    const perspectiveX = isMobile() && motionListening ? motionInfluence.x * sceneRamp : 0;
    const perspectiveY = isMobile() && motionListening ? motionInfluence.y * sceneRamp : 0;
    grid.style.setProperty("--home-scene-x", `${(perspectiveX * 4.5).toFixed(2)}px`);
    grid.style.setProperty("--home-scene-y", `${(perspectiveY * 4).toFixed(2)}px`);
    grid.style.setProperty("--home-scene-rotate-x", `${(-perspectiveY * 1.25).toFixed(3)}deg`);
    grid.style.setProperty("--home-scene-rotate-y", `${(perspectiveX * 1.4).toFixed(3)}deg`);

    const letterPieces = pieces.filter((piece) => piece.type === "letter");
    const reunionDistance = isMobile() ? 11 : 14;
    const reunionSpeed = isMobile() ? 0.48 : 0.56;
    const reunionReady = shouldSettle
      && restTargets.size === letterPieces.length
      && letterPieces.every((piece) => {
        const target = restTargets.get(piece);
        return target
          && Math.hypot(target.x - piece.x, target.y - piece.y) < reunionDistance
          && Math.abs(piece.vx) + Math.abs(piece.vy) < reunionSpeed;
      });
    if (!reunionReady) {
      reunionStableSince = 0;
      if (time >= reunionCooldownUntil && !reunionEndsAt) reunionArmed = true;
    } else if (!reunionStableSince) {
      reunionStableSince = time;
    } else if (reunionArmed && !reunionEndsAt && time - reunionStableSince > 420) {
      reunionArmed = false;
      reunionEndsAt = time + 920;
      document.body.classList.add("is-letter-reunion");
      reunionPhoto = getNearestCollider(colliders) || null;
      reunionPhoto?.classList.add("is-home-reunion");
    }
    if (reunionEndsAt && time >= reunionEndsAt) {
      clearReunionState();
      reunionEndsAt = 0;
      reunionStableSince = 0;
      reunionCooldownUntil = time + 1800;
      const midpoint = (letterPieces.length - 1) / 2;
      letterPieces.forEach((piece, index) => {
        piece.sleeping = false;
        piece.vx += (index - midpoint) * (isMobile() ? 0.16 : 0.2) + motionInfluence.x * 0.22;
        piece.vy -= isMobile() ? 0.42 : 0.5;
        piece.va += (index - midpoint) * 0.012;
      });
    }

    if (photoEffectsReady) setActiveItem(touchedItem || getNearestCollider(colliders), colliders);
    else clearStates();
    frame = scheduleFrame(tick);
  };

  const startPhysics = () => {
    if (started || !letters.length) return;
    started = true;
    const midpoint = (letters.length - 1) / 2;
    const letterPieces = letters.map((letter, index) => {
      const rect = letter.getBoundingClientRect();
      const offset = index - midpoint;
      return {
        type: "letter",
        settles: true,
        mass: 0.94 + Math.random() * 0.16,
        rebound: 0.92 + Math.random() * 0.22,
        wanderSeed: Math.random() * Math.PI * 2,
        glyph: letter.textContent.trim().toLowerCase(),
        el: letter,
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height,
        vx: offset * (isMobile() ? 0.28 : 0.42) + (Math.random() - 0.5) * (isMobile() ? 0.18 : 0.28),
        vy: -0.28 + Math.abs(offset) * 0.07 + Math.random() * 0.12,
        angle: 0,
        va: offset * (isMobile() ? 0.045 : 0.065) + (Math.random() - 0.5) * (isMobile() ? 0.03 : 0.04),
        restAngle: offset * (isMobile() ? 2.1 : 2.8) + (Math.random() - 0.5) * (isMobile() ? 1.1 : 1.4),
        floorHits: 0,
        onFloor: false,
        sleeping: false
      };
    });

    pieces = [...letterPieces];
    if (figure) {
      const rect = figure.getBoundingClientRect();
      const width = rect.width || Math.min(window.innerWidth * 0.28, 150);
      const height = rect.height || width * 1.57;
      const sidePadding = isMobile() ? 8 : 16;
      const figureHitbox = { left: 0.18, right: 0.18, top: 0.075, bottom: 0.025 };
      pieces.push({
        type: "figure",
        settles: false,
        mass: 1.18 + Math.random() * 0.22,
        rebound: 1.02 + Math.random() * 0.24,
        wanderSeed: Math.random() * Math.PI * 2,
        hitbox: figureHitbox,
        glyph: "figure",
        el: figure,
        x: getTopDropX(width, sidePadding, figureHitbox),
        y: -height - 32 - Math.random() * (isMobile() ? 96 : 150),
        width,
        height,
        vx: (Math.random() - 0.5) * (isMobile() ? 0.38 : 0.62),
        vy: 0.08 + Math.random() * 0.24,
        angle: (Math.random() - 0.5) * 10,
        va: (Math.random() - 0.5) * (isMobile() ? 0.055 : 0.075),
        restAngle: 0,
        floorHits: 0,
        onFloor: false,
        sleeping: false
      });
    }

    title.style.setProperty("--brand-shift-x", "0px");
    title.style.setProperty("--brand-shift-y", "0px");
    title.style.setProperty("--brand-tilt", "0deg");
    title.style.setProperty("--brand-scale", "1");
    pieces.forEach((piece) => {
      piece.angle = piece.angle || 0;
      setPieceTransform(piece);
    });

    document.body.classList.add("is-letter-gravity");
    syncPieceMetrics();
    lastTime = 0;
    physicsStartedAt = 0;
    photoEffectsReady = false;
    lastScrollMoveAt = 0;
    scrollLift = 0;
    lastScrollY = window.scrollY || document.documentElement.scrollTop || 0;
    frame = scheduleFrame(tick);
  };

  const waitForIntro = () => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      applyIdleState();
      return;
    }
    if (document.body.classList.contains("is-returning-from-rel")) {
      readyTimer = window.setTimeout(startPhysics, 360);
      return;
    }
    if (document.body.classList.contains("has-finished")) {
      readyTimer = window.setTimeout(startPhysics, 1250);
      return;
    }
    waitTimer = window.setTimeout(waitForIntro, 80);
  };

  const handleResize = () => {
    if (!started) return;
    syncPieceMetrics();
  };

  window.addEventListener("resize", handleResize);
  setupMotionAccess();
  waitForIntro();

  overviewInteractionCleanup = () => {
    if (frame) cancelFrame(frame);
    window.clearTimeout(readyTimer);
    window.clearTimeout(waitTimer);
    window.removeEventListener("resize", handleResize);
    window.removeEventListener("deviceorientation", handleDeviceOrientation, true);
    window.removeEventListener("devicemotion", handleDeviceMotion, true);
    window.removeEventListener("pointerdown", requestMotionAccess);
    window.removeEventListener("touchstart", requestMotionAccess);
    window.removeEventListener("touchend", requestMotionAccess);
    window.removeEventListener("click", requestMotionAccess);
    grid.style.removeProperty("--home-scene-x");
    grid.style.removeProperty("--home-scene-y");
    grid.style.removeProperty("--home-scene-rotate-x");
    grid.style.removeProperty("--home-scene-rotate-y");
    clearReunionState();
    applyIdleState();
  };
}

function isValidOverviewFlightRect(rect) {
  return rect
    && [rect.left, rect.top, rect.width, rect.height].every(Number.isFinite)
    && rect.width > 8
    && rect.height > 8;
}

function finishOverviewReturnTarget(target, overlay = null) {
  if (!overlay) {
    target.classList.remove("is-return-flight-target", "is-return-target");
    return;
  }
  target.classList.add("is-return-flight-handoff");
  target.classList.remove("is-return-flight-target", "is-return-target");
  overlay.remove();
  requestAnimationFrame(() => {
    requestAnimationFrame(() => target.classList.remove("is-return-flight-handoff"));
  });
}

function runOverviewReturnFlight(target, state) {
  const flight = state?.flight;
  const targetImage = target.querySelector("img");
  const sourceRect = flight?.sourceRect;
  const photoSrc = typeof flight?.photoSrc === "string" ? flight.photoSrc : "";
  const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  if (!targetImage || !photoSrc || !isValidOverviewFlightRect(sourceRect) || reducedMotion) {
    window.setTimeout(() => finishOverviewReturnTarget(target), reducedMotion ? 40 : 900);
    return;
  }

  const overlay = document.createElement("img");
  overlay.className = "overview-return-flight";
  overlay.alt = "";
  overlay.decoding = "async";
  overlay.src = photoSrc;
  overlay.setAttribute("aria-hidden", "true");
  document.body.appendChild(overlay);

  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    window.clearTimeout(safetyTimer);
    finishOverviewReturnTarget(target, overlay);
  };
  const safetyTimer = window.setTimeout(finish, 1500);
  const start = () => {
    const destination = targetImage.getBoundingClientRect();
    if (!isValidOverviewFlightRect(destination)) {
      finish();
      return;
    }
    const axis = flight.axis === "x" ? "x" : "y";
    const direction = Number(flight.direction) < 0 ? -1 : 1;
    const axisDrift = 18 * direction;
    const dx = sourceRect.left - destination.left + (axis === "x" ? axisDrift : 0);
    const dy = sourceRect.top - destination.top + (axis === "y" ? axisDrift : 0);
    const scaleX = sourceRect.width / destination.width;
    const scaleY = sourceRect.height / destination.height;
    overlay.style.left = `${destination.left}px`;
    overlay.style.top = `${destination.top}px`;
    overlay.style.width = `${destination.width}px`;
    overlay.style.height = `${destination.height}px`;
    overlay.style.setProperty("--return-flight-x", `${dx}px`);
    overlay.style.setProperty("--return-flight-y", `${dy}px`);
    overlay.style.setProperty("--return-flight-scale-x", scaleX.toFixed(5));
    overlay.style.setProperty("--return-flight-scale-y", scaleY.toFixed(5));
    target.classList.add("is-return-flight-target");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => overlay.classList.add("is-active"));
    });
  };
  overlay.addEventListener("animationend", finish, { once: true });
  if (overlay.complete && overlay.naturalWidth > 0) {
    if (typeof overlay.decode === "function") overlay.decode().then(start).catch(start);
    else start();
  } else {
    overlay.addEventListener("load", start, { once: true });
    overlay.addEventListener("error", finish, { once: true });
  }
}
function startLoadingSequence() {
  if (document.body.classList.contains("is-returning-from-rel")) {
    document.body.classList.add("has-loaded", "has-finished");
    document.documentElement.classList.add("has-landed");
    return;
  }
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
      <span class="work-item__image"><img src="${photo.thumb}" alt="${photo.alt}" loading="lazy" decoding="async"></span>
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
  const noteText = document.querySelector("[data-focus-note-text]");
  const imageToggle = document.querySelector("[data-focus-image-toggle]");
  const focusMain = document.querySelector("[data-focus-main]");
  const indexToggle = document.querySelector("[data-focus-index]");
  const navToggle = document.querySelector(".js-nav-toggle");
  const backLink = document.querySelector(".js-back");
  if (!shell || !title || !thumbs || !image || !caption || !imageToggle || !focusMain) return;
  let mobileRailMaxOffset = 0;
  let focusSyncHoldUntil = 0;
  let focusTouchStartX = 0;
  let focusTouchStartY = 0;
  let focusTouchLastX = 0;
  let focusTouchMode = "";
  let focusMainTouchStartX = 0;
  let focusMainTouchStartY = 0;
  let focusMainTouchLastX = 0;
  let focusMainTouchLastY = 0;
  let focusMainTouchLastMoveAt = 0;
  let focusMainTouchVelocityX = 0;
  let focusMainTouchMode = "";
  let focusMainTouchMoved = false;
  let focusMainTouchPreventClickUntil = 0;
  let focusMainTouchBaseOffset = 0;
  let focusMainTouchContinuationDirection = 0;
  let focusMainPointerActive = false;
  let focusMainPointerId = 0;
  let focusMainWheelLockUntil = 0;
  let focusLastNavigationDirection = 1;
  const focusMainSwipe = {
    active: false,
    animating: false,
    frame: 0,
    offset: 0,
    extent: 1,
    travel: 1,
    progress: 0,
    axis: "x",
    direction: 0,
    fromIndex: 0,
    targetIndex: 0,
    startedAt: 0,
    fromOffset: 0,
    toOffset: 0,
    commit: false,
    edge: false,
    chained: false,
    handoffPending: false,
    railAxis: "",
    railFrom: 0,
    railTo: 0,
    railReady: false
  };
  let focusQueuedSwipe = null;
  let focusMainSwipeClearSequence = 0;
  const focusShiftPositions = new Map();
  const focusFollowRate = 0.08;
  let focusSwitchSequence = 0;
  let focusSwitchTimer = 0;
  let returnToNotesAfterIndex = false;
  let focusIndexTransitionTimer = 0;
  let focusRailScrollFrame = 0;
  let focusManualSelectionIndex = null;
  let focusManualSelectionTimer = 0;
  let focusSwipeSyncTimer = 0;
  let focusMainSwipeLockUntil = 0;
  let focusNoteCopyTransitionTimer = 0;
  let focusNotesTransitionTimer = 0;
  let focusIndexAnimations = [];
  let focusIndexHandoffTimer = 0;
  let focusIndexHiddenCardTimer = 0;
  let focusIndexStartTimer = 0;
  let focusIndexMainReleaseTimer = 0;
  let focusMainDockedIndex = null;
  const focusPhotoRatios = new Map();
  const focusImagePreloadCache = new Map();
  const indexEnabled = Boolean(indexToggle);
  const indexGallery = indexEnabled ? document.createElement("section") : null;
  if (indexGallery) {
    indexGallery.className = "focus-index-gallery";
    indexGallery.dataset.focusIndexGallery = "";
    indexGallery.setAttribute("aria-label", "Photo index gallery");
    indexGallery?.setAttribute("aria-hidden", "true");
    shell.insertBefore(indexGallery, shell.querySelector(".focus-actions"));
  }
  photos.forEach((photo, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "focus-thumb";
    button.dataset.index = String(index + 1);
    button.style.setProperty("--delay", `${Math.min(index, 24) * 0.018}s`);
    button.innerHTML = `<span class="focus-thumb__media"><img src="${photo.thumb}" alt="${photo.alt}" loading="eager" decoding="async"></span>`;
    const thumbImage = button.querySelector("img");
    thumbImage?.addEventListener("load", () => rememberFocusPhotoRatio(index, thumbImage), { once: true });
    if (thumbImage?.complete) requestAnimationFrame(() => rememberFocusPhotoRatio(index, thumbImage));
    button.addEventListener("click", () => {
      if (shell.classList.contains("is-index")) return;
      setFocus(index, true, { source: "thumb" });
      setNotesOpen(false);
      glideFocusRailAfterThumbClick(index);
    });
    thumbs.appendChild(button);

    if (indexGallery) {
      const indexButton = document.createElement("button");
      indexButton.type = "button";
      indexButton.className = "focus-index-card";
      indexButton.dataset.index = String(index + 1);
      indexButton.style.setProperty("--delay", `${Math.min(index, 28) * 0.012}s`);
      indexButton.innerHTML = `<span class="focus-index-card__media"><img src="${photo.full}" alt="${photo.alt}" loading="eager" decoding="async"></span>`;
      const indexImage = indexButton.querySelector("img");
      indexImage?.addEventListener("load", () => rememberFocusPhotoRatio(index, indexImage), { once: true });
      if (indexImage?.complete) requestAnimationFrame(() => rememberFocusPhotoRatio(index, indexImage));
      indexButton.addEventListener("click", () => selectFocusIndexCard(index));
      indexGallery.appendChild(indexButton);
    }
  });

  indexToggle?.addEventListener("click", () => {
    if (!indexEnabled) return;
    const activeIndex = Number(shell.dataset.activeIndex || 0);
    if (shell.classList.contains("is-index-closing")) {
      openFocusIndex(activeIndex);
      return;
    }
    if (shell.classList.contains("is-index")) {
      closeFocusIndex(activeIndex, { restoreNotes: returnToNotesAfterIndex });
      return;
    }
    openFocusIndex(activeIndex);
  });
  imageToggle.addEventListener("click", () => {
    if (Date.now() < focusMainTouchPreventClickUntil) return;
    setNotesOpen(!shell.classList.contains("is-notes"));
  });
  navToggle?.addEventListener("click", (event) => {
    if (!shell.classList.contains("is-notes")) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    setNotesOpen(false);
  }, true);

  backLink?.addEventListener("click", (event) => {
    event.preventDefault();
    const activeIndex = Number(shell.dataset.activeIndex || 0);
    const activeRel = activeIndex + 1;
    if (shell.classList.contains("is-index")) {
      closeFocusIndex(activeIndex, { restoreNotes: returnToNotesAfterIndex });
      return;
    }
    try {
      const existing = JSON.parse(sessionStorage.getItem(OVERVIEW_RETURN_STORAGE_KEY) || "null") || {};
      const activePhoto = photos[activeIndex] || photos[0];
      const sourceRect = getFocusImageContentRect();
      sessionStorage.setItem(OVERVIEW_RETURN_STORAGE_KEY, JSON.stringify({
        rel: activeRel,
        scrollY: Number(existing.scrollY || 0),
        createdAt: Date.now(),
        order: Array.isArray(existing.order) ? existing.order : undefined,
        flight: activePhoto && sourceRect ? {
          photoSrc: activePhoto.full,
          sourceRect,
          axis: window.innerWidth <= 768 ? "x" : "y",
          direction: focusLastNavigationDirection
        } : undefined
      }));
    } catch (error) {
      returnFocusToOverview(activeRel, true);
      return;
    }
    document.body.classList.add("is-focus-leaving");
    window.setTimeout(() => returnFocusToOverview(activeRel, true), 360);
  });
  window.addEventListener("wheel", () => {
    clearFocusManualSelection();
    if (!isFocusMainSwipeBusy()) cancelFocusRailScroll();
  }, { passive: true });
  thumbs.addEventListener("touchstart", handleFocusTouchStart, { passive: true });
  thumbs.addEventListener("touchmove", handleFocusTouchMove, { passive: false });
  imageToggle.addEventListener("touchstart", handleFocusMainTouchStart, { passive: true });
  imageToggle.addEventListener("touchmove", handleFocusMainTouchMove, { passive: false });
  imageToggle.addEventListener("touchend", handleFocusMainTouchEnd, { passive: true });
  imageToggle.addEventListener("touchcancel", handleFocusMainTouchCancel, { passive: true });
  imageToggle.addEventListener("pointerdown", handleFocusMainPointerDown);
  imageToggle.addEventListener("pointermove", handleFocusMainPointerMove);
  imageToggle.addEventListener("pointerup", handleFocusMainPointerUp);
  imageToggle.addEventListener("pointercancel", handleFocusMainPointerCancel);
  imageToggle.addEventListener("lostpointercapture", handleFocusMainPointerCancel);
  imageToggle.addEventListener("wheel", handleFocusMainWheel, { passive: false });
  ensureFocusMainSwipeLayer();
  thumbs.addEventListener("wheel", handleFocusWheel, { passive: false });
  window.addEventListener("keydown", (event) => {
    const current = Number(shell.dataset.activeIndex || 0);
    if (shell.classList.contains("is-index")) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeFocusIndex(current, { restoreNotes: returnToNotesAfterIndex });
      }
      return;
    }
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      clearFocusManualSelection();
      const next = (current + 1) % photos.length;
      setFocus(next, true);
      scrollToFocusIndex(next, true);
    }
    if (event.key === "ArrowUp" || event.key === "ArrowLeft") {
      event.preventDefault();
      clearFocusManualSelection();
      const next = (current - 1 + photos.length) % photos.length;
      setFocus(next, true);
      scrollToFocusIndex(next, true);
    }
    if (event.key === "Escape" && shell.classList.contains("is-notes")) {
      event.preventDefault();
      setNotesOpen(false);
    }
  });
  const rel = Number(new URLSearchParams(window.location.search).get("rel"));
  const initial = Number.isFinite(rel) && rel > 0 ? Math.min(rel - 1, photos.length - 1) : 0;
  focusInitialLockUntil = Date.now() + 1800;
  setFocus(initial, false);
  thumbs.querySelectorAll("img").forEach((thumbImage) => {
    thumbImage.addEventListener("load", () => {
      updateFocusRailMetrics();
      updateMobileFocusRail();
      scrollToFocusIndex(Date.now() < focusInitialLockUntil ? initial : Number(shell.dataset.activeIndex || initial), false);
    }, { once: true });
  });
  requestAnimationFrame(() => {
    updateFocusRailMetrics();
    updateMobileFocusRail();
    scrollToFocusIndex(initial, false);
    window.setTimeout(() => scrollToFocusIndex(initial, false), 520);
    requestAnimationFrame(syncFocusFromScroll);
  });
  window.addEventListener("resize", () => {
    updateFocusRailMetrics();
    updateMobileFocusRail();
    scheduleNotesLayoutUpdate();
    scrollToFocusIndex(Number(shell.dataset.activeIndex || initial), false);
  });
  window.addEventListener("l4rxx:languagechange", () => {
    const active = Number(shell.dataset.activeIndex || initial);
    const activePhoto = photos[active] || photos[0];
    transitionFocusNoteCopy(() => {
      if (noteText) noteText.textContent = getPhotoNote(activePhoto);
    });
  });


  function getFocusRect(node) {
    const rect = node?.getBoundingClientRect?.();
    if (!rect || rect.width <= 0 || rect.height <= 0) return null;
    return {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height
    };
  }

  function getFocusImageContentRect() {
    const rect = getFocusRect(image);
    if (!rect || !image.naturalWidth || !image.naturalHeight) return getFocusRect(imageToggle) || rect;
    const imageRatio = image.naturalWidth / image.naturalHeight;
    const boxRatio = rect.width / rect.height;
    if (imageRatio > boxRatio) {
      const height = rect.width / imageRatio;
      return {
        left: rect.left,
        top: rect.top + (rect.height - height) / 2,
        width: rect.width,
        height
      };
    }
    const width = rect.height * imageRatio;
    return {
      left: rect.left + (rect.width - width) / 2,
      top: rect.top,
      width,
      height: rect.height
    };
  }

  function getContentRectWithin(boxRect, ratio) {
    if (!boxRect || !ratio || !Number.isFinite(ratio)) return boxRect;
    const boxRatio = boxRect.width / boxRect.height;
    if (ratio > boxRatio) {
      const height = boxRect.width / ratio;
      return {
        left: boxRect.left,
        top: boxRect.top + (boxRect.height - height) / 2,
        width: boxRect.width,
        height
      };
    }
    const width = boxRect.height * ratio;
    return {
      left: boxRect.left + (boxRect.width - width) / 2,
      top: boxRect.top,
      width,
      height: boxRect.height
    };
  }

  function normalizeFocusTravelRect(rect, ratio) {
    if (!rect || !ratio || !Number.isFinite(ratio)) return rect;
    return getContentRectWithin(rect, ratio);
  }

  function getImageElementRatio(img) {
    if (!img) return null;
    if (img.naturalWidth > 0 && img.naturalHeight > 0) return img.naturalWidth / img.naturalHeight;
    return null;
  }

  function getRectRatio(rect) {
    return rect && rect.width > 0 && rect.height > 0 ? rect.width / rect.height : null;
  }

  function rememberFocusPhotoRatio(index, img) {
    const ratio = getImageElementRatio(img) || getRectRatio(getFocusRect(img));
    if (ratio && Number.isFinite(ratio)) focusPhotoRatios.set(index, ratio);
  }

  function getFocusPhotoRatio(index, fallbackRect) {
    const galleryImage = getFocusIndexCardByIndex(index)?.querySelector("img");
    const galleryRatio = getImageElementRatio(galleryImage);
    if (galleryRatio) {
      focusPhotoRatios.set(index, galleryRatio);
      return galleryRatio;
    }
    const cachedRatio = focusPhotoRatios.get(index);
    if (cachedRatio) return cachedRatio;
    return getRectRatio(fallbackRect) || getImageElementRatio(image) || getRectRatio(getFocusRect(image)) || 1;
  }

  function getCssPixelValue(node, name, fallback = 0) {
    const value = getComputedStyle(node).getPropertyValue(name).trim();
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function getCssLengthValue(node, name, fallback = 0) {
    if (!node) return fallback;
    const value = getComputedStyle(node).getPropertyValue(name).trim();
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed) && value.endsWith("px")) return parsed;
    const probe = document.createElement("span");
    probe.style.position = "absolute";
    probe.style.visibility = "hidden";
    probe.style.pointerEvents = "none";
    probe.style.width = `var(${name})`;
    node.appendChild(probe);
    const width = probe.getBoundingClientRect().width;
    probe.remove();
    return Number.isFinite(width) && width > 0 ? width : fallback;
  }

  function getCssNumberValue(node, name, fallback = 1) {
    const value = getComputedStyle(node).getPropertyValue(name).trim();
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }

  function getElementTranslateY(node) {
    if (!node) return 0;
    const transform = getComputedStyle(node).transform;
    if (!transform || transform === "none") return 0;
    try {
      return new DOMMatrixReadOnly(transform).m42 || 0;
    } catch (error) {
      const matrix = transform.match(/matrix\(([^)]+)\)/);
      if (!matrix) return 0;
      const values = matrix[1].split(",").map((item) => Number.parseFloat(item.trim()));
      return Number.isFinite(values[5]) ? values[5] : 0;
    }
  }


  function scaleRectFromCenter(rect, scale) {
    if (!rect || !Number.isFinite(scale)) return rect;
    const width = rect.width * scale;
    const height = rect.height * scale;
    return {
      left: rect.left + (rect.width - width) / 2,
      top: rect.top + (rect.height - height) / 2,
      width,
      height
    };
  }

  function measureFocusMainBaseRect() {
    if (!focusMain) return null;
    const measure = document.createElement(focusMain.tagName?.toLowerCase() || "figure");
    measure.className = "focus-main is-measuring-base";
    measure.setAttribute("aria-hidden", "true");
    measure.style.visibility = "hidden";
    measure.style.opacity = "0";
    measure.style.pointerEvents = "none";
    measure.style.transition = "none";
    measure.style.filter = "none";
    measure.style.zIndex = "-1";
    (shell || document.body).appendChild(measure);
    const rect = getFocusRect(measure);
    measure.remove();
    return rect;
  }

  function getFocusMainTargetRect(options = {}) {
    if (options.notes) updateNotesLayout();
    let rect = measureFocusMainBaseRect() || getFocusRect(imageToggle) || getFocusRect(image);
    if (!rect) return null;
    if (options.notes) {
      const shiftX = getCssPixelValue(shell, "--notes-photo-shift-x", 0);
      const shiftY = getCssPixelValue(shell, "--notes-photo-shift-y", 0);
      const notesScale = getCssNumberValue(shell, "--notes-photo-scale", 1);
      rect = scaleRectFromCenter({
        left: rect.left + shiftX,
        top: rect.top + shiftY,
        width: rect.width,
        height: rect.height
      }, notesScale);
    }
    return rect;
  }

  function getFocusImageContentRectForPhoto(photo, index, options = {}) {
    const box = getFocusMainTargetRect({ notes: Boolean(options.notes) }) || getFocusRect(image) || getFocusRect(imageToggle);
    const ratio = getFocusPhotoRatio(index, options.sourceRect);
    if (!box || !ratio) return box;
    return getContentRectWithin(box, ratio);
  }

  function getFocusIndexCardByIndex(index) {
    return indexGallery?.querySelector(`.focus-index-card[data-index="${index + 1}"]`) || null;
  }

  function getFocusIndexCardRect(card) {
    const cardImage = card?.querySelector("img");
    return getFocusRect(cardImage) || getFocusRect(card);
  }

  function getFocusImageAbsoluteUrl(src) {
    if (!src) return "";
    try {
      return new URL(src, window.location.href).href;
    } catch (error) {
      return src;
    }
  }

  function getCurrentFocusIndexTravelLayer() {
    return [...document.querySelectorAll(".focus-index-travel-layer")]
      .reverse()
      .find((layer) => !layer.classList.contains("is-releasing")) || null;
  }

  function getReusableFocusIndexTravelLayer(photo, allowCurrent = false) {
    const expected = getFocusImageAbsoluteUrl(photo?.full || photo?.thumb);
    const layers = [...document.querySelectorAll(".focus-index-travel-layer")].reverse();
    if (!expected) return allowCurrent ? getCurrentFocusIndexTravelLayer() : null;
    return layers.find((layer) => !layer.classList.contains("is-releasing") && getFocusImageAbsoluteUrl(layer.getAttribute("src")) === expected)
      || (allowCurrent ? getCurrentFocusIndexTravelLayer() : null);
  }

  function freezeFocusIndexTravelLayer(layer) {
    if (!layer) return null;
    const rect = getFocusRect(layer);
    if (!rect) return null;
    layer.classList.remove("is-releasing");
    layer.style.opacity = "1";
    layer.style.left = `${rect.left}px`;
    layer.style.top = `${rect.top}px`;
    layer.style.width = `${rect.width}px`;
    layer.style.height = `${rect.height}px`;
    layer.style.transform = "translate3d(0, 0, 0) scaleX(1) scaleY(1)";
    return rect;
  }

  function setFocusMainTravelRect(rect) {
    if (!rect) return null;
    focusMain.classList.add("is-main-traveling");
    focusMain.style.left = `${rect.left}px`;
    focusMain.style.top = `${rect.top}px`;
    focusMain.style.width = `${rect.width}px`;
    focusMain.style.height = `${rect.height}px`;
    focusMain.style.transform = "translate3d(0, 0, 0) scaleX(1) scaleY(1)";
    focusMain.style.opacity = "1";
    focusMain.style.filter = "none";
    focusMain.style.pointerEvents = "none";
    focusMain.style.zIndex = "1300";
    return rect;
  }

  function freezeFocusMainAtCurrentRect() {
    const currentRect = focusMain.classList.contains("is-main-traveling")
      ? getFocusRect(focusMain)
      : getFocusImageContentRect() || getFocusRect(focusMain);
    return setFocusMainTravelRect(currentRect);
  }

  function clearFocusMainTravel() {
    focusMain.classList.remove("is-main-traveling", "is-index-docked", "is-flight-active");
    focusMainDockedIndex = null;
    ["left", "top", "width", "height", "transform", "opacity", "filter", "pointerEvents", "zIndex"].forEach((name) => {
      focusMain.style[name] = "";
    });
    focusMain.style.removeProperty("--focus-flight-duration");
    focusMain.style.removeProperty("--focus-flight-x");
    focusMain.style.removeProperty("--focus-flight-y");
    focusMain.style.removeProperty("--focus-flight-scale");
    imageToggle.style.removeProperty("transform");
    imageToggle.style.removeProperty("transition");
  }

  function dockFocusMainToIndexCard(index, preparedRect = null) {
    const card = getFocusIndexCardByIndex(index);
    const rect = preparedRect || positionFocusIndexGalleryOnActive(index) || getFocusIndexCardRect(card);
    if (!rect) return null;
    setFocusMainTravelRect(rect);
    focusMain.classList.add("is-index-docked");
    focusMainDockedIndex = index;
    card?.classList.add("is-index-hidden", "is-index-anchor");
    return rect;
  }

  function releaseFocusMainToIndexCard(index) {
    const card = getFocusIndexCardByIndex(index);
    if (!card) {
      clearFocusMainTravel();
      return;
    }
    let released = false;
    const release = () => {
      if (released || !shell.classList.contains("is-index") || shell.classList.contains("is-index-closing")) return;
      released = true;
      clearFocusMainTravel();
    };
    card.classList.remove("is-index-hidden", "is-index-anchor");
    requestAnimationFrame(() => requestAnimationFrame(release));
    window.setTimeout(release, 80);
  }

  function animateFocusMainToRect(fromRect, toRect, options = {}) {
    if (!fromRect || !toRect) return null;
    const isMobile = window.innerWidth <= 768;
    const duration = options.duration || (isMobile ? 720 : 860);
    const delay = options.delay || 0;
    const sourceRatio = fromRect.width / Math.max(1, fromRect.height);
    const finalRect = normalizeFocusTravelRect(toRect, sourceRatio) || toRect;
    const dx = finalRect.left - fromRect.left;
    const dy = finalRect.top - fromRect.top;
    const scale = Math.min(finalRect.width / Math.max(1, fromRect.width), finalRect.height / Math.max(1, fromRect.height));
    let startTimer = 0;
    let finishTimer = 0;
    let cancelled = false;
    let cleaned = false;

    setFocusMainTravelRect(fromRect);
    focusMain.classList.remove("is-flight-active");
    imageToggle.style.setProperty("transition", "none", "important");
    imageToggle.style.setProperty("transform", "translate3d(0, 0, 0) scale(1)", "important");
    imageToggle.offsetHeight;

    const clearFlightVisual = () => {
      imageToggle.style.removeProperty("transform");
      imageToggle.style.removeProperty("transition");
    };

    const controller = {
      focusMain: true,
      cancel(cancelOptions = {}) {
        cancelled = true;
        window.clearTimeout(startTimer);
        window.clearTimeout(finishTimer);
        const currentRect = cancelOptions.keepMain ? getFocusRect(imageToggle) || getFocusRect(focusMain) : null;
        imageToggle.removeEventListener("transitionend", handleTransitionEnd);
        focusMain.classList.remove("is-flight-active");
        clearFlightVisual();
        if (cancelOptions.keepMain) setFocusMainTravelRect(currentRect);
        else clearFocusMainTravel();
      }
    };
    focusIndexAnimations.push(controller);

    const cleanup = () => {
      if (cleaned || cancelled) return;
      cleaned = true;
      window.clearTimeout(startTimer);
      window.clearTimeout(finishTimer);
      imageToggle.removeEventListener("transitionend", handleTransitionEnd);
      focusMain.classList.remove("is-flight-active");
      setFocusMainTravelRect(finalRect);
      clearFlightVisual();
      focusIndexAnimations = focusIndexAnimations.filter((item) => item !== controller);
      options.onArrive?.(finalRect);
    };

    const handleTransitionEnd = (event) => {
      if (event.target === imageToggle && event.propertyName === "transform") cleanup();
    };

    const start = () => {
      if (cancelled || cleaned) return;
      imageToggle.addEventListener("transitionend", handleTransitionEnd);
      focusMain.classList.add("is-flight-active");
      imageToggle.style.setProperty("transition", `transform ${duration}ms cubic-bezier(.16, .92, .18, 1)`, "important");
      imageToggle.offsetHeight;
      imageToggle.style.setProperty("transform", `translate3d(${dx}px, ${dy}px, 0) scale(${scale})`, "important");
      finishTimer = window.setTimeout(cleanup, duration + 260);
    };

    if (delay > 0) startTimer = window.setTimeout(start, delay);
    else start();
    return controller;
  }

  function setFocusIndexGalleryActive(index) {
    if (!indexGallery) return;
    indexGallery.querySelectorAll(".focus-index-card").forEach((card, cardIndex) => {
      const active = cardIndex === index;
      card.classList.toggle("is-active", active);
      card.setAttribute("aria-current", active ? "true" : "false");
    });
  }

  function lockFocusIndexCardRatio(index) {
    const card = getFocusIndexCardByIndex(index);
    if (!card) return;
    rememberFocusPhotoRatio(index, image);
    const ratio = getFocusPhotoRatio(index);
    if (!ratio) return;
    card.style.setProperty("--focus-index-ratio", ratio.toFixed(5));
  }

  function positionFocusIndexGalleryOnActive(activeIndex) {
    if (!indexGallery) return null;
    const card = getFocusIndexCardByIndex(activeIndex);
    if (!card) return null;
    lockFocusIndexCardRatio(activeIndex);
    indexGallery.scrollLeft = 0;
    const align = () => {
      const galleryRect = indexGallery.getBoundingClientRect();
      const cardRect = card.getBoundingClientRect();
      const targetTop = indexGallery.scrollTop + cardRect.top - galleryRect.top + cardRect.height / 2 - galleryRect.height / 2;
      const maxTop = Math.max(0, indexGallery.scrollHeight - indexGallery.clientHeight);
      indexGallery.scrollTop = Math.max(0, Math.min(targetTop, maxTop));
    };
    align();
    indexGallery.offsetHeight;
    align();
    return getFocusIndexCardRect(card);
  }

  function selectFocusIndexCard(index) {
    if (!shell.classList.contains("is-index")) return;
    closeFocusIndex(index, { restoreNotes: returnToNotesAfterIndex });
  }

  function openFocusIndex(activeIndex) {
    if (!indexEnabled || !indexGallery) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      returnToNotesAfterIndex = shell.classList.contains("is-notes");
      setNotesOpen(false);
      setFocusIndexGalleryActive(activeIndex);
      indexGallery.setAttribute("aria-hidden", "false");
      shell.classList.add("is-index");
      positionFocusIndexGalleryOnActive(activeIndex);
      dockFocusMainToIndexCard(activeIndex);
      return;
    }
    const interruptedNotesReturn = returnToNotesAfterIndex && shell.classList.contains("is-index-closing");
    const mainRect = freezeFocusMainAtCurrentRect() || getFocusImageContentRect();
    cancelFocusIndexAnimations({ keepFocusMain: true });
    returnToNotesAfterIndex = interruptedNotesReturn || shell.classList.contains("is-notes");
    setNotesOpen(false);
    setFocusIndexGalleryActive(activeIndex);
    indexGallery.setAttribute("aria-hidden", "false");
    positionFocusIndexGalleryOnActive(activeIndex);
    shell.classList.add("is-index", "is-index-opening");
    positionFocusIndexGalleryOnActive(activeIndex);
    setIndexTransitioning(1320);
    focusSyncHoldUntil = Date.now() + 1500;
    window.clearTimeout(focusIndexStartTimer);
    let didStartEnter = false;
    const startIndexEnter = () => {
      if (didStartEnter || !shell.classList.contains("is-index-opening")) return;
      didStartEnter = true;
      window.clearTimeout(focusIndexStartTimer);
      const activeTargetRect = positionFocusIndexGalleryOnActive(activeIndex);
      playFocusIndexGalleryEnter(activeIndex, mainRect, activeTargetRect);
    };
    focusIndexStartTimer = window.setTimeout(startIndexEnter, 80);
    requestAnimationFrame(() => {
      positionFocusIndexGalleryOnActive(activeIndex);
      requestAnimationFrame(startIndexEnter);
    });
  }

  function playFocusIndexGalleryEnter(activeIndex, mainRect, preparedTargetRect = null) {
    const cards = [...indexGallery.querySelectorAll(".focus-index-card")];
    const activeCard = getFocusIndexCardByIndex(activeIndex);
    const activeTargetRect = preparedTargetRect || positionFocusIndexGalleryOnActive(activeIndex) || getFocusIndexCardRect(activeCard);
    const isMobile = window.innerWidth <= 768;
    if (activeCard && mainRect && activeTargetRect) {
      activeCard.classList.add("is-index-hidden", "is-index-anchor");
      animateFocusMainToRect(mainRect, activeTargetRect, {
        duration: isMobile ? 780 : 980,
        onArrive: (finalRect) => {
          dockFocusMainToIndexCard(activeIndex, finalRect || activeTargetRect);
          releaseFocusMainToIndexCard(activeIndex);
          shell.classList.remove("is-index-opening");
        }
      });
    } else {
      clearFocusMainTravel();
      shell.classList.remove("is-index-opening");
    }

    cards.forEach((card, visualIndex) => {
      if (visualIndex === activeIndex) return;
      const rect = getFocusIndexCardRect(card);
      if (!rect || !mainRect) return;
      const orderDistance = Math.abs(visualIndex - activeIndex);
      const drift = Math.max(-180, Math.min(180, (visualIndex - activeIndex) * (isMobile ? 8 : 11)));
      const fromCenterX = mainRect.left + mainRect.width / 2 + drift;
      const fromCenterY = mainRect.top + mainRect.height / 2 + (visualIndex % 5 - 2) * (isMobile ? 10 : 16);
      const toCenterX = rect.left + rect.width / 2;
      const toCenterY = rect.top + rect.height / 2;
      const dx = fromCenterX - toCenterX;
      const dy = fromCenterY - toCenterY;
      const scale = Math.max(.36, Math.min(3.2, Math.min(mainRect.width / rect.width, mainRect.height / rect.height) * .72));
      const delay = Math.min(isMobile ? 230 : 320, 58 + orderDistance * (isMobile ? 8 : 11) + (visualIndex % 7) * 13);
      const duration = Math.min(isMobile ? 980 : 1180, (isMobile ? 560 : 640) + Math.hypot(dx, dy) * .18);
      const animation = card.animate([
        {
          transform: `translate(${dx}px, ${dy}px) scale(${scale})`,
          opacity: 0,
          filter: `blur(${Math.min(12, 4 + orderDistance * .25)}px) saturate(.78)`
        },
        {
          transform: "translate(0, 0) scale(1)",
          opacity: 1,
          filter: "blur(0) saturate(1)"
        }
      ], {
        duration,
        delay,
        easing: "cubic-bezier(.18, .92, .2, 1)",
        fill: "both"
      });
      focusIndexAnimations.push(animation);
      animation.finished.then(() => {
        focusIndexAnimations = focusIndexAnimations.filter((item) => item !== animation);
      }).catch(() => {});
    });

    window.setTimeout(() => shell.classList.remove("is-index-opening"), isMobile ? 1220 : 1400);
  }

  function closeFocusIndex(index, options = {}) {
    const targetIndex = Math.max(0, Math.min(index, photos.length - 1));
    if (!indexEnabled || !indexGallery || !shell.classList.contains("is-index")) return;
    setFocusManualSelection(targetIndex, 1800);
    const sourceCard = getFocusIndexCardByIndex(targetIndex);
    const sourceImage = sourceCard?.querySelector("img");
    let sourceRect = targetIndex === focusMainDockedIndex ? freezeFocusMainAtCurrentRect() : getFocusIndexCardRect(sourceCard);
    rememberFocusPhotoRatio(targetIndex, sourceImage);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setFocus(targetIndex, true, { instant: true });
      finishFocusIndexClose(targetIndex, options);
      clearFocusMainTravel();
      return;
    }

    cancelFocusIndexAnimations({ keepFocusMain: true });
    sourceRect = sourceRect || freezeFocusMainAtCurrentRect() || getFocusIndexCardRect(sourceCard);
    sourceCard?.classList.add("is-index-hidden", "is-index-anchor");
    setFocusIndexGalleryActive(targetIndex);
    shell.classList.add("is-index-closing", "is-index-exiting");
    setIndexTransitioning(1260);
    focusSyncHoldUntil = Date.now() + 1500;
    setFocus(targetIndex, true, { instant: true });
    setFocusMainTravelRect(sourceRect);
    if (options.restoreNotes) updateNotesLayout();
    const targetRect = getFocusImageContentRectForPhoto(photos[targetIndex], targetIndex, {
      notes: options.restoreNotes,
      sourceRect: sourceRect
    }) || getFocusMainTargetRect({ notes: options.restoreNotes }) || getFocusRect(imageToggle);

    if (!sourceRect || !targetRect) {
      finishFocusIndexClose(targetIndex, options);
      clearFocusMainTravel();
      return;
    }

    playFocusIndexGalleryExit(targetIndex, sourceRect);
    animateFocusMainToRect(sourceRect, targetRect, {
      duration: window.innerWidth <= 768 ? 820 : 1040,
      onArrive: () => {
        finishFocusIndexClose(targetIndex, options);
        requestAnimationFrame(clearFocusMainTravel);
      }
    });
  }

  function playFocusIndexGalleryExit(targetIndex, sourceRect) {
    const cards = [...indexGallery.querySelectorAll(".focus-index-card")];
    const isMobile = window.innerWidth <= 768;
    cards.forEach((card, visualIndex) => {
      if (visualIndex === targetIndex) return;
      const rect = getFocusIndexCardRect(card);
      if (!rect || !sourceRect) return;
      const orderDistance = Math.abs(visualIndex - targetIndex);
      const fromCenterX = rect.left + rect.width / 2;
      const fromCenterY = rect.top + rect.height / 2;
      const toCenterX = sourceRect.left + sourceRect.width / 2 + (visualIndex - targetIndex) * (isMobile ? 5 : 8);
      const toCenterY = sourceRect.top + sourceRect.height / 2 + (visualIndex % 5 - 2) * (isMobile ? 8 : 12);
      const dx = toCenterX - fromCenterX;
      const dy = toCenterY - fromCenterY;
      const delay = Math.min(isMobile ? 170 : 230, 18 + orderDistance * (isMobile ? 5 : 7) + (visualIndex % 6) * 9);
      const duration = Math.min(isMobile ? 760 : 900, (isMobile ? 420 : 500) + Math.hypot(dx, dy) * .13);
      const animation = card.animate([
        {
          transform: "translate(0, 0) scale(1)",
          opacity: 1,
          filter: "blur(0) saturate(1)"
        },
        {
          transform: `translate(${dx}px, ${dy}px) scale(.68)`,
          opacity: 0,
          filter: `blur(${Math.min(12, 4 + orderDistance * .18)}px) saturate(.78)`
        }
      ], {
        duration,
        delay,
        easing: "cubic-bezier(.2, .78, .22, 1)",
        fill: "forwards"
      });
      focusIndexAnimations.push(animation);
      animation.finished.then(() => {
        focusIndexAnimations = focusIndexAnimations.filter((item) => item !== animation);
      }).catch(() => {});
    });
  }

  function finishFocusIndexClose(index, options = {}) {
    const activeCard = getFocusIndexCardByIndex(index);
    window.clearTimeout(focusIndexHandoffTimer);
    window.clearTimeout(focusIndexHiddenCardTimer);
    window.clearTimeout(focusIndexStartTimer);
    window.clearTimeout(focusIndexMainReleaseTimer);
    shell.classList.add("is-index-handoff");
    if (options.restoreNotes) setNotesOpen(true);
    shell.classList.remove("is-index", "is-index-opening", "is-index-closing", "is-index-exiting");
    indexGallery?.setAttribute("aria-hidden", "true");
    indexGallery?.querySelectorAll(".focus-index-card").forEach((card) => {
      if (card !== activeCard) card.classList.remove("is-index-hidden", "is-index-anchor");
    });
    scrollToFocusIndex(index, false);
    returnToNotesAfterIndex = false;
    const restoreDelay = window.innerWidth <= 768 ? 940 : 900;
    focusIndexHiddenCardTimer = window.setTimeout(() => {
      activeCard?.classList.remove("is-index-hidden", "is-index-anchor");
    }, restoreDelay);
    const releaseMainAfterClose = () => {
      if (!shell.classList.contains("is-index")) clearFocusMainTravel();
    };
    requestAnimationFrame(() => requestAnimationFrame(releaseMainAfterClose));
    focusIndexMainReleaseTimer = window.setTimeout(releaseMainAfterClose, 180);
    focusIndexHandoffTimer = window.setTimeout(() => {
      shell.classList.remove("is-index-handoff");
    }, 360);
  }

  function createFocusIndexTravelLayer(photo, rect, mode = "enter") {
    if (!photo || !rect || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return null;
    const layer = document.createElement("img");
    layer.className = `focus-index-travel-layer is-${mode}`;
    layer.src = photo.full || photo.thumb;
    layer.alt = "";
    layer.setAttribute("aria-hidden", "true");
    layer.style.left = `${rect.left}px`;
    layer.style.top = `${rect.top}px`;
    layer.style.width = `${rect.width}px`;
    layer.style.height = `${rect.height}px`;
    layer.style.transform = "translate3d(0, 0, 0) scaleX(1) scaleY(1)";
    document.body.appendChild(layer);
    return layer;
  }

  function waitForFocusIndexTravelLayerPaint(layer) {
    if (!layer) return Promise.resolve();
    const imageReady = layer.complete
      ? Promise.resolve()
      : new Promise((resolve) => {
        let settled = false;
        const settle = () => {
          if (settled) return;
          settled = true;
          window.clearTimeout(timer);
          layer.removeEventListener("load", settle);
          layer.removeEventListener("error", settle);
          resolve();
        };
        const timer = window.setTimeout(settle, 220);
        layer.addEventListener("load", settle, { once: true });
        layer.addEventListener("error", settle, { once: true });
        layer.decode?.().then(settle).catch(settle);
      });
    return imageReady.then(() => new Promise((resolve) => {
      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        resolve();
      };
      const timer = window.setTimeout(done, 180);
      if (document.visibilityState === "hidden") return;
      requestAnimationFrame(() => requestAnimationFrame(done));
    }));
  }

  function releaseFocusIndexTravelLayer(layer, delay = 0) {
    if (!layer) return;
    window.setTimeout(() => {
      layer.classList.add("is-releasing");
      window.setTimeout(() => layer.remove(), 360);
    }, delay);
  }

  function waitForFocusIndexTransitionReady(ready, timeout = 320) {
    return new Promise((resolve) => {
      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        resolve();
      };
      const timer = window.setTimeout(done, timeout);
      Promise.resolve(ready).then(done).catch(done);
    });
  }

  function waitForFocusIndexLayoutFrame(timeout = 180) {
    return new Promise((resolve) => {
      let settled = false;
      const done = () => {
        if (settled) return;
        settled = true;
        window.clearTimeout(timer);
        resolve();
      };
      const timer = window.setTimeout(done, timeout);
      if (document.visibilityState === "hidden") return;
      requestAnimationFrame(() => requestAnimationFrame(done));
    });
  }

  function animateFocusIndexTravelLayer(layer, fromRect, toRect, options = {}) {
    if (!layer || !fromRect || !toRect) return null;
    const isMobile = window.innerWidth <= 768;
    const duration = options.duration || (isMobile ? 860 : 980);
    const delay = options.delay || 0;
    const holdDelay = Math.max(0, Number(options.holdDelay || 0));
    const dx = toRect.left - fromRect.left;
    const dy = toRect.top - fromRect.top;
    const scaleX = toRect.width / Math.max(1, fromRect.width);
    const scaleY = toRect.height / Math.max(1, fromRect.height);
    let frame = 0;
    let releaseTimer = 0;
    let finishTimer = 0;
    let releaseFallbackTimer = 0;
    let cleaned = false;
    let cancelled = false;
    let released = false;
    const startedAt = performance.now() + delay;
    const ease = (t) => 1 - Math.pow(1 - t, 4);

    const applyFrame = (amount) => {
      const eased = ease(amount);
      const nextX = dx * eased;
      const nextY = dy * eased;
      const nextScaleX = 1 + (scaleX - 1) * eased;
      const nextScaleY = 1 + (scaleY - 1) * eased;
      layer.style.transform = `translate3d(${nextX}px, ${nextY}px, 0) scaleX(${nextScaleX}) scaleY(${nextScaleY})`;
    };

    const controller = {
      layer,
      cancel(options = {}) {
        cancelled = true;
        window.cancelAnimationFrame(frame);
        window.clearTimeout(releaseTimer);
        window.clearTimeout(releaseFallbackTimer);
        window.clearTimeout(finishTimer);
        if (options.keepLayer) freezeFocusIndexTravelLayer(layer);
        else layer.remove();
      }
    };
    focusIndexAnimations.push(controller);

    const releaseLayer = () => {
      if (released) return;
      released = true;
      window.clearTimeout(releaseTimer);
      window.clearTimeout(releaseFallbackTimer);
      window.clearTimeout(finishTimer);
      focusIndexAnimations = focusIndexAnimations.filter((item) => item !== controller);
      if (options.release === false) return;
      releaseFocusIndexTravelLayer(layer, options.releaseDelay || 0);
    };

    const scheduleReleaseLayer = () => {
      if (cancelled || released) return;
      if (holdDelay > 0) releaseTimer = window.setTimeout(releaseLayer, holdDelay);
      else releaseLayer();
    };

    const settleFocusIndexTravelLayer = () => {
      const getFinalRect = typeof options.getFinalRect === "function" ? options.getFinalRect : null;
      const finalRect = getFinalRect?.() || toRect;
      if (!finalRect) return;
      const currentRect = freezeFocusIndexTravelLayer(layer) || finalRect;
      const settleDuration = window.innerWidth > 768 ? 150 : 72;
      if (Math.abs(currentRect.left - finalRect.left) < .5
        && Math.abs(currentRect.top - finalRect.top) < .5
        && Math.abs(currentRect.width - finalRect.width) < .5
        && Math.abs(currentRect.height - finalRect.height) < .5) return;
      animateFocusIndexTravelLayer(layer, currentRect, finalRect, {
        duration: settleDuration,
        holdDelay: 0,
        release: false
      });
    };

    const releaseAfterDestinationPaint = () => {
      const fallbackDelay = Math.max(760, holdDelay + (options.readyTimeout || 420) + (window.innerWidth > 768 ? 560 : 360));
      releaseFallbackTimer = window.setTimeout(releaseLayer, fallbackDelay);
      waitForFocusIndexTransitionReady(options.ready, options.readyTimeout || 420)
        .then(() => waitForFocusIndexLayoutFrame())
        .then(() => waitForFocusIndexTravelLayerPaint(layer))
        .then(settleFocusIndexTravelLayer)
        .catch(() => {})
        .then(scheduleReleaseLayer);
    };

    const cleanup = () => {
      if (cleaned || cancelled) return;
      cleaned = true;
      applyFrame(1);
      options.onArrive?.(layer);
      releaseAfterDestinationPaint();
    };

    const step = (now) => {
      if (cancelled) return;
      if (now < startedAt) {
        frame = requestAnimationFrame(step);
        return;
      }
      const progress = Math.min(1, (now - startedAt) / duration);
      applyFrame(progress);
      if (progress < 1) frame = requestAnimationFrame(step);
      else cleanup();
    };

    applyFrame(0);
    finishTimer = window.setTimeout(cleanup, delay + duration + 260);
    frame = requestAnimationFrame(step);
    return controller;
  }

  function cancelFocusIndexAnimations(options = {}) {
    focusIndexAnimations.forEach((animation) => {
      if (animation?.focusMain) animation.cancel({ keepMain: Boolean(options.keepFocusMain) });
      else if (animation?.layer && animation.layer === options.keepTravelLayer) animation.cancel({ keepLayer: true });
      else animation.cancel();
    });
    focusIndexAnimations = [];
    window.clearTimeout(focusIndexHandoffTimer);
    window.clearTimeout(focusIndexHiddenCardTimer);
    window.clearTimeout(focusIndexStartTimer);
    window.clearTimeout(focusIndexMainReleaseTimer);
    shell.classList.remove("is-index-opening", "is-index-closing", "is-index-exiting", "is-index-handoff");
    document.querySelectorAll(".focus-index-travel-layer").forEach((layer) => {
      if (layer !== options.keepTravelLayer) layer.remove();
    });
    indexGallery?.querySelectorAll(".focus-index-card.is-index-anchor, .focus-index-card.is-index-hidden").forEach((card) => {
      card.classList.remove("is-index-anchor", "is-index-hidden");
    });
  }
  function getFocusThumbByIndex(index) {
    return [...thumbs.querySelectorAll(".focus-thumb")].find((thumb) => Number(thumb.dataset.index) === index + 1) || null;
  }

  function setIndexTransitioning(duration = 760) {
    shell.classList.add("is-index-transitioning");
    window.clearTimeout(focusIndexTransitionTimer);
    focusIndexTransitionTimer = window.setTimeout(() => {
      shell.classList.remove("is-index-transitioning");
    }, duration);
  }

  function getWrappedFocusIndex(index) {
    if (!photos.length) return 0;
    return (index + photos.length) % photos.length;
  }

  function getBoundedFocusSwipeIndex(index) {
    if (!photos.length || index < 0 || index >= photos.length) return null;
    return index;
  }

  function getFocusMainSwipeAxis() {
    return window.innerWidth <= 768 ? "x" : "y";
  }

  function getFocusMainSwipeExtent(axis = getFocusMainSwipeAxis()) {
    const rect = getFocusRect(imageToggle) || getFocusRect(focusMain);
    const width = imageToggle.clientWidth || focusMain.clientWidth || rect?.width || window.innerWidth || 1;
    const height = imageToggle.clientHeight || focusMain.clientHeight || rect?.height || window.innerHeight || 1;
    return Math.max(1, axis === "y" ? height : width);
  }

  function getFocusMainSwipeTravelMetrics(fromIndex, targetIndex, axis, edge = false) {
    const width = Math.max(1, imageToggle.clientWidth || focusMain.clientWidth || window.innerWidth || 1);
    const height = Math.max(1, imageToggle.clientHeight || focusMain.clientHeight || window.innerHeight || 1);
    const box = { left: 0, top: 0, width, height };
    const containerExtent = axis === "y" ? height : width;
    if (edge) {
      return {
        extent: containerExtent,
        travel: Math.min(138, Math.max(54, containerExtent * 0.2))
      };
    }
    const currentRect = getContentRectWithin(box, getFocusPhotoRatio(fromIndex, box)) || box;
    const targetRect = getContentRectWithin(box, getFocusPhotoRatio(targetIndex, box)) || box;
    const currentExtent = axis === "y" ? currentRect.height : currentRect.width;
    const targetExtent = axis === "y" ? targetRect.height : targetRect.width;
    const gap = Math.min(96, Math.max(26, Math.min(currentExtent, targetExtent) * 0.18));
    const visibleTravel = currentExtent / 2 + targetExtent / 2 + gap;
    const minimumTravel = containerExtent * (axis === "y" ? 0.7 : 0.72);
    return {
      extent: containerExtent,
      travel: Math.min(containerExtent + gap, Math.max(minimumTravel, visibleTravel))
    };
  }

  function getFocusMainSwipeRailPosition(index) {
    const thumb = thumbs.querySelector(`.focus-thumb[data-index="${index + 1}"]`);
    if (!thumb) return null;
    const rect = thumb.getBoundingClientRect();
    if (window.innerWidth <= 768) {
      updateMobileFocusRail();
      const current = thumbs.scrollLeft;
      const target = current + rect.left + rect.width / 2 - window.innerWidth / 2;
      return {
        axis: "x",
        current,
        target: Math.max(0, Math.min(target, mobileRailMaxOffset))
      };
    }
    const current = window.scrollY || document.documentElement.scrollTop || 0;
    const maxTop = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const target = current + rect.top + rect.height / 2 - window.innerHeight / 2;
    return {
      axis: "y",
      current,
      target: Math.max(0, Math.min(target, maxTop))
    };
  }

  function configureFocusMainSwipeRail(targetIndex, edge = false) {
    focusMainSwipe.railReady = false;
    focusMainSwipe.railAxis = "";
    focusMainSwipe.railFrom = 0;
    focusMainSwipe.railTo = 0;
    if (edge) return;
    const rail = getFocusMainSwipeRailPosition(targetIndex);
    if (!rail) return;
    focusMainSwipe.railReady = true;
    focusMainSwipe.railAxis = rail.axis;
    focusMainSwipe.railFrom = rail.current;
    focusMainSwipe.railTo = rail.target;
  }

  function getFocusMainSwipeProgress(value, start = 0, end = 1) {
    if (end <= start) return value >= end ? 1 : 0;
    const normalized = Math.max(0, Math.min(1, (value - start) / (end - start)));
    return normalized * normalized * (3 - 2 * normalized);
  }

  function updateFocusMainSwipeRail(progress) {
    if (!focusMainSwipe.railReady || focusMainSwipe.edge) return;
    const follow = getFocusMainSwipeProgress(progress, 0.06, 0.94);
    const position = focusMainSwipe.railFrom + (focusMainSwipe.railTo - focusMainSwipe.railFrom) * follow;
    if (focusMainSwipe.railAxis === "x") {
      thumbs.scrollLeft = Math.max(0, Math.min(position, mobileRailMaxOffset));
      return;
    }
    if (focusMainSwipe.railAxis === "y") {
      window.scrollTo({ top: position, left: 0, behavior: "auto" });
    }
  }

  function ensureFocusMainSwipeLayer() {
    let layer = imageToggle.querySelector(".focus-swipe-layer");
    if (!layer) {
      layer = document.createElement("span");
      layer.className = "focus-swipe-layer";
      layer.setAttribute("aria-hidden", "true");
      layer.innerHTML = `
        <img class="focus-swipe-image focus-swipe-image--current" alt="" decoding="async">
        <img class="focus-swipe-image focus-swipe-image--next" alt="" decoding="async">
      `;
      imageToggle.appendChild(layer);
    }
    return {
      layer,
      current: layer.querySelector(".focus-swipe-image--current"),
      next: layer.querySelector(".focus-swipe-image--next")
    };
  }

  function setFocusMainSwipeFrame(offset, direction = focusMainSwipe.direction) {
    if (!direction) return;
    const axis = focusMainSwipe.axis || getFocusMainSwipeAxis();
    const isEdge = Boolean(focusMainSwipe.edge);
    const travel = Math.max(1, focusMainSwipe.travel || focusMainSwipe.extent || getFocusMainSwipeExtent(axis));
    const clamped = Math.max(-travel, Math.min(travel, offset));
    const nextBase = direction > 0 ? travel : -travel;
    const progress = Math.min(1, Math.abs(clamped) / Math.max(1, travel));
    const currentDepth = getFocusMainSwipeProgress(progress, 0.02, 1);
    const currentFade = getFocusMainSwipeProgress(progress, 0.18, 0.98);
    const nextFade = getFocusMainSwipeProgress(progress, 0.05, 0.8);
    const nextDepth = getFocusMainSwipeProgress(progress, 0, 0.96);
    const currentOpacity = isEdge ? 1 : Math.max(0, 1 - currentFade);
    const nextOpacity = isEdge ? 0 : nextFade;
    const currentScale = isEdge ? Math.max(0.975, 1 - progress * 0.025) : 1 - currentDepth * 0.06;
    const nextScale = isEdge ? 1 : 0.93 + nextDepth * 0.07;
    const currentX = axis === "x" ? clamped : 0;
    const currentY = axis === "y" ? clamped : 0;
    const nextPosition = nextBase + clamped;
    const nextX = axis === "x" ? nextPosition : 0;
    const nextY = axis === "y" ? nextPosition : 0;
    focusMainSwipe.offset = clamped;
    focusMainSwipe.progress = progress;
    shell.style.setProperty("--focus-swipe-current-x", `${currentX.toFixed(2)}px`);
    shell.style.setProperty("--focus-swipe-current-y", `${currentY.toFixed(2)}px`);
    shell.style.setProperty("--focus-swipe-next-x", `${nextX.toFixed(2)}px`);
    shell.style.setProperty("--focus-swipe-next-y", `${nextY.toFixed(2)}px`);
    shell.style.setProperty("--focus-swipe-progress", progress.toFixed(3));
    shell.style.setProperty("--focus-swipe-current-opacity", currentOpacity.toFixed(3));
    shell.style.setProperty("--focus-swipe-next-opacity", nextOpacity.toFixed(3));
    shell.style.setProperty("--focus-swipe-current-scale", currentScale.toFixed(3));
    shell.style.setProperty("--focus-swipe-next-scale", nextScale.toFixed(3));
    const notesTimelineProgress = focusMainSwipe.chained ? Math.max(progress, 0.76) : progress;
    const notesTextProgress = getFocusMainSwipeProgress(notesTimelineProgress, 0.1, 0.74);
    const notesLineProgress = getFocusMainSwipeProgress(notesTimelineProgress, 0.18, 0.86);
    const notesShift = (direction > 0 ? -1 : 1) * notesTextProgress * 7;
    shell.style.setProperty("--focus-swipe-notes-opacity", (1 - notesTextProgress).toFixed(3));
    shell.style.setProperty("--focus-swipe-line-opacity", (1 - notesLineProgress * 0.86).toFixed(3));
    shell.style.setProperty("--focus-swipe-notes-x", `${(axis === "x" ? notesShift : 0).toFixed(2)}px`);
    shell.style.setProperty("--focus-swipe-notes-y", `${(axis === "y" ? notesShift : 0).toFixed(2)}px`);
    updateFocusMainSwipeRail(progress);
  }

  function cancelFocusMainSwipeAnimation() {
    if (focusMainSwipe.frame) cancelAnimationFrame(focusMainSwipe.frame);
    focusMainSwipe.frame = 0;
    focusMainSwipe.animating = false;
    shell.classList.remove("is-main-swipe-animating");
  }

  function clearFocusQueuedSwipe() {
    focusQueuedSwipe = null;
  }

  function queueFocusMainSwipe(direction, velocity = 0) {
    if (!direction || focusMainSwipe.edge) return false;
    const baseIndex = focusMainSwipe.active
      ? focusMainSwipe.targetIndex
      : Number(shell.dataset.activeIndex || 0);
    if (focusQueuedSwipe) {
      if (focusQueuedSwipe.direction !== direction || focusQueuedSwipe.steps >= 3) return false;
      const queuedTarget = baseIndex + direction * (focusQueuedSwipe.steps + 1);
      if (getBoundedFocusSwipeIndex(queuedTarget) === null) return false;
      focusQueuedSwipe.steps += 1;
      focusQueuedSwipe.velocity = Math.max(
        focusQueuedSwipe.velocity,
        Math.max(0.42, Math.min(1.5, Math.abs(velocity || 0)))
      );
      return true;
    }
    if (getBoundedFocusSwipeIndex(baseIndex + direction) === null) return false;
    focusQueuedSwipe = {
      direction,
      velocity: Math.max(0.42, Math.min(1.5, Math.abs(velocity || 0))),
      steps: 1
    };
    return true;
  }

  function startQueuedFocusMainSwipe(completedIndex) {
    const queued = focusQueuedSwipe;
    if (!queued || getBoundedFocusSwipeIndex(completedIndex + queued.direction) === null) {
      clearFocusQueuedSwipe();
      return false;
    }
    focusQueuedSwipe = queued.steps > 1
      ? { ...queued, steps: queued.steps - 1 }
      : null;
    clearFocusMainSwipe();
    if (!configureFocusMainSwipe(queued.direction)) return false;
    focusMainSwipe.chained = true;
    focusMainTouchVelocityX = (queued.direction > 0 ? -1 : 1) * queued.velocity;
    setFocusMainSwipeFrame(0, queued.direction);
    const targetOffset = (queued.direction > 0 ? -1 : 1) * focusMainSwipe.travel;
    startFocusMainSwipeAnimation(targetOffset, true);
    return true;
  }

  function interruptFocusMainSwipeForNewGesture() {
    focusMainSwipeClearSequence += 1;
    if (focusMainSwipe.active && focusMainSwipe.animating && !focusMainSwipe.handoffPending) {
      const continuationDirection = focusMainSwipe.commit ? focusMainSwipe.direction : 0;
      cancelFocusMainSwipeAnimation();
      focusMainSwipe.commit = false;
      shell.classList.add("is-main-swiping");
      return {
        offset: focusMainSwipe.offset || 0,
        continuationDirection
      };
    }
    if (focusMainSwipe.active
      && !focusMainSwipe.handoffPending
      && !shell.classList.contains("is-main-swipe-handoff")
      && !shell.classList.contains("is-main-swipe-fading")
      && !shell.classList.contains("is-main-swipe-returning")) {
      return {
        offset: focusMainSwipe.offset || 0,
        continuationDirection: 0
      };
    }
    clearFocusQueuedSwipe();
    clearFocusMainSwipe();
    window.clearTimeout(focusSwipeSyncTimer);
    focusSwipeSyncTimer = 0;
    focusMainSwipeLockUntil = 0;
    focusSyncHoldUntil = 0;
    return { offset: 0, continuationDirection: 0 };
  }

  function isFocusMainSwipeBusy() {
    return focusMainSwipe.active
      || focusMainSwipe.animating
      || focusMainPointerActive
      || focusMainTouchMode === "horizontal"
      || shell.classList.contains("is-main-swipe-handoff")
      || shell.classList.contains("is-main-swipe-fading")
      || shell.classList.contains("is-main-swipe-returning");
  }

  function clearFocusMainSwipe(options = {}) {
    cancelFocusMainSwipeAnimation();
    focusMainSwipe.active = false;
    focusMainSwipe.offset = 0;
    focusMainSwipe.progress = 0;
    focusMainSwipe.direction = 0;
    focusMainSwipe.axis = getFocusMainSwipeAxis();
    focusMainSwipe.fromIndex = Number(shell.dataset.activeIndex || 0);
    focusMainSwipe.targetIndex = focusMainSwipe.fromIndex;
    focusMainSwipe.edge = false;
    focusMainSwipe.commit = false;
    focusMainSwipe.chained = false;
    focusMainSwipe.handoffPending = false;
    focusMainSwipe.railReady = false;
    focusMainSwipe.railAxis = "";
    shell.classList.remove("is-main-swiping", "is-main-swipe-animating", "is-main-swipe-edge");
    if (!options.keepHandoff) shell.classList.remove("is-main-swipe-handoff");
    if (!options.keepFade) shell.classList.remove("is-main-swipe-fading");
    if (!options.keepReturn) shell.classList.remove("is-main-swipe-returning");
    if (!options.keepFrame) {
      shell.style.removeProperty("--focus-swipe-current-x");
      shell.style.removeProperty("--focus-swipe-current-y");
      shell.style.removeProperty("--focus-swipe-next-x");
      shell.style.removeProperty("--focus-swipe-next-y");
      shell.style.removeProperty("--focus-swipe-progress");
      shell.style.removeProperty("--focus-swipe-current-opacity");
      shell.style.removeProperty("--focus-swipe-next-opacity");
      shell.style.removeProperty("--focus-swipe-current-scale");
      shell.style.removeProperty("--focus-swipe-next-scale");
      shell.style.removeProperty("--focus-swipe-notes-opacity");
      shell.style.removeProperty("--focus-swipe-line-opacity");
      shell.style.removeProperty("--focus-swipe-notes-x");
      shell.style.removeProperty("--focus-swipe-notes-y");
      imageToggle.querySelectorAll(".focus-swipe-layer img").forEach((swipeImage) => {
        swipeImage.removeAttribute("src");
        swipeImage.alt = "";
      });
    }
  }

  function finishCancelledFocusMainSwipe() {
    clearFocusQueuedSwipe();
    const clearRunId = ++focusMainSwipeClearSequence;
    if (focusMainSwipe.direction) setFocusMainSwipeFrame(0, focusMainSwipe.direction);
    shell.classList.add("is-main-swipe-returning");
    requestAnimationFrame(() => {
      if (clearRunId !== focusMainSwipeClearSequence) return;
      clearFocusMainSwipe({ keepFrame: true, keepReturn: true });
      window.setTimeout(() => {
        if (clearRunId !== focusMainSwipeClearSequence) return;
        clearFocusMainSwipe();
      }, 160);
    });
  }

  function configureFocusMainSwipe(direction) {
    if (!direction || photos.length < 2) return false;
    focusMainSwipeClearSequence += 1;
    const fromIndex = Number(shell.dataset.activeIndex || 0);
    const targetIndex = getBoundedFocusSwipeIndex(fromIndex + direction);
    const isEdgeSwipe = targetIndex === null;
    const photo = isEdgeSwipe ? null : photos[targetIndex];
    if (!isEdgeSwipe && !photo) return false;
    const { current, next } = ensureFocusMainSwipeLayer();
    shell.classList.remove("is-main-swipe-handoff", "is-main-swipe-fading", "is-main-swipe-returning", "is-main-swipe-edge");
    const currentSource = image.currentSrc || image.src || photos[fromIndex]?.full || "";
    current.src = currentSource;
    current.alt = image.alt || photos[fromIndex]?.alt || "";
    if (isEdgeSwipe) {
      next.removeAttribute("src");
      next.alt = "";
    } else {
      next.src = photo.full;
      next.alt = photo.alt || "";
      preloadFocusImage(photo.full);
    }
    focusMainSwipe.active = true;
    focusMainSwipe.axis = getFocusMainSwipeAxis();
    focusMainSwipe.direction = direction;
    focusMainSwipe.fromIndex = fromIndex;
    focusMainSwipe.targetIndex = isEdgeSwipe ? fromIndex : targetIndex;
    focusMainSwipe.edge = isEdgeSwipe;
    focusMainSwipe.chained = false;
    focusMainSwipe.handoffPending = false;
    const travelMetrics = getFocusMainSwipeTravelMetrics(fromIndex, focusMainSwipe.targetIndex, focusMainSwipe.axis, isEdgeSwipe);
    focusMainSwipe.extent = travelMetrics.extent;
    focusMainSwipe.travel = travelMetrics.travel;
    configureFocusMainSwipeRail(focusMainSwipe.targetIndex, isEdgeSwipe);
    shell.classList.add("is-main-swiping");
    shell.classList.toggle("is-main-swipe-edge", isEdgeSwipe);
    return true;
  }

  function updateFocusMainSwipeDrag(offset) {
    if (photos.length < 2) return;
    if (!offset) {
      if (focusMainSwipe.active && focusMainSwipe.direction) {
        setFocusMainSwipeFrame(0, focusMainSwipe.direction);
      }
      return;
    }
    const direction = offset < 0 ? 1 : -1;
    if (!focusMainSwipe.active || focusMainSwipe.direction !== direction) {
      if (!configureFocusMainSwipe(direction)) return;
    }
    const travel = focusMainSwipe.travel || focusMainSwipe.extent || getFocusMainSwipeExtent(focusMainSwipe.axis);
    const dragLimit = travel * 0.94;
    const edgeLimit = travel;
    const nextOffset = focusMainSwipe.edge
      ? Math.max(-edgeLimit, Math.min(edgeLimit, offset * 0.36))
      : Math.max(-dragLimit, Math.min(dragLimit, offset));
    setFocusMainSwipeFrame(nextOffset, direction);
  }

  function commitFocusMainSwipe(targetIndex) {
    const clearRunId = ++focusMainSwipeClearSequence;
    let didFinishClear = false;
    let handoffSafetyTimer = 0;
    const finishClear = () => {
      if (clearRunId !== focusMainSwipeClearSequence) return;
      if (didFinishClear) return;
      didFinishClear = true;
      window.clearTimeout(handoffSafetyTimer);
      if (startQueuedFocusMainSwipe(targetIndex)) return;
      shell.classList.add("is-main-swipe-handoff");
      requestAnimationFrame(() => {
        if (clearRunId !== focusMainSwipeClearSequence) return;
        clearFocusMainSwipe({ keepHandoff: true, keepFrame: true });
        requestAnimationFrame(() => {
          if (clearRunId !== focusMainSwipeClearSequence) return;
          shell.classList.remove("is-main-swipe-handoff");
          shell.classList.add("is-main-swipe-fading");
          handoffSafetyTimer = window.setTimeout(() => {
            if (clearRunId !== focusMainSwipeClearSequence) return;
            clearFocusMainSwipe();
          }, 420);
        });
      });
    };
    focusMainSwipe.handoffPending = true;
    setFocus(targetIndex, true, { instant: true, source: "swipe" });
    lockFocusRailAfterMainSwipe(targetIndex);
    waitForImageDecoded(image).then(finishClear);
    handoffSafetyTimer = window.setTimeout(() => {
      waitForImageDecoded(image, 1200).then(finishClear);
    }, 1800);
  }

  function startFocusMainSwipeAnimation(toOffset, commit = false) {
    if (!focusMainSwipe.active) return;
    cancelFocusMainSwipeAnimation();
    focusMainSwipe.animating = true;
    focusMainSwipe.startedAt = performance.now();
    focusMainSwipe.fromOffset = focusMainSwipe.offset || 0;
    focusMainSwipe.toOffset = toOffset;
    focusMainSwipe.commit = Boolean(commit);
    const distance = Math.abs(focusMainSwipe.toOffset - focusMainSwipe.fromOffset);
    if (distance < 0.5) {
      focusMainSwipe.animating = false;
      focusMainSwipe.frame = 0;
      if (focusMainSwipe.commit) commitFocusMainSwipe(focusMainSwipe.targetIndex);
      else clearFocusMainSwipe();
      return;
    }
    const velocity = Math.abs(focusMainTouchVelocityX || 0);
    const travel = Math.max(1, focusMainSwipe.travel || focusMainSwipe.extent || distance || 1);
    const remainingRatio = Math.max(0.08, Math.min(1, distance / travel));
    const velocityFactor = Math.min(1.6, velocity);
    const duration = commit
      ? Math.max(440, Math.min(620, (610 - velocityFactor * 72) * (0.74 + Math.sqrt(remainingRatio) * 0.26)))
      : Math.max(220, Math.min(420, (390 - velocityFactor * 46) * (0.68 + Math.sqrt(remainingRatio) * 0.32)));
    shell.classList.add("is-main-swipe-animating");
    const ease = (t) => {
      const smooth = t * t * (3 - 2 * t);
      const glide = 1 - Math.pow(1 - t, 2.35);
      const velocityBlend = Math.min(1, velocityFactor / 1.4);
      const glideWeight = 0.52 + velocityBlend * 0.18;
      return smooth * (1 - glideWeight) + glide * glideWeight;
    };
    const step = (now) => {
      const progress = Math.min(1, (now - focusMainSwipe.startedAt) / duration);
      const nextOffset = focusMainSwipe.fromOffset + (focusMainSwipe.toOffset - focusMainSwipe.fromOffset) * ease(progress);
      setFocusMainSwipeFrame(nextOffset);
      if (progress < 1 && focusMainSwipe.animating) {
        focusMainSwipe.frame = requestAnimationFrame(step);
        return;
      }
      focusMainSwipe.frame = 0;
      focusMainSwipe.animating = false;
      shell.classList.remove("is-main-swipe-animating");
      if (focusMainSwipe.commit) commitFocusMainSwipe(focusMainSwipe.targetIndex);
      else finishCancelledFocusMainSwipe();
    };
    focusMainSwipe.frame = requestAnimationFrame(step);
  }

  function finishFocusMainSwipe(queuedDirection = 0) {
    if (!focusMainSwipe.active || !focusMainSwipe.direction) {
      clearFocusMainSwipe();
      return;
    }
    const extent = focusMainSwipe.extent || getFocusMainSwipeExtent(focusMainSwipe.axis);
    const travel = focusMainSwipe.travel || extent;
    const offset = focusMainSwipe.offset || 0;
    const expectedSign = focusMainSwipe.direction > 0 ? -1 : 1;
    const projectedOffset = offset + focusMainTouchVelocityX * 140;
    const distanceMatches = Math.abs(offset) > extent * 0.13 && Math.sign(offset) === expectedSign;
    const projectedMatches = Math.abs(projectedOffset) > extent * 0.2 && Math.sign(projectedOffset) === expectedSign;
    const velocityMatches = Math.abs(focusMainTouchVelocityX) > 0.32 && Math.sign(focusMainTouchVelocityX) === expectedSign;
    const shouldCommit = !focusMainSwipe.edge && (distanceMatches || projectedMatches || velocityMatches);
    if (shouldCommit && queuedDirection === focusMainSwipe.direction) {
      queueFocusMainSwipe(queuedDirection, focusMainTouchVelocityX);
    }
    const targetOffset = shouldCommit ? (focusMainSwipe.direction > 0 ? -travel : travel) : 0;
    startFocusMainSwipeAnimation(targetOffset, shouldCommit);
  }

  function setNotesOpen(open, options = {}) {
    const isOpen = Boolean(open);
    const wasOpen = shell.classList.contains("is-notes");
    if (wasOpen === isOpen) {
      if (isOpen) updateNotesLayout();
      return;
    }
    if (isOpen) updateNotesLayout();
    window.clearTimeout(focusNotesTransitionTimer);
    shell.classList.add("is-notes-transitioning");
    shell.classList.toggle("is-notes", isOpen);
    document.body.classList.toggle("focus-notes-open", isOpen);
    imageToggle.setAttribute("aria-expanded", String(isOpen));
    imageToggle.setAttribute("aria-label", isOpen ? "Close notes" : "Open notes");
    if (navToggle) {
      navToggle.setAttribute("aria-label", isOpen ? "Close notes" : document.body.classList.contains("nav-open") ? "Close navigation" : "Open navigation");
    }
    const transitionCleanupDelay = isOpen ? 1380 : 1120;
    focusNotesTransitionTimer = window.setTimeout(() => {
      shell.classList.remove("is-notes-transitioning");
    }, transitionCleanupDelay);
  }

  function scheduleNotesLayoutUpdate() {
    updateNotesLayout();
    requestAnimationFrame(() => updateNotesLayout());
    requestAnimationFrame(() => requestAnimationFrame(() => updateNotesLayout()));
    window.setTimeout(updateNotesLayout, 180);
  }

  function transitionFocusNoteCopy(update) {
    const canAnimate = noteText
      && shell.classList.contains("is-notes")
      && document.body.classList.contains("has-loaded")
      && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.clearTimeout(focusNoteCopyTransitionTimer);
    shell.classList.remove("is-note-copy-updating", "is-note-copy-swapping", "is-note-copy-returning");
    if (!canAnimate) {
      update();
      scheduleNotesLayoutUpdate();
      return;
    }

    shell.classList.add("is-note-copy-swapping");
    focusNoteCopyTransitionTimer = window.setTimeout(() => {
      update();
      if (shell.classList.contains("is-notes")) {
        updateNotesCopyMetricsOnly();
      } else {
        updateNotesLayout();
      }
      requestAnimationFrame(() => {
        if (shell.classList.contains("is-notes")) {
          updateNotesCopyMetricsOnly();
        } else {
          updateNotesLayout();
        }
        shell.classList.remove("is-note-copy-swapping");
        shell.classList.add("is-note-copy-returning");
        focusNoteCopyTransitionTimer = window.setTimeout(() => {
          shell.classList.remove("is-note-copy-returning");
        }, 240);
      });
    }, 110);
  }

  function updateNotesCopyMetricsOnly() {
    if (!noteText) return;
    const note = noteText.textContent || "";
    const length = [...note].length;
    const isMobile = window.innerWidth <= 768;
    const clamp = (min, value, max) => Math.max(min, Math.min(value, max));
    const notesRect = getFocusRect(document.querySelector("[data-focus-notes]"));
    const currentCopyWidth = getCssPixelValue(shell, "--notes-copy-width", isMobile ? window.innerWidth - 32 : 320);
    const currentCopyGap = getCssPixelValue(shell, "--notes-copy-gap", isMobile ? 14 : 24);
    const baseCopySize = isMobile ? 1.42 : window.innerWidth < 940 ? 1.34 : 1.46;
    const minCopySize = isMobile ? 1.05 : window.innerWidth < 940 ? 1.06 : 1.12;
    const charWidth = isMobile ? 9.4 : 8.8;
    const charsPerLine = Math.max(isMobile ? 8 : 12, Math.floor(currentCopyWidth / (baseCopySize * charWidth)));
    const copyLines = Math.max(1, Math.ceil(length / charsPerLine));
    const copyAvailableHeight = Math.max(isMobile ? 66 : 140, (notesRect?.height || 180) - currentCopyGap - 12);
    const requiredNotesHeight = copyLines * baseCopySize * 10 * 1.35;
    const copySize = clamp(minCopySize, baseCopySize * Math.min(1, copyAvailableHeight / Math.max(1, requiredNotesHeight)), baseCopySize);
    shell.style.setProperty("--notes-copy-size", `${copySize.toFixed(2)}rem`);
  }

  function updateNotesLayout() {
    if (!noteText) return;
    const active = Number(shell.dataset.activeIndex || 0);
    const photo = photos[active] || photos[0];
    const note = getPhotoNote(photo);
    const length = [...note].length;
    const isMobile = window.innerWidth <= 768;
    const mainBox = document.querySelector("[data-focus-main]");
    const railBox = thumbs;
    const mainRectForNotes = measureFocusMainBaseRect() || getFocusRect(mainBox);
    const mainWidth = mainRectForNotes?.width || mainBox?.offsetWidth || window.innerWidth * 0.64;
    const mainHeight = mainRectForNotes?.height || mainBox?.offsetHeight || window.innerHeight * 0.62;
    const cachedRatio = getFocusPhotoRatio(active);
    const imageRatio = cachedRatio || (image.naturalWidth && image.naturalHeight ? image.naturalWidth / image.naturalHeight : mainWidth / Math.max(1, mainHeight));
    const clamp = (min, value, max) => Math.max(min, Math.min(value, max));
    const notesImageLineGap = isMobile
      ? clamp(26, window.innerHeight * 0.04, 42)
      : clamp(38, window.innerWidth * 0.038, 76);
    const notesLineCopyGap = isMobile
      ? clamp(13, window.innerHeight * 0.02, 22)
      : clamp(18, window.innerWidth * 0.018, 34);

    if (isMobile) {
      const focusTop = mainRectForNotes ? mainRectForNotes.top : 104;
      const railRect = railBox?.getBoundingClientRect();
      const notesRailShift = getCssLengthValue(shell, "--space-4", 16);
      const railTop = railRect
        ? railRect.top - getElementTranslateY(railBox) + notesRailShift
        : window.innerHeight - 200;
      const lineBottom = Math.max(150, window.innerHeight - railTop + 8);
      const fixedCopyReserve = clamp(88, window.innerHeight * 0.16, 136);
      const maxLineTop = window.innerHeight - lineBottom - fixedCopyReserve;
      const scaleFromRatio = imageRatio < 0.78 ? -0.04 : imageRatio > 1.18 ? 0.015 : 0;
      const basePhotoScale = clamp(0.58, 0.7 + scaleFromRatio, 0.72);
      const shiftY = -clamp(28, mainHeight * 0.085, 48);
      const maxVisualBottom = maxLineTop - notesImageLineGap;
      const maxScaleFromFixedSpace = 2 * (maxVisualBottom - focusTop - shiftY - mainHeight / 2) / Math.max(1, mainHeight);
      const photoScale = clamp(0.54, Math.min(basePhotoScale, maxScaleFromFixedSpace), basePhotoScale);
      const visualBottom = focusTop + shiftY + mainHeight - (mainHeight * (1 - photoScale) / 2);
      const lineTop = visualBottom + notesImageLineGap;
      const copyWidth = Math.max(240, window.innerWidth - 32);
      const copyAvailableHeight = Math.max(66, window.innerHeight - lineBottom - lineTop - notesLineCopyGap);
      const baseCopySize = 1.42;
      const charsPerLine = Math.max(8, Math.floor(copyWidth / (baseCopySize * 9.4)));
      const copyLines = Math.max(1, Math.ceil(length / charsPerLine));
      const requiredNotesHeight = copyLines * baseCopySize * 10 * 1.35;
      const copySize = clamp(1.05, baseCopySize * Math.min(1, copyAvailableHeight / Math.max(1, requiredNotesHeight)), baseCopySize);

      shell.style.setProperty("--notes-photo-scale", photoScale.toFixed(3));
      shell.style.setProperty("--notes-photo-shift-y", `${shiftY.toFixed(1)}px`);
      shell.style.setProperty("--notes-line-top", `${lineTop.toFixed(1)}px`);
      shell.style.setProperty("--notes-line-bottom", `${lineBottom.toFixed(1)}px`);
      shell.style.setProperty("--notes-copy-size", `${copySize.toFixed(2)}rem`);
      shell.style.setProperty("--notes-copy-width", `${copyWidth.toFixed(1)}px`);
      shell.style.setProperty("--notes-copy-gap", `${notesLineCopyGap.toFixed(1)}px`);
      shell.style.setProperty("--notes-panel-width", "auto");
      shell.style.setProperty("--notes-photo-shift-x", "0px");
      return;
    }

    const isCompactWide = window.innerWidth < 940;
    const rightInset = clamp(isCompactWide ? 24 : 40, window.innerWidth * 0.035, isCompactWide ? 44 : 80);
    const railRect = railBox?.getBoundingClientRect();
    const railRight = railRect && railRect.width > 0 ? railRect.right : 136;
    const railGap = clamp(isCompactWide ? 22 : 56, window.innerWidth * 0.042, isCompactWide ? 40 : 108);
    const minPanel = isCompactWide ? 252 : 340;
    const maxPanel = Math.max(minPanel, Math.min(isCompactWide ? 292 : 520, window.innerWidth * (isCompactWide ? 0.36 : 0.34)));
    const notesStablePanelWidth = clamp(minPanel, window.innerWidth * (isCompactWide ? 0.32 : 0.3), maxPanel);
    const panelWidth = notesStablePanelWidth;
    const idealCopyWidth = notesStablePanelWidth - notesLineCopyGap - (isCompactWide ? 20 : 32);
    const noteLeft = window.innerWidth - rightInset - panelWidth;
    const leftLimit = railRight + railGap;
    const rightLimit = noteLeft - notesImageLineGap;
    const availablePhotoWidth = Math.max(160, rightLimit - leftLimit);
    const ratioBoost = imageRatio < 0.82 ? 0.08 : imageRatio > 1.35 ? -0.02 : 0;
    const baseMax = clamp(isCompactWide ? 0.54 : 0.74, (isCompactWide ? 0.62 : 0.84) + ratioBoost, isCompactWide ? 0.68 : 0.92);
    const minScale = isCompactWide ? 0.44 : 0.62;
    const photoScale = clamp(minScale, Math.min(baseMax, availablePhotoWidth / Math.max(1, mainWidth)), baseMax);
    const scaledWidth = mainWidth * photoScale;
    const minCenter = leftLimit + scaledWidth / 2;
    const maxCenter = rightLimit - scaledWidth / 2;
    const rightAlignedCenter = rightLimit - scaledWidth / 2;
    const balancedCenter = leftLimit + availablePhotoWidth * (isCompactWide ? 0.52 : 0.66);
    const desiredCenter = clamp(minCenter, Math.min(rightAlignedCenter, balancedCenter), maxCenter);
    const shiftX = desiredCenter - window.innerWidth / 2;
    const copyWidth = clamp(isCompactWide ? 218 : 280, idealCopyWidth, isCompactWide ? 248 : 460);
    const baseCopySize = isCompactWide ? 1.34 : 1.46;
    const charsPerLine = Math.max(12, Math.floor(copyWidth / (baseCopySize * 8.8)));
    const copyLines = Math.max(1, Math.ceil(length / charsPerLine));
    const copyAvailableHeight = Math.max(140, mainHeight - 56);
    const requiredNotesHeight = copyLines * baseCopySize * 10 * 1.35;
    const copySize = clamp(isCompactWide ? 1.06 : 1.12, baseCopySize * Math.min(1, copyAvailableHeight / Math.max(1, requiredNotesHeight)), baseCopySize);

    shell.style.setProperty("--notes-photo-scale", photoScale.toFixed(3));
    shell.style.setProperty("--notes-photo-shift-x", `${shiftX.toFixed(1)}px`);
    shell.style.setProperty("--notes-photo-shift-y", "0px");
    shell.style.setProperty("--notes-panel-width", `${panelWidth.toFixed(1)}px`);
    shell.style.setProperty("--notes-copy-size", `${copySize.toFixed(2)}rem`);
    shell.style.setProperty("--notes-copy-width", `${copyWidth.toFixed(1)}px`);
    shell.style.setProperty("--notes-copy-gap", `${notesLineCopyGap.toFixed(1)}px`);
    shell.style.removeProperty("--notes-line-top");
    shell.style.removeProperty("--notes-line-bottom");
  }
  function waitForImageReady(img, timeout = 900) {
    return new Promise((resolve) => {
      if (!img) {
        resolve();
        return;
      }
      let finished = false;
      const done = () => {
        if (finished) return;
        finished = true;
        window.clearTimeout(timer);
        resolve();
      };
      const decode = () => {
        if (img.decode) img.decode().then(done).catch(done);
        else done();
      };
      const timer = window.setTimeout(done, timeout);
      if (img.complete && img.naturalWidth > 0) {
        decode();
        return;
      }
      img.addEventListener("load", decode, { once: true });
      img.addEventListener("error", done, { once: true });
    });
  }

  function waitForImageDecoded(img, timeout = 2400) {
    if (!img) return Promise.resolve();
    const decoded = new Promise((resolve) => {
      const decode = () => {
        if (img.complete && img.naturalWidth > 0) {
          if (img.decode) img.decode().then(resolve).catch(resolve);
          else resolve();
          return;
        }
        img.addEventListener("load", decode, { once: true });
        img.addEventListener("error", resolve, { once: true });
      };
      decode();
    });
    const safety = new Promise((resolve) => {
      window.setTimeout(resolve, timeout);
    });
    return Promise.race([decoded, safety]);
  }

  function preloadFocusImage(src) {
    if (!src) return Promise.resolve();
    if (focusImagePreloadCache.has(src)) return focusImagePreloadCache.get(src);
    const request = new Promise((resolve) => {
      const next = new Image();
      next.decoding = "async";
      next.onload = () => waitForImageReady(next).then(resolve);
      next.onerror = resolve;
      next.src = src;
    });
    focusImagePreloadCache.set(src, request);
    return request;
  }

  function preloadFocusNeighbors(index) {
    [index - 1, index + 1].forEach((neighborIndex) => {
      const neighbor = photos[neighborIndex];
      if (neighbor?.full) preloadFocusImage(neighbor.full);
    });
  }

  function updateFocusChrome(index, replaceUrl) {
    shell.dataset.activeIndex = String(index);
    thumbs.querySelectorAll(".focus-thumb").forEach((thumb, thumbIndex) => {
      const active = thumbIndex === index;
      thumb.classList.toggle("is-active", active);
    });
    if (replaceUrl) {
      window.history.replaceState({}, "", `focus.html?rel=${index + 1}`);
    }
  }

  function commitFocusPhoto(photo, index) {
    image.src = photo.full;
    image.alt = photo.alt;
    caption.textContent = "";
    if (noteText) noteText.textContent = getPhotoNote(photo);
    title.textContent = photo.title;
    preloadFocusNeighbors(index);
    scheduleNotesLayoutUpdate();
  }

  function setFocus(index, replaceUrl, options = {}) {
    const photo = photos[index];
    if (!photo) return;
    if (options.source !== "swipe") {
      clearFocusQueuedSwipe();
      clearFocusMainSwipe();
    }
    const previousIndex = Number(shell.dataset.activeIndex || 0);
    if (index !== previousIndex) focusLastNavigationDirection = index > previousIndex ? 1 : -1;
    const canAnimate = document.body.classList.contains("has-loaded")
      && !options.instant
      && image.getAttribute("src")
      && index !== previousIndex
      && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const switchRunId = ++focusSwitchSequence;
    window.clearTimeout(focusSwitchTimer);

    updateFocusChrome(index, replaceUrl);

    if (!canAnimate) {
      shell.classList.remove("is-switching-image");
      commitFocusPhoto(photo, index);
      return;
    }

    shell.classList.add("is-switching-image");
    focusSwitchTimer = window.setTimeout(() => {
      if (switchRunId === focusSwitchSequence) shell.classList.remove("is-switching-image");
    }, 760);
    const startedAt = performance.now();
    const switchOutDelay = options.source === "swipe" ? 160 : 260;
    preloadFocusImage(photo.full).then(() => {
      const remaining = Math.max(0, switchOutDelay - (performance.now() - startedAt));
      window.setTimeout(() => {
        if (switchRunId !== focusSwitchSequence) return;
        commitFocusPhoto(photo, index);
        requestAnimationFrame(() => {
          if (switchRunId === focusSwitchSequence) {
            window.clearTimeout(focusSwitchTimer);
            shell.classList.remove("is-switching-image");
          }
        });
      }, remaining);
    });
  }

  function cancelFocusRailScroll() {
    if (!focusRailScrollFrame) return;
    cancelAnimationFrame(focusRailScrollFrame);
    focusRailScrollFrame = 0;
  }

  function animateFocusRailTo(left, smooth) {
    cancelFocusRailScroll();
    const clampedLeft = Math.max(0, Math.min(left, mobileRailMaxOffset));
    thumbs.dataset.glideTarget = clampedLeft.toFixed(2);
    thumbs.dataset.glideMode = smooth ? "smooth" : "auto";
    if (!smooth || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      thumbs.scrollLeft = clampedLeft;
      return;
    }
    const startLeft = thumbs.scrollLeft;
    const distance = clampedLeft - startLeft;
    if (Math.abs(distance) < 1) return;
    const duration = Math.max(420, Math.min(920, 420 + Math.abs(distance) * 0.85));
    const startedAt = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    const step = (now) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      thumbs.scrollLeft = startLeft + distance * ease(progress);
      if (progress < 1) {
        focusRailScrollFrame = requestAnimationFrame(step);
      } else {
        focusRailScrollFrame = 0;
      }
    };
    focusRailScrollFrame = requestAnimationFrame(step);
  }

  function animateFocusDesktopRailTo(top, smooth) {
    cancelFocusRailScroll();
    const maxTop = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const clampedTop = Math.max(0, Math.min(top, maxTop));
    if (!smooth || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.scrollTo({ top: clampedTop, left: 0, behavior: "auto" });
      return;
    }
    const startTop = window.scrollY || document.documentElement.scrollTop || 0;
    const distance = clampedTop - startTop;
    if (Math.abs(distance) < 1) return;
    const duration = Math.max(360, Math.min(680, 360 + Math.abs(distance) * 0.34));
    const startedAt = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3.2);
    const step = (now) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      window.scrollTo({ top: startTop + distance * ease(progress), left: 0, behavior: "auto" });
      if (progress < 1) focusRailScrollFrame = requestAnimationFrame(step);
      else focusRailScrollFrame = 0;
    };
    focusRailScrollFrame = requestAnimationFrame(step);
  }

  function setFocusManualSelection(index, duration = 1600) {
    focusManualSelectionIndex = index;
    window.clearTimeout(focusManualSelectionTimer);
    focusManualSelectionTimer = window.setTimeout(() => {
      if (focusManualSelectionIndex === index) focusManualSelectionIndex = null;
      focusManualSelectionTimer = 0;
    }, duration);
  }

  function clearFocusManualSelection() {
    window.clearTimeout(focusManualSelectionTimer);
    focusManualSelectionTimer = 0;
    focusManualSelectionIndex = null;
  }

  function glideFocusRailAfterThumbClick(index) {
    const thumb = thumbs.querySelector(`.focus-thumb[data-index="${index + 1}"]`);
    if (!thumb) return;
    setFocusManualSelection(index, 1700);
    thumbs.dataset.glideIndex = String(index + 1);
    scrollToFocusIndex(index, true);
    focusSyncHoldUntil = Date.now() + 1400;
  }

  function lockFocusRailAfterMainSwipe(targetIndex) {
    window.clearTimeout(focusSwipeSyncTimer);
    cancelFocusRailScroll();
    setFocusManualSelection(targetIndex, 520);
    scrollToFocusIndex(targetIndex, false);
    focusMainSwipeLockUntil = Date.now() + 520;
    focusSyncHoldUntil = Date.now() + 520;
    focusSwipeSyncTimer = window.setTimeout(() => {
      if (Number(shell.dataset.activeIndex || 0) !== targetIndex || shell.classList.contains("is-index")) return;
      scrollToFocusIndex(targetIndex, false);
      focusMainSwipeLockUntil = Date.now() + 120;
      focusSyncHoldUntil = Date.now() + 120;
    }, 320);
  }

  function releaseFocusRailUserControl() {
    window.clearTimeout(focusSwipeSyncTimer);
    focusSwipeSyncTimer = 0;
    focusMainSwipeLockUntil = 0;
    focusSyncHoldUntil = 0;
  }

  function holdFocusRailForMainSwipeGesture(duration = 420) {
    cancelFocusRailScroll();
    window.clearTimeout(focusSwipeSyncTimer);
    focusSwipeSyncTimer = 0;
    const currentIndex = Number(shell.dataset.activeIndex || 0);
    setFocusManualSelection(currentIndex, duration);
    focusMainSwipeLockUntil = Date.now() + duration;
    focusSyncHoldUntil = Date.now() + duration;
  }

  function scrollToFocusIndex(index, smooth) {
    const thumb = thumbs.querySelector(`.focus-thumb[data-index="${index + 1}"]`);
    if (!thumb) return;
    focusSyncHoldUntil = Date.now() + (smooth ? 1100 : 320);
    if (window.innerWidth <= 768) {
      updateMobileFocusRail();
      const rect = thumb.getBoundingClientRect();
      const left = thumbs.scrollLeft + rect.left + rect.width / 2 - window.innerWidth / 2;
      thumbs.dataset.glideIndex = String(index + 1);
      animateFocusRailTo(left, smooth);
      return;
    }
    const rect = thumb.getBoundingClientRect();
    const top = window.scrollY + rect.top + rect.height / 2 - window.innerHeight / 2;
    animateFocusDesktopRailTo(top, smooth);
  }

  function updateFocusRailMetrics() {
    const allThumbs = [...thumbs.querySelectorAll(".focus-thumb")];
    const first = allThumbs[0];
    const last = allThumbs[allThumbs.length - 1];
    if (first && first.offsetHeight > 0) shell.style.setProperty("--first-thumb-height", `${first.offsetHeight}px`);
    if (last && last.offsetHeight > 0) shell.style.setProperty("--last-thumb-height", `${last.offsetHeight}px`);
    if (first && first.offsetWidth > 0) shell.style.setProperty("--first-thumb-width", `${first.offsetWidth}px`);
    if (last && last.offsetWidth > 0) shell.style.setProperty("--last-thumb-width", `${last.offsetWidth}px`);
  }

  function updateMobileFocusRail() {
    if (window.innerWidth > 768) {
      mobileRailMaxOffset = 0;
      return 0;
    }
    mobileRailMaxOffset = Math.max(0, Math.ceil(thumbs.scrollWidth - thumbs.clientWidth));
    return Math.max(0, Math.min(thumbs.scrollLeft, mobileRailMaxOffset));
  }

  function isMobileFocusRailReady(allThumbs) {
    if (window.innerWidth > 768) return true;
    if (!allThumbs.length || !thumbs.clientWidth || thumbs.scrollWidth <= thumbs.clientWidth) return false;
    return allThumbs.every((thumb) => thumb.offsetWidth > 0 && thumb.offsetHeight > 0);
  }

  function resetFocusMainTouch() {
    focusMainTouchStartX = 0;
    focusMainTouchStartY = 0;
    focusMainTouchLastX = 0;
    focusMainTouchLastY = 0;
    focusMainTouchLastMoveAt = 0;
    focusMainTouchVelocityX = 0;
    focusMainTouchMode = "";
    focusMainTouchMoved = false;
    focusMainTouchBaseOffset = 0;
    focusMainTouchContinuationDirection = 0;
  }

  function updateFocusMainTouchVelocity(clientX, eventTime) {
    const now = Number.isFinite(eventTime) ? eventTime : performance.now();
    if (!focusMainTouchLastMoveAt) {
      focusMainTouchLastX = clientX;
      focusMainTouchLastMoveAt = now;
      focusMainTouchVelocityX = 0;
      return;
    }
    const dt = Math.max(8, now - focusMainTouchLastMoveAt);
    const instantVelocity = (clientX - focusMainTouchLastX) / dt;
    focusMainTouchVelocityX = focusMainTouchVelocityX * 0.28 + instantVelocity * 0.72;
    focusMainTouchLastX = clientX;
    focusMainTouchLastMoveAt = now;
  }

  function handleFocusMainTouchStart(event) {
    if (window.innerWidth > 768 || shell.classList.contains("is-index") || !event.touches.length) {
      clearFocusMainSwipe();
      resetFocusMainTouch();
      return;
    }
    const interruption = isFocusMainSwipeBusy()
      ? interruptFocusMainSwipeForNewGesture()
      : { offset: 0, continuationDirection: 0 };
    holdFocusRailForMainSwipeGesture();
    const touch = event.touches[0];
    focusMainTouchStartX = touch.clientX;
    focusMainTouchStartY = touch.clientY;
    focusMainTouchLastX = touch.clientX;
    focusMainTouchLastY = touch.clientY;
    focusMainTouchLastMoveAt = Number.isFinite(event.timeStamp) ? event.timeStamp : performance.now();
    focusMainTouchVelocityX = 0;
    focusMainTouchBaseOffset = interruption.offset;
    focusMainTouchContinuationDirection = interruption.continuationDirection;
    focusMainTouchMode = "";
    focusMainTouchMoved = false;
  }

  function handleFocusMainTouchMove(event) {
    if (window.innerWidth > 768 || shell.classList.contains("is-index") || !event.touches.length) return;
    const touch = event.touches[0];
    const deltaX = touch.clientX - focusMainTouchStartX;
    const deltaY = touch.clientY - focusMainTouchStartY;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    focusMainTouchLastY = touch.clientY;
    updateFocusMainTouchVelocity(touch.clientX, event.timeStamp);

    if (!focusMainTouchMode) {
      if (absX > 3 && absX > absY * 0.72) focusMainTouchMode = "horizontal";
      else if (absY > 10 && absY > absX * 1.18) focusMainTouchMode = "vertical";
    }
    if (focusMainTouchMode === "horizontal") {
      focusMainTouchMoved = true;
      event.preventDefault();
      updateFocusMainSwipeDrag(focusMainTouchBaseOffset + deltaX);
      return;
    }
    if (focusMainTouchMode === "vertical") {
      focusMainTouchMoved = true;
      event.preventDefault();

      if (shell.classList.contains("is-notes")) return;
    }
  }

  function handleFocusMainTouchEnd(event) {
    if (window.innerWidth > 768 || shell.classList.contains("is-index")) {
      resetFocusMainTouch();
      return;
    }
    const touch = event.changedTouches?.[0];
    const endY = touch ? touch.clientY : focusMainTouchLastY;
    const endX = touch ? touch.clientX : focusMainTouchStartX;
    const deltaX = endX - focusMainTouchStartX;
    const deltaY = endY - focusMainTouchStartY;
    const absY = Math.abs(deltaY);
    const absX = Math.abs(deltaX);
    const wasVertical = focusMainTouchMode === "vertical" && (focusMainTouchMoved || absY > 24);
    const wasHorizontal = focusMainTouchMode === "horizontal" && (focusMainTouchMoved || absX > 6);

    if (wasHorizontal) {
      focusMainTouchPreventClickUntil = Date.now() + 520;
      const gestureDirection = deltaX < 0 ? 1 : -1;
      if (focusMainTouchContinuationDirection
        && focusMainTouchContinuationDirection !== gestureDirection) {
        clearFocusQueuedSwipe();
      }
      const queuedDirection = focusMainTouchContinuationDirection === gestureDirection
        && (absX > 28 || Math.abs(focusMainTouchVelocityX) > 0.24)
        ? gestureDirection
        : 0;
      finishFocusMainSwipe(queuedDirection);
    } else if (wasVertical) {
      focusMainTouchPreventClickUntil = Date.now() + 520;
      if (shell.classList.contains("is-notes") && deltaY > 44) {
        setNotesOpen(false, { source: "swipe" });
      } else if (!shell.classList.contains("is-notes") && deltaY < -46) {
        setNotesOpen(true, { source: "swipe" });
      }
    } else {
      if (focusMainSwipe.active && !focusMainSwipe.animating) startFocusMainSwipeAnimation(0, false);
    }
    resetFocusMainTouch();
  }

  function handleFocusMainTouchCancel() {
    if (focusMainSwipe.active) startFocusMainSwipeAnimation(0, false);
    resetFocusMainTouch();
  }

  function isFocusMainPointerDrag(event) {
    return event.pointerType === "mouse" || event.pointerType === "pen";
  }

  function handleFocusMainPointerDown(event) {
    if (event.pointerType !== "mouse" && event.pointerType !== "pen") return;
    if (event.button !== 0 || shell.classList.contains("is-index")) return;
    const interruption = isFocusMainSwipeBusy()
      ? interruptFocusMainSwipeForNewGesture()
      : { offset: 0, continuationDirection: 0 };
    holdFocusRailForMainSwipeGesture();
    focusMainPointerActive = true;
    focusMainPointerId = event.pointerId;
    focusMainTouchStartX = event.clientX;
    focusMainTouchStartY = event.clientY;
    focusMainTouchLastX = event.clientY;
    focusMainTouchLastY = event.clientY;
    focusMainTouchLastMoveAt = Number.isFinite(event.timeStamp) ? event.timeStamp : performance.now();
    focusMainTouchVelocityX = 0;
    focusMainTouchBaseOffset = interruption.offset;
    focusMainTouchContinuationDirection = interruption.continuationDirection;
    focusMainTouchMode = "";
    focusMainTouchMoved = false;
    imageToggle.setPointerCapture?.(event.pointerId);
  }

  function handleFocusMainPointerMove(event) {
    if (!focusMainPointerActive || event.pointerId !== focusMainPointerId || !isFocusMainPointerDrag(event)) return;
    const deltaX = event.clientX - focusMainTouchStartX;
    const deltaY = event.clientY - focusMainTouchStartY;
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);
    focusMainTouchLastY = event.clientY;
    updateFocusMainTouchVelocity(event.clientY, event.timeStamp);
    if (!focusMainTouchMode) {
      if (absY > 2 && absY > absX * 0.62) focusMainTouchMode = "vertical";
      else if (absX > 14 && absX > absY) focusMainTouchMode = "horizontal";
    }
    if (focusMainTouchMode !== "vertical") return;
    focusMainTouchMoved = true;
    event.preventDefault();
    updateFocusMainSwipeDrag(focusMainTouchBaseOffset + deltaY);
  }

  function handleFocusMainPointerUp(event) {
    if (!focusMainPointerActive || event.pointerId !== focusMainPointerId || !isFocusMainPointerDrag(event)) return;
    const deltaX = event.clientX - focusMainTouchStartX;
    const deltaY = event.clientY - focusMainTouchStartY;
    const wasVertical = focusMainTouchMode === "vertical" && (focusMainTouchMoved || Math.abs(deltaY) > 6);
    const wasCrossAxisDrag = focusMainTouchMode === "horizontal" && Math.abs(deltaX) > 10;
    imageToggle.releasePointerCapture?.(event.pointerId);
    focusMainPointerActive = false;
    focusMainPointerId = 0;
    if (wasVertical) {
      focusMainTouchPreventClickUntil = Date.now() + 520;
      event.preventDefault();
      const gestureDirection = deltaY < 0 ? 1 : -1;
      if (focusMainTouchContinuationDirection
        && focusMainTouchContinuationDirection !== gestureDirection) {
        clearFocusQueuedSwipe();
      }
      const queuedDirection = focusMainTouchContinuationDirection === gestureDirection
        && (Math.abs(deltaY) > 28 || Math.abs(focusMainTouchVelocityX) > 0.24)
        ? gestureDirection
        : 0;
      finishFocusMainSwipe(queuedDirection);
    } else if (wasCrossAxisDrag) {
      focusMainTouchPreventClickUntil = Date.now() + 320;
      event.preventDefault();
    } else if (focusMainSwipe.active && !focusMainSwipe.animating) {
      startFocusMainSwipeAnimation(0, false);
    }
    resetFocusMainTouch();
  }

  function handleFocusMainPointerCancel(event) {
    if (event?.pointerId && event.pointerId !== focusMainPointerId) return;
    if (focusMainPointerActive && event?.pointerId) {
      imageToggle.releasePointerCapture?.(event.pointerId);
    }
    focusMainPointerActive = false;
    focusMainPointerId = 0;
    if (focusMainSwipe.active && !focusMainSwipe.animating) startFocusMainSwipeAnimation(0, false);
    resetFocusMainTouch();
  }

  function handleFocusMainWheel(event) {
    if (shell.classList.contains("is-index")) return;
    const axis = getFocusMainSwipeAxis();
    const absX = Math.abs(event.deltaX);
    const absY = Math.abs(event.deltaY);
    const primaryDelta = axis === "x" ? event.deltaX : event.deltaY;
    const primaryDistance = Math.abs(primaryDelta);
    const crossDistance = axis === "x" ? absY : absX;
    if (primaryDistance < 16 || primaryDistance <= crossDistance * 1.08) return;
    event.preventDefault();
    if (Date.now() < focusMainWheelLockUntil) return;
    const interruption = isFocusMainSwipeBusy()
      ? interruptFocusMainSwipeForNewGesture()
      : { offset: 0, continuationDirection: 0 };
    holdFocusRailForMainSwipeGesture(560);
    const direction = primaryDelta > 0 ? 1 : -1;
    if (interruption.continuationDirection
      && interruption.continuationDirection !== direction) {
      clearFocusQueuedSwipe();
    }
    focusMainTouchVelocityX = (direction > 0 ? -1 : 1) * Math.max(0.55, Math.min(1.25, primaryDistance / 34));
    focusMainWheelLockUntil = Date.now() + 90;
    if (focusMainSwipe.active) {
      if (focusMainSwipe.direction !== direction) {
        startFocusMainSwipeAnimation(0, false);
        return;
      }
      if (interruption.continuationDirection === direction) {
        queueFocusMainSwipe(direction, focusMainTouchVelocityX);
      }
      const activeTravel = focusMainSwipe.travel || focusMainSwipe.extent || getFocusMainSwipeExtent(axis);
      const activeTargetOffset = direction > 0 ? -activeTravel : activeTravel;
      startFocusMainSwipeAnimation(focusMainSwipe.edge ? activeTargetOffset * 0.78 : activeTargetOffset, !focusMainSwipe.edge);
      return;
    }
    if (!configureFocusMainSwipe(direction)) return;
    const travel = focusMainSwipe.travel || focusMainSwipe.extent || getFocusMainSwipeExtent(axis);
    const isEdgeSwipe = Boolean(focusMainSwipe.edge);
    const targetOffset = direction > 0 ? -travel : travel;
    setFocusMainSwipeFrame(0, direction);
    startFocusMainSwipeAnimation(targetOffset, !isEdgeSwipe);
  }

  function handleFocusTouchStart(event) {
    cancelFocusRailScroll();
    clearFocusManualSelection();
    releaseFocusRailUserControl();
    if (window.innerWidth > 768 || !event.touches.length) return;
    const touch = event.touches[0];
    focusTouchStartX = touch.clientX;
    focusTouchStartY = touch.clientY;
    focusTouchLastX = touch.clientX;
    focusTouchMode = "";
  }

  function handleFocusTouchMove(event) {
    if (window.innerWidth > 768 || shell.classList.contains("is-index") || shell.classList.contains("is-notes") || !event.touches.length) return;
    const touch = event.touches[0];
    const deltaX = touch.clientX - focusTouchStartX;
    const deltaY = touch.clientY - focusTouchStartY;
    if (!focusTouchMode) {
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 5) focusTouchMode = "horizontal";
      else if (Math.abs(deltaY) > 5) focusTouchMode = "vertical";
    }
    if (focusTouchMode === "horizontal") {
      event.preventDefault();
      thumbs.scrollLeft = Math.max(0, Math.min(thumbs.scrollLeft + focusTouchLastX - touch.clientX, mobileRailMaxOffset));
      focusTouchLastX = touch.clientX;
    }
  }

  function handleFocusWheel(event) {
    clearFocusManualSelection();
    releaseFocusRailUserControl();
    if (window.innerWidth > 768 || Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
    cancelFocusRailScroll();
    event.preventDefault();
    thumbs.scrollLeft = Math.max(0, Math.min(thumbs.scrollLeft + event.deltaX, mobileRailMaxOffset));
  }

  function syncFocusFromScroll() {
    if (!document.body.contains(shell)) return;
    const isMobile = window.innerWidth <= 768;
    if (isMobile) updateMobileFocusRail();
    if (!shell.classList.contains("is-index") && !shell.classList.contains("is-notes")) {
      const allThumbs = [...thumbs.querySelectorAll(".focus-thumb")];
      const viewportCenter = isMobile ? window.innerWidth / 2 : window.innerHeight / 2;
      const range = isMobile ? 220 : 280;
      const maxShift = isMobile ? 24 : 64;
      let activeIndex = Number(shell.dataset.activeIndex || 0);
      let nearestDistance = Infinity;
      const manualSelected = focusManualSelectionIndex !== null && Number(shell.dataset.activeIndex || 0) === focusManualSelectionIndex;
      const syncPaused = isFocusMainSwipeBusy() || manualSelected || Date.now() < focusSyncHoldUntil || Date.now() < focusMainSwipeLockUntil || Date.now() < focusInitialLockUntil || (isMobile && !isMobileFocusRailReady(allThumbs));

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

      if (!syncPaused && activeIndex !== Number(shell.dataset.activeIndex || 0)) {
        setFocus(activeIndex, true);
      }
    }
    requestAnimationFrame(syncFocusFromScroll);
  }
}

function returnFocusToOverview(rel, immediate) {
  const delay = immediate || window.matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 360;
  window.setTimeout(() => {
    window.location.href = `index.html?from=rel&rel=${rel}`;
  }, delay);
}
