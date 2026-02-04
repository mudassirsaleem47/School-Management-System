import React from "react"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"

const Field = React.forwardRef(({ className, children, ...props }, ref) => (
  <div ref={ref} className={cn("space-y-2", className)} {...props}>
    {children}
  </div>
))
Field.displayName = "Field"

const FieldLabel = React.forwardRef(({ className, ...props }, ref) => (
  <Label ref={ref} className={className} {...props} />
))
FieldLabel.displayName = "FieldLabel"

export { Field, FieldLabel }