declare module "flutterwave-node-v3" {
  interface MobileMoneyPayload {
    tx_ref: string
    amount: number
    currency: string
    email: string
    phone_number: string
    network: string
    country: string
  }

  interface TransferPayload {
    account_bank: string
    account_number: string
    amount: number
    narration: string
    currency: string
    reference: string
    debit_currency: string
  }

  interface FlutterwaveResponse {
    status: string
    message: string
    data?: {
      id?: number
      tx_ref?: string
      flw_ref?: string
      link?: string
      status?: string
      [key: string]: unknown
    }
  }

  class Flutterwave {
    constructor(publicKey: string, secretKey: string)
    MobileMoney: {
      mpesa(payload: MobileMoneyPayload): Promise<FlutterwaveResponse>
      franco_mobile(payload: MobileMoneyPayload): Promise<FlutterwaveResponse>
      franco_phone(payload: MobileMoneyPayload): Promise<FlutterwaveResponse>
    }
    Transfer: {
      initiate(payload: TransferPayload): Promise<FlutterwaveResponse>
    }
    Transaction: {
      verify(payload: { id: number }): Promise<FlutterwaveResponse>
    }
  }

  export default Flutterwave
}
