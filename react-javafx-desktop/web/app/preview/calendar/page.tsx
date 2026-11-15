"use client"

import * as React from "react"

import { HugeiconsIcon } from "@hugeicons/react"
import { Calendar04Icon } from "@hugeicons/core-free-icons"

import { Calendar } from "@/components/ui/calendar"

// Pinned so the page looks the same on any day (and hydrates the same everywhere).
const TODAY = new Date(2026, 10, 10)
const NOVEMBER = new Date(2026, 10, 1)

type Range = { from: Date | undefined; to?: Date | undefined }

function CalendarIcon() {
  return <HugeiconsIcon icon={Calendar04Icon} size={20} strokeWidth={2.4} aria-hidden className="shrink-0" />
}

const card = "flex w-full max-w-max min-w-0 flex-col rounded-(--plush-radius-panel) bg-(--plush-surface) p-4 shadow-(--plush-card-shadow)"

export default function CalendarPreview() {
  const [date, setDate] = React.useState<Date | undefined>(new Date(2026, 10, 11))
  const [range, setRange] = React.useState<Range | undefined>({
    from: new Date(2026, 10, 17),
    to: new Date(2026, 10, 21),
  })
  const [days, setDays] = React.useState<Date[] | undefined>([new Date(2026, 10, 12), new Date(2026, 10, 19)])
  const [narrow, setNarrow] = React.useState<Date | undefined>(new Date(2026, 10, 24))
  const [span, setSpan] = React.useState<Range | undefined>({ from: new Date(2026, 10, 28), to: new Date(2026, 11, 6) })
  const [monday, setMonday] = React.useState<Date | undefined>(new Date(2026, 7, 31))
  const [picked, setPicked] = React.useState<Date | undefined>(new Date(2026, 10, 11))
  const [rtl, setRtl] = React.useState<Date | undefined>(new Date(2026, 10, 11))

  return (
    <main className="plush-font min-h-screen bg-(--plush-bg) p-8 text-(--plush-ink)">
      <div className="flex flex-wrap items-start gap-8">
        <section className={card} data-demo="tile">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            defaultMonth={NOVEMBER}
            today={TODAY}
            showOutsideDays={false}
          />
          <div className="mx-2 mt-5.5 flex min-h-11 w-0 min-w-[calc(100%-16px)] items-center gap-2.5 rounded-(--plush-radius-row) bg-(--plush-accent-tint) px-3.5 py-2.5 text-[15px] leading-tight font-(--plush-weight-semi) break-words">
            <CalendarIcon />
            <span className="min-w-0">Drinks with Leo, Wed 8:00 pm</span>
          </div>
        </section>

        <section className={card} data-demo="range">
          <Calendar mode="range" selected={range} onSelect={setRange} defaultMonth={NOVEMBER} today={TODAY} />
        </section>

        <section className={card} data-demo="disabled">
          <Calendar
            mode="multiple"
            selected={days}
            onSelect={setDays}
            defaultMonth={NOVEMBER}
            today={TODAY}
            disabled={[{ dayOfWeek: [0, 6] }, { before: TODAY }]}
          />
        </section>

        <section className="w-[240px] rounded-(--plush-radius-card) bg-(--plush-surface) p-2 shadow-(--plush-card-shadow)" data-demo="narrow">
          <Calendar
            mode="single"
            selected={narrow}
            onSelect={setNarrow}
            defaultMonth={NOVEMBER}
            today={TODAY}
            formatters={{
              formatCaption: (month) =>
                `Team offsite and quarterly planning window, ${month.toLocaleString("en-US", { month: "long" })} ${month.getFullYear()}`,
              formatWeekdayName: (weekday) => weekday.toLocaleString("en-US", { weekday: "long" }),
            }}
          />
        </section>

        <section className={card} data-demo="two-months">
          <Calendar
            mode="range"
            numberOfMonths={2}
            selected={span}
            onSelect={setSpan}
            defaultMonth={NOVEMBER}
            today={TODAY}
            disabled={[new Date(2026, 11, 2)]}
          />
        </section>

        <section className={card} data-demo="monday">
          <Calendar
            mode="single"
            weekStartsOn={1}
            selected={monday}
            onSelect={setMonday}
            defaultMonth={new Date(2026, 7, 1)}
            today={TODAY}
          />
        </section>

        <section className="w-[240px] rounded-(--plush-radius-card) bg-(--plush-surface) p-2 shadow-(--plush-card-shadow)" data-demo="dropdown">
          <Calendar
            mode="single"
            captionLayout="dropdown"
            startMonth={new Date(2020, 0)}
            endMonth={new Date(2030, 11)}
            selected={picked}
            onSelect={setPicked}
            defaultMonth={NOVEMBER}
            today={TODAY}
          />
        </section>

        <section className={card} data-demo="rtl" dir="rtl">
          <Calendar dir="rtl" mode="single" selected={rtl} onSelect={setRtl} defaultMonth={NOVEMBER} today={TODAY} />
        </section>
      </div>
    </main>
  )
}
