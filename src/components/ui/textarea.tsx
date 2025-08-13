import * as React from "react"
import { Field, Textarea as HeadlessTextarea } from "@headlessui/react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    const textareaElement = (
      <HeadlessTextarea
        className={cn(
          "flex min-h-[80px] w-full rounded-xl border border-sketch-border bg-white px-sketch-4 py-sketch-2 text-sketch-body ring-offset-background",
          "placeholder:text-sketch-text-muted",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sketch-accent focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "data-[invalid]:border-sketch-danger data-[invalid]:ring-sketch-danger",
          "resize-none",
          error && "border-sketch-danger ring-1 ring-sketch-danger",
          className
        )}
        ref={ref}
        invalid={!!error}
        {...props}
      />
    )

    if (label) {
      return (
        <Field className="space-y-1">
          <label className="text-sketch-body font-medium text-sketch-text">
            {label}
          </label>
          {textareaElement}
          {error && (
            <p className="text-sketch-small text-sketch-danger">{error}</p>
          )}
        </Field>
      )
    }

    return textareaElement
  }
)
Textarea.displayName = "Textarea"

export { Textarea }