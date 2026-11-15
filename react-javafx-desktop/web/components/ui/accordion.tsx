"use client"

import * as React from "react"
import { cn } from "cn"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import { Accordion as AccordionPrimitive } from "radix-ui"

// Sharp chevron (contract, "Icons"): Hugeicons draws its chevrons as a curve with a round tip; this is the same
// 12 x 6 angle in straight lines, mitred at the tip like the tick. The one drawn path of plush, the same text in every file.
const sharpChevron = (d: string): IconSvgElement => [["path", { d, stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "miter", strokeWidth: 1.5, key: "0" }]]
const ChevronDownSharpIcon = sharpChevron("M6 9L12 15L18 9")

// The answer opens and closes over its measured height (plush-accordion-down/up on the calm spring), so the card grows and
// shrinks with it; the chevron turns on the spring; on closing the answer fades and drifts 10 px up, on opening it fades
// in one beat (--plush-beat) after the height starts. Switching questions is one move: the old answer closes and the new
// one opens at the same moment, on the same spring, so the card's height goes straight from the old to the new value, and
// the two texts cross-fade (no beat). A tap shows a grey pill under the question. The trigger keeps its 4 px margin below,
// so its focus ring never touches the answer.

// Same href and text as in progress-ring.tsx, so React keeps one.
// Registers --plush-pop-armed as a number (a 0s transition with a delay flips it, the pop keyframes read it). A React <style> with an href lands in <head> once per page (also in
// the server HTML), however often it renders. Not in tokens.css: the shadcn CLI writes @property into globals.css again on
// every add.
const popArmedProperty = (
  <style href="plush-property-pop-armed" precedence="plush">
    {'@property --plush-pop-armed { syntax: "<number>"; inherits: false; initial-value: 0; }'}
  </style>
)

