"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowUpRight01Icon, Cancel01Icon } from "@hugeicons/core-free-icons"
import { Dialog } from "radix-ui"

import { cn } from "@/lib/utils"
import { addCommand, CommandText, tiles, type CatalogEntry, type TileSpec } from "@/components/site/catalog"
import { CopyButton } from "@/components/site/copy-button"

export type Source = { path: string; code: string; description?: string }

const openAnim =
  "data-[state=open]:animate-[plush-fade-in_var(--plush-dur-fade)_var(--plush-ease-fade),plush-rise-in_var(--plush-dur-spring)_var(--plush-ease-spring)] data-[state=closed]:animate-[plush-fade-out_var(--plush-dur-fade)_var(--plush-ease-fade),plush-rise-out_var(--plush-dur-fade)_var(--plush-ease-fade)]"

const toneClass = {
  panel: "bg-(--plush-panel)",
  surface: "bg-(--plush-surface) shadow-(--plush-card-shadow)",
  tint: "bg-(--plush-panel-tint)",
  // The dark tile: black, white text, the ring's track in white. The light focus ring (plush-on-dark) goes on the
  // demo's box only: the name pill on the tile's edge is white and keeps the dark ring.
  dark: "bg-(--plush-accent) text-(--plush-on-accent) [--plush-ring-track:var(--plush-on-accent-track)]",
}

/** The page's grid: one tile per catalog tile (fixed places on the wide grids, dense packing below them). */
export function Bento({ url, sources }: { url: string; sources: Record<string, Source> }) {
  return (
    <div className="plush-site-grid">
      {tiles.map(({ entry, tile }) => (
        <Tile key={tile.id} entry={entry} tile={tile} url={url} sources={sources} />
      ))}
    </div>
  )
}

function Tile({ entry, tile, url, sources }: { entry: CatalogEntry; tile: TileSpec; url: string; sources: Record<string, Source> }) {
  const source = sources[entry.name]
  // Ready only when there is a registry item: otherwise the install command would point at nothing.
  const Demo = source ? tile.demo : undefined
  const style = {
    "--plush-c": tile.cols,
    "--plush-c2": tile.cols2 ?? tile.cols,
    "--plush-r": tile.rows,
    "--plush-x": tile.at[0],
    "--plush-y": tile.at[1],
    "--plush-x6": tile.at6[0],
    "--plush-y6": tile.at6[1],
    "--plush-x4": tile.at4[0],
    "--plush-y4": tile.at4[1],
    "--plush-r8": tile.at[2] ?? tile.rows,
    "--plush-r6": tile.at6[2] ?? tile.rows,
    "--plush-r4": tile.at4[2] ?? tile.rows,
  } as React.CSSProperties

  return (
    <section
      aria-label={entry.title}
      data-ready={Demo ? "true" : "false"}
      data-tile={tile.id}
      data-tone={tile.tone ?? "panel"}
      data-cols={tile.cols}
      style={style}
      className={cn(
        "plush-site-tile group/tile flex flex-col gap-4 rounded-(--plush-radius-panel) p-(--plush-pad)",
        // The tile itself has no hover: only its name pill shows up (globals.css .plush-site-label).
        toneClass[tile.tone ?? "panel"]
      )}
    >
      <div className={cn("flex min-h-0 min-w-0 flex-1 items-center justify-center", tile.tone === "dark" && "plush-on-dark")}>
        {Demo ? <Demo /> : null}
      </div>

      {Demo && source ? (
        <>
          {/* Name and copy: on the wide grid a small pill on the tile's lower edge, shown on hover and focus (it sits
              half in the gap, so it covers no control); on phones and touch screens always there, under the demo. */}
          <div className="plush-site-label flex min-w-0 items-center gap-1">
            <Detail entry={entry} tile={tile} url={url} sources={sources} />
            <CopyButton className="ml-auto" text={addCommand(url, entry.name)} label={`copy install command for ${entry.name}`} />
          </div>
          <code className="plush-site-cmd plush-site-code -mt-3 text-[12px] leading-[1.45] text-(--plush-ink-2)"><CommandText command={addCommand(url, entry.name)} /></code>
        </>
      ) : (
        <div className="flex min-w-0 items-center gap-2">
          <span className="min-w-0 text-[15px] font-(--plush-weight-semi) break-words text-(--plush-ink-2)">{entry.name}</span>
          <span className="rounded-(--plush-radius-full) bg-(--plush-surface) px-2.5 py-1 text-[12px] leading-none font-(--plush-weight-semi) text-(--plush-ink-3)">
            coming
          </span>
        </div>
      )}
    </section>
  )
}

