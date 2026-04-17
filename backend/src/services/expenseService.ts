import type { Types } from 'mongoose';
import { expenseRepository } from '../repositories/expenseRepository';

export interface ExpenseListFilters {
  category?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: string;
  page?: string;
  limit?: string;
}

const buildExpenseQuery = (userId: Types.ObjectId, filters: ExpenseListFilters) => {
  const query: Record<string, unknown> = { user: userId };

  if (filters.category && filters.category !== 'All') query.category = filters.category;
  if (filters.search) query.title = { $regex: filters.search, $options: 'i' };
  if (filters.startDate || filters.endDate) {
    const dateQ: { $gte?: Date; $lte?: Date } = {};
    if (filters.startDate) dateQ.$gte = new Date(filters.startDate);
    if (filters.endDate) {
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      dateQ.$lte = end;
    }
    query.date = dateQ;
  }

  return query;
};

export const expenseService = {
  async getExpenses(userId: Types.ObjectId, filters: ExpenseListFilters) {
    const sortOptions: Record<string, 1 | -1> = {};
    const validSortFields = ['date', 'amount', 'title', 'createdAt'];
    const sortField = validSortFields.includes(String(filters.sortBy)) ? String(filters.sortBy) : 'date';
    sortOptions[sortField] = filters.sortOrder === 'asc' ? 1 : -1;

    const pageNum = Math.max(1, Number.parseInt(filters.page || '1', 10));
    const limitNum = Math.min(100, Math.max(1, Number.parseInt(filters.limit || '10', 10)));
    const skip = (pageNum - 1) * limitNum;
    const query = buildExpenseQuery(userId, filters);

    const [expenses, total] = await Promise.all([
      expenseRepository.find(query, sortOptions, skip, limitNum),
      expenseRepository.count(query),
    ]);

    return {
      data: expenses,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
        hasMore: pageNum < Math.ceil(total / limitNum),
      },
    };
  },
};
