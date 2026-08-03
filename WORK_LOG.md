# Work Log / 工作日志

本文件记录实际工作过程、排查细节、设计取舍、临时方案和未上线内容。它不是正式发布说明；正式版本请看 `RELEASE_LOG.md`。

## 2026-08-03 - v1.6.1 抖音固定主页入口修补上线

- 定位到菜单原地址 `https://www.douyin.com/user/self` 会按访问者身份解析，因此可能打开访问者自己的账号，不能稳定到达 l4rxx 的主页。
- 使用用户提供的抖音分享链接解析并验证固定公开主页地址，将首页、REL、日志和 DESIGN 四个正式页面统一替换为该地址。
- 保留外链的 `target="_blank"` 与 `rel="noopener noreferrer"`，继续绕过站内页面转场，不改变菜单动画和页面状态。
- 增加回归契约，要求正式页面必须包含固定公开主页且禁止恢复 `/user/self`。
- 正式版本更新为 `v1.6.1`，共享 CSS、JS 与 Design 资源缓存标识统一为 `v161-douyin-profile1`；摄影图库、Design 图层和媒体资源保持不变。

## 2026-08-03 - v1.6.0 DESIGN 正式页面与 REL 自适应尺寸上线

- 将用户的 Design PSD 固定为正式排版唯一来源，按 1920 × 4478 画布比例导出 6 个可见图层；保留 PSD 自下而上的网页层级，隐藏图层不擅自显示。
- `p1` 至 `p4` 作为交互作品，进入视口时使用 Clip-path Scroll Reveal；桌面悬浮对整张作品进行轻微放大并加入阴影，点击后在当前 `work.html` 内无裁剪放大。
- Design Lightbox 保留网站顶部 Dock，中央加号沿用既有动画变为关闭叉号；退出时等待淡出完成再释放滚动锁，避免顶栏闪帧。
- 桌面端 REL 从离散横图/竖图档位改为连续面积约束算法，使用照片真实宽高比在视口宽高边界内求解尺寸；方图、常规横图、竖图与全景图保持完整显示和适中留白。
- REL、随记与 INDEX 动画继续读取同一个最终主图几何，浏览器尺寸变化时失效缓存并重新测量，避免自适应尺寸与转场落点不一致。
- Focus Dock 在返回和索引之间加入随记按钮，中英文文案和按下状态同步现有页面状态。
- 桌面滚动锁改为保留可见滚动条并冻结滚动位置，修复打开菜单和 Design 预览时页面宽度跳动；触摸设备继续使用既有锁定方式。
- 新增 2 张照片并生成 Web、Medium 与 Thumbnail 三档资源，图库总数由 56 增至 58；公开日志只记录数量。
- 正式版本更新为 `v1.6.0`，共享 CSS、JS 与 Design 资源缓存标识统一为 `v160-design-gallery1`；生产构建排除 PSD、摄影原图、本地 Photopea 草稿和编辑器运行目录。

## 2026-08-01 - v1.5.7 移动端原生滚动与 INDEX 交接修复上线

- 触摸设备停用 Lenis 文档与嵌套滚动实例，改用浏览器原生滚动；页面增加 1px 可滚动余量，使 iPhone Safari 地址栏可以随向上滚动自然收起，桌面端线性滚动保持不变。
- 随记主图只在手指向下移动时进入既有拖动逻辑，向上滑动继续交给浏览器原生滚动。
- 从 INDEX 选择照片时先请求并解码对应清晰图，保留当前可见图作为背景，清晰图完成绘制后再开始放大至 REL 或随记。
- 定位到跨照片退出 INDEX 后，重建的目标卡片仍处于纯色加载态；主图落位时 `is-photo-ready` 的 240ms 占位层淡出会产生一帧闪烁。交接期间现在保留已解码主图，并在真实节点换位的两帧内直接隐藏占位层。
- 在禁用缓存、450ms 延迟和约 32KB/s 下载速度下完成跨照片退出、再次进入 INDEX 的逐帧验证：目标卡片进入前保持加载态，落位帧真实图片持续可见，占位层透明度为 0 且无过渡。
- 正式版本更新为 `v1.5.7`，缓存标识统一为 `v157-index-handoff1`；图库保持 56 张，DESIGN 与本地 Photopea 发布边界不变。

## 2026-08-01 - v1.5.6 线上加载、INDEX 与移动端动效稳定版上线

- 为图片节点、宿主占位和加载任务增加照片身份与请求归属校验，过期请求不能再覆盖当前照片；主页、REL 与 INDEX 共用恢复扫描，并在联网恢复、页面重新可见、滚动和关键交互后继续加载。
- REL 主图改为先请求同照片缩略预览，再在独立通道升级清晰图；清晰图失败时保留可用画面并按阶段重试，避免加载态覆盖清晰图或切图失效。
- 主页无限滚动新增批次会立即注册到延迟图片观察器，避免深滚动后只有纯色占位；移动端主页互动改为以滚动稳定后的照片为目标。
- INDEX 在不改变现有动画曲线、空间关系和清晰度的前提下，预热运动范围内的缩略图，并避免在逐帧动画循环中启动新请求；进入轨道改为独立 WAAPI 交接。
- 移动端 REL 轨道使用更柔和的休眠曲线；首次休眠必须等待中央主图可显示和页面进场结束，并设置最早休眠期限，初始化滚动不能缩短 `1500ms` 清晰停留。
- 新增 4 张照片并生成 Web、Medium 与 Thumbnail 三档资源，图库总数由 52 增至 56；公开日志只记录数量。
- 夜间主题月亮图标改为独立描边 SVG；Photopea 本地工具源码保留在仓库，但 PSD、草稿、章节导出和恢复清单继续排除在正式构建之外。
- 正式版本更新为 `v1.5.6`，缓存标识统一为 `v156-loading-motion1`。

## 2026-07-29 - v1.5.5 rel 50 专属随记配色缓存修复上线

- 定位到 `focus.html` 长期沿用旧取色脚本缓存键，导致部分桌面浏览器仍按照片采样出蓝色背景，而新设备能显示元数据指定的粉色。
- 将专属随记颜色改为由主程序直接写入背景与前景变量，并先终止未完成的旧取色任务，不再依赖浏览器是否命中新版取色脚本缓存。
- 修复严格受 `notesBackgroundColor` 元数据约束；回归契约继续锁定只有 `rel=50` 拥有该字段，其余 51 张照片仍走原有图片采样流程。
- 正式版本更新为 `v1.5.5`，缓存标识统一为 `v155-notes-palette1`；图库保持 52 张，DESIGN 与本地 Photopea 发布边界不变。

## 2026-07-29 - v1.5.4 图片加载恢复、REL 居中与随记取色修复上线

- 将图片加载改为有界优先级队列，按触摸设备与网络状况控制并发；减少慢网下的非必要预加载，并在联网恢复、标签页重新可见或图片重新进入关键路径时重试。
- 为所有图库请求继承当前应用缓存版本，避免 HTML、图库清单与图片规格在 Cloudflare 缓存中出现版本错配。
- 加固 REL 主图、底部缩略图和 INDEX 图片节点的恢复流程，加载失败或交互被打断后仍可继续切图，不遗留空白卡片。
- 微调桌面端 REL 横图、长图与竖图尺寸，使用真实视口中心作为稳定锚点；随记布局和 INDEX 动画使用同一目标几何，减少进入、返回及跨照片切换末段的二次位移。
- 将 `rel=50` 的随记背景固定为专属粉色 `#BB9FAE`，其他照片恢复各自的图片取色，避免一个照片的颜色污染整组随记背景。
- 正式版本更新为 `v1.5.4`，缓存标识统一为 `v154-photo-flow1`；图库保持 52 张，DESIGN 仍只发布未完成提示，本地 Photopea 服务、PSD、章节导出和草稿数据不进入生产构建。

