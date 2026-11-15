import * as React from "react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

// The card in the tile: white, 4 px above and below, the rows' text 18 px from the edge (8 px here plus the item's 10).
const card = "rounded-(--plush-radius-card) bg-(--plush-surface) px-2 py-1 shadow-(--plush-card-shadow)"

export default function AccordionPreview() {
  return (
    <main className="plush-font min-h-screen bg-(--plush-bg) p-8 text-(--plush-ink)">
      <div className="flex flex-col items-start gap-8">
        <div className="flex flex-wrap items-start gap-8">
          <section
            data-tile=""
            className="flex min-h-[228px] w-[441px] max-w-full items-center rounded-(--plush-radius-panel) bg-(--plush-panel) p-(--plush-pad)"
          >
            <Accordion type="single" collapsible defaultValue="paid" className={card}>
              <AccordionItem value="paid">
                <AccordionTrigger>Who paid for what?</AccordionTrigger>
                <AccordionContent>Maya paid $96, everyone owes her $24.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="later">
                <AccordionTrigger>Can I pay later?</AccordionTrigger>
                <AccordionContent>Yes, settle up any time this week.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="reminders">
                <AccordionTrigger>How do reminders work?</AccordionTrigger>
                <AccordionContent>Every evening at 7 until it’s paid.</AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          <section data-narrow="" className="w-[240px]">
            <Accordion type="single" collapsible defaultValue="long" className={card}>
              <AccordionItem value="long">
                <AccordionTrigger>
                  What happens when somebody in the group never pays back their share of the dinner?
                </AccordionTrigger>
                <AccordionContent>
                  Reminders go out every evening at 7 in their own time zone and stop on their own as soon as the
                  last share arrives, Supercalifragilisticexpialidocious-sized words included.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="short">
                <AccordionTrigger>Can I pay later?</AccordionTrigger>
                <AccordionContent>Yes, settle up any time this week.</AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>
        </div>

        <div className="flex flex-wrap items-start gap-8">
          <Accordion type="multiple" defaultValue={["split", "locked"]} className={`w-[441px] max-w-full ${card}`}>
            <AccordionItem value="split">
              <AccordionTrigger>How is the bill split?</AccordionTrigger>
              <AccordionContent>
                <p>Evenly by default.</p>
                <p>
                  Switch to <a href="#split">by item</a> to give everyone their own lines.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="export">
              <AccordionTrigger>Can I export the group?</AccordionTrigger>
              <AccordionContent>As a spreadsheet, from the group menu.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="archived" disabled>
              <AccordionTrigger>Archived groups</AccordionTrigger>
              <AccordionContent>Archived groups are read only.</AccordionContent>
            </AccordionItem>
            <AccordionItem value="locked" disabled>
              <AccordionTrigger>Locked while settling</AccordionTrigger>
              <AccordionContent>Nothing can change until everyone has paid.</AccordionContent>
            </AccordionItem>
          </Accordion>

          <Accordion type="single" className={`w-[441px] max-w-full ${card}`}>
            <AccordionItem value="long">
              <AccordionTrigger>
                Remind every friend who still owes you something, every single evening, until the whole bill is
                paid back
              </AccordionTrigger>
              <AccordionContent>
                Reminders go out at 8 pm in each friend’s own time zone and stop on their own as soon as the last
                share arrives, so nobody gets a message after they have settled up.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="closed">
              <AccordionTrigger>How do reminders work?</AccordionTrigger>
              <AccordionContent>Every evening at 7 until it’s paid.</AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        <div data-states="" className="flex flex-wrap items-start gap-8">
          <Accordion data-case="nested" type="single" collapsible defaultValue="outer" className={`w-[441px] max-w-full ${card}`}>
            <AccordionItem value="outer">
              <AccordionTrigger>Groups inside a group</AccordionTrigger>
              <AccordionContent>
                <Accordion type="single" collapsible defaultValue="inner-a">
                  <AccordionItem value="inner-a">
                    <AccordionTrigger>Flat 3B</AccordionTrigger>
                    <AccordionContent>Maya, Leo and you.</AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="inner-b">
                    <AccordionTrigger>Climbing</AccordionTrigger>
                    <AccordionContent>Six people, two cars.</AccordionContent>
                  </AccordionItem>
                </Accordion>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="after">
              <AccordionTrigger>After the nested one</AccordionTrigger>
              <AccordionContent>Still in line.</AccordionContent>
            </AccordionItem>
          </Accordion>

          <Accordion data-case="one" type="single" collapsible className={`w-[441px] max-w-full ${card}`}>
            <AccordionItem value="one">
              <AccordionTrigger>Ä</AccordionTrigger>
              <AccordionContent>Ü 🍕</AccordionContent>
            </AccordionItem>
          </Accordion>

          <Accordion data-case="long-answer" type="multiple" className={`w-[441px] max-w-full ${card}`}>
            <AccordionItem value="terms">
              <AccordionTrigger>All the rules for settling up</AccordionTrigger>
              <AccordionContent>
                {Array.from({ length: 8 }, (_, i) => (
                  <p key={i}>
                    Rule {i + 1}: everyone pays their own part of the bill, including tax and tip, rounded up to the next
                    whole cent, and the reminders stop on their own once the last share has arrived.
                  </p>
                ))}
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="next">
              <AccordionTrigger>Below the long one</AccordionTrigger>
              <AccordionContent>Moves down while it opens.</AccordionContent>
            </AccordionItem>
          </Accordion>

          <div data-case="rtl" dir="rtl" className="w-[441px] max-w-full">
            <Accordion dir="rtl" type="single" collapsible defaultValue="a" className={card}>
              <AccordionItem value="a">
                <AccordionTrigger>من دفع ثمن ماذا؟ سؤال طويل يلتف على سطرين في البطاقة الضيقة</AccordionTrigger>
                <AccordionContent>دفعت مايا ٩٦ دولارًا.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="b">
                <AccordionTrigger>هل يمكنني الدفع لاحقًا؟</AccordionTrigger>
                <AccordionContent>نعم.</AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>

          <section data-narrow="160" className="w-[160px]">
            <Accordion type="single" collapsible defaultValue="a" className={card}>
              <AccordionItem value="a">
                <AccordionTrigger>Who paid for what?</AccordionTrigger>
                <AccordionContent>Maya paid $96.</AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>

          <section data-dark="" className="plush-on-dark w-[240px] rounded-(--plush-radius-card) bg-(--plush-accent) p-(--plush-pad) text-(--plush-on-accent)">
            <Accordion type="single" collapsible defaultValue="a">
              <AccordionItem value="a">
                <AccordionTrigger>Who paid for what?</AccordionTrigger>
                <AccordionContent>Maya paid $96.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="b">
                <AccordionTrigger>Can I pay later?</AccordionTrigger>
                <AccordionContent>Yes.</AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>
        </div>
      </div>
    </main>
  )
}
