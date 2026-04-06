'use client'

import { useState } from 'react'

const faqs = [
  {
    question: "Who is Pulse Pro for?",
    answer: "Anyone who needs to get things done. Freelancers managing client projects, solo founders tracking their startup, or anyone who just wants a fast, simple place to organize tasks and deadlines. If Apple Notes is your current task manager, you'll love Pulse Pro."
  },
  {
    question: "How is this different from Trello or Asana?",
    answer: "Those tools are built for 50-person teams with sprints, boards, and complex workflows. Pulse Pro is built for people who just need to track clients, projects, and deadlines — without the overhead. You'll be up and running in under 5 minutes."
  },
  {
    question: "Is there a free plan?",
    answer: "Yes. The free plan includes 3 projects, 50 tasks, and 1 client — enough to see if Pulse Pro fits your workflow before upgrading."
  },
  {
    question: "What do I get with Pro vs Team?",
    answer: "Pro ($12/mo) gives you unlimited projects, tasks, and clients, plus file attachments, Telegram bot, email reminders, and the ability to share projects with up to 3 collaborators. Team ($29/mo) includes everything in Pro plus up to 10 team members with full role-based access control — viewer, editor, and manager roles."
  },
  {
    question: "Is my data secure?",
    answer: "Yes. Pulse Pro runs on Vercel with encrypted connections. Your data is never shared with third parties."
  },
  {
    question: "Do you offer refunds?",
    answer: "Yes — 30-day money-back guarantee on all paid plans. No questions asked."
  },
  {
    question: "Will prices go up?",
    answer: "No. The price you sign up at is the price you keep. We don't do surprise hikes — unlike some tools that raised prices 18–87% in the last year."
  },
  {
    question: "Do I need to set up projects first?",
    answer: "No. Just add tasks. Press N, type what you need to do, hit Enter. You can organize tasks into projects later, or keep them as quick standalone tasks — it's up to you."
  },
  {
    question: "Can my team use Pulse Pro?",
    answer: "Yes! Pro users can share projects with up to 3 collaborators. Team plan ($29/mo) supports up to 10 members with role-based access — assign viewer, editor, or manager roles per project. No per-seat fees."
  }
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <section id="faq" className="py-20 md:py-28 bg-[#f5f5f7] dark:bg-[#1d1d1f]">
      <div className="max-w-3xl mx-auto px-4 md:px-8">
        <h2 className="text-3xl font-semibold text-foreground text-center tracking-tight font-[family-name:var(--font-display)]">
          Questions? Answers.
        </h2>

        <div className="mt-10 divide-y divide-border border-t border-b border-border max-w-2xl mx-auto">
          {faqs.map((faq, index) => (
            <div key={index}>
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between py-4 text-left text-sm font-medium text-foreground hover:text-muted-foreground transition-colors"
              >
                <span>{faq.question}</span>
                <svg
                  className={`w-5 h-5 text-muted-foreground transition-transform duration-200 flex-shrink-0 ml-4 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <div
                className={`grid transition-all duration-300 ${
                  openIndex === index ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                }`}
              >
                <div className="overflow-hidden">
                  <div className="pb-4 text-muted-foreground text-sm">
                    {faq.answer}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
