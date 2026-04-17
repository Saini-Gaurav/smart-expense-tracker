import { FormEvent, useCallback, useEffect, useState } from 'react';
import api from '../api/client';
import { useDashboard } from '../contexts/DashboardContext';
import type { Expense, ExpenseCategory, Pagination } from '../types/expense';
import { EXPENSE_CATEGORIES } from '../types/expense';

const toDateInput = (value: string | Date | undefined): string => {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
};

type ExpenseForm = {
  title: string;
  amount: string;
  category: ExpenseCategory;
  date: string;
  notes: string;
};

const emptyForm = (): ExpenseForm => ({
  title: '',
  amount: '',
  category: 'Food',
  date: '',
  notes: '',
});

export default function ExpensesPage() {
  const { filterStart, filterEnd, setFilterStart, setFilterEnd, resetDateRange, bumpRefresh } = useDashboard();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
    hasMore: false,
  });
  const [form, setForm] = useState<ExpenseForm>(emptyForm());
  const [listCategory, setListCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);
  const [editing, setEditing] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<ExpenseForm | null>(null);

  const fetchExpenses = useCallback(async () => {
    const params = new URLSearchParams({
      page: String(page),
      limit: '10',
      sortBy,
      sortOrder,
    });
    if (listCategory !== 'All') params.set('category', listCategory);
    if (filterStart) params.set('startDate', filterStart);
    if (filterEnd) params.set('endDate', filterEnd);
    const { data } = await api.get<{ data: Expense[]; pagination: Pagination }>(`/expenses?${params.toString()}`);
    setExpenses(data.data);
    setPagination(data.pagination);
  }, [page, listCategory, sortBy, sortOrder, filterStart, filterEnd]);

  useEffect(() => {
    void fetchExpenses();
  }, [fetchExpenses]);

  const refreshCharts = () => {
    bumpRefresh();
  };

  const addExpense = async (e: FormEvent) => {
    e.preventDefault();
    await api.post('/expenses', { ...form, amount: Number(form.amount), date: form.date || undefined });
    setForm(emptyForm());
    await fetchExpenses();
    refreshCharts();
  };

  const deleteExpense = async (id: string) => {
    await api.delete(`/expenses/${id}`);
    await fetchExpenses();
    refreshCharts();
  };

  const openEdit = (expense: Expense) => {
    setEditing(expense._id);
    setEditForm({
      title: expense.title,
      amount: String(expense.amount),
      category: expense.category,
      date: toDateInput(expense.date),
      notes: expense.notes || '',
    });
  };

  const closeEdit = () => {
    setEditing(null);
    setEditForm(null);
  };

  const saveEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing || !editForm) return;
    await api.put(`/expenses/${editing}`, {
      title: editForm.title,
      amount: Number(editForm.amount),
      category: editForm.category,
      date: editForm.date || undefined,
      notes: editForm.notes,
    });
    closeEdit();
    await fetchExpenses();
    refreshCharts();
  };

  const resetListFilters = () => {
    resetDateRange();
    setListCategory('All');
    setSortBy('date');
    setSortOrder('desc');
    setPage(1);
  };

  return (
    <div className="dash">
      <header className="dash-header dash-header--compact">
        <div>
          <p className="dash-eyebrow">Expenses</p>
          <h1 className="dash-title">Manage transactions</h1>
          <p className="dash-sub">Filter, sort, paginate, and edit entries. Charts on Overview update automatically.</p>
        </div>
      </header>

      <section className="panel panel-filters" aria-label="Expense filters">
        <h2 className="panel-title panel-title--sm">Filters</h2>
        <p className="filter-hint">Date range matches the Overview dashboard when you set it here or there.</p>
        <div className="filter-grid">
          <div className="field">
            <label className="field-label" htmlFor="exp-filter-start">
              From
            </label>
            <input
              id="exp-filter-start"
              className="field-input"
              type="date"
              value={filterStart}
              onChange={(e) => {
                setFilterStart(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="exp-filter-end">
              To
            </label>
            <input
              id="exp-filter-end"
              className="field-input"
              type="date"
              value={filterEnd}
              onChange={(e) => {
                setFilterEnd(e.target.value);
                setPage(1);
              }}
            />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="exp-list-cat">
              Category
            </label>
            <select
              id="exp-list-cat"
              className="field-input"
              value={listCategory}
              onChange={(e) => {
                setListCategory(e.target.value);
                setPage(1);
              }}
            >
              <option value="All">All categories</option>
              {EXPENSE_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label className="field-label" htmlFor="exp-sort-by">
              Sort by
            </label>
            <select
              id="exp-sort-by"
              className="field-input"
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as 'date' | 'amount');
                setPage(1);
              }}
            >
              <option value="date">Date</option>
              <option value="amount">Amount</option>
            </select>
          </div>
          <div className="field">
            <label className="field-label" htmlFor="exp-sort-order">
              Order
            </label>
            <select
              id="exp-sort-order"
              className="field-input"
              value={sortOrder}
              onChange={(e) => {
                setSortOrder(e.target.value as 'asc' | 'desc');
                setPage(1);
              }}
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
          <div className="field field--actions">
            <span className="field-label">&nbsp;</span>
            <button type="button" className="btn-ghost btn-ghost--full" onClick={resetListFilters}>
              Reset filters
            </button>
          </div>
        </div>
      </section>

      <section className="dash-grid">
        <form className="panel panel-form" onSubmit={addExpense}>
          <h2 className="panel-title">Add expense</h2>
          <div className="form-grid">
            <div className="field">
              <label className="field-label" htmlFor="exp-title">
                Title
              </label>
              <input
                id="exp-title"
                className="field-input"
                placeholder="Coffee, fuel, subscription…"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="exp-amt">
                Amount
              </label>
              <input
                id="exp-amt"
                className="field-input"
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="exp-cat">
                Category
              </label>
              <select id="exp-cat" className="field-input" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ExpenseCategory })}>
                {EXPENSE_CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label className="field-label" htmlFor="exp-date">
                Date
              </label>
              <input id="exp-date" className="field-input" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
            </div>
            <div className="field field-span-2">
              <label className="field-label" htmlFor="exp-notes">
                Notes (optional)
              </label>
              <textarea
                id="exp-notes"
                className="field-input field-textarea"
                rows={2}
                placeholder="Optional details"
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>
          </div>
          <button className="btn-primary" type="submit">
            Save expense
          </button>
        </form>

        <div className="panel panel-list">
          <div className="panel-list-header">
            <h2 className="panel-title">Your expenses</h2>
            <span className="pagination-meta">
              Page {pagination.page} of {Math.max(1, pagination.totalPages)} · {pagination.total} total
            </span>
          </div>
          {expenses.length === 0 ? (
            <p className="empty-hint">No expenses match these filters.</p>
          ) : (
            <ul className="expense-list">
              {expenses.map((expense) => (
                <li key={expense._id} className="expense-row">
                  <div className="expense-row-main">
                    <span className="expense-title">{expense.title}</span>
                    <span className="expense-meta">
                      {expense.category} · {new Date(expense.date).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </span>
                  </div>
                  <div className="expense-row-actions">
                    <span className="expense-amount">{expense.amount.toFixed(2)}</span>
                    <div className="expense-actions">
                      <button type="button" className="btn-text" onClick={() => openEdit(expense)}>
                        Edit
                      </button>
                      <button type="button" className="btn-text-danger" onClick={() => void deleteExpense(expense._id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <div className="pagination-bar">
            <button type="button" className="btn-ghost" disabled={pagination.page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
              Previous
            </button>
            <button type="button" className="btn-ghost" disabled={!pagination.hasMore} onClick={() => setPage((p) => p + 1)}>
              Next
            </button>
          </div>
        </div>
      </section>

      {editing && editForm ? (
        <div className="modal-backdrop" role="presentation" onClick={closeEdit}>
          <div className="modal" role="dialog" aria-modal="true" aria-labelledby="edit-title" onClick={(e) => e.stopPropagation()}>
            <h2 id="edit-title" className="modal-title">
              Edit expense
            </h2>
            <form className="modal-form" onSubmit={saveEdit}>
              <div className="field">
                <label className="field-label" htmlFor="edit-title-inp">
                  Title
                </label>
                <input
                  id="edit-title-inp"
                  className="field-input"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  required
                />
              </div>
              <div className="field">
                <label className="field-label" htmlFor="edit-amt">
                  Amount
                </label>
                <input
                  id="edit-amt"
                  className="field-input"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={editForm.amount}
                  onChange={(e) => setEditForm({ ...editForm, amount: e.target.value })}
                  required
                />
              </div>
              <div className="field">
                <label className="field-label" htmlFor="edit-cat">
                  Category
                </label>
                <select
                  id="edit-cat"
                  className="field-input"
                  value={editForm.category}
                  onChange={(e) => setEditForm({ ...editForm, category: e.target.value as ExpenseCategory })}
                >
                  {EXPENSE_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label className="field-label" htmlFor="edit-date">
                  Date
                </label>
                <input id="edit-date" className="field-input" type="date" value={editForm.date} onChange={(e) => setEditForm({ ...editForm, date: e.target.value })} />
              </div>
              <div className="field">
                <label className="field-label" htmlFor="edit-notes">
                  Notes
                </label>
                <textarea id="edit-notes" className="field-input field-textarea" rows={2} value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={closeEdit}>
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Save changes
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
