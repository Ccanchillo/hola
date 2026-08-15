import { PartialType } from '@nestjs/swagger';
import { CreateTasksDTO } from './create-tasks.dto';

export class UpdateTasksDto extends PartialType(CreateTasksDTO) {}