/** Install command and source of one registry item, as in the detail view. */
function ItemCode({ name, url, source }: { name: string; url: string; source: Source }) {
  const command = addCommand(url, name)
  return (
    <>
      <div className="flex min-w-0 items-center gap-3 rounded-(--plush-radius-sheet) bg-(--plush-accent) py-2 pr-2 pl-5 text-(--plush-on-accent) plush-on-dark">
        <code className="plush-site-code min-w-0 flex-1 py-1.5 text-[13px] leading-[1.45]"><CommandText command={command} /></code>
        <CopyButton text={command} label={`copy install command for ${name}`} tone="dark" />
      </div>

      <div className="flex min-w-0 flex-col rounded-(--plush-radius-card) bg-(--plush-panel)">
        <div className="flex min-w-0 items-center gap-3 py-2 pr-2 pl-5">
          <span className="plush-site-code min-w-0 flex-1 text-[13px] text-(--plush-ink-2)">{source.path}</span>
          <CopyButton text={source.code} label={`copy source of ${name}`} />
        </div>
        <pre
          tabIndex={0}
          aria-label={`source of ${name}`}
          className="plush-focus-ring plush-site-code mx-2 mb-2 max-h-[min(420px,50vh)] overflow-auto rounded-(--plush-radius-row) bg-(--plush-surface) p-4 text-[12px] leading-[1.6] whitespace-pre text-(--plush-ink)"
        >
          {source.code}
        </pre>
      </div>
    </>
  )
}

// Which detail view is open lives in history.state (the tile id), not in React state: opening pushes an entry with the
// same URL (Next's own state is copied along), so the browser's Back button closes the view instead of leaving the page,
// and closing in the view goes back one entry. `leaving` covers the moment between history.back() and its popstate:
// a second close is ignored and an open asked for meanwhile follows once the old entry is gone.
const tabStops = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]'
const detailListeners = new Set<() => void>()
let leaving = false
let pending: string | null = null
const openDetailId = (): string | null => window.history.state?.plushDetail ?? null
const notifyDetail = () => detailListeners.forEach((l) => l())
function onDetailPop() {
  leaving = false
  if (pending) pushDetail(pending)
  pending = null
  notifyDetail()
}
function subscribeDetail(l: () => void) {
  if (detailListeners.size === 0) window.addEventListener("popstate", onDetailPop)
  detailListeners.add(l)
  return () => {
    detailListeners.delete(l)
    if (detailListeners.size === 0) window.removeEventListener("popstate", onDetailPop)
  }
}
function pushDetail(id: string) {
  window.history.pushState({ ...window.history.state, plushDetail: id }, "")
  notifyDetail()
}
function setDetail(id: string | null) {
  if (leaving) {
    pending = id
    return
  }
  const open = openDetailId()
  if (id === open) return
  if (open) {
    leaving = true
    pending = id
    window.history.back()
  } else if (id) pushDetail(id)
}

