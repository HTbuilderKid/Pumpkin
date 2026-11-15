"use client"

import * as React from "react"
import { cn } from "cn"
import { HugeiconsIcon } from "@hugeicons/react"
import { Tick02Icon } from "@hugeicons/core-free-icons"

// Own component, there is no shadcn original. The state comes in as `value` (index of the current
// step, `value >= count` = all done) and every <li> carries data-state="complete" | "current" | "upcoming"; all motion
// hangs on that attribute. Moving on, in this order: the dot of the current step shrinks, the tick draws itself
// (a clip-path wipe over the icon, as in checkbox.tsx) and the mark pops; a green stroke runs down the line to the next
// step and is gone again (the line rests grey); then the next mark fills with green, its dot with it, and
// its text lights up. Going back, the current mark empties at once and the step before turns its tick back into the dot.
// Delays are steps of --plush-stagger. The dot and the tick sit inside the green layer, so only the green and the text wait
// when a step becomes current, which is right in both directions.

type StepState = "complete" | "current" | "upcoming"
type StepsOrientation = "vertical" | "horizontal"

const StepContext = React.createContext<{ state: StepState; orientation: StepsOrientation }>({
  state: "upcoming",
  orientation: "vertical",
})

function Steps({
  className,
  value = 0,
  orientation = "vertical",
  children,
  ...props
}: React.ComponentProps<"ol"> & {
  value?: number
  orientation?: StepsOrientation
}) {
  return (
    <ol
      data-slot="steps"
      data-orientation={orientation}
      // A list without bullets keeps its list role in Safari only when it is spelled out.
      role="list"
      className={cn(
        "plush-font flex w-full max-w-full min-w-0 flex-col text-(--plush-ink)",
        "data-[orientation=horizontal]:flex-row data-[orientation=horizontal]:gap-(--plush-steps-gap) [--plush-steps-gap:--spacing(2.5)]",
        className
      )}
      {...props}
    >
      {React.Children.toArray(children).map((child, index) => (
        <StepContext
          key={React.isValidElement(child) ? child.key : index}
          value={{
            orientation,
            state: index < value ? "complete" : index === value ? "current" : "upcoming",
          }}
        >
          {child}
        </StepContext>
      ))}
    </ol>
  )
}

