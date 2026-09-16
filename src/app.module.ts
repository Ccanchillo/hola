
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config'
import { TasksModule } from './tasks/tasks.module';
import { CategoriasModule } from './categorias/categorias.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AuthModule } from './auth/auth.module';
import { RolesModule } from './roles/roles.module';

@Module({
  imports: [TasksModule, CategoriasModule, UsuariosModule, AuthModule,
    ConfigModule.forRoot({ isGlobal: true}), RolesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
