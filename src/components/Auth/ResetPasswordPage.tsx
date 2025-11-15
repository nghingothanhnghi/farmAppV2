import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import Form, { FormGroup, FormLabel, FormInput, FormCodeInput, FormActions } from '../common/Form';
import { IconCheck, IconX, IconEye, IconEyeOff } from '@tabler/icons-react';
import Button from '../common/Button';
import PageTitle from '../common/PageTitle';
import { useAlert } from '../../contexts/alertContext';
import useToggle from '../../hooks/useToggle';
import { requestResetCode, verifyResetCode, resetPassword } from '../../services/resetPwService';
import { formatTimeCountDown } from '../../utils/formatters';
import { parseApiErrors } from '../../utils/errorUtils';
import { resetPasswordEmailSchema, resetPasswordCodeSchema, resetPasswordNewPasswordSchema, getPasswordChecks } from '../../validation/authValidation';

const ResetPasswordPage: React.FC = () => {
    const navigate = useNavigate();

    const { setAlert } = useAlert();
    const [step, setStep] = useState<'email' | 'verify' | 'reset'>('email');
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
    const [expirationTime, setExpirationTime] = useState<number>(600); // 10 minutes in seconds
    const [newPassword, setNewPassword] = useState('');
    const [passwordChecks, setPasswordChecks] = useState(getPasswordChecks(''));
    const { value: showPassword, toggle: togglePassword } = useToggle();


    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let interval: number;
        if (step === 'verify') {
            interval = setInterval(() => {
                setExpirationTime((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [step]);


    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await resetPasswordEmailSchema.validate({ email });
            await requestResetCode(email);
            setAlert({ type: 'success', message: 'Reset code sent to email' });
            setStep('verify');
        } catch (err: any) {
            const { fieldErrors, message } = parseApiErrors(err);
            setFieldErrors(fieldErrors);
            setAlert({ type: 'error', message });
        } finally {
            setLoading(false);
        }
    };


    const handleResendCode = async () => {
        setLoading(true);
        try {
            await requestResetCode(email);
            setAlert({ type: 'success', message: 'Code resent successfully' });
        } catch (err: any) {
            const { fieldErrors, message } = parseApiErrors(err);
            setFieldErrors(fieldErrors);
            setAlert({ type: 'error', message });
        } finally {
            setLoading(false);
        }
    };


    const handleCodeSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await resetPasswordCodeSchema.validate({ code });
            await verifyResetCode(email, code);
            setAlert({ type: 'success', message: 'Code verified successfully' });
            setStep('reset');
        } catch (err: any) {
            const { fieldErrors, message } = parseApiErrors(err);
            setFieldErrors(fieldErrors);
            setAlert({ type: 'error', message });
        } finally {
            setLoading(false);
        }
    };

    const handleResetSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await resetPasswordNewPasswordSchema.validate({ newPassword });
            await resetPassword(email, newPassword);
            setAlert({ type: 'success', message: 'Password reset successfully' });
            navigate('/login');
        } catch (err: any) {
            const { fieldErrors, message } = parseApiErrors(err);
            setFieldErrors(fieldErrors);
            setAlert({ type: 'error', message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 bg-mesh transition-colors duration-300">
            <div className="w-full max-w-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl rounded-2xl p-6 sm:p-10 transition-colors duration-300">
                <PageTitle
                    title="Reset Password"
                    align="center"
                    justify='center'
                    width="full"
                />
                {step === 'email' && (
                    <Form onSubmit={handleEmailSubmit} className="space-y-10 max-w-xl mx-auto">
                        <FormGroup className='flex flex-col gap-y-6'>
                            <div className='space-y-1 text-center'>
                                <FormLabel htmlFor="email">Enter your email address to receive a 6-digit reset code.</FormLabel>
                                <p className="text-base/6 text-zinc-500 sm:text-sm/6 dark:text-zinc-400">Make sure it's the same email you used to register.</p>
                            </div>
                            <div className='flex flex-col items-center w-full space-y-2'>
                                <FormInput
                                    type="email"
                                    name="email"
                                    id="email"
                                    value={email}
                                    onChange={e => {
                                        setEmail(e.target.value);
                                        setFieldErrors(prev => ({ ...prev, email: '' })); // clear on input
                                    }}
                                    required
                                />
                                {fieldErrors.email && (
                                    <p className="text-red-500 text-xs text-center">{fieldErrors.email}</p>
                                )}
                            </div>
                        </FormGroup>
                        <FormActions className='lg:static fixed bottom-0 left-0 right-0 p-4 lg:pl-4 lg:pr-0 bg-white dark:bg-gray-900 grid grid-cols-1 gap-4'>
                            <Button
                                type="submit"
                                label={loading ? 'Sending...' : 'Send Code'}
                                className='mx-auto'
                                rounded='lg'
                            />
                        </FormActions>
                    </Form>
                )}

                {step === 'verify' && (
                    <Form onSubmit={handleCodeSubmit} className="space-y-10 max-w-xl mx-auto">
                        <FormGroup className='flex flex-col gap-y-6'>
                            <div className='space-y-1 text-center'>
                                <FormLabel htmlFor="code">Please enter the 6-digit code we sent to your email</FormLabel>
                                <p className="text-base/6 text-zinc-500 sm:text-sm/6 dark:text-zinc-400">Only numbers are allowed.</p>
                            </div>
                            <div className='flex justify-center'>
                                <div className='flex flex-col space-y-2'>
                                    <p className="text-sm text-zinc-600 text-center dark:text-zinc-400">
                                        ⏳ This code will expire in <strong className='text-red-500'>{formatTimeCountDown(expirationTime)}</strong>.
                                    </p>
                                    <FormCodeInput
                                        id="code"
                                        value={code}
                                        onChange={setCode}
                                        length={6}
                                        disabled={loading || expirationTime <= 0}
                                    />
                                    <div className='flex align-middle justify-between'>
                                        <span className="text-base/6 text-zinc-500 sm:text-sm/6 dark:text-zinc-400">Don't received code?</span>
                                        <Button
                                            type="button"
                                            variant="link"
                                            label="Resend Code"
                                            onClick={() => handleResendCode()}
                                            disabled={loading || expirationTime <= 0}
                                            rounded='lg'
                                            className='text-gray-500 dark:text-gray-300 underline'
                                        />
                                    </div>
                                </div>
                            </div>
                        </FormGroup>
                        <FormActions className='lg:static fixed bottom-0 left-0 right-0 p-4 lg:pl-4 lg:pr-0 bg-white dark:bg-gray-900 grid grid-cols-1 gap-4'>
                            <Button
                                type="submit"
                                label={loading ? 'Verifying...' : 'Verify Code'}
                                className='mx-auto'
                                rounded='lg'
                            />
                        </FormActions>
                    </Form>
                )}

                {step === 'reset' && (
                    <Form onSubmit={handleResetSubmit} className="space-y-10 max-w-xl mx-auto">
                        <FormGroup className='flex flex-col gap-y-6'>
                            <div className='space-y-1 text-center'>
                                <FormLabel htmlFor="newPassword">Create a New Password</FormLabel>
                                <p className="text-base/6 text-zinc-500 sm:text-sm/6 dark:text-zinc-400">To keep your account secure, please create a new password. Make sure it’s at least 8 characters long and includes a mix of letters, numbers, and symbols.</p>
                            </div>
                            <div>
                                <div className='relative mx-auto max-w-[300px]'>
                                    <FormInput
                                        type={showPassword ? "text" : "password"}
                                        name="newPassword"
                                        id="newPassword"
                                        value={newPassword}
                                        // onChange={e => setNewPassword(e.target.value)}
                                        onChange={(e) => {
                                            const value = e.target.value;
                                            setNewPassword(value);
                                            setPasswordChecks(getPasswordChecks(value));
                                        }}
                                        required
                                    />
                                    <Button
                                        onClick={togglePassword}
                                        variant="link"
                                        icon={showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
                                        iconOnly
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-800"
                                        size='sm'
                                        rounded='full'
                                    />
                                </div>
                                {newPassword && (
                                    <ul className="my-3 space-y-1 text-sm">
                                        {passwordChecks.map((check, index) => (
                                            <li key={index} className="flex items-center gap-2">
                                                {check.valid ? (
                                                    <IconCheck className="text-green-500 w-4 h-4" />
                                                ) : (
                                                    <IconX className="text-gray-400 w-4 h-4" />
                                                )}
                                                <span
                                                    className={check.valid
                                                        ? 'text-green-600 dark:text-green-400'
                                                        : 'text-gray-600 dark:text-gray-400'
                                                    }
                                                >
                                                    {check.label}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>


                        </FormGroup>
                        <FormActions className='lg:static fixed bottom-0 left-0 right-0 p-4 lg:pl-4 lg:pr-0 bg-white dark:bg-gray-900 grid grid-cols-1 gap-4'>
                            <Button
                                type="submit"
                                label={loading ? 'Resetting...' : 'Ok'}
                                className='mx-auto'
                                rounded='lg'
                            />
                        </FormActions>
                    </Form>
                )}
            </div>
        </div>
    );
};

export default ResetPasswordPage;
