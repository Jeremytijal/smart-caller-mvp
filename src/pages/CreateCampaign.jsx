import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Rocket, Target, Calendar, UserCheck, RefreshCw, ShoppingCart, 
    MessageSquare, Bot, Clock, ChevronRight, Check,
    Sparkles, AlertCircle, Info, Zap, Phone,
    Mail, MessageCircle, Eye, ArrowLeft, Building2, User,
    Users, Upload, FileText, X, Database, Filter, CheckSquare,
    Square, Search, Copy, FlaskConical, Bell
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { endpoints } from '../config';
import './CreateCampaign.css';

const CreateCampaign = () => {
    const navigate = useNavigate();
    const { user, isImpersonating, realUser } = useAuth();
    const [currentStep, setCurrentStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [loadingAgent, setLoadingAgent] = useState(true);
    const [loadingContacts, setLoadingContacts] = useState(true);
    const [agentConfig, setAgentConfig] = useState(null);

    // Contacts State
    const [contacts, setContacts] = useState([]);
    const [selectedContacts, setSelectedContacts] = useState([]);
    const [contactSource, setContactSource] = useState('existing'); // 'existing', 'import', 'all'
    const [csvFile, setCsvFile] = useState(null);
    const [csvPreview, setCsvPreview] = useState(null);
    const [contactFilter, setContactFilter] = useState('all'); // 'all', 'new', 'qualified', 'unqualified'
    const [searchContacts, setSearchContacts] = useState('');

    // Campaign State
    const [campaign, setCampaign] = useState({
        name: '',
        type: '', // 'outbound' or 'inbound' - NEW
        objectives: [],
        channel: '',
        firstMessage: '',
        // A/B Testing
        abTestEnabled: false,
        messageB: '',
        abSplit: 50, // % of contacts who receive version A
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
        },
        // Inbound routing - NEW
        routingRules: {
            qualificationThreshold: 70,
            routeToHuman: true,
            humanNotification: {
                enabled: true,
                method: 'email',
                recipient: ''
            }
        }
    });
    
    const [activeMessageTab, setActiveMessageTab] = useState('A');

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

    // Channel options - OUTBOUND
    const outboundChannels = [
        { id: 'sms', label: 'SMS', icon: Phone, available: true },
        { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle, available: true },
        { id: 'email', label: 'Email', icon: Mail, available: false }
    ];

    // Channel options - INBOUND
    const inboundChannels = [
        { id: 'widget', label: 'Widget Chat', icon: MessageSquare, available: true },
        { id: 'sms', label: 'SMS Entrant', icon: Phone, available: true },
        { id: 'whatsapp', label: 'WhatsApp Entrant', icon: MessageCircle, available: true },
        { id: 'instagram', label: 'Instagram DM', icon: MessageCircle, available: true },
        { id: 'messenger', label: 'Messenger', icon: MessageCircle, available: true }
    ];

    // Get channels based on campaign type
    const channels = campaign.type === 'inbound' ? inboundChannels : outboundChannels;

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

    // Message templates by objective
    const messageTemplates = {
        reactivation: [
            { id: 1, title: 'Relance amicale', message: 'Bonjour {{name}}, cela fait un moment ! On a pensé à vous chez {{company}}. Des nouveautés pourraient vous intéresser. On en parle ?' },
            { id: 2, title: 'Offre spéciale', message: 'Bonjour {{name}}, pour nos anciens clients, -20% cette semaine. Ça vous dit ?' },
            { id: 3, title: 'Prise de nouvelles', message: 'Bonjour {{name}}, comment ça va depuis notre dernier échange ? Je voulais savoir si vos besoins avaient évolué.' }
        ],
        booking: [
            { id: 4, title: 'Proposition RDV', message: 'Bonjour {{name}}, seriez-vous disponible pour un appel de 15 min cette semaine ? Je vous propose créneaux.' },
            { id: 5, title: 'RDV démo', message: 'Bonjour {{name}}, je peux vous faire une démo rapide de notre solution. Quel jour vous arrange ?' },
            { id: 6, title: 'Confirmation', message: 'Bonjour {{name}}, je confirme notre RDV. Au plaisir d\'échanger avec vous !' }
        ],
        qualification: [
            { id: 7, title: 'Premier contact', message: 'Bonjour {{name}}, merci pour votre intérêt ! Puis-je vous poser quelques questions pour mieux vous conseiller ?' },
            { id: 8, title: 'Questions budget', message: 'Bonjour {{name}}, avez-vous déjà une enveloppe budgétaire en tête pour ce projet ?' },
            { id: 9, title: 'Besoins', message: 'Bonjour {{name}}, quel est votre principal défi actuellement ? On peut sûrement vous aider.' }
        ],
        nurturing: [
            { id: 10, title: 'Contenu utile', message: 'Bonjour {{name}}, je vous partage un article qui pourrait vous intéresser sur [sujet]. Qu\'en pensez-vous ?' },
            { id: 11, title: 'Conseil gratuit', message: 'Bonjour {{name}}, petite astuce du jour : [conseil]. Ça peut vous faire gagner du temps !' },
            { id: 12, title: 'Check-in', message: 'Bonjour {{name}}, comment avancent vos projets ? Besoin d\'un coup de main ?' }
        ],
        upsell: [
            { id: 13, title: 'Nouvelle offre', message: 'Bonjour {{name}}, on vient de sortir une nouvelle fonctionnalité qui pourrait vous plaire. Je vous en dis plus ?' },
            { id: 14, title: 'Upgrade', message: 'Bonjour {{name}}, avec l\'offre Premium, vous pourriez [bénéfice]. Ça vous intéresse ?' },
            { id: 15, title: 'Cross-sell', message: 'Bonjour {{name}}, nos clients qui utilisent [produit A] adorent aussi [produit B]. On en parle ?' }
        ],
        feedback: [
            { id: 16, title: 'Avis rapide', message: 'Bonjour {{name}}, votre avis compte ! Sur 10, comment noteriez-vous notre service ?' },
            { id: 17, title: 'Témoignage', message: 'Bonjour {{name}}, satisfait de notre collaboration ? Un petit témoignage nous aiderait beaucoup !' },
            { id: 18, title: 'Amélioration', message: 'Bonjour {{name}}, qu\'est-ce qu\'on pourrait améliorer selon vous ? On est tout ouïe.' }
        ]
    };

    // Get relevant templates based on selected objectives
    const getRelevantTemplates = () => {
        let templates = [];
        campaign.objectives.forEach(objId => {
            if (messageTemplates[objId]) {
                templates = [...templates, ...messageTemplates[objId]];
            }
        });
        return templates.slice(0, 6); // Max 6 templates
    };

    // Steps configuration - Different steps for outbound vs inbound
    const outboundSteps = [
        { num: 1, label: 'Type' },
        { num: 2, label: 'Objectifs' },
        { num: 3, label: 'Leads' },
        { num: 4, label: 'Canal' },
        { num: 5, label: 'Message' },
        { num: 6, label: 'Planning' },
        { num: 7, label: 'Récap' }
    ];

    const inboundSteps = [
        { num: 1, label: 'Type' },
        { num: 2, label: 'Canal' },
        { num: 3, label: 'Config' },
        { num: 4, label: 'Routage' },
        { num: 5, label: 'Récap' }
    ];

    const steps = campaign.type === 'inbound' ? inboundSteps : outboundSteps;

    // Fetch agent config and contacts on mount
    useEffect(() => {
        if (user) {
            fetchAgentConfig();
            fetchContacts();
        }
    }, [user]);

    const fetchAgentConfig = async () => {
        setLoadingAgent(true);
        try {
            let data = null;
            
            // Get default agent from agents table
            const { data: agentData, error } = await supabase
                .from('agents')
                .select('*')
                .eq('user_id', user.id)
                .eq('is_default', true)
                    .maybeSingle();

                if (error) throw error;
            
            if (agentData) {
                // Build agentConfig from agents table
                const config = agentData.config || {};
                data = {
                    id: agentData.id,
                    name: agentData.name,
                    role: agentData.role,
                    company: config.company,
                    ...config
                };
                setAgentConfig(data);
                
                const defaultMessage = config.firstMessage || 
                    `Bonjour ! Je suis ${agentData.name || 'votre assistant'} de ${config.company || 'notre équipe'}. Comment puis-je vous aider ?`;
                
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

    const fetchContacts = async () => {
        setLoadingContacts(true);
        try {
            let data = [];
            
            // If impersonating, use admin API to bypass RLS
            if (isImpersonating && realUser) {
                const response = await fetch(endpoints.adminContactsByAgent(user.id), {
                    headers: { 'X-Admin-Email': realUser.email }
                });
                if (response.ok) {
                    data = await response.json();
                }
            } else {
                // Normal mode: Get default agent first
                const { data: agents } = await supabase
                    .from('agents')
                    .select('id')
                    .eq('user_id', user.id)
                    .eq('is_default', true)
                    .maybeSingle();

                if (agents) {
                const { data: supabaseData, error } = await supabase
                    .from('contacts')
                    .select('*')
                        .eq('agent_id', agents.id)
                    .order('created_at', { ascending: false });

                if (error) throw error;
                data = supabaseData || [];
                }
            }
            
            setContacts(data);
            
            // Auto-select all if there are contacts
            if (data && data.length > 0) {
                setSelectedContacts(data.map(c => c.id));
                setContactSource('existing');
            }
        } catch (error) {
            console.error('Error fetching contacts:', error);
            setContacts([]);
        } finally {
            setLoadingContacts(false);
        }
    };

    const handleCsvUpload = (e) => {
        const file = e.target.files[0];
        if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
            setCsvFile(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target.result;
                const lines = text.split('\n').filter(l => l.trim());
                const headers = lines[0].split(',').map(h => h.trim());
                const rows = lines.slice(1, 6).map(line => line.split(',').map(c => c.trim()));
                setCsvPreview({ 
                    headers, 
                    rows, 
                    totalRows: lines.length - 1 
                });
            };
            reader.readAsText(file);
        }
    };

    const importCsvContacts = async () => {
        if (!csvFile) return;
        
        setLoading(true);
        try {
            const text = await csvFile.text();
            const lines = text.split('\n').filter(line => line.trim());
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

            const nameIdx = headers.findIndex(h => h.includes('name') || h.includes('nom'));
            const phoneIdx = headers.findIndex(h => h.includes('phone') || h.includes('tel') || h.includes('mobile'));
            const emailIdx = headers.findIndex(h => h.includes('email') || h.includes('mail'));
            const companyIdx = headers.findIndex(h => h.includes('company') || h.includes('entreprise'));

            if (phoneIdx === -1) {
                alert("Le fichier CSV doit contenir une colonne 'phone' ou 'tel'");
                setLoading(false);
                return;
            }

            const newContacts = [];
            for (let i = 1; i < lines.length; i++) {
                const values = lines[i].split(',').map(v => v.trim());
                if (values[phoneIdx]) {
                    newContacts.push({
                        name: nameIdx >= 0 ? values[nameIdx] : 'Inconnu',
                        phone: values[phoneIdx],
                        email: emailIdx >= 0 ? values[emailIdx] : null,
                        company_name: companyIdx >= 0 ? values[companyIdx] : null,
                        source: 'CSV Import - Campagne',
                        agent_id: user.id,
                        status: 'pending'
                    });
                }
            }

            // Insert into Supabase
            const { data, error } = await supabase
                .from('contacts')
                .insert(newContacts)
                .select();

            if (error) throw error;

            // Add to contacts list and select them
            setContacts(prev => [...data, ...prev]);
            setSelectedContacts(prev => [...prev, ...data.map(c => c.id)]);
            
            // Clear CSV
            setCsvFile(null);
            setCsvPreview(null);
            
            alert(`${data.length} contacts importés avec succès !`);
        } catch (error) {
            console.error('Error importing CSV:', error);
            alert('Erreur lors de l\'import: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const toggleContactSelection = (contactId) => {
        setSelectedContacts(prev => 
            prev.includes(contactId)
                ? prev.filter(id => id !== contactId)
                : [...prev, contactId]
        );
    };

    const selectAllContacts = () => {
        const filteredIds = filteredContacts.map(c => c.id);
        const allSelected = filteredIds.every(id => selectedContacts.includes(id));
        
        if (allSelected) {
            setSelectedContacts(prev => prev.filter(id => !filteredIds.includes(id)));
        } else {
            setSelectedContacts(prev => [...new Set([...prev, ...filteredIds])]);
        }
    };

    const filteredContacts = contacts.filter(contact => {
        const matchesFilter = contactFilter === 'all' || 
            (contactFilter === 'new' && contact.status === 'new') ||
            (contactFilter === 'qualified' && contact.score >= 70) ||
            (contactFilter === 'unqualified' && (!contact.score || contact.score < 70));
        
        const matchesSearch = !searchContacts || 
            contact.name?.toLowerCase().includes(searchContacts.toLowerCase()) ||
            contact.phone?.includes(searchContacts) ||
            contact.email?.toLowerCase().includes(searchContacts.toLowerCase());
        
        return matchesFilter && matchesSearch;
    });

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
            
            const response = await fetch(endpoints.generatePersona, {
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
        // Validation based on campaign type
        if (campaign.type === 'outbound') {
        if (!campaign.name || campaign.objectives.length === 0 || !campaign.firstMessage || selectedContacts.length === 0) {
            alert('Veuillez remplir tous les champs obligatoires et sélectionner des contacts');
            return;
        }
        } else if (campaign.type === 'inbound') {
            if (!campaign.name || !campaign.channel) {
                alert('Veuillez remplir tous les champs obligatoires');
            return;
            }
        }

        setLoading(true);
        try {
            console.log('🚀 Launching campaign:', campaign.name, 'Type:', campaign.type);

            // Get default agent first
            const { data: agents } = await supabase
                .from('agents')
                .select('id')
                .eq('user_id', user.id)
                .eq('is_default', true)
                .maybeSingle();

            if (!agents) {
                throw new Error('Agent non trouvé. Veuillez d\'abord créer votre agent.');
            }

            const agentId = agents.id;

            // Create campaign via API
            const campaignData = {
                name: campaign.name,
                type: campaign.type,
                channel: campaign.channel,
                objective: campaign.objectives[0] || null,
                messages: campaign.type === 'outbound' ? {
                    messageA: campaign.firstMessage,
                    messageB: campaign.messageB || null,
                    abTestEnabled: campaign.abTestEnabled,
                    abSplit: campaign.abSplit
                } : {
                    greeting: campaign.firstMessage || 'Bonjour ! Comment puis-je vous aider ?',
                    fallbackMessage: 'Je n\'ai pas compris, pouvez-vous reformuler ?'
                },
                target_contacts: campaign.type === 'outbound' ? { contact_ids: selectedContacts } : null,
                schedule: campaign.type === 'outbound' ? campaign.schedule : null,
                routing_rules: campaign.type === 'inbound' ? campaign.routingRules : null,
                settings: campaign.settings
            };

            const response = await fetch(endpoints.campaigns, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    agentId: agentId,
                    campaign: campaignData
                })
            });

            const result = await response.json();
            
            if (!response.ok) {
                throw new Error(result.error || 'Erreur lors de la création');
            }

            console.log('Campaign created:', result);

            // For outbound campaigns, also launch the messages
            if (campaign.type === 'outbound') {
                const launchResponse = await fetch(endpoints.launchCampaign, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        agentId: agentId,
                    contactIds: selectedContacts,
                    channel: campaign.channel,
                    firstMessage: campaign.firstMessage,
                    messageB: campaign.messageB,
                    abTestEnabled: campaign.abTestEnabled,
                    abSplit: campaign.abSplit,
                        campaignName: campaign.name,
                        campaignId: result.id
                })
            });

                const launchResult = await launchResponse.json();
                
                if (!launchResponse.ok) {
                    throw new Error(launchResult.error || 'Erreur lors du lancement');
                }
                
                alert(`✅ Campagne lancée avec succès !\n\n${launchResult.sent}/${launchResult.totalContacts} messages envoyés.${launchResult.failed > 0 ? `\n⚠️ ${launchResult.failed} échecs` : ''}`);
            } else {
                // For inbound campaigns, just start them
                await fetch(`${endpoints.campaigns}/${result.id}/start`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ userId: user.id })
                });
                
                alert(`✅ Campagne inbound "${campaign.name}" créée et activée !\n\nLes conversations entrantes sur ${campaign.channel} seront maintenant gérées par votre agent.`);
            }
            
            navigate('/campaigns');
        } catch (error) {
            console.error('Error launching campaign:', error);
            alert('Erreur lors du lancement de la campagne: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const canProceed = () => {
        // Different validation based on campaign type
        if (campaign.type === 'inbound') {
        switch (currentStep) {
                case 1: return campaign.type; // Name can be filled later
                case 2: return campaign.channel;
                case 3: return true; // Config is optional
                case 4: return true; // Routing rules have defaults
            default: return true;
            }
        } else if (campaign.type === 'outbound') {
            switch (currentStep) {
                case 1: return campaign.type; // Name can be filled later
                case 2: return campaign.objectives.length > 0;
                case 3: return selectedContacts.length > 0;
                case 4: return campaign.channel;
                case 5: return campaign.firstMessage.length > 10;
                case 6: return campaign.schedule.startDate && campaign.schedule.days.length > 0;
                default: return true;
            }
        } else {
            // No type selected yet
            return campaign.type;
        }
    };

    // Get the final step number based on campaign type
    const getFinalStep = () => campaign.type === 'inbound' ? 5 : 7;
    const isLastStep = currentStep === getFinalStep();

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
                        disabled={loading || !isLastStep}
                    >
                        <Rocket size={18} />
                        {loading ? 'Création...' : 'Lancer la campagne'}
                    </button>
                </div>
            </header>

            {/* Progress Steps */}
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
                {/* Step 1: Campaign Type Selection (NEW) */}
                {currentStep === 1 && (
                    <div className="step-content">
                        <div className="step-header">
                            <h2>Quel type de campagne ?</h2>
                            <p>Choisissez le type de campagne que vous souhaitez créer</p>
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

                        <div className="campaign-type-grid">
                            {/* Outbound Card */}
                            <div 
                                className={`campaign-type-card ${campaign.type === 'outbound' ? 'selected' : ''}`}
                                onClick={() => setCampaign({ ...campaign, type: 'outbound', channel: 'sms' })}
                            >
                                <div className="type-icon outbound">
                                    <Rocket size={32} />
                                </div>
                                <div className="type-content">
                                    <h3>Outbound</h3>
                                    <p>Campagne proactive</p>
                                    <span className="type-description">
                                        Envoyez des messages à vos contacts existants (SMS, WhatsApp, Email)
                                    </span>
                                </div>
                                <div className="type-channels">
                                    <span className="channel-tag">SMS</span>
                                    <span className="channel-tag">WhatsApp</span>
                                    <span className="channel-tag disabled">Email</span>
                                </div>
                                {campaign.type === 'outbound' && (
                                    <div className="type-check"><Check size={20} /></div>
                                )}
                            </div>

                            {/* Inbound Card */}
                            <div 
                                className={`campaign-type-card ${campaign.type === 'inbound' ? 'selected' : ''}`}
                                onClick={() => setCampaign({ ...campaign, type: 'inbound', channel: 'widget' })}
                            >
                                <div className="type-icon inbound">
                                    <MessageSquare size={32} />
                                </div>
                                <div className="type-content">
                                    <h3>Inbound</h3>
                                    <p>Campagne réactive</p>
                                    <span className="type-description">
                                        Gérez les conversations entrantes de vos prospects (Widget, Instagram, Messenger)
                                    </span>
                                </div>
                                <div className="type-channels">
                                    <span className="channel-tag">Widget</span>
                                    <span className="channel-tag">Instagram</span>
                                    <span className="channel-tag">Messenger</span>
                                </div>
                                {campaign.type === 'inbound' && (
                                    <div className="type-check"><Check size={20} /></div>
                                )}
                            </div>
                        </div>

                        {campaign.type && (
                            <div className="selected-summary">
                                <Zap size={16} />
                                <span>
                                    Campagne <strong>{campaign.type === 'outbound' ? 'Outbound (proactive)' : 'Inbound (réactive)'}</strong> sélectionnée
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 2: Objectives (OUTBOUND ONLY) */}
                {currentStep === 2 && campaign.type === 'outbound' && (
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

                {/* Step 3: Leads Selection (OUTBOUND ONLY) */}
                {currentStep === 3 && campaign.type === 'outbound' && (
                    <div className="step-content">
                        <div className="step-header">
                            <h2>Sélectionnez vos leads</h2>
                            <p>Choisissez les contacts à inclure dans cette campagne</p>
                        </div>

                        {/* Source Selection */}
                        <div className="leads-source-selector">
                            <button 
                                className={`source-btn ${contactSource === 'existing' ? 'active' : ''}`}
                                onClick={() => setContactSource('existing')}
                            >
                                <Database size={20} />
                                <div>
                                    <span>Contacts existants</span>
                                    <small>{contacts.length} contacts disponibles</small>
                                </div>
                            </button>
                            <button 
                                className={`source-btn ${contactSource === 'import' ? 'active' : ''}`}
                                onClick={() => setContactSource('import')}
                            >
                                <Upload size={20} />
                                <div>
                                    <span>Importer un CSV</span>
                                    <small>Ajouter de nouveaux leads</small>
                                </div>
                            </button>
                        </div>

                        {/* CSV Import Section */}
                        {contactSource === 'import' && (
                            <div className="csv-import-section">
                                {!csvFile ? (
                                    <label className="csv-dropzone-large">
                                        <input
                                            type="file"
                                            accept=".csv"
                                            onChange={handleCsvUpload}
                                            hidden
                                        />
                                        <Upload size={40} />
                                        <h4>Glissez votre fichier CSV ici</h4>
                                        <p>ou cliquez pour parcourir</p>
                                        <span className="format-hint">Colonnes requises : nom, téléphone (email optionnel)</span>
                                    </label>
                                ) : (
                                    <div className="csv-preview-card">
                                        <div className="csv-file-header">
                                            <div className="file-info">
                                                <FileText size={24} />
                                                <div>
                                                    <strong>{csvFile.name}</strong>
                                                    <span>{csvPreview?.totalRows || 0} contacts détectés</span>
                                                </div>
                                            </div>
                                            <button className="btn-remove" onClick={() => { setCsvFile(null); setCsvPreview(null); }}>
                                                <X size={18} />
                                            </button>
                                        </div>
                                        
                                        {csvPreview && (
                                            <div className="csv-table-wrapper">
                                                <table>
                                                    <thead>
                                                        <tr>
                                                            {csvPreview.headers.slice(0, 4).map((h, i) => (
                                                                <th key={i}>{h}</th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {csvPreview.rows.slice(0, 3).map((row, i) => (
                                                            <tr key={i}>
                                                                {row.slice(0, 4).map((cell, j) => (
                                                                    <td key={j}>{cell?.slice(0, 25)}{cell?.length > 25 ? '...' : ''}</td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}

                                        <button 
                                            className="btn-primary full-width"
                                            onClick={importCsvContacts}
                                            disabled={loading}
                                        >
                                            {loading ? 'Import en cours...' : `Importer ${csvPreview?.totalRows || 0} contacts`}
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Existing Contacts Selection */}
                        {contactSource === 'existing' && (
                            <div className="contacts-selection">
                                {loadingContacts ? (
                                    <div className="loading-contacts">
                                        <div className="loading-spinner"></div>
                                        <p>Chargement des contacts...</p>
                                    </div>
                                ) : contacts.length === 0 ? (
                                    <div className="no-contacts">
                                        <Users size={48} />
                                        <h4>Aucun contact disponible</h4>
                                        <p>Importez des contacts via CSV pour lancer votre campagne</p>
                                        <button className="btn-secondary" onClick={() => setContactSource('import')}>
                                            <Upload size={18} />
                                            Importer un CSV
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        {/* Filters */}
                                        <div className="contacts-filters">
                                            <div className="search-contacts">
                                                <Search size={18} />
                                                <input
                                                    type="text"
                                                    placeholder="Rechercher un contact..."
                                                    value={searchContacts}
                                                    onChange={(e) => setSearchContacts(e.target.value)}
                                                />
                                            </div>
                                            <div className="filter-buttons">
                                                {[
                                                    { key: 'all', label: 'Tous' },
                                                    { key: 'new', label: 'Nouveaux' },
                                                    { key: 'qualified', label: 'Qualifiés' }
                                                ].map(f => (
                                                    <button
                                                        key={f.key}
                                                        className={`filter-btn ${contactFilter === f.key ? 'active' : ''}`}
                                                        onClick={() => setContactFilter(f.key)}
                                                    >
                                                        {f.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Selection Header */}
                                        <div className="selection-header">
                                            <button className="select-all-btn" onClick={selectAllContacts}>
                                                {filteredContacts.every(c => selectedContacts.includes(c.id)) 
                                                    ? <CheckSquare size={18} /> 
                                                    : <Square size={18} />
                                                }
                                                Tout sélectionner
                                            </button>
                                            <span className="selection-count">
                                                {selectedContacts.length} contact{selectedContacts.length > 1 ? 's' : ''} sélectionné{selectedContacts.length > 1 ? 's' : ''}
                                            </span>
                                        </div>

                                        {/* Contacts List */}
                                        <div className="contacts-list">
                                            {filteredContacts.map(contact => (
                                                <div 
                                                    key={contact.id}
                                                    className={`contact-row ${selectedContacts.includes(contact.id) ? 'selected' : ''}`}
                                                    onClick={() => toggleContactSelection(contact.id)}
                                                >
                                                    <div className="contact-checkbox">
                                                        {selectedContacts.includes(contact.id) 
                                                            ? <CheckSquare size={18} /> 
                                                            : <Square size={18} />
                                                        }
                                                    </div>
                                                    <div className="contact-avatar">
                                                        {contact.name?.charAt(0)?.toUpperCase() || '?'}
                                                    </div>
                                                    <div className="contact-info">
                                                        <span className="contact-name">{contact.name || 'Sans nom'}</span>
                                                        <span className="contact-phone">{contact.phone}</span>
                                                    </div>
                                                    {contact.company_name && (
                                                        <span className="contact-company">{contact.company_name}</span>
                                                    )}
                                                    <span className={`contact-status ${contact.status || 'new'}`}>
                                                        {contact.status === 'qualified' ? 'Qualifié' : 
                                                         contact.status === 'contacted' ? 'Contacté' : 'Nouveau'}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Selection Summary */}
                        {selectedContacts.length > 0 && (
                            <div className="selected-summary success">
                                <Users size={16} />
                                <span>
                                    {selectedContacts.length} contact{selectedContacts.length > 1 ? 's' : ''} sélectionné{selectedContacts.length > 1 ? 's' : ''} pour cette campagne
                                </span>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 3: Channel */}
                {/* Step 4: Channel Selection (OUTBOUND) OR Step 2 (INBOUND) */}
                {((currentStep === 4 && campaign.type === 'outbound') || (currentStep === 2 && campaign.type === 'inbound')) && (
                    <div className="step-content">
                        <div className="step-header">
                            <h2>Canal de communication</h2>
                            <p>Votre agent sera utilisé pour cette campagne</p>
                        </div>

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

                {/* Step 3: Channel Configuration (INBOUND ONLY) */}
                {currentStep === 3 && campaign.type === 'inbound' && (
                    <div className="step-content">
                        <div className="step-header">
                            <h2>Configuration du canal</h2>
                            <p>Configurez votre canal {campaign.channel} pour recevoir les leads</p>
                        </div>

                        {/* Widget Configuration */}
                        {campaign.channel === 'widget' && agentConfig && (
                            <div className="channel-config">
                                <div className="config-card success">
                                    <div className="config-icon">
                                        <Check size={24} />
                                    </div>
                                    <h3>Widget prêt à être intégré !</h3>
                                    <p>Copiez ce code et collez-le juste avant la balise &lt;/body&gt; de votre site</p>
                                </div>

                                <div className="code-block">
                                    <div className="code-header">
                                        <span>Code d'intégration</span>
                                        <button 
                                            className="btn-copy"
                                            onClick={() => {
                                                const code = `<!-- Smart Caller Chat Widget -->
<script 
    src="https://agent.smart-caller.ai/widget/widget-loader.js"
    data-agent-id="${agentConfig.id}"
    data-color="#FF470F"
    data-position="right">
</script>`;
                                                navigator.clipboard.writeText(code);
                                                alert('Code copié !');
                                            }}
                                        >
                                            <Copy size={16} />
                                            Copier
                                        </button>
                                    </div>
                                    <pre className="code-content">
{`<!-- Smart Caller Chat Widget -->
<script 
    src="https://agent.smart-caller.ai/widget/widget-loader.js"
    data-agent-id="${agentConfig.id}"
    data-color="#FF470F"
    data-position="right">
</script>`}
                                    </pre>
                                </div>

                                <div className="config-info">
                                    <Info size={16} />
                                    <span>Le widget apparaîtra en bas à droite de votre site une fois le code installé.</span>
                                </div>
                            </div>
                        )}

                        {/* Instagram DM Configuration */}
                        {campaign.channel === 'instagram' && (
                            <div className="channel-config">
                                <div className="config-card warning">
                                    <div className="config-icon warning">
                                        <AlertCircle size={24} />
                                    </div>
                                    <h3>Connexion Instagram requise</h3>
                                    <p>Connectez votre compte Instagram Business pour recevoir les DM</p>
                                </div>

                                <div className="integration-steps">
                                    <div className="step-item">
                                        <span className="step-number">1</span>
                                        <div className="step-content">
                                            <h4>Compte Instagram Business</h4>
                                            <p>Votre compte Instagram doit être un compte professionnel</p>
                                        </div>
                                    </div>
                                    <div className="step-item">
                                        <span className="step-number">2</span>
                                        <div className="step-content">
                                            <h4>Page Facebook liée</h4>
                                            <p>Votre compte Instagram doit être lié à une Page Facebook</p>
                                        </div>
                                    </div>
                                    <div className="step-item">
                                        <span className="step-number">3</span>
                                        <div className="step-content">
                                            <h4>Autoriser Smart Caller</h4>
                                            <p>Autorisez l'application à accéder à vos messages</p>
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    className="btn-connect instagram"
                                    onClick={() => window.open('/integrations', '_blank')}
                                >
                                    <MessageCircle size={18} />
                                    Connecter Instagram
                                </button>
                            </div>
                        )}

                        {/* Messenger Configuration */}
                        {campaign.channel === 'messenger' && (
                            <div className="channel-config">
                                <div className="config-card warning">
                                    <div className="config-icon warning">
                                        <AlertCircle size={24} />
                                    </div>
                                    <h3>Connexion Messenger requise</h3>
                                    <p>Connectez votre Page Facebook pour recevoir les messages Messenger</p>
                                </div>

                                <div className="integration-steps">
                                    <div className="step-item">
                                        <span className="step-number">1</span>
                                        <div className="step-content">
                                            <h4>Page Facebook</h4>
                                            <p>Vous devez être administrateur d'une Page Facebook</p>
                                        </div>
                                    </div>
                                    <div className="step-item">
                                        <span className="step-number">2</span>
                                        <div className="step-content">
                                            <h4>Autoriser Smart Caller</h4>
                                            <p>Autorisez l'application à gérer les messages de votre Page</p>
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    className="btn-connect messenger"
                                    onClick={() => window.open('/integrations', '_blank')}
                                >
                                    <MessageCircle size={18} />
                                    Connecter Messenger
                                </button>
                            </div>
                        )}

                        {/* SMS Inbound Webhook */}
                        {campaign.channel === 'sms' && agentConfig && (
                            <div className="channel-config">
                                <div className="config-card success">
                                    <div className="config-icon">
                                        <Check size={24} />
                                    </div>
                                    <h3>Webhook SMS configuré</h3>
                                    <p>Utilisez ce webhook pour envoyer vos leads entrants par SMS</p>
                                </div>

                                <div className="code-block">
                                    <div className="code-header">
                                        <span>URL du Webhook</span>
                                        <button 
                                            className="btn-copy"
                                            onClick={() => {
                                                navigator.clipboard.writeText(`https://webhook.smart-caller.ai/webhooks/${user.id}/leads`);
                                                alert('URL copiée !');
                                            }}
                                        >
                                            <Copy size={16} />
                                            Copier
                                        </button>
                                    </div>
                                    <pre className="code-content">
{`https://webhook.smart-caller.ai/webhooks/${user.id}/leads`}
                                    </pre>
                                </div>

                                <div className="webhook-example">
                                    <h4>Exemple de payload JSON</h4>
                                    <pre className="code-content small">
{`{
  "name": "Jean Dupont",
  "phone": "+33612345678",
  "email": "jean@example.com",
  "source": "landing-page"
}`}
                                    </pre>
                                </div>

                                <div className="config-info">
                                    <Info size={16} />
                                    <span>Intégrez ce webhook dans votre formulaire ou CRM pour envoyer automatiquement les leads.</span>
                                </div>
                            </div>
                        )}

                        {/* WhatsApp Inbound Webhook */}
                        {campaign.channel === 'whatsapp' && agentConfig && (
                            <div className="channel-config">
                                <div className="config-card success">
                                    <div className="config-icon">
                                        <Check size={24} />
                                    </div>
                                    <h3>Webhook WhatsApp configuré</h3>
                                    <p>Utilisez ce webhook pour envoyer vos leads entrants par WhatsApp</p>
                                </div>

                                <div className="code-block">
                                    <div className="code-header">
                                        <span>URL du Webhook</span>
                                        <button 
                                            className="btn-copy"
                                            onClick={() => {
                                                navigator.clipboard.writeText(`https://webhook.smart-caller.ai/webhooks/${user.id}/leads`);
                                                alert('URL copiée !');
                                            }}
                                        >
                                            <Copy size={16} />
                                            Copier
                                        </button>
                                    </div>
                                    <pre className="code-content">
{`https://webhook.smart-caller.ai/webhooks/${user.id}/leads`}
                                    </pre>
                                </div>

                                <div className="config-info">
                                    <Info size={16} />
                                    <span>Les leads reçus seront contactés automatiquement via WhatsApp Business.</span>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Step 5: Message (OUTBOUND ONLY) */}
                {currentStep === 5 && campaign.type === 'outbound' && (
                    <div className="step-content">
                        <div className="step-header">
                            <h2>Premier message</h2>
                            <p>Rédigez le message d'accroche qui sera envoyé à vos contacts</p>
                        </div>

                        {/* A/B Test Toggle */}
                        <div className="ab-test-toggle">
                            <label className="toggle-switch">
                                <input 
                                    type="checkbox"
                                    checked={campaign.abTestEnabled}
                                    onChange={(e) => setCampaign({ ...campaign, abTestEnabled: e.target.checked })}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                            <div className="toggle-label">
                                <span>A/B Testing</span>
                                <small>Testez 2 versions pour optimiser vos résultats</small>
                            </div>
                            {campaign.abTestEnabled && (
                                <div className="ab-badge">
                                    <Zap size={12} />
                                    Actif
                                </div>
                            )}
                        </div>

                        {/* Message Tabs for A/B Testing */}
                        {campaign.abTestEnabled && (
                            <div className="message-tabs">
                                <button 
                                    className={`tab-btn ${activeMessageTab === 'A' ? 'active' : ''}`}
                                    onClick={() => setActiveMessageTab('A')}
                                >
                                    <span className="tab-letter">A</span>
                                    Version A
                                    <span className="tab-percent">{campaign.abSplit}%</span>
                                </button>
                                <button 
                                    className={`tab-btn ${activeMessageTab === 'B' ? 'active' : ''}`}
                                    onClick={() => setActiveMessageTab('B')}
                                >
                                    <span className="tab-letter">B</span>
                                    Version B
                                    <span className="tab-percent">{100 - campaign.abSplit}%</span>
                                </button>
                            </div>
                        )}

                        <div className="message-editor">
                            <div className="editor-header">
                                <label className="form-label">
                                    {campaign.abTestEnabled ? `Message version ${activeMessageTab} *` : 'Message d\'introduction *'}
                                </label>
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
                                value={activeMessageTab === 'A' || !campaign.abTestEnabled ? campaign.firstMessage : campaign.messageB}
                                onChange={(e) => {
                                    if (activeMessageTab === 'A' || !campaign.abTestEnabled) {
                                        setCampaign({ ...campaign, firstMessage: e.target.value });
                                    } else {
                                        setCampaign({ ...campaign, messageB: e.target.value });
                                    }
                                }}
                                rows={6}
                            />

                            <div className="editor-footer">
                                <div className="char-count">
                                    <span className={(activeMessageTab === 'A' ? campaign.firstMessage : campaign.messageB).length > 160 ? 'warning' : ''}>
                                        {(activeMessageTab === 'A' || !campaign.abTestEnabled ? campaign.firstMessage : campaign.messageB).length} / 160 caractères
                                    </span>
                                </div>
                                <div className="variables-hint">
                                    <span>Variables : </span>
                                    <code>{'{{name}}'}</code>
                                    <code>{'{{company}}'}</code>
                                    <code>{'{{agent_name}}'}</code>
                                </div>
                            </div>
                        </div>

                        {/* A/B Split Slider */}
                        {campaign.abTestEnabled && (
                            <div className="ab-split-section">
                                <label className="form-label">Répartition du test</label>
                                <div className="split-slider">
                                    <div className="split-labels">
                                        <span>A: {campaign.abSplit}%</span>
                                        <span>B: {100 - campaign.abSplit}%</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="10" 
                                        max="90" 
                                        value={campaign.abSplit}
                                        onChange={(e) => setCampaign({ ...campaign, abSplit: parseInt(e.target.value) })}
                                    />
                                    <div className="split-bar">
                                        <div className="split-a" style={{ width: `${campaign.abSplit}%` }}>A</div>
                                        <div className="split-b" style={{ width: `${100 - campaign.abSplit}%` }}>B</div>
                                    </div>
                                </div>
                                <p className="split-hint">
                                    Sur {selectedContacts.length} contacts : {Math.round(selectedContacts.length * campaign.abSplit / 100)} recevront A, {Math.round(selectedContacts.length * (100 - campaign.abSplit) / 100)} recevront B
                                </p>
                            </div>
                        )}

                        {/* Templates suggérés */}
                        {campaign.objectives.length > 0 && (
                            <div className="templates-section">
                                <div className="templates-header">
                                    <FileText size={18} />
                                    <span>Templates suggérés</span>
                                    <small>Cliquez pour utiliser</small>
                                </div>
                                <div className="templates-grid">
                                    {getRelevantTemplates().map(tpl => (
                                        <div 
                                            key={tpl.id}
                                            className="template-card"
                                            onClick={() => {
                                                if (activeMessageTab === 'A' || !campaign.abTestEnabled) {
                                                    setCampaign({ ...campaign, firstMessage: tpl.message });
                                                } else {
                                                    setCampaign({ ...campaign, messageB: tpl.message });
                                                }
                                            }}
                                        >
                                            <span className="template-title">{tpl.title}</span>
                                            <p className="template-preview">{tpl.message.substring(0, 60)}...</p>
                                            <Copy size={14} className="template-copy-icon" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Preview - Side by side if A/B enabled */}
                        <div className={`message-preview ${campaign.abTestEnabled ? 'ab-preview' : ''}`}>
                            <div className="preview-header">
                                <Eye size={16} />
                                <span>Aperçu {campaign.abTestEnabled ? 'A/B' : ''}</span>
                            </div>
                            <div className="preview-phones">
                                <div className="phone-mockup">
                                    {campaign.abTestEnabled && <span className="phone-label">Version A</span>}
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
                                {campaign.abTestEnabled && (
                                    <div className="phone-mockup">
                                        <span className="phone-label">Version B</span>
                                        <div className="phone-notch"></div>
                                        <div className="phone-screen">
                                            <div className="phone-status">
                                                <span>{agentConfig?.name || 'Smart Caller'}</span>
                                                <span className="time">10:30</span>
                                            </div>
                                            <div className="phone-messages">
                                                <div className="message-bubble agent">
                                                    {campaign.messageB
                                                        .replace(/\{\{name\}\}/g, 'Jean')
                                                        .replace(/\{\{company\}\}/g, agentConfig?.company || 'Votre Entreprise')
                                                        .replace(/\{\{agent_name\}\}/g, agentConfig?.name || 'Agent')
                                                        || 'Message B apparaîtra ici...'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 5: Schedule */}
                {/* Step 6: Planning (OUTBOUND ONLY) */}
                {currentStep === 6 && campaign.type === 'outbound' && (
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

                {/* Step 4: Routing Rules (INBOUND ONLY) */}
                {currentStep === 4 && campaign.type === 'inbound' && (
                    <div className="step-content">
                        <div className="step-header">
                            <h2>Règles de routage</h2>
                            <p>Configurez le transfert intelligent vers un humain pour les leads qualifiés</p>
                        </div>

                        {/* Human Transfer Card */}
                        <div className={`routing-card ${campaign.routingRules.routeToHuman ? 'active' : ''}`}>
                            <div className="routing-card-header">
                                <div className="routing-icon">
                                    <UserCheck size={24} />
                                </div>
                                <div className="routing-info">
                                    <h3>Transfert vers un humain</h3>
                                    <p>Activez le routage intelligent pour les leads qualifiés</p>
                                </div>
                                <label className="switch">
                                    <input
                                        type="checkbox"
                                        checked={campaign.routingRules.routeToHuman}
                                        onChange={(e) => setCampaign({
                                            ...campaign,
                                            routingRules: { ...campaign.routingRules, routeToHuman: e.target.checked }
                                        })}
                                    />
                                    <span className="slider"></span>
                                </label>
                            </div>

                            {campaign.routingRules.routeToHuman && (
                                <div className="routing-card-body">
                                    {/* Qualification Threshold */}
                                    <div className="threshold-section">
                                        <div className="threshold-header">
                                            <div className="threshold-icon">
                                                <Target size={20} />
                                            </div>
                                            <div>
                                                <h4>Seuil de qualification</h4>
                                                <p>Score minimum pour déclencher le transfert</p>
                                            </div>
                                        </div>
                                        
                                        <div className="threshold-control">
                                            <div className="threshold-bar">
                                                <div 
                                                    className="threshold-fill" 
                                                    style={{ width: `${campaign.routingRules.qualificationThreshold}%` }}
                                                />
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="100"
                                                    value={campaign.routingRules.qualificationThreshold}
                                                    onChange={(e) => setCampaign({
                                                        ...campaign,
                                                        routingRules: { ...campaign.routingRules, qualificationThreshold: parseInt(e.target.value) }
                                                    })}
                                                />
                                            </div>
                                            <div className="threshold-display">
                                                <span className="threshold-number">{campaign.routingRules.qualificationThreshold}</span>
                                                <span className="threshold-percent">%</span>
                                            </div>
                                        </div>
                                        
                                        <div className="threshold-labels">
                                            <span className={campaign.routingRules.qualificationThreshold < 40 ? 'active' : ''}>
                                                <span className="dot low"></span> Froid
                                            </span>
                                            <span className={campaign.routingRules.qualificationThreshold >= 40 && campaign.routingRules.qualificationThreshold < 70 ? 'active' : ''}>
                                                <span className="dot medium"></span> Tiède
                                            </span>
                                            <span className={campaign.routingRules.qualificationThreshold >= 70 ? 'active' : ''}>
                                                <span className="dot hot"></span> Chaud
                                            </span>
                                        </div>
                                    </div>

                                    {/* Notification Section */}
                                    <div className="notification-section">
                                        <div className={`notification-card ${campaign.routingRules.humanNotification.enabled ? 'active' : ''}`}>
                                            <div className="notification-header">
                                                <div className="notification-icon">
                                                    <Bell size={20} />
                                                </div>
                                                <div>
                                                    <h4>Notification par email</h4>
                                                    <p>Recevez une alerte quand un lead est qualifié</p>
                                                </div>
                                                <label className="switch small">
                                                    <input
                                                        type="checkbox"
                                                        checked={campaign.routingRules.humanNotification.enabled}
                                                        onChange={(e) => setCampaign({
                                                            ...campaign,
                                                            routingRules: {
                                                                ...campaign.routingRules,
                                                                humanNotification: { ...campaign.routingRules.humanNotification, enabled: e.target.checked }
                                                            }
                                                        })}
                                                    />
                                                    <span className="slider"></span>
                                                </label>
                                            </div>

                                            {campaign.routingRules.humanNotification.enabled && (
                                                <div className="notification-body">
                                                    <div className="email-input-wrapper">
                                                        <Mail size={18} />
                                                        <input
                                                            type="email"
                                                            placeholder="votre@email.com"
                                                            value={campaign.routingRules.humanNotification.recipient}
                                                            onChange={(e) => setCampaign({
                                                                ...campaign,
                                                                routingRules: {
                                                                    ...campaign.routingRules,
                                                                    humanNotification: { ...campaign.routingRules.humanNotification, recipient: e.target.value }
                                                                }
                                                            })}
                                                        />
                                                    </div>
                                                    <p className="email-hint">
                                                        <Zap size={14} /> Vous recevrez un email instantané avec les détails du lead
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Preview Card */}
                        <div className="routing-preview">
                            <h4><Eye size={18} /> Aperçu du flux</h4>
                            <div className="flow-steps">
                                <div className="flow-step">
                                    <div className="flow-icon incoming">
                                        <MessageCircle size={20} />
                                    </div>
                                    <span>Lead entrant</span>
                                </div>
                                <div className="flow-arrow">→</div>
                                <div className="flow-step">
                                    <div className="flow-icon ai">
                                        <Zap size={20} />
                                    </div>
                                    <span>Agent IA</span>
                                </div>
                                <div className="flow-arrow">→</div>
                                <div className="flow-step">
                                    <div className="flow-icon qualify">
                                        <Target size={20} />
                                    </div>
                                    <span>Score ≥ {campaign.routingRules.qualificationThreshold}%</span>
                                </div>
                                <div className="flow-arrow">→</div>
                                <div className="flow-step">
                                    <div className={`flow-icon human ${campaign.routingRules.routeToHuman ? 'active' : 'disabled'}`}>
                                        <UserCheck size={20} />
                                    </div>
                                    <span>{campaign.routingRules.routeToHuman ? 'Humain' : 'IA continue'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 7: Summary (OUTBOUND) OR Step 5 (INBOUND) */}
                {((currentStep === 7 && campaign.type === 'outbound') || (currentStep === 5 && campaign.type === 'inbound')) && (
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
                                <h4><Users size={18} /> Audience</h4>
                                <div className="summary-row">
                                    <span>Contacts sélectionnés</span>
                                    <strong>{selectedContacts.length} contacts</strong>
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
                                <p>Votre campagne enverra des messages à {selectedContacts.length} contacts selon le planning défini. Vous pourrez la mettre en pause à tout moment.</p>
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

                {currentStep < 6 ? (
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
