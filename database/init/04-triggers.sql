-- =====================================================
-- Faztore Database Triggers
-- =====================================================

-- Users table trigger
CREATE TRIGGER users_updated_at_tg BEFORE UPDATE ON public.users 
FOR EACH ROW EXECUTE FUNCTION public.timestamp_updater ();