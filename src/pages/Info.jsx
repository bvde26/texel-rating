import { useState } from 'react'
import schedule from '../data/schedule.json'
import { Icon } from '../components/icons'
import Pressable from '../components/Pressable'


function TabUnderline({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'none', border: 'none', cursor: 'pointer',
        padding: '14px 6px 12px',
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

function TabProgramma() {
  const [open, setOpen] = useState(0)

  return (
    <div style={{ padding: '16px 16px 32px', display: 'grid', gap: 10 }}>
      {schedule.days.map((day, di) => {
        const isOpen = open === di
        return (
          <div key={di} style={{ background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden' }}>
            <Pressable
              onClick={() => setOpen(isOpen ? -1 : di)}
              style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', gap: 12 }}
            >
              <div>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 15, color: '#000' }}>{day.title}</div>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 11, color: 'rgba(0,0,0,0.45)', letterSpacing: 0.3, marginTop: 3 }}>{day.date}</div>
              </div>
              <div style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 280ms', flexShrink: 0 }}>
                <Icon.ChevronDown size={16} color="rgba(0,0,0,0.4)"/>
              </div>
            </Pressable>
            {isOpen && (
              <div style={{ borderTop: '1px solid var(--border)' }}>
                {day.events.map((ev, i) => (
                  <div key={i} style={{ display: 'flex', gap: 14, padding: '12px 16px', borderTop: i > 0 ? '1px dashed rgba(0,0,0,0.08)' : 'none' }}>
                    <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 14, fontWeight: 600, color: '#000', letterSpacing: -0.5, width: 44, flexShrink: 0, paddingTop: 1 }}>
                      {ev.time}
                    </div>
                    <div>
                      <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 500, fontSize: 14.5, color: '#000' }}>{ev.title}</div>
                      {ev.location && (
                        <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 12.5, color: 'rgba(0,0,0,0.5)', marginTop: 2 }}>{ev.location}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function TabRegels() {
  return (
    <div style={{ padding: '16px 16px 32px', display: 'grid', gap: 8 }}>
      {schedule.rules.map((rule, i) => (
        <div key={i} style={{ background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)', padding: '14px 16px', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, fontWeight: 700, color: 'rgba(0,0,0,0.35)', letterSpacing: 0.8, paddingTop: 3, flexShrink: 0 }}>
            R{String(i + 1).padStart(2, '0')}
          </div>
          <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: 14, lineHeight: 1.55, color: 'rgba(0,0,0,0.8)' }}>{rule}</div>
        </div>
      ))}
    </div>
  )
}

function TabContact() {
  const c = schedule.contact
  const rows = [
    { role: 'Organisatie', name: c.organizerName,  action: `tel:${c.organizerPhone}`, Icn: Icon.Users,  external: false },
    { role: 'E-mail',      name: c.organizerEmail, action: `mailto:${c.organizerEmail}`, Icn: Icon.Mail, external: false },
    { role: 'Telefoon',    name: c.organizerPhone, action: `tel:${c.organizerPhone}`, Icn: Icon.Phone,  external: false },
    { role: 'Website',     name: c.website,        action: `https://${c.website}`, Icn: Icon.Globe,    external: true },
  ]

  return (
    <div style={{ padding: '16px 16px 32px', display: 'grid', gap: 10 }}>
      {rows.map(({ role, name, action, Icn, external }) => (
        <div key={role} style={{ background: 'var(--surface)', borderRadius: 14, border: '1px solid var(--border)', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontFamily: 'JetBrains Mono, monospace', fontSize: 10, color: 'rgba(0,0,0,0.45)', letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4 }}>{role}</div>
            <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 14.5, color: '#000', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name}</div>
          </div>
          <a
            href={action}
            {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
            style={{ width: 44, height: 44, borderRadius: 999, background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, textDecoration: 'none' }}
          >
            <Icn size={16} color="#fff"/>
          </a>
        </div>
      ))}
    </div>
  )
}


export default function Info({ t, onBack }) {
  const [tab, setTab] = useState('programma')

  const TABS = [
    { id: 'programma', label: t.schedule },
    { id: 'regels',    label: t.rules },
    { id: 'contact',   label: t.contacts },
  ]

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg)', overflow: 'hidden' }}>

      {/* Header */}
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
            <Icon.Back size={18} color="#000"/>
          </Pressable>
          <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 600, fontSize: 18, letterSpacing: -0.2 }}>
            {t.agenda_title}
          </div>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', gap: 4, padding: '0 14px', overflowX: 'auto' }} className="scrollbar-none">
          {TABS.map(({ id, label }) => (
            <TabUnderline key={id} label={label} active={tab === id} onClick={() => setTab(id)}/>
          ))}
        </div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }} className="scrollbar-none">
        {tab === 'programma' && <TabProgramma/>}
        {tab === 'regels'    && <TabRegels/>}
        {tab === 'contact'   && <TabContact/>}
      </div>
    </div>
  )
}
