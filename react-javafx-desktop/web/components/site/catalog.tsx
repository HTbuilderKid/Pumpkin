import type { ComponentType } from "react"

import { AccordionDemo } from "@/components/site/demos/accordion"
import { AvatarDemo } from "@/components/site/demos/avatar"
import { BadgeDemo } from "@/components/site/demos/badge"
import { ButtonActionsDemo, ButtonPayDemo } from "@/components/site/demos/button"
import { CalendarDemo } from "@/components/site/demos/calendar"
import { CheckboxDemo } from "@/components/site/demos/checkbox"
import { CounterAmountDemo, CounterPeopleDemo } from "@/components/site/demos/counter"
import { DialogDemo } from "@/components/site/demos/dialog"
import { InputFieldDemo, InputSearchDemo } from "@/components/site/demos/input"
import { InputOTPDemo } from "@/components/site/demos/input-otp"
import { ProgressDemo } from "@/components/site/demos/progress"
import { ProgressRingDemo } from "@/components/site/demos/progress-ring"
import { RadioGroupDemo } from "@/components/site/demos/radio-group"
import { RatingDemo } from "@/components/site/demos/rating"
import { SelectDemo } from "@/components/site/demos/select"
import { SliderDemo } from "@/components/site/demos/slider"
import { SonnerDemo } from "@/components/site/demos/sonner"
import { StepsDemo } from "@/components/site/demos/steps"
import { SwitchDemo } from "@/components/site/demos/switch"
import { TabsDemo } from "@/components/site/demos/tabs"
import { ToggleDemo } from "@/components/site/demos/toggle"
import { ToggleGroupDemo } from "@/components/site/demos/toggle-group"
import { TooltipDemo } from "@/components/site/demos/tooltip"

// The one list of the page: one entry per registry item (one install command), with one or more tiles.
// Wide grids give every tile a fixed place (8 columns of about
// 210 px, half rows of 104 px) without its tiles that do not exist yet (player, chat, compose, timer, chart, appearance).
// The list "Split by" is four half rows high, so it opens inside its tile; the chips are two high, so
// four chosen chips may wrap into a second row. To close every grid without holes, a few tiles take one more half row
// on one grid only (the third number of a place).
// - 8 columns (from 1860 px): `at`, 8 x 10. Calendar, tabs, amount, search, code and field on the left; status, checks,
//   upload and people next to them; the sheet, the toast, the questions and the list in the middle; the dark ring and
//   the actions on top of the toggles, the rating and the guests; toggles, chips, choice, tooltip, steps and pay on the right.
// - 6 columns (1408-1859 px): `at6`, 6 x 13. The first six columns as above, the right two below them (half rows 10-13).
// - 4 columns (1024-1407 px): `at4`, 4 x 20. Two columns pack densely in the order of `tiles` below; phones use one.
/** Place on a grid: [column, half row], both from 1, and optionally the half rows the tile takes there (default `rows`). */
export type Place = [number, number] | [number, number, number]

export type TileSpec = {
  /** Unique per tile: data-tile and React key. */
  id: string
  /** The real component, operable. */
  demo: ComponentType
  /** Columns on the wide grids (the unit, about 210 px). */
  cols: 1 | 2
  /** Half rows (the unit, 104 px). */
  rows: number
  /** Place on the 8-column grid. */
  at: Place
  /** Place on the 6-column grid. */
  at6: Place
  /** Place on the 4-column grid (1024-1407 px), 4 x 20: the left pair of columns, then the rest beside it. */
  at4: Place
  /** Columns on the two-column grid (640-1023 px, dense packing), when it differs from `cols`: one tile there spans both,
   *  so the one-column tiles (all two or four half rows high) pair up without a hole. */
  cols2?: 1 | 2
  /** Tile background: the grey panel, white like the calendar, the light tint of the choice, black like the ring. */
  tone?: "panel" | "surface" | "tint" | "dark"
}

export type CatalogEntry = {
  /** Registry item name: components/ui/<name>.tsx and <url>/r/<name>.json */
  name: string
  title: string
  /** The first tile is the main one; a second tile of the same component points to the same entry and command. */
  tiles: TileSpec[]
}

const t = (
  id: string,
  demo: ComponentType,
  cols: 1 | 2,
  rows: number,
  at: Place,
  at6: Place,
  at4: Place,
  tone?: TileSpec["tone"],
  cols2?: TileSpec["cols2"]
): TileSpec => ({ id, demo, cols, rows, at, at6, at4, tone, cols2 })

