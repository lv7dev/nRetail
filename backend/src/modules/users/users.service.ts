import { Injectable } from '@nestjs/common';
import { UsersRepository } from './users.repository';

@Injectable()
/* istanbul ignore next */
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  findByPhone(phone: string) {
    return this.usersRepository.findByPhone(phone);
  }

  create(data: { phone: string; name: string; password?: string }) {
    return this.usersRepository.create(data);
  }

  findById(id: string) {
    return this.usersRepository.findById(id);
  }

  updatePassword(userId: string, hashedPassword: string) {
    return this.usersRepository.updatePassword(userId, hashedPassword);
  }
}
