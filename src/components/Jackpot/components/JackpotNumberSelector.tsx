import React from 'react';
import Button from '../../common/Button';
import Badge from '../../common/Badge';

interface Props {
    numbers: number[];
    setNumbers: React.Dispatch<React.SetStateAction<number[]>>;
    numberRange: number[];
    requiredNumbers: number;
}

const JackpotNumberSelector: React.FC<Props> = ({
    numbers,
    setNumbers,
    numberRange,
    requiredNumbers,
}) => {

    const handleSelect = (num: number) => {
        setNumbers(prev =>
            prev.length < requiredNumbers
                ? [...prev, num] // ✅ allow duplicates
                : prev
        );
    };

    const handleRemove = (index: number) => {
        setNumbers(prev => prev.filter((_, i) => i !== index));
    };
    return (
        <>
            <div className='flex justify-between mb-2'>
                <p className="text-sm text-gray-600 mb-2">
                    Đã chọn: {numbers.length}/{requiredNumbers} số
                </p>
                {/* ✅ Show selected numbers */}
                {numbers.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                        {numbers.map((num, index) => (
                            <button
                                key={index}
                                onClick={() => handleRemove(index)}
                                className="px-2 py-1 text-sm rounded-md bg-blue-500 text-white hover:bg-blue-600 transition"
                            >
                                {num.toString().padStart(2, '0')} ✕
                            </button>
                        ))}
                    </div>
                )}
            </div>
            <div className="grid grid-cols-10 gap-2 mb-4">
                {numberRange.map(num => {
                    const selected = numbers.includes(num);
                    return (
                        <Button
                            key={num}
                            label={num.toString().padStart(2, '0')}
                            size="xs"
                            className='w-10 h-10'
                            rounded="full"
                            variant={selected ? 'primary' : 'secondary'}
                            onClick={() => handleSelect(num)}
                        />
                    );
                })}
            </div>
        </>
    );
};

export default JackpotNumberSelector;
