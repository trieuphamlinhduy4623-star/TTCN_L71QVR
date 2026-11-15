import { useState, useEffect } from 'react';

interface InventoryStats {
  total_books: number;
  total_quantity: number;
  available_quantity: number;
  borrowed_quantity: number;
  low_stock_books: number;
}

interface BookInventory {
  book_id: number;
  title: string;
  category_name: string | null;
  quantity: number;
  available_quantity: number;
  borrowed_quantity: number;
  stock_status: 'available' | 'low' | 'out';
}

interface InventoryProps {
  token: string;
  userRole: string;
}

function Inventory({ token, userRole }: InventoryProps) {
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [inventory, setInventory] = useState<BookInventory[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedBook, setSelectedBook] = useState<number | null>(null);
  const [addQuantity, setAddQuantity] = useState('1');

  const canModify = userRole === 'librarian' || userRole === 'admin';

  // Lấy thống kê
  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/inventory/stats', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải thống kê:', error);
    }
  };

  // Lấy danh sách tồn kho
  const fetchInventory = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/inventory', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setInventory(data.data);
      } else {
        setMessage('Không thể tải danh sách tồn kho');
      }
    } catch (error) {
      setMessage('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchInventory();
  }, [token]);

  // Xử lý nhập thêm sách
  const handleAddStock = async () => {
    if (!selectedBook || !addQuantity || parseInt(addQuantity) <= 0) {
      setMessage('Vui lòng nhập số lượng hợp lệ');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`http://localhost:5000/api/inventory/${selectedBook}/add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ quantity: parseInt(addQuantity) })
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Nhập kho thành công!');
        setShowAddModal(false);
        setSelectedBook(null);
        setAddQuantity('1');
        fetchStats();
        fetchInventory();
      } else {
        setMessage(data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      setMessage('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  // Mở modal nhập thêm
  const openAddModal = (bookId: number) => {
    setSelectedBook(bookId);
    setAddQuantity('1');
    setShowAddModal(true);
    setMessage('');
  };

  // Đóng modal
  const closeAddModal = () => {
    setShowAddModal(false);
    setSelectedBook(null);
    setAddQuantity('1');
  };

  // Màu sắc theo trạng thái
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return '#10b981';
      case 'low': return '#f59e0b';
      case 'out': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Còn hàng';
      case 'low': return 'Sắp hết';
      case 'out': return 'Hết hàng';
      default: return 'N/A';
    }
  };

  return (
    <div className="management-section">
      <div className="section-header">
        <h2>📦 Quản Lý Tồn Kho</h2>
      </div>

      {message && (
        <div className={`message ${message.includes('thành công') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {/* Thống kê tổng quan */}
      {stats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#dbeafe' }}>📚</div>
            <div className="stat-content">
              <div className="stat-label">Tổng đầu sách</div>
              <div className="stat-value">{stats.total_books}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#dcfce7' }}>📖</div>
            <div className="stat-content">
              <div className="stat-label">Tổng số sách</div>
              <div className="stat-value">{stats.total_quantity}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#d1fae5' }}>✅</div>
            <div className="stat-content">
              <div className="stat-label">Có sẵn</div>
              <div className="stat-value" style={{ color: '#10b981' }}>{stats.available_quantity}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fef3c7' }}>📤</div>
            <div className="stat-content">
              <div className="stat-label">Đang mượn</div>
              <div className="stat-value" style={{ color: '#f59e0b' }}>{stats.borrowed_quantity}</div>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon" style={{ background: '#fee2e2' }}>⚠️</div>
            <div className="stat-content">
              <div className="stat-label">Sắp hết</div>
              <div className="stat-value" style={{ color: '#ef4444' }}>{stats.low_stock_books}</div>
            </div>
          </div>
        </div>
      )}

      {/* Danh sách tồn kho */}
      <div className="data-table" style={{ marginTop: '30px' }}>
        <h3 style={{ marginBottom: '15px' }}>Danh Sách Tồn Kho</h3>
        
        {loading && <div className="loading">Đang tải...</div>}
        
        {!loading && inventory.length === 0 && (
          <div className="empty-state">Chưa có sách nào</div>
        )}

        {!loading && inventory.length > 0 && (
          <table>
            <thead>
              <tr>
                <th style={{ width: '60px' }}>ID</th>
                <th>Tên Sách</th>
                <th>Thể Loại</th>
                <th style={{ width: '100px' }}>Tổng SL</th>
                <th style={{ width: '100px' }}>Có Sẵn</th>
                <th style={{ width: '100px' }}>Đang Mượn</th>
                <th style={{ width: '120px' }}>Trạng Thái</th>
                <th style={{ width: '150px' }}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {inventory.map((item) => (
                <tr key={item.book_id} style={{ 
                  background: item.stock_status === 'low' ? '#fef3c7' : 
                              item.stock_status === 'out' ? '#fee2e2' : 'transparent'
                }}>
                  <td>{item.book_id}</td>
                  <td><strong>{item.title}</strong></td>
                  <td>{item.category_name || <em style={{ color: '#999' }}>N/A</em>}</td>
                  <td><strong>{item.quantity}</strong></td>
                  <td style={{ color: getStatusColor(item.stock_status) }}>
                    <strong>{item.available_quantity}</strong>
                  </td>
                  <td>{item.borrowed_quantity}</td>
                  <td>
                    <span style={{ 
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: '600',
                      background: getStatusColor(item.stock_status) + '20',
                      color: getStatusColor(item.stock_status)
                    }}>
                      {getStatusText(item.stock_status)}
                    </span>
                  </td>
                  <td className="actions">
                    {canModify && (
                      <button 
                        className="btn-action" 
                        style={{ background: '#10b981', color: 'white' }}
                        onClick={() => openAddModal(item.book_id)}
                      >
                        + Nhập Kho
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal nhập thêm */}
      {showAddModal && (
        <div className="modal-overlay" onClick={closeAddModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Nhập Thêm Sách</h3>
            <div className="form-group" style={{ marginTop: '20px' }}>
              <label htmlFor="addQuantity">Số lượng nhập thêm:</label>
              <input
                type="number"
                id="addQuantity"
                value={addQuantity}
                onChange={(e) => setAddQuantity(e.target.value)}
                min="1"
                placeholder="Nhập số lượng"
                autoFocus
              />
            </div>
            <div className="form-actions" style={{ marginTop: '20px' }}>
              <button 
                className="btn" 
                onClick={handleAddStock}
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : 'Xác Nhận'}
              </button>
              <button className="btn btn-cancel" onClick={closeAddModal}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Inventory;
