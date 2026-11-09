import React from 'react'
import {
  ShoppingBasket,
  UtensilsCrossed,
  TramFront,
  House,
  ReceiptText,
  HeartPulse,
  Ticket,
  ShoppingBag,
} from 'lucide-react'

import { categoryById, type CategoryId } from '../data'

const ICONS = {
  groceries: ShoppingBasket,
  food: UtensilsCrossed,
  transport: TramFront,
  home: House,
  bills: ReceiptText,
  health: HeartPulse,
  fun: Ticket,
  shopping: ShoppingBag,
} as const

/** Category glyph on a tinted square — colour + shape, so it never relies on colour alone. */
export function CategoryIcon({ id, size = 'md' }: { id: CategoryId; size?: 'sm' | 'md' | 'lg' }) {
  const cat = categoryById(id)
  const Icon = ICONS[id]
  const box = size === 'sm' ? 'h-7 w-7 rounded-md' : size === 'lg' ? 'h-11 w-11 rounded-xl' : 'h-9 w-9 rounded-lg'
  const icon = size === 'sm' ? 14 : size === 'lg' ? 20 : 17
  return (
    <span
      aria-hidden
      className={`inline-flex shrink-0 items-center justify-center ${box}`}
      style={{ color: cat.color, backgroundColor: `color-mix(in srgb, ${cat.color} 12%, white)` }}
    >
      <Icon size={icon} strokeWidth={2} />
    </span>
  )
}
