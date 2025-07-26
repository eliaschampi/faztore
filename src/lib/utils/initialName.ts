export function getInitials(name: string, last_name: string): string {
	return `${name[0]}${last_name[0]}`.toUpperCase();
}
