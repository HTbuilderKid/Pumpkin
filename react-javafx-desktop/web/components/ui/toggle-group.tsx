"use client"

import * as React from "react"
import { type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { ToggleGroup as ToggleGroupPrimitive } from "radix-ui"
import { HugeiconsIcon } from "@hugeicons/react"
import { Tick02Icon } from "@hugeicons/core-free-icons"

import { toggleVariants } from "@/components/ui/toggle"

// The pills and their
// motion come from toggle.tsx (toggleVariants); default spacing 2 = an 8 px gap. The row wraps instead of
// running out of a narrow box; with spacing 0 (segmented) it stays one row and the items wrap their text.

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants> & {
    spacing?: number
    orientation?: "horizontal" | "vertical"
  }
>({
  size: "default",
  variant: "default",
  spacing: 2,
  orientation: "horizontal",
})

function ToggleGroup({
  className,
  variant,
  size,
  spacing = 2,
  orientation = "horizontal",
  children,
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Root> &
  VariantProps<typeof toggleVariants> & {
    spacing?: number
    orientation?: "horizontal" | "vertical"
  }) {
  return (
    <ToggleGroupPrimitive.Root
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      data-orientation={orientation}
      style={{ "--plush-toggle-group-gap": spacing } as React.CSSProperties}
      className={cn(
        "group/toggle-group plush-font flex w-fit max-w-full min-w-0 flex-row flex-wrap items-center gap-[--spacing(var(--plush-toggle-group-gap))] rounded-(--plush-radius-full)",
        "data-[spacing=0]:flex-nowrap data-[orientation=vertical]:flex-col data-[orientation=vertical]:items-stretch data-[orientation=vertical]:rounded-(--plush-radius-row)",
        className
      )}
      {...props}
    >
      <ToggleGroupContext.Provider
        value={{ variant, size, spacing, orientation }}
      >
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive.Root>
  )
}

// Same tick as in toggle.tsx (kept as a copy so both files export exactly what the originals export).
function ToggleGroupTick() {
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

function ToggleGroupItem({
  className,
  children,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<typeof ToggleGroupPrimitive.Item> &
  VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext)

  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      data-variant={context.variant || variant}
      data-size={context.size || size}
      data-spacing={context.spacing}
      className={cn(
        "focus:z-10 focus-visible:z-10 group-data-[spacing=0]/toggle-group:rounded-none group-data-[spacing=0]/toggle-group:px-3",
        "group-data-[orientation=horizontal]/toggle-group:data-[spacing=0]:first:rounded-s-(--plush-toggle-radius) group-data-[orientation=vertical]/toggle-group:data-[spacing=0]:first:rounded-t-(--plush-radius-row)",
        "group-data-[orientation=horizontal]/toggle-group:data-[spacing=0]:last:rounded-e-(--plush-toggle-radius) group-data-[orientation=vertical]/toggle-group:data-[spacing=0]:last:rounded-b-(--plush-radius-row)",
        "group-data-[orientation=horizontal]/toggle-group:data-[spacing=0]:data-[variant=outline]:border-s-0 group-data-[orientation=vertical]/toggle-group:data-[spacing=0]:data-[variant=outline]:border-t-0",
        "group-data-[orientation=horizontal]/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-s group-data-[orientation=vertical]/toggle-group:data-[spacing=0]:data-[variant=outline]:first:border-t",
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        className
      )}
      {...props}
    >
      <ToggleGroupTick />
      {children}
    </ToggleGroupPrimitive.Item>
  )
}

export { ToggleGroup, ToggleGroupItem }
