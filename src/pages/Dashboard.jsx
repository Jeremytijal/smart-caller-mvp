import React, { useState, useEffect } from 'react';
import { 
    Users, CheckCircle, XCircle, MessageSquare, Clock, ArrowRight, Calendar, 
    TrendingUp, Zap, Download, Bell, BellRing, X, ChevronRight, 
    BarChart3, Target, Send, Reply, AlertCircle, Filter, RefreshCw
} from 'lucide-react';
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
    FunnelChart, Funnel, LabelList, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { isDemoMode, demoStats, demoContacts } from '../data/demoData';
import './Dashboard.css';

const Dashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [isDemo, setIsDemo] = useState(false);
    const [dateRange, setDateRange] = useState('7d'); // 7d, 30d, 90d
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    
    const [metrics, setMetrics] = useState({
        total: 0,
        qualified: 0,
        disqualified: 0,
        avgScore: 0,
        qualificationRate: 0,
        meetings: 0,
        responseTime: '—',
        responseRate: 0,
        messagesSent: 0,
        messagesReceived: 0,
        avgConversationLength: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [funnelData, setFunnelData] = useState([]);
    const [activityData, setActivityData] = useState([]);
    const [sourceData, setSourceData] = useState([]);
    const [trendData, setTrendData] = useState([]);
    const [hotLeads, setHotLeads] = useState([]);

    useEffect(() => {
        if (user) {
            const demoMode = isDemoMode(user);
            setIsDemo(demoMode);
            
            if (demoMode) {
                loadDemoData();
            } else {
                fetchData();
            }
            
            // Load notifications
            loadNotifications();
        }
    }, [user, dateRange]);

    const loadNotifications = async () => {
        if (isDemoMode(user)) {
            // Demo notifications
            const notifs = [
                { id: 1, type: 'hot_lead', title: '🔥 Lead chaud !', message: 'Jean Dupont - Score: 92', time: 'Il y a 5 min', read: false },
                { id: 2, type: 'reply', title: '💬 Nouvelle réponse', message: 'Marie Martin a répondu', time: 'Il y a 15 min', read: false },
                { id: 3, type: 'milestone', title: '🎉 Objectif atteint !', message: '100 leads qualifiés ce mois', time: 'Il y a 1h', read: true },
                { id: 4, type: 'warning', title: '⚠️ Inactivité', message: '3 leads sans réponse 48h', time: 'Il y a 2h', read: true },
            ];
            setNotifications(notifs);
            return;
        }

        try {
            const res = await fetch(`https://webhook.smart-caller.ai/api/notifications/${user.id}`);
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications || []);
            }
        } catch (error) {
            console.error('Error loading notifications:', error);
        }
    };

    const loadDemoData = () => {
        // Enhanced demo metrics
        setMetrics({
            total: demoStats.totalLeads,
            qualified: demoStats.qualifiedLeads,
            disqualified: 28,
            avgScore: demoStats.averageScore,
            qualificationRate: demoStats.qualificationRate,
            meetings: demoStats.meetingsBooked,
            responseTime: demoStats.responseTime,
            responseRate: 78,
            messagesSent: 1247,
            messagesReceived: 892,
            avgConversationLength: 4.2
        });

        // Demo activity
        setRecentActivity(demoStats.recentActivity.map((item, index) => ({
            id: index,
            user: item.contact,
            action: item.type === 'qualified' ? 'Qualifié' : 
                    item.type === 'meeting' ? 'RDV Réservé' : 
                    item.type === 'new' ? 'Nouveau Lead' : 'Réponse',
            time: item.time,
            status: item.type === 'qualified' ? 'qualified' : 
                    item.type === 'meeting' ? 'meeting' : 
                    item.type === 'new' ? 'pending' : 'reply',
            details: item.score ? `Score: ${item.score}` : item.details || item.source || item.message?.substring(0, 30) + '...'
        })));

        // Demo funnel
        setFunnelData([
            { value: demoStats.totalLeads, name: 'Total des leads', fill: '#FF470F' },
            { value: 234, name: 'Contactés', fill: '#FF6B35' },
            { value: demoStats.qualifiedLeads, name: 'Qualifiés', fill: '#10B981' },
            { value: demoStats.meetingsBooked, name: 'RDV', fill: '#3B82F6' },
        ]);

        // Demo weekly data
        setActivityData(demoStats.weeklyData.map(d => ({
            name: d.day,
            leads: d.leads,
            qualified: d.qualified
        })));

        // Demo source data
        setSourceData(demoStats.sourceData);

        // Demo trend data (last 30 days)
        const trendDays = [];
        for (let i = 29; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            trendDays.push({
                date: date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
                leads: Math.floor(Math.random() * 15) + 5,
                qualified: Math.floor(Math.random() * 8) + 2,
                score: Math.floor(Math.random() * 20) + 65
            });
        }
        setTrendData(trendDays);

        // Hot leads
        setHotLeads([
            { id: 1, name: 'Jean Dupont', company: 'Tech Corp', score: 92, lastMessage: 'Intéressé par une démo', time: 'Il y a 5 min' },
            { id: 2, name: 'Marie Martin', company: 'StartupXYZ', score: 88, lastMessage: 'Budget validé', time: 'Il y a 15 min' },
            { id: 3, name: 'Pierre Durand', company: 'BigCo', score: 85, lastMessage: 'Besoin urgent', time: 'Il y a 30 min' },
        ]);

        setLoading(false);
    };

    const fetchData = async () => {
        if (!user) return;
        
        try {
            // Fetch contacts
            const { data: contacts, error } = await supabase
                .from('contacts')
                .select('*')
                .eq('agent_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Fetch messages for response metrics
            const { data: messages } = await supabase
                .from('messages')
                .select('*')
                .eq('agent_id', user.id);

            // Calculate metrics
            const total = contacts?.length || 0;
            const qualified = contacts?.filter(c => c.score >= 70).length || 0;
            const disqualified = contacts?.filter(c => c.score !== null && c.score < 30).length || 0;
            const scoredContacts = contacts?.filter(c => c.score !== null) || [];
            const avgScore = scoredContacts.length > 0
                ? Math.round(scoredContacts.reduce((acc, c) => acc + c.score, 0) / scoredContacts.length)
                : 0;
            const qualificationRate = total > 0 ? Math.round((qualified / total) * 100) : 0;

            // Message metrics
            const sent = messages?.filter(m => m.role === 'assistant').length || 0;
            const received = messages?.filter(m => m.role === 'user').length || 0;
            const responseRate = sent > 0 ? Math.round((received / sent) * 100) : 0;

            setMetrics({ 
                total, 
                qualified, 
                disqualified, 
                avgScore, 
                qualificationRate,
                meetings: 0,
                responseTime: '< 3 min',
                responseRate,
                messagesSent: sent,
                messagesReceived: received,
                avgConversationLength: received > 0 ? Math.round(received / total * 10) / 10 : 0
            });

            // Recent Activity
            setRecentActivity((contacts || []).slice(0, 5).map(c => ({
                id: c.id,
                user: c.name,
                action: c.score >= 70 ? 'Qualifié' : c.score < 30 && c.score !== null ? 'Disqualifié' : 'Nouveau Lead',
                time: new Date(c.created_at).toLocaleDateString('fr-FR'),
                status: c.score >= 70 ? 'qualified' : c.score < 30 && c.score !== null ? 'disqualified' : 'pending',
                details: c.score_reason || c.source || 'En attente'
            })));

            // Funnel Data
            setFunnelData([
                { value: total, name: 'Total des leads', fill: '#FF470F' },
                { value: scoredContacts.length, name: 'Scorés', fill: '#FF6B35' },
                { value: qualified, name: 'Qualifiés', fill: '#10B981' },
            ]);

            // Weekly Activity
            const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
            const activityMap = { 'Dim': 0, 'Lun': 0, 'Mar': 0, 'Mer': 0, 'Jeu': 0, 'Ven': 0, 'Sam': 0 };
            const qualifiedMap = { 'Dim': 0, 'Lun': 0, 'Mar': 0, 'Mer': 0, 'Jeu': 0, 'Ven': 0, 'Sam': 0 };

            (contacts || []).forEach(c => {
                const day = days[new Date(c.created_at).getDay()];
                activityMap[day]++;
                if (c.score >= 70) qualifiedMap[day]++;
            });

            const chartData = Object.keys(activityMap).map(day => ({
                name: day,
                leads: activityMap[day],
                qualified: qualifiedMap[day]
            }));
            setActivityData([...chartData.slice(1), chartData[0]]);

            // Source Performance
            const sourceMap = {};
            (contacts || []).forEach(c => {
                const source = c.source || 'Direct';
                if (!sourceMap[source]) {
                    sourceMap[source] = { leads: 0, qualified: 0 };
                }
                sourceMap[source].leads++;
                if (c.score >= 70) sourceMap[source].qualified++;
            });

            const sourceArr = Object.entries(sourceMap).map(([source, data]) => ({
                source,
                leads: data.leads,
                qualified: data.qualified,
                rate: data.leads > 0 ? Math.round((data.qualified / data.leads) * 100) : 0
            })).sort((a, b) => b.leads - a.leads).slice(0, 5);
            setSourceData(sourceArr);

            // Hot Leads (score > 80)
            const hot = (contacts || [])
                .filter(c => c.score >= 80)
                .slice(0, 3)
                .map(c => ({
                    id: c.id,
                    name: c.name,
                    company: c.company_name || '—',
                    score: c.score,
                    lastMessage: c.score_reason || 'Lead qualifié',
                    time: new Date(c.created_at).toLocaleDateString('fr-FR')
                }));
            setHotLeads(hot);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    // Export CSV function
    const exportToCSV = async () => {
        try {
            const { data: contacts } = await supabase
                .from('contacts')
                .select('*')
                .eq('agent_id', user.id);

            if (!contacts || contacts.length === 0) {
                alert('Aucun contact à exporter');
                return;
            }

            // Create CSV content
            const headers = ['Nom', 'Email', 'Téléphone', 'Entreprise', 'Poste', 'Source', 'Score', 'Statut', 'Date'];
            const rows = contacts.map(c => [
                c.name || '',
                c.email || '',
                c.phone || '',
                c.company_name || '',
                c.job_title || '',
                c.source || '',
                c.score || '',
                c.score >= 70 ? 'Qualifié' : c.score < 30 ? 'Disqualifié' : 'En cours',
                new Date(c.created_at).toLocaleDateString('fr-FR')
            ]);

            const csvContent = [
                headers.join(','),
                ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
            ].join('\n');

            // Download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `contacts_smartcaller_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
        } catch (error) {
            console.error('Error exporting CSV:', error);
            alert('Erreur lors de l\'export');
        }
    };

    const markNotificationRead = (id) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    const stats = [
        { label: 'Total des leads', value: metrics.total, icon: Users, color: '#FF470F', trend: '+12%' },
        { label: 'Qualifiés', value: metrics.qualified, icon: CheckCircle, color: '#10B981', trend: '+8%' },
        { label: 'Score moyen', value: `${metrics.avgScore}`, icon: Target, color: '#F59E0B', trend: '+5' },
        { label: 'Taux de qualif.', value: `${metrics.qualificationRate}%`, icon: Zap, color: '#8B5CF6', trend: '+3%' },
        { label: 'Taux de réponse', value: `${metrics.responseRate}%`, icon: Reply, color: '#3B82F6', trend: '+15%' },
        { label: 'Temps réponse', value: metrics.responseTime, icon: Clock, color: '#EC4899', trend: null },
    ];

    if (loading) return <div className="dashboard-loading"><RefreshCw className="animate-spin" size={32} /> Chargement...</div>;

    return (
        <div className="page-container dashboard-page">
            {/* Header */}
            <header className="dashboard-header">
                <div className="header-left">
                    <h1>Tableau de bord</h1>
                    <p className="text-muted">Aperçu des performances de votre agent IA</p>
                </div>
                <div className="header-actions">
                    {isDemo && (
                        <div className="demo-badge">
                            <span>🎯 Mode Démo</span>
                        </div>
                    )}
                    
                    {/* Date Range Filter */}
                    <div className="date-filter">
                        <button 
                            className={dateRange === '7d' ? 'active' : ''} 
                            onClick={() => setDateRange('7d')}
                        >7 jours</button>
                        <button 
                            className={dateRange === '30d' ? 'active' : ''} 
                            onClick={() => setDateRange('30d')}
                        >30 jours</button>
                        <button 
                            className={dateRange === '90d' ? 'active' : ''} 
                            onClick={() => setDateRange('90d')}
                        >90 jours</button>
                    </div>

                    {/* Notifications */}
                    <button className="btn-icon notification-btn" onClick={() => setShowNotifications(!showNotifications)}>
                        {unreadCount > 0 ? <BellRing size={20} /> : <Bell size={20} />}
                        {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                    </button>

                    {/* Export CSV */}
                    <button className="btn-secondary" onClick={exportToCSV}>
                        <Download size={18} />
                        Exporter CSV
                    </button>
                </div>
            </header>

            {/* Notifications Panel */}
            {showNotifications && (
                <div className="notifications-panel glass-panel">
                    <div className="notifications-header">
                        <h3>Notifications</h3>
                        <button className="btn-icon" onClick={() => setShowNotifications(false)}>
                            <X size={18} />
                        </button>
                    </div>
                    <div className="notifications-list">
                        {notifications.map(notif => (
                            <div 
                                key={notif.id} 
                                className={`notification-item ${notif.read ? 'read' : ''}`}
                                onClick={() => markNotificationRead(notif.id)}
                            >
                                <div className="notification-content">
                                    <span className="notification-title">{notif.title}</span>
                                    <span className="notification-message">{notif.message}</span>
                                    <span className="notification-time">{notif.time}</span>
                                </div>
                                {!notif.read && <span className="unread-dot"></span>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Hot Leads Alert */}
            {hotLeads.length > 0 && (
                <div className="hot-leads-banner">
                    <div className="hot-leads-icon">🔥</div>
                    <div className="hot-leads-content">
                        <span className="hot-leads-title">{hotLeads.length} leads chauds à traiter</span>
                        <span className="hot-leads-list">
                            {hotLeads.map(l => l.name).join(', ')}
                        </span>
                    </div>
                    <button className="btn-primary-small">
                        Voir <ChevronRight size={16} />
                    </button>
                </div>
            )}

            {/* Stats Grid */}
            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div key={index} className="glass-panel stat-card">
                        <div className="stat-icon" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                            <stat.icon size={24} />
                        </div>
                        <div className="stat-info">
                            <span className="stat-value">{stat.value}</span>
                            <span className="stat-label">{stat.label}</span>
                        </div>
                        {stat.trend && (
                            <span className="stat-trend positive">{stat.trend}</span>
                        )}
                    </div>
                ))}
            </div>

            {/* Secondary Metrics */}
            <div className="secondary-metrics">
                <div className="metric-card">
                    <Send size={18} />
                    <span className="metric-value">{metrics.messagesSent}</span>
                    <span className="metric-label">Messages envoyés</span>
                </div>
                <div className="metric-card">
                    <MessageSquare size={18} />
                    <span className="metric-value">{metrics.messagesReceived}</span>
                    <span className="metric-label">Réponses reçues</span>
                </div>
                <div className="metric-card">
                    <BarChart3 size={18} />
                    <span className="metric-value">{metrics.avgConversationLength}</span>
                    <span className="metric-label">Échanges/lead</span>
                </div>
                <div className="metric-card">
                    <Calendar size={18} />
                    <span className="metric-value">{metrics.meetings}</span>
                    <span className="metric-label">RDV réservés</span>
                </div>
            </div>

            <div className="charts-grid">
                {/* Funnel Chart */}
                <div className="glass-panel chart-card">
                    <h3>Entonnoir de conversion</h3>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={280}>
                            <FunnelChart>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e5e5', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    itemStyle={{ color: '#1a1a1a' }}
                                />
                                <Funnel dataKey="value" data={funnelData} isAnimationActive>
                                    <LabelList position="right" fill="#1a1a1a" stroke="none" dataKey="name" />
                                </Funnel>
                            </FunnelChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Weekly Activity Chart */}
                <div className="glass-panel chart-card">
                    <h3>Activité de la semaine</h3>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={activityData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
                                <XAxis dataKey="name" stroke="#6b7280" axisLine={false} tickLine={false} />
                                <YAxis stroke="#6b7280" axisLine={false} tickLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e5e5', borderRadius: '8px' }}
                                />
                                <Bar dataKey="leads" fill="#FF470F" radius={[4, 4, 0, 0]} name="Leads" />
                                <Bar dataKey="qualified" fill="#10B981" radius={[4, 4, 0, 0]} name="Qualifiés" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Trend Chart (if demo or has data) */}
            {(isDemo || trendData.length > 0) && (
                <div className="glass-panel chart-card full-width">
                    <h3>Tendance sur 30 jours</h3>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={250}>
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#FF470F" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#FF470F" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="colorQualified" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
                                <XAxis dataKey="date" stroke="#6b7280" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                                <YAxis stroke="#6b7280" axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e5e5', borderRadius: '8px' }} />
                                <Area type="monotone" dataKey="leads" stroke="#FF470F" fillOpacity={1} fill="url(#colorLeads)" name="Leads" />
                                <Area type="monotone" dataKey="qualified" stroke="#10B981" fillOpacity={1} fill="url(#colorQualified)" name="Qualifiés" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Source Performance */}
            {sourceData.length > 0 && (
                <div className="glass-panel source-card">
                    <h3>Performance par source</h3>
                    <div className="source-grid">
                        {sourceData.map((source, index) => (
                            <div key={index} className="source-item">
                                <div className="source-header">
                                    <span className="source-name">{source.source}</span>
                                    <span className="source-rate">{source.rate}%</span>
                                </div>
                                <div className="source-bar-track">
                                    <div 
                                        className="source-bar-fill" 
                                        style={{ 
                                            width: `${source.rate}%`,
                                            background: index === 0 ? '#FF470F' : 
                                                       index === 1 ? '#3B82F6' :
                                                       index === 2 ? '#8B5CF6' :
                                                       index === 3 ? '#10B981' : '#F59E0B'
                                        }}
                                    ></div>
                                </div>
                                <div className="source-stats">
                                    <span>{source.leads} leads</span>
                                    <span>{source.qualified} qualifiés</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Activity */}
            <div className="glass-panel recent-activity">
                <div className="activity-header">
                    <h3>Activité récente</h3>
                    <button className="btn-text-link">Voir tout <ArrowRight size={16} /></button>
                </div>
                <div className="activity-list">
                    {recentActivity.length === 0 ? (
                        <div className="empty-state">
                            <MessageSquare size={32} className="text-muted" />
                            <p>Aucune activité récente</p>
                        </div>
                    ) : (
                        recentActivity.map((item) => (
                            <div key={item.id} className="activity-item">
                                <div className={`status-indicator ${item.status}`}></div>
                                <div className="activity-details">
                                    <span className="activity-user">{item.user}</span>
                                    <span className="activity-action text-xs text-muted">{item.details}</span>
                                </div>
                                <div className="activity-meta">
                                    <span className={`badge ${
                                        item.status === 'qualified' ? 'badge-success' : 
                                        item.status === 'meeting' ? 'badge-info' :
                                        item.status === 'disqualified' ? 'badge-danger' : 
                                        'badge-default'
                                    }`}>
                                        {item.action}
                                    </span>
                                    <span className="activity-time">{item.time}</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
