DROP FUNCTION IF EXISTS public.crm_next_case_number(uuid);

CREATE OR REPLACE FUNCTION private.crm_assign_case_number()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.case_number IS NULL OR NEW.case_number = 0 THEN
    UPDATE public.organizations SET case_number_seq = case_number_seq + 1
    WHERE id = NEW.organization_id
    RETURNING case_number_seq INTO NEW.case_number;
  END IF;
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION private.crm_assign_case_number() FROM PUBLIC, anon, authenticated;

ALTER TABLE public.cases ALTER COLUMN case_number DROP NOT NULL;
CREATE TRIGGER trg_cases_case_number BEFORE INSERT ON public.cases
FOR EACH ROW EXECUTE FUNCTION private.crm_assign_case_number();