import { initials } from '@/lib/format';

export function Avatar({ name, size = 28 }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-primary-soft font-medium text-primary"
      style={{ width: size, height: size, fontSize: size > 32 ? 14 : 12 }}
      aria-hidden="true"
    >
      {initials(name)}
    </span>
  );
}
