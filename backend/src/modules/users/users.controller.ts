import { Controller } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
/* istanbul ignore next */
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
}
