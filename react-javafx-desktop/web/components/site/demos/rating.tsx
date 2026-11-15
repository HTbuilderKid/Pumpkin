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

// The rating tile (content from app/preview/rating).
export function RatingDemo() {
  const id = React.useId()
  return <Ask id={id} title="How was dinner?" defaultValue={1} />
}
