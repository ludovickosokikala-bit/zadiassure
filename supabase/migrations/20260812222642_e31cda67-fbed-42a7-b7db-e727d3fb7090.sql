CREATE TYPE public.crm_mandate_status AS ENUM ('pending_signature','signed','active','revoked','expired');

CREATE TABLE public.mandates (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  case_id uuid REFERENCES public.cases(id) ON DELETE SET NULL,
  holder_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  holder_name text NOT NULL DEFAULT '',
  scope text[] NOT NULL DEFAULT '{}',
  purpose text NOT NULL DEFAULT '',
  starts_on date,
  ends_on date,
  status public.crm_mandate_status NOT NULL DEFAULT 'pending_signature',
  source text NOT NULL DEFAULT 'crm',
  applicant_name text NOT NULL DEFAULT '',
  applicant_email text NOT NULL DEFAULT '',
  applicant_phone text NOT NULL DEFAULT '',
  applicant_address text NOT NULL DEFAULT '',
  applicant_birth_date date,
  document_id uuid REFERENCES public.case_documents(id) ON DELETE SET NULL,
  signed_full_name text NOT NULL DEFAULT '',
  signed_at timestamptz,
  signature_image text,
  consent boolean NOT NULL DEFAULT false,
  language public.crm_lang NOT NULL DEFAULT 'nl',
  notes text NOT NULL DEFAULT '',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mandates TO authenticated;
GRANT ALL ON public.mandates TO service_role;
ALTER TABLE public.mandates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff read mandates" ON public.mandates
  FOR SELECT TO authenticated USING (private.crm_is_staff(organization_id));
CREATE POLICY "Staff manage mandates" ON public.mandates
  FOR ALL TO authenticated
  USING (private.crm_is_staff(organization_id))
  WITH CHECK (private.crm_is_staff(organization_id));

CREATE INDEX idx_mandates_org_status ON public.mandates (organization_id, status);
CREATE INDEX idx_mandates_client ON public.mandates (client_id);

CREATE TRIGGER trg_mandates_updated_at BEFORE UPDATE ON public.mandates
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.org_invites (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL DEFAULT '',
  role public.crm_role NOT NULL DEFAULT 'employee',
  branch_id uuid REFERENCES public.branches(id) ON DELETE SET NULL,
  token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(18), 'hex'),
  status text NOT NULL DEFAULT 'pending',
  invited_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '30 days'),
  accepted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT org_invites_status_check CHECK (status IN ('pending','accepted','revoked'))
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.org_invites TO authenticated;
GRANT ALL ON public.org_invites TO service_role;
ALTER TABLE public.org_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins manage invites" ON public.org_invites
  FOR ALL TO authenticated
  USING (private.crm_is_admin(organization_id))
  WITH CHECK (private.crm_is_admin(organization_id));

CREATE UNIQUE INDEX idx_org_invites_pending_email ON public.org_invites (organization_id, lower(email))
  WHERE status = 'pending';

CREATE TRIGGER trg_org_invites_updated_at BEFORE UPDATE ON public.org_invites
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();