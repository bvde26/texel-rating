import { useState, useMemo } from 'react'
import Pressable from '../components/Pressable'
import { Icon } from '../components/icons'
import registrationsData from '../data/registrations.json'

const allBoats = registrationsData.boats
const categoriesTotal = Object.values(registrationsData.categories).reduce((s, c) => s + c.count, 0)
const CREW_SIZE = { catamaran_duo: 2, wingfoil: 1, windsurf: 1, catamaran_single: 1 }
const totalPeople = Object.entries(registrationsData.categories).reduce(
  (s, [id, c]) => s + c.count * (CREW_SIZE[id] ?? 1), 0
)

const COPY = {
  nl: {
    title: 'Weetjes',
    tab_facts: 'Weetjes',
    tab_list: 'Deelnemers',
    search_ph: 'Zoek op naam, boot of zeilnummer',
    cat_all: 'Alle',
    no_results: 'Geen deelnemers gevonden',
    subtitle_suffix: 'deelnemers · 4 categorieën',
    section_field: 'Het veld',
    section_countries: 'Top landen',
    section_fleet: 'De vloot',
    section_sailors: 'De zeilers',
    section_sails: 'Zeilnummers',
    total_people: 'watersporters totaal',
    total_boats: 'inschrijvingen',
    countries: 'nationaliteiten vertegenwoordigd',
    classes: 'verschillende bootsklassen',
    popular_class_sub: 'populairste bootsklasse',
    popular_class_count: '× ingeschreven',
    rare_classes: 'zeldzame klassen',
    rare_sub: 'slechts 1 deelnemer per klasse',
    fastest: 'Snelste handicap',
    slowest: 'Traagste handicap',
    spi: 'vaart met spinnaker',
    family: "duo's varen waarschijnlijk als familie",
    longest_name: 'letters — langste achternaam',
    tussenvoegsel: 'namen met een tussenvoegsel',
    alliteratie: "duo's met dezelfde beginletter",
    lowest_sail: 'Laagste zeilnummer',
    highest_sail: 'Hoogste zeilnummer',
  },
  en: {
    title: 'Fun facts',
    tab_facts: 'Fun facts',
    tab_list: 'Participants',
    search_ph: 'Search by name, boat or sail number',
    cat_all: 'All',
    no_results: 'No participants found',
    subtitle_suffix: 'participants · 4 categories',
    section_field: 'The fleet',
    section_countries: 'Top countries',
    section_fleet: 'The boats',
    section_sailors: 'The sailors',
    section_sails: 'Sail numbers',
    total_people: 'water sports athletes total',
    total_boats: 'registrations (boats)',
    countries: 'nationalities represented',
    classes: 'different boat classes',
    popular_class_sub: 'most popular boat class',
    popular_class_count: '× registered',
    rare_classes: 'rare classes',
    rare_sub: 'only 1 entrant per class',
    fastest: 'Fastest rating',
    slowest: 'Slowest rating',
    spi: 'sail with spinnaker',
    family: 'duos are probably family',
    longest_name: 'letters — longest surname',
    tussenvoegsel: 'names with a particle',
    alliteratie: 'duos sharing the same initial',
    lowest_sail: 'Lowest sail number',
    highest_sail: 'Highest sail number',
  },
  de: {
    title: 'Fakten',
    tab_facts: 'Fakten',
    tab_list: 'Teilnehmer',
    search_ph: 'Suche nach Name, Boot oder Segelnummer',
    cat_all: 'Alle',
    no_results: 'Keine Teilnehmer gefunden',
    subtitle_suffix: 'Teilnehmer · 4 Kategorien',
    section_field: 'Das Feld',
    section_countries: 'Top Länder',
    section_fleet: 'Die Boote',
    section_sailors: 'Die Segler',
    section_sails: 'Segelnummern',
    total_people: 'Wassersportler gesamt',
    total_boats: 'Anmeldungen (Boote)',
    countries: 'Nationalitäten vertreten',
    classes: 'verschiedene Bootsklassen',
    popular_class_sub: 'beliebteste Bootsklasse',
    popular_class_count: '× angemeldet',
    rare_classes: 'seltene Klassen',
    rare_sub: 'nur 1 Teilnehmer je Klasse',
    fastest: 'Schnellste Wertung',
    slowest: 'Langsamste Wertung',
    spi: 'segeln mit Spinnaker',
    family: 'Duos fahren wahrscheinlich als Familie',
    longest_name: 'Zeichen — längster Nachname',
    tussenvoegsel: 'Namen mit Namenszusatz',
    alliteratie: 'Duos mit gleichem Anfangsbuchstaben',
    lowest_sail: 'Niedrigste Segelnummer',
    highest_sail: 'Höchste Segelnummer',
  },
  fr: {
    title: 'Chiffres',
    tab_facts: 'Chiffres',
    tab_list: 'Participants',
    search_ph: 'Rechercher par nom, bateau ou numéro de voile',
    cat_all: 'Tous',
    no_results: 'Aucun participant trouvé',
    subtitle_suffix: 'participants · 4 catégories',
    section_field: 'Le plateau',
    section_countries: 'Top pays',
    section_fleet: 'Les bateaux',
    section_sailors: 'Les marins',
    section_sails: 'Numéros de voile',
    total_people: 'sportifs nautiques au total',
    total_boats: 'inscriptions (bateaux)',
    countries: 'nationalités représentées',
    classes: 'classes de bateaux différentes',
    popular_class_sub: 'classe la plus populaire',
    popular_class_count: '× inscrit',
    rare_classes: 'classes rares',
    rare_sub: '1 seul participant par classe',
    fastest: 'Rating le plus rapide',
    slowest: 'Rating le plus lent',
    spi: 'naviguent avec spinnaker',
    family: 'duos probablement en famille',
    longest_name: 'lettres — nom le plus long',
    tussenvoegsel: 'noms avec particule',
    alliteratie: 'duos avec la même initiale',
    lowest_sail: 'Numéro de voile le plus bas',
    highest_sail: 'Numéro de voile le plus élevé',
  },
}

