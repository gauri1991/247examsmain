"use client";
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, Loader2, XCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { toast } from 'sonner';

export default function PaymentSuccessPage() {
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing');
  const [subscription, setSubscription] = useState<any>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  
  const sessionId = searchParams.get('session_id');
  const mock = searchParams.get('mock');
  const planId = searchParams.get('plan_id');

  useEffect(() => {
    if (!user) {
      router.push('/auth/sign-in');
      return;
    }

    if (sessionId) {
      processPayment();
    } else {
      setStatus('error');
    }
  }, [sessionId, user]);

  const processPayment = async () => {
    try {
      if (mock === 'true') {
        // Handle mock payment success
        setStatus('success');
        toast.success('Mock payment completed successfully!');
        
        // Simulate subscription creation
        setSubscription({
          plan_name: 'Test Plan',
          status: 'active',
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        });
        
        return;
      }

      // Process real payment
      const response = await fetch('http://localhost:8000/api/v1/payments/process-payment-success/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify({
          session_id: sessionId,
          gateway: 'stripe' // or determine from payment
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setStatus('success');
        setSubscription(result.subscription);
        toast.success('Payment completed successfully!');
      } else {
        const error = await response.json();
        setStatus('error');
        toast.error(error.error || 'Payment processing failed');
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      setStatus('error');
      toast.error('An error occurred while processing your payment');
    }
  };

  const handleContinue = () => {
    router.push('/dashboard');
  };

  const handleRetry = () => {
    router.push('/pricing');
  };

  if (status === 'processing') {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
              </div>
              <CardTitle className="text-2xl">Processing Payment</CardTitle>
              <CardDescription className="text-gray-400">
                Please wait while we confirm your payment...
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="max-w-md mx-auto text-center">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <XCircle className="w-12 h-12 text-red-500" />
              </div>
              <CardTitle className="text-2xl text-red-500">Payment Failed</CardTitle>
              <CardDescription className="text-gray-400">
                There was an issue processing your payment. Please try again.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  onClick={handleRetry}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Try Again
                </Button>
                <Button 
                  onClick={() => router.push('/dashboard')}
                  variant="outline"
                  className="w-full"
                >
                  Back to Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Success state
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Payment Successful!</h1>
          <p className="text-xl text-gray-400">
            Welcome to 247 Exams! Your subscription is now active.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Subscription Details */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl">Subscription Details</CardTitle>
            </CardHeader>
            <CardContent>
              {subscription && (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Plan:</span>
                    <span className="font-medium">{subscription.plan_name || 'Test Plan'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Status:</span>
                    <span className="font-medium text-green-500 capitalize">
                      {subscription.status || 'Active'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Started:</span>
                    <span className="font-medium">
                      {new Date(subscription.start_date || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                  {subscription.end_date && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">Next Billing:</span>
                      <span className="font-medium">
                        {new Date(subscription.end_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* What's Next */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-xl">What's Next?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold mt-1">
                    1
                  </div>
                  <div>
                    <h4 className="font-medium">Explore Question Bank</h4>
                    <p className="text-sm text-gray-400">
                      Access thousands of practice questions across multiple subjects
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold mt-1">
                    2
                  </div>
                  <div>
                    <h4 className="font-medium">Take Practice Tests</h4>
                    <p className="text-sm text-gray-400">
                      Start with timed practice tests to assess your preparation level
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold mt-1">
                    3
                  </div>
                  <div>
                    <h4 className="font-medium">Track Progress</h4>
                    <p className="text-sm text-gray-400">
                      Monitor your performance with detailed analytics and insights
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button 
            onClick={handleContinue}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 px-8 py-4 text-lg"
          >
            Get Started with Your Exam Prep
          </Button>
        </div>

        {/* Contact Support */}
        <div className="mt-12 text-center">
          <Card className="bg-gray-900 border-gray-700">
            <CardContent className="pt-6">
              <h3 className="text-lg font-medium mb-2">Need Help?</h3>
              <p className="text-gray-400 mb-4">
                If you have any questions about your subscription or need assistance getting started,
                our support team is here to help.
              </p>
              <Button 
                variant="outline"
                onClick={() => window.open('mailto:support@247exams.com')}
              >
                Contact Support
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}