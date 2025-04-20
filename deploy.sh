#!/bin/bash

# ========================================================
# AWS EC2 Deployment Script for Capstone Project
# Using public IP address (no domain name)
# ========================================================

# Exit on any error
set -e

# Set variables - Customize these
POSTGRES_PASSWORD="postgres1234" # Use a secure password in production
APP_SECRET=$(openssl rand -base64 32)  # Auto-generate a secure secret
GITHUB_REPO="https://github.com/Komallsood/capstone-project.git" # Update with your actual repo

# Get the EC2 public IP address automatically
PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)

# Text formatting
BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# ========================================================
# Helper functions
# ========================================================

print_section() {
  echo -e "\n${BOLD}${GREEN}==== $1 ====${NC}\n"
}

print_warning() {
  echo -e "${YELLOW}WARNING: $1${NC}"
}

print_error() {
  echo -e "${RED}ERROR: $1${NC}"
}

# ========================================================
# 1. Initial Server Setup
# ========================================================
print_section "Initial Server Setup"

# Update system packages
echo "Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install essential tools
echo "Installing essential tools..."
sudo apt install -y git curl wget unzip htop vim build-essential nginx

# Set timezone
echo "Setting timezone to UTC..."
sudo timedatectl set-timezone UTC

# Enable firewall
echo "Configuring firewall..."
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 3000/tcp
sudo ufw --force enable

echo "Basic server setup complete."

# ========================================================
# 2. Docker & Docker Compose Installation
# ========================================================
print_section "Installing Docker & Docker Compose"

# Install Docker
echo "Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
echo "Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

echo "Docker and Docker Compose installation complete."

# ========================================================
# 3. Clone and Setup Application
# ========================================================
print_section "Setting up Application"

# Clone repository (if not already done)
if [ ! -d "capstone-project" ]; then
  echo "Cloning repository..."
  git clone $GITHUB_REPO capstone-project
fi

cd capstone-project

# ========================================================
# 4. Configure Environment Variables
# ========================================================
print_section "Configuring Environment Variables"

# Create .env file
echo "Creating .env file..."
cat > .env << EOL
# Database Configuration
DATABASE_URL="postgresql://postgres:${POSTGRES_PASSWORD}@db:5432/postgres"
DB_PASSWORD="${POSTGRES_PASSWORD}"

# NextAuth.js Configuration
NEXTAUTH_URL="http://${PUBLIC_IP}"
NEXTAUTH_SECRET="${APP_SECRET}"
NODE_ENV="production"
EOL

echo ".env file created successfully."

# ========================================================
# 5. Configure Docker Compose for Production
# ========================================================
print_section "Creating Production Docker Compose Configuration"

# Create a production docker-compose file
cat > docker-compose.prod.yml << EOL
version: '3'

services:
  webapp:
    build:
      context: .
      dockerfile: Dockerfile
    restart: always
    environment:
      - DATABASE_URL=postgresql://postgres:\${DB_PASSWORD}@db:5432/postgres
      - NODE_ENV=production
      - NEXTAUTH_URL=http://${PUBLIC_IP}
      - NEXTAUTH_SECRET=\${NEXTAUTH_SECRET}
    depends_on:
      db:
        condition: service_healthy
    networks:
      - app_network

  db:
    image: postgres:15
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_PASSWORD=\${DB_PASSWORD}
      - POSTGRES_DB=postgres
    restart: always
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - app_network

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx/conf:/etc/nginx/conf.d
    depends_on:
      - webapp
    restart: always
    networks:
      - app_network

volumes:
  postgres_data:
    driver: local

networks:
  app_network:
    driver: bridge
EOL

# ========================================================
# 6. Setting up Nginx Configuration
# ========================================================
print_section "Setting up Nginx Configuration"

# Create directory structure for Nginx
mkdir -p nginx/conf

# Create Nginx configuration file
cat > nginx/conf/app.conf << EOL
server {
    listen 80;
    server_name _;
    server_tokens off;

    location / {
        proxy_pass http://webapp:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOL

# ========================================================
# 7. Start the Application
# ========================================================
print_section "Starting the Application"

# Build and start services
echo "Building and starting services..."
sudo docker-compose -f docker-compose.prod.yml up -d

# Wait for database to be ready
echo "Waiting for database to be ready..."
sleep 15

# Run Prisma migrations
echo "Running database migrations..."
sudo docker-compose -f docker-compose.prod.yml exec webapp npx prisma migrate deploy

echo "Application deployment complete!"

# ========================================================
# Setup Basic Monitoring
# ========================================================
print_section "Setting Up Monitoring"

# Create a cron job to check service status
cat > check_services.sh << EOL
#!/bin/bash
date >> /var/log/app-status.log
docker ps >> /var/log/app-status.log
echo "---" >> /var/log/app-status.log
EOL

chmod +x check_services.sh
echo "*/15 * * * * $(pwd)/check_services.sh" | sudo tee -a /etc/crontab

# ========================================================
# Deployment Summary
# ========================================================
print_section "Deployment Summary"

echo "Your application has been deployed with the following configuration:"
echo "- Public IP: ${PUBLIC_IP}"
echo "- Application URL: http://${PUBLIC_IP}"
echo "- Database: PostgreSQL (running in Docker)"
echo "- Web server: Nginx"

echo -e "\n${BOLD}Security Notice:${NC}"
echo "This setup uses HTTP instead of HTTPS. This is not recommended for production."
echo "Your data will not be encrypted in transit. Consider adding HTTPS in the future."

echo -e "\n${BOLD}Next Steps:${NC}"
echo "1. Test your application by visiting http://${PUBLIC_IP}"
echo "2. Set up regular backups for your database"
echo "3. Consider implementing HTTPS for security"

print_section "Deployment Complete!"

