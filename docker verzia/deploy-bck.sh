#!/bin/zsh

# --- POUŽITIE ---
# ./process_albums.zsh              → plný beh (lokálne spracovanie + upload)
# ./process_albums.zsh --local-only → len lokálne spracovanie, bez uploadu
# ./process_albums.zsh --upload-only → len upload existujúceho stagingu, bez spracovania

# --- PREPÍNAČE ---
MODE="full"
for arg in "$@"; do
    case "$arg" in
        --local-only)   MODE="local"  ;;
        --upload-only)  MODE="upload" ;;
        --help|-h)
            echo "Použitie: $0 [--local-only | --upload-only]"
            echo "  (bez prepínača)  plný beh: spracovanie + upload"
            echo "  --local-only     len lokálne spracovanie do staging_albums/"
            echo "  --upload-only    len upload existujúceho staging_albums/ na server"
            exit 0
            ;;
        *)
            echo "❌ Neznámy prepínač: $arg  (použite --help)"
            exit 1
            ;;
    esac
done

# --- KONFIGURÁCIA ---
SOURCE_DIR="/Volumes/ExtHDD/oco-ex/DgF/Photos/Export"
STAGING_DIR="./staging_albums"
DOMAIN_URL="https://www.marekf.sk/full_galleries"

# Údaje k AlmaLinux serveru
REMOTE_IP="192.168.1.76"
REMOTE_USER="oco"
REMOTE_PATH="/containers/portfolio/www/albums"
REMOTE_FULL_STORAGE="/containers/portfolio/www/full_galleries"

# --- KONTROLA ZDROJA ---
if [[ "$MODE" != "upload" ]]; then
    if [[ ! -d "$SOURCE_DIR" ]]; then
        echo "❌ CHYBA: Zdrojový adresár neexistuje: $SOURCE_DIR"
        exit 1
    fi
fi

if [[ "$MODE" == "upload" ]]; then
    if [[ ! -d "$STAGING_DIR" ]]; then
        echo "❌ CHYBA: Staging adresár neexistuje: $STAGING_DIR (spusť najprv bez --upload-only)"
        exit 1
    fi
fi

echo "--- 1. Fáza: Lokálna príprava a spracovanie (Mac) ---"

if [[ "$MODE" != "upload" ]]; then

# Vyčistenie stagingu
rm -rf "$STAGING_DIR"
mkdir -p "$STAGING_DIR"

typeset -A file_groups

