-- Migration: add products table with multiple images support
-- Created: 2025-07-26T17:19:37.299Z
-- Updated: Support for multiple product images using JSONB array

-- Products table with multiple images support
CREATE TABLE public.products (
  code UUID NOT NULL DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  brand_code UUID NOT NULL,
  category_code UUID NOT NULL,
  user_code UUID NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  sku VARCHAR(100) NULL,
  images JSONB NOT NULL DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT products_pk PRIMARY KEY (code),
  CONSTRAINT products_brand_fk FOREIGN KEY (brand_code) REFERENCES public.brands (code) ON DELETE RESTRICT,
  CONSTRAINT products_category_fk FOREIGN KEY (category_code) REFERENCES public.categories (code) ON DELETE RESTRICT,
  CONSTRAINT products_user_fk FOREIGN KEY (user_code) REFERENCES public.users (code) ON DELETE RESTRICT,
  CONSTRAINT products_sku_uq UNIQUE (sku),
  CONSTRAINT products_price_check CHECK (price >= 0)
);

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
