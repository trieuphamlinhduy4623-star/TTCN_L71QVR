import type { Response } from 'express';
import type { AuthRequest, ApiResponse } from '../types/index';
import * as categoryService from '../services/category.service';

/**
 * Lay tat ca the loai
 */
export async function getAllCategories(req: AuthRequest, res: Response): Promise<void> {
  try {
    const categories = await categoryService.getAllCategories();
    res.status(200).json({
      success: true,
      message: 'Lay danh sach the loai thanh cong',
      data: categories,
    } as ApiResponse);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Loi server khi lay danh sach the loai',
    } as ApiResponse);
  }
}

/**
 * Lay the loai theo ID
 */
export async function getCategoryById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id);
    const category = await categoryService.getCategoryById(id);

    if (!category) {
      res.status(404).json({
        success: false,
        message: 'Khong tim thay the loai',
      } as ApiResponse);
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Lay thong tin the loai thanh cong',
      data: category,
    } as ApiResponse);
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      message: 'Loi server khi lay thong tin the loai',
    } as ApiResponse);
  }
}

/**
 * Them the loai moi
 */
export async function createCategory(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { category_name, description } = req.body;

    if (!category_name || category_name.trim() === '') {
      res.status(400).json({
        success: false,
        message: 'Ten the loai la bat buoc',
      } as ApiResponse);
      return;
    }

    const category = await categoryService.createCategory(category_name.trim(), description?.trim());

    res.status(201).json({
      success: true,
      message: 'Them the loai thanh cong',
      data: category,
    } as ApiResponse);
  } catch (error) {
    if (error instanceof Error && error.message === 'Ten the loai da ton tai') {
      res.status(400).json({
        success: false,
        message: error.message,
      } as ApiResponse);
    } else {
      console.error('Create category error:', error);
      res.status(500).json({
        success: false,
        message: 'Loi server khi them the loai',
      } as ApiResponse);
    }
  }
}

/**
 * Cap nhat the loai
 */
export async function updateCategory(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id);
    const { category_name, description } = req.body;

    if (!category_name || category_name.trim() === '') {
      res.status(400).json({
        success: false,
        message: 'Ten the loai la bat buoc',
      } as ApiResponse);
      return;
    }

    const category = await categoryService.updateCategory(id, category_name.trim(), description?.trim());

    res.status(200).json({
      success: true,
      message: 'Cap nhat the loai thanh cong',
      data: category,
    } as ApiResponse);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Khong tim thay the loai') {
        res.status(404).json({
          success: false,
          message: error.message,
        } as ApiResponse);
      } else if (error.message === 'Ten the loai da ton tai') {
        res.status(400).json({
          success: false,
          message: error.message,
        } as ApiResponse);
      } else {
        console.error('Update category error:', error);
        res.status(500).json({
          success: false,
          message: 'Loi server khi cap nhat the loai',
        } as ApiResponse);
      }
    }
  }
}

/**
 * Xoa the loai
 */
export async function deleteCategory(req: AuthRequest, res: Response): Promise<void> {
  try {
    const id = parseInt(req.params.id);
    await categoryService.deleteCategory(id);

    res.status(200).json({
      success: true,
      message: 'Xoa the loai thanh cong',
    } as ApiResponse);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Khong tim thay the loai') {
        res.status(404).json({
          success: false,
          message: error.message,
        } as ApiResponse);
      } else if (error.message.includes('dang duoc su dung')) {
        res.status(400).json({
          success: false,
          message: error.message,
        } as ApiResponse);
      } else {
        console.error('Delete category error:', error);
        res.status(500).json({
          success: false,
          message: 'Loi server khi xoa the loai',
        } as ApiResponse);
      }
    }
  }
}
