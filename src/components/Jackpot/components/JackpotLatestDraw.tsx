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
        <div className="mb-4 p-4 bg-gray-100 rounded-lg shadow">
          <h2 className="text-lg font-semibold">Kết quả kỳ quay gần nhất</h2>
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
