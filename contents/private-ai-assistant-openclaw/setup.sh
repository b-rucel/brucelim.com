#!/bin/bash
set -e

# OpenClaw Bare Metal Installer
# Target OS: Ubuntu 22.04+ (DigitalOcean Droplet)
# Goal: Run OpenClaw without Docker to save memory on 1GB instances.

# --- Configuration ---
SWAP_SIZE="2G"
OPENCLAW_USER="openclaw"
OPENCLAW_HOME="/home/$OPENCLAW_USER"
REPO_URL="https://github.com/openclaw/openclaw.git"
INSTALL_DIR="$OPENCLAW_HOME/openclaw"
NODE_MAJOR=22

# --- Helper Functions ---
log() {
    echo -e "\033[1;32m[INFO]\033[0m $1"
}

error() {
    echo -e "\033[1;31m[ERROR]\033[0m $1"
    exit 1
}

# --- Root Check ---
if [[ $EUID -ne 0 ]]; then
   error "This script must be run as root"
fi

# --- 1. System Update & Dependencies ---
log "Updating system packages..."
apt update && apt upgrade -y
apt install -y curl git build-essential python3

# --- 2. Setup Swap (Critical for 1GB RAM) ---
if [ ! -f /var/swap.img ]; then
    log "Creating $SWAP_SIZE swap file..."
    fallocate -l $SWAP_SIZE /var/swap.img
    chmod 600 /var/swap.img
    mkswap /var/swap.img
    swapon /var/swap.img
    echo "/var/swap.img none swap sw 0 0" >> /etc/fstab
    log "Swap file created and enabled."
else
    log "Swap file already exists. Skipping."
fi

# --- 3. Install Node.js ---
if ! command -v node &> /dev/null; then
    log "Installing Node.js $NODE_MAJOR..."
    curl -fsSL https://deb.nodesource.com/setup_${NODE_MAJOR}.x | bash -
    apt install -y nodejs
else
    log "Node.js is already installed: $(node -v)"
fi

# Install pnpm (Required for build)
if ! command -v pnpm &> /dev/null; then
    log "Installing pnpm..."
    npm install -g pnpm
else
    log "pnpm is already installed: $(pnpm -v)"
fi

# --- 4. Create Service User ---
if ! id "$OPENCLAW_USER" &>/dev/null; then
    log "Creating service user: $OPENCLAW_USER"
    useradd -m -s /bin/bash "$OPENCLAW_USER"
else
    log "User $OPENCLAW_USER already exists. Skipping."
fi

# Admin User Setup (Interactive)
read -p "Enter username for the new admin user (e.g. bruce): " ADMIN_USER
if [[ -n "$ADMIN_USER" ]]; then
    if ! id "$ADMIN_USER" &>/dev/null; then
        log "Creating admin user: $ADMIN_USER"
        useradd -m -s /bin/bash "$ADMIN_USER"
        usermod -aG sudo "$ADMIN_USER"
        passwd "$ADMIN_USER"

        # SSH Key Copy
        log "Setting up SSH keys for $ADMIN_USER..."
        mkdir -p "/home/$ADMIN_USER/.ssh"
        if [ -f /root/.ssh/authorized_keys ]; then
            cp /root/.ssh/authorized_keys "/home/$ADMIN_USER/.ssh/"
            chmod 700 "/home/$ADMIN_USER/.ssh"
            chmod 600 "/home/$ADMIN_USER/.ssh/authorized_keys"
            chown -R "$ADMIN_USER:$ADMIN_USER" "/home/$ADMIN_USER/.ssh"
            log "SSH keys copied from root."
        else
            log "Warning: /root/.ssh/authorized_keys not found. You may need to add keys manually."
        fi
    else
        log "Admin user $ADMIN_USER already exists."
    fi
fi

# --- 5. Install OpenClaw ---
if [ ! -d "$INSTALL_DIR" ]; then
    log "Cloning OpenClaw repository..."
    sudo -u "$OPENCLAW_USER" git clone "$REPO_URL" "$INSTALL_DIR"
else
    log "OpenClaw directory already exists. Pulling latest..."
    cd "$INSTALL_DIR"
    sudo -u "$OPENCLAW_USER" git pull
fi

cd "$INSTALL_DIR"

log "Installing dependencies (pnpm install)..."
sudo -u "$OPENCLAW_USER" pnpm install

log "Building project (pnpm run build)..."
# Check if build script exists
if grep -q '"build":' package.json; then
    sudo -u "$OPENCLAW_USER" pnpm run build
else
    log "No build script found. Skipping build step."
fi

# --- 6. Configuration ---
if [ ! -f .env ]; then
    log "Setting up default .env..."
    if [ -f .env.example ]; then
        sudo -u "$OPENCLAW_USER" cp .env.example .env
        log "Copied .env.example to .env. Please edit it later."
    else
        log "No .env.example found. Creating empty .env."
        sudo -u "$OPENCLAW_USER" touch .env
    fi
fi

# --- 7. Systemd Service Setup ---
SERVICE_FILE="/etc/systemd/system/openclaw.service"

log "Creating systemd service at $SERVICE_FILE..."

# Find pnpm path
PNPM_PATH=$(which pnpm)

cat <<EOF > $SERVICE_FILE
[Unit]
Description=OpenClaw Bare Metal Service
After=network.target

[Service]
Type=simple
User=$OPENCLAW_USER
WorkingDirectory=$INSTALL_DIR
Environment=NODE_ENV=production
# Inject Memory Limit to prevent OOM
# For 16GB RAM server, we give it ~12GB heap
Environment=NODE_OPTIONS="--max-old-space-size=12288"
ExecStart=$PNPM_PATH start -- gateway
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

log "Reloading systemd..."
systemctl daemon-reload
systemctl enable openclaw

# --- 8. CLI Setup ---
log "Creating 'openclaw' CLI alias..."
cat <<EOF > /usr/local/bin/openclaw
#!/bin/bash
# Wrapper to run openclaw CLI as service user
cd $INSTALL_DIR
# Use node directly as pnpm script 'cli' does not exist
sudo -u $OPENCLAW_USER node openclaw.mjs "\$@"
EOF
chmod +x /usr/local/bin/openclaw

log "--- INSTALLATION COMPLETE ---"
log "To start the service, run: sudo systemctl start openclaw"
log "To check logs, run: sudo journalctl -u openclaw -f"
log "To use CLI, run: openclaw --help"
log "-> SCRIPT: Run 'openclaw onboard' to configure models, keys, and channels."
log "-> SCRIPT: To enable Gemini: 'openclaw plugins enable google-gemini-cli-auth'"
log "NOTE: You might need to edit $INSTALL_DIR/.env before starting."
