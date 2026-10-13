/**
 * Phase 1 — applies the RLS hardening migration via Management API.
 * Run: node scripts/phase1-apply.mjs
 */
import { readFileSync } from 'fs';

const PAT = process.env.SUPABASE_PAT;
const REF = process.env.SUPABASE_PROJECT_ID || 'ymzwcmhsvgjnpgazicqz';

if (!PAT) { console.error('SUPABASE_PAT env var required'); process.exit(1); }

const migration = readFileSync(
  new URL('../supabase/migrations/20261012010000_phase1_rls_hardening.sql', import.meta.url),
  'utf8'
);

async function sql(query) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${PAT}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`SQL error ${res.status}: ${text}`);
  return JSON.parse(text);
}

async function run() {
  console.log('Applying Phase 1 RLS hardening migration...\n');

  // Split on statement boundaries and run each block
  // The migration uses DO $$ blocks so we must send it whole
  const result = await sql(migration);
  console.log('Migration applied successfully.\n', result);

  // Verify: check for any remaining USING(true) policies
  console.log('Verifying — checking for remaining open policies...');
  const open = await sql(`
    SELECT tablename, policyname, qual
    FROM pg_policies
    WHERE schemaname = 'public' AND qual = 'true';
  `);
  if (open.length === 0) {
    console.log('✓ No open USING(true) policies remain.');
  } else {
    console.warn('⚠ Still found open policies:');
    console.table(open);
  }

  // Verify: check anon grants
  console.log('\nChecking anon grants...');
  const anonGrants = await sql(`
    SELECT table_name, privilege_type
    FROM information_schema.role_table_grants
    WHERE table_schema = 'public' AND grantee = 'anon';
  `);
  if (anonGrants.length === 0) {
    console.log('✓ anon has no table grants.');
  } else {
    console.warn('⚠ anon still has grants:');
    console.table(anonGrants);
  }

  // Verify: buckets are private
  console.log('\nChecking bucket visibility...');
  const buckets = await sql(`SELECT id, name, public FROM storage.buckets;`);
  console.table(buckets);

  console.log('\n=== Phase 1 complete ===');
}

run().catch(err => { console.error('FATAL:', err.message); process.exit(1); });
