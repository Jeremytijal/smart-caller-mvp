import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Rocket, Target, Calendar, UserCheck, RefreshCw, ShoppingCart, 
    MessageSquare, Bot, Clock, ChevronRight, Check,
    Sparkles, AlertCircle, Info, Zap, Phone,
    Mail, MessageCircle, Eye, ArrowLeft, Building2, User,
    Users, Upload, FileText, X, Database, Filter, CheckSquare,
    Square, Search
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

    // Steps configuration - Added "Leads" step
    const steps = [
        { num: 1, label: 'Objectifs' },
        { num: 2, label: 'Leads' },
        { num: 3, label: 'Canal' },
        { num: 4, label: 'Message' },
        { num: 5, label: 'Planning' },
        { num: 6, label: 'Récap' }
    ];

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
            const { data, error } = await supabase
                .from('profiles')
                .select('agent_config, first_message_template')
                .eq('id', user.id)
                .single();

            if (error) throw error;
            
            if (data?.agent_config) {
                setAgentConfig(data.agent_config);
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

    const fetchContacts = async () => {
        setLoadingContacts(true);
        try {
            const { data, error } = await supabase
                .from('contacts')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setContacts(data || []);
            
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
                        user_id: user.id,
                        status: 'new',
                        created_at: new Date().toISOString()
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
        if (!campaign.name || campaign.objectives.length === 0 || !campaign.firstMessage || selectedContacts.length === 0) {
            alert('Veuillez remplir tous les champs obligatoires et sélectionner des contacts');
            return;
        }

        setLoading(true);
        try {
            console.log('Campaign to launch:', {
                ...campaign,
                contacts: selectedContacts,
                totalContacts: selectedContacts.length
            });
            
            alert(`Campagne créée avec succès ! ${selectedContacts.length} contacts seront contactés selon le planning défini.`);
            navigate('/campaigns');
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
            case 2: return selectedContacts.length > 0;
            case 3: return campaign.channel;
            case 4: return campaign.firstMessage.length > 10;
            case 5: return campaign.schedule.startDate && campaign.schedule.days.length > 0;
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
                        disabled={loading || currentStep !== 6}
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

                {/* Step 2: Leads Selection */}
                {currentStep === 2 && (
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
                {currentStep === 3 && (
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

                {/* Step 4: First Message */}
                {currentStep === 4 && (
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

                {/* Step 5: Schedule */}
                {currentStep === 5 && (
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

                {/* Step 6: Summary */}
                {currentStep === 6 && (
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
