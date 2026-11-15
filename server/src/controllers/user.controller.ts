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

/**
 * Lay user theo ID
 */
export async function getUserById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        message: 'ID khong hop le'
      });
      return;
    }

    const user = await userService.getUserById(id);

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'Khong tim thay user'
      });
      return;
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Loi khi lay user:', error);
    res.status(500).json({
      success: false,
      message: 'Loi server khi lay user'
    });
  }
}

/**
 * Tao user moi
 */
export async function createUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { email, password, full_name, phone, role } = req.body;

    // Validation
    if (!email || !password || !full_name || !role) {
      res.status(400).json({
        success: false,
        message: 'Email, mat khau, ho ten va role la bat buoc'
      });
      return;
    }

    if (!['reader', 'librarian', 'admin'].includes(role)) {
      res.status(400).json({
        success: false,
        message: 'Role khong hop le'
      });
      return;
    }

    const user = await userService.createUser({
      email,
      password,
      full_name,
      phone,
      role
    });

    res.status(201).json({
      success: true,
      message: 'Tao user thanh cong',
      data: user
    });
  } catch (error) {
    console.error('Loi khi tao user:', error);

    if (error instanceof Error && error.message === 'Email da ton tai') {
      res.status(400).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Loi server khi tao user'
      });
    }
  }
}

/**
 * Cap nhat user
 */
export async function updateUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id);
    const { full_name, phone, role, is_active } = req.body;

    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        message: 'ID khong hop le'
      });
      return;
    }

    if (role && !['reader', 'librarian', 'admin'].includes(role)) {
      res.status(400).json({
        success: false,
        message: 'Role khong hop le'
      });
      return;
    }

    const user = await userService.updateUser(id, {
      full_name,
      phone,
      role,
      is_active
    });

    res.json({
      success: true,
      message: 'Cap nhat user thanh cong',
      data: user
    });
  } catch (error) {
    console.error('Loi khi cap nhat user:', error);

    if (error instanceof Error && error.message === 'Khong tim thay user') {
      res.status(404).json({
        success: false,
        message: error.message
      });
    } else if (error instanceof Error && error.message === 'Khong co thong tin cap nhat') {
      res.status(400).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Loi server khi cap nhat user'
      });
    }
  }
}

/**
 * Reset password user
 */
export async function resetPassword(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id);
    const { new_password } = req.body;

    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        message: 'ID khong hop le'
      });
      return;
    }

    if (!new_password || new_password.length < 6) {
      res.status(400).json({
        success: false,
        message: 'Mat khau moi phai co it nhat 6 ky tu'
      });
      return;
    }

    await userService.resetUserPassword(id, new_password);

    res.json({
      success: true,
      message: 'Reset password thanh cong'
    });
  } catch (error) {
    console.error('Loi khi reset password:', error);

    if (error instanceof Error && error.message === 'Khong tim thay user') {
      res.status(404).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Loi server khi reset password'
      });
    }
  }
}

/**
 * Vo hieu hoa user
 */
export async function deactivateUser(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      res.status(400).json({
        success: false,
        message: 'ID khong hop le'
      });
      return;
    }

    await userService.deactivateUser(id);

    res.json({
      success: true,
      message: 'Vo hieu hoa user thanh cong'
    });
  } catch (error) {
    console.error('Loi khi vo hieu hoa user:', error);

    if (error instanceof Error) {
      if (error.message === 'Khong tim thay user') {
        res.status(404).json({
          success: false,
          message: error.message
        });
      } else if (error.message.includes('the doc gia')) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Loi server khi vo hieu hoa user'
        });
      }
    } else {
      res.status(500).json({
        success: false,
        message: 'Loi server khi vo hieu hoa user'
      });
    }
  }
}