function Accordion({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return (
    <>
      {popArmedProperty}
      <AccordionPrimitive.Root
        data-slot="accordion"
        className={cn("plush-font flex w-full max-w-full min-w-0 flex-col", className)}
        {...props}
      />
    </>
  )
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn(
        // The separator: a 1 px line drawn inside the top of the next row (inset shadow), so it adds no height.
        "group/accordion-item mx-2.5 min-w-0 not-first:shadow-[inset_0_1px_0_var(--plush-fill)]",
        // Switching is one move: the opening item does not wait for a closing sibling (--plush-accordion-wait stays 0, read by
        // the height, the chevron and the gap below the question). Only its text: alone it fades in a beat after the height
        // starts; while a sibling's answer is still closing it fades in at once, so the two texts cross-fade instead of
        // leaving an empty answer between them.
        "[--plush-accordion-wait:0s] [--plush-accordion-fade-wait:var(--plush-beat)] [:has(>[data-state=closed]>[data-slot=accordion-content]:not([hidden]))>&[data-state=open]]:[--plush-accordion-fade-wait:0s]",
        // Armed: 1 while closed, 0 once open. An item that loads open is 0 from the start, so its answer is
        // simply there; one that opens stays 1 until its answer is fully in. The answer's keyframes (plush-accordion-down,
        // plush-accordion-fade-in) start from their end state times (1 - armed), so on load they run from end to end.
        "[--plush-pop-armed:1] data-[state=open]:[--plush-pop-armed:0] data-[state=open]:[transition:--plush-pop-armed_0s_linear_calc(var(--plush-accordion-wait)_+_var(--plush-beat)_+_max(var(--plush-dur-calm),var(--plush-dur-fade)))]",
        className
      )}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex min-w-0">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          // The row is the pill: 10 px wider than the text on both sides, 4 px clear of the separators.
          // No own ink (like the original): the question takes the text colour around it, so it reads on a dark card too.
          // Open, the answer tucks 4 px up under the question: the gap below the pill goes
          // with the answer's height, on the same curve and after the same wait, so nothing jumps.
          "data-[state=open]:mb-0 [transition:margin-bottom_var(--plush-dur-calm)_var(--plush-ease-calm)_var(--plush-accordion-wait)]",
          "group/accordion-trigger plush-focus-ring relative isolate -mx-2.5 my-1 flex min-w-0 flex-1 cursor-default items-start justify-between gap-3 rounded-(--plush-radius-item) px-2.5 py-2.25 text-start text-(length:--plush-text-lg) leading-tight font-(--plush-weight-semi) break-words select-none",
          // The tap: the pill fades in quickly while held and out slowly.
          "before:absolute before:inset-0 before:-z-1 before:rounded-[inherit] before:bg-(--plush-fill) before:opacity-0 before:[transition:opacity_var(--plush-dur-slow)_var(--plush-ease-fade),background-color_var(--plush-dur-slow)_var(--plush-ease-fade)]",
          // Hover (pointer devices only; a disabled row takes no pointer): the same pill one step lighter than the tap's,
          // on the quick fade. On a dark card (plush-on-dark) the light track of the dark ground, so the white words stay legible.
          "hover:before:bg-(--plush-fill-soft) hover:before:opacity-100 hover:before:[transition:opacity_var(--plush-dur-fast)_var(--plush-ease-fade),background-color_var(--plush-dur-fast)_var(--plush-ease-fade)]",
          "in-[.plush-on-dark]:before:bg-(--plush-on-accent-track-hover) in-[.plush-on-dark]:not-active:hover:before:bg-(--plush-on-accent-track-hover)",
          "active:before:bg-(--plush-fill) active:before:opacity-100 active:before:[transition-duration:var(--plush-dur-fast)]",
          // Pressed on a dark card: the see-through white one step stronger than its hover, not the light grey (white words stay legible).
          "in-[.plush-on-dark]:active:before:bg-(--plush-on-accent-track-press)",
          // Hit area over the 4 px gaps.
          "after:absolute after:inset-x-0 after:-inset-y-1",
          "disabled:pointer-events-none disabled:opacity-(--plush-disabled-opacity)",
          className
        )}
        {...props}
      >
        {children}
        <HugeiconsIcon
          icon={ChevronDownSharpIcon}
          size={16}
          strokeWidth={2.4}
          aria-hidden
          data-slot="accordion-trigger-icon"
          // Hover: the grey chevron takes the question's colour (darker on white, lighter on a dark card).
          className="pointer-events-none mt-0.5 shrink-0 text-(--plush-ink-2) [transition:rotate_var(--plush-dur-spring)_var(--plush-ease-spring)_var(--plush-accordion-wait),color_var(--plush-dur-fast)_var(--plush-ease-fade)] group-hover/accordion-trigger:text-current group-aria-expanded/accordion-trigger:rotate-180"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className={cn(
        "overflow-hidden text-(length:--plush-text-md) [--plush-pop-armed:inherit]",
        // Height on the calm spring, opening and closing alike, so a closing and an opening answer add up to a straight move.
        "data-[state=open]:animate-[plush-accordion-down_var(--plush-dur-calm)_var(--plush-ease-calm)_var(--plush-accordion-wait)_backwards]",
        "data-[state=closed]:animate-[plush-accordion-up_var(--plush-dur-calm)_var(--plush-ease-calm)]"
      )}
      {...props}
    >
      <div
        className={cn(
          "pb-3 leading-tight font-(--plush-weight-medium) break-words text-(--plush-ink-2) [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-(--plush-ink) [&_p:not(:last-child)]:mb-4 [--plush-pop-armed:inherit]",
          // Opening: the text fades in a beat after the height starts (at once while a sibling closes: cross-fade). Closing: it
          // fades and drifts up while the height goes. Keyed to its own answer (the parent), so an answer nested in an open
          // item still fades out. backwards, not both: a fill that held opacity 1 after the fade-in would block the fade-out.
          "[[data-state=open]>&]:animate-[plush-accordion-fade-in_var(--plush-dur-fade)_var(--plush-ease-fade)_var(--plush-accordion-fade-wait)_backwards]",
          "[transition:opacity_var(--plush-dur-fade)_var(--plush-ease-fade),translate_var(--plush-dur-calm)_var(--plush-ease-calm)]",
          "[[data-state=closed]>&]:-translate-y-2.5 [[data-state=closed]>&]:opacity-0",
          className
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Content>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
