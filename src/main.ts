import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // load env
  require('dotenv').config();
  console.log({ MONGO_URI: process.env.MONGO_URI });
  const app = await NestFactory.create(AppModule);
  const PORT = process.env.PORT ?? 3000;
  await app.listen(PORT);
}
bootstrap();
