"use client"

import * as React from "react"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import { RotateLeft01Icon } from "@hugeicons/core-free-icons"

import { Step, StepIndicator, StepTitle, Steps } from "@/components/ui/steps"

// Sharp chevron (contract, "Icons"): Hugeicons draws its chevrons as a curve with a round tip; this is the same
// 12 x 6 angle in straight lines, mitred at the tip like the tick. The one drawn path of plush, the same text in every file.
const sharpChevron = (d: string): IconSvgElement => [["path", { d, stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "miter", strokeWidth: 1.5, key: "0" }]]
const ChevronRightSharpIcon = sharpChevron("M9 6L15 12L9 18")

// The steps tile (content from app/preview/steps): title and three steps, step 2 current. The small round
// button on the title line moves the plan on; after "All done" it starts over. It hangs 4 px over and under the title
// line, so the list starts at title line + 12 px. Under the pointer it grows a little and its
// shadow gets stronger, like every round icon button.
const plan = ["Add friends", "Check amounts", "Send requests"]

// The changing digit of "Step 2 of 3" sits in a cell as wide as the widest digit (all ten stacked, hidden), like the ring's
// number: the fallback font has no equal-width digits, so "of 3" would shift half a pixel on each step.
// The same text is in app/preview/steps/page.tsx, which the install test copies on its own.
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

export function StepsDemo() {
  const [step, setStep] = React.useState(1)
  const done = step >= plan.length
  return (
    <div className="w-full min-w-0 px-1">
      <div className="mb-3 flex min-w-0 items-center gap-2">
        <p aria-live="polite" className="min-w-0 flex-1 text-(length:--plush-text-xl) leading-[normal] font-(--plush-weight-semi) break-words">
          {done ? "All done" : <>Step <FixedDigit>{step + 1}</FixedDigit> of {plan.length}</>}
        </p>
        <button
          type="button"
          aria-label={done ? "Start over" : "Next step"}
          onClick={() => setStep((s) => (s >= plan.length ? 0 : s + 1))}
          className="plush-focus-ring -my-1 grid size-7 shrink-0 cursor-pointer place-items-center rounded-(--plush-radius-full) bg-(--plush-surface) text-(--plush-ink) shadow-(--plush-card-shadow) [transition:scale_var(--plush-dur-spring)_var(--plush-ease-spring),box-shadow_var(--plush-dur-fast)_var(--plush-ease-fade)] hover:scale-(--plush-hover-grow) hover:shadow-(--plush-active-shadow) active:scale-(--plush-press-scale)"
        >
          <HugeiconsIcon icon={done ? RotateLeft01Icon : ChevronRightSharpIcon} size={16} strokeWidth={2.4} aria-hidden />
        </button>
      </div>
      <Steps value={step} aria-label="Split the bill">
        {plan.map((title) => (
          <Step key={title}>
            <StepIndicator />
            <StepTitle>{title}</StepTitle>
          </Step>
        ))}
      </Steps>
    </div>
  )
}
