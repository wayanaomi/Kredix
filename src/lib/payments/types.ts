export interface InitiatePaymentInput {
  orderId: string;
  reference: string;
  amountMinor: number;
  customerEmail?: string;
}

export interface InitiatePaymentResult {
  providerReference: string;
  redirectUrl: string;
}

export interface VerifyPaymentResult {
  providerReference: string;
  status: "SUCCESS" | "FAILED" | "PENDING";
  amountMinor: number;
}

export interface PaymentProvider {
  readonly name: string;
  readonly configured: boolean;
  initiate(input: InitiatePaymentInput): Promise<InitiatePaymentResult>;
  verify(providerReference: string): Promise<VerifyPaymentResult>;
}
