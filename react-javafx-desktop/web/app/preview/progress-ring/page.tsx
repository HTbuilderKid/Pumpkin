"use client"

import * as React from "react"

import { ProgressRing, ProgressRingValue } from "@/components/ui/progress-ring"

const ofTotal = (value: number, max: number) => `${value} of ${max}`

const card = "rounded-(--plush-radius-card) bg-(--plush-surface) shadow-(--plush-card-shadow)"
// The dark tile: --dark is --plush-accent, its text white, the sub line and the ring's track white at .58 and .16.
const darkTile = "bg-(--plush-accent) text-(--plush-on-accent) [--plush-ring-track:var(--plush-on-accent-track)]"

// The ring of the tile with "Paid back" below it.
function Paid({ id, value, sub = "Paid back", subClass = "text-(--plush-ink-2)" }: { id: string; value: number; sub?: string; subClass?: string }) {
  return (
    <div className="flex w-full min-w-0 flex-col items-center text-center">
      <ProgressRing value={value} max={4} aria-labelledby={id} getValueLabel={ofTotal}>
        <ProgressRingValue />/4
      </ProgressRing>
      <p id={id} className={`mt-3 w-full text-(length:--plush-text-md) leading-[normal] font-(--plush-weight-medium) break-words hyphens-auto ${subClass}`}>
        {sub}
      </p>
    </div>
  )
}

export default function ProgressRingPreview() {
  const [paid, setPaid] = React.useState(4)

  return (
    <main className="plush-font min-h-screen bg-(--plush-bg) p-8 text-(--plush-ink)">
      <div className="flex flex-col items-start gap-8">
        <div className="flex max-w-full flex-wrap items-center gap-8">
          <section
            data-tile=""
            className={`flex h-[228px] w-[210px] max-w-full items-center justify-center rounded-(--plush-radius-panel) p-(--plush-pad) ${darkTile}`}
          >
            <Paid id="paid-dark" value={paid} subClass="text-(--plush-on-accent-2)" />
          </section>

          <button
            type="button"
            onClick={() => setPaid((p) => (p % 4) + 1)}
            className="plush-focus-ring inline-flex h-(--plush-h-btn-sm) items-center rounded-(--plush-radius-full) bg-(--plush-accent) px-6 text-(length:--plush-text-lg) font-(--plush-weight-semi) text-(--plush-on-accent) [transition:scale_var(--plush-dur-spring)_var(--plush-ease-spring)] active:scale-(--plush-press-scale-pill)"
          >
            Next payment
          </button>

          <section className="flex h-[228px] w-[210px] max-w-full items-center justify-center rounded-(--plush-radius-panel) bg-(--plush-panel) p-(--plush-pad)">
            <Paid id="paid-light" value={paid} />
          </section>

          {/* Two-digit max: the number rolls 1, 4, 7, 10 of 12 with the button; the slash stays where it is. */}
          <section data-testid="of-twelve" className="flex h-[228px] w-[210px] max-w-full items-center justify-center rounded-(--plush-radius-panel) bg-(--plush-panel) p-(--plush-pad)">
            <ProgressRing value={paid * 3 - 2} max={12} aria-label="Friends who paid back" getValueLabel={ofTotal}>
              <ProgressRingValue />/12
            </ProgressRing>
          </section>
        </div>

        <section className={`flex flex-wrap items-center gap-8 px-6 py-6 ${card}`}>
          <ProgressRing value={0} max={4} aria-label="None paid back" getValueLabel={ofTotal}>
            0/4
          </ProgressRing>
          <ProgressRing value={1} max={4} aria-label="Paid back" getValueLabel={ofTotal}>
            1/4
          </ProgressRing>
          <ProgressRing value={68} aria-label="Upload">
            68%
          </ProgressRing>
          <ProgressRing value={100} aria-label="Done">
            100%
          </ProgressRing>
          <ProgressRing value={null} aria-label="Waiting for the first payment" />
        </section>

        {/* Values outside the range are held at its ends; not a number is indeterminate. */}
        <section data-testid="states" className={`flex flex-wrap items-center gap-8 px-6 py-6 ${card}`}>
          <ProgressRing value={-1} max={4} aria-label="Below zero, held at 0" getValueLabel={ofTotal}>
            -1/4
          </ProgressRing>
          <ProgressRing value={6} max={4} aria-label="Above max, held at max" getValueLabel={ofTotal}>
            6/4
          </ProgressRing>
          <ProgressRing value={Number.NaN} aria-label="Not a number, indeterminate" />
          <ProgressRing value={1250000} max={1000000} aria-label="Large numbers">
            125%
          </ProgressRing>
        </section>

        <section className={`flex flex-wrap items-center gap-8 rounded-(--plush-radius-panel) px-8 py-6 ${darkTile}`}>
          <ProgressRing value={3} max={4} aria-label="Paid back" getValueLabel={ofTotal}>
            3/4
          </ProgressRing>
          <ProgressRing value={2} max={4} aria-label="Paid back" getValueLabel={ofTotal} className="[--plush-ring-size:64px] [--plush-ring-stroke:6px]">
            2/4
          </ProgressRing>
          <ProgressRing value={1} max={4} aria-label="Paid back" className="[--plush-ring-size:32px] [--plush-ring-stroke:4px]" />
        </section>

        <section className="flex flex-wrap items-center gap-8 px-6">
          <ProgressRing value={45} aria-label="Upload" className="[--plush-ring-size:64px] [--plush-ring-stroke:6px]">
            45
          </ProgressRing>
          <ProgressRing value={45} aria-label="Upload" className="[--plush-ring-size:32px] [--plush-ring-stroke:4px]" />
          <ProgressRing value={45} aria-label="Upload" className="[--plush-ring-size:24px] [--plush-ring-stroke:3px]" />
        </section>

        <div className="flex max-w-full flex-wrap items-start gap-8">
          <section data-narrow="" className={`flex w-[240px] flex-col items-center gap-8 px-4 py-6 ${card}`}>
            <Paid id="paid-narrow" value={3} sub="Paid back by every friend who came to the long dinner on Friday night, rounded up" />
            <ProgressRing value={11} max={12} aria-label="Friends who paid back" getValueLabel={ofTotal}>
              <span className="block text-(length:--plush-text-md)">Eleven of twelve friends paid back</span>
            </ProgressRing>
          </section>

          <section className={`flex w-[441px] max-w-full flex-col items-center px-6 py-6 ${card}`}>
            <Paid
              id="paid-long"
              value={2}
              sub="Paid back by everyone who joined the long dinner on Friday night, each share rounded up to the next whole amount and sent straight to your account"
            />
          </section>
        </div>
      </div>
    </main>
  )
}
