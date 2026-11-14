import { useState, useEffect } from 'react';

interface Category {
  category_id: number;
  category_name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

interface CategoriesProps {
  token: string;
  userRole: string;
}

function Categories({ token, userRole }: CategoriesProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Form data
  const [formData, setFormData] = useState({
    category_name: '',
    description: ''
  });

  // Kiểm tra quyền
  const canModify = userRole === 'librarian' || userRole === 'admin';
  const canDelete = userRole === 'librarian' || userRole === 'admin';

  // Lấy danh sách thể loại
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/categories', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      } else {
        setMessage('Không thể tải danh sách thể loại');
      }
    } catch (error) {
      setMessage('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [token]);

  // Xử lý thêm/sửa thể loại
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const url = editingId 
        ? `http://localhost:5000/api/categories/${editingId}`
        : 'http://localhost:5000/api/categories';
      
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
        setFormData({ category_name: '', description: '' });
        fetchCategories();
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
    if (!confirm('Bạn có chắc muốn xóa thể loại này?')) return;

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`http://localhost:5000/api/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Xóa thành công!');
        fetchCategories();
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
  const handleEdit = (category: Category) => {
    setEditingId(category.category_id);
    setFormData({
      category_name: category.category_name,
      description: category.description || ''
    });
    setShowForm(true);
  };

  // Hủy form
  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({ category_name: '', description: '' });
  };

  return (
    <div className="management-section">
      <div className="section-header">
        <h2>Quản Lý Thể Loại</h2>
        {canModify && !showForm && (
          <button className="btn btn-add" onClick={() => setShowForm(true)}>
            + Thêm Thể Loại
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
          <h3>{editingId ? 'Chỉnh Sửa Thể Loại' : 'Thêm Thể Loại Mới'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="category_name">Tên thể loại *</label>
              <input
                type="text"
                id="category_name"
                value={formData.category_name}
                onChange={(e) => setFormData({...formData, category_name: e.target.value})}
                required
                placeholder="Ví dụ: Văn học Việt Nam"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Mô tả</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Mô tả về thể loại này..."
                rows={3}
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

      {/* Danh sách thể loại */}
      <div className="data-table">
        {loading && <div className="loading">Đang tải...</div>}
        
        {!loading && categories.length === 0 && (
          <div className="empty-state">Chưa có thể loại nào</div>
        )}

        {!loading && categories.length > 0 && (
          <table>
            <thead>
              <tr>
                <th style={{ width: '60px' }}>ID</th>
                <th>Tên Thể Loại</th>
                <th>Mô Tả</th>
                <th style={{ width: '180px' }}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((category) => (
                <tr key={category.category_id}>
                  <td>{category.category_id}</td>
                  <td><strong>{category.category_name}</strong></td>
                  <td>{category.description || <em style={{ color: '#999' }}>Không có mô tả</em>}</td>
                  <td className="actions">
                    {canModify && (
                      <button 
                        className="btn-action btn-edit" 
                        onClick={() => handleEdit(category)}
                      >
                        Sửa
                      </button>
                    )}
                    {canDelete && (
                      <button 
                        className="btn-action btn-delete" 
                        onClick={() => handleDelete(category.category_id)}
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

export default Categories;
