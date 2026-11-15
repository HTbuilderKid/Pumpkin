"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { Toggle as TogglePrimitive } from "radix-ui"
import { HugeiconsIcon } from "@hugeicons/react"
import { Tick02Icon } from "@hugeicons/core-free-icons"

// A white pill. Turned on, the green ink fades in on its own layer under the label (::after) and the white card shadow
// fades out; on the soft spring the pill widens on the left and a tick grows in (box 0 -> 1em, scale .6 -> 1) and
// is revealed left to right one stagger later. Turned off, all of it runs backwards. A toggle that brings its own icon gets
// no tick: the green fill alone marks it. Held down, the pill gives a little on the spring, like the select field.
// Under the pointer (hover-capable devices only, Tailwind's hover; never disabled): an off white pill stays white and its
// shadow turns into the knob shadow like the white button, an off outline pill takes the stronger grey, an on pill stays
// green and only lightens. Shadow and grey come in on the quick fade.
// Corners are half the height of one line (a pill on one line, no blob when a long label wraps).
// The label is a bare text node (an anonymous flex item, min-width auto), so wrap-anywhere instead of break-words:
// only that lets one very long word shrink the pill and break instead of running out of it.
const toggleVariants = cva(
  [
    "group/toggle plush-font plush-focus-ring relative isolate inline-flex max-w-full min-w-0 cursor-default items-center justify-center gap-1.5 rounded-(--plush-toggle-radius) py-2 text-center leading-tight font-(--plush-weight-semi) wrap-anywhere select-none",
    "[transition:scale_var(--plush-dur-spring)_var(--plush-ease-spring),background-color_var(--plush-dur-fade)_var(--plush-ease-fade),box-shadow_var(--plush-dur-fade)_var(--plush-ease-fade),border-color_var(--plush-dur-fade)_var(--plush-ease-fade),color_var(--plush-dur-fade)_var(--plush-ease-fade)] active:not-disabled:scale-(--plush-press-scale-pill)",
    // Green ink as its own layer under the label, faded in.
    "after:pointer-events-none after:absolute after:-z-10 after:rounded-[inherit] after:bg-(image:--plush-select-fill) after:shadow-(--plush-select-gloss) after:opacity-0",
    "after:[transition:opacity_var(--plush-dur-fade)_var(--plush-ease-fade),filter_var(--plush-dur-fast)_var(--plush-ease-fade)]",
    "not-data-disabled:data-[state=on]:hover:after:brightness-(--plush-hover-bright)",
    "not-data-disabled:data-[state=off]:hover:[transition:scale_var(--plush-dur-spring)_var(--plush-ease-spring),background-color_var(--plush-dur-fast)_var(--plush-ease-fade),box-shadow_var(--plush-dur-fast)_var(--plush-ease-fade),border-color_var(--plush-dur-fade)_var(--plush-ease-fade),color_var(--plush-dur-fast)_var(--plush-ease-fade)]",
    "data-[state=on]:text-(--plush-on-select) data-[state=on]:shadow-none data-[state=on]:after:opacity-100",
    "data-disabled:cursor-not-allowed data-disabled:opacity-(--plush-disabled-opacity)",
    "aria-invalid:ring-(length:--plush-focus-width) aria-invalid:ring-(--plush-danger)",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  ],
  {
    variants: {
      variant: {
        default: "bg-(--plush-surface) text-(--plush-ink) shadow-(--plush-card-shadow) not-data-disabled:data-[state=off]:hover:bg-(--plush-surface-hover) not-data-disabled:data-[state=off]:hover:shadow-(--plush-active-shadow) after:inset-0",
        // Text in the colour around it, like the original (white on a dark surface); the stronger grey and ink under the
        // pointer (--plush-fill is almost the tile's colour, like the ghost button).
        outline:
          "border border-(--plush-line) bg-transparent not-data-disabled:data-[state=off]:hover:bg-(--plush-fill-strong) not-data-disabled:hover:text-(--plush-ink) after:-inset-px data-[state=on]:border-transparent",
      },
      // default = 42 px, 16 px text, 16 px side padding; sm 32 px, lg 48 px.
      size: {
        default: "min-h-(--plush-h-chip) px-4 text-(length:--plush-text-lg) [--plush-toggle-radius:calc(var(--plush-h-chip)/2)]",
        sm: "min-h-(--plush-h-chip-sm) px-3 text-(length:--plush-text-sm) [--plush-toggle-radius:calc(var(--plush-h-chip-sm)/2)] [&_svg:not([class*='size-'])]:size-3.5",
        lg: "min-h-(--plush-h-chip-lg) px-5 text-(length:--plush-text-xl) [--plush-toggle-radius:calc(var(--plush-h-chip-lg)/2)]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

// The tick is the Hugeicons Tick02, revealed left to right like the checkbox's tick (a clip-path wipe,
// not a drawn path). The icon is 0.875em: Tick02 spans 14 of 24 units, so this gives an
// 8 x 6 px tick with a 2 px stroke at 16 px text. The wipe ends fit the ink (13.7-86.3 % with round caps).
// Box: 0 wide with -6 px end margin (cancels the gap) when off; 1em wide, -4 px start margin (16 -> 12 px padding)
// when on. The same tick lives in toggle-group.tsx.
function ToggleTick() {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none -me-1.5 inline-flex w-0 shrink-0 justify-center group-has-[>svg]/toggle:hidden",
        "group-data-[state=on]/toggle:-ms-1 group-data-[state=on]/toggle:me-0 group-data-[state=on]/toggle:w-[1em]",
        "[transition:width_var(--plush-dur-soft)_var(--plush-ease-soft),margin_var(--plush-dur-soft)_var(--plush-ease-soft)]"
      )}
    >
      <HugeiconsIcon
        icon={Tick02Icon}
        size={14}
        strokeWidth={2.4}
        aria-hidden
        className={cn(
          "[&_path]:[stroke-linejoin:miter]",
          "size-[0.875em] scale-60 [clip-path:inset(0_87%_0_0)]",
          "[transition:scale_var(--plush-dur-soft)_var(--plush-ease-soft),clip-path_var(--plush-dur-fade)_var(--plush-ease-fade)_var(--plush-stagger)]",
          "group-data-[state=on]/toggle:scale-100 group-data-[state=on]/toggle:[clip-path:inset(0_13%_0_0)]"
        )}
      />
    </span>
  )
}

function Toggle({
  className,
  variant = "default",
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    >
      <ToggleTick />
      {children}
    </TogglePrimitive.Root>
  )
}

export { Toggle, toggleVariants }
