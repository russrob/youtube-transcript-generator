"use client"

import * as React from "react"
import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react"
import { Check, ChevronRight, Circle } from "lucide-react"

import { cn } from "@/lib/utils"

const DropdownMenu = Menu

const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof MenuButton>
>(({ className, ...props }, ref) => (
  <MenuButton
    ref={ref}
    className={cn("outline-none", className)}
    {...props}
  />
))
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof MenuItems> & {
    align?: "start" | "end" | "center"
    sideOffset?: number
  }
>(({ className, align = "start", sideOffset = 4, ...props }, ref) => (
  <MenuItems
    ref={ref}
    className={cn(
      "z-50 max-h-[var(--headlessui-anchor-max-height,theme(maxHeight.96))] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-xl border border-sketch-border bg-white p-1 text-sketch-text shadow-sketch-card",
      "origin-top-right transition duration-100 ease-out",
      "data-[closed]:scale-95 data-[closed]:opacity-0",
      // Align positioning
      align === "start" && "data-[anchor~=start]:origin-top-left",
      align === "end" && "data-[anchor~=end]:origin-top-right", 
      align === "center" && "data-[anchor~=center]:origin-top",
      className
    )}
    anchor={align}
    {...props}
  />
))
DropdownMenuContent.displayName = "DropdownMenuContent"

const DropdownMenuItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof MenuItem> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <MenuItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center gap-2 rounded-xl px-sketch-2 py-1.5 text-sketch-body outline-none",
      "data-[focus]:bg-sketch-surface data-[focus]:text-sketch-text",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuItem.displayName = "DropdownMenuItem"

const DropdownMenuCheckboxItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof MenuItem> & {
    checked?: boolean
    onCheckedChange?: (checked: boolean) => void
  }
>(({ className, children, checked, onCheckedChange, ...props }, ref) => (
  <MenuItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-xl py-1.5 pl-8 pr-sketch-2 text-sketch-body outline-none",
      "data-[focus]:bg-sketch-surface data-[focus]:text-sketch-text",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    onClick={() => onCheckedChange?.(!checked)}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      {checked && <Check className="h-4 w-4" />}
    </span>
    {children}
  </MenuItem>
))
DropdownMenuCheckboxItem.displayName = "DropdownMenuCheckboxItem"

const DropdownMenuRadioItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof MenuItem> & {
    value?: string
    checked?: boolean
    onSelect?: (value: string) => void
  }
>(({ className, children, value, checked, onSelect, ...props }, ref) => (
  <MenuItem
    ref={ref}
    className={cn(
      "relative flex cursor-default select-none items-center rounded-xl py-1.5 pl-8 pr-sketch-2 text-sketch-body outline-none",
      "data-[focus]:bg-sketch-surface data-[focus]:text-sketch-text",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
      className
    )}
    onClick={() => value && onSelect?.(value)}
    {...props}
  >
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      {checked && <Circle className="h-2 w-2 fill-current" />}
    </span>
    {children}
  </MenuItem>
))
DropdownMenuRadioItem.displayName = "DropdownMenuRadioItem"

const DropdownMenuLabel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    inset?: boolean
  }
>(({ className, inset, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "px-sketch-2 py-1.5 text-sm font-semibold text-sketch-text",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuLabel.displayName = "DropdownMenuLabel"

const DropdownMenuSeparator = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("-mx-1 my-1 h-px bg-sketch-border", className)}
    {...props}
  />
))
DropdownMenuSeparator.displayName = "DropdownMenuSeparator"

const DropdownMenuShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn("ml-auto text-xs tracking-widest opacity-60", className)}
      {...props}
    />
  )
}
DropdownMenuShortcut.displayName = "DropdownMenuShortcut"

// Sub-menu components (HeadlessUI doesn't have built-in sub-menus, so we'll create placeholders)
const DropdownMenuSub = ({ children }: { children: React.ReactNode }) => <>{children}</>

const DropdownMenuSubTrigger = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    inset?: boolean
  }
>(({ className, inset, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex cursor-default select-none items-center gap-2 rounded-xl px-sketch-2 py-1.5 text-sketch-body outline-none focus:bg-sketch-surface [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
      inset && "pl-8",
      className
    )}
    {...props}
  >
    {children}
    <ChevronRight className="ml-auto" />
  </div>
))
DropdownMenuSubTrigger.displayName = "DropdownMenuSubTrigger"

const DropdownMenuSubContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "z-50 min-w-[8rem] overflow-hidden rounded-xl border border-sketch-border bg-white p-1 text-sketch-text shadow-sketch-card",
      className
    )}
    {...props}
  />
))
DropdownMenuSubContent.displayName = "DropdownMenuSubContent"

// Placeholder components for compatibility
const DropdownMenuGroup = ({ children }: { children: React.ReactNode }) => <>{children}</>
const DropdownMenuPortal = ({ children }: { children: React.ReactNode }) => <>{children}</>
const DropdownMenuRadioGroup = ({ children }: { children: React.ReactNode }) => <>{children}</>

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuGroup,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuRadioGroup,
}