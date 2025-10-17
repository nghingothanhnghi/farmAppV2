import React from 'react';
import ListLink from '../../common/ListLink';
import DropdownButton from '../../common/DropdownButton';
import { IconMinus } from '@tabler/icons-react';

interface Props {
    availableModels: string[];
    selectedModel: string;
    onSelect: (model: string) => void;
    onDeleteRequest: (model: string) => void;
}

const ModelSelector: React.FC<Props> = ({ availableModels, selectedModel, onSelect, onDeleteRequest }) => {
    const items = availableModels.map((model) => ({
        label: model,
        value: model,
        icon: <span className="w-2.5 h-2.5 rounded-full bg-blue-500 inline-block mr-2" />,
    }));

    return (
        <div className="model-selector p-4 rounded-lg space-y-2 bg-white shadow border border-gray-100 dark:border-white/5 bg-gradient-to-b from-white to-zinc-50 dark:from-gray-900 dark:to-gray-800 dark:shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
            <div className='flex items-center justify-between'>
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-100 line-clamp-1">Available Models</h3>
                {availableModels.length > 0 && (
                    <DropdownButton
                        label={
                            <span className="flex items-center gap-2">
                                <span className="text-sm font-medium">{selectedModel || 'Select model'}</span>
                            </span>
                        }
                        items={items}
                        onSelect={(item) => onSelect(item.value)}
                        direction="bottom"
                        variant="secondary"
                        size="xs"
                        showArrow={true}
                    />
                )}
            </div>

            {availableModels.map((model) => (
                <div key={model} className="flex flex-col items-center justify-between">
                    <ListLink
                        to="#"
                        label={model}
                        icon={<span className="w-4 h-4 rounded-full bg-blue-500" />}
                        active={selectedModel === model}
                        onClick={() => onSelect(model)}
                    />
                    {model !== 'default' && (
                        <button onClick={() => onDeleteRequest(model)} className="text-red-500 hover:text-red-700 ml-2">
                            <IconMinus size={18} />
                        </button>
                    )}
                </div>
            ))}

        </div>
    )
};

export default ModelSelector;
