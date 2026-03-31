import { ThrottlerModule } from '@nestjs/throttler';
import { Test, TestingModule } from '@nestjs/testing';
import { OutletRole } from '@prisma/client';
import { OutletsController } from '../outlets.controller';
import { OutletsService } from '../outlets.service';

const mockOutletsService = {
  getMyOutlets: jest.fn(),
};

const mockUser = {
  id: 'user-1',
  phone: '0901234567',
  name: 'Test User',
  role: 'CUSTOMER',
};

describe('OutletsController', () => {
  let controller: OutletsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ThrottlerModule.forRoot([{ limit: 999, ttl: 1 }])],
      controllers: [OutletsController],
      providers: [{ provide: OutletsService, useValue: mockOutletsService }],
    }).compile();

    controller = module.get<OutletsController>(OutletsController);
    jest.clearAllMocks();
  });

  describe('GET /outlets/mine', () => {
    it('returns the list of outlets for the current user', async () => {
      const expectedOutlets = [
        {
          id: 'outlet-1',
          name: 'Main Store',
          address: '123 Nguyen Hue, Q1',
          role: OutletRole.OWNER,
        },
      ];
      mockOutletsService.getMyOutlets.mockResolvedValue(expectedOutlets);

      const result = await controller.getMyOutlets(mockUser as never);

      expect(result).toBe(expectedOutlets);
      expect(mockOutletsService.getMyOutlets).toHaveBeenCalledWith('user-1');
    });

    it('returns empty array when user has no outlets', async () => {
      mockOutletsService.getMyOutlets.mockResolvedValue([]);

      const result = await controller.getMyOutlets(mockUser as never);

      expect(result).toEqual([]);
      expect(mockOutletsService.getMyOutlets).toHaveBeenCalledWith('user-1');
    });
  });
});
