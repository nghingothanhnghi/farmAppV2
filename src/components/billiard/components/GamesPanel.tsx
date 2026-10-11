// src/components/billiard/components/GamesPanel.tsx
import React from 'react';
import { useTranslation } from 'react-i18next';
import { IconMinus, IconPlus } from '@tabler/icons-react';
import Button from '../../common/Button';
import Badge from '../../common/Badge';
import type { Game, ScorePlayer } from '../../../models/interfaces/Billiard';

interface Props {
  games: Game[];
  activeGame: Game | null;
  busy: boolean;
  onStart: () => void;
  onScore: (gameId: number, player: ScorePlayer, delta: 1 | -1) => void;
  onReset: (gameId: number) => void;
  onFinish: (gameId: number) => void;
  onNewGame: (gameId: number) => void;
}

const PlayerScore: React.FC<{
  label: string;
  value: number;
  editable: boolean;
  busy: boolean;
  onPlus: () => void;
  onMinus: () => void;
}> = ({ label, value, editable, busy, onPlus, onMinus }) => {
  const { t } = useTranslation();
  const btn =
    'h-10 w-10 flex items-center justify-center rounded-lg border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-100 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-white/5';
  return (
    <div className="flex-1 text-center space-y-2">
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
      <div className="text-5xl font-bold font-mono text-gray-900 dark:text-white">{value}</div>
      {editable && (
        <div className="flex justify-center gap-2">
          <button type="button" className={btn} aria-label={t('billiard_tables.games.minus')}
            disabled={busy || value <= 0} onClick={onMinus}>
            <IconMinus size={18} />
          </button>
          <button type="button" className={btn} aria-label={t('billiard_tables.games.plus')}
            disabled={busy} onClick={onPlus}>
            <IconPlus size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

const GamesPanel: React.FC<Props> = ({ games, activeGame, busy, onStart, onScore, onReset, onFinish, onNewGame }) => {
  const { t } = useTranslation();
  const g = 'billiard_tables.games';
  const history = games.filter((x) => x.id !== activeGame?.id);

  return (
    <div className="bg-white rounded-lg shadow border border-gray-100 dark:border-white/5 bg-gradient-to-b from-white to-zinc-50 dark:from-gray-900 dark:to-gray-800 dark:shadow-[0_2px_6px_rgba(0,0,0,0.5)] p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-800 dark:text-gray-100">{t(`${g}.title`)}</h3>
        {activeGame && <Badge label={`${t(`${g}.game`)} ${activeGame.game_number}`} />}
      </div>

      {activeGame ? (
        <>
          <div className="flex items-start gap-4">
            <PlayerScore label={t(`${g}.player_a`)} value={activeGame.player_a_score} editable busy={busy}
              onPlus={() => onScore(activeGame.id, 'A', 1)} onMinus={() => onScore(activeGame.id, 'A', -1)} />
            <div className="pt-8 text-2xl text-gray-400">:</div>
            <PlayerScore label={t(`${g}.player_b`)} value={activeGame.player_b_score} editable busy={busy}
              onPlus={() => onScore(activeGame.id, 'B', 1)} onMinus={() => onScore(activeGame.id, 'B', -1)} />
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            <Button label={t(`${g}.reset`)} variant="secondary" rounded="lg" disabled={busy}
              onClick={() => onReset(activeGame.id)} />
            <Button label={t(`${g}.new`)} variant="secondary" rounded="lg" disabled={busy}
              onClick={() => onNewGame(activeGame.id)} />
            <Button label={t(`${g}.finish`)} rounded="lg" disabled={busy}
              onClick={() => onFinish(activeGame.id)} />
          </div>
        </>
      ) : (
        <div className="text-center space-y-3">
          {games.length === 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400">{t(`${g}.empty`)}</p>
          )}
          <Button label={games.length === 0 ? t(`${g}.start_first`) : t(`${g}.start_next`)} rounded="lg"
            disabled={busy} onClick={onStart} />
        </div>
      )}

      {history.length > 0 && (
        <ul className="divide-y divide-gray-100 dark:divide-white/5 text-sm">
          {[...history].reverse().map((x) => (
            <li key={x.id} className="flex items-center justify-between py-2 text-gray-700 dark:text-gray-200">
              <span>{t(`${g}.game`)} {x.game_number}</span>
              <span className="font-mono font-semibold">{x.player_a_score} : {x.player_b_score}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {t(`${g}.status_${x.status}`, { defaultValue: x.status })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default GamesPanel;
