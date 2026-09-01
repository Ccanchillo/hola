import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const rolesRequeridos = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!rolesRequeridos) {
      return true; // Acceso libre si no hay decorador @Roles
    }

    const peticion = context.switchToHttp().getRequest();
    const usuario = peticion.usuario; // Extraído previamente por el AuthGuard

    if (!usuario || !rolesRequeridos.includes(usuario.rol)) {
      throw new ForbiddenException('Privilegios insuficientes (Requiere rol superior)');
    }

    return true;
  }
}