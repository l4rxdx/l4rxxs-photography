## 2026-07-08 - Non-INDEX Release / 非索引上线版

### 增加
- Added the dark/light theme system with the symbol-style theme control and system-theme default detection.
- Added the rel-page notes surface opened from the main photo, with Chinese / English note copy support.
- Added the latest compressed photo set, favicon / manifest / robots / sitemap / 404 / README deployment support files.

### 优化
- Improved homepage photo order randomization while preserving the BACK return position from rel pages.
- Improved homepage `L4RXX` gravity interaction, mobile/desktop thumbnail rail motion, language/theme controls, and Gaussian menu blur.
- Improved rel notes layout so photo scale, line position, and note copy width adapt across mobile and desktop.

### 修复
- Fixed mobile home refresh / return-state confusion, rel BACK return position, rel note language switching, and thumbnail rail glide behavior.
- Fixed the plus-menu overlay interaction layer so BACK and other rel controls do not remain clickable underneath.
- Kept the unfinished rel INDEX gallery disabled for this deployment so its current animation bugs cannot affect the live site.

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