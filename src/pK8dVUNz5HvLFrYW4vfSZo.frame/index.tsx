import React, { useEffect, useMemo, useState } from 'react'
import { Download, Pencil, Repeat, Search, Trash2, X } from 'lucide-react'

import { AppShell, type Screen } from '../shared/components/AppShell'
import { CategoryIcon } from '../shared/components/CategoryIcon'
import {
  CATEGORIES,
  MONTH_LABEL,
  SEED_EXPENSES,
  categoryById,
  formatDay,
  formatMoney,
  groupByDay,
  sanitizeText,
  type CategoryId,
  type CurrencyCode,
  type Expense,
} from '../shared/data'

export const args = {
  state: 'default',
  query: '',
  category: 'all',
  selectedId: 'e04',
  currency: 'USD',
}

export const argTypes = {
  state: { control: 'radio', options: ['default', 'empty'] },
  query: { control: 'text' },
  category: { control: 'select', options: ['all', 'groceries', 'food', 'transport', 'home', 'bills', 'health', 'fun', 'shopping'] },
  selectedId: { control: 'text' },
  currency: { control: 'select', options: ['USD', 'EUR', 'GBP', 'INR'] },
}

type Props = Partial<typeof args> & {
  expenses?: Expense[]
  onNavigate?: (s: Screen) => void
  onAdd?: () => void
}

export default function Transactions(props: Props) {
  const p = { ...args, ...props }
  const cur = p.currency as CurrencyCode
  const money = (n: number) => formatMoney(n, cur)
  const all = p.state === 'empty' ? [] : p.expenses ?? SEED_EXPENSES

  const [query, setQuery] = useState(p.query)
  const [cat, setCat] = useState<string>(p.category)
  const [selected, setSelected] = useState<string | null>(p.selectedId || null)
  const [deleted, setDeleted] = useState<string[]>([])
  useEffect(() => setQuery(p.query), [p.query])
  useEffect(() => setCat(p.category), [p.category])
  useEffect(() => setSelected(p.selectedId || null), [p.selectedId])
  useEffect(() => {
    document.title = 'Transactions · PoyshaFlow — Everyday expense tracker'
  }, [])

  const visible = useMemo(() => {
    const q = sanitizeText(query).toLowerCase()
    return all.filter(
      (e) =>
        !deleted.includes(e.id) &&
        (cat === 'all' || e.category === cat) &&
        (!q || e.title.toLowerCase().includes(q) || categoryById(e.category).label.toLowerCase().includes(q)),
    )
  }, [all, query, cat, deleted])
  const groups = groupByDay(visible)
  const total = visible.reduce((s, e) => s + e.amount, 0)
  const current = visible.find((e) => e.id === selected) ?? null

  return (
    <AppShell active="transactions" onNavigate={p.onNavigate} onAdd={p.onAdd}>
      <div className="flex h-full min-h-0">
        <div className="min-w-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-10 lg:py-9">
            <header className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight sm:text-[28px]">Transactions</h1>
                <p className="num mt-1 text-sm text-muted">
                  {MONTH_LABEL} · {visible.length} {visible.length === 1 ? 'expense' : 'expenses'} · <span className="font-medium text-ink">{money(total)}</span>
                </p>
              </div>
              <button className="flex h-9 items-center gap-2 rounded-lg border border-line-strong bg-surface px-3 text-sm font-medium transition-colors duration-150 hover:bg-sunken">
                <Download size={15} /> Export CSV
              </button>
            </header>

            {/* Search + filter */}
            <div className="sticky top-0 z-10 -mx-4 mt-5 bg-canvas/95 px-4 pb-3 pt-1 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10">
              <label className="relative block">
                <span className="sr-only">Search transactions</span>
                <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="search"
                  value={query}
                  maxLength={60}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name or category"
                  className="h-11 w-full rounded-lg border border-line bg-surface pl-9 pr-3 text-sm outline-none transition-colors duration-150 placeholder:text-muted focus:border-brand"
                />
              </label>
              <div className="-mx-1 mt-3 flex gap-1.5 overflow-x-auto px-1 pb-1" role="group" aria-label="Filter by category">
                <Chip on={cat === 'all'} onClick={() => setCat('all')}>
                  All
                </Chip>
                {CATEGORIES.map((c) => (
                  <Chip key={c.id} on={cat === c.id} onClick={() => setCat(c.id)}>
                    <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} aria-hidden />
                    {c.label}
                  </Chip>
                ))}
              </div>
            </div>

            {all.length === 0 ? (
              <div className="mt-10 text-center">
                <h2 className="text-lg font-semibold">No expenses yet</h2>
                <p className="mx-auto mt-2 max-w-sm text-sm text-muted">Everything you add shows up here, grouped by day, so you can search and tidy it later.</p>
                <button onClick={p.onAdd} className="mt-5 h-10 rounded-lg bg-brand px-4 text-sm font-semibold text-white transition-colors duration-150 hover:bg-brand-hover">
                  Add an expense
                </button>
              </div>
            ) : groups.length === 0 ? (
              <div className="mt-10 text-center">
                <h2 className="text-lg font-semibold">Nothing matches “{sanitizeText(query) || categoryById(cat as CategoryId).label}”</h2>
                <button
                  onClick={() => {
                    setQuery('')
                    setCat('all')
                  }}
                  className="mt-3 text-sm font-medium text-brand hover:text-brand-hover"
                >
                  Clear search and filters
                </button>
              </div>
            ) : (
              <div className="mt-2 flex flex-col gap-6">
                {groups.map((g) => (
                  <section key={g.date} aria-label={formatDay(g.date)}>
                    <div className="flex items-baseline justify-between border-b border-line pb-2">
                      <h2 className="text-sm font-semibold">{formatDay(g.date)}</h2>
                      <span className="num text-sm text-muted">{money(g.total)}</span>
                    </div>
                    <ul className="mt-1">
                      {g.items.map((e) => {
                        const on = e.id === selected
                        return (
                          <li key={e.id}>
                            <button
                              onClick={() => setSelected(on ? null : e.id)}
                              aria-expanded={on}
                              className={`-mx-3 flex w-[calc(100%+1.5rem)] items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors duration-150 ${
                                on ? 'bg-surface ring-1 ring-line-strong' : 'hover:bg-surface'
                              }`}
                            >
                              <CategoryIcon id={e.category} />
                              <div className="min-w-0 flex-1">
                                <p className="flex items-center gap-1.5 truncate text-sm font-medium">
                                  {e.title}
                                  {e.recurring && <Repeat size={12} className="shrink-0 text-muted" aria-label="Repeats monthly" />}
                                </p>
                                <p className="truncate text-xs text-muted">
                                  {categoryById(e.category).label} · {e.method}
                                </p>
                              </div>
                              <span className="num text-sm font-medium">−{money(e.amount)}</span>
                            </button>
                          </li>
                        )
                      })}
                    </ul>
                  </section>
                ))}
              </div>
            )}
          </div>
        </div>

        {current && (
          <Detail
            expense={current}
            money={money}
            onClose={() => setSelected(null)}
            onDelete={() => {
              setDeleted((d) => [...d, current.id])
              setSelected(null)
            }}
          />
        )}
      </div>
    </AppShell>
  )
}

