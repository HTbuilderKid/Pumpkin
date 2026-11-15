"use client"

import * as React from "react"
import { toast } from "sonner"

import { Toaster } from "@/components/ui/sonner"

// The tile's note: title on the left, the muted time pushed to the right (demo markup, not part of the component).
function Paid({ who, amount }: { who: string; amount: string }) {
  return (
    <span className="flex min-w-0 items-center gap-3">
      <span className="min-w-0 flex-1">
        {who} paid you {amount}
      </span>
      <span className="ms-auto shrink-0 text-(length:--plush-text-md) font-(--plush-weight-medium) text-(--plush-ink-2)">
        now
      </span>
    </span>
  )
}

const button =
  "plush-focus-ring min-h-(--plush-h-chip) max-w-full cursor-pointer rounded-(--plush-radius-full) bg-(--plush-accent) px-5 py-2 text-(length:--plush-text-md) leading-tight font-(--plush-weight-semi) break-words text-(--plush-on-accent) [transition:scale_var(--plush-dur-spring)_var(--plush-ease-spring),background-color_var(--plush-dur-fast)_var(--plush-ease-fade)] hover:bg-(--plush-accent-hover) active:scale-(--plush-press-scale-pill)"

// Toasters that stand in the page instead of the window corner, so every kind can be seen without a click.
const inPlace = "relative! inset-auto! w-full! h-(--front-toast-height)"
const full = { "--width": "100%" } as React.CSSProperties

export default function SonnerPreview() {
  React.useEffect(() => {
    const keep = { duration: Infinity }
    toast.success(<Paid who="Maya" amount="$18.00" />, { ...keep, id: "tile", toasterId: "tile" })

    const kinds = { ...keep, toasterId: "kinds" }
    toast("Plain note without an icon", { ...kinds, id: "plain" })
    toast.loading("Sending $18.00 to Maya", { ...kinds, id: "loading" })
    toast.info("Leo split the bill", { ...kinds, id: "info", description: "Pizza night, 4 people" })
    toast.warning("Card expires soon", {
      ...kinds,
      id: "warning",
      action: { label: "Update", onClick: () => {} },
      cancel: { label: "Later", onClick: () => {} },
    })
    toast.error("Payment failed", { ...kinds, id: "error", description: "Try again or use another card" })
    toast.success(<Paid who="Leo" amount="$24.00" />, { ...kinds, id: "success" })

    toast.success(
      "Maya paid you $18.00 for the Supercalifragilisticexpialidocious pizza night with extra cheese and a very long note",
      {
        ...keep,
        id: "long",
        toasterId: "w240",
        description:
          "Split four ways including tips and taxes, sent to your Pocket account ending in 4821 and available right away",
        action: { label: "View receipt for this payment", onClick: () => {} },
      }
    )
  }, [])

  return (
    <main className="plush-font flex min-h-screen flex-wrap items-start gap-8 bg-(--plush-bg) p-8 text-(--plush-ink)">
      <button
        type="button"
        className={button}
        onClick={() => toast.success(<Paid who="Maya" amount="$18.00" />)}
      >
        Show toast
      </button>

      <section
        data-testid="tile"
        className="flex h-[104px] w-[441px] items-center rounded-(--plush-radius-panel) bg-(--plush-panel) p-(--plush-pad) *:w-full"
      >
        <Toaster id="tile" position="top-left" className={inPlace} style={full} />
      </section>

      <section data-testid="kinds" className="h-[520px] w-[401px]">
        <Toaster
          id="kinds"
          position="top-left"
          expand
          closeButton
          visibleToasts={9}
          className={inPlace}
          style={full}
        />
      </section>

      <section
        data-testid="w240"
        className="h-[360px] w-[240px] rounded-(--plush-radius-card) bg-(--plush-panel) p-3"
      >
        <Toaster id="w240" position="top-left" className={inPlace} style={full} />
      </section>

      <Toaster />
    </main>
  )
}
