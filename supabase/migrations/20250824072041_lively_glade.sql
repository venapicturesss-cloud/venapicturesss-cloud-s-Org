/*
  # Add Sample Data for Testing

  1. Sample Data
    - Insert demo user
    - Insert demo profile
    - Insert sample clients, projects, packages
    - Insert sample transactions and leads

  2. Notes
    - This is for testing purposes
    - Real production data should be migrated separately
*/

-- Insert demo user (password will be handled by Supabase Auth)
INSERT INTO users (id, email, full_name, company_name, role, permissions, vendor_id)
VALUES (
  'demo-user-id',
  'admin@vena.pictures',
  'Admin Vena Pictures',
  'Vena Pictures',
  'Admin',
  ARRAY['Dashboard', 'Prospek', 'Booking', 'Manajemen Klien', 'Proyek', 'Freelancer', 'Keuangan', 'Kalender', 'Laporan Klien', 'Input Package', 'Kode Promo', 'Manajemen Aset', 'Kontrak Kerja', 'Perencana Media Sosial', 'SOP', 'Pengaturan'],
  'VEN001'
) ON CONFLICT (email) DO NOTHING;

-- Insert demo profile
INSERT INTO profiles (
  id, full_name, email, phone, company_name, website, address, bank_account, 
  authorized_signer, bio, vendor_id
)
VALUES (
  uuid_generate_v4(),
  'Admin Vena Pictures',
  'admin@vena.pictures',
  '085693762240',
  'Vena Pictures',
  'https://vena.pictures',
  'Jl. Contoh No. 123, Jakarta',
  'BCA 1234567890 a.n. Vena Pictures',
  'Admin Vena Pictures',
  'Spesialis fotografi pernikahan dan acara dengan pengalaman lebih dari 5 tahun.',
  'VEN001'
) ON CONFLICT DO NOTHING;

-- Insert sample packages
INSERT INTO packages (id, name, price, physical_items, digital_items, processing_time, photographers, videographers, vendor_id)
VALUES 
  (
    'PKG001',
    'Paket Wedding Basic',
    5000000,
    '[{"name": "Album 20x30 (20 halaman)", "price": 500000}]'::jsonb,
    ARRAY['300+ Foto Edited', 'All Raw Files', 'Online Gallery'],
    '14 hari kerja',
    '1 Fotografer',
    null,
    'VEN001'
  ),
  (
    'PKG002', 
    'Paket Wedding Premium',
    8500000,
    '[{"name": "Album 30x40 (30 halaman)", "price": 800000}, {"name": "Flashdisk Custom", "price": 150000}]'::jsonb,
    ARRAY['500+ Foto Edited', 'All Raw Files', 'Online Gallery', 'Same Day Edit Video'],
    '21 hari kerja',
    '2 Fotografer',
    '1 Videografer',
    'VEN001'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert sample add-ons
INSERT INTO add_ons (id, name, price, vendor_id)
VALUES 
  ('ADD001', 'Drone Photography', 1000000, 'VEN001'),
  ('ADD002', 'Extra Album', 750000, 'VEN001'),
  ('ADD003', 'Engagement Session', 2000000, 'VEN001')
ON CONFLICT (id) DO NOTHING;

-- Insert sample clients
INSERT INTO clients (id, name, email, phone, whatsapp, client_type, status, since, last_contact, portal_access_id, vendor_id)
VALUES 
  (
    'CLI001',
    'Budi & Sari',
    'budi.sari@email.com',
    '081234567890',
    '081234567890',
    'Langsung',
    'Aktif',
    '2024-01-15',
    '2024-01-20T10:00:00Z',
    'portal-access-001',
    'VEN001'
  ),
  (
    'CLI002',
    'Ahmad & Fitri',
    'ahmad.fitri@email.com',
    '082345678901',
    '082345678901',
    'Langsung',
    'Aktif',
    '2024-02-01',
    '2024-02-05T14:30:00Z',
    'portal-access-002',
    'VEN001'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert sample projects
INSERT INTO projects (
  id, project_name, client_name, client_id, project_type, package_name, package_id,
  add_ons, date, location, progress, status, total_cost, amount_paid, payment_status,
  team, vendor_id
)
VALUES 
  (
    'PRJ001',
    'Wedding Budi & Sari',
    'Budi & Sari',
    'CLI001',
    'Pernikahan',
    'Paket Wedding Basic',
    'PKG001',
    '[]'::jsonb,
    '2024-03-15',
    'Gedung Serbaguna Jakarta',
    75,
    'Editing',
    5000000,
    2500000,
    'DP Terbayar',
    '[]'::jsonb,
    'VEN001'
  ),
  (
    'PRJ002',
    'Wedding Ahmad & Fitri',
    'Ahmad & Fitri',
    'CLI002',
    'Pernikahan',
    'Paket Wedding Premium',
    'PKG002',
    '[{"id": "ADD001", "name": "Drone Photography", "price": 1000000}]'::jsonb,
    '2024-04-20',
    'Hotel Grand Indonesia',
    25,
    'Persiapan',
    9500000,
    4750000,
    'DP Terbayar',
    '[]'::jsonb,
    'VEN001'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert sample leads
INSERT INTO leads (id, name, contact_channel, location, status, date, notes, whatsapp, vendor_id)
VALUES 
  (
    'LEAD001',
    'Rina & Doni',
    'Instagram',
    'Bandung',
    'Sedang Diskusi',
    '2024-01-25',
    'Tertarik dengan paket premium untuk wedding di Bandung',
    '083456789012',
    'VEN001'
  ),
  (
    'LEAD002',
    'Maya & Eko',
    'WhatsApp',
    'Surabaya',
    'Menunggu Follow Up',
    '2024-01-28',
    'Sudah diskusi harga, menunggu konfirmasi tanggal',
    '084567890123',
    'VEN001'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert sample transactions
INSERT INTO transactions (
  id, date, description, amount, type, project_id, category, method, card_id, vendor_id
)
VALUES 
  (
    'TRN001',
    '2024-01-20',
    'DP Wedding Budi & Sari',
    2500000,
    'Pemasukan',
    'PRJ001',
    'DP Proyek',
    'Transfer Bank',
    'CARD001',
    'VEN001'
  ),
  (
    'TRN002',
    '2024-02-05',
    'DP Wedding Ahmad & Fitri',
    4750000,
    'Pemasukan',
    'PRJ002',
    'DP Proyek',
    'Transfer Bank',
    'CARD001',
    'VEN001'
  ),
  (
    'TRN003',
    '2024-01-15',
    'Pembelian Lensa Baru',
    3500000,
    'Pengeluaran',
    null,
    'Peralatan',
    'Transfer Bank',
    'CARD001',
    'VEN001'
  )
ON CONFLICT (id) DO NOTHING;