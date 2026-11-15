import * as React from "react"

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

// Rows: each row is a <label> around the circle, so the whole row picks. One light green plate glides to
// the chosen row on the calm spring: a <span> at the end of the group, anchored (CSS anchor positioning) to the row that
// holds the checked circle. A real element, not the group's ::after: Safari starts no transition on a pseudo-element that a
// :has() rule restyles at the same moment, so the plate jumped there. Without anchor positioning the chosen row carries
// the plate itself.
const plate = "group/plush-radio-plate relative [anchor-scope:--plush-radio-plate]"

function Plate() {
  return (
    <span
      aria-hidden="true"
      data-slot="plush-radio-plate"
      className={[
        "pointer-events-none absolute rounded-(--plush-radius-row) bg-(image:--plush-select-line) opacity-0 shadow-(--plush-radio-plate-edge) mix-blend-multiply",
        "[position-anchor:--plush-radio-plate] top-[anchor(top)] right-[anchor(right)] bottom-[anchor(bottom)] left-[anchor(left)]",
        "[transition:top_var(--plush-dur-calm)_var(--plush-ease-calm),bottom_var(--plush-dur-calm)_var(--plush-ease-calm),opacity_var(--plush-dur-fade)_var(--plush-ease-fade)]",
        "not-supports-[anchor-name:--plush-radio-plate]:hidden supports-[anchor-name:--plush-radio-plate]:group-has-data-[state=checked]/plush-radio-plate:opacity-(--plush-radio-plate-opacity)",
      ].join(" ")}
    />
  )
}

function Option({
  title,
  note,
  ...props
}: React.ComponentProps<typeof RadioGroupItem> & { title: string; note: string }) {
  return (
    <label
      className={[
        "group/option relative flex min-h-(--plush-h-option) min-w-0 items-center gap-3 rounded-(--plush-radius-row) bg-(--plush-surface) px-4 py-2",
        // Hover: the white row stays white and takes the stronger shadow (the circle reacts through its label).
        "[transition:scale_var(--plush-dur-spring)_var(--plush-ease-spring),box-shadow_var(--plush-dur-fast)_var(--plush-ease-fade)] not-has-disabled:active:scale-(--plush-press-scale-row) not-has-disabled:hover:shadow-(--plush-active-shadow)",
        "has-data-[state=checked]:[anchor-name:--plush-radio-plate] has-disabled:cursor-not-allowed has-disabled:text-(--plush-ink-3)",
        "after:pointer-events-none after:absolute after:inset-0 after:rounded-[inherit] after:bg-(image:--plush-select-line) after:opacity-0 after:shadow-(--plush-radio-plate-edge) after:mix-blend-multiply",
        "not-supports-[anchor-name:--plush-radio-plate]:has-data-[state=checked]:after:opacity-(--plush-radio-plate-opacity)",
      ].join(" ")}
    >
      <RadioGroupItem {...props} />
      <span className="flex min-w-0 flex-1 flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5 leading-tight break-words">
        <span className="min-w-0 text-[16px] font-(--plush-weight-semi)">{title}</span>
        <span className="min-w-0 text-[15px] font-(--plush-weight-medium) text-(--plush-ink-2) group-has-disabled/option:text-(--plush-ink-3)">
          {note}
        </span>
      </span>
    </label>
  )
}

function Choice({ id, label, ...props }: React.ComponentProps<typeof RadioGroupItem> & { id: string; label: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <RadioGroupItem id={id} {...props} />
      <label htmlFor={id} className="min-w-0 text-[16px] leading-tight font-(--plush-weight-medium) break-words">
        {label}
      </label>
    </div>
  )
}

// Dark ground: the focus ring is black (--plush-focus-color), so a dark container carries plush-on-dark (light ring).
const dark = "rounded-(--plush-radius-card) bg-(--plush-accent) p-4 text-(--plush-on-accent) plush-on-dark"
const btn = "plush-focus-ring h-10 shrink-0 rounded-(--plush-radius-full) bg-(--plush-accent) px-4 text-(length:--plush-text-md) font-(--plush-weight-semi) text-(--plush-on-accent)"

