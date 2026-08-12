CREATE TABLE public.appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  client_id uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  case_id uuid REFERENCES public.cases(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text NOT NULL DEFAULT '',
  location text NOT NULL DEFAULT '',
  meeting_kind text NOT NULL DEFAULT 'office',
  starts_at timestamptz NOT NULL,
  ends_at timestamptz NOT NULL,
  all_day boolean NOT NULL DEFAULT false,
  status text NOT NULL DEFAULT 'scheduled',
  attendee_emails text[] NOT NULL DEFAULT '{}',
  assigned_to uuid,
  created_by uuid,
  external_event_id text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz
);

CREATE INDEX appointments_org_start_idx ON public.appointments (organization_id, starts_at);
CREATE INDEX appointments_assigned_idx ON public.appointments (assigned_to, starts_at);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments TO authenticated;
GRANT ALL ON public.appointments TO service_role;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff read appointments" ON public.appointments
  FOR SELECT TO authenticated USING (private.crm_is_staff(organization_id));
CREATE POLICY "Staff manage appointments" ON public.appointments
  FOR ALL TO authenticated USING (private.crm_is_staff(organization_id))
  WITH CHECK (private.crm_is_staff(organization_id));

CREATE TRIGGER appointments_set_updated_at BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.calendar_feeds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  token text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.calendar_feeds TO authenticated;
GRANT ALL ON public.calendar_feeds TO service_role;
ALTER TABLE public.calendar_feeds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Own calendar feed" ON public.calendar_feeds
  FOR ALL TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());