function Step({ className, ...props }: React.ComponentProps<"li">) {
  const { state, orientation } = React.useContext(StepContext)
  return (
    <li
      data-slot="step"
      data-state={state}
      data-orientation={orientation}
      aria-current={state === "current" ? "step" : undefined}
      className={cn(
        "group/step relative grid min-w-0 content-start",
        // Geometry: mark 24, line 2. start = from the step's edge to the centre of its mark, reach = from the
        // step's far edge on to the centre of the next mark, cross = where the line sits across.
        "[--plush-steps-line:--spacing(0.5)] [--plush-steps-cross:calc(var(--plush-steps-mark)/2_-_var(--plush-steps-line)/2)]",
        // Vertical: rows of 38 px (7 + 24 + 7), text beside the mark.
        "data-[orientation=vertical]:grid-cols-[auto_minmax(0,1fr)] data-[orientation=vertical]:gap-x-2.5 data-[orientation=vertical]:py-1.75",
        "data-[orientation=vertical]:[--plush-steps-start:calc(--spacing(1.75)_+_var(--plush-steps-mark)/2)] data-[orientation=vertical]:[--plush-steps-reach:var(--plush-steps-start)]",
        // Horizontal: the steps share the width, text under the mark.
        // Side by side every step starts at the width of its longest word and the rest of the row is shared out, so no
        // word breaks in the middle; only when the words together are wider than the row do the steps shrink below them
        // (then break-words takes over and nothing runs over).
        "data-[orientation=horizontal]:[flex:1_1_min-content] data-[orientation=horizontal]:grid-cols-[minmax(0,1fr)]",
        "data-[orientation=horizontal]:[--plush-steps-start:calc(var(--plush-steps-mark)/2)] data-[orientation=horizontal]:[--plush-steps-reach:calc(var(--plush-steps-gap)_+_var(--plush-steps-mark)/2)]",
        // The line to the next step (::before, grey) and the green stroke that runs along it (::after), from the centre of
        // this mark to the centre of the next one, under both marks. Not after the last step.
        "before:pointer-events-none before:absolute before:rounded-(--plush-radius-full) before:bg-(--plush-fill-strong) last:before:hidden",
        "after:pointer-events-none after:absolute after:rounded-(--plush-radius-full) after:bg-(image:--plush-select-fill) last:after:hidden",
        "data-[orientation=vertical]:before:top-(--plush-steps-start) data-[orientation=vertical]:before:bottom-[calc(-1*var(--plush-steps-reach))]",
        "data-[orientation=vertical]:before:left-(--plush-steps-cross) data-[orientation=vertical]:before:right-[calc(100%_-_var(--plush-steps-cross)_-_var(--plush-steps-line))]",
        "data-[orientation=vertical]:after:left-(--plush-steps-cross) data-[orientation=vertical]:after:right-[calc(100%_-_var(--plush-steps-cross)_-_var(--plush-steps-line))]",
        "data-[orientation=horizontal]:before:left-(--plush-steps-start) data-[orientation=horizontal]:before:right-[calc(-1*var(--plush-steps-reach))]",
        "data-[orientation=horizontal]:before:top-(--plush-steps-cross) data-[orientation=horizontal]:before:bottom-[calc(100%_-_var(--plush-steps-cross)_-_var(--plush-steps-line))]",
        "data-[orientation=horizontal]:after:top-(--plush-steps-cross) data-[orientation=horizontal]:after:bottom-[calc(100%_-_var(--plush-steps-cross)_-_var(--plush-steps-line))]",
        // The stroke rests as a point at this mark; once the step is complete it rests as a point at the next mark. On the
        // way the front edge leads on the soft spring and the back edge follows (0.2 s apart), so a short
        // green piece runs down the line and vanishes. Going back it jumps home unseen (it is a point at both ends).
        "data-[orientation=vertical]:after:top-(--plush-steps-start) data-[orientation=vertical]:after:bottom-[calc(100%_-_var(--plush-steps-start))]",
        "data-[orientation=vertical]:data-[state=complete]:after:top-[calc(100%_+_var(--plush-steps-reach))] data-[orientation=vertical]:data-[state=complete]:after:bottom-[calc(-1*var(--plush-steps-reach))]",
        "data-[orientation=horizontal]:after:left-(--plush-steps-start) data-[orientation=horizontal]:after:right-[calc(100%_-_var(--plush-steps-start))]",
        "data-[orientation=horizontal]:data-[state=complete]:after:left-[calc(100%_+_var(--plush-steps-reach))] data-[orientation=horizontal]:data-[state=complete]:after:right-[calc(-1*var(--plush-steps-reach))]",
        "data-[state=complete]:after:[transition:bottom_var(--plush-dur-soft)_var(--plush-ease-soft)_calc(2.5*var(--plush-stagger)),right_var(--plush-dur-soft)_var(--plush-ease-soft)_calc(2.5*var(--plush-stagger)),top_var(--plush-dur-soft)_var(--plush-ease-soft)_calc(5.5*var(--plush-stagger)),left_var(--plush-dur-soft)_var(--plush-ease-soft)_calc(5.5*var(--plush-stagger))]",
        className
      )}
      {...props}
    />
  )
}

