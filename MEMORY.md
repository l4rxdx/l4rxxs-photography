# MEMORY.md

本文件保存此项目需要跨任务延续的背景、设计决策和已知风险。命令与强制流程见
`AGENTS.md`。

## 当前状态

- 项目：l4rxx photography portfolio。
- 技术：静态 HTML、CSS、原生 JavaScript，无前端框架。
- 托管：GitHub 推送后由 Cloudflare Pages 自动部署。
- 生产地址：`https://l4rxxs-photography.pages.dev/`
- 当前正式版本：`v1.5.6`。
- 当前缓存键：`v156-loading-motion1`。
- 正式站图库当前有 56 张照片。
- `work.html` 的方向仍在构思中。DESIGN 菜单入口已经恢复，正式页面只显示
  “xdx还没设计完”；Photopea 草稿、PSD、章节导出图和 `images/work/` 旧素材不应复制到
  生产构建。
- WORK 已决定改用 Photopea 作为唯一正式排版工具。`scripts/work-photopea-server.mjs`
  负责把 Photopea 的 PSD 和 WebP 输出保存在本机，并提供仅本地可见的 `/work.html`
  响应式预览；这些内容不进入 Cloudflare Pages 构建。
- 旧 `tools/work-editor/`、`workbench/work-layout.json` 和 `workbench/assets/` 保存了用户
  已做过的排版与素材，当前只作为迁移备份，未经确认不得删除。

## 产品与视觉方向

- 网站是安静、克制、以照片为中心的个人作品站，不做成操作密集的 App。
- 首页保持五列无限照片总览，随机排布时避免同一照片在视觉上相距过近。
- 首页首次散开动画必须等完整首屏照片全部加载并解码后再开始；动画过程中使用已绘制
  的位图，不能从空白或纯色突然切成照片。
- 图片加载占位使用从对应照片提取的单一纯色，不使用 spinner、shimmer 或加载文案。
- 默认首次访问显示英语。用户主动切换语言后，选择通过
  `localStorage["l4rxx-language"]` 持久化，之后不自动重置为英语。
- 主题初始跟随系统。用户在网站内切换后即取得控制权，并在页面和标签页之间持久化。
- 黑白主题对照片的影响应柔和，避免突兀滤镜。
- 随记使用苹方系统字体栈；地点和正文均为粗体。
- 移动端底部缩略图需要原生水平滑动惯性，并保持大图为视觉中心。
- 从主页进入 REL 时，缩略图轨道必须在首帧展示前同步定位到 URL 中的 `rel`；后续图片
  加载只做同位置校正，不能先显示轨道开头再滚动寻找目标。
- 关键功能不得只依赖上滑、拖拽等隐藏手势。

## 动画与交互决策

- 首页、REL、随记和 INDEX 之间强调空间连续性，但优先保证清晰、稳定和可中断。
- REL 返回主页不再让照片飞回网格；使用页面遮罩完成返回，避免无限网格副本导致
  屏外落点和错位。
- 菜单使用 opening、open、closing 三阶段状态；移动端不使用全屏实时模糊。
- 随记和 INDEX 的背景过渡从切换开始时立即发生。
- INDEX 使用真实 focus 图片节点在主图与卡片之间换位，不使用视觉相同的临时副本。
- INDEX 快速交互有约 260ms 冷却期，状态变量为
  `focusIndexInteractionLockUntil`。
- 跨照片切换时，移动图片的矩形必须按目标照片宽高比归一化，避免途中拉伸或尺寸突变。
- 从 INDEX 返回随记时，最终图片位置必须按“当前选中的照片”重新测量，不能复用进入
  INDEX 前一张照片的几何数据。
- 退出 INDEX 后底部缩略图轨道必须恢复交互，不能遗留 `pointer-events`、拖动锁或
  模糊层。

## 性能架构

- 首页无限网格会回收批次和 DOM 节点，只保留有限的碰撞集合。
- 回收批次数上限为 `OVERVIEW_MAX_RECYCLED_BATCHES = 3`。
- 首页文字和头像的物理循环在稳定后休眠，有交互或布局变化时再唤醒。
- 头像是椭圆外形，碰撞范围以头部最外圈为准；自然下垂后无需强制回正。
- 首页头像、文字和照片之间都需要碰撞，但要控制参与计算的可见节点数量。
- 桌面端头像悬浮追踪照片后锁定最后位置，鼠标移开或继续滚动时不自动回到中心；只有
  悬浮下一张照片才重新追踪。移动端仍按滚动位置选择照片。
- INDEX 使用 IntersectionObserver 和卡片几何缓存；视口尺寸变化后必须使缓存失效。
- 图片节点的 `will-change` 只在动画期间使用，结束后移除，避免长期占用合成层。
- 移动端优先原生滚动和惯性，不在每帧重复读取布局后立即写入样式。

## 重要实现约束

- 首页从菜单返回时，`renderOverview()` 准备完成后必须调用
  `finishIncomingPageTransition()`；遗漏会让不透明遮罩停留并表现为白屏。
- INDEX 动画会重设父节点。打开、关闭或切图被打断时，必须把缺失的图片节点补回对应
  卡片，否则某些 INDEX 缩略图会永久消失。
- 快速切换 INDEX 图片时，先完成或取消当前过渡，再接受新目标；不能让两个几何动画
  同时写同一图片节点。
- 页面返回、深滚动或无限批次回收后，不得依靠“离视口中心最近的同 rel 节点”作为
  唯一定位依据。
- REL 与 INDEX 切换前后要在同一坐标系测量；不能混用布局矩形和带 transform 的
  可视矩形，否则最后就位时会跳一下。
