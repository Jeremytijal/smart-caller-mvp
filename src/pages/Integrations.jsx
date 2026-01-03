import React, { useState, useEffect } from 'react';
import { 
    Webhook, Calendar, CheckCircle, Copy, Check, Save, ExternalLink, Link2, 
    MessageCircle, X, AlertTriangle, Loader2, Code, Globe, Instagram, 
    Facebook, Clock, Plus, Trash2, Settings
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { WEBHOOK_BASE_URL, API_URL } from '../config';
import './Integrations.css';

const Integrations = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(null);
    const [copied, setCopied] = useState(null);
    const [showJson, setShowJson] = useState(false);
    const [activeTab, setActiveTab] = useState('channels');

    // Config states
    const [crmWebhookUrl, setCrmWebhookUrl] = useState('');
    const [calendarUrl, setCalendarUrl] = useState('');
    const [calendarType, setCalendarType] = useState('url'); // 'url', 'google', 'manual'

    // Availability states (for manual calendar)
    const [availability, setAvailability] = useState([
        { day: 'lundi', enabled: true, start: '09:00', end: '18:00' },
        { day: 'mardi', enabled: true, start: '09:00', end: '18:00' },
        { day: 'mercredi', enabled: true, start: '09:00', end: '18:00' },
        { day: 'jeudi', enabled: true, start: '09:00', end: '18:00' },
        { day: 'vendredi', enabled: true, start: '09:00', end: '18:00' },
        { day: 'samedi', enabled: false, start: '09:00', end: '12:00' },
        { day: 'dimanche', enabled: false, start: '', end: '' }
    ]);

    // WhatsApp states
    const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
    const [whatsappStatus, setWhatsappStatus] = useState({ connected: false });
    const [whatsappQR, setWhatsappQR] = useState(null);
    const [whatsappConnecting, setWhatsappConnecting] = useState(false);
    const [whatsappError, setWhatsappError] = useState(null);
    const [whatsappMode, setWhatsappMode] = useState(null); // 'web' or 'business'
    
    // WhatsApp Business API states
    const [whatsappBusinessNumber, setWhatsappBusinessNumber] = useState('');
    const [whatsappBusinessEnabled, setWhatsappBusinessEnabled] = useState(false);
    
    // Meta Cloud API states
    const [metaPhoneNumberId, setMetaPhoneNumberId] = useState('');
    const [metaAccessToken, setMetaAccessToken] = useState('');
    const [metaBusinessId, setMetaBusinessId] = useState('');
    const [metaEnabled, setMetaEnabled] = useState(false);
    const [metaVerified, setMetaVerified] = useState(null);
    const [metaVerifying, setMetaVerifying] = useState(false);

    // Facebook/Instagram states
    const [facebookConnected, setFacebookConnected] = useState(false);
    const [instagramConnected, setInstagramConnected] = useState(false);
    const [facebookPageName, setFacebookPageName] = useState('');
    const [instagramUsername, setInstagramUsername] = useState('');

    // Widget states
    const [widgetColor, setWidgetColor] = useState('#FF470F');
    const [widgetPosition, setWidgetPosition] = useState('right');

    // Inbound webhook URL
    const inboundWebhookUrl = `${WEBHOOK_BASE_URL}/${user?.id}/leads`;
    const widgetBaseUrl = 'https://agent.smart-caller.ai';

    useEffect(() => {
        if (user) {
            fetchConfig();
            fetchWhatsAppStatus();
        }
    }, [user]);

    const fetchWhatsAppStatus = async () => {
        try {
            const response = await fetch(`${API_URL}/api/whatsapp/status/${user.id}`);
            const data = await response.json();
            setWhatsappStatus(data);
        } catch (error) {
            console.error('Error fetching WhatsApp status:', error);
        }
    };

    const startWhatsAppConnection = () => {
        setWhatsappConnecting(true);
        setWhatsappQR(null);
        setWhatsappError(null);

        const eventSource = new EventSource(`${API_URL}/api/whatsapp/connect/${user.id}`);

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);
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
            }
        };

        eventSource.onerror = () => {
            setWhatsappError('Erreur de connexion au serveur');
            setWhatsappConnecting(false);
            eventSource.close();
        };
    };

    const disconnectWhatsApp = async () => {
        try {
            await fetch(`${API_URL}/api/whatsapp/disconnect/${user.id}`, { method: 'POST' });
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

            if (data) {
                setCrmWebhookUrl(data.webhook_url || '');
                setCalendarUrl(data.agent_config?.calendarUrl || '');
                setWhatsappBusinessNumber(data.agent_config?.whatsappBusinessNumber || '');
                setWhatsappBusinessEnabled(data.agent_config?.whatsappBusinessEnabled || false);
                setWidgetColor(data.agent_config?.widgetColor || '#FF470F');
                setWidgetPosition(data.agent_config?.widgetPosition || 'right');
                
                if (data.agent_config?.availability) {
                    setAvailability(data.agent_config.availability);
                }
                
                const metaConfig = data.agent_config?.metaWhatsApp;
                if (metaConfig) {
                    setMetaPhoneNumberId(metaConfig.phoneNumberId || '');
                    setMetaAccessToken(metaConfig.accessToken || '');
                    setMetaBusinessId(metaConfig.businessId || '');
                    setMetaEnabled(metaConfig.enabled || false);
                    if (metaConfig.verifiedName) {
                        setMetaVerified({ 
                            verifiedName: metaConfig.verifiedName,
                            phoneNumber: metaConfig.phoneNumber 
                        });
                    }
                }

                // Check Facebook/Instagram connection
                if (data.agent_config?.facebook) {
                    setFacebookConnected(true);
                    setFacebookPageName(data.agent_config.facebook.pageName || '');
                }
                if (data.agent_config?.instagram) {
                    setInstagramConnected(true);
                    setInstagramUsername(data.agent_config.instagram.username || '');
                }
            }
        } catch (error) {
            console.error('Error fetching config:', error);
        } finally {
            setLoading(false);
        }
    };

    const saveConfig = async (key, value, successMessage) => {
        setSaving(key);
        try {
            const { data: currentData } = await supabase
                .from('profiles')
                .select('agent_config')
                .eq('id', user.id)
                .maybeSingle();

            const updatedConfig = {
                ...(currentData?.agent_config || {}),
                ...value
            };

            const { error } = await supabase
                .from('profiles')
                .update({ agent_config: updatedConfig })
                .eq('id', user.id);

            if (error) throw error;
            alert(successMessage);
        } catch (error) {
            console.error('Error saving config:', error);
            alert('Erreur lors de la sauvegarde.');
        } finally {
            setSaving(null);
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
            alert('Erreur lors de la sauvegarde.');
        } finally {
            setSaving(null);
        }
    };

    const saveCalendarUrl = () => saveConfig('calendar', { calendarUrl }, 'URL de l\'agenda sauvegardée !');
    const saveAvailability = () => saveConfig('availability', { availability }, 'Disponibilités sauvegardées !');
    const saveWidgetConfig = () => saveConfig('widget', { widgetColor, widgetPosition }, 'Configuration du widget sauvegardée !');

    const saveWhatsAppBusiness = () => saveConfig('whatsapp-business', {
        whatsappBusinessNumber,
        whatsappBusinessEnabled
    }, 'Configuration WhatsApp Business sauvegardée !');

    const verifyMetaCredentials = async () => {
        if (!metaPhoneNumberId || !metaAccessToken) {
            alert('Veuillez entrer le Phone Number ID et l\'Access Token');
            return;
        }
        
        setMetaVerifying(true);
        try {
            const response = await fetch(`${API_URL}/api/whatsapp-meta/verify`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phoneNumberId: metaPhoneNumberId, accessToken: metaAccessToken })
            });
            
            const data = await response.json();
            if (data.valid) {
                setMetaVerified({ verifiedName: data.verifiedName, phoneNumber: data.phoneNumber });
            } else {
                alert('Erreur: ' + (data.error || 'Credentials invalides'));
            }
        } catch (error) {
            alert('Erreur lors de la vérification');
        } finally {
            setMetaVerifying(false);
        }
    };

    const saveMetaConfig = async () => {
        setSaving('meta');
        try {
            const response = await fetch(`${API_URL}/api/whatsapp-meta/config/${user.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phoneNumberId: metaPhoneNumberId,
                    accessToken: metaAccessToken,
                    businessId: metaBusinessId,
                    verifiedName: metaVerified?.verifiedName,
                    phoneNumber: metaVerified?.phoneNumber,
                    enabled: metaEnabled
                })
            });
            if (!response.ok) throw new Error('Failed to save config');
            alert('Configuration Meta WhatsApp sauvegardée !');
        } catch (error) {
            alert('Erreur lors de la sauvegarde');
        } finally {
            setSaving(null);
        }
    };

    const handleFacebookConnect = () => {
        // Redirect to Facebook OAuth
        window.location.href = `${API_URL}/api/auth/facebook?userId=${user.id}`;
    };

    const handleGoogleConnect = () => {
        // Redirect to Google OAuth for Calendar
        window.location.href = `${API_URL}/api/auth/google?userId=${user.id}`;
    };

    const copyToClipboard = (text, key) => {
        navigator.clipboard.writeText(text);
        setCopied(key);
        setTimeout(() => setCopied(null), 2000);
    };

    const getWidgetCode = () => {
        return `<!-- Smart Caller Chat Widget -->
<script 
    src="${widgetBaseUrl}/widget/widget-loader.js"
    data-agent-id="${user?.id}"
    data-color="${widgetColor}"
    data-position="${widgetPosition}">
</script>`;
    };

    const tabs = [
        { id: 'channels', label: 'Canaux', icon: MessageCircle },
        { id: 'widget', label: 'Widget Chat', icon: Code },
        { id: 'calendar', label: 'Agenda', icon: Calendar },
        { id: 'webhooks', label: 'Webhooks', icon: Link2 }
    ];

    if (loading) {
        return (
            <div className="integrations-loading">
                <Loader2 size={32} className="spin" />
                <p>Chargement...</p>
            </div>
        );
    }

    return (
        <div className="integrations-page-v2">
            <header className="integrations-header">
                <div>
                    <h1>Intégrations</h1>
                    <p>Connectez vos outils et canaux de communication</p>
                </div>
            </header>

            {/* Tabs Navigation */}
            <nav className="integrations-tabs">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(tab.id)}
                    >
                        <tab.icon size={18} />
                        <span>{tab.label}</span>
                    </button>
                ))}
            </nav>

            <div className="integrations-content">
                {/* ============================================================
                    TAB: CHANNELS (WhatsApp, Facebook, Instagram)
                    ============================================================ */}
                {activeTab === 'channels' && (
                    <div className="tab-content">
            {/* WhatsApp Section */}
                        <section className="integration-section">
                            <div className="section-header">
                                <div className="section-icon whatsapp">
                            <MessageCircle size={24} />
                        </div>
                                <div>
                                    <h2>WhatsApp</h2>
                                    <p>Connectez votre WhatsApp pour contacter vos prospects</p>
                                </div>
                            </div>
                            
                            <div className="whatsapp-status-card">
                                {whatsappStatus.connected || whatsappBusinessEnabled ? (
                                    <div className="status-connected">
                                        <div className="status-info">
                                            <div className="status-icon connected">
                                                <CheckCircle size={24} />
                                        </div>
                                            <div>
                                                <h3>WhatsApp Connecté</h3>
                                                <p>
                                                    {whatsappStatus.connected 
                                                        ? `${whatsappStatus.pushname || 'WhatsApp Web'} • +${whatsappStatus.phoneNumber}`
                                                        : `Business API • ${whatsappBusinessNumber}`
                                                    }
                                                </p>
                                        </div>
                                    </div>
                                        <button className="btn-disconnect" onClick={whatsappStatus.connected ? disconnectWhatsApp : () => setWhatsappBusinessEnabled(false)}>
                                        Déconnecter
                                    </button>
                                </div>
                            ) : (
                                    <div className="status-disconnected">
                                        <div className="status-info">
                                            <div className="status-icon">
                                                <MessageCircle size={24} />
                                            </div>
                                            <div>
                                                <h3>Connecter WhatsApp</h3>
                                                <p>Choisissez comment connecter votre numéro WhatsApp</p>
                                            </div>
                                        </div>
                                        <button className="btn-connect-wa" onClick={() => setShowWhatsAppModal(true)}>
                                            <MessageCircle size={18} />
                                            Connecter WhatsApp
                                    </button>
                                    </div>
                            )}
                        </div>
                        </section>

                        {/* Facebook & Instagram Section */}
                        <section className="integration-section">
                            <div className="section-header">
                                <div className="section-icon meta">
                                    <Facebook size={24} />
                        </div>
                                <div>
                                    <h2>Facebook & Instagram</h2>
                                    <p>Connectez vos pages pour répondre aux DM automatiquement</p>
                                </div>
                            </div>
                            
                            <div className="cards-grid two">
                                {/* Facebook Messenger */}
                                <div className={`channel-card ${facebookConnected ? 'connected' : ''}`}>
                                    <div className="card-icon">💙</div>
                                    <h3>Facebook Messenger</h3>
                                    <p>Répondez automatiquement aux messages de votre page Facebook</p>
                                    
                                    {facebookConnected ? (
                                        <div className="connected-info">
                                            <div className="connected-badge">
                                                <CheckCircle size={16} />
                                                <span>Connecté: {facebookPageName}</span>
                                </div>
                                            <button className="btn-disconnect">Déconnecter</button>
                                        </div>
                                    ) : (
                                        <button className="btn-connect facebook" onClick={handleFacebookConnect}>
                                            <Facebook size={18} /> Connecter avec Facebook
                                </button>
                                    )}
                            </div>
                            
                                {/* Instagram DM */}
                                <div className={`channel-card ${instagramConnected ? 'connected' : ''}`}>
                                    <div className="card-icon">📸</div>
                                    <h3>Instagram DM</h3>
                                    <p>Répondez automatiquement aux DM de votre compte Instagram Business</p>
                                    
                                    {instagramConnected ? (
                                        <div className="connected-info">
                                            <div className="connected-badge">
                                        <CheckCircle size={16} />
                                                <span>Connecté: @{instagramUsername}</span>
                        </div>
                                            <button className="btn-disconnect">Déconnecter</button>
                        </div>
                                    ) : (
                                        <button className="btn-connect instagram" onClick={handleFacebookConnect}>
                                            <Instagram size={18} /> Connecter Instagram
                                        </button>
                                    )}
                                    
                                    <p className="card-note">
                                        <AlertTriangle size={14} /> Nécessite un compte Instagram Business lié à une page Facebook
                                    </p>
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {/* ============================================================
                    TAB: WIDGET CHAT
                    ============================================================ */}
                {activeTab === 'widget' && (
                    <div className="tab-content">
                        <section className="integration-section">
                            <div className="section-header">
                                <div className="section-icon widget">
                                    <Globe size={24} />
                                    </div>
                                <div>
                                    <h2>Widget Chat</h2>
                                    <p>Intégrez votre agent IA sur n'importe quel site web</p>
                                </div>
                            </div>

                            <div className="widget-config-grid">
                                <div className="widget-settings">
                                    <h3><Settings size={18} /> Configuration</h3>
                                    
                                    <div className="setting-group">
                                        <label>Couleur du widget</label>
                                        <div className="color-picker">
                                <input
                                                type="color" 
                                                value={widgetColor} 
                                                onChange={(e) => setWidgetColor(e.target.value)}
                                            />
                                <input
                                    type="text"
                                                value={widgetColor} 
                                                onChange={(e) => setWidgetColor(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="setting-group">
                                        <label>Position</label>
                                        <div className="position-selector">
                                <button 
                                                className={widgetPosition === 'left' ? 'active' : ''}
                                                onClick={() => setWidgetPosition('left')}
                                >
                                                ← Gauche
                                </button>
                                            <button 
                                                className={widgetPosition === 'right' ? 'active' : ''}
                                                onClick={() => setWidgetPosition('right')}
                                            >
                                                Droite →
                                            </button>
                                        </div>
                                    </div>

                                    <button className="btn-primary" onClick={saveWidgetConfig} disabled={saving === 'widget'}>
                                        <Save size={16} /> {saving === 'widget' ? 'Sauvegarde...' : 'Sauvegarder'}
                                    </button>
                                </div>
                                
                                <div className="widget-code">
                                    <h3><Code size={18} /> Code à intégrer</h3>
                                    <p>Copiez ce code et collez-le juste avant la balise <code>&lt;/body&gt;</code> de votre site</p>
                                    
                                    <div className="code-block">
                                        <pre>{getWidgetCode()}</pre>
                                <button 
                                            className="btn-copy"
                                            onClick={() => copyToClipboard(getWidgetCode(), 'widget')}
                                >
                                            {copied === 'widget' ? <Check size={16} /> : <Copy size={16} />}
                                            {copied === 'widget' ? 'Copié !' : 'Copier'}
                                </button>
                            </div>
                            
                                    <div className="widget-preview">
                                        <h4>Aperçu</h4>
                                        <div className="preview-container">
                                            <div 
                                                className="widget-bubble-preview"
                                                style={{ 
                                                    backgroundColor: widgetColor,
                                                    [widgetPosition]: '20px'
                                                }}
                                            >
                                                <MessageCircle size={24} />
                        </div>
                    </div>
                </div>
            </div>
                            </div>
                        </section>
                    </div>
                )}

                {/* ============================================================
                    TAB: CALENDAR / AGENDA
                    ============================================================ */}
                {activeTab === 'calendar' && (
                    <div className="tab-content">
                        <section className="integration-section">
                            <div className="section-header">
                                <div className="section-icon calendar">
                                    <Calendar size={24} />
                                </div>
                                <div>
                                    <h2>Agenda & Disponibilités</h2>
                                    <p>Permettez à l'IA de proposer des créneaux et planifier des RDV</p>
                                </div>
                            </div>

                            <div className="calendar-options">
                                <button 
                                    className={`calendar-option ${calendarType === 'google' ? 'active' : ''}`}
                                    onClick={() => setCalendarType('google')}
                                >
                                    <img src="https://www.gstatic.com/images/branding/product/1x/calendar_2020q4_48dp.png" alt="Google Calendar" />
                                    <span>Google Calendar</span>
                        </button>
                                <button 
                                    className={`calendar-option ${calendarType === 'url' ? 'active' : ''}`}
                                    onClick={() => setCalendarType('url')}
                                >
                                    <ExternalLink size={24} />
                                    <span>Calendly / Cal.com</span>
                                </button>
                                <button 
                                    className={`calendar-option ${calendarType === 'manual' ? 'active' : ''}`}
                                    onClick={() => setCalendarType('manual')}
                                >
                                    <Clock size={24} />
                                    <span>Disponibilités manuelles</span>
                                </button>
                            </div>

                            {/* Google Calendar */}
                            {calendarType === 'google' && (
                                <div className="calendar-config">
                                    <div className="google-connect-card">
                                        <img src="https://www.gstatic.com/images/branding/product/1x/calendar_2020q4_48dp.png" alt="Google Calendar" />
                                        <div>
                                            <h3>Connecter Google Calendar</h3>
                                            <p>Synchronisez automatiquement vos disponibilités avec votre agenda Google</p>
                                        </div>
                                        <button className="btn-google" onClick={handleGoogleConnect}>
                                            <svg viewBox="0 0 24 24" width="18" height="18">
                                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                            </svg>
                                            Continuer avec Google
                                        </button>
                                    </div>
                                </div>
                            )}
                            
                            {/* Calendly / Cal.com URL */}
                            {calendarType === 'url' && (
                                <div className="calendar-config">
                                    <div className="url-config-card">
                                        <label>URL de votre agenda (Calendly, Cal.com, zcal...)</label>
                                        <input
                                            type="url"
                                            placeholder="https://calendly.com/votre-nom"
                                            value={calendarUrl}
                                            onChange={(e) => setCalendarUrl(e.target.value)}
                                        />
                                        <button className="btn-primary" onClick={saveCalendarUrl} disabled={saving === 'calendar'}>
                                            <Save size={16} /> {saving === 'calendar' ? 'Sauvegarde...' : 'Sauvegarder'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Manual Availability */}
                            {calendarType === 'manual' && (
                                <div className="calendar-config">
                                    <div className="availability-card">
                                        <h3><Clock size={18} /> Vos disponibilités</h3>
                                        <p>Définissez vos créneaux de disponibilité pour les rendez-vous</p>
                                        
                                        <div className="availability-grid">
                                            {availability.map((day, idx) => (
                                                <div key={day.day} className={`day-row ${day.enabled ? 'enabled' : 'disabled'}`}>
                                                    <label className="day-toggle">
                                                        <input 
                                                            type="checkbox" 
                                                            checked={day.enabled}
                                                            onChange={(e) => {
                                                                const newAvail = [...availability];
                                                                newAvail[idx].enabled = e.target.checked;
                                                                setAvailability(newAvail);
                                                            }}
                                                        />
                                                        <span className="day-name">{day.day.charAt(0).toUpperCase() + day.day.slice(1)}</span>
                                    </label>
                                                    
                                                    {day.enabled && (
                                                        <div className="time-inputs">
                                                            <input 
                                                                type="time" 
                                                                value={day.start}
                                                                onChange={(e) => {
                                                                    const newAvail = [...availability];
                                                                    newAvail[idx].start = e.target.value;
                                                                    setAvailability(newAvail);
                                                                }}
                                                            />
                                                            <span>à</span>
                                                            <input 
                                                                type="time" 
                                                                value={day.end}
                                                                onChange={(e) => {
                                                                    const newAvail = [...availability];
                                                                    newAvail[idx].end = e.target.value;
                                                                    setAvailability(newAvail);
                                                                }}
                                                            />
                                </div>
                            )}
                        </div>
                                            ))}
                        </div>

                                        <button className="btn-primary" onClick={saveAvailability} disabled={saving === 'availability'}>
                                            <Save size={16} /> {saving === 'availability' ? 'Sauvegarde...' : 'Sauvegarder les disponibilités'}
                                        </button>
                        </div>
                    </div>
                            )}
                        </section>
                </div>
            )}

                {/* ============================================================
                    TAB: WEBHOOKS
                    ============================================================ */}
                {activeTab === 'webhooks' && (
                    <div className="tab-content">
                        <section className="integration-section">
                            <div className="section-header">
                                <div className="section-icon webhooks">
                        <Link2 size={24} />
                                </div>
                                <div>
                                    <h2>Webhooks & Automatisations</h2>
                                    <p>Connectez vos outils externes via webhooks</p>
                                </div>
                            </div>
                            
                            <div className="cards-grid two">
                                {/* Webhook Entrant */}
                                <div className="webhook-card">
                                    <div className="card-icon-small blue">
                                        <Link2 size={20} />
                    </div>
                    <h3>Webhook Entrant</h3>
                                    <p>Recevez des leads depuis Zapier, votre site web, ou tout autre outil</p>

                        <label>URL DE VOTRE WEBHOOK</label>
                                    <div className="url-box">
                                        <code>{`${WEBHOOK_BASE_URL}/${user?.id?.slice(0, 8)}••••/leads`}</code>
                                        <button onClick={() => copyToClipboard(inboundWebhookUrl, 'webhook')}>
                                            {copied === 'webhook' ? <Check size={16} /> : <Copy size={16} />}
                            </button>
                        </div>

                                    <button className="btn-secondary" onClick={() => setShowJson(!showJson)}>
                            {showJson ? 'Masquer le format JSON' : 'Voir le format JSON attendu'}
                        </button>

                        {showJson && (
                            <pre className="json-preview">
{`{
  "name": "Jean Dupont",
  "phone": "+33612345678",
  "email": "jean@example.com",
  "company_name": "Tech Corp"
}`}
                            </pre>
                        )}
                </div>

                                {/* CRM Webhook */}
                                <div className="webhook-card">
                                    <div className="card-icon-small orange">
                                        <Webhook size={20} />
                    </div>
                                    <div className="card-header-row">
                        <h3>CRM Webhook</h3>
                                        {crmWebhookUrl && <span className="badge-active">Actif</span>}
                    </div>
                                    <p>Envoyez automatiquement les leads qualifiés vers votre CRM</p>

                        <label>URL DU WEBHOOK (SORTANT)</label>
                        <input
                            type="url"
                            placeholder="https://hooks.zapier.com/..."
                            value={crmWebhookUrl}
                            onChange={(e) => setCrmWebhookUrl(e.target.value)}
                                    />

                                    <button className="btn-primary" onClick={saveCrmWebhook} disabled={saving === 'crm'}>
                                        <Save size={16} /> {saving === 'crm' ? 'Sauvegarde...' : 'Sauvegarder'}
                        </button>
                    </div>
                        </div>
                        </section>
                    </div>
                )}
                </div>

            {/* WhatsApp Connection Modal */}
            {showWhatsAppModal && (
                <div className="modal-overlay" onClick={() => { setShowWhatsAppModal(false); setWhatsappMode(null); }}>
                    <div className="whatsapp-modal-v2" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => { setShowWhatsAppModal(false); setWhatsappMode(null); }}>
                            <X size={20} />
                        </button>
                        
                        {!whatsappMode ? (
                            <>
                                <h2>Connect Your WhatsApp Number</h2>
                                <p>Choose how you want to connect your WhatsApp number</p>

                                {/* Option 1: Business API */}
                                <div className="whatsapp-option business">
                                    <div className="option-header">
                                        <div className="option-icon business">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                <rect width="24" height="24" rx="6" fill="#25D366"/>
                                                <path d="M17.6 6.4C16.4 5.2 14.6 4.4 12.6 4.4C8.4 4.4 5 7.8 5 12C5 13.4 5.4 14.8 6.2 16L5 19.6L8.8 18.4C10 19.2 11.2 19.6 12.6 19.6C16.8 19.6 20.2 16.2 20.2 12C20 10 19.2 8 17.6 6.4Z" fill="white"/>
                                                <path d="M12.6 18.4C11.4 18.4 10.2 18 9.2 17.4L9 17.2L6.6 18L7.4 15.6L7.2 15.4C6.4 14.4 6 13.2 6 12C6 8.4 9 5.4 12.6 5.4C14.4 5.4 16 6 17.2 7.2C18.4 8.4 19 10 19 12C19 15.6 16.2 18.4 12.6 18.4Z" fill="#25D366"/>
                                                <path d="M15.6 13.6C15.4 13.4 14.6 13 14.4 13C14.2 12.8 14 12.8 13.8 13.2C13.6 13.4 13.2 13.8 13 14C12.8 14.2 12.6 14.2 12.4 14.2C12.2 14 11.4 13.6 10.6 12.8C10 12.2 9.4 11.4 9.4 11.2C9.2 11 9.4 10.8 9.4 10.6C9.6 10.4 9.6 10.2 9.8 10C9.8 9.8 9.8 9.6 9.6 9.4C9.6 9.2 9.2 8.4 9 8C8.8 7.6 8.6 7.6 8.4 7.6H8C7.8 7.6 7.4 7.8 7.2 8C7 8.2 6.4 8.8 6.4 10C6.4 11.2 7.2 12.4 7.4 12.6C7.4 12.8 9.2 15.6 12 16.6C12.6 16.8 13 17 13.4 17C13.8 17.2 14.4 17 14.8 17C15.2 17 15.8 16.6 16 16.2C16.2 15.8 16.2 15.4 16 15.2C15.8 14 15.8 13.6 15.6 13.6Z" fill="white"/>
                                            </svg>
                    </div>
                                        <div className="option-info">
                                            <h3>WhatsApp Business API</h3>
                                            <span>Unlimited scale for businesses</span>
                                        </div>
                                    </div>
                                    <ul className="option-features">
                                        <li className="good"><CheckCircle size={16} /> Send unlimited messages</li>
                                        <li className="good"><CheckCircle size={16} /> Official Meta verification</li>
                                        <li className="good"><CheckCircle size={16} /> 100% uptime reliability</li>
                                        <li className="warning"><AlertTriangle size={16} /> Requires business verification</li>
                                    </ul>
                                    <button className="btn-option-primary" onClick={() => setWhatsappMode('business')}>
                                        <span>→</span> Continue with Business API
                                    </button>
                                </div>

                                {/* Option 2: WhatsApp Web */}
                                <div className="whatsapp-option web">
                                    <div className="option-header">
                                        <div className="option-icon web">
                                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                                <rect width="24" height="24" rx="6" fill="#F0FDF4"/>
                                                <path d="M12 4C7.58 4 4 7.58 4 12C4 13.85 4.63 15.55 5.69 16.91L4.53 19.91C4.43 20.16 4.49 20.44 4.68 20.63C4.87 20.82 5.15 20.88 5.4 20.78L8.4 19.62C9.76 20.68 11.46 21.31 13.31 21.31C17.73 21.31 21.31 17.73 21.31 13.31C21.31 8.89 17.73 5.31 13.31 5.31" stroke="#25D366" strokeWidth="1.5" strokeLinecap="round"/>
                                                <rect x="8" y="10" width="8" height="5" rx="1" stroke="#25D366" strokeWidth="1.5"/>
                                                <circle cx="10" cy="12.5" r="0.5" fill="#25D366"/>
                                                <circle cx="12" cy="12.5" r="0.5" fill="#25D366"/>
                                                <circle cx="14" cy="12.5" r="0.5" fill="#25D366"/>
                                            </svg>
                                        </div>
                                        <div className="option-info">
                                            <h3>WhatsApp Web</h3>
                                            <span>Get started quickly</span>
                                        </div>
                                    </div>
                                    <ul className="option-features">
                                        <li className="good"><CheckCircle size={16} /> Connect in seconds via QR code</li>
                                        <li className="good"><CheckCircle size={16} /> Use your existing WhatsApp</li>
                                        <li className="good"><CheckCircle size={16} /> Up to 25 new contacts/day safely</li>
                                        <li className="warning"><AlertTriangle size={16} /> Daily limits apply for safety</li>
                                        <li className="warning"><AlertTriangle size={16} /> Best for &lt;500 contacts/month</li>
                                    </ul>
                                    <button className="btn-option-secondary" onClick={() => { setWhatsappMode('web'); startWhatsAppConnection(); }}>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                                            <rect x="2" y="3" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="2"/>
                                            <rect x="14" y="3" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="2"/>
                                            <rect x="2" y="13" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="2"/>
                                            <rect x="14" y="13" width="8" height="8" rx="1" stroke="currentColor" strokeWidth="2"/>
                                        </svg>
                                        Connect via QR Code
                                    </button>
                                </div>
                            </>
                        ) : whatsappMode === 'web' ? (
                            <>
                                <button className="btn-back" onClick={() => setWhatsappMode(null)}>
                                    ← Back
                                </button>
                                <h2>Scan QR Code</h2>
                                <p>Scan the QR code with your phone to connect</p>

                                <div className="qr-container">
                                    {whatsappConnecting && !whatsappQR && (
                                        <div className="qr-loading">
                                            <Loader2 size={40} className="spin" />
                                            <p>Generating QR code...</p>
                                        </div>
                                    )}
                                    
                                    {whatsappQR && <img src={whatsappQR} alt="QR Code" className="qr-image" />}

                                    {whatsappError && (
                                        <div className="qr-error">
                                            <AlertTriangle size={40} />
                                            <p>{whatsappError}</p>
                                            <button onClick={startWhatsAppConnection}>Retry</button>
                    </div>
                                    )}
                                </div>

                                <div className="modal-instructions">
                                    <h4>How to scan?</h4>
                                    <ol>
                                        <li>Open WhatsApp on your phone</li>
                                        <li>Go to <strong>Settings → Linked Devices</strong></li>
                                        <li>Tap <strong>Link a Device</strong></li>
                                        <li>Scan the QR code above</li>
                                    </ol>
                                </div>
                            </>
                        ) : (
                            <>
                                <button className="btn-back" onClick={() => setWhatsappMode(null)}>
                                    ← Back
                                </button>
                                <h2>WhatsApp Business API</h2>
                                <p>Configure your Business API credentials</p>

                                <div className="business-form">
                                    <div className="form-group">
                                        <label>Phone Number ID</label>
                        <input
                                            type="text"
                                            placeholder="Enter your Phone Number ID"
                                            value={metaPhoneNumberId}
                                            onChange={(e) => setMetaPhoneNumberId(e.target.value)}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Access Token</label>
                                        <input
                                            type="password"
                                            placeholder="Enter your Access Token"
                                            value={metaAccessToken}
                                            onChange={(e) => setMetaAccessToken(e.target.value)}
                                        />
                                    </div>
                                    
                                    {metaVerified && (
                                        <div className="verified-badge-modal">
                                            <CheckCircle size={16} />
                                            <span>Verified: {metaVerified.verifiedName}</span>
                                        </div>
                                    )}

                                    <div className="form-actions">
                                        <button className="btn-verify-modal" onClick={verifyMetaCredentials} disabled={metaVerifying}>
                                            {metaVerifying ? <><Loader2 size={16} className="spin" /> Verifying...</> : 'Verify Credentials'}
                                        </button>
                        <button
                                            className="btn-connect-modal" 
                                            onClick={() => { saveMetaConfig(); setShowWhatsAppModal(false); setWhatsappMode(null); }} 
                                            disabled={!metaVerified}
                                        >
                                            Connect
                        </button>
                    </div>

                                    <div className="help-link">
                                        <a href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started" target="_blank" rel="noopener noreferrer">
                                            <ExternalLink size={14} /> How to get your API credentials?
                                        </a>
                </div>
            </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Integrations;
