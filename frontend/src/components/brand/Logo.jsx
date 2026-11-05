const MARK = '#24362e';

export function LogoMark({ size = 32, decorative = false, className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      className={className}
      aria-hidden={decorative ? true : undefined}
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : 'Smart CRM'}
      focusable="false"
    >
      <rect width="32" height="32" rx="9" fill={MARK} />
      <circle cx="12" cy="12.5" r="2.15" fill="#F6F1EA" />
      <circle cx="20.2" cy="12.5" r="2.15" fill="#F6F1EA" />
      <path d="M7.6 22.4c1.3-3.5 2.8-5 4.4-5s3.1 1.5 4.4 5" stroke="#F6F1EA" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M16.2 22.4c1.2-3.2 2.6-4.6 4-4.6 1.5 0 2.9 1.4 4.1 4.6" stroke="#F6F1EA" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M14.2 15.2h3.6" stroke="#E4D3B8" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function LogoLockup({ mark = 28, tone = 'default' }) {
  return (
    <span className="inline-flex items-center gap-2.5">
      <LogoMark size={mark} decorative />
      <span className={tone === 'inverse' ? 'text-sm font-semibold tracking-heading text-white' : 'text-sm font-semibold tracking-heading text-ink'}>
        Smart CRM
      </span>
    </span>
  );
}
