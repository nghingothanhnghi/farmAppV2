import type { Draw } from '../../../models/interfaces/Jackpot';

interface Props {
  latestDraw: Draw | null;
  nextDrawLabel: string | null
}

const JackpotLatestDraw: React.FC<Props> = ({ latestDraw, nextDrawLabel }) => {
  if (!latestDraw && !nextDrawLabel) return null;

  return (
    <>
      {latestDraw && (
        <div className="bg-white rounded-lg shadow-md border border-gray-100 dark:bg-gray-900 dark:border-gray-700 p-6">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-100">Kết quả kỳ quay gần nhất</h3>
          <p className="mt-2">
            <strong>Ngày quay:</strong>{' '}
            {new Date(latestDraw.draw_date).toLocaleString()}
          </p>
          <p>
            <strong>Số trúng:</strong>{' '}
            {latestDraw.numbers.length > 0
              ? latestDraw.numbers.join(', ')
              : 'Chưa có kết quả'}
          </p>
          {latestDraw.bonus_number && (
            <p>
              <strong>Số bonus:</strong> {latestDraw.bonus_number}
            </p>
          )}
        </div>
      )}
      {nextDrawLabel && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-800 text-center">
          <strong>Kỳ quay tiếp theo:</strong> {nextDrawLabel}
        </div>
      )}
    </>
  );
};

export default JackpotLatestDraw;
