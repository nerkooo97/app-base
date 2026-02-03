export interface BetonaraMaterial {
    code: string;
    name: string;
    unit: string;
    is_active: boolean;
    display_order: number;
}

export interface BetonaraProductionRecord {
    id: string;
    plant: 'Betonara 1' | 'Betonara 2';
    work_order_number?: string;
    date: Date;
    recipe_number: string;
    total_quantity: number;
    water: number;
    issuance_number?: string;
    materials: Record<string, number>; // { "01030073": 2500, ... }
}

export interface RecipeMapping {
    id: string;
    original_name: string;
    mapped_name: string;
}

export interface BetonaraStats {
    total_m3: number;
    record_count: number;
    by_plant: Record<string, number>;
    by_recipe: Record<string, number>;
}
