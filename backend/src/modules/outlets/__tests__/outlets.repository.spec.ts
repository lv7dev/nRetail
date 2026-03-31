import { OutletRole } from '@prisma/client';
import { OutletsRepository } from '../outlets.repository';

const mockOutlet1 = {
  id: 'outlet-1',
  name: 'Main Store',
  address: '123 Nguyen Hue, Q1',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockOutlet2 = {
  id: 'outlet-2',
  name: 'Branch Store',
  address: '456 Le Van Sy, Q3',
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPrisma = {
  userOutlet: {
    findMany: jest.fn(),
  },
};

describe('OutletsRepository', () => {
  let repo: OutletsRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new OutletsRepository(mockPrisma as never);
  });

  describe('findByUserId()', () => {
    it('returns empty array when user has no outlet memberships', async () => {
      mockPrisma.userOutlet.findMany.mockResolvedValue([]);

      const result = await repo.findByUserId('user-1');

      expect(result).toEqual([]);
      expect(mockPrisma.userOutlet.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        include: { outlet: true },
      });
    });

    it('maps a single membership to MyOutletResponse shape', async () => {
      mockPrisma.userOutlet.findMany.mockResolvedValue([
        {
          id: 'membership-1',
          userId: 'user-1',
          outletId: 'outlet-1',
          role: OutletRole.OWNER,
          createdAt: new Date(),
          outlet: mockOutlet1,
        },
      ]);

      const result = await repo.findByUserId('user-1');

      expect(result).toEqual([
        {
          id: 'outlet-1',
          name: 'Main Store',
          address: '123 Nguyen Hue, Q1',
          role: OutletRole.OWNER,
        },
      ]);
    });

    it('maps multiple memberships to MyOutletResponse array', async () => {
      mockPrisma.userOutlet.findMany.mockResolvedValue([
        {
          id: 'membership-1',
          userId: 'user-1',
          outletId: 'outlet-1',
          role: OutletRole.OWNER,
          createdAt: new Date(),
          outlet: mockOutlet1,
        },
        {
          id: 'membership-2',
          userId: 'user-1',
          outletId: 'outlet-2',
          role: OutletRole.MANAGER,
          createdAt: new Date(),
          outlet: mockOutlet2,
        },
      ]);

      const result = await repo.findByUserId('user-1');

      expect(result).toEqual([
        {
          id: 'outlet-1',
          name: 'Main Store',
          address: '123 Nguyen Hue, Q1',
          role: OutletRole.OWNER,
        },
        {
          id: 'outlet-2',
          name: 'Branch Store',
          address: '456 Le Van Sy, Q3',
          role: OutletRole.MANAGER,
        },
      ]);
    });

    it('maps outlet with null address correctly', async () => {
      mockPrisma.userOutlet.findMany.mockResolvedValue([
        {
          id: 'membership-1',
          userId: 'user-1',
          outletId: 'outlet-1',
          role: OutletRole.STAFF,
          createdAt: new Date(),
          outlet: { ...mockOutlet1, address: null },
        },
      ]);

      const result = await repo.findByUserId('user-1');

      expect(result).toEqual([
        {
          id: 'outlet-1',
          name: 'Main Store',
          address: null,
          role: OutletRole.STAFF,
        },
      ]);
    });
  });
});
