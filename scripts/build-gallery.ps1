param(
    [string]$Root = (Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)),
    [int]$WebMax = 1920,
    [int]$MediumMax = 1280,
    [int]$ThumbMax = 480,
    [int]$JpegQuality = 82,
    [switch]$Force
)

$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$ImageExtensions = @(".jpg", ".jpeg", ".png", ".bmp")
$ExcludedOriginals = @("DSC00081.jpg", "zz-douyin-follow-meme.jpg")
$OriginalsDir = Join-Path $Root "images\originals"
$WebDir = Join-Path $Root "images\web"
$MediumDir = Join-Path $Root "images\medium"
$ThumbDir = Join-Path $Root "images\thumbs"
$ContentDir = Join-Path $Root "content"
$PhotosPath = Join-Path $ContentDir "photos.json"
$OgPath = Join-Path $Root "images\og-image.jpg"

foreach ($Dir in @($OriginalsDir, $WebDir, $MediumDir, $ThumbDir, $ContentDir)) {
    New-Item -ItemType Directory -Force -Path $Dir | Out-Null
}

$SeedPhotos = @(    @{ original = "DSC00049.jpg"; title = "FIELD 02"; category = "OPEN AIR"; caption = "Distance, weather, and a low horizon."; noteCn = "当时是我人生第一次拿起相机在街道拍照。"; noteEn = "That was the first time in my life I picked up a camera to photograph the streets."; locationCn = "清远 中山公园"; locationEn = "Qingyuan Zhongshan Park" },
    @{ original = "Desktop Screenshot 2026.01.04 - 23.3.23.04-2.jpg"; title = "SCREEN 03"; category = "SCREEN"; caption = "A captured screen becomes part of the image rhythm." },
    @{ original = "DSC03004.jpg"; title = "FIELD 04"; category = "STILL"; caption = "Muted light with a photographic pause."; noteCn = "爬太快，挨了两个小时冻看日出。"; noteEn = "I climbed too fast and ended up freezing for two hours while waiting for the sunrise."; locationCn = "萍乡 武功山"; locationEn = "Pingxiang Wugong Mountain" },
    @{ original = "DSC02865.jpg"; title = "FIELD 05"; category = "STILL"; caption = "Large negative space and a held center." },
    @{ original = "DSC02785.jpg"; title = "FIELD 06"; category = "STILL"; caption = "A dense frame for the index wall."; noteCn = "shing02开的luv（sic）live，那晚蹦的我结束都不会走路了。"; noteEn = "Shing02's Luv(sic) Live. I jumped so much that night I could barely walk by the end."; locationCn = "广州 声音共和livehouse"; locationEn = "Guangzhou Sound Republic Livehouse" },
    @{ original = "R0010684.jpg"; title = "TRACE 07"; category = "WALK"; caption = "A walking note from the local roll." },
    @{ original = "DSC02468.jpg"; title = "TRACE 08"; category = "WALK"; caption = "The image sits like a found page."; noteCn = "无课、旁晚、下雨"; noteEn = "No classes, evening, rain."; locationCn = "清远 学校宿舍"; locationEn = "Qingyuan School Dormitory" },
    @{ original = "R0010682.jpg"; title = "TRACE 09"; category = "WALK"; caption = "A low contrast moment with soft edges." },
    @{ original = "DSC01843.jpg"; title = "TRACE 10"; category = "PORTRAIT"; caption = "Human scale against a plain field."; noteCn = "窗外有些许蝉叫声，好平静。"; noteEn = "A few cicadas could be heard outside the window. It felt so peaceful."; locationCn = "东莞 东莞图书馆"; locationEn = "Dongguan Library" },
    @{ original = "My-YE-cover.png"; title = "COVER 11"; category = "GRAPHIC"; caption = "A cover image placed into the same visual system." },
    @{ original = "DSC00811.jpg"; title = "TRACE 12"; category = "PORTRAIT"; caption = "A vertical image for the focus viewer."; noteCn = "这树叶其实是绿色的，天空也是阴天。"; noteEn = "The leaves were actually green, and the sky was overcast too."; locationCn = "杭州 西湖"; locationEn = "Hangzhou West Lake" },
    @{ original = "image.jpg"; title = "IMAGE 13"; category = "FOUND"; caption = "A small found image in the wider sequence."; noteCn = "自从离开安徽很少看到这样天空了。"; noteEn = "Since leaving Anhui, I have rarely seen a sky like this."; locationCn = "昆明 不记得哪的地铁口"; locationEn = "Kunming An Unknown Metro Entrance" },
    @{ original = "DSC00323.jpg"; title = "TRACE 14"; category = "PORTRAIT"; caption = "A quiet pause before the next frame." },
    @{ original = "grok-image-dd0c889a-a430-408a-8e1c-e13496ad3005.jpg"; title = "SYNTH 15"; category = "GENERATED"; caption = "A synthetic image held in the same grid."; noteCn = "新婚快乐。"; noteEn = "Wishing you a happy marriage."; locationCn = "大理 洱海"; locationEn = "Dali Erhai Lake" },
    @{ original = "DSC00261.jpg"; title = "TRACE 16"; category = "PORTRAIT"; caption = "A portrait scale frame from the folder." },
    @{ original = "R0010826.jpg"; title = "ROLL 17"; category = "ROLL"; caption = "A textured image from the R roll." },
    @{ original = "R0010821.jpg"; title = "ROLL 18"; category = "ROLL"; caption = "A second roll image without repeating the file." },
    @{ original = "R0010715.jpg"; title = "ROLL 19"; category = "ROLL"; caption = "The frame is kept raw and full." },
    @{ original = "R0010914-2.jpg"; title = "ROLL 20"; category = "ROLL"; caption = "An alternate frame with its own position." },
    @{ original = "DSC02624.jpg"; title = "BLOOM 21"; category = "HAND"; caption = "A small white flower resting in the palm." },
    @{ original = "R0011370.jpg"; title = "ROLL 22"; category = "ROLL"; caption = "A large frame at the end of the wall." },
    @{ original = "R0011216.jpg"; title = "ROLL 23"; category = "ROLL"; caption = "A dense image with a generous margin." },
    @{ original = "R0011206.jpg"; title = "ROLL 24"; category = "ROLL"; caption = "The last stretch of the local sequence." },
    @{ original = "R0011157.jpg"; title = "ROLL 25"; category = "ROLL"; caption = "A final still before closing the set." },
    @{ original = "R0011079.jpg"; title = "ROLL 26"; category = "ROLL"; caption = "The final unique photo in this build." },
    @{ original = "DSC02934-2.jpg"; title = "RAIN 27"; category = "WATER"; caption = "A dark figure and umbrella held against open water."; noteCn = "记得当时是清晨，本来想起早起去看日出的，但是没太阳的日出也挺好看的。"; noteEn = "I remember it was early in the morning. I had wanted to get up early to watch the sunrise, but a sunrise without the sun was beautiful too."; locationCn = "大理 洱海"; locationEn = "Dali Erhai Lake" },
    @{ original = "DSC01690.jpg"; title = "RIDE 28"; category = "STREET"; caption = "A lifted bicycle wheel in hard afternoon light." },
    @{ original = "1.jpg"; title = "BLOOM 29"; category = "PORTRAIT"; caption = "A bright portrait framed by pink flowers." },
    @{ original = "R0011221.jpg"; title = "PARK 30"; category = "REFLECTION"; caption = "Autumn light doubles across the pond."; noteCn = "终于找到个人少的地方"; noteEn = "I finally found a spot with fewer people."; locationCn = "长沙 湖南农业大学"; locationEn = "Changsha Hunan Agricultural University" },
    @{ original = "R0011494.jpg"; title = "ROOM 31"; category = "FRIENDS"; caption = "A loose flash frame from the sofa." },
    @{ original = "DSC01040.jpg"; title = "QUEUE 32"; category = "TRANSIT"; caption = "A ferry crowd compressed beneath a curved roof." },
    @{ original = "R0011433.jpg"; title = "PARK 33"; category = "VENDOR"; caption = "Colorful kites and toys waiting in warm grass."; noteCn = "下午健完身，再去公园散了会步，好恰意。"; noteEn = "After working out that afternoon, I went for a walk in the park. It felt so relaxing."; locationCn = "东莞 中心广场公园"; locationEn = "Dongguan Central Square Park" },
    @{ original = "R0011430.jpg"; title = "TABLE 34"; category = "BOOK"; caption = "A yellow book, a bottle, and a quiet table."; noteCn = "这本找了好久，原来漫画的封面就是动漫的过场。"; noteEn = "I looked for this volume for ages. It turns out its cover is the same image used in the anime's transition."; locationCn = "东莞 东莞图书馆"; locationEn = "Dongguan Library" },
    @{ original = "DSC02184.jpg"; title = "SHADE 35"; category = "CHILD"; caption = "A small orange held at the edge of shade." },
    @{ original = "DSC00505.jpg"; title = "COURT 36"; category = "INTERIOR"; caption = "A basketball court emptied into soft glare." },
    @{ original = "DSC00618.jpg"; title = "AIRPORT 37"; category = "NIGHT"; caption = "Blue hour planes seen through terminal glass." },
    @{ original = "DSC00627.jpg"; title = "CABIN 38"; category = "FLIGHT"; caption = "An aisle view before the cabin settles." },
    @{ original = "DSC01142-2.jpg"; title = "TERMINAL 39"; category = "TRANSIT"; caption = "A black-and-white passage under a clock." },
    @{ original = "Desktop Screenshot 2025.12.07 - 15.24.09.11.jpg"; title = "CAT 40"; category = "SQUARE"; caption = "A dark cat caught beside a metal fence."; noteCn = "跟了我一路，可惜我没带吃的。"; noteEn = "It followed me the whole way. Sadly, I had no food with me."; locationCn = "杭州 西湖"; locationEn = "Hangzhou West Lake" },
    @{ original = "R0010392.JPG"; title = "BLUE 41"; category = "WRIST"; caption = "Blue fabric and beads around an open hand." },
    @{ original = "R0011072.jpg"; title = "ROLL 42"; category = "ROLL"; caption = "A later roll image for the list view." },
    @{ original = "R0011060.JPG"; title = "NIGHT 43"; category = "HILL"; caption = "A nearly black horizon with one small light."; noteCn = "有点像skeletons专辑封面。"; noteEn = "It looks a little like the cover of Skeletons."; locationCn = "清远 学校宿舍"; locationEn = "Qingyuan School Dormitory" },
    @{ original = "R0010964.jpg"; title = "PATH 44"; category = "MOUNTAIN"; caption = "A rain-covered figure climbing into fog." },
    @{ original = "R0011529.JPG"; title = "COMPANION 45"; category = "CAT"; caption = "A familiar overhead view of a cat walking beside the path."; noteCn = "之前有个人说我很喜欢拍这个视角的照片，可能是比较亲切吧。"; noteEn = "Someone once pointed out that I really like taking photos from this angle. Maybe it just feels more familiar."; locationCn = "广州 华南植物园"; locationEn = "Guangzhou South China Botanical Garden" },
    @{ original = "luvsicpt4-water.jpg"; title = "WATER 46"; category = "STILL"; caption = "A plastic cup of water held in low light."; noteCn = "一杯水。"; noteEn = "A cup of water." },
    @{ original = "1.1.2_1.1.2.jpg"; title = "CANOPY 47"; category = "PARK"; caption = "A green lawn held beneath a dark tree canopy." },
    @{ original = "R0011406.jpg"; title = "COURT 48"; category = "NIGHT"; caption = "A night basketball court seen through chain-link fencing." },
    @{ original = "winter-sweet.jpg"; title = "WINTER 49"; category = "STILL"; caption = "A hand holding a blue Winter Sweet CD against a pale wall." },
    @{ original = "makeup-flash.jpg"; title = "FLASH 50"; category = "PORTRAIT"; caption = "A high-contrast black-and-white portrait during makeup." },
    @{ original = "pastel-beach.png"; title = "BEACH 51"; category = "COAST"; caption = "A figure crosses a pastel shoreline beneath open light."; notesBackgroundColor = "#BB9FAE" },
    @{ original = "daisies-bee.png"; title = "BLOOM 52"; category = "DETAIL"; caption = "A bee pauses among white daisies in hard sunlight." },
    @{ original = "seagulls-plaza.png"; title = "FLIGHT 53"; category = "STREET"; caption = "White birds lift through bands of light and shadow." },
    @{ original = "station-crossing.png"; title = "CROSSING 54"; category = "TRANSIT"; caption = "Still feet and blurred crossings share the station floor." },
    @{ original = "park-bench-canopy.jpg"; title = "PAUSE 55"; category = "PARK"; caption = "A seated pause beneath a dense green canopy." },
    @{ original = "fallen-leaf-shadow.jpg"; title = "LEAF 56"; category = "DETAIL"; caption = "One changing leaf held between light and shadow." },
    @{ original = "sunlit-pavilion.jpg"; title = "LIGHT 57"; category = "ARCHITECTURE"; caption = "Late light reaches through the dark pavilion." },
    @{ original = "rainbow-umbrella-road.png"; title = "RAINBOW 58"; category = "STREET"; caption = "A single field of color crosses a rain-darkened road." },
    @{ original = "blue-horizon-ship.png"; title = "HORIZON 59"; category = "SEA"; caption = "A distant ship divides two quiet fields of blue." },
    @{ original = "market-basket.jpg"; title = "BASKET 60"; category = "DAILY"; caption = "A warm frame from an ordinary shopping trip." },
    @{ original = "misty-mountain-selfie.jpg"; title = "SUMMIT 61"; category = "TRAVEL"; caption = "A self-portrait held against a misty mountain path." }
)

