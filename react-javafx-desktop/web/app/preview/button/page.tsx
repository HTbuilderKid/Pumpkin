"use client"

import * as React from "react"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import {
  Add01Icon,
  Delete02Icon,
  Loading03Icon,
  MoreHorizontalIcon,
  Notification02Icon,
  Share03Icon,
  SquareLock01Icon,
} from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"

// Sharp chevron (contract, "Icons"): Hugeicons draws its chevrons as a curve with a round tip; this is the same
// 12 x 6 angle in straight lines, mitred at the tip like the tick. The one drawn path of plush, the same text in every file.
const sharpChevron = (d: string): IconSvgElement => [["path", { d, stroke: "currentColor", strokeLinecap: "round", strokeLinejoin: "miter", strokeWidth: 1.5, key: "0" }]]
const ChevronRightSharpIcon = sharpChevron("M9 6L15 12L9 18")

const card = "rounded-(--plush-radius-card) bg-(--plush-panel) p-(--plush-pad)"
// A dark surface: text in the colour on it, the focus ring and the ring of an invalid control stay visible there.
const dark = "rounded-(--plush-radius-card) bg-(--plush-accent) p-(--plush-pad) text-(--plush-on-accent) plush-on-dark"
const variants = ["default", "outline", "secondary", "ghost", "destructive", "link"] as const
const textSizes = ["xs", "sm", "default", "lg"] as const
const iconSizes = ["icon-xs", "icon-sm", "icon", "icon-lg"] as const

