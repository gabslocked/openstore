/**
 * In-memory payment status store
 * Used to track payment status between webhook callbacks and status checks
 * 
 * Note: In production, this should be replaced with Redis or database storage
 */

interface PaymentStatus {
  transaction_id: string
  status: 'pending' | 'paid' | 'failed' | 'expired'
  amount: number
  paid_at?: string
  external_id?: string
  created_at: string
  updated_at: string
}

// In-memory store for payment statuses
const paymentStore = new Map<string, PaymentStatus>()

// Cleanup old entries every 30 minutes
const CLEANUP_INTERVAL = 30 * 60 * 1000 // 30 minutes
const MAX_AGE = 24 * 60 * 60 * 1000 // 24 hours

if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, value] of paymentStore.entries()) {
      const createdAt = new Date(value.created_at).getTime()
      if (now - createdAt > MAX_AGE) {
        paymentStore.delete(key)
      }
    }
  }, CLEANUP_INTERVAL)
}

/**
 * Save or update payment status
 */
export function savePaymentStatus(data: {
  transaction_id: string
  status: 'pending' | 'paid' | 'failed' | 'expired'
  amount: number
  paid_at?: string
  external_id?: string
}): void {
  const existing = paymentStore.get(data.transaction_id)
  const now = new Date().toISOString()
  
  paymentStore.set(data.transaction_id, {
    transaction_id: data.transaction_id,
    status: data.status,
    amount: data.amount,
    paid_at: data.paid_at,
    external_id: data.external_id || existing?.external_id,
    created_at: existing?.created_at || now,
    updated_at: now,
  })
  
  console.log(`Payment status saved: ${data.transaction_id} -> ${data.status}`)
}

/**
 * Get payment status by transaction ID
 */
export function getPaymentStatus(transactionId: string): PaymentStatus | null {
  return paymentStore.get(transactionId) || null
}

/**
 * Get payment status by external ID
 */
export function getPaymentStatusByExternalId(externalId: string): PaymentStatus | null {
  for (const status of paymentStore.values()) {
    if (status.external_id === externalId) {
      return status
    }
  }
  return null
}

/**
 * Delete payment status
 */
export function deletePaymentStatus(transactionId: string): boolean {
  return paymentStore.delete(transactionId)
}

/**
 * Get all payment statuses (for debugging)
 */
export function getAllPaymentStatuses(): PaymentStatus[] {
  return Array.from(paymentStore.values())
}
