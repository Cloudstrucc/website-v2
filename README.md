# Static Website Deployment Guide for Cloudstrucc

A comprehensive guide for deploying the **Cloudstrucc** static HTML/CSS/JS website on Ubuntu using Nginx, SSL, and GitHub Actions.

---

## 🌐 Domain & Server Setup

* **Domain Name**: `cloudstrucc.com` (also supports `www.cloudstrucc.com`)
* **Public IP Address**: `209.x.x.x`
* **DNS Provider**: Namecheap

### ✅ DNS Records (set in Namecheap)

| Type | Host | Value    | TTL  |
| ---- | ---- | -------- | ---- |
| A    | @    | 2x.x.x.x | Auto |
| A    | www  | 2x.x.x.x | Auto |

Wait 10–30 minutes after saving for propagation.

---

## ☁️ Server Requirements

* Ubuntu Server 22.04 LTS+
* SSH access as root or sudo user
* `fredp613` (non-root user with sudo access)

---

## 🔧 System Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install web stack
sudo apt install nginx certbot python3-certbot-nginx ufw fail2ban git -y
```

---

## 🧑‍💻 Create & Secure Deployment User

```bash
# Create user and set password interactively
sudo adduser fredp613
sudo usermod -aG sudo fredp613

# Copy SSH access from root
sudo mkdir -p /home/fredp613/.ssh
sudo cp /root/.ssh/authorized_keys /home/fredp613/.ssh/
sudo chown -R fredp613:fredp613 /home/fredp613/.ssh
sudo chmod 700 /home/fredp613/.ssh
sudo chmod 600 /home/fredp613/.ssh/authorized_keys
```

---

## 🔒 Secure SSH

```bash
sudo nano /etc/ssh/sshd_config
```

Change or add:

```conf
PermitRootLogin no
PasswordAuthentication no
```

Then:

```bash
sudo systemctl restart ssh
```

---

## 🔥 Firewall Configuration

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
```

---

## 📁 Website Deployment

```bash
# Clone the repo to NGINX web root
sudo git clone https://github.com/Cloudstrucc/website-v2.git /var/www/cloudstrucc
sudo chown -R www-data:www-data /var/www/cloudstrucc
sudo chmod -R 755 /var/www/cloudstrucc
```

---

## ⚙️ NGINX Configuration

```bash
sudo nano /etc/nginx/sites-available/cloudstrucc
```

Paste:

```nginx
server {
    listen 80;
    server_name cloudstrucc.com www.cloudstrucc.com;

    root /var/www/cloudstrucc;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    access_log /var/log/nginx/cloudstrucc.access.log;
    error_log /var/log/nginx/cloudstrucc.error.log;
}
```

Enable and reload:

```bash
sudo ln -s /etc/nginx/sites-available/cloudstrucc /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

---

## 🔐 Enable HTTPS with Certbot

```bash
sudo certbot --nginx -d cloudstrucc.com -d www.cloudstrucc.com
```

Choose to redirect all traffic to HTTPS. Then:

```bash
sudo certbot renew --dry-run
```

---

## 🛡️ Fail2ban Setup

```bash
sudo nano /etc/fail2ban/jail.local
```

Paste:

```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5
banaction = ufw

[sshd]
enabled = true
port = ssh
logpath = /var/log/auth.log
bantime = 43200

[nginx-http-auth]
enabled = true
logpath = /var/log/nginx/error.log

[nginx-botsearch]
enabled = true
logpath = /var/log/nginx/access.log
maxretry = 2
findtime = 300
bantime = 86400
```

Restart fail2ban:

```bash
sudo systemctl restart fail2ban
```

---

## 🚀 GitHub Actions Deployment (Optional)

* Add SSH deploy key to your GitHub repo
* Store secrets in GitHub Actions:

  * `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_KEY`, `DEPLOY_PATH`
* Use `scp-action` and `ssh-action` to push updates to `/var/www/cloudstrucc`

---

## ✅ Test Everything

```bash
# Check HTTP headers
curl -I https://cloudstrucc.com

# Check logs
sudo tail -f /var/log/nginx/error.log
sudo fail2ban-client status
```

---

## 📌 Notes

* Primary user: `fredp613`
* Deployment path: `/var/www/cloudstrucc`
* DNS must point to: `209.x.x.x`
* Certbot must only be run after NGINX is properly configured for HTTP

---

## 📚 Resources

* [Let’s Encrypt](https://letsencrypt.org/docs/)
* [NGINX Docs](https://nginx.org/en/docs/)
* [UFW Guide](https://help.ubuntu.com/community/UFW)
* [Fail2ban Wiki](https://www.fail2ban.org/wiki/)
