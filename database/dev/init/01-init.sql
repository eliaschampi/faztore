-- Faztore Admin Database Initialization
-- Docker initialization script - runs ONLY on first container startup
-- Contains ONLY database-level configurations and extensions
-- Table definitions belong in migrations, NOT here

-- Enable UUID extension (required for migrations)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Additional database-level configurations can go here
-- Examples: custom functions, database settings, etc.
-- DO NOT add table definitions - use migrations instead
