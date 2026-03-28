jest.mock('@prisma/adapter-pg', () => ({
  PrismaPg: jest.fn().mockReturnValue({}),
}));

jest.mock('@prisma/client', () => ({
  PrismaClient: class {
    $connect = jest.fn().mockResolvedValue(undefined);
    $disconnect = jest.fn().mockResolvedValue(undefined);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    constructor(..._args: unknown[]) {}
  },
}));

import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(() => {
    const configService = {
      getOrThrow: jest.fn().mockReturnValue('postgresql://test:test@localhost:5432/test'),
    } as unknown as ConfigService;
    service = new PrismaService(configService);
  });

  it('onModuleInit() calls $connect', async () => {
    const connectSpy = jest.spyOn(service, '$connect');
    await service.onModuleInit();
    expect(connectSpy).toHaveBeenCalled();
  });

  it('onModuleDestroy() calls $disconnect', async () => {
    const disconnectSpy = jest.spyOn(service, '$disconnect');
    await service.onModuleDestroy();
    expect(disconnectSpy).toHaveBeenCalled();
  });
});
