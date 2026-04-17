import type { Types } from 'mongoose';
import RefreshToken from '../models/RefreshToken';

export const refreshTokenRepository = {
  create: (payload: { user: Types.ObjectId; tokenHash: string; expiresAt: Date }) => RefreshToken.create(payload),
  findByHash: (tokenHash: string) => RefreshToken.findOne({ tokenHash }),
  deleteByHash: (tokenHash: string) => RefreshToken.findOneAndDelete({ tokenHash }),
  deleteAllByUserId: (userId: Types.ObjectId) => RefreshToken.deleteMany({ user: userId }),
};
