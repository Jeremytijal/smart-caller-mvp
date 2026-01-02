import React, { useState, useEffect } from 'react';
import { 
    Code, 
    Copy, 
    Check, 
    Palette, 
    MessageCircle, 
    Settings,
    Eye,
    ExternalLink,
    Zap,
    Globe,
    Smartphone,
    Moon,
    Sun,
    ChevronRight,
    Info,
    RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import './WidgetIntegration.css';

const APP_URL = 'https://app.smart-caller.ai';

/**
 * PAGE D'INTÉGRATION DU WIDGET
 * 
 * Permet aux utilisateurs de :
 * - Personnaliser l'apparence du widget (couleur, message, position)
 * - Copier le code d'intégration
 * - Prévisualiser le widget
 * - Voir les analytics du widget
 */

const WidgetIntegration = () => {
    const { user, profile } = useAuth();
    
    // Widget configuration
    const [config, setConfig] = useState({
        color: '#FF470F',
        position: 'right',
        greeting: 'Bonjour ! 👋 Comment puis-je vous aider ?',
        placeholder: 'Votre message...',
        name: profile?.agent_name || 'Assistant',
        autoOpen: false,
        delay: 3000
    });
    
    // UI state
    const [copied, setCopied] = useState(false);
    const [activeTab, setActiveTab] = useState('setup');
    const [showPreview, setShowPreview] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [analytics, setAnalytics] = useState(null);
    
    // Get agent ID
    const agentId = profile?.agent_id || user?.id;
    
    // Fetch existing config on mount
    useEffect(() => {
        if (agentId) {
            fetchWidgetConfig();
            fetchAnalytics();
        }
    }, [agentId]);
    
    const fetchWidgetConfig = async () => {
        try {
            const response = await fetch(`${API_URL}/api/widget/config/${agentId}`);
            const data = await response.json();
            
            if (data.success && data.config) {
                setConfig(prev => ({
                    ...prev,
                    color: data.config.color || prev.color,
                    greeting: data.config.greeting || prev.greeting,
                    name: data.config.name || prev.name
                }));
            }
        } catch (error) {
            console.error('Error fetching widget config:', error);
        }
    };
    
    const fetchAnalytics = async () => {
        try {
            const response = await fetch(`${API_URL}/api/widget/analytics/${agentId}`);
            const data = await response.json();
            
            if (data.success) {
                setAnalytics(data.analytics);
            }
        } catch (error) {
            console.error('Error fetching analytics:', error);
        }
    };
    
    const saveConfig = async () => {
        setIsSaving(true);
        try {
            await fetch(`${API_URL}/api/widget/config/${agentId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            });
        } catch (error) {
            console.error('Error saving config:', error);
        }
        setIsSaving(false);
    };
    
    // Generate embed code
    const generateEmbedCode = () => {
        const attributes = [
            `data-agent-id="${agentId}"`,
            `data-color="${config.color}"`,
            `data-position="${config.position}"`,
            config.greeting !== 'Bonjour ! 👋 Comment puis-je vous aider ?' ? `data-greeting="${config.greeting}"` : '',
            config.placeholder !== 'Votre message...' ? `data-placeholder="${config.placeholder}"` : '',
            config.name !== 'Assistant' ? `data-name="${config.name}"` : '',
            config.autoOpen ? `data-auto-open="true"` : '',
            config.autoOpen && config.delay !== 3000 ? `data-delay="${config.delay}"` : ''
        ].filter(Boolean).join('\n         ');
        
        return `<!-- Smart Caller Chat Widget -->
<script src="${APP_URL}/widget/widget-loader.js"
         ${attributes}>
</script>`;
    };
    
    // Copy to clipboard
    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(generateEmbedCode());
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Copy failed:', error);
        }
    };
    
    // Color presets
    const colorPresets = [
        { color: '#FF470F', name: 'Orange Smart Caller' },
        { color: '#3B82F6', name: 'Bleu' },
        { color: '#10B981', name: 'Vert' },
        { color: '#8B5CF6', name: 'Violet' },
        { color: '#EC4899', name: 'Rose' },
        { color: '#F59E0B', name: 'Jaune' },
        { color: '#1A1A1A', name: 'Noir' }
    ];

    return (
        <div className="widget-integration-page">
            {/* Header */}
            <div className="page-header">
                <div className="header-content">
                    <div className="header-icon">
                        <MessageCircle size={28} />
                    </div>
                    <div>
                        <h1>Widget Chat</h1>
                        <p>Intégrez votre agent IA sur votre site web en 2 minutes</p>
                    </div>
                </div>
                
                <div className="header-actions">
                    <button 
                        className="btn-secondary"
                        onClick={() => setShowPreview(!showPreview)}
                    >
                        <Eye size={18} />
                        {showPreview ? 'Masquer' : 'Prévisualiser'}
                    </button>
                    <button 
                        className="btn-primary"
                        onClick={saveConfig}
                        disabled={isSaving}
                    >
                        {isSaving ? <RefreshCw size={18} className="spin" /> : <Check size={18} />}
                        Sauvegarder
                    </button>
                </div>
            </div>
            
            {/* Tabs */}
            <div className="tabs-container">
                <button 
                    className={`tab ${activeTab === 'setup' ? 'active' : ''}`}
                    onClick={() => setActiveTab('setup')}
                >
                    <Code size={18} />
                    Installation
                </button>
                <button 
                    className={`tab ${activeTab === 'customize' ? 'active' : ''}`}
                    onClick={() => setActiveTab('customize')}
                >
                    <Palette size={18} />
                    Personnalisation
                </button>
                <button 
                    className={`tab ${activeTab === 'analytics' ? 'active' : ''}`}
                    onClick={() => setActiveTab('analytics')}
                >
                    <Zap size={18} />
                    Analytics
                </button>
            </div>

            <div className="content-grid">
                {/* Main Content */}
                <div className="main-content">
                    
                    {/* Setup Tab */}
                    {activeTab === 'setup' && (
                        <div className="setup-section">
                            {/* Step 1: Copy Code */}
                            <div className="step-card">
                                <div className="step-header">
                                    <div className="step-number">1</div>
                                    <div>
                                        <h3>Copiez le code</h3>
                                        <p>Ajoutez ce script juste avant la balise &lt;/body&gt; de votre site</p>
                                    </div>
                                </div>
                                
                                <div className="code-block">
                                    <div className="code-header">
                                        <span className="code-lang">HTML</span>
                                        <button 
                                            className="copy-btn"
                                            onClick={copyToClipboard}
                                        >
                                            {copied ? (
                                                <>
                                                    <Check size={16} />
                                                    Copié !
                                                </>
                                            ) : (
                                                <>
                                                    <Copy size={16} />
                                                    Copier
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    <pre><code>{generateEmbedCode()}</code></pre>
                                </div>
                            </div>
                            
                            {/* Step 2: Verify */}
                            <div className="step-card">
                                <div className="step-header">
                                    <div className="step-number">2</div>
                                    <div>
                                        <h3>Vérifiez l'installation</h3>
                                        <p>Après avoir ajouté le code, visitez votre site et vérifiez que le widget apparaît</p>
                                    </div>
                                </div>
                                
                                <div className="verification-checklist">
                                    <div className="checklist-item">
                                        <Check size={18} />
                                        <span>Le bouton de chat apparaît en bas {config.position === 'left' ? 'à gauche' : 'à droite'}</span>
                                    </div>
                                    <div className="checklist-item">
                                        <Check size={18} />
                                        <span>Le chat s'ouvre quand vous cliquez sur le bouton</span>
                                    </div>
                                    <div className="checklist-item">
                                        <Check size={18} />
                                        <span>Vous pouvez envoyer un message et recevoir une réponse</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Features */}
                            <div className="features-grid">
                                <div className="feature-card">
                                    <Globe size={24} />
                                    <h4>Responsive</h4>
                                    <p>S'adapte à tous les écrans, mobile et desktop</p>
                                </div>
                                <div className="feature-card">
                                    <Moon size={24} />
                                    <h4>Dark Mode</h4>
                                    <p>Détecte automatiquement les préférences système</p>
                                </div>
                                <div className="feature-card">
                                    <Smartphone size={24} />
                                    <h4>Léger</h4>
                                    <p>Moins de 20KB, ne ralentit pas votre site</p>
                                </div>
                            </div>
                        </div>
                    )}
                    
                    {/* Customize Tab */}
                    {activeTab === 'customize' && (
                        <div className="customize-section">
                            {/* Color */}
                            <div className="config-card">
                                <div className="config-header">
                                    <Palette size={20} />
                                    <h3>Couleur du widget</h3>
                                </div>
                                
                                <div className="color-presets">
                                    {colorPresets.map(preset => (
                                        <button
                                            key={preset.color}
                                            className={`color-preset ${config.color === preset.color ? 'active' : ''}`}
                                            style={{ backgroundColor: preset.color }}
                                            onClick={() => setConfig({ ...config, color: preset.color })}
                                            title={preset.name}
                                        >
                                            {config.color === preset.color && <Check size={16} />}
                                        </button>
                                    ))}
                                    <div className="custom-color">
                                        <input
                                            type="color"
                                            value={config.color}
                                            onChange={(e) => setConfig({ ...config, color: e.target.value })}
                                        />
                                        <span>Personnalisé</span>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Position */}
                            <div className="config-card">
                                <div className="config-header">
                                    <Settings size={20} />
                                    <h3>Position</h3>
                                </div>
                                
                                <div className="position-options">
                                    <button
                                        className={`position-option ${config.position === 'right' ? 'active' : ''}`}
                                        onClick={() => setConfig({ ...config, position: 'right' })}
                                    >
                                        <div className="position-preview right">
                                            <div className="mock-widget"></div>
                                        </div>
                                        <span>Droite</span>
                                    </button>
                                    <button
                                        className={`position-option ${config.position === 'left' ? 'active' : ''}`}
                                        onClick={() => setConfig({ ...config, position: 'left' })}
                                    >
                                        <div className="position-preview left">
                                            <div className="mock-widget"></div>
                                        </div>
                                        <span>Gauche</span>
                                    </button>
                                </div>
                            </div>
                            
                            {/* Greeting Message */}
                            <div className="config-card">
                                <div className="config-header">
                                    <MessageCircle size={20} />
                                    <h3>Message d'accueil</h3>
                                </div>
                                
                                <div className="input-group">
                                    <label>Nom de l'assistant</label>
                                    <input
                                        type="text"
                                        value={config.name}
                                        onChange={(e) => setConfig({ ...config, name: e.target.value })}
                                        placeholder="Assistant"
                                    />
                                </div>
                                
                                <div className="input-group">
                                    <label>Message de bienvenue</label>
                                    <textarea
                                        value={config.greeting}
                                        onChange={(e) => setConfig({ ...config, greeting: e.target.value })}
                                        placeholder="Bonjour ! 👋 Comment puis-je vous aider ?"
                                        rows={3}
                                    />
                                </div>
                                
                                <div className="input-group">
                                    <label>Placeholder du champ de texte</label>
                                    <input
                                        type="text"
                                        value={config.placeholder}
                                        onChange={(e) => setConfig({ ...config, placeholder: e.target.value })}
                                        placeholder="Votre message..."
                                    />
                                </div>
                            </div>
                            
                            {/* Auto-open */}
                            <div className="config-card">
                                <div className="config-header">
                                    <Zap size={20} />
                                    <h3>Ouverture automatique</h3>
                                </div>
                                
                                <div className="toggle-row">
                                    <div>
                                        <p className="toggle-label">Ouvrir automatiquement le chat</p>
                                        <p className="toggle-desc">Le widget s'ouvrira après un délai défini</p>
                                    </div>
                                    <label className="toggle">
                                        <input
                                            type="checkbox"
                                            checked={config.autoOpen}
                                            onChange={(e) => setConfig({ ...config, autoOpen: e.target.checked })}
                                        />
                                        <span className="slider"></span>
                                    </label>
                                </div>
                                
                                {config.autoOpen && (
                                    <div className="input-group">
                                        <label>Délai avant ouverture (secondes)</label>
                                        <input
                                            type="number"
                                            value={config.delay / 1000}
                                            onChange={(e) => setConfig({ ...config, delay: parseInt(e.target.value) * 1000 })}
                                            min={1}
                                            max={60}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    
                    {/* Analytics Tab */}
                    {activeTab === 'analytics' && (
                        <div className="analytics-section">
                            {analytics ? (
                                <>
                                    <div className="stats-grid">
                                        <div className="stat-card">
                                            <div className="stat-value">{analytics.totalSessions}</div>
                                            <div className="stat-label">Conversations</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-value">{analytics.qualifiedSessions}</div>
                                            <div className="stat-label">Leads qualifiés</div>
                                        </div>
                                        <div className="stat-card highlight">
                                            <div className="stat-value">{analytics.qualificationRate}%</div>
                                            <div className="stat-label">Taux de qualification</div>
                                        </div>
                                        <div className="stat-card">
                                            <div className="stat-value">{analytics.avgMessagesPerSession}</div>
                                            <div className="stat-label">Messages / conversation</div>
                                        </div>
                                    </div>
                                    
                                    <div className="info-box">
                                        <Info size={20} />
                                        <div>
                                            <p><strong>Les statistiques sont mises à jour en temps réel</strong></p>
                                            <p>Les données affichées concernent les 30 derniers jours.</p>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="empty-state">
                                    <MessageCircle size={48} />
                                    <h3>Pas encore de données</h3>
                                    <p>Les statistiques apparaîtront une fois que des visiteurs utiliseront le widget</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                
                {/* Preview Panel */}
                {showPreview && (
                    <div className="preview-panel">
                        <div className="preview-header">
                            <h3>Aperçu</h3>
                            <span className="preview-badge">En direct</span>
                        </div>
                        
                        <div className="preview-container">
                            <div className="preview-mockup">
                                {/* Mock widget */}
                                <div 
                                    className={`mock-widget-window ${config.position}`}
                                    style={{ '--preview-color': config.color }}
                                >
                                    <div className="mock-header">
                                        <div className="mock-avatar">
                                            <MessageCircle size={16} />
                                        </div>
                                        <div className="mock-info">
                                            <span className="mock-name">{config.name}</span>
                                            <span className="mock-status">En ligne</span>
                                        </div>
                                    </div>
                                    <div className="mock-messages">
                                        <div className="mock-message assistant">
                                            <p>{config.greeting}</p>
                                        </div>
                                    </div>
                                    <div className="mock-input">
                                        <input placeholder={config.placeholder} disabled />
                                    </div>
                                </div>
                                
                                {/* Mock launcher */}
                                <div 
                                    className={`mock-launcher ${config.position}`}
                                    style={{ backgroundColor: config.color }}
                                >
                                    <MessageCircle size={20} />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default WidgetIntegration;

