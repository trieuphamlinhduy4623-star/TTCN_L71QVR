import { useState, useEffect } from 'react';

interface User {
  id: number;
  email: string;
  full_name: string;
  phone: string | null;
  role: 'reader' | 'librarian' | 'admin';
  is_active: boolean;
  created_at: string;
}

interface UsersProps {
  token: string;
  userRole: string;
}

function Users({ token, userRole }: UsersProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    full_name: '',
    phone: '',
    role: 'reader' as 'reader' | 'librarian' | 'admin',
    is_active: true
  });
  const [newPassword, setNewPassword] = useState('');

  const isAdmin = userRole === 'admin';

  // Fetch users
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setUsers(data.data);
      } else {
        setMessage('Không thể tải danh sách users');
      }
    } catch (error) {
      setMessage('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [token, isAdmin]);

  // Tạo user mới
  const handleCreateUser = async () => {
    if (!formData.email || !formData.password || !formData.full_name) {
      setMessage('Email, mật khẩu và họ tên là bắt buộc');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Tạo user thành công!');
        setShowCreateModal(false);
        resetForm();
        fetchUsers();
      } else {
        setMessage(data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      setMessage('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  // Cập nhật user
  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`http://localhost:5000/api/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          full_name: formData.full_name,
          phone: formData.phone,
          role: formData.role,
          is_active: formData.is_active
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Cập nhật user thành công!');
        setShowEditModal(false);
        setSelectedUser(null);
        resetForm();
        fetchUsers();
      } else {
        setMessage(data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      setMessage('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const handleResetPassword = async () => {
    if (!selectedUser) return;

    if (!newPassword || newPassword.length < 6) {
      setMessage('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`http://localhost:5000/api/users/${selectedUser.id}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ new_password: newPassword })
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Reset password thành công!');
        setShowResetPasswordModal(false);
        setSelectedUser(null);
        setNewPassword('');
      } else {
        setMessage(data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      setMessage('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  // Vô hiệu hóa user
  const handleDeactivateUser = async (userId: number) => {
    if (!confirm('Bạn có chắc muốn vô hiệu hóa user này?')) return;

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Vô hiệu hóa user thành công!');
        fetchUsers();
      } else {
        setMessage(data.message || 'Không thể vô hiệu hóa');
      }
    } catch (error) {
      setMessage('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  // Mở modal chỉnh sửa
  const openEditModal = (user: User) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      password: '',
      full_name: user.full_name,
      phone: user.phone || '',
      role: user.role,
      is_active: user.is_active
    });
    setShowEditModal(true);
    setMessage('');
  };

  // Mở modal reset password
  const openResetPasswordModal = (user: User) => {
    setSelectedUser(user);
    setNewPassword('');
    setShowResetPasswordModal(true);
    setMessage('');
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      full_name: '',
      phone: '',
      role: 'reader',
      is_active: true
    });
  };

  // Format ngày
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN');
  };

  // Màu role
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return '#ef4444';
      case 'librarian': return '#3b82f6';
      case 'reader': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getRoleText = (role: string) => {
    switch (role) {
      case 'admin': return 'Quản trị viên';
      case 'librarian': return 'Thủ thư';
      case 'reader': return 'Độc giả';
      default: return role;
    }
  };

  if (!isAdmin) {
    return (
      <div className="management-section">
        <div className="section-header">
          <h2>🚫 Không có quyền truy cập</h2>
        </div>
        <p style={{ textAlign: 'center', color: '#666', marginTop: '40px' }}>
          Chỉ Admin mới có quyền quản lý tài khoản.
        </p>
      </div>
    );
  }

  return (
    <div className="management-section">
      <div className="section-header">
        <h2>👥 Quản Lý Tài Khoản</h2>
        <button className="btn btn-add" onClick={() => { resetForm(); setShowCreateModal(true); }}>
          + Tạo User Mới
        </button>
      </div>

      {message && (
        <div className={`message ${message.includes('thành công') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {/* Danh sách users */}
      <div className="data-table">
        {loading && <div className="loading">Đang tải...</div>}
        
        {!loading && users.length === 0 && (
          <div className="empty-state">Chưa có user nào</div>
        )}

        {!loading && users.length > 0 && (
          <table>
            <thead>
              <tr>
                <th style={{ width: '50px' }}>ID</th>
                <th>Email</th>
                <th>Họ Tên</th>
                <th>Số Điện Thoại</th>
                <th style={{ width: '130px' }}>Vai Trò</th>
                <th style={{ width: '100px' }}>Trạng Thái</th>
                <th style={{ width: '110px' }}>Ngày Tạo</th>
                <th style={{ width: '250px' }}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} style={{
                  background: !user.is_active ? '#fee2e2' : 'transparent'
                }}>
                  <td>{user.id}</td>
                  <td><strong>{user.email}</strong></td>
                  <td>{user.full_name}</td>
                  <td>{user.phone || <em style={{ color: '#999' }}>N/A</em>}</td>
                  <td>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: '600',
                      background: getRoleColor(user.role) + '20',
                      color: getRoleColor(user.role)
                    }}>
                      {getRoleText(user.role)}
                    </span>
                  </td>
                  <td>
                    <span style={{
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: '600',
                      background: user.is_active ? '#10b98120' : '#ef444420',
                      color: user.is_active ? '#10b981' : '#ef4444'
                    }}>
                      {user.is_active ? 'Hoạt động' : 'Vô hiệu'}
                    </span>
                  </td>
                  <td>{formatDate(user.created_at)}</td>
                  <td className="actions">
                    <button 
                      className="btn-action" 
                      style={{ background: '#3b82f6', color: 'white' }}
                      onClick={() => openEditModal(user)}
                    >
                      Sửa
                    </button>
                    <button 
                      className="btn-action" 
                      style={{ background: '#f59e0b', color: 'white' }}
                      onClick={() => openResetPasswordModal(user)}
                    >
                      Reset PW
                    </button>
                    {user.is_active && (
                      <button 
                        className="btn-action btn-delete" 
                        onClick={() => handleDeactivateUser(user.id)}
                      >
                        Vô hiệu
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal tạo user */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Tạo User Mới</h3>
            
            <div className="form-group">
              <label>Email: <span style={{ color: 'red' }}>*</span></label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="user@example.com"
              />
            </div>

            <div className="form-group">
              <label>Mật khẩu: <span style={{ color: 'red' }}>*</span></label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Tối thiểu 6 ký tự"
              />
            </div>

            <div className="form-group">
              <label>Họ tên: <span style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                placeholder="Nguyễn Văn A"
              />
            </div>

            <div className="form-group">
              <label>Số điện thoại:</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="0123456789"
              />
            </div>

            <div className="form-group">
              <label>Vai trò: <span style={{ color: 'red' }}>*</span></label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              >
                <option value="reader">Độc giả</option>
                <option value="librarian">Thủ thư</option>
                <option value="admin">Quản trị viên</option>
              </select>
            </div>

            <div className="modal-actions">
              <button className="btn btn-cancel" onClick={() => setShowCreateModal(false)}>
                Hủy
              </button>
              <button className="btn btn-primary" onClick={handleCreateUser} disabled={loading}>
                {loading ? 'Đang tạo...' : 'Tạo User'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal chỉnh sửa user */}
      {showEditModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Chỉnh Sửa User</h3>
            
            <div className="form-group">
              <label>Email:</label>
              <input
                type="email"
                value={formData.email}
                disabled
                style={{ background: '#f3f4f6', cursor: 'not-allowed' }}
              />
              <small style={{ color: '#666' }}>Email không thể thay đổi</small>
            </div>

            <div className="form-group">
              <label>Họ tên: <span style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Số điện thoại:</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label>Vai trò:</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              >
                <option value="reader">Độc giả</option>
                <option value="librarian">Thủ thư</option>
                <option value="admin">Quản trị viên</option>
              </select>
            </div>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={formData.is_active}
                  onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                  style={{ marginRight: '8px' }}
                />
                Tài khoản hoạt động
              </label>
            </div>

            <div className="modal-actions">
              <button className="btn btn-cancel" onClick={() => setShowEditModal(false)}>
                Hủy
              </button>
              <button className="btn btn-primary" onClick={handleUpdateUser} disabled={loading}>
                {loading ? 'Đang cập nhật...' : 'Cập Nhật'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal reset password */}
      {showResetPasswordModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowResetPasswordModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Reset Mật Khẩu</h3>
            
            <p style={{ marginBottom: '20px', color: '#666' }}>
              Reset mật khẩu cho: <strong>{selectedUser.email}</strong>
            </p>

            <div className="form-group">
              <label>Mật khẩu mới: <span style={{ color: 'red' }}>*</span></label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
              />
            </div>

            <div className="modal-actions">
              <button className="btn btn-cancel" onClick={() => setShowResetPasswordModal(false)}>
                Hủy
              </button>
              <button className="btn btn-primary" onClick={handleResetPassword} disabled={loading}>
                {loading ? 'Đang reset...' : 'Reset Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Users;
