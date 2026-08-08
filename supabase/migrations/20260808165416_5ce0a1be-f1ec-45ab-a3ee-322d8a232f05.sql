DROP POLICY IF EXISTS "Anyone can submit a request" ON public.form_submissions;

CREATE POLICY "Anyone can submit a valid request"
ON public.form_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (
  status = 'new'
  AND language IN ('nl','fr','en')
  AND char_length(btrim(full_name)) BETWEEN 2 AND 120
  AND char_length(email) <= 255
  AND email ~* '^[^@\s]+@[^@\s.]+\.[a-z]{2,}$'
  AND char_length(phone) <= 40
  AND char_length(audience) <= 60
  AND char_length(message) <= 4000
  AND char_length(template_slug) <= 120
  AND template_id IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.form_templates t
    WHERE t.id = form_submissions.template_id
      AND t.published = true
  )
);