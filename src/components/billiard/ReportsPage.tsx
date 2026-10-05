// src/components/billiard/ReportsPage.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { IconArrowLeft, IconMoodEmpty } from '@tabler/icons-react';
import PageTitle from '../common/PageTitle';
import Button from '../common/Button';
import LinearProgress from '../common/LinearProgress';
import EmptyState from '../common/EmptyState';
import { FormGroup, FormInput, FormLabel } from '../common/Form';
import { useAlert } from '../../contexts/alertContext';
import useHasAnyRole from '../../hooks/useHasAnyRole';
import { useUsageReport } from '../../hooks/useUsageReport';
import UsageReportTable from './components/UsageReportTable';
import { toDateParam } from '../../utils/billiard';

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toDateParam(d);
};

const ReportsPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAlert } = useAlert();
  const canView = useHasAnyRole(['admin', 'super_admin', 'manager']);

  const [start, setStart] = useState(daysAgo(30));
  const [end, setEnd] = useState(toDateParam(new Date()));
  const { report, loading, error, fetchReport } = useUsageReport();

  useEffect(() => {
    if (canView) fetchReport(start, end);
    // initial load only; further loads via "Apply"
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canView]);

  const apply = () => {
    if (!start || !end || start > end) {
      setAlert({ type: 'warning', message: 'Choose a valid date range (start must not be after end).' });
      return;
    }
    fetchReport(start, end);
  };

  if (!canView) {
    return (
      <div className="text-red-500 font-semibold text-center mt-10">
        Unauthorized: You do not have access to view this page.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageTitle
        title="Table Usage Report"
        subtitle="Play count, time and revenue per table."
        actions={
          <Button
            label="Tables"
            variant="secondary"
            icon={<IconArrowLeft size={16} />}
            iconPosition="left"
            rounded="lg"
            onClick={() => navigate('/billiard')}
          />
        }
      />

      <div className="flex flex-wrap items-end gap-4">
        <FormGroup className="space-y-1">
          <FormLabel htmlFor="report_start">From</FormLabel>
          <FormInput id="report_start" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        </FormGroup>
        <FormGroup className="space-y-1">
          <FormLabel htmlFor="report_end">To</FormLabel>
          <FormInput id="report_end" type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
        </FormGroup>
        <Button label={loading ? 'Loading...' : 'Apply'} rounded="lg" disabled={loading} onClick={apply} />
      </div>

      {loading ? (
        <LinearProgress position="absolute" thickness="h-1" duration={3000} />
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center space-y-3">
          <p className="text-sm text-red-700">{error}</p>
          <Button label="Retry" variant="secondary" rounded="lg" onClick={apply} />
        </div>
      ) : !report || report.rows.length === 0 ? (
        <EmptyState icon={<IconMoodEmpty size={48} />} message="No usage in this period." />
      ) : (
        <UsageReportTable report={report} />
      )}
    </div>
  );
};

export default ReportsPage;
