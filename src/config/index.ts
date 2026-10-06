import appConfig from './app.config';
import redisConfig from './redis.config';

export const configurations = [appConfig, redisConfig];
export { validateEnv } from './env.validation';
export { appConfig, redisConfig };