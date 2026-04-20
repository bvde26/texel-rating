# Texel Rating — Complete Redesign Spec

**Datum:** 2026-04-20  
**Status:** Goedgekeurd voor implementatie

---

## 1. Context

De huidige app heeft een inconsistent "maritime blauw" thema dat door meerdere iteraties is gegroeid. Het doel van deze redesign is een frisse, professionele UI die:

- Cal.com-achtig clean is maar met karakter en kleur
- Primair op mobiel (PWA) werkt — touch-first, grote knoppen
- De vergelijker als kernfunctie centraal stelt
- Snel leesbaar is op de boot tijdens een race

---

## 2. Design Systeem

### 2.1 Kleuren

```css
:root {
  --bg:        #f8f9fa;
  --surface:   #ffffff;
  --border:    #e5e7eb;
  --accent:    #0066FF;
  --accent-bg: #eff6ff;
  --text:      #111827;
  --text2:     #6b7280;
  --text3:     #9ca3af;
  --green:     #10b981;
  --green-bg:  #ecfdf5;
  --red:       #ef4444;
  --red-bg:    #fee2e2;
}
```

### 2.2 Typografie

| Rol | Font | Gewicht |
|-----|------|---------|
| Headers / brand | Plus Jakarta Sans | 700, 800 |
| Body / labels | Inter | 400, 500, 600 |
| Cijfers / TR / diff | DM Mono | 500 |

Google Fonts import:
```
Plus Jakarta Sans: 400;500;600;700;800
Inter: 400;500;600
DM Mono: 500
```

### 2.3 Card stijl

```css
.card {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 14px;
}
```

Geen zware box-shadows — subtiele border volstaat.

### 2.4 Spacing & layout

- Max-breedte: `max-w-sm` (384px) — gecentreerd op tablet/desktop
- Horizontale padding: `px-4` (16px)
- Gap tussen kaarten: `gap-3` (12px)
- iOS safe-area: `pb-safe` onderaan

---

## 3. Navigatie & Shell

### Header (vastgesteld: variant C — pill-nav)

```
┌─────────────────────────────────┐
│ [■] Texel Rating                │  ← logo + naam, links
│ [Home] [Vergelijk] [Schema] [Uitleg]  ← pill-nav, bg #f3f4f6
└─────────────────────────────────┘
```

- Logo: klein SVG-icoon (golf/anker thema) + "Texel Rating" in Plus Jakarta Sans 800
- Pill-nav: `background: #f3f4f6`, actieve tab: `background: #fff, box-shadow: sm`
- Hoogte header: ~84px totaal (logo-rij + pill-rij)
- Plakt bovenaan (`position: sticky, top: 0`)

### Pagina's

| Tab | Pagina | Component |
|-----|--------|-----------|
| Home | Dashboard | `Home.jsx` (nieuw) |
| Vergelijk | Vergelijker | `RaceComparison.jsx` |
| Schema | Event info | `Info.jsx` |
| Uitleg | TR uitleg | `TexelRatingInfo.jsx` |

---

## 4. Pagina: Home Dashboard

### Layout (vastgesteld: variant B — stat-grid + compacte links)

```
┌─────────────────────┐
│ EDITIE 50 · 25 MEI  │  ← section label
│ ┌──────┐ ┌──────┐  │
│ │  290  │ │   6  │  │  ← stat-grid 2×2
│ │boten  │ │klas. │  │    linkerbovencel: accent blauw
│ └──────┘ └──────┘  │
│ ┌──────┐ ┌──────┐  │
│ │  35  │ │ ~60  │  │
│ │dagen │ │ nm   │  │
│ └──────┘ └──────┘  │
│                     │
│ NAVIGEER NAAR       │  ← section label
│ ● Vergelijker    ›  │
│ ● Schema         ›  │
│ ● Uitleg TR      ›  │
└─────────────────────┘
```

- Evenementdatum hardcoded: `25 mei 2025`, editie `50`. Countdown "dagen te gaan" berekend t.o.v. die datum.
- Stat-grid: `grid-cols-2`, accent-blauw op 290-kaart
- Compact links: `border-radius: 10px`, gekleurde dot per link
- Klikken op link navigeert naar desbetreffende tab

---

## 5. Pagina: Vergelijker

### Layout (vastgesteld: variant B — inline, alles zichtbaar)

**Sectie 1 — Jouw boot**
- Section label: "JOUW BOOT"
- Boot selecteren: grote tappable kaart met naam + filter-row
- Filter chips: klasse (Alle / Foiler / Performance / High Perf. / etc.)
- Boot-lijst: scroll met rijen — naam, klasse, TR-waarde rechts
- Geselecteerde boot: blauwe border + `--accent-bg` achtergrond
- Spi-toggle: pill-toggle "Zonder spi / Met spi" direct onder geselecteerde boot

**Sectie 2 — Jouw tijd**
- Section label: "JOUW TIJD (UU:MM)"
- Grote time-input in DM Mono, 18px, placeholder `04:00`
- "+ Boot toevoegen" knop rechts ervan

**Leeg-state scoreboard:** Als er nog geen concurrenten zijn toegevoegd, toont het scoreboard een placeholder: "Voeg een boot toe om te vergelijken" (grijs, gecentreerd).

**Sectie 3 — Scoreboard**
- Section label: "SCOREBOARD"
- Kaarten gesorteerd op diff (grootste voordeel bovenaan)
- Per kaart:
  - Linker border: 3px groen (voordeel) of rood (nadeel)
  - Naam + klasse/TR links
  - Diff getal rechts: DM Mono, 22px, groen of rood
  - Sublabel: "min voordeel" / "min nadeel"
  - Spi-toggle per concurrent (klein, onder naam)
- "× verwijder" op elke concurrent

---

## 6. Pagina: Schema

- Accordeon per dag (maandag t/m zondag race-week)
- Chevron-animatie bij open/dicht
- Tijdslijn-stijl: tijd links (DM Mono), activiteit rechts
- Contactinfo onderaan: telefoon + email in DM Mono

---

## 7. Pagina: Uitleg TR

- Accordeon secties: Wat is TR? / De formule / Correctiefactoren / Rekenvoorbeeld
- Formule in monospace code-blok
- Inline rekenvoorbeeld met echte bootdata (Hobie 14 vs Hobie 16)

---

## 8. Logo

**Brief voor svg-logo-designer:**
- Naam: "Texel Rating"
- Icoon: gestileerde golf of driehoekig zeilschip — eenvoudig, herkenbaar op 22×22px
- Kleur: `#0066FF` voor het icoon, `#111827` voor de tekst
- Formaat: SVG, werkt op witte én lichtgrijze achtergrond
- Stijl: modern, clean, geen nautische kitsch

Output: `public/logo.svg` + `src/components/Logo.jsx`

---

## 9. Te verwijderen

| Bestand | Reden |
|---------|-------|
| `src/pages/BoatCatalog.jsx` | Catalogus leeft in Vergelijker |
| `src/pages/TexelRating.jsx` | Legacy, ongebruikt |
| `src/pages/Registrations.jsx` | Legacy, ongebruikt |

---

## 10. Skills volgorde

1. `svg-logo-designer` — logo maken
2. `frontend-design` — volledige implementatie
3. `verification-before-completion` — checklist voor oplevering

---

## 11. Verificatie

1. `npm run dev` draaien
2. Preview snapshot: Home, Vergelijker, Schema, Uitleg
3. Mobiel formaat (375px) testen
4. Pill-nav navigatie testen
5. Vergelijker: boot selecteren → tijd invoeren → scoreboard verschijnt
6. Screenshot als bewijs
