import { Module } from '@nestjs/common';
import { TasksModule } from './tasks/tasks.module';
import { CategoriasModule } from './categorias/categorias.module';

@Module({
  imports: [TasksModule, CategoriasModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
