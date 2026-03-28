import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { HealthCheck, HealthCheckResult, HealthCheckService } from '@nestjs/terminus';
import { DatabaseHealthIndicator } from './health.service';

@SkipThrottle()
@Controller('health')
/* istanbul ignore next */
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly db: DatabaseHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  check(): Promise<HealthCheckResult> {
    return this.health.check([() => this.db.isHealthy('database')]);
  }
}
