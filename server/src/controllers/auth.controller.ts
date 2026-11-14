import type { Response } from 'express';
import type { AuthRequest, ApiResponse } from '../types/index';
import * as authService from '../services/auth.service';

/**
 * Dang ky
 */
export async function register(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { email, password, fullName, phone } = req.body;

    if (!email || !password || !fullName) {
      res.status(400).json({
        success: false,
        message: 'Email, mat khau va ho ten la bat buoc',
      } as ApiResponse);
      return;
    }

    if (password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Mat khau phai co it nhat 6 ky tu',
      } as ApiResponse);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        success: false,
        message: 'Email khong hop le',
      } as ApiResponse);
      return;
    }

    const user = await authService.registerUser(email, password, fullName, phone);

    res.status(201).json({
      success: true,
      message: 'Dang ky thanh cong',
      data: user,
    } as ApiResponse);
  } catch (error) {
    if (error instanceof Error && error.message === 'Email da duoc su dung') {
      res.status(400).json({
        success: false,
        message: error.message,
      } as ApiResponse);
    } else {
      console.error('Register error:', error);
      res.status(500).json({
        success: false,
        message: 'Loi server khi dang ky',
      } as ApiResponse);
    }
  }
}

/**
 * Dang nhap
 */
export async function login(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({
        success: false,
        message: 'Email va mat khau la bat buoc',
      } as ApiResponse);
      return;
    }

    const result = await authService.loginUser(email, password);

    res.status(200).json({
      success: true,
      message: 'Dang nhap thanh cong',
      data: result,
    } as ApiResponse);
  } catch (error) {
    if (error instanceof Error) {
      res.status(401).json({
        success: false,
        message: error.message,
      } as ApiResponse);
    } else {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Loi server khi dang nhap',
      } as ApiResponse);
    }
  }
}

/**
 * Lay thong tin profile
 */
export async function getProfile(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: 'Khong tim thay thong tin xac thuc',
      } as ApiResponse);
      return;
    }

    const user = await authService.getUserById(req.user.userId);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Khong tim thay nguoi dung',
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Lay thong tin thanh cong',
      data: user,
    } as ApiResponse);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Loi server khi lay thong tin',
    } as ApiResponse);
  }
}
