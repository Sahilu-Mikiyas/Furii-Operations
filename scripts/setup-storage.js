import pg from 'pg';

const password = process.env.SUPABASE_DB_PASSWORD || process.env.DB_PASSWORD || 'GrXlwBrKKBtREwUK';
const projectRef = process.env.SUPABASE_PROJECT_ID || 'ymzwcmhsvgjnpgazicqz';

async function setupStorage() {
  const client = new pg.Client({
    host: 'aws-1-eu-west-1.pooler.supabase.com',
    port: 5432,
    user: `postgres.${projectRef}`,
    password: password,
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  console.log('Setting up storage buckets...');
  await client.query(`
    INSERT INTO storage.buckets (id, name, public)
    VALUES 
      ('files', 'files', true),
      ('deliverables', 'deliverables', true),
      ('receipts', 'receipts', true),
      ('brand', 'brand', true)
    ON CONFLICT (id) DO NOTHING;
  `);

  // Allow public access to view public buckets
  await client.query(`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Public Access to Buckets' AND tablename = 'objects' AND schemaname = 'storage'
      ) THEN
        CREATE POLICY "Public Access to Buckets" ON storage.objects FOR SELECT USING (bucket_id IN ('files', 'deliverables', 'receipts', 'brand'));
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE policyname = 'Authenticated users can upload objects' AND tablename = 'objects' AND schemaname = 'storage'
      ) THEN
        CREATE POLICY "Authenticated users can upload objects" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id IN ('files', 'deliverables', 'receipts', 'brand'));
      END IF;
    END $$;
  `);

  console.log('Storage buckets created: files, deliverables, receipts, brand.');
  await client.end();
}

setupStorage();
