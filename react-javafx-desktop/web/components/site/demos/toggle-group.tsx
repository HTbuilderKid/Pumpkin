"use client"

import * as React from "react"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

// The chips tile (content from app/preview/toggle-group): Drinks and Tiramisu chosen. The tile is two half
// rows high with the question over the chips: a chosen chip widens by its tick, so four chosen chips wrap into a second
// row, which then still lies inside the tile.
const dishes = [
  ["pizza", "Pizza"],
  ["salad", "Salad"],
  ["drinks", "Drinks"],
  ["tiramisu", "Tiramisu"],
]

export function ToggleGroupDemo() {
  const id = React.useId()
  return (
    <div className="flex w-full min-w-0 flex-col items-center gap-3.5 text-center">
      <p id={id} className="text-(length:--plush-text-xl) leading-[normal] font-(--plush-weight-semi) break-words">
        What did you have?
      </p>
      {/* spacing 1.5 (6 px instead of 8): with 8 the four chips wrapped into a second row on the 6-column grid below
          1363 px already with two chosen. */}
      <ToggleGroup type="multiple" spacing={1.5} defaultValue={["drinks", "tiramisu"]} aria-labelledby={id} className="justify-center">
        {dishes.map(([value, label]) => (
          <ToggleGroupItem key={value} value={value}>
            {label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  )
}
