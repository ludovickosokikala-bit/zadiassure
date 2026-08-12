-- ============ ENUMS ============
CREATE TYPE public.crm_role AS ENUM ('super_admin','owner','admin','manager','case_manager','employee','partner','client');
CREATE TYPE public.crm_client_type AS ENUM ('individual','family','self_employed','organization','other');
CREATE TYPE public.crm_priority AS ENUM ('low','normal','high','urgent');
CREATE TYPE public.crm_task_status AS ENUM ('todo','in_progress','waiting','completed','cancelled');
CREATE TYPE public.crm_document_status AS ENUM ('requested','received','under_review','approved','rejected','expired');
CREATE TYPE public.crm_lang AS ENUM ('nl','fr','en');
CREATE TYPE public.crm_contact_pref AS ENUM ('email','phone','whatsapp','post','portal');

-- ============ ORGANIZATIONS ============
CREATE TABLE public.organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  default_language public.crm_lang NOT NULL DEFAULT 'nl',
  case_number_prefix text NOT NULL DEFAULT '',
  case_number_seq integer NOT NULL DEFAULT 1000,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.organizations TO authenticated;
GRANT ALL ON public.organizations TO service_role;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.branches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  city text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX branches_org_idx ON public.branches(organization_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.branches TO authenticated;
GRANT ALL ON public.branches TO service_role;
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.org_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  branch_id uuid REFERENCES public.branches(id) ON DELETE SET NULL,
  role public.crm_role NOT NULL DEFAULT 'employee',
  full_name text NOT NULL DEFAULT '',
  email text NOT NULL DEFAULT '',
  ui_language public.crm_lang NOT NULL DEFAULT 'nl',
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, user_id)
);
CREATE INDEX org_members_user_idx ON public.org_members(user_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.org_members TO authenticated;
GRANT ALL ON public.org_members TO service_role;
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;

-- ============ SECURITY HELPERS (private schema) ============
CREATE OR REPLACE FUNCTION private.crm_role_in(_org uuid, _roles public.crm_role[])
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.org_members m
    WHERE m.user_id = auth.uid() AND m.organization_id = _org
      AND m.active AND m.role = ANY(_roles)
  );
$$;

CREATE OR REPLACE FUNCTION private.crm_is_staff(_org uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.org_members m
    WHERE m.user_id = auth.uid() AND m.organization_id = _org AND m.active
      AND m.role IN ('super_admin','owner','admin','manager','case_manager','employee')
  );
$$;

