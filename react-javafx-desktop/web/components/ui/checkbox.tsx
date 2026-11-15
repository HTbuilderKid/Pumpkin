"use client"

import * as React from "react"
import { cn } from "cn"
import { Checkbox as CheckboxPrimitive } from "radix-ui"
import { HugeiconsIcon } from "@hugeicons/react"
import { MinusSignIcon, Tick02Icon } from "@hugeicons/core-free-icons"

// The box stays --plush-fill-strong; the green ink is its own layer that fades in on top (::before), like the switch.
// The tick draws itself: a left-to-right clip-path wipe over the icon,
// so it is a plain Hugeicons icon. Checking fills first and draws the tick one stagger later; unchecking undraws the tick
// first and empties the box one stagger later. The indicator is force-mounted so the tick can undraw. Pressed (pointer or
// Space) the box gives on the spring.
function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        "peer group/checkbox plush-font plush-focus-ring relative flex size-(--plush-check) shrink-0 items-center justify-center rounded-(--plush-radius-check) bg-(--plush-fill-strong) text-(--plush-on-select)",
        "[transition:scale_var(--plush-dur-spring)_var(--plush-ease-spring),box-shadow_var(--plush-dur-fade)_var(--plush-ease-fade),background-color_var(--plush-dur-fast)_var(--plush-ease-fade)] active:not-disabled:scale-(--plush-press-scale-check)",
        // Hover (mouse only, never disabled; also over its <label>): empty, the box turns one grey darker
        // (--plush-control-hover, the grey of an empty control under the pointer) and grows a little on the spring, not while pressed;
        // filled, the green ink only gets a little brighter.
        "enabled:data-[state=unchecked]:hover:bg-(--plush-control-hover) enabled:data-[state=unchecked]:not-active:hover:scale-(--plush-hover-grow) enabled:hover:before:brightness-(--plush-hover-bright)",
        // Green ink as its own layer: fades in at once, fades out one stagger after the tick starts to undraw.
        "before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:bg-(image:--plush-select-fill) before:shadow-(--plush-select-gloss) before:opacity-0",
        "before:[transition:opacity_var(--plush-dur-fade)_var(--plush-ease-fade)_var(--plush-stagger),filter_var(--plush-dur-fast)_var(--plush-ease-fade)]",
        "not-data-[state=unchecked]:before:opacity-100 not-data-[state=unchecked]:before:[transition:opacity_var(--plush-dur-fade)_var(--plush-ease-fade),filter_var(--plush-dur-fast)_var(--plush-ease-fade)]",
        // Larger hit area, as in the original.
        "after:absolute after:-inset-x-3 after:-inset-y-2",
        "disabled:cursor-not-allowed disabled:opacity-(--plush-disabled-opacity) group-has-disabled/field:opacity-(--plush-disabled-opacity)",
        "aria-invalid:ring-(length:--plush-focus-width) aria-invalid:ring-(--plush-danger)",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        forceMount
        className="pointer-events-none relative grid place-content-center text-current *:col-start-1 *:row-start-1"
      >
        {/* Wipe ends fit each icon's ink (1.6 px stroke, round caps): Tick02 spans 15.8-84.2 %, MinusSign 11.7-88.3 %. */}
        <HugeiconsIcon
          icon={Tick02Icon}
          size={16}
          strokeWidth={2.4}
          aria-hidden
          className={cn(
            "[&_path]:[stroke-linejoin:miter]",
            "[clip-path:inset(0_86%_0_0)] [transition:clip-path_var(--plush-dur-fade)_var(--plush-ease-fade)]",
            "group-data-[state=checked]/checkbox:[clip-path:inset(0_14%_0_0)]",
            "group-data-[state=checked]/checkbox:[transition:clip-path_var(--plush-dur-slow)_var(--plush-ease-fade)_var(--plush-stagger)]"
          )}
        />
        <HugeiconsIcon
          icon={MinusSignIcon}
          size={16}
          strokeWidth={2.4}
          aria-hidden
          className={cn(
            "[clip-path:inset(0_90%_0_0)] [transition:clip-path_var(--plush-dur-fade)_var(--plush-ease-fade)]",
            "group-data-[state=indeterminate]/checkbox:[clip-path:inset(0_10%_0_0)]",
            "group-data-[state=indeterminate]/checkbox:[transition:clip-path_var(--plush-dur-slow)_var(--plush-ease-fade)_var(--plush-stagger)]"
          )}
        />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
