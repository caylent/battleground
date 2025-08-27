import { auth } from '@clerk/nextjs/server';
import { Ratelimit } from '@upstash/ratelimit';
import { kv } from '@vercel/kv';

const internalRateLimitDomain = process.env.INTERNAL_RATE_LIMIT_DOMAIN;

export const internalRateLimiter = new Ratelimit({
  redis: kv,
  // 10 requests from the same IP in 10 seconds
  limiter: Ratelimit.slidingWindow(10, '10 s'),
});

export const externalRateLimiter = new Ratelimit({
  redis: kv,
  // 10 requests from the same IP in 10 seconds
  limiter: Ratelimit.slidingWindow(10, '1 m'),
});

export const rateLimit = async () => {
  const { sessionClaims } = await auth();

  if (!sessionClaims?.email) {
    return new Response(JSON.stringify({ message: 'Unauthorized' }), {
      status: 401,
    });
  }

  const email = sessionClaims.email as string;

  if (internalRateLimitDomain && email.endsWith(internalRateLimitDomain)) {
    // If the user is from the internal rate limit domain, we use a different rate limiter
    const { success } = await internalRateLimiter.limit(email);
    if (!success) {
      return new Response(JSON.stringify({ message: 'Too many requests' }), {
        status: 429,
      });
    }
  } else {
    const { success } = await externalRateLimiter.limit(email);
    if (!success) {
      return new Response(JSON.stringify({ message: 'Too many requests' }), {
        status: 429,
      });
    }
  }
};
