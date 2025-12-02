import React, { useState, useEffect } from 'react';
import { Users, CheckCircle, XCircle, MessageSquare, Clock, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, FunnelChart, Funnel, LabelList } from 'recharts';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import './Dashboard.css';

const Dashboard = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState({
        total: 0,
        qualified: 0,
        disqualified: 0,
        avgScore: 0,
        qualificationRate: 0
    });
    const [recentActivity, setRecentActivity] = useState([]);
    const [funnelData, setFunnelData] = useState([]);
    const [activityData, setActivityData] = useState([]);

    useEffect(() => {
        if (user) fetchData();
    }, [user]);

    const fetchData = async () => {
        try {
            const { data: contacts, error } = await supabase
                .from('contacts')
                .select('*')
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

            setMetrics({ total, qualified, disqualified, avgScore, qualificationRate });

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
                { value: total, name: 'Total des leads', fill: 'var(--accent-primary)' },
                { value: scoredContacts.length, name: 'Scorés', fill: 'var(--accent-secondary)' },
                { value: qualified, name: 'Qualifiés', fill: 'var(--success)' },
            ]);

            // 4. Weekly Activity (Mocking distribution for now based on real counts if dates match, 
            // but for simplicity let's just show a static distribution scaled to real total or just keep mock if no dates)
            // Let's try to group by day if possible, otherwise fallback.
            // Simple grouping by day of week:
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
            // Reorder to start from Monday
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
        { label: 'Total des leads', value: metrics.total, icon: Users, color: 'var(--accent-primary)' },
        { label: 'Qualifiés', value: metrics.qualified, icon: CheckCircle, color: 'var(--success)' },
        { label: 'Disqualifiés', value: metrics.disqualified, icon: XCircle, color: 'var(--danger)' },
        { label: 'Score moyen', value: `${metrics.avgScore}/100`, icon: MessageSquare, color: 'var(--warning)' },
        { label: 'Taux de qualif.', value: `${metrics.qualificationRate}%`, icon: Clock, color: '#8b5cf6' },
    ];

    if (loading) return <div className="p-8 text-center">Chargement du tableau de bord...</div>;

    return (
        <div className="page-container dashboard-page">
            <header className="page-header">
                <div>
                    <h1>Tableau de bord</h1>
                    <p className="text-muted">Aperçu des performances de votre agent IA</p>
                </div>
                {/* <button className="btn-primary">Exporter le rapport</button> */}
            </header>

            {/* Stats Grid */}
            <div className="stats-grid">
                {stats.map((stat, index) => (
                    <div key={index} className="glass-panel stat-card">
                        <div className="stat-icon" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
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
                    <h3>Entonnoir de Conversion</h3>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                            <FunnelChart>
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: 'var(--glass-border)', borderRadius: '8px' }}
                                    itemStyle={{ color: 'var(--text-primary)' }}
                                />
                                <Funnel
                                    dataKey="value"
                                    data={funnelData}
                                    isAnimationActive
                                >
                                    <LabelList position="right" fill="#fff" stroke="none" dataKey="name" />
                                </Funnel>
                            </FunnelChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Weekly Activity Chart */}
                <div className="glass-panel chart-card">
                    <h3>Nouveaux Leads par Jour</h3>
                    <div className="chart-container">
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={activityData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                                <XAxis dataKey="name" stroke="var(--text-muted)" axisLine={false} tickLine={false} />
                                <YAxis stroke="var(--text-muted)" axisLine={false} tickLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: 'var(--bg-secondary)', border: 'var(--glass-border)', borderRadius: '8px' }}
                                    itemStyle={{ color: 'var(--text-primary)' }}
                                />
                                <Bar dataKey="leads" fill="var(--accent-primary)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="glass-panel recent-activity">
                <div className="activity-header">
                    <h3>Derniers Contacts</h3>
                    {/* <button className="btn-secondary text-sm">Voir tout</button> */}
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
                                    <span className={`badge ${item.status === 'qualified' ? 'bg-success-dim text-success' : item.status === 'disqualified' ? 'bg-danger-dim text-danger' : 'bg-primary-dim text-primary'}`}>
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
