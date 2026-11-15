"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { PlusSignIcon, Tick02Icon } from "@hugeicons/core-free-icons"

import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar"

// Small photos as data URIs (96 x 96 JPEG gradients), so nothing is fetched from elsewhere.
const photo = {
  dusk: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAAQABAAD//gAPTGF2YzYzLjEuMTAyAP/bAEMACAwMDgwOEBAQEBAQExITFBQUExMTExQUFBUVFRkZGRUVFRQUFRUYGBkZGxwbGhoZGhwcHh4eJCQiIioqKzMzPv/EAFcAAQEBAQEBAAAAAAAAAAAAAAMCAQAHBgEBAQEBAQEBAAAAAAAAAAAAAwIBAAYFBBABAQAAAAAAAAAAAAAAAAAAAQARAQEAAAAAAAAAAAAAAAAAAAEA/8AAEQgAYABgAwESAAISAAMSAP/aAAwDAQACEQMRAD8A+6WJbygSBeqqsWJagkC2qlY1tCULaqVjW0JAtqpWNagkC2qlY1qCQLaqVjWoJAtqpWJbQlC6laVjW0JApWNaViWoJApWJaViW0JQsWJaViW0JApWNb0JYlvCBIF+uqxYlqCQLarFiWoJAtqsWJagkC2qlY1tCULailY1tCQLbaViWoJAsY1pWNagkClY1pWJbQkClY1pWJagkClYlpWJagkCxYlpWJbQlClY1vQ1jW8IEgX2K6ViW0JQtqsWJbQkC2qxYlqCQLSqxYlqCQLqVpWJagkCxYlpWNbQkCxYlpWJagkClY1pWJagkClY1pWJbQkClYlpWJagkCxYlpWJagkClY1vRFjW8IEgXpqqVjWoJAtqKVjWoJAttpWJbQkC5jWlYlqCQKViWlYlqCQLFiWxYltCQKVjWlYlqCQKVjWlYlqCQKVjWlYlqCQKViWlY20K7FjsutusuvvljW8UEoXra6VjW0JAusWlYlqCQLFiWlYlqCQKVjWlYltCQKViWxYlqCQLFiWlYlqCQLFiWlYltCQKVjWlYlqCQKVjWlabSqlabrrrrrrrrrrrr7ZYlvJhIF7CNaViW0JQsWJaViW0JAsWJaViWoJApWNaVjW0JQpWNaViW0JApWJaViWoJApWNaVjagrpWNsstusuuuuuuuuuuuuuuuuuuuv/2Q==",
  sea: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAAQABAAD//gAPTGF2YzYzLjEuMTAyAP/bAEMACAwMDgwOEBAQEBAQExITFBQUExMTExQUFBUVFRkZGRUVFRQUFRUYGBkZGxwbGhoZGhwcHh4eJCQiIioqKzMzPv/EAFkAAQADAQEBAAAAAAAAAAAAAAAFBAEDCAcBAQEBAQEBAQAAAAAAAAAAAAADAgEFBAYQAQEBAAAAAAAAAAAAAAAAAAACAxEBAQAAAAAAAAAAAAAAAAAAAAH/wAARCABgAGADARIAAhIAAxIA/9oADAMBAAIRAxEAPwD6EPbH5oc7LdjscEbZakIyIyy1YRkRllqwjIjbZaoyKFFp0qsIo0WhSrx2KNlo0q8Io2y0KVeEcBgUAAHpAWHkjlZbUI4I62WrCMiNtlqwjIjbLVhGRGWWoMihZadcqsIo2UjSvohFCy0KVeEUbLRpV4RwGBQAAekBYeSOVltQjgjbLVhGRGWWrCMiM0LVhGRG2y1BkUaZaVKtCKNlo0q8Io2WjXKvCKNlo0q8I4DAoAAPSAsPJHK2W1COCNstWEZEbbLVhGRG2WrCMuIyy1BwULKSpVoRRspGlXhFG2WhSrwijZSNKvHY4jA2AAPSAsPJHGy2oRwRtlqwjIjLLVhGRGWWrCMiNtlqDIo0y0qVaEUbLRpV4RRstClXjsUbLQpV4RxGRsAAekBYeSONltQjgjLLVhGRG6MtWEZEboy1YRgRtlqDgoWWlSrQijZSFKvCKNFo0r6IRRopClXhHEZGwAB//9k=",
  leaf: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAgAAAQABAAD//gAPTGF2YzYzLjEuMTAyAP/bAEMACAwMDgwOEBAQEBAQExITFBQUExMTExQUFBUVFRkZGRUVFRQUFRUYGBkZGxwbGhoZGhwcHh4eJCQiIioqKzMzPv/EAGAAAQEBAAMBAQEAAAAAAAAAAAUABgQDBwECCAEAAgMBAQAAAAAAAAAAAAAABAADAgEFBhABAQEBAQAAAAAAAAAAAAAAAAIDARERAQEBAQEAAAAAAAAAAAAAAAABAhEx/8AAEQgAYABgAwESAAISAAMSAP/aAAwDAQACEQMRAD8A3E2Mm3GuRVy400Dmjs2MmwFyKuXSmgc0dmxk2AuRVy6U0EmjvLGTYGwTcujNBJoz764M2DT3I4PNOe6eWHXsEqTTufFCuX1EkpEkpEkpEkpEkvM50Dzo9HxZ5XxNY0c2JnRFcpVJpljQTYydAtyI4nmg3h6bGTYK5E3I+aCTR2bGTYG5E3LpTQOaOzYybA3Im5dKaBzR2dBk2BuRNy6U0DmjnL9HTYGwTcujKFmizhzYRNcjUE05jr5XqFbidWV2JUrFIkl4HOgedHp2uFYnsaWdQ86KtCWJ7GlnQPOirQliexpZ0DzqxoTiexpZ0Dzoj4ug7xexopsVOiC5TNmkfGgmxc6BLkTYKmgveHpsZNgbkVcuhNBJo7NjJsBcirl0ZoJNHZ0GToAuRVy6U0Dmjs2NmwFyKuXSmgc0a5Xo+bA8E3LodCzT+a+d8fHfKMuTOjjMapYuWnQXzveMahsStDOoedFWhrE9jSzoHnRVYJYnsaWdA86KtCWJ7GlnQPOqrQliexpZ0DzqqsE4nsaSdBE6IrEiGVaxoZsXOge5TpJpAfmxk6A7kTYNmgk0dmxk2BuRNy6M0EmniCGl0ikSSkSSkSS/fK7x+CWca5s6OExqOxIanQTy+8VWD2J+NHOgedFWhLBFjSzoHnRVoOwRY0s6B50Y0HYIsaWdA86qtCWJ7GlnQPOqvGhfE1jzxJC6hSJJSJJSJJSJJSJJSJJSJJdvL7x1Eq8WIzoPY1FYlOzoInTxVoaxPxpJ1DzoxoSxPY//2Q==",
}

