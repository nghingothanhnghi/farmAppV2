import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2'>
                <p className="text-sm text-gray-600 mb-2">
                    Đã chọn: {numbers.length}/{requiredNumbers} số
                </p>
                <AnimatePresence initial={false}>
                    {/* ✅ Show selected numbers */}
                    {numbers.length > 0 && (
                        <motion.div
                            className="flex flex-wrap gap-2 mb-4"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.25 }}
                        >
                            {numbers.map((num, index) => (
                                <motion.div
                                    key={`${num}-${index}`}
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.8, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <Button
                                        // key={index}
                                        label={`${num.toString().padStart(2, '0')} ✕`}
                                        size="xxs"
                                        rounded="full"
                                        onClick={() => handleRemove(index)}
                                    />
                                </motion.div>
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <div className="grid grid-cols-7 md:grid-cols-10 gap-2 mb-4">
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
