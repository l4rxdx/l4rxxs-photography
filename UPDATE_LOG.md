# Update Log

## 2026-07-06

- Added a true Gaussian navigation overlay with `backdrop-filter` / `-webkit-backdrop-filter` for desktop and mobile so menu content stays sharp while the page behind it blurs.
- Added the CN/EN language switch to the rel focus page and wired focus copy, BACK, INDEX, INFO, and Douyin/TikTok labels into the same language system.
- Updated rel BACK behavior to preserve the home scroll position from the clicked photo, return without replaying the opening animation, and play a short focus-to-overview transition.
- Raised the menu interaction layer and disabled rel BACK / INDEX / INFO controls while the plus menu is open.
- Rebuilt the home infinite scroll from a complete repeatable layout batch, including skip and pad cells, so desktop and mobile loops no longer create blank gaps.
- Removed `001-dsc00081` / `DSC00081.jpg` from the generated gallery data and regenerated the site to 25 photos.
- Filled the home overview batch ending row with clickable photo links instead of repeating blank pad cells, fixing the third-page desktop/mobile gap.
- Kept the name/plus-menu hero gaps only in the first overview batch and switched infinite scrolling to a skip-free loop batch so later desktop/mobile pages do not inherit those empty spaces.
- Disabled browser scroll restoration on normal home refreshes and force-reset the overview to the first page, while preserving rel BACK return-position restoration.
