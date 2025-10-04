'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Phone, ArrowRight, ArrowLeft, CheckCircle, Lock, Key, Shield } from 'lucide-react'
import { apiService } from '@/lib/api'
import { useAuth } from '@/contexts/auth-context'

export default function AdminSignInPage() {
  const router = useRouter()
  const { login, mobileLogin, mobilePasswordLogin } = useAuth()
  const [useOTPFlow, setUseOTPFlow] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    mobile: '',
    password: '',
    otp: ''
  })
  const [error, setError] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    setError('')
  }

  const handleOTPToggle = (checked: boolean) => {
    setUseOTPFlow(checked)
    setCurrentStep(1)
    setOtpSent(false)
    setFormData(prev => ({ ...prev, password: '', otp: '' }))
    setError('')
  }

  const sendOTP = async () => {
    try {
      setError('')
      setIsLoading(true)
      await apiService.mobileSendOTP({
        phone: formData.mobile,
        purpose: 'login'
      })
      
      setOtpSent(true)
      setCurrentStep(2)
    } catch (error: any) {
      console.error('Failed to send OTP:', error)
      setError(error.message || 'Failed to send OTP. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordLogin = async () => {
    setIsLoading(true)
    try {
      setError('')
      
      await mobilePasswordLogin({
        phone: formData.mobile,
        password: formData.password
      })

      // The auth context will handle the login and user setting
      // We just need to check if the user has admin privileges
      // This will be checked by the admin page itself
      router.push('/admin')
    } catch (error: any) {
      console.error('Admin login failed:', error)
      if (error.message.includes('credentials')) {
        setError('Invalid mobile number or password')
      } else if (error.message.includes('privileges')) {
        setError('Access denied. Administrative privileges required.')
      } else {
        setError('Sign in failed. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleOTPLogin = async () => {
    setIsLoading(true)
    try {
      setError('')
      
      await mobileLogin({
        phone: formData.mobile,
        otp: formData.otp
      })

      // The auth context will handle the login and user setting
      // Admin privileges will be checked by the admin page
      router.push('/admin')
    } catch (error: any) {
      console.error('Admin OTP login failed:', error)
      setError(error.message || 'Failed to verify OTP. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center space-x-3 mb-6 group">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
              <Shield className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Admin Portal</span>
          </Link>
        </div>

        <Card className="border-gray-200 shadow-xl bg-white">
          <CardHeader className="space-y-2 pb-4">
            {/* Progress indicator - only show for OTP flow */}
            {useOTPFlow && (
              <div className="flex items-center justify-center space-x-2 mb-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>1</div>
                <div className={`w-12 h-0.5 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}`}>2</div>
              </div>
            )}
            <CardTitle className="text-xl font-bold text-center text-gray-900">
              {!useOTPFlow && "Admin Access"}
              {useOTPFlow && currentStep === 1 && "Admin Access"}
              {useOTPFlow && currentStep === 2 && "Verify OTP"}
            </CardTitle>
            <CardDescription className="text-center text-gray-600 text-sm">
              {!useOTPFlow && "Enter admin credentials to continue"}
              {useOTPFlow && currentStep === 1 && "Enter your mobile number to get OTP"}
              {useOTPFlow && currentStep === 2 && "Enter the OTP sent to your mobile"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {/* Authentication Mode Toggle */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="otpToggle" 
                  checked={useOTPFlow}
                  onCheckedChange={handleOTPToggle}
                  className="border-gray-400"
                />
                <Label htmlFor="otpToggle" className="text-sm font-medium text-gray-700 cursor-pointer">
                  Sign in with OTP instead of password
                </Label>
              </div>
            </div>

            {/* Default admin credentials hint */}
            {!useOTPFlow && (
              <div className="bg-blue-50 border border-blue-200 text-blue-800 px-3 py-2 rounded-md text-xs">
                <strong>Admin Credentials:</strong> Use mobile <code className="bg-blue-100 px-1 rounded">9252517941</code> with password <code className="bg-blue-100 px-1 rounded">admin123</code>
              </div>
            )}

            {/* Password Sign-in (default) */}
            {!useOTPFlow && (
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
                    placeholder="9252517941"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    required
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-10"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-gray-700 font-medium flex items-center text-sm">
                    <Lock className="w-4 h-4 mr-2 text-gray-500" />
                    Password
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="Enter admin password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-10"
                  />
                </div>
                <Button
                  onClick={handlePasswordLogin}
                  disabled={!formData.mobile || !formData.password || isLoading}
                  className="w-full h-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Signing In...' : 'Access Admin Portal'} 
                  {!isLoading && <Key className="w-4 h-4 ml-2" />}
                </Button>
              </div>
            )}

            {/* OTP Sign-in */}
            {useOTPFlow && (
              <>
                {/* Step 1: Mobile Number */}
                {currentStep === 1 && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="mobile" className="text-gray-700 font-medium flex items-center text-sm">
                        <Phone className="w-4 h-4 mr-2 text-gray-500" />
                        Admin Mobile Number
                      </Label>
                      <Input
                        id="mobile"
                        name="mobile"
                        type="tel"
                        placeholder="9252517941"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        required
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 h-10"
                      />
                    </div>
                    <Button
                      onClick={sendOTP}
                      disabled={!formData.mobile || isLoading}
                      className="w-full h-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoading ? 'Sending OTP...' : 'Send Admin OTP'} 
                      {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
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
                          setOtpSent(false);
                          setError('');
                        }}
                        variant="outline"
                        className="flex-1 h-10 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
                        disabled={isLoading}
                      >
                        <ArrowLeft className="w-4 h-4 mr-2" /> Back
                      </Button>
                      <Button
                        onClick={handleOTPLogin}
                        disabled={formData.otp.length !== 6 || isLoading}
                        className="flex-1 h-10 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                      >
                        {isLoading ? 'Verifying...' : 'Access Portal'} 
                        {!isLoading && <ArrowRight className="w-4 h-4 ml-2" />}
                      </Button>
                    </div>
                    <Button
                      onClick={sendOTP}
                      variant="ghost"
                      className="w-full text-blue-600 hover:text-blue-700 text-sm"
                      disabled={isLoading}
                    >
                      Resend OTP
                    </Button>
                  </div>
                )}
              </>
            )}

            <div className="text-center text-xs pt-2">
              <span className="text-gray-600">Need user access? </span>
              <Link
                href="/auth/sign-in"
                className="text-blue-600 hover:text-blue-700 font-semibold transition-colors"
              >
                User Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}