import type { Response } from 'express';
import type { AuthRequest } from '../types/index';
import * as userService from '../services/user.service';

/**
 * Lay danh sach tat ca users
 */
export async function getAllUsers(req: AuthRequest, res: Response): Promise<void> {
  try {
    const users = await userService.getAllUsers();
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Loi khi lay danh sach users:', error);
    res.status(500).json({
      success: false,
      message: 'Loi server khi lay danh sach users'
    });
  }
}

/**
 * Lay danh sach users chua co the
 */
export async function getUsersWithoutCard(req: AuthRequest, res: Response): Promise<void> {
  try {
    const users = await userService.getUsersWithoutCard();
    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Loi khi lay danh sach users chua co the:', error);
    res.status(500).json({
      success: false,
      message: 'Loi server'
    });
  }
}
