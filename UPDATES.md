# Updates & openstaande acties

Lijst met zaken die later nog geactualiseerd moeten worden in de app.
Per item: **wat**, **wanneer**, **aanleveren** en **hoe te verwerken**.

---

## 1. Officiële NOR/SI 2026 — catamaran

**Status:** huidige data komt uit NOR/SI 2025 (ONK Catamaran Long distance).
**Verwacht:** vlak vóór de race (mei 2026).
**Aanleveren:** PDF van NOR/SI 2026 (catamaran) van roundtexel.com.

**Hoe te verwerken:**
1. PDF doorlopen, vergelijken met `src/data/rondje.json`.
2. Bijwerken indien gewijzigd:
   - `event.editie` (nu 47)
   - `event.date` en `event.backupDate`
   - `event.skippersMeeting.time` / `event.firstWarningWindow`
   - `officials[]` (namen/rollen)
   - `categories.catamaran.entryFee` en `eligibility`
   - `rules[]` (nieuwe SP/DP of regelwijzigingen)
   - `startProcedure[]` bij afwijkende timings/vlaggen
3. Legs en waypoints: gates kunnen 50–200 m verschuiven; meestal blijven ze op dezelfde plaats maar check Addendum B.
4. Commit met referentie naar NOR-versie.

---

## 2. NOR/SI Wingfoil 2026

**Status:** `categories.wingfoil.available: false` — placeholder toont "volgt zodra beschikbaar".
**Aanleveren:** PDF van NOR/SI Wingfoil 2026.

**Hoe te verwerken:**
1. In `src/data/rondje.json` onder `categories.wingfoil`:
   - `available: true` zetten.
   - `entryFee`, `eligibility.{nl,en,de,fr}` vullen.
2. Afwijkende route t.o.v. catamaran? → eigen `legs[]`, `waypoints[]`, `restrictedAreas[]` onder `categories.wingfoil` hangen.
   Dit vereist kleine refactor in `Rondje.jsx`: nu leest de pagina `data.legs` globaal — laten kiezen op basis van `cat` (fallback naar top-level voor catamaran).
3. Afwijkende startprocedure of vlaggen? → per categorie in JSON, UI dezelfde render.

---

## 3. NOR/SI Windsurf 2026

**Status + aanleveren + verwerking:** idem aan Wingfoil (punt 2), blokje `categories.windsurf`.

---

## 4. Exacte GPS van opblaasboeien (Notice to Competitors)

**Status:** huidige coördinaten zijn berekend op basis van NOR-afstanden en peilingen (Gate 2 → VC: 3.3 NM @ 123°, VC → Gate 3: 7.4 NM @ 206°). Opblaasboeien worden pas vlak vóór de race exact gelegd.
**Verwacht:** Notice to Competitors, 1–3 dagen voor race.

**Aanleveren:** exacte GPS (lat/lon, WGS84) van:
- Gate 1, 2, 3, 4 (stuurboord en bakboord kant, indien gegeven)
- VC-vessel
- 4 gele Vlakte-van-Kerken boeien leg 3
- 3 gele Vlakte-van-Kerken boeien leg 4
- Start-/finishlijn oranje vlaggen

**Hoe te verwerken:** coördinaten aanpassen in `src/data/rondje.json` onder `waypoints[]`. Eventueel extra waypoints toevoegen voor de gele boeien (types `vlakte-buoy`). Map rendert automatisch opnieuw.

---

## 5. Weer-pagina (Paal 17) — iframe geblokkeerd

**Status:** iframe naar `https://21knots.nl/spot/texel-paal-17` wordt geblokkeerd door `X-Frame-Options: SAMEORIGIN` op 21knots.nl.
**Opties:**
- **A.** 21knots.nl vragen om `frame-ancestors 'self' https://*.vercel.app` toe te voegen (of de texel-rating domein).
- **B.** Zelf embedbaar endpoint bouwen op 21knots met alleen Paal 17 (zonder X-Frame).
- **C.** Data direct uit KNMI/RWS DDL trekken en in de Weer-pagina tekenen (zoals 21knots zelf doet).

**Hoe te verwerken:** keuze maken, dan `src/pages/Weer.jsx` vervangen door de gekozen variant.

---

## 6. Inschrijvingen-data (`registrations.json`)

**Status:** snapshot van 21 april 2026 (219 totaal). Wordt niet automatisch bijgewerkt.
**Aanleveren:** nieuwe CSV/JSON export van inschrijvingen (categorie-breakdown en totalen).

**Hoe te verwerken:** vervang `src/data/registrations.json`. Structuur aanhouden: `{ categories: { <id>: { count, nameNl } } }`.

---

## 7. Addendum A (event parking) en Addendum C (shore dots/sectoren)

**Status:** niet verwerkt — alleen in de officiële NOR-PDF aanwezig.
**Nut:** parking-map bij evenement, "waar mag ik aan land na opgeven" (Addendum C).

**Hoe te verwerken:** nieuwe collapsible sectie "Praktisch" in `Rondje.jsx` met twee subsecties. Als afbeeldingen goed genoeg zijn: inline `<img>` met NOR-scan. Anders: Leaflet met extra polygonen per sector (Alpha/Bravo/Charlie/Delta/Echo) en pink shore-dots. Vereist extra data in `rondje.json` onder `practical.parkingMap` en `practical.shoreDots[]`.

---

## 8. Nieuws-pagina

**Status:** bestaat als pagina maar de bron van updates/Notices moet nog gedefinieerd worden.
**Opties:**
- **A.** Handmatig bewerkt `news.json` (committen per update).
- **B.** Koppeling met roundtexel.com of Firebase/Firestore backend met admin-panel.

**Hoe te verwerken:** eerst keuze maken. Voor A: `src/data/news.json` aanmaken en `Nieuws.jsx` eraan koppelen. Voor B: eigen admin/backend specificeren.

---

## 9. Meertalig maken rondje.json (DE/FR verfijnen)

**Status:** NL en EN komen 1-op-1 uit NOR. DE en FR zijn machinevertalingen op basis van de NL/EN versie — prima leesbaar, niet officieel.
**Aanleveren:** eventueel officiële Duitse/Franse vertaling door een native speaker.

**Hoe te verwerken:** per i18n-veld in `src/data/rondje.json` de `de` en `fr` waarden vervangen.

---

## 10. Editienummer verifiëren

**Status:** ik heb `event.editie: 47` aangenomen (NOR 2025 = 46e editie, dus 2026 = 47).
**Aanleveren:** bevestiging van roundtexel.com of wedstrijdleiding.

**Hoe te verwerken:** indien anders: `src/data/rondje.json` → `event.editie` + vertalingen in `src/App.jsx` (`meta_rondje`) en `src/pages/Home.jsx` (`EVENT_EDITIE`).

---

## Werkafspraken bij updates

- Na elke update: `npm run build` lokaal draaien om te checken op fouten.
- Daarna pushen naar `main` — Vercel deployt automatisch.
- Commit-message in het Engels, verwijzen naar NOR-versie of datum van Notice.
- Bij grote wijzigingen: changelog-regel bijvoegen in footer (`v2.6` in `Home.jsx`).
