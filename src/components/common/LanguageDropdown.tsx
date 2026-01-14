import { useTranslation } from 'react-i18next';
import i18n from 'i18next';
import DropdownButton from './DropdownButton';

export function LanguageDropdown() {
  const { t } = useTranslation();

  const items = [
    {
      value: 'vi',
      label: t('language.vi'),
    },
    {
      value: 'en',
      label: t('language.en'),
    },
  ];

  return (
    <DropdownButton
      label={t('language.vi')}
      items={items}
      onSelect={(item) => i18n.changeLanguage(item.value)}
    />
  );
}
