import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  findByPhone(phone: string) {
    return this.usersRepository.findByPhone(phone);
  }

  create(data: { phone: string; name: string }) {
    return this.usersRepository.create(data);
  }

  findById(id: string) {
    return this.usersRepository.findById(id);
  }
}
