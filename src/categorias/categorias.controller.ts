import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Patch,
  Delete,
} from '@nestjs/common';
import { CategoriasService } from './categorias.service';
import { CreateCategoriasDto } from './dto/create-categorias.dto';
import { UpdateCategoriasDto } from './dto/update-categorias.dto';

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
  crear(@Body() dto: CreateCategoriasDto) {
    return this.categoriasService.crear(dto);
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
