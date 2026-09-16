import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { eq, ilike } from 'drizzle-orm';
import { DrizzleService } from '../drizzle/drizzle.service';
import { roles } from '../drizzle/Schema/roles';
import { CreateRolesDto } from './dto/create-roles.dto';
import { UpdateRolesDto } from './dto/update-roles.dto';

@Injectable()
export class RolesService {
  constructor(private readonly drizzleService: DrizzleService) {}
  
  private get db() { 
    return this.drizzleService.getDB(); 
  }

  async crear(dto: CreateRolesDto) {
    const [repetido] = await this.db.select().from(roles).where(ilike(roles.nombre, dto.nombre));
    
    if (repetido) {
      throw new ConflictException(`El rol "${dto.nombre}" ya existe`);
    }
    
    const [nuevo] = await this.db.insert(roles).values(dto).returning();
    return nuevo;
  }

  obtenerTodos() {
    return this.db.select().from(roles);
  }

  async obtenerUno(id: string) {
    const [rol] = await this.db
      .select()
      .from(roles)
      .where(eq(roles.id, id));
    
    if (!rol) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }
    return rol;
  }

  async actualizar(id: string, dto: UpdateRolesDto) {
    if (dto.nombre) {
      const [repetido] = await this.db.select().from(roles).where(ilike(roles.nombre, dto.nombre));
      
      if (repetido && repetido.id !== id) {
        throw new ConflictException(`El rol "${dto.nombre}" ya existe`);
      }
    }

    const [rolActualizado] = await this.db
      .update(roles)
      .set(dto)
      .where(eq(roles.id, id))
      .returning();
      
    if (!rolActualizado) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }
    return rolActualizado;
  }

  async eliminar(id: string) {
    const [rolEliminado] = await this.db
      .delete(roles)
      .where(eq(roles.id, id))
      .returning();
      
    if (!rolEliminado) {
      throw new NotFoundException(`Rol con ID ${id} no encontrado`);
    }
    return { mensaje: 'Rol eliminado correctamente' };
  }
}