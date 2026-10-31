import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import Form, { FormGroup, FormCodeInput, FormActions, FloatingLabelInput } from '../common/Form';
import { IconCheck, IconX, IconEye, IconEyeOff, IconMail, IconArrowLeft } from '@tabler/icons-react';
import Button from '../common/Button';
import PageTitle from '../common/PageTitle';
import { useAlert } from '../../contexts/alertContext';
import useToggle from '../../hooks/useToggle';
import { requestResetCode, verifyResetCode, resetPassword } from '../../services/resetPwService';
import { formatTimeCountDown } from '../../utils/formatters';
import { parseApiErrors } from '../../utils/errorUtils';
import { resetPasswordEmailSchema, resetPasswordCodeSchema, resetPasswordNewPasswordSchema, getPasswordChecks } from '../../validation/authValidation';

const ResetPasswordPage: React.FC = () => {
    const { t } = useTranslation();
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

    const handleBack = () => {
        if (loading) return;

        if (step === 'reset') {
            setStep('verify');
            setNewPassword('');
            setPasswordChecks(getPasswordChecks(''));
            setFieldErrors({});
            return;
        }

        if (step === 'verify') {
            setStep('email');
            setCode('');
            setExpirationTime(600);
            setFieldErrors({});
            return;
        }

        navigate(-1);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 bg-mesh transition-colors duration-300">
            <div className="
            w-full max-w-xl 
            border border-white/60 dark:border-white/10
            bg-gradient-to-br from-white/90 via-blue-50/80 to-indigo-100/70
          dark:from-gray-900/95 dark:via-slate-900/95 dark:to-indigo-950/80
            shadow-xl shadow-indigo-900/5 dark:shadow-black/20
            backdrop-blur-xl 
            rounded-2xl 
            p-6 sm:p-10 
            transition-colors duration-300
            "
            >
                <div className="mb-4 flex justify-start">
                    <Button
                        type="button"
                        variant="link"
                        label={t('btn.back')}
                        icon={<IconArrowLeft size={18} />}
                        onClick={handleBack}
                        disabled={loading}
                        rounded="lg"
                        className="text-gray-600 dark:text-gray-300"
                    />
                </div>

                <PageTitle
                    title={t("page_title.reset_password")}
                    align="center"
                    justify='center'
                    width="full"
                />
                {step === 'email' && (
                    <Form onSubmit={handleEmailSubmit} className="space-y-10 w-full max-w-full sm:max-w-[380px] mx-auto">
                        <FormGroup className='flex flex-col gap-y-6'>
                            <div className='space-y-1 text-center'>
                                <p className="text-base/6 sm:text-sm/6 text-zinc-600 dark:text-zinc-400">{t('input.email.helper_email_reset_new_password_verify')}</p>
                            </div>
                            <div className='flex flex-col items-center w-full space-y-2'>
                                <FloatingLabelInput
                                    id="email"
                                    name="email"
                                    label="Email"
                                    type="email"
                                    value={email}
                                    placeholder={t('input.email.placeholder')}
                                    onChange={e => {
                                        setEmail(e.target.value);
                                        setFieldErrors(prev => ({ ...prev, email: '' })); // clear on input
                                    }}
                                    required
                                    icon={<IconMail size={18} />}
                                    iconPosition="left"
                                    alwaysFloat
                                />
                                {fieldErrors.email && (
                                    <p className="text-red-500 text-xs">{fieldErrors.email}</p>
                                )}
                            </div>
                        </FormGroup>
                        <FormActions className='grid grid-cols-1 gap-4'>
                            <Button
                                type="submit"
                                label={loading ? 'Sending...' : 'Send Code'}
                                className='!w-full lg:!w-auto lg:min-w-[150px] lg:mx-auto'
                                rounded='lg'
                                size='lg'
                            />
                        </FormActions>
                    </Form>
                )}
                {step === 'verify' && (
                    <Form onSubmit={handleCodeSubmit} className="space-y-10 w-full max-w-full sm:max-w-[380px] mx-auto">
                        <FormGroup className='flex flex-col gap-y-6'>
                            <div className='space-y-1 text-center'>
                                <p className="text-base/6  sm:text-sm/6 text-zinc-600 dark:text-zinc-400">{t('input.digit_code.helper')}</p>
                            </div>
                            <div className='flex justify-center'>
                                <div className='flex flex-col space-y-2'>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-500 text-center">
                                        ⏳ {t('input.digit_code.helper_expired_code')} <strong className='text-red-500'>{formatTimeCountDown(expirationTime)}</strong>.
                                    </p>
                                    <FormCodeInput
                                        id="code"
                                        value={code}
                                        onChange={setCode}
                                        length={6}
                                        disabled={loading || expirationTime <= 0}
                                    />
                                    <div className='flex align-middle justify-between'>
                                        <span className="text-base/6 text-zinc-500 dark:text-zinc-500 sm:text-sm/6">{t('input.digit_code.helper_dont_received_code')}</span>
                                        <Button
                                            type="button"
                                            variant="link"
                                            label={t('btn.resend_code')}
                                            onClick={() => handleResendCode()}
                                            disabled={loading || expirationTime <= 0}
                                            rounded='lg'
                                            className='text-gray-500 dark:text-gray-300 underline'
                                        />
                                    </div>
                                </div>
                            </div>
                        </FormGroup>
                        <FormActions className='grid grid-cols-1 gap-4'>
                            <Button
                                type="submit"
                                label={loading ? 'Verifying...' : t('btn.verify_code')}
                                className='!w-full lg:!w-auto lg:min-w-[150px] lg:mx-auto'
                                rounded='lg'
                                size='lg'
                            />
                        </FormActions>
                    </Form>
                )}

                {step === 'reset' && (
                    <Form onSubmit={handleResetSubmit} className="space-y-10 w-full max-w-full sm:max-w-[380px] mx-auto">
                        <FormGroup className='flex flex-col gap-y-6'>
                            <div className='space-y-1 text-center'>
                                <p className="text-base/6 sm:text-sm/6 text-zinc-600 dark:text-zinc-400">{t('input.new_password.helper')}</p>
                            </div>
                            <div>
                                <div className='relative'>
                                    <FloatingLabelInput
                                        name="newPassword"
                                        id="newPassword"
                                        type={showPassword ? 'text' : 'password'}
                                        label={t('input.new_password.label')}
                                        value={newPassword}
                                        placeholder={t('input.new_password.placeholder')}
                                        alwaysFloat
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
                        <FormActions className='grid grid-cols-1 gap-4'>
                            <Button
                                type="submit"
                                label={loading ? 'Resetting...' : 'Ok'}
                                className='!w-full lg:!w-auto lg:min-w-[150px] lg:mx-auto'
                                rounded='lg'
                                size='lg'
                            />
                        </FormActions>
                    </Form>
                )}
            </div>
        </div>
    );
};

export default ResetPasswordPage;
