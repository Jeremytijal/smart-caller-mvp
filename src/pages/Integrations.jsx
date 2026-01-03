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
    
    // WhatsApp Business API states (Twilio)
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

                            <div className="cards-grid three">
                                {/* WhatsApp Web */}
                                <div className={`channel-card ${whatsappStatus.connected ? 'connected' : ''}`}>
                                    <div className="card-badge starter">Starter</div>
                                    <div className="card-icon">📱</div>
                                    <h3>WhatsApp Web</h3>
                                    <p>Connexion rapide via QR code</p>
                                    
                                    <ul className="features-list">
                                        <li className="good"><CheckCircle size={14} /> Connexion en quelques secondes</li>
                                        <li className="good"><CheckCircle size={14} /> Utilisez votre WhatsApp existant</li>
                                        <li className="good"><CheckCircle size={14} /> Gratuit</li>
                                        <li className="warning"><AlertTriangle size={14} /> Max 25 contacts/jour</li>
                                    </ul>
                            
                            {whatsappStatus.connected ? (
                                        <div className="connected-info">
                                            <div className="connected-badge">
                                                <CheckCircle size={16} />
                                                <span>Connecté: {whatsappStatus.pushname}</span>
                                        </div>
                                            <button className="btn-disconnect" onClick={disconnectWhatsApp}>
                                        Déconnecter
                                    </button>
                                </div>
                            ) : (
                                        <button className="btn-connect whatsapp" onClick={() => { setShowWhatsAppModal(true); startWhatsAppConnection(); }}>
                                            ⏻ Connecter via QR Code
                                    </button>
                            )}
                        </div>

                                {/* WhatsApp Business */}
                                <div className={`channel-card ${whatsappBusinessEnabled ? 'connected' : ''}`}>
                                    <div className="card-badge pro">Pro</div>
                                    <div className="card-icon">🏢</div>
                                    <h3>WhatsApp Business API</h3>
                                    <p>Volume illimité via Twilio</p>
                                    
                                    <ul className="features-list">
                                        <li className="good"><CheckCircle size={14} /> Messages illimités</li>
                                        <li className="good"><CheckCircle size={14} /> Vérification Meta officielle</li>
                                        <li className="good"><CheckCircle size={14} /> 100% fiable, pas de ban</li>
                                        <li className="warning"><AlertTriangle size={14} /> Nécessite compte Twilio</li>
                            </ul>
                            
                                    <div className="config-form">
                                <input
                                    type="tel"
                                    placeholder="+33612345678"
                                    value={whatsappBusinessNumber}
                                    onChange={(e) => setWhatsappBusinessNumber(e.target.value)}
                                        />
                                        <div className="toggle-row">
                                            <span>Activer</span>
                                            <label className="switch">
                                                <input type="checkbox" checked={whatsappBusinessEnabled} onChange={(e) => setWhatsappBusinessEnabled(e.target.checked)} />
                                                <span className="slider"></span>
                                    </label>
                                        </div>
                                        <button className="btn-save" onClick={saveWhatsAppBusiness} disabled={saving === 'whatsapp-business'}>
                                            <Save size={16} /> {saving === 'whatsapp-business' ? 'Sauvegarde...' : 'Sauvegarder'}
                                        </button>
                                    </div>
                                </div>
                                
                                {/* Meta Cloud API */}
                                <div className={`channel-card ${metaEnabled && metaVerified ? 'connected' : ''}`}>
                                    <div className="card-badge enterprise">Enterprise</div>
                                    <div className="card-icon">🌐</div>
                                    <h3>Meta Cloud API</h3>
                                    <p>Connexion directe à Meta</p>
                                    
                                    <ul className="features-list">
                                        <li className="good"><CheckCircle size={14} /> Messages illimités</li>
                                        <li className="good"><CheckCircle size={14} /> ~0.04€/message</li>
                                        <li className="good"><CheckCircle size={14} /> API officielle Meta</li>
                                        <li className="warning"><AlertTriangle size={14} /> Vérification Business requise</li>
                                    </ul>

                                    <div className="config-form">
                                        <input type="text" placeholder="Phone Number ID" value={metaPhoneNumberId} onChange={(e) => setMetaPhoneNumberId(e.target.value)} />
                                        <input type="password" placeholder="Access Token" value={metaAccessToken} onChange={(e) => setMetaAccessToken(e.target.value)} />
                                        <button className="btn-verify" onClick={verifyMetaCredentials} disabled={metaVerifying}>
                                            {metaVerifying ? 'Vérification...' : 'Vérifier'}
                                        </button>
                                        {metaVerified && (
                                            <div className="verified-badge">
                                                <CheckCircle size={14} /> {metaVerified.verifiedName}
                                            </div>
                                        )}
                                        <div className="toggle-row">
                                            <span>Activer</span>
                                            <label className="switch">
                                                <input type="checkbox" checked={metaEnabled} onChange={(e) => setMetaEnabled(e.target.checked)} disabled={!metaVerified} />
                                                <span className="slider"></span>
                                            </label>
                                        </div>
                                        <button className="btn-save" onClick={saveMetaConfig} disabled={saving === 'meta' || !metaVerified}>
                                            <Save size={16} /> Sauvegarder
                                </button>
                                    </div>
                                </div>
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

            {/* WhatsApp QR Modal */}
            {showWhatsAppModal && (
                <div className="modal-overlay" onClick={() => setShowWhatsAppModal(false)}>
                    <div className="whatsapp-modal" onClick={e => e.stopPropagation()}>
                        <button className="modal-close" onClick={() => setShowWhatsAppModal(false)}>
                            <X size={20} />
                        </button>
                        
                        <h2>Connecter WhatsApp</h2>
                        <p>Scannez le QR code avec votre téléphone</p>

                        <div className="qr-container">
                            {whatsappConnecting && !whatsappQR && (
                                <div className="qr-loading">
                                    <Loader2 size={40} className="spin" />
                                    <p>Génération du QR code...</p>
                                </div>
                            )}
                            
                            {whatsappQR && <img src={whatsappQR} alt="QR Code" className="qr-image" />}

                            {whatsappError && (
                                <div className="qr-error">
                                    <AlertTriangle size={40} />
                                    <p>{whatsappError}</p>
                                    <button onClick={startWhatsAppConnection}>Réessayer</button>
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
                    </div>
                </div>
            )}
        </div>
    );
};

export default Integrations;
