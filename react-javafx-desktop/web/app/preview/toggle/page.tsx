import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { TextBoldIcon, TextItalicIcon } from "@hugeicons/core-free-icons"

import { Toggle } from "@/components/ui/toggle"

const card = "rounded-(--plush-radius-card) bg-(--plush-panel) p-(--plush-pad)"
const dark = "rounded-(--plush-radius-card) bg-(--plush-accent) p-(--plush-pad) text-(--plush-on-accent) plush-on-dark"

export default function TogglePreview() {
  return (
    <main className="plush-font min-h-screen bg-(--plush-bg) p-8 text-(--plush-ink)">
      <div className="flex flex-col items-start gap-8">
        {/* The tile as four single toggles: Drinks and Tiramisu on. */}
        <section
          data-tile=""
          className="flex min-h-[104px] w-[441px] max-w-full flex-wrap items-center justify-center gap-2 rounded-(--plush-radius-panel) bg-(--plush-panel) p-(--plush-pad)"
        >
          <Toggle aria-label="Pizza">Pizza</Toggle>
          <Toggle aria-label="Salad">Salad</Toggle>
          <Toggle aria-label="Drinks" defaultPressed>
            Drinks
          </Toggle>
          <Toggle aria-label="Tiramisu" defaultPressed>
            Tiramisu
          </Toggle>
        </section>

        <section className={`flex flex-wrap items-center gap-2 ${card}`}>
          <Toggle>Off</Toggle>
          <Toggle defaultPressed>On</Toggle>
          <Toggle variant="outline">Outline</Toggle>
          <Toggle variant="outline" defaultPressed>
            Outline on
          </Toggle>
          <Toggle disabled>Disabled</Toggle>
          <Toggle disabled defaultPressed>
            Disabled on
          </Toggle>
          <Toggle aria-invalid>Invalid</Toggle>
        </section>

        <section className={`flex flex-wrap items-center gap-2 ${card}`}>
          <Toggle size="sm">Small</Toggle>
          <Toggle size="sm" defaultPressed>
            Small on
          </Toggle>
          <Toggle size="lg">Large</Toggle>
          <Toggle size="lg" defaultPressed>
            Large on
          </Toggle>
        </section>

        <section data-narrow="" className={`flex w-[240px] flex-wrap gap-2 ${card}`}>
          <Toggle defaultPressed>Drinks</Toggle>
          <Toggle>Tiramisu</Toggle>
          <Toggle defaultPressed>Tiramisu with an extra shot of espresso and a second spoon for the table</Toggle>
          <Toggle>Supercalifragilisticexpialidociouslylongdessertname</Toggle>
        </section>

        {/* Edge cases: invalid together with on, own icons (no tick), umlauts and emoji, right to left, a 160 px box. */}
        <section data-edge="" className={`flex flex-col items-start gap-3 ${card}`}>
          <div className="flex flex-wrap items-center gap-2">
            <Toggle aria-invalid defaultPressed>
              Invalid on
            </Toggle>
            <Toggle variant="outline" aria-invalid>
              Outline invalid
            </Toggle>
            <Toggle variant="outline" aria-invalid defaultPressed>
              Outline invalid on
            </Toggle>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Toggle aria-label="Bold">
              <HugeiconsIcon icon={TextBoldIcon} size={16} strokeWidth={2.4} aria-hidden />
            </Toggle>
            <Toggle aria-label="Italic" defaultPressed>
              <HugeiconsIcon icon={TextItalicIcon} size={16} strokeWidth={2.4} aria-hidden />
            </Toggle>
            <Toggle variant="outline" defaultPressed>
              <HugeiconsIcon icon={TextBoldIcon} size={16} strokeWidth={2.4} aria-hidden />
              Bold
            </Toggle>
            <Toggle size="sm" aria-label="Italic small">
              <HugeiconsIcon icon={TextItalicIcon} size={14} strokeWidth={2.4} aria-hidden />
            </Toggle>
            <Toggle defaultPressed>Grüße 🍕</Toggle>
            <Toggle defaultPressed>A</Toggle>
          </div>
          <div dir="rtl" className="flex flex-wrap items-center gap-2">
            <Toggle defaultPressed>مشروبات</Toggle>
            <Toggle>تيراميسو</Toggle>
          </div>
          <div data-tiny="" className="flex w-[160px] flex-wrap gap-2">
            <Toggle size="lg" defaultPressed>
              Tiramisu for two
            </Toggle>
            <Toggle size="sm">Pizza</Toggle>
          </div>
        </section>

        <section data-dark="" className={`flex flex-wrap items-center gap-2 ${dark}`}>
          <Toggle>Pizza</Toggle>
          <Toggle defaultPressed>Drinks</Toggle>
          <Toggle variant="outline">Outline</Toggle>
          <Toggle variant="outline" defaultPressed>
            Outline on
          </Toggle>
          <Toggle variant="outline" aria-invalid>
            Invalid
          </Toggle>
        </section>
      </div>
    </main>
  )
}
