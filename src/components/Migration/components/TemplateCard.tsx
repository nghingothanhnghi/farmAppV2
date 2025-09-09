// components/Migration/components/TemplateCard.tsx
import React from 'react';
import type { Template } from '../../../models/types/Template';

interface TemplateCardProps {
  template: Template;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template }) => {
  return (
    <div className="border p-3 rounded bg-gray-50">
      <div><strong>Client ID:</strong> {template.client_id}</div>
      <div><strong>Created:</strong> {new Date(template.created_at).toLocaleString()}</div>
      <pre className="bg-white mt-2 p-2 rounded text-sm overflow-auto">
        {JSON.stringify(template.mapping, null, 2)}
      </pre>
    </div>
  );
};

export default TemplateCard;