const COUNTRY_CODE = {
  Netherlands: 'NED', Germany: 'GER', France: 'FRA', Belgium: 'BEL',
  'United Kingdom': 'GBR', 'United Kingdom of Great Britain and Northern Ireland': 'GBR',
  Spain: 'ESP', Italy: 'ITA', Denmark: 'DEN',
  Sweden: 'SWE', Switzerland: 'SUI', Austria: 'AUT', Aruba: 'ARU',
  'United States': 'USA', 'United States of America': 'USA', Norway: 'NOR', Poland: 'POL',
}

const COUNTRY_DISPLAY = {
  'United Kingdom of Great Britain and Northern Ireland': 'United Kingdom',
  'United States of America': 'United States',
}

function buildStats() {
  const countryCount = {}
  allBoats.forEach(b => { if (b.country) countryCount[b.country] = (countryCount[b.country] || 0) + 1 })
  const topCountries = Object.entries(countryCount).sort((a, b) => b[1] - a[1]).slice(0, 3)

  const classCount = {}
  allBoats.forEach(b => { if (b.boatClass) classCount[b.boatClass] = (classCount[b.boatClass] || 0) + 1 })
  const sortedClasses = Object.entries(classCount).sort((a, b) => b[1] - a[1])

  const ratings = allBoats.map(b => b.rating).filter(n => n >= 50)

  const lastName = n => n?.trim().split(/\s+/).pop()?.toLowerCase() || ''
  const allNames = allBoats.flatMap(b => [b.skipper, b.crew].filter(Boolean))
  const allLastNames = allNames.map(lastName)

  const TV = ['van', 'de', 'den', 'der', 'het', 'ter', 'te']
  const hasTv = n => n?.toLowerCase().split(/\s+/).some(w => TV.includes(w))

  const numSails = allBoats
    .map(b => parseInt((b.sailNumber || '').replace(/\D/g, '')))
    .filter(n => n > 0 && !isNaN(n))

  const catamarans = allBoats.filter(b => b.category?.includes('catamaran'))
  const withSpi = catamarans.filter(b => b.spinnaker).length
  const spiPct = catamarans.length > 0 ? Math.round(withSpi / catamarans.length * 100) : 0

  return {
    total: allBoats.length,
    countries: Object.keys(countryCount).length,
    topCountries,
    classes: Object.keys(classCount).length,
    popularClass: sortedClasses[0],
    maxRating: Math.max(...ratings),
    minRating: Math.min(...ratings),
    spiPct,
    longestLastName: Math.max(...allLastNames.map(n => n.length)),
    familyDuos: allBoats.filter(b => b.crew && lastName(b.skipper) === lastName(b.crew)).length,
    alliDuos: allBoats.filter(b => b.crew && b.skipper?.[0]?.toLowerCase() === b.crew?.[0]?.toLowerCase()).length,
    tvNames: allNames.filter(hasTv).length,
    lowestSail: Math.min(...numSails),
    highestSail: Math.max(...numSails),
  }
}

const S = buildStats()

function SectionLabel({ text }) {
  return (
    <div style={{
      fontFamily: 'JetBrains Mono, monospace',
      fontSize: 10, letterSpacing: 1,
      textTransform: 'uppercase',
      color: 'rgba(0,0,0,0.35)',
      marginBottom: 6, paddingLeft: 2,
    }}>{text}</div>
  )
}

