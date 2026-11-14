import { useState } from 'react';

interface RegisterProps {
  onSwitchToLogin: () => void;
}

function Register({ onSwitchToLogin }: RegisterProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    // Kiểm tra mật khẩu khớp
    if (formData.password !== formData.confirmPassword) {
      setMessage('Mật khẩu xác nhận không khớp');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          phone: formData.phone || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Đăng ký thành công! Đang chuyển đến trang đăng nhập...');
        setTimeout(() => {
          onSwitchToLogin();
        }, 2000);
      } else {
        setMessage(data.message || 'Đăng ký thất bại');
      }
    } catch (error) {
      setMessage('Lỗi kết nối đến server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-box">
      <div className="header">
        <h1>Đăng Ký</h1>
        <p className="subtitle">Tạo tài khoản mới</p>
      </div>

      <form onSubmit={handleRegister}>
        {message && (
          <div className={message.includes('thành công') ? 'message success' : 'message error'}>
            {message}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="fullName">Họ và tên</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            required
            placeholder="Nhập họ và tên"
          />
        </div>

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Nhập email của bạn"
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Số điện thoại (tùy chọn)</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="Nhập số điện thoại"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Mật khẩu</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Nhập mật khẩu (tối thiểu 6 ký tự)"
          />
        </div>

        <div className="form-group">
          <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            placeholder="Nhập lại mật khẩu"
          />
        </div>

        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Đang xử lý...' : 'Đăng Ký'}
        </button>
      </form>

      <div className="divider">hoặc</div>

      <div className="register-link">
        Đã có tài khoản?{' '}
        <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToLogin(); }}>
          Đăng nhập tại đây
        </a>
      </div>

      <div className="footer">
        © 2026 Hệ Thống Thư Viện Số
      </div>
    </div>
  );
}

export default Register;
