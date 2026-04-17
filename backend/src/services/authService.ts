import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import type { Types } from 'mongoose';
import { refreshTokenRepository } from '../repositories/refreshTokenRepository';
import { userRepository } from '../repositories/userRepository';
import type { Document } from 'mongoose';

export type SanitizedUser = {
  id: Types.ObjectId;
  name: string;
  email: string;
  currency?: string;
  createdAt?: Date;
};

type UserDoc = Document & {
  _id: Types.ObjectId;
  name: string;
  email: string;
  currency?: string;
  createdAt?: Date;
  comparePassword: (candidate: string) => Promise<boolean>;
};

const sanitizeUser = (user: UserDoc): SanitizedUser => ({
  id: user._id,
  name: user.name,
  email: user.email,
  currency: user.currency,
  createdAt: user.createdAt,
});

const signAccessToken = (id: string) =>
  jwt.sign({ id }, process.env.JWT_SECRET as jwt.Secret, { expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as jwt.SignOptions['expiresIn'] });

const signRefreshToken = (id: string) =>
  jwt.sign({ id }, process.env.JWT_REFRESH_SECRET as jwt.Secret, {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'],
  });

const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

const parseExpiryMs = () => {
  const days = Number.parseInt(process.env.JWT_REFRESH_TOKEN_DAYS || '7', 10);
  return Math.max(1, days) * 24 * 60 * 60 * 1000;
};

const issueTokens = async (user: UserDoc) => {
  const accessToken = signAccessToken(user._id.toString());
  const refreshToken = signRefreshToken(user._id.toString());
  const tokenHash = hashToken(refreshToken);
  await refreshTokenRepository.create({
    user: user._id,
    tokenHash,
    expiresAt: new Date(Date.now() + parseExpiryMs()),
  });
  return { accessToken, refreshToken };
};

type AuthError = { error: string; statusCode: number };
type AuthOk = { user: SanitizedUser; accessToken: string; refreshToken: string };

export const authService = {
  async register(payload: { name: string; email: string; password: string }): Promise<AuthError | AuthOk> {
    const existingUser = await userRepository.existsByEmail(payload.email);
    if (existingUser) return { error: 'An account with this email already exists.', statusCode: 400 };
    const user = (await userRepository.create(payload)) as unknown as UserDoc;
    const tokens = await issueTokens(user);
    return { user: sanitizeUser(user), ...tokens };
  },

  async login({ email, password }: { email: string; password: string }): Promise<AuthError | AuthOk> {
    const user = (await userRepository.findByEmailWithPassword(email)) as unknown as UserDoc | null;
    if (!user) return { error: 'Invalid email or password.', statusCode: 401 };
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return { error: 'Invalid email or password.', statusCode: 401 };
    const tokens = await issueTokens(user);
    return { user: sanitizeUser(user), ...tokens };
  },

  async refresh(refreshToken: string): Promise<AuthError | AuthOk> {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as jwt.JwtPayload & { id: string };
    const tokenHash = hashToken(refreshToken);
    const savedToken = await refreshTokenRepository.findByHash(tokenHash);
    if (!savedToken || savedToken.user.toString() !== decoded.id) {
      return { error: 'Invalid refresh token.', statusCode: 401 };
    }
    await refreshTokenRepository.deleteByHash(tokenHash);
    const user = (await userRepository.findById(decoded.id)) as unknown as UserDoc | null;
    if (!user) return { error: 'User no longer exists.', statusCode: 401 };
    const tokens = await issueTokens(user);
    return { user: sanitizeUser(user), ...tokens };
  },

  async logout(refreshToken: string | undefined): Promise<void> {
    if (!refreshToken) return;
    const tokenHash = hashToken(refreshToken);
    await refreshTokenRepository.deleteByHash(tokenHash);
  },

  async getMe(userId: Types.ObjectId | string): Promise<SanitizedUser | null> {
    const user = (await userRepository.findById(userId)) as unknown as UserDoc | null;
    return user ? sanitizeUser(user) : null;
  },
};
