import type { Draw } from '../../../models/interfaces/Jackpot';
import Announcement from '../../Announcement/Announcement';
import { formatDateVN } from '../../../utils/formatters';

interface Props {
  latestDraw: Draw | null;
  currentDraw: Draw | null
}

const JackpotLatestDraw: React.FC<Props> = ({ latestDraw, currentDraw }) => {
  console.log("latestDraw numbers:", latestDraw?.numbers, typeof latestDraw?.numbers);

  return (
    <>
      {latestDraw && (
        <div className="bg-white rounded-lg shadow border border-gray-100 dark:border-white/5 bg-gradient-to-b from-white to-zinc-50 dark:from-gray-900 dark:to-gray-800 dark:shadow-[0_2px_6px_rgba(0,0,0,0.5)] p-4 space-y-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-100">Kết quả kỳ quay gần nhất</h3>
          <dl className="-my-3 divide-y divide-gray-200 dark:divide-white/5 text-xs">
            <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
              <dt className="text-gray-900 dark:text-gray-200">Ngày quay:</dt>
              <dd className="text-gray-700 dark:text-gray-400 sm:col-span-2">{formatDateVN(latestDraw.draw_date)}</dd>
            </div>
            <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
              <dt className="text-gray-900 dark:text-gray-200">Số trúng:</dt>
              <dd className="text-gray-700 dark:text-gray-400 sm:col-span-2">
                {latestDraw.numbers.length > 0
                  ? latestDraw.numbers.join(', ')
                  : 'Chưa có kết quả'}</dd>
            </div>
            {latestDraw.bonus_number && (
              <div className="grid grid-cols-1 gap-1 py-3 sm:grid-cols-3 sm:gap-4">
                <dt className="text-gray-900 dark:text-gray-200">Số bonus:</dt>
                <dd className="text-gray-700 dark:text-gray-400 sm:col-span-2">{latestDraw.bonus_number}</dd>
              </div>
            )}
          </dl>
        </div>
      )}
      {currentDraw && (
        <Announcement
          type="info"
          title="Kỳ quay tiếp theo"
          message={formatDateVN(currentDraw.draw_date)}
          className='mt-4 mb-0'
          size='sm'
        />
      )}
    </>
  );
};

export default JackpotLatestDraw;