function Chip({ on, onClick, children }: { key?: string; on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-pressed={on}
      className={`flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 text-[13px] font-medium transition-colors duration-150 ${
        on ? 'border-ink bg-ink text-white' : 'border-line bg-surface text-ink-2 hover:border-line-strong'
      }`}
    >
      {children}
    </button>
  )
}

function Detail({ expense, money, onClose, onDelete }: { expense: Expense; money: (n: number) => string; onClose: () => void; onDelete: () => void }) {
  const [confirm, setConfirm] = useState(false)
  useEffect(() => setConfirm(false), [expense.id])
  const cat = categoryById(expense.category)
  const rows: [string, string][] = [
    ['Category', cat.label],
    ['Date', formatDay(expense.date)],
    ['Paid with', expense.method],
    ['Repeats', expense.recurring ? 'Every month' : 'No'],
  ]
  return (
    <aside
      aria-label="Expense details"
      className="fixed inset-x-0 bottom-0 z-30 max-h-[80%] overflow-y-auto rounded-t-2xl border-t border-line bg-surface shadow-xl lg:static lg:z-auto lg:max-h-none lg:w-[360px] lg:shrink-0 lg:rounded-none lg:border-l lg:border-t-0 lg:shadow-none"
    >
      <div className="flex items-center justify-between px-6 pt-5">
        <CategoryIcon id={expense.category} size="lg" />
        <button onClick={onClose} aria-label="Close details" className="rounded-md p-1.5 text-muted transition-colors duration-150 hover:bg-sunken hover:text-ink">
          <X size={18} />
        </button>
      </div>
      <div className="px-6 pb-6">
        <p className="mt-4 text-sm text-muted">{expense.title}</p>
        <p className="num mt-1 text-4xl font-semibold tracking-tight">{money(expense.amount)}</p>

        <dl className="mt-6 divide-y divide-line border-y border-line">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 py-3 text-sm">
              <dt className="text-muted">{k}</dt>
              <dd className="font-medium">{v}</dd>
            </div>
          ))}
        </dl>

        {expense.note && (
          <div className="mt-5">
            <h3 className="text-sm font-medium text-muted">Note</h3>
            <p className="mt-1 text-sm leading-relaxed">{expense.note}</p>
          </div>
        )}

        <div className="mt-7 flex gap-3">
          <button className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-line-strong text-sm font-medium transition-colors duration-150 hover:bg-sunken">
            <Pencil size={15} /> Edit
          </button>
          {confirm ? (
            <button onClick={onDelete} className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-danger text-sm font-semibold text-white transition-colors duration-150 hover:bg-danger/90">
              Confirm delete
            </button>
          ) : (
            <button
              onClick={() => setConfirm(true)}
              className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg border border-line-strong text-sm font-medium text-danger transition-colors duration-150 hover:bg-danger-soft"
            >
              <Trash2 size={15} /> Delete
            </button>
          )}
        </div>
      </div>
    </aside>
  )
}
