import { useState } from 'react'
import { Icon } from '../components/icons'
import Pressable from '../components/Pressable'
import CollapsibleSection from '../components/CollapsibleSection'
import RouteMap from '../components/RouteMap'
import { FlagById } from '../components/FlagIcons'
import data from '../data/rondje.json'

const CATS = ['catamaran', 'wingfoil', 'windsurf']

const L = {
  title: { nl: 'Het Rondje', en: 'The Round', de: 'Die Runde', fr: 'Le Tour' },
  sec_route:     { nl: 'Route & kaart',       en: 'Route & map',         de: 'Strecke & Karte',     fr: 'Parcours & carte' },
  sec_gates:     { nl: 'Gates & markeringen', en: 'Gates & marks',       de: 'Gates & Markierungen', fr: 'Portes & marques' },
  sec_start:     { nl: 'Tijden & start',      en: 'Times & start',       de: 'Zeiten & Start',       fr: 'Horaires & départ' },
  sec_flags:     { nl: 'Vlaggen & seinen',    en: 'Flags & signals',     de: 'Flaggen & Signale',    fr: 'Pavillons & signaux' },
  sec_safety:    { nl: 'Regels & veiligheid', en: 'Rules & safety',      de: 'Regeln & Sicherheit',  fr: 'Règles & sécurité' },
  sec_protest:   { nl: 'Briefing & protest',  en: 'Briefing & protest',  de: 'Briefing & Protest',   fr: 'Briefing & réclamation' },
  sec_contact:   { nl: 'Officials & contact', en: 'Officials & contact', de: 'Offizielle & Kontakt', fr: 'Officiels & contact' },
  meta_distance: { nl: 'afstand', en: 'distance', de: 'Distanz', fr: 'distance' },
  meta_dir_cw:   { nl: 'klokwijzerrichting', en: 'clockwise', de: 'im Uhrzeigersinn', fr: 'sens horaire' },
  leg:           { nl: 'Leg', en: 'Leg', de: 'Etappe', fr: 'Tronçon' },
  bearing:       { nl: 'peiling', en: 'bearing', de: 'Peilung', fr: 'cap' },
  time_before:   { nl: 'Tijd vóór start', en: 'Time before start', de: 'Zeit vor Start', fr: 'Temps avant départ' },
  flag_col:      { nl: 'Vlag', en: 'Flag', de: 'Flagge', fr: 'Pavillon' },
  action_col:    { nl: 'Actie', en: 'Action', de: 'Aktion', fr: 'Action' },
  sound_col:     { nl: 'Geluid', en: 'Sound', de: 'Ton', fr: 'Son' },
  note_col:      { nl: 'Betekenis', en: 'Note', de: 'Hinweis', fr: 'Note' },
  start_line:    { nl: 'Startlijn', en: 'Start line', de: 'Startlinie', fr: 'Ligne de départ' },
  finish_line:   { nl: 'Finishlijn', en: 'Finish line', de: 'Ziellinie', fr: 'Ligne d\u2019arrivée' },
  late_start:    { nl: 'Te late start', en: 'Late start', de: 'Zu später Start', fr: 'Départ tardif' },
  time_limit:    { nl: 'Tijdslimiet', en: 'Time limit', de: 'Zeitlimit', fr: 'Temps limite' },
  on_board:      { nl: 'Aan boord', en: 'On board', de: 'An Bord', fr: 'À bord' },
  on_body:       { nl: 'Op het lichaam', en: 'On body', de: 'Am Körper', fr: 'Sur le corps' },
  foiling:       { nl: 'Foiling cat', en: 'Foiling cat', de: 'Foiling-Kat', fr: 'Cat foilant' },
  briefing:      { nl: 'Skippers meeting', en: 'Skippers meeting', de: 'Skipper Meeting', fr: 'Briefing skippers' },
  briefing_body: {
    nl: 'Verplicht aanwezig. Wedstrijdleiding behandelt last-minute wijzigingen, weer, lokale condities en tijstromen.',
    en: 'Mandatory. Race management covers last-minute changes, weather, local conditions and tidal streams.',
    de: 'Pflicht. Wettkampfleitung behandelt Last-Minute-Änderungen, Wetter, lokale Bedingungen und Tidenströme.',
    fr: 'Obligatoire. Direction de course : changements de dernière minute, météo, conditions locales et courants.',
  },
  protest_title: { nl: 'Protest', en: 'Protest', de: 'Protest', fr: 'Réclamation' },
  prizes_title:  { nl: 'Prijzen', en: 'Prizes', de: 'Preise', fr: 'Prix' },
  not_available: {
    nl: 'Voor deze categorie gebruiken we een aparte NOR/SI. Zodra die voor 2026 beschikbaar is, vullen we deze sectie.',
    en: 'This category has its own NOR/SI. As soon as the 2026 version is available, we will fill this section.',
    de: 'Diese Kategorie hat eine eigene NOR/SI. Sobald die 2026-Version verfügbar ist, füllen wir diesen Abschnitt.',
    fr: 'Cette catégorie a son propre NOR/SI. Dès que la version 2026 sera disponible, nous la remplirons.',
  },
  cat_catamaran: { nl: 'Catamaran', en: 'Catamaran', de: 'Katamaran', fr: 'Catamaran' },
  cat_wingfoil:  { nl: 'Wingfoil', en: 'Wingfoil', de: 'Wingfoil', fr: 'Wingfoil' },
  cat_windsurf:  { nl: 'Windsurf', en: 'Windsurf', de: 'Windsurf', fr: 'Windsurf' },
  event_label:   { nl: 'Editie', en: 'Edition', de: 'Ausgabe', fr: 'Édition' },
  entry_fee:     { nl: 'Inschrijfgeld', en: 'Entry fee', de: 'Startgeld', fr: 'Droits d\u2019inscription' },
  eligibility:   { nl: 'Toelating', en: 'Eligibility', de: 'Zulassung', fr: 'Éligibilité' },
}

