#!/usr/bin/env bash
#
# deploy.sh - Deploy latest changes to the Cloudstrucc DigitalOcean droplet
#
# Usage:
#   ./deploy.sh                          # uses defaults
#   ./deploy.sh -u myuser -h 1.2.3.4    # override user/host
#   ./deploy.sh -k ~/.ssh/my_key        # specify SSH key
#
# Prerequisites:
#   - SSH key-based access to the droplet
#   - The deployment user must have sudo permissions
#   - Git repo already cloned at DEPLOY_PATH on the server
#

set -euo pipefail

# ─── Defaults (override via flags or environment variables) ───
DEPLOY_USER="${DEPLOY_USER:-fredp613}"
DEPLOY_HOST="${DEPLOY_HOST:-cloudstrucc.com}"
DEPLOY_PATH="${DEPLOY_PATH:-/var/www/cloudstrucc}"
SSH_KEY="${SSH_KEY:-}"
GIT_BRANCH="${GIT_BRANCH:-main}"

# ─── Parse flags ───
while getopts "u:h:p:k:b:" opt; do
    case $opt in
        u) DEPLOY_USER="$OPTARG" ;;
        h) DEPLOY_HOST="$OPTARG" ;;
        p) DEPLOY_PATH="$OPTARG" ;;
        k) SSH_KEY="$OPTARG" ;;
        b) GIT_BRANCH="$OPTARG" ;;
        *) echo "Usage: $0 [-u user] [-h host] [-p path] [-k ssh_key] [-b branch]" && exit 1 ;;
    esac
done

# Build SSH options
SSH_OPTS="-o StrictHostKeyChecking=accept-new"
if [[ -n "$SSH_KEY" ]]; then
    SSH_OPTS="$SSH_OPTS -i $SSH_KEY"
fi

echo "╔══════════════════════════════════════════╗"
echo "║   Cloudstrucc Website Deployment         ║"
echo "╚══════════════════════════════════════════╝"
echo ""
echo "  Target:  ${DEPLOY_USER}@${DEPLOY_HOST}"
echo "  Path:    ${DEPLOY_PATH}"
echo "  Branch:  ${GIT_BRANCH}"
echo ""

# ─── Deploy ───
echo "→ Connecting to droplet and pulling latest changes..."

ssh $SSH_OPTS "${DEPLOY_USER}@${DEPLOY_HOST}" bash -s <<EOF
    set -euo pipefail

    echo "  ✓ Connected to \$(hostname)"

    # Navigate to the web root
    cd "${DEPLOY_PATH}"

    # Fetch and pull latest changes
    echo "  → Fetching latest from origin/${GIT_BRANCH}..."
    sudo git fetch origin "${GIT_BRANCH}"
    sudo git reset --hard "origin/${GIT_BRANCH}"

    # Fix ownership so nginx can serve the files
    sudo chown -R www-data:www-data "${DEPLOY_PATH}"
    sudo chmod -R 755 "${DEPLOY_PATH}"

    # Clear any browser-cache related headers by reloading nginx
    echo "  → Reloading nginx..."
    sudo nginx -t && sudo systemctl reload nginx

    echo ""
    echo "  ✓ Deployment complete!"
    echo "  ✓ Site is live at https://cloudstrucc.com"
EOF

echo ""
echo "Done."