- 主题由系统变化触发时不能破坏网站内手动切换能力；系统监听和用户偏好必须分开。
- `sessionStorage` 用于单次页面过渡状态，`localStorage` 用于语言和主题等长期选择。

## 图片与内容

- 原图只保存在被忽略的 `images/originals/`，不提交到 Git。
- 发布图片分为 `images/web/`、`images/medium/` 和 `images/thumbs/`。
- 图库元数据源是 `content/photos.json`。
- `scripts/build-gallery.ps1` 内保存了已有标题、地点、随记和代表色相关处理，运行或修改
  时不能意外清空。
- 修改地点或随记文案时，必须同时更新 `noteCn` 与 `noteEn`，并同步修改
  `scripts/build-gallery.ps1` 中对应的生成种子；不能只改当前 JSON 中的一种语言。
- 新增照片的对外日志只记录数量，不描述画面内容。
- 公开联系邮箱是 `2664395883@qq.com`，主页支持点击复制。

## DESIGN / PSD

- `work.html` 的正式 Design 排版以用户 PSD 为唯一视觉源，当前画布是 `1920 × 4478`。
- 可见图层按 PSD 的实际底到顶顺序映射到固定 `z-index`；当前顺序是
  `p1 → triangle → p2 → p3 → p4 → a1`，悬浮时不能提高层级。
- 只有名称为 `p` 加数字的图层可交互：滚动时播放一次 Clip-path Scroll Reveal；揭示完成后
  必须解除 clip-path，桌面悬浮以 `scale(1.04)` 整图放大并增加阴影，不能困在原矩形内，
  也不能改变 PSD 层级。
- 三角形与 `a1` 是装饰图层，不响应点击；黑夜主题使用纯黑页面背景。
- 当前 PSD 画板共有 7 层，其中 6 层可见并已导出，`wwwwww` 是隐藏且无可见像素的文字层；
  画板外的 `颜色填充 1` 映射为网页主题背景。清单保留这些来源信息，不能把隐藏层误判为漏层。
- 点击作品在同页 lightbox 无裁剪放大；lightbox 位于共享 Dock 下方，语言、主题和中央按钮
  始终可见，中央加号沿原曲线变为关闭叉号。
- Design 不再使用独立 REL、INFO 或 INDEX；`design-focus.html` 和旧 Design 图库资源已淘汰。
- PSD 导出脚本是 `scripts/build-design-from-psd.py`，产物位于 `images/design/psd/` 和
  `content/design.json`。

## 旧 WORK / Photopea

- 本地启动命令是 `npm run work:photopea`。
- Photopea 入口是 `http://127.0.0.1:8780/tools/work-photopea/`；本地 WORK 预览是
  `http://127.0.0.1:8780/work.html`。
- Photopea 草稿和桥接保留为迁移备份，不再覆盖 `work.html` 的正式 Design PSD 页面。
- 站内预览每两秒检查一次清单更新，Photopea 重新导出后无需手动搬运文件。
- Photopea 顶部“导出到 WORK”只发布完整平面图，不解析 PSD 图层；照片点击、悬浮和人物拖动
  等交互分层由 Codex 单独处理，不能在导出接口中自动重构。
- 每个章节分别导出电脑和手机两个版本；章节号决定在 WORK 中的排列顺序。
- Photopea 原生“保存 PSD / Ctrl+S”与顶部“导出到 WORK”完全独立：
  - 原生保存由 Photopea 下载 PSD 到用户电脑，不得再用 `customIO` 接管。
  - 编辑器会检测名称符合 `work-XX-{desktop|mobile}` 的已修改文档，空闲时自动备份到
    `workbench/photopea/sources/`；切到后台或退出时会立即补一次检查。
  - 自动备份不得改变 Photopea 当前活动文档；手动导出优先于待处理的后台备份，避免导错章节。
  - “导出到 WORK”只负责更新 WORK 平面预览，不得上传 PSD、解析交互图层或由原生保存触发。
- WORK 完整预览保存为
  `workbench/photopea/exports/work-XX-{desktop|mobile}.webp`。
- `workbench/photopea/manifest.json` 是本地预览的数据源；手机稿缺失时回退到电脑稿。
- Photopea 桥接、旧 PSD、导出图和清单都不进入正式构建。
- 旧本地编辑器和旧草稿保留为迁移备份，不再作为后续编辑入口。

## 发布记忆

- 正式构建入口是 `npm run build`，实际执行 `scripts/cloudflare-build.mjs`。
- `scripts/build-cloudflare.mjs` 是旧的替代脚本，不是当前 package build。
- `scripts/cloudflare-build.mjs` 不复制 `images/work/`，这是当前有意行为。
- Cloudflare Pages 的规范路由可能返回 308，例如 `/focus.html` 跳转到 `/focus`；
  线上检查必须跟随重定向。
- 发布后应确认生产 HTML 使用新缓存键，不能只凭 Git 推送成功判断部署完成。
- 任何正式发布都要同步版本号、缓存键、站内双语日志和三份开发日志。

## 环境与常见问题

- 当前 Windows 环境中 `python.exe` 可能指向不可用的 WindowsApps 占位程序，本地服务
  使用 `py -m http.server` 更可靠。
- PowerShell 读取含中文的文件时显式使用 `-Encoding UTF8`，避免误判乱码。
- `gh` 当前未安装；GitHub 推送使用 Git Credential Manager 和 `git push`。
- `npx wrangler` 曾出现长时间挂起，不作为默认发布方式。
- 安全检查脚本可能把图片二进制和公开邮箱识别为敏感内容，需要人工判断。
- `dist/`、`.playwright-cli/` 和其他测试缓存不提交。
- 工作区可能包含用户尚未提交的修改；任何任务都必须保留无关改动。
