CREATE FUNCTION private.foundation_any_staff() RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$ SELECT EXISTS(SELECT 1 FROM public.org_members WHERE user_id=auth.uid() AND active AND foundation_role IN ('admin','staff')); $$;

ALTER TABLE public.crm_clients ADD COLUMN email_reminders boolean NOT NULL DEFAULT false;
ALTER TABLE public.crm_instalments ADD COLUMN reminder_sent_at timestamptz;
ALTER TABLE public.form_submissions ADD COLUMN crm_client_id uuid;
CREATE POLICY staff_read_submissions ON public.form_submissions FOR SELECT TO authenticated USING (private.foundation_any_staff());
CREATE POLICY staff_update_submissions ON public.form_submissions FOR UPDATE TO authenticated USING (private.foundation_any_staff()) WITH CHECK (private.foundation_any_staff());

CREATE TABLE public.crm_letters(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 organization_id uuid NOT NULL REFERENCES public.organizations(id),
 client_id uuid NOT NULL,
 dossier_id uuid,
 title text NOT NULL DEFAULT '',
 file_paths text[] NOT NULL DEFAULT '{}',
 mime_types text[] NOT NULL DEFAULT '{}',
 analysis jsonb,
 analysis_error text NOT NULL DEFAULT '',
 deadline date,
 reply_draft text NOT NULL DEFAULT '',
 created_by uuid,
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(id, organization_id),
 FOREIGN KEY (client_id, organization_id) REFERENCES public.crm_clients(id, organization_id),
 FOREIGN KEY (dossier_id, organization_id) REFERENCES public.crm_dossiers(id, organization_id)
);
CREATE INDEX crm_letters_client ON public.crm_letters(client_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_letters TO authenticated;
GRANT ALL ON public.crm_letters TO service_role;
ALTER TABLE public.crm_letters ENABLE ROW LEVEL SECURITY;
CREATE POLICY staff_letters ON public.crm_letters FOR ALL TO authenticated USING (private.foundation_staff(organization_id)) WITH CHECK (private.foundation_staff(organization_id));

CREATE TABLE public.crm_doc_requests(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 organization_id uuid NOT NULL REFERENCES public.organizations(id),
 client_id uuid NOT NULL,
 dossier_id uuid,
 token_hash text NOT NULL UNIQUE,
 items jsonb NOT NULL DEFAULT '[]'::jsonb,
 status text NOT NULL DEFAULT 'sent' CHECK (status IN ('sent','partial','complete')),
 language text NOT NULL DEFAULT 'nl',
 expires_at timestamptz NOT NULL,
 reminder_sent_at timestamptz,
 created_by uuid,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(id, organization_id),
 FOREIGN KEY (client_id, organization_id) REFERENCES public.crm_clients(id, organization_id),
 FOREIGN KEY (dossier_id, organization_id) REFERENCES public.crm_dossiers(id, organization_id)
);
CREATE INDEX crm_doc_requests_client ON public.crm_doc_requests(client_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_doc_requests TO authenticated;
GRANT ALL ON public.crm_doc_requests TO service_role;
ALTER TABLE public.crm_doc_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY staff_doc_requests ON public.crm_doc_requests FOR ALL TO authenticated USING (private.foundation_staff(organization_id)) WITH CHECK (private.foundation_staff(organization_id));

CREATE TABLE public.crm_documents(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 organization_id uuid NOT NULL REFERENCES public.organizations(id),
 client_id uuid NOT NULL,
 dossier_id uuid,
 request_id uuid,
 category text NOT NULL DEFAULT 'other' CHECK (category IN ('other','client_upload')),
 name text NOT NULL DEFAULT '',
 storage_path text NOT NULL,
 mime_type text NOT NULL DEFAULT '',
 size_bytes integer,
 uploaded_by uuid,
 uploaded_by_label text NOT NULL DEFAULT '',
 created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY (client_id, organization_id) REFERENCES public.crm_clients(id, organization_id),
 FOREIGN KEY (dossier_id, organization_id) REFERENCES public.crm_dossiers(id, organization_id),
 FOREIGN KEY (request_id, organization_id) REFERENCES public.crm_doc_requests(id, organization_id)
);
CREATE INDEX crm_documents_client ON public.crm_documents(client_id);
CREATE INDEX crm_documents_request ON public.crm_documents(request_id, created_at);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_documents TO authenticated;
GRANT ALL ON public.crm_documents TO service_role;
ALTER TABLE public.crm_documents ENABLE ROW LEVEL SECURITY;
CREATE POLICY staff_documents ON public.crm_documents FOR ALL TO authenticated USING (private.foundation_staff(organization_id)) WITH CHECK (private.foundation_staff(organization_id));

CREATE TABLE public.crm_tasks(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 organization_id uuid NOT NULL REFERENCES public.organizations(id),
 title text NOT NULL CHECK (btrim(title)<>''),
 due_date date,
 assignee_id uuid,
 client_id uuid,
 dossier_id uuid,
 letter_id uuid,
 status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','done')),
 done_at timestamptz,
 created_by uuid,
 created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY (client_id, organization_id) REFERENCES public.crm_clients(id, organization_id),
 FOREIGN KEY (dossier_id, organization_id) REFERENCES public.crm_dossiers(id, organization_id),
 FOREIGN KEY (letter_id, organization_id) REFERENCES public.crm_letters(id, organization_id) ON DELETE SET NULL (letter_id)
);
CREATE INDEX crm_tasks_assignee ON public.crm_tasks(organization_id, assignee_id, status);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_tasks TO authenticated;
GRANT ALL ON public.crm_tasks TO service_role;
ALTER TABLE public.crm_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY staff_tasks ON public.crm_tasks FOR ALL TO authenticated USING (private.foundation_staff(organization_id)) WITH CHECK (private.foundation_staff(organization_id));

ALTER TABLE public.crm_timeline DROP CONSTRAINT crm_timeline_kind_check;
ALTER TABLE public.crm_timeline ADD CONSTRAINT crm_timeline_kind_check CHECK (kind IN ('client_created','dossier_created','status_changed','contact','note','appointment_created','appointment_cancelled','debt_added','debt_status','debt_referred','instalment_paid','imm_procedure','imm_step_done','imm_document','imm_decision','imm_referred','letter_added','letter_reply','task_done','doc_request_sent','doc_received','reminder_sent'));

CREATE FUNCTION private.foundation_task_timeline() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
 IF NEW.status='done' AND OLD.status<>'done' THEN
  NEW.done_at := now();
 ELSIF NEW.status='open' THEN NEW.done_at := NULL; END IF;
 IF NEW.dossier_id IS NOT NULL AND NEW.client_id IS NULL THEN SELECT client_id INTO NEW.client_id FROM public.crm_dossiers WHERE id=NEW.dossier_id; END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER foundation_task_before BEFORE INSERT OR UPDATE ON public.crm_tasks FOR EACH ROW EXECUTE FUNCTION private.foundation_task_timeline();
CREATE FUNCTION private.foundation_task_done() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
 IF NEW.client_id IS NOT NULL AND NEW.status='done' AND OLD.status<>'done' THEN
  INSERT INTO public.crm_timeline(organization_id,client_id,dossier_id,kind,detail) VALUES(NEW.organization_id,NEW.client_id,NEW.dossier_id,'task_done',jsonb_build_object('title',NEW.title));
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER foundation_task_done AFTER UPDATE ON public.crm_tasks FOR EACH ROW EXECUTE FUNCTION private.foundation_task_done();

CREATE POLICY crm_documents_staff_read ON storage.objects FOR SELECT TO authenticated USING (bucket_id='crm-documents' AND private.foundation_staff(((storage.foldername(name))[1])::uuid));
CREATE POLICY crm_documents_staff_insert ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id='crm-documents' AND private.foundation_staff(((storage.foldername(name))[1])::uuid));
CREATE POLICY crm_documents_staff_delete ON storage.objects FOR DELETE TO authenticated USING (bucket_id='crm-documents' AND private.foundation_staff(((storage.foldername(name))[1])::uuid));