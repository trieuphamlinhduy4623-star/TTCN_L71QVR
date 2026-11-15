import { useState, useEffect } from 'react';

interface LibraryCard {
  card_id: number;
  user_id: number;
  card_number: string;
  issue_date: string;
  expiry_date: string;
  status: 'active' | 'expired' | 'locked';
  user_email: string;
  user_full_name: string;
  user_phone: string | null;
  created_at: string;
  updated_at: string;
}

interface User {
  id: number;
  email: string;
  full_name: string;
  phone: string | null;
  role: string;
  is_active: boolean;
}

interface LibraryCardsProps {
  token: string;
  userRole: string;
}

function LibraryCards({ token, userRole }: LibraryCardsProps) {
  const [cards, setCards] = useState<LibraryCard[]>([]);
  const [usersWithoutCard, setUsersWithoutCard] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRenewModal, setShowRenewModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedCardId, setSelectedCardId] = useState<number | null>(null);
  const [expiryMonths, setExpiryMonths] = useState('12');

  const canModify = userRole === 'librarian' || userRole === 'admin';
  const canDelete = userRole === 'admin';

  // Lấy danh sách thẻ
  const fetchCards = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/library-cards', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setCards(data.data);
      } else {
        setMessage('Không thể tải danh sách thẻ');
      }
    } catch (error) {
      setMessage('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  // Lấy users chưa có thẻ
  const fetchUsersWithoutCard = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/users/without-card', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      console.log('Users without card:', data); // Debug
      if (data.success) {
        setUsersWithoutCard(data.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải users:', error);
    }
  };

  useEffect(() => {
    fetchCards();
    fetchUsersWithoutCard();
  }, [token]);

  // Tạo thẻ mới
  const handleCreateCard = async () => {
    if (!selectedUserId) {
      setMessage('Vui lòng chọn độc giả');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/library-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          user_id: parseInt(selectedUserId),
          expiry_months: parseInt(expiryMonths)
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Tạo thẻ thành công!');
        setShowCreateModal(false);
        setSelectedUserId('');
        setExpiryMonths('12');
        fetchCards();
        fetchUsersWithoutCard();
      } else {
        setMessage(data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      setMessage('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  // Gia hạn thẻ
  const handleRenewCard = async () => {
    if (!selectedCardId) return;

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`http://localhost:5000/api/library-cards/${selectedCardId}/renew`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ months: parseInt(expiryMonths) })
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Gia hạn thẻ thành công!');
        setShowRenewModal(false);
        setSelectedCardId(null);
        setExpiryMonths('12');
        fetchCards();
      } else {
        setMessage(data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      setMessage('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  // Thay đổi trạng thái thẻ
  const handleChangeStatus = async (cardId: number, newStatus: string) => {
    if (!confirm(`Bạn có chắc muốn ${newStatus === 'locked' ? 'tạm khóa' : 'kích hoạt'} thẻ này?`)) return;

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`http://localhost:5000/api/library-cards/${cardId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Cập nhật trạng thái thành công!');
        fetchCards();
      } else {
        setMessage(data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      setMessage('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  // Xóa thẻ
  const handleDelete = async (cardId: number) => {
    if (!confirm('Bạn có chắc muốn xóa thẻ này?')) return;

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`http://localhost:5000/api/library-cards/${cardId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Xóa thẻ thành công!');
        fetchCards();
        fetchUsersWithoutCard();
      } else {
        setMessage(data.message || 'Không thể xóa');
      }
    } catch (error) {
      setMessage('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  // Mở modal gia hạn
  const openRenewModal = (cardId: number) => {
    setSelectedCardId(cardId);
    setExpiryMonths('12');
    setShowRenewModal(true);
    setMessage('');
  };

  // Format ngày
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  // Kiểm tra thẻ còn hạn không
  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysLeft = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return daysLeft <= 30 && daysLeft > 0;
  };

  // Màu sắc trạng thái
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'expired': return '#ef4444';
      case 'locked': return '#f59e0b';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Hoạt động';
      case 'expired': return 'Hết hạn';
      case 'locked': return 'Tạm khóa';
      default: return 'N/A';
    }
  };

  return (
    <div className="management-section">
      <div className="section-header">
        <h2>💳 Quản Lý Thẻ Độc Giả</h2>
        {canModify && (
          <button className="btn btn-add" onClick={() => setShowCreateModal(true)}>
            + Tạo Thẻ Mới
          </button>
        )}
      </div>

      {message && (
        <div className={`message ${message.includes('thành công') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {/* Danh sách thẻ */}
      <div className="data-table">
        {loading && <div className="loading">Đang tải...</div>}
        
        {!loading && cards.length === 0 && (
          <div className="empty-state">Chưa có thẻ độc giả nào</div>
        )}

        {!loading && cards.length > 0 && (
          <table>
            <thead>
              <tr>
                <th style={{ width: '120px' }}>Mã Thẻ</th>
                <th>Tên Độc Giả</th>
                <th>Email</th>
                <th>SĐT</th>
                <th style={{ width: '110px' }}>Ngày Cấp</th>
                <th style={{ width: '110px' }}>Hết Hạn</th>
                <th style={{ width: '120px' }}>Trạng Thái</th>
                <th style={{ width: '220px' }}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {cards.map((card) => (
                <tr key={card.card_id} style={{
                  background: card.status === 'expired' ? '#fee2e2' :
                              card.status === 'locked' ? '#fef3c7' :
                              isExpiringSoon(card.expiry_date) ? '#fef3c7' : 'transparent'
                }}>
                  <td><strong>{card.card_number}</strong></td>
                  <td>{card.user_full_name}</td>
                  <td>{card.user_email}</td>
                  <td>{card.user_phone || <em style={{ color: '#999' }}>N/A</em>}</td>
                  <td>{formatDate(card.issue_date)}</td>
                  <td>
                    {formatDate(card.expiry_date)}
                    {isExpiringSoon(card.expiry_date) && (
                      <span style={{ color: '#f59e0b', fontSize: '12px', marginLeft: '5px' }}>⚠️</span>
                    )}
                  </td>
                  <td>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: '600',
                      background: getStatusColor(card.status) + '20',
                      color: getStatusColor(card.status)
                    }}>
                      {getStatusText(card.status)}
                    </span>
                  </td>
                  <td className="actions">
                    {canModify && (
                      <>
                        <button 
                          className="btn-action" 
                          style={{ background: '#0ea5e9', color: 'white' }}
                          onClick={() => openRenewModal(card.card_id)}
                        >
                          Gia Hạn
                        </button>
                        {card.status === 'active' && (
                          <button 
                            className="btn-action" 
                            style={{ background: '#f59e0b', color: 'white' }}
                            onClick={() => handleChangeStatus(card.card_id, 'locked')}
                          >
                            Khóa
                          </button>
                        )}
                        {card.status === 'locked' && (
                          <button 
                            className="btn-action" 
                            style={{ background: '#10b981', color: 'white' }}
                            onClick={() => handleChangeStatus(card.card_id, 'active')}
                          >
                            Mở
                          </button>
                        )}
                      </>
                    )}
                    {canDelete && (
                      <button 
                        className="btn-action btn-delete" 
                        onClick={() => handleDelete(card.card_id)}
                      >
                        Xóa
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal tạo thẻ mới */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Tạo Thẻ Độc Giả Mới</h3>
            
            <div className="form-group" style={{ marginTop: '20px' }}>
              <label htmlFor="selectedUser">Chọn độc giả:</label>
              <select
                id="selectedUser"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(e.target.value)}
              >
                <option value="">-- Chọn độc giả --</option>
                {usersWithoutCard.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.email}
                  </option>
                ))}
              </select>
              {usersWithoutCard.length === 0 && (
                <small style={{ color: '#999', display: 'block', marginTop: '8px' }}>
                  Không có độc giả nào chưa có thẻ
                </small>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="expiryMonths">Thời hạn (tháng):</label>
              <input
                type="number"
                id="expiryMonths"
                value={expiryMonths}
                onChange={(e) => setExpiryMonths(e.target.value)}
                min="1"
                max="60"
              />
            </div>

            <div className="form-actions" style={{ marginTop: '20px' }}>
              <button 
                className="btn" 
                onClick={handleCreateCard}
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : 'Tạo Thẻ'}
              </button>
              <button className="btn btn-cancel" onClick={() => setShowCreateModal(false)}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal gia hạn */}
      {showRenewModal && (
        <div className="modal-overlay" onClick={() => setShowRenewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Gia Hạn Thẻ</h3>
            
            <div className="form-group" style={{ marginTop: '20px' }}>
              <label htmlFor="renewMonths">Gia hạn thêm (tháng):</label>
              <input
                type="number"
                id="renewMonths"
                value={expiryMonths}
                onChange={(e) => setExpiryMonths(e.target.value)}
                min="1"
                max="60"
                autoFocus
              />
            </div>

            <div className="form-actions" style={{ marginTop: '20px' }}>
              <button 
                className="btn" 
                onClick={handleRenewCard}
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : 'Xác Nhận'}
              </button>
              <button className="btn btn-cancel" onClick={() => setShowRenewModal(false)}>
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LibraryCards;
