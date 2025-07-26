export type EntityType = 'branches';

export interface Entity {
	name: string;
	label: EntityType;
}

export const entities: readonly Entity[] = [{ name: 'Sedes', label: 'branches' }];
