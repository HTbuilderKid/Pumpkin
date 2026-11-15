"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { PlusSignIcon } from "@hugeicons/core-free-icons"

import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar"

// The stack tile (content from app/preview/avatar): M L S P and the plus, 4 people; the plus adds one.

// The people of the tile, in the order they join: M L S, then P (amber) and J (black).
const roster = [
  { initial: "M", color: "bg-(--plush-pink)" },
  { initial: "L", color: "bg-(--plush-success)" },
  { initial: "S", color: "bg-(--plush-danger)" },
  { initial: "P", color: "bg-(--plush-warning)" },
  { initial: "J", color: "bg-(--plush-accent)" },
  { initial: "A", color: "bg-(--plush-pink)" },
  { initial: "R", color: "bg-(--plush-success)" },
  { initial: "T", color: "bg-(--plush-danger)" },
  { initial: "K", color: "bg-(--plush-warning)" },
  { initial: "E", color: "bg-(--plush-accent)" },
]

// At most four avatars and the plus. From the fifth person on, the first three stay and a count circle
// stands for the rest ("+2"), so no circle leaves the stack and it keeps the overlap and width it has on load. The count
// grows in from the pop scale when it first appears. The line below counts exactly the people the circles stand for.
function Party({
  title,
  start,
  disabled,
}: {
  title: string
  start: number
  disabled?: boolean
}) {
  const [count, setCount] = React.useState(start)
  const shown = count > 4 ? 3 : count
  const people = Array.from({ length: shown }, (_, i) => ({ id: i, ...roster[i % roster.length] }))
  return (
    <div className="w-full min-w-0 text-center">
      <AvatarGroup className="mb-3.5 justify-center">
        {people.map((p) => (
          <Avatar key={p.id} size="lg">
            <AvatarFallback className={p.color}>{p.initial}</AvatarFallback>
          </Avatar>
        ))}
        {count > shown && (
          // The plus covers the count's right edge: its number is centred in the part that shows.
          <AvatarGroupCount className="pe-(--plush-avatar-overlap-now) starting:scale-(--plush-pop-scale)">
            +{count - shown}
          </AvatarGroupCount>
        )}
        <AvatarGroupCount>
          <button
            type="button"
            aria-label="Add a person"
            disabled={disabled}
            onClick={() => setCount((n) => n + 1)}
            className="plush-focus-ring grid size-full place-items-center rounded-(--plush-radius-full) disabled:cursor-not-allowed"
          >
            <HugeiconsIcon icon={PlusSignIcon} size={16} strokeWidth={2.4} aria-hidden />
          </button>
        </AvatarGroupCount>
      </AvatarGroup>
      <p className="text-(length:--plush-text-xl) leading-[normal] font-(--plush-weight-semi) break-words">{title}</p>
      <p className="mt-[3px] text-(length:--plush-text-sm) leading-[normal] font-(--plush-weight-medium) break-words text-(--plush-ink-2)">
        {count} people
      </p>
    </div>
  )
}

export function AvatarDemo() {
  return (
    <div className="w-full min-w-0 [--plush-avatar-ring-color:var(--plush-panel)]">
      <Party title="Pizza night" start={4} />
    </div>
  )
}
