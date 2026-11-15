"use client"

import * as React from "react"
import { cn } from "cn"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import { Tick02Icon } from "@hugeicons/core-free-icons"
import { Select as SelectPrimitive } from "radix-ui"

// Sharp chevron (contract, "Icons"): Hugeicons draws its chevrons as a curve with a round tip; this is the same
// 12 x 6 angle in straight lines, mitred at the tip like the tick. The one drawn path of plush, the same text in every file.
const sharpChevron = (d: string): IconSvgElement => [["path", { d, stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "miter", strokeWidth: 1.5, key: "0" }]]
const ChevronDownSharpIcon = sharpChevron("M6 9L12 15L18 9")
const ChevronUpSharpIcon = sharpChevron("M6 15L12 9L18 15")

// Text wraps with wrap-anywhere, not break-words: the value and row text sit in flex boxes, which break-words cannot
// shrink below their longest word, so one long word ran out of the field and was cut off in the list.
// The grey highlight glides from row to row: one <span> at the end of the viewport (data-slot plush-select-highlight),
// anchored (CSS anchor positioning) to the highlighted row, or to the checked row while nothing is highlighted. A real
// element, not the viewport's ::before: Safari starts no transition on a pseudo-element that a :has() rule restyles at
// the same moment, so the highlight jumped there. It sits last, so the rows' sibling-index() delays stay as they are, and
// below them (isolate, -z-10). Browsers without anchor positioning fall back to a plain fill on the highlighted row,
// like the original.

