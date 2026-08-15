import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, Max, Min, IsString } from 'class-validator';

export class QueryTaskDto {
  @IsOptional()
  @IsString()
  titulo?: string;

  @IsOptional()
  @Transform(({ value }) => value === 'true' ? true : value === 'false' ? false : value,
  )
  @IsBoolean({ message: 'hecha solo puede ser true o false' })
  hecha?: boolean;

   @IsOptional()
   @Type(() => Number)
   @IsInt({ message: 'page debe ser un numero entero' })
   @Min(1, { message: 'page empieza en 1' })
   page?: number = 1;

   @IsOptional()
   @Type(() => Number)
   @IsInt()
   @Min(1)
  @Max(100, { message: 'No se pueden pedir más de 100 por pagina' })
   pageSize?: number = 10;
}
