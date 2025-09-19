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
            <button
              key={num}
              className={`p-2 rounded-lg border text-sm ${
                selected ? 'bg-green-600 text-white' : 'hover:bg-gray-100'
              }`}
              onClick={() =>
                setNumbers(prev =>
                  selected
                    ? prev.filter(n => n !== num)
                    : prev.length < requiredNumbers
                    ? [...prev, num]
                    : prev
                )
              }
            >
              {num.toString().padStart(2, '0')}
            </button>
          );
        })}
      </div>
    </>
  );
};

export default JackpotNumberSelector;
