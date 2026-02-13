-- 1. PROVJERA DUPLIKATA (isti datum, recept, količina)
SELECT 
    datum_pocetka,
    recept_naziv,
    kolicina_m3,
    COUNT(*) as broj_duplikata
FROM proizvodnja_betona
WHERE datum_pocetka >= '2026-01-01' 
  AND datum_pocetka <= '2026-01-31'
GROUP BY datum_pocetka, recept_naziv, kolicina_m3
HAVING COUNT(*) > 1
ORDER BY broj_duplikata DESC, datum_pocetka DESC;

-- 2. UKUPNE VRIJEDNOSTI ZA JANUAR 2026 (BETONARA 1)
SELECT 
    'UKUPNO' as tip,
    ROUND(SUM(agg2_kg), 2) as "01030073_Rijecna_0-4",
    ROUND(SUM(agg3_kg), 2) as "01030063_Drobljena_0-4",
    ROUND(SUM(agg4_kg), 2) as "01030074_4-8",
    ROUND(SUM(agg1_kg), 2) as "01030075_8-16",
    ROUND(SUM(cem1_kg), 2) as "01110045_42.5",
    ROUND(SUM(cem2_kg), 2) as "01110045_52.5",
    ROUND(SUM(add1_kg), 2) as "01044076_SIKA_V",
    ROUND(SUM(add2_kg), 2) as "01044077_FM_500",
    ROUND(SUM(wat1_kg), 2) as "Voda",
    ROUND(SUM(kolicina_m3), 2) as "Kolicina"
FROM proizvodnja_betona
WHERE datum_pocetka >= '2026-01-01' 
  AND datum_pocetka <= '2026-01-31'
  AND betonara_id = 'Betonara 1';

-- 3. BROJ ZAPISA PO DATUMU
SELECT 
    DATE(datum_pocetka) as datum,
    COUNT(*) as broj_zapisa,
    ROUND(SUM(add1_kg), 2) as SIKA_V_ukupno,
    ROUND(SUM(add2_kg), 2) as FM_500_ukupno
FROM proizvodnja_betona
WHERE datum_pocetka >= '2026-01-01' 
  AND datum_pocetka <= '2026-01-31'
  AND betonara_id = 'Betonara 1'
GROUP BY DATE(datum_pocetka)
ORDER BY datum DESC;

-- 4. SVI ZAPISI SA ADITIVIMA (da vidimo gdje je problem)
SELECT 
    DATE(datum_pocetka) as datum,
    recept_naziv,
    ROUND(add1_kg, 2) as SIKA_V,
    ROUND(add2_kg, 2) as FM_500,
    ROUND(kolicina_m3, 2) as Kolicina
FROM proizvodnja_betona
WHERE datum_pocetka >= '2026-01-01' 
  AND datum_pocetka <= '2026-01-31'
  AND betonara_id = 'Betonara 1'
  AND (add1_kg > 0 OR add2_kg > 0)
ORDER BY datum DESC, recept_naziv;

-- 5. PROVJERA DA LI IMA ZAPISA SA ISTIM proizvodni_zapis_br
SELECT 
    proizvodni_zapis_br,
    COUNT(*) as broj_duplikata,
    STRING_AGG(CAST(id AS TEXT), ', ') as id_lista
FROM proizvodnja_betona
WHERE datum_pocetka >= '2026-01-01' 
  AND datum_pocetka <= '2026-01-31'
  AND proizvodni_zapis_br IS NOT NULL
GROUP BY proizvodni_zapis_br
HAVING COUNT(*) > 1
ORDER BY broj_duplikata DESC;