## 2026-07-29 - v1.5.3 REL 慢网、INDEX 交接与响应式显示上线

- 新增 3 张照片并生成 Web、Medium 与 Thumbnail 三档资源，图库总数由 49 增至 52；公开日志仅记录数量，不描述照片内容。
- 为照片增加可选的随记背景取色，其中新增照片使用独立粉色背景；背景从随记与 INDEX 过渡开始时同步变化。
- 修复上线环境与慢速网络下点击未完成加载的缩略图或 INDEX 卡片后，REL 停止切图、INDEX 留下空白节点和后续交互失效；图片节点会在参与交互前完成补位、加载或确定性降级。
- INDEX 进入、退出和跨照片切换期间锁定滚动、滑动与其他选图输入，动画完成或中断后统一恢复；校准 INDEX 返回 REL 与随记的主图、缩略图、阴影与背景终点，减少末段位移。
- 桌面端 REL 根据横幅、常规横图和竖图比例扩大主图框，保持 `object-fit: contain`；INDEX 动画使用同一目标框测量，避免回落到旧尺寸。
- 移动端 REL 缩略图轨道在 `1600ms` 闲置后降低透明度并轻微下沉，触摸、滚动、切图及 INDEX 返回会立即唤醒；随记轨道维持原有独立弱化状态。
- 长沙随记精简为“终于找到个人少的地方”，英文同步为 “I finally found a spot with fewer people.”；同时更新 `content/photos.json` 和 `scripts/build-gallery.ps1`，并将双语同步规则写入项目记忆。
- 正式版本更新为 `v1.5.3`，缓存标识统一为 `v153-rel-stability1`；DESIGN 仍只发布未完成提示，本地 Photopea 草稿、PSD、章节导出和运行环境不进入生产构建。

## 2026-07-28 - v1.5.2 全站流畅度、REL 轨道与 DESIGN 占位上线

- 全站接入本地 Lenis 运行时，统一主页、DESIGN、REL/随记、INDEX 与日志页的线性滚动；INDEX 继续使用独立滚动实例，并与锁定、恢复和程序化定位协同。
- 重做主页头像与文字、照片的互动：头像支持更多移动角度，按独立字母做精确避让，必要时会柔性挤开行进路径上的文字；桌面端悬浮结束后不再自动回到中心，整体响应速度下调。
- 优化顶部语言、菜单和白夜主题控件的尺寸、空心太阳/月亮几何及浅色主题泛白；菜单开合过渡更连续。
- 修复从主页点击照片进入 REL 时，缩略图轨道在首帧从开头跳到所选照片；轨道现在在节点挂载后同步建立几何并直接定位。
- 延续并加固 INDEX 快速切换的节点归还、比例锁定和跨照片返回测量，避免中断后丢图、尺寸乱变或最终落位偏差。
- DESIGN 恢复全站菜单入口，正式页面只显示“xdx还没设计完”；localhost 和私有局域网仍可由 Photopea 预览脚本替换成草稿章节，正式构建不包含 PSD、草稿或章节导出图。
- 正式版本更新为 `v1.5.2`，缓存标识统一为 `v152-flow-design1`；图库内容与 49 张照片顺序不变。

## 2026-07-25 - v1.5.1 INDEX 稳定性与 WORK 撤下修复上线

- 定位菜单返回主页白屏为主页接收跨页面入场状态后，照片加载流程没有调用遮罩退场；主页照片就绪后现在会显式完成页面过渡。
- 暂时从全站菜单移除 WORK，页面主体清空；保留本地素材供后续构思，但 Cloudflare 构建不再复制 `images/work`。
- 复现 INDEX 快速跨照片连切时，选中卡片的真实图片节点被搬到主图层后未及时补回；退出完成及再次打开前会补齐空卡片。
- 不同长宽比照片快速切换时，移动图曾在竖幅 `0.8` 与横幅约 `2.35` 之间非等比变化；目标图片换入前锁定自身比例，飞行阶段只做等比缩放与位移。
- INDEX 增加 `260ms` 响应间隔，限制立即重开和刚展开时立即切图；手机、桌面快速切换均保持 49 张卡片，无空节点、隐藏残留或控制台错误。
- 正式版本更新为 `v1.5.1`，缓存标识统一为 `v151-index-stability1`；图库内容与照片数量不变。

## 2026-07-25 - v1.5.0 动效、加载与 WORK 基础版上线

- 主页首屏改为等待完整可见照片集合解码，并通过预绘图层覆盖整个散开路径；全部图库图、rel 主图、缩略图和 INDEX 增加照片取色纯色占位。
- 主页与 rel 之间取消照片飞行层，改用跨页面遮罩；菜单补齐 opening、open、closing 三段状态，并在移动端避免全屏实时模糊。
- INDEX 进入和返回改用锁定后的实时卡片几何；跨照片返回随记时，目标清晰图在动画开始前完成预加载与解码，避免落位后换图。
- 主页头像替换为紧凑透明素材，碰撞范围跟随头部外圈椭圆；优化与文字、照片和边界的脱困逻辑，落地后保留自然倾斜角度。
- WORK 清空旧图库结构后建立首个白底拼贴页面；新增 2 张图片，不在访客日志中描述图片内容。
- 正式版本更新为 `v1.5.0`，缓存标识统一为 `v150-motion-work1`；发布验证覆盖语法、站点契约、静态构建、差异格式、跨照片逐帧交接和发布前敏感信息复核。
- 首次生产冒烟检查发现 Cloudflare 构建未复制 `images/work`，两张 WORK 图片返回 404；随后补充 WORK 媒体目录构建规则和回归契约，并重新部署同一正式版本。

## 2026-07-23 - v1.4.7 缩略图轨道返回修复上线

- 修复移动端 INDEX 返回后继续沿用动画选图锁和旧轨道几何的问题；返回时先重建缩略图位置、居中所选照片，再把控制权交还给用户。
- 移动端随记状态重新允许底部轨道接收横向输入，触摸与横向滚轮开始时会刷新几何，rel 与随记共享稳定的滑动选图逻辑。
- 删除 INDEX 专用的底部固定模糊伪元素及其无效的低动态、低透明度和高对比度辅助规则。
- `390×844` 验证覆盖 rel 与随记两条 INDEX 选图返回路径，照片索引、页面状态和轨道切换均正确；正式缓存标识更新为 `v147-rail-return1`。

## 2026-07-22 - v1.4.6 rel 动效与索引交接上线

- 移动端 rel 缩略图轨道恢复浏览器原生横向惯性；主图触摸更新通过 `requestAnimationFrame` 合并，轨道快速滑动只提交短时间窗口内的最终照片。
- 主图滑动变量下放到两张临时图组成的滑动层，缩略图节点和 INDEX 几何集中缓存，减少全树样式重算、重复查询和无效图片解码。
- rel 或随记进入 INDEX 时，底部操作栏与缩略图轨道从当前屏幕位置同步退出；快速开关和后台恢复增加确定性收尾，退场控件同步禁用。
- 随记与 INDEX 双向背景取色从图片动画首帧开始交接；顶部图标、底色和移动端透明度同步恢复，无末段跳色。
- 正式缓存标识统一为 `v146-rel-motion1`，同步更新 HTML 资源引用、包版本、公开日志和回归检查。

## 2026-07-21 - v1.4.5 运行性能与菜单稳定上线

- 合并发布首页节点回收与物理休眠、INDEX 可见加载与几何缓存、随记布局测量精简、苹方字体、返回清晰度与移动端中文菜单单行修复。
- 访客日志只写“优化”和“修复”两个有变化的类别，不显示版本号，不写本次没有发生的照片新增。
- 正式缓存标识统一为 `v145-runtime-menu1`，同步更新 HTML 资源引用、包版本、公开日志和回归检查。
- 发布验证覆盖桌面、常规手机与短屏；首页空闲帧请求归零，INDEX 49 张图加载完整，随记往返主图不变，中文菜单无换行或溢出。

