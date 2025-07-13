import { ThrottlerModuleOptions } from '@nestjs/throttler';

export const throttlerConfig: ThrottlerModuleOptions = {
  throttlers: [
    {
      ttl: 60000, // 1 minute
      limit: 100, // 100 requests per minute
    },
    {
      ttl: 3600000, // 1 hour
      limit: 1000, // 1000 requests per hour
    },
  ],
  ignoreUserAgents: [
    // Ignore health check endpoints
    /health/i,
  ],
  skipIf: (req) => {
    // Skip rate limiting for certain endpoints
    return (
      (req as any).url?.includes('/health') ||
      (req as any).url?.includes('/metrics')
    );
  },
};
