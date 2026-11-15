"use client"

import * as React from "react"

import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp"

const CODE = "481729"

function Slots({ from, to, invalid }: { from: number; to: number; invalid?: boolean }) {
  return Array.from({ length: to - from }, (_, i) => <InputOTPSlot key={from + i} index={from + i} aria-invalid={invalid} />)
}

// The shadcn layout: three, a dash, three.
function Split({ invalid, ...props }: Omit<React.ComponentProps<typeof InputOTP>, "maxLength" | "children" | "render"> & { invalid?: boolean }) {
  return (
    <InputOTP maxLength={6} aria-invalid={invalid} {...props}>
      <InputOTPGroup>
        <Slots from={0} to={3} invalid={invalid} />
      </InputOTPGroup>
      <InputOTPSeparator />
      <InputOTPGroup>
        <Slots from={3} to={6} invalid={invalid} />
      </InputOTPGroup>
    </InputOTP>
  )
}

const card = "rounded-(--plush-radius-card) bg-(--plush-surface) p-4 shadow-(--plush-card-shadow)"
// Dark ground: the focus ring is black (--plush-focus-color), so a dark container carries plush-on-dark (light ring).
const dark = "rounded-(--plush-radius-card) bg-(--plush-accent) p-4 plush-on-dark"
const btn = "plush-focus-ring h-10 shrink-0 rounded-(--plush-radius-full) bg-(--plush-accent) px-4 text-(length:--plush-text-md) font-(--plush-weight-semi) text-(--plush-on-accent)"

export default function InputOTPPreview() {
  // A full code is checked at once (and again on Enter, through the form); a wrong code turns the boxes red.
  const [checked, setChecked] = React.useState<boolean>()

  return (
    <main className="plush-font min-h-screen bg-(--plush-bg) p-8 text-(--plush-ink)">
      <div className="flex flex-col items-start gap-8">
        <section
          data-tile=""
          className="flex h-[104px] w-[441px] max-w-full items-center justify-center rounded-(--plush-radius-panel) bg-(--plush-panel) p-(--plush-pad)"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setChecked(new FormData(e.currentTarget).get("code") === CODE)
            }}
          >
            <InputOTP
              name="code"
              maxLength={6}
              defaultValue={CODE}
              aria-label="Verification code"
              aria-invalid={checked === undefined ? undefined : !checked}
              onChange={(code: string) => setChecked(code.length === CODE.length ? code === CODE : undefined)}
            >
              <InputOTPGroup>
                <Slots from={0} to={6} invalid={checked === undefined ? undefined : !checked} />
              </InputOTPGroup>
            </InputOTP>
          </form>
        </section>

        <section className="flex flex-wrap items-center gap-8">
          <Split aria-label="Empty" />
          <Split aria-label="Half filled" defaultValue="4817" />
        </section>

        <section className="flex flex-wrap items-center gap-8">
          <Split aria-label="Disabled" defaultValue="4817" disabled />
          <Split aria-label="Wrong code" defaultValue="481739" invalid />
        </section>

        <section className="flex flex-wrap items-center gap-8">
          <InputOTP aria-label="Letters and digits" maxLength={8} pattern="^[a-zA-Z0-9]+$" defaultValue="WMWM88WM">
            <InputOTPGroup>
              <Slots from={0} to={8} />
            </InputOTPGroup>
          </InputOTP>
        </section>

        <section data-narrow="" className={`flex w-[240px] flex-col gap-4 ${card}`}>
          <Split aria-label="Narrow" defaultValue="4817" />
          <InputOTP aria-label="Narrow, letters" maxLength={6} pattern="^[a-zA-Z0-9]+$" defaultValue="WMWMWM">
            <InputOTPGroup>
              <Slots from={0} to={6} />
            </InputOTPGroup>
          </InputOTP>
        </section>

        <section data-states="" className="flex flex-wrap items-center gap-8">
          {/* aria-invalid on InputOTP alone (as a form library sets it) marks every box. */}
          <InputOTP aria-label="Wrong code, set on the input" maxLength={6} defaultValue="481739" aria-invalid>
            <InputOTPGroup>
              <Slots from={0} to={6} />
            </InputOTPGroup>
          </InputOTP>
          <Split aria-label="Wrong code, disabled" defaultValue="481739" invalid disabled />
          <form className="flex flex-wrap items-center gap-3">
            <Split aria-label="Code, required" name="code" required />
            <button type="submit" className={btn}>Send</button>
            <button type="reset" className={btn}>Reset</button>
          </form>
        </section>

        <section data-dark="" className={`flex flex-wrap items-center gap-8 ${dark}`}>
          <Split aria-label="Dark" defaultValue="4817" />
          <Split aria-label="Dark, wrong code" defaultValue="481739" invalid />
        </section>

        <section data-narrow160="" className={`flex w-[160px] flex-col gap-4 ${card}`}>
          <Split aria-label="160" defaultValue="4817" />
        </section>
      </div>
    </main>
  )
}
