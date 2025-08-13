"use client"

import { Dialog, DialogPanel, DialogTitle } from "@headlessui/react"
import { Button } from "./button"

interface ConfirmationDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: "default" | "destructive"
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "default"
}: ConfirmationDialogProps) {
  return (
    <Dialog open={isOpen} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/25" aria-hidden="true" />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <DialogPanel className="mx-auto max-w-sm rounded-xl bg-white p-6 shadow-sketch-card border border-sketch-border">
          <DialogTitle className="font-sketch-serif text-xl text-sketch-text mb-4">
            {title}
          </DialogTitle>
          
          <p className="text-sketch-body text-sketch-text-muted mb-6">
            {message}
          </p>
          
          <div className="flex gap-3 justify-end">
            <Button 
              variant="outline" 
              onClick={onClose}
              size="sm"
            >
              {cancelLabel}
            </Button>
            <Button 
              variant={variant === "destructive" ? "destructive" : "default"}
              onClick={() => {
                onConfirm()
                onClose()
              }}
              size="sm"
            >
              {confirmLabel}
            </Button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}