// The people of the tile, in the order they join: M L S, then P (amber) and J (black).
const roster = [
  { initial: "M", color: "bg-(--plush-pink)" },
  { initial: "L", color: "bg-(--plush-success)" },
  { initial: "S", color: "bg-(--plush-danger)" },
  { initial: "P", color: "bg-(--plush-warning)" },
  { initial: "J", color: "bg-(--plush-accent)" },
  { initial: "A", color: "bg-(--plush-pink)" },
  { initial: "R", color: "bg-(--plush-success)" },
  { initial: "T", color: "bg-(--plush-danger)" },
  { initial: "K", color: "bg-(--plush-warning)" },
  { initial: "E", color: "bg-(--plush-accent)" },
]

// At most four avatars and the plus: an older one ducks under its neighbour (one step to the right, a little
// smaller, faded) while the new one comes out of the plus, so the stack keeps its width.
const ducked =
  "me-[calc(var(--plush-avatar-overlap-now)_-_var(--plush-avatar-size))] scale-80 opacity-0"

function Party({
  title,
  start,
  note = "",
  disabled,
  countClassName,
}: {
  title: string
  start: number
  note?: string
  disabled?: boolean
  countClassName?: string
}) {
  const [count, setCount] = React.useState(start)
  const people = Array.from({ length: count }, (_, i) => ({ id: i, ...roster[i % roster.length] }))
  return (
    <div className="w-full min-w-0 text-center">
      <AvatarGroup className="mb-3.5 justify-center">
        {people.map((p, i) => (
          <Avatar key={p.id} size="lg" aria-hidden={i < count - 4 || undefined} className={i < count - 4 ? ducked : undefined}>
            <AvatarFallback className={p.color}>{p.initial}</AvatarFallback>
          </Avatar>
        ))}
        <AvatarGroupCount className={countClassName}>
          <button
            type="button"
            aria-label="Add a person"
            disabled={disabled}
            onClick={() => setCount((n) => n + 1)}
            className="plush-focus-ring grid size-full place-items-center rounded-(--plush-radius-full) disabled:cursor-not-allowed"
          >
            <HugeiconsIcon icon={PlusSignIcon} size={16} strokeWidth={2.4} aria-hidden />
          </button>
        </AvatarGroupCount>
      </AvatarGroup>
      <p className="text-(length:--plush-text-xl) leading-[normal] font-(--plush-weight-semi) break-words">{title}</p>
      <p className="mt-[3px] text-(length:--plush-text-sm) leading-[normal] font-(--plush-weight-medium) break-words text-(--plush-ink-2)">
        {count + 1} people{note}
      </p>
    </div>
  )
}

