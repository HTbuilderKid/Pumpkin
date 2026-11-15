"use client"

import * as React from "react"
import { cn } from "cn"
import { RadioGroup as RadioGroupPrimitive } from "radix-ui"

// The circle is --plush-fill-strong; the green ink is its own layer (::before) and the dark dot sits in the indicator.
// Both grow out of the centre on the spring and shrink back into it, in this order: leaving, the dot goes
// first and the ink follows; arriving, the ink comes and the dot follows. Delays are steps of --plush-stagger. The
// indicator stays mounted (forceMount) so the dot can shrink instead of vanishing. Pressed on its own, the circle gives
// a little; inside a <label> the row is what gives.

function RadioGroup({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="radio-group"
      className={cn("plush-font grid w-full gap-2", className)}
      {...props}
    />
  )
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-slot="radio-group-item"
      className={cn(
        "group/radio-group-item peer plush-focus-ring relative flex aspect-square size-(--plush-radio) shrink-0 rounded-(--plush-radius-full) bg-(--plush-fill-strong)",
        // Green ink, grown out of the centre.
        "before:pointer-events-none before:absolute before:inset-0 before:scale-0 before:rounded-[inherit] before:bg-(image:--plush-select-fill) before:shadow-(--plush-select-gloss)",
        "before:[transition:scale_var(--plush-dur-spring)_var(--plush-ease-spring)_var(--plush-stagger),filter_var(--plush-dur-fast)_var(--plush-ease-fade)]",
        "data-[state=checked]:before:scale-100 data-[state=checked]:before:[transition-delay:calc(var(--plush-stagger)*2.5),0s]",
        // Pressed on its own: a little smaller (not inside a label, where the row gives instead).
        "[transition:scale_var(--plush-dur-spring)_var(--plush-ease-spring),box-shadow_var(--plush-dur-fade)_var(--plush-ease-fade),background-color_var(--plush-dur-fast)_var(--plush-ease-fade)] enabled:active:not-in-[label]:scale-(--plush-press-scale)",
        // Hover (mouse only, never disabled; also over its <label>): empty, the circle turns one grey darker
        // (--plush-control-hover, the grey of an empty control under the pointer) and grows a little on the spring, not while pressed;
        // chosen, the green ink only gets a little brighter.
        "enabled:data-[state=unchecked]:hover:bg-(--plush-control-hover) enabled:data-[state=unchecked]:not-active:hover:scale-(--plush-hover-grow) enabled:hover:before:brightness-(--plush-hover-bright)",
        // Larger hit area, as in the original.
        "after:absolute after:-inset-x-3 after:-inset-y-2",
        "data-disabled:cursor-not-allowed data-disabled:opacity-(--plush-disabled-opacity)",
        "aria-invalid:ring-(length:--plush-focus-width) aria-invalid:ring-(--plush-danger)",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator
        data-slot="radio-group-indicator"
        forceMount
        className="flex size-full items-center justify-center"
      >
        <span
          className={cn(
            "pointer-events-none absolute top-1/2 left-1/2 size-(--plush-radio-dot) -translate-x-1/2 -translate-y-1/2 scale-0 rounded-(--plush-radius-full) bg-(--plush-on-select)",
            "[transition:scale_var(--plush-dur-spring)_var(--plush-ease-spring)]",
            "group-data-[state=checked]/radio-group-item:scale-100 group-data-[state=checked]/radio-group-item:[transition-delay:calc(var(--plush-stagger)*4.5)]"
          )}
        />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  )
}

export { RadioGroup, RadioGroupItem }
