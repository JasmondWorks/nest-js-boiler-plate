import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';
import type { HealthStatus } from './health.types';
import { SkipResponseWrap } from '@/common/decorators/skip-response-wrap.decorator';

@SkipResponseWrap()
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) { }

  @Get()
  check(): HealthStatus {
    return this.healthService.check();
  }
}