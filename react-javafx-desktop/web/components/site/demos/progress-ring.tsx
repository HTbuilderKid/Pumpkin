"use client"

import * as React from "react"

import { ProgressRing, ProgressRingValue } from "@/components/ui/progress-ring"

// The dark ring tile (content from app/preview/progress-ring): 4/4, paid back. A press on the tile's
// content moves to the next payment (1/4 after 4/4); the number rolls to it. The button lies over ring and line, so the
// ring keeps its own role.
const ofTotal = (value: number, max: number) => `${value} of ${max}`

export function ProgressRingDemo() {
  const id = React.useId()
  const [paid, setPaid] = React.useState(4)
  return (
    <div className="relative flex w-full min-w-0 flex-col items-center text-center">
      <ProgressRing value={paid} max={4} aria-labelledby={id} getValueLabel={ofTotal}>
        <ProgressRingValue />/4
      </ProgressRing>
      <p id={id} className="mt-3 w-full text-(length:--plush-text-md) leading-[normal] font-(--plush-weight-medium) break-words text-(--plush-on-accent-2)">
        Paid back
      </p>
      <button
        type="button"
        aria-label="Next payment"
        onClick={() => setPaid((p) => (p % 4) + 1)}
        // Under the pointer the see-through button takes the dark tile's light veil (--plush-on-accent-track-hover).
        className="plush-focus-ring absolute -inset-2 cursor-pointer rounded-(--plush-radius-card) [transition:background-color_var(--plush-dur-fast)_var(--plush-ease-fade)] hover:bg-(--plush-on-accent-track-hover)"
      />
    </div>
  )
}
