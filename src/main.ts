// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1. Enable Cookie Parser
  app.use(cookieParser());

  // 2. Strict CORS (Required for cookies)
  app.enableCors({
    origin: 'http://localhost:3001', // MUST match your Next.js URL exactly
    credentials: true, // This allows cookies to be sent back and forth
  });

  await app.listen(3000);
}
bootstrap();