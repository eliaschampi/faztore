import type { Database } from '$lib/database';
import type { Session, User } from '$lib/auth/session';

declare global {
	namespace App {
		interface Locals {
			db: Database;
			user: User | null;
			session: Session | null;
			userPermissions: string[];
			can: (permissionKey: string) => Promise<boolean>;
		}
		interface PageData {
			user: User | null;
			session: Session | null;
		}
	}
}

export {};