function Convert-ToSlug {
    param([string]$Name)
    $Base = [System.IO.Path]::GetFileNameWithoutExtension($Name).ToLowerInvariant()
    $Slug = $Base -replace '[^a-z0-9]+', '-'
    $Slug = $Slug.Trim('-')
    if ([string]::IsNullOrWhiteSpace($Slug)) { return "photo" }
    return $Slug
}

function Get-Encoder {
    param([string]$MimeType)
    return [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq $MimeType } | Select-Object -First 1
}

function Save-Jpeg {
    param(
        [System.Drawing.Image]$Image,
        [string]$Path,
        [int]$Quality
    )
    $Encoder = Get-Encoder "image/jpeg"
    $Params = New-Object System.Drawing.Imaging.EncoderParameters 1
    $Params.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), ([int64]$Quality)
    try {
        $Image.Save($Path, $Encoder, $Params)
    } finally {
        $Params.Dispose()
    }
}

function Save-ResizedImage {
    param(
        [string]$Source,
        [string]$Destination,
        [int]$MaxEdge,
        [int]$Quality
    )
    if ((Test-Path -LiteralPath $Destination) -and -not $Force) { return }

    $SrcImage = [System.Drawing.Image]::FromFile($Source)
    try {
        $Scale = [Math]::Min(1.0, $MaxEdge / [double]([Math]::Max($SrcImage.Width, $SrcImage.Height)))
        $Width = [Math]::Max(1, [int][Math]::Round($SrcImage.Width * $Scale))
        $Height = [Math]::Max(1, [int][Math]::Round($SrcImage.Height * $Scale))
        $Bitmap = New-Object System.Drawing.Bitmap $Width, $Height
        try {
            $Graphics = [System.Drawing.Graphics]::FromImage($Bitmap)
            try {
                $Graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
                $Graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
                $Graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
                $Graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
                $Graphics.Clear([System.Drawing.Color]::FromArgb(245, 243, 240))
                $ImageAttributes = New-Object System.Drawing.Imaging.ImageAttributes
                try {
                    $ImageAttributes.SetWrapMode([System.Drawing.Drawing2D.WrapMode]::TileFlipXY)
                    $DestinationRect = New-Object System.Drawing.Rectangle 0, 0, $Width, $Height
                    $Graphics.DrawImage(
                        $SrcImage,
                        $DestinationRect,
                        0,
                        0,
                        $SrcImage.Width,
                        $SrcImage.Height,
                        [System.Drawing.GraphicsUnit]::Pixel,
                        $ImageAttributes
                    )
                } finally {
                    $ImageAttributes.Dispose()
                }
                Save-Jpeg -Image $Bitmap -Path $Destination -Quality $Quality
            } finally {
                $Graphics.Dispose()
            }
        } finally {
            $Bitmap.Dispose()
        }
    } finally {
        $SrcImage.Dispose()
    }
}

