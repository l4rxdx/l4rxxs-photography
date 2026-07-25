let photos = [];
let overviewPhotos = [];
let overviewOrder = [];
let overviewImageObserver = null;
let overviewBatchSequence = 0;
const DEFAULT_PHOTO_NOTE_CN = "\u8fd9\u5730\u65b9\u672c\u6765\u662f\u7ed9\u6bcf\u4e2a\u7167\u7247\u5199\u70b9\u968f\u8bb0\u7684\uff0c\u4f46\u662f\u53c9\u6ef4\u53c9\u6709\u70b9\u61d2\u6ca1\u5199\u51e0\u4e2a";
const DEFAULT_PHOTO_NOTE_EN = "This space was meant for small notes for each photo, but XDX got lazy and only wrote a few.";
const DEFAULT_PHOTO_NOTE = DEFAULT_PHOTO_NOTE_CN;
const overviewSkipCells = new Set([2, 7]);
const OVERVIEW_RETURN_STORAGE_KEY = "l4rxx-overview-return";
const PAGE_TRANSITION_STORAGE_KEY = "l4rxx-page-transition";
const LANGUAGE_STORAGE_KEY = "l4rxx-language";
const THEME_MODE_STORAGE_KEY = "l4rxx-theme-mode";
const THEME_STORAGE_KEY = "l4rxx-theme";
const PHOTO_MANIFEST_VERSION = "20260718-1";
const OVERVIEW_OPENING_RETRY_DELAY = 1000;
const OVERVIEW_OPENING_RETRY_MAX_DELAY = 4000;
const OVERVIEW_OPENING_REVEAL_DELAY = 720;
const OVERVIEW_MAX_RECYCLED_BATCHES = 3;
const PHOTO_PLACEHOLDER_FALLBACK = "#D8D6D1";
const photoPlaceholderCleanups = new WeakMap();
let photoPlaceholderRun = 0;
let navTransitionTimer = 0;
let pageTransitionTimer = 0;

const languageCopy = {
  en: {
    "nav.overview": "OVERVIEW",
    "nav.work": "WORK",
    "nav.logs": "LOGS",
    "logs.kicker": "Release history",
    "logs.title": "LOGS",
    "logs.intro": "Visible site changes, organized by date and category.",
    "home.about": "l4rxx is a visual maker collecting still moments, weathered surfaces, portraits, screens, and quiet fragments.",
    "work.menuAbout": "l4rxx works with available light, found color, and scenes that feel almost still.",
    contact: "CONTACT ME",
    "contact.copied": "EMAIL COPIED",
    "contact.copyStatus": "Email address copied to clipboard.",
    "contact.copyFailed": "Clipboard access is blocked. The email address is selected for manual copy.",
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
    "logs.intro": "\u53ef\u89c1\u7684\u7f51\u7ad9\u66f4\u65b0\uff0c\u6309\u65e5\u671f\u4e0e\u7c7b\u522b\u6574\u7406\u3002",
    "home.about": "l4rxx \u662f\u4e00\u4f4d\u89c6\u89c9\u521b\u4f5c\u8005\uff0c\u6536\u96c6\u9759\u6b62\u77ac\u95f4\u3001\u98ce\u5316\u8868\u9762\u3001\u8096\u50cf\u3001\u5c4f\u5e55\u4e0e\u5b89\u9759\u788e\u7247\u3002",
    "work.menuAbout": "l4rxx \u7528\u81ea\u7136\u5149\u3001\u88ab\u770b\u89c1\u7684\u989c\u8272\uff0c\u548c\u90a3\u4e9b\u5dee\u4e00\u70b9\u5c31\u9759\u6b62\u7684\u573a\u666f\u5de5\u4f5c\u3002",
    contact: "\u8054\u7cfb\u6211",
    "contact.copied": "\u90ae\u7bb1\u5df2\u590d\u5236",
    "contact.copyStatus": "\u90ae\u7bb1\u5730\u5740\u5df2\u590d\u5236\u5230\u526a\u8d34\u677f\u3002",
    "contact.copyFailed": "\u6d4f\u89c8\u5668\u5df2\u963b\u6b62\u526a\u8d34\u677f\u6743\u9650\uff0c\u90ae\u7bb1\u5df2\u9009\u4e2d\uff0c\u53ef\u624b\u52a8\u590d\u5236\u3002",
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
    versions: ["v1.5.1"],
    date: "2026-07-25",
    categories: {
      optimizations: {
        cn: [
          "INDEX \u589e\u52a0 260 \u6beb\u79d2\u54cd\u5e94\u95f4\u9694\uff0c\u9650\u5236\u8fde\u7eed\u5feb\u901f\u91cd\u5f00\u4e0e\u5207\u56fe\u3002"
        ],
        en: [
          "INDEX now uses a 260ms response interval to limit immediate reopen and cross-photo taps."
        ]
      },
      fixes: {
        cn: [
          "\u4fee\u590d\u4ece\u83dc\u5355\u70b9\u51fb\u603b\u89c8\u8fd4\u56de\u4e3b\u9875\u65f6\u8fc7\u6e21\u906e\u7f69\u672a\u9000\u51fa\u5bfc\u81f4\u767d\u5c4f\u3002",
          "\u4fee\u590d INDEX \u5feb\u901f\u8de8\u7167\u7247\u5207\u6362\u540e\u56fe\u5e93\u5361\u7247\u4e22\u5931\u7684\u95ee\u9898\u3002",
          "\u4fee\u590d\u4e0d\u540c\u5c3a\u5bf8\u7167\u7247\u5feb\u901f\u5207\u6362\u65f6\uff0c\u79fb\u52a8\u56fe\u7247\u6bd4\u4f8b\u7a81\u53d8\u548c\u9014\u4e2d\u62c9\u4f38\u3002"
        ],
        en: [
          "Fixed the transition veil remaining over home after choosing OVERVIEW from the menu.",
          "Fixed INDEX cards disappearing after rapid cross-photo switching.",
          "Fixed moving photos changing ratio or stretching while rapidly switching between different image sizes."
        ]
      },
      removals: {
        cn: [
          "WORK \u5c1a\u672a\u5b9a\u7a3f\uff0c\u6682\u65f6\u4ece\u83dc\u5355\u79fb\u9664\u5e76\u6e05\u7a7a\u9875\u9762\u5185\u5bb9\u3002"
        ],
        en: [
          "Temporarily removed unfinished WORK content and its menu entry."
        ]
      }
    }
  },
  {
    versions: ["v1.5.0"],
    date: "2026-07-25",
    categories: {
      optimizations: {
        cn: [
          "\u9996\u9875\u4f1a\u5728\u9996\u5c4f\u7167\u7247\u5168\u90e8\u89e3\u7801\u540e\u518d\u64ad\u653e\u6563\u5f00\u52a8\u753b\uff0c\u52a0\u8f7d\u671f\u95f4\u4f7f\u7528\u7167\u7247\u53d6\u8272\u7684\u7eaf\u8272\u5360\u4f4d\u3002",
          "\u4e3b\u9875\u3001rel \u548c\u83dc\u5355\u6539\u7528\u66f4\u8fde\u7eed\u7684\u9875\u9762\u8fc7\u6e21\uff1bINDEX \u8fd4\u56de\u524d\u4f1a\u63d0\u524d\u89e3\u7801\u6240\u9009\u7167\u7247\u3002",
          "\u4f18\u5316\u9996\u9875\u5934\u50cf\u4e0e\u6587\u5b57\u3001\u7167\u7247\u7684\u78b0\u649e\uff0c\u5934\u50cf\u843d\u5730\u540e\u4fdd\u7559\u81ea\u7136\u503e\u659c\u3002"
        ],
        en: [
          "Home now waits for every first-screen photo to decode before scattering the opening composition, using sampled solid-color placeholders while loading.",
          "Home, rel, and menu navigation now share smoother page transitions; INDEX decodes the selected photo before returning.",
          "Improved home avatar collisions with letters and photos, while preserving its natural landed tilt."
        ]
      },
      fixes: {
        cn: [
          "\u4fee\u590d\u4ece\u4e00\u5f20\u7167\u7247\u7684\u968f\u8bb0\u8fdb\u5165 INDEX\uff0c\u518d\u9009\u62e9\u53e6\u4e00\u5f20\u7167\u7247\u8fd4\u56de\u65f6\u7684\u672b\u6bb5\u6362\u56fe\u4e0e\u89c6\u89c9\u4f4d\u79fb\u3002",
          "\u4fee\u590d\u4e3b\u9875\u8fd4\u56de\u540e\u7167\u7247\u91cd\u65b0\u53d8\u4e3a\u52a0\u8f7d\u5360\u4f4d\u7684\u95ee\u9898\u3002"
        ],
        en: [
          "Fixed the final image swap and visual shift when returning from one photo's notes through INDEX to another photo.",
          "Fixed home photos reverting to loading placeholders after returning from rel."
        ]
      },
      additions: {
        cn: [
          "WORK \u9875\u9762\u65b0\u589e 2 \u5f20\u56fe\u7247\uff0c\u5e76\u5efa\u7acb\u9996\u5c4f\u62fc\u8d34\u7248\u5f0f\u3002"
        ],
        en: [
          "Added 2 images to WORK and introduced its opening collage layout."
        ]
      }
    }
  },
  {
    versions: ["v1.4.7"],
    date: "2026-07-23",
    categories: {
      fixes: {
        cn: [
          "\u4fee\u590d\u79fb\u52a8\u7aef\u4ece INDEX \u9009\u56fe\u8fd4\u56de\u540e\uff0crel \u4e0e\u968f\u8bb0\u9875\u9762\u7684\u5e95\u90e8\u7f29\u7565\u56fe\u8f68\u9053\u65e0\u6cd5\u7ee7\u7eed\u6ed1\u52a8\u9009\u56fe\u3002"
        ],
        en: [
          "Fixed mobile thumbnail selection stopping after choosing an INDEX photo and returning to rel or notes."
        ]
      },
      removals: {
        cn: [
          "\u79fb\u9664 INDEX \u9875\u9762\u5e95\u90e8\u591a\u4f59\u7684\u6a21\u7cca\u5c42\u3002"
        ],
        en: [
          "Removed the redundant blurred footer layer from INDEX."
        ]
      }
    }
  },
  {
    versions: ["v1.4.6"],
    date: "2026-07-22",
    categories: {
      optimizations: {
        cn: [
          "\u79fb\u52a8\u7aef rel \u7f29\u7565\u56fe\u8f68\u9053\u6539\u7528\u539f\u751f\u6a2a\u5411\u60ef\u6027\uff0c\u4e3b\u56fe\u62d6\u52a8\u4e0e\u8f68\u9053\u540c\u6b65\u6309\u5e27\u5408\u5e76\uff0c\u5feb\u901f\u6ed1\u52a8\u51cf\u5c11\u91cd\u590d\u89e3\u7801\u4e0e\u5207\u6362\u3002",
          "\u8fdb\u5165 INDEX \u65f6\u5e95\u90e8\u64cd\u4f5c\u680f\u4e0e\u7f29\u7565\u56fe\u8f68\u9053\u540c\u6b65\u9000\u51fa\uff1b\u968f\u8bb0\u4e0e INDEX \u5f80\u8fd4\u80cc\u666f\u4ece\u52a8\u753b\u9996\u5e27\u8fde\u7eed\u8fc7\u6e21\u3002"
        ],
        en: [
          "Mobile rel thumbnails now use native horizontal momentum; main-photo drag and rail sync are coalesced per frame to reduce repeated decoding during fast scrolling.",
          "INDEX now takes the bottom controls and thumbnail rail out together, while notes and INDEX backgrounds transition continuously from the first animation frame."
        ]
      },
      fixes: {
        cn: [
          "\u4fee\u590d\u5feb\u901f\u5f00\u5173\u6216\u540e\u53f0\u6062\u590d\u65f6 INDEX \u52a8\u753b\u53ef\u80fd\u505c\u6ede\u3001\u5e95\u90e8\u63a7\u4ef6\u6b8b\u7559\u7684\u95ee\u9898\u3002"
        ],
        en: [
          "Fixed INDEX motion potentially stalling or leaving bottom controls behind after rapid toggles or background-tab recovery."
        ]
      }
    }
  },
  {
    versions: ["v1.4.5"],
    date: "2026-07-21",
    categories: {
      optimizations: {
        cn: [
          "\u9996\u9875\u56fe\u5e93\u590d\u7528\u56fa\u5b9a\u6279\u6b21\u5e76\u5728\u6587\u5b57\u505c\u7a33\u540e\u4f11\u7720\uff0c\u51cf\u5c11\u957f\u65f6\u95f4\u6d4f\u89c8\u4e0e\u7a7a\u95f2\u72b6\u6001\u7684\u8ba1\u7b97\u5f00\u9500\u3002",
          "\u7d22\u5f15\u56fe\u5e93\u6539\u7528\u539f\u751f\u7eb5\u5411\u6eda\u52a8\u3001\u53ef\u89c1\u56fe\u7247\u52a0\u8f7d\u548c\u51e0\u4f55\u7f13\u5b58\uff0c\u968f\u8bb0\u5e03\u5c40\u6d4b\u91cf\u540c\u6b65\u7cbe\u7b80\u3002",
          "\u968f\u8bb0\u6b63\u6587\u4e0e\u5730\u70b9\u6539\u7528\u7cfb\u7edf\u82f9\u65b9\u5b57\u4f53\uff0c\u5730\u70b9\u4fdd\u7559\u6e05\u6670\u7684\u7c97\u4f53\u5c42\u7ea7\u3002"
        ],
        en: [
          "Home gallery batches are now recycled, and letter physics sleeps when settled to reduce long-session and idle work.",
          "INDEX now uses native vertical scrolling, visible-image loading, and cached geometry, with leaner notes layout measurement.",
          "Notes copy and locations now use the system PingFang stack, with locations retaining a clear bold hierarchy."
        ]
      },
      fixes: {
        cn: [
          "\u4fee\u590d\u4ece\u968f\u8bb0\u8fdb\u5165\u7d22\u5f15\u518d\u8fd4\u56de\u65f6\u7167\u7247\u53ef\u80fd\u53d8\u6a21\u7cca\u3002",
          "\u4fee\u590d\u79fb\u52a8\u7aef\u4e2d\u6587\u83dc\u5355\u5de6\u4e0b\u89d2\u94fe\u63a5\u6362\u884c\u3002"
        ],
        en: [
          "Fixed notes photos becoming blurred after opening and closing INDEX.",
          "Fixed mobile Chinese menu links wrapping in the lower-left footer."
        ]
      }
    }
  },
  {
    versions: ["v1.4.4"],
    date: "2026-07-21",
    categories: {
      fixes: {
        cn: [
          "修复移动端首页照片偶发跳动，并让语言选择在后续访问中保持。",
          "修复退出索引后立即打开随记时主图过渡丢失。",
          "修复系统主题变化后站内主题按钮首次点击可能无效，并同步多页面手动主题。"
        ],
        en: [
          "Fixed occasional mobile home-photo jumps and kept language choices across later visits.",
          "Fixed the main-photo transition disappearing when notes opened immediately after leaving INDEX.",
          "Fixed the first in-site theme toggle sometimes failing after a system theme change, with manual themes now synchronized across pages."
        ]
      },
      additions: {
        cn: ["随记照片新增随页面进入和退出平滑变化的主题自适应阴影。"],
        en: ["Added a theme-aware shadow that transitions smoothly with notes photos as they enter and leave."]
      }
    }
  },
  {
    versions: ["v1.4.3"],
    date: "2026-07-18",
    categories: {
      optimizations: {
        cn: ["随记进入与退出恢复更柔和的上一版速率曲线，同时保留同步启动与可打断机制。"],
        en: ["Notes opening and closing return to the gentler previous motion curve while keeping synchronized, interruptible transitions."]
      },
      additions: {
        cn: ["新增 2 张照片，图库增至 49 张。"],
        en: ["Added 2 photos, bringing the gallery to 49 photos."]
      }
    }
  },
  {
    versions: ["v1.4.2"],
    date: "2026-07-16",
    categories: {
      optimizations: {
        cn: [
          "移动端 rel 改用中尺寸照片，并延后索引与相邻图片加载，减少首屏请求和等待。",
          "首页文字重力改为按屏幕刷新率运行，并降低静止阶段的布局计算与样式写入。",
          "随记正文与地点改用本地手写字体，地点保留清晰的粗体层级。"
        ],
        en: [
          "Mobile rel pages now use medium-sized photos and defer INDEX and neighboring image loads, reducing initial requests and wait time.",
          "Home-page letter gravity now follows the display refresh rate while reducing idle layout work and style writes.",
          "Notes copy and locations now use a locally hosted handwriting font, with locations retaining a clear bold hierarchy."
        ]
      }
    }
  },
  {
    versions: ["v1.4.1", "v1.4.0", "v1.3.0"],
    date: "2026-07-14",
    categories: {
      optimizations: {
        cn: [
          "移动端大图连续滑动与缩略图同步更跟手，快速反向也能从当前画面继续。",
          "索引图库开合、纵向滚动与图片加载更稳定，移动端动画更柔和；随记背景会根据当前照片取色。",
          "首页非方形照片会按画幅适度放大以减少留白，1:1 照片保持原尺寸。",
          "新会话默认使用英语，手动切换的语言会在当前会话内跨页面保持。"
        ],
        en: [
          "Mobile photo swiping and thumbnail tracking now respond continuously, including rapid reversals.",
          "INDEX opening, vertical scrolling, and loading are more stable, with softer mobile motion; notes backgrounds now follow the active photo.",
          "Non-square home photos now scale with their aspect ratio to reduce excess whitespace, while 1:1 photos keep their original size.",
          "New sessions now start in English, while manual language changes persist across pages within the current session."
        ]
      },
      fixes: {
        cn: [
          "修复索引图库偶发缺图、纵向滑动时画面横移和快速开合错位。",
          "修复退出随记后立即切图时大图消失，以及慢网下旧请求覆盖当前图片。",
          "修复随记切图未完整滑出、滑入屏幕的问题。"
        ],
        en: [
          "Fixed occasional missing INDEX images, horizontal drift during vertical scrolling, and misalignment after rapid toggles.",
          "Fixed photos disappearing after notes exit and stale slow-network requests overriding the current selection.",
          "Fixed notes photos not completing their off-screen exit and entry during swipes."
        ]
      },
      removals: {
        cn: ["移除桌面端大图滑动与首页倾斜透视。"],
        en: ["Removed desktop main-photo swiping and home-page tilt perspective."]
      },
      additions: {
        cn: [
          "新增索引图库和照片取色随记背景，并为 14 张照片补充双语地点与随记。",
          "新增 2 张照片，图库增至 45 张。"
        ],
        en: [
          "Added the INDEX gallery and photo-derived notes backgrounds, plus bilingual locations and notes for 14 photos.",
          "Added 2 photos, bringing the gallery to 45 photos."
        ]
      }
    }
  },
  {
    versions: ["v1.2.1", "v1.2.0"],
    date: "2026-07-12",
    categories: {
      optimizations: {
        cn: [
          "增强手机倾斜对首页文字重力的双轴控制，并统一全站主题切换节奏。",
          "优化移动端连续滑动与 rel 返回首页的照片落位。"
        ],
        en: [
          "Improved two-axis mobile letter gravity and unified theme-transition timing across the site.",
          "Improved continuous mobile swiping and the rel-to-home photo landing."
        ]
      },
      fixes: {
        cn: [
          "修复快速滑动丢手势、边界闪烁、首页开场跳图和返回二段跳。",
          "修复菜单文字、图标与头像主题切换不同步。"
        ],
        en: [
          "Fixed dropped rapid gestures, edge flashes, home intro jumps, and two-stage return motion.",
          "Fixed theme timing differences between menu text, icons, and the avatar."
        ]
      },
      removals: {
        cn: ["移除顶部图标各自的模糊底板，改用共享渐隐背景。"],
        en: ["Replaced separate blurred plates behind the top icons with one shared fading background."]
      },
      additions: {
        cn: ["新增 L4RXX 合体彩蛋和最多三步的连续滑动记忆。"],
        en: ["Added the L4RXX reunion easter egg and a bounded three-step swipe memory."]
      }
    }
  },
  {
    versions: ["v1.1.3"],
    date: "2026-07-10",
    categories: {
      optimizations: {
        cn: ["优化移动端大图滑动、随记图文布局、语言主题过渡与设备方向文字重力。"],
        en: ["Improved mobile photo swiping, notes layout, language and theme transitions, and device-driven letter gravity."]
      },
      fixes: {
        cn: ["修复首尾绕回、取消手势闪烁、缩略图失效、系统主题不同步和随记重复切换错位。"],
        en: ["Fixed edge wrapping, cancelled-swipe flashes, thumbnail failures, theme desynchronization, and notes layout shifts."]
      },
      removals: {
        cn: ["移除移动端下滑沉浸大图手势，保留随记下滑退出。"],
        en: ["Removed the downward immersive-photo gesture while keeping swipe-down notes exit."]
      },
      additions: {
        cn: ["新增移动端随记上滑进入、下滑退出和菜单日志入口。"],
        en: ["Added mobile swipe-up notes entry, swipe-down exit, and the menu log entry."]
      }
    }
  },
  {
    versions: ["v1.1.2", "v1.1.1", "v1.1.0"],
    date: "2026-07-09",
    categories: {
      optimizations: {
        cn: [
          "优化首页图片顺序、返回位置、L4RXX 重力范围和随记图文比例。",
          "统一日志、语言与主题切换的过渡。"
        ],
        en: [
          "Improved home photo order, return position, L4RXX gravity range, and notes proportions.",
          "Unified log, language, and theme transitions."
        ]
      },
      fixes: {
        cn: ["修复首页刷新与返回状态、错误 rel 编号、随记重复切换和日志主题闪烁。"],
        en: ["Fixed home refresh and return state, incorrect rel ids, repeated notes switching, and log theme flicker."]
      },
      removals: {
        cn: ["移除旧 INFO 按钮和面向访客的技术日志预览。"],
        en: ["Removed the old INFO button and visitor-facing technical log previews."]
      },
      additions: {
        cn: ["新增随记模式、暗色主题、语言切换、菜单日志和首页彩蛋。"],
        en: ["Added notes mode, dark theme, language switching, menu logs, and a home-page easter egg."]
      }
    }
  },
  {
    versions: ["v1.0.1", "v1.0.0"],
    date: "2026-07-07",
    categories: {
      optimizations: {
        cn: ["建立首页、作品页和 rel 页的浏览结构，并生成适合网页加载的图片与缩略图。"],
        en: ["Established the home, work, and rel browsing structure with web-ready images and thumbnails."]
      },
      fixes: {
        cn: ["修复新增照片与图库数据不同步。"],
        en: ["Fixed synchronization between new photos and gallery data."]
      },
      removals: {
        cn: ["移除一张不再展示的照片。"],
        en: ["Removed one photo that was no longer displayed."]
      },
      additions: {
        cn: ["上线摄影作品集，并新增 18 张照片，公开图库由 25 张扩展至 43 张。"],
        en: ["Launched the photography portfolio and added 18 photos, expanding the public gallery from 25 to 43 photos."]
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
  const hasIncomingTransition = beginIncomingPageTransition();
  initChrome();
  initLanguageSwitch();
  initEmailCopy();
  initThemeSwitch();
  initReleaseLogs();
  initNavLogsMode();
  const page = document.body.dataset.page;
  if (page === "logs" || page === "work") {
    startLoadingSequence();
    if (hasIncomingTransition) requestAnimationFrame(finishIncomingPageTransition);
    return;
  }
  try {
    photos = await loadPhotos();
    const openingImagesReady = page === "home" ? renderOverview() : null;
    if (page === "home" && hasIncomingTransition) {
      Promise.resolve(openingImagesReady).then(finishIncomingPageTransition);
    }
    if (page === "focus") {
      renderFocus();
      if (hasIncomingTransition) waitForFocusOpeningImage().then(finishIncomingPageTransition);
    }
    startLoadingSequence(openingImagesReady);
  } catch (error) {
    showGalleryLoadError(error);
    finishIncomingPageTransition();
  }
});

async function loadPhotos() {
  const hostname = window.location.hostname;
  const isLocalPreview = hostname === "localhost"
    || hostname === "::1"
    || /^127\./.test(hostname)
    || /^10\./.test(hostname)
    || /^192\.168\./.test(hostname)
    || /^172\.(1[6-9]|2\d|3[01])\./.test(hostname);
  const manifestUrl = isLocalPreview
    ? "content/photos.json"
    : `content/photos.json?v=${PHOTO_MANIFEST_VERSION}`;
  const response = await fetch(manifestUrl, { cache: isLocalPreview ? "no-cache" : "default" });
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
  const medium = photo.medium || full;
  const thumb = photo.thumb || full;
  return {
    id,
    title,
    category: photo.category || "IMAGE",
    caption: photo.caption || "A frame from the local archive.",
    note: photo.note || photo.notes || DEFAULT_PHOTO_NOTE_CN,
    noteCn: photo.noteCn || photo.note_cn || photo.note || photo.notes || DEFAULT_PHOTO_NOTE_CN,
    noteEn: photo.noteEn || photo.note_en || photo.noteEnglish || (isDefaultPhotoNote(photo.note || photo.notes) ? DEFAULT_PHOTO_NOTE_EN : photo.note || photo.notes || DEFAULT_PHOTO_NOTE_EN),
    locationCn: String(photo.locationCn || photo.location_cn || photo.location || "").trim(),
    locationEn: String(photo.locationEn || photo.location_en || photo.locationEnglish || photo.location || "").trim(),
    alt: photo.alt || `l4rxx photo ${String(id).padStart(2, "0")} - ${title}`,
    original: photo.original || full,
    full,
    medium,
    thumb,
    width: Math.max(0, Number(photo.width) || 0),
    height: Math.max(0, Number(photo.height) || 0),
    mediumWidth: Math.max(0, Number(photo.mediumWidth) || Number(photo.width) || 0),
    mediumHeight: Math.max(0, Number(photo.mediumHeight) || Number(photo.height) || 0),
    thumbWidth: Math.max(0, Number(photo.thumbWidth) || Number(photo.width) || 0),
    thumbHeight: Math.max(0, Number(photo.thumbHeight) || Number(photo.height) || 0),
    placeholderColor: normalizePhotoPlaceholderColor(photo.placeholderColor),
    date: photo.date || ""
  };
}

function normalizePhotoPlaceholderColor(value) {
  const color = String(value || "").trim();
  return /^#[0-9a-f]{6}$/i.test(color) ? color.toUpperCase() : PHOTO_PLACEHOLDER_FALLBACK;
}

function getPhotoImageSizeAttributes(photo, useThumb = false) {
  const width = useThumb ? photo?.thumbWidth : photo?.width;
  const height = useThumb ? photo?.thumbHeight : photo?.height;
  return width > 0 && height > 0 ? ` width="${width}" height="${height}"` : "";
}

function getPhotoAspectRatio(photo, useThumb = false) {
  const width = useThumb ? photo?.thumbWidth : photo?.width;
  const height = useThumb ? photo?.thumbHeight : photo?.height;
  return width > 0 && height > 0 ? width / height : 1;
}

function getPhotoPlaceholderStyle(photo, useThumb = false) {
  return `--photo-placeholder-color:${normalizePhotoPlaceholderColor(photo?.placeholderColor)};--photo-placeholder-ratio:${getPhotoAspectRatio(photo, useThumb).toFixed(6)}`;
}

function applyPhotoPlaceholder(host, photo, useThumb = false) {
  if (!host) return;
  host.classList.add("photo-placeholder", "is-photo-loading");
  host.classList.remove("is-photo-ready");
  host.style.setProperty("--photo-placeholder-color", normalizePhotoPlaceholderColor(photo?.placeholderColor));
  host.style.setProperty("--photo-placeholder-ratio", getPhotoAspectRatio(photo, useThumb).toFixed(6));
}

function getPhotoSourceUrl(source) {
  if (!source) return "";
  try {
    return new URL(source, window.location.href).href;
  } catch (error) {
    return source;
  }
}

function watchPhotoPlaceholderImage(image, host, expectedSource = "") {
  if (!image || !host) return;
  photoPlaceholderCleanups.get(image)?.();
  const runId = String(++photoPlaceholderRun);
  const expectedUrl = getPhotoSourceUrl(expectedSource || image.dataset.src || image.getAttribute("src") || "");
  let settled = false;

  const cleanup = () => {
    image.removeEventListener("load", handleLoad);
    image.removeEventListener("error", handleError);
    if (photoPlaceholderCleanups.get(image) === cleanup) photoPlaceholderCleanups.delete(image);
  };
  const isCurrentSource = () => {
    if (image.dataset.photoPlaceholderRun !== runId) return false;
    if (!expectedUrl) return true;
    const currentUrl = getPhotoSourceUrl(image.currentSrc || image.getAttribute("src") || "");
    return currentUrl === expectedUrl;
  };
  const reveal = () => {
    if (settled || !isCurrentSource() || image.naturalWidth <= 0) return;
    settled = true;
    cleanup();
    host.classList.remove("is-photo-loading");
    host.classList.add("is-photo-ready");
  };
  const handleLoad = () => {
    if (!isCurrentSource() || image.naturalWidth <= 0) return;
    if (typeof image.decode === "function") image.decode().then(reveal).catch(reveal);
    else reveal();
  };
  const handleError = () => {
    if (!isCurrentSource()) return;
    settled = true;
    cleanup();
  };

  image.dataset.photoPlaceholderRun = runId;
  host.classList.add("is-photo-loading");
  host.classList.remove("is-photo-ready");
  image.addEventListener("load", handleLoad);
  image.addEventListener("error", handleError);
  photoPlaceholderCleanups.set(image, cleanup);
  if (image.complete && image.naturalWidth > 0) handleLoad();
}

function initializePhotoPlaceholder(host, image, expectedSource = "") {
  if (!host || !image) return;
  watchPhotoPlaceholderImage(image, host, expectedSource || image.dataset.src || image.getAttribute("src") || "");
}

function hydrateDeferredImage(image) {
  const src = image?.dataset?.src;
  const srcset = image?.dataset?.srcset;
  if (!src && !srcset) return;
  if (srcset) {
    image.removeAttribute("data-srcset");
    image.srcset = srcset;
  }
  if (src) {
    image.removeAttribute("data-src");
    image.src = src;
  }
  const placeholder = image?.closest?.(".photo-placeholder");
  if (placeholder && !placeholder.classList.contains("is-photo-ready")) {
    watchPhotoPlaceholderImage(image, placeholder, src || image.getAttribute("src") || "");
  }
}

function createDeferredImageObserver(rootMargin = "600px") {
  if (!("IntersectionObserver" in window)) return null;
  return new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      hydrateDeferredImage(entry.target);
      observer.unobserve(entry.target);
    });
  }, { root: null, rootMargin, threshold: 0.01 });
}

function observeDeferredImages(root, observer) {
  const images = [...root.querySelectorAll("img[data-src]")];
  if (!observer) {
    images.forEach(hydrateDeferredImage);
    return;
  }
  images.forEach((image) => observer.observe(image));
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

function getPhotoLocation(photo) {
  if (!photo) return "";
  return getCurrentLanguage() === "cn"
    ? photo.locationCn || photo.locationEn || ""
    : photo.locationEn || photo.locationCn || "";
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

function ensurePageTransitionVeil() {
  let veil = document.querySelector(".page-transition-veil");
  if (veil) return veil;
  veil = document.createElement("div");
  veil.className = "page-transition-veil";
  veil.setAttribute("aria-hidden", "true");
  document.body.appendChild(veil);
  return veil;
}

function getPageTransitionDuration() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ? 180 : 490;
}

function beginIncomingPageTransition() {
  let state = null;
  try {
    state = JSON.parse(sessionStorage.getItem(PAGE_TRANSITION_STORAGE_KEY) || "null");
    sessionStorage.removeItem(PAGE_TRANSITION_STORAGE_KEY);
  } catch (error) {
    state = null;
  }
  if (!state || Date.now() - Number(state.createdAt || 0) > 10000) return false;
  ensurePageTransitionVeil();
  document.body.classList.add("is-page-transitioning", "is-page-entering");
  return true;
}

function finishIncomingPageTransition() {
  if (!document.body.classList.contains("is-page-entering")) return;
  window.clearTimeout(pageTransitionTimer);
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      document.body.classList.remove("is-page-entering");
      pageTransitionTimer = window.setTimeout(() => {
        document.body.classList.remove("is-page-transitioning");
        pageTransitionTimer = 0;
      }, getPageTransitionDuration());
    });
  });
}

