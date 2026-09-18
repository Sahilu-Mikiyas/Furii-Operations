import pg from 'pg';

const password = process.env.SUPABASE_DB_PASSWORD || process.env.DB_PASSWORD || 'GrXlwBrKKBtREwUK';
const projectRef = process.env.SUPABASE_PROJECT_ID || 'ymzwcmhsvgjnpgazicqz';

async function patchSchema() {
  const client = new pg.Client({
    host: 'aws-1-eu-west-1.pooler.supabase.com',
    port: 5432,
    user: `postgres.${projectRef}`,
    password: password,
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  const queries = [
    `ALTER TABLE public.approvals ALTER COLUMN requested_by DROP NOT NULL;`,
    `ALTER TABLE public.approvals ALTER COLUMN requested_by SET DEFAULT auth.uid();`,

    `ALTER TABLE public.files ALTER COLUMN file_key DROP NOT NULL;`,
    `ALTER TABLE public.files ALTER COLUMN uploaded_by DROP NOT NULL;`,
    `ALTER TABLE public.files ALTER COLUMN uploaded_by SET DEFAULT auth.uid();`,

    `ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS amount NUMERIC(15, 2);`,
    `UPDATE public.invoices SET amount = total WHERE amount IS NULL;`,
  ];

  for (const q of queries) {
    try {
      await client.query(q);
      console.log('OK:', q);
    } catch (e) {
      console.log('Note:', e.message);
    }
  }

  await client.end();
  console.log('Schema patch completed!');
}

patchSchema();
