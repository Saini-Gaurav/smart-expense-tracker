import type { CookieOptions, Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { authService } from '../services/authService';

const refreshCookieName = 'refreshToken';

const setRefreshCookie = (res: Response, token: string) => {
  const isProd = process.env.NODE_ENV === 'production';
  // Split deploy (e.g. Vercel + Render) is cross-site; Strict blocks credentialed XHR. None + Secure is required for HTTPS APIs.
  const opts: CookieOptions = {
    httpOnly: true,
    sameSite: isProd ? 'none' : 'lax',
    secure: isProd,
    maxAge: Math.max(1, Number.parseInt(process.env.JWT_REFRESH_TOKEN_DAYS || '7', 10)) * 24 * 60 * 60 * 1000,
  };
  res.cookie(refreshCookieName, token, opts);
};

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
    }
    const result = await authService.register(req.body);
    if ('error' in result) return res.status(result.statusCode).json({ success: false, message: result.error });
    setRefreshCookie(res, result.refreshToken);
    return res.status(201).json({
      success: true,
      message: 'Account created successfully!',
      token: result.accessToken,
      user: result.user,
    });
  } catch (error) {
    return next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg, errors: errors.array() });
    }
    const result = await authService.login(req.body);
    if ('error' in result) return res.status(result.statusCode).json({ success: false, message: result.error });
    setRefreshCookie(res, result.refreshToken);
    return res.json({ success: true, message: 'Logged in successfully!', token: result.accessToken, user: result.user });
  } catch (error) {
    return next(error);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies[refreshCookieName] as string | undefined;
    if (!token) return res.status(401).json({ success: false, message: 'Refresh token missing.' });
    const result = await authService.refresh(token);
    if ('error' in result) return res.status(result.statusCode).json({ success: false, message: result.error });
    setRefreshCookie(res, result.refreshToken);
    return res.json({ success: true, token: result.accessToken, user: result.user });
  } catch (error) {
    return next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authService.logout(req.cookies[refreshCookieName] as string | undefined);
    const isProd = process.env.NODE_ENV === 'production';
    res.clearCookie(refreshCookieName, {
      httpOnly: true,
      sameSite: isProd ? 'none' : 'lax',
      secure: isProd,
    });
    return res.json({ success: true, message: 'Logged out successfully.' });
  } catch (error) {
    return next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await authService.getMe(req.user!._id);
    return res.json({ success: true, user });
  } catch (error) {
    return next(error);
  }
};