function navigateWithPageTransition(url) {
  if (!url || document.body.classList.contains("is-page-leaving")) return;
  try {
    sessionStorage.setItem(PAGE_TRANSITION_STORAGE_KEY, JSON.stringify({ createdAt: Date.now() }));
  } catch (error) {
    // Navigation still works when session storage is unavailable.
  }
  ensurePageTransitionVeil();
  window.clearTimeout(pageTransitionTimer);
  document.body.classList.add("is-page-transitioning", "is-page-leaving");
  pageTransitionTimer = window.setTimeout(() => {
    window.location.href = url;
  }, getPageTransitionDuration());
}

function waitForFocusOpeningImage() {
  const image = document.querySelector("[data-focus-image]");
  if (!image) return Promise.resolve();
  hydrateDeferredImage(image);
  image.loading = "eager";
  image.fetchPriority = "high";
  return new Promise((resolve) => {
    let timer = 0;
    const cleanup = () => {
      window.clearTimeout(timer);
      image.removeEventListener("load", settle);
      image.removeEventListener("error", settle);
    };
    const settle = () => {
      if (image.complete && image.naturalWidth > 0 && typeof image.decode === "function") {
        image.decode().catch(() => {}).then(() => {
          cleanup();
          resolve();
        });
        return;
      }
      cleanup();
      resolve();
    };
    image.addEventListener("load", settle, { once: true });
    image.addEventListener("error", settle, { once: true });
    timer = window.setTimeout(settle, 5000);
    if (image.complete) settle();
  });
}

function setNavigationOpen(open, screen = document.querySelector(".js-nav-screen"), toggle = document.querySelector(".js-nav-toggle")) {
  const isOpen = Boolean(open);
  window.clearTimeout(navTransitionTimer);
  ensurePageTransitionVeil();
  document.body.classList.add("is-nav-transitioning");
  screen?.setAttribute("aria-hidden", String(!isOpen));
  toggle?.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
  toggle?.setAttribute("aria-expanded", String(isOpen));
  if (isOpen) {
    document.body.classList.remove("nav-closing");
    document.body.classList.add("nav-open", "nav-opening");
  } else {
    document.body.classList.remove("nav-opening");
    document.body.classList.add("nav-closing");
  }
  navTransitionTimer = window.setTimeout(() => {
    if (isOpen) {
      document.body.classList.remove("nav-opening", "is-nav-transitioning");
    } else {
      document.body.classList.remove("nav-open", "nav-closing", "is-nav-transitioning");
    }
    navTransitionTimer = 0;
  }, isOpen ? 620 : 460);
  return isOpen;
}

function initChrome() {
  const toggle = document.querySelector(".js-nav-toggle");
  const screen = document.querySelector(".js-nav-screen");
  if (!toggle || !screen) return;
  ensurePageTransitionVeil();
  toggle.addEventListener("click", () => {
    if (document.body.classList.contains("is-nav-logs")) {
      setNavLogsOpen(false);
      setNavigationOpen(false, screen, toggle);
      return;
    }
    const open = document.body.classList.contains("nav-closing")
      || !document.body.classList.contains("nav-open");
    if (!open) setNavLogsOpen(false);
    setNavigationOpen(open, screen, toggle);
  });
  screen.addEventListener("click", (event) => {
    if (event.target === screen) {
      setNavLogsOpen(false);
      setNavigationOpen(false, screen, toggle);
    }
  });
  screen.addEventListener("click", (event) => {
    const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const targetUrl = new URL(link.href, window.location.href);
    if (targetUrl.origin !== window.location.origin || targetUrl.href === window.location.href) return;
    event.preventDefault();
    navigateWithPageTransition(targetUrl.href);
  });
}

async function copyText(value) {
  let clipboardWrite = null;
  if (navigator.clipboard && window.isSecureContext) {
    try {
      clipboardWrite = navigator.clipboard.writeText(value).then(() => true, () => false);
    } catch (error) {
      clipboardWrite = null;
    }
  }

  const activeElement = document.activeElement;
  const field = document.createElement("textarea");
  field.value = value;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.left = "0";
  field.style.top = "0";
  field.style.width = "1px";
  field.style.height = "1px";
  field.style.padding = "0";
  field.style.border = "0";
  field.style.opacity = ".01";
  field.style.pointerEvents = "none";
  document.body.appendChild(field);
  field.focus({ preventScroll: true });
  field.select();
  field.setSelectionRange(0, value.length);
  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch (error) {
    copied = false;
  }
  field.remove();
  if (activeElement instanceof HTMLElement) activeElement.focus({ preventScroll: true });
  if (copied) return true;
  return clipboardWrite ? clipboardWrite : false;
}

function selectEmailFallback(label) {
  const selection = window.getSelection();
  if (!selection) return;
  const range = document.createRange();
  range.selectNodeContents(label);
  selection.removeAllRanges();
  selection.addRange(range);
}

function initEmailCopy() {
  document.querySelectorAll("[data-copy-email]").forEach((button) => {
    const label = button.querySelector("[data-copy-email-label]");
    const status = button.querySelector("[data-copy-email-status]");
    let resetTimer = 0;

    button.addEventListener("click", async () => {
      const email = String(button.dataset.copyEmail || "").trim();
      if (!email || !label) return;
      const language = getCurrentLanguage();
      const copied = await copyText(email);
      window.clearTimeout(resetTimer);
      label.textContent = copied ? languageCopy[language]["contact.copied"] : email;
      if (status) status.textContent = copied ? languageCopy[language]["contact.copyStatus"] : languageCopy[language]["contact.copyFailed"];
      button.classList.toggle("is-copied", copied);
      button.classList.toggle("is-copy-failed", !copied);
      if (!copied) selectEmailFallback(label);
      resetTimer = window.setTimeout(() => {
        const currentLanguage = getCurrentLanguage();
        label.textContent = languageCopy[currentLanguage].contact;
        if (status) status.textContent = "";
        button.classList.remove("is-copied", "is-copy-failed");
      }, copied ? 1600 : 6000);
    });
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
      const localizedItems = entry.categories?.[category.key]?.[next] || [];
      if (!localizedItems.length) return "";
      const items = localizedItems
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
          <h2 class="release-entry__date"><time datetime="${escapeReleaseLogHtml(entry.date)}">${escapeReleaseLogHtml(entry.date)}</time></h2>
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
    setNavigationOpen(true, screen, navToggle);
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
    const persistentLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    const legacySessionLanguage = sessionStorage.getItem(LANGUAGE_STORAGE_KEY);
    saved = persistentLanguage || legacySessionLanguage || "en";
    if (!persistentLanguage && (legacySessionLanguage === "cn" || legacySessionLanguage === "en")) {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, legacySessionLanguage);
    }
    sessionStorage.removeItem(LANGUAGE_STORAGE_KEY);
  } catch (error) {
    saved = "en";
  }
  if (saved !== "cn" && saved !== "en") saved = "en";

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
      localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
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
  let themeMode = "auto";
  let themeTransitionTimer = 0;

  const getSystemTheme = () => systemTheme?.matches ? "dark" : "light";
  const getAppliedTheme = () => document.documentElement.dataset.theme === "dark" ? "dark" : "light";
  const readThemeMode = () => {
    try {
      const storedMode = localStorage.getItem(THEME_MODE_STORAGE_KEY);
      if (storedMode === "light" || storedMode === "dark" || storedMode === "auto") return storedMode;
      const legacyTheme = localStorage.getItem(THEME_STORAGE_KEY);
      return legacyTheme === "light" || legacyTheme === "dark" ? legacyTheme : "auto";
    } catch (error) {
      return themeMode;
    }
  };

  const clearThemeTransition = () => {
    window.clearTimeout(themeTransitionTimer);
    themeTransitionTimer = 0;
    document.documentElement.classList.remove("is-theme-transitioning");
    document.body.classList.remove("is-theme-transitioning");
  };

  const startThemeTransition = () => {
    if (reduceMotion?.matches || !document.body.classList.contains("has-loaded")) return;
    window.clearTimeout(themeTransitionTimer);
    const alreadyTransitioning = document.body.classList.contains("is-theme-transitioning");
    if (!alreadyTransitioning) {
      document.documentElement.classList.add("is-theme-transitioning");
      document.body.classList.add("is-theme-transitioning");
      document.body.offsetHeight;
    }
    themeTransitionTimer = window.setTimeout(clearThemeTransition, 560);
  };

  const applyTheme = (theme, animate = false) => {
    const next = theme === "dark" ? "dark" : "light";
    const shouldAnimate = animate && next !== currentTheme;
    if (shouldAnimate) startThemeTransition();
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
      localStorage.setItem(THEME_MODE_STORAGE_KEY, mode);
      if (mode === "auto") localStorage.removeItem(THEME_STORAGE_KEY);
      else localStorage.setItem(THEME_STORAGE_KEY, mode);
    } catch (error) {
      return;
    }
  };

  const syncThemeMode = (animate = true) => {
    themeMode = readThemeMode();
    if (themeMode === "auto") applySystemTheme(animate);
    else applyTheme(themeMode, animate);
  };

  const toggleManualTheme = () => {
    const baseTheme = getAppliedTheme();
    const nextTheme = baseTheme === "dark" ? "light" : "dark";
    themeMode = nextTheme;
    persistThemeMode(themeMode);
    applyTheme(nextTheme, true);
  };

  if (toggle) {
    toggle.addEventListener("click", toggleManualTheme);
  }

  const handleSystemThemeChange = (event) => {
    if (themeMode !== "auto") return;
    applyTheme(event.matches ? "dark" : "light", true);
  };
  if (systemTheme?.addEventListener) systemTheme.addEventListener("change", handleSystemThemeChange);
  else systemTheme?.addListener?.(handleSystemThemeChange);

  window.addEventListener("storage", (event) => {
    if (event.key !== null && event.key !== THEME_MODE_STORAGE_KEY && event.key !== THEME_STORAGE_KEY) return;
    syncThemeMode(true);
  });
  window.addEventListener("pageshow", () => syncThemeMode(true));
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden && themeMode === "auto") applySystemTheme(true);
  });

  syncThemeMode(false);
  persistThemeMode(themeMode);
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
  if (!grid) return Promise.resolve();
  grid.innerHTML = "";
  grid.style.minHeight = "";

  const returnState = readOverviewReturnState();
  prepareOverviewPhotos(returnState);
  overviewBatchSequence = 0;
  overviewImageObserver?.disconnect();
  overviewImageObserver = createDeferredImageObserver("720px");
  const openingItems = appendOverviewBatch(grid, createOverviewBatch(true), true);
  const isReturning = handleOverviewReturn(grid, returnState);
  if (!isReturning) initializeOverviewItems();
  initializeInfinityScroll(grid);
  initializeOverviewInteraction(grid);

  const captureOverviewReturn = (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const link = target?.closest("a[href*='focus.html?rel=']");
    if (!link || !grid.contains(link)) return;
    storeOverviewReturn(link);
    if (event.type !== "click"
      || event.defaultPrevented
      || event.button !== 0
      || event.metaKey
      || event.ctrlKey
      || event.shiftKey
      || event.altKey) return;
    event.preventDefault();
    navigateWithPageTransition(link.href);
  };
  grid.addEventListener("pointerdown", captureOverviewReturn, { capture: true, passive: true });
  grid.addEventListener("click", captureOverviewReturn, { capture: true });
  return isReturning ? Promise.resolve() : waitForOverviewOpeningImages(openingItems);
}

function waitForOverviewOpeningImages(items) {
  const images = items
    .filter((item) => item.classList.contains("is-visible"))
    .map((item) => item.querySelector("img"))
    .filter(Boolean);
  if (!images.length) return Promise.resolve();

  return Promise.all(images.map(waitForOverviewOpeningImage)).then(() => {
    prepaintOverviewOpeningImages(images);
  });
}

function prepaintOverviewOpeningImages(images) {
  images.forEach((image) => {
    if (!(image.complete && image.naturalWidth > 0)) return;
    const host = image.closest(".fs-media");
    if (!host || host.querySelector(".overview-opening-raster")) return;
    const width = Math.max(1, image.offsetWidth || image.naturalWidth);
    const height = Math.max(1, image.offsetHeight || image.naturalHeight);
    const pixelRatio = Math.min(2, Math.max(1, window.devicePixelRatio || 1));
    const canvas = document.createElement("canvas");
    canvas.className = "overview-opening-raster";
    canvas.width = Math.min(image.naturalWidth, Math.ceil(width * pixelRatio));
    canvas.height = Math.min(image.naturalHeight, Math.ceil(height * pixelRatio));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const context = canvas.getContext("2d", { alpha: false });
    if (!context) return;
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    host.appendChild(canvas);
  });
}

function releaseOverviewOpeningRasters() {
  const rasters = [...document.querySelectorAll(".overview-opening-raster")];
  if (!rasters.length) return;
  rasters.forEach((raster) => raster.classList.add("is-releasing"));
  window.setTimeout(() => rasters.forEach((raster) => raster.remove()), 280);
}

function waitForOverviewOpeningImage(image) {
  return new Promise((resolve) => {
    const source = image.dataset.src || image.getAttribute("src") || "";
    const host = image.closest(".photo-placeholder");
    let retryCount = 0;
    let retryTimer = 0;
    let finished = false;

    const cleanup = () => {
      window.clearTimeout(retryTimer);
      image.removeEventListener("load", decode);
      image.removeEventListener("error", retry);
    };
    const finish = () => {
      if (finished || image.naturalWidth <= 0) return;
      finished = true;
      cleanup();
      if (host) {
        host.classList.remove("is-photo-loading");
        host.classList.add("is-photo-ready");
      }
      resolve();
    };
    const retry = () => {
      if (finished) return;
      cleanup();
      const delay = Math.min(
        OVERVIEW_OPENING_RETRY_MAX_DELAY,
        OVERVIEW_OPENING_RETRY_DELAY * (2 ** retryCount)
      );
      retryCount++;
      retryTimer = window.setTimeout(() => {
        const retryUrl = new URL(source, window.location.href);
        retryUrl.searchParams.set("overview-retry", String(retryCount));
        image.addEventListener("load", decode);
        image.addEventListener("error", retry);
        image.src = retryUrl.href;
        if (host) watchPhotoPlaceholderImage(image, host, retryUrl.href);
      }, delay);
    };
    const decode = () => {
      if (finished) return;
      if (image.naturalWidth <= 0) {
        retry();
        return;
      }
      if (typeof image.decode === "function") image.decode().then(finish).catch(retry);
      else finish();
    };

    image.loading = "eager";
    image.fetchPriority = "high";
    image.addEventListener("load", decode);
    image.addEventListener("error", retry);
    hydrateDeferredImage(image);
    if (image.complete) decode();
  });
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

  const fillCount = (5 - (items.length % 5)) % 5;
  const fillStart = Math.max(0, Math.floor((sourcePhotos.length - fillCount) / 2));
  for (let fillIndex = 0; fillIndex < fillCount; fillIndex++) {
    const photoIndexToFill = (fillStart + fillIndex) % sourcePhotos.length;
    items.push(createOverviewLink(sourcePhotos[photoIndexToFill], photoIndexToFill, isOriginal, items.length, "infinity-item--fill"));
  }
  return items;
}

function getOverviewPhotoSizeClass(photo) {
  const width = Number(photo?.width || 0);
  const height = Number(photo?.height || 0);
  if (!(width > 0 && height > 0)) return "overview-size--natural";
  const ratio = width / height;
  if (ratio >= .96 && ratio <= 1.04) return "overview-size--square";
  if (ratio > 2) return "overview-size--panorama";
  if (ratio > 1.65) return "overview-size--wide";
  if (ratio >= 1.15) return "overview-size--landscape";
  if (ratio > 1.04) return "overview-size--landscape-soft";
  if (ratio < .68) return "overview-size--tall";
  return "overview-size--portrait";
}

function createOverviewLink(photo, index, isOriginal, cellIndex, extraClass = "") {
  const link = document.createElement("a");
  link.className = `overview-item infinity-item--batch infinity-item--original${extraClass ? ` ${extraClass}` : ""}`;
  link.classList.add(getOverviewPhotoSizeClass(photo));
  const columnIndex = ((cellIndex % 5) + 5) % 5;
  if (columnIndex === 0 || columnIndex === 4) link.classList.add("overview-size--edge");
  if (isOriginal && cellIndex <= 14) link.classList.add("is-visible");
  const photoRel = getPhotoRel(photo, index);
  const prioritize = isOriginal && cellIndex < 5;
  link.href = `focus.html?rel=${photoRel}`;
  link.dataset.rel = String(photoRel);
  link.dataset.overviewSlot = String(cellIndex);
  const thumbSource = prioritize ? `src="${photo.thumb}"` : `data-src="${photo.thumb}"`;
  link.innerHTML = `<span class="fs-media photo-placeholder is-photo-loading" style="${getPhotoPlaceholderStyle(photo, true)}"><img ${thumbSource} alt="${photo.alt}"${getPhotoImageSizeAttributes(photo, true)} loading="${prioritize ? "eager" : "lazy"}" fetchpriority="${prioritize ? "high" : "low"}" decoding="async"></span>`;
  return link;
}

function getOverviewReturnAnchor(link, rel, scrollY) {
  const image = link?.querySelector("img");
  const rect = image?.getBoundingClientRect?.() || link?.getBoundingClientRect?.();
  if (!rect || !(rect.width > 0 && rect.height > 0)) return null;
  const batch = Number(link.dataset.overviewBatch);
  const slot = Number(link.dataset.overviewSlot);
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;
  return {
    rel,
    batch: Number.isInteger(batch) && batch >= 0 ? batch : null,
    slot: Number.isInteger(slot) && slot >= 0 ? slot : null,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    centerXRatio: window.innerWidth > 0 ? centerX / window.innerWidth : 0.5,
    centerYRatio: window.innerHeight > 0 ? centerY / window.innerHeight : 0.5,
    documentCenterY: scrollY + centerY,
    width: rect.width,
    height: rect.height
  };
}

function updateOverviewPhotoPlaceholderGeometry(items = null) {
  const mediaNodes = (items ? [...items] : [...document.querySelectorAll(".overview-item .fs-media.photo-placeholder")])
    .map((item) => item?.matches?.(".fs-media") ? item : item?.querySelector?.(".fs-media.photo-placeholder"))
    .filter(Boolean);
  const measurements = mediaNodes.map((media) => {
    const image = media.querySelector("img");
    const width = Math.max(1, Number(image?.getAttribute("width")) || image?.naturalWidth || 1);
    const height = Math.max(1, Number(image?.getAttribute("height")) || image?.naturalHeight || 1);
    const availableWidth = media.clientWidth;
    const availableHeight = media.clientHeight;
    const fit = Math.min(1, availableWidth / width, availableHeight / height);
    return { media, width: width * fit, height: height * fit };
  });
  measurements.forEach(({ media, width, height }) => {
    media.style.setProperty("--photo-placeholder-width", `${width.toFixed(2)}px`);
    media.style.setProperty("--photo-placeholder-height", `${height.toFixed(2)}px`);
  });
}

