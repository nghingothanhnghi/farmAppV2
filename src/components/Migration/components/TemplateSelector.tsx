import React, { useEffect, useState } from 'react';
import { getTemplateByClientId } from '../../../services/templateService';
import type { Template } from '../../../models/types/Template';
import DropdownButton from '../../common/DropdownButton';
import TemplateCard from './TemplateCard';
import { useAlert } from '../../../contexts/alertContext';

interface DropdownItem {
  label: React.ReactNode;
  value: string;
}

interface TemplateSelectorProps {
  templates: Template[];
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ templates }) => {
  const { setAlert } = useAlert();
  const [clientIds, setClientIds] = useState<DropdownItem[]>([]);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [visibleTemplates, setVisibleTemplates] = useState<Template[]>([]);

  useEffect(() => {
    const uniqueClientIds = Array.from(
      new Set(templates.map((t) => t.client_id))
    );

    const dropdownItems: DropdownItem[] = [
      { label: 'All Clients', value: '' },
      ...uniqueClientIds.map((id) => ({ label: id, value: id })),
    ];

    setClientIds(dropdownItems);
    setVisibleTemplates(templates);
  }, [templates]);

  const handleClientSelect = async (item: DropdownItem) => {
    setSelectedClientId(item.value);

    if (!item.value) {
      setVisibleTemplates(templates);
      return;
    }

    try {
      const template = await getTemplateByClientId(item.value);
      setVisibleTemplates([template]);
    } catch (err) {
      console.error(err);
      setVisibleTemplates([]);
      setAlert({ type: 'error', message: `No template found for "${item.value}".` });
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <DropdownButton
          label={selectedClientId || 'All Clients'}
          items={clientIds}
          onSelect={handleClientSelect}
          className="w-[200px] bg-transparent"
        />
      </div>

      {visibleTemplates.length > 0 ? (
        visibleTemplates.map((t) => <TemplateCard key={t.id} template={t} />)
      ) : (
        <p className="text-gray-500">No templates available.</p>
      )}

    </div>
  );
};

export default TemplateSelector;
