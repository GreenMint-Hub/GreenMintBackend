import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';

describe('Authentication (e2e)', () => {
  let app: INestApplication;
  let connection: Connection;

  const testUser = {
    username: 'testuser',
    email: 'test@example.com',
    password: 'password123',
    walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
    language: 'en',
  };

  const testUser2 = {
    username: 'testuser2',
    email: 'test2@example.com',
    password: 'password123',
    walletAddress: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b7',
    language: 'en',
  };

  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    connection = moduleFixture.get<Connection>(getConnectionToken());
    await app.init();
  });

  afterAll(async () => {
    // Clean up test data
    await connection.dropDatabase();
    await app.close();
  });

  beforeEach(async () => {
    // Clear users collection before each test
    await connection.collection('users').deleteMany({});
  });

  describe('/api/auth/register (POST)', () => {
    it('should register a new user successfully', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send(testUser)
        .expect(201)
        .expect((res) => {
          expect(res.body.access_token).toBeDefined();
          expect(res.body.user.username).toBe(testUser.username);
          expect(res.body.user.email).toBe(testUser.email);
          expect(res.body.user.walletAddress).toBe(testUser.walletAddress);
          expect(res.body.user.emailVerified).toBe(false);
          expect(res.body.user.password).toBeUndefined(); // Password should not be returned

          authToken = res.body.access_token;
          userId = res.body.user.id;
        });
    });

    it('should fail with invalid email format', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          ...testUser,
          email: 'invalid-email',
        })
        .expect(400);
    });

    it('should fail with short password', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          ...testUser,
          password: '123',
        })
        .expect(400);
    });

    it('should fail with invalid wallet address', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          ...testUser,
          walletAddress: 'invalid-wallet',
        })
        .expect(400);
    });

    it('should fail with missing required fields', () => {
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          username: testUser.username,
        })
        .expect(400);
    });

    it('should fail with duplicate email', async () => {
      // First registration
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      // Second registration with same email
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          ...testUser2,
          email: testUser.email,
        })
        .expect(409);
    });

    it('should fail with duplicate username', async () => {
      // First registration
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      // Second registration with same username
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          ...testUser2,
          username: testUser.username,
        })
        .expect(409);
    });

    it('should fail with duplicate wallet address', async () => {
      // First registration
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      // Second registration with same wallet address
      return request(app.getHttpServer())
        .post('/api/auth/register')
        .send({
          ...testUser2,
          walletAddress: testUser.walletAddress,
        })
        .expect(409);
    });
  });

  describe('/api/auth/login (POST)', () => {
    beforeEach(async () => {
      // Register a user for login tests
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);
    });

    it('should login with email and password successfully', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.access_token).toBeDefined();
          expect(res.body.user.email).toBe(testUser.email);
          expect(res.body.user.username).toBe(testUser.username);
        });
    });

    it('should login with wallet address successfully', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          walletAddress: testUser.walletAddress,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.access_token).toBeDefined();
          expect(res.body.user.walletAddress).toBe(testUser.walletAddress);
        });
    });

    it('should fail with wrong password', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'wrongpassword',
        })
        .expect(401);
    });

    it('should fail with non-existent email', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: testUser.password,
        })
        .expect(401);
    });

    it('should fail with non-existent wallet address', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({
          walletAddress: '0x0000000000000000000000000000000000000000',
        })
        .expect(401);
    });

    it('should fail with missing credentials', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({})
        .expect(400);
    });
  });

  describe('/api/auth/login/email (POST)', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);
    });

    it('should login with email successfully', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login/email')
        .send({
          email: testUser.email,
          password: testUser.password,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.access_token).toBeDefined();
          expect(res.body.user.email).toBe(testUser.email);
        });
    });
  });

  describe('/api/auth/login/wallet (POST)', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);
    });

    it('should login with wallet address successfully', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login/wallet')
        .send({
          walletAddress: testUser.walletAddress,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.access_token).toBeDefined();
          expect(res.body.user.walletAddress).toBe(testUser.walletAddress);
        });
    });
  });

  describe('/api/auth/profile (GET)', () => {
    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      authToken = response.body.access_token;
    });

    it('should get user profile with valid token', () => {
      return request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.user).toBeDefined();
          expect(res.body.user.username).toBe(testUser.username);
          expect(res.body.user.email).toBe(testUser.email);
        });
    });

    it('should fail without token', () => {
      return request(app.getHttpServer()).get('/api/auth/profile').expect(401);
    });

    it('should fail with invalid token', () => {
      return request(app.getHttpServer())
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('/api/auth/refresh (POST)', () => {
    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      authToken = response.body.access_token;
    });

    it('should refresh token successfully', () => {
      return request(app.getHttpServer())
        .post('/api/auth/refresh')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201)
        .expect((res) => {
          expect(res.body.access_token).toBeDefined();
          expect(res.body.access_token).not.toBe(authToken);
        });
    });
  });

  describe('/api/auth/change-password (POST)', () => {
    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      authToken = response.body.access_token;
    });

    it('should change password successfully', () => {
      return request(app.getHttpServer())
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: testUser.password,
          newPassword: 'newpassword123',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.message).toBe('Password changed successfully');
        });
    });

    it('should fail with wrong current password', () => {
      return request(app.getHttpServer())
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword123',
        })
        .expect(400);
    });

    it('should fail with short new password', () => {
      return request(app.getHttpServer())
        .post('/api/auth/change-password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: testUser.password,
          newPassword: '123',
        })
        .expect(400);
    });
  });

  describe('/api/auth/forgot-password (POST)', () => {
    beforeEach(async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);
    });

    it('should send password reset email', () => {
      return request(app.getHttpServer())
        .post('/api/auth/forgot-password')
        .send({
          email: testUser.email,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.message).toBe('Password reset email sent');
        });
    });

    it('should fail with non-existent email', () => {
      return request(app.getHttpServer())
        .post('/api/auth/forgot-password')
        .send({
          email: 'nonexistent@example.com',
        })
        .expect(404);
    });
  });

  describe('/api/auth/nonce (GET)', () => {
    it('should generate nonce for wallet address', () => {
      return request(app.getHttpServer())
        .get('/api/auth/nonce')
        .send({
          walletAddress: testUser.walletAddress,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.nonce).toBeDefined();
          expect(res.body.walletAddress).toBe(testUser.walletAddress);
          expect(res.body.nonce).toContain(
            'Sign this message to authenticate with GreenMint',
          );
        });
    });
  });

  describe('/api/auth/verify (POST)', () => {
    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      authToken = response.body.access_token;
    });

    it('should verify valid token', () => {
      return request(app.getHttpServer())
        .post('/api/auth/verify')
        .send({
          token: authToken,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.valid).toBe(true);
          expect(res.body.user).toBeDefined();
        });
    });

    it('should reject invalid token', () => {
      return request(app.getHttpServer())
        .post('/api/auth/verify')
        .send({
          token: 'invalid-token',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.valid).toBe(false);
          expect(res.body.error).toBeDefined();
        });
    });
  });

  describe('/api/auth/logout (POST)', () => {
    beforeEach(async () => {
      const response = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(testUser)
        .expect(201);

      authToken = response.body.access_token;
    });

    it('should logout successfully', () => {
      return request(app.getHttpServer())
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(201)
        .expect((res) => {
          expect(res.body.message).toBe('Logged out successfully');
        });
    });
  });
});
