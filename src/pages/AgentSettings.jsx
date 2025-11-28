import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, MessageSquare, Settings, Target, User, Sliders, Zap, AlertTriangle, LayoutTemplate, CheckCircle, Heart, Briefcase, Coffee } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import './AgentSettings.css';
import './LeadQuality.css'; // Import LeadQuality styles
import './AgentSetup.css'; // Import AgentSetup styles

const AgentSettings = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeTab, setActiveTab] = useState('identity'); // identity, messages, quality

    // Config State
    const [config, setConfig] = useState({
        // Identity & Behavior
        name: '',
        role: '',
        company: '',
        tone: 50,
        politeness: 'vous',
        context: '',

        // Messages
        first_message_template: '',
        source_templates: {},
        enable_template_webhook: true,
        enable_template_csv: true,

        // Scoring (Text for AI)
        scoring_criteria: '',

        // Structured Criteria (for UI persistence)
        quality_criteria: []
    });

    const [newSource, setNewSource] = useState('');

    // Quality Builder State
    const [criteria, setCriteria] = useState([]);
    const [showToast, setShowToast] = useState(false);

    useEffect(() => {
        if (user) fetchConfig();
    }, [user]);

    // Sync visual criteria with config state when changed
    useEffect(() => {
        if (criteria.length > 0) {
            const textCriteria = generateScoringPrompt(criteria);
            setConfig(prev => ({
                ...prev,
                scoring_criteria: textCriteria,
                quality_criteria: criteria
            }));
        }
    }, [criteria]);

    const fetchConfig = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) throw error;
            if (data) {
                const agentConfig = data.agent_config || {};

                // Load structured criteria if available, otherwise parse or default
                let loadedCriteria = agentConfig.quality_criteria || [];
                if (loadedCriteria.length === 0) {
                    loadedCriteria = [
                        { id: 1, type: 'must_have', text: 'Budget > $1000' },
                        { id: 2, type: 'must_have', text: 'Decision Maker' },
                    ];
                }

                setCriteria(loadedCriteria);

                setConfig({
                    ...agentConfig,
                    first_message_template: data.first_message_template || '',
                    source_templates: data.source_templates || {},
                    enable_template_webhook: data.enable_template_webhook ?? true,
                    enable_template_csv: data.enable_template_csv ?? true,
                    scoring_criteria: data.scoring_criteria || '',
                    quality_criteria: loadedCriteria,
                    // Identity defaults
                    name: agentConfig.name || '',
                    role: agentConfig.role || '',
                    company: agentConfig.company || '',
                    tone: agentConfig.tone || 50,
                    politeness: agentConfig.politeness || 'vous',
                    context: agentConfig.context || ''
                });
            }
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // Update profiles table with flat fields and jsonb config
            const updates = {
                first_message_template: config.first_message_template,
                source_templates: config.source_templates,
                enable_template_webhook: config.enable_template_webhook,
                enable_template_csv: config.enable_template_csv,
                scoring_criteria: config.scoring_criteria,
                agent_config: {
                    name: config.name,
                    role: config.role,
                    company: config.company,
                    tone: config.tone,
                    politeness: config.politeness,
                    context: config.context,
                    quality_criteria: config.quality_criteria // Save structured data for UI
                }
            };

            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', user.id);

            if (error) throw error;

            setShowToast(true);
            setTimeout(() => setShowToast(false), 3000);
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Erreur lors de la sauvegarde.');
        } finally {
            setSaving(false);
        }
    };

    // --- Helpers for Identity ---
    const getToneLabel = (value) => {
        if (value < 30) return "Empathique & Conseiller";
        if (value < 70) return "Professionnel & Équilibré";
        return "Offensif & Persuasif";
    };

    // --- Helpers for Messages ---
    const addSourceTemplate = () => {
        if (!newSource) return;
        setConfig(prev => ({
            ...prev,
            source_templates: {
                ...prev.source_templates,
                [newSource]: ''
            }
        }));
        setNewSource('');
    };

    const removeSourceTemplate = (source) => {
        const newTemplates = { ...config.source_templates };
        delete newTemplates[source];
        setConfig(prev => ({ ...prev, source_templates: newTemplates }));
    };

    const updateSourceTemplate = (source, text) => {
        setConfig(prev => ({
            ...prev,
            source_templates: {
                ...prev.source_templates,
                [source]: text
            }
        }));
    };

    // --- Helpers for Quality ---
    const generateScoringPrompt = (criteriaList) => {
        const mustHave = criteriaList.filter(c => c.type === 'must_have').map(c => `- ${c.text}`).join('\n');
        const dealBreakers = criteriaList.filter(c => c.type === 'deal_breaker').map(c => `- ${c.text}`).join('\n');
        const niceToHave = criteriaList.filter(c => c.type === 'nice_to_have').map(c => `- ${c.text}`).join('\n');

        return `
GOAL: Qualify leads based on the following criteria:

MUST HAVE:
${mustHave || '(None)'}

DEAL BREAKERS (STOP IMMEDIATELY):
${dealBreakers || '(None)'}

NICE TO HAVE:
${niceToHave || '(None)'}
        `.trim();
    };

    const addCriteria = (type) => {
        const newId = Date.now();
        setCriteria([...criteria, { id: newId, type, text: '' }]);
    };

    const removeCriteria = (id) => {
        setCriteria(criteria.filter(c => c.id !== id));
    };

    const updateCriteria = (id, text) => {
        setCriteria(criteria.map(c => c.id === id ? { ...c, text } : c));
    };

    const renderCriteriaList = (type, placeholder, emptyMessage) => {
        const filtered = criteria.filter(c => c.type === type);
        return (
            <div className="criteria-list">
                {filtered.length === 0 ? (
                    <div className="empty-state">
                        <span className="empty-text">{emptyMessage}</span>
                    </div>
                ) : (
                    filtered.map(c => (
                        <div key={c.id} className={`criteria-item ${type === 'deal_breaker' ? 'deal-breaker' : ''}`}>
                            <input
                                type="text"
                                value={c.text}
                                onChange={(e) => updateCriteria(c.id, e.target.value)}
                                placeholder={placeholder}
                            />
                            <button onClick={() => removeCriteria(c.id)} className="btn-icon delete">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))
                )}
                <button onClick={() => addCriteria(type)} className={`btn-dashed ${type === 'deal_breaker' ? 'danger' : ''}`}>
                    <Plus size={18} /> Ajouter
                </button>
            </div>
        );
    };

    if (loading) return <div className="p-8 text-center">Chargement...</div>;

    return (
        <div className="page-container settings-page">
            <header className="page-header">
                <div>
                    <h1>Configuration de l'Agent</h1>
                    <p className="text-muted">Personnalisez l'identité, les messages et les critères de qualification.</p>
                </div>
                <button
                    className="btn-primary flex items-center gap-2"
                    onClick={handleSave}
                    disabled={saving}
                >
                    <Save size={18} />
                    {saving ? 'Sauvegarde...' : 'Sauvegarder'}
                </button>
            </header>

            <div className="tabs-container">
                <div className="tabs-header">
                    <button
                        className={`tab-btn ${activeTab === 'identity' ? 'active' : ''}`}
                        onClick={() => setActiveTab('identity')}
                    >
                        <User size={18} /> Identité & Comportement
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'messages' ? 'active' : ''}`}
                        onClick={() => setActiveTab('messages')}
                    >
                        <MessageSquare size={18} /> Messages
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'quality' ? 'active' : ''}`}
                        onClick={() => setActiveTab('quality')}
                    >
                        <Target size={18} /> Qualité des Leads
                    </button>
                </div>

                <div className="tab-content">

                    {/* --- TAB 1: IDENTITY --- */}
                    {activeTab === 'identity' && (
                        <div className="setup-layout">
                            <div className="setup-form full-width">
                                {/* Identity */}
                                <div className="glass-panel setup-card">
                                    <div className="card-header">
                                        <User size={20} className="card-icon" />
                                        <h2>Identité de l'Agent</h2>
                                    </div>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>Nom de l'agent</label>
                                            <input
                                                type="text"
                                                value={config.name}
                                                onChange={(e) => setConfig({ ...config, name: e.target.value })}
                                                placeholder="Ex: Thomas"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Rôle / Poste</label>
                                            <input
                                                type="text"
                                                value={config.role}
                                                onChange={(e) => setConfig({ ...config, role: e.target.value })}
                                                placeholder="Ex: Expert Produit"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Entreprise</label>
                                            <input
                                                type="text"
                                                value={config.company}
                                                onChange={(e) => setConfig({ ...config, company: e.target.value })}
                                                placeholder="Ex: Ma Société"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Behavior */}
                                <div className="glass-panel setup-card">
                                    <div className="card-header">
                                        <Sliders size={20} className="card-icon" />
                                        <h2>Style de communication</h2>
                                    </div>
                                    <div className="tone-control">
                                        <div className="tone-header">
                                            <label>Agressivité Commerciale</label>
                                            <span className="tone-value">{getToneLabel(config.tone)}</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0"
                                            max="100"
                                            value={config.tone}
                                            onChange={(e) => setConfig({ ...config, tone: parseInt(e.target.value) })}
                                            className="range-slider"
                                        />
                                        <div className="tone-labels">
                                            <span>Douceur</span>
                                            <span>Vente Hard</span>
                                        </div>
                                    </div>
                                    <div className="politeness-control mt-4">
                                        <label>Niveau de familiarité :</label>
                                        <div className="toggle-group">
                                            <button
                                                onClick={() => setConfig({ ...config, politeness: 'vous' })}
                                                className={`toggle-btn ${config.politeness === 'vous' ? 'active' : ''}`}
                                            >
                                                Vouvoiement
                                            </button>
                                            <button
                                                onClick={() => setConfig({ ...config, politeness: 'tu' })}
                                                className={`toggle-btn ${config.politeness === 'tu' ? 'active' : ''}`}
                                            >
                                                Tutoiement
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Context */}
                                <div className="glass-panel setup-card">
                                    <div className="card-header">
                                        <Zap size={20} className="card-icon" />
                                        <h2>Contexte & Mission</h2>
                                    </div>
                                    <div className="form-group">
                                        <label>Pitch du produit</label>
                                        <textarea
                                            rows={4}
                                            value={config.context}
                                            onChange={(e) => setConfig({ ...config, context: e.target.value })}
                                            placeholder="Ex: Nous aidons les freelances à..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* --- TAB 2: MESSAGES --- */}
                    {activeTab === 'messages' && (
                        <div className="settings-grid">
                            <section className="settings-card full-width">
                                <div className="card-header">
                                    <MessageSquare className="text-primary" size={24} />
                                    <h2>Premier Message</h2>
                                </div>

                                <div className="form-group">
                                    <label>Message par défaut</label>
                                    <textarea
                                        value={config.first_message_template}
                                        onChange={(e) => setConfig({ ...config, first_message_template: e.target.value })}
                                        placeholder="Bonjour {{name}}, ..."
                                        rows={3}
                                    />
                                    <small className="text-muted">Variables disponibles : <code>{'{{name}}'}</code>, <code>{'{{company}}'}</code>, <code>{'{{job}}'}</code></small>
                                </div>

                                <div className="toggles">
                                    <label className="toggle-label">
                                        <input
                                            type="checkbox"
                                            checked={config.enable_template_webhook}
                                            onChange={(e) => setConfig({ ...config, enable_template_webhook: e.target.checked })}
                                        />
                                        Activer pour Webhook
                                    </label>
                                    <label className="toggle-label">
                                        <input
                                            type="checkbox"
                                            checked={config.enable_template_csv}
                                            onChange={(e) => setConfig({ ...config, enable_template_csv: e.target.checked })}
                                        />
                                        Activer pour Import CSV
                                    </label>
                                </div>

                                <div className="divider"></div>

                                <h3>Messages par Source</h3>
                                <div className="source-list">
                                    {Object.entries(config.source_templates).map(([source, template]) => (
                                        <div key={source} className="source-item">
                                            <div className="source-header">
                                                <span className="badge">{source}</span>
                                                <button onClick={() => removeSourceTemplate(source)} className="btn-icon-danger">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                            <textarea
                                                value={template}
                                                onChange={(e) => updateSourceTemplate(source, e.target.value)}
                                                placeholder={`Message spécifique pour ${source}...`}
                                                rows={2}
                                            />
                                        </div>
                                    ))}
                                </div>

                                <div className="add-source">
                                    <input
                                        type="text"
                                        value={newSource}
                                        onChange={(e) => setNewSource(e.target.value)}
                                        placeholder="Nouvelle source (ex: linkedin, ebook)"
                                    />
                                    <button onClick={addSourceTemplate} className="btn-secondary">
                                        <Plus size={18} /> Ajouter
                                    </button>
                                </div>
                            </section>
                        </div>
                    )}

                    {/* --- TAB 3: QUALITY --- */}
                    {activeTab === 'quality' && (
                        <div className="quality-layout">
                            <div className="criteria-column full-width">
                                {/* Must Have Section */}
                                <section className="glass-panel criteria-section">
                                    <div className="section-header">
                                        <div className="indicator must-have"></div>
                                        <h2>Critères Indispensables (Must Have)</h2>
                                    </div>
                                    {renderCriteriaList('must_have', 'Ex: Budget > 500€', 'Aucun critère indispensable défini.')}
                                </section>

                                {/* Deal Breakers Section */}
                                <section className="glass-panel criteria-section deal-breaker-section">
                                    <div className="section-header">
                                        <AlertTriangle className="text-danger" size={20} />
                                        <h2 className="text-danger">Disqualifiants (Deal Breakers)</h2>
                                    </div>
                                    {renderCriteriaList('deal_breaker', 'Ex: Pas de budget', 'Aucun disqualifiant défini.')}
                                </section>

                                {/* Nice to Have Section */}
                                <section className="glass-panel criteria-section">
                                    <div className="section-header">
                                        <div className="indicator nice-to-have"></div>
                                        <h2>Souhaitables (Nice to Have)</h2>
                                    </div>
                                    {renderCriteriaList('nice_to_have', 'Ex: Prêt à démarrer', 'Aucun critère souhaitable défini.')}
                                </section>

                                <div className="glass-panel preview-panel mt-4">
                                    <h3>Aperçu des Instructions générées pour l'IA</h3>
                                    <pre className="text-xs text-muted bg-darker p-4 rounded mt-2 whitespace-pre-wrap">
                                        {config.scoring_criteria || '(Aucune instruction générée)'}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Toast Notification */}
            <div className={`toast-notification ${showToast ? 'show' : ''}`}>
                <CheckCircle size={20} />
                <span>Paramètres sauvegardés avec succès !</span>
            </div>
        </div>
    );
};

export default AgentSettings;
