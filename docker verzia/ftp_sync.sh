#!/bin/bash
# ============================================================
#  ftp_sync.sh — záloha na SMB + upload na FTP
#  Spúšťa sa z Mac Studia
# ============================================================

# --- FTP ---
FTP_HOST="ftp.marekf.sk"
FTP_USER="bo025400"
FTP_PASS="Repackage-Anger-Spud4v"
FTP_REMOTE="/www_root"

# --- Zdrojový server (SSH do Docker hostu) ---
DOCKER_HOST="192.168.1.76"
DOCKER_USER="oco"                          # ← uprav ak treba
SOURCE_BASE="/containers/portfolio/www"

# --- SMB záloha ---
SMB_SERVER="mini-server.local"
SMB_USER="oco"
SMB_SHARE="miniserver-media"
SMB_MOUNT="/Volumes/miniserver-media"
SMB_BACKUP_DIR="${SMB_MOUNT}/backup"
MAX_BACKUPS=3

DIRS=("albums" "full_galleries" "images")

# Farby
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

log()  { echo -e "${YELLOW}$1${NC}"; }
ok()   { echo -e "${GREEN}✓ $1${NC}"; }
err()  { echo -e "${RED}✗ $1${NC}"; }
info() { echo -e "${BLUE}  $1${NC}"; }

echo -e "${YELLOW}=== Portfolio Sync — $(date '+%Y-%m-%d %H:%M:%S') ===${NC}\n"

# ============================================================
# 1. Pripoj SMB ak nie je pripojené
# ============================================================
log "► Kontrola SMB mountu..."

if ! mount | grep -q "${SMB_MOUNT}"; then
    info "Pripájam smb://${SMB_USER}@${SMB_SERVER}/${SMB_SHARE}..."
    mkdir -p "${SMB_MOUNT}"
    mount_smbfs "smb://${SMB_USER}@${SMB_SERVER}/${SMB_SHARE}" "${SMB_MOUNT}"
    if [ $? -ne 0 ]; then
        err "Nepodarilo sa pripojiť SMB zdieľanie. Skontroluj heslo / dostupnosť servera."
        exit 1
    fi
fi
ok "SMB pripojené: ${SMB_MOUNT}"

# ============================================================
# 2. Rotácia záloh (backup_1 = najnovší, backup_3 = najstarší)
# ============================================================
log "\n► Rotácia záloh..."

mkdir -p "${SMB_BACKUP_DIR}"

# Zmaž najstaršiu zálohu
if [ -d "${SMB_BACKUP_DIR}/backup_${MAX_BACKUPS}" ]; then
    info "Mažem backup_${MAX_BACKUPS}..."
    rm -rf "${SMB_BACKUP_DIR}/backup_${MAX_BACKUPS}"
fi

# Posuň staršie zálohy o 1
for (( i=MAX_BACKUPS-1; i>=1; i-- )); do
    if [ -d "${SMB_BACKUP_DIR}/backup_${i}" ]; then
        next=$((i+1))
        info "Posúvam backup_${i} → backup_${next}..."
        mv "${SMB_BACKUP_DIR}/backup_${i}" "${SMB_BACKUP_DIR}/backup_${next}"
    fi
done

# Vytvor novú backup_1 zo zdrojového servera cez rsync
log "\n► Zálohujem z ${DOCKER_HOST} do backup_1..."
mkdir -p "${SMB_BACKUP_DIR}/backup_1"

for DIR in "${DIRS[@]}"; do
    info "  Zálohujem: ${DIR}..."
    rsync -avz --delete \
        "${DOCKER_USER}@${DOCKER_HOST}:${SOURCE_BASE}/${DIR}/" \
        "${SMB_BACKUP_DIR}/backup_1/${DIR}/"

    if [ $? -eq 0 ]; then
        ok "${DIR} zálohovaný"
    else
        err "${DIR} — záloha zlyhala"
        echo -e "${RED}Upload sa NESPUSTÍ kým záloha nie je OK.${NC}"
        exit 2
    fi
done

# Ulož timestamp zálohy
date '+%Y-%m-%d %H:%M:%S' > "${SMB_BACKUP_DIR}/backup_1/backup.timestamp"
ok "Záloha dokončená → ${SMB_BACKUP_DIR}/backup_1/"

# ============================================================
# 3. Upload na FTP (zo zálohy, nie priamo zo servera)
# ============================================================
log "\n► Upload na FTP ${FTP_HOST}..."

if ! command -v lftp &> /dev/null; then
    err "lftp nie je nainštalovaný."
    echo "Inštalácia: brew install lftp"
    exit 1
fi

for DIR in "${DIRS[@]}"; do
    info "Nahrávam: ${DIR} → ${FTP_REMOTE}/${DIR}..."

    lftp -u "${FTP_USER}","${FTP_PASS}" "${FTP_HOST}" <<EOF
set ftp:ssl-allow yes
set ftp:ssl-force yes
set ssl:verify-certificate no
set ftp:passive-mode yes
set net:timeout 30
set net:max-retries 3
set net:reconnect-interval-base 5
mirror --verbose --reverse --delete --no-perms \
    "${SMB_BACKUP_DIR}/backup_1/${DIR}" "${FTP_REMOTE}/${DIR}"
bye
EOF

    if [ $? -eq 0 ]; then
        ok "${DIR} — upload OK"
    else
        err "${DIR} — upload CHYBA"
    fi
done

# ============================================================
# 4. Odpoj SMB (zakomentuj ak nechceš automatické odpojenie)
# ============================================================
# diskutil unmount "${SMB_MOUNT}"

echo -e "\n${GREEN}=== Hotovo: $(date '+%Y-%m-%d %H:%M:%S') ===${NC}"
echo -e "${BLUE}Zálohy na SMB:${NC}"
for (( i=1; i<=MAX_BACKUPS; i++ )); do
    if [ -f "${SMB_BACKUP_DIR}/backup_${i}/backup.timestamp" ]; then
        ts=$(cat "${SMB_BACKUP_DIR}/backup_${i}/backup.timestamp")
        echo -e "  backup_${i}: ${ts}"
    elif [ -d "${SMB_BACKUP_DIR}/backup_${i}" ]; then
        echo -e "  backup_${i}: (bez timestampu)"
    fi
done
