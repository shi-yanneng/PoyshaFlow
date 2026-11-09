import React from 'react'
import { LayoutGrid, ListOrdered, PiggyBank, Plus, ShieldCheck, Settings } from 'lucide-react'

export type Screen = 'overview' | 'transactions' | 'budgets'

const NAV: { id: Screen; label: string; icon: typeof LayoutGrid }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'transactions', label: 'Transactions', icon: ListOrdered },
  { id: 'budgets', label: 'Budgets', icon: PiggyBank },
]

type Props = {
  active: Screen
  userName?: string
  onNavigate?: (s: Screen) => void
  onAdd?: () => void
  children: React.ReactNode
}

export function AppShell({ active, userName = 'Maya Lopez', onNavigate, onAdd, children }: Props) {
  const initials = userName
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
  return (
    <div className="flex h-screen w-full bg-canvas text-ink">
      {/* Desktop sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-line bg-surface px-4 py-5 lg:flex" aria-label="Primary">
        <Logo />
        <button
          onClick={onAdd}
          className="mt-7 flex h-10 items-center justify-center gap-2 rounded-lg bg-brand px-4 text-sm font-semibold text-white transition-colors duration-150 hover:bg-brand-hover"
        >
          <Plus size={16} strokeWidth={2.5} />
          Add expense
          <kbd className="ml-1 rounded bg-white/15 px-1.5 py-0.5 font-sans text-[11px] font-medium text-white/90">N</kbd>
        </button>
        <nav className="mt-6 flex flex-col gap-0.5">
          {NAV.map((n) => {
            const on = n.id === active
            return (
              <button
                key={n.id}
                onClick={() => onNavigate?.(n.id)}
                aria-current={on ? 'page' : undefined}
                className={`flex h-9 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors duration-150 ${
                  on ? 'bg-sunken text-ink' : 'text-muted hover:bg-sunken/60 hover:text-ink'
                }`}
              >
                <n.icon size={17} strokeWidth={on ? 2.25 : 2} />
                {n.label}
              </button>
            )
          })}
        </nav>
        <div className="mt-auto flex flex-col gap-4">
          <p className="flex items-start gap-2 text-xs leading-relaxed text-muted">
            <ShieldCheck size={14} className="mt-0.5 shrink-0 text-brand" />
            End-to-end encrypted. Synced 2 min ago.
          </p>
          <div className="flex items-center gap-3 border-t border-line pt-4">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold text-brand-ink">
              {initials}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{userName}</p>
              <p className="text-xs text-muted">Personal</p>
            </div>
            <button aria-label="Settings" className="rounded-md p-1.5 text-muted transition-colors duration-150 hover:bg-sunken hover:text-ink">
              <Settings size={16} />
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-line bg-surface px-4 lg:hidden">
          <Logo />
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-soft text-xs font-semibold text-brand-ink">
            {initials}
          </span>
        </header>

        <main className="min-h-0 flex-1 overflow-y-auto">{children}</main>

        {/* Mobile tab bar */}
        <nav aria-label="Primary" className="grid shrink-0 grid-cols-4 border-t border-line bg-surface px-2 pb-2 pt-1.5 lg:hidden">
          {NAV.slice(0, 2).map((n) => (
            <TabButton key={n.id} item={n} active={n.id === active} onClick={() => onNavigate?.(n.id)} />
          ))}
          <TabButton item={NAV[2]} active={active === 'budgets'} onClick={() => onNavigate?.('budgets')} />
          <button onClick={onAdd} className="flex flex-col items-center gap-1 py-1 text-[11px] font-semibold text-brand">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-white">
              <Plus size={16} strokeWidth={2.5} />
            </span>
            Add
          </button>
        </nav>
      </div>
    </div>
  )
}

function TabButton({ item, active, onClick }: { key?: string; item: (typeof NAV)[number]; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
      className={`flex flex-col items-center gap-1 py-1 text-[11px] font-medium ${active ? 'text-ink' : 'text-muted'}`}
    >
      <span className="flex h-7 items-center">
        <item.icon size={20} strokeWidth={active ? 2.25 : 1.75} />
      </span>
      {item.label}
    </button>
  )
}

function Logo() {
  return (
    <div className="flex items-center gap-2 px-1">
      <svg width="22" height="22" viewBox="0 0 22 22" aria-hidden>
        <rect width="22" height="22" rx="6" fill="var(--color-brand)" />
        <path d="M8 16V6h3.6a3 3 0 0 1 0 6H8" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="text-[17px] font-semibold tracking-tight">PoyshaFlow</span>
    </div>
  )
}