function Select({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Root>) {
  return <SelectPrimitive.Root data-slot="select" {...props} />
}

function SelectGroup({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return (
    <SelectPrimitive.Group
      data-slot="select-group"
      className={cn("scroll-my-1.5", className)}
      {...props}
    />
  )
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

function SelectTrigger({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> & {
  size?: "sm" | "default"
}) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-size={size}
      className={cn(
        "plush-font plush-focus-ring flex w-fit max-w-full min-w-0 cursor-default items-center justify-between gap-2 rounded-(--plush-radius-card) bg-(--plush-surface) py-2 text-left leading-tight font-(--plush-weight-semi) wrap-anywhere text-(--plush-ink) shadow-(--plush-card-shadow) select-none",
        "[transition:scale_var(--plush-dur-spring)_var(--plush-ease-spring),background-color_var(--plush-dur-fade)_var(--plush-ease-fade),color_var(--plush-dur-fade)_var(--plush-ease-fade),box-shadow_var(--plush-dur-fade)_var(--plush-ease-fade)] active:not-disabled:scale-95",
        "data-[size=default]:min-h-(--plush-h-field) data-[size=default]:pr-3.5 data-[size=default]:pl-4 data-[size=default]:text-(length:--plush-text-lg)",
        "data-[size=sm]:min-h-(--plush-h-chip) data-[size=sm]:pr-3 data-[size=sm]:pl-3.5 data-[size=sm]:text-(length:--plush-text-md)",
        // Hover (pointer devices only, not disabled): white stays, the card shadow turns into the knob shadow on the quick fade (grey face on a dark ground).
        "not-disabled:hover:bg-(--plush-surface-hover) not-disabled:hover:shadow-(--plush-active-shadow) not-disabled:hover:[transition:scale_var(--plush-dur-spring)_var(--plush-ease-spring),background-color_var(--plush-dur-fast)_var(--plush-ease-fade),color_var(--plush-dur-fade)_var(--plush-ease-fade),box-shadow_var(--plush-dur-fast)_var(--plush-ease-fade)]",
        "data-placeholder:text-(--plush-ink-2) disabled:cursor-not-allowed disabled:bg-(--plush-fill) disabled:text-(--plush-ink-3) disabled:shadow-none",
        "aria-invalid:ring-(length:--plush-focus-width) aria-invalid:ring-(--plush-danger)",
        "*:data-[slot=select-value]:flex *:data-[slot=select-value]:min-w-0 *:data-[slot=select-value]:flex-1 *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-1.5",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon asChild>
        <HugeiconsIcon icon={ChevronDownSharpIcon} size={16} strokeWidth={2.4} aria-hidden className="pointer-events-none size-4 text-(--plush-ink-2) in-disabled:text-(--plush-ink-3)" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  position = "item-aligned",
  align = "center",
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Content>) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content
        data-slot="select-content"
        data-align-trigger={position === "item-aligned"}
        className={cn(
          "plush-font relative z-50 max-h-(--radix-select-content-available-height) max-w-[calc(100vw-2*var(--plush-pad))] min-w-36 origin-(--radix-select-content-transform-origin) overflow-x-hidden overflow-y-auto rounded-(--plush-radius-row) bg-(--plush-surface) text-(--plush-ink) shadow-(--plush-card-shadow)",
          // Popper: the list grows out of the field and goes back into it. Scale only, around the edge Radix gives
          // (--radix-select-content-transform-origin: the top edge under the field, the bottom edge over it), no drift.
          "data-[state=open]:animate-[plush-fade-in_var(--plush-dur-fade)_var(--plush-ease-fade),plush-grow-in_var(--plush-dur-spring)_var(--plush-ease-spring)]",
          "data-[state=closed]:animate-[plush-fade-out_var(--plush-dur-fade)_var(--plush-ease-fade),plush-grow-out_var(--plush-dur-fade)_var(--plush-ease-fade)]",
          // Item-aligned: Radix measures the rows at mount, so no scale there, only the fade.
          "data-[align-trigger=true]:data-[state=open]:animate-[plush-fade-in_var(--plush-dur-fade)_var(--plush-ease-fade)]",
          "data-[align-trigger=true]:data-[state=closed]:animate-[plush-fade-out_var(--plush-dur-fade)_var(--plush-ease-fade)]",
          position === "popper" &&
            "w-(--radix-select-trigger-width) max-w-(--radix-select-content-available-width) data-[side=bottom]:translate-y-2.5 data-[side=left]:-translate-x-2.5 data-[side=right]:translate-x-2.5 data-[side=top]:-translate-y-2.5",
          className
        )}
        position={position}
        align={align}
        {...props}
      >
        <SelectScrollUpButton />
        <SelectPrimitive.Viewport
          data-position={position}
          className={cn(
            "group/plush-select-viewport isolate p-1.5 [anchor-scope:--plush-select-hl] data-[position=popper]:h-(--radix-select-trigger-height) data-[position=popper]:w-full data-[position=popper]:min-w-(--radix-select-trigger-width)"
          )}
        >
          {children}
          {/* The gliding highlight (see top of file). */}
          <span
            aria-hidden="true"
            data-slot="plush-select-highlight"
            className={cn(
              "pointer-events-none absolute -z-10 rounded-(--plush-radius-item) bg-(--plush-fill) opacity-0",
              "[position-anchor:--plush-select-hl] top-[anchor(top)] right-[anchor(right)] bottom-[anchor(bottom)] left-[anchor(left)]",
              "[transition:top_var(--plush-dur-spring)_var(--plush-ease-spring),bottom_var(--plush-dur-spring)_var(--plush-ease-spring),opacity_var(--plush-dur-fade)_var(--plush-ease-fade)]",
              "not-supports-[anchor-name:--plush-select-hl]:hidden supports-[anchor-name:--plush-select-hl]:group-has-[[data-highlighted],[data-state=checked]]/plush-select-viewport:opacity-100"
            )}
          />
        </SelectPrimitive.Viewport>
        <SelectScrollDownButton />
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Label>) {
  return (
    <SelectPrimitive.Label
      data-slot="select-label"
      className={cn(
        "px-2.5 pt-2 pb-1 text-(length:--plush-text-xs) leading-tight font-(--plush-weight-semi) wrap-anywhere text-(--plush-ink-2)",
        className
      )}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "relative flex min-h-(--plush-h-row) w-full min-w-0 cursor-default items-center gap-2 rounded-(--plush-radius-item) py-2.5 pr-9 pl-2.5 text-(length:--plush-text-lg) leading-tight font-(--plush-weight-medium) wrap-anywhere text-(--plush-ink) outline-hidden select-none",
        "data-[state=checked]:font-(--plush-weight-semi) data-disabled:pointer-events-none data-disabled:text-(--plush-ink-3)",
        // Highlight: the viewport's gliding fill, or a plain fill where anchor positioning is missing.
        "data-highlighted:[anchor-name:--plush-select-hl] [[data-position]:not(:has([data-highlighted]))_&]:data-[state=checked]:[anchor-name:--plush-select-hl]",
        "not-supports-[anchor-name:--plush-select-hl]:data-highlighted:bg-(--plush-fill)",
        // Rows follow the opening list one by one: a fade, and in popper mode a short drop on the spring (item-aligned
        // keeps the chosen row exactly over the field). From the ninth row on they all come with the eighth, so a long list
        // does not keep its last rows waiting for seconds.
        "starting:opacity-0 in-data-[position=popper]:starting:-translate-y-2 [transition:opacity_var(--plush-dur-fade)_var(--plush-ease-fade)_calc(min(sibling-index()-1,8)*var(--plush-stagger)),translate_var(--plush-dur-spring)_var(--plush-ease-spring)_calc(min(sibling-index()-1,8)*var(--plush-stagger))]",
        "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:min-w-0 *:[span]:last:items-center *:[span]:last:gap-2",
        className
      )}
      {...props}
    >
      <span className="pointer-events-none absolute right-2.5 flex size-4 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <HugeiconsIcon icon={Tick02Icon} size={16} strokeWidth={2.4} aria-hidden className="pointer-events-none [&_path]:[stroke-linejoin:miter]" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("pointer-events-none -mx-1.5 my-1.5 h-px bg-(--plush-line)", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  return (
    <SelectPrimitive.ScrollUpButton
      data-slot="select-scroll-up-button"
      className={cn(
        "z-10 flex cursor-default items-center justify-center bg-(--plush-surface) py-1 text-(--plush-ink-2) [&_svg:not([class*='size-'])]:size-4",
        // Hover scrolls the list; the grey arrow darkens to ink meanwhile.
        "[transition:color_var(--plush-dur-fast)_var(--plush-ease-fade)] hover:text-(--plush-ink)",
        className
      )}
      {...props}
    >
      <HugeiconsIcon icon={ChevronUpSharpIcon} size={16} strokeWidth={2.4} aria-hidden />
    </SelectPrimitive.ScrollUpButton>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  return (
    <SelectPrimitive.ScrollDownButton
      data-slot="select-scroll-down-button"
      className={cn(
        "z-10 flex cursor-default items-center justify-center bg-(--plush-surface) py-1 text-(--plush-ink-2) [&_svg:not([class*='size-'])]:size-4",
        // Hover scrolls the list; the grey arrow darkens to ink meanwhile.
        "[transition:color_var(--plush-dur-fast)_var(--plush-ease-fade)] hover:text-(--plush-ink)",
        className
      )}
      {...props}
    >
      <HugeiconsIcon icon={ChevronDownSharpIcon} size={16} strokeWidth={2.4} aria-hidden />
    </SelectPrimitive.ScrollDownButton>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
}
