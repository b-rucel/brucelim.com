#!/bin/bash
set -e

# --- Configuration ---
SWAP_SIZE="2G"
OPENCLAW_USER="openclaw"
OPENCLAW_HOME="/home/$OPENCLAW_USER"
REPO_URL="https://github.com/openclaw/openclaw.git"
INSTALL_DIR="$OPENCLAW_HOME/openclaw"

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

# --- 1. System Update ---
log "Updating system packages..."
apt update && apt upgrade -y

# --- 2. Swap File Setup ---
if [ ! -f /var/swap.img ]; then
    log "Creating $SWAP_SIZE swap file..."
    dd if=/dev/zero of=/var/swap.img bs=1024 count=$((2 * 1024 * 1024))
    mkswap /var/swap.img
    swapon /var/swap.img
    chmod 0600 /var/swap.img
    echo "/var/swap.img none swap sw 0 0" >> /etc/fstab
    log "Swap file created and enabled."
else
    log "Swap file already exists. Skipping."
fi

# --- 3. Docker Installation ---
if ! command -v docker &> /dev/null; then
    log "Installing Docker..."
    apt install -y apt-transport-https ca-certificates curl software-properties-common
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt update
    apt install -y docker-ce docker-ce-cli containerd.io
    log "Docker installed successfully."
else
    log "Docker is already installed. Skipping."
fi

# --- 4. User Creation ---
# Service User
if ! id "$OPENCLAW_USER" &>/dev/null; then
    log "Creating service user: $OPENCLAW_USER"
    useradd -m -s /bin/bash "$OPENCLAW_USER"
    usermod -aG docker "$OPENCLAW_USER"
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

# --- 5. Firewall Confirmation ---
log "--- FIREWALL CONFIGURATION ---"
log "Skipping UFW setup to avoid conflicts with Docker/Cloud Firewall."
echo -e "\033[1;33m[IMPORTANT]\033[0m Please verify your DigitalOcean Cloud Firewall allows inbound traffic on:"
echo "  - Port 22 (SSH)"
echo "  - Port 18789 (OpenClaw Gateway)"

# --- 6. OpenClaw Installation ---
log "Installing OpenClaw..."

# Clone Repo
if [ ! -d "$INSTALL_DIR" ]; then
    log "Cloning OpenClaw repository..."
    # Running as the openclaw user to ensure permissions
    sudo -u "$OPENCLAW_USER" git clone "$REPO_URL" "$INSTALL_DIR"
else
    log "OpenClaw directory already exists."
fi

# Run Docker Setup
log "Running OpenClaw Docker Setup (as $OPENCLAW_USER)..."
cd "$INSTALL_DIR"

# We execute the setup script as the openclaw user
sudo -u "$OPENCLAW_USER" ./docker-setup.sh

# --- 7. Post-Install Instructions ---
log "--- INSTALLATION COMPLETE ---"
echo ""
echo "OpenClaw has been installed to $INSTALL_DIR"
echo ""
echo "To pair your device (DM Pairing):"
echo "1. Send a DM to your bot."
echo "2. Run this command to check for requests:"
echo "   sudo -u $OPENCLAW_USER docker compose -f $INSTALL_DIR/docker-compose.yml run --rm openclaw-cli devices list"
echo "3. Approve the request:"
echo "   sudo -u $OPENCLAW_USER docker compose -f $INSTALL_DIR/docker-compose.yml run --rm openclaw-cli devices approve <REQUEST_ID>"
echo ""
