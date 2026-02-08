import Flutterwave from "flutterwave-node-v3"
import crypto from "crypto"

const flw = new Flutterwave(
  process.env.FLUTTERWAVE_PUBLIC_KEY!,
  process.env.FLUTTERWAVE_SECRET_KEY!
)

export { flw }

export type PaymentProvider = "MTN" | "ORANGE" | "AIRTEL" | "MOOV"

// Mapping des providers vers les codes Flutterwave
const providerMapping: Record<PaymentProvider, string> = {
  MTN: "MTN",
  ORANGE: "ORANGE",
  AIRTEL: "AIRTEL",
  MOOV: "MOOV",
}

// Codes pays pour le Mobile Money
const countryMapping: Record<PaymentProvider, string> = {
  MTN: "CM", // Cameroun
  ORANGE: "CM",
  AIRTEL: "CM",
  MOOV: "CM",
}

export interface InitiatePaymentParams {
  amount: number
  currency?: string
  phoneNumber: string
  provider: PaymentProvider
  email: string
  txRef: string
  callbackUrl?: string
  meta?: Record<string, unknown>
}

export interface PaymentResponse {
  status: "success" | "error"
  message: string
  data?: {
    id?: number
    tx_ref?: string
    flw_ref?: string
    status?: string
    amount?: number
    currency?: string
    [key: string]: unknown
  }
}

/**
 * Initier un paiement Mobile Money via Flutterwave
 */
export async function initiateMobileMoneyPayment(
  params: InitiatePaymentParams
): Promise<PaymentResponse> {
  const {
    amount,
    currency = "XAF",
    phoneNumber,
    provider,
    email,
    txRef,
    meta = {},
  } = params

  try {
    const payload = {
      phone_number: phoneNumber,
      amount,
      currency,
      email,
      tx_ref: txRef,
      network: providerMapping[provider],
      country: countryMapping[provider],
      meta,
    }

    const response = await flw.MobileMoney.franco_phone(payload)

    return {
      status: response.status === "success" ? "success" : "error",
      message: response.message || "Paiement initié",
      data: response.data,
    }
  } catch (error) {
    console.error("Flutterwave payment error:", error)
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Erreur de paiement",
    }
  }
}

/**
 * Vérifier le statut d'une transaction
 */
export async function verifyTransaction(transactionId: number) {
  try {
    const response = await flw.Transaction.verify({ id: transactionId })
    return response
  } catch (error) {
    console.error("Transaction verification error:", error)
    throw error
  }
}

/**
 * Initier un transfert Mobile Money (pour les retraits)
 */
export async function initiateTransfer(params: {
  amount: number
  currency?: string
  phoneNumber: string
  provider: PaymentProvider
  reference: string
  narration?: string
}) {
  const {
    amount,
    currency = "XAF",
    phoneNumber,
    provider,
    reference,
    narration = "Retrait CloseUp",
  } = params

  try {
    const payload = {
      account_bank: providerMapping[provider],
      account_number: phoneNumber,
      amount,
      currency,
      reference,
      narration,
      debit_currency: currency,
    }

    const response = await flw.Transfer.initiate(payload)

    return {
      status: response.status === "success" ? "success" : "error",
      message: response.message,
      data: response.data,
    }
  } catch (error) {
    console.error("Transfer error:", error)
    return {
      status: "error",
      message: error instanceof Error ? error.message : "Erreur de transfert",
    }
  }
}

/**
 * Valider le webhook Flutterwave
 */
export function validateWebhookSignature(
  payload: string,
  signature: string
): boolean {
  const secretHash = process.env.FLUTTERWAVE_WEBHOOK_SECRET!
  const hash = crypto
    .createHmac("sha256", secretHash)
    .update(payload)
    .digest("hex")

  return hash === signature
}

/**
 * Générer une référence de transaction unique
 */
export function generateTxRef(prefix: string = "CLU"): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 10)
  return `${prefix}-${timestamp}-${random}`
}
