import React, { useState, useEffect } from 'react';
import { Upload, FileText, Check, AlertCircle, User, Send, Plus } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import './Contacts.css';

const Contacts = () => {
    const { user } = useAuth();
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [importing, setImporting] = useState(false);
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState([]);
    const [sendInitialSms, setSendInitialSms] = useState(false);
    const [showImportModal, setShowImportModal] = useState(false);

    useEffect(() => {
        if (user) {
            fetchContacts();
        }
    }, [user]);

    const fetchContacts = async () => {
        try {
            const { data, error } = await supabase
                .from('contacts')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setContacts(data);
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
                const backendUrl = 'https://app-smart-caller-backend-production.up.railway.app/import-leads';
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

    return (
        <div className="page-container contacts-page">
            <header className="page-header">
                <div>
                    <h1>Contacts</h1>
                    <p className="text-muted">Gérez votre base de prospects</p>
                </div>
                <button className="btn-primary" onClick={() => setShowImportModal(true)}>
                    <Plus size={18} /> Importer CSV
                </button>
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
                                <th>Téléphone</th>
                                <th>Statut</th>
                                <th>Date d'ajout</th>
                            </tr>
                        </thead>
                        <tbody>
                            {contacts.map((contact) => (
                                <tr key={contact.id}>
                                    <td>{contact.name}</td>
                                    <td>{contact.phone}</td>
                                    <td>
                                        <span className={`status-badge ${contact.status}`}>
                                            {contact.status}
                                        </span>
                                    </td>
                                    <td>{new Date(contact.created_at).toLocaleDateString()}</td>
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
