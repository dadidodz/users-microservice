import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './jwt/jwt.strategy';
import { JwtRefreshStrategy } from './jwt/jwt-refresh.strategy';

@Module({
    imports: [
        UsersModule,
        PassportModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                secret: configService.get<string>('JWT_SECRET'),
                signOptions: { expiresIn: '15m' },
            }),
        }),
    ],
    providers: [AuthService, JwtStrategy, JwtRefreshStrategy],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule {}
