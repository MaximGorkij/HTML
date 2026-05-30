#!/bin/zsh

# --- KONFIGURÁCIA ---
SOURCE_DIR="/Volumes/ExtHDD/oco-ex/DgF/Photos/Export"
STAGING_DIR="./staging_albums"
REMOTE_IP="192.168.1.76"
REMOTE_USER="oco"
REMOTE_PATH="/containers/portfolio/www/albums"

# --------------------

if [ ! -d "$SOURCE_DIR" ]; then
    echo "❌ CHYBA: Zdrojový adresár neexistuje: $SOURCE_DIR"
    exit 1
fi

echo "--- 1. Fáza: Príprava albumov na Macu ---"

rm -rf "$STAGING_DIR"
mkdir -p "$STAGING_DIR"

typeset -A file_groups

# Zbieranie súborov
for file in "$SOURCE_DIR"/*.jpg(.N); do
    filename=$(basename "$file")

    # Kontrola formátu YYYY-MM-DD_
    if [[ ! "$filename" =~ ^[0-9]{4}-[0-9]{2}-[0-9]{2}_ ]]; then
        continue
    fi

    # --- OPRAVENÁ EXTRAKCIA NÁZVU PRIEČINKA (pre formát s medzerami) ---
    # Vstup: 2026-01-14_Iuventa Michalovce - DAC Dunajská Streda - 001.jpg
    # Odstráni koncovku .jpg a následne poslednú pomlčku s číslom
    folder_name=$(echo "${filename%.*}" | sed 's/ - [0-9]\{3\}$//')

    file_groups[$folder_name]+="$file"$'\n'
done

# Spracovanie skupín
for folder in ${(k)file_groups}; do
    
    all_files=("${(@f)file_groups[$folder]}")
    landscape_files=()

    # Filter orientácie (sips)
    for img in "${all_files[@]}"; do
        dim=$(sips -g pixelWidth -g pixelHeight "$img" 2>/dev/null | awk '/pixel/ {print $2}')
        if [[ -z "$dim" ]]; then continue; fi
        
        dims=("${(@f)dim}")
        w=${dims[1]}
        h=${dims[2]}

        if [[ $w -gt $h ]]; then
            landscape_files+=("$img")
        fi
    done

    count=${#landscape_files[@]}
    if [[ $count -eq 0 ]]; then
        continue
    fi

    echo "✅ Spracovávam: $folder ($count fotiek)"

    target_path="$STAGING_DIR/$folder"
    mkdir -p "$target_path"

    # Náhodný výber 10 fotiek
    shuffled_raw=$(for f in "${landscape_files[@]}"; do echo "$RANDOM###$f"; done | sort -n | sed 's/^[0-9]*###//')
    selected_files=("${(@f)shuffled_raw}")
    selected_files=("${selected_files[@]:0:10}")

    counter=0
    for img in "${selected_files[@]}"; do
        if [[ $counter -eq 0 ]]; then
            cp "$img" "$target_path/thumb.jpg"
        else
            num=$(printf "%02d" $counter)
            # Pre webový server je lepšie nemať medzery v názvoch súborov
            safe_name=$(echo "$folder" | tr ' ' '_')
            cp "$img" "$target_path/${safe_name}_${num}.jpg"
        fi
        ((counter++))
    done
    
    echo "#" > "$target_path/link.txt"

    # cat.txt bez dátumu (odstráni prvých 11 znakov: YYYY-MM-DD_)
    category="${folder:11}"
    echo "$category" > "$target_path/cat.txt"

done

echo "--- 2. Fáza: Čistenie a odosielanie na AlmaLinux ($REMOTE_IP) ---"

# Zmazanie starých albumov pred kopírovaním
echo "🗑️ Mažem staré albumy na servery v $REMOTE_PATH..."
ssh "$REMOTE_USER@$REMOTE_IP" "rm -rf ${REMOTE_PATH:?}/*"

# Kopírovanie nových albumov
rsync -av --ignore-existing --chmod=Du=rwx,Dgo=rx,Fu=rw,Fgo=r "$STAGING_DIR/" "$REMOTE_USER@$REMOTE_IP:$REMOTE_PATH/"

echo "--- HOTOVO ---"
