import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SortOrder, TodoSortBy } from '../common/enums';
import { CreateTodoDto } from './dto/create-todo.dto';
import { QueryTodosDto } from './dto/query-todos.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { Todo } from './entities/todo.entity';

export interface PaginatedTodos {
  items: Todo[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class TodosService {
  constructor(
    @InjectRepository(Todo)
    private readonly todoRepository: Repository<Todo>,
  ) {}

  async create(userId: string, dto: CreateTodoDto): Promise<Todo> {
    const todo = this.todoRepository.create({
      ...dto,
      userId,
      dueDate: dto.dueDate ? new Date(dto.dueDate) : null,
    });
    return this.todoRepository.save(todo);
  }

  async findAllForUser(
    userId: string,
    query: QueryTodosDto,
  ): Promise<PaginatedTodos> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const sortBy = query.sortBy ?? TodoSortBy.CREATED_AT;
    const sortOrder = query.sortOrder ?? SortOrder.DESC;

    const qb = this.todoRepository
      .createQueryBuilder('todo')
      .where('todo.userId = :userId', { userId });

    if (query.status) {
      qb.andWhere('todo.status = :status', { status: query.status });
    }
    if (query.priority) {
      qb.andWhere('todo.priority = :priority', { priority: query.priority });
    }
    if (query.search) {
      qb.andWhere('LOWER(todo.title) LIKE :search', {
        search: `%${query.search.toLowerCase()}%`,
      });
    }

    qb.orderBy(`todo.${sortBy}`, sortOrder, 'NULLS LAST')
      .skip((page - 1) * limit)
      .take(limit);

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async findOneForUser(userId: string, todoId: string): Promise<Todo> {
    const todo = await this.todoRepository.findOne({ where: { id: todoId } });

    if (!todo) {
      throw new NotFoundException('Todo not found');
    }
    if (todo.userId !== userId) {
      throw new ForbiddenException('You do not have access to this todo');
    }
    return todo;
  }

  async update(
    userId: string,
    todoId: string,
    dto: UpdateTodoDto,
  ): Promise<Todo> {
    const todo = await this.findOneForUser(userId, todoId);

    Object.assign(todo, {
      ...dto,
      dueDate:
        dto.dueDate === undefined
          ? todo.dueDate
          : dto.dueDate
            ? new Date(dto.dueDate)
            : null,
    });

    return this.todoRepository.save(todo);
  }

  async remove(userId: string, todoId: string): Promise<{ success: true }> {
    const todo = await this.findOneForUser(userId, todoId);
    await this.todoRepository.remove(todo);
    return { success: true };
  }
}
