import { HealthCheckResult, HealthCheckService } from '@nestjs/terminus';
import { HealthController } from '../health.controller';
import { DatabaseHealthIndicator } from '../health.service';

const mockHealthService = {
  check: jest.fn(),
};

const mockDbIndicator = {
  isHealthy: jest.fn(),
};

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new HealthController(
      mockHealthService as unknown as HealthCheckService,
      mockDbIndicator as unknown as DatabaseHealthIndicator,
    );
  });

  describe('check()', () => {
    it('returns the result from HealthCheckService.check()', async () => {
      const result: HealthCheckResult = {
        status: 'ok',
        info: { database: { status: 'up' } },
        error: {},
        details: { database: { status: 'up' } },
      };
      mockHealthService.check.mockResolvedValue(result);

      await expect(controller.check()).resolves.toBe(result);
    });

    it('calls db.isHealthy("database") via the indicator function', async () => {
      mockHealthService.check.mockImplementation(
        async (indicators: Array<() => Promise<unknown>>) => {
          await indicators[0]();
          return { status: 'ok', info: {}, error: {}, details: {} };
        },
      );
      mockDbIndicator.isHealthy.mockResolvedValue({ database: { status: 'up' } });

      await controller.check();

      expect(mockDbIndicator.isHealthy).toHaveBeenCalledWith('database');
    });
  });
});
