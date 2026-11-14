import { useState } from 'react';
import Categories from './Categories';
import Authors from './Authors';

interface DashboardProps {
  token: string;
  userInfo: any;
  onLogout: () => void;
}

type Tab = 'categories' | 'authors';

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
      </div>

      {/* Content */}
      <div className="dashboard-content">
        {activeTab === 'categories' && <Categories token={token} userRole={userInfo?.role} />}
        {activeTab === 'authors' && <Authors token={token} userRole={userInfo?.role} />}
      </div>
    </div>
  );
}

export default Dashboard;
