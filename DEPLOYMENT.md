# StoreMyBottle Deployment Guide

## Production Deployment Checklist

### 1. Environment Variables

#### Backend (.env)
```bash
# Server Configuration
PORT=3000
NODE_ENV=production

# Database
DATABASE_URL=postgresql://username:password@host:port/database

# Clerk Authentication
CLERK_SECRET_KEY=sk_live_your_production_secret_key
CLERK_PUBLISHABLE_KEY=pk_live_your_production_publishable_key

# Security
JWT_SECRET=your_strong_jwt_secret_here
ENCRYPTION_KEY=your_32_character_encryption_key

# CORS
ALLOWED_ORIGINS=https://yourdomain.com,https://admin.yourdomain.com,https://bartender.yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Logging
LOG_LEVEL=info
```

#### Frontend (.env)
```bash
# API Configuration
VITE_API_URL=https://api.yourdomain.com

# Clerk Authentication
VITE_CLERK_PUBLISHABLE_KEY=pk_live_your_production_publishable_key

# Environment
VITE_NODE_ENV=production
```

### 2. Database Setup

1. **Create Production Database**
   ```sql
   CREATE DATABASE storemybottle_prod;
   CREATE USER storemybottle_user WITH PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE storemybottle_prod TO storemybottle_user;
   ```

2. **Run Migrations**
   ```bash
   cd database
   node run-migrations.js
   ```

3. **Verify Tables**
   ```sql
   \dt -- List all tables
   ```

### 3. Security Configuration

#### SSL/TLS
- **Required**: Use HTTPS in production
- Configure SSL certificates (Let's Encrypt recommended)
- Set up HTTP to HTTPS redirect

#### Firewall Rules
- Allow only necessary ports (80, 443, 22)
- Restrict database access to application servers only
- Use VPC/private networks when possible

#### Environment Security
- Never commit `.env` files to version control
- Use environment variable management (AWS Secrets Manager, etc.)
- Rotate secrets regularly

### 4. Docker Deployment (Recommended)

#### Backend Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/api/health || exit 1

# Start application
CMD ["npm", "start"]
```

#### Frontend Dockerfile
```dockerfile
FROM node:18-alpine as builder

WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### Docker Compose
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_DB: storemybottle
      POSTGRES_USER: storemybottle_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - app-network

  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://storemybottle_user:${DB_PASSWORD}@postgres:5432/storemybottle
      CLERK_SECRET_KEY: ${CLERK_SECRET_KEY}
      NODE_ENV: production
    depends_on:
      - postgres
    networks:
      - app-network

  frontend-customer:
    build: ./frontend-customer
    ports:
      - "80:80"
    networks:
      - app-network

volumes:
  postgres_data:

networks:
  app-network:
    driver: bridge
```

### 5. Monitoring and Logging

#### Application Monitoring
- Set up health check endpoints
- Monitor response times and error rates
- Use tools like DataDog, New Relic, or Prometheus

#### Log Management
- Centralized logging (ELK stack, CloudWatch, etc.)
- Structured JSON logging
- Log rotation and retention policies

#### Alerts
- Database connection failures
- High error rates
- Performance degradation
- Security incidents

### 6. Backup Strategy

#### Database Backups
```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump $DATABASE_URL > backup_$DATE.sql
aws s3 cp backup_$DATE.sql s3://your-backup-bucket/
```

#### File Backups
- Application code (Git repository)
- Configuration files
- SSL certificates

### 7. Performance Optimization

#### Database
- Connection pooling (configured in database.ts)
- Query optimization
- Proper indexing
- Regular VACUUM and ANALYZE

#### Caching
- Redis for session storage
- CDN for static assets
- API response caching

#### Load Balancing
- Multiple application instances
- Database read replicas
- Geographic distribution

### 8. Security Hardening

#### Server Security
- Regular security updates
- Fail2ban for brute force protection
- Intrusion detection system
- Regular security audits

#### Application Security
- Input validation (implemented)
- Rate limiting (implemented)
- CORS configuration (implemented)
- Security headers (implemented)

### 9. CI/CD Pipeline

#### GitHub Actions Example
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      - run: npm run lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to production
        run: |
          # Your deployment script here
```

### 10. Post-Deployment Verification

#### Health Checks
```bash
# API health
curl https://api.yourdomain.com/api/health

# Database connectivity
curl https://api.yourdomain.com/api/venues

# Authentication
curl -H "Authorization: Bearer $TOKEN" https://api.yourdomain.com/api/admin/dashboard
```

#### Load Testing
```bash
# Install artillery
npm install -g artillery

# Run load test
artillery quick --count 10 --num 100 https://api.yourdomain.com/api/venues
```

### 11. Maintenance

#### Regular Tasks
- Security updates (monthly)
- Database maintenance (weekly)
- Log cleanup (daily)
- Backup verification (weekly)
- Performance monitoring (continuous)

#### Scaling Considerations
- Horizontal scaling with load balancers
- Database sharding for large datasets
- Microservices architecture for complex features
- CDN for global distribution

### 12. Troubleshooting

#### Common Issues
1. **Database Connection Errors**
   - Check connection string
   - Verify network connectivity
   - Check database server status

2. **Authentication Failures**
   - Verify Clerk configuration
   - Check API keys
   - Validate token format

3. **High Response Times**
   - Check database query performance
   - Monitor server resources
   - Analyze slow queries

#### Debug Commands
```bash
# Check application logs
docker logs container_name

# Database queries
psql $DATABASE_URL -c "SELECT * FROM pg_stat_activity;"

# Server resources
htop
df -h
```

## Security Considerations

### OWASP Top 10 Compliance
- ✅ Injection prevention (parameterized queries)
- ✅ Broken authentication (Clerk integration)
- ✅ Sensitive data exposure (environment variables)
- ✅ XML external entities (not applicable)
- ✅ Broken access control (role-based permissions)
- ✅ Security misconfiguration (security headers)
- ✅ Cross-site scripting (input sanitization)
- ✅ Insecure deserialization (JSON parsing limits)
- ✅ Known vulnerabilities (dependency scanning)
- ✅ Insufficient logging (structured logging)

### Compliance Requirements
- GDPR compliance for EU users
- PCI DSS for payment processing
- SOC 2 for enterprise customers
- Regular penetration testing

## Support and Maintenance

### Documentation
- API documentation (Swagger/OpenAPI)
- User guides
- Administrator manual
- Troubleshooting guide

### Support Channels
- Technical support email
- Issue tracking system
- Knowledge base
- Community forum

This deployment guide ensures a secure, scalable, and maintainable production environment for StoreMyBottle.