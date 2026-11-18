// src/components/billiard/hooks/useTables.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import { billiardService } from '../services/billiard_service';
import { useAlert } from '../contexts/alertContext';
import { billiardErrorMessage, getStatus } from '../utils/billiard';
import type { BilliardTable, SessionStart, TableCreate, TableUpdate } from '../models/interfaces/Billiard';

export type CreateTableError = { status?: number; message: string };
export type UpdateTableError = { status?: number; message: string };

export function useTables() {
  const { setAlert } = useAlert();
  const [tables, setTables] = useState<BilliardTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startingId, setStartingId] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);

  const guard = useRef(false); // blocks double-click double-submit

  const fetchTables = useCallback(async () => {
    try {
      setTables(await billiardService.getTables());
      setError(null);
    } catch (err) {
      setError(billiardErrorMessage(err, 'Failed to load tables'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTables();
  }, [fetchTables]);

  const createTable = async (data: TableCreate): Promise<true | CreateTableError> => {
    if (guard.current) return { message: '' };
    guard.current = true;
    setCreating(true);
    try {
      await billiardService.createTable(data);
      setAlert({ type: 'success', message: `Table "${data.name}" created.` });
      await fetchTables();
      return true;
    } catch (err) {
      const message = billiardErrorMessage(err, 'Failed to create table');
      const status = getStatus(err);
      if (status === 409) fetchTables(); // duplicate name: show the existing table
      else setAlert({ type: 'error', message }); // 409 is shown on the field instead
      return { status, message };
    } finally {
      guard.current = false;
      setCreating(false);
    }
  };

  const updateTable = async (
    tableId: number,
    data: TableUpdate,
  ): Promise<true | UpdateTableError> => {
    if (guard.current) return { message: '' };

    guard.current = true;
    setUpdating(true);

    try {
      await billiardService.updateTable(tableId, data);

      setAlert({
        type: 'success',
        message: `Table "${data.name ?? tables.find((t) => t.id === tableId)?.name ?? tableId}" updated.`,
      });

      await fetchTables();
      return true;
    } catch (err) {
      const message = billiardErrorMessage(err, 'Failed to update table');
      const status = getStatus(err);

      if (status === 409) fetchTables();
      else setAlert({ type: 'error', message });

      return { status, message };
    } finally {
      guard.current = false;
      setUpdating(false);
    }
  };

  const startTable = async (tableId: number): Promise<SessionStart | null> => {
    if (guard.current) return null;
    guard.current = true;
    setStartingId(tableId);
    try {
      return await billiardService.startTable(tableId);
    } catch (err) {
      setAlert({ type: 'error', message: billiardErrorMessage(err, 'Failed to start table') });
      if (getStatus(err) === 409) fetchTables(); // table busy -> our list is stale
      return null;
    } finally {
      guard.current = false;
      setStartingId(null);
    }
  };

  return { tables, loading, error, startingId, creating, updating, actions: { fetchTables, createTable, updateTable, startTable } };
}