export const catalog: CatalogEntry[] = [
  { name: "calendar", title: "Calendar", tiles: [t("calendar", CalendarDemo, 2, 4, [1, 1], [1, 1], [1, 1], "surface")] },
  { name: "tabs", title: "Tabs", tiles: [t("tabs", TabsDemo, 2, 1, [1, 5], [1, 5], [1, 5])] },
  {
    name: "counter",
    title: "Counter",
    tiles: [
      t("counter-amount", CounterAmountDemo, 2, 2, [1, 6], [1, 6], [1, 6], "surface"),
      t("counter-people", CounterPeopleDemo, 1, 2, [6, 8], [6, 8], [4, 13]),
    ],
  },
  {
    name: "input",
    title: "Input",
    tiles: [t("input-field", InputFieldDemo, 2, 1, [1, 10], [1, 10], [3, 7]), t("input-search", InputSearchDemo, 2, 1, [1, 8], [1, 8], [1, 8])],
  },
  { name: "input-otp", title: "Input OTP", tiles: [t("input-otp", InputOTPDemo, 2, 1, [1, 9], [1, 9], [1, 9])] },
  { name: "badge", title: "Badge", tiles: [t("badge", BadgeDemo, 1, 2, [3, 1], [3, 1], [3, 1])] },
  { name: "checkbox", title: "Checkbox", tiles: [t("checkbox", CheckboxDemo, 1, 4, [3, 3], [3, 3], [3, 3])] },
  { name: "progress", title: "Progress", tiles: [t("progress", ProgressDemo, 1, 2, [3, 7], [3, 7], [3, 8])] },
  { name: "dialog", title: "Dialog", tiles: [t("dialog", DialogDemo, 2, 3, [4, 1], [4, 1], [1, 14])] },
  { name: "sonner", title: "Sonner", tiles: [t("sonner", SonnerDemo, 2, 1, [4, 4], [4, 4], [1, 17])] },
  { name: "accordion", title: "Accordion", tiles: [t("accordion", AccordionDemo, 2, 2, [4, 5], [4, 5], [1, 18, 3])] },
  { name: "select", title: "Select", tiles: [t("select", SelectDemo, 1, 4, [4, 7], [4, 7], [4, 8])] },
  { name: "toggle", title: "Toggle", tiles: [t("toggle", ToggleDemo, 2, 1, [5, 7], [5, 7], [3, 12])] },
  { name: "avatar", title: "Avatar", tiles: [t("avatar", AvatarDemo, 1, 2, [3, 9], [3, 9], [3, 10], undefined, 2)] },
  { name: "progress-ring", title: "Progress Ring", tiles: [t("progress-ring", ProgressRingDemo, 1, 2, [6, 1, 3], [6, 1, 3], [4, 1, 3], "dark")] },
  {
    name: "button",
    title: "Button",
    tiles: [t("button-pay", ButtonPayDemo, 2, 1, [7, 10], [1, 13], [3, 20]), t("button-actions", ButtonActionsDemo, 1, 2, [6, 4, 3], [6, 4, 3], [4, 4, 3])],
  },
  { name: "rating", title: "Rating", tiles: [t("rating", RatingDemo, 1, 2, [5, 8], [5, 8], [3, 13])] },
  { name: "switch", title: "Switch", tiles: [t("switch", SwitchDemo, 2, 2, [7, 1], [1, 11], [1, 10])] },
  { name: "toggle-group", title: "Toggle Group", tiles: [t("toggle-group", ToggleGroupDemo, 2, 2, [7, 3], [5, 12], [1, 12])] },
  { name: "radio-group", title: "Radio Group", tiles: [t("radio-group", RadioGroupDemo, 2, 2, [7, 5], [5, 10], [3, 15], "tint")] },
  { name: "tooltip", title: "Tooltip", tiles: [t("tooltip", TooltipDemo, 1, 2, [7, 7, 3], [3, 11], [3, 17])] },
  { name: "steps", title: "Steps", tiles: [t("steps", StepsDemo, 1, 2, [8, 7, 3], [4, 11], [4, 17])] },
  { name: "slider", title: "Slider", tiles: [t("slider", SliderDemo, 2, 1, [5, 10], [3, 13], [3, 19])] },
]

/** Every tile with its entry, in reading order of the 6-column grid (the order narrower grids pack in). */
export const tiles = catalog
  .flatMap((entry) => entry.tiles.map((tile) => ({ entry, tile })))
  .sort((a, b) => a.tile.at6[1] - b.tile.at6[1] || a.tile.at6[0] - b.tile.at6[0])

export function addCommand(url: string, name: string) {
  return `npx shadcn@latest add ${url}/r/${name}.json`
}

/** An install command as text that wraps at its spaces and before the file name, never inside the address (its hyphen
 *  would otherwise be a break point) or the file name. Copying uses the plain string from addCommand. */
export function CommandText({ command }: { command: string }) {
  const cut = command.lastIndexOf("/") + 1
  const space = command.lastIndexOf(" ", cut) + 1
  return (
    <>
      {command.slice(0, space)}
      <span className="whitespace-nowrap">{command.slice(space, cut)}</span>
      <wbr />
      <span className="whitespace-nowrap">{command.slice(cut)}</span>
    </>
  )
}
