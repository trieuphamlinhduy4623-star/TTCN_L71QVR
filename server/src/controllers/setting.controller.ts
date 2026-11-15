import type { Response } from 'express';
import type { AuthRequest } from '../types/index';
import * as settingService from '../services/setting.service';

/**
 * Lay tat ca settings
 */
export async function getAllSettings(req: AuthRequest, res: Response): Promise<void> {
  try {
    const settings = await settingService.getAllSettings();
    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Loi khi lay settings:', error);
    res.status(500).json({
      success: false,
      message: 'Loi server khi lay settings'
    });
  }
}

/**
 * Lay setting theo key
 */
export async function getSettingByKey(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { key } = req.params;

    const setting = await settingService.getSettingByKey(key);

    if (!setting) {
      res.status(404).json({
        success: false,
        message: 'Khong tim thay setting'
      });
      return;
    }

    res.json({
      success: true,
      data: setting
    });
  } catch (error) {
    console.error('Loi khi lay setting:', error);
    res.status(500).json({
      success: false,
      message: 'Loi server khi lay setting'
    });
  }
}

/**
 * Cap nhat setting
 */
export async function updateSetting(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { key } = req.params;
    const { value } = req.body;

    if (!value && value !== '0') {
      res.status(400).json({
        success: false,
        message: 'Gia tri setting la bat buoc'
      });
      return;
    }

    const setting = await settingService.updateSetting(key, value);

    res.json({
      success: true,
      message: 'Cap nhat setting thanh cong',
      data: setting
    });
  } catch (error) {
    console.error('Loi khi cap nhat setting:', error);

    if (error instanceof Error && error.message === 'Khong tim thay setting') {
      res.status(404).json({
        success: false,
        message: error.message
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Loi server khi cap nhat setting'
      });
    }
  }
}

/**
 * Cap nhat nhieu settings
 */
export async function updateMultipleSettings(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { settings } = req.body;

    if (!settings || !Array.isArray(settings)) {
      res.status(400).json({
        success: false,
        message: 'Danh sach settings khong hop le'
      });
      return;
    }

    const updatedSettings = await settingService.updateMultipleSettings(settings);

    res.json({
      success: true,
      message: `Cap nhat ${updatedSettings.length} settings thanh cong`,
      data: updatedSettings
    });
  } catch (error) {
    console.error('Loi khi cap nhat settings:', error);
    res.status(500).json({
      success: false,
      message: 'Loi server khi cap nhat settings'
    });
  }
}