function StepIndicator({ className, ...props }: Omit<React.ComponentProps<"span">, "children">) {
  return (
    <span
      data-slot="step-indicator"
      aria-hidden="true"
      className={cn(
        "relative z-1 grid size-(--plush-steps-mark) shrink-0 place-items-center self-start rounded-(--plush-radius-full) bg-(--plush-fill-strong)",
        "group-data-[orientation=vertical]/step:row-span-2",
        // The pop when the step is ticked (+18 % and back): `scale` swells on the spring, `transform`
        // shrinks by the same factor two staggers later, so at rest the two cancel out exactly and nothing moves.
        "group-data-[state=complete]/step:[scale:var(--plush-pop-peak-steps)] group-data-[state=complete]/step:[transform:scale(calc(1/var(--plush-pop-peak-steps)))]",
        "group-data-[state=complete]/step:[transition:scale_var(--plush-dur-spring)_var(--plush-ease-spring)_calc(1.5*var(--plush-stagger)),transform_var(--plush-dur-spring)_var(--plush-ease-spring)_calc(3.5*var(--plush-stagger))]",
        className
      )}
      {...props}
    >
      {/* Green layer with the dot and the tick in it. Grows from the centre when the step is reached, a little after the
          stroke has arrived; shrinks at once when the step goes back to upcoming. */}
      <span
        className={cn(
          "pointer-events-none absolute inset-0 grid place-items-center rounded-[inherit] bg-(image:--plush-select-fill) text-(--plush-on-select) shadow-(--plush-select-gloss) *:col-start-1 *:row-start-1",
          "scale-0 [transition:scale_var(--plush-dur-spring)_var(--plush-ease-spring)]",
          "group-not-data-[state=upcoming]/step:scale-100 group-not-data-[state=upcoming]/step:[transition-delay:calc(7*var(--plush-stagger))]"
        )}
      >
        <span
          className={cn(
            "size-(--plush-steps-dot) rounded-(--plush-radius-full) bg-(--plush-on-select)",
            "[transition:scale_var(--plush-dur-spring)_var(--plush-ease-spring)_calc(4.5*var(--plush-stagger))]",
            "group-data-[state=complete]/step:scale-0 group-data-[state=complete]/step:[transition-delay:0s]"
          )}
        />
        {/* Tick02 at 14 px with the library stroke (1.4 px, mitred tip). Its ink (round caps) spans 15.8-84.2 %, inside the
            wipe ends. */}
        <HugeiconsIcon
          icon={Tick02Icon}
          size={14}
          strokeWidth={2.4}
          aria-hidden
          className={cn(
            "[&_path]:[stroke-linejoin:miter]",
            "[clip-path:inset(0_88%_0_0)] [transition:clip-path_var(--plush-dur-slow)_var(--plush-ease-fade)_calc(3*var(--plush-stagger))]",
            "group-data-[state=complete]/step:[clip-path:inset(0_12%_0_0)] group-data-[state=complete]/step:[transition-delay:calc(1.5*var(--plush-stagger))]"
          )}
        />
      </span>
    </span>
  )
}

// Text of a reached step is ink and semibold, of an upcoming one grey and medium. It lights up with the green
// of its mark and dims at once. Text wraps between words; a word longer than the step breaks (break-words).
const stepText =
  "min-w-0 break-words [transition:color_var(--plush-dur-fade)_var(--plush-ease-fade)_calc(7*var(--plush-stagger)),font-weight_var(--plush-dur-fade)_var(--plush-ease-fade)_calc(7*var(--plush-stagger))] group-data-[state=upcoming]/step:[transition-delay:0s] group-data-[orientation=vertical]/step:col-start-2"

function StepTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="step-title"
      className={cn(
        stepText,
        // A reached title takes the colour of the list (--plush-ink from Steps), so `text-(--plush-on-accent)` on Steps is
        // all a dark surface needs.
        "text-(length:--plush-text-md) leading-5 font-(--plush-weight-semi)",
        "group-data-[state=upcoming]/step:font-(--plush-weight-medium) group-data-[state=upcoming]/step:text-(--plush-ink-3)",
        // First line centred on the mark (2 + 20 / 2 = 24 / 2); under the mark when horizontal.
        "group-data-[orientation=vertical]/step:pt-0.5 group-data-[orientation=horizontal]/step:mt-2",
        className
      )}
      {...props}
    />
  )
}

function StepDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="step-description"
      className={cn(
        stepText,
        "mt-0.5 text-(length:--plush-text-sm) leading-5 font-(--plush-weight-medium) text-(--plush-ink-2)",
        "group-data-[state=upcoming]/step:text-(--plush-ink-3)",
        className
      )}
      {...props}
    />
  )
}

export { Steps, Step, StepIndicator, StepTitle, StepDescription }