## 2026-07-21 - 全站运行时性能与移动端稳定性待发布

- 首页无限图库改为复用固定批次，碰撞只读取近屏照片几何；文字物理循环按实际间隔调度，并在元素停稳后完全休眠，滚动、旋转、尺寸变化或页面恢复时再唤醒。
- 修复文字在目标位置继续受重力、随机漂移和重复聚拢影响而永久空转的问题；桌面、常规手机和 `320x568` 短屏都能找到不压图的停靠位，小人被照片柔性托住时也能自然停稳。
- INDEX 改用原生纵向滚动、可见卡片观察器和几何缓存；随记布局测量与 INDEX 预热合并，移动端关闭常驻 `will-change` 和全屏动态模糊。
- 首页空闲 6 秒动画帧请求由约 `1400` 次降为 `0`；滚动可立即唤醒，重新稳定后再次归零。连续滚底后节点稳定在 `205` 个（1 个初始批次 + 3 个循环批次），横向溢出为 `0px`。
- 移动端 INDEX 斜向快速滚动时 `scrollLeft` 始终为 `0`，49 张缩略图从顶到底来回后全部加载；连续 8 次快速开关无残留移动图层或隐藏卡片，随记往返保持同一张清晰主图，控制台无错误。
- JavaScript 本地预览缓存标识更新为 `perf-runtime9`；当前修改仅用于本地预览，暂不上线。

## 2026-07-21 - 随记苹方字体待发布

- 随记正文与地点统一改用系统 `PingFang SC` 字体栈，移除页面中的手写字体声明；非 Apple 设备使用系统中文无衬线字体回退。
- 地点粗体层级、字号、间距和随记动画保持不变；CSS 本地预览缓存标识更新为 `notes-pingfang1`，暂不上线。

## 2026-07-21 - 随记 INDEX 返回清晰度修复待发布

- 修复从随记进入 INDEX 再退出时，部分手机浏览器会继续复用低清晰度 filter 合成纹理，导致随记照片看起来变模糊的问题。
- 将随记照片阴影从参与 INDEX 位移、缩放和模糊的 `.focus-main` 外层移到稳定的 `.focus-main__button` 内层；外层在随记状态明确保持 `filter: none`。
- 保留原有阴影强度、明暗主题差异和 `.48s ease-soft` 阴影过渡，不改变 INDEX 路径、时长与主图落位。
- CSS 本地预览缓存标识更新为 `notes-index-sharp1`，暂不上线。

## 2026-07-21 - v1.4.4 交互稳定与主题所有权上线

- 合并发布移动端首页照片稳定、语言偏好持久化、索引返回与随记快速交接、随记照片阴影和主题所有权修复。
- 公开日志中的照片新增记录统一精炼为“新增数量 + 图库总数”，不再描述照片题材、颜色、地点、文件名或内容；内部工作日志继续保留开发上下文。
- 正式缓存标识统一为 `v144-stability-theme1`，并同步更新页面资源引用、包版本与自动检查。
- 发布验证覆盖 JavaScript 语法、站点规则、Cloudflare 静态构建、差异格式和发布前敏感信息扫描。

## 2026-07-21 - 系统主题与站内主题所有权修复

- 修复系统明暗主题变化后，站内主题按钮可能继续使用过期内存状态，第一次点击看起来没有生效的问题。
- 按钮直接读取页面当前实际显示的主题并取反；用户点击时先锁定站内手动偏好，再执行视觉过渡，即使系统事件与页面渲染相差一帧也一定产生可见切换。
- 增加后台恢复、旧浏览器媒体查询和跨标签页存储同步，并迁移旧 `l4rxx-theme` 偏好。
- 浏览器验证覆盖系统浅色/暗色跟随、正反一帧竞态、手动模式阻止后续系统覆盖、刷新保持和跨页面同步；所有状态与按钮标签一致。
- 连续 21 次快速点击每次都将已渲染主题取反，最终过渡类正常清理；测试结束后用户原有亮色偏好已恢复。
- JavaScript 缓存标识更新为 `theme-ownership2`；当前修改仅用于本地预览，暂不上线。

## 2026-07-20 - 随记照片阴影待发布

- 随记状态的主图新增跟随照片真实轮廓的轻量阴影，普通 rel 页面与索引页面保持原样。
- 明暗主题分别控制阴影强度；进入和退出沿用随记现有 `.48s ease-soft` 过渡，移动端只使用一层阴影以控制合成开销。
- 桌面与 `390×844 @3x` 移动端视觉检查无阴影裁切或横向溢出；进入和退出均检测到连续 `filter` 插值。
- 移动端连续 10 次快速开关随记时，392 个采样帧的 P95 为 `8.3ms`、最大 `12.5ms`，无超过 `34ms` 的帧或残留过渡状态。
- CSS 缓存标识更新为 `notes-shadow1`；当前修改仅用于本地预览，暂不上线。

## 2026-07-20 - 索引返回与随记快速交接修复

- 修复退出索引后立即点击随记时，索引落位保护仍强制关闭主图过渡，导致主图直接跳到随记位置的问题。
- 主图按下时会从已经落稳的画面立即接管索引收尾状态；点击事件保留键盘和极快点击兜底，不延迟用户操作，也不改变现有索引与随记曲线。
- 桌面与移动端逐帧验证均检测到主图 `transform` 和随记面板 `opacity/transform` 过渡；移动端连续 3 轮“立即打开、快速关闭、再次打开”均稳定收束。
- 反向验证覆盖从随记进入索引后立即关闭随记；最终无残留过渡状态、无临时移动图层，横向溢出为 `0px`。
- 本地脚本缓存标识更新为 `home-lang-index-notes1`；当前修改仅用于本地预览，暂不上线。

## 2026-07-19 - 移动端首页稳定与语言记忆待发布

- 禁止移动端文字碰撞、重聚和设备倾斜为主页照片添加位移反馈；文字重力保留，桌面精细指针设备的照片反馈不变。
- 语言偏好从单标签页会话存储改为持久存储：首次访问默认英语，用户切换后跨刷新、新标签页和后续浏览会话保持选择。
- 自动迁移旧 `sessionStorage` 语言值，避免已经选择中文的用户升级后短暂回到英语。
- 极端验证中，移动端主页照片位移由修复前最高约 `8px` 降为 `0px`；连续 8 次真实触摸滚动无横移，85KB/s 慢网下 15 张图片解码期间容器尺寸与位置不变。
- 验证语言可按“英语 → 中文 → 英语 → 中文”连续切换，刷新和新标签页继续保持中文；旧会话中文值可迁移到持久存储。
- 当前改动仅用于本地预览，暂不上线。

## 2026-07-18 - v1.4.3 图库新增与随记曲线上线

- 新增 `rel 48` 的蓝色 Winter Sweet 唱片照片与 `rel 49` 的黑白化妆人像，分别归入静物和人像分类。
- 将两张单帧 WebP 转为无 EXIF 的本地 JPEG 源图，并生成桌面、移动端中尺寸和缩略图三档资源。
- 随记进入与退出恢复上一版 `ease-soft` 曲线，同时保留当前同步时长、即时取色和可打断状态管理。
- 更新图库清单、缓存标识和图片尺寸测试，并将访客日志精炼为“优化”和“增加”两个实际变化类别。
- 极端验证覆盖连续快速切图、INDEX 末端图片加载、纵向滚动横移和随记动画中途打断；所有状态稳定收束。

## 2026-07-17 - rel 46 / 47 已发布照片

