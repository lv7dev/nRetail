import { HealthCheckError } from '@nestjs/terminus';
import { DatabaseHealthIndicator } from '../health.service';

const mockPrisma = {
  $queryRaw: jest.fn(),
};

describe('DatabaseHealthIndicator', () => {
  let indicator: DatabaseHealthIndicator;

  beforeEach(() => {
    jest.clearAllMocks();
    indicator = new DatabaseHealthIndicator(mockPrisma as never);
  });

  describe('isHealthy()', () => {
    it('returns up status when the query succeeds', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ '?column?': 1 }]);
      const result = await indicator.isHealthy('database');
      expect(result).toEqual({ database: { status: 'up' } });
    });

    it('throws HealthCheckError when the query throws an Error', async () => {
      mockPrisma.$queryRaw.mockRejectedValue(new Error('connection refused'));
      await expect(indicator.isHealthy('database')).rejects.toBeInstanceOf(HealthCheckError);
    });

    it('includes the error message in HealthCheckError causes', async () => {
      mockPrisma.$queryRaw.mockRejectedValue(new Error('connection refused'));
      const error = await indicator.isHealthy('database').catch((e: HealthCheckError) => e);
      expect((error as HealthCheckError).causes).toMatchObject({
        database: { status: 'down', message: 'connection refused' },
      });
    });

    it('coerces non-Error thrown values to string', async () => {
      mockPrisma.$queryRaw.mockRejectedValue('ECONNREFUSED');
      const error = await indicator.isHealthy('database').catch((e: HealthCheckError) => e);
      expect((error as HealthCheckError).causes).toMatchObject({
        database: { status: 'down', message: 'ECONNREFUSED' },
      });
    });
  });
});
