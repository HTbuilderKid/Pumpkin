"use client"

import * as React from "react"

import { HugeiconsIcon } from "@hugeicons/react"
import { Invoice01Icon, Tick02Icon } from "@hugeicons/core-free-icons"

import { Progress } from "@/components/ui/progress"

// The upload tile (content from app/preview/progress), one upload: the file (a button: each press moves the upload to its next value), the name, the size so
// far or "Uploaded", the bar. When the bar's data-state turns complete, the file turns into a round green badge with a
// tick, two beats later, as the bar arrives; going back, it turns into the file at once.
function Upload({
  name,
  size,
  values,
  waiting = "Waiting to start",
}: {
  name: string
  size: number
  values: (number | null)[]
  waiting?: string
}) {
  const [step, setStep] = React.useState(0)
  const value = values[step]
  const id = React.useId()
  const done = value === 100

  return (
    <div className="group/upload w-full min-w-0 px-1.5">
      <button
        type="button"
        aria-label={done ? `Upload ${name} again` : `Continue uploading ${name}`}
        onClick={() => setStep((step + 1) % values.length)}
        className={[
          "group/file plush-focus-ring relative mb-3.5 grid size-12 cursor-pointer place-items-center rounded-(--plush-radius-row) bg-(--plush-surface) text-(--plush-ink) shadow-(--plush-card-shadow)",
          "[transition:border-radius_var(--plush-dur-spring)_var(--plush-ease-spring),scale_var(--plush-dur-spring)_var(--plush-ease-spring),box-shadow_var(--plush-dur-fast)_var(--plush-ease-fade),filter_var(--plush-dur-fast)_var(--plush-ease-fade)]",
          "active:scale-(--plush-press-scale)",
          // Hover: the white file keeps its face and gets the stronger shadow; the green badge only gets a little brighter.
          // No growing: the pop and the press already own its scale.
          "hover:shadow-(--plush-active-shadow) group-has-[[data-state=complete]]/upload:hover:shadow-none group-has-[[data-state=complete]]/upload:hover:brightness-(--plush-hover-bright)",
          "before:absolute before:inset-0 before:rounded-[inherit] before:bg-(image:--plush-select-fill) before:shadow-(--plush-select-gloss) before:opacity-0",
          "before:[transition:opacity_var(--plush-dur-slow)_var(--plush-ease-fade)]",
          "group-has-[[data-state=complete]]/upload:rounded-[24px] group-has-[[data-state=complete]]/upload:shadow-none",
          // The badge pops once as it turns green (plush-pop). --plush-pop-armed stays 1 for the length of the pop after a change
          // to complete and is 0 on an upload that loads complete, so that one stays still.
          "[--plush-pop-peak:var(--plush-pop-peak-progress)] [--plush-pop-armed:1] group-has-[[data-state=complete]]/upload:[--plush-pop-armed:0]",
          "group-has-[[data-state=complete]]/upload:animate-[plush-pop_var(--plush-dur-pop)_var(--plush-ease-fade)_calc(2*var(--plush-beat))]",
          "group-has-[[data-state=complete]]/upload:[transition:border-radius_var(--plush-dur-spring)_var(--plush-ease-spring)_calc(2*var(--plush-beat)),scale_var(--plush-dur-spring)_var(--plush-ease-spring),box-shadow_var(--plush-dur-fade)_var(--plush-ease-fade)_calc(2*var(--plush-beat)),filter_var(--plush-dur-fast)_var(--plush-ease-fade),--plush-pop-armed_0s_linear_calc(2*var(--plush-beat)_+_var(--plush-dur-pop))]",
          "group-has-[[data-state=complete]]/upload:before:opacity-100",
          "group-has-[[data-state=complete]]/upload:before:[transition:opacity_var(--plush-dur-slow)_var(--plush-ease-fade)_calc(2*var(--plush-beat))]",
        ].join(" ")}
      >
        <HugeiconsIcon
          icon={Invoice01Icon}
          size={22}
          strokeWidth={2.4}
          aria-hidden
          className={[
            "relative col-start-1 row-start-1",
            "[transition:opacity_var(--plush-dur-fade)_var(--plush-ease-fade),rotate_var(--plush-dur-spring)_var(--plush-ease-spring),scale_var(--plush-dur-spring)_var(--plush-ease-spring)]",
            "group-has-[[data-state=complete]]/upload:scale-50 group-has-[[data-state=complete]]/upload:-rotate-30 group-has-[[data-state=complete]]/upload:opacity-0",
            "group-has-[[data-state=complete]]/upload:[transition:opacity_var(--plush-dur-fade)_var(--plush-ease-fade)_calc(2*var(--plush-beat)),rotate_var(--plush-dur-spring)_var(--plush-ease-spring)_calc(2*var(--plush-beat)),scale_var(--plush-dur-spring)_var(--plush-ease-spring)_calc(2*var(--plush-beat))]",
          ].join(" ")}
        />
        <HugeiconsIcon
          icon={Tick02Icon}
          size={20}
          strokeWidth={2.4}
          aria-hidden
          className={[
            "[&_path]:[stroke-linejoin:miter]",
            "relative col-start-1 row-start-1 scale-60 text-(--plush-on-select) opacity-0 [clip-path:inset(0_90%_0_0)]",
            "[transition:opacity_var(--plush-dur-fade)_var(--plush-ease-fade),scale_var(--plush-dur-spring)_var(--plush-ease-spring),clip-path_var(--plush-dur-fade)_var(--plush-ease-fade)]",
            "group-has-[[data-state=complete]]/upload:scale-100 group-has-[[data-state=complete]]/upload:opacity-100 group-has-[[data-state=complete]]/upload:[clip-path:inset(0_0_0_0)]",
            "group-has-[[data-state=complete]]/upload:[transition:opacity_var(--plush-dur-fade)_var(--plush-ease-fade)_calc(2*var(--plush-beat)_+_var(--plush-stagger)),scale_var(--plush-dur-spring)_var(--plush-ease-spring)_calc(2*var(--plush-beat)_+_var(--plush-stagger)),clip-path_var(--plush-dur-slow)_var(--plush-ease-fade)_calc(2*var(--plush-beat)_+_2*var(--plush-stagger))]",
          ].join(" ")}
        />
      </button>
      <p id={id} className="text-(length:--plush-text-xl) leading-[normal] font-(--plush-weight-semi) break-words">
        {name}
      </p>
      <p className="mt-[3px] text-(length:--plush-text-sm) leading-[normal] font-(--plush-weight-medium) break-words text-(--plush-ink-2)">
        {value === null ? waiting : done ? "Uploaded" : `${((size * value) / 100).toFixed(1)} of ${size} MB`}
      </p>
      <Progress value={value} aria-labelledby={id} className="mt-3.5" />
    </div>
  )
}

export function ProgressDemo() {
  return <Upload name="receipt.jpg" size={2.4} values={[100, 75]} />
}
