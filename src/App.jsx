import { useCallback, useEffect, useState, lazy, Suspense } from 'react'
import useVersionCheck from './hooks/useVersionCheck'
import Home from './pages/Home'
import { shouldSkipIntro, markIntroSeen } from './intro/introGate.js'

const RaceComparison = lazy(() => import('./pages/RaceComparison'))
const Info = lazy(() => import('./pages/Info'))
const Stats = lazy(() => import('./pages/Stats'))
const Nieuws = lazy(() => import('./pages/Nieuws'))
const Weer = lazy(() => import('./pages/Weer'))
const Rondje = lazy(() => import('./pages/Rondje'))
const Webcams = lazy(() => import('./pages/Webcams'))
const Beheer = lazy(() => import('./pages/Beheer'))
const CatamaranIntro = lazy(() => import('./pages/CatamaranIntro'))

const COPY = {
  nl: {
    tile_compare_title: 'Texel Rating Scores',
    tile_compare_sub: 'Texel Rating tijdcalculator. Gecorrigeerde racetijden op basis van handicap.',
    tile_agenda_title: 'Programma',
    tile_agenda_sub: 'Tijden, regels, contact',
    home_footer: 'Round Texel 2026',
    compare_title: 'Texel Rating Scores',
    agenda_title: 'Programma',
    search_placeholder: 'Schipper, zeilnummer of type',
    no_results: 'Geen boot gevonden',
    your_boat: 'Jouw boot',
    pick_boat: 'Kies je boot',
    spinnaker: 'Spinnaker',
    yes: 'Ja',
    no: 'Nee',
    finish_time: 'Vaartijd',
    h: 'uur', m: 'min', s: 'sec',
    add_competitor: 'Voeg concurrent toe',
    results: 'Uitslag',
    corrected: 'Gecorrigeerd',
    tap_to_set: 'Tik om in te vullen',
    filter_all: 'Alle',
    back: 'Terug',
    schedule: 'Programma',
    rules: 'Regels',
    contacts: 'Contact',
    rating_faq: 'Over TX-rating',
    remove: 'Verwijder',
    edit: 'Bewerk',
    done: 'Klaar',
    reset: 'Reset',
    edition: 'Editie 2026',
    edition_word: 'Editie',
    days_label: 'dagen',
    days_until_prefix: 'nog',
    race_dates: '4, 5, 6 JUNI 2026',
    meta_compare: '290 BOTEN · TEXEL RATING',
    meta_agenda: '4, 5, 6 JUNI 2026',
    ranking: 'DIY uitslag',
    add_boat: 'Boot toevoegen',
    competitors: 'Concurrenten',
    tile_reg_eyebrow: 'Deelnemers',
    how_it_works: 'Kies je boot op zeilnummer, skipper of fokkemaat. Je ziet direct hoeveel tijdsmarge je hebt door de cat-handicap (Texel Rating).',
    cat_catamaran_duo: 'Catamaran duo',
    cat_wingfoil: 'Wingfoil',
    cat_windsurf: 'Windsurf',
    cat_catamaran_single: 'Catamaran solo',
    cat_catamaran: 'Catamaran',
    tile_nieuws_title: 'Nieuws',
    tile_nieuws_sub: 'Updates van de wedstrijdleiding',
    tile_weer_title: 'Actueel weer op TX',
    tile_weer_sub: 'Wind, golven en temperatuur bij paal 17',
    meta_weer: 'LIVE WIND · TEXEL PAAL 17',
    tile_rondje_title: 'Het Rondje',
    tile_rondje_sub: 'Route, gates, tijden, vlaggen en reglement',
    meta_rondje: '65 NM · 6 JUNI 2026 · EDITIE 47',
    tile_webcams_title: 'Texelse webcams',
    tile_webcams_sub: 'Livestreams langs het rondje',
    meta_webcams: '6 CAMERAS · LIVE',
  },
  en: {
    tile_compare_title: 'Texel Rating Scores',
    tile_compare_sub: 'Texel Rating Time Calculator. Net racing times according to handicaps.',
    tile_agenda_title: 'Programme',
    tile_agenda_sub: 'Schedule, rules, contacts',
    home_footer: 'Round Texel 2026',
    compare_title: 'Texel Rating Scores',
    agenda_title: 'Programme',
    search_placeholder: 'Skipper, sail number or type',
    no_results: 'No boats found',
    your_boat: 'Your boat',
    pick_boat: 'Pick your boat',
    spinnaker: 'Spinnaker',
    yes: 'Yes',
    no: 'No',
    finish_time: 'Race time',
    h: 'h', m: 'min', s: 'sec',
    add_competitor: 'Add competitor',
    results: 'Results',
    corrected: 'Corrected',
    tap_to_set: 'Tap to set',
    filter_all: 'All',
    back: 'Back',
    schedule: 'Schedule',
    rules: 'Rules',
    contacts: 'Contacts',
    rating_faq: 'About TX-rating',
    remove: 'Remove',
    edit: 'Edit',
    done: 'Done',
    reset: 'Reset',
    edition: 'Edition 2026',
    edition_word: 'Edition',
    days_label: 'days',
    days_until_prefix: 'in',
    race_dates: '4, 5, 6 JUNE 2026',
    meta_compare: '290 BOATS · TEXEL RATING',
    meta_agenda: '4, 5, 6 JUNE 2026',
    ranking: 'DIY results',
    add_boat: 'Add boat',
    competitors: 'Competitors',
    tile_reg_eyebrow: 'Registrations',
    cat_catamaran_duo: 'Catamaran duo',
    cat_wingfoil: 'Wingfoil',
    cat_windsurf: 'Windsurf',
    cat_catamaran_single: 'Catamaran single',
    cat_catamaran: 'Catamaran',
    how_it_works: 'Find your boat by sail number, skipper or crew. See instantly how much time you gain or lose based on the catamaran handicap (Texel Rating).',
    tile_nieuws_title: 'News',
    tile_nieuws_sub: 'Updates from race management',
    tile_weer_title: 'Current weather on TX',
    tile_weer_sub: 'Wind, waves and temperature at paal 17',
    meta_weer: 'LIVE WIND · TEXEL PAAL 17',
    tile_rondje_title: 'The Round',
    tile_rondje_sub: 'Route, gates, timings, flags and rules',
    meta_rondje: '65 NM · 6 JUNE 2026 · EDITION 47',
    tile_webcams_title: 'Texel webcams',
    tile_webcams_sub: 'Livestreams along the course',
    meta_webcams: '6 CAMERAS · LIVE',
  },
  de: {
    tile_compare_title: 'Texel Rating Scores',
    tile_compare_sub: 'Texel Rating Zeitrechner. Netto-Rennzeiten nach Handicap.',
    tile_agenda_title: 'Programm',
    tile_agenda_sub: 'Zeiten, Regeln, Kontakt',
    home_footer: 'Round Texel 2026',
    compare_title: 'Texel Rating Scores',
    agenda_title: 'Programm',
    search_placeholder: 'Skipper, Segelnummer oder Typ',
    no_results: 'Kein Boot gefunden',
    your_boat: 'Dein Boot',
    pick_boat: 'Boot wählen',
    spinnaker: 'Spinnaker',
    yes: 'Ja',
    no: 'Nein',
    finish_time: 'Fahrzeit',
    h: 'Std', m: 'Min', s: 'Sek',
    add_competitor: 'Konkurrent hinzufügen',
    results: 'Ergebnis',
    corrected: 'Korrigiert',
    tap_to_set: 'Antippen zum Eingeben',
    filter_all: 'Alle',
    back: 'Zurück',
    schedule: 'Programm',
    rules: 'Regeln',
    contacts: 'Kontakt',
    rating_faq: 'Über TX-Rating',
    remove: 'Entfernen',
    edit: 'Bearbeiten',
    done: 'Fertig',
    reset: 'Reset',
    edition: 'Ausgabe 2026',
    edition_word: 'Ausgabe',
    days_label: 'Tage',
    days_until_prefix: 'noch',
    race_dates: '4., 5., 6. JUNI 2026',
    meta_compare: '290 BOOTE · TEXEL RATING',
    meta_agenda: '4., 5., 6. JUNI 2026',
    ranking: 'DIY Ergebnis',
    add_boat: 'Boot hinzufügen',
    competitors: 'Konkurrenten',
    tile_reg_eyebrow: 'Anmeldungen',
    cat_catamaran_duo: 'Katamaran Duo',
    cat_wingfoil: 'Wingfoil',
    cat_windsurf: 'Windsurf',
    cat_catamaran_single: 'Katamaran Solo',
    cat_catamaran: 'Katamaran',
    how_it_works: 'Wähle dein Boot nach Segelnummer, Skipper oder Crew. Sieh sofort, wie viel Zeit du durch das Katamaran-Handicap (Texel Rating) gewinnst oder verlierst.',
    tile_nieuws_title: 'Neuigkeiten',
    tile_nieuws_sub: 'Updates der Rennleitung',
    tile_weer_title: 'Aktuelles Wetter auf TX',
    tile_weer_sub: 'Wind, Wellen und Temperatur bei Paal 17',
    meta_weer: 'LIVE WIND · TEXEL PAAL 17',
    tile_rondje_title: 'Die Runde',
    tile_rondje_sub: 'Strecke, Gates, Zeiten, Flaggen und Regeln',
    meta_rondje: '65 SM · 6. JUNI 2026 · AUSGABE 47',
    tile_webcams_title: 'Texel Webcams',
    tile_webcams_sub: 'Livestreams entlang der Strecke',
    meta_webcams: '6 KAMERAS · LIVE',
  },
  fr: {
    tile_compare_title: 'Texel Rating Scores',
    tile_compare_sub: 'Calculateur Texel Rating. Temps de course nets selon les handicaps.',
    tile_agenda_title: 'Programme',
    tile_agenda_sub: 'Horaires, règles, contact',
    home_footer: 'Round Texel 2026',
    compare_title: 'Texel Rating Scores',
    agenda_title: 'Programme',
    search_placeholder: 'Skipper, numéro ou type',
    no_results: 'Aucun bateau trouvé',
    your_boat: 'Votre bateau',
    pick_boat: 'Choisir votre bateau',
    spinnaker: 'Spinnaker',
    yes: 'Oui',
    no: 'Non',
    finish_time: 'Temps de course',
    h: 'h', m: 'min', s: 'sec',
    add_competitor: 'Ajouter concurrent',
    results: 'Résultats',
    corrected: 'Corrigé',
    tap_to_set: 'Appuyer pour saisir',
    filter_all: 'Tout',
    back: 'Retour',
    schedule: 'Programme',
    rules: 'Règles',
    contacts: 'Contact',
    rating_faq: 'À propos TX-rating',
    remove: 'Supprimer',
    edit: 'Modifier',
    done: 'OK',
    reset: 'Reset',
    edition: 'Édition 2026',
    edition_word: 'Édition',
    days_label: 'jours',
    days_until_prefix: 'encore',
    race_dates: '4, 5, 6 JUIN 2026',
    meta_compare: '290 BATEAUX · TEXEL RATING',
    meta_agenda: '4, 5, 6 JUIN 2026',
    ranking: 'DIY résultats',
    add_boat: 'Ajouter bateau',
    competitors: 'Concurrents',
    tile_reg_eyebrow: 'Inscriptions',
    cat_catamaran_duo: 'Catamaran duo',
    cat_wingfoil: 'Wingfoil',
    cat_windsurf: 'Windsurf',
    cat_catamaran_single: 'Catamaran solo',
    cat_catamaran: 'Catamaran',
    how_it_works: 'Trouvez votre bateau par numéro de voile, skipper ou équipier. Voyez immédiatement votre avantage ou retard selon le handicap catamaran (Texel Rating).',
    tile_nieuws_title: 'Actualités',
    tile_nieuws_sub: 'Mises à jour du comité de course',
    tile_weer_title: 'Météo actuelle sur TX',
    tile_weer_sub: 'Vent, vagues et température à paal 17',
    meta_weer: 'VENT LIVE · TEXEL PAAL 17',
    tile_rondje_title: 'Le Tour',
    tile_rondje_sub: 'Parcours, portes, horaires, pavillons et règles',
    meta_rondje: '65 NM · 6 JUIN 2026 · ÉDITION 47',
    tile_webcams_title: 'Webcams de Texel',
    tile_webcams_sub: 'Directs le long du parcours',
    meta_webcams: '6 CAMÉRAS · DIRECT',
  },
}

