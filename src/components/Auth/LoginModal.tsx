// components/auth/LoginModal.tsx
import React, { useState } from 'react';
import Modal from '../common/Modal';
import * as Yup from 'yup';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/authContext';
import { useAlert } from '../../contexts/alertContext';
import useToggle from '../../hooks/useToggle';
import Form, { FormGroup, FormInput, FloatingLabelInput } from '../common/Form';
import LinearProgress from '../common/LinearProgress';
import Button from '../common/Button';
import { loginSchema } from '../../validation/authValidation';
import { IconEye, IconEyeOff } from '@tabler/icons-react';
import OAuthButtons from './OAuthButtons';

const LoginModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const { setAlert } = useAlert();
    const { login, loading } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [fieldErrors, setFieldErrors] = useState<{ username?: string; password?: string }>({});
    const { value: showPassword, toggle: togglePassword } = useToggle();

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
            onClose(); // Close on successful login
        } catch (err: any) {
            // Replace setError with global alert
            setAlert({
                message: err?.response?.data?.detail || 'Invalid credentials',
                type: 'error',
            });
        }
    };

    return (
        <Modal
            size="xsmall"
            isOpen={isOpen}
            onClose={onClose}
            title={
                <>
                    <h2 className="text-lg font-semibold">{t('page_title.login')}</h2>
                    {loading && (
                        <LinearProgress
                            position="absolute"
                            thickness="h-1"
                            duration={3000}
                        />
                    )}
                </>
            }
            content={
                <Form onSubmit={handleSubmit} className="space-y-4 py-4 px-10 relative">
                    <FormGroup>
                        <FloatingLabelInput
                            id="username"
                            name="username"
                            type="text"
                            label={t('input.username.label')}
                            value={username}
                            placeholder={t('input.username.placeholder')}
                            alwaysFloat
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />

                        {fieldErrors.username && (
                            <p className="text-red-500 text-xs mt-1">{fieldErrors.username}</p>
                        )}
                    </FormGroup>
                    <FormGroup>
                        <div className='relative'>
                            <FloatingLabelInput
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                label={t('input.password.label')}
                                value={password}
                                placeholder={t('input.password.placeholder')}
                                alwaysFloat
                                onChange={(e) => setPassword(e.target.value)}
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
                        {fieldErrors.password && (
                            <p className="text-red-500 text-xs mt-1">{fieldErrors.password}</p>
                        )}
                    </FormGroup>
                    <div className="text-right">
                        <Link
                            to="/reset-password"
                            className="text-sm text-gray-500 dark:text-gray-300 underline"
                            onClick={onClose}
                        >
                            {t('auth_body.forgot_password')}
                        </Link>
                    </div>
                </Form>
            }
            actions={
                <div className="space-y-3 w-full">
                    <Button
                        type="button"
                        label={loading ? 'Logging in...' : t('btn.login')}
                        onClick={() => handleSubmit(new Event('submit') as unknown as React.FormEvent)}
                        variant="primary"
                        disabled={loading}
                        fullWidth
                        rounded='lg'
                    />

                    <OAuthButtons />

                    <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-5">
                        {t('auth_body.dont_have_an_account')} {''}
                        <Link
                            to="/sign-up"
                            className="text-gray-500 dark:text-gray-300 underline"
                            onClick={onClose}
                        >
                            {t('btn.sign_up')}
                        </Link>
                    </p>
                </div>
            }
        />
    );
};

export default LoginModal;
