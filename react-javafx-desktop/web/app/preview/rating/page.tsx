"use client"

import * as React from "react"

import { Rating } from "@/components/ui/rating"

// The words under the title follow the value. They roll: the old words leave upwards and the new
// ones come from below when the rating rises, the other way round when it falls.
const words = ["Tell Maya", "Not great", "It was okay", "Pretty good", "Really good", "Loved it"]

function Ask({
  id,
  title,
  defaultValue,
  className,
  ...props
}: Omit<React.ComponentProps<typeof Rating>, "value" | "onValueChange"> & {
  id: string
  title: string
  defaultValue: number
}) {
  const [value, setValue] = React.useState(defaultValue)
  return (
    <div className="flex min-w-0 flex-col items-center text-center leading-[normal]">
      <p id={id} className="min-w-0 text-(length:--plush-text-xl) font-(--plush-weight-semi) break-words">
        {title}
      </p>
      <p className="mt-0.75 grid min-w-0 text-(length:--plush-text-sm) font-(--plush-weight-medium) text-(--plush-ink-2)">
        {words.map((word, i) => (
          <span
            key={word}
            aria-hidden={i !== value}
            data-pos={i < value ? "before" : i > value ? "after" : "on"}
            className={[
              "col-start-1 row-start-1 min-w-0 break-words",
              "[transition:translate_var(--plush-dur-spring)_var(--plush-ease-spring),opacity_var(--plush-dur-fade)_var(--plush-ease-fade)]",
              "data-[pos=after]:translate-y-2 data-[pos=after]:opacity-0 data-[pos=before]:-translate-y-2 data-[pos=before]:opacity-0",
            ].join(" ")}
          >
            {word}
          </span>
        ))}
      </p>
      <Rating
        value={value}
        onValueChange={setValue}
        aria-labelledby={id}
        className={`mt-3.5 justify-center ${className ?? ""}`}
        {...props}
      />
    </div>
  )
}

export default function RatingPreview() {
  return (
    <main className="plush-font min-h-screen bg-(--plush-bg) p-8 text-(--plush-ink)">
      <div className="flex flex-col items-start gap-8">
        <section
          data-tile=""
          className="flex h-[228px] w-[211px] max-w-full items-center justify-center rounded-(--plush-radius-panel) bg-(--plush-panel) p-(--plush-pad)"
        >
          <Ask id="dinner" title="How was dinner?" defaultValue={1} />
        </section>

        <div className="flex flex-wrap items-start gap-10">
          <Rating defaultValue={3} aria-label="Delivery" />
          <Rating aria-label="Nothing chosen yet" />
          <Rating defaultValue={4} readOnly aria-label="Average, read-only" />
          <Rating defaultValue={2} disabled aria-label="Delivery, disabled" />
          <Rating defaultValue={7} max={10} aria-label="Out of ten" />
        </div>

        <section
          data-testid="w240"
          className="flex w-[240px] flex-col items-center gap-6 rounded-(--plush-radius-card) bg-(--plush-panel) px-3 py-6"
        >
          <Ask
            id="long"
            title="How was the long dinner on Friday night with everyone from the old flat?"
            defaultValue={5}
          />
          <Rating defaultValue={7} max={10} aria-label="Out of ten, narrow" className="justify-center" />
        </section>

        <div data-states="" className="flex flex-wrap items-center gap-10">
          <form data-case="form" className="flex items-center gap-4">
            <Rating name="stars" required aria-label="Rating in a form" />
            <button type="reset" className="plush-focus-ring rounded-(--plush-radius-full) bg-(--plush-fill) px-4 py-2">
              Reset
            </button>
          </form>
          <Rating data-case="invalid-empty" aria-invalid aria-label="Invalid, nothing chosen" />
          <Rating data-case="invalid" aria-invalid defaultValue={3} aria-label="Invalid, three" />
          <Rating data-case="readonly-10" readOnly defaultValue={6} max={10} aria-label="Read-only out of ten" />
          <Rating data-case="one" max={1} defaultValue={1} aria-label="One star" />
          <Rating data-case="rtl" dir="rtl" defaultValue={3} aria-label="Right to left" />
          <section data-narrow="160" className="w-[160px] rounded-(--plush-radius-card) bg-(--plush-panel) px-2 py-4">
            <Rating defaultValue={7} max={10} aria-label="Out of ten, 160" />
          </section>
          <section data-dark="" className="rounded-(--plush-radius-card) bg-(--plush-accent) p-(--plush-pad)">
            <Rating defaultValue={3} aria-label="On a dark card" />
          </section>
        </div>
      </div>
    </main>
  )
}