const tile =
  "flex h-[228px] w-[210.5px] max-w-full items-center rounded-(--plush-radius-panel) bg-(--plush-panel) p-(--plush-pad) [--plush-avatar-ring-color:var(--plush-panel)]"
const card =
  "rounded-(--plush-radius-card) bg-(--plush-surface) p-(--plush-pad) shadow-(--plush-card-shadow) [--plush-avatar-ring-color:var(--plush-surface)]"
const sizes = ["sm", "default", "lg"] as const

export default function AvatarPreview() {
  return (
    <main className="plush-font min-h-screen bg-(--plush-bg) p-8 text-(--plush-ink)">
      <div className="flex flex-col items-start gap-8">
        <div className="flex flex-wrap items-start gap-8">
          {/* The tile: M L S P and the plus, 5 people. */}
          <section data-tile="" className={tile}>
            <Party title="Pizza night" start={4} />
          </section>
          {/* The tile as it starts: three avatars, 4 people; the next one gives four and the plus, the one after that makes the stack huddle closer. */}
          <section className={tile}>
            <Party title="Pizza night" start={3} />
          </section>
          <section className={tile}>
            <Party title="Pizza night" start={3} disabled />
          </section>
          <section data-narrow="" className={`w-[240px] ${card}`}>
            <Party
              title="Pizza night on Maximiliane-Charlotte's rooftop with the whole climbing group"
              start={4}
              countClassName="bg-(--plush-fill)"
              note=", two of them still deciding whether they bring the dough or the Donaudampfschifffahrtsgesellschaftskapitän"
            />
          </section>
        </div>

        {/* Sizes sm 28, default 32, lg 46: photo, letters, a photo that fails to load, a badge, a badge with an icon. */}
        <section className={`flex flex-col gap-5 ${card}`}>
          {sizes.map((size) => (
            <div key={size} className="flex flex-wrap items-center gap-4">
              <Avatar size={size}>
                <AvatarImage src={photo.dusk} alt="Maya" />
                <AvatarFallback className="bg-(--plush-pink)">M</AvatarFallback>
              </Avatar>
              <Avatar size={size}>
                <AvatarFallback className="bg-(--plush-success)">LB</AvatarFallback>
              </Avatar>
              <Avatar size={size}>
                <AvatarFallback>CN</AvatarFallback>
              </Avatar>
              <Avatar size={size}>
                <AvatarImage src="data:image/jpeg;base64,AAAA" alt="Sam" />
                <AvatarFallback className="bg-(--plush-danger)">S</AvatarFallback>
              </Avatar>
              <Avatar size={size}>
                <AvatarImage src={photo.sea} alt="Priya" />
                <AvatarFallback className="bg-(--plush-warning)">P</AvatarFallback>
                <AvatarBadge />
              </Avatar>
              <Avatar size={size}>
                <AvatarImage src={photo.leaf} alt="Jonas" />
                <AvatarFallback>J</AvatarFallback>
                <AvatarBadge className="bg-(image:--plush-select-fill) text-(--plush-on-select) shadow-(--plush-select-gloss)">
                  <HugeiconsIcon icon={Tick02Icon} strokeWidth={2.4} aria-hidden className="[&_path]:[stroke-linejoin:miter]" />
                </AvatarBadge>
              </Avatar>
            </div>
          ))}
        </section>

        {/* Groups with a count, in each size. */}
        <section className={`flex flex-col items-start gap-5 ${card}`}>
          {sizes.map((size) => (
            <AvatarGroup key={size}>
              <Avatar size={size}>
                <AvatarImage src={photo.dusk} alt="Maya" />
                <AvatarFallback className="bg-(--plush-pink)">M</AvatarFallback>
              </Avatar>
              <Avatar size={size}>
                <AvatarFallback className="bg-(--plush-success)">L</AvatarFallback>
              </Avatar>
              <Avatar size={size}>
                <AvatarImage src={photo.sea} alt="Sam" />
                <AvatarFallback className="bg-(--plush-danger)">S</AvatarFallback>
              </Avatar>
              {/* The count is white like the plus of the tile; on a white card the caller gives it the grey fill. */}
              <AvatarGroupCount className="bg-(--plush-fill)">+3</AvatarGroupCount>
            </AvatarGroup>
          ))}
          <AvatarGroup>
            {roster.slice(0, 6).map((p) => (
              <Avatar key={p.initial} size="sm">
                <AvatarFallback className={p.color}>{p.initial}</AvatarFallback>
              </Avatar>
            ))}
            <AvatarGroupCount className="bg-(--plush-fill)">
              <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2.4} aria-hidden />
            </AvatarGroupCount>
          </AvatarGroup>
        </section>

        {/* Edge cases on the tile's grey: ten in a stack with a count in each size, letters with umlauts and emoji, a photo
            that fails (letters stay, nothing flashes), right to left, a 160 px box. */}
        <section data-edge="" className="flex flex-col items-start gap-5 rounded-(--plush-radius-card) bg-(--plush-panel) p-(--plush-pad) [--plush-avatar-ring-color:var(--plush-panel)]">
          {sizes.map((size) => (
            <AvatarGroup key={size}>
              {roster.map((p, i) => (
                <Avatar key={i} size={size}>
                  {i % 3 === 0 && <AvatarImage src={i % 2 ? photo.sea : photo.dusk} alt="" />}
                  <AvatarFallback className={p.color}>{p.initial}</AvatarFallback>
                </Avatar>
              ))}
              <AvatarGroupCount>+99</AvatarGroupCount>
            </AvatarGroup>
          ))}
          <div className="flex flex-wrap items-center gap-4">
            <Avatar size="lg">
              <AvatarFallback className="bg-(--plush-pink)">ÖZ</AvatarFallback>
            </Avatar>
            <Avatar size="lg">
              <AvatarFallback className="bg-(--plush-warning)">🍕</AvatarFallback>
            </Avatar>
            <Avatar size="lg">
              <AvatarFallback>WWW</AvatarFallback>
            </Avatar>
            <Avatar size="lg">
              <AvatarImage src="data:image/jpeg;base64,AAAA" alt="Leo" />
              <AvatarFallback className="bg-(--plush-success)">L</AvatarFallback>
              <AvatarBadge />
            </Avatar>
            <Avatar size="lg">
              <AvatarImage src="data:image/jpeg;base64,AAAA" alt="Nobody" />
              <AvatarFallback />
            </Avatar>
            <AvatarGroup dir="rtl">
              {roster.slice(0, 3).map((p) => (
                <Avatar key={p.initial}>
                  <AvatarFallback className={p.color}>{p.initial}</AvatarFallback>
                </Avatar>
              ))}
              <AvatarGroupCount>+2</AvatarGroupCount>
            </AvatarGroup>
          </div>
          <div data-tiny="" className="w-[160px]">
            <AvatarGroup>
              {roster.slice(0, 6).map((p) => (
                <Avatar key={p.initial} size="sm">
                  <AvatarFallback className={p.color}>{p.initial}</AvatarFallback>
                </Avatar>
              ))}
              <AvatarGroupCount>+4</AvatarGroupCount>
            </AvatarGroup>
          </div>
        </section>

        {/* A stack on a dark surface: the ring takes the surface colour, the focus ring turns white. */}
        <section data-dark="" className="flex flex-col items-start gap-5 rounded-(--plush-radius-card) bg-(--plush-accent) p-(--plush-pad) text-(--plush-on-accent) [--plush-avatar-ring-color:var(--plush-accent)] plush-on-dark">
          {sizes.map((size) => (
            <AvatarGroup key={size}>
              {roster.slice(0, 4).map((p) => (
                <Avatar key={p.initial} size={size}>
                  <AvatarFallback className={p.color}>{p.initial}</AvatarFallback>
                  {p.initial === "M" && <AvatarBadge className="bg-(--plush-success)" />}
                </Avatar>
              ))}
              <AvatarGroupCount>
                <button type="button" aria-label="Add a person" className="plush-focus-ring grid size-full place-items-center rounded-(--plush-radius-full)">
                  <HugeiconsIcon icon={PlusSignIcon} size={{ sm: 12, default: 14, lg: 16 }[size]} strokeWidth={2.4} aria-hidden />
                </button>
              </AvatarGroupCount>
            </AvatarGroup>
          ))}
        </section>
      </div>
    </main>
  )
}
