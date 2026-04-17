import { Router } from 'express';
import { body } from 'express-validator';
import { createExpense, deleteExpense, getExpenseSummary, getExpenses, updateExpense } from '../controllers/expenseController';
import { protect } from '../middleware/auth';
import { CATEGORIES } from '../models/Expense';

const router = Router();
router.use(protect);

const categoryValues = [...CATEGORIES];

const expenseValidation = [
  body('title').trim().isLength({ min: 2, max: 100 }).withMessage('Title must be between 2 and 100 characters'),
  body('amount').isFloat({ min: 0.01, max: 10000000 }).withMessage('Amount must be a positive number'),
  body('category').isIn(categoryValues).withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`),
  body('date').optional().isISO8601().withMessage('Date must be a valid date'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
];

const patchExpenseValidation = [
  body('title').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Title must be between 2 and 100 characters'),
  body('amount').optional().isFloat({ min: 0.01, max: 10000000 }).withMessage('Amount must be a positive number'),
  body('category').optional().isIn(categoryValues).withMessage(`Category must be one of: ${CATEGORIES.join(', ')}`),
  body('date').optional().isISO8601().withMessage('Date must be a valid date'),
  body('notes').optional().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
];

router.get('/summary', getExpenseSummary);
router.get('/', getExpenses);
router.post('/', expenseValidation, createExpense);
router.put('/:id', expenseValidation, updateExpense);
router.patch('/:id', patchExpenseValidation, updateExpense);
router.delete('/:id', deleteExpense);

export default router;
