alter table public.form_submissions add column if not exists attachments jsonb not null default '[]'::jsonb;

drop policy if exists "Admins can read request uploads" on storage.objects;
create policy "Admins can read request uploads"
on storage.objects for select to authenticated
using (bucket_id = 'request-uploads' and private.has_role(auth.uid(), 'admin'));