import * as React from "react"
import { Field, Input as HeadlessInput } from "@headlessui/react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, ...props }, ref) => {
    const inputElement = (
      <HeadlessInput
        type={type}
        className={cn(
          "flex h-10 w-full rounded-xl border border-sketch-border bg-white px-sketch-4 py-sketch-2 text-sketch-body ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "placeholder:text-sketch-text-muted",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sketch-accent focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "data-[invalid]:border-sketch-danger data-[invalid]:ring-sketch-danger",
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
          {inputElement}
          {error && (
            <p className="text-sketch-small text-sketch-danger">{error}</p>
          )}
        </Field>
      )
    }

    return inputElement
  }
)
Input.displayName = "Input"

export { Input }