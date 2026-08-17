import { PartialType } from '@nestjs/swagger';
import { CreateCategoriasDto } from './create-categorias.dto';

export class UpdateCategoriasDto extends PartialType(CreateCategoriasDto) {}
