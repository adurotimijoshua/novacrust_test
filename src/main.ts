import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { FormattedValidationPipe } from '@libs/pipes/formatted-validation-pipe';
import { CustomExceptionFilter } from '@libs/filters/custom-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  app.useGlobalFilters(new CustomExceptionFilter());

  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  app.useGlobalPipes(new FormattedValidationPipe());

  await app.listen(configService.get<number>('PORT') ?? 5002);
}
bootstrap();
