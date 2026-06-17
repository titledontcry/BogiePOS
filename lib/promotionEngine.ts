// lib/promotionEngine.ts

export type PromotionType = 'FIXED_DISCOUNT' | 'PERCENT_DISCOUNT' | 'BUNDLE'

export interface Promotion {
  id: number
  name: string
  type: PromotionType
  value?: number
  quantityRequired?: number
  specialPrice?: number
}

export interface CartItem {
  price: number
  quantity: number
}

export interface PromotionResult {
  discount: number
  label: string
  appliedPromotion: Promotion | null
}

export function calculateBestPromotion(
  items: CartItem[],
  promotions: Promotion[]
): PromotionResult {
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const totalQty = items.reduce((s, i) => s + i.quantity, 0)

  let bestDiscount = 0
  let bestLabel = ''
  let bestPromotion: Promotion | null = null

  for (const promo of promotions) {
    let discount = 0

    if (promo.type === 'FIXED_DISCOUNT') {
      discount = promo.value ?? 0

    } else if (promo.type === 'PERCENT_DISCOUNT') {
      discount = Math.round(subtotal * ((promo.value ?? 0) / 100))

    } else if (promo.type === 'BUNDLE') {
      const qty = promo.quantityRequired ?? 0
      const specialPrice = promo.specialPrice ?? 0
      if (qty > 0 && totalQty >= qty) {
        const sets = Math.floor(totalQty / qty)
        const remainQty = totalQty - sets * qty
        const avgPrice = subtotal / totalQty
        const priceWithBundle = sets * specialPrice + remainQty * avgPrice
        discount = Math.max(0, Math.round(subtotal - priceWithBundle))
      }
    }

    if (discount > bestDiscount) {
      bestDiscount = discount
      bestPromotion = promo
      bestLabel = promo.name
    }
  }

  return { discount: bestDiscount, label: bestLabel, appliedPromotion: bestPromotion }
}
