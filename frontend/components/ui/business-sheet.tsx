"use client"

import * as React from "react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetFooter,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

interface BusinessSheetProps {
  children: React.ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  title?: string
  description?: string
  size?: "default" | "narrow" | "wide" | "extra-wide"
  trigger?: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

const sizeClasses = {
  default: "w-[400px] sm:w-[540px]",
  narrow: "w-[350px] sm:w-[400px]", 
  wide: "w-full sm:w-[50vw] sm:max-w-[50vw]",
  "extra-wide": "w-full sm:w-[70vw] sm:max-w-[70vw]"
}

export function BusinessSheet({
  children,
  open,
  onOpenChange,
  title,
  description,
  size = "default",
  trigger,
  footer,
  className,
}: BusinessSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger && (
        <SheetTrigger asChild>
          {trigger}
        </SheetTrigger>
      )}
      <SheetContent 
        className={cn(
          sizeClasses[size],
          "overflow-y-auto",
          className
        )}
      >
        {(title || description) && (
          <SheetHeader className="space-y-4 pb-6 px-6">
            {title && <SheetTitle className="text-2xl">{title}</SheetTitle>}
            {description && (
              <SheetDescription>{description}</SheetDescription>
            )}
          </SheetHeader>
        )}
        
        <div className="px-6 pb-6 flex-1">
          {children}
        </div>
        
        {footer && (
          <SheetFooter className="px-6">
            {footer}
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  )
}

// Convenience components for common patterns
interface FormSheetProps extends Omit<BusinessSheetProps, 'footer'> {
  onSubmit?: (e: React.FormEvent) => void
  submitLabel?: string
  cancelLabel?: string
  isSubmitting?: boolean
  onCancel?: () => void
  submitDisabled?: boolean
}

export function FormSheet({
  children,
  onSubmit,
  submitLabel = "Save",
  cancelLabel = "Cancel", 
  isSubmitting = false,
  onCancel,
  submitDisabled = false,
  ...sheetProps
}: FormSheetProps) {
  const footer = (
    <div className="flex gap-3 pt-6">
      <button
        type="submit"
        disabled={isSubmitting || submitDisabled}
        className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none"
      >
        {isSubmitting ? 'Saving...' : submitLabel}
      </button>
      <SheetClose asChild>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          {cancelLabel}
        </button>
      </SheetClose>
    </div>
  )

  return (
    <BusinessSheet {...sheetProps} footer={footer}>
      {onSubmit ? (
        <form onSubmit={onSubmit} className="space-y-4">
          {children}
        </form>
      ) : (
        <div className="space-y-4">
          {children}
        </div>
      )}
    </BusinessSheet>
  )
}

// Re-export original sheet components for when you need full control
export {
  Sheet,
  SheetContent,
  SheetDescription, 
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
  SheetFooter,
}