function Card({ children }) {
  return (
    <div style={{
      background: '#fff',
      borderRadius: 16,
      border: '1px solid rgba(0,0,0,0.06)',
      boxShadow: '0 2px 8px -4px rgba(0,0,0,0.08)',
      overflow: 'hidden',
      marginBottom: 20,
    }}>
      {children}
    </div>
  )
}

function Row({ label, sub, value, last }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: sub ? 'flex-start' : 'center',
      justifyContent: 'space-between',
      padding: '13px 16px',
      borderBottom: last ? 'none' : '1px solid rgba(0,0,0,0.05)',
      gap: 12,
    }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontFamily: 'Outfit, sans-serif',
          fontSize: 14, color: '#000', letterSpacing: -0.1,
        }}>{label}</div>
        {sub && (
          <div style={{
            fontFamily: 'Outfit, sans-serif',
            fontSize: 12, color: 'rgba(0,0,0,0.4)',
            marginTop: 2,
          }}>{sub}</div>
        )}
      </div>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 16, fontWeight: 700,
        color: '#000', letterSpacing: -0.3,
        textAlign: 'right', flexShrink: 0,
        maxWidth: '50%',
      }}>{value}</div>
    </div>
  )
}

function CountryRow({ country, count, last }) {
  const code = COUNTRY_CODE[country] || country.slice(0, 3).toUpperCase()
  const display = COUNTRY_DISPLAY[country] || country
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      padding: '12px 16px',
      borderBottom: last ? 'none' : '1px solid rgba(0,0,0,0.05)',
      gap: 12,
    }}>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 11, letterSpacing: 0.5, fontWeight: 600,
        color: 'rgba(0,0,0,0.4)',
        minWidth: 32,
      }}>{code}</div>
      <div style={{
        flex: 1,
        fontFamily: 'Outfit, sans-serif',
        fontSize: 14, color: '#000',
      }}>{display}</div>
      <div style={{
        fontFamily: 'JetBrains Mono, monospace',
        fontSize: 16, fontWeight: 700, color: '#000',
      }}>{count}</div>
    </div>
  )
}

const CAT_LIST = Object.entries(registrationsData.categories).map(([id, v]) => ({ id, ...v }))

function catLabel(id, lang) {
  const v = registrationsData.categories[id]
  if (!v) return id
  return lang === 'nl' ? v.nameNl : v.name
}

function ParticipantRow({ b, lang, last }) {
  const name = b.crew ? `${b.skipper} & ${b.crew}` : b.skipper
  const meta = [b.boatClass, b.sailNumber].filter(Boolean).join(' · ') || catLabel(b.category, lang)
  const code = b.country ? (COUNTRY_CODE[b.country] || b.country.slice(0, 3).toUpperCase()) : ''
  const num = parseInt(String(b.id).replace(/\D/g, '')) || null
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 16px', gap: 12,
      borderBottom: last ? 'none' : '1px solid rgba(0,0,0,0.05)',
    }}>
      {num != null && (
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 12, fontWeight: 600, color: 'rgba(0,0,0,0.3)', flexShrink: 0, width: 34, textAlign: 'right' }}>#{num}</div>
      )}
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 14, color: '#000', letterSpacing: -0.1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
        <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 12, color: 'rgba(0,0,0,0.4)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{meta}</div>
      </div>
      {code && (
        <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, fontWeight: 600, letterSpacing: 0.5, color: 'rgba(0,0,0,0.45)', flexShrink: 0 }}>{code}</div>
      )}
    </div>
  )
}

