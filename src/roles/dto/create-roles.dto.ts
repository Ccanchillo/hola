import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';

export class CreateRolesDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  nombre!: string;

  @IsString()
  @IsOptional()
  @MaxLength(255)
  descripcion?: string;
}