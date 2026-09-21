import pg from 'pg';

const password = process.env.SUPABASE_DB_PASSWORD || 'GrXlwBrKKBtREwUK';
const projectRef = 'ymzwcmhsvgjnpgazicqz';

async function run() {
  console.log('Connecting to Supabase pooler...');
  const client = new pg.Client({
    host: 'aws-1-eu-west-1.pooler.supabase.com',
    port: 5432,
    user: `postgres.${projectRef}`,
    password: password,
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log('Connected to PostgreSQL database.');

  const sql = `
    CREATE TABLE IF NOT EXISTS public.service_requests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      organization_id UUID NOT NULL,
      client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
      requested_by UUID,
      request_type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      catalog_items JSONB DEFAULT '[]'::jsonb,
      estimated_total NUMERIC(12,2) DEFAULT 0,
      currency TEXT DEFAULT 'ETB',
      urgency TEXT DEFAULT 'normal',
      status TEXT DEFAULT 'pending',
      manager_notes TEXT,
      receipt_url TEXT,
      payment_notes TEXT,
      payment_submitted_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    );

    ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;

    -- Drop existing policies if any
    DROP POLICY IF EXISTS "Managers full access to service_requests" ON public.service_requests;
    DROP POLICY IF EXISTS "Clients can view own service_requests" ON public.service_requests;
    DROP POLICY IF EXISTS "Clients can create service_requests" ON public.service_requests;
    DROP POLICY IF EXISTS "Clients can update payment on own service_requests" ON public.service_requests;

    -- RLS Policies
    CREATE POLICY "Managers full access to service_requests" ON public.service_requests
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM public.memberships m
          WHERE m.user_id = auth.uid()
            AND m.role IN ('super_admin', 'admin', 'manager')
        )
      );

    CREATE POLICY "Clients can view own service_requests" ON public.service_requests
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.memberships m
          WHERE m.user_id = auth.uid()
            AND m.client_id = service_requests.client_id
        )
      );

    CREATE POLICY "Clients can create service_requests" ON public.service_requests
      FOR INSERT
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.memberships m
          WHERE m.user_id = auth.uid()
            AND m.client_id = service_requests.client_id
        )
      );

    CREATE POLICY "Clients can update payment on own service_requests" ON public.service_requests
      FOR UPDATE
      USING (
        EXISTS (
          SELECT 1 FROM public.memberships m
          WHERE m.user_id = auth.uid()
            AND m.client_id = service_requests.client_id
        )
      );
  `;

  console.log('Applying service_requests schema and RLS policies...');
  await client.query(sql);
  console.log('service_requests table created and policies applied successfully!');

  // Check columns
  const res = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'service_requests';
  `);
  console.log('Columns in service_requests:');
  res.rows.forEach(r => console.log(` - ${r.column_name}: ${r.data_type}`));

  await client.end();
}

run().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
