"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ExclamationMarkIcon } from "@hugeicons/core-free-icons"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// The tooltip tile (content from app/preview/tooltip): the bubble stands open over the round info button.
// Held open on the page (Radix would close it on every page scroll and leave the tile empty): hover or focus opens it,
// a click on the button or Escape closes it, a second click opens it again.
export function TooltipDemo() {
  const [open, setOpen] = React.useState(true)
  // The bubble shown on load stands still (plush-site-still in globals.css); from the first press on it moves as usual.
  const [still, setStill] = React.useState(true)
  return (
    // min-h: button (44) + its 34 px below + offset and the two-line bubble above it; on phones, where name and command
    // stand under the demo, the bubble otherwise reached past the tile's top edge into the gap.
    <div className="flex min-h-[140px] flex-col items-center justify-end self-stretch pb-[34px]">
      <TooltipProvider>
        <Tooltip open={open} onOpenChange={(next) => next && setOpen(true)}>
          <TooltipTrigger
            aria-label="Price details"
            onClick={() => {
              setStill(false)
              setOpen((o) => !o)
            }}
            className="grid size-11 shrink-0 place-items-center rounded-(--plush-radius-full) bg-(--plush-surface) text-(--plush-ink) shadow-(--plush-card-shadow) [transition:scale_var(--plush-dur-spring)_var(--plush-ease-spring),box-shadow_var(--plush-dur-fast)_var(--plush-ease-fade)] hover:scale-(--plush-hover-grow) hover:shadow-(--plush-active-shadow) active:scale-(--plush-press-scale)"
          >
            {/* A bare "i": the exclamation mark turned upside down (InfoIcon brings its own ring). */}
            <HugeiconsIcon icon={ExclamationMarkIcon} size={18} strokeWidth={2.4} aria-hidden className="rotate-180" />
          </TooltipTrigger>
          {/* No collision flip: on a scrolled page the bubble would turn below the button, over the name pill and the
              next tile; it stays above and leaves the window with its tile. */}
          <TooltipContent
            sideOffset={4}
            avoidCollisions={false}
            className={still ? "plush-site-still" : undefined}
            onEscapeKeyDown={() => {
              setStill(false)
              setOpen(false)
            }}
          >
            Includes 18% tip and tax
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  )
}