function appendOverviewBatch(grid, batch, isInitial = false) {
  const fragment = document.createDocumentFragment();
  const batchId = overviewBatchSequence++;
  const appendedItems = [];
  batch.forEach((item) => {
    const clone = isInitial ? item : item.cloneNode(true);
    if (!isInitial) {
      clone.classList.remove("infinity-item--original", "is-visible", "is-return-target");
      clone.classList.add("infinity-item--clone");
      clone.removeAttribute("style");
      clone.querySelectorAll("[style]").forEach((child) => child.removeAttribute("style"));
    }
    clone.dataset.overviewBatch = String(batchId);
    appendedItems.push(clone);
    fragment.appendChild(clone);
  });
  grid.appendChild(fragment);
  appendedItems.forEach((item) => {
    const media = item.querySelector?.(".fs-media.photo-placeholder");
    const image = media?.querySelector("img");
    if (media && image) initializePhotoPlaceholder(media, image, image.dataset.src || image.getAttribute("src") || "");
  });
  updateOverviewPhotoPlaceholderGeometry(appendedItems);
  observeDeferredImages(grid, overviewImageObserver);
  grid.dispatchEvent(new CustomEvent("overview:batchappend", {
    detail: { batchId, items: appendedItems }
  }));
  return appendedItems;
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
  const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
  const state = {
    rel: rel || 1,
    scrollY,
    createdAt: Date.now(),
    order: getOverviewOrder(),
    anchor: getOverviewReturnAnchor(link, rel || 1, scrollY)
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
  const requestedTargetY = Math.max(0, Number(state?.scrollY || 0));
  const anchorBatch = Number(state?.anchor?.batch);
  const requiredBatch = Number.isInteger(anchorBatch)
    ? Math.max(0, Math.min(OVERVIEW_MAX_RECYCLED_BATCHES, anchorBatch))
    : 0;
  while (overviewBatchSequence <= requiredBatch && overviewBatchSequence <= OVERVIEW_MAX_RECYCLED_BATCHES) {
    appendOverviewBatch(grid, createOverviewBatch(false), false);
  }
  while (
    overviewBatchSequence <= OVERVIEW_MAX_RECYCLED_BATCHES
    && grid.offsetTop + grid.scrollHeight - (requestedTargetY + window.innerHeight) <= 700
  ) {
    appendOverviewBatch(grid, createOverviewBatch(false), false);
  }
  const maxReturnScrollY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
  const targetY = Math.min(requestedTargetY, maxReturnScrollY);

  requestAnimationFrame(() => {
    window.scrollTo({ top: targetY, left: 0, behavior: "auto" });
    requestAnimationFrame(() => {
      const target = findReturnTarget(grid, rel, targetY, state?.anchor);
      if (target) alignOverviewReturnTarget(target, state?.anchor);
      requestAnimationFrame(() => {
        finishIncomingPageTransition();
      });
    });
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

function getOverviewReturnTargetImage(target) {
  return target?.querySelector?.("img") || null;
}

function getOverviewReturnRect(target) {
  const image = getOverviewReturnTargetImage(target);
  const rect = image?.getBoundingClientRect?.();
  return rect
    && [rect.left, rect.top, rect.width, rect.height].every(Number.isFinite)
    && rect.width > 8
    && rect.height > 8
    ? rect
    : null;
}

function getOverviewReturnRatio(value, fallback = 0.5) {
  const ratio = Number(value);
  return Number.isFinite(ratio) ? Math.max(0, Math.min(1, ratio)) : fallback;
}

function alignOverviewReturnTarget(target, anchor = null) {
  const rect = getOverviewReturnRect(target);
  if (!rect) return false;
  const viewportHeight = Math.max(1, window.innerHeight);
  const margin = Math.max(8, Math.min(24, viewportHeight * 0.025));
  const maxHalfHeight = Math.max(0, (viewportHeight - margin * 2) / 2);
  const halfHeight = Math.min(rect.height / 2, maxHalfHeight);
  const minCenterY = margin + halfHeight;
  const maxCenterY = viewportHeight - margin - halfHeight;
  const desiredRatio = getOverviewReturnRatio(anchor?.centerYRatio);
  const desiredCenterY = maxCenterY >= minCenterY
    ? Math.max(minCenterY, Math.min(maxCenterY, desiredRatio * viewportHeight))
    : viewportHeight / 2;
  const currentCenterY = rect.top + rect.height / 2;
  const currentScrollY = window.scrollY || document.documentElement.scrollTop || 0;
  const maxScrollY = Math.max(0, document.documentElement.scrollHeight - viewportHeight);
  const nextScrollY = Math.max(0, Math.min(maxScrollY, currentScrollY + currentCenterY - desiredCenterY));
  if (Math.abs(nextScrollY - currentScrollY) > 0.5) {
    window.scrollTo({ top: nextScrollY, left: 0, behavior: "auto" });
  }
  const alignedRect = getOverviewReturnRect(target);
  if (!alignedRect) return false;
  const centerX = alignedRect.left + alignedRect.width / 2;
  const centerY = alignedRect.top + alignedRect.height / 2;
  return centerX >= 0 && centerX <= window.innerWidth && centerY >= 0 && centerY <= viewportHeight;
}

function findReturnTarget(grid, rel, targetY, anchor = null) {
  const candidates = [...grid.querySelectorAll(`a[data-rel="${rel}"]`)];
  if (!candidates.length) return null;
  const anchorRel = Number(anchor?.rel);
  const anchorBatch = Number(anchor?.batch);
  const anchorSlot = Number(anchor?.slot);
  if (
    anchorRel === rel
    && Number.isInteger(anchorBatch)
    && Number.isInteger(anchorSlot)
  ) {
    const exactTarget = candidates.find((candidate) => {
      return Number(candidate.dataset.overviewBatch) === anchorBatch
        && Number(candidate.dataset.overviewSlot) === anchorSlot;
    });
    if (exactTarget) return exactTarget;
  }
  const currentScrollY = window.scrollY || document.documentElement.scrollTop || 0;
  const fallbackDocumentCenterY = targetY + getOverviewReturnRatio(anchor?.centerYRatio) * window.innerHeight;
  const desiredDocumentCenterY = Number.isFinite(Number(anchor?.documentCenterY))
    ? Number(anchor.documentCenterY)
    : fallbackDocumentCenterY;
  const desiredCenterX = getOverviewReturnRatio(anchor?.centerXRatio) * window.innerWidth;
  const getCandidateScore = (candidate) => {
    const rect = getOverviewReturnRect(candidate) || candidate.getBoundingClientRect();
    const documentCenterY = currentScrollY + rect.top + rect.height / 2;
    const centerX = rect.left + rect.width / 2;
    return Math.abs(documentCenterY - desiredDocumentCenterY) + Math.abs(centerX - desiredCenterX) * 0.35;
  };
  return candidates.reduce((best, candidate) => {
    return getCandidateScore(candidate) < getCandidateScore(best) ? candidate : best;
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

  const getBatchNodes = (batchId) => [...grid.querySelectorAll(`[data-overview-batch="${batchId}"]`)];
  const getCloneBatchIds = () => {
    const ids = [];
    const seen = new Set();
    grid.querySelectorAll("[data-overview-batch]").forEach((item) => {
      const id = Number(item.dataset.overviewBatch);
      if (!Number.isFinite(id) || id === 0 || seen.has(id)) return;
      seen.add(id);
      ids.push(id);
    });
    return ids;
  };
  const recycleBatchToEnd = (batchId) => {
    const nodes = getBatchNodes(batchId);
    const anchor = nodes[nodes.length - 1]?.nextElementSibling;
    if (!nodes.length || !anchor) return false;
    const beforeTop = anchor.offsetTop;
    const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
    const fragment = document.createDocumentFragment();
    nodes.forEach((node) => fragment.appendChild(node));
    grid.appendChild(fragment);
    const scrollDelta = anchor.offsetTop - beforeTop;
    if (Math.abs(scrollDelta) > 0.5) window.scrollTo({ top: Math.max(0, scrollY + scrollDelta), left: 0, behavior: "auto" });
    grid.dispatchEvent(new CustomEvent("overview:batchrecycle"));
    return true;
  };

  overviewScrollHandler = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    if (grid.offsetTop + grid.scrollHeight - (scrollTop + window.innerHeight) > 500) return;
    const cloneBatchIds = getCloneBatchIds();
    if (cloneBatchIds.length < OVERVIEW_MAX_RECYCLED_BATCHES) appendOverviewBatch(grid, batch, false);
    else recycleBatchToEnd(cloneBatchIds[0]);
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
  let introCleanup = null;
  let started = false;
  let activeItem = null;
  let nearItems = [];
  let pieces = [];
  let letterPieces = [];
  let figurePiece = null;
  const photoHitTimers = new Map();
  let lastTime = 0;
  let lastScrollY = window.scrollY || document.documentElement.scrollTop || 0;
  let physicsStartedAt = 0;
  let physicsWakeTimer = 0;
  let physicsThrottleTimer = 0;
  let physicsSleeping = false;
  let physicsFramePending = false;
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
  let hasReachedSettleZone = false;
  let restTargetKey = "";
  let cachedRestTargets = new Map();
  let photoColliderCache = [];
  let photoColliderCacheAt = 0;
  let photoColliderCacheScrollY = NaN;
  let photoColliderCacheWidth = 0;
  let photoColliderCacheHeight = 0;
  const collisionCandidates = new Set();
  let collisionObserver = null;
  const ORIENTATION_LOW_PASS_RATE = 0.12;
  const MOTION_LOW_PASS_RATE = 0.08;
  const motionGestureOptions = { passive: true };

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const isMobile = () => window.innerWidth <= 768;
  const canMoveOverviewPhotos = () => !isMobile() && Boolean(window.matchMedia?.("(hover: hover) and (pointer: fine)").matches);
  const idleAttractionRadius = () => window.innerHeight * (isMobile() ? 0.66 : 0.68);
  const photoAvoidRadius = () => isMobile() ? 10 : 16;
  const getSoftCollisionThreshold = () => isMobile() ? 0.82 : 0.98;
  const scheduleFrame = (callback) => {
    return window.requestAnimationFrame(callback);
  };
  const cancelFrame = (id) => {
    window.cancelAnimationFrame(id);
  };
  const schedulePhysicsFrame = () => {
    if (!started || physicsFramePending || document.hidden) return;
    physicsSleeping = false;
    physicsFramePending = true;
    frame = scheduleFrame((time) => {
      physicsFramePending = false;
      frame = 0;
      tick(time);
    });
  };
  const schedulePhysicsAfter = (delay) => {
    if (!started || physicsFramePending || physicsThrottleTimer || document.hidden) return;
    physicsSleeping = false;
    physicsThrottleTimer = window.setTimeout(() => {
      physicsThrottleTimer = 0;
      schedulePhysicsFrame();
    }, Math.max(4, delay));
  };
  const wakePhysics = () => {
    const wasSleeping = physicsSleeping || (!physicsFramePending && !physicsThrottleTimer);
    window.clearTimeout(physicsWakeTimer);
    physicsWakeTimer = 0;
    window.clearTimeout(physicsThrottleTimer);
    physicsThrottleTimer = 0;
    physicsSleeping = false;
    if (wasSleeping) lastTime = 0;
    schedulePhysicsFrame();
  };
  const sleepPhysicsUntil = (wakeAt, now) => {
    physicsSleeping = true;
    window.clearTimeout(physicsThrottleTimer);
    physicsThrottleTimer = 0;
    window.clearTimeout(physicsWakeTimer);
    physicsWakeTimer = 0;
    if (!Number.isFinite(wakeAt) || wakeAt <= now) return;
    physicsWakeTimer = window.setTimeout(wakePhysics, Math.max(24, wakeAt - now));
  };
  const blendMotion = (nextX, nextY, nextTwist = 0, rate = 0.18) => {
    motionInfluence.x += (clamp(nextX, -1, 1) - motionInfluence.x) * rate;
    motionInfluence.y += (clamp(nextY, -1, 1) - motionInfluence.y) * rate;
    motionInfluence.twist += (clamp(nextTwist, -1, 1) - motionInfluence.twist) * rate;
  };
  const getMotionWakeStrength = () => Math.abs(motionInfluence.x) + Math.abs(motionInfluence.y) + Math.abs(motionInfluence.twist) * 0.28;
  const invalidatePhotoColliderCache = () => {
    photoColliderCacheAt = 0;
    restTargetKey = "";
    cachedRestTargets = new Map();
  };
  const observeCollisionItems = (items) => {
    if (!collisionObserver) return;
    items.forEach((item) => {
      if (item?.matches?.(".overview-item[href]")) collisionObserver.observe(item);
    });
  };
  const handleOverviewBatchAppend = (event) => {
    observeCollisionItems(event.detail?.items || []);
    invalidatePhotoColliderCache();
  };
  const handleOverviewBatchRecycle = () => invalidatePhotoColliderCache();
  const setupCollisionObserver = () => {
    if (!("IntersectionObserver" in window)) return;
    collisionObserver = new IntersectionObserver((entries) => {
      let changed = false;
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (!collisionCandidates.has(entry.target)) {
            collisionCandidates.add(entry.target);
            changed = true;
          }
        } else if (collisionCandidates.delete(entry.target)) {
          changed = true;
        }
      });
      if (changed) invalidatePhotoColliderCache();
    }, { root: null, rootMargin: "180px 180px", threshold: 0.001 });
    observeCollisionItems([...grid.querySelectorAll(".overview-item[href]")]);
    grid.addEventListener("overview:batchappend", handleOverviewBatchAppend);
    grid.addEventListener("overview:batchrecycle", handleOverviewBatchRecycle);
  };
  const getPieceBox = (piece) => {
    if (piece.type === "figure") {
      const collider = piece.collider || { centerX: 0.51, centerY: 0.51, radiusX: 0.425, radiusY: 0.476 };
      const left = clamp(collider.centerX - collider.radiusX, 0, 1);
      const right = clamp(collider.centerX + collider.radiusX, 0, 1);
      const top = clamp(collider.centerY - collider.radiusY, 0, 1);
      const bottom = clamp(collider.centerY + collider.radiusY, 0, 1);
      return {
        left: piece.x + piece.width * left,
        right: piece.x + piece.width * right,
        top: piece.y + piece.height * top,
        bottom: piece.y + piece.height * bottom,
        offsetLeft: piece.width * left,
        offsetRight: piece.width * (1 - right),
        offsetTop: piece.height * top,
        offsetBottom: piece.height * (1 - bottom)
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

  const getFigureCollisionEllipse = (piece) => {
    const collider = piece.collider || { centerX: 0.51, centerY: 0.51, radiusX: 0.425, radiusY: 0.476 };
    return {
      centerX: piece.x + piece.width * collider.centerX,
      centerY: piece.y + piece.height * collider.centerY,
      radiusX: Math.max(1, piece.width * collider.radiusX),
      radiusY: Math.max(1, piece.height * collider.radiusY)
    };
  };

  const getPieceRectContact = (piece, rect) => {
    const box = getPieceBox(piece);
    if (box.right <= rect.left || box.left >= rect.right || box.bottom <= rect.top || box.top >= rect.bottom) return null;
    if (piece.type === "figure") {
      const ellipse = getFigureCollisionEllipse(piece);
      const closestX = clamp(ellipse.centerX, rect.left, rect.right);
      const closestY = clamp(ellipse.centerY, rect.top, rect.bottom);
      const normalizedX = (ellipse.centerX - closestX) / ellipse.radiusX;
      const normalizedY = (ellipse.centerY - closestY) / ellipse.radiusY;
      if (normalizedX * normalizedX + normalizedY * normalizedY > 1) return null;
    }
    const overlapLeft = box.right - rect.left;
    const overlapRight = rect.right - box.left;
    const overlapTop = box.bottom - rect.top;
    const overlapBottom = rect.bottom - box.top;
    return {
      box,
      overlapLeft,
      overlapRight,
      overlapTop,
      overlapBottom,
      minOverlap: Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom)
    };
  };

  const setPieceTransform = (piece) => {
    const x = `${piece.x.toFixed(2)}px`;
    const y = `${piece.y.toFixed(2)}px`;
    const angle = `${piece.angle.toFixed(2)}deg`;
    if (piece.type === "figure") {
      if (piece.renderX !== x) piece.el.style.setProperty("--figure-x", x);
      if (piece.renderY !== y) piece.el.style.setProperty("--figure-y", y);
      if (piece.renderAngle !== angle) piece.el.style.setProperty("--figure-rotate", angle);
      piece.renderX = x;
      piece.renderY = y;
      piece.renderAngle = angle;
      return;
    }
    if (piece.renderX !== x) piece.el.style.setProperty("--letter-x", x);
    if (piece.renderY !== y) piece.el.style.setProperty("--letter-y", y);
    if (piece.renderAngle !== angle) piece.el.style.setProperty("--letter-rotate", angle);
    piece.renderX = x;
    piece.renderY = y;
    piece.renderAngle = angle;
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
    if (getMotionWakeStrength() > 0.025) wakePhysics();
  };

  const handleDeviceMotion = (event) => {
    if (performance.now() - lastOrientationAt < 520) return;
    const acceleration = event.accelerationIncludingGravity || event.acceleration;
    if (!acceleration) return;
    const x = Number(acceleration.x || 0) / 14;
    const y = Number(acceleration.y || 0) / -18;
    blendMotion(x, y, 0, MOTION_LOW_PASS_RATE);
    if (getMotionWakeStrength() > 0.025) wakePhysics();
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
    if (activeItem === item) return;
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

  const getPhotoColliders = (force = false) => {
    const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
    const now = performance.now();
    const cacheDuration = isMobile() ? 180 : 96;
    if (!force
      && photoColliderCacheAt
      && now - photoColliderCacheAt < cacheDuration
      && photoColliderCacheWidth === window.innerWidth
      && photoColliderCacheHeight === window.innerHeight) {
      if (photoColliderCacheScrollY !== scrollY) {
        const shiftY = photoColliderCacheScrollY - scrollY;
        photoColliderCache.forEach(({ rect }) => {
          rect.top += shiftY;
          rect.bottom += shiftY;
        });
        photoColliderCacheScrollY = scrollY;
      }
      return photoColliderCache;
    }
    const edgeBuffer = isMobile() ? 110 : 160;
    const candidateItems = collisionObserver
      ? [...collisionCandidates].filter((item) => item.isConnected)
      : [...grid.querySelectorAll(".overview-item[href]")];
    photoColliderCache = candidateItems.map((item) => {
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
    photoColliderCacheAt = now;
    photoColliderCacheScrollY = scrollY;
    photoColliderCacheWidth = window.innerWidth;
    photoColliderCacheHeight = window.innerHeight;
    return photoColliderCache;
  };

  const getTopDropX = (pieceWidth, sidePadding, collider = { left: 0.18, right: 0.18 }) => {
    const colliderLeft = "centerX" in collider ? collider.centerX - collider.radiusX : collider.left;
    const colliderRight = "centerX" in collider ? collider.centerX + collider.radiusX : 1 - collider.right;
    const hitLeft = pieceWidth * colliderLeft;
    const hitRight = pieceWidth * colliderRight;
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
    const scanBand = (top, bottom, preferredBandY) => {
      let best = null;
      for (let y = top; y <= bottom + 0.5; y += emptyBandYStep) {
        for (let x = sidePadding; x <= maxX + 0.5; x += emptyBandStep) {
          const rect = { left: x, right: x + totalWidth, top: y, bottom: y + maxHeight };
          if (overlapsPhoto(rect)) continue;
          const centerX = x + totalWidth / 2;
          const centerY = y + maxHeight / 2;
          const score = Math.hypot(centerX - currentGroup.x, centerY - currentGroup.y) * 0.48
            + Math.abs(y - preferredBandY) * 0.34
            + Math.abs(centerX - window.innerWidth / 2) * 0.12;
          if (!best || score < best.score) best = { x, y, score };
        }
      }
      return best;
    };
    const lowerCandidate = scanBand(lowerTop, lowerBottom, preferredY);
    if (lowerCandidate) return lowerCandidate;
    const middleTop = Math.max(isMobile() ? 74 : 92, window.innerHeight * 0.18);
    const middleBottom = Math.max(middleTop, lowerTop - emptyBandYStep * 0.5);
    const middlePreferredY = clamp(window.innerHeight * 0.42, middleTop, middleBottom);
    return scanBand(middleTop, middleBottom, middlePreferredY);
  };

  const getRestTargets = (floor, sidePadding, colliders) => {
    const settlingPieces = letterPieces;
    const gap = window.innerWidth <= 340 ? 3 : isMobile() ? 9 : 12;
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
    let avoided = false;
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
      avoided = true;
      if (minOverlap === overlapLeft) piece.x -= overlapLeft * strength;
      else if (minOverlap === overlapRight) piece.x += overlapRight * strength;
      else if (minOverlap === overlapTop) piece.y -= overlapTop * strength;
      else piece.y += overlapBottom * strength;
      piece.vx *= 0.78;
      piece.vy *= 0.78;
      piece.va *= 0.82;
    });
    return avoided;
  };

  const releaseStuckFigure = (piece, colliders, time, sidePadding) => {
    if (piece.type !== "figure" || piece.y < -piece.height * 0.25) return false;
    const progressStep = Math.max(3, piece.height * 0.07);
    if (!Number.isFinite(piece.fallProgressY) || piece.y > piece.fallProgressY + progressStep) {
      piece.fallProgressY = piece.y;
      piece.fallProgressAt = time;
      piece.escapeAttempts = 0;
      return false;
    }
    if (!piece.fallProgressAt) {
      piece.fallProgressAt = time;
      return false;
    }
    if (time - piece.fallProgressAt < (isMobile() ? 720 : 860)) return false;

    const pieceBox = getPieceBox(piece);
    const pieceCenterX = pieceBox.left + (pieceBox.right - pieceBox.left) / 2;
    const blockers = colliders.filter(({ rect }) => {
      return rect.right > pieceBox.left - 8
        && rect.left < pieceBox.right + 8
        && rect.bottom > pieceBox.top - 8
        && rect.top < pieceBox.bottom + 12;
    });
    const nearest = blockers.reduce((best, blocker) => {
      const rect = blocker.rect;
      const distance = Math.abs(rect.top - pieceBox.bottom) + Math.abs((rect.left + rect.width / 2) - pieceCenterX) * 0.18;
      return !best || distance < best.distance ? { rect, distance } : best;
    }, null)?.rect;
    let direction = nearest && pieceCenterX < nearest.left + nearest.width / 2 ? -1 : 1;
    if (!nearest) direction = piece.escapeDirection || (Math.random() < 0.5 ? -1 : 1);
    if (piece.x <= sidePadding + piece.width * 0.5) direction = 1;
    if (piece.x + piece.width >= window.innerWidth - sidePadding - piece.width * 0.5) direction = -1;

    piece.escapeDirection = direction;
    piece.escapeAttempts = (piece.escapeAttempts || 0) + 1;
    piece.vx = direction * (isMobile() ? 1.45 : 1.65);
    piece.vy = Math.max(piece.vy, isMobile() ? 0.9 : 1.05);
    piece.va *= 0.25;
    piece.sleeping = false;
    piece.photoPassThroughUntil = time + (isMobile() ? 720 : 820);
    piece.fallProgressY = piece.y;
    piece.fallProgressAt = time;
    return true;
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

  const getNearbyPhotoColliders = (piece, colliders) => {
    if (!colliders.length) return colliders;
    const box = getPieceBox(piece);
    const padding = (piece.type === "figure" ? 14 : photoAvoidRadius() + 8)
      + Math.min(18, Math.abs(piece.vx || 0) * 3 + Math.abs(piece.vy || 0) * 2);
    const centerX = (box.left + box.right) / 2;
    const centerY = (box.top + box.bottom) / 2;
    return colliders.filter(({ rect }) => {
      return rect.right > box.left - padding
        && rect.left < box.right + padding
        && rect.bottom > box.top - padding
        && rect.top < box.bottom + padding;
    }).sort((first, second) => {
      const firstDistance = Math.hypot(first.rect.left + first.rect.width / 2 - centerX, first.rect.top + first.rect.height / 2 - centerY);
      const secondDistance = Math.hypot(second.rect.left + second.rect.width / 2 - centerX, second.rect.top + second.rect.height / 2 - centerY);
      return firstDistance - secondDistance;
    }).slice(0, 4);
  };

  const updateFigurePhotoContact = (piece, collider, pieceBox, time) => {
    const continuing = time - (piece.photoLastContactAt || 0) <= 180;
    if (!continuing) {
      const leftDistance = Math.max(0, pieceBox.right - collider.rect.left);
      const rightDistance = Math.max(0, collider.rect.right - pieceBox.left);
      let direction = Math.abs(piece.vx) > 0.72 ? Math.sign(piece.vx) : leftDistance <= rightDistance ? -1 : 1;
      if (piece.x <= 8) direction = 1;
      if (piece.x + piece.width >= window.innerWidth - 8) direction = -1;
      piece.photoContactItem = collider.item;
      piece.photoContactStartedAt = time;
      piece.photoEscapeDirection = direction;
    }
    piece.photoContactItem = collider.item;
    piece.photoLastContactAt = time;
    return {
      age: Math.max(0, time - (piece.photoContactStartedAt || time)),
      direction: piece.photoEscapeDirection || 1
    };
  };

  const collideWithPhoto = (piece, collider, dt, time) => {
    const rect = collider.rect;
    const contact = getPieceRectContact(piece, rect);
    if (!contact) return false;
    const { box: pieceBox, overlapLeft, overlapRight, overlapTop, overlapBottom, minOverlap } = contact;
    const photoCenterX = rect.left + rect.width / 2;
    const pieceCenterX = pieceBox.left + (pieceBox.right - pieceBox.left) / 2;
    const pieceCenterY = pieceBox.top + (pieceBox.bottom - pieceBox.top) / 2;
    const impactSpeed = Math.abs(piece.vx) + Math.abs(piece.vy);
    const bounce = (isMobile() ? 0.24 : 0.28) * (piece.rebound || 1);
    const figureContact = piece.type === "figure" ? updateFigurePhotoContact(piece, collider, pieceBox, time) : null;
    piece.sleeping = false;
    piece.floorHits = 0;

    if (minOverlap === overlapTop && piece.vy >= -2) {
      let rollDirection = Math.abs(piece.vx) > 0.72 ? Math.sign(piece.vx) : pieceCenterX < photoCenterX ? -1 : 1;
      if (piece.x < 22) rollDirection = 1;
      if (piece.x + piece.width > window.innerWidth - 22) rollDirection = -1;
      piece.y = rect.top - (piece.height - pieceBox.offsetBottom);
      if (piece.type === "figure") {
        rollDirection = figureContact.direction;
        const escapeBoost = clamp(figureContact.age / 820, 0, 1) * (isMobile() ? 0.72 : 0.9);
        const targetVx = rollDirection * ((isMobile() ? 1.02 : 1.18) + escapeBoost);
        piece.vy = Math.max(0.12, piece.vy * 0.08);
        piece.vx += (targetVx - piece.vx) * 0.34 * dt;
        piece.va = piece.va * 0.7 + rollDirection * 0.008 * dt;
      } else {
        piece.vy = -Math.min(Math.abs(piece.vy) * bounce + (isMobile() ? 0.38 : 0.48), isMobile() ? 1.8 : 2.25);
        piece.vx += rollDirection * (isMobile() ? 0.92 : 1.12) * (piece.rebound || 1) * dt;
      }
    } else if (minOverlap === overlapBottom) {
      piece.y = rect.bottom - pieceBox.offsetTop;
      piece.vy = Math.abs(piece.vy) * 0.18 + 0.32;
      if (figureContact) piece.vx += figureContact.direction * 0.12 * dt;
    } else if (minOverlap === overlapLeft) {
      piece.x = rect.left - (piece.width - pieceBox.offsetRight);
      piece.vx = -Math.abs(piece.vx) * bounce - (piece.type === "figure" ? 0.62 : 0.54);
    } else {
      piece.x = rect.right - pieceBox.offsetLeft;
      piece.vx = Math.abs(piece.vx) * bounce + (piece.type === "figure" ? 0.62 : 0.54);
    }
    piece.va += clamp((pieceCenterX - photoCenterX) * 0.0035, -0.45, 0.45);
    const shouldMarkImpact = collider.item !== piece.lastPhotoImpactItem
      || time - (piece.lastPhotoImpactAt || 0) > 260;
    if (shouldMarkImpact && impactSpeed > 0.42) {
      piece.lastPhotoImpactItem = collider.item;
      piece.lastPhotoImpactAt = time;
      markPhotoHit(collider, pieceCenterX, pieceCenterY);
    }
    return true;
  };

  const collideLetterPairs = (dt, restTargets = null) => {
    for (let pass = 0; pass < 2; pass++) {
      for (let i = 0; i < letterPieces.length; i++) {
        for (let j = i + 1; j < letterPieces.length; j++) {
          const first = letterPieces[i];
          const second = letterPieces[j];
          const bothSleeping = first.sleeping && second.sleeping;
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
          if (!bothSleeping) {
            first.sleeping = false;
            second.sleeping = false;
          }
        }
      }
    }
  };

  const getFigureTextEscapeDirection = (figureBox, letterBoxes, sidePadding) => {
    const passageWidth = figureBox.right - figureBox.left + (isMobile() ? 2 : 4);
    const verticalMatches = letterBoxes.filter(({ box }) => {
      return box.bottom > figureBox.top - 2 && box.top < figureBox.bottom + 2;
    });
    const contacts = verticalMatches.filter(({ box }) => {
      return box.right > figureBox.left && box.left < figureBox.right;
    });
    if (!contacts.length) return figurePiece?.textEscapeDirection || 1;

    let groupLeft = Math.min(...contacts.map(({ box }) => box.left));
    let groupRight = Math.max(...contacts.map(({ box }) => box.right));
    let expanded = true;
    while (expanded) {
      expanded = false;
      verticalMatches.forEach(({ box }) => {
        const joinsLeft = box.right <= groupLeft && groupLeft - box.right <= passageWidth;
        const joinsRight = box.left >= groupRight && box.left - groupRight <= passageWidth;
        if (!joinsLeft && !joinsRight) return;
        const nextLeft = Math.min(groupLeft, box.left);
        const nextRight = Math.max(groupRight, box.right);
        if (nextLeft === groupLeft && nextRight === groupRight) return;
        groupLeft = nextLeft;
        groupRight = nextRight;
        expanded = true;
      });
    }

    const canEscapeLeft = figurePiece.x > sidePadding + 1;
    const canEscapeRight = figurePiece.x + figurePiece.width < window.innerWidth - sidePadding - 1;
    if (!canEscapeLeft) return 1;
    if (!canEscapeRight) return -1;
    if (Math.abs(figurePiece.vx) > 0.82) return Math.sign(figurePiece.vx);
    const leftDistance = Math.max(0, figureBox.right - groupLeft);
    const rightDistance = Math.max(0, groupRight - figureBox.left);
    return leftDistance <= rightDistance ? -1 : 1;
  };

  const collideFigureWithLetters = (dt, time, sidePadding) => {
    if (!figurePiece || !letterPieces.length) return false;
    const letterBoxes = letterPieces.map((piece) => ({ piece, box: getPieceBox(piece) }));
    const initialBox = getPieceBox(figurePiece);
    const hasContact = letterBoxes.some(({ box }) => getPieceRectContact(figurePiece, box));
    if (!hasContact) {
      if (time - (figurePiece.textLastContactAt || 0) > 180) figurePiece.textContactStartedAt = 0;
      return false;
    }

    const continuing = time - (figurePiece.textLastContactAt || 0) <= 180;
    if (!continuing) {
      figurePiece.textContactStartedAt = time;
      figurePiece.textEscapeDirection = getFigureTextEscapeDirection(initialBox, letterBoxes, sidePadding);
    }
    figurePiece.textLastContactAt = time;
    const contactAge = Math.max(0, time - (figurePiece.textContactStartedAt || time));
    const escapeBoost = clamp(contactAge / 900, 0, 1) * (isMobile() ? 0.72 : 0.88);
    const escapeSpeed = (isMobile() ? 1.02 : 1.18) + escapeBoost;
    let collided = false;

    for (let pass = 0; pass < 2; pass++) {
      letterBoxes.forEach(({ box }) => {
        const contact = getPieceRectContact(figurePiece, box);
        if (!contact) return;
        const figureBox = contact.box;
        collided = true;

        const overlapX = Math.min(contact.overlapLeft, contact.overlapRight);
        const overlapY = Math.min(contact.overlapTop, contact.overlapBottom);
        const figureCenterX = (figureBox.left + figureBox.right) / 2;
        const figureCenterY = (figureBox.top + figureBox.bottom) / 2;
        const letterCenterX = (box.left + box.right) / 2;
        const letterCenterY = (box.top + box.bottom) / 2;
        const separation = isMobile() ? 0.7 : 0.9;

        if (overlapX + 0.5 < overlapY) {
          const direction = figureCenterX < letterCenterX ? -1 : 1;
          figurePiece.x += direction * (overlapX + separation);
          figurePiece.vx = direction * Math.max(0.46, Math.abs(figurePiece.vx) * 0.24);
          figurePiece.vy = Math.max(0.18, figurePiece.vy * 0.74);
        } else if (figureCenterY <= letterCenterY) {
          figurePiece.y = box.top - (figurePiece.height - figureBox.offsetBottom) - separation;
          figurePiece.vy = clamp(figurePiece.vy * 0.08, 0.06, 0.24);
          const targetVx = figurePiece.textEscapeDirection * escapeSpeed;
          figurePiece.vx += (targetVx - figurePiece.vx) * 0.32 * dt;
        } else {
          figurePiece.y = box.bottom - figureBox.offsetTop + separation;
          figurePiece.vy = Math.max(0.3, Math.abs(figurePiece.vy) * 0.22);
          figurePiece.vx += figurePiece.textEscapeDirection * 0.08 * dt;
        }
      });
    }

    if (!collided) return false;
    figurePiece.sleeping = false;
    figurePiece.floorHits = 0;
    figurePiece.va = figurePiece.va * (isMobile() ? 0.64 : 0.68)
      + figurePiece.textEscapeDirection * 0.006 * dt;
    return true;
  };

  const relaxLetterRotation = (piece, strength) => {
    if (piece.type !== "letter") return;
    piece.angle += (piece.restAngle - piece.angle) * strength;
  };

  const tick = (time) => {
    if (document.hidden) {
      physicsSleeping = true;
      return;
    }
    const allPiecesSleeping = pieces.length > 0 && pieces.every((piece) => piece.sleeping);
    const frameInterval = isMobile()
      ? allPiecesSleeping ? 56 : 15
      : allPiecesSleeping ? 48 : 14;
    if (lastTime && time - lastTime < frameInterval) {
      schedulePhysicsAfter(frameInterval - (time - lastTime));
      return;
    }
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
    const settlingPieces = letterPieces;
    const groupCenterY = settlingPieces.reduce((sum, piece) => sum + piece.y + piece.height / 2, 0) / Math.max(1, settlingPieces.length);
    if (!hasReachedSettleZone && (groupCenterY > idleAttractionRadius() || settlingPieces.some((piece) => piece.floorHits > 0))) {
      hasReachedSettleZone = true;
    }
    const shouldSettle = settleAge > 0
      && idleAge > (isMobile() ? 520 : 680)
      && hasReachedSettleZone
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
      const target = shouldSettle ? restTargets.get(piece) : null;
      const restingAtTarget = target
        && Math.abs(target.x - piece.x) < 0.55
        && Math.abs(target.y - piece.y) < 0.55
        && Math.abs(target.angle - piece.angle) < 0.22;
      if (piece.sleeping && motionWakeStrength > 0.08 && piece.type === "letter") {
        piece.sleeping = false;
        piece.vx += motionInfluence.x * 0.48;
        piece.vy += motionInfluence.y * 0.42;
        piece.va += (motionInfluence.x + motionInfluence.twist * 0.36) * 0.022;
      }
      if (piece.sleeping && Math.abs(scrollDelta) < 1.5 && (!shouldSettle || piece.settles === false || restingAtTarget)) {
        piece.vx = 0;
        piece.vy = 0;
        piece.va = 0;
        if (target) {
          piece.x = target.x;
          piece.y = target.y;
          piece.angle = target.angle;
        } else {
          relaxLetterRotation(piece, 0.055);
        }
        return;
      }

      if (Math.abs(scrollDelta) >= 1.5) piece.sleeping = false;
      const passiveGravity = isMobile() && motionListening ? gravity * 0.72 : gravity;
      const settleForceScale = target ? Math.max(0, 1 - settleEase) : 1;
      piece.vy += (passiveGravity * settleForceScale + scrollForce) * dt;
      piece.vx += motionInfluence.x * (isMobile() ? 0.068 : 0.034) * dt;
      piece.vy += motionInfluence.y * (isMobile() ? 0.11 : 0.022) * dt;
      piece.va += (motionInfluence.x + motionInfluence.twist * 0.4) * 0.006 * dt;
      if (scrollDelta < -1) {
        piece.y += scrollDelta * 0.045;
        piece.vx *= 0.92;
        piece.va *= 0.72;
      }
      piece.vx += Math.sin(time * 0.001 + (piece.wanderSeed || index * 1.7))
        * (piece.type === "figure" ? 0.011 : 0.008)
        * settleForceScale
        * dt;
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

      const nearbyColliders = getNearbyPhotoColliders(piece, colliders);
      releaseStuckFigure(piece, nearbyColliders, time, sidePadding);
      const passesThroughPhotos = piece.type === "figure" && time < (piece.photoPassThroughUntil || 0);
      if (!passesThroughPhotos) {
        for (const collider of nearbyColliders) {
          if (!collideWithPhoto(piece, collider, dt, time)) continue;
          touchedItem = collider.item;
          break;
        }
      }
      if (!passesThroughPhotos && piece.type !== "figure") avoidPhotosSoftly(piece, nearbyColliders, dt);

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
        relaxLetterRotation(piece, 0.04);
      }

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

    });

    collideLetterPairs(dt, restTargets);
    collideFigureWithLetters(dt, time, sidePadding);
    pieces.forEach((piece) => {
      const minY = piece.type === "figure" ? -piece.height * 1.35 : 0;
      piece.x = clamp(piece.x, sidePadding, Math.max(sidePadding, window.innerWidth - sidePadding - piece.width));
      piece.y = clamp(piece.y, minY, Math.max(minY, floor - piece.height));
      setPieceTransform(piece);
    });

    const returningFromRel = document.body.classList.contains("is-returning-from-rel");
    const photoEffectDelay = returningFromRel ? 1180 : 520;
    photoEffectsReady = canMoveOverviewPhotos() && time - physicsStartedAt >= photoEffectDelay;

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
    } else if (!reunionStableSince) {
      reunionStableSince = time;
    } else if (reunionArmed && !reunionEndsAt && time - reunionStableSince > 420) {
      reunionArmed = false;
      reunionEndsAt = time + 920;
      document.body.classList.add("is-letter-reunion");
      reunionPhoto = canMoveOverviewPhotos() ? getNearestCollider(colliders) || null : null;
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
    else if (activeItem || nearItems.length || photoHitTimers.size) clearStates();
    const allPiecesSleepingNow = pieces.length > 0 && pieces.every((piece) => piece.sleeping);
    const motionQuiet = motionWakeStrength <= 0.025;
    if (allPiecesSleepingNow && Math.abs(scrollDelta) < 1.5 && motionQuiet) {
      let wakeAt = 0;
      if (reunionEndsAt > time) {
        wakeAt = reunionEndsAt + 16;
      } else if (reunionReady && reunionArmed) {
        wakeAt = (reunionStableSince || time) + 440;
      } else if (!shouldSettle) {
        wakeAt = Math.max(
          physicsStartedAt + settleDelay + 16,
          lastScrollMoveAt + (isMobile() ? 520 : 680) + 16
        );
      } else if (!reunionArmed && reunionCooldownUntil > time) {
        wakeAt = reunionCooldownUntil + 16;
      }
      if (wakeAt > time + 20) {
        sleepPhysicsUntil(wakeAt, time);
        return;
      }
      if (!wakeAt) {
        sleepPhysicsUntil(0, time);
        return;
      }
    }
    schedulePhysicsFrame();
  };

  const startPhysics = () => {
    if (started || !letters.length) return;
    started = true;
    const midpoint = (letters.length - 1) / 2;
    letterPieces = letters.map((letter, index) => {
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
    figurePiece = null;
    if (figure) {
      const rect = figure.getBoundingClientRect();
      const width = rect.width || Math.min(window.innerWidth * 0.28, 150);
      const height = rect.height || width * (248 / 202);
      const sidePadding = isMobile() ? 8 : 16;
      const figureCollider = { centerX: 0.51, centerY: 0.51, radiusX: 0.425, radiusY: 0.476 };
      figurePiece = {
        type: "figure",
        settles: false,
        mass: 1.18 + Math.random() * 0.22,
        rebound: 1.02 + Math.random() * 0.24,
        wanderSeed: Math.random() * Math.PI * 2,
        collider: figureCollider,
        glyph: "figure",
        el: figure,
        x: getTopDropX(width, sidePadding, figureCollider),
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
        sleeping: false,
        fallProgressY: null,
        fallProgressAt: 0,
        photoPassThroughUntil: 0,
        escapeAttempts: 0,
        escapeDirection: Math.random() < 0.5 ? -1 : 1,
        textContactStartedAt: 0,
        textLastContactAt: 0,
        textEscapeDirection: Math.random() < 0.5 ? -1 : 1,
        photoContactItem: null,
        photoContactStartedAt: 0,
        photoLastContactAt: 0,
        photoEscapeDirection: Math.random() < 0.5 ? -1 : 1
      };
      pieces.push(figurePiece);
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
    hasReachedSettleZone = false;
    scrollLift = 0;
    lastScrollY = window.scrollY || document.documentElement.scrollTop || 0;
    schedulePhysicsFrame();
  };

  const waitForBrandIntro = () => {
    const introLetter = letters[0];
    if (!introLetter) {
      readyTimer = window.setTimeout(startPhysics, 120);
      return;
    }
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      window.clearTimeout(readyTimer);
      introCleanup?.();
      introCleanup = null;
      readyTimer = window.setTimeout(startPhysics, 120);
    };
    const handleTransitionEnd = (event) => {
      if (event.target !== introLetter || event.propertyName !== "opacity") return;
      finish();
    };
    introLetter.addEventListener("transitionend", handleTransitionEnd);
    introCleanup = () => introLetter.removeEventListener("transitionend", handleTransitionEnd);
    if (Number.parseFloat(getComputedStyle(introLetter).opacity) >= .995) {
      finish();
      return;
    }
    readyTimer = window.setTimeout(finish, 720);
  };

  const waitForIntro = () => {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      applyIdleState();
      return;
    }
    if (document.body.classList.contains("is-returning-from-rel")) {
      readyTimer = window.setTimeout(startPhysics, 180);
      return;
    }
    if (document.body.classList.contains("has-finished")) {
      waitForBrandIntro();
      return;
    }
    waitTimer = window.setTimeout(waitForIntro, 50);
  };

  const handleResize = () => {
    updateOverviewPhotoPlaceholderGeometry();
    if (!started) return;
    invalidatePhotoColliderCache();
    if (!canMoveOverviewPhotos()) {
      clearStates();
      clearReunionState();
    }
    syncPieceMetrics();
    wakePhysics();
  };

  const handlePhysicsScroll = () => {
    if (!started) return;
    const now = performance.now();
    lastScrollMoveAt = now;
    lastTime = Math.min(lastTime || now - 16.67, now - 16.67);
    reunionArmed = true;
    pieces.forEach((piece) => {
      if (piece.type !== "figure") return;
      piece.fallProgressY = piece.y;
      piece.fallProgressAt = now;
      piece.photoPassThroughUntil = 0;
    });
    wakePhysics();
  };

  const handlePhysicsVisibility = () => {
    if (document.hidden) {
      if (frame) cancelFrame(frame);
      frame = 0;
      physicsFramePending = false;
      window.clearTimeout(physicsThrottleTimer);
      physicsThrottleTimer = 0;
      window.clearTimeout(physicsWakeTimer);
      physicsWakeTimer = 0;
      physicsSleeping = true;
      return;
    }
    wakePhysics();
  };

  window.addEventListener("resize", handleResize);
  window.addEventListener("scroll", handlePhysicsScroll, { passive: true });
  document.addEventListener("visibilitychange", handlePhysicsVisibility);
  setupCollisionObserver();
  setupMotionAccess();
  waitForIntro();

  overviewInteractionCleanup = () => {
    if (frame) cancelFrame(frame);
    physicsFramePending = false;
    window.clearTimeout(physicsThrottleTimer);
    window.clearTimeout(physicsWakeTimer);
    window.clearTimeout(readyTimer);
    window.clearTimeout(waitTimer);
    introCleanup?.();
    window.removeEventListener("resize", handleResize);
    window.removeEventListener("scroll", handlePhysicsScroll);
    document.removeEventListener("visibilitychange", handlePhysicsVisibility);
    window.removeEventListener("deviceorientation", handleDeviceOrientation, true);
    window.removeEventListener("devicemotion", handleDeviceMotion, true);
    window.removeEventListener("pointerdown", requestMotionAccess);
    window.removeEventListener("touchstart", requestMotionAccess);
    window.removeEventListener("touchend", requestMotionAccess);
    window.removeEventListener("click", requestMotionAccess);
    collisionObserver?.disconnect();
    grid.removeEventListener("overview:batchappend", handleOverviewBatchAppend);
    grid.removeEventListener("overview:batchrecycle", handleOverviewBatchRecycle);
    collisionCandidates.clear();
    clearReunionState();
    applyIdleState();
  };
}

function startLoadingSequence(readiness = null) {
  if (document.body.classList.contains("is-returning-from-rel")) {
    document.body.classList.add("has-loaded", "has-opening-images-ready", "has-finished");
    document.documentElement.classList.add("has-landed");
    return;
  }
  const hasOpeningReadiness = Boolean(readiness);
  const finishLoadingSequence = () => {
    document.body.classList.add("has-finished");
    document.documentElement.classList.add("has-landed");
    window.setTimeout(releaseOverviewOpeningRasters, 1800);
  };
  requestAnimationFrame(() => {
    document.body.classList.add("has-loaded");
    Promise.resolve(readiness).catch(() => {}).then(() => {
      if (!hasOpeningReadiness) {
        window.setTimeout(finishLoadingSequence, 180);
        return;
      }
      document.body.classList.add("has-opening-images-ready");
      requestAnimationFrame(() => requestAnimationFrame(() => {
        window.setTimeout(finishLoadingSequence, OVERVIEW_OPENING_REVEAL_DELAY);
      }));
    });
  });
}

function renderFocus() {
  const shell = document.querySelector("[data-focus-shell]");
  const title = document.querySelector("[data-focus-title]");
  const thumbs = document.querySelector("[data-focus-thumbs]");
  let image = document.querySelector("[data-focus-image]");
  const caption = document.querySelector("[data-focus-caption]");
  const noteText = document.querySelector("[data-focus-note-text]");
  const noteLocation = document.querySelector("[data-focus-note-location]");
  const notesBackground = document.querySelector("[data-focus-notes-background]");
  const imageToggle = document.querySelector("[data-focus-image-toggle]");
  const focusMain = document.querySelector("[data-focus-main]");
  const indexToggle = document.querySelector("[data-focus-index]");
  const focusActions = document.querySelector(".focus-actions");
  const navToggle = document.querySelector(".js-nav-toggle");
  const backLink = document.querySelector(".js-back");
  if (!shell || !title || !thumbs || !image || !caption || !imageToggle || !focusMain) return;
  const getFocusPhotoSource = (photo) => window.innerWidth <= 768
    ? photo?.medium || photo?.full || photo?.thumb || ""
    : photo?.full || photo?.medium || photo?.thumb || "";
  const updateFocusMainPlaceholderGeometry = (photo = photos[Number(shell.dataset.activeIndex || 0)]) => {
    if (!photo || !imageToggle) return;
    const availableWidth = imageToggle.clientWidth;
    const availableHeight = imageToggle.clientHeight;
    const ratio = getPhotoAspectRatio(photo);
    if (!(availableWidth > 0 && availableHeight > 0 && ratio > 0)) return;
    let placeholderWidth = availableWidth;
    let placeholderHeight = placeholderWidth / ratio;
    if (placeholderHeight > availableHeight) {
      placeholderHeight = availableHeight;
      placeholderWidth = placeholderHeight * ratio;
    }
    imageToggle.style.setProperty("--photo-placeholder-width", `${placeholderWidth.toFixed(2)}px`);
    imageToggle.style.setProperty("--photo-placeholder-height", `${placeholderHeight.toFixed(2)}px`);
  };
  let mobileRailMaxOffset = 0;
  let focusSyncHoldUntil = 0;
  let focusMainTouchStartX = 0;
  let focusMainTouchStartY = 0;
  let focusMainTouchLastX = 0;
  let focusMainTouchLastY = 0;
  let focusMainTouchLastMoveAt = 0;
  let focusMainTouchVelocityX = 0;
  let focusMainTouchVelocityY = 0;
  let focusMainTouchHistory = [];
  let focusMainTouchMode = "";
  let focusMainTouchMoved = false;
  let focusMainTouchPreventClickUntil = 0;
  let focusMainTouchBaseOffset = 0;
  let focusMainTouchContinuationDirection = 0;
  let focusMainTouchGestureDirection = 0;
  let focusMainTouchFrame = 0;
  let focusMainTouchPending = null;
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
    railReady: false,
    velocity: 0,
    elements: null
  };
  const focusNotesGesture = {
    active: false,
    animating: false,
    frame: 0,
    progress: 0,
    startProgress: 0,
    velocity: 0,
    startedOpen: false,
    travel: 72
  };
  let focusQueuedSwipe = null;
  let focusMainSwipeClearSequence = 0;
  const focusShiftPositions = new Map();
  const focusFollowRate = 0.08;
  let focusSwitchSequence = 0;
  let focusSwitchTimer = 0;
  let focusSwitchHandoffTimer = 0;
  let focusIndexTransitionTimer = 0;
  let focusRailScrollFrame = 0;
  let focusRailSyncFrame = 0;
  let focusRailSyncUntil = 0;
  let focusRailSelectionLastAt = 0;
  let focusRailPendingSelection = null;
  const focusRailSelectionInterval = 96;
  let focusRailThumbMetrics = [];
  let focusIndexPreparedIndex = -1;
  let focusIndexThumbBatchTimer = 0;
  const focusIndexCards = [];
  const focusIndexVisibleCards = new Set();
  let focusIndexCardObserver = null;
  let focusIndexCardMetrics = [];
  let focusIndexMetricsViewportWidth = 0;
  let focusIndexMetricsViewportHeight = 0;
  let focusIndexPreparedRect = null;
  let focusIndexPreparedViewportWidth = 0;
  let focusIndexPreparedViewportHeight = 0;
  let focusIndexMotionWarmupHandle = 0;
  let focusIndexMotionWarmupTimer = 0;
  let focusIndexMotionWarmupRun = 0;
  let focusManualSelectionIndex = null;
  let focusManualSelectionTimer = 0;
  let focusSwipeSyncTimer = 0;
  let focusMainSwipeLockUntil = 0;
  let focusNoteCopyTransitionTimer = 0;
  let focusNotesTransitionTimer = 0;
  let notesLayoutFrame = 0;
  let notesLayoutTimer = 0;
  let notesLayoutCacheKey = "";
  let notesLayoutSnapshot = null;
  let focusMainBaseRectCache = null;
  let focusMainBaseRectViewportWidth = 0;
  let focusMainBaseRectViewportHeight = 0;
  let focusIndexReturnSettleTimer = 0;
  let focusNotesIndexHandoffTimer = 0;
  let focusIndexInteractionLockUntil = 0;
  let focusNeighborPreloadRun = 0;
  const focusPhotoRatios = new Map();
  const focusImagePreloadCache = new Map();
  const focusImagePreloadCacheLimit = 8;
  const rel = Number(new URLSearchParams(window.location.search).get("rel"));
  const initial = Number.isFinite(rel) && rel > 0 ? Math.min(rel - 1, photos.length - 1) : 0;
  const focusIndexState = {
    mode: "rel",
    phase: "idle",
    returnMode: "rel",
    activeIndex: initial,
    runId: 0,
    imageAnimation: null,
    cardAnimations: [],
    cardMotionFrames: new Map(),
    cardMotionRects: new Map(),
    cardMotionGalleryRect: null,
    cardMotionIndex: initial,
    cardMotionEndTime: 0,
    cardMotionViewportWidth: 0,
    cardMotionViewportHeight: 0,
    returnBoxRect: null,
    returnImageRect: null,
    returnImageIndex: initial,
    returnViewportWidth: 0,
    returnViewportHeight: 0,
    pendingSelection: null,
    returnImagePreparing: false,
    resizeFrame: 0,
    loadFrame: 0,
    savedScrollY: 0,
    savedBodyTop: "",
    savedBodyPosition: "",
    savedBodyWidth: "",
    savedBodyOverflow: "",
    savedBodyPaddingRight: ""
  };
  const indexEnabled = Boolean(indexToggle);
  const indexGallery = indexEnabled ? document.createElement("section") : null;
  if (indexGallery) {
    indexGallery.className = "focus-index-gallery";
    indexGallery.dataset.focusIndexGallery = "";
    indexGallery.setAttribute("aria-label", "Photo index gallery");
    indexGallery?.setAttribute("aria-hidden", "true");
    shell.insertBefore(indexGallery, shell.querySelector(".focus-actions"));
  }
  image.loading = "eager";
  image.fetchPriority = "high";
  const focusThumbButtons = [];
  const thumbFragment = document.createDocumentFragment();
  const indexFragment = indexGallery ? document.createDocumentFragment() : null;
  photos.forEach((photo, index) => {
    if (photo.width > 0 && photo.height > 0) focusPhotoRatios.set(index, photo.width / photo.height);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "focus-thumb";
    button.dataset.index = String(index + 1);
    button.style.setProperty("--delay", `${Math.min(index, 24) * 0.018}s`);
    const prioritizeThumb = Math.abs(index - initial) <= 2;
    const thumbSource = prioritizeThumb ? `src="${photo.thumb}"` : `data-src="${photo.thumb}"`;
    button.innerHTML = `<span class="focus-thumb__media photo-placeholder is-photo-loading" style="${getPhotoPlaceholderStyle(photo, true)}"><img ${thumbSource} alt="${photo.alt}"${getPhotoImageSizeAttributes(photo, true)} loading="${prioritizeThumb ? "eager" : "lazy"}" fetchpriority="${index === initial ? "high" : "low"}" decoding="async"></span>`;
    const thumbImage = button.querySelector("img");
    const thumbMedia = button.querySelector(".focus-thumb__media");
    initializePhotoPlaceholder(thumbMedia, thumbImage, photo.thumb);
    thumbImage?.addEventListener("load", () => rememberFocusPhotoRatio(index, thumbImage), { once: true });
    if (thumbImage?.complete) requestAnimationFrame(() => rememberFocusPhotoRatio(index, thumbImage));
    button.addEventListener("click", () => {
      if (shell.classList.contains("is-index")) return;
      setNotesOpen(false);
      setFocus(index, true, { source: "thumb" });
      glideFocusRailAfterThumbClick(index);
    });
    focusThumbButtons.push(button);
    thumbFragment.appendChild(button);

    if (indexGallery) {
      const indexButton = document.createElement("button");
      indexButton.type = "button";
      indexButton.className = "focus-index-card";
      indexButton.dataset.index = String(index + 1);
      indexButton.style.setProperty("--delay", `${Math.min(index, 28) * 0.012}s`);
      if (photo.width > 0 && photo.height > 0) {
        const indexRatio = photo.width / photo.height;
        indexButton.style.setProperty("--focus-index-ratio", indexRatio.toFixed(5));
        indexButton.style.setProperty("--focus-index-mobile-width", `${(indexRatio * 8).toFixed(3)}rem`);
      }
      const prewarmIndexThumb = false;
      const indexThumbSource = prewarmIndexThumb ? `src="${photo.thumb}"` : "";
      indexButton.innerHTML = `<span class="focus-index-card__media photo-placeholder is-photo-loading" style="${getPhotoPlaceholderStyle(photo)}"><img ${indexThumbSource} data-focus-index-full="${getFocusPhotoSource(photo)}" data-focus-index-thumb="${photo.thumb}" alt="${photo.alt}"${getPhotoImageSizeAttributes(photo)} loading="${prewarmIndexThumb ? "eager" : "lazy"}" fetchpriority="low" decoding="async"></span>`;
      const indexImage = indexButton.querySelector("img");
      const indexMedia = indexButton.querySelector(".focus-index-card__media");
      initializePhotoPlaceholder(indexMedia, indexImage, photo.thumb);
      indexImage?.addEventListener("load", () => rememberFocusPhotoRatio(index, indexImage), { once: true });
      if (indexImage?.complete) requestAnimationFrame(() => rememberFocusPhotoRatio(index, indexImage));
      indexButton.addEventListener("pointerdown", () => {
        if (focusIndexState.mode !== "index" || focusIndexState.phase !== "idle") return;
        preloadFocusImageDecoded(getFocusPhotoSource(photo));
      }, { passive: true });
      indexButton.addEventListener("click", () => {
        selectFocusIndexCard(index);
      });
      focusIndexCards.push(indexButton);
      indexFragment.appendChild(indexButton);
    }
  });
  thumbs.appendChild(thumbFragment);
  if (indexGallery && indexFragment) indexGallery.appendChild(indexFragment);
  if (indexGallery && "IntersectionObserver" in window) {
    focusIndexCardObserver = new IntersectionObserver((entries) => {
      let hasVisibleChange = false;
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (!focusIndexVisibleCards.has(entry.target)) {
            focusIndexVisibleCards.add(entry.target);
            hasVisibleChange = true;
          }
        } else if (focusIndexVisibleCards.delete(entry.target)) {
          hasVisibleChange = true;
        }
      });
      if (hasVisibleChange && (focusIndexState.mode === "index" || focusIndexState.phase === "opening")) {
        scheduleFocusIndexImageWindow();
      }
    }, { root: indexGallery, rootMargin: "30% 0px", threshold: 0.01 });
    focusIndexCards.forEach((card) => focusIndexCardObserver.observe(card));
  }

  const hydrateFocusThumbRange = (centerIndex, radius = 2) => {
    const start = Math.max(0, centerIndex - radius);
    const end = Math.min(photos.length - 1, centerIndex + radius);
    for (let index = start; index <= end; index++) {
      hydrateDeferredImage(focusThumbButtons[index]?.querySelector("img"));
    }
  };
  const deferredThumbImages = [...thumbs.querySelectorAll("img[data-src]")];
  if ("IntersectionObserver" in window) {
    const thumbObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        hydrateDeferredImage(entry.target);
        thumbObserver.unobserve(entry.target);
      });
    }, { root: null, rootMargin: "320px", threshold: 0.01 });
    deferredThumbImages.forEach((thumbImage) => thumbObserver.observe(thumbImage));
  } else {
    deferredThumbImages.forEach(hydrateDeferredImage);
  }
  indexGallery?.addEventListener("scroll", () => {
    resetFocusIndexHorizontalOffset();
    scheduleFocusIndexImageWindow();
  }, { passive: true });
  indexGallery?.addEventListener("wheel", (event) => event.stopPropagation(), { passive: true });

  indexToggle?.addEventListener("pointerdown", () => {
    if (focusIndexState.mode === "index" || focusIndexState.phase !== "idle" || shell.classList.contains("is-index")) return;
    const activeIndex = Number(shell.dataset.activeIndex || 0);
    if (focusIndexPreparedIndex !== activeIndex) warmFocusIndexCardThumbs(activeIndex);
  }, { passive: true });

  indexToggle?.addEventListener("click", () => {
    if (!indexEnabled
      || focusIndexState.mode === "index"
      || focusIndexState.phase !== "idle"
      || isFocusIndexInteractionCoolingDown()
      || shell.classList.contains("is-index")) return;
    const activeIndex = Number(shell.dataset.activeIndex || 0);
    openFocusIndex(activeIndex);
  });
  imageToggle.addEventListener("pointerdown", releaseFocusIndexReturnSettleForInteraction, { passive: true });
  imageToggle.addEventListener("click", () => {
    if (Date.now() < focusMainTouchPreventClickUntil) return;
    releaseFocusIndexReturnSettleForInteraction();
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
    cancelFocusImageSwitch({ restoreVisualSelection: true });
    const activeIndex = Number(shell.dataset.activeIndex || 0);
    const activeRel = activeIndex + 1;
    if (focusIndexState.mode === "index" || focusIndexState.phase !== "idle" || shell.classList.contains("is-index")) {
      closeFocusIndex(focusIndexState.activeIndex, { restoreNotes: focusIndexState.returnMode === "notes" });
      return;
    }
    try {
      const existing = JSON.parse(sessionStorage.getItem(OVERVIEW_RETURN_STORAGE_KEY) || "null") || {};
      sessionStorage.setItem(OVERVIEW_RETURN_STORAGE_KEY, JSON.stringify({
        rel: activeRel,
        scrollY: Number(existing.scrollY || 0),
        createdAt: Date.now(),
        order: Array.isArray(existing.order) ? existing.order : undefined,
        anchor: existing.anchor
      }));
    } catch (error) {
      returnFocusToOverview(activeRel, true);
      return;
    }
    returnFocusToOverview(activeRel, true);
  });
  window.addEventListener("wheel", () => {
    clearFocusManualSelection();
    if (!isFocusMainSwipeBusy()) cancelFocusRailScroll();
  }, { passive: true });
  thumbs.addEventListener("scroll", () => scheduleFocusRailSync(220), { passive: true });
  window.addEventListener("scroll", () => {
    if (window.innerWidth > 768) scheduleFocusRailSync(220);
  }, { passive: true });
  thumbs.addEventListener("touchstart", handleFocusTouchStart, { passive: true });
  imageToggle.addEventListener("touchstart", handleFocusMainTouchStart, { passive: true });
  imageToggle.addEventListener("touchmove", handleFocusMainTouchMove, { passive: false });
  imageToggle.addEventListener("touchend", handleFocusMainTouchEnd, { passive: true });
  imageToggle.addEventListener("touchcancel", handleFocusMainTouchCancel, { passive: true });
  ensureFocusMainSwipeLayer();
  thumbs.addEventListener("wheel", handleFocusWheel, { passive: false });
  window.addEventListener("keydown", (event) => {
    const current = Number(shell.dataset.activeIndex || 0);
    if (focusIndexState.mode === "index" || focusIndexState.phase !== "idle" || shell.classList.contains("is-index")) {
      if (event.key === "Escape") {
        event.preventDefault();
        closeFocusIndex(focusIndexState.activeIndex, { restoreNotes: focusIndexState.returnMode === "notes" });
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
  focusInitialLockUntil = Date.now() + 1800;
  setFocus(initial, false);
  thumbs.querySelectorAll("img").forEach((thumbImage) => {
    thumbImage.addEventListener("load", () => {
      updateFocusRailMetrics();
      updateMobileFocusRail();
      if (Date.now() < focusInitialLockUntil) scrollToFocusIndex(initial, false);
      scheduleFocusRailSync(320);
    }, { once: true });
  });
  requestAnimationFrame(() => {
    updateFocusRailMetrics();
    updateMobileFocusRail();
    scrollToFocusIndex(initial, false);
    window.setTimeout(() => scrollToFocusIndex(initial, false), 520);
    scheduleFocusRailSync(720);
  });
  window.addEventListener("resize", () => {
    invalidateFocusIndexCardMetrics();
    invalidateFocusLayoutMeasurements();
    updateFocusRailMetrics();
    updateMobileFocusRail();
    updateFocusMainPlaceholderGeometry();
    scheduleFocusRailSync(420);
    scheduleNotesLayoutUpdate();
    if (focusIndexState.mode === "index" || focusIndexState.phase !== "idle") {
      scheduleFocusIndexResize();
    } else {
      const activeIndex = Number(shell.dataset.activeIndex || initial);
      cancelFocusIndexMotionWarmup();
      invalidateFocusIndexMotionPlan();
      scrollToFocusIndex(activeIndex, false);
      scheduleFocusIndexMotionWarmup(activeIndex);
    }
  });
  window.addEventListener("l4rxx:languagechange", () => {
    const active = Number(shell.dataset.activeIndex || initial);
    const activePhoto = photos[active] || photos[0];
    transitionFocusNoteCopy(() => {
      updateFocusNoteContent(activePhoto);
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
    const photo = photos[index];
    if (photo?.width > 0 && photo?.height > 0) {
      const ratio = photo.width / photo.height;
      focusPhotoRatios.set(index, ratio);
      return ratio;
    }
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

  function invalidateFocusLayoutMeasurements() {
    focusMainBaseRectCache = null;
    focusMainBaseRectViewportWidth = 0;
    focusMainBaseRectViewportHeight = 0;
    notesLayoutCacheKey = "";
    notesLayoutSnapshot = null;
  }

  function measureFocusMainBaseRect(force = false) {
    if (!focusMain) return null;
    const canReuse = !force
      && focusMainBaseRectCache
      && focusMainBaseRectViewportWidth === window.innerWidth
      && focusMainBaseRectViewportHeight === window.innerHeight;
    if (canReuse) return copyFocusRect(focusMainBaseRectCache);
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
    focusMainBaseRectCache = copyFocusRect(rect);
    focusMainBaseRectViewportWidth = window.innerWidth;
    focusMainBaseRectViewportHeight = window.innerHeight;
    return copyFocusRect(focusMainBaseRectCache);
  }

  function getFocusMainTargetRect(options = {}) {
    if (options.notes && !options.layoutReady) updateNotesLayout();
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
    const box = getFocusMainTargetRect({
      notes: Boolean(options.notes),
      layoutReady: Boolean(options.layoutReady)
    }) || getFocusRect(image) || getFocusRect(imageToggle);
    const ratio = getFocusPhotoRatio(index, options.sourceRect);
    if (!box || !ratio) return box;
    return getContentRectWithin(box, ratio);
  }

  function copyFocusRect(rect) {
    if (!rect) return null;
    return {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height
    };
  }

  function focusRectsNearlyEqual(first, second, tolerance = .75) {
    if (!first || !second) return false;
    return ["left", "top", "width", "height"].every((property) => {
      return Math.abs(first[property] - second[property]) <= tolerance;
    });
  }

  function measureUnlockedFocusMainTargetRect(notes, options = {}) {
    const body = document.body;
    const locked = body.classList.contains("focus-index-scroll-lock");
    if (!locked) return getFocusMainTargetRect({ notes, layoutReady: Boolean(options.layoutReady) });
    const lockedStyles = {
      top: body.style.top,
      position: body.style.position,
      width: body.style.width,
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight
    };
    body.classList.remove("focus-index-scroll-lock");
    body.style.top = focusIndexState.savedBodyTop;
    body.style.position = focusIndexState.savedBodyPosition;
    body.style.width = focusIndexState.savedBodyWidth;
    body.style.overflow = focusIndexState.savedBodyOverflow;
    body.style.paddingRight = focusIndexState.savedBodyPaddingRight;
    const rect = getFocusMainTargetRect({ notes, layoutReady: Boolean(options.layoutReady) });
    body.classList.add("focus-index-scroll-lock");
    body.style.top = lockedStyles.top;
    body.style.position = lockedStyles.position;
    body.style.width = lockedStyles.width;
    body.style.overflow = lockedStyles.overflow;
    body.style.paddingRight = lockedStyles.paddingRight;
    return rect;
  }

  function measureFocusIndexFinalNotesRect(index, sourceRect) {
    const body = document.body;
    const shellClassName = shell.className;
    const locked = body.classList.contains("focus-index-scroll-lock");
    const lockedStyles = locked ? {
      top: body.style.top,
      position: body.style.position,
      width: body.style.width,
      overflow: body.style.overflow,
      paddingRight: body.style.paddingRight
    } : null;

    if (locked) {
      body.classList.remove("focus-index-scroll-lock");
      body.style.top = focusIndexState.savedBodyTop;
      body.style.position = focusIndexState.savedBodyPosition;
      body.style.width = focusIndexState.savedBodyWidth;
      body.style.overflow = focusIndexState.savedBodyOverflow;
      body.style.paddingRight = focusIndexState.savedBodyPaddingRight;
    }

    shell.classList.remove(
      "is-index",
      "is-index-opening",
      "is-index-closing",
      "is-index-exiting",
      "is-index-opening-active",
      "is-index-transitioning",
      "is-index-reparenting",
      "is-index-return-settling"
    );
    shell.classList.add("is-notes");
    notesLayoutCacheKey = "";
    notesLayoutSnapshot = null;
    const layoutSnapshot = updateNotesLayout();
    shell.offsetHeight;
    const rect = getFocusImageContentRectForPhoto(photos[index], index, {
      notes: true,
      layoutReady: Boolean(layoutSnapshot),
      sourceRect
    });

    shell.className = shellClassName;
    if (locked && lockedStyles) {
      body.classList.add("focus-index-scroll-lock");
      body.style.top = lockedStyles.top;
      body.style.position = lockedStyles.position;
      body.style.width = lockedStyles.width;
      body.style.overflow = lockedStyles.overflow;
      body.style.paddingRight = lockedStyles.paddingRight;
    }
    return rect;
  }

  function getFocusIndexReturnRect(index, sourceRect, restoreNotes, options = {}) {
    if (restoreNotes) {
      const finalNotesRect = measureFocusIndexFinalNotesRect(index, sourceRect);
      if (finalNotesRect) return finalNotesRect;
    }
    const sameViewport = focusIndexState.returnViewportWidth === window.innerWidth
      && focusIndexState.returnViewportHeight === window.innerHeight;
    if (sameViewport && index === focusIndexState.returnImageIndex && focusIndexState.returnImageRect) {
      return copyFocusRect(focusIndexState.returnImageRect);
    }
    const box = sameViewport
      ? focusIndexState.returnBoxRect
      : measureUnlockedFocusMainTargetRect(restoreNotes, options);
    const ratio = getFocusPhotoRatio(index, sourceRect);
    if (box && ratio) return getContentRectWithin(box, ratio);
    return getFocusImageContentRectForPhoto(photos[index], index, {
      notes: restoreNotes,
      layoutReady: Boolean(options.layoutReady),
      sourceRect
    });
  }

  function getFocusIndexCardByIndex(index) {
    return focusIndexCards[index] || null;
  }

  function invalidateFocusIndexCardMetrics() {
    focusIndexCardMetrics = [];
    focusIndexMetricsViewportWidth = 0;
    focusIndexMetricsViewportHeight = 0;
  }

  function refreshFocusIndexCardMetrics(force = false) {
    if (!indexGallery) return [];
    const reusable = !force
      && focusIndexCardMetrics.length === focusIndexCards.length
      && focusIndexMetricsViewportWidth === window.innerWidth
      && focusIndexMetricsViewportHeight === window.innerHeight;
    if (reusable) return focusIndexCardMetrics;
    focusIndexCardMetrics = focusIndexCards.map((card, index) => ({
      index,
      top: card.offsetTop,
      left: card.offsetLeft,
      width: card.offsetWidth,
      height: card.offsetHeight
    }));
    focusIndexMetricsViewportWidth = window.innerWidth;
    focusIndexMetricsViewportHeight = window.innerHeight;
    return focusIndexCardMetrics;
  }

  function getFocusIndexLayoutRect(index, galleryRect = getFocusRect(indexGallery)) {
    const metric = refreshFocusIndexCardMetrics()[index];
    if (!metric || !galleryRect) return null;
    return {
      left: galleryRect.left + metric.left - indexGallery.scrollLeft,
      top: galleryRect.top + metric.top - indexGallery.scrollTop,
      width: metric.width,
      height: metric.height
    };
  }

  function getFocusIndexCardRect(card) {
    const media = card?.querySelector(".focus-index-card__media");
    return getFocusRect(media) || getFocusRect(card?.querySelector("img")) || getFocusRect(card);
  }

  function getFocusImageAbsoluteUrl(src) {
    if (!src) return "";
    try {
      return new URL(src, window.location.href).href;
    } catch (error) {
      return src;
    }
  }

  function setFocusIndexGalleryActive(index) {
    if (!indexGallery) return;
    focusIndexCards.forEach((card, cardIndex) => {
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
    const value = ratio.toFixed(5);
    if (card.style.getPropertyValue("--focus-index-ratio") !== value) {
      card.style.setProperty("--focus-index-ratio", value);
      invalidateFocusIndexCardMetrics();
    }
  }

  function positionFocusIndexGalleryOnActive(activeIndex) {
    if (!indexGallery) return null;
    const card = getFocusIndexCardByIndex(activeIndex);
    if (!card) return null;
    lockFocusIndexCardRatio(activeIndex);
    indexGallery.scrollLeft = 0;
    const metric = refreshFocusIndexCardMetrics()[activeIndex];
    const targetTop = metric
      ? metric.top + metric.height / 2 - indexGallery.clientHeight / 2
      : card.offsetTop + card.offsetHeight / 2 - indexGallery.clientHeight / 2;
    const maxTop = Math.max(0, indexGallery.scrollHeight - indexGallery.clientHeight);
    indexGallery.scrollTop = Math.max(0, Math.min(targetTop, maxTop));
    scheduleFocusIndexImageWindow();
    return getFocusIndexCardRect(card);
  }

  function getBoundedFocusIndex(index) {
    return Math.max(0, Math.min(Number(index) || 0, photos.length - 1));
  }

  function isFocusIndexReducedMotion() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function prepareFocusIndexImage(node, index) {
    const photo = photos[index];
    if (!node || !photo) return node;
    node.dataset.focusIndexPhoto = String(index);
    node.dataset.focusIndexFull = getFocusPhotoSource(photo);
    node.dataset.focusIndexThumb = photo.thumb;
    node.alt = photo.alt || "";
    node.decoding = "async";
    if (photo.width > 0 && photo.height > 0) {
      node.width = photo.width;
      node.height = photo.height;
    }
    return node;
  }

  function createFocusIndexCardImage(index) {
    const photo = photos[index];
    if (!photo) return null;
    const node = document.createElement("img");
    node.src = photo.thumb;
    node.loading = "lazy";
    node.fetchPriority = "low";
    return prepareFocusIndexImage(node, index);
  }

  function hydrateFocusIndexCardThumb(node, index, prioritize = false) {
    const photo = photos[index];
    if (!node || !photo?.thumb) return false;
    const thumb = getFocusImageAbsoluteUrl(photo.thumb);
    const current = getFocusImageAbsoluteUrl(node.currentSrc || node.getAttribute("src"));
    if (current && current !== thumb) return node.complete && node.naturalWidth > 0;
    const watchThumbAttempt = () => {
      if (node.dataset.focusIndexThumbWatching === thumb) return;
      node.dataset.focusIndexThumbWatching = thumb;
      const onLoad = () => {
        if (getFocusImageAbsoluteUrl(node.currentSrc || node.getAttribute("src")) !== thumb) return;
        delete node.dataset.focusIndexThumbWatching;
        node.dataset.focusIndexThumbAttempts = "0";
      };
      const onError = () => {
        if (getFocusImageAbsoluteUrl(node.currentSrc || node.getAttribute("src")) !== thumb) return;
        delete node.dataset.focusIndexThumbWatching;
        node.removeAttribute("src");
        if (Number(node.dataset.focusIndexThumbAttempts || 0) >= 3) return;
        window.setTimeout(() => {
          if (focusIndexState.mode === "index" || focusIndexState.phase === "opening") {
            scheduleFocusIndexImageWindow();
          }
        }, 160);
      };
      node.addEventListener("load", onLoad, { once: true });
      node.addEventListener("error", onError, { once: true });
    };
    if (current === thumb && node.complete && node.naturalWidth > 0) {
      node.dataset.focusIndexThumbAttempts = "0";
      return true;
    }
    if (current === thumb && !node.complete) {
      watchThumbAttempt();
      return false;
    }
    const attempts = Number(node.dataset.focusIndexThumbAttempts || 0);
    if (attempts >= 3) return false;
    node.loading = "eager";
    node.fetchPriority = prioritize ? "high" : "low";
    node.dataset.focusIndexThumbAttempts = String(attempts + 1);
    watchThumbAttempt();
    if (node.getAttribute("src")) node.removeAttribute("src");
    node.src = photo.thumb;
    const placeholder = node.closest(".focus-index-card__media.photo-placeholder");
    if (placeholder && !placeholder.classList.contains("is-photo-ready")) {
      watchPhotoPlaceholderImage(node, placeholder, photo.thumb);
    }
    return false;
  }

  function requestFocusIndexFullImage(node, index, prioritize = false) {
    const photo = photos[index];
    const source = getFocusPhotoSource(photo);
    if (!node || !source) return;
    prepareFocusIndexImage(node, index);
    hydrateFocusIndexCardThumb(node, index, prioritize);
    const full = getFocusImageAbsoluteUrl(source);
    const current = getFocusImageAbsoluteUrl(node.currentSrc || node.getAttribute("src"));
    const thumb = getFocusImageAbsoluteUrl(photo.thumb);
    if (current === thumb && (!node.complete || node.naturalWidth <= 0) && node.dataset.focusIndexThumbFailed !== thumb) {
      node.fetchPriority = prioritize ? "high" : "low";
      if (node.dataset.focusIndexWaitingForThumb === thumb) return;
      node.dataset.focusIndexWaitingForThumb = thumb;
      const resume = () => {
        if (node.dataset.focusIndexWaitingForThumb !== thumb) return;
        delete node.dataset.focusIndexWaitingForThumb;
        requestFocusIndexFullImage(node, index, prioritize);
      };
      const resumeAfterError = () => {
        node.dataset.focusIndexThumbFailed = thumb;
        resume();
      };
      node.addEventListener("load", resume, { once: true });
      node.addEventListener("error", resumeAfterError, { once: true });
      return;
    }
    if (current === full && node.complete && node.naturalWidth > 0) {
      const placeholder = node.closest(".focus-index-card__media.photo-placeholder");
      if (placeholder && !placeholder.classList.contains("is-photo-ready")) {
        watchPhotoPlaceholderImage(node, placeholder, source);
      }
      if (node.decode) node.decode().catch(() => {}).then(() => node.style.removeProperty("background-image"));
      else node.style.removeProperty("background-image");
      return;
    }
    if (node.dataset.focusIndexLoading === full) return;
    node.dataset.focusIndexLoading = full;
    node.fetchPriority = prioritize ? "high" : "low";
    if (photo.thumb) node.style.backgroundImage = `url("${photo.thumb}")`;

    const finish = () => {
      if (node.dataset.focusIndexLoading !== full) return;
      delete node.dataset.focusIndexLoading;
      const clearFallback = () => node.style.removeProperty("background-image");
      if (node.decode) node.decode().then(clearFallback).catch(clearFallback);
      else clearFallback();
    };
    const fail = () => {
      if (node.dataset.focusIndexLoading !== full) return;
      delete node.dataset.focusIndexLoading;
      if (photo.thumb && getFocusImageAbsoluteUrl(node.getAttribute("src")) !== getFocusImageAbsoluteUrl(photo.thumb)) {
        node.src = photo.thumb;
      }
    };
    node.addEventListener("load", finish, { once: true });
    node.addEventListener("error", fail, { once: true });
    node.src = source;
    const placeholder = node.closest(".focus-index-card__media.photo-placeholder");
    if (placeholder && !placeholder.classList.contains("is-photo-ready")) {
      watchPhotoPlaceholderImage(node, placeholder, source);
    }
    if (node.complete && node.naturalWidth > 0) finish();
  }

  function hydrateFocusIndexVisibleThumbs(prioritizedIndex = focusIndexState.activeIndex) {
    if (!indexGallery) return;
    const candidateCards = new Map();
    focusIndexVisibleCards.forEach((card) => {
      const index = Number(card.dataset.index || 1) - 1;
      if (index >= 0) candidateCards.set(index, card);
    });
    for (let offset = -3; offset <= 3; offset += 1) {
      const index = getBoundedFocusIndex(prioritizedIndex + offset);
      const card = getFocusIndexCardByIndex(index);
      if (card) candidateCards.set(index, card);
    }
    if (!candidateCards.size || !focusIndexCardObserver) {
      const buffer = indexGallery.clientHeight * 0.25;
      const visibleTop = indexGallery.scrollTop - buffer;
      const visibleBottom = indexGallery.scrollTop + indexGallery.clientHeight + buffer;
      refreshFocusIndexCardMetrics().forEach((metric) => {
        if (metric.top + metric.height < visibleTop || metric.top > visibleBottom) return;
        const card = getFocusIndexCardByIndex(metric.index);
        if (card) candidateCards.set(metric.index, card);
      });
    }
    const candidates = [...candidateCards].map(([index, card]) => ({
      index,
      node: card.querySelector("img")
    })).filter(({ node }) => Boolean(node));
    candidates.sort((first, second) => Math.abs(first.index - prioritizedIndex) - Math.abs(second.index - prioritizedIndex));
    const maxStarts = focusIndexState.phase === "opening" ? 6 : 8;
    let starts = 0;
    let hasPending = false;
    candidates.forEach(({ node, index }) => {
      const current = getFocusImageAbsoluteUrl(node.currentSrc || node.getAttribute("src"));
      const needsRequest = !current;
      if (needsRequest && starts >= maxStarts) {
        hasPending = true;
        return;
      }
      hydrateFocusIndexCardThumb(node, index, index === prioritizedIndex);
      if (needsRequest) starts += 1;
    });
    if (hasPending && !focusIndexThumbBatchTimer) {
      focusIndexThumbBatchTimer = window.setTimeout(() => {
        focusIndexThumbBatchTimer = 0;
        scheduleFocusIndexImageWindow();
      }, 120);
    }
  }

  function resetFocusIndexHorizontalOffset() {
    if (indexGallery && indexGallery.scrollLeft !== 0) indexGallery.scrollLeft = 0;
    if (document.documentElement.scrollLeft !== 0) document.documentElement.scrollLeft = 0;
    if (document.body.scrollLeft !== 0) document.body.scrollLeft = 0;
  }

  function hydrateFocusIndexImageWindow() {
    focusIndexState.loadFrame = 0;
    if (!indexGallery || (focusIndexState.mode !== "index" && focusIndexState.phase !== "opening")) return;
    hydrateFocusIndexVisibleThumbs();
  }

  function warmFocusIndexCardThumbs(centerIndex) {
    if (!indexGallery) return;
    const boundedIndex = getBoundedFocusIndex(centerIndex);
    if (!canReuseFocusIndexCardMotionFrames(boundedIndex)) {
      prepareFocusIndexCardMotionPlan(boundedIndex);
    }
    if (!focusIndexPreparedRect
      || focusIndexPreparedIndex !== boundedIndex
      || focusIndexPreparedViewportWidth !== window.innerWidth
      || focusIndexPreparedViewportHeight !== window.innerHeight) {
      focusIndexPreparedRect = copyFocusRect(positionFocusIndexGalleryOnActive(boundedIndex));
    }
    focusIndexPreparedViewportWidth = window.innerWidth;
    focusIndexPreparedViewportHeight = window.innerHeight;
    hydrateFocusIndexVisibleThumbs(boundedIndex);
    focusIndexPreparedIndex = boundedIndex;
  }

  function scheduleFocusIndexImageWindow() {
    if (focusIndexState.loadFrame) return;
    focusIndexState.loadFrame = requestAnimationFrame(hydrateFocusIndexImageWindow);
  }

  function lockFocusIndexPageScroll() {
    if (document.body.classList.contains("focus-index-scroll-lock")) return;
    const body = document.body;
    focusIndexState.savedScrollY = window.scrollY || document.documentElement.scrollTop || 0;
    focusIndexState.savedBodyTop = body.style.top;
    focusIndexState.savedBodyPosition = body.style.position;
    focusIndexState.savedBodyWidth = body.style.width;
    focusIndexState.savedBodyOverflow = body.style.overflow;
    focusIndexState.savedBodyPaddingRight = body.style.paddingRight;
    const scrollbarGap = Math.max(0, window.innerWidth - document.documentElement.clientWidth);
    document.documentElement.classList.add("focus-index-scroll-lock");
    body.classList.add("focus-index-scroll-lock");
    body.style.position = "fixed";
    body.style.top = `${-focusIndexState.savedScrollY}px`;
    body.style.width = "100%";
    body.style.overflow = "hidden";
    if (scrollbarGap > 0) body.style.paddingRight = `${scrollbarGap}px`;
  }

  function unlockFocusIndexPageScroll() {
    const body = document.body;
    if (!body.classList.contains("focus-index-scroll-lock")) return;
    document.documentElement.classList.remove("focus-index-scroll-lock");
    body.classList.remove("focus-index-scroll-lock");
    body.style.top = focusIndexState.savedBodyTop;
    body.style.position = focusIndexState.savedBodyPosition;
    body.style.width = focusIndexState.savedBodyWidth;
    body.style.overflow = focusIndexState.savedBodyOverflow;
    body.style.paddingRight = focusIndexState.savedBodyPaddingRight;
    window.scrollTo({ top: focusIndexState.savedScrollY, left: 0, behavior: "auto" });
  }

  function clearFocusIndexCardMotionStyles(card) {
    if (!card) return;
    card.style.removeProperty("transform");
    card.style.removeProperty("opacity");
    card.style.removeProperty("filter");
    card.style.removeProperty("will-change");
  }

  function cancelFocusIndexCardAnimations(commit = false) {
    focusIndexState.cardAnimations.forEach(({ animation, card }) => {
      if (commit) {
        try {
          animation.commitStyles();
        } catch (error) {
          const style = getComputedStyle(card);
          card.style.transform = style.transform === "none" ? "none" : style.transform;
          card.style.opacity = style.opacity;
        }
      }
      animation.cancel();
    });
    focusIndexState.cardAnimations = [];
  }

  function getFocusIndexCardBaseRects(cards) {
    const snapshots = [];
    let resetTransforms = false;
    cards.forEach((card) => {
      const transform = card.style.getPropertyValue("transform");
      const priority = card.style.getPropertyPriority("transform");
      snapshots.push({ card, transform, priority });
      if (!transform || transform === "none") return;
      card.style.setProperty("transform", "none", "important");
      resetTransforms = true;
    });
    if (resetTransforms) indexGallery?.offsetHeight;
    const galleryRect = getFocusRect(indexGallery);
    const rects = new Map(cards.map((card) => {
      const index = Number(card.dataset.index || 1) - 1;
      return [card, getFocusIndexLayoutRect(index, galleryRect) || getFocusIndexCardRect(card)];
    }));
    if (resetTransforms) {
      snapshots.forEach(({ card, transform, priority }) => {
        if (transform) card.style.setProperty("transform", transform, priority);
        else card.style.removeProperty("transform");
      });
    }
    return rects;
  }

  const focusIndexMotionCurve = window.innerWidth <= 768
    ? [.24, .64, .34, 1]
    : [.18, .82, .24, 1];
  const focusIndexMotionEasing = `cubic-bezier(${focusIndexMotionCurve.join(", ")})`;
  const focusIndexMotionSampleCount = window.innerWidth <= 768 ? 20 : 32;

  function getFocusIndexPrimaryDuration() {
    return 1080;
  }

  function getFocusIndexCardTiming(cardRect, anchorRect, totalDuration = getFocusIndexPrimaryDuration()) {
    const cardX = cardRect.left + cardRect.width / 2;
    const cardY = cardRect.top + cardRect.height / 2;
    const anchorX = anchorRect.left + anchorRect.width / 2;
    const anchorY = anchorRect.top + anchorRect.height / 2;
    const viewportDistance = Math.max(1, Math.hypot(window.innerWidth, window.innerHeight) * .58);
    const distanceRatio = Math.max(0, Math.min(1, Math.hypot(cardX - anchorX, cardY - anchorY) / viewportDistance));
    return {
      duration: Math.max(180, Math.round(totalDuration)),
      delay: 0,
      distanceRatio
    };
  }

  function getFocusIndexCubicProgress(progress) {
    const target = Math.max(0, Math.min(1, progress));
    const [x1, y1, x2, y2] = focusIndexMotionCurve;
    let low = 0;
    let high = 1;
    let parameter = target;
    for (let iteration = 0; iteration < 10; iteration += 1) {
      parameter = (low + high) / 2;
      const inverse = 1 - parameter;
      const x = 3 * inverse * inverse * parameter * x1
        + 3 * inverse * parameter * parameter * x2
        + parameter * parameter * parameter;
      if (x < target) low = parameter;
      else high = parameter;
    }
    const inverse = 1 - parameter;
    return 3 * inverse * inverse * parameter * y1
      + 3 * inverse * parameter * parameter * y2
      + parameter * parameter * parameter;
  }

  function getFocusIndexMotionRectForProgress(motion, progress) {
    const { spawn, cardRect } = motion;
    if (progress <= .01) return null;
    if (progress >= 1) return cardRect;
    const finalX = cardRect.left + cardRect.width / 2;
    const finalY = cardRect.top + cardRect.height / 2;
    const centerX = spawn.x + (finalX - spawn.x) * progress;
    const centerY = spawn.y + (finalY - spawn.y) * progress;
    const scale = spawn.scale + (1 - spawn.scale) * progress;
    const width = cardRect.width * scale;
    const height = cardRect.height * scale;
    return {
      left: centerX - width / 2,
      top: centerY - height / 2,
      width,
      height
    };
  }

  function getFocusIndexMainMotionRectForProgress(mainMotion, progress) {
    if (!mainMotion?.fromRect || !mainMotion?.toRect || mainMotion.duration <= 0) return null;
    return {
      left: mainMotion.fromRect.left + (mainMotion.toRect.left - mainMotion.fromRect.left) * progress,
      top: mainMotion.fromRect.top + (mainMotion.toRect.top - mainMotion.fromRect.top) * progress,
      width: mainMotion.fromRect.width + (mainMotion.toRect.width - mainMotion.fromRect.width) * progress,
      height: mainMotion.fromRect.height + (mainMotion.toRect.height - mainMotion.fromRect.height) * progress
    };
  }

  function focusIndexRectsOverlap(first, second, clearance = 2) {
    if (!first || !second) return false;
    return first.left < second.left + second.width + clearance
      && first.left + first.width + clearance > second.left
      && first.top < second.top + second.height + clearance
      && first.top + first.height + clearance > second.top;
  }

  function focusIndexRectTouchesViewport(rect) {
    return rect
      && rect.left < window.innerWidth
      && rect.left + rect.width > 0
      && rect.top < window.innerHeight
      && rect.top + rect.height > 0;
  }

  function getFocusIndexMotionLane(cardRect, anchorRect, index) {
    const cardX = cardRect.left + cardRect.width / 2;
    const cardY = cardRect.top + cardRect.height / 2;
    const anchorX = anchorRect.left + anchorRect.width / 2;
    const anchorY = anchorRect.top + anchorRect.height / 2;
    const dx = cardX - anchorX;
    const dy = cardY - anchorY;
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return index % 2 ? "right" : "left";
    if (Math.abs(dy) >= Math.abs(dx) * .72) return dy < 0 ? "top" : "bottom";
    return dx < 0 ? "left" : "right";
  }

  function setFocusIndexMotionSpawn(motion, offsetX, offsetY) {
    const cardX = motion.cardRect.left + motion.cardRect.width / 2;
    const cardY = motion.cardRect.top + motion.cardRect.height / 2;
    const scale = .58;
    motion.spawn = {
      x: cardX + offsetX,
      y: cardY + offsetY,
      scale,
      transform: `translate3d(${offsetX}px, ${offsetY}px, 0) scale(${scale})`,
      opacity: "0"
    };
    motion.travelDistance = Math.hypot(offsetX, offsetY);
  }

  function assignFocusIndexConcurrentLanes(motions, anchorRect) {
    const groups = { top: [], right: [], bottom: [], left: [] };
    motions.forEach((motion) => {
      motion.lane = getFocusIndexMotionLane(motion.cardRect, anchorRect, motion.visualIndex);
      groups[motion.lane].push(motion);
    });
    const overscan = window.innerWidth <= 768 ? 28 : 42;
    Object.entries(groups).forEach(([lane, group]) => {
      if (!group.length) return;
      const maxRight = Math.max(...group.map((motion) => motion.cardRect.left + motion.cardRect.width));
      const minLeft = Math.min(...group.map((motion) => motion.cardRect.left));
      const maxBottom = Math.max(...group.map((motion) => motion.cardRect.top + motion.cardRect.height));
      const minTop = Math.min(...group.map((motion) => motion.cardRect.top));
      let offsetX = 0;
      let offsetY = 0;
      if (lane === "top") offsetY = -maxBottom - overscan;
      if (lane === "bottom") offsetY = window.innerHeight + overscan - minTop;
      if (lane === "left") offsetX = -maxRight - overscan;
      if (lane === "right") offsetX = window.innerWidth + overscan - minLeft;
      group.forEach((motion) => setFocusIndexMotionSpawn(motion, offsetX, offsetY));
    });
  }

  function planFocusIndexConcurrentMotions(motions, mainMotion) {
    const totalDuration = Math.max(1, mainMotion?.duration || getFocusIndexPrimaryDuration());
    const ordered = [...motions].sort((first, second) => first.distance - second.distance);
    const sampleCount = focusIndexMotionSampleCount * 2;
    const progressSamples = Array.from({ length: sampleCount + 1 }, (_, sample) => (
      getFocusIndexCubicProgress(sample / sampleCount)
    ));
    const rectSamples = new Map(motions.map((motion) => [
      motion,
      progressSamples.map((progress) => getFocusIndexMotionRectForProgress(motion, progress))
    ]));
    const mainSamples = progressSamples.map((progress) => getFocusIndexMainMotionRectForProgress(mainMotion, progress));
    const visibleSamples = new Map(motions.map((motion) => [
      motion,
      rectSamples.get(motion).map((rect) => focusIndexRectTouchesViewport(rect))
    ]));
    const mainVisibleSamples = mainSamples.map((rect) => focusIndexRectTouchesViewport(rect));
    const planned = [];
    ordered.forEach((motion) => {
      let lastCollisionProgress = -1;
      const currentSamples = rectSamples.get(motion);
      for (let sample = 0; sample <= sampleCount; sample += 1) {
        const rawProgress = sample / sampleCount;
        const currentRect = currentSamples[sample];
        if (!visibleSamples.get(motion)[sample]) continue;
        const mainRect = mainSamples[sample];
        if (mainVisibleSamples[sample] && focusIndexRectsOverlap(currentRect, mainRect, 8)) {
          lastCollisionProgress = rawProgress;
          continue;
        }
        for (const previous of planned) {
          if (rawProgress + .001 < previous.revealStart) continue;
          const previousRect = rectSamples.get(previous)[sample];
          if (visibleSamples.get(previous)[sample] && focusIndexRectsOverlap(currentRect, previousRect, 8)) {
            lastCollisionProgress = rawProgress;
            break;
          }
        }
      }
      motion.revealStart = lastCollisionProgress < 0
        ? 0
        : Math.min(.985, lastCollisionProgress + 1 / focusIndexMotionSampleCount);
      planned.push(motion);
    });
    return motions;
  }

  function getFocusIndexMotionTransformForProgress(motion, progress) {
    if (progress >= 1) return "none";
    const finalX = motion.cardRect.left + motion.cardRect.width / 2;
    const finalY = motion.cardRect.top + motion.cardRect.height / 2;
    const translateX = (motion.spawn.x - finalX) * (1 - progress);
    const translateY = (motion.spawn.y - finalY) * (1 - progress);
    const scale = motion.spawn.scale + (1 - motion.spawn.scale) * progress;
    return `translate3d(${translateX}px, ${translateY}px, 0) scale(${scale})`;
  }

  function getFocusIndexMotionTransformAt(motion, rawProgress) {
    return getFocusIndexMotionTransformForProgress(motion, getFocusIndexCubicProgress(rawProgress));
  }

  function getFocusIndexCardKeyframes(motion, direction) {
    const revealStart = Math.max(0, Math.min(.985, Number(motion.revealStart) || 0));
    const fadeEnd = Math.min(1, revealStart + .16 + (motion.distanceRatio || 0) * .08);
    const revealSpatialStart = getFocusIndexCubicProgress(revealStart);
    const fadeSpatialEnd = getFocusIndexCubicProgress(fadeEnd);
    const fadeSpan = Math.max(.0001, fadeSpatialEnd - revealSpatialStart);
    const frames = [];
    const addFrame = (spatialProgress, opacity, offset) => {
      const frame = {
        transform: getFocusIndexMotionTransformForProgress(motion, spatialProgress),
        opacity,
        offset: Math.max(0, Math.min(1, offset))
      };
      const previous = frames[frames.length - 1];
      if (previous && Math.abs(previous.offset - frame.offset) < .0001) frames[frames.length - 1] = frame;
      else frames.push(frame);
    };
    if (direction === "open") {
      addFrame(0, 0, 0);
      addFrame(revealSpatialStart, 0, revealSpatialStart);
      addFrame(revealSpatialStart + fadeSpan * .25, .15625, revealSpatialStart + fadeSpan * .25);
      addFrame(revealSpatialStart + fadeSpan * .75, .84375, revealSpatialStart + fadeSpan * .75);
      addFrame(fadeSpatialEnd, 1, fadeSpatialEnd);
      addFrame(1, 1, 1);
      return frames;
    }
    addFrame(1, 1, 0);
    addFrame(fadeSpatialEnd, 1, 1 - fadeSpatialEnd);
    addFrame(fadeSpatialEnd - fadeSpan * .25, .84375, 1 - fadeSpatialEnd + fadeSpan * .25);
    addFrame(fadeSpatialEnd - fadeSpan * .75, .15625, 1 - fadeSpatialEnd + fadeSpan * .75);
    addFrame(revealSpatialStart, 0, 1 - revealSpatialStart);
    addFrame(0, 0, 1);
    return frames;
  }

  function resetFocusIndexCardMotionFrames(index) {
    focusIndexState.cardMotionFrames.clear();
    focusIndexState.cardMotionRects.clear();
    focusIndexState.cardMotionGalleryRect = null;
    focusIndexState.cardMotionIndex = index;
    focusIndexState.cardMotionEndTime = 0;
    focusIndexState.cardMotionViewportWidth = window.innerWidth;
    focusIndexState.cardMotionViewportHeight = window.innerHeight;
  }

  function canReuseFocusIndexCardMotionFrames(index) {
    return focusIndexState.cardMotionIndex === index
      && focusIndexState.cardMotionViewportWidth === window.innerWidth
      && focusIndexState.cardMotionViewportHeight === window.innerHeight
      && focusIndexState.cardMotionFrames.size > 0
      && focusIndexState.cardMotionRects.size > 0
      && Boolean(focusIndexState.cardMotionGalleryRect);
  }

  function invalidateFocusIndexMotionPlan() {
    focusIndexState.cardMotionFrames.clear();
    focusIndexState.cardMotionRects.clear();
    focusIndexState.cardMotionGalleryRect = null;
    focusIndexState.cardMotionIndex = -1;
    focusIndexState.cardMotionEndTime = 0;
    focusIndexPreparedIndex = -1;
    focusIndexPreparedRect = null;
  }

  function getFocusIndexSpawnFrame(cardRect, index, savedFrame = null) {
    const cardX = cardRect.left + cardRect.width / 2;
    const cardY = cardRect.top + cardRect.height / 2;
    const savedX = Number(savedFrame?.x);
    const savedY = Number(savedFrame?.y);
    const savedScale = Number(savedFrame?.scale);
    if (savedFrame && Number.isFinite(savedX) && Number.isFinite(savedY)) {
      const scale = Number.isFinite(savedScale) ? savedScale : .52;
      return {
        x: savedX,
        y: savedY,
        scale,
        transform: `translate3d(${savedX - cardX}px, ${savedY - cardY}px, 0) scale(${scale})`,
        opacity: "0"
      };
    }
    return {
      x: cardX,
      y: cardY,
      scale: .58,
      transform: "none",
      opacity: "0"
    };
  }

  function collectFocusIndexCardMotions(anchorRect, selectedIndex, totalDuration, options = {}) {
    const cards = [...focusIndexCards];
    const canUseCachedRects = Boolean(options.useCachedRects)
      && focusIndexState.cardMotionGalleryRect
      && cards.every((card, visualIndex) => focusIndexState.cardMotionRects.has(visualIndex));
    const galleryRect = canUseCachedRects
      ? copyFocusRect(focusIndexState.cardMotionGalleryRect)
      : getFocusRect(indexGallery);
    if (!galleryRect) return { cards, motions: [], baseRects: new Map(), galleryRect: null };
    const baseRects = canUseCachedRects
      ? new Map(cards.map((card, visualIndex) => [card, copyFocusRect(focusIndexState.cardMotionRects.get(visualIndex))]))
      : getFocusIndexCardBaseRects(cards);
    const buffer = Math.min(96, galleryRect.height * .12);
    const motions = [];
    cards.forEach((card, visualIndex) => {
      if (visualIndex === selectedIndex) {
        if (options.clearStyles) clearFocusIndexCardMotionStyles(card);
        return;
      }
      const cardRect = baseRects.get(card);
      const visible = cardRect
        && cardRect.left + cardRect.width >= galleryRect.left - buffer
        && cardRect.left <= galleryRect.left + galleryRect.width + buffer
        && cardRect.top + cardRect.height >= galleryRect.top - buffer
        && cardRect.top <= galleryRect.top + galleryRect.height + buffer;
      if (!visible) {
        if (options.clearStyles && options.direction === "open") clearFocusIndexCardMotionStyles(card);
        return;
      }
      const savedFrame = options.useSavedFrames
        ? focusIndexState.cardMotionFrames.get(visualIndex)
        : null;
      const spawn = getFocusIndexSpawnFrame(cardRect, visualIndex, savedFrame);
      const baseTiming = getFocusIndexCardTiming(cardRect, anchorRect, totalDuration);
      const timing = {
        duration: totalDuration,
        delay: 0,
        distanceRatio: Number(savedFrame?.distanceRatio) || baseTiming.distanceRatio
      };
      const cardX = cardRect.left + cardRect.width / 2;
      const cardY = cardRect.top + cardRect.height / 2;
      const anchorX = anchorRect.left + anchorRect.width / 2;
      const anchorY = anchorRect.top + anchorRect.height / 2;
      motions.push({
        card,
        visualIndex,
        spawn,
        timing,
        cardRect,
        distance: Math.hypot(cardX - anchorX, cardY - anchorY),
        distanceRatio: timing.distanceRatio,
        revealStart: Number(savedFrame?.revealStart) || 0
      });
    });
    return { cards, motions, baseRects, galleryRect };
  }

  function storeFocusIndexCardMotionPlan(motions, baseRects, galleryRect, selectedIndex) {
    focusIndexState.cardMotionFrames.clear();
    focusIndexState.cardMotionRects.clear();
    baseRects.forEach((rect, card) => {
      const visualIndex = Number(card.dataset.index || 0) - 1;
      if (visualIndex >= 0 && rect) focusIndexState.cardMotionRects.set(visualIndex, copyFocusRect(rect));
    });
    focusIndexState.cardMotionGalleryRect = copyFocusRect(galleryRect);
    focusIndexState.cardMotionIndex = selectedIndex;
    focusIndexState.cardMotionViewportWidth = window.innerWidth;
    focusIndexState.cardMotionViewportHeight = window.innerHeight;
    focusIndexState.cardMotionEndTime = 0;
    motions.forEach(({ visualIndex, spawn, timing, revealStart, distanceRatio }) => {
      focusIndexState.cardMotionFrames.set(visualIndex, {
        x: spawn.x,
        y: spawn.y,
        scale: spawn.scale,
        duration: timing.duration,
        delay: timing.delay,
        revealStart,
        distanceRatio
      });
      focusIndexState.cardMotionEndTime = Math.max(
        focusIndexState.cardMotionEndTime,
        timing.delay + timing.duration
      );
    });
    return focusIndexState.cardMotionEndTime;
  }

  function prepareFocusIndexCardMotionPlan(activeIndex) {
    if (!indexGallery || isFocusIndexReducedMotion()) return 0;
    if (focusIndexState.mode === "index" || focusIndexState.phase !== "idle") return 0;
    const index = getBoundedFocusIndex(activeIndex);
    if (canReuseFocusIndexCardMotionFrames(index)) return focusIndexState.cardMotionEndTime;
    const targetRect = positionFocusIndexGalleryOnActive(index);
    const sourceRect = getFocusImageContentRect() || getFocusRect(image);
    if (!targetRect || !sourceRect) return 0;
    const totalDuration = getFocusIndexImageMotionDuration(
      index,
      sourceRect,
      targetRect,
      getFocusIndexPrimaryDuration(),
      false
    );
    resetFocusIndexCardMotionFrames(index);
    const plan = collectFocusIndexCardMotions(targetRect, index, totalDuration);
    assignFocusIndexConcurrentLanes(plan.motions, targetRect);
    planFocusIndexConcurrentMotions(plan.motions, {
      fromRect: sourceRect,
      toRect: targetRect,
      duration: totalDuration
    });
    storeFocusIndexCardMotionPlan(plan.motions, plan.baseRects, plan.galleryRect, index);
    focusIndexPreparedIndex = index;
    focusIndexPreparedRect = copyFocusRect(targetRect);
    focusIndexPreparedViewportWidth = window.innerWidth;
    focusIndexPreparedViewportHeight = window.innerHeight;
    return focusIndexState.cardMotionEndTime;
  }

  function cancelFocusIndexMotionWarmup() {
    focusIndexMotionWarmupRun += 1;
    if (focusIndexMotionWarmupHandle && "cancelIdleCallback" in window) {
      window.cancelIdleCallback(focusIndexMotionWarmupHandle);
    }
    focusIndexMotionWarmupHandle = 0;
    window.clearTimeout(focusIndexMotionWarmupTimer);
    focusIndexMotionWarmupTimer = 0;
  }

  function scheduleFocusIndexMotionWarmup(activeIndex) {
    cancelFocusIndexMotionWarmup();
    if (!indexGallery || isFocusIndexReducedMotion()) return;
    const index = getBoundedFocusIndex(activeIndex);
    const runId = focusIndexMotionWarmupRun;
    const queueWarmup = () => {
      if (runId !== focusIndexMotionWarmupRun) return;
      if (Number(shell.dataset.activeIndex || 0) !== index) return;
      const warmup = (deadline = null) => {
        focusIndexMotionWarmupHandle = 0;
        focusIndexMotionWarmupTimer = 0;
        if (runId !== focusIndexMotionWarmupRun) return;
        if (focusIndexState.mode === "index" || focusIndexState.phase !== "idle") return;
        if (deadline && !deadline.didTimeout && deadline.timeRemaining() < 8) {
          focusIndexMotionWarmupHandle = window.requestIdleCallback(warmup, { timeout: 640 });
          return;
        }
        prepareFocusIndexCardMotionPlan(index);
      };
      if ("requestIdleCallback" in window) {
        focusIndexMotionWarmupHandle = window.requestIdleCallback(warmup, { timeout: 900 });
      } else {
        focusIndexMotionWarmupTimer = window.setTimeout(warmup, 140);
      }
    };
    waitForImageDecoded(image, 800).then(queueWarmup);
  }

  function playFocusIndexCardMotion(direction, anchorRect, selectedIndex, resume = false, options = {}) {
    if (!indexGallery || !anchorRect || isFocusIndexReducedMotion()) return 0;
    cancelFocusIndexCardAnimations(resume);
    const totalDuration = Math.max(180, Number(options.totalDuration) || getFocusIndexPrimaryDuration());
    const reusableFrames = canReuseFocusIndexCardMotionFrames(selectedIndex);
    const needsPlan = !reusableFrames;
    if (needsPlan) {
      resetFocusIndexCardMotionFrames(selectedIndex);
    }
    const plan = collectFocusIndexCardMotions(anchorRect, selectedIndex, totalDuration, {
      useCachedRects: reusableFrames,
      useSavedFrames: reusableFrames,
      clearStyles: true,
      direction
    });
    const motions = plan.motions;
    if (!plan.galleryRect) return 0;
    if (needsPlan) {
      assignFocusIndexConcurrentLanes(motions, anchorRect);
      const mainMotion = direction === "open"
        ? { fromRect: options.mainFromRect, toRect: options.mainToRect, duration: totalDuration }
        : { fromRect: options.mainToRect, toRect: options.mainFromRect, duration: totalDuration };
      planFocusIndexConcurrentMotions(motions, mainMotion);
    }
    motions.forEach((motion) => {
      if (!resume) {
        motion.currentTransform = direction === "open" ? motion.spawn.transform : "none";
        motion.currentOpacity = direction === "open" ? motion.spawn.opacity : "1";
        return;
      }
      const computed = getComputedStyle(motion.card);
      motion.currentTransform = computed.transform === "none" ? "none" : computed.transform;
      motion.currentOpacity = computed.opacity;
    });
    const timelineEnd = storeFocusIndexCardMotionPlan(
      motions,
      plan.baseRects,
      plan.galleryRect,
      selectedIndex
    );
    const motionStartedAt = performance.now();
    motions.forEach((motion) => {
      const { card, visualIndex, spawn, timing, currentTransform, currentOpacity } = motion;
      const finalTransform = direction === "open" ? "none" : spawn.transform;
      const finalOpacity = direction === "open" ? "1" : spawn.opacity;
      const delay = 0;
      const motionRunId = focusIndexState.runId;
      const startCardMotion = (startTransform, startOpacity, motionDelay = delay, motionDuration = timing.duration) => {
        if (focusIndexState.runId !== motionRunId || (direction === "open" && focusIndexState.mode !== "index")) return;
        const duration = Math.max(180, motionDuration);
        const keyframes = resume
          ? [
            { transform: startTransform, opacity: startOpacity },
            { transform: finalTransform, opacity: finalOpacity }
          ]
          : getFocusIndexCardKeyframes(motion, direction);
        card.style.willChange = "transform, opacity";
        const animation = card.animate(keyframes, {
          duration,
          delay: motionDelay,
          easing: focusIndexMotionEasing,
          fill: "both"
        });
        const entry = { animation, card };
        focusIndexState.cardAnimations.push(entry);
        animation.finished.then(() => {
          focusIndexState.cardAnimations = focusIndexState.cardAnimations.filter((item) => item !== entry);
          if (focusIndexState.runId !== motionRunId) {
            animation.cancel();
            return;
          }
          if (direction === "open" && focusIndexState.mode === "index") {
            clearFocusIndexCardMotionStyles(card);
          } else if (direction === "close") {
            card.style.transform = finalTransform;
            card.style.opacity = finalOpacity;
            card.style.removeProperty("will-change");
          }
          animation.cancel();
        }).catch(() => {});
      };
      const cardImage = card.querySelector("img");
      if (direction === "open" && cardImage) {
        hydrateFocusIndexCardThumb(cardImage, visualIndex, false);
        const visualReady = cardImage.complete && cardImage.naturalWidth > 0;
        if (!visualReady) {
          card.style.transform = currentTransform;
          card.style.opacity = "0";
          card.style.willChange = "transform, opacity";
          cardImage.addEventListener("load", () => {
            if (focusIndexState.runId !== motionRunId || focusIndexState.mode !== "index") return;
            if (focusIndexState.phase !== "opening") {
              clearFocusIndexCardMotionStyles(card);
              return;
            }
            const remainingDuration = timing.duration - (performance.now() - motionStartedAt);
            if (remainingDuration >= 240) {
              startCardMotion(currentTransform, "0", 0, remainingDuration);
              return;
            }
            card.style.transform = "none";
            card.style.opacity = "0";
            card.style.willChange = "opacity";
            const animation = card.animate([
              { opacity: 0 },
              { opacity: 1 }
            ], {
              duration: 240,
              easing: focusIndexMotionEasing,
              fill: "both"
            });
            const entry = { animation, card };
            focusIndexState.cardAnimations.push(entry);
            animation.finished.then(() => {
              focusIndexState.cardAnimations = focusIndexState.cardAnimations.filter((item) => item !== entry);
              if (focusIndexState.runId === motionRunId) clearFocusIndexCardMotionStyles(card);
              animation.cancel();
            }).catch(() => {});
          }, { once: true });
          cardImage.addEventListener("error", () => {
            if (focusIndexState.runId !== motionRunId || focusIndexState.mode !== "index") return;
            clearFocusIndexCardMotionStyles(card);
            scheduleFocusIndexImageWindow();
          }, { once: true });
          return;
        }
      }
      startCardMotion(currentTransform, currentOpacity);
    });
    return motions.length ? timelineEnd : 0;
  }

  function setFocusIndexMovingRect(node, rect) {
    if (!node || !rect) return null;
    if (node.parentElement !== document.body) document.body.appendChild(node);
    node.classList.add("focus-index-moving-image");
    node.style.left = `${rect.left}px`;
    node.style.top = `${rect.top}px`;
    node.style.width = `${rect.width}px`;
    node.style.height = `${rect.height}px`;
    node.style.transform = "translate3d(0, 0, 0) scaleX(1) scaleY(1)";
    node.style.opacity = "1";
    return rect;
  }

  function clearFocusIndexMovingStyles(node) {
    if (!node) return;
    node.classList.remove("focus-index-moving-image");
    ["left", "top", "width", "height", "transform", "opacity", "filter", "zIndex", "pointerEvents"].forEach((name) => {
      node.style[name] = "";
    });
  }

  function cancelFocusIndexImageAnimation(freeze = true) {
    const currentRect = getFocusRect(image);
    const active = focusIndexState.imageAnimation;
    if (active?.safetyTimer) window.clearTimeout(active.safetyTimer);
    if (active?.animation) active.animation.cancel();
    focusIndexState.imageAnimation = null;
    if (freeze && currentRect) setFocusIndexMovingRect(image, currentRect);
    return currentRect;
  }

  function getFocusIndexMotionDuration(fromRect, toRect, baseDuration, resumed = false) {
    if (!resumed || !fromRect || !toRect) return baseDuration;
    const centerDistance = Math.hypot(
      toRect.left + toRect.width / 2 - fromRect.left - fromRect.width / 2,
      toRect.top + toRect.height / 2 - fromRect.top - fromRect.height / 2
    );
    const viewportDistance = Math.max(1, Math.hypot(window.innerWidth, window.innerHeight));
    const sizeDistance = Math.abs(toRect.width - fromRect.width) + Math.abs(toRect.height - fromRect.height);
    const remaining = Math.max(0.12, Math.min(1, centerDistance / viewportDistance + sizeDistance / viewportDistance));
    return Math.max(180, Math.round(baseDuration * Math.sqrt(remaining)));
  }

  function getFocusIndexImageMotionDuration(index, fromRect, targetRect, baseDuration, resumed = false) {
    if (isFocusIndexReducedMotion()) return 0;
    const ratio = getFocusPhotoRatio(index, fromRect);
    const finalRect = normalizeFocusTravelRect(targetRect, ratio) || targetRect;
    return getFocusIndexMotionDuration(fromRect, finalRect, baseDuration, resumed);
  }

  function animateFocusIndexImageTo(index, targetRect, options = {}) {
    if (!image || !targetRect) {
      options.onArrive?.(targetRect);
      return null;
    }
    const measuredFromRect = getFocusRect(image);
    if (!measuredFromRect) {
      setFocusIndexMovingRect(image, targetRect);
      options.onArrive?.(targetRect);
      return null;
    }
    const ratio = getFocusPhotoRatio(index, measuredFromRect);
    const fromRect = normalizeFocusTravelRect(measuredFromRect, ratio) || measuredFromRect;
    const finalRect = normalizeFocusTravelRect(targetRect, ratio) || targetRect;
    setFocusIndexMovingRect(image, fromRect);
    const motionDuration = Number.isFinite(options.motionDuration)
      ? Math.max(0, options.motionDuration)
      : getFocusIndexMotionDuration(
        fromRect,
        finalRect,
        options.duration || 900,
        Boolean(options.resumed)
      );
    if (motionDuration <= 0) {
      setFocusIndexMovingRect(image, finalRect);
      options.onArrive?.(finalRect);
      return null;
    }
    const translateX = finalRect.left - fromRect.left;
    const translateY = finalRect.top - fromRect.top;
    const scaleX = finalRect.width / Math.max(1, fromRect.width);
    const scaleY = finalRect.height / Math.max(1, fromRect.height);
    const startTransform = "translate3d(0, 0, 0) scaleX(1) scaleY(1)";
    const finalTransform = `translate3d(${translateX}px, ${translateY}px, 0) scaleX(${scaleX}) scaleY(${scaleY})`;
    const animation = image.animate([
      { transform: startTransform },
      { transform: finalTransform }
    ], {
      duration: motionDuration,
      easing: focusIndexMotionEasing,
      fill: "both"
    });
    const runId = focusIndexState.runId;
    const imageAnimationState = { animation, runId, safetyTimer: 0 };
    focusIndexState.imageAnimation = imageAnimationState;
    const finish = () => {
      if (focusIndexState.runId !== runId || focusIndexState.imageAnimation?.animation !== animation) return;
      window.clearTimeout(imageAnimationState.safetyTimer);
      setFocusIndexMovingRect(image, finalRect);
      animation.cancel();
      focusIndexState.imageAnimation = null;
      options.onArrive?.(finalRect);
    };
    imageAnimationState.safetyTimer = window.setTimeout(finish, motionDuration + 240);
    animation.finished.then(finish).catch(() => {});
    return animation;
  }

  function getOrCreateFocusIndexCardImage(index) {
    const card = getFocusIndexCardByIndex(index);
    const media = card?.querySelector(".focus-index-card__media");
    if (!media) return null;
    let node = media.querySelector("img");
    if (!node) {
      node = createFocusIndexCardImage(index);
      if (node) {
        media.appendChild(node);
        initializePhotoPlaceholder(media, node, photos[index]?.thumb || "");
      }
    }
    prepareFocusIndexImage(node, index);
    return node;
  }

  function restoreMissingFocusIndexCardImages() {
    focusIndexCards.forEach((card, index) => {
      if (!card.querySelector("img")) getOrCreateFocusIndexCardImage(index);
    });
  }

  function promoteFocusIndexCardImage(index) {
    const nextImage = getOrCreateFocusIndexCardImage(index);
    if (!nextImage) return image;
    if (nextImage !== image) {
      const previousCard = image.closest?.(".focus-index-card");
      const previousIndex = Number(previousCard?.dataset.index || 1) - 1;
      image.removeAttribute("data-focus-image");
      image.loading = "lazy";
      image.fetchPriority = "low";
      if (previousCard) prepareFocusIndexImage(image, previousIndex);
      nextImage.setAttribute("data-focus-image", "");
      image = nextImage;
    }
    image.loading = "eager";
    image.fetchPriority = "high";
    prepareFocusIndexImage(image, index);
    return image;
  }

  function dockFocusIndexImage(index, finalRect) {
    const card = getFocusIndexCardByIndex(index);
    const media = card?.querySelector(".focus-index-card__media");
    if (!card || !media || !image) return;
    if (finalRect) setFocusIndexMovingRect(image, finalRect);
    media.querySelectorAll("img").forEach((node) => {
      if (node !== image) {
        node.remove();
      }
    });
    media.appendChild(image);
    image.setAttribute("data-focus-image", "");
    prepareFocusIndexImage(image, index);
    clearFocusIndexMovingStyles(image);
    card.classList.remove("is-index-hidden", "is-index-anchor");
  }

  function restoreFocusIndexImageToMain(finalRect) {
    if (!image) return;
    if (finalRect) setFocusIndexMovingRect(image, finalRect);
    const swipeLayer = imageToggle.querySelector(".focus-swipe-layer");
    imageToggle.insertBefore(image, swipeLayer || null);
    image.setAttribute("data-focus-image", "");
    clearFocusIndexMovingStyles(image);
  }

  function prepareFocusIndexReturnImage(index, sourceRect, runId) {
    const photo = photos[index];
    const source = getFocusPhotoSource(photo);
    if (!image || !photo || !source) return Promise.resolve(false);
    const ratio = getFocusPhotoRatio(index, sourceRect);
    const travelSourceRect = normalizeFocusTravelRect(sourceRect, ratio) || sourceRect;
    const expectedSource = getFocusImageAbsoluteUrl(source);
    const currentSource = getFocusImageAbsoluteUrl(image.currentSrc || image.getAttribute("src"));
    image.loading = "eager";
    image.fetchPriority = "high";
    if (sourceRect) setFocusIndexMovingRect(image, sourceRect);

    const finish = (ready) => {
      if (focusIndexState.runId !== runId || focusIndexState.phase !== "closing") return false;
      const decodedSource = getFocusImageAbsoluteUrl(image.currentSrc || image.getAttribute("src"));
      const matches = ready && decodedSource === expectedSource;
      if (matches) {
        image.style.removeProperty("background-image");
        rememberFocusPhotoRatio(index, image);
      }
      if (travelSourceRect) setFocusIndexMovingRect(image, travelSourceRect);
      return matches;
    };

    if (currentSource === expectedSource) {
      if (travelSourceRect) setFocusIndexMovingRect(image, travelSourceRect);
      return waitForImageDecoded(image, 3200).then(finish);
    }

    return preloadFocusImageDecoded(source).then((ready) => {
      if (!ready || focusIndexState.runId !== runId || focusIndexState.phase !== "closing") return false;
      if (travelSourceRect) setFocusIndexMovingRect(image, travelSourceRect);
      image.style.backgroundImage = photo.thumb ? `url("${photo.thumb}")` : "none";
      image.src = source;
      if (travelSourceRect) setFocusIndexMovingRect(image, travelSourceRect);
      return waitForImageDecoded(image, 1600).then(finish);
    });
  }

  function beginFocusIndexNodeHandoff() {
    window.clearTimeout(focusIndexReturnSettleTimer);
    focusIndexReturnSettleTimer = 0;
    shell.classList.remove("is-index-return-settling");
    focusSwitchSequence += 1;
    window.clearTimeout(focusSwitchTimer);
    shell.classList.remove("is-switching-image", "is-main-swipe-handoff", "is-main-swipe-returning");
    clearFocusSwitchHandoff();
    shell.classList.add("is-index-reparenting");
  }

  function releaseFocusIndexNodeHandoff(runId, settleDuration = 0) {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (focusIndexState.runId !== runId) return;
      shell.classList.remove("is-index-reparenting");
      if (settleDuration <= 0) return;
      focusIndexReturnSettleTimer = window.setTimeout(() => {
        if (focusIndexState.runId === runId) shell.classList.remove("is-index-return-settling");
        focusIndexReturnSettleTimer = 0;
      }, settleDuration);
    }));
  }

  function setFocusIndexActionsAvailable(isAvailable) {
    if (!focusActions) return;
    if (isAvailable) {
      focusActions.removeAttribute("inert");
      focusActions.removeAttribute("aria-hidden");
      return;
    }
    const activeElement = document.activeElement;
    if (activeElement instanceof HTMLElement && focusActions.contains(activeElement)) activeElement.blur();
    focusActions.setAttribute("inert", "");
    focusActions.setAttribute("aria-hidden", "true");
  }

  const focusRailExitProperties = [
    "--focus-rail-exit-left",
    "--focus-rail-exit-top",
    "--focus-rail-exit-width",
    "--focus-rail-exit-height",
    "--focus-rail-exit-padding",
    "--focus-rail-exit-opacity",
    "--focus-rail-exit-filter"
  ];

  function prepareFocusRailIndexExit() {
    shell.classList.remove("is-index-opening-active");
    const rect = getFocusRect(thumbs);
    if (!rect) return;
    const style = getComputedStyle(thumbs);
    shell.style.setProperty("--focus-rail-exit-left", `${rect.left.toFixed(2)}px`);
    shell.style.setProperty("--focus-rail-exit-top", `${rect.top.toFixed(2)}px`);
    shell.style.setProperty("--focus-rail-exit-width", `${rect.width.toFixed(2)}px`);
    shell.style.setProperty("--focus-rail-exit-height", `${rect.height.toFixed(2)}px`);
    shell.style.setProperty(
      "--focus-rail-exit-padding",
      `${style.paddingTop} ${style.paddingRight} ${style.paddingBottom} ${style.paddingLeft}`
    );
    shell.style.setProperty("--focus-rail-exit-opacity", style.opacity || "1");
    shell.style.setProperty("--focus-rail-exit-filter", style.filter || "none");
  }

  function startFocusRailIndexExit() {
    if (focusIndexState.phase !== "opening") return;
    thumbs.offsetHeight;
    shell.classList.add("is-index-opening-active");
  }

  function clearFocusRailIndexExit() {
    shell.classList.remove("is-index-opening-active");
    focusRailExitProperties.forEach((property) => shell.style.removeProperty(property));
  }

  function pauseFocusNotesIndexHandoff() {
    window.clearTimeout(focusNotesIndexHandoffTimer);
    focusNotesIndexHandoffTimer = 0;
  }

  function clearFocusNotesIndexHandoff() {
    pauseFocusNotesIndexHandoff();
    document.body.classList.remove("focus-notes-index-handoff", "focus-notes-index-return-handoff");
    shell.classList.remove("is-index-from-notes", "is-index-to-notes", "is-index-background-releasing");
    document.body.classList.remove("focus-notes-palette-active", "focus-notes-open");
  }

  function beginFocusNotesIndexHandoff() {
    pauseFocusNotesIndexHandoff();
    document.body.classList.remove("focus-notes-index-return-handoff");
    document.body.classList.add("focus-notes-index-handoff", "focus-notes-palette-active", "focus-notes-open");
    shell.classList.add("is-index-from-notes");
    shell.classList.remove("is-index-to-notes", "is-index-background-releasing");
  }

  function beginFocusNotesIndexReturnHandoff(index) {
    pauseFocusNotesIndexHandoff();
    document.body.classList.remove("focus-notes-index-handoff");
    shell.classList.remove("is-index-from-notes", "is-index-background-releasing");
    syncFocusNotesBackground(index);
    shell.offsetHeight;
    document.body.classList.add("focus-notes-index-return-handoff", "focus-notes-palette-active", "focus-notes-open");
    shell.classList.add("is-index-to-notes");
  }

  function releaseFocusNotesIndexHandoff(runId) {
    if (!shell.classList.contains("is-index-from-notes")) return;
    pauseFocusNotesIndexHandoff();
    if (focusIndexState.runId !== runId || focusIndexState.mode !== "index" || focusIndexState.phase !== "idle") return;
    shell.classList.add("is-index-background-releasing");
    focusNotesIndexHandoffTimer = window.setTimeout(() => {
      focusNotesIndexHandoffTimer = 0;
      if (focusIndexState.runId !== runId || focusIndexState.mode !== "index" || focusIndexState.phase !== "idle") return;
      document.body.classList.remove("focus-notes-index-handoff", "focus-notes-palette-active", "focus-notes-open");
      shell.classList.remove("is-index-from-notes", "is-index-background-releasing");
    }, 860);
  }

  function releaseFocusIndexReturnSettleForInteraction() {
    if (focusIndexState.phase !== "idle" || focusIndexState.mode === "index") return false;
    const isSettling = shell.classList.contains("is-index-return-settling")
      || shell.classList.contains("is-index-reparenting");
    if (!isSettling) return false;
    window.clearTimeout(focusIndexReturnSettleTimer);
    focusIndexReturnSettleTimer = 0;
    shell.classList.remove("is-index-return-settling", "is-index-reparenting");
    shell.offsetHeight;
    return true;
  }

  function syncFocusIndexSelection(index) {
    const photo = photos[index];
    if (!photo) return;
    clearFocusQueuedSwipe();
    clearFocusMainSwipe();
    focusSwitchSequence += 1;
    window.clearTimeout(focusSwitchTimer);
    shell.classList.remove("is-switching-image");
    updateFocusChrome(index, true);
    if (photo.width > 0 && photo.height > 0) {
      image.width = photo.width;
      image.height = photo.height;
    }
    image.alt = photo.alt || "";
    caption.textContent = "";
    updateFocusNoteContent(photo);
    title.textContent = photo.title;
    focusIndexState.activeIndex = index;
    scheduleFocusNeighborPreload(index);
    scheduleNotesLayoutUpdate();
  }

  function finishFocusIndexOpen(index, finalRect, runId) {
    if (focusIndexState.runId !== runId || focusIndexState.phase !== "opening") return;
    beginFocusIndexNodeHandoff();
    dockFocusIndexImage(index, finalRect);
    cancelFocusIndexCardAnimations(false);
    focusIndexCards.forEach(clearFocusIndexCardMotionStyles);
    resetFocusIndexHorizontalOffset();
    clearFocusRailIndexExit();
    shell.classList.remove("is-index-opening", "is-index-closing", "is-index-exiting");
    focusIndexState.phase = "idle";
    focusIndexState.mode = "index";
    focusIndexState.activeIndex = index;
    scheduleFocusIndexImageWindow();
    releaseFocusIndexNodeHandoff(runId);
    releaseFocusNotesIndexHandoff(runId);
    const pending = focusIndexState.pendingSelection;
    focusIndexState.pendingSelection = null;
    if (pending !== null) {
      requestAnimationFrame(() => closeFocusIndex(pending, { restoreNotes: focusIndexState.returnMode === "notes" }));
    }
  }

  function finishFocusIndexClose(index, options = {}, runId = focusIndexState.runId, arrivedRect = null) {
    if (focusIndexState.runId !== runId || focusIndexState.phase !== "closing") return;
    const restoreNotes = Boolean(options.restoreNotes);
    beginFocusIndexNodeHandoff();
    clearFocusRailIndexExit();
    clearFocusNotesIndexHandoff();
    shell.classList.add("is-index-return-settling");
    shell.classList.remove("is-index", "is-index-opening", "is-index-closing", "is-index-exiting", "is-index-opening-active");
    setFocusIndexActionsAvailable(true);
    indexGallery?.setAttribute("aria-hidden", "true");
    const restoredNotesLayout = setNotesOpen(restoreNotes);
    unlockFocusIndexPageScroll();
    shell.offsetHeight;
    const finalRect = copyFocusRect(arrivedRect)
      || getFocusIndexReturnRect(index, getFocusRect(image), restoreNotes, {
        layoutReady: Boolean(restoredNotesLayout)
      })
      || getFocusImageContentRectForPhoto(photos[index], index, {
        notes: restoreNotes,
        layoutReady: Boolean(restoredNotesLayout),
        sourceRect: getFocusRect(image)
      })
      || getFocusMainTargetRect({ notes: restoreNotes, layoutReady: Boolean(restoredNotesLayout) });
    restoreFocusIndexImageToMain(finalRect);
    restoreMissingFocusIndexCardImages();
    focusIndexCards.forEach((card) => {
      card.classList.remove("is-index-hidden", "is-index-anchor");
      clearFocusIndexCardMotionStyles(card);
    });
    cancelFocusIndexCardAnimations(false);
    focusIndexState.phase = "idle";
    focusIndexState.mode = restoreNotes ? "notes" : "rel";
    focusIndexState.returnMode = focusIndexState.mode;
    focusIndexState.activeIndex = index;
    focusIndexState.pendingSelection = null;
    focusIndexState.returnImagePreparing = false;
    holdFocusIndexInteraction();
    releaseFocusRailAfterIndexReturn(index);
    requestFocusIndexFullImage(image, index, true);
    releaseFocusIndexNodeHandoff(runId, restoreNotes ? 1460 : 560);
    if (!restoreNotes) scheduleFocusIndexMotionWarmup(index);
  }

  function scheduleFocusIndexResize() {
    window.cancelAnimationFrame(focusIndexState.resizeFrame);
    focusIndexState.resizeFrame = requestAnimationFrame(() => {
      focusIndexState.resizeFrame = requestAnimationFrame(() => {
        focusIndexState.resizeFrame = 0;
        if (focusIndexState.phase === "idle" && focusIndexState.mode === "index") {
          positionFocusIndexGalleryOnActive(focusIndexState.activeIndex);
          scheduleFocusIndexImageWindow();
          return;
        }
        if (focusIndexState.phase !== "opening" && focusIndexState.phase !== "closing") return;
        if (focusIndexState.returnImagePreparing) return;
        const phase = focusIndexState.phase;
        const index = focusIndexState.activeIndex;
        const runId = ++focusIndexState.runId;
        cancelFocusIndexImageAnimation(true);
        cancelFocusIndexCardAnimations(true);
        if (phase === "opening") {
          const targetRect = positionFocusIndexGalleryOnActive(index);
          const sourceRect = getFocusRect(image);
          const motionDuration = getFocusIndexImageMotionDuration(
            index,
            sourceRect,
            targetRect,
            getFocusIndexPrimaryDuration(),
            true
          );
          playFocusIndexCardMotion("open", targetRect, index, true, {
            totalDuration: motionDuration,
            mainFromRect: sourceRect,
            mainToRect: targetRect
          });
          animateFocusIndexImageTo(index, targetRect, {
            motionDuration,
            resumed: true,
            onArrive: (rect) => finishFocusIndexOpen(index, rect, runId)
          });
          return;
        }
        const restoreNotes = focusIndexState.returnMode === "notes";
        const returnNotesLayout = restoreNotes ? updateNotesLayout() : null;
        const sourceRect = getFocusRect(image);
        const targetRect = getFocusIndexReturnRect(index, sourceRect, restoreNotes, {
          layoutReady: Boolean(returnNotesLayout)
        })
          || getFocusImageContentRectForPhoto(photos[index], index, {
            notes: restoreNotes,
            layoutReady: Boolean(returnNotesLayout),
            sourceRect
          });
        const motionDuration = getFocusIndexImageMotionDuration(
          index,
          sourceRect,
          targetRect,
          getFocusIndexPrimaryDuration(),
          true
        );
        const cardAnchor = getFocusIndexCardRect(getFocusIndexCardByIndex(index)) || sourceRect;
        playFocusIndexCardMotion("close", cardAnchor, index, true, {
          totalDuration: motionDuration,
          mainFromRect: sourceRect,
          mainToRect: targetRect
        });
        animateFocusIndexImageTo(index, targetRect, {
          motionDuration,
          resumed: true,
          direction: "close",
          onArrive: (arrivedRect) => finishFocusIndexClose(index, { restoreNotes }, runId, arrivedRect)
        });
      });
    });
  }

  function selectFocusIndexCard(index) {
    if (isFocusIndexInteractionCoolingDown()) return;
    if (focusIndexState.phase === "opening") {
      closeFocusIndex(getBoundedFocusIndex(index), { restoreNotes: focusIndexState.returnMode === "notes" });
      return;
    }
    if (focusIndexState.phase !== "idle" || focusIndexState.mode !== "index") return;
    closeFocusIndex(index, { restoreNotes: focusIndexState.returnMode === "notes" });
  }

  function holdFocusIndexInteraction(duration = 260) {
    focusIndexInteractionLockUntil = Math.max(
      focusIndexInteractionLockUntil,
      performance.now() + Math.max(0, duration)
    );
  }

  function isFocusIndexInteractionCoolingDown() {
    return performance.now() < focusIndexInteractionLockUntil;
  }

  function openFocusIndex(activeIndex) {
    if (!indexEnabled || !indexGallery) return;
    const resumed = focusIndexState.phase === "closing";
    if (focusIndexState.phase === "opening" || (focusIndexState.phase === "idle" && focusIndexState.mode === "index")) return;
    cancelFocusIndexMotionWarmup();
    if (!resumed) {
      cancelFocusImageSwitch({ restoreVisualSelection: true });
      activeIndex = Number(shell.dataset.activeIndex || 0);
    }
    const index = getBoundedFocusIndex(activeIndex);
    window.clearTimeout(focusIndexReturnSettleTimer);
    focusIndexReturnSettleTimer = 0;
    shell.classList.remove("is-index-return-settling");
    const sourceRect = resumed
      ? cancelFocusIndexImageAnimation(true)
      : getFocusImageContentRect() || getFocusRect(image);
    cancelFocusIndexCardAnimations(resumed);
    if (!resumed) {
      focusIndexState.returnMode = shell.classList.contains("is-notes") ? "notes" : "rel";
      const restoreNotes = focusIndexState.returnMode === "notes";
      const returnNotesLayout = restoreNotes ? updateNotesLayout() : null;
      focusIndexState.returnImageRect = copyFocusRect(sourceRect);
      focusIndexState.returnImageIndex = index;
      focusIndexState.returnBoxRect = copyFocusRect(getFocusMainTargetRect({
        notes: restoreNotes,
        layoutReady: Boolean(returnNotesLayout)
      }));
      focusIndexState.returnViewportWidth = window.innerWidth;
      focusIndexState.returnViewportHeight = window.innerHeight;
    }
    const openingFromNotes = !resumed && focusIndexState.returnMode === "notes";
    focusIndexState.runId += 1;
    const runId = focusIndexState.runId;
    focusIndexState.mode = "index";
    focusIndexState.phase = "opening";
    focusIndexState.activeIndex = index;
    focusIndexState.pendingSelection = null;
    focusIndexState.returnImagePreparing = false;
    holdFocusIndexInteraction();
    clearFocusQueuedSwipe();
    clearFocusMainSwipe();
    restoreMissingFocusIndexCardImages();
    focusIndexCards.map((card) => card.querySelector("img:not([src])")).filter(Boolean).forEach((node) => {
      if (Number(node.dataset.focusIndexThumbAttempts || 0) >= 3) {
        node.dataset.focusIndexThumbAttempts = "0";
      }
    });
    if (focusIndexPreparedIndex !== index) warmFocusIndexCardThumbs(index);
    setFocusIndexGalleryActive(index);
    getFocusIndexCardByIndex(index)?.classList.add("is-index-hidden", "is-index-anchor");
    if (!resumed) setFocusIndexMovingRect(image, sourceRect);
    if (!resumed) {
      prepareFocusRailIndexExit();
      if (openingFromNotes) beginFocusNotesIndexHandoff();
      else clearFocusNotesIndexHandoff();
    }
    setNotesOpen(false, {
      preservePalette: openingFromNotes || document.body.classList.contains("focus-notes-index-handoff")
    });
    indexGallery.setAttribute("aria-hidden", "false");
    setFocusIndexActionsAvailable(false);
    lockFocusIndexPageScroll();
    shell.classList.add("is-index", "is-index-opening");
    shell.classList.remove("is-index-closing", "is-index-exiting", "is-index-reparenting");
    if (!resumed) startFocusRailIndexExit();
    if (openingFromNotes) shell.classList.add("is-index-background-releasing");
    const canUsePreparedRect = !resumed
      && focusIndexPreparedIndex === index
      && focusIndexPreparedViewportWidth === window.innerWidth
      && focusIndexPreparedViewportHeight === window.innerHeight
      && focusIndexPreparedRect;
    const preparedTargetRect = canUsePreparedRect ? copyFocusRect(focusIndexPreparedRect) : null;
    const liveTargetRect = positionFocusIndexGalleryOnActive(index);
    if (preparedTargetRect && liveTargetRect && !focusRectsNearlyEqual(preparedTargetRect, liveTargetRect)) {
      invalidateFocusIndexMotionPlan();
    }
    const targetRect = liveTargetRect || preparedTargetRect;
    requestFocusIndexFullImage(image, index, true);
    scheduleFocusIndexImageWindow();
    const cardAnchor = targetRect || getFocusIndexCardRect(getFocusIndexCardByIndex(index));
    const motionDuration = getFocusIndexImageMotionDuration(
      index,
      sourceRect,
      targetRect,
      getFocusIndexPrimaryDuration(),
      resumed
    );
    const cardTimeline = playFocusIndexCardMotion("open", cardAnchor, index, resumed, {
      totalDuration: motionDuration,
      mainFromRect: sourceRect,
      mainToRect: targetRect
    });
    const totalDuration = Math.max(motionDuration, cardTimeline);
    setIndexTransitioning(totalDuration + 180);
    focusSyncHoldUntil = Date.now() + totalDuration + 220;
    animateFocusIndexImageTo(index, targetRect, {
      motionDuration: totalDuration,
      resumed,
      onArrive: (rect) => finishFocusIndexOpen(index, rect, runId)
    });
  }

  function closeFocusIndex(index, options = {}) {
    const targetIndex = Math.max(0, Math.min(index, photos.length - 1));
    if (!indexEnabled || !indexGallery) return;
    if (focusIndexState.phase === "closing") return;
    if (focusIndexState.phase === "idle" && focusIndexState.mode !== "index") return;
    const resumed = focusIndexState.phase === "opening";
    holdFocusIndexInteraction();
    const restoreNotes = options.restoreNotes ?? focusIndexState.returnMode === "notes";
    if (restoreNotes) beginFocusNotesIndexReturnHandoff(targetIndex);
    else clearFocusNotesIndexHandoff();
    let sourceRect = null;
    if (resumed) {
      sourceRect = cancelFocusIndexImageAnimation(true);
      cancelFocusIndexCardAnimations(true);
    } else {
      promoteFocusIndexCardImage(targetIndex);
      sourceRect = getFocusRect(image) || getFocusIndexCardRect(getFocusIndexCardByIndex(targetIndex));
      cancelFocusIndexCardAnimations(false);
      setFocusIndexMovingRect(image, sourceRect);
    }
    focusIndexState.runId += 1;
    const runId = focusIndexState.runId;
    focusIndexState.mode = restoreNotes ? "notes" : "rel";
    focusIndexState.phase = "closing";
    focusIndexState.returnMode = restoreNotes ? "notes" : "rel";
    focusIndexState.activeIndex = targetIndex;
    focusIndexState.pendingSelection = null;
    focusIndexState.returnImagePreparing = true;
    setFocusManualSelection(targetIndex, 1800);
    const sourceCard = getFocusIndexCardByIndex(targetIndex);
    sourceCard?.classList.add("is-index-hidden", "is-index-anchor");
    setFocusIndexGalleryActive(targetIndex);
    clearFocusRailIndexExit();
    shell.classList.add("is-index-closing", "is-index-exiting");
    shell.classList.remove("is-index-opening", "is-index-reparenting", "is-index-opening-active");
    syncFocusIndexSelection(targetIndex);
    prepareFocusIndexReturnImage(targetIndex, sourceRect, runId).then(() => {
      if (focusIndexState.runId !== runId || focusIndexState.phase !== "closing") return;
      focusIndexState.returnImagePreparing = false;
      sourceRect = getFocusRect(image) || sourceRect;
      const returnNotesLayout = restoreNotes ? updateNotesLayout() : null;
      const targetRect = getFocusIndexReturnRect(targetIndex, sourceRect, restoreNotes, {
        layoutReady: Boolean(returnNotesLayout)
      })
        || getFocusMainTargetRect({ notes: restoreNotes, layoutReady: Boolean(returnNotesLayout) })
        || getFocusRect(imageToggle);
      if (!sourceRect || !targetRect) {
        finishFocusIndexClose(targetIndex, { restoreNotes }, runId);
        return;
      }
      const motionDuration = getFocusIndexImageMotionDuration(
        targetIndex,
        sourceRect,
        targetRect,
        getFocusIndexPrimaryDuration(),
        resumed
      );
      const cardAnchor = getFocusIndexCardRect(sourceCard) || sourceRect;
      const cardTimeline = playFocusIndexCardMotion("close", cardAnchor, targetIndex, resumed, {
        totalDuration: motionDuration,
        mainFromRect: sourceRect,
        mainToRect: targetRect
      });
      const totalDuration = Math.max(motionDuration, cardTimeline);
      setIndexTransitioning(totalDuration + 180);
      focusSyncHoldUntil = Date.now() + totalDuration + 220;
      animateFocusIndexImageTo(targetIndex, targetRect, {
        motionDuration: totalDuration,
        resumed,
        direction: "close",
        onArrive: (arrivedRect) => {
          finishFocusIndexClose(targetIndex, { restoreNotes }, runId, arrivedRect);
        }
      });
    });
  }

  function getFocusThumbByIndex(index) {
    return focusThumbButtons[index] || null;
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
    return "x";
  }

  function clampFocusUnit(value) {
    return Math.max(0, Math.min(1, value));
  }

  function projectFocusMotion(initialVelocity, decelerationRate = 0.99) {
    const rate = Math.max(0.9, Math.min(0.999, decelerationRate));
    return (initialVelocity / 1000) * rate / (1 - rate);
  }

  function getFocusRubberBandOffset(offset, dimension, constant = 0.5) {
    const extent = Math.max(1, dimension);
    return (offset * extent * constant) / (extent + constant * Math.abs(offset));
  }

  function getFocusMainSwipeExtent(axis = getFocusMainSwipeAxis()) {
    const rect = getFocusRect(imageToggle) || getFocusRect(focusMain);
    const width = imageToggle.clientWidth || focusMain.clientWidth || rect?.width || window.innerWidth || 1;
    const height = imageToggle.clientHeight || focusMain.clientHeight || rect?.height || window.innerHeight || 1;
    return Math.max(1, axis === "y" ? height : width);
  }

  function getFocusMainSwipeTravelMetrics(fromIndex, targetIndex, axis, edge = false, direction = 1) {
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
    if (axis === "x" && window.innerWidth <= 768 && shell.classList.contains("is-notes")) {
      const visualBox = getFocusRect(imageToggle);
      if (visualBox) {
        const currentVisualRect = getContentRectWithin(visualBox, getFocusPhotoRatio(fromIndex, visualBox)) || visualBox;
        const targetVisualRect = getContentRectWithin(visualBox, getFocusPhotoRatio(targetIndex, visualBox)) || visualBox;
        const visualGap = Math.min(72, Math.max(24, Math.min(currentVisualRect.width, targetVisualRect.width) * 0.14));
        const viewportWidth = window.visualViewport?.width || window.innerWidth;
        const screenTravel = direction > 0
          ? Math.max(currentVisualRect.left + currentVisualRect.width + visualGap, viewportWidth - targetVisualRect.left + visualGap)
          : Math.max(viewportWidth - currentVisualRect.left + visualGap, targetVisualRect.left + targetVisualRect.width + visualGap);
        const renderedScale = Math.max(0.01, visualBox.width / width);
        return {
          extent: containerExtent,
          travel: Math.max(minimumTravel, screenTravel / renderedScale)
        };
      }
    }
    return {
      extent: containerExtent,
      travel: Math.min(containerExtent + gap, Math.max(minimumTravel, visibleTravel))
    };
  }

  function getFocusMainSwipeRailPosition(index) {
    const thumb = focusThumbButtons[index];
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
    focusMainSwipe.velocity = 0;
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
    if (focusMainSwipe.elements?.layer?.isConnected) return focusMainSwipe.elements;
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
    focusMainSwipe.elements = {
      layer,
      current: layer.querySelector(".focus-swipe-image--current"),
      next: layer.querySelector(".focus-swipe-image--next")
    };
    return focusMainSwipe.elements;
  }

  function setFocusMainSwipeFrame(offset, direction = focusMainSwipe.direction) {
    if (!direction) return;
    const swipeLayer = ensureFocusMainSwipeLayer().layer.style;
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
    swipeLayer.setProperty("--focus-swipe-current-x", `${currentX.toFixed(2)}px`);
    swipeLayer.setProperty("--focus-swipe-current-y", `${currentY.toFixed(2)}px`);
    swipeLayer.setProperty("--focus-swipe-next-x", `${nextX.toFixed(2)}px`);
    swipeLayer.setProperty("--focus-swipe-next-y", `${nextY.toFixed(2)}px`);
    swipeLayer.setProperty("--focus-swipe-progress", progress.toFixed(3));
    swipeLayer.setProperty("--focus-swipe-current-opacity", currentOpacity.toFixed(3));
    swipeLayer.setProperty("--focus-swipe-next-opacity", nextOpacity.toFixed(3));
    swipeLayer.setProperty("--focus-swipe-current-scale", currentScale.toFixed(3));
    swipeLayer.setProperty("--focus-swipe-next-scale", nextScale.toFixed(3));
    if (shell.classList.contains("is-notes")) {
      const notesTimelineProgress = focusMainSwipe.chained ? Math.max(progress, 0.76) : progress;
      const notesTextProgress = getFocusMainSwipeProgress(notesTimelineProgress, 0.1, 0.74);
      const notesLineProgress = getFocusMainSwipeProgress(notesTimelineProgress, 0.18, 0.86);
      const notesShift = (direction > 0 ? -1 : 1) * notesTextProgress * 7;
      shell.style.setProperty("--focus-swipe-notes-opacity", (1 - notesTextProgress).toFixed(3));
      shell.style.setProperty("--focus-swipe-line-opacity", (1 - notesLineProgress * 0.86).toFixed(3));
      shell.style.setProperty("--focus-swipe-notes-x", `${(axis === "x" ? notesShift : 0).toFixed(2)}px`);
      shell.style.setProperty("--focus-swipe-notes-y", `${(axis === "y" ? notesShift : 0).toFixed(2)}px`);
    }
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
    cancelStaleFocusImagePreloads([baseIndex, ...getFocusPreloadIndexes(baseIndex, direction, 3)]);
    preloadFocusDirection(baseIndex, direction, 3);
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
      const swipeLayer = focusMainSwipe.elements?.layer?.style;
      [
        "--focus-swipe-current-x",
        "--focus-swipe-current-y",
        "--focus-swipe-next-x",
        "--focus-swipe-next-y",
        "--focus-swipe-progress",
        "--focus-swipe-current-opacity",
        "--focus-swipe-next-opacity",
        "--focus-swipe-current-scale",
        "--focus-swipe-next-scale"
      ].forEach((property) => swipeLayer?.removeProperty(property));
      shell.style.removeProperty("--focus-swipe-notes-opacity");
      shell.style.removeProperty("--focus-swipe-line-opacity");
      shell.style.removeProperty("--focus-swipe-notes-x");
      shell.style.removeProperty("--focus-swipe-notes-y");
      imageToggle.querySelectorAll(".focus-swipe-layer img").forEach((swipeImage) => {
        clearFocusSwipeImage(swipeImage);
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
    cancelFocusImageSwitch({ restoreVisualSelection: true });
    focusMainSwipeClearSequence += 1;
    const fromIndex = Number(shell.dataset.activeIndex || 0);
    const targetIndex = getBoundedFocusSwipeIndex(fromIndex + direction);
    const isEdgeSwipe = targetIndex === null;
    const photo = isEdgeSwipe ? null : photos[targetIndex];
    if (!isEdgeSwipe && !photo) return false;
    const { current, next } = ensureFocusMainSwipeLayer();
    shell.classList.remove("is-main-swipe-handoff", "is-main-swipe-fading", "is-main-swipe-returning", "is-main-swipe-edge");
    cancelStaleFocusImagePreloads([fromIndex, ...getFocusPreloadIndexes(fromIndex, direction, 3)]);
    preloadFocusDirection(fromIndex, direction, 3);
    setFocusSwipeImage(current, photos[fromIndex]);
    if (isEdgeSwipe) {
      clearFocusSwipeImage(next);
    } else {
      setFocusSwipeImage(next, photo);
    }
    focusMainSwipe.active = true;
    focusMainSwipe.axis = getFocusMainSwipeAxis();
    focusMainSwipe.direction = direction;
    focusMainSwipe.fromIndex = fromIndex;
    focusMainSwipe.targetIndex = isEdgeSwipe ? fromIndex : targetIndex;
    focusMainSwipe.edge = isEdgeSwipe;
    focusMainSwipe.chained = false;
    focusMainSwipe.handoffPending = false;
    const travelMetrics = getFocusMainSwipeTravelMetrics(fromIndex, focusMainSwipe.targetIndex, focusMainSwipe.axis, isEdgeSwipe, direction);
    focusMainSwipe.extent = travelMetrics.extent;
    focusMainSwipe.travel = travelMetrics.travel;
    configureFocusMainSwipeRail(focusMainSwipe.targetIndex, isEdgeSwipe);
    shell.classList.add("is-main-swiping");
    shell.classList.toggle("is-main-swipe-edge", isEdgeSwipe);
    return true;
  }

  function advanceFocusMainSwipeDuringDrag(direction, overflow) {
    if (!focusMainSwipe.active || focusMainSwipe.edge) {
      return { offset: focusMainSwipe.offset || 0, advanced: false };
    }
    const completedIndex = focusMainSwipe.targetIndex;
    const travel = focusMainSwipe.travel || focusMainSwipe.extent || getFocusMainSwipeExtent(focusMainSwipe.axis);
    const finalOffset = direction > 0 ? -travel : travel;
    setFocusMainSwipeFrame(finalOffset, direction);
    clearFocusQueuedSwipe();
    focusMainSwipeClearSequence += 1;
    cancelFocusMainSwipeAnimation();
    setFocus(completedIndex, true, { instant: true, source: "swipe" });
    lockFocusRailAfterMainSwipe(completedIndex);
    clearFocusMainSwipe({ keepFrame: true });
    if (!configureFocusMainSwipe(direction)) {
      clearFocusMainSwipe();
      return { offset: 0, advanced: true };
    }
    focusMainSwipe.chained = true;
    const nextTravel = focusMainSwipe.travel || focusMainSwipe.extent || getFocusMainSwipeExtent(focusMainSwipe.axis);
    const nextOffset = focusMainSwipe.edge
      ? Math.max(-nextTravel, Math.min(nextTravel, getFocusRubberBandOffset(overflow, focusMainSwipe.extent)))
      : Math.max(-nextTravel * 0.94, Math.min(nextTravel * 0.94, overflow));
    setFocusMainSwipeFrame(nextOffset, direction);
    return { offset: nextOffset, advanced: true };
  }

  function updateFocusMainSwipeDrag(offset, allowAdvance = false) {
    if (photos.length < 2) return { offset: 0, advanced: false };
    if (!offset) {
      if (focusMainSwipe.active && focusMainSwipe.direction) {
        setFocusMainSwipeFrame(0, focusMainSwipe.direction);
      }
      return { offset: 0, advanced: false };
    }
    const direction = offset < 0 ? 1 : -1;
    if (!focusMainSwipe.active || focusMainSwipe.direction !== direction) {
      if (!configureFocusMainSwipe(direction)) return { offset: 0, advanced: false };
    }
    const travel = focusMainSwipe.travel || focusMainSwipe.extent || getFocusMainSwipeExtent(focusMainSwipe.axis);
    const finalOffset = direction > 0 ? -travel : travel;
    if (allowAdvance && !focusMainSwipe.edge && Math.abs(offset) >= travel) {
      return advanceFocusMainSwipeDuringDrag(direction, offset - finalOffset);
    }
    const dragLimit = travel * 0.94;
    const edgeLimit = travel;
    const nextOffset = focusMainSwipe.edge
      ? Math.max(-edgeLimit, Math.min(edgeLimit, getFocusRubberBandOffset(offset, focusMainSwipe.extent)))
      : Math.max(-dragLimit, Math.min(dragLimit, offset));
    setFocusMainSwipeFrame(nextOffset, direction);
    return { offset: nextOffset, advanced: false };
  }

  function commitFocusMainSwipe(targetIndex) {
    const clearRunId = ++focusMainSwipeClearSequence;
    let didFinishClear = false;
    const finishClear = () => {
      if (clearRunId !== focusMainSwipeClearSequence) return;
      if (didFinishClear) return;
      didFinishClear = true;
      if (startQueuedFocusMainSwipe(targetIndex)) return;
      shell.classList.add("is-main-swipe-handoff");
      requestAnimationFrame(() => {
        if (clearRunId !== focusMainSwipeClearSequence) return;
        clearFocusMainSwipe({ keepHandoff: true, keepFrame: true });
        requestAnimationFrame(() => {
          if (clearRunId !== focusMainSwipeClearSequence) return;
          shell.classList.remove("is-main-swipe-handoff");
          shell.classList.add("is-main-swipe-fading");
          window.setTimeout(() => {
            if (clearRunId !== focusMainSwipeClearSequence) return;
            clearFocusMainSwipe();
          }, 420);
        });
      });
    };
    focusMainSwipe.handoffPending = true;
    setFocus(targetIndex, true, { instant: true, source: "swipe" });
    lockFocusRailAfterMainSwipe(targetIndex);
    if (focusQueuedSwipe && startQueuedFocusMainSwipe(targetIndex)) return;
    waitForImageDecoded(image, 0)
      .then((ready) => ready ? true : waitForImageDecoded(image, 1800))
      .then(finishClear);
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
      focusMainSwipe.velocity = 0;
      if (focusMainSwipe.commit) commitFocusMainSwipe(focusMainSwipe.targetIndex);
      else clearFocusMainSwipe();
      return;
    }
    const travel = Math.max(1, focusMainSwipe.travel || focusMainSwipe.extent || distance || 1);
    const maxVelocity = Math.max(1600, travel * 6);
    const initialVelocity = Math.max(-maxVelocity, Math.min(maxVelocity, (focusMainTouchVelocityX || 0) * 1000));
    const response = commit ? 0.42 : 0.34;
    const omega = 2 * Math.PI / response;
    const displacement = focusMainSwipe.fromOffset - focusMainSwipe.toOffset;
    const velocityCoefficient = initialVelocity + omega * displacement;
    const directionToTarget = Math.sign(focusMainSwipe.toOffset - focusMainSwipe.fromOffset);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setFocusMainSwipeFrame(focusMainSwipe.toOffset);
      focusMainSwipe.animating = false;
      focusMainSwipe.frame = 0;
      focusMainSwipe.velocity = 0;
      if (focusMainSwipe.commit) commitFocusMainSwipe(focusMainSwipe.targetIndex);
      else finishCancelledFocusMainSwipe();
      return;
    }
    shell.classList.add("is-main-swipe-animating");
    const step = (now) => {
      const elapsed = Math.max(0, (now - focusMainSwipe.startedAt) / 1000);
      const decay = Math.exp(-omega * elapsed);
      const springDisplacement = (displacement + velocityCoefficient * elapsed) * decay;
      const nextOffset = focusMainSwipe.toOffset + springDisplacement;
      const currentVelocity = (velocityCoefficient - omega * (displacement + velocityCoefficient * elapsed)) * decay;
      const crossedTarget = directionToTarget !== 0
        && Math.sign(focusMainSwipe.toOffset - nextOffset) !== directionToTarget;
      const settled = Math.abs(focusMainSwipe.toOffset - nextOffset) < 0.35 && Math.abs(currentVelocity) < 8;
      const timedOut = elapsed > response * 2.4;
      focusMainSwipe.velocity = currentVelocity;
      if (crossedTarget || settled || timedOut) {
        setFocusMainSwipeFrame(focusMainSwipe.toOffset);
        focusMainSwipe.frame = 0;
        focusMainSwipe.animating = false;
        focusMainSwipe.velocity = 0;
        shell.classList.remove("is-main-swipe-animating");
        if (focusMainSwipe.commit) commitFocusMainSwipe(focusMainSwipe.targetIndex);
        else finishCancelledFocusMainSwipe();
        return;
      }
      setFocusMainSwipeFrame(nextOffset);
      if (focusMainSwipe.animating) {
        focusMainSwipe.frame = requestAnimationFrame(step);
      }
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
    const releaseVelocity = focusMainTouchVelocityX * 1000;
    const projectedOffset = offset + projectFocusMotion(releaseVelocity, 0.99);
    const directionalDistance = expectedSign * offset;
    const directionalProjection = expectedSign * projectedOffset;
    const directionalVelocity = expectedSign * releaseVelocity;
    const distanceMatches = directionalDistance > travel * 0.16;
    const projectedMatches = directionalProjection > travel * 0.34;
    const velocityMatches = directionalVelocity > 320;
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
    const preservePalette = !isOpen && Boolean(options.preservePalette);
    if (wasOpen === isOpen) {
      if (preservePalette) {
        document.body.classList.add("focus-notes-palette-active", "focus-notes-open");
      }
      return isOpen ? updateNotesLayout() : null;
    }
    let layoutSnapshot = null;
    const refreshIndexMotionPlan = focusIndexState.phase === "idle" && focusIndexState.mode !== "index";
    if (refreshIndexMotionPlan) {
      cancelFocusIndexMotionWarmup();
      invalidateFocusIndexMotionPlan();
    }
    if (isOpen) {
      syncFocusNotesBackground(Number(shell.dataset.activeIndex || 0));
      layoutSnapshot = updateNotesLayout();
    }
    const reduceNotesMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const gestureMotion = Boolean(options.gesture);
    document.body.classList.toggle("focus-notes-palette-active", isOpen || preservePalette);
    window.clearTimeout(focusNotesTransitionTimer);
    if (reduceNotesMotion || gestureMotion) shell.classList.remove("is-notes-transitioning");
    else shell.classList.add("is-notes-transitioning");
    shell.classList.toggle("is-notes", isOpen);
    document.body.classList.toggle("focus-notes-open", isOpen || preservePalette);
    imageToggle.setAttribute("aria-expanded", String(isOpen));
    imageToggle.setAttribute("aria-label", isOpen ? "Close notes" : "Open notes");
    if (navToggle) {
      navToggle.setAttribute("aria-label", isOpen ? "Close notes" : document.body.classList.contains("nav-open") ? "Close navigation" : "Open navigation");
    }
    if (focusIndexState.phase === "idle" && focusIndexState.mode !== "index") {
      focusIndexState.mode = isOpen ? "notes" : "rel";
      focusIndexState.returnMode = focusIndexState.mode;
    }
    if (!reduceNotesMotion && !gestureMotion) {
      const transitionCleanupDelay = isOpen ? 920 : 820;
      focusNotesTransitionTimer = window.setTimeout(() => {
        shell.classList.remove("is-notes-transitioning");
        if (!isOpen && refreshIndexMotionPlan) {
          scheduleFocusIndexMotionWarmup(Number(shell.dataset.activeIndex || 0));
        }
      }, transitionCleanupDelay);
    } else if (!isOpen && refreshIndexMotionPlan && !gestureMotion) {
      scheduleFocusIndexMotionWarmup(Number(shell.dataset.activeIndex || 0));
    }
    return layoutSnapshot;
  }

  function scheduleNotesLayoutUpdate() {
    const shouldMeasure = shell.classList.contains("is-notes") || focusIndexState.returnMode === "notes";
    if (!shouldMeasure) {
      notesLayoutCacheKey = "";
      notesLayoutSnapshot = null;
      return;
    }
    if (!notesLayoutFrame) {
      updateNotesLayout();
      notesLayoutFrame = requestAnimationFrame(() => {
        notesLayoutFrame = 0;
        updateNotesLayout();
      });
    }
    window.clearTimeout(notesLayoutTimer);
    notesLayoutTimer = window.setTimeout(() => {
      notesLayoutTimer = 0;
      updateNotesLayout();
    }, 180);
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
    const locationReserve = noteLocation && !noteLocation.hidden ? 24 : 0;
    const baseCopySize = isMobile ? 1.56 : window.innerWidth < 940 ? 1.48 : 1.58;
    const minCopySize = isMobile ? 1.12 : window.innerWidth < 940 ? 1.08 : 1.14;
    const charWidth = isMobile ? 9.2 : 8.9;
    const charsPerLine = Math.max(isMobile ? 8 : 12, Math.floor(currentCopyWidth / (baseCopySize * charWidth)));
    const copyLines = Math.max(1, Math.ceil(length / charsPerLine));
    const copyAvailableHeight = Math.max(isMobile ? 44 : 140, (notesRect?.height || 180) - currentCopyGap - locationReserve - 12);
    const requiredNotesHeight = copyLines * baseCopySize * 10 * 1.52;
    const copySize = clamp(minCopySize, baseCopySize * Math.min(1, copyAvailableHeight / Math.max(1, requiredNotesHeight)), baseCopySize);
    shell.style.setProperty("--notes-copy-size", `${copySize.toFixed(2)}rem`);
  }

  function updateNotesLayout() {
    if (!noteText) return null;
    const active = Number(shell.dataset.activeIndex || 0);
    const photo = photos[active] || photos[0];
    const note = getPhotoNote(photo);
    const length = [...note].length;
    const locationReserve = noteLocation && !noteLocation.hidden ? 24 : 0;
    const isMobile = window.innerWidth <= 768;
    const mainBox = document.querySelector("[data-focus-main]");
    const railBox = thumbs;
    const mainRectForNotes = measureFocusMainBaseRect() || getFocusRect(mainBox);
    const mainWidth = mainRectForNotes?.width || mainBox?.offsetWidth || window.innerWidth * 0.64;
    const mainHeight = mainRectForNotes?.height || mainBox?.offsetHeight || window.innerHeight * 0.62;
    const cachedRatio = getFocusPhotoRatio(active);
    const imageRatio = cachedRatio || (image.naturalWidth && image.naturalHeight ? image.naturalWidth / image.naturalHeight : mainWidth / Math.max(1, mainHeight));
    const railRect = railBox?.getBoundingClientRect();
    const layoutKey = [
      active,
      window.innerWidth,
      window.innerHeight,
      length,
      locationReserve,
      imageRatio.toFixed(5),
      Math.round(mainRectForNotes?.left || 0),
      Math.round(mainRectForNotes?.top || 0),
      Math.round(mainWidth),
      Math.round(mainHeight),
      Math.round(railRect?.top || 0),
      Math.round(railRect?.right || 0)
    ].join(":");
    if (layoutKey === notesLayoutCacheKey && notesLayoutSnapshot) return notesLayoutSnapshot;
    const clamp = (min, value, max) => Math.max(min, Math.min(value, max));
    const notesImageLineGap = isMobile
      ? clamp(26, window.innerHeight * 0.04, 42)
      : clamp(38, window.innerWidth * 0.038, 76);
    const notesLineCopyGap = isMobile
      ? clamp(13, window.innerHeight * 0.02, 22)
      : clamp(18, window.innerWidth * 0.018, 34);

    if (isMobile) {
      const focusTop = mainRectForNotes ? mainRectForNotes.top : 104;
      const notesRailShift = getCssLengthValue(shell, "--space-4", 16);
      const railTop = railRect
        ? railRect.top - getElementTranslateY(railBox) + notesRailShift
        : window.innerHeight - 200;
      const lineBottom = Math.max(150, window.innerHeight - railTop - 4);
      const compactPanelInset = window.innerHeight <= 520 ? 20 : 14;
      const panelBottom = window.innerHeight <= 620 ? Math.max(132, lineBottom - compactPanelInset) : lineBottom;
      const fixedCopyReserve = clamp(88, window.innerHeight * 0.16, 136);
      const maxLineTop = window.innerHeight - lineBottom - fixedCopyReserve;
      const scaleFromRatio = imageRatio < 0.78 ? -0.04 : imageRatio > 1.18 ? 0.015 : 0;
      const basePhotoScale = clamp(0.58, 0.7 + scaleFromRatio, 0.72);
      const shiftY = -clamp(28, mainHeight * 0.085, 48);
      const maxVisualBottom = maxLineTop - notesImageLineGap;
      const maxScaleFromFixedSpace = 2 * (maxVisualBottom - focusTop - shiftY - mainHeight / 2) / Math.max(1, mainHeight);
      const minimumPhotoScale = window.innerHeight <= 620 ? 0.52 : 0.54;
      const photoScale = clamp(minimumPhotoScale, Math.min(basePhotoScale, maxScaleFromFixedSpace), basePhotoScale);
      const visualBottom = focusTop + shiftY + mainHeight - (mainHeight * (1 - photoScale) / 2);
      const lineTop = visualBottom + notesImageLineGap;
      const copyWidth = Math.max(240, window.innerWidth - 32);
      const copyAvailableHeight = Math.max(44, window.innerHeight - panelBottom - lineTop - notesLineCopyGap - locationReserve);
      const baseCopySize = 1.56;
      const charsPerLine = Math.max(8, Math.floor(copyWidth / (baseCopySize * 9.2)));
      const copyLines = Math.max(1, Math.ceil(length / charsPerLine));
      const requiredNotesHeight = copyLines * baseCopySize * 10 * 1.52;
      const copySize = clamp(1.12, baseCopySize * Math.min(1, copyAvailableHeight / Math.max(1, requiredNotesHeight)), baseCopySize);

      shell.style.setProperty("--notes-photo-scale", photoScale.toFixed(3));
      shell.style.setProperty("--notes-photo-shift-y", `${shiftY.toFixed(1)}px`);
      shell.style.setProperty("--notes-line-top", `${lineTop.toFixed(1)}px`);
      shell.style.setProperty("--notes-line-bottom", `${panelBottom.toFixed(1)}px`);
      shell.style.setProperty("--notes-copy-size", `${copySize.toFixed(2)}rem`);
      shell.style.setProperty("--notes-copy-width", `${copyWidth.toFixed(1)}px`);
      shell.style.setProperty("--notes-copy-gap", `${notesLineCopyGap.toFixed(1)}px`);
      shell.style.setProperty("--notes-panel-width", "auto");
      shell.style.setProperty("--notes-photo-shift-x", "0px");
      notesLayoutCacheKey = layoutKey;
      notesLayoutSnapshot = { key: layoutKey, mainRect: copyFocusRect(mainRectForNotes) };
      return notesLayoutSnapshot;
    }

    const isCompactWide = window.innerWidth < 940;
    const rightInset = clamp(isCompactWide ? 24 : 40, window.innerWidth * 0.035, isCompactWide ? 44 : 80);
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
    const baseCopySize = isCompactWide ? 1.48 : 1.58;
    const charsPerLine = Math.max(12, Math.floor(copyWidth / (baseCopySize * 8.9)));
    const copyLines = Math.max(1, Math.ceil(length / charsPerLine));
    const copyAvailableHeight = Math.max(140, mainHeight - 56 - locationReserve);
    const requiredNotesHeight = copyLines * baseCopySize * 10 * 1.52;
    const copySize = clamp(isCompactWide ? 1.08 : 1.14, baseCopySize * Math.min(1, copyAvailableHeight / Math.max(1, requiredNotesHeight)), baseCopySize);

    shell.style.setProperty("--notes-photo-scale", photoScale.toFixed(3));
    shell.style.setProperty("--notes-photo-shift-x", `${shiftX.toFixed(1)}px`);
    shell.style.setProperty("--notes-photo-shift-y", "0px");
    shell.style.setProperty("--notes-panel-width", `${panelWidth.toFixed(1)}px`);
    shell.style.setProperty("--notes-copy-size", `${copySize.toFixed(2)}rem`);
    shell.style.setProperty("--notes-copy-width", `${copyWidth.toFixed(1)}px`);
    shell.style.setProperty("--notes-copy-gap", `${notesLineCopyGap.toFixed(1)}px`);
    shell.style.removeProperty("--notes-line-top");
    shell.style.removeProperty("--notes-line-bottom");
    notesLayoutCacheKey = layoutKey;
    notesLayoutSnapshot = { key: layoutKey, mainRect: copyFocusRect(mainRectForNotes) };
    return notesLayoutSnapshot;
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
    if (!img) return Promise.resolve(false);
    const decoded = new Promise((resolve) => {
      const decode = () => {
        if (img.complete && img.naturalWidth > 0) {
          if (img.decode) img.decode().then(() => resolve(true)).catch(() => resolve(true));
          else resolve(true);
          return;
        }
        img.addEventListener("load", decode, { once: true });
        img.addEventListener("error", () => resolve(false), { once: true });
      };
      decode();
    });
    if (timeout <= 0) return decoded;
    const safety = new Promise((resolve) => {
      window.setTimeout(() => resolve(false), timeout);
    });
    return Promise.race([decoded, safety]);
  }

  function updateFocusNoteContent(photo) {
    if (noteText) noteText.textContent = getPhotoNote(photo);
    if (!noteLocation) return;
    const location = getPhotoLocation(photo);
    noteLocation.textContent = location;
    noteLocation.hidden = !location;
    shell.classList.toggle("has-note-location", Boolean(location));
  }

  function syncFocusNotesBackground(index) {
    const photo = photos[index];
    const photoSource = getFocusPhotoSource(photo);
    if (!notesBackground || !photoSource || !window.AppleMusicBackground?.from) return;
    const currentSource = getFocusImageAbsoluteUrl(image.currentSrc || image.getAttribute("src"));
    const expectedSource = getFocusImageAbsoluteUrl(photoSource);
    const source = image.complete && image.naturalWidth > 0 && currentSource === expectedSource
      ? image
      : photoSource;
    window.AppleMusicBackground.from(source, document.body).catch(() => {});
  }

  function trimFocusImagePreloadCache() {
    if (focusImagePreloadCache.size <= focusImagePreloadCacheLimit) return;
    for (const [src, entry] of focusImagePreloadCache) {
      if (focusImagePreloadCache.size <= focusImagePreloadCacheLimit) break;
      if (!entry.settled) continue;
      focusImagePreloadCache.delete(src);
    }
  }

  function preloadFocusImage(src, priority = "low", decode = false) {
    if (!src) return Promise.resolve(false);
    let entry = focusImagePreloadCache.get(src);
    if (entry) {
      if (priority === "high") {
        entry.priority = "high";
        entry.image.fetchPriority = "high";
      }
      focusImagePreloadCache.delete(src);
      focusImagePreloadCache.set(src, entry);
    } else {
      const next = new Image();
      next.decoding = "async";
      next.fetchPriority = priority;
      entry = { image: next, request: null, resolve: null, settled: false, priority };
      entry.request = new Promise((resolve) => {
        entry.resolve = resolve;
        next.onload = () => {
          if (entry.settled) return;
          entry.settled = true;
          entry.resolve = null;
          trimFocusImagePreloadCache();
          resolve(true);
        };
        next.onerror = () => {
          if (entry.settled) return;
          entry.settled = true;
          entry.resolve = null;
          trimFocusImagePreloadCache();
          resolve(false);
        };
      });
      focusImagePreloadCache.set(src, entry);
      next.src = src;
    }
    if (!decode) return entry.request;
    return entry.request.then((ready) => ready ? waitForImageDecoded(entry.image, 0) : false);
  }

  function cancelStaleFocusImagePreloads(keepIndexes = []) {
    const keepSources = new Set(keepIndexes
      .map((index) => getFocusPhotoSource(photos[index]))
      .filter(Boolean));
    for (const [src, entry] of focusImagePreloadCache) {
      if (entry.settled || keepSources.has(src)) continue;
      entry.settled = true;
      entry.image.onload = null;
      entry.image.onerror = null;
      entry.image.removeAttribute("src");
      entry.resolve?.(false);
      entry.resolve = null;
      focusImagePreloadCache.delete(src);
    }
  }

  function getFocusPreloadDepth(count) {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (!connection) return count;
    if (connection.saveData || /^(slow-2g|2g)$/.test(connection.effectiveType || "")) return Math.min(1, count);
    if (connection.effectiveType === "3g" || (connection.downlink > 0 && connection.downlink < 1.5)) return Math.min(2, count);
    return count;
  }

  function getFocusPreloadIndexes(index, direction, count = 3) {
    if (!direction) return [];
    const indexes = [];
    const preloadDepth = getFocusPreloadDepth(count);
    for (let step = 1; step <= preloadDepth; step += 1) {
      const photoIndex = index + direction * step;
      if (!photos[photoIndex]) break;
      indexes.push(photoIndex);
    }
    return indexes;
  }

  function preloadFocusDirection(index, direction, count = 3) {
    if (!direction) return;
    const preloadIndexes = getFocusPreloadIndexes(index, direction, count);
    preloadIndexes.forEach((photoIndex, offset) => {
      const photo = photos[photoIndex];
      preloadFocusImage(getFocusPhotoSource(photo), offset === 0 ? "high" : "low");
      hydrateDeferredImage(focusThumbButtons[photoIndex]?.querySelector("img"));
    });
  }

  function clearFocusSwipeImage(target) {
    if (!target) return;
    target.removeAttribute("src");
    target.removeAttribute("data-swipe-source");
    target.style.removeProperty("background-image");
    target.alt = "";
  }

  function setFocusSwipeImage(target, photo) {
    const source = getFocusPhotoSource(photo);
    if (!target || !source) {
      clearFocusSwipeImage(target);
      return;
    }
    target.dataset.swipeSource = source;
    target.fetchPriority = "high";
    target.alt = photo.alt || "";
    target.style.backgroundImage = photo.thumb ? `url("${photo.thumb}")` : "none";
    target.src = source;

    const removePlaceholder = () => {
      if (target.dataset.swipeSource !== source || target.naturalWidth <= 0) return;
      const finish = () => {
        if (target.dataset.swipeSource === source) target.style.removeProperty("background-image");
      };
      if (typeof target.decode === "function") target.decode().then(finish).catch(finish);
      else finish();
    };
    if (target.complete) removePlaceholder();
    else target.addEventListener("load", removePlaceholder, { once: true });
  }

  function preloadFocusNeighbors(index) {
    [index - 1, index + 1].forEach((neighborIndex) => {
      const neighbor = photos[neighborIndex];
      const source = getFocusPhotoSource(neighbor);
      if (source) preloadFocusImage(source, "low");
    });
  }

  function scheduleFocusNeighborPreload(index) {
    const photo = photos[index];
    const photoSource = getFocusPhotoSource(photo);
    if (!photoSource) return;
    const runId = ++focusNeighborPreloadRun;
    const expectedSource = getFocusImageAbsoluteUrl(photoSource);
    waitForImageDecoded(image, 0).then((ready) => {
      if (!ready || runId !== focusNeighborPreloadRun) return;
      if (Number(shell.dataset.activeIndex || 0) !== index) return;
      const currentSource = getFocusImageAbsoluteUrl(image.currentSrc || image.getAttribute("src"));
      if (currentSource !== expectedSource) return;
      const warmup = () => {
        if (runId !== focusNeighborPreloadRun || Number(shell.dataset.activeIndex || 0) !== index) return;
        preloadFocusNeighbors(index);
      };
      if ("requestIdleCallback" in window) window.requestIdleCallback(warmup, { timeout: 1200 });
      else window.setTimeout(warmup, 240);
    });
  }

  function ensureFocusSwitchHoldImage() {
    let holdImage = imageToggle.querySelector(".focus-switch-hold-image");
    if (holdImage) return holdImage;
    holdImage = document.createElement("img");
    holdImage.className = "focus-switch-hold-image";
    holdImage.alt = "";
    holdImage.decoding = "async";
    holdImage.setAttribute("aria-hidden", "true");
    const swipeLayer = imageToggle.querySelector(".focus-swipe-layer");
    imageToggle.insertBefore(holdImage, swipeLayer || null);
    return holdImage;
  }

  function clearFocusSwitchHandoff() {
    window.clearTimeout(focusSwitchHandoffTimer);
    focusSwitchHandoffTimer = 0;
    shell.classList.remove("is-focus-switch-holding", "is-focus-switch-fading");
    const holdImage = imageToggle.querySelector(".focus-switch-hold-image");
    if (!holdImage) return;
    holdImage.removeAttribute("src");
    holdImage.removeAttribute("width");
    holdImage.removeAttribute("height");
  }

  function getFocusPhotoIndexForSource(source) {
    const absoluteSource = getFocusImageAbsoluteUrl(source);
    if (!absoluteSource) return -1;
    return photos.findIndex((photo) => [photo.full, photo.medium].some((candidate) => getFocusImageAbsoluteUrl(candidate) === absoluteSource));
  }

  function getVisibleFocusPhotoIndex() {
    const holdImage = imageToggle.querySelector(".focus-switch-hold-image");
    const holdOpacity = holdImage ? Number.parseFloat(getComputedStyle(holdImage).opacity || "0") : 0;
    const holdDominates = shell.classList.contains("is-focus-switch-holding")
      || (shell.classList.contains("is-focus-switch-fading") && holdOpacity >= 0.5);
    const visibleSource = holdDominates
      ? holdImage?.currentSrc || holdImage?.getAttribute("src")
      : image.currentSrc || image.getAttribute("src");
    return getFocusPhotoIndexForSource(visibleSource);
  }

  function cancelFocusImageSwitch(options = {}) {
    const hadPendingSwitch = shell.classList.contains("is-switching-image")
      || shell.classList.contains("is-focus-switch-holding")
      || shell.classList.contains("is-focus-switch-fading");
    const visibleIndex = hadPendingSwitch ? getVisibleFocusPhotoIndex() : -1;
    focusSwitchSequence += 1;
    window.clearTimeout(focusSwitchTimer);
    focusSwitchTimer = 0;
    shell.classList.remove("is-switching-image");
    clearFocusSwitchHandoff();
    if (options.restoreVisualSelection && visibleIndex >= 0) {
      const committedIndex = getFocusPhotoIndexForSource(image.currentSrc || image.getAttribute("src"));
      if (visibleIndex !== committedIndex) commitFocusPhoto(photos[visibleIndex], visibleIndex);
      if (visibleIndex !== Number(shell.dataset.activeIndex || 0)) updateFocusChrome(visibleIndex, true);
    }
    return visibleIndex;
  }

  function beginFocusSwitchHandoff() {
    window.clearTimeout(focusSwitchHandoffTimer);
    focusSwitchHandoffTimer = 0;
    const holdImage = ensureFocusSwitchHoldImage();
    const source = image.currentSrc || image.getAttribute("src");
    if (source && holdImage.getAttribute("src") !== source) holdImage.src = source;
    if (image.width > 0) holdImage.width = image.width;
    if (image.height > 0) holdImage.height = image.height;
    shell.classList.remove("is-focus-switch-fading");
    shell.classList.add("is-focus-switch-holding");
  }

  function finishFocusSwitchHandoff(runId) {
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (runId !== focusSwitchSequence) return;
      shell.classList.remove("is-focus-switch-holding");
      shell.classList.add("is-focus-switch-fading");
      focusSwitchHandoffTimer = window.setTimeout(() => {
        if (runId === focusSwitchSequence) clearFocusSwitchHandoff();
      }, 320);
    }));
  }

  function preloadFocusImageDecoded(src) {
    return preloadFocusImage(src, "high", true);
  }

  function updateFocusChrome(index, replaceUrl) {
    const previousIndex = Number(shell.dataset.activeIndex || 0);
    shell.dataset.activeIndex = String(index);
    if (focusIndexState.phase === "idle" && focusIndexState.mode !== "index") focusIndexState.activeIndex = index;
    hydrateFocusThumbRange(index);
    if (previousIndex !== index) focusThumbButtons[previousIndex]?.classList.remove("is-active");
    focusThumbButtons[index]?.classList.add("is-active");
    if (replaceUrl) {
      window.history.replaceState({}, "", `focus.html?rel=${index + 1}`);
    }
  }

  function commitFocusPhoto(photo, index) {
    if (photo.width > 0 && photo.height > 0) {
      image.width = photo.width;
      image.height = photo.height;
    }
    const photoSource = getFocusPhotoSource(photo);
    image.dataset.focusSource = photoSource;
    delete image.dataset.focusFallback;
    applyPhotoPlaceholder(imageToggle, photo);
    updateFocusMainPlaceholderGeometry(photo);
    image.addEventListener("error", () => {
      if (image.dataset.focusSource !== photoSource) return;
      const fallbackSource = photo.thumb || "";
      if (!fallbackSource || getFocusImageAbsoluteUrl(fallbackSource) === getFocusImageAbsoluteUrl(photoSource)) return;
      image.dataset.focusFallback = "true";
      image.fetchPriority = "high";
      image.src = fallbackSource;
      watchPhotoPlaceholderImage(image, imageToggle, fallbackSource);
    }, { once: true });
    image.src = photoSource;
    watchPhotoPlaceholderImage(image, imageToggle, photoSource);
    image.alt = photo.alt;
    caption.textContent = "";
    updateFocusNoteContent(photo);
    title.textContent = photo.title;
    if (shell.classList.contains("is-notes")) syncFocusNotesBackground(index);
    scheduleFocusNeighborPreload(index);
    scheduleNotesLayoutUpdate();
    if (!shell.classList.contains("is-notes") && focusIndexState.mode !== "index") {
      scheduleFocusIndexMotionWarmup(index);
    }
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
    const currentImageSource = getFocusImageAbsoluteUrl(image.currentSrc || image.getAttribute("src"));
    const photoSource = getFocusPhotoSource(photo);
    const targetImageSource = getFocusImageAbsoluteUrl(photoSource);
    const imageNeedsCommit = currentImageSource !== targetImageSource;
    const canAnimate = document.body.classList.contains("has-loaded")
      && !options.instant
      && image.getAttribute("src")
      && imageNeedsCommit
      && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isNotesClosing = shell.classList.contains("is-notes-transitioning")
      && !shell.classList.contains("is-notes");
    const hasHeldSwitch = shell.classList.contains("is-focus-switch-holding")
      || shell.classList.contains("is-focus-switch-fading");
    const useHeldSwitch = canAnimate
      && options.source !== "swipe"
      && (isNotesClosing || hasHeldSwitch);
    const switchRunId = ++focusSwitchSequence;
    window.clearTimeout(focusSwitchTimer);

    if (useHeldSwitch) beginFocusSwitchHandoff();
    else clearFocusSwitchHandoff();

    updateFocusChrome(index, replaceUrl);

    if (!canAnimate) {
      shell.classList.remove("is-switching-image");
      commitFocusPhoto(photo, index);
      return;
    }

    if (useHeldSwitch) {
      shell.classList.remove("is-switching-image");
      preloadFocusImageDecoded(photoSource).then((ready) => {
        if (switchRunId !== focusSwitchSequence) return;
        if (!ready) {
          clearFocusSwitchHandoff();
          commitFocusPhoto(photo, index);
          return;
        }
        commitFocusPhoto(photo, index);
        finishFocusSwitchHandoff(switchRunId);
      });
      return;
    }

    shell.classList.add("is-switching-image");
    focusSwitchTimer = window.setTimeout(() => {
      if (switchRunId === focusSwitchSequence) shell.classList.remove("is-switching-image");
    }, 760);
    const startedAt = performance.now();
    const switchOutDelay = options.source === "swipe" ? 160 : 260;
    preloadFocusImageDecoded(photoSource).then(() => {
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
    const thumb = focusThumbButtons[index];
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

  function releaseFocusRailAfterIndexReturn(index) {
    updateFocusRailMetrics();
    updateMobileFocusRail();
    scrollToFocusIndex(index, false);
    clearFocusManualSelection();
    releaseFocusRailUserControl();
    focusRailPendingSelection = null;
    focusRailSelectionLastAt = 0;
    focusSyncHoldUntil = Date.now() + 260;
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
    const thumb = focusThumbButtons[index];
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
    const allThumbs = focusThumbButtons;
    focusRailThumbMetrics = allThumbs.map((thumb) => ({
      left: thumb.offsetLeft,
      top: thumb.offsetTop,
      width: thumb.offsetWidth,
      height: thumb.offsetHeight
    }));
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
    return focusRailThumbMetrics.length === allThumbs.length
      && focusRailThumbMetrics.every((metric) => metric.width > 0 && metric.height > 0);
  }

  function cancelFocusNotesGestureAnimation() {
    if (focusNotesGesture.frame) cancelAnimationFrame(focusNotesGesture.frame);
    focusNotesGesture.frame = 0;
    focusNotesGesture.animating = false;
  }

  function setFocusNotesGestureFrame(progress) {
    const nextProgress = clampFocusUnit(progress);
    const computed = getComputedStyle(shell);
    const openShiftY = Number.parseFloat(computed.getPropertyValue("--notes-photo-shift-y")) || -38;
    const openScale = Number.parseFloat(computed.getPropertyValue("--notes-photo-scale")) || 0.7;
    const panelDistance = getCssLengthValue(shell, "--space-8", 32);
    const railDistance = getCssLengthValue(shell, "--space-4", 16);
    const copyProgress = clampFocusUnit((nextProgress - 0.18) / 0.82);
    focusNotesGesture.progress = nextProgress;
    shell.style.setProperty("--focus-notes-drag-progress", nextProgress.toFixed(4));
    shell.style.setProperty("--focus-notes-drag-y", `${(openShiftY * nextProgress).toFixed(2)}px`);
    shell.style.setProperty("--focus-notes-drag-scale", (1 + (openScale - 1) * nextProgress).toFixed(4));
    shell.style.setProperty("--focus-notes-drag-panel-y", `${(panelDistance * (1 - nextProgress)).toFixed(2)}px`);
    shell.style.setProperty("--focus-notes-drag-panel-scale", (0.96 + 0.04 * nextProgress).toFixed(4));
    shell.style.setProperty("--focus-notes-drag-rail-y", `${(railDistance * nextProgress).toFixed(2)}px`);
    shell.style.setProperty("--focus-notes-drag-rail-opacity", (1 - nextProgress * 0.78).toFixed(4));
    shell.style.setProperty("--focus-notes-drag-rail-blur", `${(nextProgress * 2).toFixed(2)}px`);
    shell.style.setProperty("--focus-notes-drag-rail-saturation", (1 - nextProgress * 0.28).toFixed(4));
    shell.style.setProperty("--focus-notes-drag-copy-opacity", copyProgress.toFixed(4));
    shell.style.setProperty("--focus-notes-drag-copy-y", `${((1 - copyProgress) * 5).toFixed(2)}px`);
  }

  function clearFocusNotesGestureStyles() {
    shell.classList.remove("is-notes-gesture-active");
    document.body.classList.remove("focus-notes-dragging");
    [
      "--focus-notes-drag-progress",
      "--focus-notes-drag-y",
      "--focus-notes-drag-scale",
      "--focus-notes-drag-panel-y",
      "--focus-notes-drag-panel-scale",
      "--focus-notes-drag-rail-y",
      "--focus-notes-drag-rail-opacity",
      "--focus-notes-drag-rail-blur",
      "--focus-notes-drag-rail-saturation",
      "--focus-notes-drag-copy-opacity",
      "--focus-notes-drag-copy-y"
    ].forEach((property) => shell.style.removeProperty(property));
  }

  function beginFocusNotesDrag() {
    const wasRunning = focusNotesGesture.active || focusNotesGesture.animating || shell.classList.contains("is-notes-gesture-active");
    const currentProgress = wasRunning
      ? focusNotesGesture.progress
      : shell.classList.contains("is-notes") ? 1 : 0;
    cancelFocusNotesGestureAnimation();
    window.clearTimeout(focusNotesTransitionTimer);
    shell.classList.remove("is-notes-transitioning");
    syncFocusNotesBackground(Number(shell.dataset.activeIndex || 0));
    updateNotesLayout();
    focusNotesGesture.active = true;
    focusNotesGesture.startedOpen = currentProgress >= 0.5;
    focusNotesGesture.startProgress = currentProgress;
    focusNotesGesture.travel = Math.max(68, Math.min(96, window.innerHeight * 0.1));
    focusNotesGesture.velocity = 0;
    shell.classList.add("is-notes-gesture-active");
    document.body.classList.add("focus-notes-dragging");
    setFocusNotesGestureFrame(currentProgress);
  }

  function updateFocusNotesDrag(deltaY) {
    if (!focusNotesGesture.active) beginFocusNotesDrag();
    const progress = focusNotesGesture.startProgress - deltaY / Math.max(1, focusNotesGesture.travel);
    setFocusNotesGestureFrame(progress);
  }

  function completeFocusNotesGesture(targetProgress) {
    cancelFocusNotesGestureAnimation();
    focusNotesGesture.active = false;
    focusNotesGesture.progress = targetProgress;
    focusNotesGesture.velocity = 0;
    setFocusNotesGestureFrame(targetProgress);
    clearFocusNotesGestureStyles();
    scheduleNotesLayoutUpdate();
    if (targetProgress <= 0 && focusIndexState.phase === "idle" && focusIndexState.mode !== "index") {
      scheduleFocusIndexMotionWarmup(Number(shell.dataset.activeIndex || 0));
    }
  }

  function animateFocusNotesGestureTo(targetProgress, initialVelocity = 0) {
    cancelFocusNotesGestureAnimation();
    const fromProgress = focusNotesGesture.progress;
    const toProgress = clampFocusUnit(targetProgress);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || Math.abs(toProgress - fromProgress) < 0.001) {
      completeFocusNotesGesture(toProgress);
      return;
    }
    focusNotesGesture.active = false;
    focusNotesGesture.animating = true;
    const response = 0.42;
    const omega = 2 * Math.PI / response;
    const displacement = fromProgress - toProgress;
    const boundedVelocity = Math.max(-6, Math.min(6, initialVelocity));
    const velocityCoefficient = boundedVelocity + omega * displacement;
    const directionToTarget = Math.sign(toProgress - fromProgress);
    const startedAt = performance.now();
    const step = (now) => {
      const elapsed = Math.max(0, (now - startedAt) / 1000);
      const decay = Math.exp(-omega * elapsed);
      const springDisplacement = (displacement + velocityCoefficient * elapsed) * decay;
      const nextProgress = toProgress + springDisplacement;
      const currentVelocity = (velocityCoefficient - omega * (displacement + velocityCoefficient * elapsed)) * decay;
      const crossedTarget = directionToTarget !== 0
        && Math.sign(toProgress - nextProgress) !== directionToTarget;
      const settled = Math.abs(toProgress - nextProgress) < 0.002 && Math.abs(currentVelocity) < 0.02;
      focusNotesGesture.velocity = currentVelocity;
      if (crossedTarget || settled || elapsed > response * 2.4) {
        completeFocusNotesGesture(toProgress);
        return;
      }
      setFocusNotesGestureFrame(nextProgress);
      if (focusNotesGesture.animating) focusNotesGesture.frame = requestAnimationFrame(step);
    };
    focusNotesGesture.frame = requestAnimationFrame(step);
  }

  function finishFocusNotesDrag(cancelled = false) {
    if (!focusNotesGesture.active && !focusNotesGesture.animating) return;
    const progressVelocity = -focusMainTouchVelocityY * 1000 / Math.max(1, focusNotesGesture.travel);
    const projectedProgress = focusNotesGesture.progress + projectFocusMotion(progressVelocity, 0.99);
    const targetOpen = cancelled
      ? focusNotesGesture.startedOpen
      : Math.abs(progressVelocity) > 0.72
        ? progressVelocity > 0
        : projectedProgress >= 0.5;
    setNotesOpen(targetOpen, { source: "swipe", gesture: true });
    animateFocusNotesGestureTo(targetOpen ? 1 : 0, cancelled ? 0 : progressVelocity);
  }

  function applyFocusMainTouchFrame() {
    focusMainTouchFrame = 0;
    const pending = focusMainTouchPending;
    focusMainTouchPending = null;
    if (!pending || pending.mode !== focusMainTouchMode) return;
    if (pending.mode === "horizontal") {
      const deltaX = pending.clientX - focusMainTouchStartX;
      const gestureDirection = deltaX < 0 ? 1 : -1;
      focusMainTouchGestureDirection = gestureDirection;
      const canAdvance = focusMainTouchContinuationDirection === gestureDirection;
      const dragResult = updateFocusMainSwipeDrag(focusMainTouchBaseOffset + deltaX, canAdvance);
      if (dragResult.advanced) {
        focusMainTouchStartX = pending.clientX;
        focusMainTouchBaseOffset = dragResult.offset;
        focusMainTouchContinuationDirection = 0;
      }
      return;
    }
    if (pending.mode === "vertical") {
      updateFocusNotesDrag(pending.clientY - focusMainTouchStartY);
    }
  }

  function scheduleFocusMainTouchFrame(clientX, clientY, mode) {
    focusMainTouchPending = { clientX, clientY, mode };
    if (!focusMainTouchFrame) focusMainTouchFrame = requestAnimationFrame(applyFocusMainTouchFrame);
  }

  function flushFocusMainTouchFrame() {
    if (focusMainTouchFrame) cancelAnimationFrame(focusMainTouchFrame);
    focusMainTouchFrame = 0;
    applyFocusMainTouchFrame();
  }

  function cancelFocusMainTouchFrame() {
    if (focusMainTouchFrame) cancelAnimationFrame(focusMainTouchFrame);
    focusMainTouchFrame = 0;
    focusMainTouchPending = null;
  }

  function resetFocusMainTouch() {
    cancelFocusMainTouchFrame();
    focusMainTouchStartX = 0;
    focusMainTouchStartY = 0;
    focusMainTouchLastX = 0;
    focusMainTouchLastY = 0;
    focusMainTouchLastMoveAt = 0;
    focusMainTouchVelocityX = 0;
    focusMainTouchVelocityY = 0;
    focusMainTouchHistory = [];
    focusMainTouchMode = "";
    focusMainTouchMoved = false;
    focusMainTouchBaseOffset = 0;
    focusMainTouchContinuationDirection = 0;
    focusMainTouchGestureDirection = 0;
  }

  function updateFocusMainTouchVelocity(clientX, clientY, eventTime) {
    const now = Number.isFinite(eventTime) ? eventTime : performance.now();
    if (focusMainTouchLastMoveAt && now - focusMainTouchLastMoveAt > 96) focusMainTouchHistory = [];
    focusMainTouchHistory.push({ x: clientX, y: clientY, time: now });
    focusMainTouchHistory = focusMainTouchHistory.filter((sample) => now - sample.time <= 96).slice(-6);
    const first = focusMainTouchHistory[0];
    const last = focusMainTouchHistory[focusMainTouchHistory.length - 1];
    const dt = Math.max(8, (last?.time || now) - (first?.time || now));
    focusMainTouchVelocityX = first && last && first !== last ? (last.x - first.x) / dt : 0;
    focusMainTouchVelocityY = first && last && first !== last ? (last.y - first.y) / dt : 0;
    focusMainTouchLastX = clientX;
    focusMainTouchLastY = clientY;
    focusMainTouchLastMoveAt = now;
  }

  function handleFocusMainTouchStart(event) {
    if (window.innerWidth > 768 || shell.classList.contains("is-index") || !event.touches.length) {
      clearFocusMainSwipe();
      resetFocusMainTouch();
      return;
    }
    cancelFocusMainTouchFrame();
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
    focusMainTouchVelocityY = 0;
    focusMainTouchHistory = [{
      x: touch.clientX,
      y: touch.clientY,
      time: focusMainTouchLastMoveAt
    }];
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
    updateFocusMainTouchVelocity(touch.clientX, touch.clientY, event.timeStamp);

    if (!focusMainTouchMode) {
      if (Math.max(absX, absY) > 8) {
        if (absX > absY * 1.18) focusMainTouchMode = "horizontal";
        else if (absY > absX * 1.18) {
          if (shell.classList.contains("is-notes")) {
            focusMainTouchMode = "vertical";
            beginFocusNotesDrag();
          } else {
            focusMainTouchMode = "vertical-passive";
            focusMainTouchMoved = true;
          }
        }
      }
    }
    if (focusMainTouchMode === "horizontal") {
      focusMainTouchMoved = true;
      event.preventDefault();
      scheduleFocusMainTouchFrame(touch.clientX, touch.clientY, "horizontal");
      return;
    }
    if (focusMainTouchMode === "vertical") {
      focusMainTouchMoved = true;
      event.preventDefault();
      scheduleFocusMainTouchFrame(touch.clientX, touch.clientY, "vertical");
    }
  }

  function handleFocusMainTouchEnd(event) {
    if (window.innerWidth > 768 || shell.classList.contains("is-index")) {
      resetFocusMainTouch();
      return;
    }
    flushFocusMainTouchFrame();
    const touch = event.changedTouches?.[0];
    const endY = touch ? touch.clientY : focusMainTouchLastY;
    const endX = touch ? touch.clientX : focusMainTouchStartX;
    updateFocusMainTouchVelocity(endX, endY, event.timeStamp);
    const deltaX = endX - focusMainTouchStartX;
    const deltaY = endY - focusMainTouchStartY;
    const absY = Math.abs(deltaY);
    const absX = Math.abs(deltaX);
    const wasVertical = focusMainTouchMode === "vertical" && (focusMainTouchMoved || absY > 24);
    const wasPassiveVertical = focusMainTouchMode === "vertical-passive" && (focusMainTouchMoved || absY > 10);
    const wasHorizontal = focusMainTouchMode === "horizontal" && (focusMainTouchMoved || absX > 6);

    if (wasHorizontal) {
      focusMainTouchPreventClickUntil = Date.now() + 520;
      const gestureDirection = focusMainTouchGestureDirection || (deltaX < 0 ? 1 : -1);
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
      finishFocusNotesDrag(false);
    } else if (wasPassiveVertical) {
      focusMainTouchPreventClickUntil = Date.now() + 520;
    } else {
      if (focusMainSwipe.active && !focusMainSwipe.animating) startFocusMainSwipeAnimation(0, false);
    }
    resetFocusMainTouch();
  }

  function handleFocusMainTouchCancel() {
    if (focusMainSwipe.active) startFocusMainSwipeAnimation(0, false);
    if (focusNotesGesture.active || focusNotesGesture.animating) finishFocusNotesDrag(true);
    resetFocusMainTouch();
  }

  function handleFocusTouchStart(event) {
    cancelFocusRailScroll();
    clearFocusManualSelection();
    releaseFocusRailUserControl();
    updateFocusRailMetrics();
    updateMobileFocusRail();
  }

  function handleFocusWheel(event) {
    clearFocusManualSelection();
    releaseFocusRailUserControl();
    updateFocusRailMetrics();
    updateMobileFocusRail();
    if (window.innerWidth > 768 || Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return;
    cancelFocusRailScroll();
    event.preventDefault();
    thumbs.scrollLeft = Math.max(0, Math.min(thumbs.scrollLeft + event.deltaX, mobileRailMaxOffset));
  }

  function scheduleFocusRailSync(duration = 260) {
    focusRailSyncUntil = Math.max(focusRailSyncUntil, performance.now() + duration);
    if (focusRailSyncFrame) return;
    focusRailSyncFrame = requestAnimationFrame(syncFocusFromScroll);
  }

  function syncFocusFromScroll() {
    focusRailSyncFrame = 0;
    if (!document.body.contains(shell)) return;
    const isMobile = window.innerWidth <= 768;
    const isIndex = shell.classList.contains("is-index");
    const isNotes = shell.classList.contains("is-notes");
    const canSyncRail = !isIndex && (!isNotes || isMobile);
    if (canSyncRail) {
      const allThumbs = focusThumbButtons;
      const viewportCenter = isMobile ? window.innerWidth / 2 : window.innerHeight / 2;
      const range = isMobile ? 220 : 280;
      const maxShift = isMobile ? 24 : 64;
      let activeIndex = Number(shell.dataset.activeIndex || 0);
      let nearestDistance = Infinity;
      let needsAnotherFrame = false;
      const manualSelected = focusManualSelectionIndex !== null && Number(shell.dataset.activeIndex || 0) === focusManualSelectionIndex;
      const syncPaused = isFocusMainSwipeBusy() || manualSelected || Date.now() < focusSyncHoldUntil || Date.now() < focusMainSwipeLockUntil || Date.now() < focusInitialLockUntil || (isMobile && !isMobileFocusRailReady(allThumbs));

      allThumbs.forEach((thumb, index) => {
        const metric = focusRailThumbMetrics[index];
        const rect = metric ? null : thumb.getBoundingClientRect();
        const center = metric
          ? isMobile
            ? metric.left - thumbs.scrollLeft + metric.width / 2
            : metric.top - (window.scrollY || document.documentElement.scrollTop || 0) + metric.height / 2
          : isMobile
            ? rect.left + rect.width / 2
            : rect.top + rect.height / 2;
        const distance = Math.abs(center - viewportCenter);
        const strength = distance < range ? 1 - distance / range : 0;
        const targetShift = strength * strength * maxShift;
        const currentShift = focusShiftPositions.get(thumb) || 0;
        const delta = targetShift - currentShift;
        const shift = Math.abs(delta) <= .04 ? targetShift : currentShift + delta * focusFollowRate;
        if (Math.abs(delta) > .04) needsAnotherFrame = true;
        focusShiftPositions.set(thumb, shift);
        if (Math.abs(shift - currentShift) > .005) thumb.style.setProperty("--focus-shift", `${shift.toFixed(2)}px`);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          activeIndex = index;
        }
      });

      const currentIndex = Number(shell.dataset.activeIndex || 0);
      if (syncPaused) {
        focusRailPendingSelection = null;
      } else if (activeIndex !== currentIndex) {
        focusRailPendingSelection = activeIndex;
        const now = performance.now();
        if (now - focusRailSelectionLastAt >= focusRailSelectionInterval || now >= focusRailSyncUntil) {
          const nextIndex = focusRailPendingSelection;
          focusRailPendingSelection = null;
          focusRailSelectionLastAt = now;
          setFocus(nextIndex, true, { source: "rail" });
        }
      } else {
        focusRailPendingSelection = null;
      }
      if (needsAnotherFrame || performance.now() < focusRailSyncUntil) {
        focusRailSyncFrame = requestAnimationFrame(syncFocusFromScroll);
        return;
      }
    }
    focusRailSyncUntil = 0;
  }
}

function returnFocusToOverview(rel, immediate) {
  navigateWithPageTransition(`index.html?from=rel&rel=${rel}`);
}
