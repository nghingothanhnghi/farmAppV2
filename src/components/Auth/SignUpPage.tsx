import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import Form, { FormGroup, FormLabel, FormInput, FormActions } from '../common/Form';
import * as Yup from 'yup';
import { registerSchema } from '../../validation/authValidation';
import { createUser } from '../../services/userService';
import { useAlert } from '../../contexts/alertContext';
import Button from '../common/Button';
import PageTitle from '../common/PageTitle';

const SignUpPage: React.FC = () => {
    const { setAlert } = useAlert();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        client_id: '',
        phone_number: '',
        first_name: '',
        last_name: '',
    });

    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState(false);

    const fields: [name: string, label: string, type: string, required: boolean][] = [
        ['username', 'Username', 'text', true],
        ['password', 'Password', 'password', true],
        ['email', 'Email', 'email', true],
        ['client_id', 'Client ID', 'text', false],
        ['phone_number', 'Phone Number', 'text', false],
        ['first_name', 'First Name', 'text', false],
        ['last_name', 'Last Name', 'text', false],
    ];


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await registerSchema.validate(formData, { abortEarly: false });
            setFieldErrors({});
            await createUser(formData);
            setAlert({
                message: 'User created successfully!',
                type: 'success',
            });
            navigate('/'); // Redirect after success
        } catch (err: any) {
            if (err instanceof Yup.ValidationError) {
                const errors: { [key: string]: string } = {};
                err.inner.forEach((validationError) => {
                    if (validationError.path) {
                        errors[validationError.path] = validationError.message;
                    }
                });
                setFieldErrors(errors);
            } else {
                setAlert({
                    message: err?.response?.data?.detail || 'Something went wrong',
                    type: 'error',
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 bg-mesh transition-colors duration-300">
            <div className="w-full max-w-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-xl rounded-2xl p-6 sm:p-10 transition-colors duration-300">
                <PageTitle
                    title="Create New User"
                />
                <Form onSubmit={handleSubmit} className="max-w-xl mx-auto">
                    {fields.map(([name, label, type, required]) => (
                        <FormGroup key={name} className='grid gap-x-8 gap-y-6 sm:gap-y-6 sm:grid-cols-2'>
                            <div className='space-y-1'>
                                <FormLabel htmlFor={name} className="text-gray-700 dark:text-gray-300">{label}</FormLabel>
                            </div>
                            <div>
                                <FormInput
                                    id={name}
                                    name={name}
                                    type={type}
                                    value={formData[name as keyof typeof formData]}
                                    onChange={handleChange}
                                    required={required}
                                />
                                {fieldErrors[name] && (
                                    <p className="text-red-500 text-xs mt-1">{fieldErrors[name]}</p>
                                )}
                            </div>
                        </FormGroup>
                    ))}
                    <hr role="presentation" className="my-10 w-full border-t border-zinc-950/5 dark:border-white/5"></hr>
                    <FormActions className='lg:static fixed bottom-0 left-0 right-0 p-4 lg:pl-4 lg:pr-0 bg-white dark:bg-gray-900 grid grid-cols-1 md:grid-cols-2 gap-4'>
                        <Button
                            type="submit"
                            label={loading ? 'Creating...' : 'Create User'}
                            disabled={loading}
                            variant="primary"
                            className="md:w-auto"
                            fullWidth={true}
                            rounded='lg'
                        />
                    </FormActions>
                </Form>
            </div>
        </div>
    );
};

export default SignUpPage;
