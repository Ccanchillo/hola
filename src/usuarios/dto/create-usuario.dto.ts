import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CrearUsuarioDto {
  @ApiProperty({
    example: 'bruno@ejemplo.com',
    description: 'Correo electrónico único del usuario',
    maxLength: 255,
  })
  @IsEmail()
  @IsNotEmpty()
  @MaxLength(255)
  email!: string;

  @ApiProperty({
    example: 'ClaveSegura123',
    description: 'Contraseña en texto plano (debe ser encriptada antes de guardar)',
    minLength: 6,
    maxLength: 255,
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(255)
  password!: string;
}