"use client"

import * as React from "react"

import { Counter, CounterDecrement, CounterIncrement, CounterValue } from "@/components/ui/counter"

const usd = { style: "currency", currency: "USD" } as const

// The people and amount tiles (content from app/preview/counter).
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
// The tile is a filled card with 24 px sides: 4 px on top of the tile's padding.
function Share({ label = "Your share", ways = 4, defaultValue = 24, ...props }: React.ComponentProps<typeof Counter> & { label?: string; ways?: number }) {
  const id = React.useId()
  const [value, setValue] = React.useState(defaultValue)
  return (
    <div className="flex w-full min-w-0 flex-col justify-center px-1 text-center">
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

export function CounterPeopleDemo() {
  return <People defaultValue={4} min={1} max={12} />
}

export function CounterAmountDemo() {
  return <Share />
}
