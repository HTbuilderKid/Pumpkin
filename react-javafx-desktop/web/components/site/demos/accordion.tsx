"use client"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

// The question list tile (content from app/preview/accordion): the first answer open.
export function AccordionDemo() {
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue="paid"
      className="rounded-(--plush-radius-card) bg-(--plush-surface) px-2 py-1 shadow-(--plush-card-shadow)"
    >
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
  )
}
