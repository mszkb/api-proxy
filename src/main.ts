import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    whitelist: true,
  }));
  
  app.enableCors();
  
  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('API Proxy')
    .setDescription('Ein fein granulierter API-Proxy mit Transformationen, Delays und Loops')
    .setVersion('1.0')
    .addTag('input', 'Input management - Polling external APIs')
    .addTag('transform', 'Transform management - Data transformation and processing')
    .addTag('output', 'Output management - Sending data to external APIs')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`API Proxy running on port ${port}`);
  console.log(`Swagger documentation available at http://localhost:${port}/api`);
}

bootstrap(); 