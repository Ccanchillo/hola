import { Body, Controller, Post } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';

@Controller('usuarios')
export class UsuariosController {
    constructor(private readonly usuariosService: UsuariosService) {}

    @Post('registrar')
    async registrarUsuario(@Body() crearUsuarioDto: any) {
        return this.usuariosService.crear(crearUsuarioDto);
    }
}