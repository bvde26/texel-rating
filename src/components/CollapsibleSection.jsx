import { useState } from 'react'
import { Icon } from './icons'
import Pressable from './Pressable'

export default function CollapsibleSection({
  eyebrow,
  title,
  defaultOpen = false,
  children,
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div style={{
      background: 'var(--surface)',
      borderRadius: 16,
      border: '1px solid var(--border2)',
      overflow: 'hidden',
    }}>
      <Pressable
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%',
          padding: '16px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          background: 'transparent',
          textAlign: 'left',
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          {eyebrow && (
            <div style={{
              fontFamily: 'JetBrains Mono, monospace',
              fontSize: 10,
              letterSpacing: 0.6,
              textTransform: 'uppercase',
              color: 'rgba(0,0,0,0.5)',
              marginBottom: 4,
            }}>{eyebrow}</div>
          )}
          <div style={{
            fontFamily: 'Outfit, sans-serif',
            fontWeight: 600,
            fontSize: 16,
            letterSpacing: -0.2,
            color: '#000',
          }}>{title}</div>
        </div>
        <div style={{
          width: 28, height: 28, borderRadius: 999,
          border: '1px solid var(--border3)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0,
          transition: 'transform 220ms ease',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        }}>
          <Icon.ChevronDown size={14} color="#000" />
        </div>
      </Pressable>
      {open && (
        <div style={{
          padding: '4px 18px 18px',
          borderTop: '1px solid var(--border2)',
        }}>
          {children}
        </div>
      )}
    </div>
  )
}
