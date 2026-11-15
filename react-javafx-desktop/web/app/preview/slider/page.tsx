"use client"

import * as React from "react"

import { Slider } from "@/components/ui/slider"

// The slider of the tile: "Tip" on the left, the value on the right, the slider below.
function Tip({
  label,
  unit = "%",
  defaultValue,
  ...props
}: Omit<React.ComponentProps<typeof Slider>, "value" | "onValueChange"> & {
  label: string
  unit?: string
  defaultValue: number[]
}) {
  const [value, setValue] = React.useState(defaultValue)
  return (
    <div className="w-full px-1">
      <div className="mb-3 flex justify-between gap-3 text-(--plush-text-lg) leading-[normal] font-(--plush-weight-semi)">
        <span className="min-w-0 break-words hyphens-auto">{label}</span>
        <span className="shrink-0">{value.map((v) => v + unit).join(" – ")}</span>
      </div>
      <Slider value={value} onValueChange={setValue} {...props} />
    </div>
  )
}

const card = "rounded-(--plush-radius-card) bg-(--plush-surface) shadow-(--plush-card-shadow)"

export default function SliderPreview() {
  return (
    <main className="plush-font min-h-screen bg-(--plush-bg) p-8 text-(--plush-ink)">
      <div className="flex flex-col items-start gap-8">
        <div className="flex max-w-full flex-wrap items-start gap-8">
          <section
            data-tile=""
            className="flex h-[104px] w-[441px] max-w-full items-center rounded-(--plush-radius-panel) bg-(--plush-panel) p-(--plush-pad)"
          >
            <Tip label="Tip" defaultValue={[28]} max={30} step={1} />
          </section>

          <section data-narrow="" className={`flex w-[240px] flex-col gap-8 px-4 py-6 ${card}`}>
            <Tip label="Tip for the whole table, shared by everyone who came" defaultValue={[18]} max={30} step={1} />
            <Tip label="Split" defaultValue={[20, 80]} />
          </section>
        </div>

        <section className="flex w-[441px] max-w-full flex-col gap-10 px-1">
          <Slider defaultValue={[50]} max={100} step={1} />
          <Slider defaultValue={[25, 75]} max={100} step={1} />
          <Slider defaultValue={[50]} max={100} step={1} disabled />
          <Slider defaultValue={[25, 75]} max={100} step={1} disabled />
        </section>

        <section className="flex h-40 items-stretch gap-12 px-6">
          <Slider defaultValue={[50]} max={100} step={1} orientation="vertical" />
          <Slider defaultValue={[25, 75]} max={100} step={1} orientation="vertical" />
          <Slider defaultValue={[50]} max={100} step={1} orientation="vertical" disabled />
        </section>

        <section className={`w-[441px] max-w-full px-6 py-6 ${card}`}>
          <Tip
            label="Tip for everyone who joined the long dinner on Friday night, rounded up to the next whole amount and split evenly"
            defaultValue={[12]}
            max={30}
            step={1}
          />
        </section>

        <section data-states="" className="flex w-[441px] max-w-full flex-col gap-10 px-1">
          <Slider data-case="meet" defaultValue={[50, 50]} />
          <Slider data-case="inverted" defaultValue={[30]} inverted />
          <Slider data-case="step-over" defaultValue={[0]} max={10} step={20} />
          <Slider data-case="negative" defaultValue={[-20, 10]} min={-50} max={50} />
          <div dir="rtl">
            <Slider data-case="rtl" dir="rtl" defaultValue={[30]} />
          </div>
          <form data-case="form" className="flex items-center gap-6">
            <Slider name="tip" defaultValue={[10]} max={30} />
            <button type="reset" className="plush-focus-ring shrink-0 rounded-(--plush-radius-full) bg-(--plush-fill) px-4 py-2">
              Reset
            </button>
          </form>
        </section>

        <div className="flex max-w-full flex-wrap items-start gap-8">
          <section data-narrow="160" className={`w-[160px] px-3 py-6 ${card}`}>
            <Tip label="Tip" defaultValue={[28]} max={30} step={1} />
          </section>
          <section
            data-dark=""
            className="w-[240px] rounded-(--plush-radius-card) bg-(--plush-accent) px-4 py-6 text-(--plush-on-accent)"
          >
            <Tip label="Tip" defaultValue={[20, 80]} />
          </section>
          <section className="flex h-40 items-stretch gap-12 px-6">
            <Slider data-case="vertical-inverted" defaultValue={[30]} orientation="vertical" inverted />
            <Slider data-case="vertical-meet" defaultValue={[50, 50]} orientation="vertical" />
          </section>
        </div>
      </div>
    </main>
  )
}
