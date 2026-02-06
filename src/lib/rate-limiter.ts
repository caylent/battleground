import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export const internalRateLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  // 10 requests from the same IP in 10 seconds
  limiter: Ratelimit.slidingWindow(10, "10 s"),
});

export const externalRateLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  // 10 requests from the same IP in 10 seconds
  limiter: Ratelimit.slidingWindow(10, "1 m"),
});
