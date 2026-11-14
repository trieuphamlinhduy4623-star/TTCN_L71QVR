import { useState, useEffect } from 'react';

interface Author {
  author_id: number;
  author_name: string;
  biography: string | null;
  nationality: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthorsProps {
  token: string;
  userRole: string;
}

function Authors({ token, userRole }: AuthorsProps) {
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Form data
  const [formData, setFormData] = useState({
    author_name: '',
    biography: '',
    nationality: ''
  });

  // Kiểm tra quyền
  const canModify = userRole === 'librarian' || userRole === 'admin';
  const canDelete = userRole === 'librarian' || userRole === 'admin';

  // Lấy danh sách tác giả
  const fetchAuthors = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/authors', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setAuthors(data.data);
      } else {
        setMessage('Không thể tải danh sách tác giả');
      }
    } catch (error) {
      setMessage('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuthors();
  }, [token]);

  // Xử lý thêm/sửa tác giả
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const url = editingId 
        ? `http://localhost:5000/api/authors/${editingId}`
        : 'http://localhost:5000/api/authors';
      
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (data.success) {
        setMessage(editingId ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
        setShowForm(false);
        setEditingId(null);
        setFormData({ author_name: '', biography: '', nationality: '' });
        fetchAuthors();
      } else {
        setMessage(data.message || 'Có lỗi xảy ra');
      }
    } catch (error) {
      setMessage('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý xóa
  const handleDelete = async (id: number) => {
    if (!confirm('Bạn có chắc muốn xóa tác giả này?')) return;

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`http://localhost:5000/api/authors/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Xóa thành công!');
        fetchAuthors();
      } else {
        setMessage(data.message || 'Không thể xóa');
      }
    } catch (error) {
      setMessage('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  // Mở form chỉnh sửa
  const handleEdit = (author: Author) => {
    setEditingId(author.author_id);
    setFormData({
      author_name: author.author_name,
      biography: author.biography || '',
      nationality: author.nationality || ''
    });
    setShowForm(true);
  };

  // Hủy form
  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ author_name: '', biography: '', nationality: '' });
  };

  return (
    <div className="management-section">
      <div className="section-header">
        <h2>Quản Lý Tác Giả</h2>
        {canModify && !showForm && (
          <button className="btn btn-add" onClick={() => setShowForm(true)}>
            + Thêm Tác Giả
          </button>
        )}
      </div>

      {message && (
        <div className={`message ${message.includes('thành công') ? 'success' : 'error'}`}>
          {message}
        </div>
      )}

      {/* Form thêm/sửa */}
      {showForm && canModify && (
        <div className="form-card">
          <h3>{editingId ? 'Chỉnh Sửa Tác Giả' : 'Thêm Tác Giả Mới'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="author_name">Tên tác giả *</label>
              <input
                type="text"
                id="author_name"
                value={formData.author_name}
                onChange={(e) => setFormData({...formData, author_name: e.target.value})}
                required
                placeholder="Ví dụ: Nguyễn Du"
              />
            </div>

            <div className="form-group">
              <label htmlFor="nationality">Quốc tịch</label>
              <input
                type="text"
                id="nationality"
                value={formData.nationality}
                onChange={(e) => setFormData({...formData, nationality: e.target.value})}
                placeholder="Ví dụ: Việt Nam"
              />
            </div>

            <div className="form-group">
              <label htmlFor="biography">Tiểu sử</label>
              <textarea
                id="biography"
                value={formData.biography}
                onChange={(e) => setFormData({...formData, biography: e.target.value})}
                placeholder="Thông tin về tiểu sử tác giả..."
                rows={4}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn" disabled={loading}>
                {loading ? 'Đang xử lý...' : (editingId ? 'Cập Nhật' : 'Thêm Mới')}
              </button>
              <button type="button" className="btn btn-cancel" onClick={handleCancel}>
                Hủy
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Danh sách tác giả */}
      <div className="data-table">
        {loading && <div className="loading">Đang tải...</div>}
        
        {!loading && authors.length === 0 && (
          <div className="empty-state">Chưa có tác giả nào</div>
        )}

        {!loading && authors.length > 0 && (
          <table>
            <thead>
              <tr>
                <th style={{ width: '60px' }}>ID</th>
                <th>Tên Tác Giả</th>
                <th>Quốc Tịch</th>
                <th>Tiểu Sử</th>
                <th style={{ width: '180px' }}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {authors.map((author) => (
                <tr key={author.author_id}>
                  <td>{author.author_id}</td>
                  <td><strong>{author.author_name}</strong></td>
                  <td>{author.nationality || <em style={{ color: '#999' }}>N/A</em>}</td>
                  <td>
                    {author.biography 
                      ? (author.biography.length > 100 
                          ? author.biography.substring(0, 100) + '...' 
                          : author.biography)
                      : <em style={{ color: '#999' }}>Không có tiểu sử</em>
                    }
                  </td>
                  <td className="actions">
                    {canModify && (
                      <button 
                        className="btn-action btn-edit" 
                        onClick={() => handleEdit(author)}
                      >
                        Sửa
                      </button>
                    )}
                    {canDelete && (
                      <button 
                        className="btn-action btn-delete" 
                        onClick={() => handleDelete(author.author_id)}
                      >
                        Xóa
                      </button>
                    )}
                    {!canModify && <span style={{ color: '#999' }}>Chỉ xem</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default Authors;
