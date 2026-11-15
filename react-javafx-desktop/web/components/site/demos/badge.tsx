"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Loading03Icon, Tick02Icon } from "@hugeicons/core-free-icons"

import { Badge } from "@/components/ui/badge"

// The status tile (content from app/preview/badge): "Sent". Pressing it switches to "Sending" and back.
// leading-tight comes after the text size, so the merge keeps it.
const status =
  "min-h-(--plush-h-status) gap-2.75 rounded-[calc(var(--plush-h-status)/2)] py-2 px-5.5 text-(length:--plush-text-btn) leading-tight has-[>svg]:ps-3.5 [&>svg]:size-6 [&>svg]:p-1 aria-busy:[&>svg]:p-0.5"

export function BadgeDemo() {
  const [sending, setSending] = React.useState(false)
  return (
    <Badge asChild aria-busy={sending} className={status}>
      <button type="button" aria-live="polite" onClick={() => setSending((s) => !s)}>
        {sending ? (
          <HugeiconsIcon key="spin" icon={Loading03Icon} size={20} strokeWidth={2.4} aria-hidden className="animate-[plush-spin_var(--plush-dur-spin)_var(--plush-ease-spin)_infinite]" />
        ) : (
          <HugeiconsIcon key="tick" icon={Tick02Icon} size={16} strokeWidth={2.4} aria-hidden className="[&_path]:[stroke-linejoin:miter]" />
        )}
        <span key={sending ? "a" : "b"}>{sending ? "Sending" : "Sent"}</span>
      </button>
    </Badge>
  )
}
