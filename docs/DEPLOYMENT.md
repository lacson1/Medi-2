# Deployment Guide

This guide covers deploying MediFlow to production environments using Docker and manual deployment methods.

## Prerequisites

### Production Requirements
- **Server**: Linux-based (Ubuntu 20.04+ recommended)
- **Docker**: Version 20.10+
- **Docker Compose**: Version 2.0+
- **Nginx**: Version 1.18+ (for manual deployment)
- **SSL Certificate**: Let's Encrypt or commercial certificate
- **Domain**: Configured DNS pointing to your server

### Base44 Production Setup
1. Create production Base44 app
2. Configure production API credentials
3. Set up proper authentication
4. Configure CORS settings

## Docker Deployment (Recommended)

### 1. Production Dockerfile
The project includes a multi-stage Dockerfile optimized for production:

```dockerfile
# Stage 1: Build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# Stage 2: Production
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 2. Docker Compose Configuration

#### Development (docker-compose.yml)
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:80"
    environment:
      - VITE_BASE44_SERVER_URL=${VITE_BASE44_SERVER_URL}
      - VITE_BASE44_APP_ID=${VITE_BASE44_APP_ID}
      - VITE_USE_MOCK_DATA=false
    volumes:
      - ./src:/app/src
    restart: unless-stopped
```

#### Production (docker-compose.prod.yml)
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "80:80"
      - "443:443"
    environment:
      - VITE_BASE44_SERVER_URL=${VITE_BASE44_SERVER_URL}
      - VITE_BASE44_APP_ID=${VITE_BASE44_APP_ID}
      - VITE_USE_MOCK_DATA=false
    volumes:
      - ./nginx.conf:/etc/nginx/conf.d/default.conf
      - ./ssl:/etc/nginx/ssl
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:80"]
      interval: 30s
      timeout: 10s
      retries: 3
```

### 3. Deployment Steps

#### Initial Setup
```bash
# Clone repository
git clone https://github.com/your-org/mediflow.git
cd mediflow

# Create environment file
cp env.example .env
# Edit .env with production values

# Build and start
docker-compose -f docker-compose.prod.yml up -d
```

#### Updates
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.prod.yml up -d --build
```

### 4. SSL Configuration

#### Let's Encrypt with Certbot
```bash
# Install Certbot
sudo apt update
sudo apt install certbot

# Generate certificate
sudo certbot certonly --standalone -d yourdomain.com

# Copy certificates to Docker volume
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ./ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ./ssl/
```

#### Nginx SSL Configuration
```nginx
server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    
    # SSL configuration
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self'; connect-src 'self' https://base44.app;" always;
    
    location / {
        root /usr/share/nginx/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}

server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}
```

## Manual Deployment

### 1. Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Nginx
sudo apt install nginx -y

# Install Node.js (for building)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Build Application
```bash
# Clone repository
git clone https://github.com/your-org/mediflow.git
cd mediflow

# Install dependencies
npm install

# Build for production
npm run build
```

### 3. Configure Nginx
```bash
# Create site configuration
sudo nano /etc/nginx/sites-available/mediflow

# Enable site
sudo ln -s /etc/nginx/sites-available/mediflow /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4. Deploy Files
```bash
# Copy built files
sudo cp -r dist/* /var/www/html/

# Set permissions
sudo chown -R www-data:www-data /var/www/html/
sudo chmod -R 755 /var/www/html/
```

## Cloud Deployment

### AWS EC2
1. Launch EC2 instance (t3.medium recommended)
2. Configure security groups (ports 80, 443, 22)
3. Install Docker and Docker Compose
4. Follow Docker deployment steps
5. Configure Elastic IP and Route 53

### Google Cloud Platform
1. Create Compute Engine instance
2. Install Docker and Docker Compose
3. Configure firewall rules
4. Follow Docker deployment steps
5. Set up Cloud DNS

### DigitalOcean Droplet
1. Create droplet (2GB RAM minimum)
2. Install Docker and Docker Compose
3. Follow Docker deployment steps
4. Configure domain and SSL

### Vercel (Static Deployment)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Configure environment variables in Vercel dashboard
```

### Netlify (Static Deployment)
```bash
# Build command
npm run build

# Publish directory
dist

# Configure environment variables in Netlify dashboard
```

## Environment Configuration

### Production Environment Variables
```env
# Base44 Configuration
VITE_BASE44_SERVER_URL=https://base44.app
VITE_BASE44_APP_ID=your_production_app_id
VITE_USE_MOCK_DATA=false

# Optional: Analytics
VITE_ENABLE_ANALYTICS=true
VITE_ANALYTICS_ID=your_analytics_id

# Optional: Error Tracking
VITE_SENTRY_DSN=your_sentry_dsn
```

### Security Configuration
- Enable HTTPS only
- Configure security headers
- Set up CORS properly
- Use environment variables for secrets
- Enable audit logging

## Monitoring and Maintenance

### Health Checks
```bash
# Check application status
curl -f http://localhost:80/health

# Check Docker container
docker ps
docker logs mediflow-app
```

### Log Management
```bash
# View application logs
docker logs -f mediflow-app

# Configure log rotation
sudo nano /etc/logrotate.d/mediflow
```

### Backup Strategy
```bash
# Backup application files
tar -czf mediflow-backup-$(date +%Y%m%d).tar.gz /var/www/html/

# Backup Docker volumes
docker run --rm -v mediflow_data:/data -v $(pwd):/backup alpine tar czf /backup/data-backup.tar.gz /data
```

### Updates and Maintenance
```bash
# Update application
git pull origin main
docker-compose -f docker-compose.prod.yml up -d --build

# Update system packages
sudo apt update && sudo apt upgrade -y

# Clean up Docker
docker system prune -a
```

## Troubleshooting

### Common Issues

#### Build Failures
- Check Node.js version compatibility
- Verify environment variables
- Check for TypeScript errors
- Review dependency versions

#### Runtime Errors
- Check Docker container logs
- Verify API connectivity
- Check SSL certificate validity
- Review Nginx configuration

#### Performance Issues
- Monitor resource usage
- Check database connections
- Review API response times
- Optimize images and assets

### Debug Commands
```bash
# Check container status
docker ps -a

# View container logs
docker logs mediflow-app

# Access container shell
docker exec -it mediflow-app sh

# Check Nginx configuration
sudo nginx -t

# Test SSL certificate
openssl s_client -connect yourdomain.com:443
```

## Security Checklist

### Pre-deployment
- [ ] Environment variables secured
- [ ] SSL certificate configured
- [ ] Security headers implemented
- [ ] CORS properly configured
- [ ] Input validation implemented
- [ ] Error handling secure
- [ ] Audit logging enabled

### Post-deployment
- [ ] HTTPS redirect working
- [ ] Security headers present
- [ ] SSL certificate valid
- [ ] API connectivity verified
- [ ] Performance acceptable
- [ ] Monitoring configured
- [ ] Backup strategy implemented

## Support

For deployment issues:
- Check the troubleshooting section
- Review Docker and Nginx logs
- Verify environment configuration
- Contact support at support@mediflow.com
