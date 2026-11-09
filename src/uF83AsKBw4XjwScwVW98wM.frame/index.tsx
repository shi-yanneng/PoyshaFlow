import React, { useEffect } from 'react'
import { ArrowRight, CalendarClock, Plus, Repeat } from 'lucide-react'

import { AppShell, type Screen } from '../shared/components/AppShell'
import { CategoryIcon } from '../shared/components/CategoryIcon'
import {
  CATEGORIES,
  DAYS_IN_MONTH,
  MONTH_LABEL,
  SEED_EXPENSES,
  TODAY,
  categoryById,
  formatMoney,
  shortDate,
  totalsByCategory,
  type CurrencyCode,
  type Expense,
} from '../shared/data'

export const args = {
  state: 'default',
  userName: 'Maya Lopez',
  monthlyBudget: 2750,
  currency: 'USD',
}

export const argTypes = {
  state: { control: 'radio', options: ['default', 'empty'] },
  userName: { control: 'text' },
  monthlyBudget: { control: 'number' },
  currency: { control: 'select', options: ['USD', 'EUR', 'GBP', 'INR'] },
}

type Props = Partial<typeof args> & {
  expenses?: Expense[]
  onNavigate?: (s: Screen) => void
  onAdd?: () => void
}

export default function Overview(props: Props) {
  const { state, userName, monthlyBudget, currency, expenses: given, onNavigate, onAdd } = { ...args, ...props }
  const cur = currency as CurrencyCode
  const expenses = state === 'empty' ? [] : given ?? SEED_EXPENSES
  const money = (n: number, o?: { noCents?: boolean }) => formatMoney(n, cur, o)

  useEffect(() => {
    document.title = 'Overview · PoyshaFlow — Everyday expense tracker'
  }, [])

  const spent = expenses.reduce((s, e) => s + e.amount, 0)
  const left = monthlyBudget - spent
  const over = left < 0
  const todayNum = Number(TODAY.slice(8))
  const daysLeft = DAYS_IN_MONTH - todayNum + 1
  const perDay = Math.max(left, 0) / daysLeft
  const pct = Math.min(spent / Math.max(monthlyBudget, 1), 1)

  const daily = Array.from({ length: DAYS_IN_MONTH }, (_, i) => {
    const day = String(i + 1).padStart(2, '0')
    return expenses.filter((e) => !e.recurring && e.date.endsWith(`-${day}`)).reduce((s, e) => s + e.amount, 0)
  })
  const maxDaily = Math.max(...daily, 1)
  const flexibleTotal = daily.reduce((s, d) => s + d, 0)

  const byCat = totalsByCategory(expenses)
  const topCats = CATEGORIES.map((c) => ({ ...c, spent: byCat.get(c.id) ?? 0 }))
    .filter((c) => c.spent > 0)
    .sort((a, b) => b.spent - a.spent)
  const recent = [...expenses].sort((a, b) => (a.date < b.date ? 1 : -1)).slice(0, 6)
  const firstName = userName.split(' ')[0]

  return (
    <AppShell active="overview" userName={userName} onNavigate={onNavigate} onAdd={onAdd}>
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-10 lg:py-9">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-sm text-muted">Good afternoon, {firstName}</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-[28px]">{MONTH_LABEL}</h1>
          </div>
          <button
            onClick={onAdd}
            className="hidden h-10 items-center gap-2 rounded-lg border border-line-strong bg-surface px-4 text-sm font-medium text-ink transition-colors duration-150 hover:bg-sunken sm:flex lg:hidden"
          >
            <Plus size={16} /> Add expense
          </button>
        </header>

        {state === 'empty' ? (
          <EmptyState budget={money(monthlyBudget, { noCents: true })} onAdd={onAdd} />
        ) : (
          <>
            {/* Primary: how much is left */}
            <section aria-labelledby="left-heading" className="mt-6 rounded-2xl bg-surface p-5 shadow-[0_1px_2px_rgba(23,25,27,0.06)] ring-1 ring-line sm:p-7">
              <div className="grid gap-8 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
                <div className="flex flex-col">
                  <h2 id="left-heading" className="text-sm font-medium text-muted">
                    {over ? 'Over budget by' : 'Left to spend this month'}
                  </h2>
                  <p className={`num mt-2 text-[44px] font-semibold leading-none tracking-tight sm:text-[56px] ${over ? 'text-danger' : 'text-ink'}`}>
                    {money(Math.abs(left))}
                  </p>
                  <div className="mt-6">
                    <div
                      className="h-2.5 w-full overflow-hidden rounded-full bg-sunken"
                      role="progressbar"
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(pct * 100)}
                      aria-label="Share of monthly budget spent"
                    >
                      <div className={`h-full rounded-full ${over ? 'bg-danger' : 'bg-brand'}`} style={{ width: `${pct * 100}%` }} />
                    </div>
                    <div className="num mt-2.5 flex justify-between text-sm text-muted">
                      <span>
                        <span className="font-medium text-ink">{money(spent)}</span> spent
                      </span>
                      <span>of {money(monthlyBudget, { noCents: true })}</span>
                    </div>
                  </div>
                  <p className="mt-6 rounded-lg bg-canvas px-4 py-3 text-sm leading-relaxed text-ink-2">
                    {over ? (
                      <>You’ve gone past this month’s budget. Pausing eating out and shopping for {daysLeft} days would help most.</>
                    ) : (
                      <>
                        Spend up to <span className="num font-semibold text-ink">{money(perDay)}</span> a day for the next {daysLeft} days to stay on budget.
                      </>
                    )}
                  </p>
                </div>

                <div className="flex min-w-0 flex-col">
                  <div className="flex items-baseline justify-between">
                    <h3 className="text-sm font-medium text-muted">Day-to-day spending</h3>
                    <span className="num text-sm text-muted">{money(flexibleTotal, { noCents: true })} excl. bills</span>
                  </div>
                  <div className="mt-4 flex h-40 items-end gap-[3px] sm:gap-1" aria-label="Daily spending chart for June">
                    {daily.map((v, i) => {
                      const day = i + 1
                      const future = day > todayNum
                      const isToday = day === todayNum
                      return (
                        <div key={i} className="group relative flex h-full flex-1 items-end" title={future ? `Jun ${day}` : `Jun ${day}: ${money(v)}`}>
                          <div
                            className={`w-full rounded-t-[3px] ${future ? 'bg-sunken' : isToday ? 'bg-brand' : 'bg-brand/35 group-hover:bg-brand/60'} transition-colors duration-150`}
                            style={{ height: future ? '6%' : `${Math.max((v / maxDaily) * 100, v > 0 ? 6 : 2)}%` }}
                          />
                        </div>
                      )
                    })}
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-muted">
                    <span>Jun 1</span>
                    <span className="font-medium text-ink">Today</span>
                    <span>Jun 30</span>
                  </div>
                </div>
              </div>
            </section>

            <div className="mt-6 grid gap-6 lg:grid-cols-[1.45fr_1fr]">
              {/* Recent transactions */}
              <section aria-labelledby="recent-heading" className="min-w-0 rounded-2xl bg-surface ring-1 ring-line">
                <div className="flex items-center justify-between px-5 pb-2 pt-5 sm:px-6">
                  <h2 id="recent-heading" className="text-base font-semibold">Recent</h2>
                  <button onClick={() => onNavigate?.('transactions')} className="flex items-center gap-1 text-sm font-medium text-brand transition-colors duration-150 hover:text-brand-hover">
                    See all <ArrowRight size={14} />
                  </button>
                </div>
                <ul className="px-2 pb-2 sm:px-3">
                  {recent.map((e) => (
                    <li key={e.id} className="flex items-center gap-3 rounded-lg px-3 py-2.5">
                      <CategoryIcon id={e.category} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{e.title}</p>
                        <p className="truncate text-xs text-muted">
                          {categoryById(e.category).label} · {shortDate(e.date)}
                        </p>
                      </div>
                      <span className="num text-sm font-medium">−{money(e.amount)}</span>
                    </li>
                  ))}
                </ul>
              </section>

              <div className="flex min-w-0 flex-col gap-6">
                {/* Where it went */}
                <section aria-labelledby="cats-heading" className="rounded-2xl bg-surface p-5 ring-1 ring-line sm:p-6">
                  <div className="flex items-center justify-between">
                    <h2 id="cats-heading" className="text-base font-semibold">Where it went</h2>
                    <button onClick={() => onNavigate?.('budgets')} className="text-sm font-medium text-brand transition-colors duration-150 hover:text-brand-hover">
                      Budgets
                    </button>
                  </div>
                  <ul className="mt-4 flex flex-col gap-3.5">
                    {topCats.slice(0, 5).map((c) => {
                      const ratio = c.spent / c.budget
                      return (
                        <li key={c.id}>
                          <div className="flex items-center justify-between gap-3 text-sm">
                            <span className="flex min-w-0 items-center gap-2">
                              <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: c.color }} aria-hidden />
                              <span className="truncate">{c.label}</span>
                            </span>
                            <span className="num shrink-0 text-muted">
                              <span className={`font-medium ${ratio > 1 ? 'text-danger' : 'text-ink'}`}>{money(c.spent, { noCents: true })}</span> / {money(c.budget, { noCents: true })}
                            </span>
                          </div>
                          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-sunken">
                            <div className="h-full rounded-full" style={{ width: `${Math.min(ratio, 1) * 100}%`, backgroundColor: ratio > 1 ? 'var(--color-danger)' : c.color }} />
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                </section>

                {/* Coming up */}
                <section aria-labelledby="upcoming-heading" className="rounded-2xl bg-surface p-5 ring-1 ring-line sm:p-6">
                  <h2 id="upcoming-heading" className="flex items-center gap-2 text-base font-semibold">
                    <CalendarClock size={16} className="text-muted" /> Coming up
                  </h2>
                  <ul className="mt-3 divide-y divide-line">
                    {UPCOMING.map((u) => (
                      <li key={u.title} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                        <div className="min-w-0">
                          <p className="truncate font-medium">{u.title}</p>
                          <p className="flex items-center gap-1 text-xs text-muted">
                            <Repeat size={11} /> {u.when}
                          </p>
                        </div>
                        <span className="num shrink-0 font-medium">{money(u.amount)}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              </div>
            </div>
          </>
        )}
      </div>
    </AppShell>
  )
}

function EmptyState({ budget, onAdd }: { budget: string; onAdd?: () => void }) {
  return (
    <section className="mt-6 flex flex-col items-start rounded-2xl bg-surface p-6 ring-1 ring-line sm:p-10">
      <p className="num text-sm text-muted">Monthly budget: {budget}</p>
      <h2 className="mt-3 max-w-lg text-2xl font-semibold tracking-tight sm:text-3xl">Log your first expense and PoyshaFlow does the maths.</h2>
      <p className="mt-3 max-w-lg text-[15px] leading-relaxed text-muted">
        Add what you spend as you go — a coffee, a bus fare, the weekly shop. We’ll show what’s left for the month and how much you can spend each day.
      </p>
      <button
        onClick={onAdd}
        className="mt-7 flex h-11 items-center gap-2 rounded-lg bg-brand px-5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-brand-hover"
      >
        <Plus size={16} strokeWidth={2.5} /> Add your first expense
      </button>
    </section>
  )
}

const UPCOMING = [
  { title: 'Rent — July', when: 'Jul 1 · Monthly', amount: 1250 },
  { title: 'Phone plan', when: 'Jun 22 · Monthly', amount: 35 },
  { title: 'Gym membership', when: 'Jun 25 · Monthly', amount: 29 },
]
