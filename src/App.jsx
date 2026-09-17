insert into public.perfiles (
  id,
  nombre,
  rol,
  activo
)
values (
  '738dd635-ebfa-4e77-9604-a19f538e8043'::uuid,
  'Administrador AgroNegocios Mahmoud',
  'admin_editor',
  true
)
returning *;
