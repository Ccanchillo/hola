import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DrizzleService } from '../drizzle/drizzle.service';
import { usuarios } from '../drizzle/Schema/usuarios';
import { CrearUsuarioDto } from './dto/create-usuario.dto';
import * as bcrypt from 'bcrypt'; // O 'bcryptjs' si aplicaste el cambio anterior
import { roles } from 'src/drizzle/Schema/roles';

@Injectable()
export class UsuariosService {
  constructor(private readonly drizzleService: DrizzleService) {}

  private get db() {
    return this.drizzleService.getDB();
  }

 async crear(crearUsuarioDto: CrearUsuarioDto) {
    const saltRounds = 10;
    const passwordHasheada = await bcrypt.hash(crearUsuarioDto.password, saltRounds);

    // 1. Buscamos el ID del rol básico que le asignaremos a todo nuevo registro
    const [rolPorDefecto] = await this.db
      .select({ id: roles.id })
      .from(roles)
      .where(eq(roles.nombre, 'USER')); 

    // Si la base de datos está vacía y no existe el rol, detenemos el proceso
    if (!rolPorDefecto) {
      throw new InternalServerErrorException('El rol predeterminado "USER" no está configurado en el sistema.');
    }

    // 2. Insertamos al usuario cumpliendo con la estructura exacta que exige Drizzle
    const nuevoUsuario = await this.db.insert(usuarios).values({
      email: crearUsuarioDto.email,
      password: passwordHasheada,
      rolId: rolPorDefecto.id, // Esta es la propiedad que resolvía la sobrecarga
    }).returning();

    const { password, ...resultado } = nuevoUsuario[0];
    return resultado;
  }

  async buscarPorEmail(email: string) {
    const [resultado] = await this.db
      .select({
        id: usuarios.id,
        email: usuarios.email,
        password: usuarios.password,
        rolNombre: roles.nombre, // Extraemos directamente el texto del rol
      })
      .from(usuarios)
      .innerJoin(roles, eq(usuarios.rolId, roles.id))
      .where(eq(usuarios.email, email));

    return resultado;
  }
}