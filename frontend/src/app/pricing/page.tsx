"use client";
import { useState, useEffect } from 'react';
import { Check, Star, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';

interface SubscriptionPlan {
  id: string;
  name: string;
  plan_type: string;
  description: string;
  price: string;
  billing_cycle: string;
  max_tests: number;
  max_questions: number;
  pdf_extraction: boolean;
  analytics_access: boolean;
  priority_support: boolean;
  custom_branding: boolean;
  api_access: boolean;
  trial_days: number;
  is_popular: boolean;
  features_list: string[];
}

export default function PricingPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/payments/plans/', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPlans(data);
      } else {
        throw new Error('Failed to fetch plans');
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (planId: string) => {
    if (!user) {
      toast.error('Please sign in to select a plan');
      router.push('/auth/sign-in');
      return;
    }

    setSelectedPlan(planId);
    
    try {
      // Create checkout session
      const response = await fetch('http://localhost:8000/api/v1/payments/create-checkout-session/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          plan_id: planId,
          success_url: `${window.location.origin}/payments/success`,
          cancel_url: `${window.location.origin}/payments/cancel`,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect to payment gateway
        window.location.href = data.checkout_url;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to initiate payment. Please try again.');
    } finally {
      setSelectedPlan(null);
    }
  };

  const formatPrice = (price: string, billing_cycle: string) => {
    const numPrice = parseFloat(price);
    if (billing_cycle === 'yearly') {
      return `₹${numPrice.toLocaleString()}/year`;
    } else if (billing_cycle === 'monthly') {
      return `₹${numPrice.toLocaleString()}/month`;
    } else {
      return `₹${numPrice.toLocaleString()}`;
    }
  };

  const getPlanIcon = (plan_type: string) => {
    switch (plan_type) {
      case 'basic':
        return <Star className="w-6 h-6 text-blue-500" />;
      case 'pro':
        return <Crown className="w-6 h-6 text-purple-500" />;
      case 'enterprise':
        return <Crown className="w-6 h-6 text-yellow-500" />;
      default:
        return <Star className="w-6 h-6 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Select the perfect plan for your exam preparation journey. All plans include access to our comprehensive question bank and practice tests.
            </p>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <Card 
              key={plan.id} 
              className={`bg-gray-900 border-gray-700 relative ${
                plan.is_popular ? 'ring-2 ring-purple-500 scale-105' : ''
              }`}
            >
              {plan.is_popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-purple-500 text-white px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center">
                <div className="flex items-center justify-center mb-4">
                  {getPlanIcon(plan.plan_type)}
                </div>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription className="text-gray-400">
                  {plan.description}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-3xl font-bold text-white">
                    {formatPrice(plan.price, plan.billing_cycle)}
                  </span>
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3">
                  {/* Tests limit */}
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">
                      {plan.max_tests === -1 ? 'Unlimited Tests' : `${plan.max_tests} Tests/month`}
                    </span>
                  </li>
                  
                  {/* Questions limit */}
                  <li className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-sm">
                      {plan.max_questions === -1 ? 'Unlimited Questions' : `${plan.max_questions} Questions/test`}
                    </span>
                  </li>

                  {/* PDF Extraction */}
                  {plan.pdf_extraction && (
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">PDF Question Extraction</span>
                    </li>
                  )}

                  {/* Analytics */}
                  {plan.analytics_access && (
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Advanced Analytics</span>
                    </li>
                  )}

                  {/* Priority Support */}
                  {plan.priority_support && (
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Priority Support</span>
                    </li>
                  )}

                  {/* Custom Branding */}
                  {plan.custom_branding && (
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">Custom Branding</span>
                    </li>
                  )}

                  {/* API Access */}
                  {plan.api_access && (
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">API Access</span>
                    </li>
                  )}

                  {/* Trial Period */}
                  {plan.trial_days > 0 && (
                    <li className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{plan.trial_days} Days Free Trial</span>
                    </li>
                  )}
                </ul>
              </CardContent>

              <CardFooter>
                <Button 
                  className={`w-full ${
                    plan.is_popular 
                      ? 'bg-purple-600 hover:bg-purple-700' 
                      : 'bg-white text-black hover:bg-gray-200'
                  }`}
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={selectedPlan === plan.id}
                >
                  {selectedPlan === plan.id ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    plan.trial_days > 0 ? 'Start Free Trial' : 'Get Started'
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-gray-900 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Can I change my plan later?</h3>
              <p className="text-gray-400">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be prorated and reflected in your next billing cycle.
              </p>
            </div>
            
            <div className="bg-gray-900 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">What happens after my trial ends?</h3>
              <p className="text-gray-400">
                Your trial will automatically convert to a paid subscription. You can cancel anytime before the trial ends to avoid charges.
              </p>
            </div>
            
            <div className="bg-gray-900 p-6 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Do you offer refunds?</h3>
              <p className="text-gray-400">
                Yes, we offer a 30-day money-back guarantee. If you're not satisfied with our service, contact support for a full refund.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}