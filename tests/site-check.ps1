$ErrorActionPreference = "Stop"
$Root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)

function Assert-True {
    param(
        [bool]$Condition,
        [string]$Message
    )
    if (-not $Condition) {
        throw $Message
    }
}

function Read-Text {
    param([string]$RelativePath)
    Get-Content -Raw -LiteralPath (Join-Path $Root $RelativePath)
}

foreach ($File in @("index.html", "work.html", "focus.html", "assets/app.js", "assets/styles.css", "assets/favicon.png", "content/photos.json", "scripts/build-gallery.ps1", "robots.txt", "sitemap.xml", "404.html", "site.webmanifest")) {
    Assert-True (Test-Path -LiteralPath (Join-Path $Root $File)) "$File should exist"
}

$App = Read-Text "assets/app.js"
$Css = Read-Text "assets/styles.css"
$Index = Read-Text "index.html"
$Work = Read-Text "work.html"
$Focus = Read-Text "focus.html"
$PhotosJson = Read-Text "content/photos.json"
$AllText = "$Index`n$Work`n$Focus`n$App`n$Css"
$PhotoData = $PhotosJson | ConvertFrom-Json
$Photos = @($PhotoData.items)

Assert-True ($Index -match "l4rxx") "home page should use the l4rxx name"
Assert-True ($Index -match "data-language-switch") "home page should include a top-left language switch"
Assert-True ($Index -match "data-lang-option=`"cn`"") "language switch should include a Chinese option"
Assert-True ($Index -match "data-lang-option=`"en`"") "language switch should include an English option"
Assert-True ($Index -match "data-i18n=`"social\.douyin`"") "Douyin/TikTok label should participate in language switching"
Assert-True ($App -match "initLanguageSwitch") "language switch should initialize from JavaScript"
Assert-True ($App -match "data-i18n") "language switch should update marked copy"
Assert-True ($App -match "languageLabels" -and $App -match "CN" -and $App -match "EN") "language switch should support both requested label styles"
Assert-True ($App -match "social\.douyin`": `"TIKTOK`"" -and $App -match "social\.douyin`": `"\\u6296\\u97f3`"") "Douyin/TikTok label should switch between English and Chinese"
Assert-True ($Css -match "\.language-switch") "language switch should have source-style fixed positioning"
Assert-True ($AllText -match "https://www\.douyin\.com/user/self\?from_tab_name=main") "nav screen should link to Douyin"
Assert-True ($AllText -match "https://www\.instagram\.com/l4rxdx/") "nav screen should link to Instagram"
Assert-True ($Css -match "\.nav-screen__social") "nav social links should have a menu footer layout"
Assert-True ($AllText -match "微信图片_20260704181629\.jpg") "avatar should be wired in"
Assert-True ($AllText -match '<link rel="icon" type="image/png" href="assets/favicon\.png">') "all pages should use the avatar favicon"
Assert-True ($AllText -match '<link rel="apple-touch-icon" href="assets/favicon\.png">') "all pages should expose the avatar touch icon"
Assert-True ($AllText -match '<link rel="manifest" href="site\.webmanifest">') "all pages should expose the web manifest"
Assert-True ($AllText -match '<meta property="og:title" content="l4rxx">') "all pages should include share preview metadata"
Assert-True ($Focus -match "rel") "focus page should support rel query navigation"
Assert-True ($App -match "new URLSearchParams\(window\.location\.search\)") "focus page should parse URL query params"

Assert-True ($App -match 'fetch\("content/photos\.json"\)') "gallery should load photos from content/photos.json"
Assert-True ($App -notmatch 'const\s+photos\s*=\s*\[') "gallery photos should not be hard-coded in app.js"

$ImageSources = @($Photos | ForEach-Object { $_.full; $_.thumb })
Assert-True ($Photos.Count -ge 20) "gallery should include at least 20 local images"
Assert-True (($Photos.full | Select-Object -Unique).Count -eq $Photos.Count) "gallery full image list should not repeat files"
Assert-True (($Photos.thumb | Select-Object -Unique).Count -eq $Photos.Count) "gallery thumbnail image list should not repeat files"

foreach ($Src in $ImageSources) {
    Assert-True ($Src.StartsWith("images/")) "$Src should come from images/"
    Assert-True (Test-Path -LiteralPath (Join-Path $Root $Src)) "$Src should exist"
}

foreach ($Photo in $Photos) {
    Assert-True ($Photo.id -gt 0) "each photo should have a positive id"
    Assert-True (-not [string]::IsNullOrWhiteSpace($Photo.title)) "each photo should have a title"
    Assert-True (-not [string]::IsNullOrWhiteSpace($Photo.category)) "each photo should have a category"
    Assert-True (-not [string]::IsNullOrWhiteSpace($Photo.alt)) "each photo should have alt text"
    Assert-True (-not [string]::IsNullOrWhiteSpace($Photo.original)) "each photo should remember its original file"
}

Assert-True (-not [string]::IsNullOrWhiteSpace($PhotoData.generatedAt)) "photos.json should include generation metadata"
Assert-True ($Photos.Count -ge 1) "photos.json should wrap photos in an items array"
Assert-True ($App -match "normalizePhoto") "app should normalize generated photo records"
Assert-True ($App -match "photo\.thumb") "app should use thumbnail images for overview and rails"
Assert-True ($App -match "photo\.full") "app should use full images for focus view"
Assert-True ($AllText -match "images/og-image\.jpg") "site should expose a share preview image"

Assert-True ($App -match "focus\.html\?rel=") "gallery items should link to focus rel pages"
Assert-True ($App -match "data-view") "work page should support grid/list state"
Assert-True ($App -match "syncFocusFromScroll") "focus page should select photos from thumbnail scroll position"
Assert-True ($App -match "scrollToFocusIndex") "focus page should scroll the thumbnail rail to the rel-selected item"
Assert-True ($App -match "requestAnimationFrame\(syncFocusFromScroll\)") "focus page should continuously animate scroll-based thumbnail selection"
Assert-True ($App -match "--focus-shift") "focus thumbnail animation should use a center-distance shift variable"
Assert-True ($App -match "focusShiftPositions\s*=\s*new Map") "focus thumbnail animation should keep source-style smoothed positions"
Assert-True ($App -match "focusFollowRate\s*=\s*0\.08") "focus thumbnail animation should use the source follow rate"
Assert-True ($App -match "currentShift\s*\+\s*\(targetShift\s*-\s*currentShift\)\s*\*\s*focusFollowRate") "focus thumbnail animation should lerp toward the source shift"
Assert-True ($App -match "maxShift\s*=\s*isMobile\s*\?\s*24\s*:\s*64") "focus thumbnail animation should use the source mobile and desktop shift ranges"
Assert-True ($App -match "focus-thumb__media") "focus thumbnails should separate media entrance from scroll transform"
Assert-True ($App -match "updateMobileFocusRail") "mobile focus page should size a page-scroll driven thumbnail rail"
Assert-True ($App -match "--first-thumb-width") "mobile focus rail should measure the first thumbnail width"
Assert-True ($App -match "--last-thumb-width") "mobile focus rail should measure the last thumbnail width"
Assert-True ($App -match "thumbs\.scrollTo") "mobile focus page should center rel thumbnails with native horizontal scrolling"
Assert-True ($App -match "handleFocusTouchMove") "mobile focus page should map horizontal swipes to thumbnail rail scrolling"
Assert-True ($App -match 'loading="eager"') "focus thumbnail images should load eagerly so mobile rel centering has measurable widths"
Assert-True ($App -match "focusSyncHoldUntil") "focus page should hold scroll-driven syncing during programmatic rel centering"
Assert-True ($App -match "isMobileFocusRailReady") "focus page should wait for measurable mobile thumbnail rail before overriding rel"
Assert-True ($App -match "if \(!syncPaused && activeIndex !== Number\(shell\.dataset\.activeIndex \|\| 0\)\)") "focus page should not replace the URL rel while the mobile rail is still settling"
Assert-True ($Css -match "\.focus-thumb\.is-active") "focus active thumbnail should have a distinct animation state"
Assert-True ($Css -match "translateY\(calc\(var\(--focus-shift,\s*0px\)\s*\*\s*-1\)\)") "mobile focus thumbnails should use the source-style upward transform"
Assert-True ($Css -match "\.focus-thumb__media[\s\S]*transform:\s*translateX\(calc\(-80px\s*-\s*var\(--space-8\)\)\)") "focus media should keep the source-style collapsed entrance separately"
Assert-True ($Css -match "\.has-loaded\s+\.focus-thumb__media[\s\S]*transform:\s*none") "focus media should reveal independently from scroll parallax"
Assert-True ($Css -match "padding-top:\s*calc\(50vh") "focus thumbnail rail should be center-padded like the source rel page"
Assert-True ($Css -match "--mobile-thumb-height") "mobile focus thumbnails should use a fixed strip height"
Assert-True ($Css -match "--mobile-thumb-lift") "mobile focus rail should reserve space for source-style upward thumbnail movement"
Assert-True ($Css -match "--mobile-rail-bottom") "mobile focus rail should sit in a stable bottom lane"
Assert-True ($Css -match "--mobile-focus-bottom-clearance") "mobile focus image should reserve space for the thumbnail rail"
Assert-True ($Css -match "height:\s*calc\(var\(--mobile-thumb-height\)\s*\+\s*var\(--mobile-thumb-lift\)\)") "mobile focus rail should have an explicit strip height with lift clearance"
Assert-True ($Css -match "padding-top:\s*var\(--mobile-thumb-lift\)") "mobile focus rail should pad for upward source-style thumbnail motion"
Assert-True ($Css -match "padding-bottom:\s*0") "mobile focus rail should reset desktop center padding"
Assert-True ($Css -match "bottom:\s*var\(--mobile-rail-bottom\)") "mobile focus rail should use the reserved bottom lane"
Assert-True ($Css -match "overflow-x:\s*auto") "mobile focus rail should scroll natively instead of covering the page"
Assert-True ($Css -match "\.focus-actions[\s\S]*z-index:\s*1100") "mobile focus actions should stay above the thumbnail rail"
Assert-True ($Css -match "max-width:\s*none") "mobile thumbnail images should not be constrained by the button width"
Assert-True ($App -match "thumbs\.scrollLeft\s*=\s*0") "mobile focus index should reset the bottom rail scroll offset when opening"
Assert-True ($Css -match "\.focus-shell\.is-index\s+\.focus-rail[\s\S]*height:\s*auto[\s\S]*display:\s*flex[\s\S]*flex-wrap:\s*wrap[\s\S]*overflow-y:\s*auto") "mobile focus index should become a full wrap grid instead of the bottom rail"
Assert-True ($Css -match "\.focus-shell\.is-index\s+\.focus-thumb[\s\S]*height:\s*var\(--space-20\)") "mobile focus index thumbnails should use source-style taller thumb height"
Assert-True ($App -match "initializeOverviewItems") "home page should initialize source-style overview opening animation"
Assert-True ($App -match "--translate-x") "home opening animation should compute horizontal center offsets"
Assert-True ($App -match "--translate-y") "home opening animation should compute vertical center offsets"
Assert-True ($App -match "is-visible") "home overview should mark first-screen items as visible for source-style staging"
Assert-True ($Index -match "js-infinity-scroll") "home page should use the source-style infinite overview container marker"
Assert-True ($App -match "let\s+overviewScrollHandler") "home infinite scroll should keep a reusable scroll handler like the source"
Assert-True ($App -match 'removeEventListener\("scroll",\s*overviewScrollHandler') "home infinite scroll should unbind the previous handler before reinitializing"
Assert-True ($App -match 'grid\.offsetTop\s*\+\s*grid\.scrollHeight\s*-\s*\(scrollTop\s*\+\s*window\.innerHeight\)\s*<=\s*500') "home infinite scroll should append when the grid is within 500px of the viewport bottom"
Assert-True ($App -match 'cloneNode\(true\)') "home infinite scroll should clone original items like the source"
Assert-True ($App -match 'appendChild\(clone\)') "home infinite scroll should append clones to continue the page"
Assert-True ($AllText -match "has-finished") "home title reveal should wait for the finished loading state"
Assert-True ($AllText -match "grid-template-columns:\s*repeat\(5,\s*1fr\)") "home overview should use the source-style five-column grid"
Assert-True ($AllText -match "body\.has-finished\s+\.c-element-overviewgrid\s+\.overview-item\.is-visible\s+\.fs-media") "home photos should animate from centered opening state to their grid cells"

Write-Host "site-check passed"
