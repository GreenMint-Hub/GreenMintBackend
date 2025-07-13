import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import fastifyHelmet from '@fastify/helmet';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  // Security middleware
  await app.register(fastifyHelmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
      },
    },
  });

  // Enable CORS for React Native integration
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://192.168.8.26:4000',
      'http://192.168.8.26:3000',
      'http://192.168.8.26:3001',
      'exp://192.168.8.26:8081',
      'exp://localhost:8081',
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties are present
      transform: true, // Transform payloads to be objects typed according to their DTO classes
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Set global prefix for API routes
  app.setGlobalPrefix('api');

  // Global exception filter for better error handling
  // app.useGlobalFilters(new HttpExceptionFilter());

  const port = process.env.PORT || 4000;
  await app.listen(port, '0.0.0.0');
}
bootstrap();
