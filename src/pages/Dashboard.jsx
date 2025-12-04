import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, XCircle, MessageSquare, Clock, ArrowRight, Calendar, TrendingUp, Zap } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, FunnelChart, Funnel, LabelList } from 'recharts';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { isDemoMode, demoStats, demoContacts } from '../data/demoData';
import './Dashboard.css';

const Dashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [isDemo, setIsDemo] = useState(false);
    const [metrics, setMetrics] = useState({
        total: 0,
        qualified: 0,
        disqualified: 0,
        avgScore: 0,
        qualificationRate: 0,
        meetings: 0,
        responseTime: '—'
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [funnelData, setFunnelData] = useState([]);
    const [activityData, setActivityData] = useState([]);
    const [sourceData, setSourceData] = useState([]);

    useEffect(() => {
        if (user) {
            const demoMode = isDemoMode(user);
            setIsDemo(demoMode);
            
            if (demoMode) {
                loadDemoData();
            } else {
                fetchData();
            }
        }
    }, [user]);

    const loadDemoData = () => {
        // Load demo metrics
        setMetrics({
            total: demoStats.totalLeads,
            qualified: demoStats.qualifiedLeads,
            disqualified: 28,
            avgScore: demoStats.averageScore,
            qualificationRate: demoStats.qualificationRate,
            meetings: demoStats.meetingsBooked,
            responseTime: demoStats.responseTime
        });

        // Load demo activity
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

        // Load demo funnel
        setFunnelData([
            { value: demoStats.totalLeads, name: 'Total des leads', fill: '#FF470F' },
            { value: 234, name: 'Contactés', fill: '#FF6B35' },
            { value: demoStats.qualifiedLeads, name: 'Qualifiés', fill: '#10B981' },
            { value: demoStats.meetingsBooked, name: 'RDV', fill: '#3B82F6' },
        ]);

        // Load demo weekly data
        setActivityData(demoStats.weeklyData.map(d => ({
            name: d.day,
            leads: d.leads,
            qualified: d.qualified
        })));

        // Load source data
        setSourceData(demoStats.sourceData);

        setLoading(false);
    };

    const fetchData = async () => {
        if (!user) return;
        
        try {
            // Filter contacts by agent_id (user's ID)
            const { data: contacts, error } = await supabase
                .from('contacts')
                .select('*')
                .eq('agent_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;

            // 1. Calculate Metrics
            const total = contacts.length;
            const qualified = contacts.filter(c => c.score >= 70).length;
            const disqualified = contacts.filter(c => c.score !== null && c.score < 30).length;
            const scoredContacts = contacts.filter(c => c.score !== null);
            const avgScore = scoredContacts.length > 0
                ? Math.round(scoredContacts.reduce((acc, c) => acc + c.score, 0) / scoredContacts.length)
                : 0;
            const qualificationRate = total > 0 ? Math.round((qualified / total) * 100) : 0;

            setMetrics({ 
                total, 
                qualified, 
                disqualified, 
                avgScore, 
                qualificationRate,
                meetings: 0,
                responseTime: '—'
            });

            // 2. Recent Activity (Last 5 contacts)
            setRecentActivity(contacts.slice(0, 5).map(c => ({
                id: c.id,
                user: c.name,
                action: c.score >= 70 ? 'Qualifié' : c.score < 30 && c.score !== null ? 'Disqualifié' : 'Nouveau Lead',
                time: new Date(c.created_at).toLocaleDateString(),
                status: c.score >= 70 ? 'qualified' : c.score < 30 && c.score !== null ? 'disqualified' : 'pending',
                details: c.score_reason || c.source || 'En attente'
            })));

            // 3. Funnel Data
            setFunnelData([
                { value: total, name: 'Total des leads', fill: '#FF470F' },
                { value: scoredContacts.length, name: 'Scorés', fill: '#FF6B35' },
                { value: qualified, name: 'Qualifiés', fill: '#10B981' },
            ]);

            // 4. Weekly Activity
            const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
            const activityMap = { 'Dim': 0, 'Lun': 0, 'Mar': 0, 'Mer': 0, 'Jeu': 0, 'Ven': 0, 'Sam': 0 };

            contacts.forEach(c => {
                const day = days[new Date(c.created_at).getDay()];
                activityMap[day]++;
            });

            const chartData = Object.keys(activityMap).map(day => ({
                name: day,
                leads: activityMap[day]
            }));
            const orderedChartData = [
                ...chartData.slice(1),
                chartData[0]
            ];
            setActivityData(orderedChartData);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const stats = [
        { label: 'Total des leads', value: metrics.total, icon: Users, color: '#FF470F' },
        { label: 'Qualifiés', value: metrics.qualified, icon: CheckCircle, color: '#10B981' },
        { label: 'Score moyen', value: `${metrics.avgScore}/100`, icon: TrendingUp, color: '#F59E0B' },
        { label: 'Taux de qualif.', value: `${metrics.qualificationRate}%`, icon: Zap, color: '#8B5CF6' },
        { label: 'RDV réservés', value: metrics.meetings, icon: Calendar, color: '#3B82F6' },
        { label: 'Temps réponse', value: metrics.responseTime, icon: Clock, color: '#EC4899' },
    ];

    if (loading) return <div className="p-8 text-center">Chargement du tableau de bord...</div>;

    return (
        <div className="page-container dashboard-page">
            <header className="page-header">
                <div>
                    <h1>Tableau de bord</h1>
                    <p className="text-muted">Aperçu des performances de votre agent IA</p>
                </div>
                {isDemo && (
                    <div className="demo-badge">
                        <span>🎯 Mode Démo</span>
                    </div>
                )}
            </header>

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
                    </div>
                ))}
            </div>

            <div className="charts-grid">
                {/* Funnel Chart */}
                <div className="glass-panel chart-card">
                    <h3>Entonnoir de conversion</h3>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                            <FunnelChart>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e5e5', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    itemStyle={{ color: '#1a1a1a' }}
                                />
                                <Funnel
                                    dataKey="value"
                                    data={funnelData}
                                    isAnimationActive
                                >
                                    <LabelList position="right" fill="#1a1a1a" stroke="none" dataKey="name" />
                                </Funnel>
                            </FunnelChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Weekly Activity Chart */}
                <div className="glass-panel chart-card">
                    <h3>Leads par jour</h3>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={activityData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e5e5" vertical={false} />
                                <XAxis dataKey="name" stroke="#6b7280" axisLine={false} tickLine={false} />
                                <YAxis stroke="#6b7280" axisLine={false} tickLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(0,0,0,0.02)' }}
                                    contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e5e5e5', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                    itemStyle={{ color: '#1a1a1a' }}
                                />
                                <Bar dataKey="leads" fill="#FF470F" radius={[4, 4, 0, 0]} name="Leads" />
                                {isDemo && <Bar dataKey="qualified" fill="#10B981" radius={[4, 4, 0, 0]} name="Qualifiés" />}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Source Performance (Demo only) */}
            {isDemo && sourceData.length > 0 && (
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
                </div>
                <div className="activity-list">
                    {recentActivity.length === 0 ? (
                        <div className="text-muted text-center py-4">Aucune activité récente</div>
                    ) : (
                        recentActivity.map((item) => (
                            <div key={item.id} className="activity-item">
                                <div className={`status-indicator ${item.status}`}></div>
                                <div className="activity-details">
                                    <span className="activity-user">{item.user}</span>
                                    <span className="activity-action text-xs text-muted">{item.details}</span>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className={`badge ${
                                        item.status === 'qualified' ? 'bg-success-dim text-success' : 
                                        item.status === 'meeting' ? 'bg-blue-dim text-blue' :
                                        item.status === 'disqualified' ? 'bg-danger-dim text-danger' : 
                                        'bg-primary-dim text-primary'
                                    }`}>
                                        {item.action}
                                    </span>
                                    <span className="activity-time mt-1">{item.time}</span>
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
