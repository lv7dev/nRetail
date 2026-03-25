import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  findByPhone(phone: string): Promise<User | null> {
    return this.usersRepository.findByPhone(phone);
  }

  create(data: { phone: string; name: string }): Promise<User> {
    return this.usersRepository.create(data);
  }

  findById(id: string): Promise<User | null> {
    return this.usersRepository.findById(id);
  }
}
