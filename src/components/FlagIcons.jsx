const W = 48
const H = 32

function Frame({ children }) {
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: 'block', borderRadius: 3 }}>
      {children}
      <rect x="0.5" y="0.5" width={W - 1} height={H - 1} fill="none" stroke="rgba(0,0,0,0.25)" strokeWidth="1"/>
    </svg>
  )
}

export const FlagIcon = {
  AP: () => (
    <Frame>
      <rect width={W} height={H} fill="#fff"/>
      {[0, 1, 2, 3, 4].map(i => (
        <rect key={i} x={(W / 5) * i} width={W / 5} height={H} fill={i % 2 === 0 ? '#fff' : '#E4002B'}/>
      ))}
    </Frame>
  ),
  P: () => (
    <Frame>
      <rect width={W} height={H} fill="#005BBB"/>
      <rect x={W * 0.22} y={H * 0.22} width={W * 0.56} height={H * 0.56} fill="#fff"/>
    </Frame>
  ),
  Z: () => (
    <Frame>
      <polygon points={`0,0 ${W / 2},0 0,${H / 2}`} fill="#FFD100"/>
      <polygon points={`${W / 2},0 ${W},0 ${W},${H / 2}`} fill="#005BBB"/>
      <polygon points={`0,${H / 2} 0,${H} ${W / 2},${H}`} fill="#E4002B"/>
      <polygon points={`${W},${H / 2} ${W},${H} ${W / 2},${H}`} fill="#111"/>
    </Frame>
  ),
  Red: () => (
    <Frame>
      <rect width={W} height={H} fill="#E4002B"/>
    </Frame>
  ),
  N: () => (
    <Frame>
      {Array.from({ length: 4 }).map((_, row) =>
        Array.from({ length: 6 }).map((_, col) => {
          const isBlue = (row + col) % 2 === 0
          return (
            <rect
              key={`${row}-${col}`}
              x={(W / 6) * col}
              y={(H / 4) * row}
              width={W / 6}
              height={H / 4}
              fill={isBlue ? '#005BBB' : '#fff'}
            />
          )
        })
      )}
    </Frame>
  ),
  Y: () => (
    <Frame>
      <defs>
        <pattern id="ydiag" patternUnits="userSpaceOnUse" width="10" height="10" patternTransform="rotate(45)">
          <rect width="5" height="10" fill="#E4002B"/>
          <rect x="5" width="5" height="10" fill="#FFD100"/>
        </pattern>
      </defs>
      <rect width={W} height={H} fill="url(#ydiag)"/>
    </Frame>
  ),
  B: () => (
    <Frame>
      <polygon points={`0,0 ${W},${H / 2} 0,${H}`} fill="#E4002B"/>
      <polygon points={`${W},0 ${W},${H} ${W},${H / 2}`} fill="#E4002B"/>
    </Frame>
  ),
  Orange: () => (
    <Frame>
      <rect width={W} height={H} fill="#FF7A00"/>
    </Frame>
  ),
  Blue: () => (
    <Frame>
      <rect width={W} height={H} fill="#005BBB"/>
    </Frame>
  ),
  Yellow: ({ label = 'VC' } = {}) => (
    <Frame>
      <rect width={W} height={H} fill="#FFD100"/>
      <text x={W / 2} y={H / 2 + 4} textAnchor="middle" fontSize="12" fontWeight="700"
            fontFamily="JetBrains Mono, monospace" fill="#111">{label}</text>
    </Frame>
  ),
  White: ({ label = 'RC' } = {}) => (
    <Frame>
      <rect width={W} height={H} fill="#fff"/>
      <text x={W / 2} y={H / 2 + 4} textAnchor="middle" fontSize="12" fontWeight="700"
            fontFamily="JetBrains Mono, monospace" fill="#111">{label}</text>
    </Frame>
  ),
  Class: () => (
    <Frame>
      <rect width={W} height={H} fill="#fff"/>
      <circle cx={W / 2} cy={H / 2} r={H / 2.8} fill="none" stroke="#005BBB" strokeWidth="2"/>
      <text x={W / 2} y={H / 2 + 3} textAnchor="middle" fontSize="8" fontWeight="700"
            fontFamily="JetBrains Mono, monospace" fill="#005BBB">RT</text>
    </Frame>
  ),
  Rescue: () => (
    <Frame>
      <rect width={W} height={H} fill="#00B050"/>
      <circle cx={W / 2} cy={H / 2} r={H / 3.5} fill="#FFD100"/>
    </Frame>
  ),
}

export function FlagById(id) {
  switch (id) {
    case 'AP': return <FlagIcon.AP />
    case 'AP-over-B': return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <FlagIcon.AP />
        <FlagIcon.B />
      </div>
    )
    case 'P': return <FlagIcon.P />
    case 'Z': return <FlagIcon.Z />
    case 'Red': return <FlagIcon.Red />
    case 'N': return <FlagIcon.N />
    case 'Y': return <FlagIcon.Y />
    case 'Orange': return <FlagIcon.Orange />
    case 'Blue': return <FlagIcon.Blue />
    case 'Yellow-VC': return <FlagIcon.Yellow label="VC" />
    case 'White-RC': return <FlagIcon.White label="RC" />
    case 'Class': return <FlagIcon.Class />
    case 'Rescue': return <FlagIcon.Rescue />
    default: return <FlagIcon.White label="?" />
  }
}
