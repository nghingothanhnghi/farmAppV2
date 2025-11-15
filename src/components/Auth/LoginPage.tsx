// Example: LoginPage.tsx
import React, { useState, useEffect } from 'react';
import * as Yup from 'yup';
import { Link, useNavigate } from 'react-router';
import Form, { FormGroup, FormLabel, FormInput, FormActions } from '../common/Form';
import { IconEye, IconEyeOff } from '@tabler/icons-react';
import LinearProgress from '../common/LinearProgress';
import Button from '../common/Button';
import PageTitle from '../common/PageTitle';
import { loginSchema } from '../../validation/authValidation';
import { useAuth } from '../../contexts/authContext';
import { useAlert } from '../../contexts/alertContext';
import useToggle from '../../hooks/useToggle';

const LoginPage: React.FC = () => {
  const { setAlert } = useAlert();
  const { login, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ username?: string; password?: string }>({});
  const { value: showPassword, toggle: togglePassword } = useToggle();

    // 🚀 Redirect when logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard/products");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate fields using Yup
    try {
      await loginSchema.validate({ username, password }, { abortEarly: false });
      setFieldErrors({});
    } catch (err: unknown) {
      if (err instanceof Yup.ValidationError) {
        const errors: typeof fieldErrors = {};
        err.inner.forEach((validationError) => {
          if (validationError.path) {
            errors[validationError.path as keyof typeof errors] = validationError.message;
          }
        });
        setFieldErrors(errors);
        return;
      }
    }

    try {
      await login(username, password);
      setAlert({
        message: 'Login successful!',
        type: 'success',
      });
    } catch (err: any) {
      // Replace setError with global alert
      setAlert({
        message: err?.response?.data?.detail || 'Invalid credentials',
        type: 'error',
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 bg-mesh transition-colors duration-300">
      <div className="w-full max-w-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl rounded-2xl p-6 sm:p-10 transition-colors duration-300">
        <PageTitle
          title="Login"
        />
        <Form onSubmit={handleSubmit} className="sm:w-1/2 w-full mx-auto space-y-6">
          {loading &&
            <LinearProgress
              position='absolute'
              thickness="h-1"
              duration={3000}
            />}
          <div className='flex flex-col gap-y-6'>
            <div className='space-y-1 text-center'>
              <FormLabel htmlFor="code">Good to See You Again!</FormLabel>
              <p className="text-base/6 text-zinc-500 sm:text-sm/6 dark:text-zinc-400">We won’t judge 😬</p>
            </div>
            <div className='space-y-4'>
              <FormGroup className='flex flex-col space-y-2'>
                <FormInput
                  id="username"
                  name="username"
                  type="text"
                  value={username}
                  placeholder="Username"
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
                {fieldErrors.username && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.username}</p>
                )}
              </FormGroup>
              <FormGroup className='flex flex-col space-y-2'>
                <div className='relative'>
                  <FormInput
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    placeholder="Password"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <Button
                    onClick={togglePassword}
                    variant="link"
                    icon={showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                    iconOnly
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-800"
                    rounded='full'
                  />
                </div>
                {fieldErrors.password && (
                  <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>
                )}
              </FormGroup>
              <div className="text-right">
                <Link
                  to="/reset-password"
                  className="text-sm text-gray-500 dark:text-gray-300 underline"
                >
                  Forgot Password?
                </Link>
              </div>
            </div>
          </div>
          <FormActions className="space-y-3 flex flex-col">
            <Button
              type="submit"
              label={loading ? 'Logging in...' : 'Login'}
              onClick={() => { }}
              variant="primary"
              disabled={loading}
              fullWidth
              rounded='lg'
            />
            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-5">
              Don’t have an account?{' '}
              <Link
                to="/sign-up"
                className="text-gray-500 dark:text-gray-300 underline"

              >
                Sign up
              </Link>
            </p>
          </FormActions>
        </Form>
      </div>
    </div>

  );
};

export default LoginPage;
