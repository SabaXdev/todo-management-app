import { ConfigKey } from '../common/enums';

export const loadConfiguration = () => ({
  [ConfigKey.NODE_ENV]: process.env.NODE_ENV ?? 'development',
  [ConfigKey.PORT]: parseInt(process.env.PORT ?? '3000', 10),
  [ConfigKey.CORS_ORIGIN]: process.env.CORS_ORIGIN ?? 'http://localhost:4200',

  [ConfigKey.DATABASE_HOST]: process.env.DATABASE_HOST ?? '127.0.0.1',
  [ConfigKey.DATABASE_PORT]: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
  [ConfigKey.DATABASE_USER]: process.env.DATABASE_USER ?? 'postgres',
  [ConfigKey.DATABASE_PASSWORD]: process.env.DATABASE_PASSWORD ?? 'postgres',
  [ConfigKey.DATABASE_NAME]: process.env.DATABASE_NAME ?? 'todo_management',
  [ConfigKey.DATABASE_SYNC]: process.env.DATABASE_SYNC === 'true',
  [ConfigKey.DATABASE_SSL]: process.env.DATABASE_SSL === 'true',

  [ConfigKey.JWT_SECRET]: process.env.JWT_SECRET ?? 'change-me-in-env',
  [ConfigKey.JWT_EXPIRES_IN]: process.env.JWT_EXPIRES_IN ?? '1d',

  [ConfigKey.BCRYPT_SALT_ROUNDS]: parseInt(
    process.env.BCRYPT_SALT_ROUNDS ?? '10',
    10,
  ),
});
