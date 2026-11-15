"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowUp02Icon, Menu02Icon, Tick02Icon } from "@hugeicons/core-free-icons"

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Demo only, not part of the component: the black pill that opens a dialog, the tile's buttons (the wide green "Sent"
// and the black "Continue"), the grey hint line and the two rows with their coloured dots.
// Under the pointer: black turns --plush-accent-hover, grey one step darker, the green one a little brighter (never another colour).
const press = "[transition:scale_var(--plush-dur-spring)_var(--plush-ease-spring),background-color_var(--plush-dur-fast)_var(--plush-ease-fade),filter_var(--plush-dur-fast)_var(--plush-ease-fade)] active:not-disabled:scale-(--plush-press-scale-pill)"
const pill = `inline-flex min-h-(--plush-h-btn-sm) max-w-full items-center justify-center gap-2 rounded-(--plush-radius-full) px-7 py-2 text-(length:--plush-text-xl) leading-tight font-(--plush-weight-semi) break-words ${press}`
const openButton = `${pill} bg-(--plush-accent) text-(--plush-on-accent) hover:not-disabled:bg-(--plush-accent-hover) disabled:cursor-not-allowed disabled:opacity-(--plush-disabled-opacity)`
const sentButton = `${pill} w-full bg-(image:--plush-select-fill) text-(--plush-on-select) shadow-(--plush-select-gloss) hover:brightness-(--plush-hover-bright)`
const hint = "flex min-h-11 items-center gap-2.5 rounded-(--plush-radius-row) bg-(--plush-accent-tint) px-3.5 py-2 font-(--plush-weight-semi) text-(--plush-ink)"
const row = "flex min-h-11.5 min-w-0 items-center gap-3 text-(length:--plush-text-lg) font-(--plush-weight-semi)"
const dot = "grid size-8 shrink-0 place-items-center rounded-(--plush-radius-full) text-(--plush-on-accent)"
const value = "ml-auto min-w-0 text-right font-(--plush-weight-medium) text-(--plush-ink-2)"

function Sheet({
  name,
  note,
  title = `Send to ${name}`,
  ...props
}: React.ComponentProps<typeof DialogContent> & { name: string; note: string; title?: string }) {
  return (
    <DialogContent {...props}>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
      </DialogHeader>
      <DialogDescription className={hint}>
        <span className="grid size-5 shrink-0 place-items-center rounded-(--plush-radius-full) bg-(--plush-accent) text-(--plush-on-accent)">
          <HugeiconsIcon icon={Tick02Icon} size={14} strokeWidth={2.4} aria-hidden className="[&_path]:[stroke-linejoin:miter]" />
        </span>
        {name} gets it instantly, no fee
      </DialogDescription>
      <div className="-mt-1.5">
        <div className={row}>
          <span className={`${dot} bg-(--plush-success)`}>
            <HugeiconsIcon icon={ArrowUp02Icon} size={18} strokeWidth={2.4} aria-hidden />
          </span>
          Amount<span className={value}>$24.00</span>
        </div>
        <div className={row}>
          <span className={`${dot} bg-(--plush-pink)`}>
            {/* The note lines sit small in the dot (about 10 x 8 px of ink). */}
            <HugeiconsIcon icon={Menu02Icon} size={16} strokeWidth={2.4} aria-hidden />
          </span>
          Note<span className={value}>{note}</span>
        </div>
      </div>
      <DialogFooter>
        <DialogClose className={sentButton}>
          <HugeiconsIcon icon={Tick02Icon} size={18} strokeWidth={2.4} aria-hidden className="[&_path]:[stroke-linejoin:miter]" />
          Sent
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  )
}

// A field of the form case: a red ring while aria-invalid (demo markup; the dialog itself has no field).
const field =
  "plush-focus-ring min-h-(--plush-h-field) w-full min-w-0 rounded-(--plush-radius-row) bg-(--plush-fill) px-4 text-(length:--plush-text-lg) font-(--plush-weight-medium) text-(--plush-ink) aria-invalid:shadow-[inset_0_0_0_2px_var(--plush-danger)]"

