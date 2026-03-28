import * as bcrypt from 'bcrypt';
import { OtpRepository } from '../otp.repository';

jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-otp'),
}));

const mockPrisma = {
  otpVerification: {
    findFirst: jest.fn(),
    deleteMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};

describe('OtpRepository', () => {
  let repo: OtpRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new OtpRepository(mockPrisma as never);
  });

  // ─── findByPhone() ────────────────────────────────────────────────────────────

  describe('findByPhone()', () => {
    it('queries by phone ordered by createdAt desc', async () => {
      const mockRecord = { id: 'otp-1', phone: '0901234567', otpHash: 'hash' };
      mockPrisma.otpVerification.findFirst.mockResolvedValue(mockRecord);

      const result = await repo.findByPhone('0901234567');

      expect(result).toBe(mockRecord);
      const call = (
        mockPrisma.otpVerification.findFirst.mock.calls as [
          { where: { phone: string }; orderBy: { createdAt: string } },
        ][]
      )[0][0];
      expect(call.where.phone).toBe('0901234567');
      expect(call.orderBy.createdAt).toBe('desc');
    });

    it('returns null when no record found', async () => {
      mockPrisma.otpVerification.findFirst.mockResolvedValue(null);
      const result = await repo.findByPhone('0901234567');
      expect(result).toBeNull();
    });
  });

  // ─── deleteByPhone() ──────────────────────────────────────────────────────────

  describe('deleteByPhone()', () => {
    it('calls deleteMany with phone filter', async () => {
      mockPrisma.otpVerification.deleteMany.mockResolvedValue({ count: 1 });
      await repo.deleteByPhone('0901234567');
      expect(mockPrisma.otpVerification.deleteMany).toHaveBeenCalledWith({
        where: { phone: '0901234567' },
      });
    });
  });

  // ─── create() ─────────────────────────────────────────────────────────────────

  describe('create()', () => {
    it('hashes the OTP and stores it with phone, purpose, and expiresAt', async () => {
      mockPrisma.otpVerification.create.mockResolvedValue({});

      await repo.create('0901234567', '123456', 'register');

      expect(bcrypt.hash).toHaveBeenCalledWith('123456', 8);
      const call = (
        mockPrisma.otpVerification.create.mock.calls as [
          { data: { phone: string; otpHash: string; purpose: string; expiresAt: Date } },
        ][]
      )[0][0];
      expect(call.data.phone).toBe('0901234567');
      expect(call.data.otpHash).toBe('hashed-otp');
      expect(call.data.purpose).toBe('register');
      expect(call.data.expiresAt).toBeInstanceOf(Date);
    });

    it('sets expiresAt approximately 5 minutes in the future', async () => {
      mockPrisma.otpVerification.create.mockResolvedValue({});
      const before = Date.now();
      await repo.create('0901234567', '123456', 'register');
      const after = Date.now();

      const call = (
        mockPrisma.otpVerification.create.mock.calls as [{ data: { expiresAt: Date } }][]
      )[0][0];
      const expMs = call.data.expiresAt.getTime();
      expect(expMs).toBeGreaterThanOrEqual(before + 4 * 60 * 1000);
      expect(expMs).toBeLessThanOrEqual(after + 6 * 60 * 1000);
    });
  });

  // ─── incrementAttempts() ──────────────────────────────────────────────────────

  describe('incrementAttempts()', () => {
    it('updates the record to increment attempts by 1', async () => {
      mockPrisma.otpVerification.update.mockResolvedValue({});
      await repo.incrementAttempts('otp-1');
      expect(mockPrisma.otpVerification.update).toHaveBeenCalledWith({
        where: { id: 'otp-1' },
        data: { attempts: { increment: 1 } },
      });
    });
  });

  // ─── delete() ─────────────────────────────────────────────────────────────────

  describe('delete()', () => {
    it('deletes the record by id', async () => {
      mockPrisma.otpVerification.delete.mockResolvedValue({});
      await repo.delete('otp-1');
      expect(mockPrisma.otpVerification.delete).toHaveBeenCalledWith({
        where: { id: 'otp-1' },
      });
    });
  });
});
