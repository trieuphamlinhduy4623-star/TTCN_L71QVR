import { useState, useEffect } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import './App.css';

type Page = 'login' | 'register' | 'dashboard';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [token, setToken] = useState<string>('');
  const [userInfo, setUserInfo] = useState<any>(null);

  // Kiểm tra token trong localStorage khi load app
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUserInfo(JSON.parse(savedUser));
      setCurrentPage('dashboard');
    }
  }, []);

  // Hàm xử lý đăng nhập thành công
  const handleLoginSuccess = (tokenData: string, user: any) => {
    setToken(tokenData);
    setUserInfo(user);
    localStorage.setItem('token', tokenData);
    localStorage.setItem('user', JSON.stringify(user));
    setCurrentPage('dashboard');
  };

  // Hàm xử lý đăng xuất
  const handleLogout = () => {
    setToken('');
    setUserInfo(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentPage('login');
  };

  return (
    <div className="container">
      {currentPage === 'login' ? (
        <Login 
          onSwitchToRegister={() => setCurrentPage('register')}
          onLoginSuccess={handleLoginSuccess}
        />
      ) : currentPage === 'register' ? (
        <Register onSwitchToLogin={() => setCurrentPage('login')} />
      ) : (
        <Dashboard 
          token={token} 
          userInfo={userInfo}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default App;