export default function RadioGroupPreview() {
  return (
    <main className="plush-font min-h-screen bg-(--plush-bg) p-8 text-(--plush-ink)">
      <div className="flex flex-col items-start gap-8">
        <section
          data-tile=""
          className="flex min-h-[228px] w-[441px] max-w-full items-center rounded-(--plush-radius-panel) bg-(--plush-panel-tint) p-(--plush-pad)"
        >
          <RadioGroup defaultValue="evenly" aria-label="Split" className={plate}>
            <Option value="evenly" title="Split evenly" note="$24.00 each" />
            <Option value="item" title="By item" note="Pay what you ate" />
            <Option value="custom" title="Custom" note="Set amounts" />
            <Plate />
          </RadioGroup>
        </section>

        <div className="flex flex-wrap items-start gap-10">
          <RadioGroup defaultValue="comfortable" aria-label="Spacing" className="w-fit">
            <Choice id="spacing-default" value="default" label="Default" />
            <Choice id="spacing-comfortable" value="comfortable" label="Comfortable" />
            <Choice id="spacing-compact" value="compact" label="Compact" />
          </RadioGroup>

          <RadioGroup defaultValue="card" aria-label="Pay with" className="w-fit">
            <Choice id="pay-card" value="card" label="Card" />
            <Choice id="pay-cash" value="cash" label="Cash, disabled" disabled />
          </RadioGroup>

          <RadioGroup defaultValue="bank" aria-label="Pay with, disabled" disabled className="w-fit">
            <Choice id="off-bank" value="bank" label="Bank transfer" />
            <Choice id="off-card" value="card" label="Card" />
          </RadioGroup>

          <RadioGroup aria-label="Required" className="w-fit">
            <Choice id="req-yes" value="yes" label="Yes" aria-invalid="true" />
            <Choice id="req-no" value="no" label="No" aria-invalid="true" />
          </RadioGroup>
        </div>

        <section
          data-testid="w240"
          className="w-[240px] rounded-(--plush-radius-card) bg-(--plush-panel-tint) p-3"
        >
          <RadioGroup defaultValue="share" aria-label="Split, narrow" className={plate}>
            <Option
              value="share"
              title="Split the bill by the share each person ordered, tips and taxes included"
              note="Everyone pays exactly what they had, rounded up to the next whole cent"
            />
            <Option value="evenly" title="Split evenly" note="$24.00 each" />
            <Option value="custom" title="Custom" note="Set amounts" disabled />
            <Plate />
          </RadioGroup>
          <RadioGroup
            defaultValue="long"
            aria-label="Long label"
            className="mt-3 rounded-(--plush-radius-row) bg-(--plush-surface) p-4"
          >
            <Choice
              id="long"
              value="long"
              label="Remind every friend who still owes you something, every single evening, until the bill is paid"
            />
            <Choice id="short" value="short" label="Never" />
          </RadioGroup>
        </section>

        <div data-states="" className="flex flex-wrap items-start gap-10">
          <RadioGroup defaultValue="yes" aria-label="Invalid, checked" className="w-fit">
            <Choice id="inv-yes" value="yes" label="Yes" aria-invalid="true" />
            <Choice id="inv-no" value="no" label="No, disabled" aria-invalid="true" disabled />
          </RadioGroup>
          <form className="flex flex-wrap items-center gap-3">
            <RadioGroup name="split" required aria-label="Split, required" className="w-fit">
              <Choice id="form-even" value="evenly" label="Evenly" />
              <Choice id="form-item" value="item" label="By item" />
            </RadioGroup>
            <button type="submit" className={btn}>Send</button>
            <button type="reset" className={btn}>Reset</button>
          </form>
          <RadioGroup defaultValue="a" aria-label="Dark" data-dark="" className={`w-fit ${dark}`}>
            <Choice id="dark-a" value="a" label="Grüße 👋🏽" />
            <Choice id="dark-b" value="b" label="Invalid" aria-invalid="true" />
          </RadioGroup>
          <RadioGroup defaultValue="a" aria-label="Right to left, 160" dir="rtl" data-narrow160="" className="w-[160px]">
            <Choice id="rtl-a" value="a" label="مايا Donaudampfschifffahrt" />
            <Choice id="rtl-b" value="b" label="Leo" />
          </RadioGroup>
        </div>
      </div>
    </main>
  )
}
