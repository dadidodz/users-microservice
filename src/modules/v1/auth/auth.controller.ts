import { Controller, Post, Body, UseGuards, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtAuthGuard } from './jwt/jwt-auth.guard';
import { JwtRefreshGuard } from './jwt/jwt-refresh.guard';
import { GetUser } from './decorators/get-user.decorator';
import { User } from '../users/entities/user.entity';
import { CheckAvailabilityDto } from '../users/dto/check-availability.dto';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthResponseDto } from './dto/auth-response-dto';
import { LoginDto } from './dto/login.dto';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

type RefreshTokenPayload = {
    uuid: string;
    refreshToken: string;
};

@Controller('api/v1/auth')
export class AuthController {
    constructor(private readonly authService: AuthService, private readonly usersService: UsersService) {}

    // #region === GET ===

    @ApiOperation({ 
        summary: 'Vérifier la disponibilité (Public)', 
        description: 'Permet de vérifier si un email ou un pseudo est disponible avant l\'inscription.' 
    })
    @Get('check-availability')
    async checkAvailabilityPublic(
        @Query() dto: CheckAvailabilityDto
    ): Promise<{ available: boolean }> {
        return this.usersService.checkAvailability(dto);
    }

    // #endregion

    // #region === POST ===
    @ApiOperation({ 
        summary: 'Inscription', 
        description: 'Crée un nouveau compte et retourne les tokens d\'accès.' 
    })
    @Post('register')
    async register(
        @Body() createUserDto: CreateUserDto
    ): Promise<AuthResponseDto> {
        return this.authService.register(createUserDto);
    }

    @ApiOperation({ 
        summary: 'Connexion', 
        description: 'Authentifie l\'utilisateur et génère une paire de tokens (Access & Refresh).' 
    })
    @Post('login')
    async login(
        @Body() loginDto: LoginDto
    ): Promise<AuthResponseDto> {
        return this.authService.login(loginDto);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ 
        summary: 'Déconnexion', 
        description: 'Invalide le refresh token en base de données pour déconnecter l\'utilisateur.' 
    })
    @Post('logout')
    async logout(
        @GetUser() user: User
    ): Promise<{ message: string }> {
        return this.authService.logout(user.id);
    }

    @UseGuards(JwtRefreshGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ 
        summary: 'Rafraîchir le token', 
        description: 'Génère un nouvel access token à partir d\'un refresh token valide.' 
    })
    @Post('refresh')
    async refresh(
        @GetUser() user: RefreshTokenPayload
    ): Promise<{ access_token: string }> {
        const { uuid, refreshToken } = user;
        return this.authService.refreshAccessToken(uuid, refreshToken);
    }

    // #endregion
}