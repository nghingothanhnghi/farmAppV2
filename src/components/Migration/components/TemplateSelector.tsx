import React, { useEffect, useState } from 'react';
import { getTemplateByClientId } from '../../../services/templateService';
import type { Template } from '../../../models/types/Template';
import DropdownButton from '../../common/DropdownButton';
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
        <label className="block mb-1 font-medium">Select Client ID</label>
        <DropdownButton
          label={selectedClientId || 'All Clients'}
          items={clientIds}
          onSelect={handleClientSelect}
          className="w-[250px]"
        />
      </div>

    {visibleTemplates.length > 0 ? (
        visibleTemplates.map((template) => (
          <div key={template.id} className="border rounded p-3 bg-gray-50">
            <h3 className="font-semibold text-gray-800 mb-2">
              Template for <span className="text-blue-600">{template.client_id}</span>
            </h3>
            <pre className="bg-white p-3 rounded text-sm overflow-auto max-h-[400px] border">
              {JSON.stringify(template.mapping, null, 2)}
            </pre>
          </div>
        ))
      ) : (
        <p className="text-gray-500">No templates available.</p>
      )}
    </div>
  );
};

export default TemplateSelector;
