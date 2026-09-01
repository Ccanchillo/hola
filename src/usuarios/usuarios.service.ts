import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DrizzleService } from '../drizzle/drizzle.service';
import { usuarios } from '../drizzle/Schema/usuarios';
import { CrearUsuarioDto } from './dto/create-usuario.dto';
import * as bcrypt from 'bcrypt'; // O 'bcryptjs' si aplicaste el cambio anterior

@Injectable()
export class UsuariosService {
  constructor(private readonly drizzleService: DrizzleService) {}

  private get db() {
    return this.drizzleService.getDB();
  }

  async crear(crearUsuarioDto: CrearUsuarioDto) {
    const saltRounds = 10;
    const passwordHasheada = await bcrypt.hash(crearUsuarioDto.password, saltRounds);

    const nuevoUsuario = await this.db.insert(usuarios).values({
      email: crearUsuarioDto.email,
      password: passwordHasheada,
    }).returning();

    const { password, ...resultado } = nuevoUsuario[0];
    return resultado;
  }

  async buscarPorEmail(email: string) {
    const [resultado] = await this.db
      .select()
      .from(usuarios)
      .where(eq(usuarios.email, email));
      
    return resultado;
  }
}