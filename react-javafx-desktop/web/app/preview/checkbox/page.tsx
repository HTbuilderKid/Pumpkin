"use client"

import * as React from "react"

import { Checkbox } from "@/components/ui/checkbox"

// The "Who's in?" list of the tile: avatar, name, checkbox on the right. The count follows the boxes.
const friends = [
  { name: "Maya", dot: "bg-(--plush-pink)" },
  { name: "Leo", dot: "bg-(--plush-success)" },
  { name: "Sam", dot: "bg-(--plush-danger)" },
  { name: "Priya", dot: "bg-(--plush-warning)" },
  { name: "Jonas", dot: "bg-(--plush-accent)" },
]

function Row({ id, name, dot, ...props }: React.ComponentProps<typeof Checkbox> & { id: string; name: string; dot: string }) {
  return (
    <div className="flex min-h-[52px] items-center gap-2.5 px-1 py-2.5 text-[16px] font-(--plush-weight-semi)">
      <span
        aria-hidden="true"
        className={`inline-flex size-8 shrink-0 items-center justify-center rounded-(--plush-radius-full) text-[15px] text-(--plush-on-accent) ${dot}`}
      >
        {name[0]}
      </span>
      <label htmlFor={id} className="min-w-0 flex-1 leading-tight break-words hyphens-auto">
        {name}
      </label>
      <Checkbox id={id} {...props} />
    </div>
  )
}

function WhoIsIn({ id, names = friends }: { id: string; names?: typeof friends }) {
  const [inList, setInList] = React.useState(() => names.map(() => true))
  const count = inList.filter(Boolean).length
  return (
    <div className="w-full min-w-0">
      <div className="mx-1 mb-3 leading-[normal] break-words">
        <p className="text-[17px] font-(--plush-weight-semi)">Who&apos;s in?</p>
        <p className="mt-[3px] text-[14px] font-(--plush-weight-medium) text-(--plush-ink-2)">
          {count} of {names.length} friends
        </p>
      </div>
      {names.map((f, i) => (
        <Row
          key={f.name}
          id={`${id}-${i}`}
          name={f.name}
          dot={f.dot}
          checked={inList[i]}
          onCheckedChange={(v) => setInList((s) => s.map((x, j) => (j === i ? v === true : x)))}
        />
      ))}
    </div>
  )
}

// "All" above the list: indeterminate while some are in, so it moves between all three states.
function SelectAll() {
  const [inList, setInList] = React.useState([true, false, false])
  const all = inList.every(Boolean) ? true : inList.some(Boolean) ? "indeterminate" : false
  return (
    <div className="w-full min-w-0">
      <Row id="all" name="Everyone" dot="bg-(--plush-accent)" checked={all} onCheckedChange={(v) => setInList((s) => s.map(() => v === true))} />
      {friends.slice(0, 3).map((f, i) => (
        <Row
          key={f.name}
          id={`all-${i}`}
          name={f.name}
          dot={f.dot}
          checked={inList[i]}
          onCheckedChange={(v) => setInList((s) => s.map((x, j) => (j === i ? v === true : x)))}
        />
      ))}
    </div>
  )
}

const card = "rounded-(--plush-radius-card) bg-(--plush-surface) shadow-(--plush-card-shadow)"
// Dark ground: the focus ring is black (--plush-focus-color), so a dark container carries plush-on-dark (light ring).
const dark = "rounded-(--plush-radius-card) bg-(--plush-accent) p-4 plush-on-dark"
const btn = "plush-focus-ring h-10 shrink-0 rounded-(--plush-radius-full) bg-(--plush-accent) px-4 text-(length:--plush-text-md) font-(--plush-weight-semi) text-(--plush-on-accent)"

export default function CheckboxPreview() {
  return (
    <main className="plush-font min-h-screen bg-(--plush-bg) p-8 text-(--plush-ink)">
      <div className="flex flex-col items-start gap-8">
        <div className="flex flex-wrap items-start gap-8">
          <section
            data-tile=""
            className="flex min-h-[476px] w-[210.5px] max-w-full items-center rounded-(--plush-radius-panel) bg-(--plush-panel) p-(--plush-pad)"
          >
            <WhoIsIn id="tile" />
          </section>

          <section data-narrow="" className={`w-[240px] p-4 ${card}`}>
            <WhoIsIn
              id="narrow"
              names={[
                { name: "Maximiliane-Charlotte von Hohenzollern-Sigmaringen", dot: "bg-(--plush-pink)" },
                { name: "Leo", dot: "bg-(--plush-success)" },
                { name: "Donaudampfschifffahrtsgesellschaftskapitän", dot: "bg-(--plush-warning)" },
              ]}
            />
          </section>
        </div>

        <section className="flex flex-wrap items-center gap-6">
          <Checkbox aria-label="Unchecked" />
          <Checkbox aria-label="Checked" defaultChecked />
          <Checkbox aria-label="Indeterminate" defaultChecked="indeterminate" />
          <Checkbox aria-label="Invalid" aria-invalid />
          <Checkbox aria-label="Disabled, unchecked" disabled />
          <Checkbox aria-label="Disabled, checked" disabled defaultChecked />
          <Checkbox aria-label="Disabled, indeterminate" disabled defaultChecked="indeterminate" />
        </section>

        <section className={`w-[441px] max-w-full px-4 py-2 ${card}`}>
          <Row
            id="long"
            name="Maya, who already said she will bring the drinks, the dessert and the folding chairs for everyone who comes along"
            dot="bg-(--plush-pink)"
            defaultChecked
          />
          <Row
            id="long-mixed"
            name="Everyone from the climbing group, as soon as at least half of them have answered the invite"
            dot="bg-(--plush-accent)"
            defaultChecked="indeterminate"
          />
        </section>

        <section data-states="" className="flex flex-wrap items-center gap-6">
          <Checkbox aria-label="Invalid, checked" aria-invalid defaultChecked />
          <Checkbox aria-label="Invalid, indeterminate" aria-invalid defaultChecked="indeterminate" />
          <Checkbox aria-label="Invalid, disabled" aria-invalid disabled defaultChecked />
          <form className="flex flex-wrap items-center gap-3">
            <Checkbox aria-label="Accept the terms, required" name="terms" required />
            <button type="submit" className={btn}>Send</button>
            <button type="reset" className={btn}>Reset</button>
          </form>
        </section>

        <section data-select-all="" className={`w-[240px] p-4 ${card}`}>
          <SelectAll />
        </section>

        <section data-dark="" className={`flex flex-wrap items-center gap-6 ${dark}`}>
          <Checkbox aria-label="Dark, unchecked" />
          <Checkbox aria-label="Dark, checked" defaultChecked />
          <Checkbox aria-label="Dark, invalid" aria-invalid />
        </section>

        <section data-narrow160="" dir="rtl" className={`w-[160px] p-3 ${card}`}>
          <Row id="n160" name="مايا Grüße 👋🏽" dot="bg-(--plush-pink)" defaultChecked />
        </section>
      </div>
    </main>
  )
}