# 1. Zbieranie a zoskupovanie súborov podľa albumov
# FIX #1: Glob qualifier (N.) platí pre obe alternatívy — regular file + null_glob
for file in "$SOURCE_DIR"/*.(jpg|JPG)(N.); do
    filename=$(basename "$file")
    # Očakávaný formát: YYYY-MM-DD_Nazov - 001.jpg
    [[ ! "$filename" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}_ ]] && continue

    # Extrakcia názvu albumu (odreže poradové číslo na konci)
    # Podporuje formáty: "Nazov - 049", "Nazov-049", "Nazov_049"
    folder_name=$(echo "${filename%.*}" | sed 's/[[:space:]_-]*[0-9]\{3\}$//')
    file_groups[$folder_name]+="$file"$'\n'
done

# 2. Spracovanie každého albumu
for folder in ${(k)file_groups}; do
    # Vytvorenie poľa súborov a odstránenie prázdneho posledného riadku
    all_files=("${(@f)${file_groups[$folder]%?}}")
    landscape_files=()

    # NÁZVY:
    # FIX #2: Robustnejší spôsob odrezania dátumového prefixu (YYYY-MM-DD_)
    pretty_name="${folder#????-??-??_}"

    # pretty_name_en: Základný preklad kľúčových slov pre anglickú verziu
    pretty_name_en=$(echo "$pretty_name" | sed \
        -e 's/Iuventa Michalovce/Iuventa Michalovce (SVK)/g' \
        -e 's/HK Košice/HK Kosice/g' \
        -e 's/Young Angels Košice/Young Angels Kosice/g' \
        -e 's/Zápas/Match/g' \
        -e 's/proti/vs/g' \
        -e 's/juniori/juniors/g' \
        -e 's/muži/men/g' \
        -e 's/ženy/women/g' \
        -e 's/hádzaná/handball/g' \
        -e 's/futbal/football/g' \
        -e 's/basketbal/basketball/g')

    # safe_folder: ASCII názov pre priečinky (žiadna diakritika, medzery -> podčiarkovníky)
    safe_folder=$(echo "$folder" | iconv -f UTF-8 -t ascii//TRANSLIT | sed 's/[^a-zA-Z0-9_-]/_/g')

    echo "✅ Spracovávam: $pretty_name"

    # Cesty v stagingu
    target_path="$STAGING_DIR/$safe_folder"
    full_path="$target_path/all_photos"
    mkdir -p "$full_path"

    # A. Spracovanie všetkých fotiek (zmenšenie na 2000px)
    for img in "${all_files[@]}"; do
        [[ -z "$img" ]] && continue

        # Bezpečný názov súboru pre web (žiadne otázniky)
        safe_img_name=$(echo "$(basename "$img")" | iconv -f UTF-8 -t ascii//TRANSLIT | sed 's/[^a-zA-Z0-9._-]/_/g')
        dest_file="$full_path/$safe_img_name"

        cp "$img" "$dest_file"
        # Mac natívny resizer
        sips --resampleHeightWidthMax 2000 "$dest_file" &>/dev/null

        # Identifikácia landscape fotiek pre náhľady
        dim=$(sips -g pixelWidth -g pixelHeight "$dest_file" 2>/dev/null | awk '/pixel/ {print $2}')
        if [[ -n "$dim" ]]; then
            dims=("${(@f)dim}")
            [[ ${dims[1]} -gt ${dims[2]} ]] && landscape_files+=("$dest_file")
        fi
    done

    # B. Generovanie náhľadov pre web (do koreňa priečinka albumu)
    if [[ ${#landscape_files[@]} -gt 0 ]]; then
        # Náhodné premiešanie
        shuffled=$(for f in "${landscape_files[@]}"; do echo "$RANDOM###$f"; done | sort -n | sed 's/^[0-9]*###//')
        selected=("${(@f)shuffled}")

        # FIX #3: Natívna zsh syntax pre slice poľa (1-indexed)
        limit=$(( ${#landscape_files[@]} < 10 ? ${#landscape_files[@]} : 10 ))

        counter=0
        for img in "${selected[1,$limit]}"; do
            if [[ $counter -eq 0 ]]; then
                cp "$img" "$target_path/thumb.jpg"
            else
                num=$(printf "%02d" $counter)
                cp "$img" "$target_path/${safe_folder}_${num}.jpg"
            fi
            (( counter++ ))
        done
    fi

    # C. Generovanie metadát
    echo "$DOMAIN_URL/index.php?g=$safe_folder" > "$target_path/link.txt"
    echo "$pretty_name"    > "$target_path/cat.txt"
    echo "$pretty_name_en" > "$target_path/cat_en.txt"
done

fi # koniec bloku lokálneho spracovania

echo "--- 2. Fáza: Odosielanie na server ($REMOTE_IP) ---"

if [[ "$MODE" == "local" ]]; then
    echo "⏭️  Preskakujem upload (--local-only). Staging je pripravený v: $STAGING_DIR"
else

# Krok 1: Vytvorenie adresárov a nahratie nových albumov
mkdir_cmds=""
for folder in "$STAGING_DIR"/*(D/); do
    base=$(basename "$folder")
    mkdir_cmds+="mkdir -p '${REMOTE_FULL_STORAGE}/${base}' '${REMOTE_PATH}/${base}';"
done
ssh "$REMOTE_USER@$REMOTE_IP" "$mkdir_cmds"

for folder in "$STAGING_DIR"/*(D/); do
    base=$(basename "$folder")
    echo "📤 Nahrávam: $base"

    # Prenos plnej galérie
    rsync -av "$folder/all_photos/" "$REMOTE_USER@$REMOTE_IP:$REMOTE_FULL_STORAGE/$base/"

    # Prenos náhľadov a metadát (vylúčime all_photos, aby neboli dáta na serveri 2x)
    rsync -av --exclude='all_photos' "$folder/" "$REMOTE_USER@$REMOTE_IP:$REMOTE_PATH/$base/"
done

# Krok 2: Ponechať len 6 posledných albumov (zoradené podľa názvu YYYY-MM-DD_...)
KEEP=7
echo "🧹 Kontrolujem počet albumov na serveri (limit: $KEEP)..."

ssh "$REMOTE_USER@$REMOTE_IP" << SSHEOF
    set -e
    KEEP=$KEEP
    REMOTE_PATH="${REMOTE_PATH}"
    REMOTE_FULL_STORAGE="${REMOTE_FULL_STORAGE}"

    mapfile -t albums < <(ls -d \${REMOTE_PATH}/*/ 2>/dev/null | sort)
    total=\${#albums[@]}
    echo "  Aktuálny počet albumov: \$total"

    if [[ \$total -gt \$KEEP ]]; then
        to_delete=\$(( total - KEEP ))
        echo "  Mažem \$to_delete najstarší/ch album/ov..."
        for dir in "\${albums[@]:0:\$to_delete}"; do
            base=\$(basename "\$dir")
            echo "  🗑️  Mažem: \$base"
            rm -rf "\${REMOTE_PATH}/\${base}"
            rm -rf "\${REMOTE_FULL_STORAGE}/\${base}"
        done
    else
        echo "  ✅ Počet albumov v poriadku (\$total / \$KEEP)"
    fi
SSHEOF

fi # koniec bloku uploadu

echo "--- HOTOVO ---"
