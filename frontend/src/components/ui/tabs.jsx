import * as TabsPrimitive from '@radix-ui/react-tabs';
import { cn } from '@/lib/utils';

export function Tabs({ value, onValueChange, children, className }) {
  return (
    <TabsPrimitive.Root value={value} onValueChange={onValueChange} className={className}>
      {children}
    </TabsPrimitive.Root>
  );
}

export function TabList({ children }) {
  return (
    <TabsPrimitive.List className="mb-4 flex gap-1 border-b border-line">
      {children}
    </TabsPrimitive.List>
  );
}

export function TabTrigger({ value, children }) {
  return (
    <TabsPrimitive.Trigger
      value={value}
      className={cn(
        'border-b-2 border-transparent px-3 py-2 text-sm text-muted data-[state=active]:border-primary data-[state=active]:text-ink'
      )}
    >
      {children}
    </TabsPrimitive.Trigger>
  );
}

export const TabContent = TabsPrimitive.Content;
