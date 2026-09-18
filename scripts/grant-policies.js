import pg from 'pg';

const password = process.env.SUPABASE_DB_PASSWORD || process.env.DB_PASSWORD || 'GrXlwBrKKBtREwUK';
const projectRef = process.env.SUPABASE_PROJECT_ID || 'ymzwcmhsvgjnpgazicqz';

async function grantAnonRead() {
  const client = new pg.Client({
    host: 'aws-1-eu-west-1.pooler.supabase.com',
    port: 5432,
    user: `postgres.${projectRef}`,
    password: password,
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log('Granting SELECT policies for anon/authenticated roles...');

  const tables = [
    'organizations',
    'clients',
    'projects',
    'services',
    'milestones',
    'tasks',
    'work_records',
    'deliverables',
    'deliverable_versions',
    'approvals',
    'decisions',
    'calendar_events',
    'files',
    'invoices',
    'payments',
    'activity_logs'
  ];

  for (const t of tables) {
    await client.query(`
      DROP POLICY IF EXISTS "Allow select for anon and authenticated" ON public.${t};
      CREATE POLICY "Allow select for anon and authenticated" ON public.${t}
      FOR SELECT TO anon, authenticated
      USING (true);

      DROP POLICY IF EXISTS "Allow insert/update for demo" ON public.${t};
      CREATE POLICY "Allow insert/update for demo" ON public.${t}
      FOR ALL TO anon, authenticated
      USING (true)
      WITH CHECK (true);
    `);
    console.log(`Updated policies for ${t}`);
  }

  await client.end();
  console.log('All policies successfully configured!');
}

grantAnonRead();
