"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Link01Icon, Loading03Icon, Notification02Icon, Tick02Icon } from "@hugeicons/core-free-icons"

import { Badge } from "@/components/ui/badge"

const card = "rounded-(--plush-radius-card) bg-(--plush-panel) p-(--plush-pad)"
const dark = "rounded-(--plush-radius-card) bg-(--plush-accent) p-(--plush-pad) text-(--plush-on-accent) plush-on-dark"
const variants = ["default", "secondary", "outline", "ghost", "link", "destructive"] as const
// The status pill of the tile on top of the small badge: 52 px, 18 px text, the disc 24 px, 14 px left of it, 22 px right.
const status =
  "min-h-(--plush-h-status) gap-2.75 rounded-[calc(var(--plush-h-status)/2)] py-2 px-5.5 text-(length:--plush-text-btn) leading-tight has-[>svg]:ps-3.5 [&>svg]:size-6 [&>svg]:p-1 aria-busy:[&>svg]:p-0.5"
// A plain round stand-in for the bell button (the button item is not installed with the badge).
const bell =
  "plush-focus-ring relative inline-flex size-(--plush-h-icon) items-center justify-center rounded-(--plush-radius-full) bg-(--plush-surface) text-(--plush-ink) shadow-(--plush-card-shadow)"

export default function BadgePreview() {
  const [sending, setSending] = React.useState(false)
  const [count, setCount] = React.useState(2)

  return (
    <main className="plush-font min-h-screen bg-(--plush-bg) p-8 text-(--plush-ink)">
      <div className="flex flex-col items-start gap-8">
        {/* The status tile: "Sent". Pressing it switches to "Sending" and back. */}
        <section
          data-tile="status"
          className="flex h-[228px] w-[211px] max-w-full items-center justify-center rounded-(--plush-radius-panel) bg-(--plush-panel) p-(--plush-pad)"
        >
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
        </section>

        {/* The counter of the actions tile: on the bell, ringed in the tile colour. Pressing the bell clears it, pressing
            again brings it back. */}
        <section data-counter="" className={`flex items-center gap-6 ${card}`}>
          <button type="button" aria-label="Notifications" className={bell} onClick={() => setCount((c) => (c ? 0 : 2))}>
            <HugeiconsIcon icon={Notification02Icon} size={22} strokeWidth={2.4} aria-hidden />
            {count > 0 && (
              <Badge variant="destructive" role="status" className="absolute -top-0.75 -right-0.75 ring-3 ring-(--plush-panel)">
                <span key={count}>{count}</span>
              </Badge>
            )}
          </button>
          <Badge variant="destructive">3</Badge>
          <Badge variant="destructive">12</Badge>
          <Badge variant="destructive">99+</Badge>
        </section>

        <section data-variants="" className={`flex flex-wrap items-center gap-3 ${card}`}>
          <Badge>
            <HugeiconsIcon icon={Tick02Icon} size={16} strokeWidth={2.4} aria-hidden className="[&_path]:[stroke-linejoin:miter]" />
            Sent
          </Badge>
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="ghost">Ghost</Badge>
          <Badge variant="link">Link</Badge>
          <Badge variant="destructive">Destructive</Badge>
          <Badge asChild variant="outline">
            <a href="#top">As link</a>
          </Badge>
          <Badge aria-invalid>Invalid</Badge>
          <Badge aria-busy>
            <HugeiconsIcon icon={Loading03Icon} size={20} strokeWidth={2.4} aria-hidden />
            Sending
          </Badge>
        </section>

        <section data-narrow="" className={`flex w-[240px] flex-col items-start gap-3 ${card}`}>
          <Badge className={status}>
            <HugeiconsIcon icon={Tick02Icon} size={16} strokeWidth={2.4} aria-hidden className="[&_path]:[stroke-linejoin:miter]" />
            Sent to Maya, Leo, Sam and everyone else at the table
          </Badge>
          <Badge variant="secondary">Supercalifragilisticexpialidociouslylongstatus</Badge>
          <Badge variant="destructive">Payment failed because the card was declined twice</Badge>
        </section>

        {/* Counters 1 / 9 / 99 / 999+, every variant with a leading icon and as a link, invalid on each. */}
        <section data-edge="" className={`flex flex-col items-start gap-3 ${card}`}>
          <div data-counts="" className="flex flex-wrap items-center gap-3">
            {["1", "9", "99", "999+", "12 345"].map((n) => (
              <Badge key={n} variant="destructive">
                {n}
              </Badge>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {variants.map((variant) => (
              <Badge key={variant} variant={variant}>
                <HugeiconsIcon icon={Tick02Icon} size={16} strokeWidth={2.4} data-icon="inline-start" aria-hidden className="[&_path]:[stroke-linejoin:miter]" />
                {variant}
              </Badge>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {variants.map((variant) => (
              <Badge key={variant} variant={variant} asChild>
                <a href="#top">
                  {variant}
                  <HugeiconsIcon icon={Link01Icon} size={12} strokeWidth={2.4} data-icon="inline-end" aria-hidden />
                </a>
              </Badge>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {variants.map((variant) => (
              <Badge key={variant} variant={variant} aria-invalid>
                Invalid
              </Badge>
            ))}
          </div>
          <div dir="rtl" className="flex flex-wrap items-center gap-3">
            <Badge>
              <HugeiconsIcon icon={Tick02Icon} size={16} strokeWidth={2.4} aria-hidden className="[&_path]:[stroke-linejoin:miter]" />
              أُرسلت
            </Badge>
            <Badge variant="secondary">Grüße 🍕</Badge>
          </div>
          <div data-tiny="" className="flex w-[160px] flex-col items-start gap-3">
            <Badge variant="outline">Sent to the whole table at once</Badge>
            <Badge variant="destructive">A</Badge>
          </div>
        </section>

        <section data-dark="" className={`flex flex-wrap items-center gap-3 ${dark}`}>
          {variants.map((variant) => (
            <Badge key={variant} variant={variant} asChild>
              <a href="#top">{variant}</a>
            </Badge>
          ))}
        </section>
      </div>
    </main>
  )
}
