import { plainToInstance } from 'class-transformer';
import {
    IsEnum,
    IsInt,
    IsString,
    Max,
    Min,
    validateSync,
} from 'class-validator';

export enum NodeEnv {
    Development = 'development',
    Production = 'production',
    Test = 'test',
}

class EnvironmentVariables {
    @IsEnum(NodeEnv)
    NODE_ENV: NodeEnv = NodeEnv.Development;

    @IsInt()
    @Min(1)
    @Max(65535)
    PORT: number = 3000;

    @IsString()
    DATABASE_URL: string;

    @IsString()
    REDIS_HOST: string;

    @IsInt()
    REDIS_PORT: number;

    @IsString()
    PAYSTACK_SECRET_KEY: string;

    @IsString()
    JWT_SECRET: string;
}

export function validateEnv(config: Record<string, unknown>) {
    const validated = plainToInstance(EnvironmentVariables, config, {
        enableImplicitConversion: true, // "3000" -> 3000
    });

    const errors = validateSync(validated, { skipMissingProperties: false });

    if (errors.length > 0) {
        const messages = errors
            .map((e) => `${e.property}: ${Object.values(e.constraints ?? {}).join(', ')}`)
            .join('\n');
        throw new Error(`Invalid environment variables:\n${messages}`);
    }

    return validated;
}