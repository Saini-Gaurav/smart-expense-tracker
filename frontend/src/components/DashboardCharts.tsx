import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import type { CategoryBreakdownRow, MonthlyTrendRow } from '../types/expense';

const COLORS = ['#6ee7b7', '#67e8f9', '#a5b4fc', '#f0abfc', '#fdba74', '#93c5fd', '#fca5a5'];

export function CategoryPieChart({ data }: { data: CategoryBreakdownRow[] }) {
  if (!data?.length) {
    return <p className="chart-empty">No category data for this filter.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          dataKey="total"
          nameKey="category"
          cx="50%"
          cy="50%"
          innerRadius={56}
          outerRadius={88}
          paddingAngle={2}
        >
          {data.map((row, i) => (
            <Cell key={row.category} fill={COLORS[i % COLORS.length]} stroke="rgba(12,14,20,0.9)" strokeWidth={1} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, _name, item) => {
            const row = item?.payload as CategoryBreakdownRow | undefined;
            return [Number(value).toFixed(2), row?.category ?? ''];
          }}
          contentStyle={{
            background: '#1c2130',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '8px',
            color: '#e8eaef',
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function TrendBarChart({ data }: { data: MonthlyTrendRow[] }) {
  if (!data?.length) {
    return <p className="chart-empty">No monthly trend for this period.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6ee7b7" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
        <XAxis dataKey="label" tick={{ fill: '#8b93a7', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
        <YAxis tick={{ fill: '#8b93a7', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
        <Tooltip
          formatter={(v: number | string) => [Number(v).toFixed(2), 'Spent']}
          contentStyle={{
            background: '#1c2130',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '8px',
            color: '#e8eaef',
          }}
        />
        <Bar dataKey="total" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
