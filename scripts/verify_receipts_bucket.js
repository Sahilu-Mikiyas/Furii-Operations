import pg from 'pg';

const password = process.env.SUPABASE_DB_PASSWORD || 'GrXlwBrKKBtREwUK';
const projectRef = 'ymzwcmhsvgjnpgazicqz';

async function run() {
  const client = new pg.Client({
    host: 'aws-1-eu-west-1.pooler.supabase.com',
    port: 5432,
    user: `postgres.${projectRef}`,
    password: password,
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();

  console.log('Ensuring receipts storage bucket exists...');
  await client.query(`
    INSERT INTO storage.buckets (id, name, public)
    VALUES ('receipts', 'receipts', true)
    ON CONFLICT (id) DO UPDATE SET public = true;
  `);

  // Ensure storage policies allow authenticated users to upload to receipts bucket
  await client.query(`
    DROP POLICY IF EXISTS "Public receipts read" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can upload receipts" ON storage.objects;
    DROP POLICY IF EXISTS "Users can update own receipts" ON storage.objects;

    CREATE POLICY "Public receipts read" ON storage.objects
      FOR SELECT
      USING (bucket_id = 'receipts');

    CREATE POLICY "Authenticated users can upload receipts" ON storage.objects
      FOR INSERT
      WITH CHECK (bucket_id = 'receipts' AND auth.role() = 'authenticated');

    CREATE POLICY "Users can update own receipts" ON storage.objects
      FOR UPDATE
      USING (bucket_id = 'receipts' AND auth.role() = 'authenticated');
  `);

  console.log('Storage bucket receipts and policies verified!');
  await client.end();
}

run().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
