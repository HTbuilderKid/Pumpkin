import fs from "node:fs"
import path from "node:path"

import { ArrowUpRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import config from "@/library.config.json"
import { Bento, type Source } from "@/components/site/bento"
import { CommandText } from "@/components/site/catalog"
import { CopyButton } from "@/components/site/copy-button"

// Every registry item's source, read at build time (static export): name -> the file `shadcn add` writes.
// A missing file fails the build on purpose instead of showing an empty detail view.
function readSources(): Record<string, Source> {
  const dir = path.join(process.cwd(), "registry/items")
  const sources: Record<string, Source> = {}
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith(".json"))) {
    const item = JSON.parse(fs.readFileSync(path.join(dir, file), "utf8"))
    const first = item.files?.[0]?.path
    if (!first) continue
    sources[item.name] = {
      path: first,
      code: fs.readFileSync(path.join(process.cwd(), first), "utf8"),
      description: item.description,
    }
  }
  return sources
}

export default function Home() {
  const url = config.url.replace(/\/$/, "")
  const example = `npx shadcn@latest add ${url}/r/switch.json`
  return (
    <main className="plush-font min-h-screen bg-(--plush-bg) pb-[max(64px,calc(2*var(--plush-site-margin)))] text-(--plush-ink)">
      {/* Set on the tile grid (globals.css .plush-site-head): name and sentence on the left, the command in the last three
          tile columns beside them (wide grids) or under them. Type as in the tiles: sizes and weights from the tokens (the
          title takes the counter's 40 px, the largest text of the tiles), the command in a grey pill like a tile. */}
      <header className="plush-site-frame plush-site-head">
        <div className="plush-site-head-text flex min-w-0 flex-col gap-3">
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-4 gap-y-1">
            <h1 className="min-w-0 text-(length:--plush-text-counter) leading-none font-(--plush-weight-semi) tracking-[-0.02em] break-words">{config.displayName}</h1>
            {/* The source, next to the name. A flat text link: under the pointer only its colour and the arrow turn ink; nothing moves. */}
            <a
              href={config.repo}
              target="_blank"
              rel="noreferrer"
              className="group/repo plush-focus-ring inline-flex shrink-0 items-center gap-1 rounded-(--plush-radius-full) text-(length:--plush-text-sm) font-(--plush-weight-medium) text-(--plush-ink-2) [transition:color_var(--plush-dur-fast)_var(--plush-ease-fade)] hover:text-(--plush-ink)"
            >
              github
              <HugeiconsIcon icon={ArrowUpRight01Icon} size={14} strokeWidth={2.4} aria-hidden className="size-3.5 shrink-0 text-(--plush-ink-3) [transition:color_var(--plush-dur-fast)_var(--plush-ease-fade)] group-hover/repo:text-(--plush-ink)" />
            </a>
          </div>
          <p className="text-(length:--plush-text-xl) leading-snug font-(--plush-weight-medium) text-pretty text-(--plush-ink-2)">
            {config.description}
          </p>
        </div>
        <div className="plush-site-head-cmd flex min-w-0 flex-col gap-2">
          <div className="flex min-w-0 items-center gap-3 rounded-(--plush-radius-full) bg-(--plush-panel) py-2 pr-2 pl-5 text-(--plush-ink)">
            <code className="plush-site-code min-w-0 flex-1 py-1.5 text-(length:--plush-text-sm) leading-[1.45]">
              <CommandText command={example} />
            </code>
            <CopyButton text={example} label="copy install command for the switch" />
          </div>
          <p className="plush-site-head-note px-5 text-(length:--plush-text-sm) font-(--plush-weight-medium) text-(--plush-ink-2)">
            every tile has its own command.
          </p>
        </div>
      </header>

      <div className="plush-site-frame">
        <Bento url={url} sources={readSources()} />
      </div>
    </main>
  )
}
