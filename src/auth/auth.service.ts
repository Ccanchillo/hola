import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsuariosService } from '../usuarios/usuarios.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usuariosService: UsuariosService,
    private jwtService: JwtService
  ) {}

  async login(email: string, pass: string) {
    // 1. Buscamos el usuario en la BD
    const usuario = await this.usuariosService.buscarPorEmail(email);
    if (!usuario) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // 2. Comparamos las contraseñas
    const esValida = await bcrypt.compare(pass, usuario.password);
    if (!esValida) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // 3. Generamos el JWT
    const payload = { sub: usuario.id, email: usuario.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}