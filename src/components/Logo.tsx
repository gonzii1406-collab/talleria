interface Props {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'dark' | 'light'
}

export default function Logo({ size = 'md', variant = 'dark' }: Props) {
  const iconSize = size === 'sm' ? 36 : size === 'lg' ? 52 : 42
  const fontSize = size === 'sm' ? '15px' : size === 'lg' ? '22px' : '18px'
  const wordColor = variant === 'light' ? '#ffffff' : '#0f172a'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', userSelect: 'none' }}>
      {/* Icon */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="bg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#0ea5e9" />
          </linearGradient>
        </defs>

        {/* Background */}
        <rect width="48" height="48" rx="12" fill="url(#bg)" />

        {/* Minimal mark — two horizontal lines */}
        <line x1="13" y1="20" x2="35" y2="20" stroke="white" strokeWidth="3.5" strokeLinecap="round" opacity="1" />
        <line x1="13" y1="28" x2="28" y2="28" stroke="white" strokeWidth="3.5" strokeLinecap="round" opacity="0.5" />
      </svg>

      {/* Wordmark */}
      <span style={{
        fontWeight: 800,
        fontSize,
        letterSpacing: '-0.04em',
        lineHeight: 1,
        color: wordColor,
      }}>
        ECU<span style={{ color: '#0ea5e9', fontWeight: 500 }}>nex</span>
      </span>
    </div>
  )
}
