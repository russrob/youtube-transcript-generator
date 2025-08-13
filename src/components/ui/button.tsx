import * as React from "react"
import { Button as HeadlessButton } from "@headlessui/react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sketch-body font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sketch-accent focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
  {
    variants: {
      variant: {
        // Primary uses dark gray (authentic Sketch style)
        default: "bg-sketch-accent text-white hover:bg-sketch-accent-600 shadow-sketch-soft hover:shadow-sketch-card hover:-translate-y-0.5 data-[hover]:bg-sketch-accent-600 data-[hover]:shadow-sketch-card data-[hover]:-translate-y-0.5",
        destructive:
          "bg-sketch-danger text-white hover:bg-red-700 shadow-sketch-soft hover:shadow-sketch-card data-[hover]:bg-red-700 data-[hover]:shadow-sketch-card",
        outline:
          "border border-sketch-border bg-white text-sketch-text hover:bg-sketch-surface hover:border-sketch-accent shadow-sketch-soft hover:shadow-sketch-card data-[hover]:bg-sketch-surface data-[hover]:border-sketch-accent data-[hover]:shadow-sketch-card",
        secondary:
          "bg-sketch-surface text-sketch-text hover:bg-gray-200 shadow-sketch-soft hover:shadow-sketch-card data-[hover]:bg-gray-200 data-[hover]:shadow-sketch-card",
        ghost: "text-sketch-text hover:bg-sketch-surface hover:text-sketch-text data-[hover]:bg-sketch-surface data-[hover]:text-sketch-text",
        link: "text-sketch-link underline-offset-4 hover:underline hover:text-sketch-text data-[hover]:underline data-[hover]:text-sketch-text",
      },
      size: {
        default: "h-10 px-sketch-4 py-sketch-2",
        sm: "h-9 px-sketch-3 py-sketch-2 text-sketch-small",
        lg: "h-12 px-sketch-6 py-sketch-3 text-lg font-semibold",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, disabled, ...props }, ref) => {
    if (asChild) {
      // For asChild behavior, we'll just return the children with the button classes
      // This is a simplified version - HeadlessUI doesn't have a direct Slot equivalent
      return React.cloneElement(
        props.children as React.ReactElement,
        {
          className: cn(buttonVariants({ variant, size }), className),
          ref,
          disabled,
          ...props
        }
      )
    }

    return (
      <HeadlessButton
        className={cn(buttonVariants({ variant, size }), className)}
        ref={ref}
        disabled={disabled}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }