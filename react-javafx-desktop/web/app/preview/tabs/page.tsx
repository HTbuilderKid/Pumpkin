import * as React from "react"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const many = ["Items", "People", "Activity", "Notes", "Receipts", "Photos", "Places", "Settle", "History", "Export", "Members", "Archive"]

function Many({ className = "" }: { className?: string }) {
  return (
    <Tabs defaultValue="Activity" className={className}>
      <TabsList className="w-full">
        {many.map((name) => (
          <TabsTrigger key={name} value={name}>
            {name}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  )
}

const card = "rounded-(--plush-radius-card) bg-(--plush-surface) p-(--plush-pad) shadow-(--plush-card-shadow)"

function Video({ className = "" }: { className?: string }) {
  return (
    <TabsList className={className}>
      <TabsTrigger value="items">Items</TabsTrigger>
      <TabsTrigger value="people">People</TabsTrigger>
      <TabsTrigger value="activity">Activity</TabsTrigger>
    </TabsList>
  )
}

function Panels() {
  return (
    <>
      <TabsContent value="items" className={card}>
        Pizza, two salads and a round of drinks, $72.00 in total.
      </TabsContent>
      <TabsContent value="people" className={card}>
        Maya, Leo and you. Leo still owes $24.00.
      </TabsContent>
      <TabsContent value="activity" className={card}>
        Maya paid her share an hour ago.
      </TabsContent>
    </>
  )
}

export default function TabsPreview() {
  return (
    <main className="plush-font min-h-screen bg-(--plush-bg) p-8 text-(--plush-ink)">
      <div className="flex flex-col items-start gap-8">
        <section
          data-tile=""
          className="flex h-[104px] w-[441px] max-w-full items-center justify-center rounded-(--plush-radius-panel) bg-(--plush-panel) p-(--plush-pad)"
        >
          <Tabs defaultValue="activity" className="max-w-full">
            <Video className="w-[358px]" />
          </Tabs>
        </section>

        <div className="flex flex-wrap items-start gap-8">
          <Tabs defaultValue="people" className="w-[441px] max-w-full">
            <Video className="w-full" />
            <Panels />
          </Tabs>

          <Tabs defaultValue="items" className="w-[441px] max-w-full">
            <TabsList variant="line" className="w-full">
              <TabsTrigger value="items">Items</TabsTrigger>
              <TabsTrigger value="people">People</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
            <Panels />
          </Tabs>
        </div>

        <div className="flex flex-wrap items-start gap-8">
          <Tabs defaultValue="people">
            <TabsList>
              <TabsTrigger value="items">Items</TabsTrigger>
              <TabsTrigger value="people">People</TabsTrigger>
              <TabsTrigger value="activity" disabled>
                Activity
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <Tabs defaultValue="people" orientation="vertical" className="w-[441px] max-w-full">
            <TabsList>
              <TabsTrigger value="items">Items</TabsTrigger>
              <TabsTrigger value="people">People</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
            <Panels />
          </Tabs>

          <Tabs defaultValue="people" orientation="vertical">
            <TabsList variant="line">
              <TabsTrigger value="items">Items</TabsTrigger>
              <TabsTrigger value="people">People</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex flex-wrap items-start gap-8">
          <section data-narrow="" className="flex w-[240px] flex-col gap-6">
            <Tabs defaultValue="activity">
              <Video className="w-full" />
            </Tabs>
            <Tabs defaultValue="everything">
              <TabsList className="w-full">
                <TabsTrigger value="mine">Mine</TabsTrigger>
                <TabsTrigger value="everything">Everything everyone added since the start</TabsTrigger>
              </TabsList>
              <TabsContent value="mine">Only what you paid for yourself.</TabsContent>
              <TabsContent value="everything">
                Every item, every payment and every reminder that anyone in the group added since the very first evening
              </TabsContent>
            </Tabs>
          </section>

          <Tabs defaultValue="split" className="w-[441px] max-w-full">
            <TabsList className="w-full">
              <TabsTrigger value="split">Split evenly between everyone at the table</TabsTrigger>
              <TabsTrigger value="share">By share</TabsTrigger>
              <TabsTrigger value="Supercalifragilisticexpialidocious">Supercalifragilistic</TabsTrigger>
            </TabsList>
            <TabsContent value="split" className={card}>
              Everyone pays the same part of the bill, including tax and tip, rounded up to the next whole cent so the total
              always comes out right, no matter how many friends join or leave before the bill is settled.
            </TabsContent>
            <TabsContent value="share" className={card}>
              Each friend pays for their own share.
            </TabsContent>
            <TabsContent value="Supercalifragilisticexpialidocious" className={card}>
              Supercalifragilisticexpialidocious
            </TabsContent>
          </Tabs>
        </div>

        <div data-states="" className="flex flex-wrap items-start gap-8">
          <div data-case="many" className="w-[441px] max-w-full">
            <Many />
          </div>
          <div data-case="many-narrow" className="w-[240px]">
            <Many />
          </div>
          <Tabs data-case="line-disabled" defaultValue="people">
            <TabsList variant="line">
              <TabsTrigger value="items">Items</TabsTrigger>
              <TabsTrigger value="people">People</TabsTrigger>
              <TabsTrigger value="activity" disabled>
                Activity
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <Tabs data-case="rtl" dir="rtl" defaultValue="people">
            <Video />
          </Tabs>
          <section data-narrow="160" className="w-[160px]">
            <Tabs defaultValue="people">
              <Video className="w-full" />
            </Tabs>
          </section>
          <section data-dark="" className="rounded-(--plush-radius-card) bg-(--plush-accent) p-(--plush-pad) text-(--plush-on-accent)">
            <Tabs defaultValue="people">
              <Video />
            </Tabs>
          </section>
          {/* Line variant on a dark ground (plush-on-dark): the words take the light inks. */}
          <section data-dark="" data-case="line-dark" className="plush-on-dark rounded-(--plush-radius-card) bg-(--plush-accent) p-(--plush-pad) text-(--plush-on-accent)">
            <Tabs defaultValue="people">
              <TabsList variant="line">
                <TabsTrigger value="items">Items</TabsTrigger>
                <TabsTrigger value="people">People</TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
              </TabsList>
            </Tabs>
          </section>
        </div>
      </div>
    </main>
  )
}