function FormDialog() {
  const [error, setError] = React.useState(false)
  return (
    <Dialog onOpenChange={() => setError(false)}>
      <DialogTrigger data-testid="open-form" className={openButton}>
        Form with an error
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Note for Maya</DialogTitle>
          <DialogDescription>Say what the money is for.</DialogDescription>
        </DialogHeader>
        <form
          noValidate
          className="grid gap-3"
          onSubmit={(e) => {
            e.preventDefault()
            setError(!e.currentTarget.checkValidity())
          }}
          onReset={() => setError(false)}
        >
          <input name="note" required aria-label="Note" aria-invalid={error} aria-describedby="note-error" placeholder="Pizza night" className={field} />
          <p id="note-error" className="min-h-5 text-(length:--plush-text-sm) font-(--plush-weight-semi) text-(--plush-danger)">
            {error ? "Write a short note first." : ""}
          </p>
          <DialogFooter>
            <button type="reset" className={`${pill} bg-(--plush-fill) text-(--plush-ink) hover:bg-(--plush-fill-strong)`}>Clear</button>
            <button type="submit" className={`${pill} bg-(--plush-accent) text-(--plush-on-accent) hover:bg-(--plush-accent-hover)`}>Send</button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default function DialogPreview() {
  return (
    <main className="plush-font flex min-h-screen flex-wrap items-start gap-8 bg-(--plush-bg) p-8 text-(--plush-ink)">
      <section
        data-testid="tile"
        className="grid h-[352px] w-[441px] max-w-full place-items-center rounded-(--plush-radius-panel) bg-(--plush-panel) p-(--plush-pad)"
      >
        <Dialog>
          <DialogTrigger data-testid="open-tile" className={openButton}>
            Send to Maya
          </DialogTrigger>
          <Sheet name="Maya" note="Pizza night" />
        </Dialog>
      </section>

      <section className="flex flex-col items-start gap-4">
        <Dialog>
          <DialogTrigger data-testid="open-pair" className={openButton}>
            Send to Leo
          </DialogTrigger>
          <DialogContent showCloseButton={false}>
            <DialogHeader>
              <DialogTitle>Send to Leo</DialogTitle>
              <DialogDescription>Leo gets it instantly, no fee.</DialogDescription>
            </DialogHeader>
            <DialogFooter showCloseButton>
              <DialogClose className={`${pill} bg-(--plush-accent) text-(--plush-on-accent) hover:bg-(--plush-accent-hover)`}>Continue</DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger data-testid="open-long" className={openButton}>
            Long text
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                Send the whole amount for the pizza night, the drinks and the taxi home to Maya
              </DialogTitle>
              <DialogDescription>
                Maya gets it instantly and without a fee, and everyone else in the group sees that the
                Supercalifragilisticexpialidocious-pizza-night is settled.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter showCloseButton>
              <DialogClose className={sentButton}>Send everything to Maya right now</DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger className={openButton} disabled>
            Send to Maya, disabled
          </DialogTrigger>
          <DialogContent>
            <DialogTitle>Never opens</DialogTitle>
            <DialogDescription>The trigger is disabled.</DialogDescription>
          </DialogContent>
        </Dialog>
      </section>

      <section
        data-testid="w240"
        className="w-[240px] rounded-(--plush-radius-card) bg-(--plush-surface) p-3 shadow-(--plush-card-shadow)"
      >
        <Dialog>
          <DialogTrigger data-testid="open-w240" className={`${openButton} w-full`}>
            Send the whole amount for the pizza night to Maya
          </DialogTrigger>
          <Sheet
            name="Maya"
            note="Pizza night, drinks and the taxi home, Supercalifragilisticexpialidocious"
            title="Send the whole amount for the pizza night to Maya"
            className="sm:max-w-60"
          />
        </Dialog>
      </section>

      <section data-testid="states" className="flex flex-col items-start gap-4">
        <Dialog>
          <DialogTrigger data-testid="open-scroll" className={openButton}>
            Taller than the window
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Everything from the pizza night</DialogTitle>
              <DialogDescription>The sheet keeps a margin to the window and its content scrolls.</DialogDescription>
            </DialogHeader>
            {Array.from({ length: 24 }, (_, i) => (
              <p key={i} className="text-(--plush-ink-2)">
                Item {i + 1}: a slice for everyone, split four ways.
              </p>
            ))}
            <DialogFooter showCloseButton />
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger data-testid="open-nested" className={openButton}>
            Dialog in a dialog
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Split the bill</DialogTitle>
              <DialogDescription>Pick who gets the money; their sheet opens on top of this one.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Dialog>
                <DialogTrigger data-testid="open-inner" className={`${pill} bg-(--plush-accent) text-(--plush-on-accent)`}>
                  Send to Maya
                </DialogTrigger>
                <Sheet name="Maya" note="Pizza night" />
              </Dialog>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <FormDialog />
      </section>
    </main>
  )
}
