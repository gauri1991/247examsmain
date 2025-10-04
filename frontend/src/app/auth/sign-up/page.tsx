"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Mail, Lock, User, Phone, Eye, EyeOff, ArrowRight, ArrowLeft, CheckCircle, CreditCard } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { apiService } from "@/lib/api";

export default function SignUp() {
  const router = useRouter();
  const { register, login, loading: authLoading } = useAuth();
  
  // Flow control
  const [useOTPFlow, setUseOTPFlow] = useState(true); // true = OTP only, false = Password + verification
  const [currentStep, setCurrentStep] = useState(1);
  
  // Form data
  const [formData, setFormData] = useState({
    mobile: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    otp: ''
  });
  
  // State flags
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  const getStepTitle = () => {
    if (useOTPFlow) {
      return currentStep === 1 ? "Enter Mobile Number" : "Verify OTP";
    } else {
      switch (currentStep) {
        case 1: return "Registration Details";
        case 2: return "Verify Mobile Number";
        case 3: return "Payment Required";
        default: return "Sign Up";
      }
    }
  };

  const getStepDescription = () => {
    if (useOTPFlow) {
      return currentStep === 1 
        ? "Quick registration with OTP verification only" 
        : "Enter the OTP sent to your mobile";
    } else {
      switch (currentStep) {
        case 1: return "Fill in your details and create a password";
        case 2: return "Verify your mobile number with OTP";
        case 3: return "Complete payment to activate your account";
        default: return "Create your account";
      }
    }
  };

  // OTP Flow - Direct registration
  const sendOTPForDirectRegistration = async () => {
    try {
      setError('');
      await apiService.mobileSendOTP({
        phone: formData.mobile,
        purpose: 'registration'
      });
      setOtpSent(true);
      setCurrentStep(2);
    } catch (error: any) {
      setError(error.message || 'Failed to send OTP. Please try again.');
    }
  };

  const completeOTPRegistration = async () => {
    setIsVerifying(true);
    try {
      setError('');
      const response = await apiService.mobileRegister({
        phone: formData.mobile,
        otp: formData.otp,
        first_name: formData.firstName,
        last_name: formData.lastName
      });
      
      if (response.user) {
        window.location.href = '/dashboard';
      }
    } catch (error: any) {
      setError(error.message || 'Failed to verify OTP. Please try again.');
      setIsVerifying(false);
    }
  };

  // Password Flow - With mobile verification and payment
  const sendOTPForPasswordFlow = async () => {
    try {
      setError('');
      await apiService.mobileSendOTP({
        phone: formData.mobile,
        purpose: 'registration'
      });
      setOtpSent(true);
      setCurrentStep(2);
    } catch (error: any) {
      setError(error.message || 'Failed to send OTP. Please try again.');
    }
  };

  const completePasswordRegistration = async () => {
    setIsVerifying(true);
    try {
      setError('');
      const response = await apiService.mobilePasswordRegister({
        phone: formData.mobile,
        otp: formData.otp,
        password: formData.password,
        confirm_password: formData.confirmPassword,
        first_name: formData.firstName,
        last_name: formData.lastName
      });
      
      if (response.requires_payment) {
        setCurrentStep(3); // Go to payment step
        setIsVerifying(false);
      } else if (response.user) {
        window.location.href = '/dashboard';
      }
    } catch (error: any) {
      setError(error.message || 'Failed to complete registration. Please try again.');
      setIsVerifying(false);
    }
  };

  const handlePrimaryAction = () => {
    if (useOTPFlow) {
      if (currentStep === 1) {
        sendOTPForDirectRegistration();
      } else {
        completeOTPRegistration();
      }
    } else {
      if (currentStep === 1) {
        sendOTPForPasswordFlow();
      } else if (currentStep === 2) {
        completePasswordRegistration();
      } else if (currentStep === 3) {
        // Payment flow - placeholder for now
        alert('Payment integration coming soon! For now, account created successfully.');
        window.location.href = '/dashboard';
      }
    }
  };

  const getStepCount = () => useOTPFlow ? 2 : 3;
  const isPrimaryButtonDisabled = () => {
    if (useOTPFlow) {
      if (currentStep === 1) return !formData.mobile.trim();
      return formData.otp.length !== 6 || isVerifying;
    } else {
      if (currentStep === 1) {
        return !formData.mobile.trim() || !formData.password || !formData.confirmPassword;
      }
      if (currentStep === 2) return formData.otp.length !== 6 || isVerifying;
      return isVerifying;
    }
  };

  const getPrimaryButtonText = () => {
    if (useOTPFlow) {
      if (currentStep === 1) return "Send OTP";
      return isVerifying ? "Creating Account..." : "Verify & Sign Up";
    } else {
      if (currentStep === 1) return "Send OTP";
      if (currentStep === 2) return isVerifying ? "Creating Account..." : "Verify & Continue";
      return "Complete Payment";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center space-x-3 mb-6 group">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
              <span className="text-white font-bold text-lg">247</span>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Exams</span>
          </Link>
        </div>

        <Card className="border-gray-200 shadow-xl bg-white">
          <CardHeader className="space-y-3 pb-4">
            {/* Progress Steps */}
            <div className="flex items-center justify-center space-x-2 mb-2">
              {Array.from({ length: getStepCount() }, (_, i) => i + 1).map((step) => (
                <React.Fragment key={step}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step}
                  </div>
                  {step < getStepCount() && (
                    <div className={`w-12 h-0.5 ${currentStep > step ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Registration Mode Toggle */}
            <div className="flex items-center space-x-2 justify-center p-3 bg-gray-50 rounded-lg">
              <Checkbox 
                id="useOTP" 
                checked={useOTPFlow}
                onCheckedChange={(checked) => {
                  setUseOTPFlow(checked as boolean);
                  setCurrentStep(1);
                  setError('');
                  setOtpSent(false);
                }}
              />
              <Label htmlFor="useOTP" className="text-sm font-medium cursor-pointer">
                {useOTPFlow ? "Quick Registration (OTP Only)" : "Password Registration (OTP + Payment)"}
              </Label>
            </div>

            <CardTitle className="text-xl font-bold text-center text-gray-900">
              {getStepTitle()}
            </CardTitle>
            <CardDescription className="text-center text-gray-600 text-sm">
              {getStepDescription()}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Step 1: Initial Form (different based on flow) */}
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
                    placeholder="98765 43210"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    required
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-10"
                  />
                </div>

                {!useOTPFlow && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label htmlFor="firstName" className="text-gray-700 font-medium flex items-center text-sm">
                          <User className="w-4 h-4 mr-2 text-gray-500" />
                          First Name
                        </Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          type="text"
                          placeholder="John"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-10"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="lastName" className="text-gray-700 font-medium text-sm">
                          Last Name
                        </Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          type="text"
                          placeholder="Doe"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-10"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="password" className="text-gray-700 font-medium flex items-center text-sm">
                        <Lock className="w-4 h-4 mr-2 text-gray-500" />
                        Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="Create a strong password"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-10 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="confirmPassword" className="text-gray-700 font-medium flex items-center text-sm">
                        <Lock className="w-4 h-4 mr-2 text-gray-500" />
                        Confirm Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm your password"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          required
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-10 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center"
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4 text-gray-400" /> : <Eye className="h-4 w-4 text-gray-400" />}
                        </button>
                      </div>
                    </div>
                  </>
                )}

                {useOTPFlow && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="firstName" className="text-gray-700 font-medium text-sm">
                        First Name (Optional)
                      </Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        type="text"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-10"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="lastName" className="text-gray-700 font-medium text-sm">
                        Last Name (Optional)
                      </Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        type="text"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-10"
                      />
                    </div>
                  </div>
                )}

                <Button
                  onClick={handlePrimaryAction}
                  disabled={isPrimaryButtonDisabled()}
                  className="w-full h-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {getPrimaryButtonText()} <ArrowRight className="w-4 h-4 ml-2" />
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
                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-3 py-2 rounded-md text-xs mt-2">
                    <strong>Testing Mode:</strong> Use OTP <code className="bg-yellow-100 px-1 rounded">123456</code> for verification
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => {
                      setCurrentStep(1);
                      setError('');
                      setOtpSent(false);
                    }}
                    variant="outline"
                    className="flex-1 h-10 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                    disabled={isVerifying}
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                  <Button
                    onClick={handlePrimaryAction}
                    disabled={isPrimaryButtonDisabled()}
                    className="flex-1 h-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                  >
                    {getPrimaryButtonText()}
                    {!isVerifying && <ArrowRight className="w-4 h-4 ml-2" />}
                  </Button>
                </div>
                <Button
                  onClick={() => {
                    if (useOTPFlow) {
                      sendOTPForDirectRegistration();
                    } else {
                      sendOTPForPasswordFlow();
                    }
                  }}
                  variant="ghost"
                  className="w-full text-blue-600 hover:text-blue-700 text-sm"
                  disabled={isVerifying}
                >
                  Resend OTP
                </Button>
              </div>
            )}

            {/* Step 3: Payment (Password Flow Only) */}
            {currentStep === 3 && !useOTPFlow && (
              <div className="space-y-4">
                <div className="text-center p-6 bg-blue-50 rounded-lg">
                  <CreditCard className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">Payment Required</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Complete your payment to activate your premium account with password-based access.
                  </p>
                  <div className="bg-white p-3 rounded border">
                    <p className="text-lg font-bold text-blue-600">₹999/year</p>
                    <p className="text-xs text-gray-500">Premium Access</p>
                  </div>
                </div>
                <Button
                  onClick={handlePrimaryAction}
                  disabled={isPrimaryButtonDisabled()}
                  className="w-full h-10 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  {getPrimaryButtonText()}
                </Button>
              </div>
            )}

            <div className="text-center text-xs pt-2">
              <span className="text-gray-600">Already have an account? </span>
              <Link
                href="/auth/sign-in"
                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
              >
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}