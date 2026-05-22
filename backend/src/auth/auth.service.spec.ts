import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { ConfigKey } from '../common/enums';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  const baseUser: User = {
    id: 'user-1',
    email: 'jane@example.com',
    name: 'Jane',
    password: 'will-be-replaced',
    todos: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findByEmailWithPassword: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn().mockReturnValue('signed.jwt.token') },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) =>
              key === ConfigKey.BCRYPT_SALT_ROUNDS ? 4 : undefined,
            ),
          },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  describe('register', () => {
    it('hashes the password and returns an access token', async () => {
      const hashed = await bcrypt.hash('Password1', 4);
      usersService.create.mockResolvedValue({ ...baseUser, password: hashed });

      const result = await service.register({
        email: 'jane@example.com',
        name: 'Jane',
        password: 'Password1',
      });

      expect(usersService.create).toHaveBeenCalledTimes(1);
      const createArg = usersService.create.mock.calls[0][0];
      expect(createArg.email).toBe('jane@example.com');
      expect(createArg.hashedPassword).not.toBe('Password1');
      expect(await bcrypt.compare('Password1', createArg.hashedPassword)).toBe(
        true,
      );
      expect(result.accessToken).toBe('signed.jwt.token');
      expect(result.user.email).toBe('jane@example.com');
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: 'user-1',
        email: 'jane@example.com',
      });
    });

    it('propagates ConflictException when email already exists', async () => {
      usersService.create.mockRejectedValue(
        new ConflictException('Email is already registered'),
      );

      await expect(
        service.register({
          email: 'jane@example.com',
          name: 'Jane',
          password: 'Password1',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('login', () => {
    it('returns access token for valid credentials', async () => {
      const hashed = await bcrypt.hash('Password1', 4);
      usersService.findByEmailWithPassword.mockResolvedValue({
        ...baseUser,
        password: hashed,
      });

      const result = await service.login({
        email: 'jane@example.com',
        password: 'Password1',
      });

      expect(result.accessToken).toBe('signed.jwt.token');
      expect(result.user.email).toBe('jane@example.com');
    });

    it('throws UnauthorizedException for unknown email', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue(null);

      await expect(
        service.login({ email: 'ghost@example.com', password: 'x' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('throws UnauthorizedException for wrong password', async () => {
      const hashed = await bcrypt.hash('Password1', 4);
      usersService.findByEmailWithPassword.mockResolvedValue({
        ...baseUser,
        password: hashed,
      });

      await expect(
        service.login({ email: 'jane@example.com', password: 'WrongPass1' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });
});
