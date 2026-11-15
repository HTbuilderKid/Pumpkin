"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Cancel01Icon, Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"

// navigator.clipboard only exists in a secure context (https, localhost). Over plain http on a LAN or
// Tailscale address it is missing, so the old textarea + execCommand path is the fallback.
async function copyText(text: string, from: HTMLElement): Promise<boolean> {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text)
      return true
    } catch {
      // permission refused: try the fallback below
    }
  }
  // Next to the button, not in <body>: inside a dialog the focus trap would pull focus back and lose the selection.
  const area = document.createElement("textarea")
  area.value = text
  area.setAttribute("readonly", "")
  area.style.cssText = "position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none"
  ;(from.parentElement ?? document.body).appendChild(area)
  area.select()
  let ok = false
  try {
    ok = document.execCommand("copy")
  } catch {
    ok = false
  }
  area.remove()
  from.focus()
  return ok
}

type State = "idle" | "copied" | "failed"

export function CopyButton({
  text,
  label,
  tone = "light",
  className,
}: {
  text: string
  /** Accessible name, e.g. "copy install command for switch" */
  label: string
  tone?: "light" | "dark"
  className?: string
}) {
  const [state, setState] = React.useState<State>("idle")
  // Every press restarts the 1.6 s before the button returns to idle (a second "copied" alone would not).
  const [press, setPress] = React.useState(0)
  const [selected, setSelected] = React.useState(false)

  React.useEffect(() => {
    if (state === "idle") return
    const t = window.setTimeout(() => setState("idle"), state === "failed" ? 2400 : 1600)
    return () => window.clearTimeout(t)
  }, [state, press])

  async function copy(button: HTMLButtonElement) {
    const ok = await copyText(text, button)
    setPress((n) => n + 1)
    setState(ok ? "copied" : "failed")
    // When copying fails, the command written next to the button (page head, detail view) is selected for Cmd+C.
    const code = ok ? null : button.parentElement?.querySelector("code")
    if (code && code.textContent === text) {
      const range = document.createRange()
      range.selectNodeContents(code)
      window.getSelection()?.removeAllRanges()
      window.getSelection()?.addRange(range)
    }
    setSelected(!!code)
  }

  return (
    <>
      <button
        type="button"
        data-state={state}
        aria-label={label}
        onClick={(e) => copy(e.currentTarget)}
        className={cn(
          "group/copy plush-focus-ring inline-flex h-9 min-w-9 shrink-0 items-center justify-center rounded-(--plush-radius-full) px-2.5 text-[14px] font-(--plush-weight-semi)",
          "transition-[background-color,color,box-shadow] duration-(--plush-dur-fast) ease-(--plush-ease-fade)",
          // Hover: white keeps its face and gets the stronger shadow (on a dark tile, where no shadow shows, the face tints
          // one step: --plush-surface-hover, grey under plush-on-dark); black turns --plush-accent-hover, red --plush-danger-hover.
          tone === "light"
            ? "bg-(--plush-surface) text-(--plush-ink) shadow-(--plush-shadow-soft) hover:shadow-(--plush-active-shadow) hover:data-[state=idle]:bg-(--plush-surface-hover) data-[state=copied]:bg-(--plush-accent) data-[state=copied]:text-(--plush-on-accent) hover:data-[state=copied]:bg-(--plush-accent-hover)"
            : // The see-through white on the black bar takes one step more white (--plush-on-accent-track-hover).
              "bg-(--plush-on-accent-track) text-(--plush-on-accent) hover:not-data-[state=failed]:bg-(--plush-on-accent-track-hover)",
          // Failed: the button turns red with a white cross (and the word, on the light buttons), on either tone.
          "data-[state=failed]:bg-(--plush-danger) data-[state=failed]:text-(--plush-on-accent) hover:data-[state=failed]:bg-(--plush-danger-hover)",
          className
        )}
      >
        {/* One fixed 16 px cell (grid-cols-1 grid-rows-1): with implicit auto tracks the 20 px tick badge widened the
            track to 20 px inside the 16 px slot, which pushed the copy icon 2 px right and 2 px down. */}
        <span className="grid size-4 shrink-0 grid-cols-1 grid-rows-1 place-items-center *:[grid-area:1/1]">
          <HugeiconsIcon
            icon={Copy01Icon}
            size={16}
            strokeWidth={2.4}
            aria-hidden
            className="plush-site-pop size-4 group-data-[state=copied]/copy:scale-50 group-data-[state=copied]/copy:opacity-0 group-data-[state=failed]/copy:scale-50 group-data-[state=failed]/copy:opacity-0"
          />
          <span
            aria-hidden
            className="plush-site-pop grid size-5 scale-50 place-items-center rounded-(--plush-radius-full) bg-(--plush-success) text-(--plush-on-accent) opacity-0 group-data-[state=copied]/copy:scale-100 group-data-[state=copied]/copy:opacity-100"
          >
            <HugeiconsIcon icon={Tick02Icon} size={14} strokeWidth={2.4} aria-hidden className="size-3.5 [&_path]:[stroke-linejoin:miter]" />
          </span>
          <HugeiconsIcon
            icon={Cancel01Icon}
            size={16}
            strokeWidth={2.4}
            aria-hidden
            className="plush-site-pop size-4 scale-50 opacity-0 group-data-[state=failed]/copy:scale-100 group-data-[state=failed]/copy:opacity-100"
          />
        </span>
        {/* On the dark pills the button sits next to the command, so it only swaps its icon and never grows. */}
        {tone === "light" && <span
          aria-hidden
          className="plush-site-reveal max-w-0 overflow-hidden whitespace-nowrap opacity-0 group-data-[state=copied]/copy:ml-1.5 group-data-[state=copied]/copy:max-w-[4.5em] group-data-[state=copied]/copy:opacity-100 group-data-[state=failed]/copy:ml-1.5 group-data-[state=failed]/copy:max-w-[4.5em] group-data-[state=failed]/copy:opacity-100"
        >
          {state === "failed" ? "failed" : "copied"}
        </span>}
      </button>
      <span role="status" className="sr-only">
        {state === "copied"
          ? "copied"
          : state === "failed"
            ? selected
              ? "copy failed, the command is selected, copy it with the keyboard"
              : "copy failed, open the detail view to select the command"
            : ""}
      </span>
    </>
  )
}