function Get-ImageDimensions {
    param([string]$Path)
    $Image = [System.Drawing.Image]::FromFile($Path)
    try {
        return [PSCustomObject]@{
            Width = [int]$Image.Width
            Height = [int]$Image.Height
        }
    } finally {
        $Image.Dispose()
    }
}

function Get-ImagePlaceholderColor {
    param([string]$Path)

    $Source = [System.Drawing.Image]::FromFile($Path)
    try {
        $Sample = New-Object System.Drawing.Bitmap 24, 24
        try {
            $Graphics = [System.Drawing.Graphics]::FromImage($Sample)
            try {
                $Graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBilinear
                $Graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
                $Graphics.DrawImage($Source, 0, 0, $Sample.Width, $Sample.Height)
            } finally {
                $Graphics.Dispose()
            }

            $Buckets = @{}
            for ($Y = 0; $Y -lt $Sample.Height; $Y++) {
                for ($X = 0; $X -lt $Sample.Width; $X++) {
                    $Pixel = $Sample.GetPixel($X, $Y)
                    if ($Pixel.A -lt 32) { continue }
                    $BucketKey = (($Pixel.R -shr 5) -shl 6) -bor (($Pixel.G -shr 5) -shl 3) -bor ($Pixel.B -shr 5)
                    if (-not $Buckets.ContainsKey($BucketKey)) {
                        $Buckets[$BucketKey] = @{
                            Weight = [long]0
                            Red = [long]0
                            Green = [long]0
                            Blue = [long]0
                        }
                    }
                    $Bucket = $Buckets[$BucketKey]
                    $Bucket.Weight += $Pixel.A
                    $Bucket.Red += $Pixel.R * $Pixel.A
                    $Bucket.Green += $Pixel.G * $Pixel.A
                    $Bucket.Blue += $Pixel.B * $Pixel.A
                }
            }

            $Dominant = $Buckets.Values | Sort-Object Weight -Descending | Select-Object -First 1
            if (-not $Dominant -or $Dominant.Weight -le 0) { return "#D8D6D1" }
            $AverageRed = [int][Math]::Round($Dominant.Red / [double]$Dominant.Weight)
            $AverageGreen = [int][Math]::Round($Dominant.Green / [double]$Dominant.Weight)
            $AverageBlue = [int][Math]::Round($Dominant.Blue / [double]$Dominant.Weight)
            return "#{0:X2}{1:X2}{2:X2}" -f $AverageRed, $AverageGreen, $AverageBlue
        } finally {
            $Sample.Dispose()
        }
    } finally {
        $Source.Dispose()
    }
}

