import React from 'react';
import { Users, CheckCircle, XCircle, MessageSquare, Clock, ArrowRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, FunnelChart, Funnel, LabelList } from 'recharts';
import './Dashboard.css';

const Dashboard = () => {
    // Mock Data
    const stats = [
        { label: 'Total Leads', value: '1,234', icon: Users, color: 'var(--accent-primary)' },
        { label: 'Qualifiés', value: '856', icon: CheckCircle, color: 'var(--success)' },
        { label: 'Disqualifiés', value: '342', icon: XCircle, color: 'var(--danger)' },
        { label: 'Chats Actifs', value: '28', icon: MessageSquare, color: 'var(--warning)' },
        { label: 'Temps de Réponse', value: '12s', icon: Clock, color: '#8b5cf6' },
    ];

    const funnelData = [
        { value: 1234, name: 'Total Leads', fill: 'var(--accent-primary)' },
        { value: 980, name: 'Engagés', fill: 'var(--accent-secondary)' },
        { value: 856, name: 'Qualifiés', fill: 'var(--success)' },
        { value: 120, name: 'Rendez-vous', fill: '#8b5cf6' },
    ];

    const activityData = [
        { name: 'Lun', qualified: 45, disqualified: 20 },
        { name: 'Mar', qualified: 52, disqualified: 18 },
        { name: 'Mer', qualified: 48, disqualified: 25 },
        { name: 'Jeu', qualified: 61, disqualified: 15 },
        { name: 'Ven', qualified: 55, disqualified: 22 },
        { name: 'Sam', qualified: 38, disqualified: 10 },
        { name: 'Dim', qualified: 42, disqualified: 12 },
    ];

    const recentActivity = [
        { id: 1, user: 'Alice Smith', action: 'Qualifié via SMS', time: 'il y a 2 min', status: 'qualified' },
        { id: 2, user: 'Bob Jones', action: 'Disqualifié (Pas de budget)', time: 'il y a 15 min', status: 'disqualified' },
        { id: 3, user: 'Charlie Brown', action: 'Nouvelle conversation', time: 'il y a 1h', status: 'pending' },
        { id: 4, user: 'David Wilson', action: 'Rendez-vous planifié', time: 'il y a 2h', status: 'qualified' },
    ];

    return (
        <div className="page-container dashboard-page">
            <header className="page-header">
                <div>
                    <h1>Tableau de bord</h1>
                    <p className="text-muted">Aperçu des performances de votre agent IA</p>
                </div>
                <button className="btn-primary">Exporter le rapport</button>
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
                    <h3>Activité Hebdomadaire</h3>
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
                                <Bar dataKey="qualified" fill="var(--success)" radius={[4, 4, 0, 0]} stackId="a" />
                                <Bar dataKey="disqualified" fill="var(--danger)" radius={[4, 4, 0, 0]} stackId="a" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="glass-panel recent-activity">
                <div className="activity-header">
                    <h3>Activité Récente</h3>
                    <button className="btn-secondary text-sm">Voir tout</button>
                </div>
                <div className="activity-list">
                    {recentActivity.map((item) => (
                        <div key={item.id} className="activity-item">
                            <div className={`status-indicator ${item.status}`}></div>
                            <div className="activity-details">
                                <span className="activity-user">{item.user}</span>
                                <span className="activity-action">{item.action}</span>
                            </div>
                            <span className="activity-time">{item.time}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
