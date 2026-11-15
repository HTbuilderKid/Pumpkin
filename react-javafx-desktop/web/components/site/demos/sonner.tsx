"use client"

import * as React from "react"
import { toast } from "sonner"
import { HugeiconsIcon } from "@hugeicons/react"
import { RepeatIcon } from "@hugeicons/core-free-icons"

import { Toaster } from "@/components/ui/sonner"

// The toast tile (content from app/preview/sonner): the note stands in the tile instead of the window
// corner, like the preview's tile. Every mount has its own toaster (the detail view renders a second copy). The round
// button sends the note again: the old one leaves and a new one comes in with the toaster's own motion.
function Paid() {
  return (
    <span className="flex min-w-0 items-center gap-3">
      <span className="min-w-0 flex-1">Maya paid you $18.00</span>
      <span className="ms-auto shrink-0 text-(length:--plush-text-md) font-(--plush-weight-medium) text-(--plush-ink-2)">now</span>
    </span>
  )
}

const inPlace = "relative! inset-auto! w-full! h-(--front-toast-height)"
const full = { "--width": "100%" } as React.CSSProperties

export function SonnerDemo() {
  const toasterId = React.useId()
  const sent = React.useRef(0)
  const send = React.useCallback(() => {
    toast.dismiss(`${toasterId}-${sent.current}`)
    sent.current += 1
    // The note sent on load stands still (plush-site-still in globals.css): only a press of the button brings motion.
    toast.success(<Paid />, {
      id: `${toasterId}-${sent.current}`,
      toasterId,
      duration: Infinity,
      className: sent.current === 1 ? "plush-site-still" : undefined,
    })
  }, [toasterId])

  React.useEffect(() => {
    send()
  }, [send])

  return (
    // The button goes under the note when the tile is too narrow for both on one line (phones), so the note never wraps.
    <div className="flex w-full min-w-0 flex-wrap items-center justify-center gap-3">
      {/* Holds the note's height before it arrives (the note is sent after hydration), so the tile never grows on load.
          onBlurCapture: when focus leaves the toaster, sonner sends it back to where it came from (right for a toaster in
          the window corner). In the tile that made Tab bounce between the note and the control before it forever, so
          the blur that leaves this box never reaches sonner. */}
      <div
        className="min-h-(--plush-h-toast) min-w-[min(100%,300px)] flex-1 *:w-full"
        onBlurCapture={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) e.stopPropagation()
        }}
      >
        <Toaster id={toasterId} position="top-left" visibleToasts={1} mobileOffset={0} className={inPlace} style={full} />
      </div>
      {/* A round icon button: grows a little and its shadow gets stronger under the pointer. */}
      <button
        type="button"
        aria-label="Send the note again"
        onClick={send}
        className="plush-focus-ring grid size-9 shrink-0 cursor-pointer place-items-center rounded-(--plush-radius-full) bg-(--plush-surface) text-(--plush-ink) shadow-(--plush-card-shadow) [transition:scale_var(--plush-dur-spring)_var(--plush-ease-spring),box-shadow_var(--plush-dur-fast)_var(--plush-ease-fade)] hover:scale-(--plush-hover-grow) hover:shadow-(--plush-active-shadow) active:scale-(--plush-press-scale)"
      >
        <HugeiconsIcon icon={RepeatIcon} size={18} strokeWidth={2.4} aria-hidden />
      </button>
    </div>
  )
}
