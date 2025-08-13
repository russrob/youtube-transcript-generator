"use client"

import * as React from "react"
import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react"
import { Check, ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"

interface SelectProps {
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
  children: React.ReactNode
  placeholder?: string
}

interface SelectContextValue {
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
}

const SelectContext = React.createContext<SelectContextValue | undefined>(undefined)

const useSelectContext = () => {
  const context = React.useContext(SelectContext)
  if (!context) {
    throw new Error("Select components must be used within a Select")
  }
  return context
}

const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  ({ value, onValueChange, disabled, children, placeholder }, ref) => {
    return (
      <SelectContext.Provider value={{ value, onValueChange, disabled, placeholder }}>
        <Listbox value={value} onChange={onValueChange} disabled={disabled}>
          <div ref={ref} className="relative">
            {children}
          </div>
        </Listbox>
      </SelectContext.Provider>
    )
  }
)
Select.displayName = "Select"

const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { placeholder?: string }
>(({ className, children, placeholder, ...props }, ref) => {
  const { value, disabled, placeholder: contextPlaceholder } = useSelectContext()
  
  return (
    <ListboxButton
      ref={ref}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-xl border border-sketch-border bg-white px-sketch-4 py-sketch-2 text-sketch-body ring-offset-background placeholder:text-sketch-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sketch-accent focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1",
        className
      )}
      disabled={disabled}
      {...props}
    >
      <span className="block truncate">
        {children || (value ? value : (placeholder || contextPlaceholder || "Select..."))}
      </span>
      <ChevronDown className="h-4 w-4 opacity-50" aria-hidden="true" />
    </ListboxButton>
  )
})
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = React.forwardRef<
  HTMLSpanElement,
  React.HTMLAttributes<HTMLSpanElement> & { placeholder?: string }
>(({ className, placeholder, ...props }, ref) => {
  const { value, placeholder: contextPlaceholder } = useSelectContext()
  
  return (
    <span 
      ref={ref}
      className={cn("block truncate", className)}
      {...props}
    >
      {value || placeholder || contextPlaceholder || "Select..."}
    </span>
  )
})
SelectValue.displayName = "SelectValue"

const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { position?: "popper" | "item-aligned" }
>(({ className, children, position = "popper", ...props }, ref) => (
  <ListboxOptions
    ref={ref}
    className={cn(
      "absolute z-50 max-h-96 min-w-[8rem] overflow-auto rounded-xl border border-sketch-border bg-white p-1 text-sketch-text shadow-sketch-card mt-1 focus:outline-none",
      "data-[closed]:animate-out data-[closed]:fade-out-0 data-[closed]:zoom-out-95",
      "data-[open]:animate-in data-[open]:fade-in-0 data-[open]:zoom-in-95",
      position === "popper" && "origin-top",
      className
    )}
    {...props}
  >
    {children}
  </ListboxOptions>
))
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { value: string; disabled?: boolean }
>(({ className, children, value, disabled, ...props }, ref) => (
  <ListboxOption
    ref={ref}
    value={value}
    disabled={disabled}
    className={cn(
      "relative flex w-full cursor-default select-none items-center rounded-xl py-sketch-2 pl-8 pr-sketch-2 text-sketch-body outline-none",
      "focus:bg-sketch-surface focus:text-sketch-text",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      "data-[selected]:bg-sketch-accent data-[selected]:text-white",
      className
    )}
    {...props}
  >
    {({ selected }) => (
      <>
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          {selected && <Check className="h-4 w-4" />}
        </span>
        <span className="block truncate font-normal">{children}</span>
      </>
    )}
  </ListboxOption>
))
SelectItem.displayName = "SelectItem"

const SelectLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold text-sketch-text-muted", className)}
    {...props}
  />
))
SelectLabel.displayName = "SelectLabel"

const SelectSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-sketch-border", className)}
    {...props}
  />
))
SelectSeparator.displayName = "SelectSeparator"

// Compatibility exports for existing usage patterns
const SelectGroup = ({ children }: { children: React.ReactNode }) => <>{children}</>

export {
  Select,
  SelectGroup,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectLabel,
  SelectItem,
  SelectSeparator,
}