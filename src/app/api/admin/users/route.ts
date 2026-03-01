import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase-server';

/**
 * GET /api/admin/users
 * List students with optional approval filter.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const approvedFilter = searchParams.get('approved'); // 'true', 'false', or null (all)
    const adminId = searchParams.get('admin_id');

    if (!adminId) {
      return NextResponse.json({ error: 'Missing admin_id' }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    // Verify admin role
    const { data: rawAdmin } = await supabase
      .from('yoi_users')
      .select('role')
      .eq('id', adminId)
      .single();

    const admin = rawAdmin as unknown as { role: string } | null;
    if (!admin || !['admin', 'instructor'].includes(admin.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    let query = supabase
      .from('yoi_users')
      .select('id, email, full_name, avatar_url, role, approved, created_at')
      .eq('role', 'student')
      .order('created_at', { ascending: false });

    if (approvedFilter === 'true') {
      query = query.eq('approved', true);
    } else if (approvedFilter === 'false') {
      query = query.eq('approved', false);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ users: data });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * PATCH /api/admin/users
 * Approve or revoke a user's access.
 * Body: { user_id: string, approved: boolean, admin_id: string }
 */
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, approved, admin_id } = body;

    if (!user_id || typeof approved !== 'boolean' || !admin_id) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id, approved, admin_id' },
        { status: 400 }
      );
    }

    const supabase = createServiceRoleClient();

    // Verify admin role
    const { data: rawAdmin } = await supabase
      .from('yoi_users')
      .select('role')
      .eq('id', admin_id)
      .single();

    const admin = rawAdmin as unknown as { role: string } | null;
    if (!admin || !['admin', 'instructor'].includes(admin.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update the user's approved status
    const { error } = await (supabase
      .from('yoi_users') as any)
      .update({ approved, updated_at: new Date().toISOString() })
      .eq('id', user_id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, user_id, approved });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
