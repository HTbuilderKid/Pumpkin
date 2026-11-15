import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { TextBoldIcon, TextItalicIcon, TextUnderlineIcon } from "@hugeicons/core-free-icons"

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

const dishes = [
  ["pizza", "Pizza"],
  ["salad", "Salad"],
  ["drinks", "Drinks"],
  ["tiramisu", "Tiramisu"],
]

function Dishes() {
  return dishes.map(([value, label]) => (
    <ToggleGroupItem key={value} value={value}>
      {label}
    </ToggleGroupItem>
  ))
}

function Marks() {
  return [
    ["bold", TextBoldIcon],
    ["italic", TextItalicIcon],
    ["underline", TextUnderlineIcon],
  ].map(([value, icon]) => (
    <ToggleGroupItem key={value as string} value={value as string} aria-label={value as string}>
      <HugeiconsIcon icon={icon as typeof TextBoldIcon} size={16} strokeWidth={2.4} aria-hidden />
    </ToggleGroupItem>
  ))
}

const card = "rounded-(--plush-radius-card) bg-(--plush-panel) p-(--plush-pad)"
const dark = "rounded-(--plush-radius-card) bg-(--plush-accent) p-(--plush-pad) text-(--plush-on-accent) plush-on-dark"

export default function ToggleGroupPreview() {
  return (
    <main className="plush-font min-h-screen bg-(--plush-bg) p-8 text-(--plush-ink)">
      <div className="flex flex-col items-start gap-8">
        {/* The tile: same chips, Drinks and Tiramisu chosen. */}
        <section
          data-tile=""
          className="flex min-h-[104px] w-[441px] max-w-full items-center justify-center rounded-(--plush-radius-panel) bg-(--plush-panel) p-(--plush-pad)"
        >
          <ToggleGroup type="multiple" defaultValue={["drinks", "tiramisu"]} aria-label="What did you have">
            <Dishes />
          </ToggleGroup>
        </section>

        <section className={`flex flex-wrap items-start gap-6 ${card}`}>
          <ToggleGroup type="single" defaultValue="salad" aria-label="Single">
            <Dishes />
          </ToggleGroup>
          <ToggleGroup type="multiple" variant="outline" defaultValue={["pizza"]} aria-label="Outline">
            <Dishes />
          </ToggleGroup>
        </section>

        <section className={`flex flex-wrap items-start gap-6 ${card}`}>
          <ToggleGroup type="multiple" size="sm" defaultValue={["pizza"]} aria-label="Small">
            <Dishes />
          </ToggleGroup>
          <ToggleGroup type="multiple" size="lg" defaultValue={["pizza"]} aria-label="Large">
            <Dishes />
          </ToggleGroup>
        </section>

        <section className={`flex flex-wrap items-start gap-6 ${card}`}>
          <ToggleGroup type="single" spacing={0} defaultValue="drinks" aria-label="Segmented">
            <Dishes />
          </ToggleGroup>
          <ToggleGroup type="single" orientation="vertical" defaultValue="pizza" aria-label="Vertical">
            <Dishes />
          </ToggleGroup>
          <ToggleGroup type="multiple" disabled defaultValue={["salad"]} aria-label="Disabled">
            <Dishes />
          </ToggleGroup>
          <ToggleGroup type="multiple" defaultValue={["pizza"]} aria-label="One disabled">
            <ToggleGroupItem value="pizza">Pizza</ToggleGroupItem>
            <ToggleGroupItem value="salad" disabled>
              Salad
            </ToggleGroupItem>
          </ToggleGroup>
        </section>

        <section data-narrow="" className={`w-[240px] ${card}`}>
          <ToggleGroup type="multiple" defaultValue={["drinks", "long"]} aria-label="Narrow">
            <Dishes />
            <ToggleGroupItem value="long">
              Tiramisu with an extra shot of espresso and a second spoon for the table
            </ToggleGroupItem>
          </ToggleGroup>
        </section>

        <section className={`w-[441px] max-w-full ${card}`}>
          <ToggleGroup type="single" spacing={0} defaultValue="a" aria-label="Long segmented">
            <ToggleGroupItem value="a">Split evenly between everyone at the table</ToggleGroupItem>
            <ToggleGroupItem value="b">Pay exactly for what you ordered yourself</ToggleGroupItem>
          </ToggleGroup>
        </section>

        {/* Outline segmented, vertical segmented, icon pills, a row that wraps in 160 px, right to left. */}
        <section data-edge="" className={`flex flex-wrap items-start gap-6 ${card}`}>
          <ToggleGroup type="single" variant="outline" spacing={0} defaultValue="salad" aria-label="Outline segmented">
            <Dishes />
          </ToggleGroup>
          <ToggleGroup type="multiple" variant="outline" spacing={0} defaultValue={["bold", "italic"]} aria-label="Outline marks">
            <Marks />
          </ToggleGroup>
          <ToggleGroup type="multiple" defaultValue={["italic"]} aria-label="Marks">
            <Marks />
          </ToggleGroup>
          <ToggleGroup type="single" orientation="vertical" spacing={0} defaultValue="drinks" aria-label="Vertical segmented">
            <Dishes />
          </ToggleGroup>
          <ToggleGroup type="single" orientation="vertical" variant="outline" spacing={0} defaultValue="salad" aria-label="Vertical outline">
            <Dishes />
          </ToggleGroup>
          <div data-tiny="" className="w-[160px]">
            <ToggleGroup type="multiple" defaultValue={["drinks"]} aria-label="Tiny">
              <Dishes />
            </ToggleGroup>
          </div>
          <ToggleGroup dir="rtl" type="single" spacing={0} defaultValue="a" aria-label="Right to left">
            <ToggleGroupItem value="a">بيتزا</ToggleGroupItem>
            <ToggleGroupItem value="b">سلطة</ToggleGroupItem>
            <ToggleGroupItem value="c">مشروبات</ToggleGroupItem>
          </ToggleGroup>
        </section>

        <section data-dark="" className={`flex flex-wrap items-start gap-6 ${dark}`}>
          <ToggleGroup type="multiple" defaultValue={["drinks"]} aria-label="Dark">
            <Dishes />
          </ToggleGroup>
          <ToggleGroup type="single" variant="outline" spacing={0} defaultValue="salad" aria-label="Dark outline">
            <Dishes />
          </ToggleGroup>
        </section>
      </div>
    </main>
  )
}
