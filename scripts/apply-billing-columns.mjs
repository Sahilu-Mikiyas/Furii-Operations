/**
 * Apply billing columns migration & backfill services.billing_* from summary
 */
const PAT = process.env.SUPABASE_PAT;
const REF = process.env.SUPABASE_PROJECT_ID || 'ymzwcmhsvgjnpgazicqz';

if (!PAT) {
  console.error('SUPABASE_PAT required');
  process.exit(1);
}

const query = `
-- 1. Extend service_requests
ALTER TABLE public.service_requests
ADD COLUMN IF NOT EXISTS contract_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS contract_accepted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS billing_type TEXT DEFAULT 'one_time',
ADD COLUMN IF NOT EXISTS billing_cycle_month TEXT,
ADD COLUMN IF NOT EXISTS duration TEXT;

-- 2. Extend services
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS billing_type TEXT DEFAULT 'one_time',
ADD COLUMN IF NOT EXISTS billing_cycle_day INT DEFAULT 1,
ADD COLUMN IF NOT EXISTS billing_start_date DATE,
ADD COLUMN IF NOT EXISTS next_billing_date DATE,
ADD COLUMN IF NOT EXISTS duration TEXT;

-- 3. Backfill from [BILLING:...] in summary
UPDATE public.services
SET
  billing_type = COALESCE(
    (substring(summary from '"type":"([^"]+)"'))::text,
    'one_time'
  ),
  billing_start_date = (substring(summary from '"billing_start_date":"([^"]+)"'))::date,
  next_billing_date = (substring(summary from '"next_billing_date":"([^"]+)"'))::date,
  billing_cycle_day = COALESCE((substring(summary from '"billing_cycle_day":([0-9]+)'))::int, 1),
  duration = substring(summary from '"duration":"([^"]+)"')
WHERE summary LIKE '%[BILLING:%';

-- 4. Clean summary
UPDATE public.services
SET summary = regexp_replace(summary, '\\[BILLING:.*?\\]', '', 'g')
WHERE summary LIKE '%[BILLING:%';
`;

async function run() {
  const res = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${PAT}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  });
  const data = await res.json();
  console.log('Result:', data);

  // Check services now
  const verifyRes = await fetch(`https://api.supabase.com/v1/projects/${REF}/database/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${PAT}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: 'SELECT id, name, billing_type, billing_cycle_day, billing_start_date, next_billing_date, duration, summary FROM public.services;' }),
  });
  const services = await verifyRes.json();
  console.table(services);
}

run().catch(console.error);
