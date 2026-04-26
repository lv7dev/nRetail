import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { OutletRole, UserOutletStatus } from '@prisma/client';
import { OutletsService } from '../outlets.service';
import { OutletsRepository } from '../outlets.repository';

const mockOutletsRepository = {
  findByUserId: jest.fn(),
  findOutlets: jest.fn(),
  findMembership: jest.fn(),
  updateMembershipStatus: jest.fn(),
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
      expect(mockOutletsRepository.findByUserId).toHaveBeenCalledWith('user-1', [
        UserOutletStatus.CONFIRMED,
      ]);
    });

    it('returns empty array when user has no outlets', async () => {
      mockOutletsRepository.findByUserId.mockResolvedValue([]);

      const result = await service.getMyOutlets('user-1');

      expect(result).toEqual([]);
      expect(mockOutletsRepository.findByUserId).toHaveBeenCalledWith('user-1', [
        UserOutletStatus.CONFIRMED,
      ]);
    });

    it('requests only confirmed memberships', async () => {
      mockOutletsRepository.findByUserId.mockResolvedValue([]);

      await service.getMyOutlets('user-1');

      expect(mockOutletsRepository.findByUserId).toHaveBeenCalledWith('user-1', [
        UserOutletStatus.CONFIRMED,
      ]);
    });
  });

  describe('getOutlets()', () => {
    it('delegates to repository with filter params', async () => {
      const expected = {
        data: [
          {
            id: 'outlet-1',
            name: 'Pending Outlet',
            address: null,
            role: null,
            membershipStatus: UserOutletStatus.PENDING,
          },
        ],
        meta: { nextCursor: null },
      };
      mockOutletsRepository.findOutlets.mockResolvedValue(expected);

      const result = await service.getOutlets({
        userId: 'user-1',
        connected: false,
        q: 'pending',
        cursor: 'cursor-1',
      });

      expect(result).toBe(expected);
      expect(mockOutletsRepository.findOutlets).toHaveBeenCalledWith({
        userId: 'user-1',
        connected: false,
        q: 'pending',
        cursor: 'cursor-1',
      });
    });
  });

  describe('updateMembership()', () => {
    it('confirms pending memberships', async () => {
      mockOutletsRepository.findMembership.mockResolvedValue({
        status: UserOutletStatus.PENDING,
      });
      mockOutletsRepository.updateMembershipStatus.mockResolvedValue(UserOutletStatus.CONFIRMED);

      const result = await service.updateMembership('user-1', 'outlet-1', 'confirm');

      expect(result).toEqual({ status: UserOutletStatus.CONFIRMED });
      expect(mockOutletsRepository.updateMembershipStatus).toHaveBeenCalledWith(
        'user-1',
        'outlet-1',
        UserOutletStatus.CONFIRMED,
      );
    });

    it('rejects pending memberships', async () => {
      mockOutletsRepository.findMembership.mockResolvedValue({
        status: UserOutletStatus.PENDING,
      });
      mockOutletsRepository.updateMembershipStatus.mockResolvedValue(UserOutletStatus.REJECTED);

      const result = await service.updateMembership('user-1', 'outlet-1', 'reject');

      expect(result).toEqual({ status: UserOutletStatus.REJECTED });
      expect(mockOutletsRepository.updateMembershipStatus).toHaveBeenCalledWith(
        'user-1',
        'outlet-1',
        UserOutletStatus.REJECTED,
      );
    });

    it('throws when membership does not exist', async () => {
      mockOutletsRepository.findMembership.mockResolvedValue(null);

      await expect(
        service.updateMembership('user-1', 'outlet-1', 'confirm'),
      ).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throws when rejecting a confirmed membership', async () => {
      mockOutletsRepository.findMembership.mockResolvedValue({
        status: UserOutletStatus.CONFIRMED,
      });

      await expect(service.updateMembership('user-1', 'outlet-1', 'reject')).rejects.toBeInstanceOf(
        UnprocessableEntityException,
      );
    });
  });
});