function ParticipantList({ lang, c }) {
  const [query, setQuery] = useState('')
  const [cat, setCat] = useState('all')

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return allBoats.filter(b => {
      if (cat !== 'all' && b.category !== cat) return false
      if (!q) return true
      return [b.skipper, b.crew, b.sailNumber, b.boatClass, b.country]
        .filter(Boolean)
        .some(v => v.toLowerCase().includes(q))
    })
  }, [query, cat])

  return (
    <div style={{ padding: '12px 16px 40px' }}>
      <input
        value={query}
        onChange={e => setQuery(e.target.value)}
        placeholder={c.search_ph}
        style={{
          width: '100%', boxSizing: 'border-box', padding: '11px 14px',
          fontFamily: 'Outfit, sans-serif', fontSize: 14,
          borderRadius: 12, border: '1px solid rgba(0,0,0,0.12)',
          background: '#fff', outline: 'none', marginBottom: 12,
        }}
      />
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 12 }} className="scrollbar-none">
        {[{ id: 'all', label: c.cat_all, count: allBoats.length }, ...CAT_LIST.map(x => ({ id: x.id, label: catLabel(x.id, lang), count: x.count }))].map(chip => {
          const active = cat === chip.id
          return (
            <Pressable
              key={chip.id}
              onClick={() => setCat(chip.id)}
              style={{
                flexShrink: 0, padding: '7px 13px', borderRadius: 999,
                fontFamily: 'Outfit, sans-serif', fontSize: 13, fontWeight: active ? 600 : 500,
                color: active ? '#fff' : 'rgba(0,0,0,0.6)',
                background: active ? '#000' : 'var(--chip)',
                border: '1px solid', borderColor: active ? '#000' : 'var(--border3)',
                whiteSpace: 'nowrap',
              }}
            >
              {chip.label} · {chip.count}
            </Pressable>
          )
        })}
      </div>
      <div style={{
        background: '#fff', borderRadius: 16,
        border: '1px solid rgba(0,0,0,0.06)',
        boxShadow: '0 2px 8px -4px rgba(0,0,0,0.08)',
        overflow: 'hidden',
      }}>
        {filtered.length === 0 ? (
          <div style={{ padding: '28px 16px', textAlign: 'center', fontFamily: 'Outfit, sans-serif', fontSize: 14, color: 'rgba(0,0,0,0.4)' }}>{c.no_results}</div>
        ) : (
          filtered.map((b, i) => (
            <ParticipantRow key={`${b.category}-${b.id}-${i}`} b={b} lang={lang} last={i === filtered.length - 1} />
          ))
        )}
      </div>
    </div>
  )
}

function TabBtn({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        padding: '12px 6px 12px',
        fontFamily: 'Outfit, sans-serif', fontSize: 14,
        fontWeight: active ? 600 : 500,
        color: active ? '#000' : 'rgba(0,0,0,0.45)',
        borderBottom: active ? '2px solid #000' : '2px solid transparent',
        letterSpacing: -0.1, whiteSpace: 'nowrap',
        WebkitTapHighlightColor: 'transparent',
      }}
    >{label}</button>
  )
}

export default function Stats({ lang, onBack }) {
  const c = COPY[lang] || COPY.nl
  const [tab, setTab] = useState('facts')

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
      {/* Header — consistent met Info/RaceComparison */}
      <div style={{ flexShrink: 0, background: 'var(--surface)', borderBottom: '1px solid var(--border2)' }}>
        <div style={{ padding: '18px 20px 0', display: 'flex', alignItems: 'center', gap: 14 }}>
          <Pressable
            onClick={onBack}
            style={{
              width: 36, height: 36, borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--chip)', border: '1px solid var(--border3)', marginLeft: -4, flexShrink: 0,
            }}
          >
            <Icon.Back size={18} color="#000" />
          </Pressable>
          <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 18, letterSpacing: -0.2 }}>
            {c.title}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4, padding: '6px 14px 0' }}>
          <TabBtn label={c.tab_facts} active={tab === 'facts'} onClick={() => setTab('facts')} />
          <TabBtn label={c.tab_list} active={tab === 'list'} onClick={() => setTab('list')} />
        </div>
      </div>

      {tab === 'list' ? (
        <div style={{ flex: 1, overflowY: 'auto' }} className="scrollbar-none">
          <ParticipantList lang={lang} c={c} />
        </div>
      ) : (
      /* Scrollable content */
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 16px 40px' }}>

        <SectionLabel text={c.section_field} />
        <Card>
          <Row label={c.total_people} value={totalPeople} />
          <Row label={c.total_boats} value={categoriesTotal} />
          <Row label={c.countries} value={S.countries} last />
        </Card>

        <SectionLabel text={c.section_countries} />
        <Card>
          {S.topCountries.map(([country, count], i) => (
            <CountryRow
              key={country}
              country={country}
              count={count}
              last={i === S.topCountries.length - 1}
            />
          ))}
        </Card>

        <SectionLabel text={c.section_fleet} />
        <Card>
          <Row
            label={S.popularClass[0]}
            sub={`${S.popularClass[1]}${c.popular_class_count} — ${c.popular_class_sub}`}
            value={S.popularClass[1]}
          />
          <Row label={c.fastest} value={S.minRating} />
          <Row label={c.slowest} value={S.maxRating} last />
        </Card>

        <SectionLabel text={c.section_sailors} />
        <Card>
          <Row label={c.spi} value={`${S.spiPct}%`} />
          <Row label={c.family} value={S.familyDuos} />
          <Row label={c.longest_name} value={S.longestLastName} />
          <Row label={c.tussenvoegsel} value={S.tvNames} />
          <Row label={c.alliteratie} value={S.alliDuos} last />
        </Card>

        <SectionLabel text={c.section_sails} />
        <Card>
          <Row label={c.lowest_sail} value={S.lowestSail.toLocaleString()} />
          <Row label={c.highest_sail} value={S.highestSail.toLocaleString()} last />
        </Card>

      </div>
      )}
    </div>
  )
}
