-- 1. Internal helper schema, not exposed to the Data API
CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

REVOKE ALL ON FUNCTION private.has_role(uuid, public.app_role) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;

-- 2. Repoint every policy to the private helper
DROP POLICY IF EXISTS "Admins can delete submissions" ON public.form_submissions;
DROP POLICY IF EXISTS "Admins can read submissions" ON public.form_submissions;
DROP POLICY IF EXISTS "Admins can update submissions" ON public.form_submissions;
DROP POLICY IF EXISTS "Anyone can submit a valid request" ON public.form_submissions;
DROP POLICY IF EXISTS "Admins can delete forms" ON public.form_templates;
DROP POLICY IF EXISTS "Admins can insert forms" ON public.form_templates;
DROP POLICY IF EXISTS "Admins can read all forms" ON public.form_templates;
DROP POLICY IF EXISTS "Admins can update forms" ON public.form_templates;
DROP POLICY IF EXISTS "Admins can delete legislation" ON public.legislation_updates;
DROP POLICY IF EXISTS "Admins can insert legislation" ON public.legislation_updates;
DROP POLICY IF EXISTS "Admins can read all legislation" ON public.legislation_updates;
DROP POLICY IF EXISTS "Admins can update legislation" ON public.legislation_updates;
DROP POLICY IF EXISTS "Admins can read all roles" ON public.user_roles;

DROP FUNCTION IF EXISTS public.has_role(uuid, public.app_role);

CREATE POLICY "Admins can read submissions" ON public.form_submissions
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update submissions" ON public.form_submissions
  FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete submissions" ON public.form_submissions
  FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can read all forms" ON public.form_templates
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert forms" ON public.form_templates
  FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update forms" ON public.form_templates
  FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete forms" ON public.form_templates
  FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can read all legislation" ON public.legislation_updates
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can insert legislation" ON public.legislation_updates
  FOR INSERT TO authenticated WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update legislation" ON public.legislation_updates
  FOR UPDATE TO authenticated USING (private.has_role(auth.uid(), 'admin'))
  WITH CHECK (private.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete legislation" ON public.legislation_updates
  FOR DELETE TO authenticated USING (private.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can read all roles" ON public.user_roles
  FOR SELECT TO authenticated USING (private.has_role(auth.uid(), 'admin'));

-- 3. No direct client writes to submissions: server-side endpoint (service role) only
REVOKE INSERT ON public.form_submissions FROM anon;
REVOKE ALL ON public.form_submissions FROM anon;
GRANT SELECT, UPDATE, DELETE ON public.form_submissions TO authenticated;
GRANT ALL ON public.form_submissions TO service_role;

-- 4. Trigger helper must not be callable through the API
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;