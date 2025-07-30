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

-- Categories table indexes
CREATE INDEX categories_name_idx ON public.categories (name);
CREATE INDEX categories_created_at_idx ON public.categories (created_at);

-- Brands table indexes
CREATE INDEX brands_name_idx ON public.brands (name);
CREATE INDEX brands_created_at_idx ON public.brands (created_at);

-- Optimized indexes for performance
CREATE INDEX products_name_idx ON public.products (name);
CREATE INDEX products_brand_code_idx ON public.products (brand_code);
CREATE INDEX products_category_code_idx ON public.products (category_code);
CREATE INDEX products_user_code_idx ON public.products (user_code);
CREATE INDEX products_sku_idx ON public.products (sku);
CREATE INDEX products_price_idx ON public.products (price);
CREATE INDEX products_is_active_idx ON public.products (is_active);
CREATE INDEX products_created_at_idx ON public.products (created_at);
CREATE INDEX products_images_gin_idx ON public.products USING GIN (images);




