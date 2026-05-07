interface TreeRingIconProps {
  size?:      number
  className?: string
  /** Highlight ring count (1-4) — glows to show memory depth */
  rings?:     number
}

export function TreeRingIcon({ size = 20, className = '', rings = 4 }: TreeRingIconProps) {
  const cx = size / 2
  const cy = size / 2
  const r  = (size / 2) - 1

  const ringRadii   = [r * 0.88, r * 0.68, r * 0.48, r * 0.28]
  const ringColors  = ['#2a6320', '#3a8030', '#52a840', '#6ab840']
  const ringWidths  = [1.6, 1.3, 1.1, 0.9]

  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Bark outer fill */}
      <circle cx={cx} cy={cy} r={r} fill="#0b1a0c"/>
      <circle cx={cx} cy={cy} r={r} stroke="#1a3d10" strokeWidth="1"/>

      {/* Radial grain lines */}
      {[0, 45, 90, 135].map((angle) => {
        const rad  = (angle * Math.PI) / 180
        const x1   = cx + Math.cos(rad) * ringRadii[0]
        const y1   = cy + Math.sin(rad) * ringRadii[0]
        const x2   = cx - Math.cos(rad) * ringRadii[0]
        const y2   = cy - Math.sin(rad) * ringRadii[0]
        return (
          <line
            key={angle}
            x1={x1} y1={y1} x2={x2} y2={y2}
            stroke="#1e4a14"
            strokeWidth="0.5"
            opacity="0.4"
          />
        )
      })}

      {/* Growth rings */}
      {ringRadii.map((rad, i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={rad}
          stroke={i < rings ? ringColors[i] : '#1a3d10'}
          strokeWidth={ringWidths[i]}
          opacity={i < rings ? 1 : 0.35}
        />
      ))}

      {/* Heartwood */}
      <circle cx={cx} cy={cy} r={r * 0.16} fill="#9c6228"/>
      <circle cx={cx} cy={cy} r={r * 0.09} fill="#d4a055"/>
    </svg>
  )
}
