# Static Website Deployment Guide

A comprehensive guide for deploying a static HTML/CSS/JS website on Ubuntu using Nginx with SSL.

## Prerequisites

- Ubuntu Server 22.04 LTS or higher
- A domain or subdomain pointing to your server's IP address
- Root or sudo access to the server
- Basic knowledge of terminal/command line operations

## System Setup

1. Update your system:

```bash
sudo apt update
sudo apt upgrade -y
```

2. Install required packages:

```bash
sudo apt install nginx certbot python3-certbot-nginx -y
```

## Directory Setup

1. Create the website directory:

```bash
sudo mkdir -p /var/www/html/your-website
```

2. Set up proper ownership and permissions:

```bash
# Add your user to www-data group
sudo usermod -a -G www-data your-username

# Set ownership
sudo chown -R your-username:www-data /var/www/html/your-website

# Set directory permissions
sudo find /var/www/html/your-website -type d -exec chmod 755 {} \;

# Set file permissions
sudo find /var/www/html/your-website -type f -exec chmod 644 {} \;

# Apply group changes (or log out and back in)
newgrp www-data
```

## Website Deployment

1. Copy your website files to the server:

```bash
# If uploading locally
scp -r /path/to/your/website/* username@your-server:/var/www/html/your-website/

# Or if cloning from git
cd /var/www/html/your-website
git clone your-repository-url .
```

2. Ensure your main HTML file is named `index.html` and exists in the root directory.

## Nginx Configuration

1. Create a new Nginx server block:

```bash
sudo nano /etc/nginx/sites-available/your-website
```

2. Add the following configuration:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL configuration will be added by Certbot

    root /var/www/html/your-website;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html =404;
    
        # CORS headers if needed
        add_header 'Access-Control-Allow-Origin' '*';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
        add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Range';
    }

    # Handle static files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2|ttf)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
        try_files $uri =404;
    }

    # Handle favicon
    location = /favicon.ico {
        access_log off;
        log_not_found off;
    }
}

# HTTP redirect to HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

3. Enable the site:

```bash
sudo ln -s /etc/nginx/sites-available/your-website /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## SSL Certificate Setup

1. Obtain SSL certificate:

```bash
sudo certbot --nginx -d your-domain.com
```

2. Follow the prompts:
   - Provide your email address
   - Agree to terms of service
   - Choose whether to redirect HTTP to HTTPS (recommended)

## Securing the Infrastructure

### Firewall Setup

1. Install and configure UFW:

```bash
sudo apt install ufw fail2ban -y
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
```

### Fail2ban Configuration

1. Create enhanced fail2ban configuration:

```bash
sudo nano /etc/fail2ban/jail.local
```

2. Add the following configuration:

```ini
[DEFAULT]
# Ban hosts for one hour
bantime = 3600
# Check for patterns in last 10 minutes
findtime = 600
# Ban after 5 retries
maxretry = 5
# Use UFW for banning
banaction = ufw

# SSH protection
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3
bantime = 43200

# Nginx protection
[nginx-http-auth]
enabled = true
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 5

