-- Migration: Add contract acceptance and service billing classification
-- 1. Extend service_requests to track electronic contract agreement & billing model
ALTER TABLE public.service_requests
ADD COLUMN IF NOT EXISTS contract_accepted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS contract_accepted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS billing_type TEXT DEFAULT 'one_time' CHECK (billing_type IN ('one_time', 'monthly_retainer')),
ADD COLUMN IF NOT EXISTS billing_cycle_month TEXT,
ADD COLUMN IF NOT EXISTS duration TEXT;

-- 2. Extend services to track billing cycle dates and duration for retainers vs one-time
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS billing_type TEXT DEFAULT 'one_time' CHECK (billing_type IN ('one_time', 'monthly_retainer')),
ADD COLUMN IF NOT EXISTS billing_cycle_day INT DEFAULT 1,
ADD COLUMN IF NOT EXISTS billing_start_date DATE,
ADD COLUMN IF NOT EXISTS next_billing_date DATE,
ADD COLUMN IF NOT EXISTS duration TEXT;
