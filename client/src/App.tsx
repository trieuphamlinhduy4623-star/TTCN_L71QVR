import { useState } from 'react';
import Login from './pages/Login';
import Register from './pages/Register';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState<'login' | 'register'>('login');

  return (
    <div className="container">
      {currentPage === 'login' ? (
        <Login onSwitchToRegister={() => setCurrentPage('register')} />
      ) : (
        <Register onSwitchToLogin={() => setCurrentPage('login')} />
      )}
    </div>
  );
}

export default App;
