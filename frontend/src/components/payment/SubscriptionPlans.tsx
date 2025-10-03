'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Check, X, Crown, Star, Zap, Shield, 
  CreditCard, Calendar, Users, BookOpen,
  Video, BarChart3, Headphones, Award
} from 'lucide-react';
import { SubscriptionPlan, UserSubscription } from '@/hooks/usePayment';

interface SubscriptionPlansProps {
  plans: SubscriptionPlan[];
  currentSubscription?: UserSubscription | null;
  onSelectPlan: (planId: string) => void;
  loading?: boolean;
  className?: string;
}

export function SubscriptionPlans({ 
  plans, 
  currentSubscription, 
  onSelectPlan, 
  loading = false,
  className 
}: SubscriptionPlansProps) {
  const [billingInterval, setBillingInterval] = useState<'monthly' | 'yearly'>('monthly');

  const filteredPlans = plans.filter(plan => 
    plan.id === 'free' || plan.interval === billingInterval
  );

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case 'free':
        return <BookOpen className="w-6 h-6 text-gray-600" />;
      case 'basic_monthly':
        return <Star className="w-6 h-6 text-blue-600" />;
      case 'pro_monthly':
      case 'pro_yearly':
        return <Crown className="w-6 h-6 text-purple-600" />;
      default:
        return <Zap className="w-6 h-6 text-orange-600" />;
    }
  };

  const getFeatureIcon = (feature: string) => {
    if (feature.includes('test')) return <BarChart3 className="w-4 h-4" />;
    if (feature.includes('analytic')) return <BarChart3 className="w-4 h-4" />;
    if (feature.includes('support')) return <Headphones className="w-4 h-4" />;
    if (feature.includes('video')) return <Video className="w-4 h-4" />;
    if (feature.includes('comparison') || feature.includes('peer')) return <Users className="w-4 h-4" />;
    if (feature.includes('material')) return <BookOpen className="w-4 h-4" />;
    if (feature.includes('mock')) return <Award className="w-4 h-4" />;
    return <Check className="w-4 h-4" />;
  };

  const formatPrice = (price: number, currency: string, interval: string) => {
    if (price === 0) return 'Free';
    
    const formattedPrice = new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(price);
    
    return `${formattedPrice}/${interval === 'yearly' ? 'year' : 'month'}`;
  };

  const calculateYearlySavings = () => {
    const monthlyProPlan = plans.find(p => p.id === 'pro_monthly');
    const yearlyProPlan = plans.find(p => p.id === 'pro_yearly');
    
    if (monthlyProPlan && yearlyProPlan) {
      const monthlyCost = monthlyProPlan.price * 12;
      const savings = monthlyCost - yearlyProPlan.price;
      const savingsPercentage = Math.round((savings / monthlyCost) * 100);
      return { amount: savings, percentage: savingsPercentage };
    }
    
    return null;
  };

  const isCurrentPlan = (planId: string) => {
    return currentSubscription?.planId === planId;
  };

  const canUpgrade = (planId: string) => {
    if (!currentSubscription) return true;
    
    const planPriority = {
      'free': 0,
      'basic_monthly': 1,
      'pro_monthly': 2,
      'pro_yearly': 2
    };
    
    const currentPriority = planPriority[currentSubscription.planId as keyof typeof planPriority] || 0;
    const targetPriority = planPriority[planId as keyof typeof planPriority] || 0;
    
    return targetPriority > currentPriority;
  };

  const savings = calculateYearlySavings();

  return (
    <div className={className}>
      {/* Billing Toggle */}
      <div className="text-center mb-8">
        <Tabs value={billingInterval} onValueChange={(value) => setBillingInterval(value as 'monthly' | 'yearly')}>
          <TabsList className="grid w-fit grid-cols-2 mx-auto">
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly" className="relative">
              Yearly
              {savings && (
                <Badge className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1 py-0">
                  Save {savings.percentage}%
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </Tabs>
        
        {billingInterval === 'yearly' && savings && (
          <p className="text-green-600 text-sm mt-2">
            Save ₹{savings.amount.toLocaleString()} annually with yearly billing
          </p>
        )}
      </div>

      {/* Plans Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPlans.map((plan) => (
          <Card 
            key={plan.id} 
            className={`relative transition-all duration-200 hover:shadow-lg ${
              plan.popular ? 'border-2 border-blue-500 shadow-lg' : ''
            } ${
              plan.recommended ? 'border-2 border-purple-500 shadow-lg' : ''
            } ${
              isCurrentPlan(plan.id) ? 'border-2 border-green-500 bg-green-50' : ''
            }`}
          >
            {/* Popular/Recommended Badge */}
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-blue-500 text-white px-3 py-1">
                  Most Popular
                </Badge>
              </div>
            )}
            
            {plan.recommended && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-purple-500 text-white px-3 py-1">
                  Best Value
                </Badge>
              </div>
            )}

            {isCurrentPlan(plan.id) && (
              <div className="absolute -top-3 right-4">
                <Badge className="bg-green-500 text-white px-3 py-1">
                  Current Plan
                </Badge>
              </div>
            )}

            <CardHeader className="text-center pb-4">
              <div className="flex justify-center mb-4">
                {getPlanIcon(plan.id)}
              </div>
              
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <CardDescription className="text-sm px-2">
                {plan.description}
              </CardDescription>
              
              <div className="mt-4">
                <div className="text-3xl font-bold">
                  {formatPrice(plan.price, plan.currency, plan.interval)}
                </div>
                {plan.interval === 'yearly' && plan.price > 0 && (
                  <div className="text-sm text-muted-foreground mt-1">
                    ₹{Math.round(plan.price / 12).toLocaleString()}/month when billed annually
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Features List */}
              <div className="space-y-3">
                {plan.features.map((feature, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                        {getFeatureIcon(feature)}
                      </div>
                    </div>
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>

              {/* Feature Highlights */}
              <div className="pt-4 border-t space-y-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1">
                    <BarChart3 className="w-3 h-3" />
                    <span>
                      {plan.maxTests === -1 ? 'Unlimited' : plan.maxTests} tests
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Award className="w-3 h-3" />
                    <span>
                      {plan.mockTests === -1 ? 'Unlimited' : plan.mockTests} mocks
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {plan.prioritySupport ? (
                      <Headphones className="w-3 h-3 text-green-500" />
                    ) : (
                      <X className="w-3 h-3 text-gray-400" />
                    )}
                    <span>Priority support</span>
                  </div>
                  <div className="flex items-center gap-1">
                    {plan.videoLectures ? (
                      <Video className="w-3 h-3 text-green-500" />
                    ) : (
                      <X className="w-3 h-3 text-gray-400" />
                    )}
                    <span>Video lectures</span>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-4">
                {isCurrentPlan(plan.id) ? (
                  <Button variant="outline" className="w-full" disabled>
                    <Shield className="w-4 h-4 mr-2" />
                    Current Plan
                  </Button>
                ) : (
                  <Button
                    onClick={() => onSelectPlan(plan.id)}
                    disabled={loading}
                    className={`w-full ${
                      plan.popular || plan.recommended 
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white' 
                        : ''
                    }`}
                    variant={plan.id === 'free' ? 'outline' : 'default'}
                  >
                    <CreditCard className="w-4 h-4 mr-2" />
                    {plan.id === 'free' ? 'Get Started' : 
                     canUpgrade(plan.id) ? 'Upgrade' : 'Select Plan'}
                  </Button>
                )}
              </div>

              {/* Additional Info */}
              {plan.interval === 'yearly' && (
                <div className="text-center">
                  <div className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    <Calendar className="w-3 h-3" />
                    <span>2 months free included</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Plan Comparison Table */}
      <div className="mt-12">
        <h3 className="text-xl font-semibold mb-6 text-center">Feature Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="text-left p-4">Features</th>
                {filteredPlans.map(plan => (
                  <th key={plan.id} className="text-center p-4">
                    <div className="font-semibold">{plan.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatPrice(plan.price, plan.currency, plan.interval)}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="p-4 font-medium">Practice Tests</td>
                {filteredPlans.map(plan => (
                  <td key={plan.id} className="text-center p-4">
                    {plan.maxTests === -1 ? 'Unlimited' : plan.maxTests}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="p-4 font-medium">Mock Tests</td>
                {filteredPlans.map(plan => (
                  <td key={plan.id} className="text-center p-4">
                    {plan.mockTests === -1 ? 'Unlimited' : plan.mockTests}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="p-4 font-medium">Advanced Analytics</td>
                {filteredPlans.map(plan => (
                  <td key={plan.id} className="text-center p-4">
                    {plan.maxAnalytics ? (
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-gray-400 mx-auto" />
                    )}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="p-4 font-medium">Video Lectures</td>
                {filteredPlans.map(plan => (
                  <td key={plan.id} className="text-center p-4">
                    {plan.videoLectures ? (
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-gray-400 mx-auto" />
                    )}
                  </td>
                ))}
              </tr>
              <tr className="border-b">
                <td className="p-4 font-medium">Priority Support</td>
                {filteredPlans.map(plan => (
                  <td key={plan.id} className="text-center p-4">
                    {plan.prioritySupport ? (
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-gray-400 mx-auto" />
                    )}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-4 font-medium">Peer Comparison</td>
                {filteredPlans.map(plan => (
                  <td key={plan.id} className="text-center p-4">
                    {plan.compareWithPeers ? (
                      <Check className="w-5 h-5 text-green-500 mx-auto" />
                    ) : (
                      <X className="w-5 h-5 text-gray-400 mx-auto" />
                    )}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* FAQ or Additional Info */}
      <div className="mt-12 text-center">
        <div className="max-w-2xl mx-auto">
          <h4 className="font-semibold mb-4">All plans include:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-green-500" />
              <span>Secure payments</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-green-500" />
              <span>Cancel anytime</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-green-500" />
              <span>Community access</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-green-500" />
              <span>Study materials</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}