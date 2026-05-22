import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { TodoPriority, TodoStatus } from '../../common/enums';

export class CreateTodoDto {
  @IsString()
  @MinLength(1, { message: 'Title is required' })
  @MaxLength(200, { message: 'Title must be at most 200 characters' })
  title!: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  description?: string;

  @IsOptional()
  @IsEnum(TodoStatus, { message: 'Invalid status' })
  status?: TodoStatus;

  @IsOptional()
  @IsEnum(TodoPriority, { message: 'Invalid priority' })
  priority?: TodoPriority;

  @IsOptional()
  @IsDateString({}, { message: 'Due date must be a valid ISO 8601 date string' })
  dueDate?: string;
}
