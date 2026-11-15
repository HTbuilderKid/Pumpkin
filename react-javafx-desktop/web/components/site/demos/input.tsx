"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Search01Icon, Tick02Icon } from "@hugeicons/core-free-icons"

import { Input } from "@/components/ui/input"

// The field and search tiles (content from app/preview/input).
const NAME = "Pizza night at Maya's"

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
      <Input type="search" spellCheck={false} placeholder="Search friends or bills" aria-label="Search friends or bills" className="pl-12" {...props} />
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
      <Input aria-label="Event name" spellCheck={false} value={value} onChange={(e) => setValue(e.target.value)} className="pr-13" {...props} />
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

export function InputFieldDemo() {
  return <NameField />
}

export function InputSearchDemo() {
  return <SearchField />
}
