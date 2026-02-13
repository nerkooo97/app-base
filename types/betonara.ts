export interface ProizvodnjaBetona {
    id?: string;
    betonara_id: string;
    proizvodni_zapis_br: number;
    proizvodnja_br?: string;
    recept_br?: string;
    prijemnica?: string;
    recept_oznaka?: string;
    recept_naziv?: string;
    sifra_porudzbe?: string;
    statu?: string;
    nakliyat_bolgesi?: string;
    datum_pocetka: string;
    datum_zavrsetka?: string;
    kompanija?: string;
    kupac?: string;
    gradiliste?: string;
    vozilo?: string;
    vozac?: string;
    kolicina_m3?: number;
    kolicina_planirana?: number;
    povratni_beton?: number;
    povratni_beton_napomena?: string;

    // Agregati
    agg1_kg?: number; agg1_hata_girilen?: number; agg1_hata_hesaplanan?: number; agg1_yuzde_fark?: number;
    agg2_kg?: number; agg2_hata_girilen?: number; agg2_hata_hesaplanan?: number; agg2_yuzde_fark?: number;
    agg3_kg?: number; agg3_hata_girilen?: number; agg3_hata_hesaplanan?: number; agg3_yuzde_fark?: number;
    agg4_kg?: number; agg4_hata_girilen?: number; agg4_hata_hesaplanan?: number; agg4_yuzde_fark?: number;
    agg5_kg?: number; agg5_yuzde_fark?: number;
    agg6_kg?: number; agg6_yuzde_fark?: number;

    // Cementi
    cem1_kg?: number; cem1_hata_girilen?: number; cem1_hata_hesaplanan?: number; cem1_yuzde_fark?: number;
    cem2_kg?: number; cem2_hata_girilen?: number; cem2_hata_hesaplanan?: number; cem2_yuzde_fark?: number;
    cem3_kg?: number; cem3_hata_girilen?: number; cem3_hata_hesaplanan?: number; cem3_yuzde_fark?: number;
    cem4_kg?: number; cem4_hata_girilen?: number; cem4_hata_hesaplanan?: number; cem4_yuzde_fark?: number;

    // Aditivi
    add1_kg?: number; add1_hata_girilen?: number; add1_hata_hesaplanan?: number; add1_yuzde_fark?: number;
    add2_kg?: number; add2_hata_girilen?: number; add2_hata_hesaplanan?: number; add2_yuzde_fark?: number;
    add3_kg?: number; add3_hata_girilen?: number; add3_hata_hesaplanan?: number; add3_yuzde_fark?: number;
    add4_kg?: number; add4_hata_girilen?: number; add4_hata_hesaplanan?: number; add4_yuzde_fark?: number;
    add5_kg?: number;

    // Ek Madde
    ek_madde_1_naziv?: string; ek_madde_1_kg?: number;
    ek_madde_2_naziv?: string; ek_madde_2_kg?: number;

    // Voda
    wat1_kg?: number; wat1_hata_girilen?: number; wat1_hata_hesaplanan?: number; wat1_yuzde_fark?: number;
    wat2_kg?: number; wat2_hata_girilen?: number; wat2_hata_hesaplanan?: number; wat2_yuzde_fark?: number;
    extra_water1_kg?: number; extra_water2_kg?: number;

    raw_data?: any;
    created_at?: string;

    // Virtualna polja dodana u backendu za lakši rad na klijentu
    date?: Date;
    recipe_number?: string;
    total_quantity?: number;
    work_order_number?: string;
    customer?: string;
    jobsite?: string;
    driver?: string;
    vehicle?: string;
    recipe_no?: string;
    issuance_number?: string;
    production_no?: string;
    company?: string;
}

export type BetonaraProductionRecord = ProizvodnjaBetona;
export type BetonaraMaterial = {
    code: string;
    name: string;
    unit: string;
    is_active: boolean;
    display_order: number;
};

export interface BetonaraStats {
    total_m3: number;
    record_count: number;
    by_plant: Record<string, number>;
    by_recipe: Record<string, number>;
    daily_production: Array<{ date: string, value: number }>;
    material_consumption: Record<string, number>;
    material_targets: Record<string, number>;
}
