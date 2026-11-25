CREATE TABLE public.crm_appointments(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 organization_id uuid NOT NULL REFERENCES public.organizations(id),
 title text NOT NULL CHECK (btrim(title)<>''),
 client_id uuid,
 dossier_id uuid,
 owner_id uuid NOT NULL,
 member_ids uuid[] NOT NULL DEFAULT '{}',
 start_at timestamptz NOT NULL,
 end_at timestamptz NOT NULL,
 location_type text NOT NULL DEFAULT 'office' CHECK (location_type IN ('office','client','online','phone')),
 location_note text NOT NULL DEFAULT '',
 meet_link text NOT NULL DEFAULT '',
 status text NOT NULL DEFAULT 'planned' CHECK (status IN ('planned','cancelled','completed')),
 kind text NOT NULL DEFAULT 'regular' CHECK (kind IN ('regular','bud_followup')),
 google_event_id text,
 google_owner_id uuid,
 google_sync_error text NOT NULL DEFAULT '',
 created_by uuid,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 CHECK (end_at > start_at),
 FOREIGN KEY (client_id, organization_id) REFERENCES public.crm_clients(id, organization_id),
 FOREIGN KEY (dossier_id, organization_id) REFERENCES public.crm_dossiers(id, organization_id)
);
CREATE INDEX crm_appointments_org_start ON public.crm_appointments(organization_id, start_at);
CREATE INDEX crm_appointments_client ON public.crm_appointments(client_id);
CREATE INDEX crm_appointments_dossier ON public.crm_appointments(dossier_id);
GRANT SELECT, INSERT, UPDATE ON public.crm_appointments TO authenticated;
GRANT ALL ON public.crm_appointments TO service_role;
ALTER TABLE public.crm_appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY staff_appointments ON public.crm_appointments FOR ALL TO authenticated
 USING (private.foundation_staff(organization_id)) WITH CHECK (private.foundation_staff(organization_id));

CREATE FUNCTION private.foundation_appointment_validate() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
 IF TG_OP='INSERT' THEN
  NEW.created_by := auth.uid(); NEW.created_at := now();
  NEW.google_event_id := NULL; NEW.google_owner_id := NULL; NEW.meet_link := coalesce(NEW.meet_link,'');
 ELSE
  IF NEW.organization_id<>OLD.organization_id OR NEW.created_by IS DISTINCT FROM OLD.created_by THEN RAISE EXCEPTION 'Immutable appointment identity'; END IF;
 END IF;
 IF NEW.dossier_id IS NOT NULL THEN
  IF NEW.client_id IS NULL THEN
   SELECT client_id INTO NEW.client_id FROM public.crm_dossiers WHERE id=NEW.dossier_id AND organization_id=NEW.organization_id;
  END IF;
  IF NOT EXISTS(SELECT 1 FROM public.crm_dossiers WHERE id=NEW.dossier_id AND client_id=NEW.client_id AND organization_id=NEW.organization_id) THEN RAISE EXCEPTION 'Invalid appointment dossier'; END IF;
 END IF;
 IF NOT EXISTS(SELECT 1 FROM public.org_members WHERE user_id=NEW.owner_id AND organization_id=NEW.organization_id AND active AND foundation_role IS NOT NULL) THEN RAISE EXCEPTION 'Invalid appointment owner'; END IF;
 IF EXISTS(SELECT 1 FROM unnest(NEW.member_ids) m WHERE NOT EXISTS(SELECT 1 FROM public.org_members WHERE user_id=m AND organization_id=NEW.organization_id AND active AND foundation_role IS NOT NULL)) THEN RAISE EXCEPTION 'Invalid appointment member'; END IF;
 NEW.updated_at := now();
 RETURN NEW;
END $$;
CREATE TRIGGER foundation_appointment_validate BEFORE INSERT OR UPDATE ON public.crm_appointments FOR EACH ROW EXECUTE FUNCTION private.foundation_appointment_validate();

ALTER TABLE public.crm_timeline DROP CONSTRAINT crm_timeline_kind_check;
ALTER TABLE public.crm_timeline ADD CONSTRAINT crm_timeline_kind_check CHECK (kind IN ('client_created','dossier_created','status_changed','contact','note','appointment_created','appointment_cancelled'));

CREATE FUNCTION private.foundation_appointment_timeline() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
 IF NEW.client_id IS NULL THEN RETURN NEW; END IF;
 IF TG_OP='INSERT' THEN
  INSERT INTO public.crm_timeline(organization_id,client_id,dossier_id,kind,detail) VALUES(NEW.organization_id,NEW.client_id,NEW.dossier_id,'appointment_created',jsonb_build_object('title',NEW.title,'start_at',NEW.start_at,'appointment_id',NEW.id));
 ELSIF OLD.status<>'cancelled' AND NEW.status='cancelled' THEN
  INSERT INTO public.crm_timeline(organization_id,client_id,dossier_id,kind,detail) VALUES(NEW.organization_id,NEW.client_id,NEW.dossier_id,'appointment_cancelled',jsonb_build_object('title',NEW.title,'start_at',NEW.start_at,'appointment_id',NEW.id));
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER foundation_appointment_timeline AFTER INSERT OR UPDATE ON public.crm_appointments FOR EACH ROW EXECUTE FUNCTION private.foundation_appointment_timeline();