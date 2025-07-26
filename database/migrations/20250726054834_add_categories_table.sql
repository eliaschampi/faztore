-- Migration: add categories table
-- Created: 2025-07-26T05:48:34.079Z

-- Categories table
CREATE TABLE public.categories (
  code UUID NOT NULL DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT categories_pk PRIMARY KEY (code),
  CONSTRAINT categories_name_uq UNIQUE (name)
);

-- Categories table indexes
CREATE INDEX categories_name_idx ON public.categories (name);
CREATE INDEX categories_created_at_idx ON public.categories (created_at);
