-- =====================================================
-- Faztore Database Tables
-- =====================================================
-- All table definitions
-- =====================================================

-- Users table 
CREATE TABLE public.users (
  code UUID NOT NULL DEFAULT gen_random_uuid (),
  name VARCHAR(100) NULL,
  last_name VARCHAR(150) NULL,
  email VARCHAR(255) NOT NULL,
  photo_url TEXT NULL,
  password_hash VARCHAR(255) NOT NULL,
  is_super_admin BOOLEAN NOT NULL DEFAULT FALSE,
  last_login TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT users_pk PRIMARY KEY (code),
  CONSTRAINT users_email_uq UNIQUE (email)
);

-- Permissions table
CREATE TABLE public.permissions (
  code UUID NOT NULL DEFAULT gen_random_uuid (),
  user_code UUID NOT NULL,
  entity TEXT NOT NULL,
  action VARCHAR(100) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT permissions_pk PRIMARY KEY (code),
  CONSTRAINT permissions_user_fk FOREIGN KEY (user_code) REFERENCES public.users (code) ON DELETE NO ACTION,
  CONSTRAINT permissions_entity_user_action_uq UNIQUE (entity, user_code, action)
);

-- Branches table
CREATE TABLE public.branches (
  code UUID NOT NULL DEFAULT gen_random_uuid (),
  name VARCHAR(100) NOT NULL,
  state BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  users UUID[] NOT NULL,
  CONSTRAINT branches_pk PRIMARY KEY (code)
);
