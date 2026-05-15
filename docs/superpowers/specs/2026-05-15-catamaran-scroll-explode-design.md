# Catamaran scroll-explode animatie — Design

**Datum:** 2026-05-15
**Project:** Texel Rating (`~/Desktop/texel-rating`, React 19 + Vite + Tailwind)
**Status:** Goedgekeurd door gebruiker, klaar voor implementatieplan

## Doel

Een scroll-gestuurde 3D-animatie van een Nacra 15 catamaran in één grijstint.
Bij scrollen gaat het model van een volledige, samengestelde weergave naar een
"exploded" weergave waarbij alle losse onderdelen verdeeld over een bol om het
zwaartepunt zweven. Scrollen terug zet het model weer netjes in elkaar.

Inspiratie: cinematic "sliding" website-animaties (anime.js + Three.js).

## Scope-beslissingen (vastgelegd met gebruiker)

- **Locatie:** **intro-gate vóór de app-shell** binnen Texel Rating (geen losse
  site, géén pagina in de nav/page-switch). Speelt 1× af bij het eerste bezoek;
  daarna gaat de app direct naar Home.
- **Techniek:** echte 3D met Three.js, model **procedureel** opgebouwd uit
  primitives (geen externe `.glb`, geen licentie-afhankelijkheid).
- **Referentiemodel:** Nacra 15 — slanke gebogen rompen, square-top grootzeil,
  zelfkerende fok, hoge fractionele mast (~8 m mast vs ~4,5 m romp).
- **Trigger:** scroll-gestuurd.
- **Scroll-mechanisme:** **Aanpak A — virtual scroll.** Geen echte scrollbar;
  wheel + touch-drag worden opgevangen en gemapt naar een progress 0→1.
  Reden: de app is een vaste-viewport shell (`100svh`, `overflow: hidden`) in
  `src/App.jsx`, er is dus geen normale paginascroll. Virtual scroll past bij de
  app-shell, werkt op mobiel en is omkeerbaar.
- **Tekst:** géén overlay-tekst, géén onderdeel-labels, géén titel. Puur de
  animatie. Eén uitzondering: een **icon-only skip-control** (chevron, geen
  woorden) om de intro over te slaan.
- **Eerste-bezoek-detectie:** `localStorage`-sleutel
  `texelrating:catamaranIntroSeen`. Afwezig + geen reduced-motion → intro tonen.
  Aanwezig → intro nooit renderen, direct Home.
- **Voltooiing:** progress bereikt 1 → korte hold (~600 ms) → fade-out naar
  Home, en flag gezet. Skip-chevron of `prefers-reduced-motion` doen hetzelfde
  (flag zetten + door naar Home), reduced-motion zonder enige render/scroll-lock.
- **Kleur:** één grijstint (matcap/studio-look). Geen blauw, logo's of branding —
  alleen de vorm.

## Architectuur

Vaste-viewport app-shell met state-based navigatie (`page`/`setPage` in
`src/App.jsx`, geen router-library). De catamaran is **geen pagina** in de
page-switch maar een **intro-gate** die in `App.jsx` vóór de normale shell-render
komt:

- Bij mount leest `App.jsx` de localStorage-flag. Ontbreekt die én geen
  `prefers-reduced-motion` → render `<CatamaranIntro onDone={finishIntro} />`
  i.p.v. de page-shell. Anders meteen de normale shell (Home).
- `finishIntro()` zet `texelrating:catamaranIntroSeen='1'`, fade-out, en toont
  daarna de normale shell. Geen `history`/`popstate`-interactie nodig: de intro
  zit niet in de page-history en wordt na voltooiing nooit meer gerenderd.
- Wordt aangeroepen door: progress→1 (+hold), skip-chevron, of (synchroon, vóór
  eerste render) de reduced-motion-check.

### Componenten / bestanden

| Bestand | Verantwoordelijkheid |
|---|---|
| `src/pages/CatamaranIntro.jsx` | Intro-wrapper. Mount/unmount van de scène, koppelt `useScrollProgress` aan `catamaranScene.update(progress)`. Canvas-container, icon-only skip-chevron, hold+fade, roept `onDone` aan. |
| `src/three/catamaranScene.js` | Pure Three.js-module, framework-agnostisch. Bouwt geometrie + lights + camera, levert `update(progress)`, `resize()`, `dispose()`. Geen React-imports. |
| `src/hooks/useScrollProgress.js` | Vangt `wheel` + touch-drag op, accumuleert delta naar geëaste progress `0..1`. Constante `SCROLL_DISTANCE_PX` (richtwaarde ~1400px geaccumuleerde delta = 0→1, tunebaar in implementatie). Hard geclamped, geen overscroll/rubber-band. Levert `{ progress, done }`. |
| `src/App.jsx` (wijziging) | localStorage-check + reduced-motion-check, conditioneel `CatamaranIntro` vóór de bestaande shell, `finishIntro`-callback + fade. |

