import { useState, useEffect } from 'react';

interface Book {
  book_id: number;
  title: string;
  isbn: string | null;
  publisher: string | null;
  publish_year: number | null;
  category_id: number | null;
  category_name: string | null;
  description: string | null;
  quantity: number;
  available_quantity: number;
  cover_image: string | null;
  authors: Array<{ author_id: number; author_name: string }>;
  created_at: string;
  updated_at: string;
}

interface Category {
  category_id: number;
  category_name: string;
}

interface Author {
  author_id: number;
  author_name: string;
}

interface BooksProps {
  token: string;
  userRole: string;
}

function Books({ token, userRole }: BooksProps) {
  const [books, setBooks] = useState<Book[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Form data
  const [formData, setFormData] = useState({
    title: '',
    isbn: '',
    publisher: '',
    publish_year: '',
    category_id: '',
    description: '',
    quantity: '1',
    cover_image: '',
    author_ids: [] as number[]
  });

  // Kiểm tra quyền
  const canModify = userRole === 'librarian' || userRole === 'admin';
  const canDelete = userRole === 'librarian' || userRole === 'admin';

  // Lấy danh sách sách
  const fetchBooks = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/books', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setBooks(data.data);
      } else {
        setMessage('Không thể tải danh sách sách');
      }
    } catch (error) {
      setMessage('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  // Lấy danh sách thể loại
  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/categories', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setCategories(data.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải thể loại:', error);
    }
  };

  // Lấy danh sách tác giả
  const fetchAuthors = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/authors', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (data.success) {
        setAuthors(data.data);
      }
    } catch (error) {
      console.error('Lỗi khi tải tác giả:', error);
    }
  };

  useEffect(() => {
    fetchBooks();
    fetchCategories();
    fetchAuthors();
  }, [token]);

  // Xử lý thêm/sửa sách
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const url = editingId 
        ? `http://localhost:5000/api/books/${editingId}`
        : 'http://localhost:5000/api/books';
      
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          publish_year: formData.publish_year ? parseInt(formData.publish_year) : null,
          category_id: formData.category_id ? parseInt(formData.category_id) : null,
          quantity: parseInt(formData.quantity)
        })
      });

      const data = await response.json();

      if (data.success) {
        setMessage(editingId ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
        setShowForm(false);
        setEditingId(null);
        setFormData({
          title: '',
          isbn: '',
          publisher: '',
          publish_year: '',
          category_id: '',
          description: '',
          quantity: '1',
          cover_image: '',
          author_ids: []
        });
        fetchBooks();
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
    if (!confirm('Bạn có chắc muốn xóa sách này?')) return;

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`http://localhost:5000/api/books/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Xóa thành công!');
        fetchBooks();
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
  const handleEdit = (book: Book) => {
    setEditingId(book.book_id);
    setFormData({
      title: book.title,
      isbn: book.isbn || '',
      publisher: book.publisher || '',
      publish_year: book.publish_year ? book.publish_year.toString() : '',
      category_id: book.category_id ? book.category_id.toString() : '',
      description: book.description || '',
      quantity: book.quantity.toString(),
      cover_image: book.cover_image || '',
      author_ids: book.authors.map(a => a.author_id)
    });
    setShowForm(true);
  };

  // Hủy form
  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      title: '',
      isbn: '',
      publisher: '',
      publish_year: '',
      category_id: '',
      description: '',
      quantity: '1',
      cover_image: '',
      author_ids: []
    });
  };

  // Xử lý chọn/bỏ chọn tác giả
  const toggleAuthor = (authorId: number) => {
    setFormData(prev => ({
      ...prev,
      author_ids: prev.author_ids.includes(authorId)
        ? prev.author_ids.filter(id => id !== authorId)
        : [...prev.author_ids, authorId]
    }));
  };

  return (
    <div className="management-section">
      <div className="section-header">
        <h2>Quản Lý Đầu Sách</h2>
        {canModify && !showForm && (
          <button className="btn btn-add" onClick={() => setShowForm(true)}>
            + Thêm Sách
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
          <h3>{editingId ? 'Chỉnh Sửa Sách' : 'Thêm Sách Mới'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="title">Tên sách *</label>
                <input
                  type="text"
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                  placeholder="Ví dụ: Truyện Kiều"
                />
              </div>

              <div className="form-group">
                <label htmlFor="isbn">ISBN</label>
                <input
                  type="text"
                  id="isbn"
                  value={formData.isbn}
                  onChange={(e) => setFormData({...formData, isbn: e.target.value})}
                  placeholder="978-3-16-148410-0"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="publisher">Nhà xuất bản</label>
                <input
                  type="text"
                  id="publisher"
                  value={formData.publisher}
                  onChange={(e) => setFormData({...formData, publisher: e.target.value})}
                  placeholder="NXB Văn Học"
                />
              </div>

              <div className="form-group">
                <label htmlFor="publish_year">Năm xuất bản</label>
                <input
                  type="number"
                  id="publish_year"
                  value={formData.publish_year}
                  onChange={(e) => setFormData({...formData, publish_year: e.target.value})}
                  placeholder="2024"
                  min="1900"
                  max="2100"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category_id">Thể loại</label>
                <select
                  id="category_id"
                  value={formData.category_id}
                  onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                >
                  <option value="">-- Chọn thể loại --</option>
                  {categories.map(cat => (
                    <option key={cat.category_id} value={cat.category_id}>
                      {cat.category_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="quantity">Số lượng *</label>
                <input
                  type="number"
                  id="quantity"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  required
                  min="1"
                  placeholder="1"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Tác giả * (chọn ít nhất 1)</label>
              <div className="checkbox-group">
                {authors.map(author => (
                  <label key={author.author_id} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.author_ids.includes(author.author_id)}
                      onChange={() => toggleAuthor(author.author_id)}
                    />
                    {author.author_name}
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="description">Mô tả</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Mô tả về nội dung sách..."
                rows={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="cover_image">URL ảnh bìa</label>
              <input
                type="text"
                id="cover_image"
                value={formData.cover_image}
                onChange={(e) => setFormData({...formData, cover_image: e.target.value})}
                placeholder="https://example.com/image.jpg"
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

      {/* Danh sách sách */}
      <div className="data-table">
        {loading && <div className="loading">Đang tải...</div>}
        
        {!loading && books.length === 0 && (
          <div className="empty-state">Chưa có sách nào</div>
        )}

        {!loading && books.length > 0 && (
          <table>
            <thead>
              <tr>
                <th style={{ width: '60px' }}>ID</th>
                <th>Tên Sách</th>
                <th>Tác Giả</th>
                <th>Thể Loại</th>
                <th>NXB</th>
                <th style={{ width: '80px' }}>Năm</th>
                <th style={{ width: '100px' }}>Số Lượng</th>
                <th style={{ width: '180px' }}>Thao Tác</th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.book_id}>
                  <td>{book.book_id}</td>
                  <td><strong>{book.title}</strong></td>
                  <td>
                    {book.authors.length > 0 
                      ? book.authors.map(a => a.author_name).join(', ')
                      : <em style={{ color: '#999' }}>N/A</em>
                    }
                  </td>
                  <td>{book.category_name || <em style={{ color: '#999' }}>N/A</em>}</td>
                  <td>{book.publisher || <em style={{ color: '#999' }}>N/A</em>}</td>
                  <td>{book.publish_year || <em style={{ color: '#999' }}>N/A</em>}</td>
                  <td>
                    <span style={{ color: book.available_quantity > 0 ? '#10b981' : '#ef4444' }}>
                      {book.available_quantity}/{book.quantity}
                    </span>
                  </td>
                  <td className="actions">
                    {canModify && (
                      <button 
                        className="btn-action btn-edit" 
                        onClick={() => handleEdit(book)}
                      >
                        Sửa
                      </button>
                    )}
                    {canDelete && (
                      <button 
                        className="btn-action btn-delete" 
                        onClick={() => handleDelete(book.book_id)}
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

export default Books;
