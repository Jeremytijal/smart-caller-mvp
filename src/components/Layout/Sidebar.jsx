```javascript
import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    MessageSquare,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    Link2,
    Sliders
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const navItems = [
    { icon: LayoutDashboard, label: 'Tableau de bord', path: '/' },
    { icon: MessageSquare, label: 'Conversations', path: '/conversations' },
    { icon: Users, label: 'Contacts', path: '/contacts' }, // Corrected icon to Users
    { icon: Sliders, label: 'Qualité des Leads', path: '/quality' },
    { icon: Link2, label: 'Intégrations', path: '/integrations' }, // Corrected icon to Link2
    { icon: Settings, label: 'Configuration', path: '/settings' }, // Added Settings menu item
  ];

  return (
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
              `nav - item ${ isActive ? 'active' : '' } `
            }
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button className="nav-item logout-btn">
          <LogOut size={20} />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