export default function ButtonPreview() {
  const [paying, setPaying] = React.useState(false)

  return (
    <main className="plush-font min-h-screen bg-(--plush-bg) p-8 text-(--plush-ink)">
      <div className="flex flex-col items-start gap-8">
        {/* The Pay tile. Pressing it shows a quiet loading state (aria-busy), pressing again ends it. */}
        <section
          data-tile="pay"
          className="flex h-[104px] w-[441px] max-w-full items-center justify-center rounded-(--plush-radius-panel) bg-(--plush-panel) p-(--plush-pad)"
        >
          <Button className="min-w-[300px]" aria-busy={paying} onClick={() => setPaying((p) => !p)}>
            <HugeiconsIcon
              icon={paying ? Loading03Icon : SquareLock01Icon}
              size={16}
              strokeWidth={2.4}
              data-icon="inline-start"
              aria-hidden
              className={paying ? "animate-[plush-spin_var(--plush-dur-spin)_var(--plush-ease-spin)_infinite]" : "mx-px size-4"}
            />
            {paying ? "Paying…" : "Pay $24.00"}
          </Button>
        </section>

        {/* The actions tile: black plus, three white round buttons. */}
        <section
          data-tile="actions"
          className="flex h-[228px] w-[211px] max-w-full items-center justify-center rounded-(--plush-radius-panel) bg-(--plush-panel) p-(--plush-pad)"
        >
          <div className="grid grid-cols-2 gap-4">
            <Button size="icon" aria-label="Add">
              <HugeiconsIcon icon={Add01Icon} size={20} strokeWidth={2.4} aria-hidden className="size-5" />
            </Button>
            <Button size="icon" variant="outline" aria-label="Share">
              <HugeiconsIcon icon={Share03Icon} size={20} strokeWidth={2.4} aria-hidden className="size-5" />
            </Button>
            <Button size="icon" variant="outline" aria-label="Notifications">
              <HugeiconsIcon icon={Notification02Icon} size={18} strokeWidth={2.4} aria-hidden className="size-4.5" />
            </Button>
            <Button size="icon" variant="outline" aria-label="More">
              <HugeiconsIcon icon={MoreHorizontalIcon} size={20} strokeWidth={1.5} aria-hidden className="size-5" />
            </Button>
          </div>
        </section>

        <section data-variants="" className={`flex flex-wrap items-center gap-3 ${card}`}>
          <Button>Default</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
          <Button asChild variant="outline">
            <a href="#top">As link</a>
          </Button>
        </section>

        <section data-states="" className={`flex flex-wrap items-center gap-3 ${card}`}>
          <Button disabled>Disabled</Button>
          <Button variant="outline" disabled>
            Disabled
          </Button>
          <Button variant="secondary" aria-invalid>
            Invalid
          </Button>
          <Button variant="outline" aria-expanded aria-haspopup="menu">
            Expanded
          </Button>
          <Button disabled aria-busy>
            <HugeiconsIcon icon={Loading03Icon} size={16} strokeWidth={2.4} data-icon="inline-start" aria-hidden />
            Paying…
          </Button>
        </section>

        <section data-sizes="" className={`flex flex-wrap items-center gap-3 ${card}`}>
          <Button size="xs">Extra small</Button>
          <Button size="sm">Small</Button>
          <Button>Default</Button>
          <Button size="lg">Large</Button>
          <Button size="sm" variant="outline">
            <HugeiconsIcon icon={SquareLock01Icon} size={16} strokeWidth={2.4} data-icon="inline-start" aria-hidden />
            Pay
          </Button>
        </section>

        <section data-icon-sizes="" className={`flex flex-wrap items-center gap-3 ${card}`}>
          <Button size="icon-xs" aria-label="Add">
            <HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={2.4} aria-hidden />
          </Button>
          <Button size="icon-sm" aria-label="Add">
            <HugeiconsIcon icon={Add01Icon} size={16} strokeWidth={2.4} aria-hidden />
          </Button>
          <Button size="icon" aria-label="Add">
            <HugeiconsIcon icon={Add01Icon} size={18} strokeWidth={2.4} aria-hidden />
          </Button>
          <Button size="icon-lg" aria-label="Add">
            <HugeiconsIcon icon={Add01Icon} size={20} strokeWidth={2.4} aria-hidden />
          </Button>
          <Button size="icon-xs" variant="outline" aria-label="More">
            <HugeiconsIcon icon={MoreHorizontalIcon} size={16} strokeWidth={1.5} aria-hidden />
          </Button>
          <Button size="icon-sm" variant="secondary" aria-label="More">
            <HugeiconsIcon icon={MoreHorizontalIcon} size={16} strokeWidth={1.5} aria-hidden />
          </Button>
          <Button size="icon" variant="ghost" aria-label="More">
            <HugeiconsIcon icon={MoreHorizontalIcon} size={18} strokeWidth={1.5} aria-hidden />
          </Button>
          <Button size="icon-lg" variant="outline" disabled aria-label="More">
            <HugeiconsIcon icon={MoreHorizontalIcon} size={20} strokeWidth={1.5} aria-hidden />
          </Button>
        </section>

        <section data-narrow="" className={`flex w-[240px] flex-col items-start gap-3 ${card}`}>
          <Button>
            <HugeiconsIcon icon={SquareLock01Icon} size={16} strokeWidth={2.4} data-icon="inline-start" aria-hidden />
            Pay $24.00
          </Button>
          <Button variant="outline">Pay for the whole table, the tip and the second round of drinks</Button>
          <Button variant="secondary">Supercalifragilisticexpialidociouslylongbuttonlabel</Button>
          <Button size="icon" variant="outline" aria-label="Share">
            <HugeiconsIcon icon={Share03Icon} size={18} strokeWidth={2.4} aria-hidden />
          </Button>
        </section>

        {/* Every variant in every size: icon at the start, icon at the end, and the round icon sizes. */}
        <section data-matrix="" className={`flex flex-col items-start gap-3 ${card}`}>
          {variants.map((variant) => (
            <div key={variant} data-variant-row={variant} className="flex flex-wrap items-center gap-3">
              {textSizes.map((size) => (
                <Button key={size} variant={variant} size={size}>
                  <HugeiconsIcon icon={SquareLock01Icon} size={16} strokeWidth={2.4} data-icon="inline-start" aria-hidden />
                  Pay
                </Button>
              ))}
              <Button variant={variant}>
                Next
                <HugeiconsIcon icon={ChevronRightSharpIcon} size={16} strokeWidth={2.4} data-icon="inline-end" aria-hidden />
              </Button>
              {iconSizes.map((size) => (
                <Button key={size} variant={variant} size={size} aria-label="Share">
                  <HugeiconsIcon icon={Share03Icon} size={18} strokeWidth={2.4} aria-hidden />
                </Button>
              ))}
            </div>
          ))}
        </section>

        {/* Edge cases: invalid in every variant, busy without disabled, disabled link, the red one as a real action,
            umlauts and emoji, right to left, a 160 px box. */}
        <section data-edge="" className={`flex flex-col items-start gap-3 ${card}`}>
          <div className="flex flex-wrap items-center gap-3">
            {variants.map((variant) => (
              <Button key={variant} variant={variant} aria-invalid>
                Invalid
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button aria-busy>
              <HugeiconsIcon icon={Loading03Icon} size={16} strokeWidth={2.4} data-icon="inline-start" aria-hidden className="animate-[plush-spin_var(--plush-dur-spin)_var(--plush-ease-spin)_infinite]" />
              Paying…
            </Button>
            <Button variant="destructive">
              <HugeiconsIcon icon={Delete02Icon} size={16} strokeWidth={2.4} data-icon="inline-start" aria-hidden />
              Delete
            </Button>
            <Button variant="destructive" disabled>
              Delete
            </Button>
            <Button asChild variant="link">
              <a href="#top">Link as link</a>
            </Button>
            <Button variant="secondary">Größe ändern 🍕</Button>
          </div>
          <div dir="rtl" className="flex flex-wrap items-center gap-3">
            <Button>
              <HugeiconsIcon icon={SquareLock01Icon} size={16} strokeWidth={2.4} data-icon="inline-start" aria-hidden />
              ادفع ٢٤ دولار
            </Button>
            <Button variant="outline">
              التالي
              <HugeiconsIcon icon={ChevronRightSharpIcon} size={16} strokeWidth={2.4} data-icon="inline-end" aria-hidden />
            </Button>
          </div>
          <div data-tiny="" className="flex w-[160px] flex-col items-start gap-3">
            <Button size="lg">Pay for everything</Button>
            <Button size="xs" variant="outline">A</Button>
          </div>
        </section>

        <section data-dark="" className={`flex flex-wrap items-center gap-3 ${dark}`}>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline" aria-invalid>
            Invalid
          </Button>
          <Button size="icon" variant="outline" aria-label="Add">
            <HugeiconsIcon icon={Add01Icon} size={18} strokeWidth={2.4} aria-hidden />
          </Button>
        </section>
      </div>
    </main>
  )
}
