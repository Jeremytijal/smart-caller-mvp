import React, { useState, useEffect } from 'react';
import { 
    Webhook, Calendar, CheckCircle, Copy, Check, Save, ExternalLink, Link2, 
    MessageCircle, X, AlertTriangle, Loader2, Code, Globe, Instagram, 
    Facebook, Clock, Plus, Trash2, Settings, Palette, Eye, Zap, Info, RefreshCw,
    Smartphone
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
    const [widgetConfig, setWidgetConfig] = useState({
        color: '#FF470F',
        position: 'right',
        greeting: 'Bonjour ! 👋 Comment puis-je vous aider ?',
        placeholder: 'Votre message...',
        name: 'Assistant',
        autoOpen: false,
        delay: 3000
    });
    const [widgetCopied, setWidgetCopied] = useState(false);
    const [widgetTab, setWidgetTab] = useState('setup');
    const [widgetAnalytics, setWidgetAnalytics] = useState(null);

    // Inbound webhook URL
    const inboundWebhookUrl = `${WEBHOOK_BASE_URL}/${user?.id}/leads`;
    const widgetBaseUrl = 'https://agent.smart-caller.ai';
    const agentId = user?.id;

    // Color presets for widget
    const colorPresets = [
        { color: '#FF470F', name: 'Orange' },
        { color: '#3B82F6', name: 'Bleu' },
        { color: '#10B981', name: 'Vert' },
        { color: '#8B5CF6', name: 'Violet' },
        { color: '#EC4899', name: 'Rose' },
        { color: '#1A1A1A', name: 'Noir' }
    ];

    useEffect(() => {
        if (user) {
            fetchConfig();
            fetchWhatsAppStatus();
            fetchWidgetConfig();
            fetchWidgetAnalytics();
        }
    }, [user]);

    // Widget functions
    const fetchWidgetConfig = async () => {
        try {
            const response = await fetch(`${API_URL}/api/widget/config/${agentId}`);
            const data = await response.json();
            if (data.success && data.config) {
                setWidgetConfig(prev => ({
                    ...prev,
                    color: data.config.color || prev.color,
                    greeting: data.config.greeting || prev.greeting,
                    name: data.config.name || prev.name,
                    position: data.config.position || prev.position
                }));
            }
        } catch (error) {
            console.error('Error fetching widget config:', error);
        }
    };

    const fetchWidgetAnalytics = async () => {
        try {
            const response = await fetch(`${API_URL}/api/widget/analytics/${agentId}`);
            const data = await response.json();
            if (data.success) {
                setWidgetAnalytics(data.analytics);
            }
        } catch (error) {
            console.error('Error fetching widget analytics:', error);
        }
    };

    const saveWidgetConfig = async () => {
        setSaving('widget');
        try {
            await fetch(`${API_URL}/api/widget/config/${agentId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(widgetConfig)
            });
        } catch (error) {
            console.error('Error saving widget config:', error);
        }
        setSaving(null);
    };

    const generateWidgetCode = () => {
        return `<!-- Smart Caller Chat Widget -->
<script src="${widgetBaseUrl}/widget/widget-loader.js"
    data-agent-id="${agentId}"
    data-color="${widgetConfig.color}"
    data-position="${widgetConfig.position}">
</script>`;
    };

    const copyWidgetCode = async () => {
        try {
            await navigator.clipboard.writeText(generateWidgetCode());
            setWidgetCopied(true);
            setTimeout(() => setWidgetCopied(false), 2000);
        } catch (error) {
            console.error('Copy failed:', error);
        }
    };

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
                    TAB: CHANNELS (SMS, WhatsApp, Messenger, Instagram, Widget)
                    ============================================================ */}
                {activeTab === 'channels' && (
                    <div className="tab-content channels-tab">
                        {/* Section SMS & WhatsApp */}
                        <div className="channels-section">
                            <div className="section-title">
                                <MessageCircle size={18} />
                                <span>SMS & WhatsApp</span>
                            </div>
                            
                            <div className="cards-grid two">
                                {/* SMS - Toujours connecté */}
                                <div className="channel-card connected">
                                    <div className="channel-card-header">
                                        <div className="channel-icon sms">
                <MessageCircle size={20} />
                                        </div>
                                        <div className="status-badge active">
                                            <span className="status-dot"></span>
                                            Actif
                                        </div>
                                    </div>
                                    <h3>SMS</h3>
                                    <p>Envoyez et recevez des SMS automatiquement avec vos prospects</p>
                                    <div className="connected-info">
                                        <div className="connected-badge">
                                            <CheckCircle size={14} />
                                            <span>Toujours connecté</span>
                                        </div>
                                    </div>
                                </div>

                                {/* WhatsApp */}
                                <div className={`channel-card ${whatsappStatus.connected || whatsappBusinessEnabled ? 'connected' : ''}`}>
                                    <div className="channel-card-header">
                                        <div className="channel-icon whatsapp">
                                            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                            </svg>
                        </div>
                                        {(whatsappStatus.connected || whatsappBusinessEnabled) ? (
                                            <div className="status-badge active">
                                                <span className="status-dot"></span>
                                                Connecté
                        </div>
                                        ) : (
                                            <div className="status-badge inactive">
                                                Non connecté
                                            </div>
                        )}
                    </div>
                                    <h3>WhatsApp</h3>
                                    <p>Connectez votre WhatsApp pour contacter vos prospects</p>
                                    
                                    {(whatsappStatus.connected || whatsappBusinessEnabled) ? (
                                        <div className="connected-info">
                                            <div className="connected-badge">
                                                <CheckCircle size={14} />
                                                <span>
                                                    {whatsappStatus.connected 
                                                        ? `${whatsappStatus.pushname || 'WhatsApp Web'}`
                                                        : 'Business API'
                                                    }
                                                </span>
                                </div>
                                            <button className="btn-disconnect" onClick={whatsappStatus.connected ? disconnectWhatsApp : () => setWhatsappBusinessEnabled(false)}>
                                                Déconnecter
                                            </button>
                                        </div>
                                    ) : (
                                        <button className="btn-connect whatsapp" onClick={() => setShowWhatsAppModal(true)}>
                                            Connecter WhatsApp
                                        </button>
                                    )}
                                </div>
                            </div>
                            </div>
                            
                        {/* Section DM (Messenger & Instagram) */}
                        <div className="channels-section">
                            <div className="section-title">
                                <Instagram size={18} />
                                <span>Messages Directs</span>
                                        </div>
                            
                            <div className="cards-grid two">
                                {/* Facebook Messenger */}
                                <div className={`channel-card ${facebookConnected ? 'connected' : ''}`}>
                                    <div className="channel-card-header">
                                        <div className="channel-icon messenger">
                                            <Facebook size={20} />
                                        </div>
                                        {facebookConnected ? (
                                            <div className="status-badge active">
                                                <span className="status-dot"></span>
                                                Connecté
                                    </div>
                                        ) : (
                                            <div className="status-badge inactive">
                                                Non connecté
                                            </div>
                                        )}
                                    </div>
                                    <h3>Messenger</h3>
                                    <p>Répondez aux messages de votre page Facebook</p>
                                    
                                    {facebookConnected ? (
                                        <div className="connected-info">
                                            <div className="connected-badge">
                                                <CheckCircle size={14} />
                                                <span>{facebookPageName}</span>
                                            </div>
                                            <button className="btn-disconnect">Déconnecter</button>
                                        </div>
                                    ) : (
                                        <button className="btn-connect messenger" onClick={handleFacebookConnect}>
                                            <Facebook size={16} /> Connecter Facebook
                                    </button>
                                    )}
                                </div>

                                {/* Instagram DM */}
                                <div className={`channel-card ${instagramConnected ? 'connected' : ''}`}>
                                    <div className="channel-card-header">
                                        <div className="channel-icon instagram">
                                            <Instagram size={20} />
                                        </div>
                                        {instagramConnected ? (
                                            <div className="status-badge active">
                                                <span className="status-dot"></span>
                                                Connecté
                                </div>
                            ) : (
                                            <div className="status-badge inactive">
                                                Non connecté
                                            </div>
                                        )}
                                    </div>
                                    <h3>Instagram DM</h3>
                                    <p>Répondez aux DM de votre compte Instagram Business</p>
                                    
                                    {instagramConnected ? (
                                        <div className="connected-info">
                                            <div className="connected-badge">
                                            <CheckCircle size={14} />
                                                <span>@{instagramUsername}</span>
                                            </div>
                                            <button className="btn-disconnect">Déconnecter</button>
                                        </div>
                                    ) : (
                                        <>
                                            <button className="btn-connect instagram" onClick={handleFacebookConnect}>
                                                <Instagram size={16} /> Connecter Instagram
                                    </button>
                                            <p className="card-note">
                                                <Info size={12} /> Compte Instagram Business requis
                                            </p>
                                </>
                            )}
                        </div>
                                </div>
                            </div>
                            
                        {/* Section Widget */}
                        <div className="channels-section">
                            <div className="section-title">
                                <Code size={18} />
                                <span>Widget Chat</span>
                            </div>
                            
                            <div className="widget-redirect-card" onClick={() => setActiveTab('widget')}>
                                <div className="widget-redirect-icon">
                                    <MessageCircle size={24} />
                                </div>
                                <div className="widget-redirect-content">
                                    <h3>Widget Chat pour votre site</h3>
                                    <p>Installez un chat IA sur votre site web pour convertir vos visiteurs</p>
                                </div>
                                <div className="widget-redirect-arrow">
                                    <ExternalLink size={18} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ============================================================
                    TAB: WIDGET CHAT
                    ============================================================ */}
                {activeTab === 'widget' && (
                    <div className="tab-content widget-tab">
                        {/* Widget Sub-tabs */}
                        <div className="widget-subtabs">
                                <button 
                                className={`subtab ${widgetTab === 'setup' ? 'active' : ''}`}
                                onClick={() => setWidgetTab('setup')}
                                >
                                <Code size={14} /> Installation
                                </button>
                                    <button 
                                className={`subtab ${widgetTab === 'customize' ? 'active' : ''}`}
                                onClick={() => setWidgetTab('customize')}
                            >
                                <Palette size={14} /> Personnalisation
                                    </button>
                            <button 
                                className={`subtab ${widgetTab === 'analytics' ? 'active' : ''}`}
                                onClick={() => setWidgetTab('analytics')}
                            >
                                <Zap size={14} /> Analytics
                            </button>
                        </div>

                        {/* Setup Tab */}
                        {widgetTab === 'setup' && (
                            <div className="widget-setup">
                                <div className="setup-step">
                                    <div className="step-number">1</div>
                                    <div className="step-content">
                                        <h4>Copiez le code</h4>
                                        <p>Ajoutez ce script juste avant &lt;/body&gt;</p>
                                </div>
                            </div>
                            
                                <div className="code-block">
                                    <pre>{generateWidgetCode()}</pre>
                                    <button className="btn-copy" onClick={copyWidgetCode}>
                                        {widgetCopied ? <><Check size={14} /> Copié</> : <><Copy size={14} /> Copier</>}
                                    </button>
                                </div>

                                <div className="setup-step">
                                    <div className="step-number">2</div>
                                    <div className="step-content">
                                        <h4>Vérifiez l'installation</h4>
                                        <p>Visitez votre site et vérifiez que le widget apparaît</p>
                                    </div>
                                </div>

                                <div className="verification-list">
                                    <div className="check-item"><CheckCircle size={14} /> Le bouton apparaît en bas {widgetConfig.position === 'left' ? 'à gauche' : 'à droite'}</div>
                                    <div className="check-item"><CheckCircle size={14} /> Le chat s'ouvre au clic</div>
                                    <div className="check-item"><CheckCircle size={14} /> Vous pouvez envoyer un message</div>
                                </div>
                            </div>
                        )}

                        {/* Customize Tab */}
                        {widgetTab === 'customize' && (
                            <div className="widget-customize">
                                <div className="config-section">
                                    <label>Couleur</label>
                                    <div className="color-presets">
                                        {colorPresets.map(preset => (
                                <button 
                                                key={preset.color}
                                                className={`color-btn ${widgetConfig.color === preset.color ? 'active' : ''}`}
                                                style={{ backgroundColor: preset.color }}
                                                onClick={() => setWidgetConfig({...widgetConfig, color: preset.color})}
                                                title={preset.name}
                                            >
                                                {widgetConfig.color === preset.color && <Check size={12} />}
                                </button>
                                        ))}
                                        <input
                                            type="color"
                                            value={widgetConfig.color}
                                            onChange={(e) => setWidgetConfig({...widgetConfig, color: e.target.value})}
                                            className="color-input"
                                        />
                                    </div>
                                </div>
                                
                                <div className="config-section">
                                    <label>Position</label>
                                    <div className="position-selector">
                                <button 
                                            className={widgetConfig.position === 'left' ? 'active' : ''}
                                            onClick={() => setWidgetConfig({...widgetConfig, position: 'left'})}
                                >
                                            ← Gauche
                                </button>
                                        <button 
                                            className={widgetConfig.position === 'right' ? 'active' : ''}
                                            onClick={() => setWidgetConfig({...widgetConfig, position: 'right'})}
                                        >
                                            Droite →
                                        </button>
                        </div>
                    </div>
                            
                                <div className="config-section">
                                    <label>Nom de l'assistant</label>
                                <input
                                    type="text"
                                        value={widgetConfig.name}
                                        onChange={(e) => setWidgetConfig({...widgetConfig, name: e.target.value})}
                                        placeholder="Assistant"
                                    />
                </div>

                                <div className="config-section">
                                    <label>Message d'accueil</label>
                                    <textarea
                                        value={widgetConfig.greeting}
                                        onChange={(e) => setWidgetConfig({...widgetConfig, greeting: e.target.value})}
                                        placeholder="Bonjour ! 👋 Comment puis-je vous aider ?"
                                        rows={2}
                                    />
            </div>

                                <button className="btn-primary" onClick={saveWidgetConfig} disabled={saving === 'widget'}>
                                    <Save size={14} /> {saving === 'widget' ? 'Sauvegarde...' : 'Sauvegarder'}
                        </button>
                        
                                {/* Preview */}
                                <div className="widget-preview-section">
                                    <label>Aperçu</label>
                                    <div className="preview-container">
                                        <div 
                                            className="widget-bubble-preview"
                                            style={{ 
                                                backgroundColor: widgetConfig.color,
                                                [widgetConfig.position]: '12px'
                                            }}
                                        >
                                            <MessageCircle size={18} />
                                        </div>
                                    </div>
                                </div>
                                </div>
                            )}
                            
                        {/* Analytics Tab */}
                        {widgetTab === 'analytics' && (
                            <div className="widget-analytics">
                                {widgetAnalytics ? (
                                    <div className="analytics-grid">
                                        <div className="stat-box">
                                            <div className="stat-value">{widgetAnalytics.totalSessions || 0}</div>
                                            <div className="stat-label">Conversations</div>
                                </div>
                                        <div className="stat-box">
                                            <div className="stat-value">{widgetAnalytics.qualifiedSessions || 0}</div>
                                            <div className="stat-label">Leads qualifiés</div>
                                        </div>
                                        <div className="stat-box highlight">
                                            <div className="stat-value">{widgetAnalytics.qualificationRate || 0}%</div>
                                            <div className="stat-label">Taux de qualification</div>
                                        </div>
                                        <div className="stat-box">
                                            <div className="stat-value">{widgetAnalytics.avgMessagesPerSession || 0}</div>
                                            <div className="stat-label">Msg / conversation</div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="empty-analytics">
                                        <MessageCircle size={32} />
                                        <p>Pas encore de données</p>
                                        <span>Les statistiques apparaîtront après les premières conversations</span>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* ============================================================
                    TAB: CALENDAR / AGENDA
                    ============================================================ */}
                {activeTab === 'calendar' && (
                    <div className="tab-content">
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
                </div>
            )}

                {/* ============================================================
                    TAB: WEBHOOKS
                    ============================================================ */}
                {activeTab === 'webhooks' && (
                    <div className="tab-content">
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
