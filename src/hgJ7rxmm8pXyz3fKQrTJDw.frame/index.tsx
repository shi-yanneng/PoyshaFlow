import React, { useEffect, useState } from 'react'
import { Check, Pencil } from 'lucide-react'

import { AppShell, type Screen } from '../shared/components/AppShell'
import { CategoryIcon } from '../shared/components/CategoryIcon'
import {
  CATEGORIES,
  DAYS_IN_MONTH,
  MONTH_LABEL,
  SEED_EXPENSES,
  TODAY,
  formatMoney,
  parseAmount,
  totalsByCategory,
  type CategoryId,
  type CurrencyCode,
  type Expense,
} from '../shared/data'

export const args = {
  state: 'default',
  editing: 'none',
  currency: 'USD',
}

export const argTypes = {
  state: { control: 'radio', options: ['default', 'empty'] },
  editing: { control: 'select', options: ['none', 'groceries', 'food', 'transport', 'home', 'bills', 'health', 'fun', 'shopping'] },
  currency: { control: 'select', options: ['USD', 'EUR', 'GBP', 'INR'] },
}

type Props = Partial<typeof args> & {
  expenses?: Expense[]
  onNavigate?: (s: Screen) => void
  onAdd?: () => void
}

export default function Budgets(props: Props) {
  const p = { ...args, ...props }
  const cur = p.currency as CurrencyCode
  const money = (n: number, noCents = true) => formatMoney(n, cur, { noCents })
  const expenses = p.state === 'empty' ? [] : p.expenses ?? SEED_EXPENSES

  const [limits, setLimits] = useState<Record<string, number>>(() => Object.fromEntries(CATEGORIES.map((c) => [c.id, c.budget])))
  const [editing, setEditing] = useState<string>(p.editing)
  const [draft, setDraft] = useState('')
  useEffect(() => setEditing(p.editing), [p.editing])
  useEffect(() => {
    if (editing !== 'none') setDraft(String(limits[editing] ?? ''))
  }, [editing])
  useEffect(() => {
    document.title = 'Budgets · PoyshaFlow — Everyday expense tracker'
  }, [])

  const spentBy = totalsByCategory(expenses)
  const monthPct = Number(TODAY.slice(8)) / DAYS_IN_MONTH
  const rows = CATEGORIES.map((c) => {
    const limit = limits[c.id]
    const spent = spentBy.get(c.id) ?? 0
    const ratio = limit > 0 ? spent / limit : 0
    const status: Status = ratio > 1 ? 'over' : ratio >= 0.85 ? 'close' : 'ok'
    return { ...c, limit, spent, ratio, status }
  }).sort((a, b) => b.ratio - a.ratio)

  const totalLimit = rows.reduce((s, r) => s + r.limit, 0)
  const totalSpent = rows.reduce((s, r) => s + r.spent, 0)
  const needsAttention = rows.filter((r) => r.status !== 'ok').length

  function save(id: CategoryId) {
    const n = parseAmount(draft)
    if (n !== null) setLimits((l) => ({ ...l, [id]: Math.round(n) }))
    setEditing('none')
  }

  return (
    <AppShell active="budgets" onNavigate={p.onNavigate} onAdd={p.onAdd}>
      <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-10 lg:py-9">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-[28px]">Budgets</h1>
          <p className="mt-1 text-sm text-muted">Monthly limits for {MONTH_LABEL}. Tap a limit to change it.</p>
        </header>

        <section className="mt-6 flex flex-wrap items-end justify-between gap-x-10 gap-y-4 border-b border-line pb-6">
          <div>
            <h2 className="text-sm font-medium text-muted">Spent of total budget</h2>
            <p className="num mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">
              {money(totalSpent)} <span className="text-xl font-medium text-muted sm:text-2xl">/ {money(totalLimit)}</span>
            </p>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-ink-2">
            {p.state === 'empty'
              ? 'No spending yet this month — your limits are ready when you are.'
              : needsAttention === 0
                ? 'Every category is on track.'
                : `${needsAttention} ${needsAttention === 1 ? 'category needs' : 'categories need'} attention. ${Math.round(monthPct * 100)}% of the month has passed.`}
          </p>
        </section>

        <div className="hidden grid-cols-[minmax(0,1.4fr)_minmax(0,2fr)_8rem_7rem] gap-6 px-1 pb-2 pt-5 text-xs font-medium text-muted md:grid">
          <span>Category</span>
          <span>Progress</span>
          <span className="text-right">Spent / limit</span>
          <span className="text-right">Status</span>
        </div>

        <ul className="divide-y divide-line md:border-t md:border-line">
          {rows.map((r) => (
            <li key={r.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 px-1 py-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,2fr)_8rem_7rem] md:gap-6">
              <div className="flex min-w-0 items-center gap-3">
                <CategoryIcon id={r.id} />
                <span className="truncate text-sm font-medium">{r.label}</span>
              </div>

              <div className="order-last col-span-2 md:order-none md:col-span-1">
                <div className="relative h-2 overflow-hidden rounded-full bg-sunken">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(r.ratio, 1) * 100}%`,
                      backgroundColor: r.status === 'over' ? 'var(--color-danger)' : r.status === 'close' ? 'var(--color-warn)' : r.color,
                    }}
                  />
                </div>
              </div>

              <div className="num text-right text-sm">
                <span className="font-medium">{money(r.spent)}</span>
                <span className="text-muted"> / </span>
                {editing === r.id ? (
                  <form
                    className="inline-flex items-center gap-1"
                    onSubmit={(e) => {
                      e.preventDefault()
                      save(r.id)
                    }}
                  >
                    <label className="sr-only" htmlFor={`limit-${r.id}`}>
                      {r.label} monthly limit
                    </label>
                    <input
                      id={`limit-${r.id}`}
                      autoFocus
                      inputMode="numeric"
                      maxLength={7}
                      value={draft}
                      onChange={(e) => setDraft(e.target.value.replace(/[^0-9]/g, ''))}
                      onKeyDown={(e) => e.key === 'Escape' && setEditing('none')}
                      className="num h-7 w-16 rounded-md border border-brand bg-surface px-1.5 text-right text-sm outline-none"
                    />
                    <button type="submit" aria-label="Save limit" className="rounded-md bg-brand p-1 text-white">
                      <Check size={14} />
                    </button>
                  </form>
                ) : (
                  <button
                    onClick={() => setEditing(r.id)}
                    className="group inline-flex items-center gap-1 rounded text-muted underline decoration-line-strong decoration-dotted underline-offset-4 transition-colors duration-150 hover:text-ink"
                    aria-label={`Edit ${r.label} limit, currently ${money(r.limit)}`}
                  >
                    {money(r.limit)}
                    <Pencil size={11} className="opacity-0 transition-opacity duration-150 group-hover:opacity-100" />
                  </button>
                )}
              </div>

              <div className="order-last col-span-2 text-sm md:order-none md:col-span-1 md:text-right">
                <StatusText status={r.status} left={r.limit - r.spent} money={money} />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </AppShell>
  )
}

type Status = 'ok' | 'close' | 'over'

function StatusText({ status, left, money }: { status: Status; left: number; money: (n: number) => string }) {
  if (status === 'over') return <span className="num font-medium text-danger">Over by {money(-left)}</span>
  if (status === 'close') return <span className="num font-medium text-warn">{money(left)} left</span>
  return <span className="num text-muted">{money(left)} left</span>
}
