# EC2 Production Setup Commands

Run these commands in order on your EC2 instance after cloning the repository.

## 1. Install Docker and Docker Compose (if not already installed)

```bash
# Update package lists
sudo apt update

# Install required packages
sudo apt install -y curl git

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to the docker group
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Apply group changes (you may need to log out and log back in)
# Either log out and log back in, or run:
newgrp docker
```

## 2. Create Environment Variables

Navigate to your project directory where you cloned the repository:

```bash
# Navigate to your project directory (adjust the path if needed)
cd ~/capstone-project

# Create .env file with production settings
cat > .env << EOL
# Database Configuration
DATABASE_URL="postgresql://postgres:postgres_password@db:5432/postgres"
DB_PASSWORD="postgres_password"

# NextAuth.js Configuration
NEXTAUTH_URL="http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
NODE_ENV="production"
EOL

# Verify the environment file was created
cat .env
```

## 3. Configure and Start Docker Services

Create the production Docker Compose file:

```bash
# Create docker-compose.prod.yml if it doesn't exist
cat > docker-compose.prod.yml << EOL
version: '3'

services:
  webapp:
    build:
      context: .
      dockerfile: Dockerfile
    restart: always
    ports:
      - "80:3000"  # Map to port 80 for easier access
    environment:
      - DATABASE_URL=postgresql://postgres:\${DB_PASSWORD}@db:5432/postgres
      - NODE_ENV=production
      - NEXTAUTH_URL=\${NEXTAUTH_URL}
      - NEXTAUTH_SECRET=\${NEXTAUTH_SECRET}
    depends_on:
      db:
        condition: service_healthy

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

volumes:
  postgres_data:
    driver: local
EOL

# Build and start the containers
docker-compose -f docker-compose.prod.yml up -d
```

## 4. Run Database Migrations

Wait for the database to be ready (30-60 seconds after starting containers):

```bash
# Check if containers are running
docker ps

# Wait until you see the database container running
# Then run migrations
docker-compose -f docker-compose.prod.yml exec webapp npx prisma migrate deploy
```

## 5. Verify the Deployment

```bash
# Check application logs
docker-compose -f docker-compose.prod.yml logs webapp

# Check database logs
docker-compose -f docker-compose.prod.yml logs db

# Check database connection
docker-compose -f docker-compose.prod.yml exec db psql -U postgres -c "\l"

# Get your server's public IP
echo "Your application is running at: http://$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)"
```

## 6. Additional Useful Commands

### View logs in real-time
```bash
docker-compose -f docker-compose.prod.yml logs -f
```

### Restart the application
```bash
docker-compose -f docker-compose.prod.yml restart
```

### Rebuild after code changes
```bash
git pull  # Pull the latest changes
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml up -d --build
```

### Backup the database
```bash
mkdir -p ~/db-backups
docker-compose -f docker-compose.prod.yml exec db pg_dump -U postgres postgres > ~/db-backups/postgres-backup-$(date +%Y%m%d).sql
```

### Free up space (if needed)
```bash
# Remove unused Docker resources
docker system prune -f
```

## Troubleshooting

### If port 80 is in use
```bash
# Check what's using port 80
sudo lsof -i :80

# Edit docker-compose.prod.yml to use another port (e.g., 8080)
# Change "80:3000" to "8080:3000"
```

### If database connection fails
```bash
# Restart the database container
docker-compose -f docker-compose.prod.yml restart db

# Verify environment variables
cat .env | grep DATABASE_URL
```