CREATE OR REPLACE FUNCTION private.crm_is_manager(_org uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT private.crm_role_in(_org, ARRAY['super_admin','owner','admin','manager']::public.crm_role[]);
$$;

CREATE OR REPLACE FUNCTION private.crm_is_admin(_org uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT private.crm_role_in(_org, ARRAY['super_admin','owner','admin']::public.crm_role[]);
$$;

CREATE OR REPLACE FUNCTION private.crm_is_member(_org uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.org_members m
    WHERE m.user_id = auth.uid() AND m.organization_id = _org AND m.active
  );
$$;

REVOKE ALL ON FUNCTION private.crm_role_in(uuid, public.crm_role[]) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.crm_is_staff(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.crm_is_manager(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.crm_is_admin(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.crm_is_member(uuid) FROM PUBLIC, anon, authenticated;

CREATE POLICY "Members read their organization" ON public.organizations
  FOR SELECT TO authenticated USING (private.crm_is_member(id));
CREATE POLICY "Admins update their organization" ON public.organizations
  FOR UPDATE TO authenticated USING (private.crm_is_admin(id)) WITH CHECK (private.crm_is_admin(id));

CREATE POLICY "Staff read branches" ON public.branches
  FOR SELECT TO authenticated USING (private.crm_is_staff(organization_id));
CREATE POLICY "Admins manage branches" ON public.branches
  FOR ALL TO authenticated USING (private.crm_is_admin(organization_id)) WITH CHECK (private.crm_is_admin(organization_id));

CREATE POLICY "Members read own membership" ON public.org_members
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Staff read team" ON public.org_members
  FOR SELECT TO authenticated USING (private.crm_is_staff(organization_id));
CREATE POLICY "Admins manage team" ON public.org_members
  FOR ALL TO authenticated USING (private.crm_is_admin(organization_id)) WITH CHECK (private.crm_is_admin(organization_id));

-- ============ CLIENTS ============
CREATE TABLE public.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  branch_id uuid REFERENCES public.branches(id) ON DELETE SET NULL,
  portal_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  client_type public.crm_client_type NOT NULL DEFAULT 'individual',
  first_name text NOT NULL DEFAULT '',
  last_name text NOT NULL DEFAULT '',
  company_name text NOT NULL DEFAULT '',
  date_of_birth date,
  email text NOT NULL DEFAULT '',
  phone text NOT NULL DEFAULT '',
  address text NOT NULL DEFAULT '',
  city text NOT NULL DEFAULT '',
  postal_code text NOT NULL DEFAULT '',
  country text NOT NULL DEFAULT 'BE',
  preferred_language public.crm_lang NOT NULL DEFAULT 'nl',
  contact_preference public.crm_contact_pref NOT NULL DEFAULT 'email',
  status text NOT NULL DEFAULT 'active',
  notes text NOT NULL DEFAULT '',
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX clients_org_idx ON public.clients(organization_id);
CREATE INDEX clients_portal_idx ON public.clients(portal_user_id);
CREATE INDEX clients_name_idx ON public.clients(organization_id, last_name, first_name);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.clients TO authenticated;
GRANT ALL ON public.clients TO service_role;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION private.crm_owns_client(_client uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.clients c WHERE c.id = _client AND c.portal_user_id = auth.uid());
$$;
REVOKE ALL ON FUNCTION private.crm_owns_client(uuid) FROM PUBLIC, anon, authenticated;

CREATE POLICY "Staff read clients" ON public.clients
  FOR SELECT TO authenticated USING (private.crm_is_staff(organization_id));
CREATE POLICY "Staff manage clients" ON public.clients
  FOR ALL TO authenticated USING (private.crm_is_staff(organization_id)) WITH CHECK (private.crm_is_staff(organization_id));
CREATE POLICY "Portal clients read own record" ON public.clients
  FOR SELECT TO authenticated USING (portal_user_id = auth.uid());

-- ============ CASE TYPES & STATUSES ============
CREATE TABLE public.case_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  key text NOT NULL,
  name_nl text NOT NULL,
  name_fr text NOT NULL,
  name_en text NOT NULL,
  description text NOT NULL DEFAULT '',
  workflow_stages jsonb NOT NULL DEFAULT '[]'::jsonb,
  required_documents jsonb NOT NULL DEFAULT '[]'::jsonb,
  default_tasks jsonb NOT NULL DEFAULT '[]'::jsonb,
  default_duration_days integer,
  sort_order integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.case_types TO authenticated;
GRANT ALL ON public.case_types TO service_role;
ALTER TABLE public.case_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read case types" ON public.case_types
  FOR SELECT TO authenticated USING (private.crm_is_member(organization_id));
CREATE POLICY "Admins manage case types" ON public.case_types
  FOR ALL TO authenticated USING (private.crm_is_admin(organization_id)) WITH CHECK (private.crm_is_admin(organization_id));

CREATE TABLE public.case_statuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  key text NOT NULL,
  label_nl text NOT NULL,
  label_fr text NOT NULL,
  label_en text NOT NULL,
  tone text NOT NULL DEFAULT 'info',
  is_open boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.case_statuses TO authenticated;
GRANT ALL ON public.case_statuses TO service_role;
ALTER TABLE public.case_statuses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Members read case statuses" ON public.case_statuses
  FOR SELECT TO authenticated USING (private.crm_is_member(organization_id));
CREATE POLICY "Admins manage case statuses" ON public.case_statuses
  FOR ALL TO authenticated USING (private.crm_is_admin(organization_id)) WITH CHECK (private.crm_is_admin(organization_id));

-- ============ CASES ============
CREATE TABLE public.cases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  branch_id uuid REFERENCES public.branches(id) ON DELETE SET NULL,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  case_type_id uuid REFERENCES public.case_types(id) ON DELETE SET NULL,
  case_number integer NOT NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  status_key text NOT NULL DEFAULT 'new',
  stage text NOT NULL DEFAULT '',
  priority public.crm_priority NOT NULL DEFAULT 'normal',
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  progress integer NOT NULL DEFAULT 0,
  start_date date,
  target_date date,
  deadline date,
  closed_at timestamptz,
  tags text[] NOT NULL DEFAULT '{}',
  deleted_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (organization_id, case_number)
);
CREATE INDEX cases_org_idx ON public.cases(organization_id);
CREATE INDEX cases_client_idx ON public.cases(client_id);
CREATE INDEX cases_assigned_idx ON public.cases(assigned_to);
CREATE INDEX cases_deadline_idx ON public.cases(organization_id, deadline);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.cases TO authenticated;
GRANT ALL ON public.cases TO service_role;
ALTER TABLE public.cases ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION private.crm_case_org(_case uuid)
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT organization_id FROM public.cases WHERE id = _case;
$$;
CREATE OR REPLACE FUNCTION private.crm_owns_case(_case uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.cases k JOIN public.clients c ON c.id = k.client_id
    WHERE k.id = _case AND c.portal_user_id = auth.uid()
  );
$$;
REVOKE ALL ON FUNCTION private.crm_case_org(uuid) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION private.crm_owns_case(uuid) FROM PUBLIC, anon, authenticated;

CREATE POLICY "Staff read cases" ON public.cases
  FOR SELECT TO authenticated USING (private.crm_is_staff(organization_id));
CREATE POLICY "Staff manage cases" ON public.cases
  FOR ALL TO authenticated USING (private.crm_is_staff(organization_id)) WITH CHECK (private.crm_is_staff(organization_id));
CREATE POLICY "Portal clients read own cases" ON public.cases
  FOR SELECT TO authenticated USING (private.crm_owns_client(client_id));

-- ============ TASKS ============
CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  case_id uuid REFERENCES public.cases(id) ON DELETE CASCADE,
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  assigned_to uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status public.crm_task_status NOT NULL DEFAULT 'todo',
  priority public.crm_priority NOT NULL DEFAULT 'normal',
  due_date date,
  completed_at timestamptz,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX tasks_org_idx ON public.tasks(organization_id);
CREATE INDEX tasks_case_idx ON public.tasks(case_id);
CREATE INDEX tasks_due_idx ON public.tasks(organization_id, due_date);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tasks TO authenticated;
GRANT ALL ON public.tasks TO service_role;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read tasks" ON public.tasks
  FOR SELECT TO authenticated USING (private.crm_is_staff(organization_id));
CREATE POLICY "Staff manage tasks" ON public.tasks
  FOR ALL TO authenticated USING (private.crm_is_staff(organization_id)) WITH CHECK (private.crm_is_staff(organization_id));

-- ============ NOTES ============
CREATE TABLE public.case_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  case_id uuid REFERENCES public.cases(id) ON DELETE CASCADE,
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  body text NOT NULL,
  is_internal boolean NOT NULL DEFAULT true,
  author_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX case_notes_case_idx ON public.case_notes(case_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.case_notes TO authenticated;
GRANT ALL ON public.case_notes TO service_role;
ALTER TABLE public.case_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read notes" ON public.case_notes
  FOR SELECT TO authenticated USING (private.crm_is_staff(organization_id));
CREATE POLICY "Staff manage notes" ON public.case_notes
  FOR ALL TO authenticated USING (private.crm_is_staff(organization_id)) WITH CHECK (private.crm_is_staff(organization_id));
CREATE POLICY "Portal clients read shared notes" ON public.case_notes
  FOR SELECT TO authenticated USING (is_internal = false AND case_id IS NOT NULL AND private.crm_owns_case(case_id));

-- ============ DOCUMENTS ============
CREATE TABLE public.case_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  case_id uuid REFERENCES public.cases(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  name text NOT NULL,
  document_type text NOT NULL DEFAULT '',
  status public.crm_document_status NOT NULL DEFAULT 'requested',
  storage_path text,
  mime_type text NOT NULL DEFAULT '',
  size_bytes integer,
  requested_from_client boolean NOT NULL DEFAULT false,
  notes text NOT NULL DEFAULT '',
  expires_on date,
  uploaded_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  uploaded_at timestamptz,
  reviewed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at timestamptz,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX case_documents_case_idx ON public.case_documents(case_id);
CREATE INDEX case_documents_client_idx ON public.case_documents(client_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.case_documents TO authenticated;
GRANT ALL ON public.case_documents TO service_role;
ALTER TABLE public.case_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read documents" ON public.case_documents
  FOR SELECT TO authenticated USING (private.crm_is_staff(organization_id));
CREATE POLICY "Staff manage documents" ON public.case_documents
  FOR ALL TO authenticated USING (private.crm_is_staff(organization_id)) WITH CHECK (private.crm_is_staff(organization_id));
CREATE POLICY "Portal clients read own documents" ON public.case_documents
  FOR SELECT TO authenticated USING (private.crm_owns_client(client_id));

-- ============ ACTIVITY TIMELINE ============
CREATE TABLE public.case_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  case_id uuid REFERENCES public.cases(id) ON DELETE CASCADE,
  client_id uuid REFERENCES public.clients(id) ON DELETE CASCADE,
  kind text NOT NULL,
  summary text NOT NULL,
  detail jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_internal boolean NOT NULL DEFAULT true,
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_label text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX case_activities_case_idx ON public.case_activities(case_id, created_at DESC);
CREATE INDEX case_activities_org_idx ON public.case_activities(organization_id, created_at DESC);
GRANT SELECT, INSERT ON public.case_activities TO authenticated;
GRANT ALL ON public.case_activities TO service_role;
ALTER TABLE public.case_activities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Staff read activities" ON public.case_activities
  FOR SELECT TO authenticated USING (private.crm_is_staff(organization_id));
CREATE POLICY "Staff insert activities" ON public.case_activities
  FOR INSERT TO authenticated WITH CHECK (private.crm_is_staff(organization_id));
CREATE POLICY "Portal clients read shared activities" ON public.case_activities
  FOR SELECT TO authenticated USING (is_internal = false AND case_id IS NOT NULL AND private.crm_owns_case(case_id));

-- ============ UPDATED_AT TRIGGERS ============
CREATE TRIGGER trg_organizations_updated_at BEFORE UPDATE ON public.organizations FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_branches_updated_at BEFORE UPDATE ON public.branches FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_org_members_updated_at BEFORE UPDATE ON public.org_members FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_clients_updated_at BEFORE UPDATE ON public.clients FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_case_types_updated_at BEFORE UPDATE ON public.case_types FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_case_statuses_updated_at BEFORE UPDATE ON public.case_statuses FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_cases_updated_at BEFORE UPDATE ON public.cases FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_tasks_updated_at BEFORE UPDATE ON public.tasks FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_case_notes_updated_at BEFORE UPDATE ON public.case_notes FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_case_documents_updated_at BEFORE UPDATE ON public.case_documents FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ CASE NUMBER GENERATOR ============
CREATE OR REPLACE FUNCTION public.crm_next_case_number(_org uuid)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE n integer;
BEGIN
  UPDATE public.organizations SET case_number_seq = case_number_seq + 1
  WHERE id = _org RETURNING case_number_seq INTO n;
  RETURN n;
END;
$$;
REVOKE ALL ON FUNCTION public.crm_next_case_number(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.crm_next_case_number(uuid) TO authenticated, service_role;

-- ============ SEED: ZADIASSURE ORGANIZATION ============
INSERT INTO public.organizations (id, name, slug, email, phone, default_language, case_number_prefix, case_number_seq)
VALUES ('11111111-1111-4111-8111-111111111111','ZADIASSURE','zadiassure','info@zadiassure.be','','nl','ZA-',1000);

INSERT INTO public.case_types (organization_id, key, name_nl, name_fr, name_en, workflow_stages, required_documents, default_tasks, sort_order) VALUES
('11111111-1111-4111-8111-111111111111','administrative','Administratieve begeleiding','Accompagnement administratif','Administrative assistance',
 '["new","intake","documents_required","documents_review","preparation","submitted","follow_up","completed"]','["identity","proof_of_address"]','["Intakegesprek plannen","Documenten opvragen"]',1),
('11111111-1111-4111-8111-111111111111','budget','Budgetbegeleiding','Accompagnement budgétaire','Budgetary guidance',
 '["intake","financial_overview","documents_collection","analysis","action_plan","follow_up","completed"]','["income_proof","bank_statements"]','["Financieel overzicht opmaken","Actieplan bespreken"]',2),
('11111111-1111-4111-8111-111111111111','immigration','Verblijf & immigratie','Séjour & immigration','Residence & immigration',
 '["intake","eligibility_review","documents_collection","document_verification","application_preparation","submission","follow_up","decision","completed"]','["identity","proof_of_address","employment_contract","income_proof"]','["Ontvankelijkheid nakijken","Documenten verifiëren"]',3),
('11111111-1111-4111-8111-111111111111','business','Ondernemingsondersteuning','Support aux entreprises','Business support',
 '["intake","documents_collection","preparation","submitted","follow_up","completed"]','["company_registration"]','["Dossier voorbereiden"]',4);

INSERT INTO public.case_statuses (organization_id, key, label_nl, label_fr, label_en, tone, is_open, sort_order) VALUES
('11111111-1111-4111-8111-111111111111','new','Nieuw','Nouveau','New','info',true,1),
('11111111-1111-4111-8111-111111111111','intake','Intake','Intake','Intake','info',true,2),
('11111111-1111-4111-8111-111111111111','documents_required','Documenten nodig','Documents requis','Documents required','warning',true,3),
('11111111-1111-4111-8111-111111111111','in_progress','In behandeling','En cours','In progress','info',true,4),
('11111111-1111-4111-8111-111111111111','waiting_client','Wacht op klant','En attente du client','Waiting for client','waiting',true,5),
('11111111-1111-4111-8111-111111111111','waiting_external','Wacht op derde partij','En attente d''un tiers','Waiting for external party','waiting',true,6),
('11111111-1111-4111-8111-111111111111','submitted','Ingediend','Introduit','Submitted','info',true,7),
('11111111-1111-4111-8111-111111111111','follow_up','Opvolging','Suivi','Follow-up','info',true,8),
('11111111-1111-4111-8111-111111111111','completed','Afgerond','Terminé','Completed','success',false,9),
('11111111-1111-4111-8111-111111111111','closed','Gesloten','Clôturé','Closed','neutral',false,10),
('11111111-1111-4111-8111-111111111111','cancelled','Geannuleerd','Annulé','Cancelled','neutral',false,11);

-- Existing site admins become CRM owners
INSERT INTO public.org_members (organization_id, user_id, role)
SELECT '11111111-1111-4111-8111-111111111111', ur.user_id, 'owner'::public.crm_role
FROM public.user_roles ur WHERE ur.role = 'admin'
ON CONFLICT (organization_id, user_id) DO NOTHING;