[nginx-botsearch]
enabled = true
port = http,https
filter = nginx-botsearch
logpath = /var/log/nginx/access.log
maxretry = 2
findtime = 300
bantime = 86400
```

### Security Monitoring

1. Create a monitoring script:

```bash
sudo nano /usr/local/bin/security_monitor.sh
```

2. Add the monitoring script content (see security_monitor.sh in the repository)

3. Make it executable and set up automated monitoring:

```bash
chmod +x /usr/local/bin/security_monitor.sh
(crontab -l 2>/dev/null; echo "0 0 * * * /usr/local/bin/security_monitor.sh daily") | crontab -
(crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/security_monitor.sh check") | crontab -
```

### Security Features Implemented

1. **UFW Firewall**:
   - Default deny incoming connections
   - Allow only necessary ports (SSH, HTTP, HTTPS)
   - Automated blocking of suspicious IPs

2. **Fail2ban Protection**:
   - SSH brute force protection
   - Web authentication protection
   - Bad bot blocking
   - Automated IP banning

3. **Security Monitoring**:
   - Daily security reports
   - Real-time attack notifications
   - Connection monitoring
   - Failed authentication tracking

## Testing

1. Test your website:

```bash
curl -I https://your-domain.com
```

2. Check Nginx logs if needed:

```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

3. Verify security setup:

```bash
sudo ufw status
sudo fail2ban-client status
```

## Maintenance

### SSL Certificate Renewal

Certificates auto-renew, but you can test the renewal process:

```bash
sudo certbot renew --dry-run
```

### Updating Website Content

1. Navigate to your website directory:

```bash
cd /var/www/html/your-website
```

2. Update files as needed, maintaining proper permissions:

```bash
sudo chown -R your-username:www-data /var/www/html/your-website
sudo find /var/www/html/your-website -type d -exec chmod 755 {} \;
sudo find /var/www/html/your-website -type f -exec chmod 644 {} \;
```
## Automated Deployments with GitHub Actions

This project uses GitHub Actions for automated deployments to your Ubuntu server. Here's how to set it up:

### Prerequisites
- A GitHub repository with your static website code
- An Ubuntu server with Nginx configured
- SSH access to your server
- GitHub repository secrets access

### Setup GitHub Actions

1. Create SSH Key for Deployment:
```bash
# On your local machine
ssh-keygen -t ed25519 -C "github-actions-deploy"
```

2. Add the public key to your server:
```bash
# Copy the content of your .pub file to your server
cat ~/.ssh/id_ed25519.pub

# On your server, add to authorized_keys
echo "your-public-key" >> ~/.ssh/authorized_keys
```

3. Add repository secrets in GitHub:
   - Go to your repository → Settings → Secrets and variables → Actions
   - Add the following secrets:
   ```
   DEPLOY_HOST: Your server IP or domain
   DEPLOY_USER: Your server username (e.g., fredp613)
   DEPLOY_KEY: Your private SSH key (entire content of id_ed25519)
   DEPLOY_PATH: /var/www/html/your-website
   ```

4. Create the workflow file:
```bash
mkdir -p .github/workflows
touch .github/workflows/deploy.yml
```

5. Add this workflow configuration:
```yaml
name: Deploy Website

on:
  push:
    branches: [ main ]  # or your default branch

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to Server
        uses: appleboy/scp-action@master
        with:
          host: ${{ secrets.DEPLOY_HOST }}
          username: ${{ secrets.DEPLOY_USER }}
          key: ${{ secrets.DEPLOY_KEY }}
          source: "."
          target: ${{ secrets.DEPLOY_PATH }}
          
      - name: Execute remote commands
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.DEPLOY_HOST }}
          username: ${{ secrets.DEPLOY_USER }}
          key: ${{ secrets.DEPLOY_KEY }}
          script: |
            chmod 755 /home/${{ secrets.DEPLOY_USER }}/deploy.sh
            cd ${{ secrets.DEPLOY_PATH }}
            sudo chown -R ${{ secrets.DEPLOY_USER }}:www-data .
            sudo find . -type d -exec chmod 755 {} \;
            sudo find . -type f -exec chmod 644 {} \;
```

### How it Works

1. When you push to main branch, GitHub Actions:
   - Copies your website files to the server
   - Sets proper permissions
   - Ensures Nginx can serve the files

2. The workflow:
   - Uses `scp-action` to securely copy files
   - Uses `ssh-action` to execute remote commands
   - Maintains proper file permissions
   - Keeps website running during deployment

### Testing the Deployment

1. Make a change to your website
2. Push to main branch:
```bash
git add .
git commit -m "Update website content"
git push origin main
```

3. Monitor the deployment:
   - Go to your repository's Actions tab
   - Watch the workflow execution
   - Check for any errors

### Troubleshooting Deployments

1. Permission Issues:
```bash
# On server, verify permissions
ls -la /var/www/html/your-website
sudo chown -R $USER:www-data /var/www/html/your-website
```

2. Workflow Failures:
   - Check GitHub Actions logs
   - Verify secrets are correctly set
   - Ensure SSH key has proper permissions

3. Server Issues:
```bash
# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo nginx -t
```
### Security Notes

- Use specific SSH keys for deployments
- Restrict SSH key permissions on server
- Regularly rotate deployment credentials
- Monitor GitHub Actions usage
  
## Troubleshooting

### Common Issues and Solutions

1. 500 Internal Server Error
   - Check Nginx error logs: `sudo tail -f /var/log/nginx/error.log`
   - Verify file permissions and ownership
   - Ensure index.html exists in the correct location

2. SSL Certificate Issues
   - Verify certificate renewal: `sudo certbot certificates`
   - Check SSL configuration: `sudo nginx -t`

3. Permission Issues
   - Verify user is in www-data group: `groups your-username`
   - Check file permissions: `ls -la /var/www/html/your-website`

4. Security Issues
   - Check fail2ban logs: `sudo tail -f /var/log/fail2ban.log`
   - Review security reports in your email
   - Verify firewall status: `sudo ufw status verbose`

## Additional Resources

- [Nginx Documentation](https://nginx.org/en/docs/)
- [Certbot Documentation](https://certbot.eff.org/docs/)
- [Ubuntu Server Guide](https://ubuntu.com/server/docs)
- [UFW Guide](https://help.ubuntu.com/community/UFW)
- [Fail2ban Documentation](https://www.fail2ban.org/wiki/index.php/Main_Page)
