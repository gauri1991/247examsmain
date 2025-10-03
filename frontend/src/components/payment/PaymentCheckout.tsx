'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, Shield, Lock, Check, Star, Crown,
  Smartphone, Building, Wallet, ArrowLeft
} from 'lucide-react';
import { SubscriptionPlan, PaymentMethod } from '@/hooks/usePayment';
import { paymentUtils } from '@/lib/payment-gateway';

interface PaymentCheckoutProps {
  plan: SubscriptionPlan;
  paymentMethods: PaymentMethod[];
  onPaymentSubmit: (paymentData: any) => void;
  onBack: () => void;
  loading?: boolean;
  className?: string;
}

export function PaymentCheckout({
  plan,
  paymentMethods,
  onPaymentSubmit,
  onBack,
  loading = false,
  className
}: PaymentCheckoutProps) {
  const [paymentMethod, setPaymentMethod] = useState<'new' | string>('new');
  const [paymentType, setPaymentType] = useState<'card' | 'upi' | 'netbanking'>('card');
  const [cardData, setCardData] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
    saveCard: true
  });
  const [upiData, setUpiData] = useState({
    upiId: ''
  });

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(price);
  };

  const handleCardInputChange = (field: string, value: string) => {
    if (field === 'number') {
      // Format card number with spaces
      value = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      if (value.length > 19) return; // Max length for formatted card number
    } else if (field === 'expiry') {
      // Format MM/YY
      value = value.replace(/\D/g, '');
      if (value.length >= 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
      }
      if (value.length > 5) return;
    } else if (field === 'cvv') {
      // Only numbers, max 4 digits
      value = value.replace(/\D/g, '').substring(0, 4);
    }

    setCardData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    const paymentData = {
      planId: plan.id,
      paymentMethodId: paymentMethod !== 'new' ? paymentMethod : undefined,
      newPaymentMethod: paymentMethod === 'new' ? {
        type: paymentType,
        ...(paymentType === 'card' ? cardData : {}),
        ...(paymentType === 'upi' ? upiData : {})
      } : undefined
    };

    onPaymentSubmit(paymentData);
  };

  const isFormValid = () => {
    if (paymentMethod !== 'new') return true;

    if (paymentType === 'card') {
      return paymentUtils.validateCardNumber(cardData.number.replace(/\s/g, '')) &&
             paymentUtils.validateExpiry(cardData.expiry) &&
             paymentUtils.validateCVV(cardData.cvv) &&
             cardData.name.trim().length > 0;
    }

    if (paymentType === 'upi') {
      return paymentUtils.validateUPI(upiData.upiId);
    }

    return paymentType === 'netbanking';
  };

  const getPlanIcon = () => {
    if (plan.id.includes('pro')) return <Crown className="w-6 h-6 text-purple-600" />;
    if (plan.id.includes('basic')) return <Star className="w-6 h-6 text-blue-600" />;
    return <Shield className="w-6 h-6 text-gray-600" />;
  };

  const calculateTax = (amount: number) => {
    return Math.round(amount * 0.18); // 18% GST
  };

  const tax = calculateTax(plan.price);
  const total = plan.price + tax;

  return (
    <div className={`max-w-4xl mx-auto ${className}`}>
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Order Summary */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-6">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Plans
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getPlanIcon()}
                Order Summary
              </CardTitle>
              <CardDescription>Review your subscription details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                <div>
                  <div className="font-semibold">{plan.name} Plan</div>
                  <div className="text-sm text-muted-foreground">
                    Billed {plan.interval === 'yearly' ? 'annually' : 'monthly'}
                  </div>
                </div>
                <div className="text-lg font-bold">
                  {formatPrice(plan.price, plan.currency)}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">What's included:</h4>
                {plan.features.slice(0, 4).map((feature, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-green-600" />
                    <span>{feature}</span>
                  </div>
                ))}
                {plan.features.length > 4 && (
                  <div className="text-sm text-muted-foreground">
                    +{plan.features.length - 4} more features
                  </div>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatPrice(plan.price, plan.currency)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>GST (18%)</span>
                  <span>{formatPrice(tax, plan.currency)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>{formatPrice(total, plan.currency)}</span>
                </div>
              </div>

              {plan.interval === 'yearly' && (
                <div className="p-3 bg-green-50 rounded-lg text-center">
                  <div className="text-green-700 font-medium">Annual Savings</div>
                  <div className="text-sm text-green-600">
                    Save ₹{((plan.price / 12 * 14) - plan.price).toLocaleString()} compared to monthly billing
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security Notice */}
          <Card className="bg-gray-50 border-gray-200">
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-green-600" />
                <div className="text-sm">
                  <div className="font-medium">Secure Payment</div>
                  <div className="text-muted-foreground">
                    Your payment information is encrypted and secure
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Form */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="w-5 h-5" />
                Payment Details
              </CardTitle>
              <CardDescription>Choose your payment method</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Existing Payment Methods */}
              {paymentMethods.length > 0 && (
                <div className="space-y-4">
                  <Label className="text-base font-medium">Saved Payment Methods</Label>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    {paymentMethods.map((method) => (
                      <div key={method.id} className="flex items-center space-x-2 p-3 border rounded-lg">
                        <RadioGroupItem value={method.id} id={method.id} />
                        <div className="flex items-center gap-3 flex-1">
                          <CreditCard className="w-5 h-5 text-gray-600" />
                          <div>
                            <Label htmlFor={method.id} className="font-medium cursor-pointer">
                              {method.type === 'card' && `•••• •••• •••• ${method.last4}`}
                              {method.type === 'upi' && method.upiId}
                            </Label>
                            <div className="text-sm text-muted-foreground">
                              {method.type === 'card' && `${method.brand} • Expires ${method.expiryMonth}/${method.expiryYear}`}
                              {method.type === 'upi' && 'UPI Payment'}
                            </div>
                          </div>
                          {method.isDefault && (
                            <div className="ml-auto">
                              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Default</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </RadioGroup>
                  <Separator />
                </div>
              )}

              {/* New Payment Method */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="new-method"
                    checked={paymentMethod === 'new'}
                    onChange={() => setPaymentMethod('new')}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="new-method" className="text-base font-medium cursor-pointer">
                    Add New Payment Method
                  </Label>
                </div>

                {paymentMethod === 'new' && (
                  <Tabs value={paymentType} onValueChange={(value) => setPaymentType(value as any)}>
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="card" className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        Card
                      </TabsTrigger>
                      <TabsTrigger value="upi" className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4" />
                        UPI
                      </TabsTrigger>
                      <TabsTrigger value="netbanking" className="flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        Net Banking
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="card" className="space-y-4 mt-6">
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="card-number">Card Number</Label>
                          <Input
                            id="card-number"
                            placeholder="1234 5678 9012 3456"
                            value={cardData.number}
                            onChange={(e) => handleCardInputChange('number', e.target.value)}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="expiry">Expiry Date</Label>
                            <Input
                              id="expiry"
                              placeholder="MM/YY"
                              value={cardData.expiry}
                              onChange={(e) => handleCardInputChange('expiry', e.target.value)}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cvv">CVV</Label>
                            <Input
                              id="cvv"
                              placeholder="123"
                              value={cardData.cvv}
                              onChange={(e) => handleCardInputChange('cvv', e.target.value)}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="card-name">Cardholder Name</Label>
                          <Input
                            id="card-name"
                            placeholder="John Doe"
                            value={cardData.name}
                            onChange={(e) => handleCardInputChange('name', e.target.value)}
                          />
                        </div>

                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id="save-card"
                            checked={cardData.saveCard}
                            onChange={(e) => setCardData(prev => ({ ...prev, saveCard: e.target.checked }))}
                            className="w-4 h-4"
                          />
                          <Label htmlFor="save-card" className="text-sm cursor-pointer">
                            Save this card for future payments
                          </Label>
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="upi" className="space-y-4 mt-6">
                      <div className="space-y-2">
                        <Label htmlFor="upi-id">UPI ID</Label>
                        <Input
                          id="upi-id"
                          placeholder="yourname@paytm"
                          value={upiData.upiId}
                          onChange={(e) => setUpiData({ upiId: e.target.value })}
                        />
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Enter your UPI ID to proceed with payment
                      </div>
                    </TabsContent>

                    <TabsContent value="netbanking" className="space-y-4 mt-6">
                      <div className="text-center py-8">
                        <Building className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <h3 className="font-semibold mb-2">Net Banking</h3>
                        <p className="text-sm text-muted-foreground">
                          You will be redirected to your bank's website to complete the payment
                        </p>
                      </div>
                    </TabsContent>
                  </Tabs>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <Button 
            onClick={handleSubmit}
            disabled={loading || !isFormValid()}
            className="w-full h-12 text-lg"
            size="lg"
          >
            {loading ? (
              'Processing...'
            ) : (
              <>
                <Lock className="w-5 h-5 mr-2" />
                Pay {formatPrice(total, plan.currency)}
              </>
            )}
          </Button>

          <div className="text-center text-sm text-muted-foreground">
            By completing your purchase, you agree to our Terms of Service and Privacy Policy.
            Your subscription will auto-renew unless cancelled.
          </div>
        </div>
      </div>
    </div>
  );
}