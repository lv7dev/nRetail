import { UsersRepository } from '../users.repository';

const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

describe('UsersRepository', () => {
  let repo: UsersRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new UsersRepository(mockPrisma as never);
  });

  // ─── findByPhone() ────────────────────────────────────────────────────────────

  describe('findByPhone()', () => {
    it('calls findUnique with phone as the where clause', async () => {
      const mockUser = { id: 'user-1', phone: '0901234567' };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await repo.findByPhone('0901234567');

      expect(result).toBe(mockUser);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { phone: '0901234567' } });
    });

    it('returns null when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      const result = await repo.findByPhone('0901234567');
      expect(result).toBeNull();
    });
  });

  // ─── findById() ───────────────────────────────────────────────────────────────

  describe('findById()', () => {
    it('calls findUnique with id as the where clause', async () => {
      const mockUser = { id: 'user-1', phone: '0901234567' };
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await repo.findById('user-1');

      expect(result).toBe(mockUser);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { id: 'user-1' } });
    });
  });

  // ─── create() ─────────────────────────────────────────────────────────────────

  describe('create()', () => {
    it('creates a user with the provided data', async () => {
      const data = { phone: '0901234567', name: 'Test User', password: 'hashed' };
      const mockUser = { id: 'user-1', ...data };
      mockPrisma.user.create.mockResolvedValue(mockUser);

      const result = await repo.create(data);

      expect(result).toBe(mockUser);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({ data });
    });
  });

  // ─── updatePassword() ─────────────────────────────────────────────────────────

  describe('updatePassword()', () => {
    it('updates the user password by userId', async () => {
      const mockUser = { id: 'user-1', password: 'new-hash' };
      mockPrisma.user.update.mockResolvedValue(mockUser);

      const result = await repo.updatePassword('user-1', 'new-hash');

      expect(result).toBe(mockUser);
      expect(mockPrisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        data: { password: 'new-hash' },
      });
    });
  });
});
