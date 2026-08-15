import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const customValidationPipe = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
  exceptionFactory: (errors) => {
    const details = errors.map((error) => ({
      campo: error.property,
      mensaje: error.constraints
      ? Object.values(error.constraints).reverse().join('. ')
      : 'Valor Inválido'
    }));
    return new BadRequestException({
      message: 'Validación Fallida',
      details,
    });
  },
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(customValidationPipe);

  const config = new DocumentBuilder()
  .setTitle('Practica')
  .setDescription('API')
  .setVersion('0')
  .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
