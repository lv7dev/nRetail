jest.mock('@nestjs/passport', () => ({
  PassportStrategy: () => class {},
}));

jest.mock('passport-jwt', () => ({
  ExtractJwt: { fromAuthHeaderAsBearerToken: jest.fn().mockReturnValue(jest.fn()) },
  Strategy: class {},
}));

import { ConfigService } from '@nestjs/config';
import { JwtStrategy } from '../jwt.strategy';
import { UsersService } from '../../users/users.service';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let usersService: jest.Mocked<Pick<UsersService, 'findById'>>;

  beforeEach(() => {
    const configService = {
      getOrThrow: jest.fn().mockReturnValue('test-jwt-secret'),
    } as unknown as ConfigService;

    usersService = {
      findById: jest.fn(),
    };

    strategy = new JwtStrategy(configService, usersService as unknown as UsersService);
  });

  it('validate() calls usersService.findById with payload.sub', async () => {
    const mockUser = { id: 'user-1', phone: '0901234567', role: 'CUSTOMER' };
    usersService.findById.mockResolvedValue(mockUser as never);

    const result = await strategy.validate({
      sub: 'user-1',
      phone: '0901234567',
      role: 'CUSTOMER',
    });

    expect(usersService.findById).toHaveBeenCalledWith('user-1');
    expect(result).toBe(mockUser);
  });

  it('validate() returns null when user not found', async () => {
    usersService.findById.mockResolvedValue(null);

    const result = await strategy.validate({
      sub: 'user-1',
      phone: '0901234567',
      role: 'CUSTOMER',
    });

    expect(result).toBeNull();
  });
});
