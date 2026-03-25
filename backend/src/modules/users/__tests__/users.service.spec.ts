import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../users.service';
import { UsersRepository } from '../users.repository';
import { Role } from '@prisma/client';

const mockUser = {
  id: 'user-1',
  phone: '+84901234567',
  name: 'Test User',
  role: Role.CUSTOMER,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockUsersRepository = {
  findByPhone: jest.fn(),
  create: jest.fn(),
  findById: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: mockUsersRepository },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  describe('findByPhone', () => {
    it('returns user when phone exists', async () => {
      mockUsersRepository.findByPhone.mockResolvedValue(mockUser);

      const result = await service.findByPhone('+84901234567');

      expect(result).toEqual(mockUser);
      expect(mockUsersRepository.findByPhone).toHaveBeenCalledWith(
        '+84901234567',
      );
    });

    it('returns null when phone does not exist', async () => {
      mockUsersRepository.findByPhone.mockResolvedValue(null);

      const result = await service.findByPhone('+84999999999');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('creates and returns a new user', async () => {
      mockUsersRepository.create.mockResolvedValue(mockUser);

      const result = await service.create({
        phone: '+84901234567',
        name: 'Test User',
      });

      expect(result).toEqual(mockUser);
      expect(mockUsersRepository.create).toHaveBeenCalledWith({
        phone: '+84901234567',
        name: 'Test User',
      });
    });
  });

  describe('findById', () => {
    it('returns user when id exists', async () => {
      mockUsersRepository.findById.mockResolvedValue(mockUser);

      const result = await service.findById('user-1');

      expect(result).toEqual(mockUser);
      expect(mockUsersRepository.findById).toHaveBeenCalledWith('user-1');
    });

    it('returns null when id does not exist', async () => {
      mockUsersRepository.findById.mockResolvedValue(null);

      const result = await service.findById('nonexistent');

      expect(result).toBeNull();
    });
  });
});
