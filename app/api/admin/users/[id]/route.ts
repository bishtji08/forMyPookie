import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  if (!serviceRoleKey) {
    return NextResponse.json({ error: 'Server auth is not configured' }, { status: 500 });
  }

  const authorization = request.headers.get('authorization');
  const accessToken = authorization?.startsWith('Bearer ')
    ? authorization.slice('Bearer '.length)
    : null;
  if (!accessToken) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const adminClient = createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: authData, error: authError } = await adminClient.auth.getUser(accessToken);
  if (authError || !authData.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: adminProfile, error: profileError } = await adminClient
    .from('profiles')
    .select('role, status')
    .eq('id', authData.user.id)
    .single();
  if (profileError || adminProfile?.role !== 'admin' || adminProfile.status !== 'active') {
    return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
  }
  if (params.id === authData.user.id) {
    return NextResponse.json({ error: 'You cannot manage your own account here' }, { status: 400 });
  }

  const body = await request.json() as { role?: 'admin' | 'sender' | 'receiver'; password?: string };
  if (!body.role && !body.password) return NextResponse.json({ error: 'No changes provided' }, { status: 400 });
  if (body.password !== undefined && body.password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
  }

  if (body.role) {
    const { error } = await adminClient.from('profiles').update({ role: body.role }).eq('id', params.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }

  if (body.password) {
    const { error } = await adminClient.auth.admin.updateUserById(params.id, { password: body.password });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}