import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { X } from 'lucide-react'

import { CategoryIcon } from './CategoryIcon'
import { CATEGORIES, TODAY, parseAmount, sanitizeText, type CategoryId, type Expense } from '../data'

type Props = {
  open: boolean
  currencySymbol?: string
  onClose: () => void
  onSave: (e: Expense) => void
}

const METHODS: Expense['method'][] = ['Card', 'Cash', 'Bank transfer', 'UPI']
const EASE = [0.23, 1, 0.32, 1] as const

export function AddExpenseSheet({ open, currencySymbol = '$', onClose, onSave }: Props) {
  const reduce = useReducedMotion()
  const [amount, setAmount] = useState('')
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<CategoryId | null>(null)
  const [day, setDay] = useState<'today' | 'yesterday'>('today')
  const [method, setMethod] = useState<Expense['method']>('Card')
  const [recurring, setRecurring] = useState(false)
  const [tried, setTried] = useState(false)
  const amountRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    setAmount('')
    setTitle('')
    setCategory(null)
    setDay('today')
    setMethod('Card')
    setRecurring(false)
    setTried(false)
    const t = setTimeout(() => amountRef.current?.focus(), 60)
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => {
      clearTimeout(t)
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  const parsed = parseAmount(amount)
  const amountError = tried && parsed === null ? 'Enter an amount greater than 0.' : null
  const categoryError = tried && !category ? 'Pick a category.' : null

  function submit(ev: React.FormEvent) {
    ev.preventDefault()
    setTried(true)
    if (parsed === null || !category) return
    const date = day === 'today' ? TODAY : '2025-06-17'
    onSave({
      id: `n${Date.now()}`,
      title: sanitizeText(title) || CATEGORIES.find((c) => c.id === category)!.label,
      amount: parsed,
      category,
      date,
      method,
      recurring,
    })
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-stretch sm:justify-end">
          <motion.div
            className="absolute inset-0 bg-ink/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: EASE }}
            onClick={onClose}
          />
          <motion.form
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-title"
            onSubmit={submit}
            noValidate
            autoComplete="off"
            className="relative flex max-h-[92%] w-full flex-col rounded-t-2xl bg-surface shadow-xl sm:m-3 sm:max-h-none sm:w-[420px] sm:rounded-2xl"
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, y: 16 }}
            transition={{ duration: 0.24, ease: EASE }}
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 id="add-title" className="text-base font-semibold">
                Add expense
              </h2>
              <button type="button" onClick={onClose} aria-label="Close" className="rounded-md p-1.5 text-muted transition-colors duration-150 hover:bg-sunken hover:text-ink">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              <label htmlFor="amount" className="text-sm font-medium text-ink-2">
                Amount
              </label>
              <div
                className={`mt-2 flex items-baseline gap-1 rounded-xl border bg-canvas px-4 py-3 transition-colors duration-150 focus-within:border-brand ${
                  amountError ? 'border-danger' : 'border-line'
                }`}
              >
                <span className="text-2xl font-medium text-muted">{currencySymbol}</span>
                <input
                  ref={amountRef}
                  id="amount"
                  inputMode="decimal"
                  placeholder="0.00"
                  value={amount}
                  maxLength={10}
                  onChange={(e) => setAmount(e.target.value.replace(/[^0-9.,]/g, ''))}
                  aria-invalid={!!amountError}
                  aria-describedby={amountError ? 'amount-err' : undefined}
                  className="num w-full bg-transparent text-3xl font-semibold tracking-tight outline-none placeholder:text-line-strong"
                />
              </div>
              {amountError && (
                <p id="amount-err" role="alert" className="mt-1.5 text-sm text-danger">
                  {amountError}
                </p>
              )}

              <fieldset className="mt-6">
                <legend className="text-sm font-medium text-ink-2">Category</legend>
                <div className="mt-2 grid grid-cols-4 gap-2">
                  {CATEGORIES.map((c) => {
                    const on = category === c.id
                    return (
                      <button
                        type="button"
                        key={c.id}
                        onClick={() => setCategory(c.id)}
                        aria-pressed={on}
                        className={`flex flex-col items-center gap-1.5 rounded-xl border px-1 py-2.5 text-[11px] font-medium transition-colors duration-150 ${
                          on ? 'border-brand bg-brand-soft text-brand-ink' : 'border-line text-ink-2 hover:border-line-strong'
                        }`}
                      >
                        <CategoryIcon id={c.id} size="sm" />
                        <span className="w-full truncate text-center">{c.label}</span>
                      </button>
                    )
                  })}
                </div>
                {categoryError && (
                  <p role="alert" className="mt-1.5 text-sm text-danger">
                    {categoryError}
                  </p>
                )}
              </fieldset>

              <label htmlFor="desc" className="mt-6 block text-sm font-medium text-ink-2">
                What was it for? <span className="font-normal text-muted">Optional</span>
              </label>
              <input
                id="desc"
                value={title}
                maxLength={80}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Coffee with Ana"
                className="mt-2 h-11 w-full rounded-lg border border-line bg-surface px-3 text-sm outline-none transition-colors duration-150 placeholder:text-muted/70 focus:border-brand"
              />

              <div className="mt-6 grid grid-cols-2 gap-4">
                <Segment label="When" value={day} options={[['today', 'Today'], ['yesterday', 'Yesterday']]} onChange={(v) => setDay(v as 'today' | 'yesterday')} />
                <div>
                  <label htmlFor="method" className="text-sm font-medium text-ink-2">
                    Paid with
                  </label>
                  <select
                    id="method"
                    value={method}
                    onChange={(e) => setMethod(e.target.value as Expense['method'])}
                    className="mt-2 h-10 w-full rounded-lg border border-line bg-surface px-3 text-sm outline-none focus:border-brand"
                  >
                    {METHODS.map((m) => (
                      <option key={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>

              <label className="mt-6 flex cursor-pointer items-center justify-between gap-4 rounded-lg bg-canvas px-4 py-3">
                <span>
                  <span className="block text-sm font-medium">Repeats every month</span>
                  <span className="block text-xs text-muted">For rent, subscriptions and bills</span>
                </span>
                <input type="checkbox" checked={recurring} onChange={(e) => setRecurring(e.target.checked)} className="peer sr-only" />
                <span className="relative h-6 w-10 shrink-0 rounded-full bg-line-strong transition-colors duration-150 peer-checked:bg-brand peer-focus-visible:outline-2 peer-focus-visible:outline-brand after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform after:duration-150 peer-checked:after:translate-x-4" />
              </label>
            </div>

            <div className="flex gap-3 border-t border-line px-5 py-4">
              <button type="button" onClick={onClose} className="h-11 flex-1 rounded-lg border border-line-strong text-sm font-medium transition-colors duration-150 hover:bg-sunken">
                Cancel
              </button>
              <button type="submit" className="h-11 flex-[2] rounded-lg bg-brand text-sm font-semibold text-white transition-colors duration-150 hover:bg-brand-hover">
                Save expense
              </button>
            </div>
          </motion.form>
        </div>
      )}
    </AnimatePresence>
  )
}

function Segment({ label, value, options, onChange }: { label: string; value: string; options: [string, string][]; onChange: (v: string) => void }) {
  return (
    <div role="radiogroup" aria-label={label}>
      <span className="text-sm font-medium text-ink-2">{label}</span>
      <div className="mt-2 grid h-10 grid-cols-2 rounded-lg bg-sunken p-1">
        {options.map(([v, l]) => (
          <button
            type="button"
            role="radio"
            aria-checked={value === v}
            key={v}
            onClick={() => onChange(v)}
            className={`rounded-md text-sm font-medium transition-colors duration-150 ${value === v ? 'bg-surface text-ink shadow-sm' : 'text-muted hover:text-ink'}`}
          >
            {l}
          </button>
        ))}
      </div>
    </div>
  )
}
