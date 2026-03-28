import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import { HealthController } from '../health.controller';
import { HealthService } from '../health.service';

const mockHealthService = {
  check: jest.fn(),
};

function mockResponse(): jest.Mocked<Pick<Response, 'status' | 'json'>> & {
  status: jest.Mock;
  json: jest.Mock;
} {
  const res = {
    status: jest.fn(),
    json: jest.fn(),
  };
  res.status.mockReturnValue(res);
  res.json.mockReturnValue(res);
  return res as never;
}

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: HealthService, useValue: mockHealthService }],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    jest.clearAllMocks();
  });

  describe('GET /health', () => {
    it('returns 200 with { status: "ok", db: "ok" } when DB is healthy', async () => {
      mockHealthService.check.mockResolvedValue({ db: 'ok' });
      const res = mockResponse();

      await controller.check(res as unknown as Response);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ status: 'ok', db: 'ok' });
    });

    it('returns 503 with { status: "error", db: "error", error } when DB is down', async () => {
      mockHealthService.check.mockResolvedValue({ db: 'error', error: 'connection refused' });
      const res = mockResponse();

      await controller.check(res as unknown as Response);

      expect(res.status).toHaveBeenCalledWith(503);
      expect(res.json).toHaveBeenCalledWith({
        status: 'error',
        db: 'error',
        error: 'connection refused',
      });
    });
  });
});
