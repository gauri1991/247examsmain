// Payment Gateway Integration Utilities
// This provides a foundation for integrating with popular Indian payment gateways

interface PaymentConfig {
  gateway: 'razorpay' | 'stripe' | 'payu' | 'ccavenue';
  publicKey: string;
  environment: 'test' | 'production';
}

interface PaymentRequest {
  amount: number;
  currency: string;
  orderId: string;
  description: string;
  customerInfo: {
    name: string;
    email: string;
    phone?: string;
  };
  notes?: Record<string, any>;
}

interface PaymentResponse {
  success: boolean;
  paymentId?: string;
  orderId?: string;
  signature?: string;
  error?: string;
  rawResponse?: any;
}

// Mock payment gateway for demo purposes
export class MockPaymentGateway {
  private config: PaymentConfig;

  constructor(config: PaymentConfig) {
    this.config = config;
  }

  async initializePayment(request: PaymentRequest): Promise<PaymentResponse> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Mock payment processing with 90% success rate
    const isSuccess = Math.random() > 0.1;

    if (isSuccess) {
      return {
        success: true,
        paymentId: `pay_${Date.now()}`,
        orderId: request.orderId,
        signature: `sig_${Date.now()}`,
        rawResponse: {
          id: `pay_${Date.now()}`,
          status: 'captured',
          amount: request.amount,
          currency: request.currency
        }
      };
    } else {
      return {
        success: false,
        error: 'Payment failed due to insufficient funds',
        rawResponse: {
          error: {
            code: 'PAYMENT_FAILED',
            description: 'Your payment could not be processed'
          }
        }
      };
    }
  }

  async verifyPayment(paymentId: string, orderId: string, signature: string): Promise<boolean> {
    // Mock verification - in real implementation, this would verify against gateway
    await new Promise(resolve => setTimeout(resolve, 500));
    return true; // Always return true for demo
  }

  async refundPayment(paymentId: string, amount?: number): Promise<PaymentResponse> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      success: true,
      paymentId: `rfnd_${Date.now()}`,
      rawResponse: {
        id: `rfnd_${Date.now()}`,
        status: 'processed',
        amount: amount || 0
      }
    };
  }
}

// Razorpay Integration Template
export class RazorpayGateway {
  private config: PaymentConfig;

  constructor(config: PaymentConfig) {
    this.config = config;
  }

  async initializePayment(request: PaymentRequest): Promise<PaymentResponse> {
    // This would integrate with Razorpay's actual API
    try {
      // Load Razorpay script if not already loaded
      if (typeof (window as any).Razorpay === 'undefined') {
        await this.loadRazorpayScript();
      }

      return new Promise((resolve) => {
        const options = {
          key: this.config.publicKey,
          amount: request.amount * 100, // Razorpay expects amount in paise
          currency: request.currency,
          name: '247Exams',
          description: request.description,
          order_id: request.orderId,
          prefill: {
            name: request.customerInfo.name,
            email: request.customerInfo.email,
            contact: request.customerInfo.phone
          },
          notes: request.notes,
          theme: {
            color: '#3b82f6'
          },
          handler: (response: any) => {
            resolve({
              success: true,
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
              rawResponse: response
            });
          },
          modal: {
            ondismiss: () => {
              resolve({
                success: false,
                error: 'Payment cancelled by user'
              });
            }
          }
        };

        const rzp = new (window as any).Razorpay(options);
        rzp.open();
      });
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment initialization failed'
      };
    }
  }

  private loadRazorpayScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Razorpay script'));
      document.head.appendChild(script);
    });
  }

  async verifyPayment(paymentId: string, orderId: string, signature: string): Promise<boolean> {
    // This would make a server-side API call to verify the payment
    // For security reasons, payment verification should always be done on the server
    const response = await fetch('/api/payments/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ paymentId, orderId, signature })
    });
    
    const result = await response.json();
    return result.verified === true;
  }
}

// UPI Payment Helper
export class UPIPaymentHelper {
  static generateUPILink(params: {
    payeeVPA: string;
    payeeName: string;
    amount: number;
    transactionNote: string;
    transactionRef: string;
  }): string {
    const { payeeVPA, payeeName, amount, transactionNote, transactionRef } = params;
    
    const upiParams = new URLSearchParams({
      pa: payeeVPA,
      pn: payeeName,
      am: amount.toString(),
      tn: transactionNote,
      tr: transactionRef,
      cu: 'INR'
    });

    return `upi://pay?${upiParams.toString()}`;
  }

  static openUPIApp(upiLink: string): void {
    if (typeof window !== 'undefined') {
      window.location.href = upiLink;
    }
  }
}

// Payment Gateway Factory
export class PaymentGatewayFactory {
  static create(config: PaymentConfig) {
    switch (config.gateway) {
      case 'razorpay':
        return new RazorpayGateway(config);
      case 'stripe':
        // TODO: Implement Stripe integration
        throw new Error('Stripe integration not implemented yet');
      case 'payu':
        // TODO: Implement PayU integration
        throw new Error('PayU integration not implemented yet');
      case 'ccavenue':
        // TODO: Implement CCAvenue integration
        throw new Error('CCAvenue integration not implemented yet');
      default:
        return new MockPaymentGateway(config);
    }
  }
}

// Payment utility functions
export const paymentUtils = {
  formatAmount: (amount: number, currency = 'INR') => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: 0
    }).format(amount);
  },

  validateCardNumber: (cardNumber: string): boolean => {
    // Basic Luhn algorithm implementation
    const digits = cardNumber.replace(/\D/g, '');
    let sum = 0;
    let isEven = false;

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i]);

      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  },

  validateExpiry: (expiry: string): boolean => {
    const [month, year] = expiry.split('/');
    if (!month || !year) return false;

    const now = new Date();
    const expiryDate = new Date(parseInt(`20${year}`), parseInt(month) - 1);
    
    return expiryDate > now;
  },

  validateCVV: (cvv: string): boolean => {
    return /^\d{3,4}$/.test(cvv);
  },

  validateUPI: (upiId: string): boolean => {
    return /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(upiId);
  },

  generateOrderId: (): string => {
    return `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
};

// Export default configuration for Indian market
export const defaultPaymentConfig: PaymentConfig = {
  gateway: 'razorpay', // Most popular in India
  publicKey: process.env.NEXT_PUBLIC_RAZORPAY_KEY || 'rzp_test_dummy_key',
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'test'
};