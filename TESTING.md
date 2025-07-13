# GreenMint Backend Testing Guide

This guide provides comprehensive testing instructions for all GreenMint backend endpoints and functionality.

## Prerequisites

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Set Up Test Environment**

   ```bash
   # Copy test environment file
   cp env.example .env.test

   # Update .env.test with test database
   MONGODB_URI=mongodb://localhost:27017/greenmint-test
   JWT_SECRET=test-jwt-secret-key
   ```

3. **Start MongoDB for Testing**
   ```bash
   # Start MongoDB locally or use Docker
   docker run -d -p 27017:27017 --name mongodb-test mongo:7.0
   ```

## Running Tests

### 1. Unit Tests

```bash
npm run test
```

### 2. E2E Tests

```bash
npm run test:e2e
```

### 3. Test Coverage

```bash
npm run test:cov
```

### 4. Watch Mode

```bash
npm run test:watch
```

## Manual Testing Guide

### 1. Start the Development Server

```bash
npm run start:dev
```

The server will start on `http://localhost:3000`

### 2. Test Authentication Endpoints

#### A. User Registration

```bash
# Test successful registration
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "walletAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    "language": "en"
  }'

# Expected Response:
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "username": "testuser",
    "email": "test@example.com",
    "walletAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
    "language": "en",
    "emailVerified": false,
    "walletVerified": false,
    "totalCarbonSaved": 0,
    "totalPoints": 0
  }
}
```

#### B. User Login

```bash
# Login with email/password
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'

# Login with wallet address
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
  }'
```

#### C. Get User Profile

```bash
# Replace YOUR_JWT_TOKEN with the token from login/register
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### D. Change Password

```bash
curl -X POST http://localhost:3000/api/auth/change-password \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "password123",
    "newPassword": "newpassword123"
  }'
```

### 3. Test Activity Endpoints

#### A. Create Activity

```bash
curl -X POST http://localhost:3000/api/activities \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "biking",
    "distance": 5.2,
    "duration": 1800,
    "startTime": "2024-01-15T10:00:00Z",
    "endTime": "2024-01-15T10:30:00Z",
    "location": {
      "latitude": 37.7749,
      "longitude": -122.4194
    }
  }'
```

#### B. Get User Activities

```bash
curl -X GET http://localhost:3000/api/activities \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### C. Get Activity Statistics

```bash
curl -X GET http://localhost:3000/api/activities/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Test Verification Endpoints

#### A. Upload Receipt

```bash
# Create a test receipt file
echo "Test receipt content" > test-receipt.txt

curl -X POST http://localhost:3000/api/verifications/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@test-receipt.txt" \
  -F "provider=tmoney" \
  -F "amount=1500" \
  -F "date=2024-01-15"
```

#### B. Get User Verifications

```bash
curl -X GET http://localhost:3000/api/verifications \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 5. Test Blockchain Endpoints

#### A. Get User Stats

```bash
curl -X GET http://localhost:3000/api/blockchain/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### B. Log Activity to Blockchain

```bash
curl -X POST http://localhost:3000/api/blockchain/log-activity \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "activityId": "ACTIVITY_ID",
    "carbonSaved": 2.5,
    "points": 100
  }'
```

### 6. Test Leaderboard Endpoints

#### A. Get Global Leaderboard

```bash
curl -X GET http://localhost:3000/api/leaderboard/global
```

#### B. Get Weekly Leaderboard

```bash
curl -X GET http://localhost:3000/api/leaderboard/weekly
```

#### C. Get User Ranking

```bash
curl -X GET http://localhost:3000/api/leaderboard/user-ranking \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 7. Test User Management Endpoints

#### A. Update User Profile

```bash
curl -X PUT http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "carModel": "Tesla Model 3",
    "fuelConsumption": 0,
    "preferences": {
      "notifications": true,
      "privacy": "public",
      "theme": "dark"
    }
  }'
```

#### B. Get User Profile

```bash
curl -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Error Testing

### 1. Test Invalid Authentication

```bash
# Test without token
curl -X GET http://localhost:3000/api/auth/profile

# Test with invalid token
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer invalid-token"
```

### 2. Test Validation Errors

```bash
# Test invalid email format
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "invalid-email",
    "password": "password123",
    "walletAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
  }'

# Test short password
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "123",
    "walletAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
  }'
```

### 3. Test Duplicate Registration

```bash
# Register first user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "walletAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
  }'

# Try to register with same email
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser2",
    "email": "test@example.com",
    "password": "password123",
    "walletAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b7"
  }'
```

## Performance Testing

### 1. Load Testing with Artillery

```bash
# Install Artillery
npm install -g artillery

