"use client"

import * as React from "react"
import { cn } from "cn"
import { OTPInput, OTPInputContext } from "input-otp"
import { HugeiconsIcon } from "@hugeicons/react"
import { MinusSignIcon } from "@hugeicons/core-free-icons"

// Six white boxes; a typed digit pops in on the spring (scale from --plush-pop-scale, quick fade). One caret and one focus ring glide
// from box to box: two spans at the end of the row (data-slot plush-input-otp-ring, plush-input-otp-caret), anchored (CSS
// anchor positioning) to the active slot. Real elements, not ::before/::after of the row: Safari starts no transition on
// a pseudo-element that a :has() rule restyles at the same moment, so both jumped there. Browsers without anchor
// positioning get both drawn in the active slot itself, like the original.
// The library hides the real input with an inline `outline: 0`, so plush-focus-ring on it could never show; the ring is
// drawn on the active slot from the same --plush-focus-* values instead.
// A selected digit (active slot with a digit: typing replaces it) is the selection, drawn in the green ink.

// The gliding focus ring (the outline of plush-focus-ring) and caret, laid over the active slot. Moving only while a slot is
// active: without one the anchor is gone, so both vanish at once instead of fading (a fade would show them jumping); the
// caret fades out in place when the last digit fills the code.
const otpGlide = (
  <>
    <span
      aria-hidden="true"
      data-slot="plush-input-otp-ring"
      className={cn(
        "pointer-events-none absolute z-10 rounded-(--plush-radius-row) opacity-0 [outline:var(--plush-focus-width)_solid_var(--plush-focus-color)] [outline-offset:var(--plush-focus-offset)]",
        "[position-anchor:--plush-otp-caret] top-[anchor(top)] right-[anchor(right)] bottom-[anchor(bottom)] left-[anchor(left)]",
        "group-has-data-[active=true]/input-otp:[transition:top_var(--plush-dur-spring)_var(--plush-ease-spring),right_var(--plush-dur-spring)_var(--plush-ease-spring),bottom_var(--plush-dur-spring)_var(--plush-ease-spring),left_var(--plush-dur-spring)_var(--plush-ease-spring),opacity_var(--plush-dur-fade)_var(--plush-ease-fade)]",
        "not-supports-[anchor-name:--plush-otp-caret]:hidden supports-[anchor-name:--plush-otp-caret]:group-has-data-[active=true]/input-otp:opacity-100"
      )}
    />
    {/* Caret: 2 x 28, centred in the active slot. */}
    <span
      aria-hidden="true"
      data-slot="plush-input-otp-caret"
      className={cn(
        "pointer-events-none absolute z-10 h-(--plush-caret-h) w-(--plush-caret-w) -translate-x-1/2 -translate-y-1/2 rounded-(--plush-radius-caret) bg-(--plush-accent) opacity-0",
        "[position-anchor:--plush-otp-caret] top-[anchor(center)] left-[anchor(center)]",
        "group-has-data-[active=true]/input-otp:[transition:left_var(--plush-dur-spring)_var(--plush-ease-spring),opacity_var(--plush-dur-fast)_var(--plush-ease-fade)]",
        "not-supports-[anchor-name:--plush-otp-caret]:hidden supports-[anchor-name:--plush-otp-caret]:group-has-data-[slot=input-otp-caret]/input-otp:opacity-100"
      )}
    />
  </>
)

function InputOTP({
  className,
  containerClassName,
  ...props
}: React.ComponentProps<typeof OTPInput> & {
  containerClassName?: string
}) {
  // Ring and caret go into the row itself (they glide across groups), after the slots, with either children or render.
  const { render } = props
  const content = render
    ? { render: (slots: Parameters<typeof render>[0]) => <>{render(slots)}{otpGlide}</> }
    : { children: <>{props.children}{otpGlide}</> }
  const otpProps = {
    "data-slot": "input-otp",
    containerClassName: cn(
      "group/input-otp plush-font flex max-w-full min-w-0 items-center gap-(--plush-code-gap) [anchor-scope:--plush-otp-caret] has-disabled:opacity-(--plush-disabled-opacity)",
      // A pressed box gives a little on the spring (the slot itself carries the transition).
      "has-[input:active]:[&_[data-slot=input-otp-slot][data-active=true]]:scale-(--plush-press-scale-pill)",
      containerClassName
    ),
    spellCheck: false,
    className: cn("disabled:cursor-not-allowed", className),
    ...props,
    ...content,
    // The library types children and render as exclusive; content replaces whichever of the two was given.
  } as unknown as React.ComponentProps<typeof OTPInput>
  return <OTPInput {...otpProps} />
}

function InputOTPGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-group"
      className={cn("flex min-w-0 items-center gap-(--plush-code-gap)", className)}
      {...props}
    />
  )
}

