"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

// The tabs tile (content from app/preview/tabs): Items, People, Activity, Activity chosen. The bar is as
// wide as three 116 px tabs plus 5 px padding (358 px), narrower in a smaller tile.
export function TabsDemo() {
  return (
    <Tabs defaultValue="activity" className="w-full max-w-[358px]">
      <TabsList className="w-full">
        <TabsTrigger value="items">Items</TabsTrigger>
        <TabsTrigger value="people">People</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