function Copy-RootImagesToOriginals {
    $RootImages = Get-ChildItem -LiteralPath (Join-Path $Root "images") -File |
        Where-Object { $ImageExtensions -contains $_.Extension.ToLowerInvariant() -and $_.Name -ne "og-image.jpg" -and $ExcludedOriginals -notcontains $_.Name }

    foreach ($Image in $RootImages) {
        $Target = Join-Path $OriginalsDir $Image.Name
        if (-not (Test-Path -LiteralPath $Target)) {
            Copy-Item -LiteralPath $Image.FullName -Destination $Target
        }
    }
}

function Read-ExistingPhotoMap {
    $Map = @{}
    if (-not (Test-Path -LiteralPath $PhotosPath)) { return $Map }
    try {
        $ExistingJson = [System.IO.File]::ReadAllText($PhotosPath, [System.Text.Encoding]::UTF8)
        $Existing = $ExistingJson | ConvertFrom-Json
        foreach ($Photo in @($Existing.items)) {
            if ($Photo.original) {
                $OriginalName = [System.IO.Path]::GetFileName($Photo.original)
                if (-not [string]::IsNullOrWhiteSpace($OriginalName)) { $Map[$OriginalName] = $Photo }
            }
        }
    } catch {
        return $Map
    }
    return $Map
}

