// lib/promotionEngine.ts

export type PromotionType = 'FIXED_DISCOUNT' | 'PERCENT_DISCOUNT' | 'BUNDLE'

export interface Promotion {
  id: number
  name: string
  type: PromotionType
  value?: number
  quantityRequired?: number
  specialPrice?: number
  applicableCategories?: string[]
}

export interface CartItem {
  price: number
  quantity: number
  category?: string
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
  let bestDiscount = 0
  let bestLabel = ''
  let bestPromotion: Promotion | null = null

  for (const promo of promotions) {
    // Filter items belonging to applicable categories
    const eligibleItems = promo.applicableCategories && promo.applicableCategories.length > 0
      ? items.filter(item => promo.applicableCategories?.includes(item.category || ""))
      : items

    const eligibleSubtotal = eligibleItems.reduce((s, i) => s + i.price * i.quantity, 0)
    const eligibleTotalQty = eligibleItems.reduce((s, i) => s + i.quantity, 0)

    let discount = 0

    if (promo.type === 'FIXED_DISCOUNT') {
      if (eligibleSubtotal > 0) {
        discount = Math.min(promo.value ?? 0, eligibleSubtotal)
      }

    } else if (promo.type === 'PERCENT_DISCOUNT') {
      discount = Math.round(eligibleSubtotal * ((promo.value ?? 0) / 100))

    } else if (promo.type === 'BUNDLE') {
      const qty = promo.quantityRequired ?? 0
      const specialPrice = promo.specialPrice ?? 0
      if (qty > 0 && eligibleTotalQty >= qty) {
        const sets = Math.floor(eligibleTotalQty / qty)
        const remainQty = eligibleTotalQty - sets * qty
        const avgPrice = eligibleSubtotal / eligibleTotalQty
        const priceWithBundle = sets * specialPrice + remainQty * avgPrice
        discount = Math.max(0, Math.round(eligibleSubtotal - priceWithBundle))
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
