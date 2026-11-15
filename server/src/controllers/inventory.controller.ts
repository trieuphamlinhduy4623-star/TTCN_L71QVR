import type { Response } from 'express';
import type { AuthRequest } from '../types/index';
import * as inventoryService from '../services/inventory.service';

/**
 * Lay thong ke ton kho
 */
export async function getInventoryStats(req: AuthRequest, res: Response): Promise<void> {
  try {
    const stats = await inventoryService.getInventoryStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Loi khi lay thong ke ton kho:', error);
    res.status(500).json({
      success: false,
      message: 'Loi server khi lay thong ke ton kho'
    });
  }
}

/**
 * Lay danh sach ton kho
 */
export async function getInventoryList(req: AuthRequest, res: Response): Promise<void> {
  try {
    const inventory = await inventoryService.getInventoryList();
    res.json({
      success: true,
      data: inventory
    });
  } catch (error) {
    console.error('Loi khi lay danh sach ton kho:', error);
    res.status(500).json({
      success: false,
      message: 'Loi server khi lay danh sach ton kho'
    });
  }
}

/**
 * Nhap them sach
 */
export async function addBookStock(req: AuthRequest, res: Response): Promise<void> {
  try {
    const bookId = parseInt(req.params.id);
    const { quantity } = req.body;

    if (isNaN(bookId)) {
      res.status(400).json({
        success: false,
        message: 'ID sach khong hop le'
      });
      return;
    }

    if (!quantity || quantity <= 0) {
      res.status(400).json({
        success: false,
        message: 'So luong phai lon hon 0'
      });
      return;
    }

    await inventoryService.addBookStock(bookId, parseInt(quantity));

    res.json({
      success: true,
      message: `Da nhap them ${quantity} ban sach`
    });
  } catch (error) {
    console.error('Loi khi nhap them sach:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Khong tim thay sach') {
        res.status(404).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(400).json({
          success: false,
          message: error.message
        });
      }
    } else {
      res.status(500).json({
        success: false,
        message: 'Loi server khi nhap them sach'
      });
    }
  }
}

/**
 * Dieu chinh so luong sach
 */
export async function adjustBookStock(req: AuthRequest, res: Response): Promise<void> {
  try {
    const bookId = parseInt(req.params.id);
    const { quantity } = req.body;

    if (isNaN(bookId)) {
      res.status(400).json({
        success: false,
        message: 'ID sach khong hop le'
      });
      return;
    }

    if (quantity === undefined || quantity < 0) {
      res.status(400).json({
        success: false,
        message: 'So luong khong hop le'
      });
      return;
    }

    await inventoryService.adjustBookStock(bookId, parseInt(quantity));

    res.json({
      success: true,
      message: 'Da dieu chinh so luong sach'
    });
  } catch (error) {
    console.error('Loi khi dieu chinh so luong:', error);
    
    if (error instanceof Error) {
      if (error.message === 'Khong tim thay sach') {
        res.status(404).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(400).json({
          success: false,
          message: error.message
        });
      }
    } else {
      res.status(500).json({
        success: false,
        message: 'Loi server khi dieu chinh so luong'
      });
    }
  }
}

/**
 * Lay danh sach sach sap het
 */
export async function getLowStockBooks(req: AuthRequest, res: Response): Promise<void> {
  try {
    const threshold = req.query.threshold ? parseInt(req.query.threshold as string) : 2;
    const books = await inventoryService.getLowStockBooks(threshold);
    
    res.json({
      success: true,
      data: books
    });
  } catch (error) {
    console.error('Loi khi lay sach sap het:', error);
    res.status(500).json({
      success: false,
      message: 'Loi server khi lay sach sap het'
    });
  }
}
