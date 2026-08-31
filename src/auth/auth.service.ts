import { Injectable, UnauthorizedException } from "@nestjs/common";
import { UsuariosService } from "src/usuarios/usuarios.service";
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';


@Injectable()
export class AuthService {
    constructor(private usuariosService: UsuariosService, private jwtService: JwtService) {}

    async login(email: string, pass: string) {
        // Buscar usuario
        const usuario = await this.usuariosService.buscarPorEmail(email);
        if (!usuario) {
            throw new UnauthorizedException('Credenciales Incorrectas');
        }

        // Comparar contraseñas
        const esValida = await bcrypt.compare(pass, usuario.password);
        if (!esValida) {
            throw new UnauthorizedException('Credenciales Incorrectas');
        }

        // Genera el JWT
        const payload = { sub: usuario.id, email: usuario.email};
        return {
            access_token: await this.jwtService.signAsync(payload),
        };
    }

}