import { DrizzleService } from '../drizzle/drizzle.service';
import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { QueryTaskDto } from './dto/query-tasks.dto';
import { UpdateTasksDto } from './dto/update-tasks.dto';
import { eq, and, isNull, ilike } from 'drizzle-orm';
import { tasks } from 'src/drizzle/Schema/tasks';
import { CreateTasksDTO } from './dto/create-tasks.dto';

@Injectable()
export class TasksService {
  
    constructor(private readonly drizzleService: DrizzleService) {}

    private get db() {
    return this.drizzleService.getDB();
  }

  // private tasks = [
  //   { id: 1, titulo: 'Estudia', hecha: false },
  //   { id: 2, titulo: 'Hacer ejercicio', hecha: true },
  // ];

  obtenerTodas() {
    return this.db.select().from(tasks).where(isNull(tasks.deletedAt));
  }

  async obtenerUna(id: string) {
    const [task] = await this.db.select().from(tasks).where(and(eq(tasks.id, id), isNull(tasks.deletedAt)));

    if (!task) {
      throw new NotFoundException(`No existe la tarea con id ${id}`);
    }
    return task;
  }
  // obtenerUna(id: number) {
  //   const task = this.tasks.find((t) => t.id === id);
  //   if (!task) {
  //     // Yo no escribo el 404 el NotFoudException lo hace por mi
  //     throw new NotFoundException(`No existe la tarea con id ${id}`);
  //   }
  //   return task;
  // }

  // buscar(query: QueryTaskDto) {
  //   let resultado = this.tasks;

  //   if (query.titulo) {
  //     const buscado = query.titulo.toLowerCase();
  //     resultado = resultado.filter((t) =>
  //       t.titulo.toLowerCase().includes(buscado),
  //     );
  //   }

  //   if (query.hecha !== undefined) {
  //     resultado = resultado.filter((t) => t.hecha === query.hecha);
  //   }
  //   return resultado;
  // }

  // private siguienteId = 3;

  //crear(titulo: string) {
  //  const nueva = { id: this.siguienteId++, titulo, hecha: false };

  //  this.tasks.push(nueva);
  //  return nueva;
  //}


  // crear(titulo: string) {
  //   const repetida = this.tasks.find(
  //     (t) => t.titulo.toLocaleLowerCase() === titulo.toLocaleLowerCase(),
  //   );
  //   if (repetida) {
  //     
  //     throw new ConflictException(`Ya existe "${titulo}"`);
  //   }
  //   const nueva = { id: this.siguienteId++, titulo, hecha: false };
  //   this.tasks.push(nueva);
  //   return nueva;
  // }

  async crear(dto: CreateTasksDTO) {
    const [repetida] = await this.db.select().from(tasks).where(and(ilike(tasks.titulo, dto.titulo), isNull(tasks.deletedAt)));

    if (repetida) {
      // Yo no escribo el 409 el ConflictException lo hace por mi
      throw new ConflictException(`Ya existe "${dto.titulo}"`);
    }
    const [nueva] = await this.db.insert(tasks).values(dto).returning();
    return nueva;
  }

  // marcarHecha(id: number) {
  //   const task = this.obtenerUna(id);
  //   task.hecha = true;
  //   return task;
  // }

  // eliminar(id: number) {
  //   const task = this.obtenerUna(id);
  //   this.tasks = this.tasks.filter((t) => t.id !== id);
  //   return { mensaje: `Se eliminó la tarea "${task.titulo}"` };
  // }
  
  async eliminar(id: string) {
    const task = await this.obtenerUna(id);

  await this.db.update(tasks).set({deletedAt: new Date() }).where(eq(tasks.id, id));

  return { mensaje: `Se eliminó la tarea "${task.titulo}"`}
}
  // resumen() {
  //   const total = this.tasks.length;
  //   const hechas = this.tasks.filter((t) => t.hecha).length;

  //   return {
  //     total,
  //     hechas,
  //     pendientes: total - hechas,
  //     porcentaje: total === 0 ? 0 : Math.round((hechas / total) * 100),
  //   };
  // }
  // actualizar(id: number, dto: UpdateTasksDto) {
    //   const task = this.obtenerUna(id);
    
    //   if (dto.titulo !== undefined) task.titulo = dto.titulo;
    //   if (dto.hecha !== undefined) task.hecha = dto.hecha;
    
    //   return task;
    // }
    
    async actualizar(id: string, dto: UpdateTasksDto) {
      await this.obtenerUna(id);
  
      const [actualizada] = await this.db.update(tasks).set(dto).where(eq(tasks.id, id)).returning();
  
      return actualizada;
    }
    



}
