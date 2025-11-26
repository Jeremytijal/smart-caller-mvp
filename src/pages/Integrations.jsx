import React, { useState } from 'react';
import { MessageSquare, Webhook, Calendar, CheckCircle, AlertCircle, XCircle, ExternalLink, X } from 'lucide-react';
import './Integrations.css';

const Integrations = () => {
    const [integrations, setIntegrations] = useState([
        {
            id: 1,
            name: 'Twilio SMS',
            icon: MessageSquare,
            status: 'connected',
            desc: 'Connectez votre numéro Twilio pour envoyer et recevoir des SMS.',
            config: { sid: 'AC123...', token: '••••••••' }
        },
        {
            id: 2,
            name: 'CRM Webhook',
            icon: Webhook,
            status: 'error',
            desc: 'Envoyez les leads qualifiés vers votre CRM via Webhook.',
            config: { url: 'https://api.crm.com/leads' },
            errorLog: '401 Unauthorized - Check API Key'
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

    return (
        <div className="page-container integrations-page">
            <header className="page-header">
                <div>
                    <h1>Intégrations</h1>
                    <p className="text-muted">Gérez vos connexions externes</p>
                </div>
                <button className="btn-secondary">Documentation API</button>
            </header>

            <div className="integrations-grid">
                {integrations.map((integration) => (
                    <div key={integration.id} className="glass-panel integration-card">
                        <div className="card-header">
                            <div className="integration-icon">
                                <integration.icon size={24} />
                            </div>
                            <div className={`status-badge ${integration.status} ${integration.status === 'error' ? 'error' : ''}`} onClick={() => integration.status === 'error' && setSelectedError(integration)}>
                                {getStatusIcon(integration.status)}
                                <span>{getStatusLabel(integration.status)}</span>
                            </div>
                        </div>

                        <h3>{integration.name}</h3>
                        <p className="integration-desc">{integration.desc}</p>

                        <div className="config-section">
                            {integration.status === 'connected' || integration.status === 'error' ? (
                                <div className="config-fields">
                                    {Object.keys(integration.config).map(key => (
                                        <div key={key} className="input-group">
                                            <label>{key.toUpperCase()}</label>
                                            <input type="text" value={integration.config[key]} readOnly />
                                        </div>
                                    ))}
                                    <button className="btn-secondary w-full">Configurer</button>
                                </div>
                            ) : (
                                <button className="btn-primary w-full">Connecter</button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Error Modal */}
            {selectedError && (
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
            )}
        </div>
    );
};

export default Integrations;
