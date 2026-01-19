import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

// UpdateUserDto hérite de toutes les règles de CreateUserDto
// MAIS tous les champs deviennent optionnels (?)
export class UpdateUserDto extends PartialType(CreateUserDto) {}