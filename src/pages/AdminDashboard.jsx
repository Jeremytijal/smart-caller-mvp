import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Users, Bot, Building2, Target, MessageSquare, 
    Calendar, Shield, ChevronDown, ChevronUp, 
    Search, Filter, RefreshCw, LogOut, Eye,
    Clock, CheckCircle, XCircle, AlertCircle, Send, Megaphone,
    Edit3, Save, X, Mail, Hash, CreditCard, Copy
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { endpoints } from '../config';
import './AdminDashboard.css';

/**
 * Admin Dashboard - Accessible uniquement aux administrateurs
 * Affiche tous les agents créés par les utilisateurs
 */

// Liste des emails autorisés comme admin
const ADMIN_EMAILS = ['jeremyleplu@gmail.com'];

const AdminDashboard = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [profiles, setProfiles] = useState([]);
    const [campaigns, setCampaigns] = useState([]);
    const [stats, setStats] = useState({
        totalUsers: 0,
        usersWithAgents: 0,
        totalAgents: 0,
        activeSubscriptions: 0,
        totalCampaigns: 0,
        totalMessages: 0,
        sandboxTotal: 0,
        sandboxQualified: 0
    });
    const [expandedAgent, setExpandedAgent] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all'); // all, with-agent, without-agent
    const [activeTab, setActiveTab] = useState('users'); // users, campaigns
    const [editingProfile, setEditingProfile] = useState(null);
    const [editData, setEditData] = useState({});
    const [saving, setSaving] = useState(false);
    const [copied, setCopied] = useState(null);
    
    // Vérifier si l'utilisateur est admin
    const isAdmin = user && ADMIN_EMAILS.includes(user.email);
    
    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        
        if (!isAdmin) {
            navigate('/');
            return;
        }
        
        fetchAllData();
    }, [user, isAdmin, navigate]);
    
    const [error, setError] = useState(null);
    
    const fetchAllData = async () => {
        setLoading(true);
        setError(null);
        
        console.log('[ADMIN] Fetching data with email:', user.email);
        console.log('[ADMIN] Endpoints:', endpoints.adminProfiles);
        
        try {
            // Fetch profiles
            const profilesRes = await fetch(endpoints.adminProfiles, {
                headers: { 'X-Admin-Email': user.email }
            });
            
            console.log('[ADMIN] Profiles response status:', profilesRes.status);
            
            if (!profilesRes.ok) {
                const errorText = await profilesRes.text();
                console.error('[ADMIN] Profiles error:', errorText);
                setError(`Erreur API: ${profilesRes.status} - ${errorText}`);
                setLoading(false);
                return;
            }
            
            const profilesData = await profilesRes.json();
            console.log('[ADMIN] Profiles data:', profilesData);
            
            if (profilesData.success) {
                setProfiles(profilesData.profiles || []);
            } else {
                setError(profilesData.error || 'Erreur inconnue');
            }
            
            // Fetch campaigns
            const campaignsRes = await fetch(endpoints.adminCampaigns, {
                headers: { 'X-Admin-Email': user.email }
            });
            const campaignsData = await campaignsRes.json();
            
            if (campaignsData.success) {
                setCampaigns(campaignsData.campaigns || []);
            }
            
            // Fetch stats
            const statsRes = await fetch(endpoints.adminStats, {
                headers: { 'X-Admin-Email': user.email }
            });
            const statsData = await statsRes.json();
            
            if (statsData.success) {
                setStats({
                    totalUsers: statsData.stats.users.total,
                    usersWithAgents: statsData.stats.users.withAgents,
                    totalAgents: statsData.stats.users.withAgents,
                    activeSubscriptions: statsData.stats.users.activeSubscriptions,
                    totalCampaigns: statsData.stats.campaigns.total,
                    totalMessages: statsData.stats.messages.total,
                    messagesSent: statsData.stats.campaigns.messagesSent,
                    sandboxTotal: statsData.stats.sandbox.total,
                    sandboxQualified: statsData.stats.sandbox.qualified,
                    sandboxRate: statsData.stats.sandbox.qualificationRate
                });
            }
            
        } catch (error) {
            console.error('[ADMIN] Error fetching admin data:', error);
            setError(`Erreur: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };
    
    const startEditing = (profile) => {
        setEditingProfile(profile.id);
        setEditData({
            agent_config: { ...profile.agent_config },
            first_message_template: profile.first_message_template || '',
            subscription_status: profile.subscription_status || '',
            subscription_plan: profile.subscription_plan || ''
        });
    };

    const cancelEditing = () => {
        setEditingProfile(null);
        setEditData({});
    };

    const saveProfile = async (profileId) => {
        setSaving(true);
        try {
            const response = await fetch(endpoints.adminUpdateProfile(profileId), {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'X-Admin-Email': user.email 
                },
                body: JSON.stringify(editData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                // Update local state
                setProfiles(prev => prev.map(p => 
                    p.id === profileId ? { ...p, ...editData } : p
                ));
                setEditingProfile(null);
                setEditData({});
            } else {
                alert('Erreur: ' + result.error);
            }
        } catch (error) {
            console.error('Error saving profile:', error);
            alert('Erreur lors de la sauvegarde');
        } finally {
            setSaving(false);
        }
    };

    const copyToClipboard = (text, field) => {
        navigator.clipboard.writeText(text);
        setCopied(field);
        setTimeout(() => setCopied(null), 2000);
    };

    const filteredProfiles = profiles.filter(profile => {
        // Filtre par recherche
        const matchesSearch = 
            profile.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            profile.agent_config?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            profile.agent_config?.company?.toLowerCase().includes(searchTerm.toLowerCase());
            
        // Filtre par type
        const hasAgent = profile.agent_config && profile.agent_config.name;
        if (filter === 'with-agent' && !hasAgent) return false;
        if (filter === 'without-agent' && hasAgent) return false;
        
        return matchesSearch;
    });
    
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };
    
    const getSubscriptionBadge = (status) => {
        switch (status) {
            case 'active':
                return <span className="badge active"><CheckCircle size={12} /> Actif</span>;
            case 'trialing':
                return <span className="badge trialing"><Clock size={12} /> Essai</span>;
            case 'canceled':
                return <span className="badge canceled"><XCircle size={12} /> Annulé</span>;
            default:
                return <span className="badge none"><AlertCircle size={12} /> Aucun</span>;
        }
    };
    
    if (!isAdmin) {
        return (
            <div className="admin-denied">
                <Shield size={48} />
                <h2>Accès refusé</h2>
                <p>Vous n'avez pas les droits d'accès à cette page.</p>
                <button onClick={() => navigate('/')}>Retour à l'accueil</button>
            </div>
        );
    }
    
    return (
        <div className="admin-dashboard">
            {/* Header */}
            <header className="admin-header">
                <div className="header-left">
                    <Shield size={24} />
                    <h1>Admin Dashboard</h1>
                </div>
                <div className="header-right">
                    <span className="admin-email">{user?.email}</span>
                    <button className="btn-logout" onClick={signOut}>
                        <LogOut size={18} />
                    </button>
                </div>
            </header>
            
            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon blue">
                        <Users size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.totalUsers}</span>
                        <span className="stat-label">Utilisateurs</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon green">
                        <Bot size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.usersWithAgents}</span>
                        <span className="stat-label">Agents créés</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon orange">
                        <CheckCircle size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.activeSubscriptions}</span>
                        <span className="stat-label">Abonnements actifs</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon purple">
                        <Megaphone size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.totalCampaigns}</span>
                        <span className="stat-label">Campagnes</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon teal">
                        <Send size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.messagesSent || 0}</span>
                        <span className="stat-label">Messages envoyés</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon pink">
                        <MessageSquare size={24} />
                    </div>
                    <div className="stat-content">
                        <span className="stat-value">{stats.sandboxTotal}</span>
                        <span className="stat-label">Sandbox ({stats.sandboxRate || 0}% qualifiés)</span>
                    </div>
                </div>
            </div>
            
            {/* Tabs */}
            <div className="admin-tabs">
                <button 
                    className={activeTab === 'users' ? 'active' : ''} 
                    onClick={() => setActiveTab('users')}
                >
                    <Users size={18} /> Utilisateurs & Agents
                </button>
                <button 
                    className={activeTab === 'campaigns' ? 'active' : ''} 
                    onClick={() => setActiveTab('campaigns')}
                >
                    <Megaphone size={18} /> Campagnes
                </button>
            </div>
            
            {/* Filters */}
            <div className="filters-bar">
                <div className="search-box">
                    <Search size={18} />
                    <input 
                        type="text"
                        placeholder={activeTab === 'users' ? "Rechercher par email, nom d'agent..." : "Rechercher une campagne..."}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {activeTab === 'users' && (
                    <div className="filter-tabs">
                        <button 
                            className={filter === 'all' ? 'active' : ''}
                            onClick={() => setFilter('all')}
                        >
                            Tous ({profiles.length})
                        </button>
                        <button 
                            className={filter === 'with-agent' ? 'active' : ''}
                            onClick={() => setFilter('with-agent')}
                        >
                            Avec agent ({profiles.filter(p => p.agent_config?.name).length})
                        </button>
                        <button 
                            className={filter === 'without-agent' ? 'active' : ''}
                            onClick={() => setFilter('without-agent')}
                        >
                            Sans agent ({profiles.filter(p => !p.agent_config?.name).length})
                        </button>
                    </div>
                )}
                <button className="btn-refresh" onClick={fetchAllData} disabled={loading}>
                    <RefreshCw size={18} className={loading ? 'spinning' : ''} />
                    Actualiser
                </button>
            </div>
            
            {/* Error Display */}
            {error && (
                <div className="error-banner">
                    <AlertCircle size={20} />
                    <span>{error}</span>
                    <button onClick={fetchAllData}>Réessayer</button>
                </div>
            )}

            {/* Content */}
            <div className="admin-content">
                {loading ? (
                    <div className="loading-state">
                        <RefreshCw size={32} className="spinning" />
                        <p>Chargement des données...</p>
                    </div>
                ) : activeTab === 'campaigns' ? (
                    /* Campaigns List */
                    <div className="campaigns-list">
                        {campaigns.length === 0 ? (
                            <div className="empty-state">
                                <Megaphone size={48} />
                                <p>Aucune campagne trouvée</p>
                            </div>
                        ) : (
                            campaigns
                                .filter(c => c.name?.toLowerCase().includes(searchTerm.toLowerCase()))
                                .map((campaign) => (
                                    <div key={campaign.id} className="campaign-card">
                                        <div className="campaign-header">
                                            <div className="campaign-info">
                                                <Megaphone size={20} />
                                                <div>
                                                    <span className="campaign-name">{campaign.name || 'Sans nom'}</span>
                                                    <span className="campaign-agent">Agent: {campaign.agent_id?.substring(0, 8)}...</span>
                                                </div>
                                            </div>
                                            <div className="campaign-stats">
                                                <span className={`badge ${campaign.status || 'draft'}`}>
                                                    {campaign.status || 'Brouillon'}
                                                </span>
                                                <span className="stat">
                                                    <Send size={14} /> {campaign.sent_count || 0} envoyés
                                                </span>
                                                <span className="stat">
                                                    <Users size={14} /> {campaign.total_contacts || 0} contacts
                                                </span>
                                                <span className="date">
                                                    <Calendar size={14} /> {formatDate(campaign.created_at)}
                                                </span>
                                            </div>
                                        </div>
                                        {campaign.first_message && (
                                            <div className="campaign-message">
                                                <strong>Message:</strong> {campaign.first_message.substring(0, 150)}...
                                            </div>
                                        )}
                                    </div>
                                ))
                        )}
                    </div>
                ) : (
                    /* Users List */
                    filteredProfiles.length === 0 ? (
                        <div className="empty-state">
                            <Users size={48} />
                            <p>Aucun utilisateur trouvé</p>
                        </div>
                    ) : (
                        <div className="agents-list">
                            {filteredProfiles.map((profile) => (
                        <div 
                            key={profile.id} 
                            className={`agent-card ${expandedAgent === profile.id ? 'expanded' : ''}`}
                        >
                            <div 
                                className="agent-header"
                                onClick={() => setExpandedAgent(expandedAgent === profile.id ? null : profile.id)}
                            >
                                <div className="agent-info">
                                    <div className="agent-avatar">
                                        {profile.agent_config?.name ? (
                                            <Bot size={20} />
                                        ) : (
                                            <Users size={20} />
                                        )}
                                    </div>
                                    <div className="agent-meta">
                                        <span className="agent-email">{profile.email}</span>
                                        {profile.agent_config?.name && (
                                            <span className="agent-name">
                                                <Bot size={14} /> {profile.agent_config.name}
                                                {profile.agent_config.company && ` • ${profile.agent_config.company}`}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="agent-badges">
                                    {getSubscriptionBadge(profile.subscription_status)}
                                    <span className="date">
                                        <Calendar size={14} />
                                        {formatDate(profile.created_at)}
                                    </span>
                                    {expandedAgent === profile.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                            </div>
                            
                            {expandedAgent === profile.id && (
                                <div className="agent-details">
                                    {/* User Info Section */}
                                    <div className="details-section user-info-section">
                                        <h4><Users size={16} /> Informations Utilisateur</h4>
                                        <div className="details-grid">
                                            <div className="detail-item copyable" onClick={() => copyToClipboard(profile.id, `id-${profile.id}`)}>
                                                <span className="label">ID Utilisateur</span>
                                                <span className="value id-value">
                                                    <Hash size={12} />
                                                    {profile.id}
                                                    <Copy size={12} className={copied === `id-${profile.id}` ? 'copied' : ''} />
                                                </span>
                                            </div>
                                            <div className="detail-item copyable" onClick={() => copyToClipboard(profile.email, `email-${profile.id}`)}>
                                                <span className="label">Email</span>
                                                <span className="value">
                                                    <Mail size={12} />
                                                    {profile.email}
                                                    <Copy size={12} className={copied === `email-${profile.id}` ? 'copied' : ''} />
                                                </span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="label">Dernière activité</span>
                                                <span className="value">{formatDate(profile.updated_at)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Edit/Save Buttons */}
                                    <div className="admin-actions">
                                        {editingProfile === profile.id ? (
                                            <>
                                                <button className="btn-save" onClick={() => saveProfile(profile.id)} disabled={saving}>
                                                    <Save size={16} />
                                                    {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                                                </button>
                                                <button className="btn-cancel" onClick={cancelEditing}>
                                                    <X size={16} />
                                                    Annuler
                                                </button>
                                            </>
                                        ) : (
                                            <button className="btn-edit" onClick={() => startEditing(profile)}>
                                                <Edit3 size={16} />
                                                Modifier
                                            </button>
                                        )}
                                    </div>

                                    {profile.agent_config && profile.agent_config.name ? (
                                        <>
                                            <div className="details-section">
                                                <h4><Bot size={16} /> Configuration Agent</h4>
                                                {editingProfile === profile.id ? (
                                                    <div className="edit-grid">
                                                        <div className="edit-field">
                                                            <label>Nom de l'agent</label>
                                                            <input 
                                                                type="text" 
                                                                value={editData.agent_config?.name || ''} 
                                                                onChange={(e) => setEditData({
                                                                    ...editData,
                                                                    agent_config: { ...editData.agent_config, name: e.target.value }
                                                                })}
                                                            />
                                                        </div>
                                                        <div className="edit-field">
                                                            <label>Rôle</label>
                                                            <input 
                                                                type="text" 
                                                                value={editData.agent_config?.role || ''} 
                                                                onChange={(e) => setEditData({
                                                                    ...editData,
                                                                    agent_config: { ...editData.agent_config, role: e.target.value }
                                                                })}
                                                            />
                                                        </div>
                                                        <div className="edit-field">
                                                            <label>Entreprise</label>
                                                            <input 
                                                                type="text" 
                                                                value={editData.agent_config?.company || ''} 
                                                                onChange={(e) => setEditData({
                                                                    ...editData,
                                                                    agent_config: { ...editData.agent_config, company: e.target.value }
                                                                })}
                                                            />
                                                        </div>
                                                        <div className="edit-field">
                                                            <label>Objectif</label>
                                                            <select 
                                                                value={editData.agent_config?.goal || 'qualify'} 
                                                                onChange={(e) => setEditData({
                                                                    ...editData,
                                                                    agent_config: { ...editData.agent_config, goal: e.target.value }
                                                                })}
                                                            >
                                                                <option value="qualify">Qualifier</option>
                                                                <option value="book">Prendre RDV</option>
                                                                <option value="qualify_and_book">Qualifier + RDV</option>
                                                                <option value="nurture">Nurturing</option>
                                                            </select>
                                                        </div>
                                                        <div className="edit-field full-width">
                                                            <label>Contexte</label>
                                                            <textarea 
                                                                value={editData.agent_config?.context || ''} 
                                                                onChange={(e) => setEditData({
                                                                    ...editData,
                                                                    agent_config: { ...editData.agent_config, context: e.target.value }
                                                                })}
                                                                rows={4}
                                                            />
                                                        </div>
                                                        <div className="edit-field full-width">
                                                            <label>Premier message</label>
                                                            <textarea 
                                                                value={editData.first_message_template || ''} 
                                                                onChange={(e) => setEditData({
                                                                    ...editData,
                                                                    first_message_template: e.target.value
                                                                })}
                                                                rows={3}
                                                            />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="details-grid">
                                                        <div className="detail-item">
                                                            <span className="label">Nom</span>
                                                            <span className="value">{profile.agent_config.name || 'N/A'}</span>
                                                        </div>
                                                        <div className="detail-item">
                                                            <span className="label">Rôle</span>
                                                            <span className="value">{profile.agent_config.role || 'N/A'}</span>
                                                        </div>
                                                        <div className="detail-item">
                                                            <span className="label">Entreprise</span>
                                                            <span className="value">{profile.agent_config.company || 'N/A'}</span>
                                                        </div>
                                                        <div className="detail-item">
                                                            <span className="label">Objectif</span>
                                                            <span className="value">{profile.agent_config.goal || 'N/A'}</span>
                                                        </div>
                                                        <div className="detail-item">
                                                            <span className="label">Ton</span>
                                                            <span className="value">{profile.agent_config.tone || 50}/100</span>
                                                        </div>
                                                        <div className="detail-item">
                                                            <span className="label">Vouvoiement</span>
                                                            <span className="value">{profile.agent_config.politeness || 'vous'}</span>
                                                        </div>
                                                        <div className="detail-item">
                                                            <span className="label">Langue</span>
                                                            <span className="value">{profile.agent_config.language || 'Français'}</span>
                                                        </div>
                                                        <div className="detail-item">
                                                            <span className="label">Industrie</span>
                                                            <span className="value">{profile.agent_config.industry || 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            {profile.agent_config.icp && !editingProfile && (
                                                <div className="details-section">
                                                    <h4><Target size={16} /> ICP (Profil Client Idéal)</h4>
                                                    <div className="details-grid">
                                                        <div className="detail-item">
                                                            <span className="label">Secteur</span>
                                                            <span className="value">{profile.agent_config.icp.sector || profile.agent_config.icpSector || 'N/A'}</span>
                                                        </div>
                                                        <div className="detail-item">
                                                            <span className="label">Taille</span>
                                                            <span className="value">{profile.agent_config.icp.size || profile.agent_config.icpSize || 'N/A'}</span>
                                                        </div>
                                                        <div className="detail-item">
                                                            <span className="label">Décideur</span>
                                                            <span className="value">{profile.agent_config.icp.decider || profile.agent_config.icpDecider || 'N/A'}</span>
                                                        </div>
                                                        <div className="detail-item">
                                                            <span className="label">Budget</span>
                                                            <span className="value">{profile.agent_config.icp.budget || profile.agent_config.icpBudget || 'N/A'}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {profile.first_message_template && !editingProfile && (
                                                <div className="details-section">
                                                    <h4><MessageSquare size={16} /> Premier message</h4>
                                                    <div className="message-preview">
                                                        {profile.first_message_template}
                                                    </div>
                                                </div>
                                            )}
                                            
                                            {profile.agent_config.context && !editingProfile && (
                                                <div className="details-section">
                                                    <h4><Eye size={16} /> Contexte</h4>
                                                    <div className="context-preview">
                                                        {profile.agent_config.context}
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    ) : (
                                        <div className="no-agent">
                                            <AlertCircle size={24} />
                                            <p>Cet utilisateur n'a pas encore créé d'agent.</p>
                                        </div>
                                    )}
                                    
                                    <div className="details-section subscription-section">
                                        <h4><CreditCard size={16} /> Abonnement</h4>
                                        {editingProfile === profile.id ? (
                                            <div className="edit-grid">
                                                <div className="edit-field">
                                                    <label>Plan</label>
                                                    <select 
                                                        value={editData.subscription_plan || ''} 
                                                        onChange={(e) => setEditData({
                                                            ...editData,
                                                            subscription_plan: e.target.value
                                                        })}
                                                    >
                                                        <option value="">Aucun</option>
                                                        <option value="starter">Starter</option>
                                                        <option value="growth">Growth</option>
                                                        <option value="scale">Scale</option>
                                                    </select>
                                                </div>
                                                <div className="edit-field">
                                                    <label>Statut</label>
                                                    <select 
                                                        value={editData.subscription_status || ''} 
                                                        onChange={(e) => setEditData({
                                                            ...editData,
                                                            subscription_status: e.target.value
                                                        })}
                                                    >
                                                        <option value="">Inactif</option>
                                                        <option value="trial">Essai</option>
                                                        <option value="active">Actif</option>
                                                        <option value="canceled">Annulé</option>
                                                        <option value="past_due">Impayé</option>
                                                    </select>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="details-grid">
                                                <div className="detail-item">
                                                    <span className="label">Plan</span>
                                                    <span className="value">{profile.subscription_plan || 'Aucun'}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <span className="label">Statut</span>
                                                    <span className="value">{profile.subscription_status || 'Inactif'}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <span className="label">Fin d'essai</span>
                                                    <span className="value">{formatDate(profile.trial_ends_at)}</span>
                                                </div>
                                                <div className="detail-item">
                                                    <span className="label">Dernière mise à jour</span>
                                                    <span className="value">{formatDate(profile.updated_at)}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default AdminDashboard;

