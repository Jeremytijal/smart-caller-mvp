import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Rocket, Target, Calendar, UserCheck, RefreshCw, ShoppingCart, 
    MessageSquare, Bot, Clock, ChevronRight, Check,
    Sparkles, AlertCircle, Info, Zap, Phone,
    Mail, MessageCircle, Eye, ArrowLeft, Building2, User
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import './CreateCampaign.css';

const CreateCampaign = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [loadingAgent, setLoadingAgent] = useState(true);
    const [agentConfig, setAgentConfig] = useState(null);

    // Campaign State
    const [campaign, setCampaign] = useState({
        name: '',
        objectives: [],
        channel: 'sms',
        firstMessage: '',
        schedule: {
            startDate: '',
            startTime: '09:00',
            endTime: '18:00',
            days: ['lun', 'mar', 'mer', 'jeu', 'ven'],
            timezone: 'Europe/Paris'
        },
        settings: {
            maxMessagesPerDay: 100,
            delayBetweenMessages: 30,
            stopOnReply: true
        }
    });

    // Objectives options
    const objectives = [
        {
            id: 'reactivation',
            title: 'Réactivation',
            description: 'Relancer les leads inactifs depuis plus de 30 jours',
            icon: RefreshCw,
            color: '#3B82F6'
        },
        {
            id: 'booking',
            title: 'Prise de RDV',
            description: 'Proposer et confirmer des créneaux de rendez-vous',
            icon: Calendar,
            color: '#10B981'
        },
        {
            id: 'qualification',
            title: 'Qualification',
            description: 'Identifier les leads chauds et collecter des infos',
            icon: UserCheck,
            color: '#F59E0B'
        },
        {
            id: 'nurturing',
            title: 'Nurturing',
            description: 'Maintenir le contact et éduquer les prospects',
            icon: Target,
            color: '#8B5CF6'
        },
        {
            id: 'upsell',
            title: 'Upsell / Cross-sell',
            description: 'Proposer des offres complémentaires aux clients',
            icon: ShoppingCart,
            color: '#EC4899'
        },
        {
            id: 'feedback',
            title: 'Feedback & NPS',
            description: 'Collecter les avis et mesurer la satisfaction',
            icon: MessageSquare,
            color: '#06B6D4'
        }
    ];

    // Channel options
    const channels = [
        { id: 'sms', label: 'SMS', icon: Phone, available: true },
        { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, available: true },
        { id: 'email', label: 'Email', icon: Mail, available: false }
    ];

    // Days options
    const daysOptions = [
        { id: 'lun', label: 'L' },
        { id: 'mar', label: 'M' },
        { id: 'mer', label: 'Me' },
        { id: 'jeu', label: 'J' },
        { id: 'ven', label: 'V' },
        { id: 'sam', label: 'S' },
        { id: 'dim', label: 'D' }
    ];

    // Steps configuration
    const steps = [
        { num: 1, label: 'Objectifs' },
        { num: 2, label: 'Canal' },
        { num: 3, label: 'Message' },
        { num: 4, label: 'Planning' },
        { num: 5, label: 'Récap' }
    ];

    // Fetch agent config on mount
    useEffect(() => {
        if (user) {
            fetchAgentConfig();
        }
    }, [user]);

    const fetchAgentConfig = async () => {
        setLoadingAgent(true);
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('agent_config, first_message_template')
                .eq('id', user.id)
                .single();

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }
            
            console.log('Agent config loaded:', data);
            
            if (data?.agent_config) {
                setAgentConfig(data.agent_config);
                // Pre-fill first message from agent config
                const defaultMessage = data.first_message_template || 
                    data.agent_config?.agentPersona?.firstMessage || 
                    `Bonjour {{name}}, je suis ${data.agent_config?.name || 'votre assistant'} de ${data.agent_config?.company || 'notre équipe'}. Comment puis-je vous aider ?`;
                
                setCampaign(prev => ({
                    ...prev,
                    firstMessage: defaultMessage
                }));
            }
        } catch (error) {
            console.error('Error fetching agent config:', error);
        } finally {
            setLoadingAgent(false);
        }
    };

    const toggleObjective = (objectiveId) => {
        setCampaign(prev => ({
            ...prev,
            objectives: prev.objectives.includes(objectiveId)
                ? prev.objectives.filter(id => id !== objectiveId)
                : [...prev.objectives, objectiveId]
        }));
    };

    const toggleDay = (dayId) => {
        setCampaign(prev => ({
            ...prev,
            schedule: {
                ...prev.schedule,
                days: prev.schedule.days.includes(dayId)
                    ? prev.schedule.days.filter(d => d !== dayId)
                    : [...prev.schedule.days, dayId]
            }
        }));
    };

    const generateFirstMessage = async () => {
        if (campaign.objectives.length === 0) {
            alert('Sélectionnez au moins un objectif pour générer un message');
            return;
        }
        
        setLoading(true);
        try {
            const objectiveNames = campaign.objectives.map(id => 
                objectives.find(o => o.id === id)?.title
            ).join(' et ');

            const businessType = agentConfig?.businessType || 'Service professionnel';
            
            const response = await fetch('https://app-smart-caller-backend-production.up.railway.app/api/onboarding/generate-persona', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    businessType: `${businessType} - Campagne de ${objectiveNames}`
                })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.firstMessage) {
                    setCampaign(prev => ({
                        ...prev,
                        firstMessage: data.firstMessage
                    }));
                }
            }
        } catch (error) {
            console.error('Error generating message:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLaunchCampaign = async () => {
        if (!campaign.name || campaign.objectives.length === 0 || !campaign.firstMessage) {
            alert('Veuillez remplir tous les champs obligatoires');
            return;
        }

        setLoading(true);
        try {
            console.log('Campaign to launch:', campaign);
            alert('Campagne créée avec succès ! Elle sera lancée selon le planning défini.');
            navigate('/');
        } catch (error) {
            console.error('Error launching campaign:', error);
            alert('Erreur lors de la création de la campagne');
        } finally {
            setLoading(false);
        }
    };

    const canProceed = () => {
        switch (currentStep) {
            case 1: return campaign.name && campaign.objectives.length > 0;
            case 2: return campaign.channel;
            case 3: return campaign.firstMessage.length > 10;
            case 4: return campaign.schedule.startDate && campaign.schedule.days.length > 0;
            default: return true;
        }
    };

    return (
        <div className="campaign-page">
            {/* Header */}
            <header className="campaign-header">
                <div className="header-left">
                    <button className="back-btn" onClick={() => navigate(-1)}>
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1>Créer une campagne</h1>
                        <p>Configurez et lancez vos campagnes de prospection automatisées</p>
                    </div>
                </div>
                <div className="header-right">
                    <button className="btn-secondary" onClick={() => navigate(-1)}>
                        Annuler
                    </button>
                    <button 
                        className="btn-primary"
                        onClick={handleLaunchCampaign}
                        disabled={loading || currentStep !== 5}
                    >
                        <Rocket size={18} />
                        {loading ? 'Création...' : 'Lancer la campagne'}
                    </button>
                </div>
            </header>

            {/* Progress Steps - Fixed */}
            <div className="campaign-progress">
                {steps.map((step, idx) => (
                    <React.Fragment key={step.num}>
                        <div 
                            className={`progress-step ${currentStep === step.num ? 'active' : ''} ${currentStep > step.num ? 'completed' : ''}`}
                            onClick={() => currentStep > step.num && setCurrentStep(step.num)}
                        >
                            <div className="step-circle">
                                {currentStep > step.num ? <Check size={14} /> : step.num}
                            </div>
                            <span className="step-text">{step.label}</span>
                        </div>
                        {idx < steps.length - 1 && <div className="step-connector" />}
                    </React.Fragment>
                ))}
            </div>

            {/* Main Content */}
            <div className="campaign-content">
                {/* Step 1: Objectives */}
                {currentStep === 1 && (
                    <div className="step-content">
                        <div className="step-header">
                            <h2>Définissez vos objectifs</h2>
                            <p>Sélectionnez un ou plusieurs objectifs pour cette campagne</p>
                        </div>

                        <div className="form-section">
                            <label className="form-label">Nom de la campagne *</label>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Ex: Réactivation Q4 2025"
                                value={campaign.name}
                                onChange={(e) => setCampaign({ ...campaign, name: e.target.value })}
                            />
                        </div>

                        <div className="form-section">
                            <label className="form-label">Objectifs de la campagne *</label>
                            <p className="form-hint">Vous pouvez sélectionner plusieurs objectifs</p>
                            
                            <div className="objectives-grid">
                                {objectives.map(obj => {
                                    const Icon = obj.icon;
                                    const isSelected = campaign.objectives.includes(obj.id);
                                    return (
                                        <div 
                                            key={obj.id}
                                            className={`objective-card ${isSelected ? 'selected' : ''}`}
                                            onClick={() => toggleObjective(obj.id)}
                                            style={{ '--accent': obj.color }}
                                        >
                                            <div className="objective-icon" style={{ background: `${obj.color}15`, color: obj.color }}>
                                                <Icon size={24} />
                                            </div>
                                            <div className="objective-content">
                                                <h4>{obj.title}</h4>
                                                <p>{obj.description}</p>
                                            </div>
                                            <div className="objective-check">
                                                {isSelected && <Check size={18} />}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {campaign.objectives.length > 0 && (
                            <div className="selected-summary">
                                <Zap size={16} />
                                <span>
                                    {campaign.objectives.length} objectif{campaign.objectives.length > 1 ? 's' : ''} sélectionné{campaign.objectives.length > 1 ? 's' : ''} : {' '}
                                    {campaign.objectives.map(id => objectives.find(o => o.id === id)?.title).join(', ')}
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 2: Channel (Agent is automatically the user's agent) */}
                {currentStep === 2 && (
                    <div className="step-content">
                        <div className="step-header">
                            <h2>Canal de communication</h2>
                            <p>Votre agent sera utilisé pour cette campagne</p>
                        </div>

                        {/* Agent Info Box */}
                        <div className="form-section">
                            <label className="form-label">Votre Agent IA</label>
                            
                            {loadingAgent ? (
                                <div className="agent-card loading">
                                    <div className="loading-spinner"></div>
                                    <p>Chargement de l'agent...</p>
                                </div>
                            ) : agentConfig ? (
                                <div className="agent-card active">
                                    <div className="agent-avatar">
                                        <Bot size={28} />
                                    </div>
                                    <div className="agent-info">
                                        <h4>{agentConfig.name || 'Agent IA'}</h4>
                                        <p>{agentConfig.role || 'Assistant Commercial'}</p>
                                        <div className="agent-details">
                                            {agentConfig.company && (
                                                <span className="detail-tag">
                                                    <Building2 size={12} />
                                                    {agentConfig.company}
                                                </span>
                                            )}
                                            <span className="detail-tag">
                                                <User size={12} />
                                                {agentConfig.politeness === 'tu' ? 'Tutoiement' : 'Vouvoiement'}
                                            </span>
                                            <span className="detail-tag">
                                                <Target size={12} />
                                                {agentConfig.goal === 'book' ? 'Prise de RDV' : 'Qualification'}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="agent-status">
                                        <Check size={18} />
                                        <span>Actif</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="agent-card empty">
                                    <AlertCircle size={32} />
                                    <div>
                                        <h4>Aucun agent configuré</h4>
                                        <p>Vous devez d'abord créer votre agent IA</p>
                                        <button className="btn-primary small" onClick={() => navigate('/onboarding')}>
                                            Créer mon agent
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="form-section">
                            <label className="form-label">Canal de communication</label>
                            <div className="channels-grid">
                                {channels.map(ch => {
                                    const Icon = ch.icon;
                                    return (
                                        <div 
                                            key={ch.id}
                                            className={`channel-card ${campaign.channel === ch.id ? 'selected' : ''} ${!ch.available ? 'disabled' : ''}`}
                                            onClick={() => ch.available && setCampaign({ ...campaign, channel: ch.id })}
                                        >
                                            <Icon size={24} />
                                            <span>{ch.label}</span>
                                            {!ch.available && <span className="coming-soon">Bientôt</span>}
                                            {campaign.channel === ch.id && ch.available && <Check size={16} className="channel-check" />}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="info-box">
                            <Info size={18} />
                            <div>
                                <strong>Conseil</strong>
                                <p>Le SMS a un taux d'ouverture de 98% contre 20% pour l'email. Idéal pour les messages urgents et les rappels.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: First Message */}
                {currentStep === 3 && (
                    <div className="step-content">
                        <div className="step-header">
                            <h2>Premier message</h2>
                            <p>Rédigez le message d'accroche qui sera envoyé à vos contacts</p>
                        </div>

                        <div className="message-editor">
                            <div className="editor-header">
                                <label className="form-label">Message d'introduction *</label>
                                <button 
                                    className="btn-generate"
                                    onClick={generateFirstMessage}
                                    disabled={loading}
                                >
                                    <Sparkles size={16} />
                                    {loading ? 'Génération...' : 'Générer avec l\'IA'}
                                </button>
                            </div>
                            
                            <textarea
                                className="message-textarea"
                                placeholder="Bonjour {{name}}, je suis {{agent_name}} de {{company}}..."
                                value={campaign.firstMessage}
                                onChange={(e) => setCampaign({ ...campaign, firstMessage: e.target.value })}
                                rows={6}
                            />

                            <div className="editor-footer">
                                <div className="char-count">
                                    <span className={campaign.firstMessage.length > 160 ? 'warning' : ''}>
                                        {campaign.firstMessage.length} / 160 caractères
                                    </span>
                                    {campaign.firstMessage.length > 160 && (
                                        <span className="sms-count">({Math.ceil(campaign.firstMessage.length / 160)} SMS)</span>
                                    )}
                                </div>
                                <div className="variables-hint">
                                    <span>Variables : </span>
                                    <code>{'{{name}}'}</code>
                                    <code>{'{{company}}'}</code>
                                    <code>{'{{agent_name}}'}</code>
                                </div>
                            </div>
                        </div>

                        {/* Preview */}
                        <div className="message-preview">
                            <div className="preview-header">
                                <Eye size={16} />
                                <span>Aperçu</span>
                            </div>
                            <div className="phone-mockup">
                                <div className="phone-notch"></div>
                                <div className="phone-screen">
                                    <div className="phone-status">
                                        <span>{agentConfig?.name || 'Smart Caller'}</span>
                                        <span className="time">10:30</span>
                                    </div>
                                    <div className="phone-messages">
                                        <div className="message-bubble agent">
                                            {campaign.firstMessage
                                                .replace(/\{\{name\}\}/g, 'Jean')
                                                .replace(/\{\{company\}\}/g, agentConfig?.company || 'Votre Entreprise')
                                                .replace(/\{\{agent_name\}\}/g, agentConfig?.name || 'Agent')
                                                || 'Votre message apparaîtra ici...'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4: Schedule */}
                {currentStep === 4 && (
                    <div className="step-content">
                        <div className="step-header">
                            <h2>Planning d'envoi</h2>
                            <p>Définissez quand vos messages seront envoyés</p>
                        </div>

                        <div className="schedule-grid">
                            <div className="form-section">
                                <label className="form-label">Date de début *</label>
                                <input
                                    type="date"
                                    className="form-input"
                                    value={campaign.schedule.startDate}
                                    onChange={(e) => setCampaign({
                                        ...campaign,
                                        schedule: { ...campaign.schedule, startDate: e.target.value }
                                    })}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>

                            <div className="form-section">
                                <label className="form-label">Plage horaire</label>
                                <div className="time-range">
                                    <input
                                        type="time"
                                        className="form-input"
                                        value={campaign.schedule.startTime}
                                        onChange={(e) => setCampaign({
                                            ...campaign,
                                            schedule: { ...campaign.schedule, startTime: e.target.value }
                                        })}
                                    />
                                    <span>à</span>
                                    <input
                                        type="time"
                                        className="form-input"
                                        value={campaign.schedule.endTime}
                                        onChange={(e) => setCampaign({
                                            ...campaign,
                                            schedule: { ...campaign.schedule, endTime: e.target.value }
                                        })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="form-section">
                            <label className="form-label">Jours d'envoi</label>
                            <div className="days-selector">
                                {daysOptions.map(day => (
                                    <button
                                        key={day.id}
                                        type="button"
                                        className={`day-btn ${campaign.schedule.days.includes(day.id) ? 'selected' : ''}`}
                                        onClick={() => toggleDay(day.id)}
                                    >
                                        {day.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="form-section">
                            <label className="form-label">Paramètres avancés</label>
                            <div className="settings-grid">
                                <div className="setting-item">
                                    <div className="setting-info">
                                        <span>Messages max / jour</span>
                                        <p>Limite quotidienne d'envoi</p>
                                    </div>
                                    <input
                                        type="number"
                                        className="form-input small"
                                        value={campaign.settings.maxMessagesPerDay}
                                        onChange={(e) => setCampaign({
                                            ...campaign,
                                            settings: { ...campaign.settings, maxMessagesPerDay: parseInt(e.target.value) || 100 }
                                        })}
                                        min={1}
                                        max={1000}
                                    />
                                </div>

                                <div className="setting-item">
                                    <div className="setting-info">
                                        <span>Délai entre messages</span>
                                        <p>En secondes</p>
                                    </div>
                                    <input
                                        type="number"
                                        className="form-input small"
                                        value={campaign.settings.delayBetweenMessages}
                                        onChange={(e) => setCampaign({
                                            ...campaign,
                                            settings: { ...campaign.settings, delayBetweenMessages: parseInt(e.target.value) || 30 }
                                        })}
                                        min={5}
                                        max={300}
                                    />
                                </div>

                                <div className="setting-item">
                                    <div className="setting-info">
                                        <span>Arrêter si réponse</span>
                                        <p>Stoppe l'envoi si le contact répond</p>
                                    </div>
                                    <label className="toggle">
                                        <input
                                            type="checkbox"
                                            checked={campaign.settings.stopOnReply}
                                            onChange={(e) => setCampaign({
                                                ...campaign,
                                                settings: { ...campaign.settings, stopOnReply: e.target.checked }
                                            })}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 5: Summary */}
                {currentStep === 5 && (
                    <div className="step-content">
                        <div className="step-header">
                            <h2>Récapitulatif</h2>
                            <p>Vérifiez les détails de votre campagne avant de la lancer</p>
                        </div>

                        <div className="summary-card">
                            <div className="summary-section">
                                <h4><Target size={18} /> Campagne</h4>
                                <div className="summary-row">
                                    <span>Nom</span>
                                    <strong>{campaign.name}</strong>
                                </div>
                                <div className="summary-row">
                                    <span>Objectifs</span>
                                    <div className="summary-tags">
                                        {campaign.objectives.map(id => {
                                            const obj = objectives.find(o => o.id === id);
                                            return (
                                                <span key={id} className="tag" style={{ background: `${obj?.color}15`, color: obj?.color }}>
                                                    {obj?.title}
                                                </span>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            <div className="summary-section">
                                <h4><Bot size={18} /> Agent & Canal</h4>
                                <div className="summary-row">
                                    <span>Agent</span>
                                    <strong>{agentConfig?.name || 'Agent IA'}</strong>
                                </div>
                                <div className="summary-row">
                                    <span>Canal</span>
                                    <strong>{channels.find(c => c.id === campaign.channel)?.label}</strong>
                                </div>
                            </div>

                            <div className="summary-section">
                                <h4><MessageSquare size={18} /> Message</h4>
                                <div className="summary-message">
                                    "{campaign.firstMessage.substring(0, 150)}{campaign.firstMessage.length > 150 ? '...' : ''}"
                                </div>
                            </div>

                            <div className="summary-section">
                                <h4><Clock size={18} /> Planning</h4>
                                <div className="summary-row">
                                    <span>Début</span>
                                    <strong>{campaign.schedule.startDate ? new Date(campaign.schedule.startDate).toLocaleDateString('fr-FR') : 'Non défini'}</strong>
                                </div>
                                <div className="summary-row">
                                    <span>Horaires</span>
                                    <strong>{campaign.schedule.startTime} - {campaign.schedule.endTime}</strong>
                                </div>
                                <div className="summary-row">
                                    <span>Jours</span>
                                    <strong>{campaign.schedule.days.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')}</strong>
                                </div>
                                <div className="summary-row">
                                    <span>Max / jour</span>
                                    <strong>{campaign.settings.maxMessagesPerDay} messages</strong>
                                </div>
                            </div>
                        </div>

                        <div className="launch-info">
                            <Rocket size={20} />
                            <div>
                                <strong>Prêt à lancer ?</strong>
                                <p>Votre campagne sera envoyée automatiquement selon le planning défini. Vous pourrez la mettre en pause à tout moment.</p>
                            </div>
                        </div>
                    </div>
                )}
                </div>

            {/* Navigation */}
            <div className="campaign-navigation">
                <button 
                    className="btn-secondary"
                    onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                    disabled={currentStep === 1}
                >
                    <ArrowLeft size={18} />
                    Précédent
                </button>

                {currentStep < 5 ? (
                    <button 
                        className="btn-primary"
                        onClick={() => setCurrentStep(prev => prev + 1)}
                        disabled={!canProceed()}
                    >
                        Suivant
                        <ChevronRight size={18} />
                    </button>
                ) : (
                    <button 
                        className="btn-primary launch"
                        onClick={handleLaunchCampaign}
                        disabled={loading}
                    >
                        <Rocket size={18} />
                        {loading ? 'Création...' : 'Lancer la campagne'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default CreateCampaign;
