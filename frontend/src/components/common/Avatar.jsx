function hashName(name) {
  let value = 0;
  const text = name || 'Guest';
  for (let index = 0; index < text.length; index += 1) value = (value * 33 + text.charCodeAt(index)) >>> 0;
  return value;
}

const SKINS = ['#F3D0B5', '#E7B892', '#D09A6A', '#A86B45', '#8D5524', '#F6C7A8'];
const HAIRS = ['#1F1A17', '#3A2A22', '#5C4033', '#2A241C', '#6B4A32', '#111111'];
const SHIRTS = ['#3E5348', '#5C5346', '#3E4C5C', '#6A4A42', '#4E5A3E', '#514438'];

function Hair({ style, color }) {
  if (style === 1) {
    return <path d="M18 24c1-8 6-14 14-15 8-1 14 4 16 12 1 2-2 1-3-1-2-6-6-9-13-8-6 1-11 5-12 12-1 2-3 2-2 0Z" fill={color} />;
  }
  if (style === 2) {
    return (
      <g fill={color}>
        <path d="M19 27c0-9 6-16 13-16s13 7 13 16c0 2-2 2-3 0 0-7-4-12-10-12s-10 5-10 12c-1 2-3 2-3 0Z" />
        <circle cx="40" cy="16" r="5" />
      </g>
    );
  }
  if (style === 3) {
    return <path d="M16 30c2-12 8-18 16-18s14 6 16 18v10c-4 2-8 3-16 3s-12-1-16-3V30Z" fill={color} />;
  }
  return <path d="M18 28c0-10 6-16 14-16s14 6 14 16c0 3-2 3-3 1 0-8-4-12-11-12s-11 4-11 12c-1 2-3 2-3-1Z" fill={color} />;
}

export function Avatar({ name = '', size = 32, className = '' }) {
  const seed = hashName(name);
  const skin = SKINS[seed % SKINS.length];
  const hair = HAIRS[(seed >> 3) % HAIRS.length];
  const shirt = SHIRTS[(seed >> 6) % SHIRTS.length];
  const style = (seed >> 9) % 4;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={`inline-block shrink-0 rounded-full ${className}`}
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="32" cy="32" r="32" fill="#EFE8DC" />
      <path d="M10 66c3-16 12-24 22-24s19 8 22 24" fill={shirt} />
      <circle cx="32" cy="28" r="14" fill={skin} />
      <Hair style={style} color={hair} />
      <circle cx="27" cy="29" r="1.15" fill="#2A2420" />
      <circle cx="37" cy="29" r="1.15" fill="#2A2420" />
      <path d="M29.2 34.5c1 .8 2.2 1.2 2.8 1.2s1.8-.4 2.8-1.2" stroke="#8A5A42" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.7" />
    </svg>
  );
}
