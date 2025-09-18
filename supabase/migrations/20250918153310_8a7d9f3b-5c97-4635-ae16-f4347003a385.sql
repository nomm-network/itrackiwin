-- 11.a: default for required fields on template_exercises
alter table public.template_exercises
  alter column weight_unit set default 'kg',
  alter column attribute_values_json set default '{}'::jsonb,
  alter column created_at set default now();

-- 11.b: confirm defaults applied
select column_name, column_default, is_nullable
from information_schema.columns
where table_schema='public' and table_name='template_exercises'
  and column_name in ('weight_unit','attribute_values_json','created_at')
order by column_name;