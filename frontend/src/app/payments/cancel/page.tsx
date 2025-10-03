"use client";
import { useRouter } from 'next/navigation';
import { XCircle, ArrowLeft, CreditCard } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function PaymentCancelPage() {
  const router = useRouter();

  const handleReturnToPricing = () => {
    router.push('/pricing');
  };

  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <XCircle className="w-16 h-16 text-orange-500" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Payment Cancelled</h1>
          <p className="text-xl text-gray-400">
            No worries! Your payment was cancelled and no charges were made.
          </p>
        </div>

        <Card className="bg-gray-900 border-gray-700 mb-8">
          <CardHeader>
            <CardTitle className="text-xl flex items-center">
              <CreditCard className="w-6 h-6 mr-2" />
              What Happened?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-300">
                You cancelled the payment process before completion. This could happen for several reasons:
              </p>
              <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
                <li>You clicked the back button or closed the payment window</li>
                <li>You decided to choose a different plan</li>
                <li>You encountered technical difficulties</li>
                <li>You want to pay later</li>
              </ul>
              <div className="bg-gray-800 p-4 rounded-lg mt-6">
                <p className="text-sm text-gray-300">
                  <strong>Good news:</strong> No payment was processed and your card was not charged. 
                  You can try again anytime with any of our subscription plans.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-4">
          <Button 
            onClick={handleReturnToPricing}
            size="lg"
            className="w-full bg-blue-600 hover:bg-blue-700 py-4 text-lg"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Return to Pricing Plans
          </Button>
          
          <Button 
            onClick={handleGoToDashboard}
            variant="outline"
            size="lg"
            className="w-full py-4 text-lg"
          >
            Go to Dashboard
          </Button>
        </div>

        {/* Help Section */}
        <div className="mt-12">
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg">Need Assistance?</CardTitle>
              <CardDescription>
                If you're having trouble with the payment process, we're here to help
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium text-white">Common Issues</h4>
                  <ul className="text-sm text-gray-400 space-y-1">
                    <li>• Card declined or expired</li>
                    <li>• Billing address mismatch</li>
                    <li>• Network connectivity issues</li>
                    <li>• Browser compatibility</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-white">Get Help</h4>
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open('mailto:support@247exams.com')}
                    >
                      Email Support
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => window.open('/help/payment-issues')}
                    >
                      Payment FAQ
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Special Offer */}
        <div className="mt-8">
          <Card className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border-blue-700">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-lg font-bold mb-2">Still Interested?</h3>
                <p className="text-gray-300 mb-4">
                  Our subscription plans are designed to help you succeed in your exam preparation. 
                  Don't miss out on comprehensive practice tests and detailed analytics!
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button 
                    onClick={handleReturnToPricing}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    View All Plans
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => router.push('/pricing?plan=basic')}
                  >
                    Try Basic Plan
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}