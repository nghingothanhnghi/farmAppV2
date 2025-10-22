// validations/authValidation.ts
import * as Yup from 'yup';

export const loginSchema = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  password: Yup.string().required('Password is required'),
});


export const registerSchema = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  password: Yup.string().required('Password is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  // client_id: Yup.string().required('Client ID is required'),
  phone_number: Yup.string().required('Phone number is required'),
  first_name: Yup.string().required('First name is required'),
  last_name: Yup.string().required('Last name is required'),
});


export const resetPasswordSchema = Yup.object().shape({
  email: Yup.string()
    .email('Invalid email address')
    .required('Email is required'),
  code: Yup.string()
    .matches(/^\d{6}$/, 'Code must be 6 digits')
    .required('Verification code is required'),
  newPassword: Yup.string()
    .required('Password is required')
    .min(8, 'Password must be at least 8 characters')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/\d/, 'Password must contain at least one number')
    .matches(
      /[@$!%*?&#^(){}[\]<>~]/,
      'Password must contain at least one special character'
    ),
});

// ✅ Helper for live password validation checks (used in forms)
export const getPasswordChecks = (password: string) => [
  {
    label: 'At least 8 characters',
    valid: password.length >= 8,
  },
  {
    label: 'At least one lowercase letter',
    valid: /[a-z]/.test(password),
  },
  {
    label: 'At least one uppercase letter',
    valid: /[A-Z]/.test(password),
  },
  {
    label: 'At least one number',
    valid: /\d/.test(password),
  },
  {
    label: 'At least one special character (@$!%*?&#^(){}[]<>~)',
    valid: /[@$!%*?&#^(){}\[\]<>~]/.test(password),
  },
];


export const resetPasswordEmailSchema = resetPasswordSchema.pick(['email']);
export const resetPasswordCodeSchema = resetPasswordSchema.pick(['code']);
export const resetPasswordNewPasswordSchema = resetPasswordSchema.pick(['newPassword']);