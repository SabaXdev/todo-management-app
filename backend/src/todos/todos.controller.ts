import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { CreateTodoDto } from './dto/create-todo.dto';
import { QueryTodosDto } from './dto/query-todos.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { Todo } from './entities/todo.entity';
import { PaginatedTodos, TodosService } from './todos.service';

@Controller('todos')
@UseGuards(JwtAuthGuard)
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  create(
    @CurrentUser() user: User,
    @Body() dto: CreateTodoDto,
  ): Promise<Todo> {
    return this.todosService.create(user.id, dto);
  }

  @Get()
  findAll(
    @CurrentUser() user: User,
    @Query() query: QueryTodosDto,
  ): Promise<PaginatedTodos> {
    return this.todosService.findAllForUser(user.id, query);
  }

  @Get(':id')
  findOne(
    @CurrentUser() user: User,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<Todo> {
    return this.todosService.findOneForUser(user.id, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: User,
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateTodoDto,
  ): Promise<Todo> {
    return this.todosService.update(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  remove(
    @CurrentUser() user: User,
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<{ success: true }> {
    return this.todosService.remove(user.id, id);
  }
}
