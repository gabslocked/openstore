/**
 * GreenPag Payment Gateway Integration
 * Handles PIX payments via GreenPag API
 */

const GREENPAG_API_URL = process.env.GREENPAG_API_URL || 'https://api.greenpag.com.br/v1'
const GREENPAG_PUBLIC_KEY = process.env.GREENPAG_PUBLIC_KEY || ''
const GREENPAG_SECRET_KEY = process.env.GREENPAG_SECRET_KEY || ''

interface PaymentRequest {
  amount: number
  description: string
  customer: {
    name: string
    document: string
    email?: string
  }
  external_id: string
  callback_url: string
  utm?: {
    source?: string
    medium?: string
    campaign?: string
  }
}

interface PaymentResponse {
  transaction_id: string
  qr_code: string
  qr_code_base64: string
  amount: number
  expires_at: string
  status: string
}

interface WebhookData {
  event: string
  transaction_id: string
  status: string
  amount: number
  paid_at?: string
  external_id?: string
}

/**
 * Create a PIX payment via GreenPag
 */
export async function createPayment(data: PaymentRequest): Promise<PaymentResponse> {
  if (!GREENPAG_PUBLIC_KEY || !GREENPAG_SECRET_KEY) {
    throw new Error('GreenPag API keys not configured')
  }

  const response = await fetch(`${GREENPAG_API_URL}/pix/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GREENPAG_SECRET_KEY}`,
      'X-Public-Key': GREENPAG_PUBLIC_KEY,
    },
    body: JSON.stringify({
      amount: Math.round(data.amount * 100), // Convert to cents
      description: data.description,
      customer: data.customer,
      external_id: data.external_id,
      callback_url: data.callback_url,
      utm: data.utm,
    }),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Unknown error' }))
    throw new Error(error.message || `GreenPag API error: ${response.status}`)
  }

  const result = await response.json()
  
  return {
    transaction_id: result.transaction_id || result.id,
    qr_code: result.qr_code || result.pix_code,
    qr_code_base64: result.qr_code_base64 || result.qr_code_image,
    amount: data.amount,
    expires_at: result.expires_at || new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    status: result.status || 'pending',
  }
}

/**
 * Validate CPF/CNPJ document
 */
export function isValidDocument(document: string): boolean {
  const cleaned = document.replace(/\D/g, '')
  
  if (cleaned.length === 11) {
    return isValidCPF(cleaned)
  } else if (cleaned.length === 14) {
    return isValidCNPJ(cleaned)
  }
  
  return false
}

function isValidCPF(cpf: string): boolean {
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false
  
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf[i]) * (10 - i)
  }
  let digit = (sum * 10) % 11
  if (digit === 10) digit = 0
  if (digit !== parseInt(cpf[9])) return false
  
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf[i]) * (11 - i)
  }
  digit = (sum * 10) % 11
  if (digit === 10) digit = 0
  if (digit !== parseInt(cpf[10])) return false
  
  return true
}

function isValidCNPJ(cnpj: string): boolean {
  if (cnpj.length !== 14 || /^(\d)\1+$/.test(cnpj)) return false
  
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  
  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnpj[i]) * weights1[i]
  }
  let digit = sum % 11
  digit = digit < 2 ? 0 : 11 - digit
  if (digit !== parseInt(cnpj[12])) return false
  
  sum = 0
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cnpj[i]) * weights2[i]
  }
  digit = sum % 11
  digit = digit < 2 ? 0 : 11 - digit
  if (digit !== parseInt(cnpj[13])) return false
  
  return true
}

/**
 * Format document (CPF/CNPJ) - remove non-digits
 */
export function formatDocument(document: string): string {
  return document.replace(/\D/g, '')
}

/**
 * Validate webhook signature from GreenPag
 */
export function validateWebhookSignature(payload: string, signature: string): boolean {
  if (!GREENPAG_SECRET_KEY) {
    console.warn('GreenPag secret key not configured, skipping signature validation')
    return true
  }
  
  // In production, implement proper HMAC validation
  // For now, we'll do a basic check
  try {
    const crypto = require('crypto')
    const expectedSignature = crypto
      .createHmac('sha256', GREENPAG_SECRET_KEY)
      .update(payload)
      .digest('hex')
    
    return signature === expectedSignature || signature === `sha256=${expectedSignature}`
  } catch (error) {
    console.error('Error validating webhook signature:', error)
    return false
  }
}

/**
 * Parse webhook payload from GreenPag
 */
export function parseWebhook(payload: string): WebhookData {
  try {
    const data = JSON.parse(payload)
    
    return {
      event: data.event || data.type || 'unknown',
      transaction_id: data.transaction_id || data.id || data.data?.id,
      status: data.status || data.data?.status || 'unknown',
      amount: (data.amount || data.data?.amount || 0) / 100, // Convert from cents
      paid_at: data.paid_at || data.data?.paid_at,
      external_id: data.external_id || data.data?.external_id,
    }
  } catch (error) {
    console.error('Error parsing webhook payload:', error)
    throw new Error('Invalid webhook payload')
  }
}
