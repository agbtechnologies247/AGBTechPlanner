#!/bin/bash

# AGB Tech Planner - VPS Setup Script
# Run this on your Hostinger VPS

echo "🚀 Starting AGB Tech Planner setup..."

# 1. Update system
sudo apt update && sudo apt upgrade -y

# 2. Install Node.js (if not installed)
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# 3. Install Nginx
sudo apt install -y nginx

# 4. Install PM2
sudo npm install -g pm2

# 5. Create app directory
sudo mkdir -p /var/www/agbtech-planner
sudo chown -R $USER:$USER /var/www/agbtech-planner

# 6. Instructions for the user
echo "✅ Prerequisites installed."
echo ""
echo "Next steps:"
echo "1. Clone the repo: git clone https://github.com/agbtechnologies247/AGBTechPlanner /var/www/agbtech-planner"
echo "2. Install dependencies: npm install"
echo "3. Build the frontend: npm run build"
echo "4. Start the backend: pm2 start ecosystem.config.cjs"
echo "5. Configure Nginx: sudo cp deploy/nginx.conf /etc/nginx/sites-available/planner.agbtechnologies.com"
echo "6. Enable site: sudo ln -s /etc/nginx/sites-available/planner.agbtechnologies.com /etc/nginx/sites-enabled/"
echo "7. Restart Nginx: sudo systemctl restart nginx"
echo ""
echo "🚀 Your planner will be live at http://planner.agbtechnologies.com"
