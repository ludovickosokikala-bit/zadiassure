CREATE TABLE public.crm_imm_procedures(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 organization_id uuid NOT NULL REFERENCES public.organizations(id),
 dossier_id uuid NOT NULL UNIQUE,
 client_id uuid NOT NULL,
 procedure_type text NOT NULL DEFAULT '' CHECK (procedure_type IN ('','residence','renewal','family','nationality','single_permit','professional_card','integration','other')),
 submitted_on date,
 decision_on date,
 decision text NOT NULL DEFAULT '' CHECK (decision IN ('','positive','negative','incomplete')),
 appeal_until date,
 lawyer_name text NOT NULL DEFAULT '',
 referral_note text NOT NULL DEFAULT '',
 referred_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY (dossier_id, organization_id) REFERENCES public.crm_dossiers(id, organization_id) ON DELETE CASCADE,
 FOREIGN KEY (client_id, organization_id) REFERENCES public.crm_clients(id, organization_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_imm_procedures TO authenticated;
GRANT ALL ON public.crm_imm_procedures TO service_role;
ALTER TABLE public.crm_imm_procedures ENABLE ROW LEVEL SECURITY;
CREATE POLICY staff_imm_procedures ON public.crm_imm_procedures FOR ALL TO authenticated USING (private.foundation_staff(organization_id)) WITH CHECK (private.foundation_staff(organization_id));

CREATE TABLE public.crm_imm_persons(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 organization_id uuid NOT NULL REFERENCES public.organizations(id),
 dossier_id uuid NOT NULL,
 person_id uuid NOT NULL,
 document_label text NOT NULL DEFAULT '',
 expires_on date,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(dossier_id, person_id),
 FOREIGN KEY (dossier_id, organization_id) REFERENCES public.crm_dossiers(id, organization_id) ON DELETE CASCADE,
 FOREIGN KEY (person_id, organization_id) REFERENCES public.crm_clients(id, organization_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_imm_persons TO authenticated;
GRANT ALL ON public.crm_imm_persons TO service_role;
ALTER TABLE public.crm_imm_persons ENABLE ROW LEVEL SECURITY;
CREATE POLICY staff_imm_persons ON public.crm_imm_persons FOR ALL TO authenticated USING (private.foundation_staff(organization_id)) WITH CHECK (private.foundation_staff(organization_id));

CREATE TABLE public.crm_imm_steps(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 organization_id uuid NOT NULL REFERENCES public.organizations(id),
 dossier_id uuid NOT NULL,
 label text NOT NULL CHECK (btrim(label)<>''),
 status text NOT NULL DEFAULT 'todo' CHECK (status IN ('todo','doing','done')),
 step_date date,
 sort_order integer NOT NULL DEFAULT 0,
 created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY (dossier_id, organization_id) REFERENCES public.crm_dossiers(id, organization_id) ON DELETE CASCADE
);
CREATE INDEX crm_imm_steps_dossier ON public.crm_imm_steps(dossier_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_imm_steps TO authenticated;
GRANT ALL ON public.crm_imm_steps TO service_role;
ALTER TABLE public.crm_imm_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY staff_imm_steps ON public.crm_imm_steps FOR ALL TO authenticated USING (private.foundation_staff(organization_id)) WITH CHECK (private.foundation_staff(organization_id));

CREATE TABLE public.crm_imm_documents(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 organization_id uuid NOT NULL REFERENCES public.organizations(id),
 dossier_id uuid NOT NULL,
 label text NOT NULL CHECK (btrim(label)<>''),
 status text NOT NULL DEFAULT 'missing' CHECK (status IN ('missing','requested','received','checked','na')),
 notes text NOT NULL DEFAULT '',
 needs_translation boolean NOT NULL DEFAULT false,
 file_path text,
 sort_order integer NOT NULL DEFAULT 0,
 created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY (dossier_id, organization_id) REFERENCES public.crm_dossiers(id, organization_id) ON DELETE CASCADE
);
CREATE INDEX crm_imm_documents_dossier ON public.crm_imm_documents(dossier_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_imm_documents TO authenticated;
GRANT ALL ON public.crm_imm_documents TO service_role;
ALTER TABLE public.crm_imm_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY staff_imm_documents ON public.crm_imm_documents FOR ALL TO authenticated USING (private.foundation_staff(organization_id)) WITH CHECK (private.foundation_staff(organization_id));

CREATE TABLE public.crm_imm_templates(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 organization_id uuid NOT NULL REFERENCES public.organizations(id),
 procedure_type text NOT NULL CHECK (procedure_type IN ('residence','renewal','family','nationality','single_permit','professional_card','integration','other')),
 steps jsonb NOT NULL DEFAULT '[]'::jsonb,
 documents jsonb NOT NULL DEFAULT '[]'::jsonb,
 updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(organization_id, procedure_type)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_imm_templates TO authenticated;
GRANT ALL ON public.crm_imm_templates TO service_role;
ALTER TABLE public.crm_imm_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY staff_read_imm_templates ON public.crm_imm_templates FOR SELECT TO authenticated USING (private.foundation_staff(organization_id));
CREATE POLICY admin_write_imm_templates ON public.crm_imm_templates FOR INSERT TO authenticated WITH CHECK (private.foundation_admin(organization_id));
CREATE POLICY admin_update_imm_templates ON public.crm_imm_templates FOR UPDATE TO authenticated USING (private.foundation_admin(organization_id)) WITH CHECK (private.foundation_admin(organization_id));
CREATE POLICY admin_delete_imm_templates ON public.crm_imm_templates FOR DELETE TO authenticated USING (private.foundation_admin(organization_id));

ALTER TABLE public.crm_timeline DROP CONSTRAINT crm_timeline_kind_check;
ALTER TABLE public.crm_timeline ADD CONSTRAINT crm_timeline_kind_check CHECK (kind IN ('client_created','dossier_created','status_changed','contact','note','appointment_created','appointment_cancelled','debt_added','debt_status','debt_referred','instalment_paid','imm_procedure','imm_step_done','imm_document','imm_decision','imm_referred'));

CREATE FUNCTION private.foundation_imm_validate() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE d record;
BEGIN
 IF TG_OP='UPDATE' AND (NEW.organization_id<>OLD.organization_id OR NEW.dossier_id<>OLD.dossier_id) THEN RAISE EXCEPTION 'Immutable immigration identity'; END IF;
 SELECT client_id, service INTO d FROM public.crm_dossiers WHERE id=NEW.dossier_id AND organization_id=NEW.organization_id;
 IF d.service IS DISTINCT FROM 'IMM' THEN RAISE EXCEPTION 'Not an immigration dossier'; END IF;
 IF TG_TABLE_NAME='crm_imm_procedures' THEN
  NEW.client_id := d.client_id;
  NEW.updated_at := now();
  IF TG_OP='INSERT' THEN NEW.created_at := now(); END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER foundation_imm_validate BEFORE INSERT OR UPDATE ON public.crm_imm_procedures FOR EACH ROW EXECUTE FUNCTION private.foundation_imm_validate();
CREATE TRIGGER foundation_imm_validate BEFORE INSERT OR UPDATE ON public.crm_imm_persons FOR EACH ROW EXECUTE FUNCTION private.foundation_imm_validate();
CREATE TRIGGER foundation_imm_validate BEFORE INSERT OR UPDATE ON public.crm_imm_steps FOR EACH ROW EXECUTE FUNCTION private.foundation_imm_validate();
CREATE TRIGGER foundation_imm_validate BEFORE INSERT OR UPDATE ON public.crm_imm_documents FOR EACH ROW EXECUTE FUNCTION private.foundation_imm_validate();

CREATE FUNCTION private.foundation_imm_timeline() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE cid uuid;
BEGIN
 SELECT client_id INTO cid FROM public.crm_dossiers WHERE id=NEW.dossier_id;
 IF TG_TABLE_NAME='crm_imm_procedures' THEN
  IF NEW.procedure_type<>'' AND (TG_OP='INSERT' OR OLD.procedure_type<>NEW.procedure_type) THEN
   INSERT INTO public.crm_timeline(organization_id,client_id,dossier_id,kind,detail) VALUES(NEW.organization_id,cid,NEW.dossier_id,'imm_procedure',jsonb_build_object('procedure',NEW.procedure_type));
  END IF;
  IF NEW.decision<>'' AND (TG_OP='INSERT' OR OLD.decision<>NEW.decision) THEN
   INSERT INTO public.crm_timeline(organization_id,client_id,dossier_id,kind,detail) VALUES(NEW.organization_id,cid,NEW.dossier_id,'imm_decision',jsonb_build_object('decision',NEW.decision,'date',NEW.decision_on));
  END IF;
  IF NEW.referred_at IS NOT NULL AND (TG_OP='INSERT' OR OLD.referred_at IS DISTINCT FROM NEW.referred_at) THEN
   INSERT INTO public.crm_timeline(organization_id,client_id,dossier_id,kind,body,detail) VALUES(NEW.organization_id,cid,NEW.dossier_id,'imm_referred',NEW.referral_note,jsonb_build_object('lawyer',NEW.lawyer_name));
  END IF;
 ELSIF TG_TABLE_NAME='crm_imm_steps' THEN
  IF NEW.status='done' AND (TG_OP='INSERT' OR OLD.status<>'done') THEN
   INSERT INTO public.crm_timeline(organization_id,client_id,dossier_id,kind,detail) VALUES(NEW.organization_id,cid,NEW.dossier_id,'imm_step_done',jsonb_build_object('step',NEW.label));
  END IF;
 ELSIF TG_TABLE_NAME='crm_imm_documents' THEN
  IF NEW.status IN ('received','checked') AND (TG_OP='INSERT' OR OLD.status<>NEW.status) THEN
   INSERT INTO public.crm_timeline(organization_id,client_id,dossier_id,kind,detail) VALUES(NEW.organization_id,cid,NEW.dossier_id,'imm_document',jsonb_build_object('document',NEW.label,'status',NEW.status));
  END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER foundation_imm_timeline AFTER INSERT OR UPDATE ON public.crm_imm_procedures FOR EACH ROW EXECUTE FUNCTION private.foundation_imm_timeline();
CREATE TRIGGER foundation_imm_timeline AFTER INSERT OR UPDATE ON public.crm_imm_steps FOR EACH ROW EXECUTE FUNCTION private.foundation_imm_timeline();
CREATE TRIGGER foundation_imm_timeline AFTER INSERT OR UPDATE ON public.crm_imm_documents FOR EACH ROW EXECUTE FUNCTION private.foundation_imm_timeline();

CREATE POLICY imm_documents_staff_read ON storage.objects FOR SELECT TO authenticated USING (bucket_id='imm-documents' AND private.foundation_staff(((storage.foldername(name))[1])::uuid));
CREATE POLICY imm_documents_staff_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id='imm-documents' AND private.foundation_staff(((storage.foldername(name))[1])::uuid));
CREATE POLICY imm_documents_staff_delete ON storage.objects FOR DELETE TO authenticated USING (bucket_id='imm-documents' AND private.foundation_staff(((storage.foldername(name))[1])::uuid));