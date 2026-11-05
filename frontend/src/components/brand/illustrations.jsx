function Frame({ children, compact = false }) {
  return (
    <svg
      viewBox="0 0 160 112"
      width={compact ? 128 : 200}
      height={compact ? 90 : 140}
      aria-hidden="true"
      focusable="false"
      className="mb-3"
    >
      <circle cx="80" cy="54" r="38" fill="var(--primary-soft)" />
      <ellipse cx="80" cy="104" rx="44" ry="4" fill="var(--ink)" opacity="0.07" />
      {children}
    </svg>
  );
}

function Note({ x, y, width = 58, height = 46 }) {
  const fold = Math.max(8, Math.min(14, Math.round(width * 0.28)));
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} rx="6" fill="var(--surface)" stroke="var(--primary)" strokeWidth="1.75" />
      <path
        d={`M${x + width - fold} ${y}v${fold}h${fold}`}
        fill="var(--primary-soft)"
        stroke="var(--primary)"
        strokeWidth="1.75"
        strokeLinejoin="round"
      />
      <path d={`M${x + 10} ${y + height * 0.46}h${width - 28}`} stroke="var(--ink)" strokeWidth="1.75" strokeLinecap="round" />
      <path d={`M${x + 10} ${y + height * 0.66}h${Math.round(width * 0.34)}`} stroke="var(--ink-muted)" strokeWidth="1.75" strokeLinecap="round" />
    </g>
  );
}

export function LeadsArt({ compact }) {
  return (
    <Frame compact={compact}>
      <rect x="38" y="30" width="52" height="40" rx="6" fill="var(--primary-soft)" stroke="var(--border)" strokeWidth="1.75" />
      <circle cx="52" cy="46" r="5" fill="var(--surface)" stroke="var(--primary)" strokeWidth="1.5" />
      <path d="M62 44h18M62 51h12" stroke="var(--ink-muted)" strokeWidth="1.75" strokeLinecap="round" />
      <Note x="62" y="40" />
    </Frame>
  );
}

export function CustomersArt({ compact }) {
  return (
    <Frame compact={compact}>
      <rect x="34" y="36" width="44" height="36" rx="6" fill="var(--background)" stroke="var(--border)" strokeWidth="1.75" />
      <path d="M46 36v-8h20v8" fill="none" stroke="var(--ink-muted)" strokeWidth="1.75" strokeLinejoin="round" />
      <path d="M42 52h28M42 60h16" stroke="var(--ink-muted)" strokeWidth="1.75" strokeLinecap="round" />
      <Note x="70" y="32" width="54" height="48" />
    </Frame>
  );
}

export function PipelineArt({ compact }) {
  return (
    <Frame compact={compact}>
      {[0, 1, 2].map((column) => (
        <rect
          key={column}
          x={28 + column * 38}
          y="24"
          width="32"
          height="68"
          rx="8"
          fill="var(--surface)"
          stroke="var(--border)"
          strokeWidth="1.75"
        />
      ))}
      <rect x="34" y="32" width="20" height="16" rx="3" fill="var(--primary-soft)" />
      <Note x="70" y="34" width="24" height="22" />
    </Frame>
  );
}

export function ActivityArt({ compact }) {
  return (
    <Frame compact={compact}>
      <rect x="36" y="28" width="72" height="52" rx="8" fill="var(--surface)" stroke="var(--border)" strokeWidth="1.75" />
      <path d="M48 46h36M48 56h24" stroke="var(--ink-muted)" strokeWidth="1.75" strokeLinecap="round" />
      <Note x="86" y="46" width="40" height="34" />
    </Frame>
  );
}

export function FollowUpsArt({ compact }) {
  return (
    <Frame compact={compact}>
      <circle cx="112" cy="40" r="12" fill="var(--surface)" stroke="var(--warning)" strokeWidth="1.75" />
      <path d="M112 34v7l4 2" stroke="var(--warning)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
      <Note x="46" y="32" width="62" height="50" />
    </Frame>
  );
}

export function ChartArt({ compact }) {
  return (
    <Frame compact={compact}>
      <path d="M32 86h96" stroke="var(--border)" strokeWidth="1.75" strokeLinecap="round" />
      <rect x="40" y="58" width="14" height="28" rx="3" fill="var(--primary-soft)" stroke="var(--primary)" strokeWidth="1.5" />
      <rect x="62" y="42" width="14" height="44" rx="3" fill="var(--primary)" />
      <rect x="84" y="50" width="14" height="36" rx="3" fill="var(--primary-soft)" stroke="var(--primary)" strokeWidth="1.5" />
      <rect x="106" y="34" width="14" height="52" rx="3" fill="none" stroke="var(--border)" strokeWidth="1.75" strokeDasharray="3 3" />
    </Frame>
  );
}

export function MissingArt({ compact }) {
  return (
    <Frame compact={compact}>
      <path d="M36 78c16-28 28-28 44-8s24 8 40-18" fill="none" stroke="var(--border)" strokeWidth="1.75" strokeDasharray="4 4" strokeLinecap="round" />
      <Note x="78" y="28" width="52" height="44" />
    </Frame>
  );
}

export function RecoverArt({ compact }) {
  return (
    <Frame compact={compact}>
      <Note x="40" y="34" width="56" height="46" />
      <path
        d="M108 40a14 14 0 1 1-4 10"
        fill="none"
        stroke="var(--primary)"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
      <path d="M100 48l4 4 6-6" fill="none" stroke="var(--primary)" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
    </Frame>
  );
}

export function SearchArt({ compact }) {
  return (
    <Frame compact={compact}>
      <Note x="34" y="34" width="52" height="42" />
      <circle cx="98" cy="50" r="16" fill="var(--surface)" stroke="var(--primary)" strokeWidth="1.75" />
      <path d="M110 62l12 12" stroke="var(--primary)" strokeWidth="1.75" strokeLinecap="round" />
    </Frame>
  );
}

export const scenes = {
  leads: LeadsArt,
  customers: CustomersArt,
  pipeline: PipelineArt,
  activity: ActivityArt,
  followups: FollowUpsArt,
  chart: ChartArt,
  missing: MissingArt,
  recover: RecoverArt,
  search: SearchArt,
};
