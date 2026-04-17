import { useCallback, useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../state/AuthContext';
import { useDashboard } from '../contexts/DashboardContext';
import { CategoryPieChart, TrendBarChart } from '../components/DashboardCharts';
import type { SummaryPayload } from '../types/expense';

export default function OverviewPage() {
  const { user } = useAuth();
  const { filterStart, filterEnd, setFilterStart, setFilterEnd, resetDateRange, dataVersion } = useDashboard();
  const [summaryPayload, setSummaryPayload] = useState<SummaryPayload | null>(null);

  const fetchSummary = useCallback(async () => {
    const params = new URLSearchParams();
    if (filterStart) params.set('startDate', filterStart);
    if (filterEnd) params.set('endDate', filterEnd);
    const qs = params.toString();
    const { data } = await api.get<{ data: SummaryPayload }>(`/expenses/summary${qs ? `?${qs}` : ''}`);
    setSummaryPayload(data.data);
  }, [filterStart, filterEnd]);

  useEffect(() => {
    void fetchSummary();
  }, [fetchSummary, dataVersion]);

  const summary = summaryPayload?.summary;
  const categoryBreakdown = summaryPayload?.categoryBreakdown ?? [];
  const monthlyTrend = summaryPayload?.monthlyTrend ?? [];

  return (
    <div className="dash">
      <header className="dash-header dash-header--compact">
        <div>
          <p className="dash-eyebrow">Overview</p>
          <h1 className="dash-title">Hi, {user?.name}</h1>
          <p className="dash-sub">Calendar totals and charts. Adjust the date range to refocus analytics.</p>
        </div>
        <button type="button" className="btn-ghost btn-ghost--nowrap" onClick={() => void fetchSummary()}>
          Refresh data
        </button>
      </header>

      <section className="panel panel-filters" aria-label="Chart date range">
        <h2 className="panel-title panel-title--sm">Dashboard date range</h2>
        <p className="filter-hint">
          Filters <strong>charts</strong> and the <strong>highest category</strong> slice. Month and year cards always follow the real calendar.
        </p>
        <div className="filter-grid filter-grid--compact">
          <div className="field">
            <label className="field-label" htmlFor="overview-start">
              From
            </label>
            <input
              id="overview-start"
              className="field-input"
              type="date"
              value={filterStart}
              onChange={(e) => setFilterStart(e.target.value)}
            />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="overview-end">
              To
            </label>
            <input
              id="overview-end"
              className="field-input"
              type="date"
              value={filterEnd}
              onChange={(e) => setFilterEnd(e.target.value)}
            />
          </div>
          <div className="field field--actions">
            <span className="field-label">&nbsp;</span>
            <button type="button" className="btn-ghost btn-ghost--full" onClick={resetDateRange}>
              Clear range
            </button>
          </div>
        </div>
      </section>

      <section className="dash-stats dash-stats--three">
        <article className="stat-card">
          <span className="stat-label">Total spent this month</span>
          <strong className="stat-value">{summary?.totalThisMonth?.toFixed(2) ?? '0.00'}</strong>
        </article>
        <article className="stat-card">
          <span className="stat-label">Total spent this year</span>
          <strong className="stat-value">{summary?.totalThisYear?.toFixed(2) ?? '0.00'}</strong>
        </article>
        <article className="stat-card stat-card--accent">
          <span className="stat-label">Highest category</span>
          <strong className="stat-value stat-value--sm">{summary?.highestCategory?.name ?? '—'}</strong>
          {summary?.highestCategory?.total != null && (
            <span className="stat-sub">{Number(summary.highestCategory.total).toFixed(2)} in category chart period</span>
          )}
        </article>
      </section>

      <section className="charts-grid">
        <div className="panel panel-chart">
          <h2 className="panel-title">Spending by category</h2>
          <p className="chart-caption">Updates when you change expenses or tap refresh.</p>
          <CategoryPieChart data={categoryBreakdown} />
        </div>
        <div className="panel panel-chart">
          <h2 className="panel-title">Monthly trend</h2>
          <p className="chart-caption">Uses your date range when both dates are set; otherwise last six months.</p>
          <TrendBarChart data={monthlyTrend} />
        </div>
      </section>
    </div>
  );
}
