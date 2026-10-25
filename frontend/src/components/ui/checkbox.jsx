import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';

export function Checkbox({ checked, onCheckedChange, label, ...props }) {
  return (
    <CheckboxPrimitive.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      aria-label={label}
      className="flex h-4 w-4 items-center justify-center rounded border border-line bg-surface data-[state=checked]:border-primary data-[state=checked]:bg-primary"
      {...props}
    >
      <CheckboxPrimitive.Indicator>
        <Check size={12} strokeWidth={2} className="text-white" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
