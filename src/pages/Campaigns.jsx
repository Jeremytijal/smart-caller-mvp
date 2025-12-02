import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Plus, Rocket, Target, Calendar, UserCheck, RefreshCw, 
    MessageSquare, Play, Pause, MoreVertical, Users, Clock,
    TrendingUp, CheckCircle, AlertCircle, Search, Filter,
    ChevronRight, Zap, BarChart3
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

    // Mock campaigns data (in real app, this would come from database)
    useEffect(() => {
        // Simulate loading
        setTimeout(() => {
            setCampaigns([
                {
                    id: 1,
                    name: 'Réactivation Q4 2025',
                    status: 'active',
                    objectives: ['reactivation', 'booking'],
                    channel: 'sms',
                    stats: {
                        sent: 245,
                        delivered: 238,
                        replied: 67,
                        qualified: 23
                    },
                    startDate: '2025-12-01',
                    lastActivity: '2025-12-02T14:30:00'
                },
                {
                    id: 2,
                    name: 'Nurturing Leads Froids',
                    status: 'paused',
                    objectives: ['nurturing'],
                    channel: 'whatsapp',
                    stats: {
                        sent: 120,
                        delivered: 118,
                        replied: 34,
                        qualified: 8
                    },
                    startDate: '2025-11-15',
                    lastActivity: '2025-11-28T09:15:00'
                },
                {
                    id: 3,
                    name: 'Qualification Nouveaux Leads',
                    status: 'completed',
                    objectives: ['qualification'],
                    channel: 'sms',
                    stats: {
                        sent: 500,
                        delivered: 492,
                        replied: 156,
                        qualified: 89
                    },
                    startDate: '2025-10-01',
                    lastActivity: '2025-10-31T18:00:00'
                }
            ]);
            setLoading(false);
        }, 500);
    }, []);

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
                                    <button className="btn-details">
                                        Voir les détails
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default Campaigns;