- 新增 `rel 46` 的 3:2 树荫草地照片和 `rel 47` 的夜间球场照片，生成桌面、移动端中尺寸和缩略图三档资源。
- 固定两张照片的图库顺序、基础标题与分类，并提升图库清单和页面缓存标识。
- `rel 46` 已替换为新的 `6000×4000` 源图；旧版派生资源已移除。
- 两张照片已随提交 `d93ab05` 推送到 `main` 并由 Cloudflare Pages 发布。

## 2026-07-16 - v1.4.2 加载与动效性能上线

- 移动端 Focus 改用 `1280px` 中尺寸照片，隐藏 INDEX 不再后台预热；相邻照片等待当前主图解码后再加载。
- INDEX 可见缩略图按批次请求，预加载缓存限制为 8 张，Focus 和 INDEX 节点通过文档片段挂载。
- 首页文字重力改为刷新率同步调度，并缓存碰撞矩形、transform 与照片激活状态。
- 随记正文和地点改用本地手写字体，地点使用粗体。
- 模拟 3G 与 4 倍 CPU 降速时，移动端 LCP 约为 `4.88s`，首屏图片请求为 `9`，图片传输约为 `354KB`。
- 提交 `4f58378` 已推送至 `main`，Cloudflare Pages 已确认使用缓存标识 `perf-flow3`。

## 2026-07-14 - v1.4.0 移动索引与随记地点上线

### 目标与改动

- 将移动端 INDEX 固定为单轴纵向交互，阻止触摸过程中的页面横移，并让惯性滚动只更新 `scrollTop`。
- 为索引卡片预留稳定宽高，确保可见缩略图都能加载，对可恢复失败进行重试，并在开合结束时清理残留动画样式。
- 进一步放缓移动端 INDEX 的进入与退出曲线；随记状态切图按视口边界计算完整离场和入场距离。
- 在随记正文上方加入可选双语地点行，无地点时不生成空白；为 14 张照片补充中英文地点和随记。
- 将日志改为日期一级标题，隐藏面向访客的版本号，并跳过没有内容的类别。

### 极端验证

- 在移动端 INDEX 连续注入 109 个斜向快速滑动采样点，容器和页面横向漂移均为 `0px`。
- 在 `390×844` 与 `320×568` 视口检查中英文长地点、最长随记和缩略图轨道，未出现溢出或重叠。
- JavaScript 语法检查、`tests/site-check.ps1`、Cloudflare 构建与 `git diff --check` 通过。
- 本地敏感信息扫描无高风险项；`.env` 规则正确，`ggshield` 未安装。

## 2026-07-12 - v1.2.1 rel 返回落位稳定性修复

### 问题与根因

- v1.2.0 的返回飞行层使用 `perspective(1200px)` 与 `translateZ(540px)` 表达高 Z 轴，但位移和缩放仍按普通 2D FLIP 几何计算。
- `540px` 深度产生约 `1.818` 倍透视放大；实测 rel 源图约为 `574×410`，飞行层首帧却约为 `1043×745`，因此不同照片位置和比例下会表现为随机放大、偏移或抽动。
- 原安全计时从图片开始加载时就启动，较慢解码会消耗动画时间，可能在动画尚未结束时提前移除飞行层。
- 真实首页照片与飞行层在同一任务中直接替换，没有共同显示的一帧；极端情况下会出现短暂闪动。

### 实施细节

- 使用 `(perspective - depth) / perspective` 计算透视补偿，同时修正起点位移与 X/Y 缩放，保证高 Z 轴首帧仍精确覆盖 rel 源图。
- 删除人为添加的轴向起点漂移，动画路径从真实源矩形直接收敛到首页目标矩形。
- 将图片就绪超时与运行中动画安全计时分离：全图和首页目标图完成加载/解码后才启动动画，运行计时从 `is-active` 首帧开始。
- 在交接阶段先让真实首页照片稳定显示一帧，再移除飞行层；下一帧清理 handoff class，避免同一帧内直接换层。
- 动画运行期间短暂锁定已恢复的首页滚动位置；滚轮、触摸或程序化滚动不会把目标照片移出飞行终点，交接完全结束后再解除。
- 为图片错误、解码超时、`animationcancel` 和减少动态效果模式保留清理路径，避免残留 overlay、隐藏目标或滚动锁。

### 极端验证

- 桌面端逐帧验证：修复后飞行层首个有效帧为约 `573.665×409.931`，与源图约 `573.665×409.931` 的位置和尺寸误差约 `0.01px`。
- 动画中程序化滚动 `420px`：下一帧检测到偏移，第二帧恢复原滚动位置；飞行层终点未漂移。
- 移动端末张照片 `rel=43` 与页面左侧边缘目标：动画结束后 overlay 数量为 0，目标 class、滚动锁和隐藏状态全部清理。
- 最终视觉截图确认飞行层在中段连续缩小，没有首帧突然放大、二段跳或背景图片抢帧。
- Node 语法检查、`tests/site-check.ps1`、`git diff --check` 与 Cloudflare 静态构建通过。

## 2026-07-12 - v1.2.0 空间动效与连续滑动上线

### 目标

- 将首页空间重力、全站主题过渡、顶部控制可读性、rel 返回落位与桌面/移动端大图滑动更新整理为一个正式版本。
- 继续保持 rel `INDEX / 索引` 功能不可见，不把此前未稳定的索引图库动画带回线上。
- 解决快速连续滑动仍受缩略图轨道节奏限制、反向手势后旧队列继续播放的问题。

### 连续滑动实现

- 将 rel 主图滑动保持为独立视觉图层，不复用点击缩略图时的模糊切图动画。
- 移动端使用横向手势，桌面端使用纵向鼠标拖动、触控笔和滚轮；每个手势只切换一张照片。
- 根据当前图与目标图的真实可见尺寸计算移动距离，当前图在离场时缩小并淡出，下一图在入场时淡入并恢复到原比例。
- 新增 `focusQueuedSwipe` 连续队列，允许当前提交动画未结束时继续记录同方向输入；每次主图交接只消费一步，最多保留三步，并在照片首尾进行边界限制。
- 新手势通过 `interruptFocusMainSwipeForNewGesture()` 读取当前位移，从现有 transform 继续，不重新播放起始帧。
- 缩略图轨道按主图进度跟随，但不再承担主图解锁条件；主图完成后直接交接下一步，轨道只负责最终选中位置。
- 反向触摸、指针或滚轮手势确认后立即清空剩余队列；当前图片仍按现有位移自然完成或回弹，避免突然跳回。
- 随记状态下，文字和分隔线共享滑动时间线；链式切换期间保持隐藏，最终一张稳定后统一恢复。

### 其他交互与视觉

- 首页设备方向输入增加横纵双轴响应、屏幕方向映射、中性姿态校准和低通滤波，并把轻微透视同步到照片层。
- 首页 `L4RXX` 在下半区照片空白处按顺序靠拢；合体条件放宽后触发一次呼吸和轻微释放，并保留照片碰撞与边界回弹。
- 从 rel 返回首页时使用当前完整原图沿单段高 Z 轴轨迹落位，真实首页图片在动画开始时隐藏并在终点直接接管，移除二段落地。
- 全站主题切换由页面级颜色过渡统一驱动，照片不参与颜色滤镜过渡；菜单文字、图标细线和头像使用一致时间点。
- 顶部控制从三个独立模糊底板改为共享渐隐雾化边缘，并保留轻微轮廓阴影；菜单头像增加明暗主题适配的透明轮廓阴影。
- 所有段落启用更自然的换行，中文使用严格行首行尾标点规则；英文菜单底部文案保持单行并贴合底部。

### 版本与验证

