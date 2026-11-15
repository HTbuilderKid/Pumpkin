"use client"

import * as React from "react"

import { Slider } from "@/components/ui/slider"

// The "Tip" tile (content from app/preview/slider): 28 % of at most 30.
export function SliderDemo() {
  const [value, setValue] = React.useState([28])
  return (
    <div className="w-full px-1">
      <div className="mb-3 flex justify-between gap-3 text-(length:--plush-text-lg) leading-[normal] font-(--plush-weight-semi)">
        <span>Tip</span>
        <span className="shrink-0">{value[0]}%</span>
      </div>
      <Slider aria-label="Tip" value={value} onValueChange={setValue} max={30} step={1} />
    </div>
  )
}
