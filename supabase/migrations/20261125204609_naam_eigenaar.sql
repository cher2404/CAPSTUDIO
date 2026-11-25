-- Juiste naam van de eigenaar: Cheryl Aldessa Prins (stond eerder als "Prijs").
update public.profiles
   set full_name = 'Cheryl Aldessa Prins'
 where full_name = 'Cheryl Aldessa Prijs';

update public.agreement_templates
   set body = replace(body, 'Cheryl Aldessa Prijs', 'Cheryl Aldessa Prins')
 where body like '%Cheryl Aldessa Prijs%';
