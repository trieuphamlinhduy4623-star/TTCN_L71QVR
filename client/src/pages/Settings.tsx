import { useState, useEffect } from 'react';

interface Setting {
  key: string;
  value: string;
  description: string;
}

interface SettingsProps {
  token: string;
  userRole: string;
}

function Settings({ token, userRole }: SettingsProps) {
  const [settings, setSettings] = useState<Setting[]>([]);
  const [editedSettings, setEditedSettings] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const isAdmin = userRole === 'admin';

  // Fetch settings
  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/settings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setSettings(data.data);
        // Initialize edited settings
        const initial: { [key: string]: string } = {};
        data.data.forEach((s: Setting) => {
          initial[s.key] = s.value;
        });
        setEditedSettings(initial);
      } else {
        setMessage('Không thể tải settings');
      }
    } catch (error) {
      setMessage('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchSettings();
    }
  }, [token, isAdmin]);

  // Cập nhật settings
  const handleSaveSettings = async () => {
    setLoading(true);
    setMessage('');

    try {
      // Tạo array các settings đã thay đổi
      const changedSettings = settings
        .filter(s => editedSettings[s.key] !== s.value)
        .map(s => ({
          key: s.key,
          value: editedSettings[s.key]
        }));

      if (changedSettings.length === 0) {
        setMessage('Không có thay đổi nào');
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:5000/api/settings/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ settings: changedSettings })
      });

      const data = await response.json();

      if (data.success) {
        setMessage(`Cập nhật ${changedSettings.length} cài đặt thành công!`);
        fetchSettings();
      } else {
        setMessage(data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      setMessage('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  // Reset về giá trị gốc
  const handleReset = () => {
    const initial: { [key: string]: string } = {};
    settings.forEach(s => {
      initial[s.key] = s.value;
    });
    setEditedSettings(initial);
    setMessage('Đã reset về giá trị gốc');
  };

  // Format key thành label
  const formatLabel = (key: string) => {
    return key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Phân loại settings
  const loanSettings = settings.filter(s => 
    ['max_loan_days', 'max_books', 'max_renewals', 'reserve_hold_days'].includes(s.key)
  );
  
  const fineSettings = settings.filter(s => s.key === 'fine_per_day');
  
  const cardSettings = settings.filter(s => 
    ['card_expiry_months', 'card_expiry_warning_days'].includes(s.key)
  );
  
  const inventorySettings = settings.filter(s => s.key === 'low_stock_threshold');

  if (!isAdmin) {
    return (
      <div className="management-section">
        <div className="section-header">
          <h2>🚫 Không có quyền truy cập</h2>
        </div>
        <p style={{ textAlign: 'center', color: '#666', marginTop: '40px' }}>
          Chỉ Admin mới có quyền cấu hình quy định.
        </p>
      </div>
    );
  }

  return (
    <div className="management-section">
      <div className="section-header">
        <h2>⚙️ Cấu Hình Quy Định</h2>
        <div>
          <button 
            className="btn" 
            style={{ marginRight: '10px', background: '#6b7280' }}
            onClick={handleReset}
          >
            Reset
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleSaveSettings}
            disabled={loading}
          >
            {loading ? 'Đang lưu...' : 'Lưu Thay Đổi'}
          </button>
        </div>
      </div>

      {message && (
        <div className={`message ${message.includes('thành công') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {loading && <div className="loading">Đang tải...</div>}

      {!loading && (
        <div className="settings-container">
          {/* Quy định mượn sách */}
          <div className="settings-section">
            <h3 style={{ 
              fontSize: '18px', 
              marginBottom: '20px', 
              color: '#1f2937',
              borderBottom: '2px solid #3b82f6',
              paddingBottom: '10px'
            }}>
              📚 Quy Định Mượn Sách
            </h3>
            
            {loanSettings.map(setting => (
              <div key={setting.key} className="setting-item">
                <label>
                  <strong>{setting.description}</strong>
                  <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                    {setting.key}
                  </div>
                </label>
                <input
                  type="number"
                  value={editedSettings[setting.key] || ''}
                  onChange={(e) => setEditedSettings({
                    ...editedSettings,
                    [setting.key]: e.target.value
                  })}
                  style={{ maxWidth: '150px' }}
                />
              </div>
            ))}
          </div>

          {/* Phí phạt */}
          <div className="settings-section">
            <h3 style={{ 
              fontSize: '18px', 
              marginBottom: '20px', 
              color: '#1f2937',
              borderBottom: '2px solid #ef4444',
              paddingBottom: '10px'
            }}>
              💰 Phí Phạt
            </h3>
            
            {fineSettings.map(setting => (
              <div key={setting.key} className="setting-item">
                <label>
                  <strong>{setting.description}</strong>
                  <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                    {setting.key}
                  </div>
                </label>
                <input
                  type="number"
                  value={editedSettings[setting.key] || ''}
                  onChange={(e) => setEditedSettings({
                    ...editedSettings,
                    [setting.key]: e.target.value
                  })}
                  style={{ maxWidth: '150px' }}
                />
              </div>
            ))}
          </div>

          {/* Thẻ độc giả */}
          <div className="settings-section">
            <h3 style={{ 
              fontSize: '18px', 
              marginBottom: '20px', 
              color: '#1f2937',
              borderBottom: '2px solid #10b981',
              paddingBottom: '10px'
            }}>
              💳 Thẻ Độc Giả
            </h3>
            
            {cardSettings.map(setting => (
              <div key={setting.key} className="setting-item">
                <label>
                  <strong>{setting.description}</strong>
                  <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                    {setting.key}
                  </div>
                </label>
                <input
                  type="number"
                  value={editedSettings[setting.key] || ''}
                  onChange={(e) => setEditedSettings({
                    ...editedSettings,
                    [setting.key]: e.target.value
                  })}
                  style={{ maxWidth: '150px' }}
                />
              </div>
            ))}
          </div>

          {/* Tồn kho */}
          <div className="settings-section">
            <h3 style={{ 
              fontSize: '18px', 
              marginBottom: '20px', 
              color: '#1f2937',
              borderBottom: '2px solid #f59e0b',
              paddingBottom: '10px'
            }}>
              📦 Tồn Kho
            </h3>
            
            {inventorySettings.map(setting => (
              <div key={setting.key} className="setting-item">
                <label>
                  <strong>{setting.description}</strong>
                  <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                    {setting.key}
                  </div>
                </label>
                <input
                  type="number"
                  value={editedSettings[setting.key] || ''}
                  onChange={(e) => setEditedSettings({
                    ...editedSettings,
                    [setting.key]: e.target.value
                  })}
                  style={{ maxWidth: '150px' }}
                />
              </div>
            ))}
          </div>

          {/* Thông tin */}
          <div className="settings-info" style={{
            marginTop: '30px',
            padding: '20px',
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '8px'
          }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#0369a1' }}>ℹ️ Lưu ý:</h4>
            <ul style={{ margin: 0, paddingLeft: '20px', color: '#0c4a6e' }}>
              <li>Các thay đổi sẽ áp dụng ngay lập tức sau khi lưu</li>
              <li>Số ngày mượn tối đa: áp dụng cho mỗi lần mượn sách</li>
              <li>Số sách mượn tối đa: giới hạn số sách một độc giả có thể mượn cùng lúc</li>
              <li>Phí phạt: tính theo số ngày trễ hạn × phí mỗi ngày</li>
              <li>Thẻ độc giả mặc định có hiệu lực 12 tháng</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;
