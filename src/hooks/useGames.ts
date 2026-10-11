// src/hooks/useGames.ts
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { billiardService } from '../services/billiard_service';
import { useAlert } from '../contexts/alertContext';
import { billiardErrorMessage, getStatus } from '../utils/billiard';
import type { Game, ScorePlayer } from '../models/interfaces/Billiard';

interface Options {
  /** Poll + refetch on focus only while true (e.g. session is active). */
  enabled?: boolean;
  pollMs?: number;
}

/** Games of one session. Same shape as useSession: one in-flight mutation, 409 => resync. */
export function useGames(sessionId: number, { enabled = true, pollMs = 5000 }: Options = {}) {
  const { t } = useTranslation();
  const { setAlert } = useAlert();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inflight = useRef(false);

  const fetchGames = useCallback(async () => {
    if (!Number.isFinite(sessionId)) return;
    try {
      const list = await billiardService.getGames(sessionId);
      // Skip stale poll results while a mutation is running (it refreshes state itself).
      if (!inflight.current) setGames([...list].sort((a, b) => a.game_number - b.game_number));
      setError(null);
    } catch (err) {
      setError(billiardErrorMessage(err, 'Failed to load games'));
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    setLoading(true);
    fetchGames();
  }, [fetchGames]);

  // No WebSocket: poll, and refetch when the tab regains focus (device may change scores).
  useEffect(() => {
    if (!enabled) return;
    const timer = setInterval(fetchGames, pollMs);
    const onVisible = () => document.visibilityState === 'visible' && fetchGames();
    window.addEventListener('focus', onVisible);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', onVisible);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [enabled, pollMs, fetchGames]);

  const upsert = (g: Game) =>
    setGames((prev) =>
      (prev.some((x) => x.id === g.id) ? prev.map((x) => (x.id === g.id ? g : x)) : [...prev, g]).sort(
        (a, b) => a.game_number - b.game_number
      )
    );

  async function run<T>(fn: () => Promise<T>, okMessage?: string): Promise<T | null> {
    if (inflight.current) return null;
    inflight.current = true;
    setBusy(true);
    try {
      const result = await fn();
      if (okMessage) setAlert({ type: 'success', message: okMessage });
      return result;
    } catch (err) {
      setAlert({ type: 'error', message: billiardErrorMessage(err) });
      // 409 = game no longer active / would go below 0 / already one active -> resync
      if (getStatus(err) === 409) {
        inflight.current = false;
        await fetchGames();
      }
      return null;
    } finally {
      inflight.current = false;
      setBusy(false);
    }
  }

  const activeGame = useMemo(() => games.find((g) => g.status === 'active') ?? null, [games]);

  const start = () =>
    run(async () => {
      const g = await billiardService.startGame(sessionId);
      upsert(g);
      return g;
    }, t('billiard_tables.games.started'));

  /** ±1 per press; the caller must not send a delta that would drop below 0. */
  const score = (gameId: number, player: ScorePlayer, delta: 1 | -1) =>
    run(async () => {
      const g = await billiardService.scoreGame(gameId, { player, delta });
      upsert(g);
      return g;
    });

  const reset = (gameId: number) =>
    run(async () => {
      const g = await billiardService.resetGame(gameId);
      upsert(g);
      return g;
    }, t('billiard_tables.games.reset_done'));

  const finish = (gameId: number) =>
    run(async () => {
      const g = await billiardService.finishGame(gameId);
      upsert(g);
      return g;
    }, t('billiard_tables.games.finished'));

  const newGame = (gameId: number) =>
    run(async () => {
      const res = await billiardService.newGame(gameId);
      upsert(res.finished);
      upsert(res.started);
      return res;
    }, t('billiard_tables.games.new_started'));

  return {
    games,
    activeGame,
    loading,
    error,
    busy,
    actions: { fetchGames, start, score, reset, finish, newGame },
  };
}
