import { BadRequestException, ConflictException, HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, IsNull, Not, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import * as bcrypt from 'bcryptjs';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/response-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CheckAvailabilityDto } from './dto/check-availability.dto';

@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {}

    async findAll(): Promise<UserResponseDto[]> {
        const users = await this.userRepository.find();
        return plainToInstance(UserResponseDto, users);
    }

    async create(createUserDto: CreateUserDto): Promise<User> {
        const existingUser = await this.userRepository.findOne({
            where: [
                { email: createUserDto.email },
                { username: createUserDto.username },
                { phoneNumber: createUserDto.phoneNumber },
            ],
        });

        if (existingUser) {
            if (existingUser.email === createUserDto.email) {
                throw new HttpException('Email already used', HttpStatus.CONFLICT);
            }
            if (existingUser.username === createUserDto.username) {
                throw new HttpException('Username already taken', HttpStatus.CONFLICT);
            }
            if (existingUser.phoneNumber === createUserDto.phoneNumber) {
                throw new HttpException('Phone number already used', HttpStatus.CONFLICT);
            }
        }

        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

        const user = this.userRepository.create({
            ...createUserDto,
            password: hashedPassword,
        });

        return this.userRepository.save(user);
    }

    public async validateUser(username: string, password: string): Promise<User | null> {
        const user = await this._findByUsername(username);
        if (!user) return null;

        const passwordValid = await bcrypt.compare(password, user.password);
        if (!passwordValid) return null;

        return user;
    }

    async update(id: string, updateUserDto: UpdateUserDto): Promise<UserResponseDto> {

        if (Object.keys(updateUserDto).length === 0) {
            throw new BadRequestException('You must add at least one value to change.');
        }

        const conflictConditions: FindOptionsWhere<User>[] = []; 

        if (updateUserDto.email) {
            conflictConditions.push({ email: updateUserDto.email, id: Not(id) });
        }
        if (updateUserDto.username) {
            conflictConditions.push({ username: updateUserDto.username, id: Not(id) });
        }
        if (updateUserDto.phoneNumber) {
            conflictConditions.push({ phoneNumber: updateUserDto.phoneNumber, id: Not(id) });
        }

        if (conflictConditions.length > 0) {
            const existingUser = await this.userRepository.findOne({
                where: conflictConditions
            });

            if (existingUser) {
                if (updateUserDto.email && existingUser.email === updateUserDto.email) {
                    throw new ConflictException('Email already in use');
                }

                if (updateUserDto.phoneNumber && existingUser.phoneNumber === updateUserDto.phoneNumber) {
                    throw new ConflictException('Phone number already in use');
                }
                
                throw new ConflictException('Username already taken');
            }
        }

        if (updateUserDto.password) {
            updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
        }

        await this.userRepository.update(id, updateUserDto);

        const updatedUser = await this.userRepository.findOneBy({ id });

        if (!updatedUser) {
            throw new NotFoundException('User not found');
        }

        return plainToInstance(UserResponseDto, updatedUser);
    }

    async checkAvailability(dto: CheckAvailabilityDto, currentUserId?: string): Promise<{ available: boolean }> {
        const whereConditions: FindOptionsWhere<User>[] = []; 

        if (dto.email) {
            const condition: FindOptionsWhere<User> = { email: dto.email };
        
            if (currentUserId) {
                condition.id = Not(currentUserId);
            }
            
            whereConditions.push(condition);
        }
        
        if (dto.username) {
            const condition: FindOptionsWhere<User> = { username: dto.username };

            if (currentUserId) {
                condition.id = Not(currentUserId);
            }

            whereConditions.push(condition);
        }

        if (whereConditions.length === 0) {
            return { available: true };
        }

        const count = await this.userRepository.count({
            where: whereConditions
        });

        return { available: count === 0 };
    }

    private async _findByUsername(username: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { username } });
    }

    async findByUuid(id: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { id } });
    }

    /**
     * Met à jour le refresh token hashé pour un utilisateur spécifique.
     *
     * @param uuid L'UUID de l'utilisateur à mettre à jour.
     * @param hashedToken Le nouveau token hashé, ou 'null' pour déconnecter l'utilisateur.
     */
    async setCurrentHashedRefreshToken(uuid: string, hashedToken: string | null): Promise<void> {
        if (hashedToken == null) {
            await this.userRepository.update(
                { id: uuid, currentHashedRefreshToken: Not(IsNull()) }, // Condition : seulement si non null
                { currentHashedRefreshToken: hashedToken }
            );
        } else {
            await this.userRepository.update(uuid, {
                currentHashedRefreshToken: hashedToken,
            });
        }
    }

    async deleteUserByUuid(id: string): Promise<boolean> {
        const user = await this.userRepository.findOne({ where: { id } });

        if (!user) {
            return false;
        }

        await this.userRepository.remove(user);

        return true;
    }

}
