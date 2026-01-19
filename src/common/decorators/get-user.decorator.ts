import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Décorateur personnalisé pour extraire l'objet 'user'
 * qui a été attaché à la 'request' par le JwtAuthGuard.
 */
export const GetUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        
        return request.user;
    },
);