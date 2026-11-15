"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon, Tick02Icon } from "@hugeicons/core-free-icons"

import { Input } from "@/components/ui/input"

const NAME = "Pizza night at Maya's"
const LONG =
  "Pizza night at Maya's place with everyone from the climbing gym, bring your own drinks, a board game and something sweet for later"

// Wrapper with a lens on the left (18 px in, 20 px icon box, 10 px gap, so the text starts at 48 px). The
// lens sits small in its box (14 px of ink); Search01Icon at 16 px matches it, centred in the same 20 px slot.
function SearchField(props: React.ComponentProps<typeof Input>) {
  return (
    <div className="relative w-full min-w-0">
      <HugeiconsIcon
        icon={Search01Icon}
        size={18}
        strokeWidth={2.4}
        aria-hidden
        className="pointer-events-none absolute top-1/2 left-5 -translate-y-1/2 text-(--plush-ink-3)"
      />
      <Input type="search" placeholder="Search friends or bills" aria-label="Search friends or bills" className="pl-12" {...props} />
    </div>
  )
}

// Wrapper with the green tick on the right (28 px, 14 px from the edge, 10 px gap before it). The tick
// means "saved": typing folds it away, Enter saves and it springs back and draws itself.
function NameField({ initial = NAME, ...props }: React.ComponentProps<typeof Input> & { initial?: string }) {
  const [saved, setSaved] = React.useState(initial)
  const [value, setValue] = React.useState(initial)

  return (
    <form
      className="relative w-full min-w-0"
      onSubmit={(e) => {
        e.preventDefault()
        if (value.trim()) setSaved(value)
      }}
    >
      <Input aria-label="Event name" value={value} onChange={(e) => setValue(e.target.value)} className="pr-13" {...props} />
      <span
        aria-hidden
        data-state={value === saved ? "saved" : "editing"}
        className="group/tick pointer-events-none absolute top-1/2 right-3.5 flex size-7 -translate-y-1/2 items-center justify-center rounded-(--plush-radius-full) bg-(--plush-success) text-(--plush-on-success) [transition:scale_var(--plush-dur-spring)_var(--plush-ease-spring),opacity_var(--plush-dur-fade)_var(--plush-ease-fade)] data-[state=editing]:scale-0 data-[state=editing]:opacity-0 data-[state=editing]:[transition:scale_var(--plush-dur-spring)_var(--plush-ease-spring)_var(--plush-stagger),opacity_var(--plush-dur-fade)_var(--plush-ease-fade)_var(--plush-stagger)]"
      >
        {/* Wipe ends fit the tick's ink (1.6 px stroke, round caps at 16 px): 15.8-84.2 %. */}
        <HugeiconsIcon
          icon={Tick02Icon}
          size={16}
          strokeWidth={2.4}
          className="[&_path]:[stroke-linejoin:miter] [clip-path:inset(0_86%_0_0)] [transition:clip-path_var(--plush-dur-fast)_var(--plush-ease-fade)] group-data-[state=saved]/tick:[clip-path:inset(0_14%_0_0)] group-data-[state=saved]/tick:[transition:clip-path_var(--plush-dur-slow)_var(--plush-ease-fade)_var(--plush-stagger)]"
        />
      </span>
    </form>
  )
}

const tile = "flex h-[104px] w-[441px] max-w-full items-center justify-center rounded-(--plush-radius-panel) bg-(--plush-panel) p-(--plush-pad)"
const card = "rounded-(--plush-radius-card) bg-(--plush-surface) p-4 shadow-(--plush-card-shadow)"
// Dark ground: the focus ring is black (--plush-focus-color), so a dark container carries plush-on-dark (light ring).
const dark = "rounded-(--plush-radius-card) bg-(--plush-accent) p-4 plush-on-dark"
const btn = "plush-focus-ring h-10 shrink-0 rounded-(--plush-radius-full) bg-(--plush-accent) px-4 text-(length:--plush-text-md) font-(--plush-weight-semi) text-(--plush-on-accent)"

export default function InputPreview() {
  return (
    <main className="plush-font min-h-screen bg-(--plush-bg) p-8 text-(--plush-ink)">
      <div className="flex flex-col items-start gap-8">
        <section data-tile="field" className={tile}>
          <NameField />
        </section>

        <section data-tile="search" className={tile}>
          <SearchField />
        </section>

        <section className="grid w-[401px] max-w-full gap-4">
          <Input aria-label="Note" placeholder="Add a note" />
          <Input aria-label="Email" type="email" defaultValue="maya@pizza" aria-invalid />
          <Input aria-label="Receipt" type="file" />
          <Input aria-label="Event name, disabled" defaultValue={NAME} disabled />
          <SearchField aria-label="Search, disabled" disabled />
          <Input aria-label="Receipt, disabled" type="file" disabled />
        </section>

        <section className="grid w-[401px] max-w-full gap-4">
          <Input aria-label="Long text" defaultValue={LONG} />
          <Input aria-label="Long placeholder" placeholder={LONG} />
          <NameField initial={LONG} />
        </section>

        <section data-narrow="" className={`flex w-[240px] flex-col gap-4 ${card}`}>
          <NameField />
          <SearchField />
          <Input aria-label="Receipt, narrow" type="file" />
          <Input aria-label="Long text, narrow" defaultValue={LONG} />
        </section>

        <section data-states="" className="grid w-[401px] max-w-full gap-4">
          <Input aria-label="Amount" type="number" defaultValue={-1234567890} />
          <Input aria-label="Password" type="password" defaultValue="pizza-night" />
          <Input aria-label="Date" type="date" defaultValue="2026-11-11" />
          <Input aria-label="Email, invalid, disabled" defaultValue="maya@pizza" aria-invalid disabled />
          <Input aria-label="Read only" defaultValue="Grüße an Zoë 👋🏽" readOnly />
          <Input aria-label="Long word" defaultValue="Donaudampfschifffahrtsgesellschaftskapitänsmütze" />
          <Input aria-label="Right to left" dir="rtl" defaultValue="بيتزا عند مايا" />
          <form className="flex flex-wrap items-center gap-2">
            <Input aria-label="Email, required" name="email" type="email" autoComplete="email" required />
            <button type="submit" className={btn}>Send</button>
            <button type="reset" className={btn}>Reset</button>
          </form>
        </section>

        <section data-dark="" className={`grid w-[401px] max-w-full gap-4 ${dark}`}>
          <Input aria-label="Note, dark" placeholder="Add a note" />
          <Input aria-label="Email, dark, invalid" defaultValue="maya@pizza" aria-invalid />
        </section>

        <section data-narrow160="" className={`flex w-[160px] flex-col gap-4 ${card}`}>
          <Input aria-label="Long text, 160" defaultValue={LONG} />
          <Input aria-label="Receipt, 160" type="file" />
        </section>
      </div>
    </main>
  )
}
