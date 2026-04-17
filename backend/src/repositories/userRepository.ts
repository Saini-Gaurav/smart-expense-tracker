import type { Types } from 'mongoose';
import User from '../models/User';

export const userRepository = {
  create: (payload: { name: string; email: string; password: string }) => User.create(payload),
  findByEmailWithPassword: (email: string) => User.findOne({ email }).select('+password'),
  findById: (id: string | Types.ObjectId) => User.findById(id),
  existsByEmail: (email: string) => User.findOne({ email }),
};
