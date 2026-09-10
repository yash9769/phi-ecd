import { PaymentMethod, PaymentStatus, Payment } from '@/lib/types';
import { db } from '@/lib/db';
import { cryptoNative } from '@/lib/cryptoNative';

export interface PaymentInitiationResult {
  paymentId: string;
  transactionRef: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paymentMethod: PaymentMethod;
  instructions?: string;
  mockGatewayUrl?: string;
}

export interface PaymentVerificationResult {
  success: boolean;
  status: PaymentStatus;
  transactionRef: string;
  payment?: Payment;
}

export interface IPaymentService {
  initiatePayment(
    amount: number,
    paymentMethod: PaymentMethod,
    employeeId: string,
    sessionId?: string
  ): Promise<PaymentInitiationResult>;

  verifyPayment(transactionRef: string): Promise<PaymentVerificationResult>;
}

export class MockPaymentService implements IPaymentService {
  async initiatePayment(
    amount: number,
    paymentMethod: PaymentMethod,
    employeeId: string,
    sessionId?: string
  ): Promise<PaymentInitiationResult> {
    const randomCode = Math.floor(100000 + Math.random() * 900000);
    const transactionRef = `TXN-${randomCode}-FOH`;

    // Create payment record in DB with pending status initially
    const newPayment = await db.createPayment({
      employee_id: employeeId,
      session_id: sessionId,
      amount,
      currency: 'INR',
      payment_method: paymentMethod,
      status: 'pending',
      transaction_ref: transactionRef,
    });

    let instructions = '';
    if (paymentMethod === 'upi') {
      instructions = 'Scan the QR code or click Proceed to complete payment in your UPI App.';
    } else if (paymentMethod === 'netbanking') {
      instructions = 'Select your bank and click Complete to authorize transaction.';
    } else if (paymentMethod === 'card') {
      instructions = 'Simulated secure card verification.';
    } else if (paymentMethod === 'payroll_deduction') {
      instructions = 'Contribution will be deducted from your next monthly salary payout.';
    }

    return {
      paymentId: newPayment.id,
      transactionRef,
      amount,
      currency: 'INR',
      status: 'pending',
      paymentMethod,
      instructions,
      mockGatewayUrl: `/payment-mock?ref=${transactionRef}`,
    };
  }

  async verifyPayment(transactionRef: string): Promise<PaymentVerificationResult> {
    const existing = await db.getPaymentByRef(transactionRef);
    if (!existing) {
      return {
        success: false,
        status: 'failed',
        transactionRef,
      };
    }

    // Auto-approve mock payment
    const updated = await db.updatePaymentStatus(existing.id, 'successful');

    // Record payment success telemetry event if session exists
    if (existing.session_id) {
      await db.addTelemetryEvent({
        session_id: existing.session_id,
        event_type: 'payment_success',
        page: '/payment',
        timestamp: new Date().toISOString(),
        metadata: {
          transactionRef,
          amount: existing.amount,
          method: existing.payment_method,
        },
      });
    }

    return {
      success: true,
      status: 'successful',
      transactionRef,
      payment: updated || undefined,
    };
  }
}

// Global default payment service instance
export const paymentService: IPaymentService = new MockPaymentService();
