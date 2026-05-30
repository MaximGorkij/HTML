#!/bin/zsh

# --- POUŽITIE ---
# ./process_albums.zsh              → plný beh
# ./process_albums.zsh --local-only → len lokálne spracovanie
# ./process_albums.zsh --upload-only → len upload existujúceho stagingu

# --- PREPÍNAČE ---
MODE="full"
for arg in "$@"; do
    case "$arg" in
        --local-only)   MODE="local"  ;;
        --upload-only)  MODE="upload" ;;
        --help|-h)
            echo "Použitie: $0 [--local-only | --upload-only]"
            exit 0 ;;
        *)
            echo "❌ Neznámy prepínač: $arg  (použite --help)"
            exit 1 ;;
    esac
done

# --- KONFIGURÁCIA ---
SOURCE_DIR="/Volumes/ExtHDD/oco-ex/DgF/Photos/Export"
STAGING_DIR="./staging_albums"
REMOTE_IP="192.168.1.76"
REMOTE_USER="oco"
REMOTE_PATH="/containers/portfolio/www/albums"
REMOTE_FULL_STORAGE="/containers/portfolio/www/full_galleries"

# --- KONTROLA ---
if [[ "$MODE" != "upload" && ! -d "$SOURCE_DIR" ]]; then
    echo "❌ CHYBA: Zdrojový adresár neexistuje: $SOURCE_DIR"
    exit 1
fi
if [[ "$MODE" == "upload" && ! -d "$STAGING_DIR" ]]; then
    echo "❌ CHYBA: Staging neexistuje (spusť najprv bez --upload-only)"
    exit 1
fi

# --- FÁZA 1: Lokálna príprava (Python) ---
echo "--- 1. Fáza: Lokálna príprava (Python) ---"

if [[ "$MODE" != "upload" ]]; then
    python3 process_albums_local.py \
        --source-dir  "$SOURCE_DIR" \
        --staging-dir "$STAGING_DIR"

    if [[ $? -ne 0 ]]; then
        echo "❌ Python skript zlyhal, prerušujem."
        exit 1
    fi
fi

# --- FÁZA 2: Upload na server ---
echo "--- 2. Fáza: Odosielanie na server ($REMOTE_IP) ---"

if [[ "$MODE" == "local" ]]; then
    echo "⏭️  Preskakujem upload (--local-only). Staging: $STAGING_DIR"
else
    # Vytvorenie adresárov na serveri
    mkdir_cmds=""
    for folder in "$STAGING_DIR"/*(D/); do
        base=$(basename "$folder")
        mkdir_cmds+="mkdir -p '${REMOTE_FULL_STORAGE}/${base}' '${REMOTE_PATH}/${base}';"
    done
    ssh "$REMOTE_USER@$REMOTE_IP" "$mkdir_cmds"

    # Prenos súborov
    for folder in "$STAGING_DIR"/*(D/); do
        base=$(basename "$folder")
        echo "📤 Nahrávam: $base"
        rsync -av "$folder/all_photos/" "$REMOTE_USER@$REMOTE_IP:$REMOTE_FULL_STORAGE/$base/"
        rsync -av --exclude='all_photos' "$folder/" "$REMOTE_USER@$REMOTE_IP:$REMOTE_PATH/$base/"
    done

    # Ponechať len posledných N albumov
    KEEP=7
    echo "🧹 Kontrolujem počet albumov (limit: $KEEP)..."
    ssh "$REMOTE_USER@$REMOTE_IP" << SSHEOF
        set -e
        mapfile -t albums < <(ls -d ${REMOTE_PATH}/*/ 2>/dev/null | sort)
        total=\${#albums[@]}
        echo "  Aktuálny počet: \$total"
        if [[ \$total -gt $KEEP ]]; then
            to_delete=\$(( total - $KEEP ))
            for dir in "\${albums[@]:0:\$to_delete}"; do
                base=\$(basename "\$dir")
                echo "  🗑️  Mažem: \$base"
                rm -rf "${REMOTE_PATH}/\${base}" "${REMOTE_FULL_STORAGE}/\${base}"
            done
        else
            echo "  ✅ Počet v poriadku (\$total / $KEEP)"
        fi
SSHEOF
fi

echo "--- HOTOVO ---"
