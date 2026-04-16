import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    ROOM_STORE_DRIVER: z.enum(['memory', 'upstash']).default('memory'),
    ROOM_TTL_SECONDS: z.coerce.number().int().positive().default(14_400),
    UPSTASH_REDIS_REST_URL: z.url().optional(),
    UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
    ABLY_API_KEY: z.string().min(1).optional(),
  },
  client: {
    NEXT_PUBLIC_APP_NAME: z.string().min(1).default('Hatjitsu'),
    NEXT_PUBLIC_ABLY_KEY: z.string().min(1).optional(),
  },
  runtimeEnv: {
    ROOM_STORE_DRIVER: process.env.ROOM_STORE_DRIVER,
    ROOM_TTL_SECONDS: process.env.ROOM_TTL_SECONDS,
    UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
    UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
    ABLY_API_KEY: process.env.ABLY_API_KEY,
    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_ABLY_KEY: process.env.NEXT_PUBLIC_ABLY_KEY,
  },
});
