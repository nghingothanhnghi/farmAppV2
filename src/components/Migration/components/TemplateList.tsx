import React from 'react';
import type { Template } from '../../../models/types/Template';
import TemplateCard from './TemplateCard';

interface TemplateListProps {
  templates?: Template[]; // Make it optional
}

const TemplateList: React.FC<TemplateListProps> = ({ templates = [] }) => {
  console.log("TemplateList props:", templates);

  return (
    // <div className="space-y-4">
    //   <h2 className="text-lg font-bold">All Templates</h2>
    //   {templates.length === 0 ? (
    //     <p className="text-gray-500">No templates available.</p>
    //   ) : (
    //     <ul className="space-y-2">
    //       {templates.map((template) => (
    //         <li key={template.id} className="border p-3 rounded bg-gray-50">
    //           <div><strong>Client ID:</strong> {template.client_id}</div>
    //           <div><strong>Created:</strong> {new Date(template.created_at).toLocaleString()}</div>
    //           <pre className="bg-white mt-2 p-2 rounded text-sm overflow-auto">
    //             {JSON.stringify(template.mapping, null, 2)}
    //           </pre>
    //         </li>
    //       ))}
    //     </ul>
    //   )}
    // </div>

    <div className="space-y-4">
      <h2 className="text-lg font-bold">All Templates</h2>
      {templates.length === 0 ? (
        <p className="text-gray-500">No templates available.</p>
      ) : (
        <ul className="space-y-2">
          {templates.map((t) => (
            <li key={t.id}>
              <TemplateCard template={t} />
            </li>
          ))}
        </ul>
      )}
    </div>

  );
};

export default TemplateList;
