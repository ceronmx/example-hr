import { NestFactory } from '@nestjs/core';
import { AppModule } from './infrastructure/app.module';
import { ValidationPipe } from '@nestjs/common';
import { DomainExceptionFilter } from './infrastructure/filters/domain-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useGlobalFilters(new DomainExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('ExampleHR Time-Off Microservice')
    .setDescription(
      'API for managing employee time-off balances and synchronization with HCM systems.',
    )
    .setVersion('1.0')
    .addTag('Time-Off')
    .addTag('Sync')
    .addTag('Balances')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  void app.listen(process.env.PORT ?? 3000);
}
bootstrap();
