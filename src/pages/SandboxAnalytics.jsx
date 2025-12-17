import React, { useState, useEffect } from 'react';
import { 
    BarChart3, Users, CheckCircle, Calendar, MessageSquare,
    TrendingUp, Smartphone, Monitor, RefreshCw, ChevronDown,
    ChevronUp, Clock, Target, Zap, Filter, Link2, ExternalLink
} from 'lucide-react';
import { API_URL } from '../config';
import './SandboxAnalytics.css';

const SandboxAnalytics = () => {
    const [stats, setStats] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'qualified', 'not-qualified'
    const [expandedConversation, setExpandedConversation] = useState(null);
    const [days, setDays] = useState(30);

    // Fetch stats and conversations
    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, convsRes] = await Promise.all([
                fetch(`${API_URL}/api/sandbox/stats?days=${days}`),
                fetch(`${API_URL}/api/sandbox/conversations?limit=100${filter !== 'all' ? `&qualified=${filter === 'qualified'}` : ''}`)
            ]);

            const statsData = await statsRes.json();
            const convsData = await convsRes.json();

            if (statsData.success) setStats(statsData.stats);
            if (convsData.success) setConversations(convsData.conversations);
        } catch (error) {
            console.error('Error fetching sandbox data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [days, filter]);

    // Format date
    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading && !stats) {
        return (
            <div className="sandbox-analytics loading">
                <div className="loader"></div>
                <p>Chargement des analytics...</p>
            </div>
        );
    }

    return (
        <div className="sandbox-analytics">
            {/* Header */}
            <div className="analytics-header">
                <div className="header-content">
                    <h1>
                        <BarChart3 size={28} />
                        Sandbox Analytics
                    </h1>
                    <p>Analyse des conversations de la démo</p>
                </div>
                <div className="header-actions">
                    <select 
                        value={days} 
                        onChange={(e) => setDays(Number(e.target.value))}
                        className="days-select"
                    >
                        <option value={7}>7 derniers jours</option>
                        <option value={30}>30 derniers jours</option>
                        <option value={90}>90 derniers jours</option>
                    </select>
                    <button onClick={fetchData} className="refresh-btn">
                        <RefreshCw size={18} />
                        Actualiser
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            {stats && (
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon blue">
                            <Users size={24} />
                        </div>
                        <div className="stat-content">
                            <span className="stat-value">{stats.total}</span>
                            <span className="stat-label">Conversations</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon green">
                            <CheckCircle size={24} />
                        </div>
                        <div className="stat-content">
                            <span className="stat-value">{stats.qualificationRate}%</span>
                            <span className="stat-label">Taux de qualification</span>
                            <span className="stat-detail">{stats.qualified} qualifiés</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon orange">
                            <Calendar size={24} />
                        </div>
                        <div className="stat-content">
                            <span className="stat-value">{stats.rdvConversionRate}%</span>
                            <span className="stat-label">Taux RDV acceptés</span>
                            <span className="stat-detail">{stats.rdvAccepted} / {stats.rdvProposed} proposés</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon purple">
                            <Target size={24} />
                        </div>
                        <div className="stat-content">
                            <span className="stat-value">{stats.avgScore}</span>
                            <span className="stat-label">Score moyen</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon teal">
                            <MessageSquare size={24} />
                        </div>
                        <div className="stat-content">
                            <span className="stat-value">{stats.avgMessages}</span>
                            <span className="stat-label">Messages moyens</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon pink">
                            <Smartphone size={24} />
                        </div>
                        <div className="stat-content">
                            <span className="stat-value">{stats.mobileRate}%</span>
                            <span className="stat-label">Mobile</span>
                            <span className="stat-detail">{stats.mobile} mobile / {stats.desktop} desktop</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Conversations List */}
            <div className="conversations-section">
                <div className="section-header">
                    <h2>
                        <MessageSquare size={20} />
                        Conversations récentes
                    </h2>
                    <div className="filter-tabs">
                        <button 
                            className={filter === 'all' ? 'active' : ''}
                            onClick={() => setFilter('all')}
                        >
                            Toutes
                        </button>
                        <button 
                            className={filter === 'qualified' ? 'active' : ''}
                            onClick={() => setFilter('qualified')}
                        >
                            Qualifiées
                        </button>
                        <button 
                            className={filter === 'not-qualified' ? 'active' : ''}
                            onClick={() => setFilter('not-qualified')}
                        >
                            Non qualifiées
                        </button>
                    </div>
                </div>

                <div className="conversations-list">
                    {conversations.length === 0 ? (
                        <div className="empty-state">
                            <MessageSquare size={48} />
                            <p>Aucune conversation pour le moment</p>
                        </div>
                    ) : (
                        conversations.map((conv) => (
                            <div key={conv.id} className="conversation-card">
                                <div 
                                    className="conversation-header"
                                    onClick={() => setExpandedConversation(
                                        expandedConversation === conv.id ? null : conv.id
                                    )}
                                >
                                    <div className="conv-info">
                                        <span className={`status-badge ${conv.is_qualified ? 'qualified' : 'not-qualified'}`}>
                                            {conv.is_qualified ? 'Qualifié' : 'Non qualifié'}
                                        </span>
                                        <span className="conv-date">{formatDate(conv.created_at)}</span>
                                        <span className="conv-device">
                                            {conv.device_type === 'mobile' ? <Smartphone size={14} /> : <Monitor size={14} />}
                                        </span>
                                        {conv.utm_source && (
                                            <span className="utm-badge" title={`${conv.utm_source} / ${conv.utm_medium || '-'}`}>
                                                <Link2 size={12} />
                                                {conv.utm_source}
                                            </span>
                                        )}
                                    </div>
                                    <div className="conv-stats">
                                        <span className="score">Score: {conv.qualification_score}</span>
                                        <span className="messages">{conv.message_count} msgs</span>
                                        {conv.rdv_accepted && <span className="rdv-badge">📅 RDV</span>}
                                        {expandedConversation === conv.id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                    </div>
                                </div>

                                {expandedConversation === conv.id && (
                                    <div className="conversation-details">
                                        <div className="details-grid">
                                            <div className="detail-item">
                                                <span className="detail-label">Besoin détecté</span>
                                                <span className="detail-value">{conv.need_detected || '-'}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">Urgence</span>
                                                <span className={`detail-value urgency-${conv.urgency}`}>{conv.urgency}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">RDV proposé</span>
                                                <span className="detail-value">{conv.rdv_proposed ? 'Oui' : 'Non'}</span>
                                            </div>
                                            <div className="detail-item">
                                                <span className="detail-label">RDV accepté</span>
                                                <span className="detail-value">{conv.rdv_accepted ? 'Oui' : 'Non'}</span>
                                            </div>
                                        </div>

                                        {conv.qualification_reasons && conv.qualification_reasons.length > 0 && (
                                            <div className="reasons-list">
                                                <span className="reasons-label">Raisons:</span>
                                                {conv.qualification_reasons.map((reason, i) => (
                                                    <span key={i} className="reason-tag">{reason}</span>
                                                ))}
                                            </div>
                                        )}

                                        {/* UTM Parameters Section */}
                                        {(conv.utm_source || conv.utm_medium || conv.utm_campaign || conv.gclid || conv.fbclid) && (
                                            <div className="utm-section">
                                                <span className="utm-label"><Link2 size={14} /> UTM / Tracking:</span>
                                                <div className="utm-grid">
                                                    {conv.utm_source && (
                                                        <div className="utm-item">
                                                            <span className="utm-key">Source</span>
                                                            <span className="utm-value">{conv.utm_source}</span>
                                                        </div>
                                                    )}
                                                    {conv.utm_medium && (
                                                        <div className="utm-item">
                                                            <span className="utm-key">Medium</span>
                                                            <span className="utm-value">{conv.utm_medium}</span>
                                                        </div>
                                                    )}
                                                    {conv.utm_campaign && (
                                                        <div className="utm-item">
                                                            <span className="utm-key">Campaign</span>
                                                            <span className="utm-value">{conv.utm_campaign}</span>
                                                        </div>
                                                    )}
                                                    {conv.utm_content && (
                                                        <div className="utm-item">
                                                            <span className="utm-key">Content</span>
                                                            <span className="utm-value">{conv.utm_content}</span>
                                                        </div>
                                                    )}
                                                    {conv.utm_term && (
                                                        <div className="utm-item">
                                                            <span className="utm-key">Term</span>
                                                            <span className="utm-value">{conv.utm_term}</span>
                                                        </div>
                                                    )}
                                                    {conv.gclid && (
                                                        <div className="utm-item">
                                                            <span className="utm-key">GCLID</span>
                                                            <span className="utm-value truncate">{conv.gclid.substring(0, 20)}...</span>
                                                        </div>
                                                    )}
                                                    {conv.fbclid && (
                                                        <div className="utm-item">
                                                            <span className="utm-key">FBCLID</span>
                                                            <span className="utm-value truncate">{conv.fbclid.substring(0, 20)}...</span>
                                                        </div>
                                                    )}
                                                </div>
                                                {conv.referrer && (
                                                    <div className="referrer-info">
                                                        <span className="referrer-label"><ExternalLink size={12} /> Referrer:</span>
                                                        <span className="referrer-value">{conv.referrer}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="messages-preview">
                                            <span className="preview-label">Conversation:</span>
                                            <div className="messages-list">
                                                {(conv.messages || []).map((msg, i) => (
                                                    <div key={i} className={`preview-message ${msg.role}`}>
                                                        <span className="msg-role">{msg.role === 'assistant' ? '🤖' : '👤'}</span>
                                                        <span className="msg-content">{msg.content}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default SandboxAnalytics;

