import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const password = process.env.SUPABASE_DB_PASSWORD || process.env.DB_PASSWORD || 'GrXlwBrKKBtREwUK';
const projectRef = process.env.SUPABASE_PROJECT_ID || 'ymzwcmhsvgjnpgazicqz';

async function run() {
  const sqlPath = path.resolve(__dirname, '../supabase/migrations/20260918000000_furii_core_schema.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  console.log(`Connecting to aws-1-eu-west-1.pooler.supabase.com:5432 for project ${projectRef}...`);
  const client = new pg.Client({
    host: 'aws-1-eu-west-1.pooler.supabase.com',
    port: 5432,
    user: `postgres.${projectRef}`,
    password: password,
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('Connected successfully!');

    console.log('Applying Furii Core Schema migration (tables, indexes, RLS, functions, triggers)...');
    await client.query(sql);
    console.log('Migration executed successfully!');

    const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `);
    console.log('Public tables confirmed:');
    res.rows.forEach(r => console.log(' - ' + r.table_name));

    await client.end();
  } catch (err) {
    console.error('Migration failed:', err);
    try { await client.end(); } catch (e) {}
    process.exit(1);
  }
}

run();
