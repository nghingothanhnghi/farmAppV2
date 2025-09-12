// components/Migration/components/TemplateCard.tsx
import React from 'react';
import type { Template } from '../../../models/types/Template';

interface TemplateCardProps {
  template: Template;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template }) => {
  return (
    <div className="border p-3 rounded bg-gray-50 dark:bg-gray-800/80 dark:border-gray-700">
      <div className='dark:text-gray-300'><strong>Client ID:</strong> {template.client_id}</div>
      <div className='text-xs dark:text-gray-400'><strong>Created:</strong> {new Date(template.created_at).toLocaleString()}</div>
      <pre className="bg-white dark:bg-gray-900 mt-2 p-2 rounded text-sm overflow-auto">
        {JSON.stringify(template.mapping, null, 2)}
      </pre>
    </div>
  );
};

export default TemplateCard;
