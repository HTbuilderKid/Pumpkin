"use client"

import * as React from "react"

import { Checkbox } from "@/components/ui/checkbox"

// The "Who's in?" tile (content from app/preview/checkbox): five friends, all in; the count follows.
const friends = [
  { name: "Maya", dot: "bg-(--plush-pink)" },
  { name: "Leo", dot: "bg-(--plush-success)" },
  { name: "Sam", dot: "bg-(--plush-danger)" },
  { name: "Priya", dot: "bg-(--plush-warning)" },
  { name: "Jonas", dot: "bg-(--plush-accent)" },
]

export function CheckboxDemo() {
  const id = React.useId() // the detail view renders a second copy: ids must stay unique
  const [inList, setInList] = React.useState(() => friends.map(() => true))
  const count = inList.filter(Boolean).length
  return (
    <div className="w-full min-w-0">
      <div className="mx-1 mb-3 leading-[normal] break-words">
        <p className="text-(length:--plush-text-xl) font-(--plush-weight-semi)">Who&apos;s in?</p>
        <p className="mt-[3px] text-(length:--plush-text-sm) font-(--plush-weight-medium) text-(--plush-ink-2)">
          {count} of {friends.length} friends
        </p>
      </div>
      {friends.map((f, i) => (
        <div key={f.name} className="flex min-h-[52px] items-center gap-2.5 px-1 py-2.5 text-(length:--plush-text-lg) font-(--plush-weight-semi)">
          <span
            aria-hidden="true"
            className={`inline-flex size-8 shrink-0 items-center justify-center rounded-(--plush-radius-full) text-(length:--plush-text-md) text-(--plush-on-accent) ${f.dot}`}
          >
            {f.name[0]}
          </span>
          <label htmlFor={`${id}-${i}`} className="min-w-0 flex-1 leading-tight break-words">
            {f.name}
          </label>
          <Checkbox
            id={`${id}-${i}`}
            checked={inList[i]}
            onCheckedChange={(v) => setInList((s) => s.map((x, j) => (j === i ? v === true : x)))}
          />
        </div>
      ))}
    </div>
  )
}
