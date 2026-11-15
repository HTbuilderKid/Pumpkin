import * as React from "react"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const splits = [
  ["evenly", "Evenly"],
  ["item", "By item"],
  ["share", "By share"],
  ["percent", "Percent"],
  ["custom", "Custom"],
]

const cities = Array.from({ length: 40 }, (_, i) => `City ${i + 1}`)
const fifty = Array.from({ length: 50 }, (_, i) => `Stadt ${i + 1}`)

// Dark ground: the focus ring is black (--plush-focus-color), so a dark container carries plush-on-dark (light ring).
const dark = "rounded-(--plush-radius-card) bg-(--plush-accent) p-4 plush-on-dark"
const btn = "plush-focus-ring h-10 shrink-0 rounded-(--plush-radius-full) bg-(--plush-accent) px-4 text-(length:--plush-text-md) font-(--plush-weight-semi) text-(--plush-on-accent)"

export default function SelectPreview() {
  return (
    <main className="plush-font flex min-h-screen flex-wrap items-start gap-8 bg-(--plush-bg) p-8 text-(--plush-ink)">
      <section className="w-[210px] rounded-(--plush-radius-panel) bg-(--plush-panel) p-(--plush-pad)">
        <p id="split-by" className="text-[17px] leading-tight font-(--plush-weight-semi)">
          Split by
        </p>
        <Select defaultValue="evenly">
          <SelectTrigger aria-labelledby="split-by" className="my-2.5 w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper">
            {splits.map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      <section className="flex flex-col items-start gap-4">
        <Select defaultValue="pear">
          <SelectTrigger aria-label="Fruit">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Fruit</SelectLabel>
              <SelectItem value="apple">Apple</SelectItem>
              <SelectItem value="pear">Pear</SelectItem>
              <SelectItem value="plum" disabled>
                Plum
              </SelectItem>
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel>Vegetables</SelectLabel>
              <SelectItem value="leek">Leek</SelectItem>
              <SelectItem value="kale">Kale</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger size="sm" aria-label="Size">
            <SelectValue placeholder="Pick a size" />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="s">Small</SelectItem>
            <SelectItem value="m">Medium</SelectItem>
            <SelectItem value="l">Large</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="evenly" disabled>
          <SelectTrigger aria-label="Split by, disabled">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="evenly">Evenly</SelectItem>
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger aria-label="Required" aria-invalid="true">
            <SelectValue placeholder="Required" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="yes">Yes</SelectItem>
            <SelectItem value="no">No</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="City 1">
          <SelectTrigger aria-label="City">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper">
            {cities.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      <section
        data-testid="w240"
        className="w-[240px] rounded-(--plush-radius-card) bg-(--plush-surface) p-3 shadow-(--plush-card-shadow)"
      >
        <Select defaultValue="long">
          <SelectTrigger aria-label="Long entries" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectGroup>
              <SelectLabel>A group label that is long enough to wrap onto a second line</SelectLabel>
              <SelectItem value="long">
                Split the bill by the share each person ordered, including tips and taxes
              </SelectItem>
              <SelectItem value="word">Supercalifragilisticexpialidocious-and-more</SelectItem>
              <SelectItem value="short">Evenly</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </section>

      <section data-states="" className="flex flex-col items-start gap-4">
        <Select defaultValue="item">
          <SelectTrigger aria-label="Invalid, chosen" aria-invalid="true">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {splits.map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select defaultValue="item" disabled>
          <SelectTrigger aria-label="Invalid, disabled" aria-invalid="true">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="item">By item</SelectItem>
          </SelectContent>
        </Select>
        <form className="flex flex-wrap items-center gap-3">
          <Select name="split" required>
            <SelectTrigger aria-label="Split, required">
              <SelectValue placeholder="Pick one" />
            </SelectTrigger>
            <SelectContent>
              {splits.map(([value, label]) => (
                <SelectItem key={value} value={value}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <button type="submit" className={btn}>Send</button>
          <button type="reset" className={btn}>Reset</button>
        </form>
        <Select>
          <SelectTrigger aria-label="Fifty entries">
            <SelectValue placeholder="Fifty entries" />
          </SelectTrigger>
          <SelectContent>
            {fifty.map((city) => (
              <SelectItem key={city} value={city}>
                {city}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </section>

      <section data-dark="" className={`flex flex-col items-start gap-4 ${dark}`}>
        <Select defaultValue="evenly">
          <SelectTrigger aria-label="Dark">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper">
            {splits.map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select>
          <SelectTrigger aria-label="Dark, invalid" aria-invalid="true">
            <SelectValue placeholder="Required" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="yes">Yes</SelectItem>
          </SelectContent>
        </Select>
      </section>

      <section data-narrow160="" dir="rtl" className="w-[160px] rounded-(--plush-radius-card) bg-(--plush-surface) p-3 shadow-(--plush-card-shadow)">
        <Select defaultValue="a">
          <SelectTrigger aria-label="Right to left, 160" className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent position="popper">
            <SelectItem value="a">مايا Grüße 👋🏽 Donaudampfschifffahrt</SelectItem>
            <SelectItem value="b">Leo</SelectItem>
          </SelectContent>
        </Select>
      </section>
    </main>
  )
}
