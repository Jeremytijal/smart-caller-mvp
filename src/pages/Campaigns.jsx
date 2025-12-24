import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Plus, Rocket, Target, Calendar, UserCheck, RefreshCw, 
    MessageSquare, Play, Pause, MoreVertical, Users, Clock,
    TrendingUp, CheckCircle, AlertCircle, Search, Filter,
    ChevronRight, Zap, BarChart3, X, Send, Phone, Mail
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import './Campaigns.css';

const Campaigns = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [campaigns, setCampaigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // all, active, paused, completed
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCampaign, setSelectedCampaign] = useState(null); // For details modal

    // Fetch real campaigns from Supabase
    useEffect(() => {
        if (user) {
            fetchCampaigns();
        }
    }, [user]);

    const fetchCampaigns = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('campaigns')
                .select('*')
                .eq('agent_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Transform data to match expected format
            const transformedCampaigns = (data || []).map(campaign => ({
                id: campaign.id,
                name: campaign.name || 'Campagne sans nom',
                status: campaign.status || 'draft',
                objectives: campaign.objectives || ['qualification'],
                channel: campaign.channel || 'sms',
                stats: {
                    sent: campaign.sent_count || 0,
                    delivered: campaign.delivered_count || campaign.sent_count || 0,
                    replied: campaign.replied_count || 0,
                    qualified: campaign.qualified_count || 0
                },
                totalContacts: campaign.total_contacts || 0,
                startDate: campaign.created_at,
                lastActivity: campaign.updated_at || campaign.created_at,
                firstMessage: campaign.first_message
            }));

            setCampaigns(transformedCampaigns);
        } catch (error) {
            console.error('Error fetching campaigns:', error);
            setCampaigns([]);
        } finally {
            setLoading(false);
        }
    };

    const objectiveIcons = {
        reactivation: { icon: RefreshCw, color: '#3B82F6', label: 'Réactivation' },
        booking: { icon: Calendar, color: '#10B981', label: 'Prise de RDV' },
        qualification: { icon: UserCheck, color: '#F59E0B', label: 'Qualification' },
        nurturing: { icon: Target, color: '#8B5CF6', label: 'Nurturing' },
        upsell: { icon: TrendingUp, color: '#EC4899', label: 'Upsell' },
        feedback: { icon: MessageSquare, color: '#06B6D4', label: 'Feedback' }
    };

    const statusConfig = {
        active: { label: 'Active', color: '#10B981', bg: 'rgba(16, 185, 129, 0.1)' },
        paused: { label: 'En pause', color: '#F59E0B', bg: 'rgba(245, 158, 11, 0.1)' },
        completed: { label: 'Terminée', color: '#6B7280', bg: 'rgba(107, 114, 128, 0.1)' },
        draft: { label: 'Brouillon', color: '#9CA3AF', bg: 'rgba(156, 163, 175, 0.1)' }
    };

    const filteredCampaigns = campaigns.filter(campaign => {
        const matchesFilter = filter === 'all' || campaign.status === filter;
        const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const toggleCampaignStatus = (campaignId) => {
        setCampaigns(prev => prev.map(c => {
            if (c.id === campaignId) {
                return {
                    ...c,
                    status: c.status === 'active' ? 'paused' : 'active'
                };
            }
            return c;
        }));
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const formatLastActivity = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now - date;
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(hours / 24);

        if (hours < 1) return 'Il y a moins d\'1h';
        if (hours < 24) return `Il y a ${hours}h`;
        if (days === 1) return 'Hier';
        return `Il y a ${days} jours`;
    };

    return (
        <div className="campaigns-page">
            {/* Header */}
            <header className="campaigns-header">
                <div className="header-content">
                    <div className="header-title">
                        <Rocket size={28} className="header-icon" />
                        <div>
                            <h1>Campagnes</h1>
                            <p>Gérez et suivez vos campagnes de prospection</p>
                        </div>
                    </div>
                    <button className="btn-primary" onClick={() => navigate('/campaigns/new')}>
                        <Plus size={18} />
                        Créer une campagne
                    </button>
                </div>
            </header>

            {/* Stats Overview */}
            <div className="campaigns-stats">
                <div className="stat-card">
                    <div className="stat-icon active">
                        <Play size={20} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{campaigns.filter(c => c.status === 'active').length}</span>
                        <span className="stat-label">Actives</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon sent">
                        <MessageSquare size={20} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{campaigns.reduce((acc, c) => acc + c.stats.sent, 0)}</span>
                        <span className="stat-label">Messages envoyés</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon replied">
                        <Users size={20} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{campaigns.reduce((acc, c) => acc + c.stats.replied, 0)}</span>
                        <span className="stat-label">Réponses</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon qualified">
                        <CheckCircle size={20} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{campaigns.reduce((acc, c) => acc + c.stats.qualified, 0)}</span>
                        <span className="stat-label">Qualifiés</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="campaigns-filters">
                <div className="search-box">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Rechercher une campagne..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-tabs">
                    {[
                        { key: 'all', label: 'Toutes' },
                        { key: 'active', label: 'Actives' },
                        { key: 'paused', label: 'En pause' },
                        { key: 'completed', label: 'Terminées' }
                    ].map(tab => (
                        <button
                            key={tab.key}
                            className={`filter-tab ${filter === tab.key ? 'active' : ''}`}
                            onClick={() => setFilter(tab.key)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Campaigns List */}
            <div className="campaigns-list">
                {loading ? (
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Chargement des campagnes...</p>
                    </div>
                ) : filteredCampaigns.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">
                            <Rocket size={48} />
                        </div>
                        <h3>Aucune campagne</h3>
                        <p>
                            {searchTerm || filter !== 'all' 
                                ? 'Aucune campagne ne correspond à vos critères.'
                                : 'Créez votre première campagne pour commencer à engager vos leads.'}
                        </p>
                        {!searchTerm && filter === 'all' && (
                            <button className="btn-primary" onClick={() => navigate('/campaigns/new')}>
                                <Plus size={18} />
                                Créer une campagne
                            </button>
                        )}
                    </div>
                ) : (
                    filteredCampaigns.map(campaign => {
                        const status = statusConfig[campaign.status];
                        const replyRate = campaign.stats.sent > 0 
                            ? Math.round((campaign.stats.replied / campaign.stats.sent) * 100) 
                            : 0;
                        const qualificationRate = campaign.stats.replied > 0 
                            ? Math.round((campaign.stats.qualified / campaign.stats.replied) * 100) 
                            : 0;

                        return (
                            <div key={campaign.id} className="campaign-card">
                                <div className="campaign-header">
                                    <div className="campaign-info">
                                        <h3>{campaign.name}</h3>
                                        <div className="campaign-meta">
                                            <span 
                                                className="status-badge"
                                                style={{ color: status.color, background: status.bg }}
                                            >
                                                {campaign.status === 'active' && <span className="pulse"></span>}
                                                {status.label}
                                            </span>
                                            <span className="meta-separator">•</span>
                                            <span className="channel-badge">{campaign.channel.toUpperCase()}</span>
                                            <span className="meta-separator">•</span>
                                            <span className="date-info">
                                                <Clock size={12} />
                                                {formatLastActivity(campaign.lastActivity)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="campaign-actions">
                                        {campaign.status !== 'completed' && (
                                            <button 
                                                className={`action-btn ${campaign.status === 'active' ? 'pause' : 'play'}`}
                                                onClick={() => toggleCampaignStatus(campaign.id)}
                                                title={campaign.status === 'active' ? 'Mettre en pause' : 'Reprendre'}
                                            >
                                                {campaign.status === 'active' ? <Pause size={18} /> : <Play size={18} />}
                                            </button>
                                        )}
                                        <button className="action-btn more">
                                            <MoreVertical size={18} />
                                        </button>
                                    </div>
                                </div>

                                <div className="campaign-objectives">
                                    {campaign.objectives.map(objId => {
                                        const obj = objectiveIcons[objId];
                                        if (!obj) return null;
                                        const Icon = obj.icon;
                                        return (
                                            <span 
                                                key={objId} 
                                                className="objective-tag"
                                                style={{ background: `${obj.color}15`, color: obj.color }}
                                            >
                                                <Icon size={12} />
                                                {obj.label}
                                            </span>
                                        );
                                    })}
                                </div>

                                <div className="campaign-stats">
                                    <div className="stat-item">
                                        <span className="stat-number">{campaign.stats.sent}</span>
                                        <span className="stat-name">Envoyés</span>
                                    </div>
                                    <div className="stat-divider"></div>
                                    <div className="stat-item">
                                        <span className="stat-number">{campaign.stats.replied}</span>
                                        <span className="stat-name">Réponses</span>
                                    </div>
                                    <div className="stat-divider"></div>
                                    <div className="stat-item highlight">
                                        <span className="stat-number">{campaign.stats.qualified}</span>
                                        <span className="stat-name">Qualifiés</span>
                                    </div>
                                    <div className="stat-divider"></div>
                                    <div className="stat-item rate">
                                        <span className="stat-number">{replyRate}%</span>
                                        <span className="stat-name">Taux réponse</span>
                                    </div>
                                </div>

                                <div className="campaign-footer">
                                    <span className="start-date">
                                        Démarrée le {formatDate(campaign.startDate)}
                                    </span>
                                    <button 
                                        className="btn-details"
                                        onClick={() => setSelectedCampaign(campaign)}
                                    >
                                        Voir les détails
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Campaign Details Modal */}
            {selectedCampaign && (
                <div className="campaign-modal-overlay" onClick={() => setSelectedCampaign(null)}>
                    <div className="campaign-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <div className="modal-title">
                                <Rocket size={24} />
                                <div>
                                    <h2>{selectedCampaign.name}</h2>
                                    <span 
                                        className="modal-status"
                                        style={{ 
                                            background: statusConfig[selectedCampaign.status]?.bg,
                                            color: statusConfig[selectedCampaign.status]?.color
                                        }}
                                    >
                                        {statusConfig[selectedCampaign.status]?.label}
                                    </span>
                                </div>
                            </div>
                            <button className="modal-close" onClick={() => setSelectedCampaign(null)}>
                                <X size={24} />
                            </button>
                        </div>

                        <div className="modal-body">
                            {/* Stats Grid */}
                            <div className="modal-stats-grid">
                                <div className="modal-stat">
                                    <Send size={20} />
                                    <div className="modal-stat-content">
                                        <span className="modal-stat-value">{selectedCampaign.stats?.sent || 0}</span>
                                        <span className="modal-stat-label">Messages envoyés</span>
                                    </div>
                                </div>
                                <div className="modal-stat">
                                    <MessageSquare size={20} />
                                    <div className="modal-stat-content">
                                        <span className="modal-stat-value">{selectedCampaign.stats?.replied || 0}</span>
                                        <span className="modal-stat-label">Réponses reçues</span>
                                    </div>
                                </div>
                                <div className="modal-stat highlight">
                                    <UserCheck size={20} />
                                    <div className="modal-stat-content">
                                        <span className="modal-stat-value">{selectedCampaign.stats?.qualified || 0}</span>
                                        <span className="modal-stat-label">Leads qualifiés</span>
                                    </div>
                                </div>
                                <div className="modal-stat">
                                    <TrendingUp size={20} />
                                    <div className="modal-stat-content">
                                        <span className="modal-stat-value">
                                            {selectedCampaign.stats?.sent > 0 
                                                ? Math.round((selectedCampaign.stats.replied / selectedCampaign.stats.sent) * 100) 
                                                : 0}%
                                        </span>
                                        <span className="modal-stat-label">Taux de réponse</span>
                                    </div>
                                </div>
                            </div>

                            {/* Campaign Info */}
                            <div className="modal-section">
                                <h3>Informations</h3>
                                <div className="modal-info-grid">
                                    <div className="modal-info-item">
                                        <span className="info-label">Canal</span>
                                        <span className="info-value">
                                            {selectedCampaign.channel === 'sms' ? '📱 SMS' : '💬 WhatsApp'}
                                        </span>
                                    </div>
                                    <div className="modal-info-item">
                                        <span className="info-label">Contacts ciblés</span>
                                        <span className="info-value">{selectedCampaign.totalContacts || selectedCampaign.stats?.sent || 0}</span>
                                    </div>
                                    <div className="modal-info-item">
                                        <span className="info-label">Date de création</span>
                                        <span className="info-value">{formatDate(selectedCampaign.startDate)}</span>
                                    </div>
                                    <div className="modal-info-item">
                                        <span className="info-label">Dernière activité</span>
                                        <span className="info-value">{formatDate(selectedCampaign.lastActivity)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* First Message */}
                            {selectedCampaign.firstMessage && (
                                <div className="modal-section">
                                    <h3>Message envoyé</h3>
                                    <div className="modal-message-preview">
                                        {selectedCampaign.firstMessage}
                                    </div>
                                </div>
                            )}

                            {/* Objectives */}
                            <div className="modal-section">
                                <h3>Objectifs</h3>
                                <div className="modal-objectives">
                                    {selectedCampaign.objectives?.map(objId => {
                                        const obj = objectiveIcons[objId];
                                        if (!obj) return null;
                                        const Icon = obj.icon;
                                        return (
                                            <span 
                                                key={objId} 
                                                className="objective-tag large"
                                                style={{ background: `${obj.color}15`, color: obj.color }}
                                            >
                                                <Icon size={16} />
                                                {obj.label}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="modal-footer">
                            <button 
                                className="btn-secondary"
                                onClick={() => setSelectedCampaign(null)}
                            >
                                Fermer
                            </button>
                            <button 
                                className="btn-primary"
                                onClick={() => {
                                    setSelectedCampaign(null);
                                    navigate('/conversations');
                                }}
                            >
                                <MessageSquare size={18} />
                                Voir les conversations
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Campaigns;

