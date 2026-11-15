"use client"

import * as React from "react"

import { HugeiconsIcon } from "@hugeicons/react"
import { Invoice01Icon, Tick02Icon } from "@hugeicons/core-free-icons"

import { Progress } from "@/components/ui/progress"

// One upload: the file (a button: each press moves the upload to its next value), the name, the size so
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
          "[transition:border-radius_var(--plush-dur-spring)_var(--plush-ease-spring),scale_var(--plush-dur-spring)_var(--plush-ease-spring),box-shadow_var(--plush-dur-fade)_var(--plush-ease-fade)]",
          "active:scale-(--plush-press-scale)",
          "before:absolute before:inset-0 before:rounded-[inherit] before:bg-(image:--plush-select-fill) before:shadow-(--plush-select-gloss) before:opacity-0",
          "before:[transition:opacity_var(--plush-dur-slow)_var(--plush-ease-fade)]",
          "group-has-[[data-state=complete]]/upload:rounded-[24px] group-has-[[data-state=complete]]/upload:shadow-none",
          // The badge pops once as it turns green (plush-pop). --plush-pop-armed stays 1 for the length of the pop after a change
          // to complete and is 0 on an upload that loads complete, so that one stays still.
          "[--plush-pop-peak:var(--plush-pop-peak-progress)] [--plush-pop-armed:1] group-has-[[data-state=complete]]/upload:[--plush-pop-armed:0]",
          "group-has-[[data-state=complete]]/upload:animate-[plush-pop_var(--plush-dur-pop)_var(--plush-ease-fade)_calc(2*var(--plush-beat))]",
          "group-has-[[data-state=complete]]/upload:[transition:border-radius_var(--plush-dur-spring)_var(--plush-ease-spring)_calc(2*var(--plush-beat)),scale_var(--plush-dur-spring)_var(--plush-ease-spring),box-shadow_var(--plush-dur-fade)_var(--plush-ease-fade)_calc(2*var(--plush-beat)),--plush-pop-armed_0s_linear_calc(2*var(--plush-beat)_+_var(--plush-dur-pop))]",
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

const card = "rounded-(--plush-radius-card) bg-(--plush-surface) shadow-(--plush-card-shadow)"

export default function ProgressPreview() {
  return (
    <main className="plush-font min-h-screen bg-(--plush-bg) p-8 text-(--plush-ink)">
      <div className="flex flex-col items-start gap-8">
        <div className="flex flex-wrap items-start gap-8">
          <section
            data-tile=""
            className="flex min-h-[228px] w-[211px] max-w-full items-center rounded-(--plush-radius-panel) bg-(--plush-panel) p-(--plush-pad)"
          >
            <Upload name="receipt.jpg" size={2.4} values={[100, 75]} />
          </section>

          <section data-narrow="" className={`w-[240px] px-3.5 py-6 ${card}`}>
            <Upload
              name="receipt-from-the-long-dinner-on-friday-night-at-mayas-place.jpg"
              size={12.8}
              values={[30, 100, 0]}
            />
          </section>
        </div>

        <section className="flex w-[441px] max-w-full flex-col gap-6 px-1">
          <Progress value={0} aria-label="Not started" />
          <Progress value={30} aria-label="30 percent" />
          <Progress value={75} aria-label="75 percent" />
          <Progress value={100} aria-label="Complete" />
          <Progress aria-label="Waiting, amount unknown" />
          <Progress value={3} max={4} aria-label="Three of four" />
        </section>

        {/* Values outside the range are held at its ends; not a number is indeterminate. On the dark tile too. */}
        <section data-testid="states" className="flex w-[441px] max-w-full flex-col gap-6 rounded-(--plush-radius-card) bg-(--plush-accent) px-6 py-6">
          <Progress value={-20} aria-label="Below zero, held at 0" />
          <Progress value={150} aria-label="Above max, held at max" />
          <Progress value={5} max={4} aria-label="Five of four, held at four" />
          <Progress value={Number.NaN} aria-label="Not a number, indeterminate" />
          <Progress value={40} max={0} aria-label="Invalid max, 100 is used" />
        </section>

        <section className={`w-[441px] max-w-full px-6 py-6 ${card}`}>
          <Upload
            name="Photos from the long dinner on Friday night, all of them in full size, so nobody has to ask for them again.zip"
            size={248}
            values={[null, 40, 100]}
            waiting="Waiting for a connection; the upload starts on its own as soon as you are back online and keeps going in the background"
          />
        </section>
      </div>
    </main>
  )
}
