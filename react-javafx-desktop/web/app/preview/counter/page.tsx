"use client"

import * as React from "react"

import { Counter, CounterDecrement, CounterIncrement, CounterValue } from "@/components/ui/counter"

const usd = { style: "currency", currency: "USD" } as const
const percent = { style: "percent" } as const
const eur = { style: "currency", currency: "EUR" } as const
const jpy = { style: "currency", currency: "JPY" } as const

// The People tile: title, line below, the counter.
function People({
  title = "People",
  sub = "at the table",
  ...props
}: React.ComponentProps<typeof Counter> & { title?: string; sub?: string }) {
  const id = React.useId()
  return (
    <div className="flex w-full min-w-0 flex-col items-center text-center">
      <p id={`${id}-t`} className="text-(length:--plush-text-xl) leading-(--plush-leading) font-(--plush-weight-semi) break-words hyphens-auto">
        {title}
      </p>
      <p id={`${id}-s`} className="mt-[3px] text-(length:--plush-text-sm) leading-(--plush-leading) font-(--plush-weight-medium) break-words text-(--plush-ink-2)">
        {sub}
      </p>
      <Counter className="mt-3.5" {...props}>
        <CounterDecrement />
        <CounterValue aria-labelledby={`${id}-t ${id}-s`} />
        <CounterIncrement />
      </Counter>
    </div>
  )
}

// The amount tile: label, the big amount between the buttons, the total for the table below (follows the value).
function Share({ label = "Your share", ways = 4, defaultValue = 24, ...props }: React.ComponentProps<typeof Counter> & { label?: string; ways?: number }) {
  const id = React.useId()
  const [value, setValue] = React.useState(defaultValue)
  return (
    <div className="flex w-full min-w-0 flex-col justify-center text-center">
      <p id={id} className="text-(length:--plush-text-md) leading-(--plush-leading) font-(--plush-weight-medium) break-words text-(--plush-ink-2)">
        {label}
      </p>
      <Counter
        size="lg"
        variant="secondary"
        value={value}
        onValueChange={setValue}
        min={0}
        step={6}
        formatOptions={usd}
        className="mt-2.5 mb-2"
        {...props}
      >
        <CounterDecrement />
        <CounterValue aria-labelledby={id} />
        <CounterIncrement />
      </Counter>
      <p className="text-(length:--plush-text-md) leading-(--plush-leading) font-(--plush-weight-medium) break-words text-(--plush-ink-3)">
        Split {ways} ways, ${value * ways} total
      </p>
    </div>
  )
}

const card = "rounded-(--plush-radius-card) bg-(--plush-surface) shadow-(--plush-card-shadow)"

