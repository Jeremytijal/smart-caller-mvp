import React, { useState, useEffect } from 'react';
import { 
    Ban, Plus, Trash2, Search, Upload, Download, Shield, AlertTriangle,
    Phone, Calendar, X, Check, FileText, Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { endpoints } from '../config';
import './Blacklist.css';

const Blacklist = () => {
    const { user } = useAuth();
    const [blacklist, setBlacklist] = useState([]);
    const [stats, setStats] = useState({ total: 0, bySource: {} });
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [newPhone, setNewPhone] = useState('');
    const [newReason, setNewReason] = useState('Opt-out demandé');
    const [importText, setImportText] = useState('');
    const [importing, setImporting] = useState(false);

    useEffect(() => {
        if (user) fetchBlacklist();
    }, [user]);

    const fetchBlacklist = async () => {
        setLoading(true);
        try {
            const res = await fetch(endpoints.blacklist(user.id));
            const data = await res.json();
            setBlacklist(data.blacklist || []);
            setStats(data.stats || { total: 0, bySource: {} });
        } catch (error) {
            console.error('Error fetching blacklist:', error);
        } finally {
            setLoading(false);
        }
    };

    const addToBlacklist = async () => {
        if (!newPhone) return;

        try {
            await fetch(endpoints.blacklist(user.id), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: newPhone, reason: newReason })
            });
            
            setShowAddModal(false);
            setNewPhone('');
            setNewReason('Opt-out demandé');
            fetchBlacklist();
        } catch (error) {
            console.error('Error adding to blacklist:', error);
        }
    };

    const removeFromBlacklist = async (phone) => {
        if (!window.confirm('Retirer ce numéro de la liste noire ?')) return;

        try {
            await fetch(endpoints.blacklistDelete(user.id, phone), {
                method: 'DELETE'
            });
            fetchBlacklist();
        } catch (error) {
            console.error('Error removing from blacklist:', error);
        }
    };

    const importBlacklist = async () => {
        if (!importText.trim()) return;

        setImporting(true);
        try {
            const phoneNumbers = importText
                .split(/[\n,;]/)
                .map(p => p.trim())
                .filter(p => p.length > 0);

            const res = await fetch(endpoints.blacklistImport(user.id), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumbers, reason: 'Import CSV' })
            });
            
            const result = await res.json();
            alert(`Import terminé : ${result.added} ajoutés, ${result.skipped} ignorés`);
            
            setShowImportModal(false);
            setImportText('');
            fetchBlacklist();
        } catch (error) {
            console.error('Error importing:', error);
        } finally {
            setImporting(false);
        }
    };

    const exportBlacklist = async () => {
        try {
            const res = await fetch(endpoints.blacklistExport(user.id));
            const data = await res.json();
            
            const csv = [
                'Téléphone,Raison,Source,Date',
                ...data.map(item => 
                    `${item.phone},"${item.reason}",${item.source},${new Date(item.created_at).toLocaleDateString('fr-FR')}`
                )
            ].join('\n');

            const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `blacklist_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
        } catch (error) {
            console.error('Error exporting:', error);
        }
    };

    const filteredList = blacklist.filter(item =>
        item.phone.includes(searchQuery) || 
        item.reason?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getSourceLabel = (source) => {
        const labels = {
            'manual': 'Manuel',
            'sms_stop': 'SMS STOP',
            'import': 'Import',
            'api': 'API'
        };
        return labels[source] || source;
    };

    const getSourceColor = (source) => {
        const colors = {
            'manual': '#3B82F6',
            'sms_stop': '#EF4444',
            'import': '#8B5CF6',
            'api': '#10B981'
        };
        return colors[source] || '#6B7280';
    };

    if (loading) {
        return <div className="page-loading">Chargement...</div>;
    }

    return (
        <div className="page-container blacklist-page">
            {/* Header */}
            <header className="page-header">
                <div>
                    <h1>Liste Noire (RGPD)</h1>
                    <p className="text-muted">Gestion des numéros opt-out</p>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary" onClick={exportBlacklist}>
                        <Download size={18} />
                        Exporter
                    </button>
                    <button className="btn-secondary" onClick={() => setShowImportModal(true)}>
                        <Upload size={18} />
                        Importer
                    </button>
                    <button className="btn-primary" onClick={() => setShowAddModal(true)}>
                        <Plus size={18} />
                        Ajouter
                    </button>
                </div>
            </header>

            {/* Stats */}
            <div className="blacklist-stats">
                <div className="stat-card glass-panel">
                    <div className="stat-icon" style={{ background: '#EF444415', color: '#EF4444' }}>
                        <Ban size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.total}</span>
                        <span className="stat-label">Numéros bloqués</span>
                    </div>
                </div>
                <div className="stat-card glass-panel">
                    <div className="stat-icon" style={{ background: '#F59E0B15', color: '#F59E0B' }}>
                        <AlertTriangle size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.bySource?.sms_stop || 0}</span>
                        <span className="stat-label">Via SMS STOP</span>
                    </div>
                </div>
                <div className="stat-card glass-panel">
                    <div className="stat-icon" style={{ background: '#3B82F615', color: '#3B82F6' }}>
                        <Phone size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">{stats.bySource?.manual || 0}</span>
                        <span className="stat-label">Ajoutés manuellement</span>
                    </div>
                </div>
                <div className="stat-card glass-panel">
                    <div className="stat-icon" style={{ background: '#10B98115', color: '#10B981' }}>
                        <Shield size={24} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-value">100%</span>
                        <span className="stat-label">Conformité RGPD</span>
                    </div>
                </div>
            </div>

            {/* Info Banner */}
            <div className="info-banner glass-panel">
                <Info size={20} />
                <div>
                    <strong>Comment ça marche ?</strong>
                    <p>Les numéros sur cette liste ne recevront plus aucun message. Les mots-clés "STOP", "DÉSABONNER", etc. sont automatiquement détectés et le numéro est ajouté à la liste.</p>
                </div>
            </div>

            {/* Search */}
            <div className="search-bar">
                <Search size={18} />
                <input
                    type="text"
                    placeholder="Rechercher un numéro..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* List */}
            <div className="blacklist-table glass-panel">
                {filteredList.length === 0 ? (
                    <div className="empty-state">
                        <Ban size={48} />
                        <h3>Aucun numéro bloqué</h3>
                        <p>La liste noire est vide</p>
                    </div>
                ) : (
                    <table>
                        <thead>
                            <tr>
                                <th>Numéro</th>
                                <th>Raison</th>
                                <th>Source</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredList.map(item => (
                                <tr key={item.id}>
                                    <td>
                                        <div className="phone-cell">
                                            <Phone size={16} />
                                            {item.phone}
                                        </div>
                                    </td>
                                    <td>{item.reason || '—'}</td>
                                    <td>
                                        <span 
                                            className="source-badge"
                                            style={{ 
                                                background: `${getSourceColor(item.source)}15`,
                                                color: getSourceColor(item.source)
                                            }}
                                        >
                                            {getSourceLabel(item.source)}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="date-cell">
                                            <Calendar size={14} />
                                            {new Date(item.created_at).toLocaleDateString('fr-FR')}
                                        </div>
                                    </td>
                                    <td>
                                        <button 
                                            className="btn-icon-sm danger"
                                            onClick={() => removeFromBlacklist(item.phone)}
                                            title="Retirer de la liste"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Add Modal */}
            {showAddModal && (
                <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
                    <div className="modal glass-panel" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Ajouter à la liste noire</h2>
                            <button className="btn-icon" onClick={() => setShowAddModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Numéro de téléphone</label>
                                <input
                                    type="tel"
                                    value={newPhone}
                                    onChange={(e) => setNewPhone(e.target.value)}
                                    placeholder="+33 6 12 34 56 78"
                                />
                            </div>
                            <div className="form-group">
                                <label>Raison</label>
                                <select
                                    value={newReason}
                                    onChange={(e) => setNewReason(e.target.value)}
                                >
                                    <option value="Opt-out demandé">Opt-out demandé</option>
                                    <option value="Numéro invalide">Numéro invalide</option>
                                    <option value="Plainte reçue">Plainte reçue</option>
                                    <option value="Ne pas contacter">Ne pas contacter</option>
                                    <option value="Autre">Autre</option>
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setShowAddModal(false)}>
                                Annuler
                            </button>
                            <button className="btn-primary" onClick={addToBlacklist}>
                                <Ban size={16} />
                                Bloquer ce numéro
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Import Modal */}
            {showImportModal && (
                <div className="modal-overlay" onClick={() => setShowImportModal(false)}>
                    <div className="modal glass-panel" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Importer des numéros</h2>
                            <button className="btn-icon" onClick={() => setShowImportModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Numéros (un par ligne ou séparés par virgule)</label>
                                <textarea
                                    value={importText}
                                    onChange={(e) => setImportText(e.target.value)}
                                    placeholder="+33612345678
+33698765432
+33687654321"
                                    rows={8}
                                />
                            </div>
                            <div className="import-info">
                                <FileText size={16} />
                                <span>
                                    {importText.split(/[\n,;]/).filter(p => p.trim()).length} numéros détectés
                                </span>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setShowImportModal(false)}>
                                Annuler
                            </button>
                            <button 
                                className="btn-primary" 
                                onClick={importBlacklist}
                                disabled={importing}
                            >
                                {importing ? 'Import...' : 'Importer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Blacklist;

