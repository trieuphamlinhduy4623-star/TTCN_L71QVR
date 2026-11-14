import { Request, Response } from 'express';
import * as authorService from '../services/author.service';

// Lấy danh sách tất cả tác giả
export const getAllAuthors = async (req: Request, res: Response): Promise<void> => {
  try {
    const authors = await authorService.getAllAuthors();
    res.json({
      success: true,
      data: authors
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách tác giả:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy danh sách tác giả'
    });
  }
};

// Lấy thông tin tác giả theo ID
export const getAuthorById = async (req: Request, res: Response): Promise<void> => {
  try {
    const authorId = parseInt(req.params.id);
    
    if (isNaN(authorId)) {
      res.status(400).json({
        success: false,
        message: 'ID tác giả không hợp lệ'
      });
      return;
    }

    const author = await authorService.getAuthorById(authorId);
    
    if (!author) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy tác giả'
      });
      return;
    }

    res.json({
      success: true,
      data: author
    });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin tác giả:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi lấy thông tin tác giả'
    });
  }
};

// Tạo tác giả mới
export const createAuthor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { author_name, biography, nationality } = req.body;

    // Validate dữ liệu đầu vào
    if (!author_name || author_name.trim() === '') {
      res.status(400).json({
        success: false,
        message: 'Tên tác giả không được để trống'
      });
      return;
    }

    const newAuthor = await authorService.createAuthor(
      author_name.trim(),
      biography?.trim(),
      nationality?.trim()
    );

    res.status(201).json({
      success: true,
      message: 'Tạo tác giả thành công',
      data: newAuthor
    });
  } catch (error) {
    console.error('Lỗi khi tạo tác giả:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi tạo tác giả'
    });
  }
};

// Cập nhật thông tin tác giả
export const updateAuthor = async (req: Request, res: Response): Promise<void> => {
  try {
    const authorId = parseInt(req.params.id);
    const { author_name, biography, nationality } = req.body;

    if (isNaN(authorId)) {
      res.status(400).json({
        success: false,
        message: 'ID tác giả không hợp lệ'
      });
      return;
    }

    // Validate dữ liệu đầu vào
    if (!author_name || author_name.trim() === '') {
      res.status(400).json({
        success: false,
        message: 'Tên tác giả không được để trống'
      });
      return;
    }

    const updatedAuthor = await authorService.updateAuthor(
      authorId,
      author_name.trim(),
      biography?.trim(),
      nationality?.trim()
    );

    if (!updatedAuthor) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy tác giả'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Cập nhật tác giả thành công',
      data: updatedAuthor
    });
  } catch (error) {
    console.error('Lỗi khi cập nhật tác giả:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi cập nhật tác giả'
    });
  }
};

// Xóa tác giả
export const deleteAuthor = async (req: Request, res: Response): Promise<void> => {
  try {
    const authorId = parseInt(req.params.id);

    if (isNaN(authorId)) {
      res.status(400).json({
        success: false,
        message: 'ID tác giả không hợp lệ'
      });
      return;
    }

    const deleted = await authorService.deleteAuthor(authorId);

    if (!deleted) {
      res.status(404).json({
        success: false,
        message: 'Không tìm thấy tác giả'
      });
      return;
    }

    res.json({
      success: true,
      message: 'Xóa tác giả thành công'
    });
  } catch (error) {
    console.error('Lỗi khi xóa tác giả:', error);
    res.status(500).json({
      success: false,
      message: 'Lỗi server khi xóa tác giả'
    });
  }
};