function InputOTPSlot({
  index,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  index: number
}) {
  const inputOTPContext = React.useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext?.slots[index] ?? {}

  return (
    <div
      data-slot="input-otp-slot"
      data-active={isActive}
      className={cn(
        // In a narrow row every slot shrinks alike, down to one digit's width (1ch): an empty slot used to fold to a sliver
        // next to its filled neighbours, which stopped at their glyph.
        "relative flex h-(--plush-h-code) w-(--plush-code-box) min-w-[1ch] items-center justify-center rounded-(--plush-radius-row) bg-(--plush-surface) text-(length:--plush-text-code) leading-none font-(--plush-weight-semi) text-(--plush-ink) shadow-(--plush-card-shadow) select-none",
        "data-[active=true]:[anchor-name:--plush-otp-caret]",
        // Selected digit: green ink fades in under it.
        "before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:bg-(image:--plush-select-fill) before:shadow-(--plush-select-gloss) before:opacity-0 before:transition-opacity before:duration-(--plush-dur-fade) before:ease-(--plush-ease-fade)",
        "[&[data-active=true]:not(:has([data-slot=input-otp-caret]))]:text-(--plush-on-select) [&[data-active=true]:not(:has([data-slot=input-otp-caret]))]:before:opacity-100",
        // Error: the library's red edge, a 2 px ring right outside each box, faded in; the black focus ring stays black and
        // glides just outside it. Set on a slot (as in shadcn) or on InputOTP itself (the input), which marks every box.
        "[transition:scale_var(--plush-dur-spring)_var(--plush-ease-spring),background-color_var(--plush-dur-fast)_var(--plush-ease-fade),box-shadow_var(--plush-dur-fade)_var(--plush-ease-fade)]",
        // Hover: the library lays one transparent input over the whole row, so the row is one field under the pointer and
        // every box lifts together: white stays, the card shadow turns into the knob shadow (quick fade). Pointer devices
        // only (the media query: a :hover inside a group-[…] is not wrapped by Tailwind), never disabled or read-only.
        "[@media(hover:hover)]:group-[:hover:not(:has(input:disabled,input[readonly]))]/input-otp:shadow-(--plush-active-shadow) [@media(hover:hover)]:group-[:hover:not(:has(input:disabled,input[readonly]))]/input-otp:bg-(--plush-surface-hover)",
        "[@media(hover:hover)]:group-[:hover:not(:has(input:disabled,input[readonly]))]/input-otp:[transition:scale_var(--plush-dur-spring)_var(--plush-ease-spring),background-color_var(--plush-dur-fast)_var(--plush-ease-fade),box-shadow_var(--plush-dur-fast)_var(--plush-ease-fade)]",
        "aria-invalid:ring-(length:--plush-focus-width) aria-invalid:ring-(--plush-danger)",
        "group-has-[input[aria-invalid=true]]/input-otp:ring-(length:--plush-focus-width) group-has-[input[aria-invalid=true]]/input-otp:ring-(--plush-danger)",
        // Without anchor positioning the ring sits on the slot itself.
        "not-supports-[anchor-name:--plush-otp-caret]:data-[active=true]:[outline:var(--plush-focus-width)_solid_var(--plush-focus-color)] not-supports-[anchor-name:--plush-otp-caret]:data-[active=true]:[outline-offset:var(--plush-focus-offset)]",
        className
      )}
      {...props}
    >
      {char ? (
        // Keyed by the digit: a new or replaced digit mounts again and pops in. Gated on focus, so a prefilled code
        // stands still on page load.
        <span
          key={char}
          className="relative block [transition:scale_var(--plush-dur-spring)_var(--plush-ease-spring),opacity_var(--plush-dur-fast)_var(--plush-ease-fade)] starting:in-[[data-input-otp-container]:focus-within]:scale-(--plush-pop-scale) starting:in-[[data-input-otp-container]:focus-within]:opacity-0"
        >
          {char}
        </span>
      ) : null}
      {hasFakeCaret && (
        // Marks the caret position for the gliding caret on the row; drawn here only without anchor positioning.
        <div
          data-slot="input-otp-caret"
          className="pointer-events-none absolute inset-0 flex items-center justify-center supports-[anchor-name:--plush-otp-caret]:hidden"
        >
          <div className="h-(--plush-caret-h) w-(--plush-caret-w) rounded-(--plush-radius-caret) bg-(--plush-accent)" />
        </div>
      )}
    </div>
  )
}

function InputOTPSeparator({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-otp-separator"
      className={cn("flex shrink-0 items-center text-(--plush-ink-3) [&_svg:not([class*='size-'])]:size-4", className)}
      role="separator"
      {...props}
    >
      <HugeiconsIcon icon={MinusSignIcon} size={16} strokeWidth={2.4} aria-hidden />
    </div>
  )
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
