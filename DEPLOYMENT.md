# GreenMint Backend Deployment Guide

## Overview

This guide covers deploying the GreenMint backend API to production environments, including local development, Docker deployment, and AWS ECS deployment.

## Prerequisites

- Node.js 20.x or higher
- MongoDB 7.0 or higher
- Docker and Docker Compose
- AWS CLI (for AWS deployment)
- Git

## Local Development

### 1. Environment Setup

```bash
# Copy environment template
cp env.example .env

# Install dependencies
npm install

# Start MongoDB (if not using Docker)
mongod --dbpath /path/to/data/db
```

### 2. Configure Environment Variables

Edit `.env` file with your configuration:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/greenmint

# JWT (generate a secure secret)
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# AWS (for S3 uploads)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=greenmint-uploads

# Blockchain
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/your-project-id
POLYGON_RPC_URL=https://polygon-rpc.com
WALLET_PRIVATE_KEY=your-wallet-private-key
```

### 3. Run Development Server

```bash
# Development mode with hot reload
npm run start:dev

# Production mode
npm run start:prod
```

## Docker Deployment

### 1. Build and Run with Docker Compose

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

### 2. Build Docker Image

```bash
# Build image
docker build -t greenmint-backend .

# Run container
docker run -p 3000:3000 --env-file .env greenmint-backend
```

## AWS ECS Deployment

### 1. Prerequisites

- AWS CLI configured
- ECR repository created
- VPC with public subnets
- Security groups configured

### 2. Build and Push Docker Image

```bash
# Login to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Build image
docker build -t greenmint-backend .

# Tag image
docker tag greenmint-backend:latest $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/greenmint:latest

# Push to ECR
docker push $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/greenmint:latest
```

### 3. Deploy with CloudFormation

```bash
# Deploy infrastructure
aws cloudformation create-stack \
  --stack-name greenmint-backend \
  --template-body file://aws-deployment.yml \
  --parameters \
    ParameterKey=Environment,ParameterValue=production \
    ParameterKey=VpcId,ParameterValue=vpc-xxxxxxxxx \
    ParameterKey=SubnetIds,ParameterValue="subnet-xxxxxxxxx,subnet-yyyyyyyyy" \
  --capabilities CAPABILITY_IAM

# Check deployment status
aws cloudformation describe-stacks --stack-name greenmint-backend
```

### 4. Update Application

```bash
# Build and push new image
docker build -t greenmint-backend .
docker tag greenmint-backend:latest $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/greenmint:latest
docker push $AWS_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/greenmint:latest

# Force new deployment
aws ecs update-service \
  --cluster greenmint-production \
  --service greenmint-service-production \
  --force-new-deployment
```

## Security Configuration

### 1. JWT Secret Generation

```bash
# Generate secure JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 2. Environment Variables Security

- Use AWS Secrets Manager for sensitive data
- Never commit `.env` files to version control
- Rotate secrets regularly
- Use least privilege IAM policies

### 3. Network Security

- Configure security groups to allow only necessary traffic
- Use VPC endpoints for AWS services
- Enable WAF for additional protection
- Use HTTPS in production

## Monitoring and Logging

### 1. CloudWatch Logs

```bash
# View application logs
aws logs tail /ecs/greenmint-production --follow

# Create log insights query
aws logs start-query \
  --log-group-name /ecs/greenmint-production \
  --start-time $(date -d '1 hour ago' +%s) \
  --end-time $(date +%s) \
  --query-string 'fields @timestamp, @message | filter @message like /ERROR/'
```

### 2. Health Checks

```bash
# Test health endpoint
curl -f http://your-alb-dns/api/health

# Monitor with CloudWatch
aws cloudwatch put-metric-alarm \
  --alarm-name greenmint-health-check \
  --alarm-description "GreenMint API health check" \
  --metric-name HealthyHostCount \
  --namespace AWS/ApplicationELB \
  --statistic Average \
  --period 300 \
  --threshold 1 \
  --comparison-operator LessThanThreshold
```

## Auto Scaling

### 1. CPU-based Scaling

- Target: 70% CPU utilization
- Scale out: When CPU > 70% for 5 minutes
- Scale in: When CPU < 50% for 5 minutes

### 2. Memory-based Scaling

- Target: 80% memory utilization
- Scale out: When memory > 80% for 5 minutes
- Scale in: When memory < 60% for 5 minutes

## Database Management

### 1. MongoDB Atlas (Recommended)

```bash
# Connect to MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/greenmint?retryWrites=true&w=majority
```

### 2. Backup Strategy

- Enable automated backups
- Test restore procedures
- Store backups in multiple regions
- Monitor backup success

## API Documentation

### Base URL

- Development: `http://localhost:3000/api`
- Production: `https://your-domain.com/api`

### Authentication

All protected endpoints require JWT token in Authorization header:

```
Authorization: Bearer <jwt-token>
```

### Rate Limiting

- 100 requests per minute per IP
- 1000 requests per hour per IP
- Health check endpoints are excluded

## Troubleshooting

### Common Issues

1. **Connection refused to MongoDB**
   - Check MongoDB service status
   - Verify connection string
   - Check network connectivity

2. **JWT token invalid**
   - Verify JWT_SECRET is set correctly
   - Check token expiration
   - Ensure proper token format

3. **S3 upload failures**
   - Verify AWS credentials
   - Check S3 bucket permissions
   - Ensure bucket exists

4. **Blockchain transaction failures**
   - Check RPC endpoint availability
   - Verify wallet has sufficient funds
   - Check gas price settings

### Log Analysis

```bash
# Search for errors
grep -i error logs/app.log

# Monitor real-time logs
tail -f logs/app.log | grep -i error

# Check memory usage
docker stats greenmint-app
```

## Performance Optimization

### 1. Database Indexing

```javascript
// Create indexes for common queries
db.activities.createIndex({ userId: 1, createdAt: -1 });
db.verifications.createIndex({ userId: 1, status: 1 });
db.leaderboards.createIndex({ period: 1, type: 1 });
```

### 2. Caching Strategy

- Use Redis for session storage
- Cache leaderboard data
- Implement API response caching
- Use CDN for static assets

### 3. Connection Pooling

- Configure MongoDB connection pool
- Use connection pooling for external APIs
- Monitor connection usage

## Compliance and GDPR

### 1. Data Protection

- Encrypt data at rest and in transit
- Implement data retention policies
- Provide data export/deletion endpoints
- Log data access for audit trails

### 2. Privacy Controls

- Implement user consent management
- Provide privacy policy endpoints
- Support data portability
- Enable user data deletion

## Support and Maintenance

### 1. Regular Maintenance

- Update dependencies monthly
- Monitor security advisories
- Review and rotate secrets
- Update SSL certificates

### 2. Backup and Recovery

- Test backup restoration quarterly
- Document disaster recovery procedures
- Maintain runbooks for common issues
- Schedule regular security audits

For additional support, contact the development team or create an issue in the project repository.
