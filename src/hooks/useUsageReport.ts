// src/components/billiard/hooks/useUsageReport.ts
import { useCallback, useState } from 'react';
import { billiardService } from '../services/billiard_service';
import { billiardErrorMessage } from '../utils/billiard';
import type { UsageReport } from '../models/interfaces/Billiard';

export function useUsageReport() {
  const [report, setReport] = useState<UsageReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReport = useCallback(async (startDate: string, endDate: string) => {
    setLoading(true);
    try {
      setReport(await billiardService.getUsageReport(startDate, endDate));
      setError(null);
    } catch (err) {
      setReport(null);
      setError(billiardErrorMessage(err, 'Failed to load report'));
    } finally {
      setLoading(false);
    }
  }, []);

  return { report, loading, error, fetchReport };
}
