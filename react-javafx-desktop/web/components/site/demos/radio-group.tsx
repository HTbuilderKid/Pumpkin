"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

// The split tile (content from app/preview/radio-group): three rows, "By item" chosen. Each row is a
// <label>; one light green plate glides to the chosen row: a <span> at the end of the group, anchored to that row. A real
// element, not the group's ::after: Safari starts no transition on a pseudo-element that a :has() rule restyles at the
// same moment, so the plate jumped there.
const plate = cn(
  "pointer-events-none absolute rounded-(--plush-radius-row) bg-(image:--plush-select-line) opacity-0 shadow-(--plush-radio-plate-edge) mix-blend-multiply",
  "[position-anchor:--plush-radio-plate] top-[anchor(top)] right-[anchor(right)] bottom-[anchor(bottom)] left-[anchor(left)]",
  "[transition:top_var(--plush-dur-calm)_var(--plush-ease-calm),bottom_var(--plush-dur-calm)_var(--plush-ease-calm),opacity_var(--plush-dur-fade)_var(--plush-ease-fade)]",
  "not-supports-[anchor-name:--plush-radio-plate]:hidden supports-[anchor-name:--plush-radio-plate]:group-has-data-[state=checked]/plush-radio-plate:opacity-(--plush-radio-plate-opacity)"
)

const options = [
  ["evenly", "Split evenly", "$24.00 each"],
  ["item", "By item", "Pay what you ate"],
  ["custom", "Custom", "Set amounts"],
]

export function RadioGroupDemo() {
  return (
    <RadioGroup defaultValue="item" aria-label="Split" className="group/plush-radio-plate relative w-full gap-2 [anchor-scope:--plush-radio-plate]">
      {options.map(([value, title, note]) => (
        <label
          key={value}
          className={cn(
            "group/option relative flex min-h-(--plush-h-option) min-w-0 items-center gap-3 rounded-(--plush-radius-row) bg-(--plush-surface) px-4 py-2",
            // Hover: the white row stays white and takes the stronger shadow (the circle reacts through its label).
            "[transition:scale_var(--plush-dur-spring)_var(--plush-ease-spring),background-color_var(--plush-dur-fast)_var(--plush-ease-fade),box-shadow_var(--plush-dur-fast)_var(--plush-ease-fade)] active:scale-(--plush-press-scale-row) hover:bg-(--plush-surface-hover) hover:shadow-(--plush-active-shadow)",
            "has-data-[state=checked]:[anchor-name:--plush-radio-plate]",
            "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:bg-(image:--plush-select-line) after:opacity-0 after:shadow-(--plush-radio-plate-edge) after:mix-blend-multiply",
            "not-supports-[anchor-name:--plush-radio-plate]:has-data-[state=checked]:after:opacity-(--plush-radio-plate-opacity)"
          )}
        >
          <RadioGroupItem value={value} />
          <span className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 leading-tight break-words">
            <span className="min-w-0 text-(length:--plush-text-lg) font-(--plush-weight-semi)">{title}</span>
            <span className="min-w-0 text-(length:--plush-text-sm) font-(--plush-weight-medium) text-(--plush-ink-2)">{note}</span>
          </span>
        </label>
      ))}
      <span aria-hidden="true" data-slot="plush-radio-plate" className={plate} />
    </RadioGroup>
  )
}
