"use client"

import * as React from "react"

import { Step, StepDescription, StepIndicator, StepTitle, Steps } from "@/components/ui/steps"

// Demo buttons, not part of the component: Next is the black action of the library, Back a white pill.
const button =
  "plush-focus-ring min-h-(--plush-h-chip) max-w-full rounded-(--plush-radius-full) px-4 py-2 text-(length:--plush-text-md) leading-tight font-(--plush-weight-semi) break-words [transition:scale_var(--plush-dur-spring)_var(--plush-ease-spring)] active:not-disabled:scale-(--plush-press-scale-pill) disabled:cursor-not-allowed disabled:opacity-(--plush-disabled-opacity)"
const next = `${button} bg-(--plush-accent) text-(--plush-on-accent)`
const back = `${button} bg-(--plush-surface) text-(--plush-ink) shadow-(--plush-card-shadow)`

const card = "rounded-(--plush-radius-card) bg-(--plush-surface) p-(--plush-pad) shadow-(--plush-card-shadow)"

const plan = [
  { title: "Add friends", note: "Maya, Leo and Sam" },
  { title: "Check amounts", note: "$24.00 each" },
  { title: "Send requests", note: "By text and email" },
]

const long = [
  {
    title: "Add every friend who sat at the long table on Saturday night, including the two who left early",
    note: "Donaudampfschifffahrtsgesellschaftskapitänsmützenabzeichen and the rest of the guest list",
  },
  {
    title: "Check that the amounts add up to the receipt, tips and taxes included",
    note: "Everyone pays exactly what they had, rounded up to the next whole cent",
  },
  { title: "Send requests", note: "By text and email" },
]

const eight = Array.from({ length: 8 }, (_, i) => ({ title: `Step ${i + 1}`, note: "" }))

function Plan({
  items = plan,
  notes = false,
  ...props
}: React.ComponentProps<typeof Steps> & { items?: typeof plan; notes?: boolean }) {
  return (
    <Steps {...props}>
      {items.map((s) => (
        <Step key={s.title}>
          <StepIndicator />
          <StepTitle>{s.title}</StepTitle>
          {notes && <StepDescription>{s.note}</StepDescription>}
        </Step>
      ))}
    </Steps>
  )
}

// The changing digit of "Step 2 of 3" sits in a cell as wide as the widest digit (all ten stacked, hidden), like the ring's
// number: the fallback font has no equal-width digits, so "of 3" would shift half a pixel on each step.
// The same text is in components/site/demos/steps.tsx; this page is copied on its own by the install test.
function FixedDigit({ children }: { children: number }) {
  return (
    <span className="inline-grid justify-items-center">
      {Array.from({ length: 10 }, (_, d) => (
        <span key={d} aria-hidden className="invisible col-start-1 row-start-1">{d}</span>
      ))}
      <span className="col-start-1 row-start-1">{children}</span>
    </span>
  )
}

export default function StepsPreview() {
  const [step, setStep] = React.useState(1)
  const count = plan.length

  return (
    <main className="plush-font min-h-screen bg-(--plush-bg) p-8 text-(--plush-ink)">
      <div className="flex flex-col items-start gap-8">
        <div className="flex flex-wrap items-end gap-6">
          {/* The tile: title and three steps, step 2 current. */}
          <section
            data-tile=""
            className="flex h-[228px] w-[210.5px] max-w-full items-center rounded-(--plush-radius-panel) bg-(--plush-panel) p-(--plush-pad)"
          >
            <div className="w-full min-w-0 px-1">
              <p className="mb-3 text-(length:--plush-text-xl) leading-[normal] font-(--plush-weight-semi) break-words">
                {step < count ? <>Step <FixedDigit>{step + 1}</FixedDigit> of {count}</> : "All done"}
              </p>
              <Plan value={step} aria-label="Split the bill" />
            </div>
          </section>

          <div className="flex flex-wrap gap-3">
            <button type="button" className={next} disabled={step >= count} onClick={() => setStep((s) => Math.min(count, s + 1))}>
              Next
            </button>
            <button type="button" className={back} disabled={step <= 0} onClick={() => setStep((s) => Math.max(0, s - 1))}>
              Back
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-start gap-8">
          <section className={`w-[300px] max-w-full ${card}`}>
            <Plan value={step} notes aria-label="With descriptions" />
          </section>
          <section className={`w-[300px] max-w-full ${card}`}>
            <Plan value={0} aria-label="At the start" />
          </section>
          <section className={`w-[300px] max-w-full ${card}`}>
            <Plan value={count} aria-label="All done" />
          </section>
        </div>

        <section className={`w-[560px] max-w-full ${card}`}>
          <Plan value={step} orientation="horizontal" notes aria-label="Horizontal" />
        </section>

        <div className="flex flex-wrap items-start gap-8">
          <section data-testid="w240" className={`w-[240px] ${card}`}>
            <Plan value={step} items={long} notes aria-label="Long text" />
          </section>
          <section data-testid="w240-horizontal" className={`w-[240px] ${card}`}>
            <Plan value={step} items={long} orientation="horizontal" aria-label="Long text, horizontal" />
          </section>
        </div>

        <div data-testid="states" className="flex flex-wrap items-start gap-8">
          <section className={`w-[240px] ${card}`}>
            <Plan value={0} items={plan.slice(0, 1)} notes aria-label="One step" />
          </section>
          <section className={`w-[240px] ${card}`}>
            <Plan value={5} items={eight} aria-label="Eight steps" />
          </section>
          <section className={`w-[240px] ${card}`}>
            <Plan value={5} items={eight} orientation="horizontal" aria-label="Eight steps, horizontal" />
          </section>
          <section className={`w-[160px] ${card}`}>
            <Plan value={3} orientation="horizontal" aria-label="All done, horizontal, 160 px" />
          </section>
          <section className="w-[240px] rounded-(--plush-radius-card) bg-(--plush-accent) p-(--plush-pad)">
            <Plan value={1} notes className="text-(--plush-on-accent)" aria-label="On a dark surface" />
          </section>
        </div>
      </div>
    </main>
  )
}
