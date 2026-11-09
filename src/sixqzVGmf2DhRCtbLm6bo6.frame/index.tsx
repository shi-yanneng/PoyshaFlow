import React, { useEffect, useState } from 'react'
import { Eye, EyeOff, KeyRound, Loader2, Lock } from 'lucide-react'

export const args = {
  state: 'default',
  email: 'maya.lopez@hey.com',
}

export const argTypes = {
  state: { control: 'select', options: ['default', 'error', 'verifying', 'two-factor'] },
  email: { control: 'text' },
}

type Props = Partial<typeof args> & { onSubmit?: () => void }

export default function SignIn(props: Props) {
  const { state, email, onSubmit } = { ...args, ...props }
  const [show, setShow] = useState(false)
  const busy = state === 'verifying'

  useEffect(() => {
    document.title = 'Sign in · PoyshaFlow — Everyday expense tracker'
    let meta = document.querySelector('meta[name="description"]')
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('name', 'description')
      document.head.appendChild(meta)
    }
    meta.setAttribute('content', 'PoyshaFlow is a simple, private expense tracker. Log spending in seconds, set monthly budgets and see what’s left to spend each day.')
  }, [])

  return (
    <div className="flex h-screen w-full bg-canvas text-ink">
      <main className="flex min-w-0 flex-1 flex-col overflow-y-auto px-5 py-8 sm:px-10">
        <div className="flex items-center gap-2">
          <svg width="24" height="24" viewBox="0 0 22 22" aria-hidden>
            <rect width="22" height="22" rx="6" fill="var(--color-brand)" />
            <path d="M8 16V6h3.6a3 3 0 0 1 0 6H8" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-lg font-semibold tracking-tight">PoyshaFlow</span>
        </div>

        <div className="mx-auto my-auto w-full max-w-sm py-10">
          {state === 'two-factor' ? (
            <TwoFactor onSubmit={onSubmit} />
          ) : (
            <>
              <h1 className="text-[28px] font-semibold tracking-tight">Welcome back</h1>
              <p className="mt-2 text-[15px] text-muted">Sign in to see what’s left to spend this month.</p>

              <button
                type="button"
                onClick={onSubmit}
                className="mt-8 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-ink text-sm font-semibold text-white transition-colors duration-150 hover:bg-ink-2"
              >
                <KeyRound size={16} /> Sign in with a passkey
              </button>

              <div className="my-6 flex items-center gap-3 text-xs text-muted">
                <span className="h-px flex-1 bg-line" /> or use email <span className="h-px flex-1 bg-line" />
              </div>

              <form
                noValidate
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!busy) onSubmit?.()
                }}
                className="flex flex-col gap-4"
              >
                {state === 'error' && (
                  <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2.5 text-sm text-danger">
                    That email and password don’t match. After 5 tries we’ll pause sign-in for 15 minutes to keep your account safe.
                  </p>
                )}
                <div>
                  <label htmlFor="email" className="text-sm font-medium text-ink-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="username"
                    defaultValue={email}
                    maxLength={254}
                    required
                    className="mt-1.5 h-11 w-full rounded-lg border border-line bg-surface px-3 text-sm outline-none transition-colors duration-150 focus:border-brand"
                  />
                </div>
                <div>
                  <div className="flex items-baseline justify-between">
                    <label htmlFor="password" className="text-sm font-medium text-ink-2">
                      Password
                    </label>
                    <a href="#" className="text-sm font-medium text-brand hover:text-brand-hover">
                      Forgot?
                    </a>
                  </div>
                  <div className="relative mt-1.5">
                    <input
                      id="password"
                      type={show ? 'text' : 'password'}
                      autoComplete="current-password"
                      defaultValue="correct-horse-battery"
                      maxLength={128}
                      required
                      aria-invalid={state === 'error'}
                      className={`h-11 w-full rounded-lg border bg-surface pl-3 pr-11 text-sm outline-none transition-colors duration-150 focus:border-brand ${
                        state === 'error' ? 'border-danger' : 'border-line'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShow((s) => !s)}
                      aria-label={show ? 'Hide password' : 'Show password'}
                      className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-2 text-muted transition-colors duration-150 hover:text-ink"
                    >
                      {show ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={busy}
                  className="mt-2 flex h-11 items-center justify-center gap-2 rounded-lg bg-brand text-sm font-semibold text-white transition-colors duration-150 hover:bg-brand-hover disabled:opacity-80"
                >
                  {busy ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Signing in…
                    </>
                  ) : (
                    'Sign in'
                  )}
                </button>
              </form>

              <p className="mt-8 text-center text-sm text-muted">
                New to PoyshaFlow?{' '}
                <a href="#" className="font-medium text-brand hover:text-brand-hover">
                  Create a free account
                </a>
              </p>
            </>
          )}
        </div>

        <p className="mx-auto flex max-w-sm items-start gap-2 text-xs leading-relaxed text-muted">
          <Lock size={13} className="mt-0.5 shrink-0" />
          Your data is encrypted in transit and at rest. We never sell it, and you can export or delete it any time.
        </p>
      </main>

      <aside className="hidden w-[46%] max-w-[600px] flex-col justify-between bg-brand p-12 text-white lg:flex" aria-label="About PoyshaFlow">
        <p className="text-sm text-white/75">Everyday expense tracking</p>
        <div>
          <p className="text-sm text-white/75">Left to spend in June</p>
          <p className="num mt-2 text-6xl font-semibold tracking-tight">$523.51</p>
          <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-white/20">
            <div className="h-full w-[81%] rounded-full bg-white" />
          </div>
          <p className="mt-6 max-w-sm text-[22px] font-medium leading-snug">One number that tells you if you’re fine. Everything else is a tap away.</p>
        </div>
        <p className="text-sm text-white/75">Log an expense in under five seconds.</p>
      </aside>
    </div>
  )
}

function TwoFactor({ onSubmit }: { onSubmit?: () => void }) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit?.()
      }}
    >
      <h1 className="text-[28px] font-semibold tracking-tight">Check your authenticator</h1>
      <p className="mt-2 text-[15px] leading-relaxed text-muted">Enter the 6-digit code from your authenticator app to finish signing in.</p>
      <label htmlFor="otp" className="sr-only">
        6-digit code
      </label>
      <input
        id="otp"
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        defaultValue="482"
        className="num mt-8 h-14 w-full rounded-lg border border-line bg-surface text-center text-2xl font-semibold tracking-[0.5em] outline-none focus:border-brand"
      />
      <button type="submit" className="mt-4 h-11 w-full rounded-lg bg-brand text-sm font-semibold text-white transition-colors duration-150 hover:bg-brand-hover">
        Verify
      </button>
      <button type="button" className="mt-3 h-10 w-full text-sm font-medium text-brand hover:text-brand-hover">
        Use a backup code instead
      </button>
    </form>
  )
}
