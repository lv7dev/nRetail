import { OutletRole } from '@prisma/client';
import { OutletsService } from '../outlets.service';
import { OutletsRepository } from '../outlets.repository';

const mockOutletsRepository = {
  findByUserId: jest.fn(),
};

describe('OutletsService', () => {
  let service: OutletsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new OutletsService(mockOutletsRepository as unknown as OutletsRepository);
  });

  describe('getMyOutlets()', () => {
    it('delegates to repository and returns the result', async () => {
      const expectedOutlets = [
        {
          id: 'outlet-1',
          name: 'Main Store',
          address: '123 Nguyen Hue, Q1',
          role: OutletRole.OWNER,
        },
      ];
      mockOutletsRepository.findByUserId.mockResolvedValue(expectedOutlets);

      const result = await service.getMyOutlets('user-1');

      expect(result).toBe(expectedOutlets);
      expect(mockOutletsRepository.findByUserId).toHaveBeenCalledWith('user-1');
    });

    it('returns empty array when user has no outlets', async () => {
      mockOutletsRepository.findByUserId.mockResolvedValue([]);

      const result = await service.getMyOutlets('user-1');

      expect(result).toEqual([]);
      expect(mockOutletsRepository.findByUserId).toHaveBeenCalledWith('user-1');
    });
  });
});