export default function App() {
  const initialPage = window.location.pathname === '/beheer' ? 'beheer' : 'home'
  const [page, setPage] = useState(initialPage)
  const [dir, setDir] = useState('fwd')
  const [lang, setLang] = useState('nl')
  const [introDone, setIntroDone] = useState(() => shouldSkipIntro())
  const finishIntro = useCallback(() => {
    markIntroSeen()
    setIntroDone(true)
  }, [])
  useVersionCheck()

  useEffect(() => {
    if (!window.history.state?.page) {
      window.history.replaceState({ page: initialPage }, '')
    }
    const onPop = (e) => {
      const nextPage = e.state?.page ?? 'home'
      setDir('back')
      setPage(nextPage)
    }
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [initialPage])

  const go = (next) => {
    if (next === page) return
    setDir(next === 'home' ? 'back' : 'fwd')
    setPage(next)
    const url = next === 'home' ? '/' : `#${next}`
    window.history.pushState({ page: next }, '', url)
  }

  const t = COPY[lang]
  const props = { t, lang, setLang, go, onBack: () => go('home') }

  const isHome = page === 'home'

  if (!introDone) {
    return (
      <Suspense fallback={<div style={{ position: 'fixed', inset: 0, background: '#e9eaec' }} />}>
        <CatamaranIntro onDone={finishIntro} />
      </Suspense>
    )
  }

  return (
    <div style={{ minHeight: '100svh', background: 'var(--stage)', display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: isHome ? 1280 : 430, height: '100svh', position: 'relative', overflow: 'hidden' }}>
        <div key={page} className={`page-${dir}`} style={{ height: '100svh' }}>
          <Suspense fallback={<div style={{ height: '100svh' }} />}>
            {page === 'home'    && <Home    {...props} />}
            {page === 'compare' && <RaceComparison {...props} />}
            {page === 'agenda'  && <Info    {...props} />}
            {page === 'stats'   && <Stats   {...props} />}
            {page === 'nieuws'  && <Nieuws  {...props} />}
            {page === 'weer'    && <Weer    {...props} />}
            {page === 'rondje'  && <Rondje  {...props} />}
            {page === 'webcams' && <Webcams {...props} />}
            {page === 'beheer'  && <Beheer  {...props} />}
          </Suspense>
        </div>
      </div>
    </div>
  )
}
