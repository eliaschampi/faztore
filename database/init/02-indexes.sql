-- =====================================================
-- INDEXES
-- =====================================================

-- Users table indexes
CREATE INDEX users_email_idx ON public.users (email);

-- Permissions table indexes
CREATE INDEX permissions_user_code_idx ON public.permissions (user_code);
CREATE INDEX permissions_entity_idx ON public.permissions (entity);

-- Branches table indexes
CREATE INDEX branches_name_idx ON public.branches (name);


