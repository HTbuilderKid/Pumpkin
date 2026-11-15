"use client"

import * as React from "react"

import { HugeiconsIcon } from "@hugeicons/react"
import { Calendar04Icon } from "@hugeicons/core-free-icons"

import { Calendar } from "@/components/ui/calendar"

// The calendar tile (content from app/preview/calendar): November 2026, today the 10th, the 11th picked.
// The tile is a filled card with 24 px all round: 4 px on top of the tile's own padding, the
// calendar without its own (p-0), the hint as wide as the days and on the bottom edge (at least 22 px below them).
const TODAY = new Date(2026, 10, 10)
const NOVEMBER = new Date(2026, 10, 1)

// The glyph at 17 px of ink in a 20 px box.
function CalendarIcon() {
  return <HugeiconsIcon icon={Calendar04Icon} size={18} strokeWidth={2.4} aria-hidden className="w-5 shrink-0" />
}

export function CalendarDemo() {
  const [date, setDate] = React.useState<Date | undefined>(new Date(2026, 10, 11))
  return (
    <div className="flex w-full max-w-max min-w-0 flex-col gap-5.5 self-stretch p-1">
      <Calendar mode="single" selected={date} onSelect={setDate} defaultMonth={NOVEMBER} today={TODAY} showOutsideDays={false} className="p-0" />
      <div className="mt-auto flex min-h-(--plush-h-row) w-0 min-w-full items-center gap-2.5 rounded-(--plush-radius-row) bg-(--plush-accent-tint) px-3.5 py-2.5 text-(length:--plush-text-md) leading-tight font-(--plush-weight-semi) break-words">
        <CalendarIcon />
        {/* Follows the pick: the weekday of the chosen date (the 11th gives "Wed"); nothing picked, no day. */}
        <span className="min-w-0">
          {date ? `Drinks with Leo, ${date.toLocaleDateString("en-US", { weekday: "short" })} 8:00 pm` : "Drinks with Leo, pick a day"}
        </span>
      </div>
    </div>
  )
}
