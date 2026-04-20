import { useState } from 'react'

export default function Pressable({ onClick, children, style, disabled, className, ...rest }) {
  const [pressed, setPressed] = useState(false)
  return (
    <div
      onClick={disabled ? undefined : onClick}
      onPointerDown={() => !disabled && setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      onPointerCancel={() => setPressed(false)}
      className={className}
      style={{
        cursor: disabled ? 'default' : 'pointer',
        transform: pressed ? 'scale(0.97)' : 'scale(1)',
        transition: 'transform 180ms cubic-bezier(0.22,1,0.36,1)',
        opacity: disabled ? 0.45 : 1,
        WebkitTapHighlightColor: 'transparent',
        ...style,
      }}
      {...rest}
    >{children}</div>
  )
}