export default function CounterPreview() {
  return (
    <main className="plush-font min-h-screen bg-(--plush-bg) p-8 text-(--plush-ink)">
      <div className="flex flex-col items-start gap-8">
        <div className="flex flex-wrap items-start gap-8">
          <section
            data-tile=""
            className="flex h-[228px] w-[211px] max-w-full items-center justify-center rounded-(--plush-radius-panel) bg-(--plush-panel) p-(--plush-pad)"
          >
            <People defaultValue={4} min={1} max={12} />
          </section>

          <section
            data-tile="amount"
            className="flex h-[228px] w-[441px] max-w-full rounded-(--plush-radius-panel) bg-(--plush-surface) p-6 shadow-(--plush-card-shadow)"
          >
            <Share />
          </section>
        </div>

        <div className="flex flex-wrap items-start gap-8">
          <section className={`flex w-[211px] max-w-full px-4 py-6 ${card}`}>
            <People title="On a card" sub="grey buttons" variant="secondary" defaultValue={2} min={1} max={12} />
          </section>
          <section className={`flex w-[211px] max-w-full px-4 py-6 ${card}`}>
            <People title="At the minimum" sub="minus is off" defaultValue={1} min={1} max={12} />
          </section>
          <section className={`flex w-[211px] max-w-full px-4 py-6 ${card}`}>
            <People title="At the maximum" sub="plus is off" defaultValue={12} min={1} max={12} />
          </section>
          <section className={`flex w-[211px] max-w-full px-4 py-6 ${card}`}>
            <People title="Disabled" sub="no keys, no buttons" defaultValue={4} disabled />
          </section>
          <section className={`flex w-[211px] max-w-full px-4 py-6 ${card}`}>
            <People title="Tip" sub="5 % steps" defaultValue={0.15} min={0} max={0.3} step={0.05} formatOptions={percent} />
          </section>
          <section className={`flex w-[211px] max-w-full px-4 py-6 ${card}`}>
            <People title="Points" sub="50 at a time" defaultValue={1250} step={50} />
          </section>
        </div>

        <section data-narrow="" className={`flex w-[240px] flex-col gap-8 px-4 py-6 ${card}`}>
          <People
            title="Everyone who is staying for dessert and the late train home"
            sub="including the two who said they might come after work"
            defaultValue={9}
            min={0}
            max={99}
          />
          <Share label="Your share of the long dinner on Friday night, rounded up" ways={12} defaultValue={1236} />
        </section>

        <div data-states="" className="flex flex-wrap items-start gap-8">
          <section data-case="negative" className={`flex w-[211px] max-w-full px-4 py-6 ${card}`}>
            <People title="Below zero" sub="from 1 down to -10" defaultValue={1} min={-10} max={10} />
          </section>
          <section data-case="big" className={`flex w-[211px] max-w-full px-4 py-6 ${card}`}>
            <People title="Nine digits" sub="steps of one" defaultValue={123456789} />
          </section>
          <section data-case="huge" className={`flex w-[211px] max-w-full px-4 py-6 ${card}`}>
            <People title="Ten digits" sub="about to roll over" defaultValue={9999999999} />
          </section>
          <section data-case="euro" className={`flex w-[211px] max-w-full px-4 py-6 ${card}`}>
            <People title="Euro" sub="de-DE, 0,50 steps" defaultValue={1234.5} step={0.5} locale="de-DE" formatOptions={eur} />
          </section>
          <section data-case="yen" className={`flex w-[211px] max-w-full px-4 py-6 ${card}`}>
            <People title="Yen" sub="no fraction" defaultValue={1500} step={100} locale="ja-JP" formatOptions={jpy} />
          </section>
          <section data-case="invalid" className={`flex w-[211px] max-w-full flex-col items-center gap-3 px-4 py-6 ${card}`}>
            <Counter defaultValue={13} max={12}>
              <CounterDecrement />
              <CounterValue aria-label="Too many people" aria-invalid />
              <CounterIncrement />
            </Counter>
          </section>
          <form data-case="form" className={`flex w-[211px] max-w-full flex-col items-center gap-3 px-4 py-6 ${card}`}>
            <Counter name="people" defaultValue={2} min={1} max={12}>
              <CounterDecrement />
              <CounterValue aria-label="People in the form" />
              <CounterIncrement />
            </Counter>
            <button type="reset" className="plush-focus-ring rounded-(--plush-radius-full) bg-(--plush-fill) px-4 py-2">
              Reset
            </button>
          </form>
          <section data-case="rtl" dir="rtl" className={`flex w-[211px] max-w-full px-4 py-6 ${card}`}>
            <People title="من اليمين" sub="dir=rtl" defaultValue={4} min={1} max={12} />
          </section>
          <section data-narrow="160" className={`flex w-[160px] px-3 py-6 ${card}`}>
            <People defaultValue={4} min={1} max={12} />
          </section>
          <section
            data-dark=""
            className="plush-on-dark flex w-[211px] max-w-full rounded-(--plush-radius-card) bg-(--plush-accent) px-4 py-6 text-(--plush-on-accent)"
          >
            <People title="People" sub="on a dark card" defaultValue={4} min={1} max={12} />
          </section>
        </div>
      </div>
    </main>
  )
}
