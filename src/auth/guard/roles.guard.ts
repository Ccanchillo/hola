import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const rolesPermitidos = this.reflector.getAllAndOverride<string[]>('roles', [
            context.getHandler(),
            context.getClass(),
        ]);

        // acceso libre si no hay decorador @Roles
        if (!rolesPermitidos) {
            return true;
        }

        // verificacion - bloqueo acceso
        const peticion = context.switchToHttp().getRequest();
        const usuario = peticion.usuario;

        if (!usuario || !rolesPermitidos.includes(usuario.rol)) {
            throw new ForbiddenException('Privilegios insuficientes (PAGA PARA TENER UN RANGO SUPERIOR');
        }
        return true;
    }
}