# AGENTS.md

本文件定义在此仓库内工作的开发规则。开始修改前，先阅读本文件和根目录的
`MEMORY.md`；项目当前状态、长期设计决策和已知问题以 `MEMORY.md` 为准。

## 项目概况

- 这是 l4rxx 的静态摄影作品网站，使用原生 HTML、CSS 和 JavaScript。
- 生产站点：`https://l4rxxs-photography.pages.dev/`
- Cloudflare Pages 构建输出目录：`dist/`
- 不引入框架或依赖，除非现有实现无法可靠完成需求。
- 修改应保持范围集中，不重构无关代码，不覆盖用户已有改动。

## 主要文件

- `index.html`：主页照片总览。
- `focus.html`：REL 大图、随记和 INDEX。
- `work.html`：尚未定稿、当前不可发布的 WORK 页面。
- `logs.html`：访客可见的更新日志。
- `assets/app.js`：主要交互、动画、状态和图片逻辑。
- `assets/styles.css`：全站样式与响应式布局。
- `assets/apple-music-background.js`：背景视觉效果。
- `content/photos.json`：图库元数据。
- `scripts/build-gallery.ps1`：生成图片规格与图库元数据。
- `scripts/cloudflare-build.mjs`：正式静态构建脚本。
- `tests/site-check.ps1`：项目回归契约。
- `UPDATE_LOG.md`、`RELEASE_LOG.md`、`WORK_LOG.md`：开发和发布记录。

## 本地预览

在仓库根目录运行：

```powershell
py -m http.server 8778 --bind 0.0.0.0
```

- 电脑：`http://127.0.0.1:8778/`
- 手机：使用电脑当前局域网 IP，例如 `http://<LAN-IP>:8778/`
- 手机与电脑必须处于同一局域网；不要把某次获取的局域网 IP 写死到文档或代码。
- 如果端口已占用，先确认旧服务是否仍有效，再改用其他端口。

旧 Photopea WORK 工具只作为迁移备份，通过独立服务查看草稿：

```powershell
npm run work:photopea
```

- Photopea 入口：`http://127.0.0.1:8780/tools/work-photopea/`
- 独立 WORK 预览：`http://127.0.0.1:8780/work.html`
- 站内 WORK 预览：`http://127.0.0.1:8778/work.html`
- PSD 源文件：`workbench/photopea/sources/`
- WORK 图片：`workbench/photopea/exports/`
- 草稿清单：`workbench/photopea/manifest.json`
- “导出到 WORK”只更新旧完整平面图，不再作为正式 Design 页面来源。
- `PHOTO__NN`、`PERSON__NN` 等交互图层由 Codex 在用户提出需求后单独处理；本地 Python
  运行依赖保存在被 Git 忽略的 `workbench/photopea/runtime/`。
- Photopea 桥接、草稿和素材均不进入 Cloudflare Pages 正式构建。
- `work.html` 的正式内容来自 Design PSD；Photopea 草稿不得覆盖正式页面。
- 旧 `tools/work-editor/`、`workbench/work-layout.json` 和 `workbench/assets/` 仅作为迁移备份，
  在用户确认迁移完成前不得删除。

## Design PSD 工作流

- Design 页面唯一排版源是用户提供的 PSD，当前画布规格为 `1920 × 4478`。
- PSD 内名称匹配 `p1`、`p2` 等 `p` 加数字的可见图层是交互作品：需要滚动裁剪揭示、
  桌面整图悬浮放大与阴影，以及页面内无裁剪放大。
- 其他可见图层是不可交互装饰；PSD 中自上而下的图层迭代顺序按网页从底到顶的
  `z-index` 保存，悬浮时禁止改变层级。
- PSD 隐藏图层不得擅自显示；导出清单必须记录画板图层总数、隐藏层和主题背景来源，
  以便区分“隐藏”与“漏导出”。
- 运行导出：

```powershell
$env:PYTHONPATH = "$PWD\workbench\photopea\runtime"
py scripts\build-design-from-psd.py "<PSD 路径>"
```

