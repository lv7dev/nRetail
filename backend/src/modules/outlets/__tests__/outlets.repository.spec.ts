import { OutletRole, UserOutletStatus } from '@prisma/client';
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
    findUnique: jest.fn(),
    update: jest.fn(),
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
        where: {
          userId: 'user-1',
          status: { in: [UserOutletStatus.CONFIRMED] },
        },
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
          status: UserOutletStatus.CONFIRMED,
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
          status: UserOutletStatus.CONFIRMED,
          createdAt: new Date(),
          outlet: mockOutlet1,
        },
        {
          id: 'membership-2',
          userId: 'user-1',
          outletId: 'outlet-2',
          role: OutletRole.MANAGER,
          status: UserOutletStatus.CONFIRMED,
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
          status: UserOutletStatus.CONFIRMED,
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

  describe('findOutlets()', () => {
    it('returns confirmed outlets for connected queries', async () => {
      mockPrisma.userOutlet.findMany.mockResolvedValue([
        {
          id: 'membership-1',
          userId: 'user-1',
          outletId: 'outlet-1',
          role: OutletRole.OWNER,
          status: UserOutletStatus.CONFIRMED,
          createdAt: new Date(),
          outlet: mockOutlet1,
        },
      ]);

      const result = await repo.findOutlets({
        userId: 'user-1',
        connected: true,
      });

      expect(result).toEqual({
        data: [
          {
            id: 'outlet-1',
            name: 'Main Store',
            address: '123 Nguyen Hue, Q1',
            role: OutletRole.OWNER,
          },
        ],
        meta: { nextCursor: null },
      });
      expect(mockPrisma.userOutlet.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          status: { in: [UserOutletStatus.CONFIRMED] },
          outlet: undefined,
        },
        include: { outlet: true },
        orderBy: { id: 'asc' },
        take: 21,
      });
    });

    it('returns pending and rejected outlets for not-connected queries', async () => {
      mockPrisma.userOutlet.findMany.mockResolvedValue([
        {
          id: 'membership-2',
          userId: 'user-1',
          outletId: 'outlet-2',
          role: OutletRole.MANAGER,
          status: UserOutletStatus.PENDING,
          createdAt: new Date(),
          outlet: mockOutlet2,
        },
      ]);

      const result = await repo.findOutlets({
        userId: 'user-1',
        connected: false,
        q: 'branch',
        cursor: 'membership-1',
      });

      expect(result).toEqual({
        data: [
          {
            id: 'outlet-2',
            name: 'Branch Store',
            address: '456 Le Van Sy, Q3',
            role: null,
            membershipStatus: UserOutletStatus.PENDING,
          },
        ],
        meta: { nextCursor: null },
      });
      expect(mockPrisma.userOutlet.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-1',
          status: { in: [UserOutletStatus.PENDING, UserOutletStatus.REJECTED] },
          outlet: {
            name: {
              contains: 'branch',
              mode: 'insensitive',
            },
          },
        },
        include: { outlet: true },
        orderBy: { id: 'asc' },
        take: 21,
        cursor: { id: 'membership-1' },
        skip: 1,
      });
    });
  });

  describe('findMembership()', () => {
    it('looks up membership by compound key', async () => {
      mockPrisma.userOutlet.findUnique.mockResolvedValue({ id: 'membership-1' });

      const result = await repo.findMembership('user-1', 'outlet-1');

      expect(result).toEqual({ id: 'membership-1' });
      expect(mockPrisma.userOutlet.findUnique).toHaveBeenCalledWith({
        where: {
          userId_outletId: {
            userId: 'user-1',
            outletId: 'outlet-1',
          },
        },
      });
    });
  });

  describe('updateMembershipStatus()', () => {
    it('updates and returns the new status', async () => {
      mockPrisma.userOutlet.update.mockResolvedValue({ status: UserOutletStatus.REJECTED });

      const result = await repo.updateMembershipStatus(
        'user-1',
        'outlet-1',
        UserOutletStatus.REJECTED,
      );

      expect(result).toBe(UserOutletStatus.REJECTED);
      expect(mockPrisma.userOutlet.update).toHaveBeenCalledWith({
        where: {
          userId_outletId: {
            userId: 'user-1',
            outletId: 'outlet-1',
          },
        },
        data: { status: UserOutletStatus.REJECTED },
        select: { status: true },
      });
    });
  });
});
