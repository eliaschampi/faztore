-- Migration: add brands table
-- Created: 2025-07-26T06:04:17.701Z

-- Brands table
CREATE TABLE public.brands (
  code UUID NOT NULL DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT brands_pk PRIMARY KEY (code),
  CONSTRAINT brands_name_uq UNIQUE (name)
);

-- Brands table indexes
CREATE INDEX brands_name_idx ON public.brands (name);
CREATE INDEX brands_created_at_idx ON public.brands (created_at);
