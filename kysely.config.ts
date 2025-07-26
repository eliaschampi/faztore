// Kysely codegen configuration
// This file is used by kysely-codegen CLI tool
import { config } from 'dotenv';

// Load environment variables
config();

// Configuration for kysely-codegen CLI
// Usage: npx kysely-codegen --config-file kysely.config.ts
export default {
	dialect: 'postgres' as const,
	url: `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || 'postgres'}@${process.env.DB_HOST || 'localhost'}:5432/${process.env.DB_NAME || 'faztore'}`,
	outFile: 'src/lib/database/types.ts',
	camelCase: false,
	// Exclude system schemas and focus on public schema
	excludePattern: '^(information_schema|pg_.*|auth\\..*|storage\\..*|realtime\\..*)$'
};
