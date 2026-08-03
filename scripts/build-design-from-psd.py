from __future__ import annotations

import argparse
import io
import json
import re
from pathlib import Path

from PIL import Image, ImageStat
from psd_tools import PSDImage


Image.MAX_IMAGE_PIXELS = None
MAX_SOURCE_EDGE = 2400


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Export the Design page layers and geometry from a PSD."
    )
    parser.add_argument("psd", type=Path, help="PSD file used as the Design source")
    parser.add_argument(
        "--root",
        type=Path,
        default=Path(__file__).resolve().parents[1],
        help="Repository root",
    )
    return parser.parse_args()


def embedded_image(layer) -> Image.Image | None:
    smart_object = getattr(layer, "smart_object", None)
    if smart_object is None:
        return None

    data = smart_object.data
    filetype = str(getattr(smart_object, "filetype", "")).lower()
    stream = io.BytesIO(data)
    if filetype in {"8bpb", "8bps", "psb", "psd"}:
        return PSDImage.open(stream).composite(force=True)
    return Image.open(stream)


def export_image(layer, layer_id: str, target: Path) -> tuple[int, int]:
    exact = layer.composite(force=True)
    image = exact
    if re.fullmatch(r"p\d+", layer_id) or layer_id == "a1":
        try:
            candidate = embedded_image(layer)
        except (ImportError, OSError, ValueError) as error:
            print(f"Using the composed {layer_id} layer: {error}")
            candidate = None
        if candidate is not None:
            candidate.load()
            target_ratio = layer.width / layer.height
            source_ratio = candidate.width / candidate.height
            if abs(target_ratio - source_ratio) <= 0.035:
                image = candidate

    image.load()
    image.thumbnail((MAX_SOURCE_EDGE, MAX_SOURCE_EDGE), Image.Resampling.LANCZOS)
    rgba = image.convert("RGBA")
    alpha_min, alpha_max = rgba.getchannel("A").getextrema()
    if alpha_min == 255 and alpha_max == 255:
        image = rgba.convert("RGB")
        image.save(target, "WEBP", quality=91, method=6)
    else:
        image = rgba
        image.save(target, "WEBP", lossless=True, quality=100, method=6)
    return image.size


def placeholder_color(image_path: Path) -> str:
    image = Image.open(image_path).convert("RGB")
    image.thumbnail((64, 64), Image.Resampling.BILINEAR)
    red, green, blue = (round(value) for value in ImageStat.Stat(image).mean[:3])
    return f"#{red:02x}{green:02x}{blue:02x}"


def layer_id_for(name: str, index: int, triangle_used: bool) -> str:
    normalized = name.strip().lower()
    if re.fullmatch(r"p\d+", normalized) or normalized == "a1":
        return normalized
    if not triangle_used:
        return "triangle"
    return f"decor-{index + 1}"


def main() -> None:
    args = parse_args()
    root = args.root.resolve()
    psd = PSDImage.open(args.psd.resolve())
    artboard = next((layer for layer in psd if layer.is_group()), None)
    if artboard is None:
        raise RuntimeError("The PSD does not contain an artboard group")

    output = root / "images" / "design" / "psd"
    output.mkdir(parents=True, exist_ok=True)
    manifest_path = root / "content" / "design.json"
    manifest_path.parent.mkdir(parents=True, exist_ok=True)
    existing = {}
    if manifest_path.exists():
        data = json.loads(manifest_path.read_text(encoding="utf-8"))
        existing = {item["id"]: item for item in data.get("layers", [])}

    layers = []
    triangle_used = False
    for index, layer in enumerate(child for child in artboard if child.visible):
        layer_id = layer_id_for(layer.name, index, triangle_used)
        triangle_used = triangle_used or layer_id == "triangle"
        target = output / f"{layer_id}.webp"
        source_width, source_height = export_image(layer, layer_id, target)
        previous = existing.get(layer_id, {})
        interactive = bool(re.fullmatch(r"p\d+", layer_id))
        record = {
            "id": layer_id,
            "src": target.relative_to(root).as_posix(),
            "x": layer.left,
            "y": layer.top,
            "width": layer.width,
            "height": layer.height,
            "sourceWidth": source_width,
            "sourceHeight": source_height,
            "z": (index + 1) * 10,
            "interactive": interactive,
        }
        if interactive:
            record.update(
                {
                    "color": previous.get("color", placeholder_color(target)),
                    "altCn": previous.get("altCn", layer_id),
                    "altEn": previous.get("altEn", layer_id),
                }
            )
        layers.append(record)
        print(f"Exported {layer_id}: {source_width}x{source_height}")

    hidden_layers = [layer.name for layer in artboard if not layer.visible]
    background_layer = next((layer.name for layer in psd if not layer.is_group()), None)
    manifest = {
        "version": "design-psd2",
        "canvas": {"width": psd.width, "height": psd.height},
        "source": {
            "artboardLayerCount": len(artboard),
            "renderedLayerCount": len(layers),
            "hiddenLayers": hidden_layers,
            "themeBackgroundLayer": background_layer,
        },
        "layers": layers,
    }
    manifest_path.write_text(
        json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(f"Updated {manifest_path}")


if __name__ == "__main__":
    main()
