import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const peticion = context.switchToHttp().getRequest();
    const token = this.extraerToken(peticion);

    if (!token) {
      throw new UnauthorizedException('Acceso denegado: Token no proporcionado');
    }

    try {
      // Verificamos el token usando la misma firma secreta del .env
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      
      // Inyectamos los datos del usuario en la petición para usarlos en el controlador si es necesario
      peticion['usuario'] = payload;
    } catch {
      throw new UnauthorizedException('Acceso denegado: Token inválido o expirado');
    }

    return true;
  }

  private extraerToken(request: Request): string | undefined {
    const [tipo, token] = request.headers.authorization?.split(' ') ?? [];
    return tipo === 'Bearer' ? token : undefined;
  }
}