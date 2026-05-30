#!/usr/bin/env python3
"""
Fáza 1: Lokálna príprava albumov (náhrada za zsh sekciu 1)
Spustenie: python3 process_albums_local.py [--staging-dir ./staging_albums]
"""

import argparse
import random
import re
import shutil
import subprocess
import unicodedata
from pathlib import Path
from typing import Optional, Tuple

# --- KONFIGURÁCIA ---
SOURCE_DIR = Path("/Volumes/ExtHDD/oco-ex/DgF/Photos/Export")
DEFAULT_STAGING = Path("./staging_albums")
DOMAIN_URL = "https://www.marekf.sk/full_galleries"

DATE_PREFIX = re.compile(r"^\d{4}-\d{2}-\d{2}_")
TRAILING_NUM = re.compile(r"[\s_-]*\d{3}$")

SK_EN = [
    ("Iuventa Michalovce", "Iuventa Michalovce (SVK)"),
    ("HK Košice",          "HK Kosice"),
    ("Young Angels Košice","Young Angels Kosice"),
    ("Zápas",  "Match"),
    ("proti",  "vs"),
    ("juniori","juniors"),
    ("muži",   "men"),
    ("ženy",   "women"),
    ("hádzaná","handball"),
    ("futbal", "football"),
    ("basketbal","basketball"),
]


def to_ascii(text: str, is_filename: bool = False) -> str:
    """Odstráni diakritiku a nepovolené znaky → bezpečný názov.
    is_filename=True zachová bodku (prípona súboru)."""
    normalized = unicodedata.normalize("NFKD", text)
    ascii_text = normalized.encode("ascii", "ignore").decode("ascii")
    pattern = r"[^a-zA-Z0-9_.-]" if is_filename else r"[^a-zA-Z0-9_-]"
    return re.sub(pattern, "_", ascii_text)


def translate_to_en(name: str) -> str:
    result = name
    for sk, en in SK_EN:
        result = result.replace(sk, en)
    return result


def get_image_dimensions(path: Path) -> Optional[Tuple[int, int]]:
    """Vráti (width, height) pomocou sips, alebo None pri chybe."""
    try:
        out = subprocess.check_output(
            ["sips", "-g", "pixelWidth", "-g", "pixelHeight", str(path)],
            stderr=subprocess.DEVNULL,
            text=True,
        )
        dims = re.findall(r"pixel(?:Width|Height):\s*(\d+)", out)
        if len(dims) == 2:
            return int(dims[0]), int(dims[1])
    except subprocess.CalledProcessError:
        pass
    return None


def resize_image(path: Path, max_side: int = 2000) -> None:
    """Zmenší obrázok na max_side px (zachová pomer strán)."""
    subprocess.run(
        ["sips", "--resampleHeightWidthMax", str(max_side), str(path)],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )


def collect_albums(source: Path) -> dict[str, list[Path]]:
    """Zoskupí JPG súbory podľa názvu albumu (bez poradového čísla)."""
    groups: dict[str, list[Path]] = {}
    for f in sorted(source.iterdir()):
        if f.suffix.lower() != ".jpg":
            continue
        if not DATE_PREFIX.match(f.name):
            continue
        stem = f.stem                          # napr. "2024-05-10_Zapas - 049"
        folder_name = TRAILING_NUM.sub("", stem)  # → "2024-05-10_Zapas"
        groups.setdefault(folder_name, []).append(f)
    return groups


def process_album(
    folder_name: str,
    files: list[Path],
    staging: Path,
) -> None:
    # --- Názvy ---
    pretty_name    = DATE_PREFIX.sub("", folder_name)   # bez dátumového prefixu
    pretty_name_en = translate_to_en(pretty_name)
    safe_folder    = to_ascii(folder_name)

    print(f"✅  Spracovávam: {pretty_name}")

    # --- Cesty ---
    target_path = staging / safe_folder
    full_path   = target_path / "all_photos"
    full_path.mkdir(parents=True, exist_ok=True)

    # --- A. Resize všetkých fotiek ---
    landscape: list[Path] = []
    for src in files:
        safe_name = to_ascii(src.name, is_filename=True)
        dest      = full_path / safe_name
        shutil.copy2(src, dest)
        resize_image(dest)

        dims = get_image_dimensions(dest)
        if dims and dims[0] > dims[1]:       # šírka > výška → landscape
            landscape.append(dest)

    # --- B. Náhľady (max 10 náhodných landscape fotiek) ---
    if landscape:
        selected = random.sample(landscape, min(10, len(landscape)))
        for i, img in enumerate(selected):
            if i == 0:
                shutil.copy2(img, target_path / "thumb.jpg")
            else:
                shutil.copy2(img, target_path / f"{safe_folder}_{i:02d}.jpg")
    else:
        print(f"   ⚠️  Žiadne landscape fotky v albume: {pretty_name}")

    # --- C. Metadáta ---
    (target_path / "link.txt"  ).write_text(f"{DOMAIN_URL}/index.php?g={safe_folder}\n")
    (target_path / "cat.txt"   ).write_text(pretty_name    + "\n")
    (target_path / "cat_en.txt").write_text(pretty_name_en + "\n")


def main() -> None:
    parser = argparse.ArgumentParser(description="Lokálna príprava albumov")
    parser.add_argument("--staging-dir", type=Path, default=DEFAULT_STAGING)
    parser.add_argument("--source-dir",  type=Path, default=SOURCE_DIR)
    args = parser.parse_args()

    source  : Path = args.source_dir
    staging : Path = args.staging_dir

    if not source.is_dir():
        raise SystemExit(f"❌  Zdrojový adresár neexistuje: {source}")

    # Vyčistenie stagingu
    if staging.exists():
        shutil.rmtree(staging)
    staging.mkdir(parents=True)

    print("--- Fáza 1: Lokálna príprava (Python) ---")

    albums = collect_albums(source)
    if not albums:
        raise SystemExit("❌  Žiadne albumy nenájdené v zdrojovom adresári.")

    for folder_name, files in sorted(albums.items()):
        process_album(folder_name, files, staging)

    print(f"\n✅  Hotovo — staging: {staging.resolve()}")


if __name__ == "__main__":
    main()