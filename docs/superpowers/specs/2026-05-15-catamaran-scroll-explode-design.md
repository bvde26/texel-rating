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

- **Locatie:** nieuwe pagina binnen Texel Rating (geen losse site).
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
  animatie.
- **Kleur:** één grijstint (matcap/studio-look). Geen blauw, logo's of branding —
  alleen de vorm.

## Architectuur

Vaste-viewport app-shell met state-based navigatie (`page`/`setPage` in
`src/App.jsx`, geen router-library). De nieuwe pagina wordt op dezelfde manier
ingehangen als bestaande pagina's (lazy import + entry in de page-switch + nav).

### Componenten / bestanden

| Bestand | Verantwoordelijkheid |
|---|---|
| `src/pages/Catamaran.jsx` | Pagina-wrapper. Mount/unmount van de scène, koppelt `useScrollProgress` aan `catamaranScene.update(progress)`. Bevat de canvas-container en `prefers-reduced-motion`-afhandeling. |
| `src/three/catamaranScene.js` | Pure Three.js-module, framework-agnostisch. Bouwt geometrie + lights + camera, levert `update(progress)`, `resize()`, `dispose()`. Geen React-imports. |
| `src/hooks/useScrollProgress.js` | Vangt `wheel` + touch-drag op, accumuleert naar een geëaste progress `0..1` (clamp, geen overscroll). Levert progress + of de animatie "klaar" is. |

### Afhankelijkheden (nieuw)

- `three`
- `animejs`

Geen overige dependencies. Beide zijn klein genoeg en passen bij de
"geen onnodige dependencies"-voorkeur.

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
2. Een **anime.js-timeline** definieert de easing-curve; de pagina "seekt" deze
   timeline op `progress` (geen autoplay). anime.js levert hier de easing en
   getweende waarden; Three.js doet het renderen.
3. `catamaranScene.update(progress)` interpoleert per onderdeel tussen:
   - **assembled transform**: lokale positie/rotatie in het samengestelde model.
   - **exploded transform**: een doelpositie verdeeld over een bol
     (Fibonacci-sphere) rond het zwaartepunt, met een lichte eigen rotatie per
     onderdeel + trage groepsrotatie voor de cinematic touch.
4. Render-loop draait via `requestAnimationFrame`; bij `progress`-wijziging of
   groepsrotatie wordt opnieuw gerenderd. Scroll-up = progress omlaag =
   onderdelen lerpen terug naar assembled (volledig omkeerbaar).

## Edge cases / robuustheid

- **`prefers-reduced-motion: reduce`**: geen wheel-lock/virtual scroll-capture;
  toon een statische, leesbare tussenstand (bijv. progress ≈ 0.5) zodat de
  vorm zichtbaar is zonder beweging.
- **Resize / orientatie**: `resize()` herberekent camera-aspect + renderer-size.
- **Unmount**: `dispose()` ruimt geometries, materials, renderer en
  event-listeners op (geen memory leaks bij paginawissel).
- **Touch vs wheel**: beide gemapt naar dezelfde progress-accumulator; touch-drag
  omhoog/omlaag voelt natuurlijk t.o.v. scrollrichting.
- **Clamp**: progress hard geclamped op `[0, 1]`, geen rubber-band/overscroll.

## Testen (visueel)

- Playwright/webapp-testing smoke:
  - pagina mount, `<canvas>` aanwezig, geen console-errors;
  - progress-input verandert mesh-posities (compleet → exploded);
  - `dispose` bij paginawissel geeft geen errors.
- Screenshots bij progress **0 / 0.5 / 1** als visuele bewijsvoering.
- `prefers-reduced-motion`-pad: statische stand, geen scroll-capture.

## Bewust buiten scope (YAGNI)

- Geen onderdeel-labels, tooltips, titels of UI-tekst.
- Geen kleuren, texturen, branding of Nacra-logo.
- Geen externe 3D-modellen of asset-pipeline.
- Geen autoplay/loop of klik/hover-variant.
- Geen geluid.
