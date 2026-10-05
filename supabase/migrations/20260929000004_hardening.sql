-- Aanscherping n.a.v. de Supabase security advisor.

-- Vast search_path voor alle functies
alter function public.set_updated_at() set search_path = public;
alter function public.protect_client_columns() set search_path = public;
alter function public.protect_signed_agreement() set search_path = public;
alter function public.render_template(text, jsonb) set search_path = public;
alter function public.quote_vat_changed() set search_path = public;
alter function public.quote_vat_changed() security definer;

-- Triggerfuncties hoeven niet via de API aanroepbaar te zijn (triggers werken gewoon door)
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.gallery_published() from public, anon, authenticated;
revoke execute on function public.quote_items_changed() from public, anon, authenticated;
revoke execute on function public.quote_status_changed() from public, anon, authenticated;
revoke execute on function public.quote_vat_changed() from public, anon, authenticated;
revoke execute on function public.recalc_quote(uuid) from public, anon, authenticated;
revoke execute on function public.my_client_id() from public, anon, authenticated;

-- Helpers alleen voor ingelogde gebruikers (worden gebruikt in RLS-policies en de app)
revoke execute on function public.is_admin() from public, anon;
revoke execute on function public.owns_project(uuid) from public, anon;
revoke execute on function public.can_view_gallery(uuid) from public, anon;
revoke execute on function public.can_download_gallery(uuid) from public, anon;
grant execute on function public.is_admin() to authenticated;
grant execute on function public.owns_project(uuid) to authenticated;
grant execute on function public.can_view_gallery(uuid) to authenticated;
grant execute on function public.can_download_gallery(uuid) to authenticated;
