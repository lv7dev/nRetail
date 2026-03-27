import * as bcrypt from 'bcrypt';
import { RefreshTokenRepository } from '../refresh-token.repository';

const mockPrisma = {
  refreshToken: {
    create: jest.fn(),
    findMany: jest.fn(),
    delete: jest.fn(),
    deleteMany: jest.fn(),
    count: jest.fn(),
    findFirst: jest.fn(),
  },
};

describe('RefreshTokenRepository', () => {
  let repo: RefreshTokenRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new RefreshTokenRepository(mockPrisma as never);
  });

  // ─── create() ────────────────────────────────────────────────────────────────

  describe('create()', () => {
    it('returns a 64-char hex raw token', async () => {
      mockPrisma.refreshToken.create.mockResolvedValue({});
      const raw = await repo.create('user-1');
      expect(typeof raw).toBe('string');
      expect(raw).toMatch(/^[0-9a-f]{64}$/);
    });

    it('stores tokenPrefix equal to first 8 chars of raw token', async () => {
      mockPrisma.refreshToken.create.mockResolvedValue({});
      const raw = await repo.create('user-1');
      const calls = mockPrisma.refreshToken.create.mock.calls as [
        { data: { tokenPrefix: string } },
      ][];
      expect(calls[0][0].data.tokenPrefix).toBe(raw.slice(0, 8));
    });

    it('stores a bcrypt hash different from raw token', async () => {
      mockPrisma.refreshToken.create.mockResolvedValue({});
      const raw = await repo.create('user-1');
      const calls = mockPrisma.refreshToken.create.mock.calls as [
        { data: { tokenHash: string } },
      ][];
      expect(calls[0][0].data.tokenHash).not.toBe(raw);
      expect(calls[0][0].data.tokenHash).toMatch(/^\$2[ab]\$/);
    });
  });

  // ─── findAndDelete() ─────────────────────────────────────────────────────────

  describe('findAndDelete()', () => {
    it('finds token by prefix and returns it on bcrypt match', async () => {
      const raw = 'abcdef1234567890'.repeat(4); // 64 chars
      const hash = await bcrypt.hash(raw, 8);
      mockPrisma.refreshToken.findMany.mockResolvedValue([
        {
          id: 'tok-1',
          userId: 'user-1',
          tokenHash: hash,
          tokenPrefix: raw.slice(0, 8),
          expiresAt: new Date(Date.now() + 60_000),
        },
      ]);
      mockPrisma.refreshToken.delete.mockResolvedValue({});

      const result = await repo.findAndDelete(raw);
      expect(result).not.toBeNull();
      expect(result?.id).toBe('tok-1');
      expect(mockPrisma.refreshToken.delete).toHaveBeenCalledWith({
        where: { id: 'tok-1' },
      });
    });

    it('returns null when no token matches the prefix', async () => {
      mockPrisma.refreshToken.findMany.mockResolvedValue([]);
      const result = await repo.findAndDelete('unknowntoken'.padEnd(64, '0'));
      expect(result).toBeNull();
    });

    it('returns null when prefix matches but bcrypt does not', async () => {
      const raw = 'abcdef1234567890'.repeat(4);
      const wrongHash = await bcrypt.hash('differenttoken'.padEnd(64, '0'), 8);
      mockPrisma.refreshToken.findMany.mockResolvedValue([
        {
          id: 'tok-1',
          userId: 'user-1',
          tokenHash: wrongHash,
          tokenPrefix: raw.slice(0, 8),
          expiresAt: new Date(Date.now() + 60_000),
        },
      ]);

      const result = await repo.findAndDelete(raw);
      expect(result).toBeNull();
      expect(mockPrisma.refreshToken.delete).not.toHaveBeenCalled();
    });

    it('handles prefix collision: bcrypt-compares all candidates and matches correct one', async () => {
      const raw1 = 'abcdef12' + 'a'.repeat(56);
      const raw2 = 'abcdef12' + 'b'.repeat(56); // same prefix, different token
      const hash1 = await bcrypt.hash(raw1, 8);
      const hash2 = await bcrypt.hash(raw2, 8);

      mockPrisma.refreshToken.findMany.mockResolvedValue([
        {
          id: 'tok-1',
          userId: 'user-1',
          tokenHash: hash1,
          tokenPrefix: 'abcdef12',
          expiresAt: new Date(Date.now() + 60_000),
        },
        {
          id: 'tok-2',
          userId: 'user-1',
          tokenHash: hash2,
          tokenPrefix: 'abcdef12',
          expiresAt: new Date(Date.now() + 60_000),
        },
      ]);
      mockPrisma.refreshToken.delete.mockResolvedValue({});

      const result = await repo.findAndDelete(raw2);
      expect(result?.id).toBe('tok-2');
      expect(mockPrisma.refreshToken.delete).toHaveBeenCalledWith({
        where: { id: 'tok-2' },
      });
    });

    it('falls back to full scan for legacy rows with empty tokenPrefix', async () => {
      const raw = 'legacytoken'.padEnd(64, '0');
      const hash = await bcrypt.hash(raw, 8);
      // prefix query returns nothing (empty prefix stored), fallback returns legacy row
      mockPrisma.refreshToken.findMany
        .mockResolvedValueOnce([]) // prefix lookup
        .mockResolvedValueOnce([
          // fallback scan
          {
            id: 'tok-legacy',
            userId: 'user-1',
            tokenHash: hash,
            tokenPrefix: '',
            expiresAt: new Date(Date.now() + 60_000),
          },
        ]);
      mockPrisma.refreshToken.delete.mockResolvedValue({});

      const result = await repo.findAndDelete(raw);
      expect(result?.id).toBe('tok-legacy');
    });
  });

  // ─── deleteExpiredByUserId() ──────────────────────────────────────────────────

  describe('deleteExpiredByUserId()', () => {
    it('calls deleteMany with userId and expiresAt < now', async () => {
      mockPrisma.refreshToken.deleteMany.mockResolvedValue({ count: 2 });
      await repo.deleteExpiredByUserId('user-1');
      const deleteCall = (
        mockPrisma.refreshToken.deleteMany.mock.calls as [{ where: { userId: string } }][]
      )[0][0];
      expect(deleteCall.where.userId).toBe('user-1');
    });
  });

  // ─── countActiveByUserId() ────────────────────────────────────────────────────

  describe('countActiveByUserId()', () => {
    it('returns count of non-expired tokens for user', async () => {
      mockPrisma.refreshToken.count.mockResolvedValue(3);
      const count = await repo.countActiveByUserId('user-1');
      expect(count).toBe(3);
      const countCall = (
        mockPrisma.refreshToken.count.mock.calls as [{ where: { userId: string } }][]
      )[0][0];
      expect(countCall.where.userId).toBe('user-1');
    });
  });

  // ─── deleteOldestByUserId() ───────────────────────────────────────────────────

  describe('deleteOldestByUserId()', () => {
    it('deletes the token with the earliest expiresAt for the user', async () => {
      mockPrisma.refreshToken.findFirst.mockResolvedValue({ id: 'tok-old' });
      mockPrisma.refreshToken.delete.mockResolvedValue({});

      await repo.deleteOldestByUserId('user-1');

      const findCall = (
        mockPrisma.refreshToken.findFirst.mock.calls as [
          { where: { userId: string }; orderBy: { expiresAt: string } },
        ][]
      )[0][0];
      expect(findCall.where.userId).toBe('user-1');
      expect(findCall.orderBy.expiresAt).toBe('asc');
      expect(mockPrisma.refreshToken.delete).toHaveBeenCalledWith({
        where: { id: 'tok-old' },
      });
    });

    it('does nothing if no tokens exist for user', async () => {
      mockPrisma.refreshToken.findFirst.mockResolvedValue(null);
      await repo.deleteOldestByUserId('user-1');
      expect(mockPrisma.refreshToken.delete).not.toHaveBeenCalled();
    });
  });
});
