import pg from 'pg';

const password = process.env.SUPABASE_DB_PASSWORD || process.env.DB_PASSWORD || 'GrXlwBrKKBtREwUK';
const projectRef = process.env.SUPABASE_PROJECT_ID || 'ymzwcmhsvgjnpgazicqz';

async function seedData() {
  const client = new pg.Client({
    host: 'aws-1-eu-west-1.pooler.supabase.com',
    port: 5432,
    user: `postgres.${projectRef}`,
    password: password,
    database: 'postgres',
    ssl: { rejectUnauthorized: false }
  });

  await client.connect();
  console.log('Connected. Seeding sample organization and operational data...');

  // Ensure issue_date exists on invoices
  await client.query(`ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS issue_date DATE DEFAULT CURRENT_DATE;`);

  // 1. Clean slate
  await client.query(`TRUNCATE TABLE public.organizations CASCADE;`);

  // 2. Organization
  const orgRes = await client.query(`
    INSERT INTO public.organizations (name, slug, logo_url, website, email)
    VALUES ('Furii Operations', 'furii', '/brand/furii-logo-horizontal.jpg', 'https://furii.agency', 'ops@furii.agency')
    RETURNING id;
  `);
  const orgId = orgRes.rows[0].id;
  console.log('Org ID:', orgId);

  // 3. Clients
  const client1Res = await client.query(`
    INSERT INTO public.clients (organization_id, name, slug, industry, description, website, status, health_status, start_date)
    VALUES 
      ('${orgId}', 'Solomon Gold Mining', 'solomon-gold', 'Mining & Resources', 'Enterprise mineral exploration and mining operations in Oromia & Benishangul-Gumuz regions.', 'https://solomongold.et', 'active', 'on_track', '2026-01-15')
    RETURNING id;
  `);
  const client1Id = client1Res.rows[0].id;

  const client2Res = await client.query(`
    INSERT INTO public.clients (organization_id, name, slug, industry, description, website, status, health_status, start_date)
    VALUES 
      ('${orgId}', 'Abyssinia Specialty Coffee', 'abyssinia-coffee', 'Agriculture & Export', 'Single-origin specialty coffee roaster and international exporter.', 'https://abyssiniacoffee.com', 'active', 'on_track', '2026-02-01')
    RETURNING id;
  `);
  const client2Id = client2Res.rows[0].id;

  const client3Res = await client.query(`
    INSERT INTO public.clients (organization_id, name, slug, industry, description, website, status, health_status, start_date)
    VALUES 
      ('${orgId}', 'Kifiya Health Tech', 'kifiya-health', 'Healthcare & Technology', 'Digital medical records and telehealth infrastructure for East Africa.', 'https://kifiyahealth.io', 'active', 'attention_required', '2026-03-01')
    RETURNING id;
  `);
  const client3Id = client3Res.rows[0].id;

  // 4. Projects
  const proj1Res = await client.query(`
    INSERT INTO public.projects (organization_id, client_id, name, description, status, start_date, end_date, budget, budget_currency, progress_override)
    VALUES 
      ('${orgId}', '${client1Id}', 'Digital Brand Transformation & Enterprise Portal', 'Full identity system, investor pitch decks, and secure portal.', 'active', '2026-01-15', '2026-06-30', 850000.00, 'ETB', 68)
    RETURNING id;
  `);
  const proj1Id = proj1Res.rows[0].id;

  const proj2Res = await client.query(`
    INSERT INTO public.projects (organization_id, client_id, name, description, status, start_date, end_date, budget, budget_currency, progress_override)
    VALUES 
      ('${orgId}', '${client2Id}', 'Global E-Commerce & Brand Campaign', 'Direct-to-consumer international e-commerce store with packaging redesign.', 'active', '2026-02-01', '2026-05-31', 18000.00, 'USD', 45)
    RETURNING id;
  `);
  const proj2Id = proj2Res.rows[0].id;

  // 5. Services
  const serv1Res = await client.query(`
    INSERT INTO public.services (organization_id, project_id, client_id, service_type, name, description, status, current_phase, progress)
    VALUES 
      ('${orgId}', '${proj1Id}', '${client1Id}', 'branding', 'Corporate Identity & Brand Guidelines', 'Logomark, typography guidelines, vehicle fleet wraps, and hard-hat badges.', 'in_progress', 'Phase 3: Final Asset Export', 85)
    RETURNING id;
  `);
  const serv1Id = serv1Res.rows[0].id;

  const serv2Res = await client.query(`
    INSERT INTO public.services (organization_id, project_id, client_id, service_type, name, description, status, current_phase, progress)
    VALUES 
      ('${orgId}', '${proj1Id}', '${client1Id}', 'website', 'Investor Relations & Operations Portal', 'High-performance interactive web experience built on React and Supabase.', 'in_progress', 'Phase 2: Frontend Engineering', 60)
    RETURNING id;
  `);
  const serv2Id = serv2Res.rows[0].id;

  // 6. Tasks
  await client.query(`
    INSERT INTO public.tasks (organization_id, project_id, service_id, client_id, title, description, status, priority, due_date)
    VALUES 
      ('${orgId}', '${proj1Id}', '${serv1Id}', '${client1Id}', 'Finalize Brand Guidelines PDF', 'Compile 48-page corporate design manual with color tolerances.', 'in_review', 'high', '2026-09-22'),
      ('${orgId}', '${proj1Id}', '${serv1Id}', '${client1Id}', 'Export 3D Hardhat & Vehicle Renderings', 'High resolution marketing visuals for annual general meeting.', 'in_progress', 'medium', '2026-09-25'),
      ('${orgId}', '${proj1Id}', '${serv2Id}', '${client1Id}', 'Connect Live ESG Compliance Dashboard', 'Hook up environmental and carbon offset metric endpoints.', 'planned', 'high', '2026-09-30');
  `);

  // 7. Deliverables & Versions
  const delivRes = await client.query(`
    INSERT INTO public.deliverables (organization_id, project_id, service_id, client_id, name, title, description, category, status, current_version)
    VALUES 
      ('${orgId}', '${proj1Id}', '${serv1Id}', '${client1Id}', 'Brand Identity Guide v2.4 (Enterprise Edition)', 'Brand Identity Guide v2.4 (Enterprise Edition)', 'Complete corporate guidelines including bilingual Amharic & English typography.', 'pdf', 'awaiting_review', 2)
    RETURNING id;
  `);
  const delivId = delivRes.rows[0].id;

  const delivVerRes = await client.query(`
    INSERT INTO public.deliverable_versions (deliverable_id, version_number, file_url, file_name, file_size, notes)
    VALUES 
      ('${delivId}', 2, 'https://ymzwcmhsvgjnpgazicqz.supabase.co/storage/v1/object/public/deliverables/solomon-gold-brand-v2.pdf', 'solomon-gold-brand-v2.pdf', 14285000, 'Incorporated board feedback regarding gold leaf foil printing specifications.')
    RETURNING id;
  `);
  const delivVerId = delivVerRes.rows[0].id;

  // 8. Approvals
  await client.query(`
    INSERT INTO public.approvals (organization_id, project_id, service_id, client_id, deliverable_id, deliverable_version_id, title, description, status)
    VALUES 
      ('${orgId}', '${proj1Id}', '${serv1Id}', '${client1Id}', '${delivId}', '${delivVerId}', 'Brand Identity Guide v2.4 Signoff', 'Awaiting final approval from Solomon Gold Managing Director.', 'awaiting_review');
  `);

  // 9. Work Records
  await client.query(`
    INSERT INTO public.work_records (organization_id, project_id, service_id, client_id, title, description, changes, work_date, status, visibility)
    VALUES 
      ('${orgId}', '${proj1Id}', '${serv1Id}', '${client1Id}', 'Delivered Primary Logo Suite and Color Formula Guide', 'Rendered CMYK, Pantone, RGB and monochrome SVG vectors for corporate mining assets.', 'Updated gold gradient profile to match real Benishangul gold nugget tones.', CURRENT_DATE - INTERVAL '2 days', 'published', 'client');
  `);

  // 10. Invoices
  await client.query(`
    INSERT INTO public.invoices (organization_id, client_id, project_id, invoice_number, title, amount, total, subtotal, currency, status, issue_date, due_date)
    VALUES 
      ('${orgId}', '${client1Id}', '${proj1Id}', 'INV-2026-001', 'Initial Retainer & Discovery Milestone', 425000.00, 425000.00, 425000.00, 'ETB', 'paid', '2026-01-20', '2026-02-05'),
      ('${orgId}', '${client1Id}', '${proj1Id}', 'INV-2026-002', 'Phase 2: Brand Identity Approval Milestone', 250000.00, 250000.00, 250000.00, 'ETB', 'sent', '2026-09-15', '2026-09-30');
  `);

  // 11. Calendar Events
  await client.query(`
    INSERT INTO public.calendar_events (organization_id, project_id, client_id, title, description, event_type, start_datetime, end_datetime, location)
    VALUES 
      ('${orgId}', '${proj1Id}', '${client1Id}', 'Brand Reveal Presentation with Board', 'Executive review of approved color palette, typography, and stationery.', 'presentation', '2026-09-24 14:00:00+03', '2026-09-24 16:00:00+03', 'Skylight Hotel, Addis Ababa'),
      ('${orgId}', '${proj2Id}', '${client2Id}', 'Single-Origin Coffee Product Photo Shoot', 'High-speed macro coffee bean and pour-over lifestyle photography session.', 'shoot', '2026-09-28 09:00:00+03', '2026-09-28 17:00:00+03', 'Furii Creative Studio');
  `);

  // 12. Files
  await client.query(`
    INSERT INTO public.files (organization_id, project_id, service_id, client_id, name, file_url, file_key, file_size, file_type, category, visibility)
    VALUES 
      ('${orgId}', '${proj1Id}', '${serv1Id}', '${client1Id}', 'SolomonGold_Vector_Pack_v2.zip', 'https://ymzwcmhsvgjnpgazicqz.supabase.co/storage/v1/object/public/files/solomon_vector_pack.zip', 'solomon_vector_pack.zip', 48500000, 'application/zip', 'design', 'client'),
      ('${orgId}', '${proj1Id}', '${serv1Id}', '${client1Id}', 'Mining_Exploration_Agreement_Redacted.pdf', 'https://ymzwcmhsvgjnpgazicqz.supabase.co/storage/v1/object/public/files/mining_license.pdf', 'mining_license.pdf', 3120000, 'application/pdf', 'document', 'internal');
  `);

  console.log('>>> COMPLETE SEEDING SUCCESSFUL! <<<');
  await client.end();
}

seedData();
