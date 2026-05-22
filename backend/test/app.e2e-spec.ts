import {
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import request = require('supertest');
import { AppModule } from '../src/app.module';
import { TodoPriority, TodoStatus } from '../src/common/enums';

describe('Todo Management API (e2e)', () => {
  let app: INestApplication;
  let dataSource: DataSource;

  const userA = {
    email: 'alice@example.com',
    name: 'Alice',
    password: 'Password1',
  };
  const userB = {
    email: 'bob@example.com',
    name: 'Bob',
    password: 'Password1',
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));

    await app.init();

    dataSource = app.get(DataSource);
  });

  beforeEach(async () => {
    await dataSource.query('TRUNCATE TABLE todos RESTART IDENTITY CASCADE');
    await dataSource.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');
  });

  afterAll(async () => {
    await app.close();
  });

  async function register(user: typeof userA): Promise<string> {
    const res = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(user)
      .expect(201);
    return res.body.accessToken;
  }

  describe('Authentication', () => {
    it('registers a new user and returns a token', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(userA)
        .expect(201);

      expect(res.body.accessToken).toEqual(expect.any(String));
      expect(res.body.user.email).toBe(userA.email);
      expect(res.body.user.password).toBeUndefined();
    });

    it('rejects registration with a duplicate email', async () => {
      await register(userA);
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send(userA)
        .expect(409);
    });

    it('rejects registration with a weak password', async () => {
      await request(app.getHttpServer())
        .post('/api/auth/register')
        .send({ ...userA, password: 'weak' })
        .expect(400);
    });

    it('logs in with valid credentials', async () => {
      await register(userA);
      const res = await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: userA.email, password: userA.password })
        .expect(200);

      expect(res.body.accessToken).toEqual(expect.any(String));
    });

    it('rejects login with wrong password', async () => {
      await register(userA);
      await request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: userA.email, password: 'WrongPass1' })
        .expect(401);
    });

    it('blocks /auth/me without a token', async () => {
      await request(app.getHttpServer()).get('/api/auth/me').expect(401);
    });

    it('returns the current user from /auth/me with a valid token', async () => {
      const token = await register(userA);
      const res = await request(app.getHttpServer())
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.email).toBe(userA.email);
    });
  });

  describe('Todos', () => {
    let tokenA: string;
    let tokenB: string;

    beforeEach(async () => {
      tokenA = await register(userA);
      tokenB = await register(userB);
    });

    it('creates a todo for the authenticated user', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/todos')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          title: 'Buy milk',
          priority: TodoPriority.HIGH,
        })
        .expect(201);

      expect(res.body.id).toEqual(expect.any(String));
      expect(res.body.title).toBe('Buy milk');
      expect(res.body.status).toBe(TodoStatus.PENDING);
    });

    it('rejects unauthenticated todo creation', async () => {
      await request(app.getHttpServer())
        .post('/api/todos')
        .send({ title: 'Sneaky' })
        .expect(401);
    });

    it('lists only the current user\'s todos', async () => {
      await request(app.getHttpServer())
        .post('/api/todos')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ title: 'A-todo' });

      await request(app.getHttpServer())
        .post('/api/todos')
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ title: 'B-todo' });

      const res = await request(app.getHttpServer())
        .get('/api/todos')
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      expect(res.body.items).toHaveLength(1);
      expect(res.body.items[0].title).toBe('A-todo');
      expect(res.body.total).toBe(1);
    });

    it('supports filtering by status, priority and search', async () => {
      await request(app.getHttpServer())
        .post('/api/todos')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({
          title: 'Important task',
          priority: TodoPriority.URGENT,
          status: TodoStatus.IN_PROGRESS,
        });
      await request(app.getHttpServer())
        .post('/api/todos')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ title: 'Trivial', priority: TodoPriority.LOW });

      const filtered = await request(app.getHttpServer())
        .get('/api/todos?priority=URGENT&search=Important')
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      expect(filtered.body.items).toHaveLength(1);
      expect(filtered.body.items[0].title).toBe('Important task');
    });

    it('updates a todo owned by the user', async () => {
      const created = await request(app.getHttpServer())
        .post('/api/todos')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ title: 'Buy milk' });

      const res = await request(app.getHttpServer())
        .patch(`/api/todos/${created.body.id}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ status: TodoStatus.COMPLETED })
        .expect(200);

      expect(res.body.status).toBe(TodoStatus.COMPLETED);
    });

    it('prevents user B from reading user A\'s todo', async () => {
      const created = await request(app.getHttpServer())
        .post('/api/todos')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ title: 'Private to A' });

      await request(app.getHttpServer())
        .get(`/api/todos/${created.body.id}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .expect(403);
    });

    it('prevents user B from updating user A\'s todo', async () => {
      const created = await request(app.getHttpServer())
        .post('/api/todos')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ title: 'Private to A' });

      await request(app.getHttpServer())
        .patch(`/api/todos/${created.body.id}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .send({ title: 'Hacked' })
        .expect(403);
    });

    it('prevents user B from deleting user A\'s todo', async () => {
      const created = await request(app.getHttpServer())
        .post('/api/todos')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ title: 'Private to A' });

      await request(app.getHttpServer())
        .delete(`/api/todos/${created.body.id}`)
        .set('Authorization', `Bearer ${tokenB}`)
        .expect(403);
    });

    it('deletes a todo owned by the user', async () => {
      const created = await request(app.getHttpServer())
        .post('/api/todos')
        .set('Authorization', `Bearer ${tokenA}`)
        .send({ title: 'Buy milk' });

      await request(app.getHttpServer())
        .delete(`/api/todos/${created.body.id}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(200);

      await request(app.getHttpServer())
        .get(`/api/todos/${created.body.id}`)
        .set('Authorization', `Bearer ${tokenA}`)
        .expect(404);
    });
  });
});
