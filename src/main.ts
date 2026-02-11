import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
    // const app = await NestFactory.create(AppModule);
    const app = await NestFactory.create(AppModule);
    //   await app.listen(process.env.PORT ?? 3000);

    app.enableCors({
        origin: ['http://localhost:3000', 'http://192.168.0.78:3000', 'http://192.168.27.78:3000'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
    });

    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
    }));

    app.useGlobalInterceptors(
        new ClassSerializerInterceptor(app.get(Reflector), {
            excludeExtraneousValues: true,
        }),
    );

    const config = new DocumentBuilder()
        .setTitle('Mon API NestJS')
        .setDescription('Documentation interactive de l\'API')
        .setVersion('1.0')
        // .addBearerAuth() // Décommentez si vous utilisez du JWT plus tard
        .addBearerAuth( // <--- Ajoutez ceci
            {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT', // Optionnel
            name: 'JWT',
            description: 'Entrez votre token JWT',
            in: 'header',
            },
            'access-token', // C'est le nom de la sécurité (vous pouvez l'appeler comme vous voulez)
        )
        .build()

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

    const configService = app.get(ConfigService);
    const port = configService.get<number>('PORT') ?? 3000;

    await app.listen(port, '0.0.0.0');
    console.log(`🚀 Backend NestJS running on: http://localhost:${port}`);
}
bootstrap();
