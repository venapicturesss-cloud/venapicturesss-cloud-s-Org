/*
  # Initial Schema for Vena Pictures

  1. New Tables
    - `users` - User accounts and authentication
    - `profiles` - Vendor profile settings and configurations
    - `clients` - Client management
    - `projects` - Project tracking and management
    - `packages` - Service packages
    - `add_ons` - Additional services
    - `team_members` - Freelancer/team member management
    - `transactions` - Financial transactions
    - `leads` - Lead/prospect management
    - `cards` - Payment cards and accounts
    - `financial_pockets` - Budget allocation pockets
    - `assets` - Asset management
    - `contracts` - Contract management
    - `client_feedback` - Customer feedback
    - `notifications` - System notifications
    - `social_media_posts` - Social media planning
    - `promo_codes` - Promotional codes
    - `sops` - Standard Operating Procedures

  2. Security
    - Enable RLS on all tables
    - Add policies for vendor-based data isolation
    - Users can only access data from their vendor
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (authentication)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  company_name text,
  role text NOT NULL DEFAULT 'Member',
  permissions text[],
  vendor_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Profiles table (vendor settings)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  company_name text NOT NULL,
  website text,
  address text NOT NULL,
  bank_account text NOT NULL,
  authorized_signer text NOT NULL,
  id_number text,
  bio text,
  income_categories text[] DEFAULT ARRAY['DP Proyek', 'Pelunasan', 'Add-On'],
  expense_categories text[] DEFAULT ARRAY['Operasional', 'Peralatan', 'Transport'],
  project_types text[] DEFAULT ARRAY['Pernikahan', 'Prewedding', 'Engagement'],
  event_types text[] DEFAULT ARRAY['Meeting Klien', 'Survey Lokasi', 'Libur'],
  asset_categories text[] DEFAULT ARRAY['Kamera', 'Lensa', 'Lighting'],
  sop_categories text[] DEFAULT ARRAY['Fotografi', 'Editing', 'Administrasi'],
  project_status_config jsonb DEFAULT '[]'::jsonb,
  notification_settings jsonb DEFAULT '{"newProject": true, "paymentConfirmation": true, "deadlineReminder": true}'::jsonb,
  security_settings jsonb DEFAULT '{"twoFactorEnabled": false}'::jsonb,
  briefing_template text,
  terms_and_conditions text,
  contract_template text,
  logo_base64 text,
  brand_color text DEFAULT '#3b82f6',
  public_page_config jsonb DEFAULT '{"template": "modern", "title": "Paket Layanan Kami", "introduction": "Pilih paket yang sesuai dengan kebutuhan acara Anda.", "galleryImages": []}'::jsonb,
  package_share_template text,
  booking_form_template text,
  chat_templates jsonb,
  current_plan_id text,
  vendor_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Clients table
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  whatsapp text,
  instagram text,
  client_type text NOT NULL DEFAULT 'Langsung',
  status text NOT NULL DEFAULT 'Aktif',
  since text NOT NULL,
  last_contact text NOT NULL,
  portal_access_id text NOT NULL DEFAULT uuid_generate_v4()::text,
  vendor_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_name text NOT NULL,
  client_name text NOT NULL,
  client_id text NOT NULL,
  project_type text NOT NULL,
  package_name text NOT NULL,
  package_id text NOT NULL,
  add_ons jsonb DEFAULT '[]'::jsonb,
  date text NOT NULL,
  deadline_date text,
  location text NOT NULL,
  progress integer DEFAULT 0,
  status text NOT NULL DEFAULT 'Dikonfirmasi',
  active_sub_statuses text[],
  total_cost numeric NOT NULL,
  amount_paid numeric DEFAULT 0,
  payment_status text NOT NULL DEFAULT 'Belum Bayar',
  team jsonb DEFAULT '[]'::jsonb,
  notes text,
  accommodation text,
  drive_link text,
  client_drive_link text,
  final_drive_link text,
  start_time text,
  end_time text,
  image text,
  revisions jsonb,
  promo_code_id text,
  discount_amount numeric,
  shipping_details text,
  dp_proof_url text,
  printing_details jsonb,
  printing_cost numeric,
  transport_cost numeric,
  booking_status text,
  rejection_reason text,
  chat_history jsonb DEFAULT '[]'::jsonb,
  vendor_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Packages table
CREATE TABLE IF NOT EXISTS packages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  price numeric NOT NULL,
  physical_items jsonb DEFAULT '[]'::jsonb,
  digital_items text[] DEFAULT ARRAY[]::text[],
  processing_time text NOT NULL,
  photographers text,
  videographers text,
  cover_image text,
  vendor_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add-ons table
CREATE TABLE IF NOT EXISTS add_ons (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  price numeric NOT NULL,
  vendor_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Team members table
CREATE TABLE IF NOT EXISTS team_members (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  role text NOT NULL,
  email text NOT NULL,
  phone text NOT NULL,
  standard_fee numeric DEFAULT 0,
  no_rek text,
  reward_balance numeric DEFAULT 0,
  rating numeric DEFAULT 5,
  performance_notes jsonb DEFAULT '[]'::jsonb,
  portal_access_id text NOT NULL DEFAULT uuid_generate_v4()::text,
  vendor_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  date text NOT NULL,
  description text NOT NULL,
  amount numeric NOT NULL,
  type text NOT NULL,
  project_id text,
  category text NOT NULL,
  method text NOT NULL,
  pocket_id text,
  card_id text,
  printing_item_id text,
  vendor_signature text,
  vendor_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Leads table
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  contact_channel text NOT NULL,
  location text NOT NULL,
  status text NOT NULL DEFAULT 'Sedang Diskusi',
  date text NOT NULL,
  notes text,
  whatsapp text,
  vendor_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Cards table
CREATE TABLE IF NOT EXISTS cards (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  card_holder_name text NOT NULL,
  bank_name text NOT NULL,
  card_type text NOT NULL,
  last_four_digits text NOT NULL,
  expiry_date text,
  balance numeric DEFAULT 0,
  color_gradient text NOT NULL,
  vendor_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Financial pockets table
CREATE TABLE IF NOT EXISTS financial_pockets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text NOT NULL,
  icon text NOT NULL,
  type text NOT NULL,
  amount numeric DEFAULT 0,
  goal_amount numeric,
  lock_end_date text,
  members jsonb,
  source_card_id text,
  vendor_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Assets table
CREATE TABLE IF NOT EXISTS assets (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  category text NOT NULL,
  purchase_date text NOT NULL,
  purchase_price numeric NOT NULL,
  serial_number text,
  status text NOT NULL DEFAULT 'Tersedia',
  notes text,
  vendor_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Contracts table
CREATE TABLE IF NOT EXISTS contracts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  contract_number text NOT NULL,
  client_id text NOT NULL,
  project_id text NOT NULL,
  signing_date text NOT NULL,
  signing_location text NOT NULL,
  client_name1 text NOT NULL,
  client_address1 text NOT NULL,
  client_phone1 text NOT NULL,
  client_name2 text,
  client_address2 text,
  client_phone2 text,
  shooting_duration text NOT NULL,
  guaranteed_photos text NOT NULL,
  album_details text NOT NULL,
  digital_files_format text NOT NULL DEFAULT 'JPG High-Resolution',
  other_items text NOT NULL,
  personnel_count text NOT NULL,
  delivery_timeframe text NOT NULL,
  dp_date text NOT NULL,
  final_payment_date text NOT NULL,
  cancellation_policy text NOT NULL,
  jurisdiction text NOT NULL,
  vendor_signature text,
  client_signature text,
  vendor_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Client feedback table
CREATE TABLE IF NOT EXISTS client_feedback (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_name text NOT NULL,
  satisfaction text NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  feedback text NOT NULL,
  date text NOT NULL,
  vendor_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  message text NOT NULL,
  timestamp text NOT NULL,
  is_read boolean DEFAULT false,
  icon text NOT NULL,
  link_view text,
  link_action jsonb,
  vendor_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Social media posts table
CREATE TABLE IF NOT EXISTS social_media_posts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id text NOT NULL,
  client_name text NOT NULL,
  post_type text NOT NULL,
  platform text NOT NULL,
  scheduled_date text NOT NULL,
  caption text NOT NULL,
  media_url text,
  status text NOT NULL DEFAULT 'Draf',
  notes text,
  vendor_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Promo codes table
CREATE TABLE IF NOT EXISTS promo_codes (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  code text NOT NULL,
  discount_type text NOT NULL,
  discount_value numeric NOT NULL,
  is_active boolean DEFAULT true,
  usage_count integer DEFAULT 0,
  max_usage integer,
  expiry_date text,
  vendor_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- SOPs table
CREATE TABLE IF NOT EXISTS sops (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  title text NOT NULL,
  category text NOT NULL,
  content text NOT NULL,
  last_updated text NOT NULL,
  vendor_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Team project payments table
CREATE TABLE IF NOT EXISTS team_project_payments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id text NOT NULL,
  team_member_name text NOT NULL,
  team_member_id text NOT NULL,
  date text NOT NULL,
  status text NOT NULL DEFAULT 'Unpaid',
  fee numeric NOT NULL,
  reward numeric DEFAULT 0,
  vendor_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Team payment records table
CREATE TABLE IF NOT EXISTS team_payment_records (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  record_number text NOT NULL,
  team_member_id text NOT NULL,
  date text NOT NULL,
  project_payment_ids text[] NOT NULL,
  total_amount numeric NOT NULL,
  vendor_signature text,
  vendor_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Reward ledger entries table
CREATE TABLE IF NOT EXISTS reward_ledger_entries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  team_member_id text NOT NULL,
  date text NOT NULL,
  description text NOT NULL,
  amount numeric NOT NULL,
  project_id text,
  vendor_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE add_ons ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_pockets ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE sops ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_project_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_payment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_ledger_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for vendor-based data isolation
-- Users can read their own data
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id::text);

-- Vendor-based policies for all other tables
CREATE POLICY "Vendor data isolation"
  ON profiles
  FOR ALL
  TO authenticated
  USING (
    vendor_id = (
      SELECT vendor_id FROM users WHERE id::text = auth.uid()::text
    )
  );

CREATE POLICY "Vendor data isolation"
  ON clients
  FOR ALL
  TO authenticated
  USING (
    vendor_id = (
      SELECT vendor_id FROM users WHERE id::text = auth.uid()::text
    )
  );

CREATE POLICY "Vendor data isolation"
  ON projects
  FOR ALL
  TO authenticated
  USING (
    vendor_id = (
      SELECT vendor_id FROM users WHERE id::text = auth.uid()::text
    )
  );

CREATE POLICY "Vendor data isolation"
  ON packages
  FOR ALL
  TO authenticated
  USING (
    vendor_id = (
      SELECT vendor_id FROM users WHERE id::text = auth.uid()::text
    )
  );

CREATE POLICY "Vendor data isolation"
  ON add_ons
  FOR ALL
  TO authenticated
  USING (
    vendor_id = (
      SELECT vendor_id FROM users WHERE id::text = auth.uid()::text
    )
  );

CREATE POLICY "Vendor data isolation"
  ON team_members
  FOR ALL
  TO authenticated
  USING (
    vendor_id = (
      SELECT vendor_id FROM users WHERE id::text = auth.uid()::text
    )
  );

CREATE POLICY "Vendor data isolation"
  ON transactions
  FOR ALL
  TO authenticated
  USING (
    vendor_id = (
      SELECT vendor_id FROM users WHERE id::text = auth.uid()::text
    )
  );

CREATE POLICY "Vendor data isolation"
  ON leads
  FOR ALL
  TO authenticated
  USING (
    vendor_id = (
      SELECT vendor_id FROM users WHERE id::text = auth.uid()::text
    )
  );

CREATE POLICY "Vendor data isolation"
  ON cards
  FOR ALL
  TO authenticated
  USING (
    vendor_id = (
      SELECT vendor_id FROM users WHERE id::text = auth.uid()::text
    )
  );

CREATE POLICY "Vendor data isolation"
  ON financial_pockets
  FOR ALL
  TO authenticated
  USING (
    vendor_id = (
      SELECT vendor_id FROM users WHERE id::text = auth.uid()::text
    )
  );

CREATE POLICY "Vendor data isolation"
  ON assets
  FOR ALL
  TO authenticated
  USING (
    vendor_id = (
      SELECT vendor_id FROM users WHERE id::text = auth.uid()::text
    )
  );

CREATE POLICY "Vendor data isolation"
  ON contracts
  FOR ALL
  TO authenticated
  USING (
    vendor_id = (
      SELECT vendor_id FROM users WHERE id::text = auth.uid()::text
    )
  );

CREATE POLICY "Vendor data isolation"
  ON client_feedback
  FOR ALL
  TO authenticated
  USING (
    vendor_id = (
      SELECT vendor_id FROM users WHERE id::text = auth.uid()::text
    )
  );

CREATE POLICY "Vendor data isolation"
  ON notifications
  FOR ALL
  TO authenticated
  USING (
    vendor_id = (
      SELECT vendor_id FROM users WHERE id::text = auth.uid()::text
    )
  );

CREATE POLICY "Vendor data isolation"
  ON social_media_posts
  FOR ALL
  TO authenticated
  USING (
    vendor_id = (
      SELECT vendor_id FROM users WHERE id::text = auth.uid()::text
    )
  );

CREATE POLICY "Vendor data isolation"
  ON promo_codes
  FOR ALL
  TO authenticated
  USING (
    vendor_id = (
      SELECT vendor_id FROM users WHERE id::text = auth.uid()::text
    )
  );

CREATE POLICY "Vendor data isolation"
  ON sops
  FOR ALL
  TO authenticated
  USING (
    vendor_id = (
      SELECT vendor_id FROM users WHERE id::text = auth.uid()::text
    )
  );

CREATE POLICY "Vendor data isolation"
  ON team_project_payments
  FOR ALL
  TO authenticated
  USING (
    vendor_id = (
      SELECT vendor_id FROM users WHERE id::text = auth.uid()::text
    )
  );

CREATE POLICY "Vendor data isolation"
  ON team_payment_records
  FOR ALL
  TO authenticated
  USING (
    vendor_id = (
      SELECT vendor_id FROM users WHERE id::text = auth.uid()::text
    )
  );

CREATE POLICY "Vendor data isolation"
  ON reward_ledger_entries
  FOR ALL
  TO authenticated
  USING (
    vendor_id = (
      SELECT vendor_id FROM users WHERE id::text = auth.uid()::text
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_clients_vendor_id ON clients(vendor_id);
CREATE INDEX IF NOT EXISTS idx_projects_vendor_id ON projects(vendor_id);
CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_transactions_vendor_id ON transactions(vendor_id);
CREATE INDEX IF NOT EXISTS idx_transactions_project_id ON transactions(project_id);
CREATE INDEX IF NOT EXISTS idx_leads_vendor_id ON leads(vendor_id);
CREATE INDEX IF NOT EXISTS idx_team_members_vendor_id ON team_members(vendor_id);