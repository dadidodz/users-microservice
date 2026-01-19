import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { plainToInstance } from 'class-transformer';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { AuthResponseDto } from './dto/auth-response-dto';
import { UserResponseDto } from '../users/dto/response-user.dto';
import { LoginDto } from './dto/login.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
    ) {}

    /**
     * Gère l'inscription complète d'un nouvel utilisateur.
     *
     * Cette méthode orchestre le processus d'inscription en :
     * 1. Faisant appel au `UserService` pour créer la nouvelle entité utilisateur (qui gère la validation d'unicité et le hachage du mot de passe).
     * 2. Générant un `access_token` JWT pour connecter automatiquement l'utilisateur après inscription.
     * 3. Filtrant l'objet utilisateur retourné (via `UserResponseDto`) pour s'assurer qu'aucune donnée sensible (ex: mot de passe) n'est exposée.
     *
     * @param createUserDto DTO contenant les données d'inscription validées (username, email, password...).
     * @returns {Promise<AuthResponseDto>} Une promesse qui résout en un objet `AuthResponseDto` contenant un message, l'access_token, et l'objet utilisateur filtré.
     * @throws {HttpException} (409 CONFLICT) - Levée par le `UserService` si l'email ou le nom d'utilisateur est déjà pris.
     * @throws {HttpException} (500 INTERNAL_SERVER_ERROR) - Levée si une erreur inattendue se produit (par exemple, échec de la génération du token ou problème de base de données non géré).
     */
    public async register(createUserDto: CreateUserDto): Promise<AuthResponseDto> {
        const user = await this.usersService.create(createUserDto);

        const access_token = this._generateAccessToken(user);
        const refresh_token = await this._generateRefreshToken(user); // Notez le 'await'
        const filteredUser = plainToInstance(UserResponseDto, user);

        return {
            message: 'User registered successfully',
            access_token,
            refresh_token,
            user: filteredUser,
        };
    }

    public async login(loginDto: LoginDto): Promise<AuthResponseDto> {
        const user = await this.usersService.validateUser(loginDto.username, loginDto.password);

        if (!user) {
            throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
        }

        const access_token = this._generateAccessToken(user);
        const refresh_token = await this._generateRefreshToken(user);
        const filteredUser = plainToInstance(UserResponseDto, user);

        return {
            message: 'Login successful',
            access_token,
            refresh_token,
            user: filteredUser,
        };
    }

    /**
     * Déconnecte l'utilisateur en supprimant son refresh token de la BDD.
     */
    async logout(uuid: string): Promise<{ message: string }> {
        await this.usersService.setCurrentHashedRefreshToken(uuid, null);
        return { message: 'Logged out successfully' };
    }

    /**
     * Valide le refresh token et génère un nouvel access_token.
     */
    async refreshAccessToken(uuid: string, incomingRefreshToken: string): Promise<{ access_token: string }> {
        const user = await this.usersService.findByUuid(uuid);
        if (!user || !user.currentHashedRefreshToken) {
            throw new HttpException('Access Denied', HttpStatus.UNAUTHORIZED);
        }

        const isTokenValid = await bcrypt.compare(
            incomingRefreshToken,
            user.currentHashedRefreshToken,
        );

        if (!isTokenValid) {
            throw new HttpException('Access Denied', HttpStatus.UNAUTHORIZED);
        }

        const access_token = this._generateAccessToken(user);
        return { access_token };
    }

    /**
     * Méthode privée pour générer un access_token.
     * @param user L'utilisateur pour qui générer le token.
     * @returns Le string de l'access_token.
     */
    private _generateAccessToken(user: UserResponseDto | User): string {
        const payload = { username: user.username, sub: user.id };
        return this.jwtService.sign(payload);
    }

    private async _generateRefreshToken(user: User): Promise<string> {
        const payload = { sub: user.id };
        const token = this.jwtService.sign(payload, {
            secret: process.env.JWT_REFRESH_SECRET,
            expiresIn: '7d',
        });

        const hashedToken = await bcrypt.hash(token, 10);
        await this.usersService.setCurrentHashedRefreshToken(user.id, hashedToken);

        return token;
    }
    

    
}
