"use client"

import * as React from "react"

import { HugeiconsIcon } from "@hugeicons/react"
import { Notification02Icon, PercentIcon } from "@hugeicons/core-free-icons"

import { Switch } from "@/components/ui/switch"

// The toggles tile (content from app/preview/switch): two settings rows with coloured round icons. The
// icons sit small in the 32 px dots (bell about 11 x 12 px of ink, percent about 11 x 11).
function Bell() {
  return <HugeiconsIcon icon={Notification02Icon} size={16} strokeWidth={2.4} aria-hidden />
}

function Percent() {
  return <HugeiconsIcon icon={PercentIcon} size={16} strokeWidth={2.4} aria-hidden />
}

function Setting({
  title,
  sub,
  icon,
  dot,
  ...props
}: React.ComponentProps<typeof Switch> & { title: string; sub: string; icon: React.ReactNode; dot: string }) {
  const id = React.useId() // the detail view renders a second copy: ids must stay unique
  return (
    <div className="flex min-h-[72px] items-center gap-3.5 py-2.5 not-first:shadow-[inset_0_1px_0_var(--plush-fill)]">
      <span className={`inline-flex size-8 shrink-0 items-center justify-center rounded-(--plush-radius-full) text-(--plush-on-accent) ${dot}`}>
        {icon}
      </span>
      <div className="min-w-0 flex-1 leading-[normal] break-words">
        <label htmlFor={id} className="block text-(length:--plush-text-xl) font-(--plush-weight-semi)">
          {title}
        </label>
        <span id={`${id}-sub`} className="mt-[3px] block text-(length:--plush-text-sm) font-(--plush-weight-medium) text-(--plush-ink-2)">
          {sub}
        </span>
      </div>
      <Switch id={id} aria-describedby={`${id}-sub`} {...props} />
    </div>
  )
}

export function SwitchDemo() {
  return (
    <div className="w-full rounded-(--plush-radius-card) bg-(--plush-surface) px-5 py-2 shadow-(--plush-card-shadow)">
      <Setting title="Remind friends" sub="Every evening until paid" icon={<Bell />} dot="bg-(--plush-danger)" defaultChecked />
      <Setting title="Add tip automatically" sub="18% on every split" icon={<Percent />} dot="bg-(--plush-pink)" />
    </div>
  )
}
