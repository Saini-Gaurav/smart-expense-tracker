import type { FilterQuery, PipelineStage, SortOrder } from 'mongoose';
import Expense from '../models/Expense';

export const expenseRepository = {
  find: (query: FilterQuery<unknown>, sortOptions: Record<string, SortOrder>, skip: number, limit: number) =>
    Expense.find(query).sort(sortOptions).skip(skip).limit(limit).lean(),
  count: (query: FilterQuery<unknown>) => Expense.countDocuments(query),
  create: (payload: Record<string, unknown>) => Expense.create(payload),
  findByIdForUser: (id: string, userId: unknown) => Expense.findOne({ _id: id, user: userId }),
  deleteByIdForUser: (id: string, userId: unknown) => Expense.findOneAndDelete({ _id: id, user: userId }),
  findRecentByUser: (userId: unknown, limitNum: number) => Expense.find({ user: userId }).sort({ date: -1 }).limit(limitNum).lean(),
  aggregate: (pipeline: PipelineStage[]) => Expense.aggregate(pipeline),
};
