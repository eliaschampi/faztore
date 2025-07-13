#!/usr/bin/env tsx
import { promises as fs } from 'fs';
import { spawn } from 'child_process';
import { getNodeDatabaseConfig } from './connection';

/**
 * Database Type Generator - Development Module
 * Generates TypeScript types from database schema using kysely-codegen
 * Uses process.env for development environment compatibility
 */

console.log('🔄 Generating database types...');

const config = getNodeDatabaseConfig();
const TYPES_DIR = 'src/lib/types/core';
const OUTPUT_FILE = `${TYPES_DIR}/database.ts`;

// Ensure types directory exists
await fs.mkdir(TYPES_DIR, { recursive: true });

// Build the connection string for kysely-codegen
const connectionString = `postgresql://${config.username}:${config.password}@${config.host}:${config.port}/${config.database}`;

console.log('🔄 Generating database types...');

// Run kysely-codegen with proper configuration
const codegen = spawn(
	'npx',
	[
		'kysely-codegen',
		'--dialect=postgres',
		`--url=${connectionString}`,
		`--out-file=${OUTPUT_FILE}`
	],
	{
		stdio: 'inherit'
	}
);

codegen.on('close', (code) => {
	if (code === 0) {
		console.log('✅ Database types generated successfully!');
		console.log(`📁 Types saved to: ${OUTPUT_FILE}`);
	} else {
		console.error('❌ Type generation failed');
		process.exit(1);
	}
});

codegen.on('error', (error) => {
	console.error('❌ Failed to start kysely-codegen:', error);
	process.exit(1);
});
