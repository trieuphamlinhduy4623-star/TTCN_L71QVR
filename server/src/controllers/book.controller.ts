import type { Response } from 'express';
import type { AuthRequest } from '../types/index';
import * as bookService from '../services/book.service';

/**
 * Lay danh sach tat ca sach
 */
export async function getAllBooks(req: AuthRequest, res: Response): Promise<void> {
  try {
    const books = await bookService.getAllBooks();
    res.json({
      success: true,
      data: books
    });
  } catch (error) {
    console.error('Loi khi lay danh sach sach:', error);
    res.status(500).json({
      success: false,
      message: 'Loi server khi lay danh sach sach'
    });
  }
}

/**
 * Lay thong tin sach theo ID
 */
export async function getBookById(req: AuthRequest, res: Response): Promise<void> {
  try {
    const bookId = parseInt(req.params.id);

    if (isNaN(bookId)) {
      res.status(400).json({
        success: false,
        message: 'ID sach khong hop le'
      });
      return;
    }

    const book = await bookService.getBookById(bookId);

    if (!book) {
      res.status(404).json({
        success: false,
        message: 'Khong tim thay sach'
      });
      return;
    }

    res.json({
      success: true,
      data: book
    });
  } catch (error) {
    console.error('Loi khi lay thong tin sach:', error);
    res.status(500).json({
      success: false,
      message: 'Loi server khi lay thong tin sach'
    });
  }
}

/**
 * Them sach moi
 */
export async function createBook(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { title, isbn, publisher, publish_year, category_id, description, quantity, cover_image, author_ids } = req.body;

    // Validate
    if (!title || title.trim() === '') {
      res.status(400).json({
        success: false,
        message: 'Ten sach khong duoc de trong'
      });
      return;
    }

    if (!quantity || quantity < 1) {
      res.status(400).json({
        success: false,
        message: 'So luong phai lon hon 0'
      });
      return;
    }

    if (!author_ids || !Array.isArray(author_ids) || author_ids.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Sach phai co it nhat 1 tac gia'
      });
      return;
    }

    const book = await bookService.createBook({
      title: title.trim(),
      isbn: isbn?.trim(),
      publisher: publisher?.trim(),
      publish_year: publish_year ? parseInt(publish_year) : undefined,
      category_id: category_id ? parseInt(category_id) : undefined,
      description: description?.trim(),
      quantity: parseInt(quantity),
      cover_image: cover_image?.trim(),
      author_ids: author_ids.map((id: any) => parseInt(id))
    });

    res.status(201).json({
      success: true,
      message: 'Them sach thanh cong',
      data: book
    });
  } catch (error) {
    console.error('Loi khi them sach:', error);
    res.status(500).json({
      success: false,
      message: 'Loi server khi them sach'
    });
  }
}

/**
 * Cap nhat sach
 */
export async function updateBook(req: AuthRequest, res: Response): Promise<void> {
  try {
    const bookId = parseInt(req.params.id);
    const { title, isbn, publisher, publish_year, category_id, description, quantity, cover_image, author_ids } = req.body;

    if (isNaN(bookId)) {
      res.status(400).json({
        success: false,
        message: 'ID sach khong hop le'
      });
      return;
    }

    // Validate
    if (!title || title.trim() === '') {
      res.status(400).json({
        success: false,
        message: 'Ten sach khong duoc de trong'
      });
      return;
    }

    if (!quantity || quantity < 1) {
      res.status(400).json({
        success: false,
        message: 'So luong phai lon hon 0'
      });
      return;
    }

    if (!author_ids || !Array.isArray(author_ids) || author_ids.length === 0) {
      res.status(400).json({
        success: false,
        message: 'Sach phai co it nhat 1 tac gia'
      });
      return;
    }

    const book = await bookService.updateBook(bookId, {
      title: title.trim(),
      isbn: isbn?.trim(),
      publisher: publisher?.trim(),
      publish_year: publish_year ? parseInt(publish_year) : undefined,
      category_id: category_id ? parseInt(category_id) : undefined,
      description: description?.trim(),
      quantity: parseInt(quantity),
      cover_image: cover_image?.trim(),
      author_ids: author_ids.map((id: any) => parseInt(id))
    });

    res.json({
      success: true,
      message: 'Cap nhat sach thanh cong',
      data: book
    });
  } catch (error) {
    console.error('Loi khi cap nhat sach:', error);
    
    if (error instanceof Error && error.message === 'Khong tim thay sach') {
      res.status(404).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Loi server khi cap nhat sach'
      });
    }
  }
}

/**
 * Xoa sach
 */
export async function deleteBook(req: AuthRequest, res: Response): Promise<void> {
  try {
    const bookId = parseInt(req.params.id);

    if (isNaN(bookId)) {
      res.status(400).json({
        success: false,
        message: 'ID sach khong hop le'
      });
      return;
    }

    await bookService.deleteBook(bookId);

    res.json({
      success: true,
      message: 'Xoa sach thanh cong'
    });
  } catch (error) {
    console.error('Loi khi xoa sach:', error);

    if (error instanceof Error) {
      if (error.message.includes('dang duoc muon')) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else if (error.message === 'Khong tim thay sach') {
        res.status(404).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Loi server khi xoa sach'
        });
      }
    } else {
      res.status(500).json({
        success: false,
        message: 'Loi server khi xoa sach'
      });
    }
  }
}
