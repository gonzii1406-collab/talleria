interface Props {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'dark' | 'light'
}

export default function Logo({ size = 'md', variant = 'dark' }: Props) {
  const iconSize = size === 'sm' ? 28 : size === 'lg' ? 44 : 34
  const textClass = size === 'sm'
    ? 'text-sm tracking-tight'
    : size === 'lg'
    ? 'text-2xl tracking-tight'
    : 'text-base tracking-tight'

  const wordColor = variant === 'light' ? '#ffffff' : '#0f172a'
  const accentColor = '#0ea5e9'

  return (
    <div className="flex items-center gap-2.5 select-none">
      {/* Icon mark */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background */}
        <rect width="36" height="36" rx="9" fill="#0f172a" />

        {/* Circuit traces — left side */}
        <line x1="3" y1="13" x2="9" y2="13" stroke="#0ea5e9" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="3" y1="23" x2="9" y2="23" stroke="#0ea5e9" strokeWidth="1.5" strokeLinecap="round" />

        {/* Circuit traces — right side */}
        <line x1="27" y1="13" x2="33" y2="13" stroke="#0ea5e9" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="27" y1="23" x2="33" y2="23" stroke="#0ea5e9" strokeWidth="1.5" strokeLinecap="round" />

        {/* Circuit traces — top */}
        <line x1="15" y1="3" x2="15" y2="9" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="21" y1="3" x2="21" y2="9" stroke="#334155" strokeWidth="1.5" strokeLinecap="round" />

        {/* Chip body */}
        <rect x="9" y="9" width="18" height="18" rx="3" fill="#1e293b" />

        {/* Stylized E — ECU reference */}
        <path
          d="M14 13h8M14 18h6M14 23h8M14 13v10"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Node dots */}
        <circle cx="22" cy="13" r="1.4" fill="#0ea5e9" />
        <circle cx="20" cy="18" r="1.4" fill="#0ea5e9" />
        <circle cx="22" cy="23" r="1.4" fill="#0ea5e9" />
      </svg>

      {/* Wordmark */}
      <span
        className={`font-bold ${textClass}`}
        style={{ color: wordColor, letterSpacing: '-0.04em' }}
      >
        ECU<span style={{ color: accentColor, fontWeight: 500 }}>nex</span>
      </span>
    </div>
  )
}
