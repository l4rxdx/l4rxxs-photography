# l4rxx's Photography

A static photography portfolio for l4rxx, built for Cloudflare Pages.

## Local Preview

Serve the project root with any static server, then open `index.html`.

```powershell
python -m http.server 8765
```

## Add Photos

1. Put new source photos in `images/originals/`.
2. Regenerate the deploy images and gallery data:

```powershell
.\scripts\build-gallery.ps1
```

The script writes optimized images to `images/web/`, thumbnails to `images/thumbs/`, and gallery metadata to `content/photos.json`.

`images/originals/` is ignored by Git so the public repository only needs the deployment images, not the full source files.

## Check Before Uploading

```powershell
.\tests\site-check.ps1
```

## Cloudflare Pages

- Framework preset: `None`
- Build command: `npm run build`
- Output directory: `dist`
- Root directory: `/`

The repository also includes `wrangler.toml` with `pages_build_output_dir = "./dist"` so Cloudflare can read the output directory from the repo.
