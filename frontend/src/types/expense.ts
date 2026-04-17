export type ExpenseCategory =
  | 'Food'
  | 'Transport'
  | 'Shopping'
  | 'Health'
  | 'Entertainment'
  | 'Utilities'
  | 'Other';

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Food',
  'Transport',
  'Shopping',
  'Health',
  'Entertainment',
  'Utilities',
  'Other',
];

export interface Expense {
  _id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  notes?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
}

export interface SummaryBlock {
  totalThisMonth: number;
  countThisMonth: number;
  totalThisYear: number;
  countThisYear: number;
  highestCategory: { name: string; total: number } | null;
}

export interface CategoryBreakdownRow {
  category: string;
  total: number;
  count: number;
}

export interface MonthlyTrendRow {
  year: number;
  month: number;
  label: string;
  total: number;
  count: number;
}

export interface SummaryPayload {
  summary: SummaryBlock;
  categoryBreakdown: CategoryBreakdownRow[];
  monthlyTrend: MonthlyTrendRow[];
}
