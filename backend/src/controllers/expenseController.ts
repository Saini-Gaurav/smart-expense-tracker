import type { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import Expense from '../models/Expense';
import { expenseService, type ExpenseListFilters } from '../services/expenseService';

export const getExpenses = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await expenseService.getExpenses(req.user!._id, req.query as unknown as ExpenseListFilters);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

export const createExpense = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
    }
    const { title, amount, category, date, notes } = req.body;
    const expense = await Expense.create({
      user: req.user!._id,
      title,
      amount: parseFloat(amount),
      category,
      date: date || new Date(),
      notes: notes || '',
    });
    return res.status(201).json({ success: true, message: 'Expense added successfully!', data: expense });
  } catch (error) {
    return next(error);
  }
};

export const updateExpense = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
    }
    const patchable = ['title', 'amount', 'category', 'date', 'notes'] as const;
    const hasField = patchable.some((k) => req.body[k] !== undefined);
    if (req.method === 'PATCH' && !hasField) {
      return res.status(400).json({ success: false, message: 'Provide at least one field to update.' });
    }
    const expense = await Expense.findOne({ _id: req.params.id, user: req.user!._id });
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found.' });
    const { title, amount, category, date, notes } = req.body;
    if (title !== undefined) expense.title = title;
    if (amount !== undefined) expense.amount = parseFloat(amount);
    if (category !== undefined) expense.category = category;
    if (date !== undefined) expense.date = date;
    if (notes !== undefined) expense.notes = notes;
    await expense.save();
    return res.json({ success: true, message: 'Expense updated successfully!', data: expense });
  } catch (error) {
    return next(error);
  }
};

export const deleteExpense = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, user: req.user!._id });
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found.' });
    return res.json({ success: true, message: 'Expense deleted successfully!', data: { id: req.params.id } });
  } catch (error) {
    return next(error);
  }
};

type AggRow = { _id: null; total: number; count: number };
type CatRow = { _id: string; total: number; count: number };
type TrendRow = { _id: { year: number; month: number }; total: number; count: number };

export const getExpenseSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const { startDate, endDate } = req.query as { startDate?: string; endDate?: string };
    const userId = req.user!._id;

    const dashboardFilter: Record<string, unknown> = {};
    if (startDate || endDate) {
      const dateQ: { $gte?: Date; $lte?: Date } = {};
      if (startDate) dateQ.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        dateQ.$lte = end;
      }
      dashboardFilter.date = dateQ;
    }

    const trendMatch: Record<string, unknown> = { user: userId };
    if (startDate && endDate) {
      const endTrend = new Date(endDate);
      endTrend.setHours(23, 59, 59, 999);
      trendMatch.date = { $gte: new Date(startDate), $lte: endTrend };
    } else {
      trendMatch.date = { $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1) };
    }

    const [totalThisMonth, totalThisYear, categoryBreakdown, monthlyTrend, recentExpenses] = await Promise.all([
      Expense.aggregate<AggRow>([{ $match: { user: userId, date: { $gte: startOfMonth } } }, { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }]),
      Expense.aggregate<AggRow>([{ $match: { user: userId, date: { $gte: startOfYear } } }, { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }]),
      Expense.aggregate<CatRow>([
        { $match: { user: userId, ...(Object.keys(dashboardFilter).length > 0 ? dashboardFilter : {}) } },
        { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { total: -1 } },
      ]),
      Expense.aggregate<TrendRow>([
        { $match: trendMatch },
        { $group: { _id: { year: { $year: '$date' }, month: { $month: '$date' } }, total: { $sum: '$amount' }, count: { $sum: 1 } } },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
      Expense.find({ user: userId }).sort({ date: -1 }).limit(5).lean(),
    ]);

    const highestCategory =
      categoryBreakdown.length > 0 ? { name: categoryBreakdown[0]._id, total: categoryBreakdown[0].total } : null;

    return res.json({
      success: true,
      data: {
        summary: {
          totalThisMonth: totalThisMonth[0]?.total || 0,
          countThisMonth: totalThisMonth[0]?.count || 0,
          totalThisYear: totalThisYear[0]?.total || 0,
          countThisYear: totalThisYear[0]?.count || 0,
          highestCategory,
        },
        categoryBreakdown: categoryBreakdown.map((c) => ({ category: c._id, total: c.total, count: c.count })),
        monthlyTrend: monthlyTrend.map((m) => ({
          year: m._id.year,
          month: m._id.month,
          label: new Date(m._id.year, m._id.month - 1).toLocaleString('default', { month: 'short', year: '2-digit' }),
          total: m.total,
          count: m.count,
        })),
        recentExpenses,
      },
    });
  } catch (error) {
    return next(error);
  }
};
