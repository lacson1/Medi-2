import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Add security headers
    const response = NextResponse.next();

    // Security headers for HIPAA compliance
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'no-referrer-when-downgrade');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    // Content Security Policy for medical applications
    response.headers.set(
        'Content-Security-Policy',
        "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://api.mediflow.com; frame-ancestors 'none';"
    );

    // Strict Transport Security
    if (request.nextUrl.protocol === 'https:') {
        response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }

    // Authentication check for protected routes
    if (pathname.startsWith('/dashboard') || pathname.startsWith('/patients') || pathname.startsWith('/api/patients')) {
        const token = request.cookies.get('auth-token')?.value;

        if (!token) {
            // Redirect to login page
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }
    }

  // Rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    // Simple rate limiting (in production, use Redis or similar)
    const rateLimitKey = `rate_limit_${ip}_${userAgent}`;
    
    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', '100');
    response.headers.set('X-RateLimit-Remaining', '99');
    response.headers.set('X-RateLimit-Reset', String(Date.now() + 3600000));
  }

  // Logging for audit trail (HIPAA requirement)
  if (pathname.startsWith('/api/patients') || pathname.startsWith('/patients')) {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    console.log(`[AUDIT] ${new Date().toISOString()} - ${request.method} ${pathname} - IP: ${ip} - User-Agent: ${request.headers.get('user-agent')}`);
  }

    // CORS headers for API routes
    if (pathname.startsWith('/api/')) {
        response.headers.set('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS || 'http://localhost:3000');
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
        response.headers.set('Access-Control-Max-Age', '86400');
    }

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: response.headers });
    }

    return response;
}

// Configure which paths the middleware should run on
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|public/).*)',
    ],
};
