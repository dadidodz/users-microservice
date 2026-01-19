import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            secretOrKey: process.env.JWT_REFRESH_SECRET,
            passReqToCallback: true, // Pour pouvoir récupérer le token depuis la requête
        });
    }

    async validate(req: Request, payload: { sub: string; username: string }) {
        const refreshToken = req.get('Authorization')!.replace('Bearer ', '').trim();
        
        return { 
            uuid: payload.sub, 
            refreshToken 
        };
    }
}