function Detail({ entry, tile, url, sources }: { entry: CatalogEntry; tile: TileSpec; url: string; sources: Record<string, Source> }) {
  const source = sources[entry.name]
  const open = React.useSyncExternalStore(subscribeDetail, () => openDetailId() === tile.id, () => false)
  const openedAt = React.useRef(0)
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        if (next) openedAt.current = performance.now()
        setDetail(next ? tile.id : null)
      }}
    >
      <Dialog.Trigger asChild>
        <button
          type="button"
          data-detail={tile.id}
          // A flat text button: under the pointer its face tints one step (--plush-site-name-hover, see globals.css) and the
          // grey arrow turns ink; nothing moves.
          className="group/name plush-focus-ring inline-flex min-h-9 max-w-full min-w-0 items-center gap-1 rounded-(--plush-radius-full) px-3 text-left text-[15px] font-(--plush-weight-semi) break-words text-(--plush-ink) [transition:background-color_var(--plush-dur-fast)_var(--plush-ease-fade)] hover:bg-(--plush-site-name-hover,var(--plush-fill-strong))"
        >
          <span className="min-w-0">{entry.name}</span>
          <HugeiconsIcon icon={ArrowUpRight01Icon} size={16} strokeWidth={2.4} aria-hidden className="size-4 shrink-0 text-(--plush-ink-3) [transition:color_var(--plush-dur-fast)_var(--plush-ease-fade)] group-hover/name:text-(--plush-ink)" />
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            "plush-font fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-(--plush-bg)/75 p-4 text-(--plush-ink) backdrop-blur-[6px] sm:p-8",
            "data-[state=open]:animate-[plush-fade-in_var(--plush-dur-fade)_var(--plush-ease-fade)] data-[state=closed]:animate-[plush-fade-out_var(--plush-dur-fade)_var(--plush-ease-fade)]"
          )}
        >
          <Dialog.Content
            // A double click on the name: the second click lands on the backdrop of the view it just opened; keep it open.
            onPointerDownOutside={(e) => {
              if (performance.now() - openedAt.current < 500) e.preventDefault()
            }}
            // Radix hands Escape only to the topmost layer, which inside the view can be the demo's open bubble or its
            // non-modal sheet (whose own handler keeps it open while focus is elsewhere). Then the view closes here,
            // unless focus sits inside that nested sheet, where Escape belongs to the sheet.
            onKeyDown={(e) => {
              if (e.key === "Escape" && (e.target as Element).closest('[role="dialog"]') === e.currentTarget) setDetail(null)
              // The dialog demo's own sheet (a non-modal dialog) pauses Radix's focus trap of this view while it is open,
              // so Tab would walk out onto the page behind the backdrop. The view loops Tab at its edges itself.
              if (e.key === "Tab" && !e.defaultPrevented && !e.altKey && !e.ctrlKey && !e.metaKey) {
                const stops = [...e.currentTarget.querySelectorAll<HTMLElement>(tabStops)].filter(
                  (el) => el.tabIndex >= 0 && el.checkVisibility({ visibilityProperty: true })
                )
                const edge = e.shiftKey ? stops[0] : stops.at(-1)
                if (edge && document.activeElement === edge) {
                  e.preventDefault()
                  ;(e.shiftKey ? stops.at(-1) : stops[0])?.focus()
                }
              }
            }}
            className={cn(
              "plush-font flex w-full max-w-[880px] min-w-0 flex-col gap-4 rounded-(--plush-radius-panel) bg-(--plush-bg) p-4 shadow-[var(--plush-shadow-soft),0_24px_64px_color-mix(in_srgb,var(--plush-ink)_10%,transparent)] sm:p-6",
              openAnim
            )}
          >
            <div className="flex items-start gap-3 px-1">
              <div className="min-w-0 flex-1">
                <Dialog.Title className="lowercase text-[20px] leading-tight font-(--plush-weight-semi) break-words">{entry.title}</Dialog.Title>
                <Dialog.Description className="mt-1 lowercase text-[14px] font-(--plush-weight-medium) break-words text-(--plush-ink-2)">
                  {source.description ?? entry.name}
                </Dialog.Description>
              </div>
              <Dialog.Close asChild>
                <button
                  type="button"
                  aria-label="close"
                  // A round icon button: one step darker, its glyph ink, and it grows a little on the spring; it gives while pressed.
                  className="plush-focus-ring grid size-9 shrink-0 place-items-center rounded-(--plush-radius-full) bg-(--plush-panel) text-(--plush-ink-2) [transition:background-color_var(--plush-dur-fast)_var(--plush-ease-fade),color_var(--plush-dur-fast)_var(--plush-ease-fade),scale_var(--plush-dur-spring)_var(--plush-ease-spring)] hover:not-active:scale-(--plush-hover-grow) active:scale-(--plush-press-scale) hover:bg-(--plush-fill-strong) hover:text-(--plush-ink)"
                >
                  <HugeiconsIcon icon={Cancel01Icon} size={16} strokeWidth={2.4} aria-hidden className="size-4" />
                </button>
              </Dialog.Close>
            </div>

            {entry.tiles.map((tile) => (
              <div
                key={tile.id}
                className={cn(
                  "flex min-w-0 items-center justify-center rounded-(--plush-radius-card) p-6 sm:p-10",
                  // The main tile gets the room of the old single demo; a second tile only what it needs.
                  tile === entry.tiles[0] && "min-h-[280px] sm:min-h-[340px]",
                  toneClass[tile.tone ?? "panel"],
                  tile.tone === "dark" && "plush-on-dark"
                )}
              >
                <tile.demo />
              </div>
            ))}

            <ItemCode name={entry.name} url={url} source={source} />

          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
