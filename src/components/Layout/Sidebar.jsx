import React, { useState, useEffect } from 'react';
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
  Calendar,
  FileText,
  Ban,
  Zap,
  TrendingUp,
  HelpCircle,
  CreditCard,
  Clock,
  AlertTriangle,
  ArrowLeft,
  BookOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabaseClient';
import { endpoints } from '../../config';
import './Sidebar.css';

const Sidebar = () => {
  const { user, logout, isImpersonating, impersonatedUser, stopImpersonation, realUser } = useAuth();
  const navigate = useNavigate();
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [usage, setUsage] = useState({ current: 0, limit: 10, plan: 'Essai gratuit', isTrial: true });
  const [subscription, setSubscription] = useState({ plan: null, status: null, trialEndsAt: null });

  useEffect(() => {
    if (user) {
      fetchUsage();
    }
  }, [user, isImpersonating]);

  const fetchUsage = async () => {
    try {
      let count = 0;
      let profile = null;

      // If impersonating, use admin API to bypass RLS
      if (isImpersonating && realUser) {
        // Fetch contacts count via admin API
        const contactsResponse = await fetch(endpoints.adminContactsByAgent(user.id), {
          headers: { 'X-Admin-Email': realUser.email }
        });
        if (contactsResponse.ok) {
          const contacts = await contactsResponse.json();
          count = contacts.length;
        }

        // Fetch profile via admin API
        const profilesResponse = await fetch(endpoints.adminProfiles, {
          headers: { 'X-Admin-Email': realUser.email }
        });
        if (profilesResponse.ok) {
          const data = await profilesResponse.json();
          profile = data.profiles?.find(p => p.id === user.id);
        }
      } else {
        // Normal mode: Get default agent first
        const { data: agents } = await supabase
          .from('agents')
          .select('id')
          .eq('user_id', user.id)
          .eq('is_default', true)
          .maybeSingle();

        if (agents) {
          // Count ALL contacts (not just this month)
          const { count: contactCount } = await supabase
            .from('contacts')
            .select('*', { count: 'exact', head: true })
            .eq('agent_id', agents.id);
          count = contactCount || 0;
        }

        // Get user's subscription plan
        const { data: profileData } = await supabase
          .from('profiles')
          .select('subscription_plan, subscription_status, trial_ends_at')
          .eq('id', user.id)
          .maybeSingle();
        profile = profileData;
      }

      // Set subscription info for account modal
      setSubscription({
        plan: profile?.subscription_plan || null,
        status: profile?.subscription_status || null,
        trialEndsAt: profile?.trial_ends_at || null
      });

      const planLimits = {
        'starter': 150,
        'growth': 500,
        'scale': 9999
      };

      // Check if user has an active paid subscription
      const hasActiveSubscription = profile?.subscription_status === 'active' && profile?.subscription_plan;
      const planName = hasActiveSubscription ? profile.subscription_plan : null;
      
      // Trial = 10 leads, Paid = plan limit
      const limit = hasActiveSubscription ? (planLimits[planName.toLowerCase()] || 150) : 10;
      const displayPlan = hasActiveSubscription 
        ? (planName.charAt(0).toUpperCase() + planName.slice(1))
        : 'Essai gratuit';

      setUsage({
        current: count || 0,
        limit,
        plan: displayPlan,
        isTrial: !hasActiveSubscription
      });
    } catch (error) {
      console.error('Error fetching usage:', error);
    }
  };

  const usagePercent = Math.min((usage.current / usage.limit) * 100, 100);
  const isNearLimit = usagePercent >= 80;

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
    { icon: Ban, label: 'Liste noire', path: '/blacklist' },
    { icon: Link2, label: 'Intégrations', path: '/integrations' },
    { icon: Settings, label: 'Configuration', path: '/settings' },
    { icon: BookOpen, label: 'Aide & FAQ', path: '/faq' },
  ];

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Handle exit impersonation
  const handleExitImpersonation = () => {
    stopImpersonation();
    navigate('/admin');
  };

  return (
    <>
      {/* Impersonation Banner */}
      {isImpersonating && (
        <div className="impersonation-banner">
          <div className="impersonation-content">
            <AlertTriangle size={18} />
            <div className="impersonation-info">
              <span className="impersonation-label">Mode Admin</span>
              <span className="impersonation-user">
                Connecté en tant que : <strong>{impersonatedUser?.email}</strong>
              </span>
            </div>
          </div>
          <button className="btn-exit-impersonation" onClick={handleExitImpersonation}>
            <ArrowLeft size={16} />
            Retour Admin
          </button>
        </div>
      )}

      <aside className={`sidebar glass-panel ${isImpersonating ? 'impersonating' : ''}`}>
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

        {/* Usage Indicator */}
        <div className={`usage-card ${isNearLimit ? 'warning' : ''} ${usage.isTrial ? 'trial' : ''}`}>
          <div className="usage-header">
            <div className={`usage-icon ${usage.isTrial ? 'trial' : ''}`}>
              <Zap size={16} />
            </div>
            <span className="usage-plan">{usage.plan}</span>
          </div>
          <div className="usage-stats">
            <span className="usage-current">{usage.current}</span>
            <span className="usage-separator">/</span>
            <span className="usage-limit">{usage.limit === 9999 ? '∞' : usage.limit}</span>
            <span className="usage-label">leads {usage.isTrial ? 'gratuits' : 'ce mois'}</span>
          </div>
          <div className="usage-bar">
            <div 
              className="usage-bar-fill" 
              style={{ width: `${usagePercent}%` }}
            ></div>
          </div>
          {(isNearLimit || usage.isTrial) && (
            <button className="usage-upgrade" onClick={() => navigate('/subscription')}>
              <TrendingUp size={14} />
              {usage.isTrial ? "S'abonner" : 'Upgrader'}
            </button>
          )}
        </div>

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

                {/* Subscription Info */}
                <div className="account-info-item subscription-item">
                  <CreditCard size={18} />
                  <div>
                    <span className="info-label">Abonnement</span>
                    <span className="info-value">
                      {subscription.plan 
                        ? subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)
                        : 'Essai gratuit'}
                      {subscription.status === 'trial' && (
                        <span className="status-badge trial">Période d'essai</span>
                      )}
                      {subscription.status === 'active' && (
                        <span className="status-badge active">Actif</span>
                      )}
                    </span>
                  </div>
                </div>

                {(subscription.status === 'trial' || !subscription.status) && subscription.trialEndsAt && (
                  <div className="account-info-item trial-item">
                    <Clock size={18} />
                    <div>
                      <span className="info-label">Fin de l'essai</span>
                      <span className="info-value trial-date">{formatDate(subscription.trialEndsAt)}</span>
                    </div>
                  </div>
                )}

                {(!subscription.status || subscription.status === 'trial') && (
                  <button 
                    className="btn-upgrade-account"
                    onClick={() => {
                      setShowAccountModal(false);
                      navigate('/subscription');
                    }}
                  >
                    <Zap size={16} />
                    Passer à un plan payant
                  </button>
                )}
              </div>
            </div>

            <div className="account-modal-footer">
              <button 
                className="btn-tour" 
                onClick={() => {
                  localStorage.removeItem('smartcaller_tour_completed');
                  setShowAccountModal(false);
                  window.location.reload();
                }}
              >
                <HelpCircle size={16} />
                Revoir le guide
              </button>
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
