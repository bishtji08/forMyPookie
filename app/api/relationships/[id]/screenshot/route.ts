import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
const bucket = 'relationship-screenshots';

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
}

async function authenticate(request: NextRequest) {
  const bearer = request.headers.get('authorization');
  const accessToken = bearer?.startsWith('Bearer ') ? bearer.slice(7) : '';
  if (!accessToken) return null;
  const authClient = createClient(supabaseUrl, anonKey);
  const { data: { user }, error } = await authClient.auth.getUser(accessToken);
  return error || !user ? null : user;
}

async function getAuthorizedExperience(request: NextRequest, id: string) {
  if (!serviceRoleKey) return { error: NextResponse.json({ error: 'Screenshot service is not configured' }, { status: 503 }) };
  const user = await authenticate(request);
  if (!user) return { error: NextResponse.json({ error: 'Authentication required' }, { status: 401 }) };
  if (!isUuid(id)) return { error: NextResponse.json({ error: 'Invalid relationship link' }, { status: 400 }) };
  const adminClient = createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: experience, error: experienceError } = await adminClient.from('experiences').select('id, sender_id, receiver_id, screenshot_taken, screenshot_path, screenshot_url, captured_at, screenshot_width, screenshot_height').or(`id.eq.${id},secure_token.eq.${id}`).maybeSingle();
  if (experienceError?.message.includes('screenshot_')) {
    return { error: NextResponse.json({ error: 'Screenshot database migration has not been applied' }, { status: 503 }) };
  }
  if (experienceError) return { error: NextResponse.json({ error: `Unable to load relationship: ${experienceError.message}` }, { status: 500 }) };
  if (!experience) return { error: NextResponse.json({ error: 'Relationship not found for this link' }, { status: 404 }) };
  if (experience.sender_id !== user.id && experience.receiver_id !== user.id) return { error: NextResponse.json({ error: 'Access denied' }, { status: 403 }) };
  return { adminClient, experience };
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const result = await getAuthorizedExperience(request, params.id);
  if ('error' in result && result.error) return result.error;
  if (!result.experience.screenshot_taken || !result.experience.screenshot_path) return NextResponse.json({ screenshot: null });
  const { data, error } = await result.adminClient.storage.from(bucket).createSignedUrl(result.experience.screenshot_path, 3600);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ screenshot: { ...result.experience, screenshot_url: data.signedUrl } });
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  if (!serviceRoleKey) return NextResponse.json({ error: 'Screenshot service is not configured' }, { status: 503 });

  const user = await authenticate(request);
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  if (!isUuid(params.id)) return NextResponse.json({ error: 'Invalid relationship link' }, { status: 400 });

  const adminClient = createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const { data: experience, error: experienceError } = await adminClient
    .from('experiences')
    .select('id, receiver_id, screenshot_taken, screenshot_path, screenshot_url, captured_at, screenshot_width, screenshot_height')
    .or(`id.eq.${params.id},secure_token.eq.${params.id}`)
    .maybeSingle();
  if (experienceError?.message.includes('screenshot_')) return NextResponse.json({ error: 'Screenshot database migration has not been applied' }, { status: 503 });
  if (experienceError) return NextResponse.json({ error: `Unable to load relationship: ${experienceError.message}` }, { status: 500 });
  if (!experience) return NextResponse.json({ error: 'Relationship not found for this link' }, { status: 404 });
  if (experience.receiver_id !== user.id) return NextResponse.json({ error: 'Only the receiver can capture this page' }, { status: 403 });
  const body = await request.json().catch(() => null);
  const dataUrl = typeof body?.image === 'string' ? body.image : '';
  const match = dataUrl.match(/^data:(image\/(?:png|jpeg));base64,([A-Za-z0-9+/=]+)$/);
  if (!match) return NextResponse.json({ error: 'A PNG or JPEG screenshot is required' }, { status: 400 });

  const contentType = match[1];
  const extension = contentType === 'image/png' ? 'png' : 'jpg';
  const path = `relationship-screenshots/${experience.id}.${extension}`;
  const screenshotWidth = Number.isInteger(body?.width) ? body.width : null;
  const screenshotHeight = Number.isInteger(body?.height) ? body.height : null;
  const file = Buffer.from(match[2], 'base64');
  if (file.byteLength > 10 * 1024 * 1024) return NextResponse.json({ error: 'Screenshot is too large' }, { status: 413 });

  const { error: uploadError } = await adminClient.storage.from(bucket).upload(path, file, {
    contentType,
    cacheControl: '31536000',
    upsert: true,
  });
  if (uploadError && !uploadError.message.toLowerCase().includes('already exists')) {
    return NextResponse.json({ error: uploadError.message }, { status: 400 });
  }

  const { data: signedData, error: signedError } = await adminClient.storage.from(bucket).createSignedUrl(path, 3600);
  if (signedError) return NextResponse.json({ error: signedError.message }, { status: 400 });
  const capturedAt = new Date().toISOString();
  const { data: updated, error: updateError } = await adminClient
    .from('experiences')
    .update({ screenshot_taken: true, screenshot_path: path, screenshot_url: signedData.signedUrl, captured_at: capturedAt, screenshot_width: screenshotWidth, screenshot_height: screenshotHeight })
    .eq('id', experience.id)
    .select('id, screenshot_taken, screenshot_path, screenshot_url, captured_at, screenshot_width, screenshot_height')
    .maybeSingle();

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 });
  return NextResponse.json({ screenshot: updated }, { status: 201 });
}