### Afhankelijkheden (nieuw)

- `three`
- `animejs`

`animejs` levert de easing-curve waarop progress geseekt wordt; het is bewust
beperkt in gebruik (geen autoplay-timelines). Als de easing triviaal blijkt kan
het in de implementatiefase vervallen ten gunste van `THREE.MathUtils` — dan
wordt `animejs` geschrapt. Geen overige dependencies; past bij de "geen
onnodige dependencies"-voorkeur.

## 3D-model (procedureel, Nacra 15)

~15 losse meshes, elk een eigen onderdeel zodat ze individueel kunnen exploderen:

1. Bakboordromp (slank, rocker + opgewipte boeg)
2. Stuurboordromp (idem, gespiegeld)
3. Voorbalk (dwarsbeam)
4. Achterbalk (dwarsbeam)
5. Trampoline-dek (gespannen vlak tussen de rompen)
6. Mast (hoog, lichte buiging)
7. Giek
8. Grootzeil (square-top: brede rechte top, ~4 battens-aanzet in de vorm)
9. Fok (kleiner, voorin, op de voorstag)
10. Roer bakboord
11. Roer stuurboord
12. Helmstok-verbinding (tiller bar)
13. Zwaard bakboord (daggerboard)
14. Zwaard stuurboord (daggerboard)
15. Voorstag/want als dunne lijn(en) — optioneel, alleen als het de silhouet leesbaar houdt

Materiaal: één grijs `MeshMatcapMaterial` of grijze `MeshStandardMaterial` met
subtiele key- + rim-light, neutrale achtergrond. Doel: strakke studio-look,
geen kleur.

## Animatie / data-flow

1. `useScrollProgress` produceert een geëaste `progress` (0 = compleet,
   1 = volledig exploded).
2. Een **anime.js easing-curve** wordt op `progress` geseekt (geen autoplay);
   `CatamaranIntro` mapt de geëaste waarde door naar de scène. Three.js rendert.
3. `catamaranScene.update(progress)` interpoleert per onderdeel tussen:
   - **assembled transform**: lokale positie/rotatie in het samengestelde model.
   - **exploded transform**: een doelpositie verdeeld over een bol
     (Fibonacci-sphere) rond het zwaartepunt, met een lichte eigen rotatie per
     onderdeel + trage groepsrotatie voor de cinematic touch.
4. Render-loop draait via `requestAnimationFrame`; bij `progress`-wijziging of
   groepsrotatie wordt opnieuw gerenderd. Scroll-up = progress omlaag =
   onderdelen lerpen terug naar assembled (volledig omkeerbaar).

## Edge cases / robuustheid

- **`prefers-reduced-motion: reduce`**: intro volledig overslaan — flag direct
  zetten, `CatamaranIntro` wordt nooit gerenderd, geen scroll-capture, meteen
  Home. (Synchroon vóór eerste render bepaald, geen flits.)
- **Resize / orientatie**: `resize()` herberekent camera-aspect + renderer-size.
- **Unmount**: `dispose()` ruimt geometries, materials, renderer en
  event-listeners op bij fade-out/`finishIntro` (geen memory leaks).
- **Touch vs wheel**: beide gemapt naar dezelfde progress-accumulator via
  `SCROLL_DISTANCE_PX`; touch-drag-richting volgt scrollrichting (omhoog scrollen
  = explode vooruit). Geen conflict met `.page-fwd/.page-back` CSS-transitions:
  de intro zit buiten de page-switch.
- **Clamp**: progress hard geclamped op `[0, 1]`, geen rubber-band/overscroll.
- **Skip-chevron**: icon-only, roept dezelfde `finishIntro` aan als voltooiing.
- **localStorage onbeschikbaar/privémodus**: bij read/write-fout intro gewoon
  tonen en niet crashen (best-effort flag, geen blocker).

## Testen (visueel)

- Playwright/webapp-testing smoke (met gewiste localStorage = eerste bezoek):
  - intro mount, `<canvas>` aanwezig, geen console-errors;
  - progress-input verandert mesh-posities (compleet → exploded);
  - voltooiing/skip → flag gezet, Home zichtbaar, `dispose` zonder errors;
  - tweede load (flag gezet) → intro wordt overgeslagen, direct Home.
- Screenshots bij progress **0 / 0.5 / 1** als visuele bewijsvoering.
- `prefers-reduced-motion`-pad: intro overgeslagen, direct Home, geen capture.

## Bewust buiten scope (YAGNI)

- Geen onderdeel-labels, tooltips, titels of UI-tekst (alleen icon-only skip).
- Geen herhaling: intro speelt alleen bij eerste bezoek, geen "opnieuw"-knop.
- Geen pagina/nav-entry, geen deeplink-route, geen history-integratie.
- Geen kleuren, texturen, branding of Nacra-logo.
- Geen externe 3D-modellen of asset-pipeline.
- Geen autoplay/loop of klik/hover-variant.
- Geen geluid.
