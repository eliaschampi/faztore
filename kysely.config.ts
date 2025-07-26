// Kysely codegen configuration
// This file is used by kysely-codegen CLI tool
import { config } from 'dotenv';

// Load environment variables
config();

// Simple shared config (same as devDbConfig but inline to avoid import issues)
const dbConfig = {
	host: process.env.DB_HOST || 'localhost',
	user: process.env.DB_USER || 'postgres',
	password: process.env.DB_PASSWORD || 'postgres',
	database: process.env.DB_NAME || 'faztore',
	port: parseInt(process.env.DB_PORT || '5432')
};

// Configuration for kysely-codegen CLI
// Usage: npx kysely-codegen --config-file kysely.config.ts
export default {
	dialect: 'postgres' as const,
	url: `postgresql://${dbConfig.user}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`,
	outFile: 'src/lib/database/types.ts',
	camelCase: false,
	// Exclude system schemas and focus on public schema
	excludePattern: '^(information_schema|pg_.*|auth\\..*|storage\\..*|realtime\\..*)$'
};
