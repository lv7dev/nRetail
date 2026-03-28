import { PhoneConfigRepository } from '../phone-config.repository';

const mockPrisma = {
  phoneConfig: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
  },
};

describe('PhoneConfigRepository', () => {
  let repo: PhoneConfigRepository;

  beforeEach(() => {
    jest.clearAllMocks();
    repo = new PhoneConfigRepository(mockPrisma as never);
  });

  // ─── findByPhone() ────────────────────────────────────────────────────────────

  describe('findByPhone()', () => {
    it('calls findUnique with phone as the where clause', async () => {
      const mockRecord = { id: 'cfg-1', phone: '0901234567', defaultOtp: '999999' };
      mockPrisma.phoneConfig.findUnique.mockResolvedValue(mockRecord);

      const result = await repo.findByPhone('0901234567');

      expect(result).toBe(mockRecord);
      expect(mockPrisma.phoneConfig.findUnique).toHaveBeenCalledWith({
        where: { phone: '0901234567' },
      });
    });

    it('returns null when no config found', async () => {
      mockPrisma.phoneConfig.findUnique.mockResolvedValue(null);
      const result = await repo.findByPhone('0901234567');
      expect(result).toBeNull();
    });
  });

  // ─── upsert() ─────────────────────────────────────────────────────────────────

  describe('upsert()', () => {
    it('upserts a phone config record', async () => {
      mockPrisma.phoneConfig.upsert.mockResolvedValue({});
      await repo.upsert('0901234567');
      expect(mockPrisma.phoneConfig.upsert).toHaveBeenCalledWith({
        where: { phone: '0901234567' },
        create: { phone: '0901234567' },
        update: {},
      });
    });
  });
});
