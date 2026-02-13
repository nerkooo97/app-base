-- Finalna, iscrpna tabela sa apsolutno svim kolonama iz oba sistema
DROP TABLE IF EXISTS proizvodnja_betona CASCADE;

CREATE TABLE proizvodnja_betona (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    betonara_id text NOT NULL,           -- 'Betonara 1' ili 'Betonara 2'
    proizvodni_zapis_br bigint,          -- Record No / Zapis br
    proizvodnja_br text,                 -- Production No
    recept_br text,                      -- Recipe No
    prijemnica text,                     -- Receipt / Prijemnica
    recept_oznaka text,
    recept_naziv text,                   -- Reçete / Naziv
    sifra_porudzbe text,                 -- Order Code
    statu text,                          -- Status
    nakliyat_bolgesi text,               -- Transport Zone
    
    datum_pocetka timestamptz,
    datum_zavrsetka timestamptz,
    
    kompanija text,
    kupac text,
    gradiliste text,
    vozilo text,
    vozac text,
    
    kolicina_m3 numeric(18,4),           -- Quantity
    kolicina_planirana numeric(18,4),    -- Target Quantity
    povratni_beton numeric(18,4),
    povratni_beton_napomena text,

    -- AGREGATI (Uključujući greške)
    agg1_kg numeric(18,4) DEFAULT 0, agg1_hata_girilen numeric(18,4) DEFAULT 0, agg1_hata_hesaplanan numeric(18,4) DEFAULT 0, agg1_yuzde_fark numeric(18,4) DEFAULT 0,
    agg2_kg numeric(18,4) DEFAULT 0, agg2_hata_girilen numeric(18,4) DEFAULT 0, agg2_hata_hesaplanan numeric(18,4) DEFAULT 0, agg2_yuzde_fark numeric(18,4) DEFAULT 0,
    agg3_kg numeric(18,4) DEFAULT 0, agg3_hata_girilen numeric(18,4) DEFAULT 0, agg3_hata_hesaplanan numeric(18,4) DEFAULT 0, agg3_yuzde_fark numeric(18,4) DEFAULT 0,
    agg4_kg numeric(18,4) DEFAULT 0, agg4_hata_girilen numeric(18,4) DEFAULT 0, agg4_hata_hesaplanan numeric(18,4) DEFAULT 0, agg4_yuzde_fark numeric(18,4) DEFAULT 0,
    agg5_kg numeric(18,4) DEFAULT 0, agg5_yuzde_fark numeric(18,4) DEFAULT 0,
    agg6_kg numeric(18,4) DEFAULT 0, agg6_yuzde_fark numeric(18,4) DEFAULT 0,

    -- CEMENTI
    cem1_kg numeric(18,4) DEFAULT 0, cem1_hata_girilen numeric(18,4) DEFAULT 0, cem1_hata_hesaplanan numeric(18,4) DEFAULT 0, cem1_yuzde_fark numeric(18,4) DEFAULT 0,
    cem2_kg numeric(18,4) DEFAULT 0, cem2_hata_girilen numeric(18,4) DEFAULT 0, cem2_hata_hesaplanan numeric(18,4) DEFAULT 0, cem2_yuzde_fark numeric(18,4) DEFAULT 0,
    cem3_kg numeric(18,4) DEFAULT 0, cem3_hata_girilen numeric(18,4) DEFAULT 0, cem3_hata_hesaplanan numeric(18,4) DEFAULT 0, cem3_yuzde_fark numeric(18,4) DEFAULT 0,
    cem4_kg numeric(18,4) DEFAULT 0, cem4_hata_girilen numeric(18,4) DEFAULT 0, cem4_hata_hesaplanan numeric(18,4) DEFAULT 0, cem4_yuzde_fark numeric(18,4) DEFAULT 0,

    -- ADITIVI
    add1_kg numeric(18,4) DEFAULT 0, add1_hata_girilen numeric(18,4) DEFAULT 0, add1_hata_hesaplanan numeric(18,4) DEFAULT 0, add1_yuzde_fark numeric(18,4) DEFAULT 0,
    add2_kg numeric(18,4) DEFAULT 0, add2_hata_girilen numeric(18,4) DEFAULT 0, add2_hata_hesaplanan numeric(18,4) DEFAULT 0, add2_yuzde_fark numeric(18,4) DEFAULT 0,
    add3_kg numeric(18,4) DEFAULT 0, add3_hata_girilen numeric(18,4) DEFAULT 0, add3_hata_hesaplanan numeric(18,4) DEFAULT 0, add3_yuzde_fark numeric(18,4) DEFAULT 0,
    add4_kg numeric(18,4) DEFAULT 0, add4_hata_girilen numeric(18,4) DEFAULT 0, add4_hata_hesaplanan numeric(18,4) DEFAULT 0, add4_yuzde_fark numeric(18,4) DEFAULT 0,
    add5_kg numeric(18,4) DEFAULT 0, 

    -- EK MADDE / POSEBNI ADITIVI
    ek_madde_1_naziv text, ek_madde_1_kg numeric(18,4) DEFAULT 0,
    ek_madde_2_naziv text, ek_madde_2_kg numeric(18,4) DEFAULT 0,

    -- VODA
    wat1_kg numeric(18,4) DEFAULT 0, wat1_hata_girilen numeric(18,4) DEFAULT 0, wat1_hata_hesaplanan numeric(18,4) DEFAULT 0, wat1_yuzde_fark numeric(18,4) DEFAULT 0,
    wat2_kg numeric(18,4) DEFAULT 0, wat2_hata_girilen numeric(18,4) DEFAULT 0, wat2_hata_hesaplanan numeric(18,4) DEFAULT 0, wat2_yuzde_fark numeric(18,4) DEFAULT 0,
    extra_water1_kg numeric(18,4) DEFAULT 0, extra_water2_kg numeric(18,4) DEFAULT 0,

    raw_data jsonb,
    created_at timestamptz DEFAULT now(),
    
    -- Unikatnost po betonari i zapisu
    CONSTRAINT unique_betonara_record_final UNIQUE (betonara_id, proizvodni_zapis_br)
);

CREATE INDEX idx_betonara_datum_final ON proizvodnja_betona (betonara_id, datum_pocetka);