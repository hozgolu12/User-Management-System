import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';

const Signup: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'user' as 'user' | 'admin',
    isSuperAdmin: false,
  });
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifyingEmail, setVerifyingEmail] = useState(false);
  const navigate = useNavigate();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      const { exists } = await apiService.checkEmailExists(email);
      return exists;
    } catch (error) {
      console.error('Error checking email existence:', error);
      return false;
    }
  };

  const handleEmailChange = (email: string) => {
    setFormData(prev => ({ ...prev, email }));
    setEmailVerificationSent(false);
    setEmailVerified(false);
    setVerificationCode('');
    
    if (email && !validateEmail(email)) {
      setEmailError('Please enter a valid email address (e.g., user@gmail.com)');
    } else {
      setEmailError('');
      // Check if this is the super admin email
      if (email === import.meta.env.VITE_SUPER_ADMIN_EMAIL) {
        setFormData(prev => ({ ...prev, isSuperAdmin: true }));
      } else {
        setFormData(prev => ({ ...prev, isSuperAdmin: false }));
      }
    }
  };

  const handleSendVerification = async () => {
    if (!validateEmail(formData.email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    setVerifyingEmail(true);
    try {
      // First check if email already exists
      const emailExists = await checkEmailExists(formData.email);
      
      if (emailExists) {
        setEmailError('This email is already registered. Please use a different email or try signing in.');
        toast({
          title: "Email already exists",
          description: "This email is already registered. Please use a different email or try signing in.",
          variant: "destructive",
        });
        return;
      }

      // If email doesn't exist, proceed with verification
      await apiService.sendEmailVerification(formData.email);
      setEmailVerificationSent(true);
      toast({
        title: "Verification email sent",
        description: "Please check your email for the verification code.",
      });
    } catch (error) {
      console.error('Email verification error:', error);
      toast({
        title: "Failed to send verification email",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setVerifyingEmail(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!verificationCode.trim()) {
      toast({
        title: "Verification code required",
        description: "Please enter the verification code",
        variant: "destructive",
      });
      return;
    }

    setVerifyingEmail(true);
    try {
      // Check if email exists before verifying
      const emailExists = await checkEmailExists(formData.email);
      
      if (emailExists) {
        setEmailError('This email is already registered. Please use a different email or try signing in.');
        toast({
          title: "Email already exists",
          description: "This email is already registered while you were verifying. Please use a different email or try signing in.",
          variant: "destructive",
        });
        // Reset verification state
        setEmailVerificationSent(false);
        setEmailVerified(false);
        setVerificationCode('');
        return;
      }

      await apiService.verifyEmail(formData.email, verificationCode);
      setEmailVerified(true);
      toast({
        title: "Email verified successfully",
        description: "You can now proceed with registration.",
      });
    } catch (error) {
      toast({
        title: "Invalid verification code",
        description: "Please check the code and try again",
        variant: "destructive",
      });
    } finally {
      setVerifyingEmail(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEmail(formData.email)) {
      setEmailError('Please enter a valid email address');
      return;
    }

    if (!emailVerified) {
      toast({
        title: "Email verification required",
        description: "Please verify your email before proceeding",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Final check before registration
      const emailExists = await checkEmailExists(formData.email);
      
      if (emailExists) {
        setEmailError('This email is already registered. Please use a different email or try signing in.');
        toast({
          title: "Email already exists",
          description: "This email is already registered. Please use a different email or try signing in.",
          variant: "destructive",
        });
        // Reset verification state
        setEmailVerificationSent(false);
        setEmailVerified(false);
        setVerificationCode('');
        return;
      }
      
      await apiService.signup(formData);
      toast({
        title: "Registration successful",
        description: formData.role === 'admin' && !formData.isSuperAdmin
          ? "Your admin request has been sent for approval. You'll receive an email once approved."
          : "You can now sign in with your credentials.",
      });
      navigate('/login');
    } catch (error) {
      toast({
        title: "Registration failed",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
                className="mt-1"
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email address</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleEmailChange(e.target.value)}
                  required
                  className={`flex-1 ${emailError ? 'border-red-500' : ''}`}
                  placeholder="e.g., user@gmail.com"
                  disabled={emailVerified}
                />
                {!emailVerified && (
                  <Button
                    type="button"
                    onClick={handleSendVerification}
                    disabled={!formData.email || !!emailError || verifyingEmail || emailVerificationSent}
                    variant="outline"
                    className="whitespace-nowrap"
                  >
                    {verifyingEmail ? 'Checking...' : emailVerificationSent ? 'Sent' : 'Verify'}
                  </Button>
                )}
                {emailVerified && (
                  <div className="flex items-center px-3">
                    <span className="text-green-600 text-sm">✓ Verified</span>
                  </div>
                )}
              </div>
              {emailError && (
                <p className="text-red-500 text-sm mt-1">{emailError}</p>
              )}
            </div>

            {emailVerificationSent && !emailVerified && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <Label htmlFor="verificationCode">Verification Code</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="verificationCode"
                    type="text"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    className="flex-1"
                    maxLength={6}
                  />
                  <Button
                    type="button"
                    onClick={handleVerifyEmail}
                    disabled={!verificationCode.trim() || verifyingEmail}
                    variant="outline"
                  >
                    {verifyingEmail ? 'Verifying...' : 'Verify'}
                  </Button>
                </div>
                <p className="text-blue-600 text-sm mt-1">
                  Check your email for the verification code
                </p>
                <Button
                  type="button"
                  onClick={handleSendVerification}
                  disabled={verifyingEmail}
                  variant="link"
                  className="p-0 h-auto text-sm"
                >
                  Resend verification code
                </Button>
              </div>
            )}

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="role">Role</Label>
              <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full"
              disabled={loading || !!emailError || !emailVerified}
            >
              {loading ? 'Creating account...' : 'Sign up'}
            </Button>
          </div>

          <div className="text-center">
            <Link to="/login" className="text-blue-600 hover:text-blue-500">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Signup;
