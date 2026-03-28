import { HealthService } from '../health.service';

const mockPrisma = {
  $queryRaw: jest.fn(),
};

describe('HealthService', () => {
  let service: HealthService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new HealthService(mockPrisma as never);
  });

  describe('check()', () => {
    it('returns { db: "ok" } when the query succeeds', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);
      const result = await service.check();
      expect(result).toEqual({ db: 'ok' });
    });

    it('returns { db: "error", error: message } when the query throws an Error', async () => {
      mockPrisma.$queryRaw.mockRejectedValue(new Error('connection refused'));
      const result = await service.check();
      expect(result).toEqual({ db: 'error', error: 'connection refused' });
    });

    it('returns { db: "error", error: string } when the query throws a non-Error', async () => {
      mockPrisma.$queryRaw.mockRejectedValue('ECONNREFUSED');
      const result = await service.check();
      expect(result).toEqual({ db: 'error', error: 'ECONNREFUSED' });
    });
  });
});
