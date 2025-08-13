"use client"

import * as React from "react"
import { Dialog as HeadlessDialog, DialogPanel, DialogTitle } from "@headlessui/react"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"

const Dialog = HeadlessDialog

const DialogTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={className}
    {...props}
  />
))
DialogTrigger.displayName = "DialogTrigger"

const DialogContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof DialogPanel> & {
    className?: string
    showClose?: boolean
  }
>(({ className, children, showClose = true, ...props }, ref) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0">
    <div 
      className="fixed inset-0 bg-black/25 transition-opacity"
      aria-hidden="true"
    />
    <DialogPanel
      ref={ref}
      className={cn(
        "relative z-50 grid w-full max-w-lg gap-4 border border-sketch-border bg-white p-6 shadow-sketch-card rounded-xl",
        "transition-all duration-100",
        "data-[closed]:scale-95 data-[closed]:opacity-0",
        "sm:max-w-md",
        className
      )}
      {...props}
    >
      {children}
      {showClose && (
        <button
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-sketch-accent focus:ring-offset-2 disabled:pointer-events-none"
          onClick={() => {}}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      )}
    </DialogPanel>
  </div>
))
DialogContent.displayName = "DialogContent"

const DialogHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col space-y-1.5 text-center sm:text-left",
      className
    )}
    {...props}
  />
))
DialogHeader.displayName = "DialogHeader"

const DialogFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
))
DialogFooter.displayName = "DialogFooter"

const DialogTitle_ = React.forwardRef<
  HTMLHeadingElement,
  React.ComponentPropsWithoutRef<typeof DialogTitle>
>(({ className, ...props }, ref) => (
  <DialogTitle
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight text-sketch-text",
      className
    )}
    {...props}
  />
))
DialogTitle_.displayName = "DialogTitle"

const DialogDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-sketch-text-muted", className)}
    {...props}
  />
))
DialogDescription.displayName = "DialogDescription"

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle_,
  DialogDescription,
}