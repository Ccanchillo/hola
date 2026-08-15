import { IsString, MinLength, MaxLength, IsOptional, IsBoolean, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTasksDTO {
  @ApiProperty({ description: 'Que chucha haces', example: 'Estudiar supuestamente' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  @IsString({ message: 'El titulo debe ser algo' })
  @MinLength(3, { message: 'El titulo debe tener al menos 3 caracteres' })
  @MaxLength(100, { message: 'El título no puede ser mas de 100 caracteres' })
  titulo!: string;

  @IsOptional()
  @IsBoolean({ message: 'hecha solo puede ser verdadero o falso' })
  hecha?: boolean;

  @IsOptional()
  @IsUUID('all', { message: 'CategoriaId debe ser un uuid válido' })
  categoriaId?: string;
}
