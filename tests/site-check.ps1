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

foreach ($File in @("index.html", "work.html", "focus.html", "assets/app.js", "assets/styles.css")) {
    Assert-True (Test-Path -LiteralPath (Join-Path $Root $File)) "$File should exist"
}

$App = Read-Text "assets/app.js"
$Css = Read-Text "assets/styles.css"
$Index = Read-Text "index.html"
$Work = Read-Text "work.html"
$Focus = Read-Text "focus.html"
$AllText = "$Index`n$Work`n$Focus`n$App`n$Css"

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
Assert-True ($Focus -match "rel") "focus page should support rel query navigation"
Assert-True ($App -match "new URLSearchParams\(window\.location\.search\)") "focus page should parse URL query params"

$Matches = [regex]::Matches($App, 'src:\s*"([^"]+)"')
$ImageSources = @($Matches | ForEach-Object { $_.Groups[1].Value })
Assert-True ($ImageSources.Count -ge 20) "gallery should include at least 20 local images"
Assert-True (($ImageSources | Select-Object -Unique).Count -eq $ImageSources.Count) "gallery image list should not repeat files"

foreach ($Src in $ImageSources) {
    Assert-True ($Src.StartsWith("images/")) "$Src should come from images/"
    Assert-True (Test-Path -LiteralPath (Join-Path $Root $Src)) "$Src should exist"
}

Assert-True ($App -match "focus\.html\?rel=") "gallery items should link to focus rel pages"
Assert-True ($App -match "index\.html\?from=rel&rel=") "focus back link should carry the active rel back to the overview"
Assert-True ($App -match "handleOverviewReturn") "home page should restore scroll position when returning from rel"
Assert-True ($App -match "is-return-target") "home page should mark the returned overview image for animation"
Assert-True ($Css -match "is-focus-leaving") "focus page should animate when leaving back to the overview"
Assert-True ($Css -match "is-returning-from-rel") "home page should animate the rel return landing state"
Assert-True ($App -match "data-view") "work page should support grid/list state"
Assert-True ($App -match "syncFocusFromScroll") "focus page should select photos from thumbnail scroll position"
Assert-True ($App -match "scrollToFocusIndex") "focus page should scroll the thumbnail rail to the rel-selected item"
Assert-True ($App -match "requestAnimationFrame\(syncFocusFromScroll\)") "focus page should continuously animate scroll-based thumbnail selection"
Assert-True ($App -match "--focus-shift") "focus thumbnail animation should use a center-distance shift variable"
Assert-True ($App -match "focusShiftPositions") "focus thumbnail shift should use frame-based interpolation like the source gallery"
Assert-True ($App -match "focusFollowRate") "focus thumbnail shift should expose a tuned follow rate"
Assert-True ($App -match "updateMobileFocusRail") "mobile focus page should size a page-scroll driven thumbnail rail"
Assert-True ($App -match "handleFocusTouchMove") "mobile focus page should map horizontal swipes to thumbnail rail scrolling"
Assert-True ($Css -match "\.focus-thumb\.is-active") "focus active thumbnail should have a distinct animation state"
Assert-True ($Css -match "padding-top:\s*calc\(50vh") "focus thumbnail rail should be center-padded like the source rel page"
Assert-True ($Css -match "--desktop-thumb-visible-max:\s*8") "desktop focus rail should cap visible thumbnails at eight"
Assert-True ($Css -match "--desktop-thumb-slot") "desktop focus thumbnails should use a viewport-derived slot height"
Assert-True ($Css -match "--mobile-rail-offset") "mobile focus rail should expose a source-style scroll offset variable"
Assert-True ($Css -match "--mobile-scroll-height") "mobile focus page should create enough vertical scroll range for the horizontal rail"
Assert-True ($App -match "initializeOverviewItems") "home page should initialize source-style overview opening animation"
Assert-True ($App -match "--translate-x") "home opening animation should compute horizontal center offsets"
Assert-True ($App -match "--translate-y") "home opening animation should compute vertical center offsets"
Assert-True ($App -match "is-visible") "home overview should mark first-screen items as visible for source-style staging"
Assert-True ($Index -match "js-infinity-scroll") "home page should use the source-style infinite overview container marker"
Assert-True ($AllText -match "has-finished") "home title reveal should wait for the finished loading state"
Assert-True ($AllText -match "grid-template-columns:\s*repeat\(5,\s*1fr\)") "home overview should use the source-style five-column grid"
Assert-True ($AllText -match "body\.has-finished\s+\.c-element-overviewgrid\s+\.overview-item\.is-visible\s+\.fs-media") "home photos should animate from centered opening state to their grid cells"

Write-Host "site-check passed"
