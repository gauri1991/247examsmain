import { useState, useCallback } from 'react';
import { apiRequest } from '@/lib/api';
import { showErrorToast, showSuccessToast } from '@/lib/error-handler';
import { PaymentGatewayFactory, defaultPaymentConfig, paymentUtils } from '@/lib/payment-gateway';

// Payment and subscription types
export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  interval: 'monthly' | 'yearly';
  features: string[];
  popular?: boolean;
  recommended?: boolean;
  maxTests: number;
  maxAnalytics: boolean;
  prioritySupport: boolean;
  studyMaterials: boolean;
  mockTests: number;
  videoLectures: boolean;
  personalizedReports: boolean;
  compareWithPeers: boolean;
}

export interface UserSubscription {
  id: string;
  planId: string;
  status: 'active' | 'canceled' | 'expired' | 'pending';
  currentPeriodStart: string;
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
  plan: SubscriptionPlan;
  usage: {
    testsUsed: number;
    analyticsUsed: number;
    lastUsed: string;
  };
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'upi' | 'netbanking' | 'wallet';
  last4?: string;
  brand?: string;
  expiryMonth?: number;
  expiryYear?: number;
  isDefault: boolean;
  upiId?: string;
  walletProvider?: string;
}

export interface PaymentHistory {
  id: string;
  amount: number;
  currency: string;
  status: 'succeeded' | 'failed' | 'pending' | 'refunded';
  description: string;
  createdAt: string;
  paymentMethod: PaymentMethod;
  invoice?: string;
}

interface UsePaymentOptions {
  userId?: string;
  refreshInterval?: number;
}

