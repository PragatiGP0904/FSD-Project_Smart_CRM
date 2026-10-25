import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Modal({ open, onOpenChange, title, description, children, className }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[#101828]/40" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 max-h-[calc(100vh-2rem)] w-[calc(100%-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-line bg-surface p-5 shadow-overlay',
            className
          )}
        >
          <div className="mb-4 pr-8">
            <Dialog.Title className="text-lg font-semibold tracking-heading">{title}</Dialog.Title>
            {description ? <Dialog.Description className="mt-1 text-sm text-muted">{description}</Dialog.Description> : null}
          </div>
          {children}
          <Dialog.Close className="absolute right-4 top-4 rounded-lg p-1 text-muted hover:text-ink" aria-label="Close">
            <X size={16} strokeWidth={1.75} />
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function Sheet({ open, onOpenChange, title, description, children, className }) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[#101828]/40" />
        <Dialog.Content
          className={cn(
            'fixed inset-y-0 right-0 z-50 flex w-full max-w-[440px] flex-col border-l border-line bg-surface shadow-overlay focus:outline-none',
            className
          )}
        >
          <div className="flex items-start justify-between gap-3 border-b border-line px-4 py-4">
            <div>
              <Dialog.Title className="text-lg font-semibold tracking-heading">{title}</Dialog.Title>
              {description ? <Dialog.Description className="mt-1 text-sm text-muted">{description}</Dialog.Description> : null}
            </div>
            <Dialog.Close className="rounded-lg p-1 text-muted hover:text-ink" aria-label="Close">
              <X size={16} strokeWidth={1.75} />
            </Dialog.Close>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
