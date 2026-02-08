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
    target_materials?: Record<string, number>; // Theoretical amounts
    target_water?: number;

    // New fields from Excel expansion
    company?: string;
    customer?: string;
    end_date?: Date;
    production_no?: string;
    recipe_no?: string;
    receipt?: string;
    target_quantity?: number;
    return_concrete?: number;
    return_concrete_note?: string;
    order_code?: string;
    jobsite?: string;
    driver?: string;
    vehicle?: string;
    shipping_zone?: string;
    extra_material_1?: string;
    extra_material_1_qty?: number;
    extra_material_2?: string;
    extra_material_2_qty?: number;
    status?: string;
    extra_water_1?: number;
    extra_water_2?: number;

    // Flattened Material Measurement Fields
    // Aggregates (1-6)
    agg1_actual?: number; agg1_target?: number; agg1_error?: number; agg1_pct?: number; agg1_moisture?: number;
    agg2_actual?: number; agg2_target?: number; agg2_error?: number; agg2_pct?: number; agg2_moisture?: number;
    agg3_actual?: number; agg3_target?: number; agg3_error?: number; agg3_pct?: number; agg3_moisture?: number;
    agg4_actual?: number; agg4_target?: number; agg4_error?: number; agg4_pct?: number; agg4_moisture?: number;
    agg5_actual?: number; agg5_target?: number; agg5_error?: number; agg5_pct?: number; agg5_moisture?: number;
    agg6_actual?: number; agg6_target?: number; agg6_error?: number; agg6_pct?: number; agg6_moisture?: number;

    // Cements (1-4)
    cem1_actual?: number; cem1_target?: number; cem1_error?: number; cem1_pct?: number;
    cem2_actual?: number; cem2_target?: number; cem2_error?: number; cem2_pct?: number;
    cem3_actual?: number; cem3_target?: number; cem3_error?: number; cem3_pct?: number;
    cem4_actual?: number; cem4_target?: number; cem4_error?: number; cem4_pct?: number;

    // Additives (1-5)
    add1_actual?: number; add1_target?: number; add1_error?: number; add1_pct?: number;
    add2_actual?: number; add2_target?: number; add2_error?: number; add2_pct?: number;
    add3_actual?: number; add3_target?: number; add3_error?: number; add3_pct?: number;
    add4_actual?: number; add4_target?: number; add4_error?: number; add4_pct?: number;
    add5_actual?: number; add5_target?: number; add5_error?: number; add5_pct?: number;

    // Water (1-2)
    water1_actual?: number; water1_target?: number; water1_error?: number; water1_pct?: number;
    water2_actual?: number; water2_target?: number; water2_error?: number; water2_pct?: number;
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
    daily_production: Array<{ date: string, value: number }>;
    material_consumption: Record<string, number>;
    material_targets: Record<string, number>;
}

export interface BetonaraImportHistory {
    id: string;
    filename?: string | null;
    plant: string;
    added_count?: number;
    skipped_count?: number;
    start_date?: string;
    end_date?: string;
    active_days?: string[];
    imported_by: string;
    import_date: string;
    action_type?: 'IMPORT' | 'MANUAL_ADD' | 'MANUAL_EDIT' | 'MANUAL_DELETE';
    record_id?: string;
    previous_data?: any;
    current_data?: any;
    profiles?: {
        full_name: string;
    };
}
