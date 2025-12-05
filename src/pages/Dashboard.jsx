import React, { useState, useEffect } from 'react';
import { 
    Users, CheckCircle, XCircle, MessageSquare, Clock, ArrowRight, Calendar, 
    TrendingUp, Zap, Download, Bell, BellRing, X, ChevronRight, 
    BarChart3, Target, Send, Reply, AlertCircle, Filter, RefreshCw,
    ArrowUpRight, ArrowDownRight, Flame, Eye
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
    const [dateRange, setDateRange] = useState('7d');
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
            
            loadNotifications();
        }
    }, [user, dateRange]);

    const loadNotifications = async () => {
        if (isDemoMode(user)) {
            const notifs = [
                { id: 1, type: 'hot_lead', title: 'Lead chaud !', message: 'Jean Dupont - Score: 92', time: 'Il y a 5 min', read: false },
                { id: 2, type: 'reply', title: 'Nouvelle réponse', message: 'Marie Martin a répondu', time: 'Il y a 15 min', read: false },
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

        setFunnelData([
            { value: demoStats.totalLeads, name: 'Leads', fill: '#FF470F' },
            { value: 234, name: 'Contactés', fill: '#FF8A65' },
            { value: demoStats.qualifiedLeads, name: 'Qualifiés', fill: '#4CAF50' },
            { value: demoStats.meetingsBooked, name: 'RDV', fill: '#2196F3' },
        ]);

        setActivityData(demoStats.weeklyData.map(d => ({
            name: d.day,
            leads: d.leads,
            qualified: d.qualified
        })));

        setSourceData(demoStats.sourceData);

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

        setHotLeads([
            { id: 1, name: 'Jean Dupont', company: 'Tech Corp', score: 92, lastMessage: 'Intéressé par une démo', time: '5 min' },
            { id: 2, name: 'Marie Martin', company: 'StartupXYZ', score: 88, lastMessage: 'Budget validé', time: '15 min' },
            { id: 3, name: 'Pierre Durand', company: 'BigCo', score: 85, lastMessage: 'Besoin urgent', time: '30 min' },
        ]);

        setLoading(false);
    };

    const fetchData = async () => {
        if (!user) return;
        
        try {
            const { data: contacts, error } = await supabase
                .from('contacts')
                .select('*')
                .eq('agent_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            const { data: messages } = await supabase
                .from('messages')
                .select('*')
                .eq('agent_id', user.id);

            const total = contacts?.length || 0;
            const qualified = contacts?.filter(c => c.score >= 70).length || 0;
            const disqualified = contacts?.filter(c => c.score !== null && c.score < 30).length || 0;
            const scoredContacts = contacts?.filter(c => c.score !== null) || [];
            const avgScore = scoredContacts.length > 0
                ? Math.round(scoredContacts.reduce((acc, c) => acc + c.score, 0) / scoredContacts.length)
                : 0;
            const qualificationRate = total > 0 ? Math.round((qualified / total) * 100) : 0;

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

            setRecentActivity((contacts || []).slice(0, 5).map(c => ({
                id: c.id,
                user: c.name,
                action: c.score >= 70 ? 'Qualifié' : c.score < 30 && c.score !== null ? 'Disqualifié' : 'Nouveau Lead',
                time: new Date(c.created_at).toLocaleDateString('fr-FR'),
                status: c.score >= 70 ? 'qualified' : c.score < 30 && c.score !== null ? 'disqualified' : 'pending',
                details: c.score_reason || c.source || 'En attente'
            })));

            setFunnelData([
                { value: total, name: 'Leads', fill: '#FF470F' },
                { value: scoredContacts.length, name: 'Scorés', fill: '#FF8A65' },
                { value: qualified, name: 'Qualifiés', fill: '#4CAF50' },
            ]);

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

    if (loading) {
        return (
            <div className="dashboard-loading">
                <RefreshCw className="animate-spin" size={24} />
                <span>Chargement...</span>
            </div>
        );
    }

    return (
        <div className="dashboard-v2">
            {/* Header */}
            <header className="dash-header">
                <div className="dash-header-left">
                    <h1>Tableau de bord</h1>
                    <span className="dash-subtitle">Vue d'ensemble de vos performances</span>
                </div>
                <div className="dash-header-right">
                    {isDemo && <span className="demo-pill">Mode Démo</span>}
                    
                    <div className="period-selector">
                        {['7d', '30d', '90d'].map(period => (
                            <button 
                                key={period}
                                className={dateRange === period ? 'active' : ''}
                                onClick={() => setDateRange(period)}
                            >
                                {period === '7d' ? '7j' : period === '30d' ? '30j' : '90j'}
                            </button>
                        ))}
                    </div>

                    <button className="icon-btn" onClick={() => setShowNotifications(!showNotifications)}>
                        <Bell size={18} />
                        {unreadCount > 0 && <span className="notif-dot">{unreadCount}</span>}
                    </button>

                    <button className="export-btn" onClick={exportToCSV}>
                        <Download size={16} />
                        Export
                    </button>
                </div>
            </header>

            {/* Notifications Dropdown */}
            {showNotifications && (
                <div className="notif-dropdown">
                    <div className="notif-header">
                        <span>Notifications</span>
                        <button onClick={() => setShowNotifications(false)}><X size={16} /></button>
                    </div>
                    {notifications.length === 0 ? (
                        <div className="notif-empty">Aucune notification</div>
                    ) : (
                        notifications.map(n => (
                            <div key={n.id} className={`notif-item ${n.read ? 'read' : ''}`} onClick={() => markNotificationRead(n.id)}>
                                <div className="notif-content">
                                    <strong>{n.title}</strong>
                                    <span>{n.message}</span>
                                    <small>{n.time}</small>
                                </div>
                                {!n.read && <span className="notif-unread"></span>}
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Hot Leads Alert - More subtle */}
            {hotLeads.length > 0 && (
                <div className="hot-alert">
                    <Flame size={16} className="hot-icon" />
                    <span><strong>{hotLeads.length} leads chauds</strong> à traiter : {hotLeads.map(l => l.name).join(', ')}</span>
                    <button className="hot-btn">Voir <ChevronRight size={14} /></button>
                </div>
            )}

            {/* Main KPIs - Clean Grid */}
            <div className="kpi-grid">
                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-label">Total leads</span>
                        <span className="kpi-trend up">+12%</span>
                    </div>
                    <div className="kpi-value">{metrics.total}</div>
                    <div className="kpi-bar">
                        <div className="kpi-bar-fill" style={{ width: '100%', background: '#FF470F' }}></div>
                    </div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-label">Qualifiés</span>
                        <span className="kpi-trend up">+8%</span>
                    </div>
                    <div className="kpi-value">{metrics.qualified}</div>
                    <div className="kpi-bar">
                        <div className="kpi-bar-fill" style={{ width: `${metrics.qualificationRate}%`, background: '#4CAF50' }}></div>
                    </div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-label">Score moyen</span>
                        <span className="kpi-trend up">+5</span>
                    </div>
                    <div className="kpi-value">{metrics.avgScore}<small>/100</small></div>
                    <div className="kpi-bar">
                        <div className="kpi-bar-fill" style={{ width: `${metrics.avgScore}%`, background: '#FF9800' }}></div>
                    </div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-label">Taux de qualif.</span>
                        <span className="kpi-trend up">+3%</span>
                    </div>
                    <div className="kpi-value">{metrics.qualificationRate}%</div>
                    <div className="kpi-bar">
                        <div className="kpi-bar-fill" style={{ width: `${metrics.qualificationRate}%`, background: '#9C27B0' }}></div>
                    </div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-label">Taux de réponse</span>
                        <span className="kpi-trend up">+15%</span>
                    </div>
                    <div className="kpi-value">{metrics.responseRate}%</div>
                    <div className="kpi-bar">
                        <div className="kpi-bar-fill" style={{ width: `${metrics.responseRate}%`, background: '#2196F3' }}></div>
                    </div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-header">
                        <span className="kpi-label">Temps de réponse</span>
                    </div>
                    <div className="kpi-value">{metrics.responseTime}</div>
                    <div className="kpi-subtext">Réponse instantanée</div>
                </div>
            </div>

            {/* Secondary Stats Row */}
            <div className="stats-row">
                <div className="stat-mini">
                    <Send size={16} />
                    <span className="stat-mini-value">{metrics.messagesSent}</span>
                    <span className="stat-mini-label">envoyés</span>
                </div>
                <div className="stat-mini">
                    <MessageSquare size={16} />
                    <span className="stat-mini-value">{metrics.messagesReceived}</span>
                    <span className="stat-mini-label">reçus</span>
                </div>
                <div className="stat-mini">
                    <BarChart3 size={16} />
                    <span className="stat-mini-value">{metrics.avgConversationLength}</span>
                    <span className="stat-mini-label">échanges/lead</span>
                </div>
                <div className="stat-mini">
                    <Calendar size={16} />
                    <span className="stat-mini-value">{metrics.meetings}</span>
                    <span className="stat-mini-label">RDV</span>
                </div>
            </div>

            {/* Charts Section */}
            <div className="charts-section">
                {/* Funnel */}
                <div className="chart-card funnel-card">
                    <h3>Entonnoir</h3>
                    <div className="funnel-visual">
                        {funnelData.map((item, i) => (
                            <div key={i} className="funnel-step">
                                <div 
                                    className="funnel-bar" 
                                    style={{ 
                                        width: `${(item.value / (funnelData[0]?.value || 1)) * 100}%`,
                                        background: item.fill 
                                    }}
                                >
                                    <span className="funnel-value">{item.value}</span>
                                </div>
                                <span className="funnel-label">{item.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Activity Chart */}
                <div className="chart-card activity-card">
                    <h3>Activité hebdomadaire</h3>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={activityData} barGap={4}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                <Tooltip 
                                    cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                    contentStyle={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '8px', fontSize: '12px' }}
                                />
                                <Bar dataKey="leads" fill="#FF470F" radius={[4, 4, 0, 0]} name="Leads" />
                                <Bar dataKey="qualified" fill="#4CAF50" radius={[4, 4, 0, 0]} name="Qualifiés" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="chart-legend">
                        <span><i style={{ background: '#FF470F' }}></i> Leads</span>
                        <span><i style={{ background: '#4CAF50' }}></i> Qualifiés</span>
                    </div>
                </div>
            </div>

            {/* Trend Chart */}
            {(isDemo || trendData.length > 0) && (
                <div className="chart-card trend-card">
                    <h3>Évolution sur 30 jours</h3>
                    <div className="chart-wrapper">
                        <ResponsiveContainer width="100%" height={180}>
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="gradLeads" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#FF470F" stopOpacity={0.2}/>
                                        <stop offset="100%" stopColor="#FF470F" stopOpacity={0}/>
                                    </linearGradient>
                                    <linearGradient id="gradQualified" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#4CAF50" stopOpacity={0.2}/>
                                        <stop offset="100%" stopColor="#4CAF50" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10 }} interval={4} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10 }} />
                                <Tooltip contentStyle={{ background: '#fff', border: '1px solid #e5e5e5', borderRadius: '8px', fontSize: '12px' }} />
                                <Area type="monotone" dataKey="leads" stroke="#FF470F" strokeWidth={2} fill="url(#gradLeads)" name="Leads" />
                                <Area type="monotone" dataKey="qualified" stroke="#4CAF50" strokeWidth={2} fill="url(#gradQualified)" name="Qualifiés" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* Bottom Section */}
            <div className="bottom-section">
                {/* Sources */}
                {sourceData.length > 0 && (
                    <div className="chart-card sources-card">
                        <h3>Performance par source</h3>
                        <div className="sources-list">
                            {sourceData.map((s, i) => (
                                <div key={i} className="source-row">
                                    <span className="source-name">{s.source}</span>
                                    <div className="source-bar-wrapper">
                                        <div className="source-bar" style={{ width: `${s.rate}%` }}></div>
                                    </div>
                                    <span className="source-rate">{s.rate}%</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Recent Activity */}
                <div className="chart-card activity-list-card">
                    <div className="card-header">
                        <h3>Activité récente</h3>
                        <button className="see-all">Voir tout <ArrowRight size={14} /></button>
                    </div>
                    {recentActivity.length === 0 ? (
                        <div className="empty-activity">
                            <MessageSquare size={24} />
                            <span>Aucune activité</span>
                        </div>
                    ) : (
                        <div className="activity-items">
                            {recentActivity.map(item => (
                                <div key={item.id} className="activity-row">
                                    <span className={`activity-dot ${item.status}`}></span>
                                    <div className="activity-info">
                                        <strong>{item.user}</strong>
                                        <small>{item.details}</small>
                                    </div>
                                    <div className="activity-right">
                                        <span className={`activity-badge ${item.status}`}>{item.action}</span>
                                        <small>{item.time}</small>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
