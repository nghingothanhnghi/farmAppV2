// src/components/Auth/OAuthButtons.tsx
import React from 'react';
import { IconBrandGoogleFilled, IconBrandFacebookFilled } from '@tabler/icons-react';
import Button from '../common/Button';
import { startOAuthLogin } from '../../utils/oauth';

interface OAuthButtonsProps {
  redirectAfter?: string;
  className?: string;
}

const OAuthButtons: React.FC<OAuthButtonsProps> = ({ redirectAfter, className = '' }) => {
  return (
    <div className={`space-y-3 ${className}`}>
      <div className="relative flex items-center py-1">
        <div className="flex-grow border-t border-gray-200 dark:border-gray-700" />
        <span className="mx-3 text-xs text-gray-400 dark:text-gray-500">
          or continue with
        </span>
        <div className="flex-grow border-t border-gray-200 dark:border-gray-700" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Button
          type="button"
          label="Google"
          variant="outline"
          icon={<IconBrandGoogleFilled size={18} className="text-red-500" />}
          iconPosition="left"
          onClick={() => startOAuthLogin('google', redirectAfter)}
          fullWidth
          rounded="lg"
        />
        <Button
          type="button"
          label="Facebook"
          variant="outline"
          icon={<IconBrandFacebookFilled size={18} className="text-blue-600" />}
          iconPosition="left"
          onClick={() => startOAuthLogin('facebook', redirectAfter)}
          fullWidth
          rounded="lg"
        />
      </div>
    </div>
  );
};

export default OAuthButtons;