- 导出结果写入 `images/design/psd/` 与 `content/design.json`；网页坐标按 PSD 画布百分比
  响应式缩放，图片始终 `object-fit: contain`，不得裁剪。
- Design 放大使用 `work.html` 内位于网站 Dock 下方的 lightbox；中央加号复用原动画变为
  关闭叉号，不再创建独立 `design-focus.html`、Design REL、INFO 或 INDEX 页面。

## 图库工作流

1. 原图放入被 Git 忽略的 `images/originals/`。
2. 运行：

```powershell
.\scripts\build-gallery.ps1
```

3. 检查生成结果：
   - `images/web/`：最长边不超过 1920。
   - `images/medium/`：最长边不超过 1280。
   - `images/thumbs/`：最长边不超过 480。
   - `content/photos.json`：尺寸、颜色、地点和随记等元数据。
4. 保留脚本内已有的标题、地点和随记种子数据，不做无关重写。
5. 发布日志只写“新增了几张照片”，不描述具体照片内容。

## 实现规则

- 延续现有原生实现和命名方式，优先复用已有状态机、过渡和辅助函数。
- 使用结构化数据和 DOM API，不用脆弱的字符串替换模拟状态。
- 动画优先修改 `transform` 和 `opacity`，避免每帧触发布局。
- 进入动画必须等待首屏所需图片完成加载与解码；加载态使用照片取样的纯色，
  不使用转圈、闪烁骨架或文字。
- 所有交互同时检查桌面端和移动端；不添加依赖隐藏手势的关键功能。
- 尊重 `prefers-reduced-motion`，不要让装饰动画阻塞导航。
- 图片不得因主题切换产生突兀的色彩或亮度变化。
- 随记字体使用苹方系统字体栈，地点和正文保持粗体。
- 不恢复 REL 返回主页的照片飞行动画；沿用页面遮罩过渡。
- INDEX 动画涉及真实图片节点换位，必须处理动画中断、快速切图和节点归还。
- `work.html` 未经用户明确确认不得上线新内容或媒体。
- Design 后续排版只使用 PSD 工作流；本地 Photopea 桥接代码不得混入正式站点资源。
- `workbench/photopea/` 与旧 `workbench/assets/` 中的草稿默认不提交；确认发布后再生成正式
  WORK 资源。

## 验证要求

代码修改完成后，按改动风险执行以下检查：

```powershell
node --check assets/app.js
.\tests\site-check.ps1
npm run build
git diff --check
```

- 修复 bug 时应先复现或明确触发路径，再验证原路径和相邻路径。
- 动画、布局和响应式修改必须用浏览器检查桌面和移动视口。
- 重点覆盖快速点击、连续切图、页面返回、横竖屏变化、慢速图片加载和深滚动。
- 不把第一稿直接交给用户验证；先完成可执行的本地检查。
- 构建产物 `dist/` 和 Playwright 临时目录不得提交。

## 版本与日志

正式发布时需要同步：

- `package.json` 的语义化版本。
- 所有 HTML 页面引用的缓存查询键。
- `assets/app.js` 中访客可见的双语发布日志。
- `UPDATE_LOG.md`
- `RELEASE_LOG.md`
- `WORK_LOG.md`
- `tests/site-check.ps1` 中对应的版本或缓存契约。

任何已发布的 JavaScript 或 CSS 变化都必须更新缓存键。发布前确认各页面使用同一键。

## 发布与安全

- 只有用户明确要求上线时才发布。
- 上线前运行：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File `
  "$HOME\.codex\skills\security-release-check\scripts\security_release_check.ps1" `
  -Path "."
```

- 安全脚本可能把二进制图片和公开联系邮箱误报为敏感信息，必须人工复核。
- `2664395883@qq.com` 是网站明确公开的联系邮箱，不是凭据。
- 不提交 `.env`、访问令牌、私钥、原图或个人本地路径。
- 当前部署流程是推送到 GitHub，由 Cloudflare Pages 自动构建；不要依赖不稳定的
  `npx wrangler` 手动部署。
- 推送前检查 `git status`、待提交 diff、构建结果和敏感信息。
- 不使用 `git reset --hard`、`git clean` 或强制推送，除非用户明确要求并确认风险。