function pick(obj, lang) {
  if (!obj) return ''
  if (typeof obj === 'string') return obj
  return obj[lang] || obj.nl || obj.en || ''
}

function formatDate(iso, lang) {
  const d = new Date(iso)
  const locale = lang === 'nl' ? 'nl-NL' : lang === 'de' ? 'de-DE' : lang === 'fr' ? 'fr-FR' : 'en-GB'
  return d.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

function Row({ children, last }) {
  return (
    <div style={{
      display: 'flex', gap: 10, padding: '8px 0',
      borderBottom: last ? 'none' : '1px solid var(--border2)',
      alignItems: 'baseline',
    }}>{children}</div>
  )
}

function Label({ children }) {
  return <div style={{
    fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
    letterSpacing: 0.5, textTransform: 'uppercase',
    color: 'rgba(0,0,0,0.5)', minWidth: 52, flexShrink: 0,
  }}>{children}</div>
}

function Body({ children }) {
  return <div style={{
    fontFamily: 'Outfit, sans-serif', fontSize: 13.5,
    color: '#000', lineHeight: 1.45, flex: 1, minWidth: 0,
  }}>{children}</div>
}

function Chip({ active, onClick, children }) {
  return (
    <Pressable
      onClick={onClick}
      style={{
        padding: '7px 12px',
        borderRadius: 999,
        background: active ? '#000' : 'var(--chip)',
        color: active ? '#fff' : '#000',
        border: '1px solid ' + (active ? '#000' : 'var(--border3)'),
        fontFamily: 'Outfit, sans-serif',
        fontSize: 12.5, fontWeight: 600, letterSpacing: -0.1,
        flexShrink: 0,
      }}
    >{children}</Pressable>
  )
}

export default function Rondje({ onBack, lang }) {
  const [cat, setCat] = useState('catamaran')
  const category = data.categories[cat]

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflow: 'hidden' }}>

      {/* Header */}
      <div style={{ flexShrink: 0, background: 'var(--surface)', borderBottom: '1px solid var(--border2)' }}>
        <div style={{ padding: '18px 20px 12px', display: 'flex', alignItems: 'center', gap: 14 }}>
          <Pressable
            onClick={onBack}
            style={{
              width: 36, height: 36, borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--chip)', border: '1px solid var(--border3)',
              marginLeft: -4, flexShrink: 0,
            }}
          >
            <Icon.Back size={18} color="#000" />
          </Pressable>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 10, letterSpacing: 0.6,
              textTransform: 'uppercase', color: 'rgba(0,0,0,0.5)',
            }}>
              {pick(L.event_label, lang)} {data.event.editie} · {formatDate(data.event.date, lang)}
            </div>
            <div style={{
              fontFamily: 'Outfit, sans-serif',
              fontWeight: 700, fontSize: 20, letterSpacing: -0.3,
              color: '#000', marginTop: 2,
            }}>{pick(L.title, lang)}</div>
          </div>
        </div>
        <div style={{
          padding: '4px 16px 12px',
          display: 'flex', gap: 8, overflowX: 'auto',
        }} className="scrollbar-none">
          {CATS.map(c => (
            <Chip key={c} active={cat === c} onClick={() => setCat(c)}>
              {pick(L[`cat_${c}`], lang)}
            </Chip>
          ))}
        </div>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '12px 16px 24px' }} className="scrollbar-none">
        {!category.available ? (
          <div style={{
            background: 'var(--surface)', border: '1px solid var(--border2)',
            borderRadius: 16, padding: '20px 18px',
            fontFamily: 'Outfit, sans-serif', fontSize: 14,
            color: 'rgba(0,0,0,0.7)', lineHeight: 1.5,
          }}>
            {pick(L.not_available, lang)}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

            {/* 1. Route + kaart */}
            <CollapsibleSection
              eyebrow="01"
              title={pick(L.sec_route, lang)}
              defaultOpen
            >
              <div style={{
                display: 'flex', gap: 10, flexWrap: 'wrap',
                margin: '12px 0',
                fontFamily: 'JetBrains Mono, monospace',
                fontSize: 11, letterSpacing: 0.4,
                color: 'rgba(0,0,0,0.65)', textTransform: 'uppercase',
              }}>
                <span>{data.event.distanceNm} NM · {data.event.distanceKm} km</span>
                <span>·</span>
                <span>{pick(L.meta_dir_cw, lang)}</span>
              </div>
              <RouteMap data={data} lang={lang} />
              <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {data.legs.map((leg, i) => (
                  <div key={leg.id} style={{
                    padding: '10px 12px',
                    background: 'var(--chip)',
                    borderRadius: 10,
                    border: '1px solid var(--border3)',
                  }}>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between', gap: 8,
                      marginBottom: 4, alignItems: 'baseline',
                    }}>
                      <div style={{
                        fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                        letterSpacing: 0.6, textTransform: 'uppercase',
                        color: 'rgba(0,0,0,0.55)',
                      }}>{pick(L.leg, lang)} {leg.id}</div>
                      <div style={{
                        fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
                        fontVariantNumeric: 'tabular-nums', color: '#000',
                      }}>
                        {leg.distanceNm ? `${leg.distanceNm} NM` : ''}
                        {leg.bearing ? ` · ${leg.bearing}°` : ''}
                      </div>
                    </div>
                    <div style={{
                      fontFamily: 'Outfit, sans-serif', fontSize: 13.5,
                      fontWeight: 600, color: '#000', marginBottom: 4,
                    }}>{leg.from} → {leg.to}</div>
                    <div style={{
                      fontFamily: 'Outfit, sans-serif', fontSize: 13,
                      color: 'rgba(0,0,0,0.7)', lineHeight: 1.45,
                    }}>{pick(leg.description, lang)}</div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            {/* 2. Gates & marks */}
            <CollapsibleSection eyebrow="02" title={pick(L.sec_gates, lang)}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
                {data.waypoints.map(w => (
                  <div key={w.id} style={{
                    display: 'flex', justifyContent: 'space-between', gap: 10,
                    padding: '8px 0',
                    borderBottom: '1px solid var(--border2)',
                    alignItems: 'baseline',
                  }}>
                    <div style={{
                      fontFamily: 'Outfit, sans-serif', fontSize: 13.5,
                      color: '#000', flex: 1,
                    }}>{w.name}</div>
                    <div style={{
                      fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                      letterSpacing: 0.5, textTransform: 'uppercase',
                      color: 'rgba(0,0,0,0.55)',
                    }}>{w.type}</div>
                    <div style={{
                      fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
                      fontVariantNumeric: 'tabular-nums',
                      color: 'rgba(0,0,0,0.65)',
                      minWidth: 100, textAlign: 'right',
                    }}>{w.lat.toFixed(3)}, {w.lon.toFixed(3)}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 14 }}>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                  letterSpacing: 0.6, textTransform: 'uppercase',
                  color: 'rgba(0,0,0,0.55)', marginBottom: 8,
                }}>Restricted</div>
                {data.restrictedAreas.map(a => (
                  <div key={a.id} style={{
                    padding: '10px 12px', marginBottom: 6,
                    background: 'rgba(139,92,246,0.08)',
                    border: '1px solid rgba(139,92,246,0.25)',
                    borderRadius: 10,
                  }}>
                    <div style={{
                      fontFamily: 'Outfit, sans-serif', fontSize: 13.5,
                      fontWeight: 600, color: '#000', marginBottom: 2,
                    }}>{a.name}</div>
                    <div style={{
                      fontFamily: 'Outfit, sans-serif', fontSize: 12.5,
                      color: 'rgba(0,0,0,0.7)', lineHeight: 1.4,
                    }}>{pick(a.description, lang)}</div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            {/* 3. Tijden & start */}
            <CollapsibleSection eyebrow="03" title={pick(L.sec_start, lang)}>
              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <Row>
                  <Label>{pick(L.briefing, lang)}</Label>
                  <Body>{data.event.skippersMeeting.time} · {data.event.skippersMeeting.location}</Body>
                </Row>
                <Row>
                  <Label>Warning</Label>
                  <Body>{data.event.firstWarningWindow} — {pick(data.event.firstWarningNote, lang)}</Body>
                </Row>
              </div>
              <div style={{ marginTop: 14 }}>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                  letterSpacing: 0.6, textTransform: 'uppercase',
                  color: 'rgba(0,0,0,0.55)', marginBottom: 8,
                }}>{pick(L.time_before, lang)}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {data.startProcedure.map((step, i) => (
                    <div key={i} style={{
                      display: 'flex', gap: 10, alignItems: 'center',
                      padding: '8px 10px',
                      background: 'var(--chip)',
                      border: '1px solid var(--border3)',
                      borderRadius: 10,
                    }}>
                      <div style={{
                        fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
                        fontWeight: 700, color: '#000',
                        minWidth: 68, textAlign: 'left',
                      }}>{step.time}</div>
                      <div style={{ flexShrink: 0 }}>{FlagById(step.flag)}</div>
                      <div style={{
                        fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                        letterSpacing: 0.4, textTransform: 'uppercase',
                        color: 'rgba(0,0,0,0.6)', minWidth: 44,
                      }}>{step.flagAction}</div>
                      <div style={{
                        fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
                        color: '#000', minWidth: 22,
                      }}>{step.sound}</div>
                      <div style={{
                        fontFamily: 'Outfit, sans-serif', fontSize: 12.5,
                        color: '#000', flex: 1, minWidth: 0,
                      }}>{pick(step.note, lang)}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ marginTop: 14 }}>
                <Row>
                  <Label>{pick(L.start_line, lang)}</Label>
                  <Body>{pick(data.startLine, lang)}</Body>
                </Row>
                <Row>
                  <Label>{pick(L.finish_line, lang)}</Label>
                  <Body>{pick(data.finishLine, lang)}</Body>
                </Row>
                <Row>
                  <Label>{pick(L.late_start, lang)}</Label>
                  <Body>{pick(data.lateStart, lang)}</Body>
                </Row>
                <Row last>
                  <Label>{pick(L.time_limit, lang)}</Label>
                  <Body>{pick(data.timeLimit, lang)}</Body>
                </Row>
              </div>
            </CollapsibleSection>

            {/* 4. Vlaggen & seinen */}
            <CollapsibleSection eyebrow="04" title={pick(L.sec_flags, lang)}>
              <div style={{
                marginTop: 10,
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: 8,
              }}>
                {data.flags.map(f => (
                  <div key={f.id} style={{
                    display: 'flex', gap: 12, alignItems: 'flex-start',
                    padding: '10px 12px',
                    background: 'var(--chip)',
                    border: '1px solid var(--border3)',
                    borderRadius: 10,
                  }}>
                    <div style={{ flexShrink: 0, marginTop: 2 }}>{FlagById(f.id)}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontFamily: 'Outfit, sans-serif', fontSize: 13.5,
                        fontWeight: 600, color: '#000', marginBottom: 2,
                      }}>{f.label}</div>
                      <div style={{
                        fontFamily: 'Outfit, sans-serif', fontSize: 12.5,
                        color: 'rgba(0,0,0,0.7)', lineHeight: 1.4,
                      }}>{pick(f.meaning, lang)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>

            {/* 5. Regels & veiligheid */}
            <CollapsibleSection eyebrow="05" title={pick(L.sec_safety, lang)}>
              <div style={{ marginTop: 10 }}>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                  letterSpacing: 0.6, textTransform: 'uppercase',
                  color: 'rgba(0,0,0,0.55)', marginBottom: 6,
                }}>{pick(L.on_board, lang)}</div>
                <ul style={{
                  margin: 0, paddingLeft: 18,
                  fontFamily: 'Outfit, sans-serif', fontSize: 13.5,
                  color: '#000', lineHeight: 1.5,
                }}>
                  {data.safety.onBoard[lang]?.map((s, i) => <li key={i}>{s}</li>) || data.safety.onBoard.nl.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
              <div style={{ marginTop: 14 }}>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                  letterSpacing: 0.6, textTransform: 'uppercase',
                  color: 'rgba(0,0,0,0.55)', marginBottom: 6,
                }}>{pick(L.on_body, lang)}</div>
                <ul style={{
                  margin: 0, paddingLeft: 18,
                  fontFamily: 'Outfit, sans-serif', fontSize: 13.5,
                  color: '#000', lineHeight: 1.5,
                }}>
                  {(data.safety.onBody[lang] || data.safety.onBody.nl).map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
              <div style={{
                marginTop: 12,
                padding: '10px 12px',
                background: 'rgba(228,0,43,0.06)',
                border: '1px solid rgba(228,0,43,0.22)',
                borderRadius: 10,
                fontFamily: 'Outfit, sans-serif', fontSize: 13,
                color: '#000',
              }}>
                <strong style={{ fontWeight: 600 }}>{pick(L.foiling, lang)}:</strong>{' '}
                {pick(data.safety.foiling, lang)}
              </div>
              <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {data.rules.map(r => (
                  <div key={r.id} style={{
                    padding: '10px 12px',
                    background: 'var(--chip)',
                    border: '1px solid var(--border3)',
                    borderRadius: 10,
                  }}>
                    <div style={{
                      fontFamily: 'Outfit, sans-serif', fontSize: 13.5,
                      fontWeight: 600, color: '#000', marginBottom: 3,
                    }}>{pick(r.title, lang)}</div>
                    <div style={{
                      fontFamily: 'Outfit, sans-serif', fontSize: 12.5,
                      color: 'rgba(0,0,0,0.75)', lineHeight: 1.45,
                    }}>{pick(r.body, lang)}</div>
                  </div>
                ))}
              </div>
              <div style={{
                fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
                color: 'rgba(0,0,0,0.55)',
                marginTop: 12, lineHeight: 1.5,
              }}>
                <strong>{pick(L.entry_fee, lang)}:</strong> {category.entryFee}<br/>
                <strong>{pick(L.eligibility, lang)}:</strong> {pick(category.eligibility, lang)}
              </div>
            </CollapsibleSection>

            {/* 6. Briefing & protest */}
            <CollapsibleSection eyebrow="06" title={pick(L.sec_protest, lang)}>
              <div style={{ marginTop: 10 }}>
                <Row>
                  <Label>{pick(L.briefing, lang)}</Label>
                  <Body>
                    {data.event.skippersMeeting.time} · {data.event.skippersMeeting.location}
                    <div style={{
                      marginTop: 4, fontSize: 12.5,
                      color: 'rgba(0,0,0,0.65)',
                    }}>{pick(L.briefing_body, lang)}</div>
                  </Body>
                </Row>
                <Row last>
                  <Label>{pick(L.protest_title, lang)}</Label>
                  <Body>
                    <div style={{
                      fontFamily: 'JetBrains Mono, monospace', fontSize: 11,
                      color: '#000', marginBottom: 4,
                    }}>{data.protest.timeLimit}</div>
                    {pick(data.protest.note, lang)}
                  </Body>
                </Row>
              </div>
              <div style={{ marginTop: 14 }}>
                <div style={{
                  fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                  letterSpacing: 0.6, textTransform: 'uppercase',
                  color: 'rgba(0,0,0,0.55)', marginBottom: 6,
                }}>{pick(L.prizes_title, lang)}</div>
                <ul style={{
                  margin: 0, paddingLeft: 18,
                  fontFamily: 'Outfit, sans-serif', fontSize: 13,
                  color: '#000', lineHeight: 1.55,
                }}>
                  {(data.prizes[lang] || data.prizes.nl).map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </div>
            </CollapsibleSection>

            {/* 7. Officials & contact */}
            <CollapsibleSection eyebrow="07" title={pick(L.sec_contact, lang)}>
              <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column' }}>
                {data.officials.map((o, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', gap: 10,
                    padding: '10px 0',
                    borderBottom: i < data.officials.length - 1 ? '1px solid var(--border2)' : 'none',
                    alignItems: 'baseline',
                  }}>
                    <div style={{
                      fontFamily: 'Outfit, sans-serif', fontSize: 13,
                      color: 'rgba(0,0,0,0.7)',
                    }}>{pick(o.role, lang)}</div>
                    <div style={{
                      fontFamily: 'Outfit, sans-serif', fontSize: 13.5,
                      fontWeight: 600, color: '#000',
                    }}>{o.name}</div>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {data.contact.map((c, i) => (
                  <div key={i} style={{
                    padding: '10px 12px',
                    background: 'var(--chip)',
                    border: '1px solid var(--border3)',
                    borderRadius: 10,
                  }}>
                    <div style={{
                      fontFamily: 'JetBrains Mono, monospace', fontSize: 10,
                      letterSpacing: 0.6, textTransform: 'uppercase',
                      color: 'rgba(0,0,0,0.55)', marginBottom: 4,
                    }}>{typeof c.label === 'string' ? c.label : pick(c.label, lang)}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                      {c.email && (
                        <a href={`mailto:${c.email}`} style={{
                          fontFamily: 'Outfit, sans-serif', fontSize: 13.5,
                          color: '#000', textDecoration: 'none',
                          display: 'flex', alignItems: 'center', gap: 6,
                        }}>
                          <Icon.Mail size={14} color="#000" />
                          {c.email}
                        </a>
                      )}
                      {c.phone && (
                        <a href={`tel:${c.phone.replace(/\s/g, '')}`} style={{
                          fontFamily: 'Outfit, sans-serif', fontSize: 13.5,
                          color: '#000', textDecoration: 'none',
                          display: 'flex', alignItems: 'center', gap: 6,
                        }}>
                          <Icon.Phone size={14} color="#000" />
                          {c.phone}
                        </a>
                      )}
                      {c.whatsapp && (
                        <a href={`https://wa.me/${c.whatsapp.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" style={{
                          fontFamily: 'Outfit, sans-serif', fontSize: 13.5,
                          color: '#000', textDecoration: 'none',
                          display: 'flex', alignItems: 'center', gap: 6,
                        }}>
                          <Icon.Phone size={14} color="#000" />
                          WhatsApp {c.whatsapp}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CollapsibleSection>

          </div>
        )}
      </div>
    </div>
  )
}
