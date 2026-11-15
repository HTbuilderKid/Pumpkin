"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowUp02Icon, Menu02Icon, Tick02Icon } from "@hugeicons/core-free-icons"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Demo only, not part of the component: the black pill that opens a dialog, the tile's buttons (the wide green "Sent"
// and the black "Continue"), the grey hint line and the two rows with their coloured dots.
// Under the pointer: black turns --plush-accent-hover, grey one step darker, the green one a little brighter (never another colour).
const press = "[transition:scale_var(--plush-dur-spring)_var(--plush-ease-spring),background-color_var(--plush-dur-fast)_var(--plush-ease-fade),filter_var(--plush-dur-fast)_var(--plush-ease-fade)] active:not-disabled:scale-(--plush-press-scale-pill)"
const pill = `inline-flex min-h-(--plush-h-btn-sm) max-w-full items-center justify-center gap-2 rounded-(--plush-radius-full) px-7 py-2 text-(length:--plush-text-xl) leading-tight font-(--plush-weight-semi) break-words ${press}`
const openButton = `${pill} bg-(--plush-accent) text-(--plush-on-accent) hover:not-disabled:bg-(--plush-accent-hover) disabled:cursor-not-allowed disabled:opacity-(--plush-disabled-opacity)`
const sentButton = `${pill} w-full bg-(image:--plush-select-fill) text-(--plush-on-select) shadow-(--plush-select-gloss) hover:brightness-(--plush-hover-bright)`
const hint = "flex min-h-11 items-center gap-2.5 rounded-(--plush-radius-row) bg-(--plush-accent-tint) px-3.5 py-2 font-(--plush-weight-semi) text-(--plush-ink)"
const row = "flex min-h-11.5 min-w-0 items-center gap-3 text-(length:--plush-text-lg) font-(--plush-weight-semi)"
const dot = "grid size-8 shrink-0 place-items-center rounded-(--plush-radius-full) text-(--plush-on-accent)"
const value = "ml-auto min-w-0 text-right font-(--plush-weight-medium) text-(--plush-ink-2)"

function Sheet({
  name,
  note,
  title = `Send to ${name}`,
  ...props
}: React.ComponentProps<typeof DialogContent> & { name: string; note: string; title?: string }) {
  return (
    <DialogContent {...props}>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <DialogDescription className={hint}>
        <span className="grid size-5 shrink-0 place-items-center rounded-(--plush-radius-full) bg-(--plush-accent) text-(--plush-on-accent)">
          <HugeiconsIcon icon={Tick02Icon} size={14} strokeWidth={2.4} aria-hidden className="[&_path]:[stroke-linejoin:miter]" />
        </span>
        {name} gets it instantly, no fee
      </DialogDescription>
      <div className="-mt-1.5">
        <div className={row}>
          <span className={`${dot} bg-(--plush-success)`}>
            <HugeiconsIcon icon={ArrowUp02Icon} size={18} strokeWidth={2.4} aria-hidden />
          </span>
          Amount<span className={value}>$24.00</span>
        </div>
        <div className={row}>
          <span className={`${dot} bg-(--plush-pink)`}>
            {/* The note lines sit small in the dot (about 10 x 8 px of ink). */}
            <HugeiconsIcon icon={Menu02Icon} size={16} strokeWidth={2.4} aria-hidden />
          </span>
          Note<span className={value}>{note}</span>
        </div>
      </div>
      <DialogFooter>
        <DialogClose className={sentButton}>
          <HugeiconsIcon icon={Tick02Icon} size={18} strokeWidth={2.4} aria-hidden className="[&_path]:[stroke-linejoin:miter]" />
          Sent
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  )
}

// The sheet tile: the real dialog, open from the start, non-modal (no dim, no focus trap, no scroll lock),
// its portal sent into the tile (DialogContent's `container`), so it stands in the tile and the page stays usable.
// - No autofocus on the first open, so loading the page neither moves focus nor scrolls to the tile; reopening focuses
//   the sheet as usual.
// - Clicks and focus elsewhere on the page leave it open; Escape closes it only while focus is inside it.
// - Tab runs through the sheet and on to the page: Radix keeps Tab looping inside dialog content (its focus scope always
//   loops, also when not modal), so at the sheet's first and last stop the demo moves focus to the page's previous or
//   next stop itself. Inside the sheet Tab works as before.
// - After closing (X or "Sent") the tile shows the "Send to Maya" button in the same place; it brings the sheet back
//   with the sheet's own motion. The sheet sits in the tile's flow instead of fixed in the middle of the window.
const inTile =
  "relative top-auto left-auto z-10 max-w-full translate-x-0 translate-y-0 sm:max-w-full col-start-1 row-start-1 self-center"

