import { Module } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { UsuariosController } from './usuarios.controller';
import { DrizzleModule } from '../drizzle/drizzle.module'; // Ruta basada en tu repositorio[cite: 1]

@Module({
  imports: [DrizzleModule], 
  controllers: [UsuariosController],
  providers: [UsuariosService],
  exports: [UsuariosService], 
})
export class UsuariosModule {}