Copy-RootImagesToOriginals

$ExistingByOriginal = Read-ExistingPhotoMap
$OriginalFiles = Get-ChildItem -LiteralPath $OriginalsDir -File |
    Where-Object { $ImageExtensions -contains $_.Extension.ToLowerInvariant() -and $ExcludedOriginals -notcontains $_.Name }

$SeedOrder = @{}
for ($Index = 0; $Index -lt $SeedPhotos.Count; $Index++) {
    $SeedOrder[$SeedPhotos[$Index].original] = $Index
}

$OrderedFiles = @(
    $OriginalFiles | Sort-Object `
        @{ Expression = { if ($SeedOrder.ContainsKey($_.Name)) { $SeedOrder[$_.Name] } else { 100000 } } }, `
        @{ Expression = { $_.Name } }
)

$Items = New-Object System.Collections.Generic.List[object]
$Id = 1
foreach ($File in $OrderedFiles) {
    $Seed = $SeedPhotos | Where-Object { $_.original -eq $File.Name } | Select-Object -First 1
    $Existing = $ExistingByOriginal[$File.Name]
    $Slug = "{0:D3}-{1}" -f $Id, (Convert-ToSlug $File.Name)
    $WebRelative = if ($Existing -and $Existing.full) { $Existing.full } else { "images/web/$Slug.jpg" }
    $MediumRelative = if ($Existing -and $Existing.medium) { $Existing.medium } else { "images/medium/$([System.IO.Path]::GetFileName($WebRelative))" }
    $ThumbRelative = if ($Existing -and $Existing.thumb) { $Existing.thumb } else { "images/thumbs/$Slug.jpg" }
    $WebPath = Join-Path $Root $WebRelative
    $MediumPath = Join-Path $Root $MediumRelative
    $ThumbPath = Join-Path $Root $ThumbRelative

    Save-ResizedImage -Source $File.FullName -Destination $WebPath -MaxEdge $WebMax -Quality $JpegQuality
    Save-ResizedImage -Source $File.FullName -Destination $MediumPath -MaxEdge $MediumMax -Quality 80
    Save-ResizedImage -Source $File.FullName -Destination $ThumbPath -MaxEdge $ThumbMax -Quality 74
    $WebDimensions = Get-ImageDimensions -Path $WebPath
    $MediumDimensions = Get-ImageDimensions -Path $MediumPath
    $ThumbDimensions = Get-ImageDimensions -Path $ThumbPath
    $PlaceholderColor = if ($Existing -and $Existing.placeholderColor) {
        [string]$Existing.placeholderColor
    } else {
        Get-ImagePlaceholderColor -Path $ThumbPath
    }

    $Title = if ($Existing -and $Existing.title) { $Existing.title } elseif ($Seed) { $Seed.title } else { "IMAGE {0:D2}" -f $Id }
    $Category = if ($Existing -and $Existing.category) { $Existing.category } elseif ($Seed) { $Seed.category } else { "NEW" }
    $Caption = if ($Existing -and $Existing.caption) { $Existing.caption } elseif ($Seed) { $Seed.caption } else { "A new frame from the local archive." }
    $Alt = if ($Existing -and $Existing.alt) { $Existing.alt } else { "l4rxx photo {0:D2} - $Title" -f $Id }
    $Date = if ($Existing -and $Existing.date) { $Existing.date } else { $File.LastWriteTime.ToString("yyyy-MM-dd") }
    $Note = if ($Existing -and $Existing.note) { $Existing.note } elseif ($Seed -and $Seed.noteCn) { $Seed.noteCn } else { "这地方本来是给每个照片写点随记的，但是叉滴叉有点懒没写几个" }
    $NoteCn = if ($Existing -and $Existing.noteCn) { $Existing.noteCn } elseif ($Seed -and $Seed.noteCn) { $Seed.noteCn } else { $null }
    $NoteEn = if ($Existing -and $Existing.noteEn) { $Existing.noteEn } elseif ($Seed -and $Seed.noteEn) { $Seed.noteEn } else { $null }
    $LocationCn = if ($Existing -and $Existing.locationCn) { $Existing.locationCn } elseif ($Seed -and $Seed.locationCn) { $Seed.locationCn } else { $null }
    $LocationEn = if ($Existing -and $Existing.locationEn) { $Existing.locationEn } elseif ($Seed -and $Seed.locationEn) { $Seed.locationEn } else { $null }
    $NotesBackgroundColor = if ($Existing -and $Existing.notesBackgroundColor) { $Existing.notesBackgroundColor } elseif ($Seed -and $Seed.notesBackgroundColor) { $Seed.notesBackgroundColor } else { $null }

    $Item = [ordered]@{
        id = $Id
        title = $Title
        category = $Category
        caption = $Caption
        alt = $Alt
        original = "images/originals/$($File.Name)"
        full = $WebRelative
        thumb = $ThumbRelative
        date = $Date
        note = $Note
    }
    if ($NoteCn) { $Item["noteCn"] = $NoteCn }
    if ($NoteEn) { $Item["noteEn"] = $NoteEn }
    if ($LocationCn) { $Item["locationCn"] = $LocationCn }
    if ($LocationEn) { $Item["locationEn"] = $LocationEn }
    if ($NotesBackgroundColor) { $Item["notesBackgroundColor"] = $NotesBackgroundColor }
    $Item["width"] = $WebDimensions.Width
    $Item["height"] = $WebDimensions.Height
    $Item["thumbWidth"] = $ThumbDimensions.Width
    $Item["thumbHeight"] = $ThumbDimensions.Height
    $Item["medium"] = $MediumRelative
    $Item["mediumWidth"] = $MediumDimensions.Width
    $Item["mediumHeight"] = $MediumDimensions.Height
    $Item["placeholderColor"] = $PlaceholderColor
    $Items.Add($Item)
    $Id++
}

if ($Items.Count -gt 0) {
    $FirstFullPath = Join-Path $Root $Items[0].full
    Save-ResizedImage -Source $FirstFullPath -Destination $OgPath -MaxEdge 1200 -Quality 82
}

$GeneratedAt = if ($OrderedFiles.Count -gt 0) {
    ($OrderedFiles | Sort-Object LastWriteTimeUtc -Descending | Select-Object -First 1).LastWriteTimeUtc.ToString("yyyy-MM-ddTHH:mm:ssZ")
} else {
    (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
}

$Output = [ordered]@{
    generatedAt = $GeneratedAt
    source = "scripts/build-gallery.ps1"
    webMax = $WebMax
    thumbMax = $ThumbMax
    items = $Items
    mediumMax = $MediumMax
}

$Json = ($Output | ConvertTo-Json -Depth 6).Replace('\u0027', "'")
[System.IO.File]::WriteAllText($PhotosPath, $Json + [Environment]::NewLine, [System.Text.UTF8Encoding]::new($false))

Write-Host "Generated $($Items.Count) photos in content/photos.json"
