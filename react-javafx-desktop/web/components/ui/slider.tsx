"use client"

import * as React from "react"
import { cn } from "cn"
import { Direction, Slider as SliderPrimitive } from "radix-ui"

// A thin track with the green gradient fill (
// the knob moves from stop to stop on the calm spring, the fill follows it).
// Radix places each knob through the inline `left` (vertical: `bottom`) of the span around the thumb and the range
// through its inline edges; both glide on the calm spring for jumps (click on the track, keys).
// - Dragging follows the finger directly: a thumb held down switches the glide off at once; a press on the track keeps
//   the spring for the jump and switches it off --plush-dur-fast later, while the finger is still down (a delayed,
//   discrete transition of the duration variable), so a drag that starts on the track does not trail behind.
// - The glide is only on while the slider is pressed or holds focus (Radix focuses the knob on every click and key), so
//   the in-bounds correction Radix applies after its first measurement does not slide the knob on page load.
// - The visible knob is the thumb's ::before. Held down it widens by --plush-knob-stretch along the track, like the
//   switch knob; the thumb box Radix measures keeps its size.
function Slider({
  className,
  defaultValue,
  value,
  min = 0,
  max = 100,
  ...props
}: React.ComponentProps<typeof SliderPrimitive.Root>) {
  const _values = React.useMemo(
    () =>
      Array.isArray(value)
        ? value
        : Array.isArray(defaultValue)
          ? defaultValue
          : [min, max],
    [value, defaultValue, min, max]
  )
  // The fill starts green where the slider starts: mirrored when it runs from the right (rtl or inverted) or from the top.
  const direction = Direction.useDirection(props.dir)
  const reversed =
    props.orientation === "vertical" ? Boolean(props.inverted) : (direction === "rtl") !== Boolean(props.inverted)

  return (
    <SliderPrimitive.Root
      data-slot="slider"
      defaultValue={defaultValue}
      value={value}
      min={min}
      max={max}
      className={cn(
        "group/slider plush-font relative flex w-full touch-none items-center select-none",
        "data-[orientation=vertical]:h-full data-[orientation=vertical]:min-h-40 data-[orientation=vertical]:w-auto data-[orientation=vertical]:flex-col",
        "data-disabled:cursor-not-allowed data-disabled:opacity-(--plush-disabled-opacity)",
        // Glide duration: the calm spring; pressed on the track it drops to 0 after --plush-dur-fast, on a held thumb at once.
        "[--plush-slider-glide:var(--plush-dur-calm)]",
        "active:[--plush-slider-glide:0ms] active:[transition:--plush-slider-glide_0s_var(--plush-dur-fast)_allow-discrete]",
        "has-[[data-slot=slider-thumb]:active]:[transition:none]",
        // The span Radix wraps around each thumb carries its position.
        "[&:is(:focus-within,:active)>:has(>[data-slot=slider-thumb])]:[transition:left_var(--plush-slider-glide)_var(--plush-ease-calm),right_var(--plush-slider-glide)_var(--plush-ease-calm),top_var(--plush-slider-glide)_var(--plush-ease-calm),bottom_var(--plush-slider-glide)_var(--plush-ease-calm)]",
        className
      )}
      {...props}
    >
      <SliderPrimitive.Track
        data-slot="slider-track"
        className={cn(
          "relative grow overflow-hidden rounded-(--plush-radius-full) bg-(--plush-fill-strong)",
          // Hover over the slider (mouse only, never disabled): the empty track one grey darker (--plush-control-hover, the
          // grey of an empty control under the pointer), the green range only a little brighter, the knob grows (see the thumb).
          "[transition:background-color_var(--plush-dur-fast)_var(--plush-ease-fade)] [@media(hover:hover)]:group-[:not([data-disabled]):hover]/slider:bg-(--plush-control-hover)",
          "data-[orientation=horizontal]:h-(--plush-track) data-[orientation=horizontal]:w-full",
          "data-[orientation=vertical]:h-full data-[orientation=vertical]:w-(--plush-track)"
        )}
      >
        <SliderPrimitive.Range
          data-slot="slider-range"
          className={cn(
            "absolute rounded-(--plush-radius-full) bg-(image:--plush-select-line) shadow-(--plush-select-gloss) select-none",
            "data-[orientation=horizontal]:h-full",
            "data-[orientation=vertical]:w-full data-[orientation=vertical]:bg-(image:--plush-select-up)",
            reversed && "data-[orientation=horizontal]:-scale-x-100 data-[orientation=vertical]:-scale-y-100",
            "[transition:filter_var(--plush-dur-fast)_var(--plush-ease-fade)] [@media(hover:hover)]:group-[:not([data-disabled]):hover]/slider:brightness-(--plush-hover-bright)",
            "group-[:is(:focus-within,:active)]/slider:[transition:left_var(--plush-slider-glide)_var(--plush-ease-calm),right_var(--plush-slider-glide)_var(--plush-ease-calm),top_var(--plush-slider-glide)_var(--plush-ease-calm),bottom_var(--plush-slider-glide)_var(--plush-ease-calm),filter_var(--plush-dur-fast)_var(--plush-ease-fade)]"
          )}
        />
      </SliderPrimitive.Track>
      {Array.from({ length: _values.length }, (_, index) => (
        <SliderPrimitive.Thumb
          data-slot="slider-thumb"
          key={index}
          className={cn(
            "plush-focus-ring relative block size-(--plush-knob) shrink-0 rounded-(--plush-radius-full) select-none",
            // The knob: white, soft shadow.
            "before:absolute before:inset-0 before:rounded-[inherit] before:bg-(--plush-surface) before:shadow-(--plush-shadow-knob)",
            "before:[transition:left_var(--plush-dur-spring)_var(--plush-ease-spring),right_var(--plush-dur-spring)_var(--plush-ease-spring),top_var(--plush-dur-spring)_var(--plush-ease-spring),bottom_var(--plush-dur-spring)_var(--plush-ease-spring),scale_var(--plush-dur-spring)_var(--plush-ease-spring)]",
            // Hover over the slider: the knob grows a little on the spring; not while the slider is held (it stretches then).
            "[@media(hover:hover)]:group-[:not([data-disabled]):hover:not(:active)]/slider:before:scale-(--plush-hover-grow)",
            // Held (the slider pressed and this knob the one that moves): wider along the track.
            "group-active/slider:focus:before:inset-x-[calc(var(--plush-knob-stretch)/-2)]",
            "data-[orientation=vertical]:group-active/slider:focus:before:inset-x-0 data-[orientation=vertical]:group-active/slider:focus:before:inset-y-[calc(var(--plush-knob-stretch)/-2)]",
            // Larger hit area, as in the original.
            "after:absolute after:-inset-2"
          )}
        />
      ))}
    </SliderPrimitive.Root>
  )
}

export { Slider }
