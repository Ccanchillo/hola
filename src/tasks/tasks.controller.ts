import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  Body,
  Patch,
  Delete,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { CreateTasksDTO } from './dto/create-tasks.dto';
import { QueryTaskDto } from './dto/query-tasks.dto';
import { UpdateTasksDto } from './dto/update-tasks.dto';
import { LocaleDirContext } from '@react-navigation/native';


@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  obtenerTodas() {
    return this.tasksService.obtenerTodas();
  }
  // tasks/${loque sea}

  // @Get('buscar')
  // obtenerFiltros(
  //   @Query('titulo') titulo?: string,
  //   @Query('hecha') hecha?: string,
  // ) {
  //   const hechaBoolean = hecha === undefined ? undefined : hecha === 'true';
  //   return this.tasksService.buscar(titulo, hechaBoolean);
  // }

  // @Get('buscar')
  // obtenerFiltros(@Query() query: QueryTaskDto) {
  //   return this.tasksService.buscar(query);
  // }

  // @Get('resumen')
  // resumen() {
  //   return this.tasksService.resumen();
  // }

  // tasks/buscar?hecha=true
  // get tasks/
  @Get(':id')
  obtenerUna(@Param('id') id: string) {
    return this.tasksService.obtenerUna((id));
  }

  // @Post()
  // crear(@Body() body: { titulo: string }) {
  //   return this.tasksService.crear(body.titulo);
  // }

  @Post()
  crear(@Body() dto: CreateTasksDTO) {
    return this.tasksService.crear(dto);
  }

//   @Patch(':id/hecha')
//   marcarhecha(@Param('id') id: string) {
//     return this.tasksService.marcarHecha(Number(id));
//   }

  @Delete(':id')
  eliminar(@Param('id') id: string) {
    return this.tasksService.eliminar((id));
  }

  @Patch(':id')
  actualizar(@Param('id') id: string, @Body() dto: UpdateTasksDto) {
    return this.tasksService.actualizar((id), dto);
  }
// }
// DECORADORES
// PIPES

// @PARAM('id', ParseIntPipe) id: number)
// return id + 1; 43 --> sin pipe 421
//1
//2
//3
//4
}