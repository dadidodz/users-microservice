import { Expose, Type } from 'class-transformer';

/**
 * DTO pour les réponses.
 * Définit les champs qui sont exposés publiquement à l'API.
 * Notez l'absence de validateurs (class-validator) car ces données
 * ne sont pas reçues, mais envoyées.
 */
export class UserResponseDto {
    @Expose()
    id: string;

    @Expose()
    firstName: string;

    @Expose()
    lastName: string;

    @Expose()
    username: string;

    @Expose()
    email: string;

    @Expose()
    @Type(() => Date) // Garantit que la transformation est bien une Date
    birthDate: Date;

    @Expose()
    phoneNumber: string;

    @Expose()
    @Type(() => Date) // Garantit que la transformation est bien une Date
    createdAt: Date;
}