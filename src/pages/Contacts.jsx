import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Upload, FileText, Check, AlertCircle, User, Send, Plus, Webhook, MessageSquare, Download } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { isDemoMode, demoContacts } from '../data/demoData';
import './Contacts.css';

const Contacts = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [importing, setImporting] = useState(false);
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState([]);
    const [sendInitialSms, setSendInitialSms] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);
    const [isDemo, setIsDemo] = useState(false);

    useEffect(() => {
        if (user) {
            const demoMode = isDemoMode(user);
            setIsDemo(demoMode);
            
            if (demoMode) {
                loadDemoContacts();
            } else {
                fetchContacts();
            }
        }
    }, [user]);

    const loadDemoContacts = () => {
        // Transform demo contacts to match expected format
        const transformedContacts = demoContacts.map(c => ({
            ...c,
            company_name: c.company,
            job_title: c.tags?.includes('decision-maker') ? 'Décideur' : null,
        }));
        setContacts(transformedContacts);
        setLoading(false);
    };

    const fetchContacts = async () => {
        if (!user) return;
        
        try {
            // Filter contacts by agent_id (user's ID)
            const { data, error } = await supabase
                .from('contacts')
                .select('*')
                .eq('agent_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setContacts(data || []);
        } catch (error) {
            console.error('Error fetching contacts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            parseCSV(selectedFile);
        }
    };

    const parseCSV = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target.result;
            const lines = text.split('\n');
            const parsed = lines
                .slice(1) // Skip header
                .filter(line => line.trim() !== '')
                .map(line => {
                    const [name, phone] = line.split(',');
                    return { name: name?.trim(), phone: phone?.trim() };
                })
                .filter(c => c.name && c.phone);
            setPreview(parsed);
        };
        reader.readAsText(file);
    };

    const handleImport = async () => {
        if (preview.length === 0) return;
        setImporting(true);

        try {
            // 1. Insert into Supabase
            const contactsToInsert = preview.map(c => ({
                ...c,
                agent_id: user.id,
                status: 'pending'
            }));

            const { error } = await supabase.from('contacts').insert(contactsToInsert);
            if (error) throw error;

            // 2. Trigger Backend for SMS (if enabled)
            if (sendInitialSms) {
                // Replace with your actual backend URL
                const backendUrl = 'https://webhook.smart-caller.ai/import-leads';
                // Note: In dev, you might use localhost, but for prod use the real URL.
                // Ideally use an env var: import.meta.env.VITE_BACKEND_URL

                await fetch(backendUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        leads: preview,
                        agentId: user.id,
                        sendInitialSms: true
                    })
                });
            }

            alert(`Import réussi de ${preview.length} contacts !`);
            setShowImportModal(false);
            setFile(null);
            setPreview([]);
            fetchContacts();

        } catch (error) {
            console.error('Error importing contacts:', error);
            alert("Erreur lors de l'import.");
        } finally {
            setImporting(false);
        }
    };

    // Export contacts to CSV
    const exportToCSV = () => {
        if (contacts.length === 0) {
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
            c.score >= 70 ? 'Qualifié' : c.score < 30 && c.score !== null ? 'Disqualifié' : 'En cours',
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
    };

    return (
        <div className="page-container contacts-page">
            <header className="page-header">
                <div>
                    <h1>Contacts</h1>
                    <p className="text-muted">Gérez votre base de prospects</p>
                </div>
                <div className="header-actions">
                    {isDemo && (
                        <div className="demo-badge">
                            <span>🎯 Mode Démo</span>
                        </div>
                    )}
                    <button className="btn-secondary" onClick={exportToCSV}>
                        <Download size={18} /> Exporter CSV
                    </button>
                    <Link to="/integrations" className="btn-secondary">
                        <Webhook size={18} /> Connecter un Webhook
                    </Link>
                    <button className="btn-primary" onClick={() => setShowImportModal(true)}>
                        <Plus size={18} /> Importer CSV
                    </button>
                </div>
            </header>

            <div className="glass-panel">
                {loading ? (
                    <div className="p-8 text-center">Chargement...</div>
                ) : contacts.length === 0 ? (
                    <div className="empty-state">
                        <User size={48} className="text-muted mb-4" />
                        <h3>Aucun contact</h3>
                        <p>Importez un fichier CSV pour commencer.</p>
                    </div>
                ) : (
                    <table className="contacts-table">
                        <thead>
                            <tr>
                                <th>Nom</th>
                                <th>Entreprise</th>
                                <th>Poste</th>
                                <th>Téléphone</th>
                                <th>Source</th>
                                <th>Score</th>
                                <th>Statut</th>
                                <th>Date d'ajout</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contacts.map((contact) => (
                                <tr key={contact.id}>
                                    <td>
                                        <div className="font-medium">{contact.name}</div>
                                        <div className="text-xs text-muted">{contact.email}</div>
                                    </td>
                                    <td>{contact.company_name || '-'}</td>
                                    <td>{contact.job_title || '-'}</td>
                                    <td>{contact.phone}</td>
                                    <td>{contact.source || '-'}</td>
                                    <td>
                                        {contact.score !== null ? (
                                            <div className="flex items-center gap-2" title={contact.score_reason}>
                                                <div className="w-16 h-2 bg-dark-lighter rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full ${contact.score > 70 ? 'bg-success' : contact.score > 40 ? 'bg-warning' : 'bg-danger'}`}
                                                        style={{ width: `${contact.score}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-medium">{contact.score}</span>
                                            </div>
                                        ) : (
                                            <span className="text-muted text-xs">-</span>
                                        )}
                                    </td>
                                    <td>
                                        <span className={`status-badge ${contact.status}`}>
                                            {contact.status}
                                        </span>
                                    </td>
                                    <td>{new Date(contact.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <button 
                                            className="btn-view-conversation"
                                            onClick={() => navigate(`/conversations?phone=${encodeURIComponent(contact.phone)}`)}
                                            title="Voir la conversation"
                                        >
                                            <MessageSquare size={16} />
                                            <span>Conversation</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {/* Import Modal */}
            {showImportModal && (
                <div className="modal-overlay">
                    <div className="glass-panel modal-content">
                        <div className="modal-header">
                            <h3>Importer des Contacts</h3>
                            <button className="btn-icon" onClick={() => setShowImportModal(false)}>
                                <AlertCircle size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="upload-area">
                                <input type="file" accept=".csv" onChange={handleFileChange} id="csv-upload" hidden />
                                <label htmlFor="csv-upload" className="upload-label">
                                    <Upload size={32} />
                                    <span>Cliquez pour uploader un CSV</span>
                                    <small>Format: Nom, Téléphone</small>
                                </label>
                            </div>

                            {file && (
                                <div className="file-preview">
                                    <div className="flex items-center gap-2 mb-4">
                                        <FileText size={18} />
                                        <span>{file.name} ({preview.length} contacts détectés)</span>
                                    </div>

                                    <div className="checkbox-group">
                                        <input
                                            type="checkbox"
                                            id="send-sms"
                                            checked={sendInitialSms}
                                            onChange={(e) => setSendInitialSms(e.target.checked)}
                                        />
                                        <label htmlFor="send-sms">
                                            Envoyer le message d'accueil immédiatement
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setShowImportModal(false)}>Annuler</button>
                            <button
                                className="btn-primary"
                                disabled={!file || importing}
                                onClick={handleImport}
                            >
                                {importing ? 'Import en cours...' : 'Importer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Contacts;
