# 🐳 Docker Deployment Guide

## Overview

This guide explains the difference between **development** and **production** Docker deployments, and when you need local source files.

---

## 📊 Development vs Production

### Current Setup (Development Mode)

**File:** `docker-compose.yml`

```yaml
volumes:
  - ./server:/app        # ← Local files mounted
  - .:/app              # ← Local files mounted
```

**Characteristics:**
- ✅ **Requires local source files**
- ✅ Hot reload (changes reflect immediately)
- ✅ Easy debugging
- ✅ Fast iteration
- ❌ Not suitable for production

**When to use:**
- Local development
- Testing changes
- Debugging

---

### Production Deployment

**File:** `docker-compose.prod.yml`

```yaml
# NO volumes - source files baked into images
```

**Characteristics:**
- ✅ **No local source files needed**
- ✅ Optimized builds
- ✅ Smaller images
- ✅ Better security
- ✅ Suitable for production servers

**When to use:**
- Production servers
- CI/CD pipelines
- Cloud deployments
- Remote servers

---

## 🚀 Production Deployment Steps

### 1. Build Production Images

```bash
# Build server image
docker build -f server/Dockerfile.prod -t react-super-app-server:latest ./server

# Build client image
docker build -f Dockerfile.client.prod -t react-super-app-client:latest .
```

### 2. Tag for Registry (Optional)

```bash
# Tag for Docker Hub
docker tag react-super-app-server:latest yourusername/react-super-app-server:latest
docker tag react-super-app-client:latest yourusername/react-super-app-client:latest

# Or for AWS ECR
docker tag react-super-app-server:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/react-super-app-server:latest
docker tag react-super-app-client:latest 123456789.dkr.ecr.us-east-1.amazonaws.com/react-super-app-client:latest
```

### 3. Push to Registry

```bash
# Docker Hub
docker push yourusername/react-super-app-server:latest
docker push yourusername/react-super-app-client:latest

# AWS ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin 123456789.dkr.ecr.us-east-1.amazonaws.com
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/react-super-app-server:latest
docker push 123456789.dkr.ecr.us-east-1.amazonaws.com/react-super-app-client:latest
```

### 4. Deploy on Production Server

**On the production server (no source files needed):**

```bash
# Pull images from registry
docker pull yourusername/react-super-app-server:latest
docker pull yourusername/react-super-app-client:latest

# Create docker-compose.prod.yml (or use provided one)
# Update image names to use registry images

# Start services
docker compose -f docker-compose.prod.yml up -d
```

---

## 📁 What Gets Deployed

### Development (Current)
```
Local Machine:
├── server/          ← Mounted into container
├── src/             ← Mounted into container
└── package.json     ← Mounted into container

Container:
└── /app (points to local files)
```

### Production
```
Docker Image:
├── server/          ← Baked into image
├── src/             ← Baked into image
└── package.json     ← Baked into image

Container:
└── /app (contains files from image)
```

---

## 🔄 Deployment Workflow

### Option 1: Build on Local Machine

```bash
# 1. Build images locally
docker build -f server/Dockerfile.prod -t react-super-app-server:latest ./server
docker build -f Dockerfile.client.prod -t react-super-app-client:latest .

# 2. Push to registry
docker push yourusername/react-super-app-server:latest
docker push yourusername/react-super-app-client:latest

# 3. On production server (no source files needed)
docker pull yourusername/react-super-app-server:latest
docker pull yourusername/react-super-app-client:latest
docker compose -f docker-compose.prod.yml up -d
```

### Option 2: Build in CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build and push server
        run: |
          docker build -f server/Dockerfile.prod -t yourusername/react-super-app-server:${{ github.sha }} ./server
          docker push yourusername/react-super-app-server:${{ github.sha }}
      
      - name: Build and push client
        run: |
          docker build -f Dockerfile.client.prod -t yourusername/react-super-app-client:${{ github.sha }} .
          docker push yourusername/react-super-app-client:${{ github.sha }}
      
      - name: Deploy to production
        run: |
          ssh user@production-server "docker pull yourusername/react-super-app-server:${{ github.sha }} && docker compose -f docker-compose.prod.yml up -d"
```

---

## 🎯 Answer to Your Question

### **Do you need local source files after deployment?**

**Development (current setup):**
- ✅ **YES** - Files are mounted as volumes
- Files must exist on your local machine
- Changes to local files affect containers

**Production deployment:**
- ❌ **NO** - Files are baked into Docker images
- Images can be pushed to a registry
- Production server only needs:
  - Docker installed
  - `docker-compose.prod.yml` file
  - Access to image registry
  - Environment variables

---

## 📋 Quick Reference

### Development Commands

```bash
# Start with local files (development)
docker compose up

# Rebuild after code changes
docker compose up --build
```

### Production Commands

```bash
# Build production images
docker build -f server/Dockerfile.prod -t react-super-app-server:latest ./server
docker build -f Dockerfile.client.prod -t react-super-app-client:latest .

# Deploy production (no local files needed)
docker compose -f docker-compose.prod.yml up -d
```

---

## 🔐 Security Notes

### Production Checklist

- [ ] Change default passwords in `.env`
- [ ] Use strong JWT_SECRET
- [ ] Enable HTTPS (use nginx reverse proxy)
- [ ] Use non-root user in containers (already done in Dockerfile.prod)
- [ ] Limit exposed ports
- [ ] Use secrets management (Docker secrets, AWS Secrets Manager, etc.)
- [ ] Enable firewall rules
- [ ] Regular security updates

---

## 🆘 Troubleshooting

### Issue: "Cannot find module" in production

**Solution:** Ensure all dependencies are in `package.json` and run `npm ci` in build stage.

### Issue: "Permission denied" errors

**Solution:** Check file permissions and ensure non-root user has access.

### Issue: Images are too large

**Solution:** 
- Use multi-stage builds (already implemented)
- Use `.dockerignore` to exclude unnecessary files
- Use Alpine Linux base images (already done)

---

## 📚 Additional Resources

- [Docker Best Practices](https://docs.docker.com/develop/dev-best-practices/)
- [Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)
- [Docker Security](https://docs.docker.com/engine/security/)

---

**Last Updated**: 2024-12-01

