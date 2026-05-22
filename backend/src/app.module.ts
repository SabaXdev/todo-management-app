import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ConfigKey } from './common/enums';
import { loadConfiguration } from './config/configuration';
import { envValidationSchema } from './config/validation.schema';
import { Todo } from './todos/entities/todo.entity';
import { TodosModule } from './todos/todos.module';
import { User } from './users/entities/user.entity';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [loadConfiguration],
      validationSchema: envValidationSchema,
      validationOptions: { allowUnknown: true, abortEarly: true },
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>(ConfigKey.DATABASE_HOST, { infer: true }),
        port: configService.get<number>(ConfigKey.DATABASE_PORT, { infer: true }),
        username: configService.get<string>(ConfigKey.DATABASE_USER, {
          infer: true,
        }),
        password: configService.get<string>(ConfigKey.DATABASE_PASSWORD, {
          infer: true,
        }),
        database: configService.get<string>(ConfigKey.DATABASE_NAME, {
          infer: true,
        }),
        entities: [User, Todo],
        synchronize: configService.get<boolean>(ConfigKey.DATABASE_SYNC, {
          infer: true,
        }),
        autoLoadEntities: true,
      }),
    }),
    AuthModule,
    UsersModule,
    TodosModule,
  ],
})
export class AppModule {}
