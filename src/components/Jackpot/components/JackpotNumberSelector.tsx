import React from 'react';
import Button from '../../common/Button';

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
    return (
        <>
            <p className="text-sm text-gray-600 mb-2">
                Đã chọn: {numbers.length}/{requiredNumbers} số
            </p>
            <div className="grid grid-cols-6 gap-2 mb-4">
                {numberRange.map(num => {
                    const selected = numbers.includes(num);
                    return (
                        <Button
                            key={num}
                            label={num.toString().padStart(2, '0')}
                            size="sm"
                            rounded="md"
                            variant={selected ? 'primary' : 'secondary'}
                            onClick={() =>
                                setNumbers(prev =>
                                    selected
                                        ? prev.filter(n => n !== num)
                                        : prev.length < requiredNumbers
                                            ? [...prev, num]
                                            : prev
                                )
                            }
                        />
                    );
                })}
            </div>
        </>
    );
};

export default JackpotNumberSelector;
