"use client"

import { Toggle } from "@/components/ui/toggle"

// Single toggles (content from app/preview/toggle): two chips and the small and large size.
export function ToggleDemo() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Toggle>Pizza</Toggle>
      <Toggle defaultPressed>Drinks</Toggle>
      <Toggle size="sm">Small</Toggle>
      <Toggle size="lg" defaultPressed>
        Large
      </Toggle>
    </div>
  )
}
