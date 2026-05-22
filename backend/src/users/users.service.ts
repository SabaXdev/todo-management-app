import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';

interface CreateUserPayload {
  email: string;
  name: string;
  hashedPassword: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create({ email, name, hashedPassword }: CreateUserPayload): Promise<User> {
    const existing = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });

    if (existing) {
      throw new ConflictException('Email is already registered');
    }

    const user = this.userRepository.create({
      email: email.toLowerCase(),
      name,
      password: hashedPassword,
    });

    return this.userRepository.save(user);
  }

  findByEmailWithPassword(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email: email.toLowerCase() },
    });
  }

  async findById(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
