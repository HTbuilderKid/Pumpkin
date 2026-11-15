import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ExclamationMarkIcon } from "@hugeicons/core-free-icons"

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// The round white info button of the tile (44 px, card shadow, squeezes while pressed). Demo only, not part of the
// component. A bare "i": Hugeicons has none (InfoIcon brings a ring), so it is the exclamation mark
// turned upside down, as in sonner.tsx.
const infoButton =
  "grid size-11 shrink-0 place-items-center rounded-(--plush-radius-full) bg-(--plush-surface) text-(length:--plush-text-md) leading-none font-(--plush-weight-semi) text-(--plush-ink) shadow-(--plush-card-shadow) [transition:scale_var(--plush-dur-spring)_var(--plush-ease-spring),box-shadow_var(--plush-dur-fast)_var(--plush-ease-fade)] hover:not-disabled:scale-(--plush-hover-grow) hover:not-disabled:shadow-(--plush-active-shadow) active:not-disabled:scale-(--plush-press-scale) disabled:cursor-not-allowed disabled:opacity-(--plush-disabled-opacity)"

const textButton =
  "min-h-(--plush-h-chip) max-w-full rounded-(--plush-radius-full) bg-(--plush-surface) px-4 py-2 text-(length:--plush-text-md) leading-tight font-(--plush-weight-semi) break-words text-(--plush-ink) shadow-(--plush-card-shadow) [transition:scale_var(--plush-dur-spring)_var(--plush-ease-spring),background-color_var(--plush-dur-fast)_var(--plush-ease-fade),box-shadow_var(--plush-dur-fast)_var(--plush-ease-fade)] hover:shadow-(--plush-active-shadow) active:scale-95"

const sides = [
  ["top", "col-start-2 row-start-1"],
  ["left", "col-start-1 row-start-2"],
  ["right", "col-start-3 row-start-2"],
  ["bottom", "col-start-2 row-start-3"],
] as const

export default function TooltipPreview() {
  return (
    <main className="plush-font flex min-h-screen flex-wrap items-start gap-8 bg-(--plush-bg) p-8 text-(--plush-ink)">
      <TooltipProvider>
        <section
          data-testid="tile"
          className="flex h-[228px] w-[210px] flex-col items-center justify-end rounded-(--plush-radius-panel) bg-(--plush-panel) p-(--plush-pad) pb-[54px]"
        >
          <Tooltip defaultOpen>
            <TooltipTrigger aria-label="Price details" className={infoButton}>
              <HugeiconsIcon icon={ExclamationMarkIcon} size={18} strokeWidth={2.4} className="rotate-180" aria-hidden />
            </TooltipTrigger>
            <TooltipContent sideOffset={4}>Includes 18% tip and tax</TooltipContent>
          </Tooltip>
        </section>

        <section className="grid grid-cols-3 grid-rows-3 place-items-center gap-4 py-14 sm:px-28">
          {sides.map(([side, cell]) => (
            <Tooltip key={side} defaultOpen>
              <TooltipTrigger className={`${textButton} ${cell}`}>{side}</TooltipTrigger>
              <TooltipContent side={side}>Split {side}</TooltipContent>
            </Tooltip>
          ))}
        </section>

        <section className="flex flex-col items-start gap-6 pt-6">
          <Tooltip>
            <TooltipTrigger className={textButton}>Hover or focus</TooltipTrigger>
            <TooltipContent side="bottom" align="start">
              Opens on hover and on focus
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger aria-label="Price details, disabled" className={infoButton} disabled>
              <HugeiconsIcon icon={ExclamationMarkIcon} size={18} strokeWidth={2.4} className="rotate-180" aria-hidden />
            </TooltipTrigger>
            <TooltipContent>Never opens</TooltipContent>
          </Tooltip>
        </section>

        <section
          data-testid="w240"
          className="w-[240px] rounded-(--plush-radius-card) bg-(--plush-surface) p-3 shadow-(--plush-card-shadow)"
        >
          <Tooltip defaultOpen>
            <TooltipTrigger className={`${textButton} w-full bg-(--plush-fill) shadow-none hover:bg-(--plush-fill-strong) hover:shadow-none`}>
              Split the bill by the share each person ordered, including tips and taxes
            </TooltipTrigger>
            <TooltipContent side="bottom">
              Everyone pays for what they ordered, plus an equal part of the 18% tip and the
              Supercalifragilisticexpialidocious-service-charge
            </TooltipContent>
          </Tooltip>
        </section>
      </TooltipProvider>
    </main>
  )
}