const stops = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]'

function tabStops() {
  return [...document.querySelectorAll<HTMLElement>(stops)].filter(
    (el) => el.tabIndex >= 0 && el.checkVisibility({ visibilityProperty: true })
  )
}

// At the sheet's edges Tab leaves the sheet for the page's next (Shift: previous) stop instead of looping.
function passTabOn(e: React.KeyboardEvent<HTMLElement>) {
  if (e.key !== "Tab" || e.altKey || e.ctrlKey || e.metaKey) return
  const all = tabStops()
  const inside = all.filter((el) => e.currentTarget.contains(el))
  const edge = e.shiftKey ? inside[0] : inside.at(-1)
  if (!edge || document.activeElement !== edge) return
  const next = all[all.indexOf(edge) + (e.shiftKey ? -1 : 1)]
  if (!next) return
  e.preventDefault()
  next.focus()
}

// Radix puts two empty spans with tabindex 0 at the edges of <body> while dialog content is mounted (focus guards). This
// sheet is open from page load on, so they were the page's first and last Tab stop, both invisible. Modal layers (the
// detail view, an open list) loop Tab inside themselves without them, so they are kept out of the Tab order.
function useQuietFocusGuards() {
  React.useEffect(() => {
    const quiet = () =>
      document.querySelectorAll<HTMLElement>("[data-radix-focus-guard]").forEach((guard) => {
        if (guard.tabIndex !== -1) guard.tabIndex = -1
      })
    quiet()
    const watch = new MutationObserver(quiet)
    watch.observe(document.body, { childList: true })
    return () => watch.disconnect()
  }, [])
}

export function DialogDemo() {
  const [box, setBox] = React.useState<HTMLDivElement | null>(null)
  const first = React.useRef(true)
  // The sheet shown on load stands still (plush-site-still in globals.css); from the first close on it moves as usual.
  const [still, setStill] = React.useState(true)
  useQuietFocusGuards()
  return (
    <Dialog defaultOpen modal={false} onOpenChange={() => setStill(false)}>
      {/* The sheet is a portal, so it only exists after hydration. Until then the tile shows the "Send to Maya" button
          (hidden only while the box holds an open sheet), and the box keeps the sheet's height, so nothing below moves
          when the sheet rises in. 294 px is the sheet measured at 390 px; a sheet whose text wraps (320 px,
          large fallback font) grows a little past it. */}
      <div ref={setBox} className="group/box grid min-h-[294px] w-full min-w-0 place-items-center self-stretch">
        <DialogTrigger
          // Fades out while the sheet fades in (visibility turns hidden only at the end of the fade), so the tile is never empty.
          className={`${openButton} col-start-1 row-start-1 [transition:scale_var(--plush-dur-spring)_var(--plush-ease-spring),background-color_var(--plush-dur-fast)_var(--plush-ease-fade),opacity_var(--plush-dur-fade)_var(--plush-ease-fade),visibility_var(--plush-dur-fade)_var(--plush-ease-fade)] group-has-[[role=dialog][data-state=open]]/box:invisible group-has-[[role=dialog][data-state=open]]/box:opacity-0`}
        >
          Send to Maya
        </DialogTrigger>
      </div>
      {box && (
        <Sheet
          name="Maya"
          note="Pizza night"
          container={box}
          className={still ? `${inTile} plush-site-still` : inTile}
          onOpenAutoFocus={(e) => {
            if (first.current) e.preventDefault()
            first.current = false
          }}
          onInteractOutside={(e) => e.preventDefault()}
          onKeyDown={passTabOn}
          onEscapeKeyDown={(e) => {
            if (!box.contains(document.activeElement)) e.preventDefault()
          }}
        />
      )}
    </Dialog>
  )
}
