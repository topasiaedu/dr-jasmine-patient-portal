"use client";

import { PatientPageLayout } from "@/components/patient/PatientPageLayout";
import { MotionItem } from "@/components/motion/MotionItem";
import { MotionStagger } from "@/components/motion/MotionStagger";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/** FAQ data — organised by category. */
const FAQ_DATA = [
  {
    category: "About My Readings",
    questions: [
      {
        q: "How do I measure fasting blood sugar?",
        a: "Measure in the morning before eating or drinking anything (except water). Use your glucometer and record the number shown.",
      },
      {
        q: "When should I log my readings?",
        a: "Log your fasting reading first thing in the morning. Log your post-dinner reading 2 hours after you finish eating dinner.",
      },
      {
        q: "What is a normal blood sugar reading?",
        a: "Fasting: 3.9–5.6 mmol/L is normal. 2-hour post-meal: under 7.8 mmol/L is normal. Dr. Jasmine will discuss your personal targets with you.",
      },
      {
        q: "What if my reading seems very high or very low?",
        a: "If your fasting reading is above 15 or below 3.5, please contact Dr. Jasmine immediately via WhatsApp.",
      },
    ],
  },
  {
    category: "About My Diet Guide",
    questions: [
      {
        q: "Can I eat something that is not on my guide?",
        a: "If you are unsure, the general rule is: avoid anything sweet, starchy, or made from flour. When in doubt, contact Dr. Jasmine.",
      },
      {
        q: "My guide says I can't eat rice — what do I eat instead?",
        a: "Check the Replacements section in your guide. Cauliflower rice and konjac rice are good alternatives that look and feel similar.",
      },
    ],
  },
  {
    category: "About Appointments",
    questions: [
      {
        q: "How do I join the video call?",
        a: "On the day of your appointment, open this app and go to the Appointment tab. A 'Join on Zoom' button will appear 15 minutes before your call. Tap it and Zoom will open automatically.",
      },
      {
        q: "What if I need to reschedule?",
        a: "Tap 'Reschedule this appointment' on the Appointment page, or contact Dr. Jasmine's clinic via WhatsApp.",
      },
      {
        q: "What if I have a technical problem during the call?",
        a: "Send Dr. Jasmine a WhatsApp message immediately. Her team will respond as quickly as possible.",
      },
    ],
  },
  {
    category: "About This App",
    questions: [
      {
        q: "I can't find my link to this app — what do I do?",
        a: "Visit the 'Find My Link' page and enter your email address. We will resend your link via WhatsApp immediately.",
      },
      {
        q: "Does Dr. Jasmine see my readings?",
        a: "Yes. Every time you submit your readings, Dr. Jasmine can see them in her system. She reviews them regularly.",
      },
    ],
  },
];

/** FAQ page with staggered category entrance and refined accordion styling. */
export default function FAQPage() {
  return (
    <PatientPageLayout activePath="/p/demo/faq">
      <div className="px-6 pt-8 pb-8">
        <MotionStagger>
          <MotionItem>
            <h1 className="text-[28px] font-display text-main mb-2">Frequently Asked Questions</h1>
            <p className="text-text-secondary mb-10">Common questions about your health journey</p>
          </MotionItem>

          {FAQ_DATA.map((cat, idx) => (
            <MotionItem key={cat.category}>
              <div className={idx === 0 ? "" : "mt-8"}>
                <h2 className="text-lg font-semibold text-main mb-4">{cat.category}</h2>
                <div className="space-y-3">
                  {cat.questions.map((item, qIdx) => (
                    <div key={qIdx} className="bg-surface rounded-2xl shadow-card border border-border overflow-hidden">
                      <Accordion>
                        <AccordionItem value={`item-${idx}-${qIdx}`} className="border-none">
                          <AccordionTrigger className="text-base font-semibold text-main hover:text-primary hover:no-underline px-5 py-4 text-left [&_[data-slot=accordion-trigger-icon]]:text-primary">
                            {item.q}
                          </AccordionTrigger>
                          <AccordionContent className="text-base text-text-secondary leading-relaxed px-5 pb-4">
                            {item.a}
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    </div>
                  ))}
                </div>
              </div>
            </MotionItem>
          ))}
        </MotionStagger>
      </div>
    </PatientPageLayout>
  );
}
