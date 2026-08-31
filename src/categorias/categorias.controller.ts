import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Patch,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { CategoriasService } from './categorias.service';
import { CreateCategoriasDto } from './dto/create-categorias.dto';
import { UpdateCategoriasDto } from './dto/update-categorias.dto';
import { AuthGuard } from 'src/auth/guard/auth.guard';
import { Usuario } from 'src/auth/decorators/usuario.decorator';

@UseGuards(AuthGuard)
@Controller('categorias')
export class CategoriasController {
  constructor(private readonly categoriasService: CategoriasService) {}

  @Get()
  obtenerTodas() {
    return this.categoriasService.obtenerTodas();
  }

  @Get(':id')
  obtenerUna(@Param('id') id: string) {
    return this.categoriasService.obtenerUna(id);
  }

  @Post()
  crear(@Body() dto: CreateCategoriasDto, @Usuario('sub') idUsuario: string) {
    return this.categoriasService.crear(dto, idUsuario);
  }

  @Patch(':id')
  actualizar(@Param('id') id: string, @Body() dto: UpdateCategoriasDto) {
    return this.categoriasService.actualizar(id, dto);
  }

  @Delete(':id')
  eliminar(@Param('id') id: string) {
    return this.categoriasService.eliminar(id);
  }
}
