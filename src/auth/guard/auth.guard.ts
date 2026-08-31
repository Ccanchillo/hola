import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private jwtService: JwtService, private configService: ConfigService) {}

    async canActivate(context: ExecutionContext) : Promise<boolean> {
        const peticion = context.switchToHttp().getRequest();
        const token = this.extraerToken(peticion);

        if (!token) {
            throw new UnauthorizedException('Acceso denegado: Token no proporcinado');
        }

        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.get<string>('JWT_SECRET'),
            });

            peticion['usuario'] = payload;
        } catch {
            throw new UnauthorizedException('Acceso denegado: Token invalido o expirado')
        }
        return true;
    }

    private extraerToken(request: Request): string | undefined {
        const [tipo, token] = request.headers.authorization?.split(' ') ?? [];
        return tipo === 'Bearer' ? token : undefined;
    }
} 