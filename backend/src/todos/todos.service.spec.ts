import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { SortOrder, TodoPriority, TodoSortBy, TodoStatus } from '../common/enums';
import { Todo } from './entities/todo.entity';
import { TodosService } from './todos.service';

describe('TodosService', () => {
  let service: TodosService;
  let repo: jest.Mocked<Repository<Todo>>;

  const ownerId = 'owner-id';
  const otherUserId = 'other-id';

  const makeTodo = (overrides: Partial<Todo> = {}): Todo => ({
    id: 'todo-1',
    title: 'Buy milk',
    description: null,
    status: TodoStatus.PENDING,
    priority: TodoPriority.MEDIUM,
    dueDate: null,
    userId: ownerId,
    user: undefined as unknown as Todo['user'],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TodosService,
        {
          provide: getRepositoryToken(Todo),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            findOne: jest.fn(),
            remove: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get(TodosService);
    repo = module.get(getRepositoryToken(Todo));
  });

  describe('create', () => {
    it('creates a todo for the given user', async () => {
      const todo = makeTodo();
      repo.create.mockReturnValue(todo);
      repo.save.mockResolvedValue(todo);

      const result = await service.create(ownerId, { title: 'Buy milk' });

      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Buy milk', userId: ownerId }),
      );
      expect(result).toBe(todo);
    });
  });

  describe('findOneForUser', () => {
    it('returns the todo when it belongs to the user', async () => {
      const todo = makeTodo();
      repo.findOne.mockResolvedValue(todo);

      const result = await service.findOneForUser(ownerId, 'todo-1');
      expect(result).toBe(todo);
    });

    it('throws NotFoundException when the todo does not exist', async () => {
      repo.findOne.mockResolvedValue(null);
      await expect(service.findOneForUser(ownerId, 'missing')).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('throws ForbiddenException when accessing another user\'s todo', async () => {
      repo.findOne.mockResolvedValue(makeTodo({ userId: otherUserId }));
      await expect(service.findOneForUser(ownerId, 'todo-1')).rejects.toBeInstanceOf(
        ForbiddenException,
      );
    });
  });

  describe('update', () => {
    it('updates a todo owned by the user', async () => {
      const todo = makeTodo();
      repo.findOne.mockResolvedValue(todo);
      repo.save.mockImplementation(async (t) => t as Todo);

      const result = await service.update(ownerId, 'todo-1', {
        title: 'Buy oat milk',
      });

      expect(result.title).toBe('Buy oat milk');
    });

    it('refuses to update another user\'s todo', async () => {
      repo.findOne.mockResolvedValue(makeTodo({ userId: otherUserId }));
      await expect(
        service.update(ownerId, 'todo-1', { title: 'Hacked' }),
      ).rejects.toBeInstanceOf(ForbiddenException);
      expect(repo.save).not.toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('removes a todo owned by the user', async () => {
      const todo = makeTodo();
      repo.findOne.mockResolvedValue(todo);
      repo.remove.mockResolvedValue(todo);

      const result = await service.remove(ownerId, 'todo-1');
      expect(result).toEqual({ success: true });
      expect(repo.remove).toHaveBeenCalledWith(todo);
    });

    it('refuses to remove another user\'s todo', async () => {
      repo.findOne.mockResolvedValue(makeTodo({ userId: otherUserId }));
      await expect(service.remove(ownerId, 'todo-1')).rejects.toBeInstanceOf(
        ForbiddenException,
      );
      expect(repo.remove).not.toHaveBeenCalled();
    });
  });

  describe('findAllForUser', () => {
    it('applies filters, search, sort and pagination scoped to the user', async () => {
      const items = [makeTodo()];

      const qb = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([items, 1]),
      } as unknown as SelectQueryBuilder<Todo>;

      repo.createQueryBuilder.mockReturnValue(qb);

      const result = await service.findAllForUser(ownerId, {
        status: TodoStatus.PENDING,
        priority: TodoPriority.HIGH,
        search: 'milk',
        sortBy: TodoSortBy.DUE_DATE,
        sortOrder: SortOrder.ASC,
        page: 2,
        limit: 5,
      });

      expect(qb.where).toHaveBeenCalledWith('todo.userId = :userId', {
        userId: ownerId,
      });
      expect(qb.andWhere).toHaveBeenCalledWith('todo.status = :status', {
        status: TodoStatus.PENDING,
      });
      expect(qb.andWhere).toHaveBeenCalledWith('todo.priority = :priority', {
        priority: TodoPriority.HIGH,
      });
      expect(qb.andWhere).toHaveBeenCalledWith(
        'LOWER(todo.title) LIKE :search',
        { search: '%milk%' },
      );
      expect(qb.orderBy).toHaveBeenCalledWith(
        'todo.dueDate',
        SortOrder.ASC,
        'NULLS LAST',
      );
      expect(qb.skip).toHaveBeenCalledWith(5);
      expect(qb.take).toHaveBeenCalledWith(5);

      expect(result).toEqual({
        items,
        total: 1,
        page: 2,
        limit: 5,
        totalPages: 1,
      });
    });
  });
});
