import { Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { DrizzleService } from '../drizzle/drizzle.service';
import { usuarios } from 'src/drizzle/Schema/usuarios';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
    constructor(private readonly drizzleService: DrizzleService) {}

    private get db() {
        return this.drizzleService.getDB();
    }

    async crear(crearUsuariosDto: any) {
        const saltRounds = 10;
        const passwordHasheada = await bcrypt.hash(crearUsuariosDto.password, saltRounds);

        const nuevoUsuario = await this.db.insert(usuarios).values({
            email: crearUsuariosDto.email,
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