import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    Save, Plus, Trash2, MessageSquare, Target, User, Sliders, Zap, 
    AlertTriangle, CheckCircle, Building2, Edit2, UserCircle, 
    MessageCircle, Smartphone, Mail, Shield, HelpCircle, Rocket,
    Phone, Check, ChevronDown, ChevronUp, ArrowRight, Clock, Calendar, Users, Info,
    CreditCard, Gift, AlertCircle
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { SALES_CALL_URL } from '../config';
import './AgentSettings.css';

const AgentSettings = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showToast, setShowToast] = useState(false);

    // Edit modes for each section
    const [editingSection, setEditingSection] = useState(null);

    // Subscription state
    const [subscription, setSubscription] = useState({
        plan: null,
        status: null,
        trialEndsAt: null
    });

    // Agent Config State
    const [config, setConfig] = useState({
        // Identity & Behavior
        name: '',
        role: '',
        company: '',
        tone: 50,
        politeness: 'vous',
        context: '',
        goal: '',

        // Business Info
        industry: '',
        targetMarket: '',
        valueProposition: '',
        language: 'Français',

        // ICP
        icpSector: '',
        icpSize: '',
        icpDecider: '',
        icpBudget: '',
        painPoints: [],

        // Messages
        first_message_template: '',
        source_templates: {},

        // Channels & Integrations
        channels: { sms: true, whatsapp: false, email: false },
        crm: null,

        // Quality Criteria
        quality_criteria: [],

        // Behavior & Schedule
        behaviorMode: 'human',
        responseDelay: 2,
        schedule: {
            startTime: '09:00',
            endTime: '18:00',
            days: ['L', 'M', 'Me', 'J', 'V']
        }
    });

    useEffect(() => {
        if (user) fetchConfig();
    }, [user]);

    const fetchConfig = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (error) throw error;
            if (data) {
                // Set subscription info
                setSubscription({
                    plan: data.subscription_plan,
                    status: data.subscription_status,
                    trialEndsAt: data.trial_ends_at
                });

                const agentConfig = data.agent_config || {};
                const icp = agentConfig.icp || {};

                setConfig({
                    // Identity
                    name: agentConfig.name || '',
                    role: agentConfig.role || '',
                    company: agentConfig.company || '',
                    tone: agentConfig.tone || 50,
                    politeness: agentConfig.politeness || 'vous',
                    context: agentConfig.context || '',
                    goal: agentConfig.goal || 'qualify',

                    // Business Info
                    industry: agentConfig.industry || '',
                    targetMarket: agentConfig.targetMarket || '',
                    valueProposition: agentConfig.valueProposition || '',
                    language: agentConfig.language || 'Français',

                    // ICP
                    icpSector: icp.sector || agentConfig.icpSector || '',
                    icpSize: icp.size || agentConfig.icpSize || '',
                    icpDecider: icp.decider || agentConfig.icpDecider || '',
                    icpBudget: icp.budget || agentConfig.icpBudget || '',
                    painPoints: agentConfig.painPoints || [],

                    // Messages
                    first_message_template: data.first_message_template || agentConfig.firstMessage || '',
                    source_templates: data.source_templates || {},

                    // Channels & Integrations
                    channels: agentConfig.channels || { sms: true, whatsapp: false, email: false },
                    crm: agentConfig.crm || null,

                    // Quality
                    quality_criteria: agentConfig.quality_criteria || [],

                    // Behavior & Schedule
                    behaviorMode: agentConfig.behaviorMode || 'human',
                    responseDelay: agentConfig.responseDelay || 2,
                    schedule: agentConfig.schedule || {
                        startTime: '09:00',
                        endTime: '18:00',
                        days: ['L', 'M', 'Me', 'J', 'V']
                    }
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
            const updates = {
                first_message_template: config.first_message_template,
                source_templates: config.source_templates,
                agent_config: {
                    name: config.name,
                    role: config.role,
                    company: config.company,
                    tone: config.tone,
                    politeness: config.politeness,
                    context: config.context,
                    goal: config.goal,
                    industry: config.industry,
                    targetMarket: config.targetMarket,
                    valueProposition: config.valueProposition,
                    language: config.language,
                    icp: {
                        sector: config.icpSector,
                        size: config.icpSize,
                        decider: config.icpDecider,
                        budget: config.icpBudget
                    },
                    icpSector: config.icpSector,
                    icpSize: config.icpSize,
                    icpDecider: config.icpDecider,
                    icpBudget: config.icpBudget,
                    painPoints: config.painPoints,
                    channels: config.channels,
                    crm: config.crm,
                    quality_criteria: config.quality_criteria,
                    firstMessage: config.first_message_template,
                    // Behavior & Schedule
                    behaviorMode: config.behaviorMode,
                    responseDelay: config.responseDelay,
                    schedule: config.schedule
                }
            };

            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', user.id);

            if (error) throw error;

            setShowToast(true);
            setEditingSection(null);
            setTimeout(() => setShowToast(false), 3000);
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Erreur lors de la sauvegarde.');
        } finally {
            setSaving(false);
        }
    };

    const getToneLabel = (value) => {
        if (value < 30) return "Empathique & conseiller";
        if (value < 70) return "Professionnel & équilibré";
        return "Offensif & persuasif";
    };

    const toggleEdit = (section) => {
        if (editingSection === section) {
            setEditingSection(null);
        } else {
            setEditingSection(section);
        }
    };

    const addCriteria = (type) => {
        const newCriteria = [...config.quality_criteria, { id: Date.now(), type, text: '' }];
        setConfig({ ...config, quality_criteria: newCriteria });
    };

    const removeCriteria = (id) => {
        setConfig({ ...config, quality_criteria: config.quality_criteria.filter(c => c.id !== id) });
    };

    const updateCriteria = (id, text) => {
        setConfig({
            ...config,
            quality_criteria: config.quality_criteria.map(c => c.id === id ? { ...c, text } : c)
        });
    };

    if (loading) return <div className="loading-state">Chargement...</div>;

        return (
        <div className="agent-config-page">
            {/* Header */}
            <div className="config-header">
                <div className="config-header-left">
                    <div className="config-icon-wrapper">
                        <Rocket size={28} />
                    </div>
                    <div>
                        <h1 className="config-title">Configuration de l'Agent</h1>
                        <p className="config-subtitle">
                            Consultez et modifiez les paramètres de votre agent IA.
                        </p>
                    </div>
                        </div>
                <button className="btn-primary" onClick={handleSave} disabled={saving}>
                    {saving ? 'Sauvegarde...' : <><Save size={18} /> Sauvegarder</>}
                </button>
            </div>

            {/* Subscription Status Banner */}
            {!subscription.status || subscription.status === 'inactive' ? (
                <div className="subscription-banner inactive">
                    <div className="subscription-banner-content">
                        <div className="banner-icon">
                            <AlertCircle size={24} />
                        </div>
                        <div className="banner-text">
                            <h4>Agent non activé</h4>
                            <p>Choisissez un abonnement pour activer votre agent et commencer à qualifier vos leads.</p>
                        </div>
                    </div>
                    <Link to="/subscription" className="btn-activate-subscription">
                        <Gift size={18} />
                        Activer mon agent
                        <ArrowRight size={16} />
                    </Link>
                </div>
            ) : subscription.status === 'trial' ? (
                <div className="subscription-banner trial">
                    <div className="subscription-banner-content">
                        <div className="banner-icon trial">
                            <Clock size={24} />
                        </div>
                        <div className="banner-text">
                            <h4>Période d'essai - {subscription.plan?.charAt(0).toUpperCase() + subscription.plan?.slice(1)}</h4>
                            <p>
                                Il vous reste {subscription.trialEndsAt ? Math.max(0, Math.ceil((new Date(subscription.trialEndsAt) - new Date()) / (1000 * 60 * 60 * 24))) : 7} jours d'essai. 
                                10 leads offerts inclus.
                            </p>
                        </div>
                    </div>
                    <Link to="/subscription" className="btn-upgrade-subscription">
                        <CreditCard size={18} />
                        Gérer mon abonnement
                    </Link>
                </div>
            ) : subscription.status === 'active' ? (
                <div className="subscription-banner active">
                    <div className="subscription-banner-content">
                        <div className="banner-icon active">
                            <CheckCircle size={24} />
                        </div>
                        <div className="banner-text">
                            <h4>Agent actif - Plan {subscription.plan?.charAt(0).toUpperCase() + subscription.plan?.slice(1)}</h4>
                            <p>Votre agent qualifie vos leads automatiquement 24/7.</p>
                        </div>
                    </div>
                    <Link to="/subscription" className="btn-manage-subscription">
                        Gérer mon abonnement
                    </Link>
                </div>
            ) : null}

            <div className="config-layout">
                {/* Main Content */}
                <div className="config-main">
                    {/* Agent Identity Card */}
                    <div className="summary-card">
                        <div className="summary-card-header">
                            <div className="summary-card-title">
                                <UserCircle size={20} />
                                <h3>Identité de l'agent</h3>
                </div>
                            <button className="btn-edit" onClick={() => toggleEdit('identity')}>
                                {editingSection === 'identity' ? <ChevronUp size={14} /> : <Edit2 size={14} />}
                                {editingSection === 'identity' ? 'Fermer' : 'Modifier'}
                    </button>
                </div>

                        {editingSection !== 'identity' ? (
                            <>
                                <div className="agent-identity-preview">
                                    <div className="agent-avatar-large">
                                        <Zap size={24} />
                                    </div>
                                    <div className="agent-identity-info">
                                        <h4>{config.name || config.role || "Agent IA"}</h4>
                                        <p className="agent-goal">{config.context?.slice(0, 100) || "Qualifier les leads entrants"}</p>
                                        <div className="agent-tone-badge">
                                            <MessageCircle size={12} />
                                            Ton : {getToneLabel(config.tone)}
                                        </div>
                                    </div>
                                </div>
                                <div className="first-message-preview">
                                    <span className="first-message-label">Premier message :</span>
                                    <p>"{config.first_message_template || "Bonjour ! Comment puis-je vous aider aujourd'hui ?"}"</p>
                                </div>
                            </>
                        ) : (
                            <div className="edit-section">
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

                                    <div className="tone-control">
                                        <div className="tone-header">
                                        <label>Style de communication</label>
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

                                <div className="politeness-control">
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

                                <div className="form-group full-width">
                                    <label>Premier message</label>
                                    <textarea
                                        value={config.first_message_template}
                                        onChange={(e) => setConfig({ ...config, first_message_template: e.target.value })}
                                        placeholder="Bonjour {{name}}, ..."
                                        rows={3}
                                    />
                                    <small>Variables : {'{{name}}'}, {'{{company}}'}</small>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Business Info Card */}
                    <div className="summary-card">
                        <div className="summary-card-header">
                            <div className="summary-card-title">
                                <Building2 size={20} />
                                <h3>Informations entreprise</h3>
                            </div>
                            <button className="btn-edit" onClick={() => toggleEdit('business')}>
                                {editingSection === 'business' ? <ChevronUp size={14} /> : <Edit2 size={14} />}
                                {editingSection === 'business' ? 'Fermer' : 'Modifier'}
                            </button>
                                </div>

                        {editingSection !== 'business' ? (
                            <>
                                <div className="summary-grid">
                                    <div className="summary-item">
                                        <span className="summary-label">Entreprise</span>
                                        <span className="summary-value">{config.company || "Non défini"}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="summary-label">Secteur</span>
                                        <span className="summary-value">{config.industry || "Non défini"}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="summary-label">Marché cible</span>
                                        <span className="summary-value">{config.targetMarket || "Non défini"}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="summary-label">Langue</span>
                                        <span className="summary-value">{config.language}</span>
                                    </div>
                                </div>
                                {config.valueProposition && (
                                    <div className="summary-item full-width">
                                        <span className="summary-label">Proposition de valeur</span>
                                        <span className="summary-value">{config.valueProposition}</span>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="edit-section">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Secteur d'activité</label>
                                        <input
                                            type="text"
                                            value={config.industry}
                                            onChange={(e) => setConfig({ ...config, industry: e.target.value })}
                                            placeholder="Ex: SaaS, E-commerce..."
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Marché cible</label>
                                        <input
                                            type="text"
                                            value={config.targetMarket}
                                            onChange={(e) => setConfig({ ...config, targetMarket: e.target.value })}
                                            placeholder="Ex: PME en France"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Langue</label>
                                        <select
                                            value={config.language}
                                            onChange={(e) => setConfig({ ...config, language: e.target.value })}
                                        >
                                            <option value="Français">Français</option>
                                            <option value="English">English</option>
                                        </select>
                        </div>
                                </div>
                                <div className="form-group full-width">
                                    <label>Proposition de valeur</label>
                                    <textarea
                                        value={config.valueProposition}
                                        onChange={(e) => setConfig({ ...config, valueProposition: e.target.value })}
                                        placeholder="Décrivez ce que votre entreprise offre..."
                                        rows={3}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ICP Card */}
                    <div className="summary-card">
                        <div className="summary-card-header">
                            <div className="summary-card-title">
                                <Target size={20} />
                                <h3>Profil client idéal (ICP)</h3>
                            </div>
                            <button className="btn-edit" onClick={() => toggleEdit('icp')}>
                                {editingSection === 'icp' ? <ChevronUp size={14} /> : <Edit2 size={14} />}
                                {editingSection === 'icp' ? 'Fermer' : 'Modifier'}
                            </button>
                                </div>

                        {editingSection !== 'icp' ? (
                            <>
                                <div className="summary-grid">
                                    <div className="summary-item">
                                        <span className="summary-label">Secteur cible</span>
                                        <span className="summary-value">{config.icpSector || "Non défini"}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="summary-label">Taille entreprise</span>
                                        <span className="summary-value">{config.icpSize || "Non défini"}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="summary-label">Décideur type</span>
                                        <span className="summary-value">{config.icpDecider || "Non défini"}</span>
                                    </div>
                                    <div className="summary-item">
                                        <span className="summary-label">Budget</span>
                                        <span className="summary-value">{config.icpBudget || "Non défini"}</span>
                                    </div>
                                </div>
                                {config.painPoints && config.painPoints.length > 0 && (
                                    <div className="pain-points-summary">
                                        <span className="summary-label">Points de douleur identifiés</span>
                                        <div className="pain-tags">
                                            {config.painPoints.slice(0, 3).map((pain, idx) => (
                                                <span key={idx} className="pain-tag">{pain}</span>
                                            ))}
                                            {config.painPoints.length > 3 && (
                                                <span className="pain-tag more">+{config.painPoints.length - 3}</span>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="edit-section">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Secteur cible</label>
                                        <input
                                            type="text"
                                            value={config.icpSector}
                                            onChange={(e) => setConfig({ ...config, icpSector: e.target.value })}
                                            placeholder="Ex: Télécommunications"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Taille d'entreprise</label>
                                        <input
                                            type="text"
                                            value={config.icpSize}
                                            onChange={(e) => setConfig({ ...config, icpSize: e.target.value })}
                                            placeholder="Ex: 10-250 employés"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Décideur type</label>
                                        <input
                                            type="text"
                                            value={config.icpDecider}
                                            onChange={(e) => setConfig({ ...config, icpDecider: e.target.value })}
                                            placeholder="Ex: CEO, Directeur Commercial"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Budget moyen</label>
                                        <input
                                            type="text"
                                            value={config.icpBudget}
                                            onChange={(e) => setConfig({ ...config, icpBudget: e.target.value })}
                                            placeholder="Ex: 500€ - 5000€/mois"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                                </div>

                    {/* Quality Criteria Card */}
                    <div className="summary-card">
                        <div className="summary-card-header">
                            <div className="summary-card-title">
                                <CheckCircle size={20} />
                                <h3>Critères de qualification</h3>
                            </div>
                            <button className="btn-edit" onClick={() => toggleEdit('quality')}>
                                {editingSection === 'quality' ? <ChevronUp size={14} /> : <Edit2 size={14} />}
                                {editingSection === 'quality' ? 'Fermer' : 'Modifier'}
                            </button>
                        </div>
                        
                        {editingSection !== 'quality' ? (
                            <div className="quality-summary">
                                {config.quality_criteria.length > 0 ? (
                                    <div className="criteria-tags">
                                        {config.quality_criteria.filter(c => c.type === 'must_have').slice(0, 3).map((c, idx) => (
                                            <span key={idx} className="criteria-tag must-have">
                                                <Check size={12} /> {c.text}
                                            </span>
                                        ))}
                                        {config.quality_criteria.filter(c => c.type === 'deal_breaker').slice(0, 2).map((c, idx) => (
                                            <span key={idx} className="criteria-tag deal-breaker">
                                                <AlertTriangle size={12} /> {c.text}
                                            </span>
                                        ))}
                                        {config.quality_criteria.length > 5 && (
                                            <span className="criteria-tag more">+{config.quality_criteria.length - 5}</span>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-muted">Aucun critère défini</p>
                                )}
                            </div>
                        ) : (
                            <div className="edit-section">
                                {/* Must Have */}
                                <div className="criteria-section">
                                    <div className="criteria-header">
                                        <div className="indicator must-have"></div>
                                        <h4>Critères indispensables</h4>
                                    </div>
                                    <div className="criteria-list">
                                        {config.quality_criteria.filter(c => c.type === 'must_have').map(c => (
                                            <div key={c.id} className="criteria-item">
                                                <input
                                                    type="text"
                                                    value={c.text}
                                                    onChange={(e) => updateCriteria(c.id, e.target.value)}
                                                    placeholder="Ex: Budget > 500€"
                                                />
                                                <button onClick={() => removeCriteria(c.id)} className="btn-icon delete">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                        <button onClick={() => addCriteria('must_have')} className="btn-dashed">
                                            <Plus size={16} /> Ajouter
                                        </button>
                                        </div>
                                </div>

                                {/* Deal Breakers */}
                                <div className="criteria-section deal-breaker-section">
                                    <div className="criteria-header">
                                        <AlertTriangle size={16} className="text-danger" />
                                        <h4 className="text-danger">Disqualifiants</h4>
                                    </div>
                                    <div className="criteria-list">
                                        {config.quality_criteria.filter(c => c.type === 'deal_breaker').map(c => (
                                            <div key={c.id} className="criteria-item deal-breaker">
                                    <input
                                        type="text"
                                                    value={c.text}
                                                    onChange={(e) => updateCriteria(c.id, e.target.value)}
                                                    placeholder="Ex: Pas de budget"
                                                />
                                                <button onClick={() => removeCriteria(c.id)} className="btn-icon delete">
                                                    <Trash2 size={16} />
                                    </button>
                                </div>
                                        ))}
                                        <button onClick={() => addCriteria('deal_breaker')} className="btn-dashed danger">
                                            <Plus size={16} /> Ajouter
                                        </button>
                                    </div>
                                    </div>

                                {/* Nice to Have */}
                                <div className="criteria-section">
                                    <div className="criteria-header">
                                        <div className="indicator nice-to-have"></div>
                                        <h4>Souhaitables</h4>
                                    </div>
                                    <div className="criteria-list">
                                        {config.quality_criteria.filter(c => c.type === 'nice_to_have').map(c => (
                                            <div key={c.id} className="criteria-item">
                                                <input
                                                    type="text"
                                                    value={c.text}
                                                    onChange={(e) => updateCriteria(c.id, e.target.value)}
                                                    placeholder="Ex: Prêt à démarrer"
                                                />
                                                <button onClick={() => removeCriteria(c.id)} className="btn-icon delete">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                        <button onClick={() => addCriteria('nice_to_have')} className="btn-dashed">
                                            <Plus size={16} /> Ajouter
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Channels & Integrations Row */}
                    <div className="summary-row">
                        <div className="summary-card half">
                            <div className="summary-card-header">
                                <div className="summary-card-title">
                                    <MessageSquare size={20} />
                                    <h3>Canaux actifs</h3>
                                </div>
                                <button className="btn-edit" onClick={() => toggleEdit('channels')}>
                                    {editingSection === 'channels' ? <ChevronUp size={14} /> : <Edit2 size={14} />}
                                    {editingSection === 'channels' ? 'Fermer' : 'Modifier'}
                                </button>
                            </div>
                            
                            {editingSection !== 'channels' ? (
                                <div className="channels-summary">
                                    {config.channels?.sms && (
                                        <div className="channel-badge active">
                                            <Smartphone size={16} /> SMS
                                        </div>
                                    )}
                                    {config.channels?.whatsapp && (
                                        <div className="channel-badge active">
                                            <MessageCircle size={16} /> WhatsApp
                                        </div>
                                    )}
                                    {config.channels?.email && (
                                        <div className="channel-badge active">
                                            <Mail size={16} /> Email
                                        </div>
                                    )}
                                    {!config.channels?.sms && !config.channels?.whatsapp && !config.channels?.email && (
                                        <span className="text-muted">Aucun canal sélectionné</span>
                                    )}
                                </div>
                            ) : (
                                <div className="edit-section channels-edit">
                                    <label className="channel-toggle">
                                        <input
                                            type="checkbox"
                                            checked={config.channels?.sms || false}
                                            onChange={(e) => setConfig({
                                                ...config,
                                                channels: { ...config.channels, sms: e.target.checked }
                                            })}
                                        />
                                        <Smartphone size={16} /> SMS
                                    </label>
                                    <label className="channel-toggle">
                                        <input
                                            type="checkbox"
                                            checked={config.channels?.whatsapp || false}
                                            onChange={(e) => setConfig({
                                                ...config,
                                                channels: { ...config.channels, whatsapp: e.target.checked }
                                            })}
                                        />
                                        <MessageCircle size={16} /> WhatsApp
                                    </label>
                                    <label className="channel-toggle">
                                        <input
                                            type="checkbox"
                                            checked={config.channels?.email || false}
                                            onChange={(e) => setConfig({
                                                ...config,
                                                channels: { ...config.channels, email: e.target.checked }
                                            })}
                                        />
                                        <Mail size={16} /> Email
                                    </label>
                                </div>
                            )}
                        </div>

                        <div className="summary-card half">
                            <div className="summary-card-header">
                                <div className="summary-card-title">
                                    <Zap size={20} />
                                    <h3>Intégrations</h3>
                                </div>
                            </div>
                            <div className="integrations-summary">
                                <div className="integration-badge connected">
                                    <Rocket size={14} /> Smart Caller
                                    <Check size={12} className="check-icon" />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Behavior & Schedule Card */}
                    <div className="summary-card">
                        <div className="summary-card-header">
                            <div className="summary-card-title">
                                <Clock size={20} />
                                <h3>Comportement & Planning</h3>
                            </div>
                            <button className="btn-edit" onClick={() => toggleEdit('schedule')}>
                                {editingSection === 'schedule' ? <ChevronUp size={14} /> : <Edit2 size={14} />}
                                {editingSection === 'schedule' ? 'Fermer' : 'Modifier'}
                            </button>
                        </div>
                        
                        {editingSection !== 'schedule' ? (
                            <div className="schedule-summary">
                                <div className="schedule-summary-row">
                                    <div className="schedule-info-item">
                                        <span className="schedule-label">Mode</span>
                                        <span className="schedule-value">
                                            {config.behaviorMode === 'human' ? '🧑 Humain' : '⚡ Assistant IA'}
                                        </span>
                                    </div>
                                    {config.behaviorMode === 'human' && (
                                        <div className="schedule-info-item">
                                            <span className="schedule-label">Délai de réponse</span>
                                            <span className="schedule-value">{config.responseDelay} min</span>
                                        </div>
                                    )}
                                </div>
                                <div className="schedule-summary-row">
                                    <div className="schedule-info-item">
                                        <span className="schedule-label">Horaires</span>
                                        <span className="schedule-value">
                                            {config.schedule?.startTime || '09:00'} - {config.schedule?.endTime || '18:00'}
                                        </span>
                                    </div>
                                    <div className="schedule-info-item">
                                        <span className="schedule-label">Jours actifs</span>
                                        <div className="days-badges">
                                            {(config.schedule?.days || ['L', 'M', 'Me', 'J', 'V']).map(day => (
                                                <span key={day} className="day-badge">{day}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="edit-section">
                                {/* Behavior Mode */}
                                <div className="behavior-mode-section">
                                    <label className="section-label">Mode de comportement</label>
                                    <div className="behavior-options-row">
                                        <div 
                                            className={`behavior-option-card ${config.behaviorMode === 'human' ? 'selected' : ''}`}
                                            onClick={() => setConfig({ ...config, behaviorMode: 'human' })}
                                        >
                                            <User size={20} />
                                            <span>Mode Humain</span>
                                            {config.behaviorMode === 'human' && <Check size={16} className="check-mark" />}
                                        </div>
                                        <div 
                                            className={`behavior-option-card ${config.behaviorMode === 'assistant' ? 'selected' : ''}`}
                                            onClick={() => setConfig({ ...config, behaviorMode: 'assistant' })}
                                        >
                                            <Zap size={20} />
                                            <span>Assistant IA</span>
                                            {config.behaviorMode === 'assistant' && <Check size={16} className="check-mark" />}
                                        </div>
                                    </div>
                                </div>

                                {/* Response Delay (only for human mode) */}
                                {config.behaviorMode === 'human' && (
                                    <div className="delay-section">
                                        <label className="section-label">Délai de réponse</label>
                                        <div className="delay-slider-row">
                                            <input
                                                type="range"
                                                min="1"
                                                max="5"
                                                value={config.responseDelay}
                                                onChange={(e) => setConfig({ ...config, responseDelay: parseInt(e.target.value) })}
                                                className="delay-slider"
                                            />
                                            <div className="delay-value-badge">
                                                <Clock size={14} />
                                                {config.responseDelay} min
                                            </div>
                                        </div>
                                        <div className="delay-labels">
                                            <span>1 min</span>
                                            <span>5 min</span>
                                        </div>
                                    </div>
                                )}

                                {/* Schedule */}
                                <div className="schedule-fields">
                                    <label className="section-label">Plage horaire</label>
                                    <div className="time-row">
                                        <div className="time-field">
                                            <label>Début</label>
                                            <input
                                                type="time"
                                                value={config.schedule?.startTime || '09:00'}
                                                onChange={(e) => setConfig({
                                                    ...config,
                                                    schedule: { ...config.schedule, startTime: e.target.value }
                                                })}
                                            />
                                        </div>
                                        <span className="time-separator">à</span>
                                        <div className="time-field">
                                            <label>Fin</label>
                                            <input
                                                type="time"
                                                value={config.schedule?.endTime || '18:00'}
                                                onChange={(e) => setConfig({
                                                    ...config,
                                                    schedule: { ...config.schedule, endTime: e.target.value }
                                                })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="days-section">
                                    <label className="section-label">Jours d'envoi</label>
                                    <div className="days-selector">
                                        {['L', 'M', 'Me', 'J', 'V', 'S', 'D'].map((day) => (
                                            <button
                                                key={day}
                                                type="button"
                                                className={`day-btn ${(config.schedule?.days || []).includes(day) ? 'selected' : ''}`}
                                                onClick={() => {
                                                    const currentDays = config.schedule?.days || [];
                                                    const newDays = currentDays.includes(day)
                                                        ? currentDays.filter(d => d !== day)
                                                        : [...currentDays, day];
                                                    setConfig({
                                                        ...config,
                                                        schedule: { ...config.schedule, days: newDays }
                                                    });
                                                }}
                                            >
                                                {day}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="schedule-info-message">
                                    <Info size={14} />
                                    <span>En dehors de ces horaires, les messages seront mis en file d'attente.</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="config-sidebar">
                    <div className="config-checklist">
                        <h4>Checklist de configuration</h4>
                        <div className="checklist-items">
                            <div className={`checklist-item ${config.company ? 'checked' : ''}`}>
                                <CheckCircle size={18} />
                                <span>Informations entreprise</span>
                            </div>
                            <div className={`checklist-item ${config.name || config.role ? 'checked' : ''}`}>
                                <CheckCircle size={18} />
                                <span>Agent configuré</span>
                            </div>
                            <div className={`checklist-item ${config.icpSector ? 'checked' : ''}`}>
                                <CheckCircle size={18} />
                                <span>ICP défini</span>
                            </div>
                            <div className={`checklist-item ${config.channels?.sms || config.channels?.whatsapp ? 'checked' : ''}`}>
                                <CheckCircle size={18} />
                                <span>Canaux sélectionnés</span>
                            </div>
                            <div className="checklist-item checked">
                                <CheckCircle size={18} />
                                <span>Smart Caller connecté</span>
                            </div>
                        </div>
                    </div>

                    <div className="config-info-card">
                        <div className="info-card-icon">
                            <Shield size={20} />
                        </div>
                        <h4>Protection garantie</h4>
                        <p>Votre agent ne dira que ce que vous avez validé. Aucune hallucination, aucune invention.</p>
                    </div>

                    <div className="config-info-card highlight">
                        <div className="info-card-icon">
                            <Zap size={20} />
                        </div>
                        <h4>Prêt en 30 secondes</h4>
                        <p>Les modifications sont appliquées instantanément à votre agent.</p>
                    </div>

                    <div className="config-action-card">
                        <h4>Créer un nouvel agent ?</h4>
                        <p>Pour créer un nouvel agent avec une configuration différente, relancez l'onboarding.</p>
                        <button className="btn-secondary" onClick={() => navigate('/onboarding')}>
                            <ArrowRight size={16} /> Nouvel onboarding
                        </button>
                    </div>

                    <div className="config-help">
                        <button className="btn-text" onClick={() => window.open(SALES_CALL_URL, '_blank')}>
                            <HelpCircle size={16} /> Besoin d'aide ?
                        </button>
                    </div>
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
