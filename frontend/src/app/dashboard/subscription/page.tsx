'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Crown, Star, CreditCard, Users, Gift, 
  ArrowRight, CheckCircle2, Shield, Sparkles
} from 'lucide-react';
import { useAuth } from "@/contexts/auth-context";
import { usePayment } from "@/hooks/usePayment";
import { SubscriptionPlans } from "@/components/payment/SubscriptionPlans";
import { BillingDashboard } from "@/components/payment/BillingDashboard";
import { PaymentCheckout } from "@/components/payment/PaymentCheckout";
import { toast } from 'sonner';

export default function SubscriptionPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [currentView, setCurrentView] = useState<'overview' | 'plans' | 'billing' | 'checkout'>('overview');
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);

  const {
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
    hasFeatureAccess,
    getUsagePercentage,
    isNearLimit
  } = usePayment({ userId: user?.id });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/sign-in');
      return;
    }
    
    fetchSubscription();
  }, [isAuthenticated, router, fetchSubscription]);

  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId);
    setCurrentView('checkout');
  };

  const handlePaymentSubmit = async (paymentData: any) => {
    try {
      await createSubscription(
        paymentData.planId, 
        paymentData.paymentMethodId,
        paymentData.newPaymentMethod
      );
      toast.success('Subscription activated successfully!');
      setCurrentView('overview');
      fetchSubscription();
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    }
  };

  const handleCancelSubscription = async (immediate?: boolean) => {
    try {
      await cancelSubscription(immediate);
      fetchSubscription();
    } catch (error) {
      toast.error('Failed to cancel subscription');
    }
  };

  const handleReactivateSubscription = async () => {
    try {
      await reactivateSubscription();
      fetchSubscription();
    } catch (error) {
      toast.error('Failed to reactivate subscription');
    }
  };

  const getCurrentPlan = () => {
    if (!subscription) return plans.find(p => p.id === 'free');
    return subscription.plan;
  };

  const canAccessFeature = (feature: string) => {
    const currentPlan = getCurrentPlan();
    if (!currentPlan) return false;
    
    switch (feature) {
      case 'unlimited_tests':
        return currentPlan.maxTests === -1;
      case 'advanced_analytics':
        return currentPlan.maxAnalytics;
      case 'video_lectures':
        return currentPlan.videoLectures;
      case 'priority_support':
        return currentPlan.prioritySupport;
      default:
        return false;
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  if (loading && !subscription) {
    return (
      <div className="flex-1 flex flex-col min-h-screen">
        <DashboardHeader title="Subscription" />
        <div className="flex-1 overflow-auto px-3 sm:px-6 py-4 sm:py-8">
          <div className="space-y-3 sm:space-y-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardContent className="pt-4 sm:pt-6">
                  <div className="animate-pulse space-y-3 sm:space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-32 bg-gray-200 rounded"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const selectedPlan = selectedPlanId ? plans.find(p => p.id === selectedPlanId) : null;

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <DashboardHeader title="Subscription & Billing" />
      
      <div className="flex-1 overflow-auto px-3 sm:px-6 py-4 sm:py-8">
        {currentView === 'checkout' && selectedPlan ? (
          <PaymentCheckout
            plan={selectedPlan}
            paymentMethods={paymentMethods}
            onPaymentSubmit={handlePaymentSubmit}
            onBack={() => setCurrentView('plans')}
            loading={loading}
          />
        ) : (
          <>
            {/* Header Section */}
            <div className="mb-4 sm:mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-foreground">
                Subscription & Billing
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground">
                Manage your subscription, billing details, and access premium features
              </p>
            </div>

            {/* Current Plan Status */}
            {subscription && (
              <Card className="mb-4 sm:mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
                <CardContent className="pt-4 sm:pt-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                        {subscription.plan.id.includes('pro') ? (
                          <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
                        ) : (
                          <Star className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg sm:text-xl font-semibold">{subscription.plan.name} Plan</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {subscription.status === 'active' ? 'Active' : subscription.status} •
                          Renews on {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-left sm:text-right w-full sm:w-auto">
                      <div className="text-xl sm:text-2xl font-bold">
                        ₹{subscription.plan.price}/{subscription.plan.interval === 'yearly' ? 'year' : 'month'}
                      </div>
                      {subscription.plan.interval === 'yearly' && (
                        <Badge className="bg-green-100 text-green-800 mt-1 text-xs">
                          Save 2 months free
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Tabs defaultValue="overview" className="w-full">
              <div className="overflow-x-auto">
                <TabsList className="grid w-full grid-cols-3 min-w-max">
                  <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
                  <TabsTrigger value="plans" className="text-xs sm:text-sm">Plans & Pricing</TabsTrigger>
                  <TabsTrigger value="billing" className="text-xs sm:text-sm">Billing & Payment</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="overview" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
                {/* Feature Access Overview */}
                <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
                        Feature Access
                      </CardTitle>
                      <CardDescription className="text-xs sm:text-sm">Your current plan includes these features</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 sm:space-y-3">
                        <div className="flex items-center justify-between text-sm sm:text-base">
                          <span>Practice Tests</span>
                          <div className="flex items-center gap-2">
                            {canAccessFeature('unlimited_tests') ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                                <span className="text-green-600 text-xs sm:text-sm">Unlimited</span>
                              </>
                            ) : (
                              <span className="text-xs sm:text-sm">{getCurrentPlan()?.maxTests || 0} per month</span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-sm sm:text-base">
                          <span>Advanced Analytics</span>
                          {canAccessFeature('advanced_analytics') ? (
                            <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                          ) : (
                            <Badge variant="outline" className="text-xs">Upgrade for access</Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-sm sm:text-base">
                          <span>Video Lectures</span>
                          {canAccessFeature('video_lectures') ? (
                            <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                          ) : (
                            <Badge variant="outline" className="text-xs">Upgrade for access</Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-sm sm:text-base">
                          <span>Priority Support</span>
                          {canAccessFeature('priority_support') ? (
                            <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                          ) : (
                            <Badge variant="outline" className="text-xs">Upgrade for access</Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Usage Statistics */}
                  {subscription && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                          <Users className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                          Usage This Period
                        </CardTitle>
                        <CardDescription className="text-xs sm:text-sm">Your current usage and limits</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3 sm:space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Practice Tests</span>
                              <span>
                                {subscription.usage.testsUsed} / {subscription.plan.maxTests === -1 ? '∞' : subscription.plan.maxTests}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  getUsagePercentage('tests') > 80 ? 'bg-red-500' :
                                  getUsagePercentage('tests') > 60 ? 'bg-yellow-500' : 'bg-green-500'
                                }`}
                                style={{ 
                                  width: subscription.plan.maxTests === -1 ? '0%' : `${getUsagePercentage('tests')}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>Analytics Views</span>
                              <span>{subscription.usage.analyticsUsed}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${Math.min(subscription.usage.analyticsUsed, 100)}%` }}
                              ></div>
                            </div>
                          </div>

                          {isNearLimit('tests') && (
                            <div className="p-2 sm:p-3 bg-orange-50 border-l-4 border-orange-500 rounded">
                              <p className="text-orange-800 text-xs sm:text-sm font-medium">
                                You're approaching your test limit. Consider upgrading for unlimited access.
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Upgrade Promotion */}
                {(!subscription || subscription.plan.id !== 'pro_yearly') && (
                  <Card className="bg-gradient-to-r from-purple-500 to-blue-600 text-white">
                    <CardContent className="pt-4 sm:pt-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div>
                          <h3 className="text-lg sm:text-xl font-semibold mb-2">Unlock Premium Features</h3>
                          <p className="opacity-90 text-sm sm:text-base">
                            Get unlimited tests, advanced analytics, video lectures, and priority support
                          </p>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-3 sm:mt-4">
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="text-xs sm:text-sm">Unlimited Tests</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="text-xs sm:text-sm">AI Analytics</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" />
                              <span className="text-xs sm:text-sm">Video Content</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-left sm:text-right w-full sm:w-auto">
                          <Button
                            variant="secondary"
                            onClick={() => setCurrentView('plans')}
                            className="text-purple-600 hover:text-purple-700 w-full sm:w-auto"
                          >
                            View Plans
                            <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Quick Actions */}
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                  <Button
                    variant="outline"
                    onClick={() => setCurrentView('plans')}
                    className="h-14 sm:h-16 flex flex-col gap-1 sm:gap-2"
                  >
                    <Crown className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-xs sm:text-sm">View Plans</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => setCurrentView('billing')}
                    className="h-14 sm:h-16 flex flex-col gap-1 sm:gap-2"
                  >
                    <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-xs sm:text-sm">Billing Details</span>
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() => router.push('/dashboard/advanced-analytics')}
                    className="h-14 sm:h-16 flex flex-col gap-1 sm:gap-2"
                  >
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-xs sm:text-sm">Analytics</span>
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="plans" className="mt-4 sm:mt-6">
                <SubscriptionPlans
                  plans={plans}
                  currentSubscription={subscription}
                  onSelectPlan={handleSelectPlan}
                  loading={loading}
                />
              </TabsContent>

              <TabsContent value="billing" className="mt-4 sm:mt-6">
                <BillingDashboard
                  subscription={subscription}
                  paymentMethods={paymentMethods}
                  paymentHistory={paymentHistory}
                  onCancelSubscription={handleCancelSubscription}
                  onReactivateSubscription={handleReactivateSubscription}
                  onChangePaymentMethod={() => {/* TODO: Implement */}}
                  onUpgrade={() => setCurrentView('plans')}
                  loading={loading}
                />
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </div>
  );
}