export function usePayment(options: UsePaymentOptions = {}) {
  const { userId, refreshInterval = 0 } = options;

  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Mock subscription plans
  const mockPlans: SubscriptionPlan[] = [
    {
      id: 'free',
      name: 'Free',
      description: 'Perfect for getting started with exam preparation',
      price: 0,
      currency: 'INR',
      interval: 'monthly',
      features: [
        '5 practice tests per month',
        'Basic performance analytics',
        'Community support',
        'Standard question bank access'
      ],
      maxTests: 5,
      maxAnalytics: false,
      prioritySupport: false,
      studyMaterials: false,
      mockTests: 2,
      videoLectures: false,
      personalizedReports: false,
      compareWithPeers: false
    },
    {
      id: 'basic_monthly',
      name: 'Basic',
      description: 'Essential features for serious exam preparation',
      price: 299,
      currency: 'INR',
      interval: 'monthly',
      features: [
        '25 practice tests per month',
        'Enhanced analytics dashboard',
        'Email support',
        'Premium question bank',
        'Basic study materials',
        '10 full-length mock tests'
      ],
      maxTests: 25,
      maxAnalytics: true,
      prioritySupport: false,
      studyMaterials: true,
      mockTests: 10,
      videoLectures: false,
      personalizedReports: true,
      compareWithPeers: true
    },
    {
      id: 'pro_monthly',
      name: 'Pro',
      description: 'Complete preparation package with advanced features',
      price: 599,
      currency: 'INR',
      interval: 'monthly',
      popular: true,
      features: [
        'Unlimited practice tests',
        'Advanced analytics & insights',
        'Priority support',
        'Complete study materials',
        'Unlimited mock tests',
        'Video lectures library',
        'Personalized study plans',
        'Peer comparison tools'
      ],
      maxTests: -1, // Unlimited
      maxAnalytics: true,
      prioritySupport: true,
      studyMaterials: true,
      mockTests: -1, // Unlimited
      videoLectures: true,
      personalizedReports: true,
      compareWithPeers: true
    },
    {
      id: 'pro_yearly',
      name: 'Pro Annual',
      description: 'Best value - Pro features with annual billing',
      price: 4999,
      currency: 'INR',
      interval: 'yearly',
      recommended: true,
      features: [
        'Everything in Pro plan',
        '2 months free (Annual billing)',
        'Exclusive webinars',
        'One-on-one mentoring session',
        'Early access to new features',
        'Downloadable study materials'
      ],
      maxTests: -1,
      maxAnalytics: true,
      prioritySupport: true,
      studyMaterials: true,
      mockTests: -1,
      videoLectures: true,
      personalizedReports: true,
      compareWithPeers: true
    }
  ];

  // Mock payment methods
  const mockPaymentMethods: PaymentMethod[] = [
    {
      id: 'card_1',
      type: 'card',
      last4: '4242',
      brand: 'Visa',
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true
    },
    {
      id: 'upi_1',
      type: 'upi',
      upiId: 'user@paytm',
      isDefault: false
    }
  ];

  // Mock payment history
  const mockPaymentHistory: PaymentHistory[] = [
    {
      id: 'payment_1',
      amount: 599,
      currency: 'INR',
      status: 'succeeded',
      description: 'Pro Monthly Subscription',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      paymentMethod: mockPaymentMethods[0]
    },
    {
      id: 'payment_2',
      amount: 599,
      currency: 'INR',
      status: 'succeeded',
      description: 'Pro Monthly Subscription',
      createdAt: new Date(Date.now() - 35 * 24 * 60 * 60 * 1000).toISOString(),
      paymentMethod: mockPaymentMethods[1]
    }
  ];

  // Fetch subscription data
  const fetchSubscription = useCallback(async () => {
    if (!userId) return;

    setLoading(true);
    try {
      // In production: const response = await apiRequest(`/payments/subscription/${userId}/`);
      
      // Mock current subscription
      const mockSubscription: UserSubscription = {
        id: 'sub_1',
        planId: 'pro_monthly',
        status: 'active',
        currentPeriodStart: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        currentPeriodEnd: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString(),
        cancelAtPeriodEnd: false,
        plan: mockPlans.find(p => p.id === 'pro_monthly')!,
        usage: {
          testsUsed: 18,
          analyticsUsed: 45,
          lastUsed: new Date().toISOString()
        }
      };

      setSubscription(mockSubscription);
      setPlans(mockPlans);
      setPaymentMethods(mockPaymentMethods);
      setPaymentHistory(mockPaymentHistory);
      setError(null);
    } catch (err: any) {
      console.error('Failed to fetch subscription:', err);
      setError(err);
      showErrorToast(err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // Add payment method (moved here to fix circular dependency)
  const addPaymentMethod = useCallback(async (paymentMethodData: Partial<PaymentMethod>) => {
    setLoading(true);
    try {
      const newPaymentMethod: PaymentMethod = {
        id: `pm_${Date.now()}`,
        isDefault: paymentMethods.length === 0,
        ...paymentMethodData
      } as PaymentMethod;

      setPaymentMethods(prev => [...prev, newPaymentMethod]);
      showSuccessToast('Payment method added successfully!');
      return newPaymentMethod;
    } catch (err: any) {
      console.error('Failed to add payment method:', err);
      showErrorToast(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [paymentMethods]);

  // Create subscription with payment gateway integration
  const createSubscription = useCallback(async (planId: string, paymentMethodId?: string, newPaymentMethod?: any) => {
    setLoading(true);
    try {
      const plan = mockPlans.find(p => p.id === planId);
      if (!plan) throw new Error('Plan not found');

      let paymentResponse;

      // Process payment if it's a paid plan
      if (plan.price > 0) {
        const gateway = PaymentGatewayFactory.create(defaultPaymentConfig);
        
        const paymentRequest = {
          amount: plan.price,
          currency: plan.currency,
          orderId: paymentUtils.generateOrderId(),
          description: `${plan.name} Plan Subscription`,
          customerInfo: {
            name: 'User', // In production, get from user context
            email: 'user@example.com', // In production, get from user context
            phone: '+919876543210' // In production, get from user context
          },
          notes: {
            planId,
            subscriptionType: plan.interval
          }
        };

        paymentResponse = await gateway.initializePayment(paymentRequest);
        
        if (!paymentResponse.success) {
          throw new Error(paymentResponse.error || 'Payment failed');
        }

        // Verify payment if needed
        if (paymentResponse.paymentId && paymentResponse.orderId && paymentResponse.signature) {
          const isVerified = await gateway.verifyPayment(
            paymentResponse.paymentId,
            paymentResponse.orderId,
            paymentResponse.signature
          );
          
          if (!isVerified) {
            throw new Error('Payment verification failed');
          }
        }
      }

      // Create subscription after successful payment
      const newSubscription: UserSubscription = {
        id: `sub_${Date.now()}`,
        planId,
        status: 'active',
        currentPeriodStart: new Date().toISOString(),
        currentPeriodEnd: new Date(Date.now() + (plan.interval === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toISOString(),
        cancelAtPeriodEnd: false,
        plan,
        usage: {
          testsUsed: 0,
          analyticsUsed: 0,
          lastUsed: new Date().toISOString()
        }
      };

      // Save new payment method if provided
      if (newPaymentMethod && newPaymentMethod.saveCard) {
        await addPaymentMethod({
          type: newPaymentMethod.type,
          ...(newPaymentMethod.type === 'card' ? {
            last4: newPaymentMethod.number.slice(-4),
            brand: 'Visa', // In production, detect from card number
            expiryMonth: parseInt(newPaymentMethod.expiry.split('/')[0]),
            expiryYear: parseInt(`20${newPaymentMethod.expiry.split('/')[1]}`),
          } : {}),
          ...(newPaymentMethod.type === 'upi' ? {
            upiId: newPaymentMethod.upiId
          } : {})
        });
      }

      setSubscription(newSubscription);
      showSuccessToast('Subscription activated successfully!');
      return newSubscription;
    } catch (err: any) {
      console.error('Failed to create subscription:', err);
      showErrorToast(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [addPaymentMethod]); // Now addPaymentMethod is defined before this function

  // Cancel subscription
  const cancelSubscription = useCallback(async (immediate = false) => {
    if (!subscription) return;

    setLoading(true);
    try {
      // In production:
      // await apiRequest(`/payments/subscriptions/${subscription.id}/cancel/`, {
      //   method: 'POST',
      //   body: JSON.stringify({ immediate })
      // });

      const updatedSubscription = {
        ...subscription,
        cancelAtPeriodEnd: !immediate,
        status: immediate ? 'canceled' as const : subscription.status
      };

      setSubscription(updatedSubscription);
      showSuccessToast(immediate ? 'Subscription canceled' : 'Subscription will cancel at period end');
    } catch (err: any) {
      console.error('Failed to cancel subscription:', err);
      showErrorToast(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [subscription]);

  // Reactivate subscription
  const reactivateSubscription = useCallback(async () => {
    if (!subscription) return;

    setLoading(true);
    try {
      const updatedSubscription = {
        ...subscription,
        cancelAtPeriodEnd: false
      };

      setSubscription(updatedSubscription);
      showSuccessToast('Subscription reactivated successfully!');
    } catch (err: any) {
      console.error('Failed to reactivate subscription:', err);
      showErrorToast(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [subscription]);

  // Remove payment method
  const removePaymentMethod = useCallback(async (paymentMethodId: string) => {
    setLoading(true);
    try {
      setPaymentMethods(prev => prev.filter(pm => pm.id !== paymentMethodId));
      showSuccessToast('Payment method removed successfully!');
    } catch (err: any) {
      console.error('Failed to remove payment method:', err);
      showErrorToast(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Set default payment method
  const setDefaultPaymentMethod = useCallback(async (paymentMethodId: string) => {
    setLoading(true);
    try {
      setPaymentMethods(prev => prev.map(pm => ({
        ...pm,
        isDefault: pm.id === paymentMethodId
      })));
      showSuccessToast('Default payment method updated!');
    } catch (err: any) {
      console.error('Failed to update default payment method:', err);
      showErrorToast(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Get plan by ID
  const getPlan = useCallback((planId: string) => {
    return plans.find(plan => plan.id === planId);
  }, [plans]);

  // Check if user has access to feature
  const hasFeatureAccess = useCallback((feature: keyof SubscriptionPlan) => {
    if (!subscription || subscription.status !== 'active') {
      return false; // No access without active subscription
    }
    return Boolean(subscription.plan[feature]);
  }, [subscription]);

  // Get usage percentage
  const getUsagePercentage = useCallback((type: 'tests' | 'analytics') => {
    if (!subscription) return 0;
    
    const maxValue = type === 'tests' ? subscription.plan.maxTests : 100;
    const usedValue = type === 'tests' ? subscription.usage.testsUsed : subscription.usage.analyticsUsed;
    
    if (maxValue === -1) return 0; // Unlimited
    return Math.min((usedValue / maxValue) * 100, 100);
  }, [subscription]);

  // Check if near usage limit
  const isNearLimit = useCallback((type: 'tests' | 'analytics', threshold = 80) => {
    return getUsagePercentage(type) >= threshold;
  }, [getUsagePercentage]);

  return {
    subscription,
    plans,
    paymentMethods,
    paymentHistory,
    loading,
    error,
    fetchSubscription,
    createSubscription,
    cancelSubscription,
    reactivateSubscription,
    addPaymentMethod,
    removePaymentMethod,
    setDefaultPaymentMethod,
    getPlan,
    hasFeatureAccess,
    getUsagePercentage,
    isNearLimit
  };
}