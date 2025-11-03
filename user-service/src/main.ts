import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors(); // permite chamadas externas
  await app.listen(3001);
  console.log('🚀 USER-SERVICE is running on http://localhost:3001');
}
bootstrap();
