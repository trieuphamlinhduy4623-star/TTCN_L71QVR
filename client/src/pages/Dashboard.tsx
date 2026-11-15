import { useState } from 'react';
import Categories from './Categories';
import Authors from './Authors';
import Books from './Books';
import Inventory from './Inventory';
import LibraryCards from './LibraryCards';
import Users from './Users';
import Settings from './Settings';

interface DashboardProps {
  token: string;
  userInfo: any;
  onLogout: () => void;
}

type Tab = 'categories' | 'authors' | 'books' | 'inventory' | 'cards' | 'users' | 'settings';

function Dashboard({ token, userInfo, onLogout }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<Tab>('categories');

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-left">
          <h1>📚 Quản Lý Thư Viện Số</h1>
          <p className="user-info">
            Xin chào, <strong>{userInfo?.full_name || userInfo?.email}</strong> 
            <span className="role-badge">{userInfo?.role}</span>
          </p>
        </div>
        <button className="btn-logout" onClick={onLogout}>
          Đăng xuất
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          Thể Loại
        </button>
        <button 
          className={`tab ${activeTab === 'authors' ? 'active' : ''}`}
          onClick={() => setActiveTab('authors')}
        >
          Tác Giả
        </button>
        <button 
          className={`tab ${activeTab === 'books' ? 'active' : ''}`}
          onClick={() => setActiveTab('books')}
        >
          Đầu Sách
        </button>
        <button 
          className={`tab ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          Tồn Kho
        </button>
        <button 
          className={`tab ${activeTab === 'cards' ? 'active' : ''}`}
          onClick={() => setActiveTab('cards')}
        >
          Thẻ Độc Giả
        </button>
        {userInfo?.role === 'admin' && (
          <>
            <button 
              className={`tab ${activeTab === 'users' ? 'active' : ''}`}
              onClick={() => setActiveTab('users')}
            >
              Tài Khoản
            </button>
            <button 
              className={`tab ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              Cấu Hình
            </button>
          </>
        )}
      </div>

      {/* Content */}
      <div className="dashboard-content">
        {activeTab === 'categories' && <Categories token={token} userRole={userInfo?.role} />}
        {activeTab === 'authors' && <Authors token={token} userRole={userInfo?.role} />}
        {activeTab === 'books' && <Books token={token} userRole={userInfo?.role} />}
        {activeTab === 'inventory' && <Inventory token={token} userRole={userInfo?.role} />}
        {activeTab === 'cards' && <LibraryCards token={token} userRole={userInfo?.role} />}
        {activeTab === 'users' && <Users token={token} userRole={userInfo?.role} />}
        {activeTab === 'settings' && <Settings token={token} userRole={userInfo?.role} />}
      </div>
    </div>
  );
}

export default Dashboard;