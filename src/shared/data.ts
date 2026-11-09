export type CategoryId =
  | 'food'
  | 'groceries'
  | 'transport'
  | 'home'
  | 'bills'
  | 'health'
  | 'fun'
  | 'shopping'

export type Category = {
  id: CategoryId
  label: string
  /** CSS colour token for the category */
  color: string
  budget: number
}

export type Expense = {
  id: string
  title: string
  amount: number
  category: CategoryId
  /** ISO date, yyyy-mm-dd */
  date: string
  method: 'Card' | 'Cash' | 'Bank transfer' | 'UPI'
  note?: string
  recurring?: boolean
}

export const CATEGORIES: Category[] = [
  { id: 'groceries', label: 'Groceries', color: 'var(--color-cat-groceries)', budget: 450 },
  { id: 'food', label: 'Eating out', color: 'var(--color-cat-food)', budget: 220 },
  { id: 'transport', label: 'Transport', color: 'var(--color-cat-transport)', budget: 160 },
  { id: 'home', label: 'Home', color: 'var(--color-cat-home)', budget: 1250 },
  { id: 'bills', label: 'Bills', color: 'var(--color-cat-bills)', budget: 240 },
  { id: 'health', label: 'Health', color: 'var(--color-cat-health)', budget: 90 },
  { id: 'fun', label: 'Fun', color: 'var(--color-cat-fun)', budget: 140 },
  { id: 'shopping', label: 'Shopping', color: 'var(--color-cat-shopping)', budget: 200 },
]

export const categoryById = (id: CategoryId) =>
  CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0]

/** "Today" in the prototype's world, so the seed data always reads as current. */
export const TODAY = '2025-06-18'
export const MONTH_LABEL = 'June 2025'
export const DAYS_IN_MONTH = 30

export const SEED_EXPENSES: Expense[] = [
  { id: 'e01', title: 'Trader Joe’s', amount: 64.18, category: 'groceries', date: '2025-06-18', method: 'Card' },
  { id: 'e02', title: 'Blue Bottle Coffee', amount: 6.5, category: 'food', date: '2025-06-18', method: 'Card' },
  { id: 'e03', title: 'Metro card top-up', amount: 30, category: 'transport', date: '2025-06-17', method: 'Card' },
  { id: 'e04', title: 'Dinner with Sam', amount: 48.2, category: 'food', date: '2025-06-17', method: 'Card', note: 'Split — Sam owes $24.10' },
  { id: 'e05', title: 'Pharmacy', amount: 18.75, category: 'health', date: '2025-06-16', method: 'Cash' },
  { id: 'e06', title: 'Spotify Family', amount: 16.99, category: 'bills', date: '2025-06-15', method: 'Card', recurring: true },
  { id: 'e07', title: 'Uber to airport', amount: 41.3, category: 'transport', date: '2025-06-14', method: 'Card' },
  { id: 'e08', title: 'Cinema tickets', amount: 28, category: 'fun', date: '2025-06-14', method: 'Card' },
  { id: 'e09', title: 'Whole Foods', amount: 92.4, category: 'groceries', date: '2025-06-13', method: 'Card' },
  { id: 'e10', title: 'Internet — Comcast', amount: 70, category: 'bills', date: '2025-06-12', method: 'Bank transfer', recurring: true },
  { id: 'e11', title: 'Running shoes', amount: 119, category: 'shopping', date: '2025-06-11', method: 'Card' },
  { id: 'e12', title: 'Lunch — Sweetgreen', amount: 15.85, category: 'food', date: '2025-06-10', method: 'Card' },
  { id: 'e13', title: 'Farmers market', amount: 37.6, category: 'groceries', date: '2025-06-08', method: 'Cash' },
  { id: 'e14', title: 'Electricity', amount: 84.12, category: 'bills', date: '2025-06-06', method: 'Bank transfer', recurring: true },
  { id: 'e15', title: 'Gas station', amount: 52.9, category: 'transport', date: '2025-06-05', method: 'Card' },
  { id: 'e16', title: 'Costco run', amount: 156.3, category: 'groceries', date: '2025-06-04', method: 'Card' },
  { id: 'e17', title: 'Board game café', amount: 22, category: 'fun', date: '2025-06-03', method: 'Card' },
  { id: 'e18', title: 'Rent — June', amount: 1250, category: 'home', date: '2025-06-01', method: 'Bank transfer', recurring: true },
  { id: 'e19', title: 'Dentist co-pay', amount: 40, category: 'health', date: '2025-06-02', method: 'Card' },
  { id: 'e20', title: 'Thai takeaway', amount: 32.4, category: 'food', date: '2025-06-02', method: 'Card' },
]

export const CURRENCIES = {
  USD: { locale: 'en-US', code: 'USD' },
  EUR: { locale: 'de-DE', code: 'EUR' },
  GBP: { locale: 'en-GB', code: 'GBP' },
  INR: { locale: 'en-IN', code: 'INR' },
} as const

export type CurrencyCode = keyof typeof CURRENCIES

export function formatMoney(value: number, currency: CurrencyCode = 'USD', opts?: { compact?: boolean; noCents?: boolean }) {
  const c = CURRENCIES[currency]
  return new Intl.NumberFormat(c.locale, {
    style: 'currency',
    currency: c.code,
    minimumFractionDigits: opts?.noCents ? 0 : 2,
    maximumFractionDigits: opts?.noCents ? 0 : 2,
    notation: opts?.compact ? 'compact' : 'standard',
  }).format(value)
}

export function formatDay(iso: string) {
  if (iso === TODAY) return 'Today'
  const d = new Date(iso + 'T12:00:00')
  const t = new Date(TODAY + 'T12:00:00')
  const diff = Math.round((t.getTime() - d.getTime()) / 86400000)
  if (diff === 1) return 'Yesterday'
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
}

export function shortDate(iso: string) {
  return new Date(iso + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function totalsByCategory(expenses: Expense[]) {
  const map = new Map<CategoryId, number>()
  for (const e of expenses) map.set(e.category, (map.get(e.category) ?? 0) + e.amount)
  return map
}

export function groupByDay(expenses: Expense[]) {
  const sorted = [...expenses].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0))
  const groups: { date: string; items: Expense[]; total: number }[] = []
  for (const e of sorted) {
    let g = groups.find((x) => x.date === e.date)
    if (!g) {
      g = { date: e.date, items: [], total: 0 }
      groups.push(g)
    }
    g.items.push(e)
    g.total += e.amount
  }
  return groups
}

/** Defensive input handling for amounts typed by the user. */
export function parseAmount(raw: string): number | null {
  const cleaned = raw.replace(/[^0-9.,]/g, '').replace(',', '.')
  if (!cleaned) return null
  const n = Number(cleaned)
  if (!Number.isFinite(n) || n <= 0 || n > 1_000_000) return null
  return Math.round(n * 100) / 100
}

/** Strip control characters and cap length on free-text fields. */
export function sanitizeText(raw: string, max = 80) {
  return raw.replace(/[\u0000-\u001F\u007F<>]/g, '').trim().slice(0, max)
}