- 更新 `package.json` 为 `1.2.0`，HTML 静态资源缓存标识为 `spatial-interactions-release1`。
- 在 `assets/app.js`、`UPDATE_LOG.md` 和 `RELEASE_LOG.md` 中新增 `v1.2.0` 中英正式日志。
- Node 语法检查通过；`tests/site-check.ps1` 通过；`scripts/cloudflare-build.mjs` 成功输出 `dist`。
- 浏览器三连滑：从 `rel=20` 快速连续三次左滑，最终稳定到 `rel=23`，active 缩略图为 23，临时图层与滑动 class 均清理完成。
- 浏览器反向打断：两次左滑排队后立即右滑，最终只完成当前一步到 `rel=21`，剩余队列未继续播放。
- 浏览器随记状态：从 `rel=20` 快速双滑到 `rel=22`，`is-notes` 保留，文字与分隔线 opacity 恢复为 1，临时图片 src 清空。
- 浏览器桌面状态：在 `1366×800` 下连续三次纵向滚轮从 `rel=20` 到 `rel=23`，X 轴位移始终为 0；两次向下后立即反向会取消当前动作和剩余队列，最终回到 `rel=20`。
- 发布前安全检查无 HIGH；MEDIUM 经人工复核为 `.local` 联系占位符、未纳入发布的开发计划本地路径和 JPEG 二进制误判。`.env` 与 `.env.*` 已忽略，`ggshield` 本机未安装。

## 2026-07-10 - v1.1.3 移动体验与 rel 大图滑动上线

### 目标

- 将已稳定的移动端体验、日志入口、随记稳定性与 rel 大图横向滑动更新上线。
- 保持 rel `INDEX / 索引` 功能暂缓，不把索引图库动画相关未稳定内容带入正式版本。
- 给本次正式上线分配独立版本号与缓存标识。

### 实施细节

- 更新 `package.json` 版本为 `1.1.3`。
- 更新 HTML 静态资源缓存标识为 `stable-swipe-release1`。
- 在 `assets/app.js` 的正式日志数据中新增 `v1.1.3`，并保持中英文版本同步。
- 在 `UPDATE_LOG.md`、`RELEASE_LOG.md` 和 `WORK_LOG.md` 中记录本次上线版本。
- 同步更新 `tests/site-check.ps1`，让版本、缓存标识和 rel 滑动动画参数进入回归检查。

### 验证细节

- 本地运行 `tests/site-check.ps1`，结果通过。
- 使用 Codex 内置 Node 运行 `scripts/cloudflare-build.mjs`，成功输出 `dist`。
- 浏览器实测 `focus.html?rel=21`：普通滑动切换成功，URL、主图索引和缩略图 active 状态同步。
- 浏览器实测快速连续滑动：连续三次大图滑动可从 `rel=22` 到 `rel=25`，没有被缩略图轨道动画锁住。
- 浏览器实测首图边界：`rel=1` 可向边界拖动并回弹，不会绕回最后一张。
- 发布前安全检查：本地启发式扫描无 HIGH；MEDIUM 为公开联系邮箱与图片二进制误判，`ggshield` 本机未安装。

## 2026-07-09 - v1.1.2 正式日志历史补全

### 目标

- 修正正式日志少记一个历史正式版本的问题。
- 将“新增照片资源批次”从 `v1.1.0` 中拆出，单独作为 `v1.0.1` 记录。
- 修复线上 `logs.html` 在 Cloudflare clean URL 跳转后可能打不开的问题。

### 证据与判断

- Git 提交 `c53acb8 Add new photos and optimize gallery images` 对应 2026-07-07 的照片资源更新。
- `c53acb8` 前 `content/photos.json` 有 25 个公开 rel 条目，`c53acb8` 后有 43 个公开 rel 条目，因此公开图库新增 18 个 rel 条目。
- 该提交同时重新压缩了已有公开 web 图和缩略图，并新增 `026` 至 `043` 的 web / thumb 图片资源。
- 用户提到的“新的32张图照片”按正式日志口径记录为“新照片资源批次”，同时在条目中写清可验证的公开图库数量变化，避免以后用不同口径回溯时混乱。

### 实施细节

- 在 `RELEASE_LOG.md` 中新增 `v1.0.1 - Gallery Expansion And Image Optimization / 图库扩展与图片优化版`。
- 将 `v1.1.0` 的对比基准从 `v1.0.0` 改为 `v1.0.1`，并从 `v1.1.0` 的新增内容里移除照片扩展描述。
- 新增当前补丁版本 `v1.1.2 - Release Log Correction / 正式日志校正版`，记录这次日志历史补全与线上日志入口修复。
- 更新 `UPDATE_LOG.md` 当前版本为 `v1.1.2`，缓存标识为 `logs-history-fix1`。
- 更新 `scripts/cloudflare-build.mjs`，将 `logs.html` 同步输出为 `logs/index.html`，兼容 Cloudflare 将 `/logs.html` clean URL 到 `/logs` 的行为。
- 更新 `package.json` 为 `1.1.2`，并同步调整 `tests/site-check.ps1` 的日志检查断言。

### 验证细节

- 本地运行 `tests/site-check.ps1`。
- 使用 Codex 内置 Node 运行 `scripts/cloudflare-build.mjs`，确认 `dist/logs.html` 与 `dist/logs/index.html` 都存在。
## 2026-07-09 - v1.1.1 日志预览与上线

### 目标

- 将日志拆分方案正式上线，并给这次日志系统更新分配独立正式版本号。
- 解决本地浏览器直接打开 `WORK_LOG.md` 时中文显示为乱字的问题。
- 保持 rel `INDEX / 索引` 暂缓，不把索引动画相关未稳定内容重新带回正式网站。

### 问题原因

- 本地预览使用 `python -m http.server` 时，`.md` 文件返回 `Content-Type: text/markdown`，但响应头没有 `charset=utf-8`。
- Markdown 文件本身是 UTF-8；乱码来自浏览器直接预览 `.md` 时的编码判断，而不是日志正文损坏。

### 实施细节

- 新增 `logs.html`，作为浏览器友好的日志阅读入口。
- `logs.html` 通过 `fetch()` 读取 `UPDATE_LOG.md`、`RELEASE_LOG.md`、`WORK_LOG.md`，再使用 `TextDecoder("utf-8")` 强制按 UTF-8 解码。
- 预览页提供 `Index / 入口`、`Release / 正式`、`Work / 工作` 三个切换按钮。
- 更新 `scripts/cloudflare-build.mjs`，将 `logs.html` 纳入 Cloudflare Pages 构建输出。
- 更新 `tests/site-check.ps1`，检查 `logs.html` 存在、包含 `<meta charset="utf-8">`、包含 UTF-8 解码逻辑，并确认三份日志仍在构建范围内。
- 更新 `UPDATE_LOG.md`、`RELEASE_LOG.md`、`WORK_LOG.md` 与 `package.json`，将当前正式版本调整为 `v1.1.1` / `1.1.1`。

### 验证细节

- 本地访问 `http://127.0.0.1:8765/logs.html#work`，确认工作日志中文正常显示，未出现 `鏇`、`涓`、`锛` 等乱码特征。
- 本地运行 `tests/site-check.ps1`，结果为 `site-check passed`。
- 使用 Codex 内置 Node 运行 `scripts/cloudflare-build.mjs`，成功输出 `dist`，并确认 `dist/logs.html` 存在。
## 2026-07-09 - 日志体系与版本规范

### 目标

- 将原本混在一起的更新记录拆成两个层级：正式上线日志与工作过程日志。
- 让每个正式上线的网站版本都有独立版本号，便于之后回溯、对比和部署说明。
- 保留旧日志里的大量细节，不把已经发生的排查和试错记录压缩丢失。

### 实施细节

- 新增 `RELEASE_LOG.md`：只记录正式上线版本，使用 `vMAJOR.MINOR.PATCH` 版本号，并按“增加 / 优化 / 修复 / 删除或暂缓 / 部署验证”组织。
- 新增 `WORK_LOG.md`：记录实际工作过程、具体问题、未上线内容、部署排查与验证证据。
- 将 `UPDATE_LOG.md` 改为日志入口，链接正式日志与工作日志，并标记当前正式版本。
- 将 `package.json` 版本同步为 `1.1.0`，与当前正式上线版本 `v1.1.0` 对齐。
- 更新 Cloudflare 构建脚本，让 `RELEASE_LOG.md` 与 `WORK_LOG.md` 一起输出到 `dist`。

