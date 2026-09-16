import { Controller, Get, Post, Body, UseGuards, ParseUUIDPipe, Param, Patch, Delete } from '@nestjs/common';
import { RolesService } from './roles.service';
import { AuthGuard } from '../auth/guard/auth.guard';
import { RolesGuard } from '../auth/guard/reoles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateRolesDto } from './dto/create-roles.dto';
import { UpdateRolesDto } from './dto/update-roles.dto';

@UseGuards(AuthGuard, RolesGuard) // 1. Verifica token válido, 2. Verifica nivel de acceso
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Post()
  crear(@Body() createRoleDto: CreateRolesDto) {
    return this.rolesService.crear(createRoleDto);
  }

  @Get()
  obtenerTodos() {
    return this.rolesService.obtenerTodos();
  }

  @Get(':id')
  obtenerUno(@Param('id', ParseUUIDPipe) id: string) {
    return this.rolesService.obtenerUno(id);
  }

  @Patch(':id')
  actualizar(@Param('id', ParseUUIDPipe) id: string, @Body() updateRoleDto: UpdateRolesDto) {
    return this.rolesService.actualizar(id, updateRoleDto);
  }

  @Delete(':id')
  eliminar(@Param('id', ParseUUIDPipe) id: string) {
    return this.rolesService.eliminar(id);
  }
}