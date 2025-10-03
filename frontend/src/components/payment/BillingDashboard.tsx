'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CreditCard, Calendar, Download, RefreshCw, AlertTriangle,
  CheckCircle2, XCircle, Clock, Users, BarChart3, Shield,
  Star, Crown, Zap, Award, Settings, Eye, Plus
} from 'lucide-react';
import { UserSubscription, PaymentMethod, PaymentHistory } from '@/hooks/usePayment';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface BillingDashboardProps {
  subscription: UserSubscription | null;
  paymentMethods: PaymentMethod[];
  paymentHistory: PaymentHistory[];
  onCancelSubscription: (immediate?: boolean) => void;
  onReactivateSubscription: () => void;
  onChangePaymentMethod: () => void;
  onUpgrade: () => void;
  loading?: boolean;
  className?: string;
}

export function BillingDashboard({
  subscription,
  paymentMethods,
  paymentHistory,
  onCancelSubscription,
  onReactivateSubscription,
  onChangePaymentMethod,
  onUpgrade,
  loading = false,
  className
}: BillingDashboardProps) {
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getDaysUntilRenewal = () => {
    if (!subscription) return 0;
    const renewalDate = new Date(subscription.currentPeriodEnd);
    const today = new Date();
    const diffTime = renewalDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'canceled':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'succeeded':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case 'refunded':
        return <RefreshCw className="w-4 h-4 text-blue-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getUsagePercentage = (used: number, max: number) => {
    if (max === -1) return 0; // Unlimited
    return Math.min((used / max) * 100, 100);
  };

  const defaultPaymentMethod = paymentMethods.find(pm => pm.isDefault);
  const daysUntilRenewal = getDaysUntilRenewal();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Current Subscription Overview */}
      {subscription && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  {subscription.plan.id === 'pro_monthly' || subscription.plan.id === 'pro_yearly' ? (
                    <Crown className="w-5 h-5 text-purple-600" />
                  ) : subscription.plan.id === 'basic_monthly' ? (
                    <Star className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Zap className="w-5 h-5 text-gray-600" />
                  )}
                  {subscription.plan.name} Plan
                </CardTitle>
                <CardDescription>
                  Your current subscription and usage details
                </CardDescription>
              </div>
              <Badge className={getStatusColor(subscription.status)}>
                {subscription.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Subscription Details */}
            <div className="grid gap-4 md:grid-cols-3">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {formatAmount(subscription.plan.price, subscription.plan.currency)}
                </div>
                <div className="text-sm text-blue-700">
                  per {subscription.plan.interval === 'yearly' ? 'year' : 'month'}
                </div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {daysUntilRenewal}
                </div>
                <div className="text-sm text-green-700">
                  days until renewal
                </div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {subscription.plan.maxTests === -1 ? '∞' : subscription.plan.maxTests}
                </div>
                <div className="text-sm text-purple-700">
                  tests included
                </div>
              </div>
            </div>

            {/* Usage Statistics */}
            <div className="space-y-4">
              <h4 className="font-semibold">Usage This Period</h4>
              
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Practice Tests</span>
                    <span>
                      {subscription.usage.testsUsed} / {subscription.plan.maxTests === -1 ? '∞' : subscription.plan.maxTests}
                    </span>
                  </div>
                  <Progress 
                    value={getUsagePercentage(subscription.usage.testsUsed, subscription.plan.maxTests)} 
                    className="h-2"
                  />
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Analytics Views</span>
                    <span>{subscription.usage.analyticsUsed}</span>
                  </div>
                  <Progress value={subscription.usage.analyticsUsed} className="h-2" />
                </div>
              </div>
            </div>

            {/* Billing Period */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Current Billing Period</div>
                  <div className="text-sm text-muted-foreground">
                    {formatDate(subscription.currentPeriodStart)} - {formatDate(subscription.currentPeriodEnd)}
                  </div>
                </div>
                <Calendar className="w-5 h-5 text-gray-600" />
              </div>
            </div>

            {/* Cancellation Warning */}
            {subscription.cancelAtPeriodEnd && (
              <div className="p-4 bg-orange-50 border-l-4 border-orange-500 rounded">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  <div>
                    <div className="font-medium text-orange-800">
                      Subscription will cancel on {formatDate(subscription.currentPeriodEnd)}
                    </div>
                    <div className="text-sm text-orange-700">
                      You can reactivate your subscription at any time before this date.
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={onReactivateSubscription}
                  className="mt-3 bg-orange-600 hover:bg-orange-700"
                  size="sm"
                >
                  Reactivate Subscription
                </Button>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              {subscription.plan.id !== 'pro_yearly' && subscription.status === 'active' && (
                <Button onClick={onUpgrade} variant="default">
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade Plan
                </Button>
              )}
              
              <Button onClick={onChangePaymentMethod} variant="outline">
                <CreditCard className="w-4 h-4 mr-2" />
                Payment Method
              </Button>
              
              {subscription.status === 'active' && !subscription.cancelAtPeriodEnd && (
                <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" className="text-red-600 hover:bg-red-50">
                      Cancel Subscription
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Cancel Subscription?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to cancel your {subscription.plan.name} subscription? 
                        You will continue to have access until {formatDate(subscription.currentPeriodEnd)}.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => {
                          onCancelSubscription();
                          setShowCancelDialog(false);
                        }}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Cancel Subscription
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="payment-methods" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="billing-history">Billing History</TabsTrigger>
        </TabsList>

        <TabsContent value="payment-methods" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Payment Methods</CardTitle>
                  <CardDescription>Manage your payment methods and billing information</CardDescription>
                </div>
                <Button onClick={onChangePaymentMethod} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Method
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {paymentMethods.length > 0 ? (
                <div className="space-y-3">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <CreditCard className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">
                            {method.type === 'card' && `•••• •••• •••• ${method.last4}`}
                            {method.type === 'upi' && method.upiId}
                            {method.type === 'netbanking' && 'Net Banking'}
                            {method.type === 'wallet' && method.walletProvider}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {method.type === 'card' && `${method.brand} • Expires ${method.expiryMonth}/${method.expiryYear}`}
                            {method.type === 'upi' && 'UPI Payment'}
                            {method.type === 'netbanking' && 'Bank Transfer'}
                            {method.type === 'wallet' && 'Digital Wallet'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {method.isDefault && (
                          <Badge variant="secondary">Default</Badge>
                        )}
                        <Button variant="ghost" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCard className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No payment methods</h3>
                  <p className="text-muted-foreground mb-4">
                    Add a payment method to manage your subscription
                  </p>
                  <Button onClick={onChangePaymentMethod}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Payment Method
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing-history" className="space-y-4 mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Billing History</CardTitle>
                  <CardDescription>View and download your payment history</CardDescription>
                </div>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {paymentHistory.length > 0 ? (
                <div className="space-y-3">
                  {paymentHistory.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          {getPaymentStatusIcon(payment.status)}
                        </div>
                        <div>
                          <div className="font-medium">{payment.description}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(payment.createdAt)} • 
                            {payment.paymentMethod.type === 'card' && ` •••• ${payment.paymentMethod.last4}`}
                            {payment.paymentMethod.type === 'upi' && ` ${payment.paymentMethod.upiId}`}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          {formatAmount(payment.amount, payment.currency)}
                        </div>
                        <div className={`text-sm ${
                          payment.status === 'succeeded' ? 'text-green-600' :
                          payment.status === 'failed' ? 'text-red-600' :
                          payment.status === 'refunded' ? 'text-blue-600' :
                          'text-yellow-600'
                        }`}>
                          {payment.status}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No billing history</h3>
                  <p className="text-muted-foreground">
                    Your payment history will appear here once you make your first payment
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Security Notice */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <Shield className="w-5 h-5 text-blue-600" />
            <div>
              <div className="font-medium text-blue-900">Secure Payments</div>
              <div className="text-sm text-blue-700">
                All payments are processed securely with 256-bit SSL encryption. We never store your payment details.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}