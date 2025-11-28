import React, { useState, useEffect } from 'react';
import { MessageSquare, Webhook, Calendar, CheckCircle, AlertCircle, XCircle, ExternalLink, X, Save } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import './Integrations.css';

const Integrations = () => {
    const { user } = useAuth();
    const [webhookUrl, setWebhookUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [integrations, setIntegrations] = useState([
        {
            id: 1,
            name: 'Twilio SMS',
            icon: MessageSquare,
            status: 'connected',
            desc: 'Connectez votre numéro Twilio pour envoyer et recevoir des SMS.',
            config: { sid: 'AC...', token: '••••••••' }
        },
        {
            id: 2,
            name: 'CRM Webhook',
            icon: Webhook,
            status: 'disconnected',
            desc: 'Envoyez les leads qualifiés vers votre CRM via Webhook.',
            config: { url: '' },
            isWebhook: true
        },
        {
            id: 3,
            name: 'Google Calendar',
            icon: Calendar,
            status: 'disconnected',
            desc: 'Permettez à l\'IA de planifier des rendez-vous directement.',
            config: {}
        },
    ]);

    const [selectedError, setSelectedError] = useState(null);

    useEffect(() => {
        if (user) {
            fetchWebhookConfig();
        }
    }, [user]);

    const fetchWebhookConfig = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('webhook_url')
                .eq('id', user.id)
                .single();

            if (error) throw error;

            if (data?.webhook_url) {
                setWebhookUrl(data.webhook_url);
                updateIntegrationStatus(2, 'connected', { url: data.webhook_url });
            }
        } catch (error) {
            console.error('Error fetching webhook config:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveWebhookConfig = async () => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ webhook_url: webhookUrl })
                .eq('id', user.id);

            if (error) throw error;

            updateIntegrationStatus(2, webhookUrl ? 'connected' : 'disconnected', { url: webhookUrl });
            alert('Configuration Webhook sauvegardée !');
        } catch (error) {
            console.error('Error saving webhook config:', error);
            alert('Erreur lors de la sauvegarde.');
        } finally {
            setSaving(false);
        }
    };

    const updateIntegrationStatus = (id, status, config) => {
        setIntegrations(prev => prev.map(int =>
            int.id === id ? { ...int, status, config: { ...int.config, ...config } } : int
        ));
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'connected': return <CheckCircle size={18} className="text-success" />;
            case 'error': return <AlertCircle size={18} className="text-danger" />;
            default: return <XCircle size={18} className="text-muted" />;
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case 'connected': return 'Connecté';
            case 'error': return 'Erreur';
            default: return 'Déconnecté';
        }
    };
    // const getStatusIcon = (status) => {
    //     switch (status) {
    //         case 'connected': return <CheckCircle size={18} className="text-success" />;
    //         case 'error': return <AlertCircle size={18} className="text-danger" />;
    //         default: return <XCircle size={18} className="text-muted" />;
    //     }
    // };

    // const getStatusLabel = (status) => {
    //     switch (status) {
    //         case 'connected': return 'Connecté';
    //         case 'error': return 'Erreur';
    //         default: return 'Déconnecté';
    //     }
    // };

    return (
        <div className="page-container integrations-page">
            <header className="page-header">
                <div>
                    <h1>Intégrations</h1>
                    <p className="text-muted">Connectez vos outils préférés</p>
                </div>
            </header>

            <div className="integrations-grid">
                {/* Inbound Webhook Section */}
                <div className="integration-card">
                    <div className="card-header">
                        <div className="icon-wrapper" style={{ background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                            <Webhook size={24} />
                        </div>
                        <div>
                            <h3>Webhook Entrant</h3>
                            <p>Recevez des leads depuis Zapier, votre site, etc.</p>
                        </div>
                    </div>
                    <div className="config-fields">
                        <div className="input-group">
                            <label>URL DE VOTRE WEBHOOK</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    readOnly
                                    value={`https://app-smart-caller-backend-production.up.railway.app/webhooks/${user?.id}/leads`}
                                    className="bg-dark-lighter"
                                />
                                <button
                                    className="btn-secondary"
                                    onClick={() => {
                                        navigator.clipboard.writeText(`https://app-smart-caller-backend-production.up.railway.app/webhooks/${user?.id}/leads`);
                                        alert('URL copiée !');
                                    }}
                                >
                                    Copier
                                </button>
                            </div>
                            <small className="text-muted mt-2 block">
                                Envoyez une requête POST avec le JSON : <br />
                                <code>{`{ "name": "Jean", "phone": "+336..." }`}</code>
                            </small>
                        </div>
                    </div>
                </div>

                {integrations.map((integration) => (
                    <div key={integration.id} className={`integration-card ${!integration.connected && !integration.isWebhook ? 'disabled' : ''}`}>
                        <div className="card-header">
                            <div className="icon-wrapper" style={{ background: integration.color + '20', color: integration.color }}>
                                <integration.icon size={24} />
                            </div>
                        </div>
                        ) : (
                        <button className="btn-primary w-full">Connecter</button>
                        )
                            )}
                    </div>
                    </div>
                ))}
        </div>

            {/* Error Modal */ }
    {
        selectedError && (
            <div className="modal-overlay" onClick={() => setSelectedError(null)}>
                <div className="glass-panel modal-content" onClick={e => e.stopPropagation()}>
                    <div className="modal-header">
                        <h3 className="text-danger flex items-center gap-2">
                            <AlertCircle size={20} />
                            Erreur de Connexion
                        </h3>
                        <button className="btn-icon" onClick={() => setSelectedError(null)}>
                            <X size={20} />
                        </button>
                    </div>
                    <div className="modal-body">
                        <p className="mb-4">Une erreur est survenue lors de la dernière tentative de connexion avec <strong>{selectedError.name}</strong>.</p>
                        <div className="code-block">
                            <code>{selectedError.errorLog}</code>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button className="btn-secondary" onClick={() => setSelectedError(null)}>Fermer</button>
                        <button className="btn-primary">Réessayer</button>
                    </div>
                </div>
            </div>
        )
    }
        </div >
    );
};

export default Integrations;
