import { Injectable, NotFoundException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly usersService: UsersService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_SECRET || 'secretKey',
        });
    }

    async validate(payload: { sub: string; username: string }): Promise<User> {
        const user = await this.usersService.findByUuid(payload.sub);
        if (!user) throw new NotFoundException('Invalid token or user');
        return user;
    }
}