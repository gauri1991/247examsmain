"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Phone, ArrowRight, ArrowLeft, CheckCircle } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { apiService } from "@/lib/api";

export default function SignIn() {
  const router = useRouter();
  const { login, loading: authLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1); // 1: mobile, 2: otp
  const [formData, setFormData] = useState({
    mobile: '',
    otp: ''
  });
  const [error, setError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  const sendOTP = async () => {
    try {
      setError('');
      await apiService.mobileSendOTP({
        phone: formData.mobile,
        purpose: 'login'
      });
      
      console.log('Login OTP sent to:', formData.mobile);
      setOtpSent(true);
      setCurrentStep(2);
    } catch (error: any) {
      console.error('Failed to send OTP:', error);
      setError(error.message || 'Failed to send OTP. Please try again.');
    }
  };

  const verifyOTPAndLogin = async () => {
    setIsVerifying(true);
    try {
      setError('');
      
      // Use the real mobile login API
      const response = await apiService.mobileLogin({
        phone: formData.mobile,
        otp: formData.otp
      });
      
      console.log('Login successful:', response);
      
      // Login successful, user and tokens are stored by apiService
      // Update auth context state by redirecting
      if (response.user) {
        window.location.href = '/dashboard';
      }
    } catch (error: any) {
      console.error('Login failed:', error);
      setError(error.message || 'Failed to verify OTP. Please try again.');
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center space-x-3 mb-6 group">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
              <span className="text-white font-bold text-lg">247</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Exams</span>
          </Link>
        </div>

        <Card className="border-gray-200 shadow-xl bg-white">
          <CardHeader className="space-y-2 pb-4">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>1</div>
              <div className={`w-12 h-0.5 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>2</div>
            </div>
            <CardTitle className="text-xl font-bold text-center text-gray-900">
              {currentStep === 1 && "Welcome Back"}
              {currentStep === 2 && "Verify OTP"}
            </CardTitle>
            <CardDescription className="text-center text-gray-600 text-sm">
              {currentStep === 1 && "Enter your mobile number to sign in"}
              {currentStep === 2 && "Enter the OTP sent to your mobile"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Step 1: Mobile Number */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="mobile" className="text-gray-700 font-medium flex items-center text-sm">
                    <Phone className="w-4 h-4 mr-2 text-gray-500" />
                    Mobile Number
                  </Label>
                  <Input
                    id="mobile"
                    name="mobile"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    required
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-10"
                  />
                </div>
                <Button
                  onClick={sendOTP}
                  disabled={!formData.mobile}
                  className="w-full h-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send OTP <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}

            {/* Step 2: OTP Verification */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="otp" className="text-gray-700 font-medium flex items-center text-sm">
                    <CheckCircle className="w-4 h-4 mr-2 text-gray-500" />
                    Enter 6-digit OTP
                  </Label>
                  <Input
                    id="otp"
                    name="otp"
                    type="text"
                    placeholder="123456"
                    value={formData.otp}
                    onChange={handleInputChange}
                    maxLength={6}
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-12 text-center text-lg font-mono tracking-widest"
                  />
                  <p className="text-xs text-gray-600">OTP sent to {formData.mobile}</p>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => {
                      setCurrentStep(1);
                      setError('');
                    }}
                    variant="outline"
                    className="flex-1 h-10 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                    disabled={isVerifying}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                  <Button
                    onClick={verifyOTPAndLogin}
                    disabled={formData.otp.length !== 6 || isVerifying}
                    className="flex-1 h-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                  >
                    {isVerifying ? 'Signing In...' : 'Sign In'} 
                    {!isVerifying && <ArrowRight className="w-4 h-4 ml-2" />}
                  </Button>
                </div>
                <Button
                  onClick={sendOTP}
                  variant="ghost"
                  className="w-full text-blue-600 hover:text-blue-700 text-sm"
                  disabled={isVerifying}
                >
                  Resend OTP
                </Button>
              </div>
            )}

            <div className="text-center text-xs pt-2">
              <span className="text-gray-600">Don&apos;t have an account? </span>
              <Link
                href="/auth/sign-up"
                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
              >
                Sign up
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}