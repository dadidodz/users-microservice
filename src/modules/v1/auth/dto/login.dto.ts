import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class LoginDto {
    @IsString({message: 'username must be a string'})
    @IsNotEmpty({message: 'username is required'})
    username: string;

    @IsNotEmpty({ message: 'password is required' })
    @IsString({ message: 'password must be a string' })
    @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères.' })
    @MaxLength(50, { message: 'Le mot de passe ne peut pas dépasser 50 caractères.' })
    password: string;
}