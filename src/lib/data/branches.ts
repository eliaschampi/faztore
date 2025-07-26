import { sql } from 'kysely';
import type { Branches } from '$lib/types';
import type { Database } from '$lib/database';

export async function getBranches(db: Database, userCode: string): Promise<Branches[]> {
	try {
		return await db
			.selectFrom('branches')
			.select(['code', 'name', 'created_at', 'users', 'state'])
			.where(sql<boolean>`${userCode} = ANY(users)`)
			.execute();
	} catch {
		return [];
	}
}