### 版本判断

- `v1.0.0`：初始 Cloudflare 正式上线版，提交 `b7fcb7f`。
- `v1.1.0`：非索引作品集版，提交 `dce2a7b`。该版本新增主题系统、随记系统、首页重力互动、照片扩展、语言适配与部署修复，因此按 minor 版本升级处理。

## 2026-07-08 至 2026-07-09 - v1.1.0 上线整理

### 目标

- 将除 rel `INDEX / 索引` 之外的稳定更新发布到线上。
- 不把索引图库的飞行动画、接力图层和打断动画问题带入正式网站。
- 让更新日志按照“增加、优化、修复、删除”四类整理。

### 关键处理

- 隐藏 rel 页面可见的 `INDEX / 索引` 入口，避免用户进入未稳定的索引图库交互。
- 保留相关索引代码的后续修复空间，但构建出的正式页面不包含 `data-focus-index` 控件。
- 增加 Cloudflare Pages 静态构建脚本，解决线上日志里 `npm run build` 找不到 `package.json` 的失败原因。
- 发现 GitHub 默认分支是 `main`，Cloudflare 绑定的也是 `main`；之前只推到 `master` 时线上不会更新。随后将稳定版本同步到 `main` 并推送。

### 验证细节

- 本地运行 `tests/site-check.ps1`，结果为 `site-check passed`。
- 使用 Codex 内置 Node 运行 `scripts/cloudflare-build.mjs`，成功输出 `dist`。
- 检查 `dist/focus.html`，确认包含 `no-index-release1`，且不包含 `data-focus-index` / `focus-index-gallery`。
- 推送 `main` 后轮询线上页面，确认首页和 rel 页都加载 `no-index-release1`，并确认 rel 页不再包含索引按钮。

### 暂缓内容

- rel `INDEX / 索引` 的书柜式飞行动画暂不进入正式版本。当前问题包括：桌面端飞行动画几何偏差、图层接力闪白、索引关闭后状态恢复异常、移动端随记状态异常、快速打断动画后状态重入不稳定。

## 历史工作记录（迁移自旧 UPDATE_LOG.md）

以下内容从旧 UPDATE_LOG.md 迁移保留，作为工作过程和排查记录。部分条目包含曾经试验但未进入当前正式版本的内容，正式上线范围以 RELEASE_LOG.md 为准。

## 2026-07-08 - Non-INDEX Release / 非索引上线版

### 增加
- Added the dark/light theme system with the symbol-style theme control and system-theme default detection.
- Added the rel-page notes surface opened from the main photo, with Chinese / English note copy support.
- Added the latest compressed photo set, favicon / manifest / robots / sitemap / 404 / README deployment support files.
- Added a Cloudflare Pages static build entry (`npm run build`) that publishes only the public site files into `dist`.

### 优化
- Improved homepage photo order randomization while preserving the BACK return position from rel pages.
- Improved homepage `L4RXX` gravity interaction, mobile/desktop thumbnail rail motion, language/theme controls, and Gaussian menu blur.
- Improved rel notes layout so photo scale, line position, and note copy width adapt across mobile and desktop.

### 修复
- Fixed mobile home refresh / return-state confusion, rel BACK return position, rel note language switching, and thumbnail rail glide behavior.
- Fixed the plus-menu overlay interaction layer so BACK and other rel controls do not remain clickable underneath.
- Kept the unfinished rel INDEX gallery disabled for this deployment so its current animation bugs cannot affect the live site.
- Fixed the Cloudflare Pages build path so deployments no longer fail when the dashboard runs `npm run build`.

### 删除
- Removed `001-dsc00081` from the public gallery.
- Removed the old rel INFO action.
- Temporarily removed the rel `INDEX / 索引` action from the published focus page while the INDEX animation is repaired separately.

Cache version updated to `no-index-release1`.
# Update Log

## 2026-07-07

- Added an adaptive rel note layout that balances photo scale, note line position, and note copy size/width from each photo ratio and note length.
- Added the default placeholder note to every photo that did not yet have a written note, and rendered the note text inside the rel inline-note surface.
- Aligned the mobile rel note line with the scaled main photo so the note surface opens beneath the image instead of cutting through it.
- Smoothed the day/night theme switch with a temporary transition state so backgrounds, text, icon strokes, blur layers, and image filters ease instead of snapping.
- Smoothed the rel inline-note open/close motion so the main photo eases through transform-based scaling instead of snapping through width/height changes.
- Fixed the rel INDEX toggle so opening and closing the thumbnail index preserves the current rel selection instead of drifting back to rel=1.
- Removed the rel INFO button and moved the empty photo-note surface into the rel page itself: clicking the main image opens/closes it, and the top plus/X becomes the note-close control while it is open.
- Published the 43-photo gallery update to GitHub and Cloudflare Pages after local review.
- Included UPDATE_LOG.md in the Cloudflare build output so release notes are deployed with the site.
- Kept generated web images compressed at a 1920px max edge and thumbnails at a 480px max edge for faster page loads.

## 2026-07-06

- Added 18 new photos to the gallery, bringing the public sequence to 43 photos.
- Tightened generated image compression for faster loading: web images now use a 1920px max edge at JPEG quality 82, and thumbnails use a 480px max edge at JPEG quality 74.
- Added a true Gaussian navigation overlay with `backdrop-filter` / `-webkit-backdrop-filter` for desktop and mobile so menu content stays sharp while the page behind it blurs.
- Added the CN/EN language switch to the rel focus page and wired focus copy, BACK, INDEX, INFO, and Douyin/TikTok labels into the same language system.
- Updated rel BACK behavior to preserve the home scroll position from the clicked photo, return without replaying the opening animation, and play a short focus-to-overview transition.
- Raised the menu interaction layer and disabled rel BACK / INDEX / INFO controls while the plus menu is open.
- Rebuilt the home infinite scroll from a complete repeatable layout batch, including skip and pad cells, so desktop and mobile loops no longer create blank gaps.
- Removed `001-dsc00081` / `DSC00081.jpg` from the generated gallery data and regenerated the site to 25 photos.
- Filled the home overview batch ending row with clickable photo links instead of repeating blank pad cells, fixing the third-page desktop/mobile gap.
- Kept the name/plus-menu hero gaps only in the first overview batch and switched infinite scrolling to a skip-free loop batch so later desktop/mobile pages do not inherit those empty spaces.
- Disabled browser scroll restoration on normal home refreshes and force-reset the overview to the first page, while preserving rel BACK return-position restoration.
### 2026-07-07 - 随记页面比例联动优化
- 让随记打开态的大图缩放、随记线位置、文案字号/宽度按当前照片和文案长度一起计算，移动端优先保证文案不压到底部缩略图轨道。
- 将随记线动画从文案容器中拆出来，线继续用生长动画，文字改为淡入和轻微位移，避免打开/收回时文字被横向或纵向压扁。
- 缓存版本更新为 `focus-notes-adaptive2`，方便本地和 Cloudflare 预览拿到新样式。

### 2026-07-07 - Note placeholder copy update
- Updated the rel note placeholder copy to the new l4rxx wording requested by the site owner.
- Cache version updated to `focus-notes-copy1` so local preview and deployment pick up the new text.

### 2026-07-07 - Rel note text alignment update
- Expanded mobile rel note copy to use the full available width below the note line, so Chinese text no longer wraps early before reaching the right side.
- Centered the desktop/landscape rel note copy inside the right note panel while keeping the animated note line separate.
- Cache version updated to `focus-notes-copy2`.

