export interface HealthStatus {
    status: 'ok';
    env: string;
    uptime: number;
    timestamp: string;
}