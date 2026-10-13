/**
 * Phase 0 — full programmatic execution via Supabase Management API.
 * Run: node scripts/phase0-mgmt.mjs
 * Never commit this file's output or the PAT to the repo.
 */
import crypto from 'crypto';

const PAT = process.env.SUPABASE_PAT;
const REF = process.env.SUPABASE_PROJECT_ID || 'ymzwcmhsvgjnpgazicqz';
const BASE = 'https://api.supabase.com/v1';

if (!PAT) { console.error('SUPABASE_PAT env var required'); process.exit(1); }

const headers = {
  Authorization: `Bearer ${PAT}`,
  'Content-Type': 'application/json',
};

async function mgmt(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let json;
  try { json = JSON.parse(text); } catch { json = text; }
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status}: ${text}`);
  return json;
}

async function sql(query) {
  return mgmt('POST', `/projects/${REF}/database/query`, { query });
}

async function run() {
  console.log('=== Phase 0: Supabase Management API Hardening ===\n');

  // 1. Disable sign-ups
  console.log('1. Disabling public sign-ups...');
  await mgmt('PATCH', `/projects/${REF}/config/auth`, { disable_signup: true });
  console.log('   ✓ Sign-ups disabled.\n');

  // 2. Drop auto-confirm trigger and function
  console.log('2. Dropping auto-confirm trigger...');
  await sql('DROP TRIGGER IF EXISTS on_auth_user_auto_confirm ON auth.users;');
  await sql('DROP FUNCTION IF EXISTS public.handle_auto_confirm_user();');
  console.log('   ✓ Auto-confirm trigger removed.\n');

  // 3. Rotate DB password
  console.log('3. Rotating database password...');
  const newPassword = crypto.randomBytes(24).toString('base64url');
  await mgmt('PATCH', `/projects/${REF}/database/password`, { password: newPassword });
  console.log(`   ✓ DB password rotated.`);
  console.log(`   ⚠  NEW PASSWORD (save this somewhere safe): ${newPassword}\n`);

  // 4. Audit queries
  console.log('4. Running audit queries...\n');

  console.log('--- RLS Policies ---');
  const policies = await sql(`
    SELECT schemaname, tablename, policyname, roles::text, cmd, qual
    FROM pg_policies
    WHERE schemaname IN ('public', 'storage')
    ORDER BY tablename, policyname;
  `);
  console.table(policies);

  console.log('\n--- Grants to anon/authenticated ---');
  const grants = await sql(`
    SELECT grantee, table_name, privilege_type
    FROM information_schema.role_table_grants
    WHERE table_schema = 'public'
      AND grantee IN ('anon', 'authenticated')
    ORDER BY table_name, grantee;
  `);
  console.table(grants);

  console.log('\n--- Tables with RLS OFF ---');
  const noRls = await sql(`
    SELECT c.relname AS table_without_rls
    FROM pg_class c
    JOIN pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname = 'public' AND c.relkind = 'r' AND NOT c.relrowsecurity;
  `);
  console.table(noRls);

  console.log('\n--- Storage buckets ---');
  const buckets = await sql(`SELECT id, name, public FROM storage.buckets;`);
  console.table(buckets);

  console.log('\n--- Users with role in user_metadata ---');
  const metaRoles = await sql(`
    SELECT id, email, raw_user_meta_data->>'role' AS meta_role
    FROM auth.users WHERE raw_user_meta_data ? 'role';
  `);
  console.table(metaRoles);

  console.log('\n--- All auth users ---');
  const users = await sql(`
    SELECT id, email, created_at, last_sign_in_at
    FROM auth.users ORDER BY created_at DESC;
  `);
  console.table(users);

  console.log('\n=== Phase 0 complete ===');
}

run().catch(err => { console.error('\nFATAL:', err.message); process.exit(1); });