### 2026-07-07 - Adaptive rel note composition
- Rebalanced desktop rel notes so the main photo can stay larger and shift left with a measured gap from the thumbnail rail while notes use the right-side whitespace.
- Made desktop note width and photo scale respond to current image ratio, note length, viewport width, and thumbnail rail clearance.
- Cache version updated to `focus-notes-copy3`.

## 2026-07-07 - Focus Notes Proportion Tune
- Tightened the compact desktop note panel so rel notes use the right whitespace without shrinking the photo too aggressively.
- Kept mobile note copy at full available width while preserving the photo-to-note-line spacing.
- Cache version updated to `focus-notes-copy4`.

## 2026-07-07 - Focus Image Switch And Bilingual Notes
- Added a preloaded blur/scale transition when switching the main rel image.
- Updated the focus menu about copy in Chinese and English.
- Added bilingual note selection so photo notes react to the language switch and future notes can use `noteCn` / `noteEn`.
- Cache version updated to `focus-notes-copy15`.
## 2026-07-07 - Home Random Order And Softer Notes Rail
- Randomized the home overview photo order on ordinary page entries while keeping each photo linked to its stable rel id.
- Preserved the randomized overview order when returning from rel pages so BACK lands on the same visual page instead of reshuffling.
- Smoothed the rel notes thumbnail rail dimming on desktop and mobile with opacity, blur, and directional movement transitions.
- Cache version updated to `focus-notes-copy15`.
## 2026-07-07 - Mobile-Safe Home Return Capture
- Home photo taps now save the randomized order on pointer down before navigation, making rel BACK restoration more reliable on mobile.
- Home overview links stay directly clickable while keeping the existing image-hover behavior.
- Cache version updated to `focus-notes-copy15`.
## 2026-07-07 - Focus Notes Index Return And Motion
- Opening INDEX from a rel note now remembers that it came from the note state, then restores that same note when INDEX is closed or BACK is used from the index overlay.
- Added softer INDEX overlay motion for desktop and mobile: the main image eases back, the overlay blur fades, and the thumbnail rail transitions instead of snapping.
- Kept ordinary rel BACK behavior returning to the home overview, and kept mobile home taps saving return state before navigation.
- Cache version updated to `focus-notes-copy15`.
## 2026-07-07 - Focus Thumbnail Rail Glide
- Direct thumbnail clicks on rel pages now keep the mobile bottom rail gliding toward the selected photo instead of jumping instantly.
- Added a cancellable eased rail-scroll animation so user swipes and wheel gestures can interrupt it naturally.
- Cache version updated to `focus-notes-copy15`.
## 2026-07-07 - Parallax-Aware Focus Rail Glide
- Updated rel thumbnail centering to use the visible thumbnail position instead of raw offsetLeft, so the mobile rail glide accounts for parallax transforms.
- Added internal glide state markers on the rail for easier local QA of thumbnail-click motion.
- Cache version updated to `focus-notes-copy15`.
## 2026-07-07 - Gentle Direct Thumbnail Selection
- Direct taps on visible rel thumbnails no longer force the bottom rail to center the tapped photo, removing the abrupt jump.
- The rail only performs a small eased nudge when the tapped thumbnail is close to the mobile viewport edge.
- Cache version updated to `focus-notes-copy15`.
## 2026-07-08 - Focus Index FLIP Entrance
- Added a rel INDEX entrance animation that captures the current main photo and thumbnail rail positions before opening the index.
- The active photo now flies from the main image position into its index-gallery slot, while the other thumbnails glide in with staggered inertia.
- The same entrance works from normal rel pages and rel note pages, with mobile-specific timing and transform origins.
- Cache version updated to `focus-notes-copy15`.
## 2026-07-08 - Focus Index Bookcase Motion
- Reworked the rel INDEX transition so the same full photo acts like a book moving between the main focus position and its index-gallery slot.
- Opening INDEX now first positions the gallery around the current rel item, then lets the main photo shrink into that visible slot.
- Clicking a photo from INDEX now uses the same bookcase-style flight back to the focus image, including the restored notes layout when INDEX came from notes.
- Added guarded animation cleanup so the focus page always releases exiting state and the thumbnail rail keeps working after returning from INDEX.
- Cache version updated to `focus-index-gallery2`.
## 2026-07-08 - Independent Focus Index Gallery
- Rebuilt the rel INDEX flow as a separate full-image gallery layer instead of transforming the left thumbnail rail.
- Opening INDEX now sends the current main photo into its own gallery slot first, then brings the other full images into their positions with staggered inertia while the rel thumbnail rail fades away.
- Closing INDEX reverses the motion from the selected gallery image back to the main rel image, then restores the rel thumbnail rail so direct rail clicks keep working.
- Cache version updated to `focus-index-gallery2`.
## 2026-07-08 - Focus Rail Direct Tap Fix
- Added a manual selection guard so direct thumbnail taps on rel pages are not immediately overwritten by scroll-position syncing.
- The guard clears as soon as the user starts swiping, scrolling, or using arrow keys, so the original scroll-driven thumbnail selection remains intact.
- Cache version updated to `focus-index-gallery2`.
## 2026-07-08 - Focus Thumbnail Rail Follow
- Direct thumbnail clicks on rel pages now glide the thumbnail rail to the selected photo on both mobile and desktop instead of only nudging edge thumbnails.
- Kept the manual selection guard so the clicked rel image is not overwritten during the glide, then releases it after the glide or when the user scrolls/swipes again.
- Cache version updated to `focus-rail-glide3`.
## 2026-07-08 - Focus Index Smooth Flyer
- Changed the rel INDEX moving-photo flyer from layout-heavy left/top/width/height keyframes to compositor-friendly translate3d and scale transforms.
- Added a short handoff delay when the flyer reaches its destination, so the gallery card or rel main image can take over without a visible snap.
- Held the selected rel while returning from INDEX so scroll-position syncing cannot steal the page to another photo.
- Reordered INDEX exit cleanup so the newly created flyer is preserved while old gallery animations are cleared.
- Cache version updated to `focus-index-smooth6`.
## 2026-07-08 - Focus Index Geometry Handoff
- 修复 rel INDEX 进出场飞行动画的最终几何：退出索引时不再读取 `.is-index` 临时缩放后的大图位置，而是计算普通 rel / 随记 rel 的最终可见图片内容区域。
- Added a short handoff state so the real main image takes over underneath the moving flyer without a second CSS resize, reducing the final-position stutter on desktop and mobile.
- Cache version updated to `focus-index-smooth6`.
## 2026-07-08 - Focus Index Opening Geometry
- 修复从 rel 大图打开 INDEX 时的飞行动画目标：打开阶段锁定索引图库容器的几何 transform，避免大图飞向一个仍在缩放/位移中的格子。
- Kept the gallery opacity/filter reveal while preventing its layout transform from moving the active card target, so the main photo shrinks into the final index-card position more accurately.
- Cache version updated to `focus-index-smooth6`.
## 2026-07-08 - Focus Index Image Continuity
- Removed blur/saturation changes from the moving focus-index flyer so the photo keeps the same color and clarity while it moves between rel and INDEX.
- Added decoded-image handoff waiting before the flyer is removed, so INDEX cards and rel/notes main images take over after they are ready instead of snapping from soft to sharp.
- Kept the clicked INDEX card hidden through the close fade to prevent it flashing once in its original grid position while the flyer returns to rel or notes.
- Cache version updated to `focus-index-smooth6`.
## 2026-07-08 - Focus Index Flash Guard
- Added a timer fallback for the rel INDEX opening animation so the moving photo cannot leave the page stuck in `is-index-opening` if the browser delays animation frames.
- Added a hard cleanup fallback for the moving-photo flyer, keeping the handoff deterministic even when image decode or animation frames are late.
- Kept the clicked INDEX card hidden until the gallery fade is fully gone, preventing the original grid-position image from flashing during the return to rel or notes.
- Cache version updated to `focus-index-smooth7`.
## 2026-07-08 - Focus Index Close Blur Removal
- Removed the blur filter from the rel main image during INDEX close, so returning from INDEX no longer looks like a second image-switch blur animation.
- Kept the opening INDEX blur intact while making the closing handoff use opacity/flyer motion only.
- Cache version updated to `focus-index-smooth8`.
## 2026-07-08 - Focus Index Handoff Crossfade
- Changed the INDEX close handoff from an instant main-image reveal to a very short no-blur crossfade under the moving flyer.
- Extended the flyer handoff delay slightly so the real rel image is already settled before the flyer is removed, reducing the visible main-image flash.
- Cache version updated to `focus-index-smooth9`.
## 2026-07-08 - Focus Index White Flash Guard
- Kept the rel main image visible underneath the INDEX close/exit state instead of setting it transparent, preventing the page background from flashing white during the handoff.
- Preserved the no-blur close behavior and the short flyer/main-image crossfade from the previous update.
- Cache version updated to `focus-index-smooth10`.
## 2026-07-08 - Focus Index Single Travel Layer
- Rebuilt the rel / notes / INDEX image transition around a single fixed travel layer using the same `photo.full` image throughout the movement.
- The travel layer now moves from the real source rectangle to the real destination rectangle, lets the real INDEX / rel / notes state take over underneath as soon as it arrives, then releases on a deterministic timer.
- Cache version updated to `focus-index-smooth18`.
## 2026-07-08 - Focus Index Destination-Paint Handoff
- Kept the real rel / notes main image hidden during INDEX closing so the moving photo remains the only visible main image until it reaches the target.
- Changed the travel layer release to wait for the destination image/layout paint before fading out, reducing the white flash and sharpness snap when returning from INDEX.
- Cache version updated to `focus-index-smooth19`.
## 2026-07-08 - Focus Index Hidden-Tab Release Fallback
- Added a fallback path for the single travel layer when the page is hidden or requestAnimationFrame is paused, so INDEX exit cannot leave the moving image stuck over the rel page.
- Kept the destination-paint wait for visible browsing while making the release idempotent and timer-backed.
- Cache version updated to `focus-index-smooth20`.
## 2026-07-08 - Focus Index Active Page Targeting
- Pre-positioned the INDEX gallery on the current rel item before the index overlay appears, so deeper photos open on their own gallery page instead of briefly showing the first page.
- Reconfirmed the active card rectangle immediately before the travel-layer animation and reserved the active card ratio from the current main image to avoid late image-load layout drift.
- Cache version updated to `focus-index-smooth21`.
## 2026-07-08 - Focus Index Interruptible Travel Layer
- Added interrupt handling for INDEX open/close transitions: clicking INDEX during a transition now freezes the current moving image and continues from that exact position instead of restarting the animation.
- Preserved the notes-return state when reopening INDEX during a notes-to-rel close transition, so the next close can still return to the correct notes geometry.
- Cache version updated to `focus-index-smooth22`.
## 2026-07-08 - Focus Index Interrupt Fallback
- Added a current-layer fallback for interrupted INDEX transitions, so rapid taps during opening or closing still keep the moving image as the source instead of falling back to an instant close.
- Retagged reused travel layers as enter/exit before reversing direction, keeping debug state and CSS state consistent.
- Cache version updated to `focus-index-smooth23`.
## 2026-07-08 - Focus Index Desktop Handoff Alignment
- Added a final settle pass for the INDEX travel layer before release, aligning it to the rendered destination card or rel/notes image content rectangle so desktop handoff does not jump by a few pixels.
- The settle pass is longer on desktop and very short on mobile, preserving the current mobile feel while fixing the more visible desktop offset.
- Cache version updated to `focus-index-smooth24`.
## 2026-07-08 - Focus Index Main Image Node
- Reworked the INDEX transition to move the real `.focus-main` image node itself, matching the notes-page model instead of relying on a copied travel image layer.
- The main image now flies into the active index card, stays docked there while the active card is hidden, then flies back to the rel or notes image position before normal layout is restored.
- Cache version updated to `focus-index-main1`.
## 2026-07-08 - Focus Index Main Target Geometry
- Fixed the rel / notes / INDEX handoff target measurement so the real `.focus-main` image moves back to the final rel or notes image geometry instead of measuring its temporary docked index-card size.
- Cache version updated to `focus-index-main2`.
## 2026-07-08 - Focus Notes Handoff Measurement
- Updated notes layout measurement during INDEX handoff so rel notes use the final focus image layout instead of the temporary moving image size.
- Cache version updated to `focus-index-main3`.
## 2026-07-08 - Focus Index Locked Dock Rect
- Locked the INDEX dock step to the already measured target card rectangle, so the real main image no longer re-scrolls or re-measures the index gallery at the end of the opening motion.
- Cache version updated to `focus-index-main4`.
## 2026-07-08 - Focus Index Stale Transform Guard
- Fixed the real main-image INDEX motion cleanup so a queued animation frame cannot restore the stale flight transform after the image has docked to the index card or returned to rel / notes.
- Cache version updated to `focus-index-main5`.
## 2026-07-08 - Focus Index Ratio Locked Motion
- Changed the rel / notes / INDEX moving image to animate from the actual visible photo content rectangle instead of the outer focus frame.
- Locked the moving image to a single scale value so the photo keeps its own ratio during the whole INDEX open and close motion.
- Cache version updated to `focus-index-main6`.
## 2026-07-08 - Focus Index Ratio Locked Frame Motion
- Reverted the INDEX main-image motion back to direct frame control because inline transforms blocked the browser-native animation path.
- Kept the corrected photo-content start rectangle and single-scale ratio lock so rel / INDEX / notes movement does not stretch or twitch between different aspect boxes.
- Cache version updated to `focus-index-main7`.
## 2026-07-08 - Focus Index Ratio Locked CSS Transition
- Changed the INDEX main-image flight from requestAnimationFrame stepping to a CSS transform transition, avoiding the delayed fallback jump that made the image pause and then snap.
- Kept the same photo-content rectangle and single-scale ratio lock so rel, INDEX, and notes share one continuous visual geometry.
- Cache version updated to `focus-index-main8`.
## 2026-07-08 - Focus Index Immediate Flight Start
- Removed the artificial start timeout from the INDEX main-image flight so the CSS transform transition begins immediately after the source rectangle is fixed.
- Cache version updated to `focus-index-main9`.
## 2026-07-08 - Focus Index Transition Activation Order
- Fixed the INDEX main-image flight activation order by enabling the transition class, forcing style calculation, then writing the target transform.
- Cache version updated to `focus-index-main10`.
## 2026-07-08 - Focus Index Flight Specificity
- Fixed the INDEX flight transition specificity so `.is-flight-active` overrides the stronger `.focus-shell.is-index .focus-main.is-main-traveling` transition reset.
- Cache version updated to `focus-index-main11`.
## 2026-07-08 - Focus Index Inner Visual Flight
- Moved the INDEX flight transform from the layout-owned `.focus-main` frame to the inner image button, so focus layout transforms no longer override the moving photo.
- The outer frame still locks the source and destination content rectangles, while the inner visual node performs the smooth ratio-locked movement.
- Cache version updated to `focus-index-main12`.
## 2026-07-08 - Focus Index Inline Inner Flight
- Changed the inner visual flight to write transform and transition inline with priority, overriding the focus reset rules that kept the visual node pinned at identity.
- Cache version updated to `focus-index-main13`.
## 2026-07-08 - Focus Index Scroll Handoff
- After the active photo flies into INDEX, the fixed moving main image now hands visibility back to the real index card with a timer-backed release so it follows gallery scrolling normally.
- Closing INDEX still starts from the clicked index card, keeping the rel / notes return animation intact.
- Cache version updated to `focus-index-main17`.
