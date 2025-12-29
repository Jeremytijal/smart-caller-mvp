import React, { useState, useEffect } from 'react';
import { Webhook, Calendar, CheckCircle, Copy, Check, Save, ExternalLink, Link2, MessageCircle, Smartphone, Phone, X, AlertTriangle, Loader2 } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { WEBHOOK_BASE_URL, API_URL } from '../config';
import './Integrations.css';

const Integrations = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(null); // 'crm' or 'calendar'
    const [copied, setCopied] = useState(false);
    const [showJson, setShowJson] = useState(false);

    // Config states
    const [crmWebhookUrl, setCrmWebhookUrl] = useState('');
    const [calendarUrl, setCalendarUrl] = useState('');

    // WhatsApp states
    const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
    const [whatsappStatus, setWhatsappStatus] = useState({ connected: false });
    const [whatsappQR, setWhatsappQR] = useState(null);
    const [whatsappConnecting, setWhatsappConnecting] = useState(false);
    const [whatsappError, setWhatsappError] = useState(null);
    
    // WhatsApp Business API states
    const [whatsappBusinessNumber, setWhatsappBusinessNumber] = useState('');
    const [whatsappBusinessEnabled, setWhatsappBusinessEnabled] = useState(false);

    // Inbound webhook URL (read-only, based on user ID)
    const inboundWebhookUrl = `${WEBHOOK_BASE_URL}/${user?.id}/leads`;

    useEffect(() => {
        if (user) {
            fetchConfig();
            fetchWhatsAppStatus();
        }
    }, [user]);

    // Fetch WhatsApp connection status
    const fetchWhatsAppStatus = async () => {
        try {
            const response = await fetch(`${API_URL}/api/whatsapp/status/${user.id}`);
            const data = await response.json();
            setWhatsappStatus(data);
        } catch (error) {
            console.error('Error fetching WhatsApp status:', error);
        }
    };

    // Start WhatsApp connection via SSE
    const startWhatsAppConnection = () => {
        setWhatsappConnecting(true);
        setWhatsappQR(null);
        setWhatsappError(null);

        const eventSource = new EventSource(`${API_URL}/api/whatsapp/connect/${user.id}`);

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
            console.log('[WhatsApp SSE]', data);

            if (data.type === 'qr') {
                setWhatsappQR(data.qr);
                setWhatsappConnecting(false);
            } else if (data.type === 'ready') {
                setWhatsappStatus({
                    connected: true,
                    phoneNumber: data.phoneNumber,
                    pushname: data.pushname
                });
                setShowWhatsAppModal(false);
                setWhatsappQR(null);
                setWhatsappConnecting(false);
                eventSource.close();
            } else if (data.type === 'error') {
                setWhatsappError(data.message);
                setWhatsappConnecting(false);
                eventSource.close();
            } else if (data.type === 'disconnected') {
                setWhatsappStatus({ connected: false });
                setWhatsappConnecting(false);
                eventSource.close();
            }
        };

        eventSource.onerror = (error) => {
            console.error('[WhatsApp SSE] Error:', error);
            setWhatsappError('Erreur de connexion au serveur');
            setWhatsappConnecting(false);
            eventSource.close();
        };
    };

    // Disconnect WhatsApp
    const disconnectWhatsApp = async () => {
        try {
            await fetch(`${API_URL}/api/whatsapp/disconnect/${user.id}`, {
                method: 'POST'
            });
            setWhatsappStatus({ connected: false });
        } catch (error) {
            console.error('Error disconnecting WhatsApp:', error);
        }
    };

    const fetchConfig = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('webhook_url, agent_config')
                .eq('id', user.id)
                .maybeSingle();

            if (error) throw error;
            if (!data) return;

            if (data) {
                setCrmWebhookUrl(data.webhook_url || '');
                setCalendarUrl(data.agent_config?.calendarUrl || '');
                setWhatsappBusinessNumber(data.agent_config?.whatsappBusinessNumber || '');
                setWhatsappBusinessEnabled(data.agent_config?.whatsappBusinessEnabled || false);
            }
        } catch (error) {
            console.error('Error fetching config:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveCrmWebhook = async () => {
        setSaving('crm');
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ webhook_url: crmWebhookUrl })
                .eq('id', user.id);

            if (error) throw error;
            alert('Webhook CRM sauvegardé !');
        } catch (error) {
            console.error('Error saving CRM webhook:', error);
            alert('Erreur lors de la sauvegarde.');
        } finally {
            setSaving(null);
        }
    };

    const saveCalendarUrl = async () => {
        setSaving('calendar');
        try {
            // Fetch current agent_config first
            const { data: currentData } = await supabase
                .from('profiles')
                .select('agent_config')
                .eq('id', user.id)
                .maybeSingle();

            const updatedConfig = {
                ...(currentData?.agent_config || {}),
                calendarUrl: calendarUrl
            };

            const { error } = await supabase
                .from('profiles')
                .update({ agent_config: updatedConfig })
                .eq('id', user.id);

            if (error) throw error;
            alert('URL de l\'agenda sauvegardée !');
        } catch (error) {
            console.error('Error saving calendar URL:', error);
            alert('Erreur lors de la sauvegarde.');
        } finally {
            setSaving(null);
        }
    };

    const saveWhatsAppBusiness = async () => {
        setSaving('whatsapp-business');
        try {
            // Fetch current agent_config first
            const { data: currentData } = await supabase
                .from('profiles')
                .select('agent_config')
                .eq('id', user.id)
                .maybeSingle();

            const updatedConfig = {
                ...(currentData?.agent_config || {}),
                whatsappBusinessNumber: whatsappBusinessNumber,
                whatsappBusinessEnabled: whatsappBusinessEnabled
            };

            const { error } = await supabase
                .from('profiles')
                .update({ agent_config: updatedConfig })
                .eq('id', user.id);

            if (error) throw error;
            alert('Configuration WhatsApp Business sauvegardée !');
        } catch (error) {
            console.error('Error saving WhatsApp Business config:', error);
            alert('Erreur lors de la sauvegarde.');
        } finally {
            setSaving(null);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return <div className="page-container integrations-page"><div className="loading">Chargement...</div></div>;
    }

    return (
        <div className="page-container integrations-page">
            <header className="page-header">
                <div>
                    <h1>Intégrations</h1>
                    <p className="text-muted">Connectez vos outils préférés</p>
                </div>
            </header>

            {/* WhatsApp Section */}
            <h2 className="section-title">
                <MessageCircle size={20} />
                Canal de messagerie
            </h2>

            <div className="whatsapp-section">
                <div className="integration-card whatsapp-card">
                    <div className="card-header-row">
                        <div className="card-icon-wrapper whatsapp-green">
                            <MessageCircle size={24} />
                        </div>
                        <div className="card-title-group">
                            <h3>WhatsApp</h3>
                            <p className="card-subtitle">Connectez votre WhatsApp pour contacter vos prospects</p>
                        </div>
                        {whatsappStatus.connected && (
                            <span className="status-badge connected">
                                <CheckCircle size={12} /> Connecté
                            </span>
                        )}
                    </div>

                    <div className="whatsapp-options-grid">
                        {/* Option 1: WhatsApp Web (QR Code) */}
                        <div className={`whatsapp-option ${whatsappStatus.connected ? 'option-active' : ''}`}>
                            <div className="option-header">
                                <span className="option-icon">📱</span>
                                <div>
                                    <h4>WhatsApp Web</h4>
                                    <p>Connexion rapide via QR code</p>
                                </div>
                                <span className="option-badge starter">Starter</span>
                            </div>
                            
                            {whatsappStatus.connected ? (
                                <div className="whatsapp-connected-info">
                                    <div className="connected-details">
                                        <div className="connected-avatar">
                                            <MessageCircle size={20} />
                                        </div>
                                        <div className="connected-text">
                                            <span className="connected-name">{whatsappStatus.pushname || 'WhatsApp'}</span>
                                            <span className="connected-phone">+{whatsappStatus.phoneNumber}</span>
                                        </div>
                                    </div>
                                    <button 
                                        className="btn-disconnect"
                                        onClick={disconnectWhatsApp}
                                    >
                                        Déconnecter
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <ul className="option-features">
                                        <li className="feature-good">
                                            <CheckCircle size={14} />
                                            Connexion en quelques secondes
                                        </li>
                                        <li className="feature-good">
                                            <CheckCircle size={14} />
                                            Utilisez votre WhatsApp existant
                                        </li>
                                        <li className="feature-good">
                                            <CheckCircle size={14} />
                                            Gratuit
                                        </li>
                                        <li className="feature-warning">
                                            <AlertTriangle size={14} />
                                            Max 25 nouveaux contacts/jour
                                        </li>
                                    </ul>
                                    <button 
                                        className="btn-whatsapp-connect"
                                        onClick={() => {
                                            setShowWhatsAppModal(true);
                                            startWhatsAppConnection();
                                        }}
                                    >
                                        <span className="qr-icon">⏻</span>
                                        Connecter via QR Code
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Option 2: WhatsApp Business API */}
                        <div className={`whatsapp-option ${whatsappBusinessEnabled ? 'option-active' : ''}`}>
                            <div className="option-header">
                                <span className="option-icon">🏢</span>
                                <div>
                                    <h4>WhatsApp Business API</h4>
                                    <p>Volume illimité via Twilio</p>
                                </div>
                                <span className="option-badge pro">Pro</span>
                            </div>
                            
                            <ul className="option-features">
                                <li className="feature-good">
                                    <CheckCircle size={14} />
                                    Messages illimités
                                </li>
                                <li className="feature-good">
                                    <CheckCircle size={14} />
                                    Vérification Meta officielle
                                </li>
                                <li className="feature-good">
                                    <CheckCircle size={14} />
                                    100% fiable, pas de ban
                                </li>
                                <li className="feature-warning">
                                    <AlertTriangle size={14} />
                                    Nécessite un compte Twilio
                                </li>
                            </ul>
                            
                            <div className="business-config">
                                <label>NUMÉRO WHATSAPP TWILIO</label>
                                <input
                                    type="tel"
                                    placeholder="+33612345678"
                                    value={whatsappBusinessNumber}
                                    onChange={(e) => setWhatsappBusinessNumber(e.target.value)}
                                    className="input-field"
                                />
                                
                                <div className="toggle-row">
                                    <span>Activer WhatsApp Business</span>
                                    <label className="toggle-switch">
                                        <input
                                            type="checkbox"
                                            checked={whatsappBusinessEnabled}
                                            onChange={(e) => setWhatsappBusinessEnabled(e.target.checked)}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>
                                
                                <button 
                                    className="btn-whatsapp-business"
                                    onClick={saveWhatsAppBusiness}
                                    disabled={saving === 'whatsapp-business'}
                                >
                                    {saving === 'whatsapp-business' ? 'Sauvegarde...' : <><Save size={16} /> Sauvegarder</>}
                                </button>
                            </div>
                            
                            <a 
                                href="https://www.twilio.com/docs/whatsapp/quickstart" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="external-link"
                            >
                                <ExternalLink size={14} />
                                Comment configurer Twilio WhatsApp ?
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* WhatsApp Connection Modal */}
            {showWhatsAppModal && (
                <div className="modal-overlay" onClick={() => setShowWhatsAppModal(false)}>
                    <div className="whatsapp-modal" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowWhatsAppModal(false)}>
                            <X size={20} />
                        </button>
                        
                        <h2>Connecter WhatsApp</h2>
                        <p className="modal-subtitle">Scannez le QR code avec votre téléphone</p>

                        <div className="qr-container">
                            {whatsappConnecting && !whatsappQR && (
                                <div className="qr-loading">
                                    <Loader2 size={40} className="spin" />
                                    <p>Génération du QR code...</p>
                                </div>
                            )}
                            
                            {whatsappQR && (
                                <img 
                                    src={whatsappQR} 
                                    alt="WhatsApp QR Code" 
                                    className="qr-image"
                                />
                            )}

                            {whatsappError && (
                                <div className="qr-error">
                                    <AlertTriangle size={40} />
                                    <p>{whatsappError}</p>
                                    <button 
                                        className="btn-retry"
                                        onClick={startWhatsAppConnection}
                                    >
                                        Réessayer
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="modal-instructions">
                            <h4>Comment scanner ?</h4>
                            <ol>
                                <li>Ouvrez WhatsApp sur votre téléphone</li>
                                <li>Allez dans <strong>Paramètres → Appareils liés</strong></li>
                                <li>Appuyez sur <strong>Lier un appareil</strong></li>
                                <li>Scannez le QR code ci-dessus</li>
                            </ol>
                        </div>

                        <div className="modal-warning">
                            <AlertTriangle size={16} />
                            <span>Votre téléphone doit rester connecté à Internet</span>
                        </div>
                    </div>
                </div>
            )}

            <h2 className="section-title">
                <Link2 size={20} />
                Webhooks & Automatisations
            </h2>

            <div className="integrations-grid three-columns">
                {/* 1. Webhook Entrant */}
                <div className="integration-card">
                    <div className="card-icon-wrapper blue">
                        <Link2 size={24} />
                    </div>
                    <h3>Webhook Entrant</h3>
                    <p className="card-description">
                        Recevez des leads depuis Zapier, votre site web, ou tout autre outil.
                    </p>

                    <div className="card-content">
                        <label>URL DE VOTRE WEBHOOK</label>
                        <div className="url-display-box">
                            <code className="url-text" title={inboundWebhookUrl}>
                                {`${WEBHOOK_BASE_URL}/${user?.id?.slice(0, 8)}••••/leads`}
                            </code>
                            <button 
                                className="btn-copy"
                                onClick={() => copyToClipboard(inboundWebhookUrl)}
                            >
                                {copied ? <Check size={16} /> : <Copy size={16} />}
                                {copied ? 'Copié !' : 'Copier'}
                            </button>
                        </div>

                        <button
                            className="btn-secondary btn-json"
                            onClick={() => setShowJson(!showJson)}
                        >
                            {showJson ? 'Masquer le format JSON' : 'Voir le format JSON attendu'}
                        </button>

                        {showJson && (
                            <pre className="json-preview">
{`{
  "name": "Jean Dupont",
  "phone": "+33612345678",
  "email": "jean@example.com",
  "company_name": "Tech Corp",
  "source": "Website"
}`}
                            </pre>
                        )}
                    </div>
                </div>

                {/* 2. CRM Webhook */}
                <div className="integration-card">
                    <div className="card-icon-wrapper orange">
                        <Webhook size={24} />
                    </div>
                    <div className="card-status-row">
                        <h3>CRM Webhook</h3>
                        {crmWebhookUrl && (
                            <span className="status-badge connected">
                                <CheckCircle size={12} /> Actif
                            </span>
                        )}
                    </div>
                    <p className="card-description">
                        Envoyez automatiquement les leads qualifiés vers votre CRM via webhook.
                    </p>

                    <div className="card-content">
                        <label>URL DU WEBHOOK (SORTANT)</label>
                        <input
                            type="url"
                            placeholder="https://hooks.zapier.com/..."
                            value={crmWebhookUrl}
                            onChange={(e) => setCrmWebhookUrl(e.target.value)}
                            className="input-field"
                        />

                        <button
                            className="btn-primary btn-save"
                            onClick={saveCrmWebhook}
                            disabled={saving === 'crm'}
                        >
                            {saving === 'crm' ? 'Sauvegarde...' : <><Save size={16} /> Sauvegarder</>}
                        </button>
                    </div>
                </div>

                {/* 3. Agenda */}
                <div className="integration-card">
                    <div className="card-icon-wrapper green">
                        <Calendar size={24} />
                    </div>
                    <div className="card-status-row">
                        <h3>Agenda</h3>
                        {calendarUrl && (
                            <span className="status-badge connected">
                                <CheckCircle size={12} /> Actif
                            </span>
                        )}
                    </div>
                    <p className="card-description">
                        Permettez à l'IA de proposer des créneaux et planifier des rendez-vous.
                    </p>

                    <div className="card-content">
                        <label>URL DE VOTRE AGENDA (CALENDLY, CAL.COM...)</label>
                        <input
                            type="url"
                            placeholder="https://calendly.com/votre-nom"
                            value={calendarUrl}
                            onChange={(e) => setCalendarUrl(e.target.value)}
                            className="input-field"
                        />

                        <button
                            className="btn-primary btn-save"
                            onClick={saveCalendarUrl}
                            disabled={saving === 'calendar'}
                        >
                            {saving === 'calendar' ? 'Sauvegarde...' : <><Save size={16} /> Sauvegarder</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Integrations;
