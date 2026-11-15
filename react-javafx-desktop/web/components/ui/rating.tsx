"use client"

import * as React from "react"
import { cn } from "cn"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"
import { HugeiconsIcon } from "@hugeicons/react"
import { StarIcon } from "@hugeicons/core-free-icons"

// No shadcn original: the shape follows the shadcn parts (data-slot, cn, props passed on) and
// sits on the Radix radio group, one star per value, so arrows, Space, Tab, forms and labels ("3 of 5") come from Radix.
// - A star is filled when it is the checked one or a checked star comes after it (:has(~ …)). Under a hovering pointer
//   the stars up to the hovered one show instead (preview), not when disabled or read-only.
// - Filling, the green ink grows out of the grey star's centre on the soft spring and the star pops: `scale` and
//   `transform` change by reciprocal factors on the same spring, the second 1.5 staggers later, so they meet at 1 again
//   (+.22 filling, a small dip emptying). Stars fill from the left and empty from the right, one
//   stagger apart (index as an inline variable). CSS cannot see the old value, so the wave counts from the ends; keyboard
//   steps and the hover preview skip the wait. Held down, a star gives a little.
// - The ink is an SVG gradient (#ink-diag): an SVG fill cannot take --plush-select-fill, so a zero-size <defs>
//   holds a bounding-box gradient between --plush-select-a and --plush-select-b (no hand-drawn path).
function Rating({
  className,
  style,
  value,
  defaultValue,
  onValueChange,
  max = 5,
  readOnly = false,
  loop = false,
  ...props
}: Omit<
  React.ComponentProps<typeof RadioGroupPrimitive.Root>,
  "value" | "defaultValue" | "onValueChange" | "children"
> & {
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  max?: number
  readOnly?: boolean
}) {
  const ink = `plush-rating-ink-${React.useId().replace(/[^a-zA-Z0-9_-]/g, "")}`
  // Read-only pins the group to its value: Radix still moves focus, the value does not change.
  const pinned = readOnly ? String(value ?? defaultValue ?? 0) : value === undefined ? undefined : String(value)

  return (
    <RadioGroupPrimitive.Root
      data-slot="rating"
      data-readonly={readOnly ? "" : undefined}
      aria-readonly={readOnly || undefined}
      value={pinned}
      defaultValue={defaultValue === undefined ? undefined : String(defaultValue)}
      onValueChange={readOnly ? undefined : (v) => onValueChange?.(Number(v))}
      loop={loop}
      style={{ "--plush-rating-ink": `url(#${ink})`, ...style } as React.CSSProperties}
      className={cn(
        "group/rating plush-font relative flex w-fit max-w-full flex-wrap items-center gap-(--plush-star-gap)",
        // Pop: .22 bigger at the peak.
        "[--plush-rating-pop:var(--plush-pop-peak-rating)] [--plush-rating-press:var(--plush-press-scale)] data-readonly:[--plush-rating-press:1]",
        // The hovered star grows a little (scale, so the row does not move); not when read-only.
        "[--plush-rating-grow:var(--plush-hover-grow)] data-readonly:[--plush-rating-grow:1]",
        // Preview under a hovering pointer (not when disabled or read-only); hover and keyboard skip the wave.
        "[--plush-rating-hovering:0] [--plush-rating-wave:1] has-focus-visible:[--plush-rating-wave:0]",
        "[@media(hover:hover)]:not-data-disabled:not-data-readonly:has-[[data-slot=rating-item]:hover]:[--plush-rating-hovering:1]",
        "[@media(hover:hover)]:not-data-disabled:not-data-readonly:has-[[data-slot=rating-item]:hover]:[--plush-rating-wave:0]",
        "data-disabled:opacity-(--plush-disabled-opacity)",
        className
      )}
      {...props}
    >
      <svg aria-hidden focusable="false" className="pointer-events-none absolute size-0">
        <defs>
          <linearGradient id={ink} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" className="[stop-color:var(--plush-select-a)]" />
            <stop offset="1" className="[stop-color:var(--plush-select-b)]" />
          </linearGradient>
        </defs>
      </svg>
      {Array.from({ length: max }, (_, i) => (
        <RadioGroupPrimitive.Item
          key={i}
          data-slot="rating-item"
          value={String(i + 1)}
          aria-label={`${i + 1} of ${max}`}
          style={{ "--plush-rating-i": i, "--plush-rating-r": max - 1 - i } as React.CSSProperties}
          className={cn(
            "plush-focus-ring relative grid size-(--plush-star) shrink-0 place-items-center rounded-(--plush-radius-full)",
            // Filled by value (this star or a later one is checked), filled by the hovering pointer, and the one that shows.
            "[--plush-rating-v:0] data-[state=checked]:[--plush-rating-v:1] has-[~[data-state=checked]]:[--plush-rating-v:1]",
            "[--plush-rating-h:0] hover:[--plush-rating-h:1] has-[~:hover]:[--plush-rating-h:1]",
            "[--plush-rating-on:calc(var(--plush-rating-v)_+_(var(--plush-rating-h)_-_var(--plush-rating-v))_*_var(--plush-rating-hovering))]",
            // Wave: filling waits by the star's index, emptying by its distance from the end.
            "[--plush-rating-delay:calc((var(--plush-rating-on)_*_var(--plush-rating-i)_+_(1_-_var(--plush-rating-on))_*_var(--plush-rating-r))_*_var(--plush-rating-wave)_*_var(--plush-stagger))]",
            // Held: a little smaller.
            "[transition:scale_var(--plush-dur-spring)_var(--plush-ease-spring)] enabled:active:scale-(--plush-rating-press) enabled:not-active:hover:scale-(--plush-rating-grow)",
            // The 4 px gap belongs to the stars, so the preview does not flicker between them; a larger touch target.
            "after:absolute after:-inset-x-[calc(var(--plush-star-gap)/2)] after:-inset-y-2 first-of-type:after:left-0 last-of-type:after:right-0",
            "data-disabled:cursor-not-allowed group-data-readonly/rating:cursor-default",
            // Invalid (aria-invalid on the group): the red ring of the radio group around every star, chosen or not.
            "group-aria-invalid/rating:ring-(length:--plush-focus-width) group-aria-invalid/rating:ring-(--plush-danger)"
          )}
        >
          <span
            data-slot="rating-star"
            className={cn(
              "pointer-events-none grid place-items-center *:col-start-1 *:row-start-1",
              "[scale:calc(1_+_var(--plush-rating-on)_*_(var(--plush-rating-pop)_-_1))]",
              "[transform:scale(calc(1_/_(1_+_var(--plush-rating-on)_*_(var(--plush-rating-pop)_-_1))))]",
              "[transition:scale_var(--plush-dur-spring)_var(--plush-ease-spring)_var(--plush-rating-delay),transform_var(--plush-dur-spring)_var(--plush-ease-spring)_calc(var(--plush-rating-delay)_+_1.5*var(--plush-stagger))]"
            )}
          >
            <HugeiconsIcon
              icon={StarIcon}
              size={24}
              strokeWidth={1.5}
              fill="currentColor"
              aria-hidden
              className="text-(--plush-fill-strong)"
            />
            <HugeiconsIcon
              icon={StarIcon}
              size={24}
              strokeWidth={1.5}
              aria-hidden
              data-slot="rating-ink"
              className={cn(
                "[&_path]:[fill:var(--plush-rating-ink)] [&_path]:[stroke:var(--plush-rating-ink)]",
                "[scale:var(--plush-rating-on)] [transition:scale_var(--plush-dur-soft)_var(--plush-ease-soft)_var(--plush-rating-delay)]"
              )}
            />
          </span>
        </RadioGroupPrimitive.Item>
      ))}
    </RadioGroupPrimitive.Root>
  )
}

export { Rating }
