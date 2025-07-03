import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  // load env
  require('dotenv').config();
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: '*' });
  const PORT = process.env.PORT ?? 3000;
  await app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
}
bootstrap();
