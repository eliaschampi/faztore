import { json } from '@sveltejs/kit';
import { db } from '$lib/database';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	try {
		// Simple database health check
		const result = await db.executeQuery('select 1' as any); // eslint-disable-line

		return json({
			status: 'healthy',
			database: true,
			timestamp: new Date().toISOString()
		});
	} catch (error) {
		return json(
			{
				status: 'unhealthy',
				database: false,
				error: error instanceof Error ? error.message : 'Unknown error',
				timestamp: new Date().toISOString()
			},
			{ status: 500 }
		);
	}
};
