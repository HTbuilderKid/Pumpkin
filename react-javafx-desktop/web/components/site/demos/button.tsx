"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Add01Icon,
  Loading03Icon,
  MoreHorizontalIcon,
  Notification02Icon,
  Share03Icon,
  SquareLock01Icon,
} from "@hugeicons/core-free-icons"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// The pay tile (content from app/preview/button): pressing it shows a quiet loading state (aria-busy),
// pressing again ends it.
export function ButtonPayDemo() {
  const [paying, setPaying] = React.useState(false)
  return (
    <Button className="min-w-[min(300px,100%)]" aria-busy={paying} onClick={() => setPaying((p) => !p)}>
      {/* Lock and spinner at 16 px with the library stroke; the lock keeps an 18 px room (1 px either side). */}
      <HugeiconsIcon
        icon={paying ? Loading03Icon : SquareLock01Icon}
        size={16}
        strokeWidth={2.4}
        data-icon="inline-start"
        aria-hidden
        className={paying ? "animate-[plush-spin_var(--plush-dur-spin)_var(--plush-ease-spin)_infinite]" : "mx-px size-4"}
      />
      {paying ? "Paying…" : "Pay $24.00"}
    </Button>
  )
}

// The actions tile: black plus, three white round buttons, the red count on the bell (the badge's
// counter, ringed in the tile colour). Pressing the bell clears the count, pressing again brings it back.
// Icons at the library size (20 px, the bell 18) with the stroke 1:10 of the box; the dots take a thinner stroke, which
// sets their size, so they keep their gaps. The class beats the button's own icon size.
export function ButtonActionsDemo() {
  const [count, setCount] = React.useState(2)
  return (
    <div className="grid grid-cols-2 gap-4">
      <Button size="icon" aria-label="Add">
        <HugeiconsIcon icon={Add01Icon} size={20} strokeWidth={2.4} aria-hidden className="size-5" />
      </Button>
      <Button size="icon" variant="outline" aria-label="Share">
        <HugeiconsIcon icon={Share03Icon} size={20} strokeWidth={2.4} aria-hidden className="size-5" />
      </Button>
      <Button
        size="icon"
        variant="outline"
        aria-label={count ? `Notifications, ${count} new` : "Notifications"}
        onClick={() => setCount((c) => (c ? 0 : 2))}
      >
        <HugeiconsIcon icon={Notification02Icon} size={18} strokeWidth={2.4} aria-hidden className="size-4.5" />
        {count > 0 && (
          <Badge variant="destructive" className="absolute -top-0.75 -right-0.75 ring-3 ring-(--plush-panel)">
            <span key={count}>{count}</span>
          </Badge>
        )}
      </Button>
      <Button size="icon" variant="outline" aria-label="More">
        <HugeiconsIcon icon={MoreHorizontalIcon} size={20} strokeWidth={1.5} aria-hidden className="size-5" />
      </Button>
    </div>
  )
}
