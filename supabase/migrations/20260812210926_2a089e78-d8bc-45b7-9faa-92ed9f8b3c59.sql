INSERT INTO public.user_roles (user_id, role)
VALUES ('150c38af-9688-46a0-83ed-29e6b970b65e', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;