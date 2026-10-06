import { Inject, Injectable } from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { appConfig } from '../../config';
import { HealthStatus } from './health.types';


@Injectable()
export class HealthService {
    constructor(
        @Inject(appConfig.KEY)
        private readonly app: ConfigType<typeof appConfig>,
    ) { }

    check(): HealthStatus {
        return {
            status: 'ok',
            env: this.app.env,
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
        };
    }
}