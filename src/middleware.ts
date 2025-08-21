import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher(['/api/webhooks(.*)']);

// See https://clerk.com/docs/references/nextjs/auth-middleware
// for more information about configuring your Middleware
export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    // Exclude files with a "." followed by an extension, which are typically static files.
    // Exclude files in the _next directory, which are Next.js internals.
    '/((?!.+\\.[\\w]+$|_next).*)',
    // Re-include any files in the api or trpc folders that might have an extension
    '/(api|trpc)(.*)',
  ],
};
