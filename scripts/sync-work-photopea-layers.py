import argparse
import json
import re
import shutil
from collections import Counter
from pathlib import Path

from PIL import Image, ImageDraw
from psd_tools import PSDImage


PHOTO_PATTERN = re.compile(r"^PHOTO(?:__|[._ -])(\d{2})$", re.IGNORECASE)
PERSON_PATTERN = re.compile(r"^PERSON(?:__|[._ -])(\d{2})$", re.IGNORECASE)
PERSON_ALIASES = {"person", "\u4eba", "\u4eba\u7269"}


def is_visible(layer):
    check = getattr(layer, "is_visible", None)
    return bool(check()) if callable(check) else bool(layer.visible)


def save_webp(image, target, *, lossless=False):
    target.parent.mkdir(parents=True, exist_ok=True)
    temporary = target.with_name(f"{target.name}.tmp")
    if target.exists():
        shutil.copy2(target, Path(f"{target}.previous"))
    options = {"method": 6, "lossless": True} if lossless else {"quality": 92, "method": 6}
    image.convert("RGBA").save(temporary, "WEBP", **options)
    temporary.replace(target)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--psd", required=True)
    parser.add_argument("--exports", required=True)
    parser.add_argument("--flat-background")
    parser.add_argument("--section", required=True)
    parser.add_argument("--mode", choices=("desktop", "mobile"), required=True)
    args = parser.parse_args()

    section_id = str(int(args.section)).zfill(2)
    psd = PSDImage.open(args.psd)
    exports = Path(args.exports)
    interactive = []
    person_candidates = []

    for layer in psd.descendants():
        if not is_visible(layer) or layer.width < 1 or layer.height < 1:
            continue
        name = str(layer.name or "").strip()
        photo_match = PHOTO_PATTERN.fullmatch(name)
        person_match = PERSON_PATTERN.fullmatch(name)
        if photo_match and photo_match.group(1) == section_id:
            interactive.append((layer, f"PHOTO__{section_id}", "photo", 2))
        elif person_match and person_match.group(1) == section_id:
            interactive.append((layer, f"PERSON__{section_id}", "draggable", 20))
        elif name.casefold() in PERSON_ALIASES:
            person_candidates.append(layer)

    if not any(role == "draggable" for _, _, role, _ in interactive) and len(person_candidates) == 1:
        interactive.append((person_candidates[0], f"PERSON__{section_id}", "draggable", 20))

    if not interactive:
        raise RuntimeError(f"No interactive layers found for chapter {section_id}.")

    prefix = f"work-{section_id}-{args.mode}"
    layout_layers = []
    for layer, layer_id, role, z_index in interactive:
        image = layer.composite()
        if image is None:
            continue
        suffix = layer_id.casefold().replace("__", "-")
        target = exports / f"{prefix}-{suffix}.webp"
        save_webp(image, target)
        layout_layers.append(
            {
                "id": layer_id,
                "role": role,
                "label": "Move figure" if role == "draggable" else "Open artwork",
                "src": f"/workbench/photopea/exports/{target.name}",
                "x": int(layer.left),
                "y": int(layer.top),
                "width": int(layer.width),
                "height": int(layer.height),
                "z": z_index,
            }
        )

    background_target = exports / f"{prefix}-background.webp"
    if args.flat_background:
        background_image = Image.open(args.flat_background).convert("RGBA")
        dominant_color = Counter(
            background_image.convert("RGB").get_flattened_data()
        ).most_common(1)[0][0]
        background_draw = ImageDraw.Draw(background_image)
        for layer, _, _, _ in interactive:
            background_draw.rectangle(
                (int(layer.left), int(layer.top), int(layer.right) - 1, int(layer.bottom) - 1),
                fill=(*dominant_color, 255),
            )
        save_webp(background_image, background_target, lossless=True)
    else:
        for layer, _, _, _ in interactive:
            layer.visible = False
        save_webp(psd.composite(), background_target)

    print(
        json.dumps(
            {
                "width": int(psd.width),
                "height": int(psd.height),
                "background": {
                    "src": f"/workbench/photopea/exports/{background_target.name}"
                },
                "layers": layout_layers,
            },
            ensure_ascii=False,
        )
    )


if __name__ == "__main__":
    main()
