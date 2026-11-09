import React, { useCallback, useEffect, useState } from 'react'

import SignIn from '../sixqzVGmf2DhRCtbLm6bo6.frame'
import Overview from '../uF83AsKBw4XjwScwVW98wM.frame'
import Transactions from '../pK8dVUNz5HvLFrYW4vfSZo.frame'
import Budgets from '../hgJ7rxmm8pXyz3fKQrTJDw.frame'

import { AddExpenseSheet } from '../shared/components/AddExpenseSheet'
import type { Screen } from '../shared/components/AppShell'
import { SEED_EXPENSES, type CurrencyCode, type Expense } from '../shared/data'

const SIGN_IN = 'sixqzVGmf2DhRCtbLm6bo6'
const OVERVIEW = 'uF83AsKBw4XjwScwVW98wM'
const TRANSACTIONS = 'pK8dVUNz5HvLFrYW4vfSZo'
const BUDGETS = 'hgJ7rxmm8pXyz3fKQrTJDw'

const SCREEN_TO_ID: Record<Screen, string> = {
  overview: OVERVIEW,
  transactions: TRANSACTIONS,
  budgets: BUDGETS,
}

const SYMBOLS: Record<CurrencyCode, string> = { USD: '$', EUR: '€', GBP: '£', INR: '₹' }

/** The size every frame draws at, unless one exports its own. */
export const viewport = 'web'

export const args = {
  account: 'returning',
  currency: 'USD',
}

export const argTypes = {
  account: { control: 'radio', options: ['returning', 'new'] },
  currency: { control: 'select', options: ['USD', 'EUR', 'GBP', 'INR'] },
}

type Props = Partial<typeof args> & { start?: string }

export default function ExpenseTracker(props: Props) {
  const { account, currency, start } = { ...args, ...props }
  const cur = currency as CurrencyCode
  const [step, setStep] = useState(() => start ?? SIGN_IN)
  const [signingIn, setSigningIn] = useState(false)
  const [adding, setAdding] = useState(false)
  const [expenses, setExpenses] = useState<Expense[]>(() => (account === 'new' ? [] : SEED_EXPENSES))

  useEffect(() => {
    setExpenses(account === 'new' ? [] : SEED_EXPENSES)
  }, [account])

  const navigate = (s: Screen) => setStep(SCREEN_TO_ID[s])
  const openAdd = () => setAdding(true)
  const closeAdd = useCallback(() => setAdding(false), [])

  // "N" opens the add sheet from anywhere in the app
  useEffect(() => {
    if (step === SIGN_IN) return
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement
      if (e.key.toLowerCase() === 'n' && !e.metaKey && !e.ctrlKey && !['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName)) {
        e.preventDefault()
        setAdding(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [step])

  if (step === SIGN_IN) {
    return (
      <SignIn
        state={signingIn ? 'verifying' : 'default'}
        onSubmit={() => {
          setSigningIn(true)
          setTimeout(() => {
            setSigningIn(false)
            setStep(OVERVIEW)
          }, 700)
        }}
      />
    )
  }

  const empty = expenses.length === 0
  const shared = { currency: cur, expenses, onNavigate: navigate, onAdd: openAdd }

  return (
    <>
      {step === TRANSACTIONS ? (
        <Transactions {...shared} state={empty ? 'empty' : 'default'} selectedId="" />
      ) : step === BUDGETS ? (
        <Budgets {...shared} state={empty ? 'empty' : 'default'} />
      ) : (
        <Overview {...shared} state={empty ? 'empty' : 'default'} />
      )}
      <AddExpenseSheet
        open={adding}
        currencySymbol={SYMBOLS[cur]}
        onClose={closeAdd}
        onSave={(e) => {
          setExpenses((prev) => [e, ...prev])
          setAdding(false)
        }}
      />
    </>
  )
}
