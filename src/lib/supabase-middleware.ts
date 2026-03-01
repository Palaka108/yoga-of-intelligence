import { createServerClient } from '@supabase/ssr';
import type { CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protected routes — redirect to login if not authenticated
  const protectedPaths = ['/dashboard', '/module', '/profile'];
  const adminPaths = ['/admin'];
  const isPendingPage = request.nextUrl.pathname === '/pending-approval';
  const isSignOutRoute = request.nextUrl.pathname.startsWith('/api/auth/signout');
  const isProtected = protectedPaths.some((p) =>
    request.nextUrl.pathname.startsWith(p)
  );
  const isAdmin = adminPaths.some((p) =>
    request.nextUrl.pathname.startsWith(p)
  );

  if (!user && (isProtected || isAdmin)) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Approval gate — check if authenticated user is approved
  if (user && (isProtected || isAdmin) && !isPendingPage && !isSignOutRoute) {
    const { data: rawProfile } = await supabase
      .from('yoi_users')
      .select('role, approved')
      .eq('id', user.id)
      .single();

    const profile = rawProfile as unknown as { role: string; approved: boolean } | null;

    // Unapproved students get redirected to pending-approval page
    if (profile && !profile.approved && profile.role === 'student') {
      const url = request.nextUrl.clone();
      url.pathname = '/pending-approval';
      return NextResponse.redirect(url);
    }

    // Admin route protection — check admin role
    if (isAdmin && profile?.role !== 'admin' && profile?.role !== 'instructor') {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }

    return supabaseResponse;
  }

  // If user is approved and on pending-approval page, redirect to dashboard
  if (user && isPendingPage) {
    const { data: rawProfile } = await supabase
      .from('yoi_users')
      .select('approved')
      .eq('id', user.id)
      .single();

    const profile = rawProfile as unknown as { approved: boolean } | null;

    if (profile?.approved) {
      const url = request.nextUrl.clone();
      url.pathname = '/dashboard';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
