import { Controller, Delete, Get, HttpException, HttpStatus, UseGuards, Param, Patch, Body, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt/jwt-auth.guard';
import { plainToInstance } from 'class-transformer';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { User } from './entities/user.entity';
import { UserResponseDto } from './dto/response-user.dto';
import { CheckAvailabilityDto } from './dto/check-availability.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('api/v1/users')
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    // #region === GET ===

    @ApiOperation({ 
        summary: 'Lister tous les utilisateurs', 
        description: 'Récupère la liste complète des utilisateurs enregistrés.' 
    })
    @Get()
    async findAll(): Promise<UserResponseDto[]> {
        return this.usersService.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiResponse({ status: 200, description: 'Succès' })
    @ApiResponse({ status: 401, description: 'Non authentifié' })
    @ApiOperation({ 
        summary: 'Récupérer mon profil', 
        description: 'Retourne les informations détaillées de l\'utilisateur connecté.' 
    })
    @Get('me')
    async findMe(
        @GetUser() user: User
    ): Promise<UserResponseDto> {
        return plainToInstance(UserResponseDto, user);
    }

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ 
        summary: 'Vérifier la disponibilité', 
        description: 'Vérifie si un email ou un nom d\'utilisateur est déjà utilisé par un autre compte.' 
    })
    @Get('check-availability')
    async checkAvailability(
        @GetUser() user: User,
        @Query() dto: CheckAvailabilityDto
    ): Promise<{ available: boolean }> {
        return this.usersService.checkAvailability(dto, user.id);
    }

    // #endregion

    // #region === PATCH ===

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ 
        summary: 'Modifier mon profil', 
        description: 'Met à jour les informations de l\'utilisateur actuellement authentifié.' 
    })
    @Patch('me')
    async updateMe(
        @GetUser() user: User, 
        @Body() updateUserDto: UpdateUserDto
    ): Promise<UserResponseDto> {
        return this.usersService.update(user.id, updateUserDto);
    }

    // #endregion

    // #region === DELETE ===

    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('access-token')
    @ApiOperation({ 
        summary: 'Supprimer mon propre compte', 
        description: 'Supprime définitivement le compte de l\'utilisateur connecté.' 
    })
    @Delete('me')
    async deleteAccount(
        @GetUser() user: User
    ): Promise<{message: string}> {
        const deleted = await this.usersService.deleteUserByUuid(user.id);

        if (!deleted) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        return { message: 'Account deleted successfully' };
    }

    @ApiOperation({ 
        summary: 'Supprimer un utilisateur spécifique', 
        description: 'Supprime un utilisateur via son UUID (généralement réservé aux administrateurs).' 
    })
    @Delete(':uuid')
    async deleteUser(
        @Param('uuid') uuid: string
    ): Promise<{ message: string }> {
        const deleted = await this.usersService.deleteUserByUuid(uuid);

        if (!deleted) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        return { message: 'Account deleted successfully' };
    }

    // #endregion

}
