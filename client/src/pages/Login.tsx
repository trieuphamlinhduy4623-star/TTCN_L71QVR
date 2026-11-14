import { useState } from 'react';

interface LoginProps {
  onSwitchToRegister: () => void;
}

function Login({ onSwitchToRegister }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Đăng nhập thành công!');
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
      } else {
        setMessage(data.message || 'Đăng nhập thất bại');
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
        <h1>Đăng Nhập</h1>
        <p className="subtitle">Hệ Thống Quản Lý Thư Viện Số</p>
      </div>

      <form onSubmit={handleLogin}>
        {message && (
          <div className={message.includes('thành công') ? 'message success' : 'message error'}>
            {message}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Nhập email của bạn"
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Mật khẩu</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Nhập mật khẩu"
          />
        </div>

        <button type="submit" className="btn" disabled={loading}>
          {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
        </button>
      </form>

      <div className="divider">hoặc</div>

      <div className="register-link">
        Chưa có tài khoản?{' '}
        <a href="#" onClick={(e) => { e.preventDefault(); onSwitchToRegister(); }}>
          Đăng ký tại đây
        </a>
      </div>

      <div className="footer">
        © 2026 Hệ Thống Thư Viện Số
      </div>
    </div>
  );
}

export default Login;
