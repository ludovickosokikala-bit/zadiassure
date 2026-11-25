CREATE TABLE public.crm_budgets(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 organization_id uuid NOT NULL REFERENCES public.organizations(id),
 client_id uuid NOT NULL,
 label text NOT NULL CHECK (btrim(label)<>''),
 budget_date date NOT NULL DEFAULT CURRENT_DATE,
 created_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(id, organization_id),
 FOREIGN KEY (client_id, organization_id) REFERENCES public.crm_clients(id, organization_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_budgets TO authenticated;
GRANT ALL ON public.crm_budgets TO service_role;
ALTER TABLE public.crm_budgets ENABLE ROW LEVEL SECURITY;
CREATE POLICY staff_budgets ON public.crm_budgets FOR ALL TO authenticated USING (private.foundation_staff(organization_id)) WITH CHECK (private.foundation_staff(organization_id));

CREATE TABLE public.crm_budget_lines(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 organization_id uuid NOT NULL REFERENCES public.organizations(id),
 budget_id uuid NOT NULL,
 kind text NOT NULL CHECK (kind IN ('income','fixed','variable')),
 category text NOT NULL,
 label text NOT NULL DEFAULT '',
 amount numeric(12,2) NOT NULL DEFAULT 0 CHECK (amount >= 0),
 sort_order integer NOT NULL DEFAULT 0,
 FOREIGN KEY (budget_id, organization_id) REFERENCES public.crm_budgets(id, organization_id) ON DELETE CASCADE
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_budget_lines TO authenticated;
GRANT ALL ON public.crm_budget_lines TO service_role;
ALTER TABLE public.crm_budget_lines ENABLE ROW LEVEL SECURITY;
CREATE POLICY staff_budget_lines ON public.crm_budget_lines FOR ALL TO authenticated USING (private.foundation_staff(organization_id)) WITH CHECK (private.foundation_staff(organization_id));

CREATE TABLE public.crm_debts(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 organization_id uuid NOT NULL REFERENCES public.organizations(id),
 client_id uuid NOT NULL,
 dossier_id uuid,
 creditor text NOT NULL CHECK (btrim(creditor)<>''),
 creditor_type text NOT NULL DEFAULT 'other' CHECK (creditor_type IN ('energy','telecom','health','tax','rent','credit','insurance','other')),
 creditor_ref text NOT NULL DEFAULT '',
 agency_name text NOT NULL DEFAULT '',
 agency_ref text NOT NULL DEFAULT '',
 contact text NOT NULL DEFAULT '',
 original_amount numeric(12,2) NOT NULL DEFAULT 0 CHECK (original_amount >= 0),
 outstanding_amount numeric(12,2) NOT NULL DEFAULT 0 CHECK (outstanding_amount >= 0),
 status text NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','plan_requested','agreed','refused','paid_off','referred')),
 notes text NOT NULL DEFAULT '',
 referral_type text NOT NULL DEFAULT '' CHECK (referral_type IN ('','cpas','mediation','lawyer','other')),
 referral_note text NOT NULL DEFAULT '',
 created_at timestamptz NOT NULL DEFAULT now(),
 updated_at timestamptz NOT NULL DEFAULT now(),
 UNIQUE(id, organization_id),
 FOREIGN KEY (client_id, organization_id) REFERENCES public.crm_clients(id, organization_id),
 FOREIGN KEY (dossier_id, organization_id) REFERENCES public.crm_dossiers(id, organization_id)
);
CREATE INDEX crm_debts_client ON public.crm_debts(client_id);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_debts TO authenticated;
GRANT ALL ON public.crm_debts TO service_role;
ALTER TABLE public.crm_debts ENABLE ROW LEVEL SECURITY;
CREATE POLICY staff_debts ON public.crm_debts FOR ALL TO authenticated USING (private.foundation_staff(organization_id)) WITH CHECK (private.foundation_staff(organization_id));

CREATE TABLE public.crm_instalments(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 organization_id uuid NOT NULL REFERENCES public.organizations(id),
 debt_id uuid NOT NULL,
 due_date date NOT NULL,
 amount numeric(12,2) NOT NULL CHECK (amount > 0),
 paid_at date,
 proof_path text,
 created_at timestamptz NOT NULL DEFAULT now(),
 FOREIGN KEY (debt_id, organization_id) REFERENCES public.crm_debts(id, organization_id) ON DELETE CASCADE
);
CREATE INDEX crm_instalments_debt ON public.crm_instalments(debt_id);
CREATE INDEX crm_instalments_due ON public.crm_instalments(organization_id, due_date);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.crm_instalments TO authenticated;
GRANT ALL ON public.crm_instalments TO service_role;
ALTER TABLE public.crm_instalments ENABLE ROW LEVEL SECURITY;
CREATE POLICY staff_instalments ON public.crm_instalments FOR ALL TO authenticated USING (private.foundation_staff(organization_id)) WITH CHECK (private.foundation_staff(organization_id));

ALTER TABLE public.crm_timeline DROP CONSTRAINT crm_timeline_kind_check;
ALTER TABLE public.crm_timeline ADD CONSTRAINT crm_timeline_kind_check CHECK (kind IN ('client_created','dossier_created','status_changed','contact','note','appointment_created','appointment_cancelled','debt_added','debt_status','debt_referred','instalment_paid'));

CREATE FUNCTION private.foundation_debt_validate() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
 IF TG_OP='INSERT' THEN NEW.created_at := now(); NEW.outstanding_amount := coalesce(NEW.outstanding_amount, NEW.original_amount);
 ELSIF NEW.organization_id<>OLD.organization_id OR NEW.client_id<>OLD.client_id THEN RAISE EXCEPTION 'Immutable debt identity'; END IF;
 IF NEW.dossier_id IS NOT NULL AND NOT EXISTS(SELECT 1 FROM public.crm_dossiers WHERE id=NEW.dossier_id AND client_id=NEW.client_id AND organization_id=NEW.organization_id AND service='BUD') THEN RAISE EXCEPTION 'Invalid debt dossier'; END IF;
 NEW.updated_at := now();
 RETURN NEW;
END $$;
CREATE TRIGGER foundation_debt_validate BEFORE INSERT OR UPDATE ON public.crm_debts FOR EACH ROW EXECUTE FUNCTION private.foundation_debt_validate();

CREATE FUNCTION private.foundation_debt_timeline() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
BEGIN
 IF TG_OP='INSERT' THEN
  INSERT INTO public.crm_timeline(organization_id,client_id,dossier_id,kind,detail) VALUES(NEW.organization_id,NEW.client_id,NEW.dossier_id,'debt_added',jsonb_build_object('creditor',NEW.creditor,'amount',NEW.original_amount));
 ELSIF OLD.status<>NEW.status THEN
  IF NEW.status='referred' THEN
   INSERT INTO public.crm_timeline(organization_id,client_id,dossier_id,kind,body,detail) VALUES(NEW.organization_id,NEW.client_id,NEW.dossier_id,'debt_referred',NEW.referral_note,jsonb_build_object('creditor',NEW.creditor,'referral',NEW.referral_type));
  ELSE
   INSERT INTO public.crm_timeline(organization_id,client_id,dossier_id,kind,detail) VALUES(NEW.organization_id,NEW.client_id,NEW.dossier_id,'debt_status',jsonb_build_object('creditor',NEW.creditor,'from',OLD.status,'to',NEW.status));
  END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER foundation_debt_timeline AFTER INSERT OR UPDATE ON public.crm_debts FOR EACH ROW EXECUTE FUNCTION private.foundation_debt_timeline();

CREATE FUNCTION private.foundation_instalment_paid() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = '' AS $$
DECLARE d record; delta numeric(12,2) := 0;
BEGIN
 IF TG_OP='UPDATE' AND (NEW.debt_id<>OLD.debt_id OR NEW.organization_id<>OLD.organization_id) THEN RAISE EXCEPTION 'Immutable instalment identity'; END IF;
 IF TG_OP='INSERT' THEN
  IF NEW.paid_at IS NOT NULL THEN delta := -NEW.amount; END IF;
 ELSIF TG_OP='DELETE' THEN
  IF OLD.paid_at IS NOT NULL THEN delta := OLD.amount; END IF;
 ELSE
  delta := (CASE WHEN OLD.paid_at IS NOT NULL THEN OLD.amount ELSE 0 END) - (CASE WHEN NEW.paid_at IS NOT NULL THEN NEW.amount ELSE 0 END);
 END IF;
 IF delta <> 0 THEN
  UPDATE public.crm_debts SET outstanding_amount = greatest(0, least(original_amount, outstanding_amount + delta)) WHERE id = coalesce(NEW.debt_id, OLD.debt_id) RETURNING id, client_id, dossier_id, organization_id, creditor INTO d;
 END IF;
 IF TG_OP<>'DELETE' AND NEW.paid_at IS NOT NULL AND (TG_OP='INSERT' OR OLD.paid_at IS NULL) THEN
  SELECT id, client_id, dossier_id, organization_id, creditor INTO d FROM public.crm_debts WHERE id=NEW.debt_id;
  INSERT INTO public.crm_timeline(organization_id,client_id,dossier_id,kind,detail) VALUES(d.organization_id,d.client_id,d.dossier_id,'instalment_paid',jsonb_build_object('creditor',d.creditor,'amount',NEW.amount,'paid_at',NEW.paid_at,'due_date',NEW.due_date));
 END IF;
 RETURN coalesce(NEW, OLD);
END $$;
CREATE TRIGGER foundation_instalment_paid AFTER INSERT OR UPDATE OR DELETE ON public.crm_instalments FOR EACH ROW EXECUTE FUNCTION private.foundation_instalment_paid();