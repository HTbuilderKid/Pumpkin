import * as React from "react"

import { HugeiconsIcon } from "@hugeicons/react"
import { Notification02Icon, PercentIcon } from "@hugeicons/core-free-icons"

import { Switch } from "@/components/ui/switch"

function Bell() {
  return <HugeiconsIcon icon={Notification02Icon} size={16} strokeWidth={2.4} aria-hidden />
}

function Percent() {
  return <HugeiconsIcon icon={PercentIcon} size={16} strokeWidth={2.4} aria-hidden />
}

// One row of the settings card in the tile: dot, title, subline, switch on the right.
function Setting({
  id,
  title,
  sub,
  icon,
  dot = "",
  ...props
}: React.ComponentProps<typeof Switch> & { id: string; title: string; sub: string; icon?: React.ReactNode; dot?: string }) {
  return (
    <div className="flex min-h-[72px] items-center gap-3.5 py-2.5 not-first:shadow-[inset_0_1px_0_var(--plush-fill)]">
      {icon ? (
        <span className={`inline-flex size-8 shrink-0 items-center justify-center rounded-(--plush-radius-full) text-(--plush-on-accent) ${dot}`}>
          {icon}
        </span>
      ) : null}
      <div className="min-w-0 flex-1 leading-[normal] break-words hyphens-auto">
        <label htmlFor={id} className="block text-[17px] font-(--plush-weight-semi)">
          {title}
        </label>
        <span id={`${id}-sub`} className="mt-[3px] block text-[14px] font-(--plush-weight-medium) text-(--plush-ink-2)">
          {sub}
        </span>
      </div>
      <Switch id={id} aria-describedby={`${id}-sub`} {...props} />
    </div>
  )
}

const card = "rounded-(--plush-radius-card) bg-(--plush-surface) shadow-(--plush-card-shadow)"
// Dark ground: the focus ring is black (--plush-focus-color), so a dark container carries plush-on-dark (light ring).
const dark = "rounded-(--plush-radius-card) bg-(--plush-accent) p-4 plush-on-dark"
const btn = "plush-focus-ring h-10 shrink-0 rounded-(--plush-radius-full) bg-(--plush-accent) px-4 text-(length:--plush-text-md) font-(--plush-weight-semi) text-(--plush-on-accent)"

export default function SwitchPreview() {
  return (
    <main className="plush-font min-h-screen bg-(--plush-bg) p-8 text-(--plush-ink)">
      <div className="flex flex-col items-start gap-8">
        <div className="flex max-w-full flex-wrap items-start gap-8">
          <section
            data-tile=""
            className="flex min-h-[228px] w-[441px] max-w-full items-center rounded-(--plush-radius-panel) bg-(--plush-panel) p-(--plush-pad)"
          >
            <div className={`w-full px-5 py-2 ${card}`}>
              <Setting id="remind" title="Remind friends" sub="Every evening until paid" icon={<Bell />} dot="bg-(--plush-danger)" defaultChecked />
              <Setting id="tip" title="Add tip automatically" sub="18% on every split" icon={<Percent />} dot="bg-(--plush-pink)" />
            </div>
          </section>

          <section data-narrow="" className={`w-[240px] px-4 py-2 ${card}`}>
            <Setting
              id="narrow"
              title="Add a tip automatically to every split you start"
              sub="18% on every split, rounded up to the next whole amount"
              icon={<Percent />}
              dot="bg-(--plush-pink)"
            />
            <Setting id="narrow-sm" title="Quiet hours" sub="No reminders at night" size="sm" defaultChecked />
          </section>
        </div>

        <section className="flex flex-wrap items-center gap-6">
          <Switch aria-label="Off" />
          <Switch aria-label="On" defaultChecked />
          <Switch aria-label="Disabled, off" disabled />
          <Switch aria-label="Disabled, on" disabled defaultChecked />
        </section>

        <section className="flex flex-wrap items-center gap-6">
          <Switch size="sm" aria-label="Small, off" />
          <Switch size="sm" aria-label="Small, on" defaultChecked />
          <Switch size="sm" aria-label="Small, disabled, off" disabled />
          <Switch size="sm" aria-label="Small, disabled, on" disabled defaultChecked />
        </section>

        <section className={`w-[441px] max-w-full px-5 py-2 ${card}`}>
          <Setting
            id="long"
            title="Remind every friend who still owes you something, every single evening, until the whole bill is paid back"
            sub="Reminders go out at 8 pm in each friend's own time zone and stop on their own as soon as the last share arrives"
            icon={<Bell />}
            dot="bg-(--plush-danger)"
            defaultChecked
          />
        </section>

        <section data-states="" className="flex flex-wrap items-center gap-6">
          <Switch aria-label="Invalid, off" aria-invalid />
          <Switch aria-label="Invalid, on" aria-invalid defaultChecked />
          <Switch size="sm" aria-label="Small, invalid, on" aria-invalid defaultChecked />
          <Switch aria-label="Invalid, disabled, on" aria-invalid disabled defaultChecked />
          <form className="flex flex-wrap items-center gap-3">
            <Switch aria-label="Accept the terms, required" name="terms" required />
            <button type="submit" className={btn}>Send</button>
            <button type="reset" className={btn}>Reset</button>
          </form>
        </section>

        <section data-dark="" className={`flex flex-wrap items-center gap-6 ${dark}`}>
          <Switch aria-label="Dark, off" />
          <Switch aria-label="Dark, on" defaultChecked />
          <Switch aria-label="Dark, invalid" aria-invalid />
        </section>

        <section data-narrow160="" className={`w-[160px] px-3 py-1 ${card}`}>
          <Setting id="n160" title="Tip 💸" sub="Grüße an Zoë" />
        </section>
      </div>
    </main>
  )
}
