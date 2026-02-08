# Metodologija obračuna i analize proizvodnje betona

Ovaj dokument objašnjava proces obrade podataka, od uvoza sirovih Excel fajlova do finalne specifikacije utroška materijala na kontrolnoj tabli.

## 1. Izvori podataka

Svi podaci u sistemu potiču direktno iz upravljačkih jedinica (SCADA sistema) betonara:

- **Betonara 1:** Dostavlja podatke primarno na bosanskom/turskom jeziku (npr. _rijecna 0-4_, _cim 1_).
- **Betonara 2:** Dostavlja podatke na engleskom/turskom jeziku (npr. _agg1_, _cement_, _target_).

Sistem automatski prepoznaje o kojoj se betonari radi na osnovu strukture kolona.

## 2. Proces Parsiranja (Uvoz podataka)

Prilikom uvoza Excel fajla, sistem vrši "pametno mapiranje" kolona koristeći sljedeće kriterije:

### A. Prepoznavanje materijala

Sistem skenira zaglavlja i mapira sirove nazive u interne šifre materijala (npr. `01030073`). To omogućava da se podaci sa različitih betonara, koje koriste različite nazive, analiziraju kao jedan jedinstveni materijal.

### B. Razdvajanje Stvarnog i Teoretskog

Za svaku vagu (materijal), sistem u Excelu traži:

- **Stvarna vaga (Actual):** Kolona sa čistim nazivom materijala.
- **Zadana vrijednost (Target):** Kolona koja sadrži ključne riječi: _Target, Plan, Set, Cilj, Hesaplanan_.
- **Odstupanje (Deviation):** Kolona sa oznakama: _Hata, Error, Fark, Deviation, %_.

## 3. Metodologija matematičkog obračuna

Kada gledate izvještaj na kontrolnoj tabli za određeni period (npr. mjesec dana), sistem vrši agregaciju hiljada pojedinačnih mješanja.

### A. Prosječni utrošak po mješanju (kg/l)

Sistem ne sabira samo ukupne tone, već računa prosječnu preciznost doziranja:
$$\text{Prosječni utrošak} = \frac{\sum \text{Sve izmjerene vage u periodu}}{\text{Broj mješanja (šarži)}}$$

### B. Razlika (Gubitak/Ušteda)

Računa se kao apsolutna vrijednost odstupanja u kilogramima ili litrima:
$$\text{Razlika} = \text{Stvarni prosjek} - \text{Teoretski prosjek}$$

### C. Procentualno odstupanje (Preciznost)

Ovo je ključni indikator preciznosti vage i kvaliteta betona:
$$\text{Odstupanje (\%)} = \left( \frac{\text{Stvarni utrošak}}{\text{Teoretski utrošak}} - 1 \right) \times 100$$

## 4. Polja korištena za izračun (Detaljna specifikacija i analiza utroška)

U tabeli "Detaljna specifikacija i analiza utroška", sistem koristi sljedeća polja iz baze podataka za svaki materijal:

### Mapiranje polja po materijalu

Za svaki materijal (Agg1-6, Cem1-4, Add1-5, Water1-2), sistem koristi:

| Kolona u tabeli       | Polje u bazi podataka  | Opis                                                             |
| :-------------------- | :--------------------- | :--------------------------------------------------------------- |
| **Stvarni utrošak**   | `{materijal}_actual`   | Stvarna izmjerena količina (npr. `agg1_actual`, `cem1_actual`)   |
| **Zadana vrijednost** | `{materijal}_target`   | Teoretska/planirana količina (npr. `agg1_target`, `cem1_target`) |
| **Razlika**           | `{materijal}_error`    | Apsolutna razlika = actual - target (npr. `agg1_error`)          |
| **Odstupanje (%)**    | `{materijal}_pct`      | Procentualno odstupanje (npr. `agg1_pct`)                        |
| **Vlažnost (%)**      | `{materijal}_moisture` | Vlažnost materijala (samo za agregate, npr. `agg1_moisture`)     |

**Primjer za Agregat 1 (Riječni 0-4):**

- Stvarni utrošak: `agg1_actual`
- Zadana vrijednost: `agg1_target`
- Razlika: `agg1_error`
- Odstupanje: `agg1_pct`
- Vlažnost: `agg1_moisture`

**Primjer za Cement 1:**

- Stvarni utrošak: `cem1_actual`
- Zadana vrijednost: `cem1_target`
- Razlika: `cem1_error`
- Odstupanje: `cem1_pct`

### Ukupne količine

| Kolona u tabeli                 | Polje u bazi podataka | Opis                                                   |
| :------------------------------ | :-------------------- | :----------------------------------------------------- |
| **Ukupna količina betona (m³)** | `total_quantity`      | Ukupna proizvedena količina betona                     |
| **Ukupna voda**                 | `water`               | Zbir svih water kolona (water1_actual + water2_actual) |
| **Zadana voda**                 | `target_water`        | Zbir svih target water kolona                          |

## 5. Vizualizacija i Pragovi tolerancije

U tabeli "Detaljna specifikacija i analiza utroška", sistem koristi boje za brzu dijagnostiku problema:

| Boja            | Odstupanje  | Opis situacije                                                                    |
| :-------------- | :---------- | :-------------------------------------------------------------------------------- |
| **Zelena**      | **0% - 2%** | **Optimalno.** Vaga je kalibrisana i precizna.                                    |
| **Narandžasta** | **2% - 5%** | **Upozorenje.** Potrebna provjera mehaničkih dijelova vage ili vlažnosti.         |
| **Crvena**      | **> 5%**    | **Kritično.** Velika greska u vaganju. Rizik za kvalitet ili finansijski gubitak. |

## 6. Ručne korekcije

Sistem omogućava ručnu izmjenu podataka u slučaju greške u SCADA sistemu. Svaka takva izmjena se trajno bilježi u **Historiju importa** sa informacijom o korisniku koji je izvršio promjenu, čime se osigurava potpuna transparentnost i audit trail.
