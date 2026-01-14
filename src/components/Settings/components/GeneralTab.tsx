// src/components/Settings/components/GeneralTab.tsx

import React from 'react';
import { FormGroup, FormLabel } from '../../common/Form';
import { useTranslation } from 'react-i18next';
import DropdownButton from '../../common/DropdownButton';
import { useTheme } from "../../../hooks/useTheme";
import { useLanguage } from '../../../hooks/useLanguage';

const GeneralTab: React.FC = () => {
    const { t } = useTranslation();
    const { language, changeLanguage } = useLanguage()
    const { theme, setTheme } = useTheme();

    const languageItems = [
        { label: t('language.english'), value: 'en' },
        { label: t('language.vietnamese'), value: 'vi' },
    ];

    const themeItems = [
        { label: 'Light', value: 'light' },
        { label: 'Dark', value: 'dark' },
        { label: 'System Default', value: 'system' },
    ];
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold mb-7">General Settings</h3>
            <FormGroup className='grid gap-x-8 gap-y-6 sm:grid-cols-2'>
                <div className='space-y-1'>
                    <FormLabel htmlFor="language">{t('language.label')}</FormLabel>
                    <p className="text-base/6 text-zinc-500 sm:text-sm/6 dark:text-zinc-400"></p>
                </div>
                <div>
                    <DropdownButton
                        label={languageItems.find((item) => item.value === language)?.label || t('select')}
                        items={languageItems}
                        onSelect={(item) => changeLanguage(item.value)}
                        size="sm"
                        className=" md:w-auto bg-transparent"
                    />
                </div>
            </FormGroup>
            <hr role="presentation" className="my-5 w-full border-t border-zinc-950/5 dark:border-white/5"></hr>
            <FormGroup className='grid gap-x-8 gap-y-6 sm:grid-cols-2'>
                <div className='space-y-1'>
                    <FormLabel htmlFor="theme">Theme</FormLabel>
                    <p className="text-base/6 text-zinc-500 sm:text-sm/6 dark:text-zinc-400"></p>
                </div>
                <div>
                    <DropdownButton
                        label={themeItems.find((item) => item.value === theme)?.label || 'Select'}
                        items={themeItems}
                        onSelect={(item) => setTheme(item.value as "light" | "dark" | "system")}
                        size="sm"
                        className=" md:w-auto bg-transparent"
                    />
                </div>
            </FormGroup>
        </div>
    );
};

export default GeneralTab;
