import type { Response } from 'express';
import type { AuthRequest } from '../types/index';
import * as libraryCardService from '../services/libraryCard.service';

/**
 * Lay danh sach tat ca the doc gia
 */
export async function getAllLibraryCards(req: AuthRequest, res: Response): Promise<void> {
  try {
    const cards = await libraryCardService.getAllLibraryCards();
    res.json({
      success: true,
      data: cards
    });
  } catch (error) {
    console.error('Loi khi lay danh sach the doc gia:', error);
    res.status(500).json({
      success: false,
      message: 'Loi server khi lay danh sach the doc gia'
    });
  }
}

/**
 * Lay thong tin the doc gia theo ID
 */
export async function getLibraryCardById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const cardId = parseInt(req.params.id);

    if (isNaN(cardId)) {
      res.status(400).json({
        success: false,
        message: 'ID the doc gia khong hop le'
      });
      return;
    }

    const card = await libraryCardService.getLibraryCardById(cardId);

    if (!card) {
      res.status(404).json({
        success: false,
        message: 'Khong tim thay the doc gia'
      });
      return;
    }

    res.json({
      success: true,
      data: card
    });
  } catch (error) {
    console.error('Loi khi lay thong tin the doc gia:', error);
    res.status(500).json({
      success: false,
      message: 'Loi server khi lay thong tin the doc gia'
    });
  }
}

/**
 * Tao the doc gia moi
 */
export async function createLibraryCard(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { user_id, expiry_months } = req.body;

    if (!user_id) {
      res.status(400).json({
        success: false,
        message: 'User ID la bat buoc'
      });
      return;
    }

    const months = expiry_months ? parseInt(expiry_months) : 12;

    const card = await libraryCardService.createLibraryCard(parseInt(user_id), months);

    res.status(201).json({
      success: true,
      message: 'Tao the doc gia thanh cong',
      data: card
    });
  } catch (error) {
    console.error('Loi khi tao the doc gia:', error);
    
    if (error instanceof Error && error.message === 'User da co the doc gia') {
      res.status(400).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Loi server khi tao the doc gia'
      });
    }
  }
}

/**
 * Cap nhat the doc gia
 */
export async function updateLibraryCard(req: AuthRequest, res: Response): Promise<void> {
  try {
    const cardId = parseInt(req.params.id);
    const { expiry_date, status } = req.body;

    if (isNaN(cardId)) {
      res.status(400).json({
        success: false,
        message: 'ID the doc gia khong hop le'
      });
      return;
    }

    const updateData: any = {};
    
    if (expiry_date) {
      updateData.expiry_date = new Date(expiry_date);
    }

    if (status) {
      if (!['active', 'expired', 'locked'].includes(status)) {
        res.status(400).json({
          success: false,
          message: 'Trang thai khong hop le'
        });
        return;
      }
      updateData.status = status;
    }

    const card = await libraryCardService.updateLibraryCard(cardId, updateData);

    res.json({
      success: true,
      message: 'Cap nhat the doc gia thanh cong',
      data: card
    });
  } catch (error) {
    console.error('Loi khi cap nhat the doc gia:', error);
    
    if (error instanceof Error && error.message === 'Khong tim thay the doc gia') {
      res.status(404).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Loi server khi cap nhat the doc gia'
      });
    }
  }
}

/**
 * Gia han the doc gia
 */
export async function renewLibraryCard(req: AuthRequest, res: Response): Promise<void> {
  try {
    const cardId = parseInt(req.params.id);
    const { months } = req.body;

    if (isNaN(cardId)) {
      res.status(400).json({
        success: false,
        message: 'ID the doc gia khong hop le'
      });
      return;
    }

    const additionalMonths = months ? parseInt(months) : 12;

    const card = await libraryCardService.renewLibraryCard(cardId, additionalMonths);

    res.json({
      success: true,
      message: `Gia han the thanh cong them ${additionalMonths} thang`,
      data: card
    });
  } catch (error) {
    console.error('Loi khi gia han the doc gia:', error);
    
    if (error instanceof Error && error.message === 'Khong tim thay the doc gia') {
      res.status(404).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Loi server khi gia han the doc gia'
      });
    }
  }
}

/**
 * Xoa the doc gia
 */
export async function deleteLibraryCard(req: AuthRequest, res: Response): Promise<void> {
  try {
    const cardId = parseInt(req.params.id);

    if (isNaN(cardId)) {
      res.status(400).json({
        success: false,
        message: 'ID the doc gia khong hop le'
      });
      return;
    }

    await libraryCardService.deleteLibraryCard(cardId);

    res.json({
      success: true,
      message: 'Xoa the doc gia thanh cong'
    });
  } catch (error) {
    console.error('Loi khi xoa the doc gia:', error);

    if (error instanceof Error) {
      if (error.message.includes('dang co phieu muon')) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else if (error.message === 'Khong tim thay the doc gia') {
        res.status(404).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Loi server khi xoa the doc gia'
        });
      }
    } else {
      res.status(500).json({
        success: false,
        message: 'Loi server khi xoa the doc gia'
      });
    }
  }
}
