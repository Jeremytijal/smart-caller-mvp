import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  MessageSquare,
  Users,
  Settings,
  LogOut,
  Link2,
  Megaphone,
  User,
  X,
  Mail,
  Building2,
  Calendar
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './Sidebar.css';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showAccountModal, setShowAccountModal] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/signup');
    } catch (error) {
      console.error('Failed to logout', error);
    }
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Tableau de bord', path: '/' },
    { icon: MessageSquare, label: 'Conversations', path: '/conversations' },
    { icon: Users, label: 'Contacts', path: '/contacts' },
    { icon: Megaphone, label: 'Campagnes', path: '/campaigns' },
    { icon: Link2, label: 'Intégrations', path: '/integrations' },
    { icon: Settings, label: 'Configuration', path: '/settings' },
  ];

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <>
      <aside className="sidebar glass-panel">
        <div className="sidebar-header">
          <div className="logo-container">
            <img src="/smart-caller-icon.png" alt="Smart Caller" className="logo-img" />
          </div>
          <h1 className="app-title text-orange">Smart Caller</h1>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'active' : ''}`
              }
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button className="nav-item account-btn" onClick={() => setShowAccountModal(true)}>
            <User size={20} />
            <span>Mon compte</span>
          </button>
          <button className="nav-item logout-btn" onClick={handleLogout}>
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Account Modal */}
      {showAccountModal && (
        <div className="account-modal-overlay" onClick={() => setShowAccountModal(false)}>
          <div className="account-modal" onClick={(e) => e.stopPropagation()}>
            <div className="account-modal-header">
              <h3>Mon compte</h3>
              <button className="modal-close-btn" onClick={() => setShowAccountModal(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="account-modal-body">
              <div className="account-avatar">
                <span>{user?.email?.charAt(0).toUpperCase() || 'U'}</span>
              </div>
              
              <div className="account-info">
                <div className="account-info-item">
                  <Mail size={18} />
                  <div>
                    <span className="info-label">Email</span>
                    <span className="info-value">{user?.email || 'Non défini'}</span>
                  </div>
                </div>
                
                <div className="account-info-item">
                  <User size={18} />
                  <div>
                    <span className="info-label">ID Utilisateur</span>
                    <span className="info-value info-id">{user?.id?.substring(0, 8) || 'N/A'}...</span>
                  </div>
                </div>
                
                <div className="account-info-item">
                  <Calendar size={18} />
                  <div>
                    <span className="info-label">Inscrit le</span>
                    <span className="info-value">{formatDate(user?.created_at)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="account-modal-footer">
              <button className="btn-secondary" onClick={() => setShowAccountModal(false)}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
