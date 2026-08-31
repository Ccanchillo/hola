import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { eq, and, ne, ilike } from 'drizzle-orm';
import { DrizzleService } from '../drizzle/drizzle.service';
import { categorias } from '../drizzle/Schema/categorias';
import { tasks } from '../drizzle/Schema/tasks';
import { CreateCategoriasDto } from './dto/create-categorias.dto';
import { UpdateCategoriasDto } from './dto/update-categorias.dto';

@Injectable()
export class CategoriasService {
  constructor(private readonly drizzleService: DrizzleService) {}

  private get db() {
    return this.drizzleService.getDB();
  }

  obtenerTodas() {
    return this.db.select().from(categorias);
  }

  async obtenerUna(id: string) {
    const [categoria] = await this.db
      .select()
      .from(categorias)
      .where(eq(categorias.id, id));

    if (!categoria) {
      throw new NotFoundException(`No existe la categoría con id ${id}`);
    }
    return categoria;
  }

  async crear(dto: CreateCategoriasDto, idUsuario: string) {
    const [repetida] = await this.db
      .select()
      .from(categorias)
      .where(ilike(categorias.nombre, dto.nombre));

    if (repetida) {
      throw new ConflictException(`Ya existe "${dto.nombre}"`);
    }

    const [nueva] = await this.db.insert(categorias).values({ ...dto, usuarioId: idUsuario,}).returning();
    return nueva;
  }

  async actualizar(id: string, dto: UpdateCategoriasDto) {
    await this.obtenerUna(id);

    // Si viene un nombre nuevo, no puede chocar con el de OTRA categoría.
    // El ne() excluye a la que estamos editando: si no, se chocaría consigo misma.
    if (dto.nombre !== undefined) {
      const [repetida] = await this.db
        .select()
        .from(categorias)
        .where(and(ilike(categorias.nombre, dto.nombre), ne(categorias.id, id)));

      if (repetida) {
        throw new ConflictException(`Ya existe "${dto.nombre}"`);
      }
    }

    const [actualizada] = await this.db
      .update(categorias)
      .set(dto)
      .where(eq(categorias.id, id))
      .returning();

    return actualizada;
  }

  async eliminar(id: string) {
    const categoria = await this.obtenerUna(id);

    // categorias no tiene deletedAt, así que este borrado es real.
    // Antes hay que ver si alguna tarea la está usando: la llave foránea
    // no deja borrar una categoría que todavía está apuntada por una tarea.
    // Ojo: no se filtra por deletedAt, porque una tarea con borrado lógico
    // sigue guardando el categoriaId y sigue bloqueando el borrado.
    const [enUso] = await this.db
      .select()
      .from(tasks)
      .where(eq(tasks.categoriaId, id));

    if (enUso) {
      throw new ConflictException(
        `No se puede eliminar "${categoria.nombre}" porque hay tareas que la usan`,
      );
    }

    await this.db.delete(categorias).where(eq(categorias.id, id));

    return { mensaje: `Se eliminó la categoría "${categoria.nombre}"` };
  }
}