# Create load test configuration
cat > load-test.yml << EOF
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Authentication Flow"
    flow:
      - post:
          url: "/api/auth/register"
          json:
            username: "user{{ $randomNumber() }}"
            email: "user{{ $randomNumber() }}@example.com"
            password: "password123"
            walletAddress: "0x{{ $randomString(40) }}"
      - post:
          url: "/api/auth/login"
          json:
            email: "user{{ $randomNumber() }}@example.com"
            password: "password123"
EOF

# Run load test
artillery run load-test.yml
```

### 2. Database Performance Testing

```bash
# Test with large dataset
node scripts/generate-test-data.js

# Run performance tests
npm run test:perf
```

## Security Testing

### 1. Test Rate Limiting

```bash
# Make multiple rapid requests
for i in {1..150}; do
  curl -X GET http://localhost:3000/api/health
done
```

### 2. Test Input Validation

```bash
# Test SQL injection attempts
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com\"; DROP TABLE users; --",
    "password": "password123"
  }'

# Test XSS attempts
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "<script>alert(\"xss\")</script>",
    "email": "test@example.com",
    "password": "password123",
    "walletAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
  }'
```

### 3. Test JWT Token Security

```bash
# Test expired token
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer EXPIRED_TOKEN"

# Test tampered token
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer TAMPERED_TOKEN"
```

## Integration Testing

### 1. Complete User Journey Test

```bash
#!/bin/bash

# 1. Register user
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "walletAddress": "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
  }')

TOKEN=$(echo $REGISTER_RESPONSE | jq -r '.access_token')
USER_ID=$(echo $REGISTER_RESPONSE | jq -r '.user.id')

echo "User registered with ID: $USER_ID"

# 2. Create activity
ACTIVITY_RESPONSE=$(curl -s -X POST http://localhost:3000/api/activities \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "biking",
    "distance": 5.2,
    "duration": 1800,
    "startTime": "2024-01-15T10:00:00Z",
    "endTime": "2024-01-15T10:30:00Z"
  }')

ACTIVITY_ID=$(echo $ACTIVITY_RESPONSE | jq -r '._id')
echo "Activity created with ID: $ACTIVITY_ID"

# 3. Upload verification
curl -s -X POST http://localhost:3000/api/verifications/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@test-receipt.txt" \
  -F "provider=tmoney" \
  -F "amount=1500"

# 4. Check user stats
curl -s -X GET http://localhost:3000/api/users/profile \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# 5. Check leaderboard
curl -s -X GET http://localhost:3000/api/leaderboard/global | jq '.'

echo "Integration test completed successfully!"
```

## Monitoring and Debugging

### 1. Enable Debug Logging

```bash
# Set environment variable
export DEBUG=greenmint:*

# Start server with debug logging
npm run start:dev
```

### 2. Monitor Database Queries

```bash
# Enable MongoDB query logging
export MONGODB_DEBUG=true
npm run start:dev
```

### 3. Check Application Health

```bash
curl -X GET http://localhost:3000/api/health
```

### 4. Monitor Memory Usage

```bash
# Check memory usage
node -e "console.log(process.memoryUsage())"

# Monitor with process manager
npm install -g pm2
pm2 start dist/main.js --name greenmint
pm2 monit
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**

   ```bash
   # Check if MongoDB is running
   docker ps | grep mongo

   # Start MongoDB if not running
   docker start mongodb-test
   ```

2. **JWT Token Issues**

   ```bash
   # Check JWT secret in environment
   echo $JWT_SECRET

   # Regenerate JWT secret
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

3. **Validation Errors**

   ```bash
   # Check request format
   curl -v -X POST http://localhost:3000/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"username": "test"}'
   ```

4. **Rate Limiting Issues**

   ```bash
   # Check rate limit configuration
   cat src/config/throttler.config.ts

   # Test with different IP
   curl -X GET http://localhost:3000/api/health \
     -H "X-Forwarded-For: 192.168.1.1"
   ```

### Performance Issues

1. **Slow Database Queries**

   ```bash
   # Check database indexes
   mongo greenmint --eval "db.users.getIndexes()"

   # Analyze slow queries
   mongo greenmint --eval "db.setProfilingLevel(2)"
   ```

2. **Memory Leaks**

   ```bash
   # Monitor memory usage
   node --inspect dist/main.js

   # Use heap dump
   node --heapsnapshot-signal=SIGUSR2 dist/main.js
   ```

## Continuous Integration

### GitHub Actions Example

```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      mongodb:
        image: mongo:7.0
        ports:
          - 27017:27017

    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '20'

      - run: npm ci
      - run: npm run test
      - run: npm run test:e2e
      - run: npm run test:cov
```

This comprehensive testing guide ensures that all GreenMint backend functionality is thoroughly tested and working correctly.
