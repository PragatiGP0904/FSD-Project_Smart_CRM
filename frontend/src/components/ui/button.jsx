import { Slot } from '@radix-ui/react-slot';
import { cn } from '@/lib/utils';

const variants = {
  primary: 'bg-primary text-[var(--primary-ink)] hover:brightness-110',
  secondary: 'border border-line bg-surface text-ink hover:bg-background',
  ghost: 'text-ink hover:bg-background',
  danger: 'bg-danger text-white hover:brightness-95',
};

export function Button({ className, variant = 'primary', asChild = false, type = 'button', ...props }) {
  const Comp = asChild ? Slot : 'button';
  return (
    <Comp
      type={asChild ? undefined : type}
      className={cn(
        'inline-flex h-9 items-center justify-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors duration-200 ease-out disabled:pointer-events-none disabled:opacity-50',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}
