"use client"

import * as React from "react"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// The "Split by" tile (content from app/preview/select). position="popper" only here, so the list
// opens under the field; the component's default stays "item-aligned" like the original. The list
// always opens downwards (side="bottom", no flipping) into room the demo keeps free under the field: five rows of
// --plush-h-row plus the list's 6 px padding top and bottom (the field's 10 px margin is the gap), so it stays in the tile.
const splits = [
  ["evenly", "Evenly"],
  ["item", "By item"],
  ["share", "By share"],
  ["percent", "Percent"],
  ["custom", "Custom"],
]

export function SelectDemo() {
  const id = React.useId()
  const [value, setValue] = React.useState("evenly")
  return (
    <div className="flex w-full min-w-0 flex-col pb-[calc(5*var(--plush-h-row)+--spacing(3))]">
      <p id={id} className="text-(length:--plush-text-xl) leading-tight font-(--plush-weight-semi)">
        Split by
      </p>
      <Select value={value} onValueChange={setValue}>
        <SelectTrigger aria-labelledby={id} className="my-2.5 w-full">
          {/* Radix only fills the chosen text in after hydration; written out, the field is not empty before it. */}
          <SelectValue>{splits.find(([v]) => v === value)?.[1]}</SelectValue>
        </SelectTrigger>
        <SelectContent position="popper" side="bottom" avoidCollisions={false}>
          {splits.map(([value, label]) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
