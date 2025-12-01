import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, MessageSquare, Rocket, Zap, Globe, Briefcase, Target, Smartphone, CreditCard, ChevronRight, Edit2, Loader2, Play, User, HelpCircle, Shield, Info, Box, Star, Clock, Calendar, Instagram, Facebook, Mail, MessageCircle, RefreshCw, Send, Sun, Moon, Building2, Users, UserCircle, Euro, AlertCircle, MessageSquareWarning, CheckCircle2, X, Plus, ArrowLeft, Sparkles, Package, Layers, PlusCircle, Trophy, AlertTriangle, Phone, Trash2, Upload, FileText, Link2, Copy, ExternalLink, PartyPopper } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import './Onboarding.css';

const Onboarding = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [step, setStep] = useState(0);
    const [loading, setLoading] = useState(false);
    const [loadingText, setLoadingText] = useState('');

    // State Management
    const [formData, setFormData] = useState({
        website: '',
        country: 'France',
        language: 'Français',
        businessDescription: '', // Optional description
        businessType: '',
        icp: '', // Legacy field for ICP
        icpSector: 'PME et ETI - Télécommunications',
        icpSize: '10-250 employés',
        icpDecider: 'Directeur Commercial, CEO, Head of Sales',
        icpBudget: '500€ - 5 000€ / mois',
        painPoints: [
            "Perte de leads par manque de réactivité",
            "Standard téléphonique saturé",
            "Équipe commerciale surchargée",
            "Difficulté à qualifier les prospects"
        ],
        needs: [
            "Réponse rapide aux demandes entrantes",
            "Qualification automatique des leads",
            "Intégration CRM native",
            "Disponibilité 24/7"
        ],
        objections: [
            { objection: "C'est trop cher", response: "ROI en 30 jours grâce aux leads récupérés" },
            { objection: "J'ai déjà un commercial", response: "Smart Caller l'assiste, ne le remplace pas" },
            { objection: "Je veux tester d'abord", response: "Essai gratuit de 14 jours disponible" }
        ],
        commonQuestions: [],
        qualificationCriteria: [],
        goal: 'qualify', // 'qualify' or 'book'
        selectedAgentId: null, // New field for the selected agent option
        agentPersona: null, // { role, goal, firstMessage, behaviors, constraints, tone }
        channels: { sms: true, whatsapp: false, email: false, webchat: false }, // Default SMS/WhatsApp true
        crm: null, // 'hubspot', 'pipedrive', 'salesforce', 'none'
        crmApiKey: ''
    });

    // Analysis Results State
    const [editMode, setEditMode] = useState({ profile: false });
    const [analysisData, setAnalysisData] = useState({
        companyName: "Smart Caller",
        industry: "SaaS B2B - Télécommunications",
        valueProposition: "Qualification automatique des leads entrants par IA via SMS et WhatsApp",
        targetMarket: "PME et ETI en France",
        language: "Français",
        products: [
            { name: "Agent de qualification IA", description: "Qualification automatique des leads entrants par SMS/WhatsApp", price: "À partir de 299€/mois" },
            { name: "Intégration CRM", description: "Connexion native avec HubSpot, Salesforce, Pipedrive", price: "Inclus" },
            { name: "Dashboard Analytics", description: "Suivi des performances et KPIs en temps réel", price: "Inclus" }
        ],
        faqs: [
            "Comment fonctionne la qualification automatique ?",
            "Quels sont les délais de réponse de l'agent ?",
            "Comment s'intègre Smart Caller avec mon CRM ?",
            "Quelle est la tarification ?",
            "Y a-t-il une période d'essai gratuite ?"
        ],
        competitiveAdvantages: "",
        tone: "Professionnel",
        restrictions: "",
        contactEmail: "",
        contactPhone: "",
        businessHours: "",
        calendarUrl: ""
    });

    const calculateCompleteness = () => {
        let score = 0;
        const fields = [
            analysisData?.companyName,
            analysisData?.industry,
            analysisData?.valueProposition,
            analysisData?.targetMarket,
            analysisData?.products?.length > 0,
            analysisData?.faqs?.length >= 3,
            analysisData?.competitiveAdvantages,
            analysisData?.tone,
            analysisData?.contactEmail,
            analysisData?.contactPhone,
            analysisData?.businessHours,
            analysisData?.calendarUrl
        ];
        fields.forEach(field => { if (field) score += 1; });
        return Math.round((score / fields.length) * 100);
    };

    const [simulation, setSimulation] = useState([]);
    const [agentOptions, setAgentOptions] = useState([]); // Store the generated options
    const [newMessage, setNewMessage] = useState('');
    const [senderRole, setSenderRole] = useState('lead'); // 'agent' or 'lead'
    const [theme, setTheme] = useState('light');

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    // Apply theme to body
    useEffect(() => {
        document.body.setAttribute('data-theme', theme);
    }, [theme]);

    // --- Consultant Guide Content ---
    const guideContent = {
        0: {
            why: "Smart Caller analyse votre site web pour comprendre votre activité, votre audience et le contexte entrant. Cela garantit que l'agent s'aligne sur votre ton et le type de leads que vous recevez.",
            how: "Nous extrayons le type d'activité, les questions fréquentes et les schémas de qualification. Ces éléments façonnent les premiers messages de l'agent, son ton et la détection d'intention.",
            guarantee: [
                "Aucun stockage permanent du contenu",
                "Aucun impact sur le SEO ou la performance",
                "Vous gardez le contrôle total des données utilisées"
            ],
            note: "Recommandé par les meilleurs playbooks sales."
        },
        1: {
            why: "Nous affichons ce que Smart Caller a détecté pour que vous puissiez confirmer le contexte avant de générer le comportement de l'agent.",
            how: "Questions fréquentes → scripts conversationnels initiaux. Critères de qualification → logique de scoring. Type d'activité → ton, vocabulaire, règles de conformité.",
            guarantee: [
                "Vous pouvez éditer tous les champs plus tard",
                "Aucune hypothèse appliquée sans validation"
            ],
            note: "Basé sur des modèles conversationnels spécialisés."
        },
        2: {
            why: "Nous avons conçu trois agents sur mesure adaptés à votre modèle d'affaires.",
            how: "Chaque option possède une stratégie de conversation, des déclencheurs et un objectif final différents. Choisissez celui qui correspond à votre priorité actuelle.",
            guarantee: [
                "Vous pourrez ajuster le comportement plus tard",
                "Tous les agents incluent la protection anti-hallucination"
            ],
            note: "Sélectionnez l'agent qui correspond à votre KPI principal."
        },
        3: {
            why: "Cette prévisualisation montre comment votre agent parlera aux vrais leads en fonction de votre activité, du ton et des besoins détectés.",
            how: "La simulation calibre : le ton (doux / consultatif / dynamique), la profondeur des questions, l'empathie et la clarification, les déclencheurs de qualification.",
            guarantee: [
                "Les messages restent conformes et factuels",
                "Pas d'hallucinations ou d'infos fabriquées",
                "Régénérez autant de fois que nécessaire"
            ],
            note: "Calibrage du ton en temps réel."
        },
        4: {
            why: "La personnalité définit la cohérence des conversations de l'agent et assure un comportement prévisible.",
            how: "Le message d'intro façonne les taux d'engagement. Les règles comportementales définissent les limites (ce que l'agent évite). Le persona influence le ton, la longueur des phrases et la réactivité.",
            guarantee: [
                "L'agent ne promet jamais de fonctionnalités indisponibles",
                "L'agent reste dans les limites validées"
            ],
            note: "Assure une image de marque cohérente."
        },
        5: {
            why: "Chaque canal a son propre style de message, schéma d'engagement et flux de qualification.",
            how: "SMS = messages courts et efficaces. WhatsApp = ton plus riche et conversationnel.",
            guarantee: [
                "Aucun message envoyé avant activation",
                "Vous pouvez désactiver un canal à tout moment"
            ],
            note: "Optimisé pour le taux de réponse."
        },
        6: {
            why: "Pour synchroniser les données collectées avec vos outils existants.",
            how: "Les leads qualifiés sont envoyés directement dans votre pipeline avec le transcript complet.",
            guarantee: [
                "Transfert sécurisé et chiffré",
                "Aucune perte de donnée"
            ],
            note: "Intégration native."
        },
        7: {
            why: "Pour vous permettre de revoir la configuration de votre agent avant qu'il ne devienne actif.",
            how: "Vos paramètres piloteront : le scoring de qualification, la structure des messages, la logique de repli, l'escalade vers les équipes humaines.",
            guarantee: [
                "Transparence totale sur chaque conversation",
                "Protection des données de niveau industriel",
                "Vous restez aux commandes à tout moment"
            ],
            note: "Dernière vérification avant lancement."
        }
    };

    const breadcrumbs = [
        "Analyse", "Résultats", "Définition de l'ICP", "Sélection", "Configuration", "Canaux", "CRM", "Activation", "Démarrage"
    ];

    // CSV Import State
    const [csvFile, setCsvFile] = useState(null);
    const [csvPreview, setCsvPreview] = useState(null);
    const [webhookCopied, setWebhookCopied] = useState(false);

    // Generate unique webhook URL for user
    const webhookUrl = user ? `https://api.smartcaller.ai/webhook/${user.id}` : 'https://api.smartcaller.ai/webhook/your-id';

    const copyWebhook = () => {
        navigator.clipboard.writeText(webhookUrl);
        setWebhookCopied(true);
        setTimeout(() => setWebhookCopied(false), 2000);
    };

    const handleCsvUpload = (e) => {
        const file = e.target.files[0];
        if (file && file.type === 'text/csv') {
            setCsvFile(file);
            // Preview first 5 rows
            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target.result;
                const lines = text.split('\n').slice(0, 6);
                const headers = lines[0].split(',');
                const rows = lines.slice(1).map(line => line.split(','));
                setCsvPreview({ headers, rows, totalRows: text.split('\n').length - 1 });
            };
            reader.readAsText(file);
        }
    };

    const startWithCsv = async () => {
        if (!csvFile) return;
        setLoading(true);
        setLoadingText("Import des leads...");
        // Simulate upload - in real app, this would upload to backend
        setTimeout(() => {
            setLoading(false);
            navigate('/');
        }, 2000);
    };

    // --- Helper: Generate Agent Options ---
    const generateAgentOptions = (businessType) => {
        // In a real app, this would come from the backend.
        // We generate 3 archetypes based on the business type string.

        const baseTitle = businessType || "Service";

        return [
            {
                id: 'qualifier',
                title: `${baseTitle} Qualification Agent`,
                description: `Gère les demandes entrantes pour ${baseTitle}, qualifie les prospects en évaluant leurs besoins et leur budget.`,
                audience: "Prospects en phase de recherche d'information.",
                benefits: [
                    "Identifie rapidement les acheteurs à forte intention",
                    "Questions ciblées sur l'usage et le budget",
                    "S'intègre au CRM pour tracker les leads"
                ],
                example: `"Bonjour ! Je suis l'assistant ${baseTitle}. Quel type de service recherchez-vous aujourd'hui ? Avez-vous un budget spécifique ?"`,
                premium: false,
                icon: Zap
            },
            {
                id: 'scheduler',
                title: `${baseTitle} Booking Assistant`,
                description: `Se concentre sur la conversion immédiate en proposant des créneaux de rendez-vous ou d'intervention.`,
                audience: "Clients prêts à passer à l'action ou nécessitant une intervention.",
                benefits: [
                    "Maximise le taux de remplissage de l'agenda",
                    "Gère les annulations et reprogrammations",
                    "Envoie des rappels automatiques"
                ],
                example: `"Bonjour, je vois que vous souhaitez un ${baseTitle}. J'ai un créneau disponible demain à 14h, cela vous convient-il ?"`,
                premium: true,
                icon: Calendar
            },
            {
                id: 'support',
                title: `${baseTitle} Expert Advisor`,
                description: `Approche consultative pour guider les clients complexes vers la bonne solution ${baseTitle}.`,
                audience: "Clients avec des besoins techniques ou spécifiques.",
                benefits: [
                    "Répond aux questions techniques fréquentes",
                    "Suggère des produits/services complémentaires",
                    "Escalade les cas complexes aux humains"
                ],
                example: `"Je comprends votre besoin pour ${baseTitle}. Pour vous orienter, préférez-vous l'option performance ou économie ?"`,
                premium: true,
                icon: Star
            }
        ];
    };

    // --- API Calls ---

    const analyzeBusiness = async () => {
        if (!formData.website) return alert("Veuillez entrer une URL.");
        setLoading(true);
        setLoadingText("Analyse en cours...");
        try {
            const response = await fetch('https://app-smart-caller-backend-production.up.railway.app/api/onboarding/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: formData.website })
            });
            const data = await response.json();
            setFormData(prev => ({
                ...prev,
                businessType: data.businessType,
                icp: `Clients idéaux pour ${data.businessType} :
- Secteur : PME et ETI
- Besoin : Amélioration de la gestion des appels
- Pain points : Perte de leads, standard saturé`, // Mock AI proposition
                commonQuestions: data.commonQuestions,
                qualificationCriteria: data.qualificationCriteria
            }));

            // Generate options based on the result
            setAgentOptions(generateAgentOptions(data.businessType));

            setStep(1);
        } catch (error) {
            console.error("Error analyzing:", error);
            alert("Erreur d'analyse. Réessayez.");
        } finally {
            setLoading(false);
        }
    };

    const selectAgent = (agent) => {
        setFormData(prev => ({
            ...prev,
            selectedAgentId: agent.id,
            goal: agent.id === 'scheduler' ? 'book' : 'qualify' // Map to existing logic
        }));
        // Go to loading screen first
        setStep(3.5);
        // Then generate the complete agent profile
        setTimeout(() => {
            generateAgentProfile(agent);
        }, 2000); // 2 second loading animation
    };

    const generateAgentProfile = async (agent) => {
        setLoading(true);
        setLoadingText("Génération du profil de l'agent...");
        try {
            // Generate both simulation and persona in parallel
            const [simulationResponse, personaResponse] = await Promise.all([
                fetch('https://app-smart-caller-backend-production.up.railway.app/api/onboarding/simulate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ businessType: formData.businessType, tone: 'Professional' })
                }),
                fetch('https://app-smart-caller-backend-production.up.railway.app/api/onboarding/generate-persona', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ businessType: formData.businessType })
                })
            ]);

            const simulationData = await simulationResponse.json();
            const personaData = await personaResponse.json();

            setSimulation(simulationData.conversation || []);
            setFormData(prev => ({ ...prev, agentPersona: personaData }));
            setStep(4); // Go to combined configuration step
        } catch (error) {
            console.error("Error generating agent profile:", error);
            alert("Erreur de génération du profil.");
            setStep(3); // Go back to agent selection
        } finally {
            setLoading(false);
        }
    };

    const generatePreview = async () => {
        setLoading(true);
        setLoadingText("Génération de la simulation...");
        try {
            const response = await fetch('https://app-smart-caller-backend-production.up.railway.app/api/onboarding/simulate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ businessType: formData.businessType, tone: 'Professional' })
            });
            const data = await response.json();
            setSimulation(data.conversation);
        } catch (error) {
            console.error("Error simulating:", error);
            alert("Erreur de simulation.");
        } finally {
            setLoading(false);
        }
    };

    const generatePersona = async () => {
        setLoading(true);
        setLoadingText("Configuration de l'agent...");
        try {
            const response = await fetch('https://app-smart-caller-backend-production.up.railway.app/api/onboarding/generate-persona', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ businessType: formData.businessType })
            });
            const data = await response.json();
            setFormData(prev => ({ ...prev, agentPersona: data }));
            setStep(5);
        } catch (error) {
            console.error("Error generating persona:", error);
            alert("Erreur de génération.");
        } finally {
            setLoading(false);
        }
    };

    const finishOnboarding = async () => {
        if (!user) return alert("Utilisateur non connecté.");
        setLoading(true);
        try {
            // Construct final config
            const configToSave = {
                name: "Agent " + formData.businessType,
                role: formData.agentPersona.role,
                company: formData.businessType,
                tone: 50, // Default mapping
                politeness: 'vous',
                context: `Goal: ${formData.agentPersona.goal}. Behaviors: ${formData.agentPersona.behaviors.join(', ')}.`,
                first_message: formData.agentPersona.firstMessage,
                quality_criteria: formData.qualificationCriteria.map((c, i) => ({ id: i, text: c, type: 'must_have' })),
                scoring_criteria: formData.qualificationCriteria.map(c => `- ${c}`).join('\n'),
                channels: formData.channels,
                crm: formData.crm
            };

            const { error } = await supabase
                .from('profiles')
                .update({
                    agent_config: configToSave,
                    updated_at: new Date(),
                })
                .eq('id', user.id);

            if (error) throw error;
            navigate('/');
        } catch (error) {
            console.error('Error saving:', error);
            alert("Erreur lors de la sauvegarde.");
        } finally {
            setLoading(false);
        }
    };

    // --- Helper Components ---
    const GuidePanel = ({ stepIndex }) => {
        const content = guideContent[stepIndex];
        if (!content) return null;

        return (
            <div className="guide-panel">
                {content.note && (
                    <div className="micro-note">
                        <Zap size={12} fill="currentColor" /> {content.note}
                    </div>
                )}

                <div className="guide-block">
                    <h4><HelpCircle size={14} /> Pourquoi cette étape ?</h4>
                    <p>{content.why}</p>
                </div>

                <div className="guide-block">
                    <h4><Info size={14} /> Utilisation des données</h4>
                    <p>{content.how}</p>
                </div>

                <div className="guide-block">
                    <h4><Shield size={14} /> Ce que nous garantissons</h4>
                    <ul>
                        {content.guarantee.map((g, i) => (
                            <li key={i}>{g}</li>
                        ))}
                    </ul>
                </div>
            </div>
        );
    };

    const Breadcrumbs = () => (
        <div className="breadcrumbs">
            {breadcrumbs.map((label, index) => (
                <React.Fragment key={index}>
                    <div className={`breadcrumb-item ${step === index ? 'active' : ''}`}>
                        {label}
                    </div>
                    {index < breadcrumbs.length - 1 && <span className="breadcrumb-separator">/</span>}
                </React.Fragment>
            ))}
        </div>
    );

    // --- UI Variants ---
    const variants = {
        enter: { opacity: 0, y: 10 },
        center: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 },
    };

    return (
        <div className="onboarding-container">
            {/* Header / Progress */}
            <div className="onboarding-header">
                <div className="logo-area">
                    <Rocket className="text-accent" size={18} />
                    <span>Smart Caller</span>
                </div>
                <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-4">
                        <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
                            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
                        </button>
                        <div className="progress-bar">
                            {[0, 1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                                <div key={s} className={`progress-step ${step === s ? 'active' : step > s ? 'completed' : ''}`} />
                            ))}
                        </div>
                    </div>
                    <Breadcrumbs />
                </div>
            </div>

            <AnimatePresence mode="wait">
                {/* STEP 0: WELCOME & ANALYSIS */}
                {step === 0 && (
                    <motion.div key="step0" variants={variants} initial="enter" animate="center" exit="exit" className="step-wrapper wide">
                        <div className="analysis-step-container">
                            <div className="text-center mb-12">
                                <div className="badge">
                                    Business Information
                                </div>
                                <h1 className="hero-title mb-4">Tell us about your business</h1>
                                <p className="subtitle max-w-2xl mx-auto">
                                    Just share your site, country, and language.<br />
                                    We'll take care of the rest, creating AI agents that understand your business.
                                </p>
                            </div>

                            <div className="analysis-form max-w-3xl mx-auto">
                                <div className="input-group-vertical mb-6">
                                    <label className="text-sm font-semibold mb-2 block">Your Company Website</label>
                                    <div className="input-with-icon full-width-input">
                                        <Globe size={20} />
                                        <input
                                            type="text"
                                            placeholder="https://example.com"
                                            value={formData.website}
                                            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                            onKeyDown={(e) => e.key === 'Enter' && analyzeBusiness()}
                                            className="text-lg"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div className="input-group-vertical">
                                        <label className="text-sm font-semibold mb-2 block">Agent Language</label>
                                        <div className="select-wrapper full-width-select">
                                            <select
                                                value={formData.language}
                                                onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                                                className="custom-select"
                                            >
                                                <option value="Français">Français</option>
                                                <option value="English">English</option>
                                                <option value="Spanish">Spanish</option>
                                                <option value="German">German</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="input-group-vertical">
                                        <label className="text-sm font-semibold mb-2 block">Agent Country</label>
                                        <div className="select-wrapper full-width-select">
                                            <select
                                                value={formData.country}
                                                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                                                className="custom-select"
                                            >
                                                <option value="France">France</option>
                                                <option value="United States">United States</option>
                                                <option value="United Kingdom">United Kingdom</option>
                                                <option value="Germany">Germany</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="analysis-footer-centered">
                                    <button
                                        className="btn-secondary"
                                    >
                                        Lost? Talk to Sales <HelpCircle size={16} />
                                    </button>
                                    <button
                                        className="btn-primary px-8 py-3 text-lg"
                                        onClick={analyzeBusiness}
                                        disabled={loading}
                                    >
                                        {loading ? <><Loader2 className="animate-spin" size={20} /> {loadingText}</> : "Analyze my business"}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* STEP 1: ANALYSIS RESULTS - Version avec édition et compléments */}
                {step === 1 && (
                    <motion.div key="step1" variants={variants} initial="enter" animate="center" exit="exit" className="step-wrapper wide">
                        <div className="results-layout">
                            {/* Main Content */}
                            <div className="results-main">
                                {/* Header */}
                                <div className="results-header">
                                    <div className="results-header-content">
                                        <div className="success-icon-wrapper">
                                            <CheckCircle2 size={24} />
                                        </div>
                                        <div>
                                            <h1 className="results-title">Analyse terminée avec succès</h1>
                                            <p className="results-subtitle">
                                                Vérifiez les informations détectées et complétez si nécessaire.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="analysis-meta">
                                        <div className="meta-item">
                                            <Globe size={14} />
                                            <span>{formData.website}</span>
                                        </div>
                                        <div className="meta-item">
                                            <Clock size={14} />
                                            <span>Analysé en 4.2s</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Company Profile Card - EDITABLE */}
                                <div className="results-card">
                                    <div className="card-header-row">
                                        <div className="card-title-group">
                                            <Building2 size={20} />
                                            <h2>Profil de l'entreprise</h2>
                                        </div>
                                        <div className="edit-mode-toggle">
                                            <span className={`toggle-label ${!editMode.profile ? 'active' : ''}`}>Aperçu</span>
                                            <button
                                                className={`toggle-switch ${editMode.profile ? 'on' : ''}`}
                                                onClick={() => setEditMode({ ...editMode, profile: !editMode.profile })}
                                            />
                                            <span className={`toggle-label ${editMode.profile ? 'active' : ''}`}>Éditer</span>
                                        </div>
                                    </div>

                                    <div className="profile-grid">
                                        <div className="profile-item editable">
                                            <div className="profile-item-header">
                                                <span className="profile-label">Nom de l'entreprise</span>
                                                {editMode.profile && <span className="ai-detected-badge"><Sparkles size={10} /> Détecté</span>}
                                            </div>
                                            {editMode.profile ? (
                                                <input
                                                    type="text"
                                                    value={analysisData?.companyName || "Smart Caller"}
                                                    onChange={(e) => setAnalysisData({ ...analysisData, companyName: e.target.value })}
                                                    className="editable-input"
                                                />
                                            ) : (
                                                <span className="profile-value">{analysisData?.companyName || "Smart Caller"}</span>
                                            )}
                                        </div>

                                        <div className="profile-item editable">
                                            <div className="profile-item-header">
                                                <span className="profile-label">Secteur d'activité</span>
                                                {editMode.profile && <span className="ai-detected-badge"><Sparkles size={10} /> Détecté</span>}
                                            </div>
                                            {editMode.profile ? (
                                                <input
                                                    type="text"
                                                    value={analysisData?.industry || "SaaS B2B - Télécommunications"}
                                                    onChange={(e) => setAnalysisData({ ...analysisData, industry: e.target.value })}
                                                    className="editable-input"
                                                />
                                            ) : (
                                                <span className="profile-value">{analysisData?.industry || "SaaS B2B - Télécommunications"}</span>
                                            )}
                                        </div>

                                        <div className="profile-item editable full-width">
                                            <div className="profile-item-header">
                                                <span className="profile-label">Proposition de valeur principale</span>
                                                {editMode.profile && <span className="ai-detected-badge"><Sparkles size={10} /> Détecté</span>}
                                            </div>
                                            {editMode.profile ? (
                                                <textarea
                                                    value={analysisData?.valueProposition || "Qualification automatique des leads entrants par IA via SMS et WhatsApp"}
                                                    onChange={(e) => setAnalysisData({ ...analysisData, valueProposition: e.target.value })}
                                                    className="editable-textarea"
                                                    rows={2}
                                                />
                                            ) : (
                                                <span className="profile-value">{analysisData?.valueProposition || "Qualification automatique des leads entrants par IA via SMS et WhatsApp"}</span>
                                            )}
                                        </div>

                                        <div className="profile-item editable">
                                            <div className="profile-item-header">
                                                <span className="profile-label">Marché cible</span>
                                                {editMode.profile && <span className="ai-detected-badge"><Sparkles size={10} /> Détecté</span>}
                                            </div>
                                            {editMode.profile ? (
                                                <input
                                                    type="text"
                                                    value={analysisData?.targetMarket || "PME et ETI en France"}
                                                    onChange={(e) => setAnalysisData({ ...analysisData, targetMarket: e.target.value })}
                                                    className="editable-input"
                                                />
                                            ) : (
                                                <span className="profile-value">{analysisData?.targetMarket || "PME et ETI en France"}</span>
                                            )}
                                        </div>

                                        <div className="profile-item editable">
                                            <div className="profile-item-header">
                                                <span className="profile-label">Langue principale</span>
                                                {editMode.profile && <span className="ai-detected-badge"><Sparkles size={10} /> Détecté</span>}
                                            </div>
                                            {editMode.profile ? (
                                                <select
                                                    value={analysisData?.language || "Français"}
                                                    onChange={(e) => setAnalysisData({ ...analysisData, language: e.target.value })}
                                                    className="editable-select"
                                                >
                                                    <option value="Français">Français</option>
                                                    <option value="English">English</option>
                                                    <option value="Español">Español</option>
                                                    <option value="Deutsch">Deutsch</option>
                                                </select>
                                            ) : (
                                                <span className="profile-value">{analysisData?.language || "Français"}</span>
                                            )}
                                        </div>
                                    </div>

                                    {editMode.profile && (
                                        <div className="edit-help-text">
                                            <Info size={14} />
                                            <span>Cliquez sur un champ pour le modifier. Les changements sont sauvegardés automatiquement.</span>
                                        </div>
                                    )}
                                </div>

                                {/* Products/Services - EDITABLE */}
                                <div className="results-card">
                                    <div className="card-header-row">
                                        <div className="card-title-group">
                                            <Package size={20} />
                                            <h2>Produits & Services détectés</h2>
                                        </div>
                                        <button
                                            className="btn-add-small"
                                            onClick={() => {
                                                const newProducts = [...(analysisData?.products || [])];
                                                newProducts.push({ name: "", description: "", price: "" });
                                                setAnalysisData({ ...analysisData, products: newProducts });
                                            }}
                                        >
                                            <Plus size={14} />
                                            Ajouter
                                        </button>
                                    </div>

                                    <div className="products-list">
                                        {(analysisData?.products || [
                                            { name: "Agent de qualification IA", description: "Qualification automatique des leads entrants par SMS/WhatsApp", price: "À partir de 299€/mois" },
                                            { name: "Intégration CRM", description: "Connexion native avec HubSpot, Salesforce, Pipedrive", price: "Inclus" },
                                            { name: "Dashboard Analytics", description: "Suivi des performances et KPIs en temps réel", price: "Inclus" }
                                        ]).map((product, index) => (
                                            <div key={index} className="product-item editable-product">
                                                <div className="product-icon">
                                                    <Layers size={18} />
                                                </div>
                                                <div className="product-content">
                                                    <input
                                                        type="text"
                                                        value={product.name}
                                                        onChange={(e) => {
                                                            const newProducts = [...(analysisData?.products || [])];
                                                            newProducts[index] = { ...newProducts[index], name: e.target.value };
                                                            setAnalysisData({ ...analysisData, products: newProducts });
                                                        }}
                                                        placeholder="Nom du produit/service"
                                                        className="product-name-input"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={product.description}
                                                        onChange={(e) => {
                                                            const newProducts = [...(analysisData?.products || [])];
                                                            newProducts[index] = { ...newProducts[index], description: e.target.value };
                                                            setAnalysisData({ ...analysisData, products: newProducts });
                                                        }}
                                                        placeholder="Description courte"
                                                        className="product-desc-input"
                                                    />
                                                </div>
                                                <div className="product-actions">
                                                    <input
                                                        type="text"
                                                        value={product.price}
                                                        onChange={(e) => {
                                                            const newProducts = [...(analysisData?.products || [])];
                                                            newProducts[index] = { ...newProducts[index], price: e.target.value };
                                                            setAnalysisData({ ...analysisData, products: newProducts });
                                                        }}
                                                        placeholder="Prix"
                                                        className="product-price-input"
                                                    />
                                                    <button
                                                        className="btn-remove-item"
                                                        onClick={() => {
                                                            const newProducts = [...(analysisData?.products || [])];
                                                            newProducts.splice(index, 1);
                                                            setAnalysisData({ ...analysisData, products: newProducts });
                                                        }}
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* FAQ - EDITABLE */}
                                <div className="results-card">
                                    <div className="card-header-row">
                                        <div className="card-title-group">
                                            <HelpCircle size={20} />
                                            <h2>Questions fréquentes</h2>
                                        </div>
                                        <span className="info-badge">
                                            <Sparkles size={12} />
                                            Utilisées pour entraîner l'agent
                                        </span>
                                    </div>

                                    <div className="faq-list editable-faq">
                                        {(analysisData?.faqs || [
                                            "Comment fonctionne la qualification automatique ?",
                                            "Quels sont les délais de réponse de l'agent ?",
                                            "Comment s'intègre Smart Caller avec mon CRM ?",
                                            "Quelle est la tarification ?",
                                            "Y a-t-il une période d'essai gratuite ?"
                                        ]).map((faq, index) => (
                                            <div key={index} className="faq-item editable-faq-item">
                                                <MessageSquare size={16} />
                                                <input
                                                    type="text"
                                                    value={faq}
                                                    onChange={(e) => {
                                                        const newFaqs = [...(analysisData?.faqs || [])];
                                                        newFaqs[index] = e.target.value;
                                                        setAnalysisData({ ...analysisData, faqs: newFaqs });
                                                    }}
                                                    className="faq-input"
                                                />
                                                <button
                                                    className="btn-remove-faq"
                                                    onClick={() => {
                                                        const newFaqs = [...(analysisData?.faqs || [])];
                                                        newFaqs.splice(index, 1);
                                                        setAnalysisData({ ...analysisData, faqs: newFaqs });
                                                    }}
                                                >
                                                    <X size={14} />
                                                </button>
                                            </div>
                                        ))}
                                        <button
                                            className="btn-add-faq"
                                            onClick={() => {
                                                const newFaqs = [...(analysisData?.faqs || [])];
                                                newFaqs.push("");
                                                setAnalysisData({ ...analysisData, faqs: newFaqs });
                                            }}
                                        >
                                            <Plus size={14} />
                                            Ajouter une question
                                        </button>
                                    </div>
                                </div>

                                {/* COMPLÉMENT D'INFORMATIONS - NOUVELLE SECTION */}
                                <div className="results-card complement-card">
                                    <div className="card-header-row">
                                        <div className="card-title-group">
                                            <PlusCircle size={20} />
                                            <h2>Complément d'informations</h2>
                                        </div>
                                        <span className="optional-badge">Optionnel mais recommandé</span>
                                    </div>

                                    <p className="complement-intro">
                                        Ces informations aideront l'agent à mieux représenter votre entreprise.
                                        Plus vous êtes précis, plus les conversations seront pertinentes.
                                    </p>

                                    <div className="complement-grid">
                                        {/* Avantages concurrentiels */}
                                        <div className="complement-field">
                                            <div className="complement-field-header">
                                                <Trophy size={16} />
                                                <label>Avantages concurrentiels</label>
                                            </div>
                                            <textarea
                                                value={analysisData?.competitiveAdvantages || ""}
                                                onChange={(e) => setAnalysisData({ ...analysisData, competitiveAdvantages: e.target.value })}
                                                placeholder="Ex: Réponse en moins de 2 minutes, intégration en 5 minutes, support français 24/7..."
                                                className="complement-textarea"
                                                rows={2}
                                            />
                                        </div>

                                        {/* Ton de communication */}
                                        <div className="complement-field">
                                            <div className="complement-field-header">
                                                <MessageCircle size={16} />
                                                <label>Ton de communication souhaité</label>
                                            </div>
                                            <div className="tone-options">
                                                {["Professionnel", "Amical", "Expert", "Décontracté"].map((tone) => (
                                                    <button
                                                        key={tone}
                                                        className={`tone-option ${analysisData?.tone === tone ? 'active' : ''}`}
                                                        onClick={() => setAnalysisData({ ...analysisData, tone: tone })}
                                                    >
                                                        {tone}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Ce que l'agent NE doit PAS dire */}
                                        <div className="complement-field warning-field">
                                            <div className="complement-field-header">
                                                <AlertTriangle size={16} />
                                                <label>Ce que l'agent ne doit JAMAIS dire</label>
                                            </div>
                                            <textarea
                                                value={analysisData?.restrictions || ""}
                                                onChange={(e) => setAnalysisData({ ...analysisData, restrictions: e.target.value })}
                                                placeholder="Ex: Ne jamais promettre de remise sans validation, ne pas mentionner le concurrent X, ne pas donner de délais précis..."
                                                className="complement-textarea warning"
                                                rows={2}
                                            />
                                        </div>

                                        {/* Informations de contact */}
                                        <div className="complement-field">
                                            <div className="complement-field-header">
                                                <Phone size={16} />
                                                <label>Coordonnées pour transfert</label>
                                            </div>
                                            <div className="contact-inputs">
                                                <input
                                                    type="email"
                                                    value={analysisData?.contactEmail || ""}
                                                    onChange={(e) => setAnalysisData({ ...analysisData, contactEmail: e.target.value })}
                                                    placeholder="Email commercial"
                                                    className="contact-input"
                                                />
                                                <input
                                                    type="tel"
                                                    value={analysisData?.contactPhone || ""}
                                                    onChange={(e) => setAnalysisData({ ...analysisData, contactPhone: e.target.value })}
                                                    placeholder="Téléphone"
                                                    className="contact-input"
                                                />
                                            </div>
                                        </div>

                                        {/* Horaires */}
                                        <div className="complement-field">
                                            <div className="complement-field-header">
                                                <Clock size={16} />
                                                <label>Horaires d'ouverture</label>
                                            </div>
                                            <input
                                                type="text"
                                                value={analysisData?.businessHours || ""}
                                                onChange={(e) => setAnalysisData({ ...analysisData, businessHours: e.target.value })}
                                                placeholder="Ex: Lun-Ven 9h-18h"
                                                className="complement-input"
                                            />
                                        </div>

                                        {/* URL Calendrier */}
                                        <div className="complement-field">
                                            <div className="complement-field-header">
                                                <Calendar size={16} />
                                                <label>Lien Calendly / prise de RDV</label>
                                            </div>
                                            <input
                                                type="url"
                                                value={analysisData?.calendarUrl || ""}
                                                onChange={(e) => setAnalysisData({ ...analysisData, calendarUrl: e.target.value })}
                                                placeholder="https://calendly.com/votre-lien"
                                                className="complement-input"
                                            />
                                        </div>
                                    </div>

                                    {/* Progress indicator */}
                                    <div className="complement-progress">
                                        <div className="progress-header">
                                            <span>Complétude du profil</span>
                                            <span className="progress-percent">{calculateCompleteness()}%</span>
                                        </div>
                                        <div className="progress-bar-container">
                                            <div
                                                className="progress-bar-fill"
                                                style={{ width: `${calculateCompleteness()}%` }}
                                            />
                                        </div>
                                        <span className="progress-hint">
                                            {calculateCompleteness() < 50 && "Ajoutez plus d'informations pour de meilleurs résultats"}
                                            {calculateCompleteness() >= 50 && calculateCompleteness() < 80 && "Bon début ! Quelques infos supplémentaires aideraient"}
                                            {calculateCompleteness() >= 80 && "Excellent ! Votre agent sera bien configuré"}
                                        </span>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="results-actions">
                                    <button className="btn-secondary" onClick={() => setStep(0)}>
                                        <ArrowLeft size={16} />
                                        Refaire l'analyse
                                    </button>
                                    <button className="btn-primary" onClick={() => setStep(2)}>
                                        Continuer vers la définition ICP
                                        <ArrowRight size={16} />
                                    </button>
                                </div>
                            </div>

                            {/* Sidebar */}
                            <div className="results-sidebar">
                                <div className="sidebar-card highlight">
                                    <div className="sidebar-icon">
                                        <Zap size={20} />
                                    </div>
                                    <h4>Pourquoi éditer ?</h4>
                                    <p>
                                        L'IA fait de son mieux mais vous connaissez votre business.
                                        Corrigez les erreurs pour un agent plus performant.
                                    </p>
                                </div>

                                <div className="sidebar-card">
                                    <div className="sidebar-icon">
                                        <Shield size={20} />
                                    </div>
                                    <h4>Protection garantie</h4>
                                    <p>
                                        L'agent n'utilisera que les informations que vous avez validées.
                                        Aucune invention.
                                    </p>
                                </div>

                                <div className="sidebar-card">
                                    <div className="sidebar-icon">
                                        <Target size={20} />
                                    </div>
                                    <h4>Impact direct</h4>
                                    <p>
                                        Ces données alimentent les scripts de conversation et la logique de qualification.
                                    </p>
                                </div>

                                <div className="sidebar-checklist">
                                    <h4>Checklist avant de continuer</h4>
                                    <div className="checklist-items">
                                        <div className={`checklist-item ${analysisData?.companyName ? 'checked' : ''}`}>
                                            <CheckCircle2 size={16} />
                                            <span>Nom de l'entreprise vérifié</span>
                                        </div>
                                        <div className={`checklist-item ${analysisData?.products?.length > 0 ? 'checked' : ''}`}>
                                            <CheckCircle2 size={16} />
                                            <span>Au moins 1 produit/service</span>
                                        </div>
                                        <div className={`checklist-item ${analysisData?.faqs?.length >= 3 ? 'checked' : ''}`}>
                                            <CheckCircle2 size={16} />
                                            <span>3+ questions fréquentes</span>
                                        </div>
                                        <div className={`checklist-item ${analysisData?.contactEmail || analysisData?.contactPhone ? 'checked' : ''}`}>
                                            <CheckCircle2 size={16} />
                                            <span>Contact de transfert</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* STEP 2: ICP DEFINITION - Enhanced Version */}
                {
                    step === 2 && (
                        <motion.div key="step2" variants={variants} initial="enter" animate="center" exit="exit" className="step-wrapper wide">
                            <div className="icp-layout">
                                {/* Main Content */}
                                <div className="icp-main-content">
                                    <div className="icp-card">
                                        <div className="icp-card-header">
                                            <div>
                                                <h2 className="icp-title">Définition de votre Cible (ICP)</h2>
                                                <p className="icp-subtitle">
                                                    L'IA a analysé votre site et identifié votre client idéal.
                                                    Vérifiez et ajustez ces informations pour optimiser les conversations.
                                                </p>
                                            </div>
                                            <div className="ai-confidence-badge">
                                                <Sparkles size={14} />
                                                <span>Confiance IA : 87%</span>
                                            </div>
                                        </div>

                                        {/* ICP Structured Fields */}
                                        <div className="icp-fields-grid">
                                            {/* Secteur */}
                                            <div className="icp-field-card">
                                                <div className="field-header">
                                                    <div className="field-icon">
                                                        <Building2 size={18} />
                                                    </div>
                                                    <label>Secteur d'activité cible</label>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={formData.icpSector || "PME et ETI - Télécommunications"}
                                                    onChange={(e) => setFormData({ ...formData, icpSector: e.target.value })}
                                                    placeholder="Ex: SaaS B2B, E-commerce, Industrie..."
                                                />
                                            </div>

                                            {/* Taille entreprise */}
                                            <div className="icp-field-card">
                                                <div className="field-header">
                                                    <div className="field-icon">
                                                        <Users size={18} />
                                                    </div>
                                                    <label>Taille d'entreprise</label>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={formData.icpSize || "10-250 employés"}
                                                    onChange={(e) => setFormData({ ...formData, icpSize: e.target.value })}
                                                    placeholder="Ex: 10-50 employés, +500 employés..."
                                                />
                                            </div>

                                            {/* Décideur */}
                                            <div className="icp-field-card">
                                                <div className="field-header">
                                                    <div className="field-icon">
                                                        <UserCircle size={18} />
                                                    </div>
                                                    <label>Décideur type</label>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={formData.icpDecider || "Directeur Commercial, CEO, Head of Sales"}
                                                    onChange={(e) => setFormData({ ...formData, icpDecider: e.target.value })}
                                                    placeholder="Ex: CEO, Directeur Marketing, CTO..."
                                                />
                                            </div>

                                            {/* Budget */}
                                            <div className="icp-field-card">
                                                <div className="field-header">
                                                    <div className="field-icon">
                                                        <Euro size={18} />
                                                    </div>
                                                    <label>Budget moyen</label>
                                                </div>
                                                <input
                                                    type="text"
                                                    value={formData.icpBudget || "500€ - 5 000€ / mois"}
                                                    onChange={(e) => setFormData({ ...formData, icpBudget: e.target.value })}
                                                    placeholder="Ex: 1000-5000€/mois..."
                                                />
                                            </div>
                                        </div>

                                        {/* Pain Points Section */}
                                        <div className="icp-section">
                                            <div className="section-header">
                                                <AlertCircle size={18} />
                                                <h3>Pain Points identifiés</h3>
                                                <span className="section-badge">Éditable</span>
                                            </div>
                                            <div className="pain-points-list">
                                                {(formData.painPoints || []).map((point, index) => (
                                                    <div key={index} className="pain-point-tag">
                                                        <span>{point}</span>
                                                        <button className="remove-tag" onClick={() => {
                                                            const newPoints = [...(formData.painPoints || [])];
                                                            newPoints.splice(index, 1);
                                                            setFormData({ ...formData, painPoints: newPoints });
                                                        }}>
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                                <button className="add-tag-btn">
                                                    <Plus size={14} />
                                                    Ajouter
                                                </button>
                                            </div>
                                        </div>

                                        {/* Besoins Section */}
                                        <div className="icp-section">
                                            <div className="section-header">
                                                <Target size={18} />
                                                <h3>Besoins principaux</h3>
                                            </div>
                                            <div className="needs-list">
                                                {(formData.needs || []).map((need, index) => (
                                                    <div key={index} className="need-item">
                                                        <CheckCircle2 size={16} className="need-check" />
                                                        <input
                                                            type="text"
                                                            value={need}
                                                            onChange={(e) => {
                                                                const newNeeds = [...(formData.needs || [])];
                                                                newNeeds[index] = e.target.value;
                                                                setFormData({ ...formData, needs: newNeeds });
                                                            }}
                                                        />
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Objections Section */}
                                        <div className="icp-section">
                                            <div className="section-header">
                                                <MessageSquareWarning size={18} />
                                                <h3>Objections fréquentes à anticiper</h3>
                                            </div>
                                            <div className="objections-grid">
                                                {(formData.objections || []).map((item, index) => (
                                                    <div key={index} className="objection-card">
                                                        <div className="objection-q">
                                                            <span className="objection-label">Objection</span>
                                                            <p>"{item.objection}"</p>
                                                        </div>
                                                        <div className="objection-a">
                                                            <span className="objection-label">Réponse IA suggérée</span>
                                                            <input
                                                                type="text"
                                                                value={item.response}
                                                                onChange={(e) => {
                                                                    const newObjections = [...(formData.objections || [])];
                                                                    newObjections[index] = { ...newObjections[index], response: e.target.value };
                                                                    setFormData({ ...formData, objections: newObjections });
                                                                }}
                                                            />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="icp-actions">
                                            <button className="btn-secondary" onClick={() => setStep(step - 1)}>
                                                <ArrowLeft size={16} />
                                                Retour
                                            </button>
                                            <button className="btn-primary" onClick={() => setStep(step + 1)}>
                                                Valider et continuer
                                                <ArrowRight size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Sidebar Guide */}
                                <div className="icp-sidebar">
                                    <div className="sidebar-tip-card highlight">
                                        <div className="tip-icon">
                                            <Zap size={18} />
                                        </div>
                                        <h4>Conseil d'expert</h4>
                                        <p>
                                            Plus votre ICP est précis, plus les conversations de l'agent seront pertinentes et convertiront.
                                        </p>
                                    </div>

                                    <div className="sidebar-tip-card">
                                        <div className="tip-icon">
                                            <Shield size={18} />
                                        </div>
                                        <h4>Protection anti-hallucination</h4>
                                        <p>
                                            L'agent ne parlera jamais de fonctionnalités ou prix que vous n'avez pas validés.
                                        </p>
                                    </div>

                                    <div className="sidebar-tip-card">
                                        <div className="tip-icon">
                                            <RefreshCw size={18} />
                                        </div>
                                        <h4>Modifiable à tout moment</h4>
                                        <p>
                                            Vous pourrez ajuster ces paramètres depuis votre dashboard après l'activation.
                                        </p>
                                    </div>

                                    <div className="sidebar-stats">
                                        <div className="stat-item">
                                            <span className="stat-value">+34%</span>
                                            <span className="stat-label">de conversion avec un ICP bien défini</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )
                }

                {/* STEP 3: AGENT SELECTION */}
                {
                    step === 3 && (
                        <motion.div key="step3" variants={variants} initial="enter" animate="center" exit="exit" className="step-wrapper wide">
                            <div className="agent-selection-container">
                                <div className="text-center mb-8">
                                    <div className="inline-block bg-accent-subtle px-3 py-1 rounded-full text-xs font-medium text-accent mb-3">
                                        Recommandations sur mesure
                                    </div>
                                    <h2>Agents IA créés pour {formData.businessType}</h2>
                                    <p className="subtitle max-w-xl mx-auto">
                                        Basé sur votre site web, nous avons conçu des agents adaptés à vos besoins. Explorez-les et choisissez celui qui boostera vos ventes.
                                    </p>
                                </div>

                                <div className="agents-grid">
                                    {agentOptions.map((agent) => (
                                        <div key={agent.id} className="agent-card-detailed">
                                            {agent.premium && (
                                                <div className="premium-badge">
                                                    <Star size={10} fill="currentColor" /> Premium
                                                </div>
                                            )}
                                            <div className="agent-icon-wrapper">
                                                <agent.icon size={24} className="text-accent" />
                                            </div>
                                            <h3 className="agent-title">{agent.title}</h3>
                                            <p className="agent-description">{agent.description}</p>

                                            <div className="agent-section">
                                                <span className="section-label">Cible :</span>
                                                <p className="section-text">{agent.audience}</p>
                                            </div>

                                            <div className="agent-section">
                                                <span className="section-label">Bénéfices clés :</span>
                                                <ul className="benefits-list">
                                                    {agent.benefits.map((benefit, i) => (
                                                        <li key={i}>
                                                            <Check size={12} className="text-accent" />
                                                            {benefit}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>

                                            <div className="agent-example">
                                                <span className="example-label">Exemple :</span>
                                                <p className="example-text">{agent.example}</p>
                                            </div>

                                            <button
                                                className="btn-primary full-width mt-auto"
                                                onClick={() => selectAgent(agent)}
                                                disabled={loading}
                                            >
                                                {loading ? <Loader2 className="animate-spin" size={16} /> : "Sélectionner cet Agent"}
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )
                }

                {/* STEP 3.5: LOADING SCREEN - Building the Agent */}
                {
                    step === 3.5 && (
                        <motion.div key="step3-5" variants={variants} initial="enter" animate="center" exit="exit" className="step-wrapper wide">
                            <div className="loading-screen">
                                <div className="loading-content">
                                    <div className="loading-icon-wrapper">
                                        <Zap size={48} className="loading-icon" />
                                    </div>
                                    <h2 className="loading-title">Building the Agent</h2>
                                    <p className="loading-subtitle">Analyzing your business and creating the perfect AI assistant...</p>
                                    <div className="loading-steps">
                                        <div className="loading-step active">
                                            <div className="step-dot"></div>
                                            <span>Analyzing business context</span>
                                        </div>
                                        <div className="loading-step active">
                                            <div className="step-dot"></div>
                                            <span>Generating conversation flows</span>
                                        </div>
                                        <div className="loading-step">
                                            <div className="step-dot"></div>
                                            <span>Configuring agent personality</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )
                }


                {/* STEP 4: AGENT CONFIGURATION & TEST - Combined Simulation + Identity */}
                {
                    step === 4 && (
                        <motion.div key="step4" variants={variants} initial="enter" animate="center" exit="exit" className="step-wrapper wide">
                            <div className="agent-config-layout">
                                {/* Left Panel: Complete Agent Profile */}
                                <div className="agent-profile-panel">
                                    <div className="profile-header">
                                        <h2>Complete Agent Profile</h2>
                                        <p className="subtitle">Review and customize each section to fine-tune how your agent interacts with customers</p>
                                        <button className="btn-regenerate" onClick={() => generateAgentProfile({ id: formData.selectedAgentId })}>
                                            <RefreshCw size={14} />
                                            Regenerate Profile
                                        </button>
                                    </div>

                                    {formData.agentPersona && (
                                        <div className="profile-content">
                                            {/* Objective and Persona Section */}
                                            <div className="profile-section">
                                                <h3 className="section-title">Objective and Persona</h3>
                                                <div className="section-content">
                                                    <p className="profile-text">
                                                        You are <strong>{formData.agentPersona.role}</strong> at {formData.businessType}, helping customers get the best service.
                                                        With extensive experience in the industry, you've assisted thousands of prospects, specializing in understanding their needs and providing tailored solutions.
                                                    </p>
                                                    <p className="profile-text mt-3">
                                                        Your mission is to guide prospects through a consultative discovery process, uncovering their unique challenges to position {formData.businessType}'s solutions as the ideal fit.
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Primary Goal Section */}
                                            <div className="profile-section">
                                                <h3 className="section-title">Primary Goal</h3>
                                                <div className="section-content">
                                                    <div className="goal-item">
                                                        <strong>Primary Objective:</strong> {formData.agentPersona.goal || "Qualify leads by gathering comprehensive information and assessing fit based on needs, budget, and timeline."}
                                                    </div>
                                                    <div className="goal-item mt-3">
                                                        <strong>Information Gathering:</strong> Collect contact details, understand pain points, assess budget alignment, and determine urgency to qualify leads effectively.
                                                    </div>
                                                    <div className="goal-item mt-3">
                                                        <strong>Qualification Approach:</strong> Assess fit based on specific pain points, budget alignment, and timeline. High-quality leads show clear pain, budget fit, and urgency.
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Conversation Flow Section */}
                                            <div className="profile-section">
                                                <h3 className="section-title">Conversation Flow</h3>
                                                <div className="section-content">
                                                    <div className="flow-step">
                                                        <div className="step-number">1</div>
                                                        <div className="step-content">
                                                            <strong>GREETING & RAPPORT BUILDING:</strong> Introduce yourself warmly, share credibility, and ask an engaging question.
                                                            <div className="example-box mt-2">
                                                                <em>Example:</em><br />
                                                                [Prospect]: Hi, interested in your services.<br />
                                                                [{formData.agentPersona.role}]: {formData.agentPersona.firstMessage || "Hello! How can I assist you today?"}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flow-step">
                                                        <div className="step-number">2</div>
                                                        <div className="step-content">
                                                            <strong>DISCOVERY & NEEDS ASSESSMENT:</strong> Use open-ended questions to uncover current situation and show empathy.
                                                            <div className="example-box mt-2">
                                                                <em>Example:</em><br />
                                                                [Prospect]: Having issues with current provider.<br />
                                                                [{formData.agentPersona.role}]: I understand how frustrating that can be. Tell me more about the specific challenges you're facing?
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flow-step">
                                                        <div className="step-number">3</div>
                                                        <div className="step-content">
                                                            <strong>PAIN POINT EXPLORATION:</strong> Dig deeper to understand impact and urgency.
                                                            <div className="example-box mt-2">
                                                                <em>Example:</em><br />
                                                                [Prospect]: Service is unreliable and expensive.<br />
                                                                [{formData.agentPersona.role}]: That sounds challenging. How much is this affecting your daily operations, and what's your budget for a better solution?
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flow-step">
                                                        <div className="step-number">4</div>
                                                        <div className="step-content">
                                                            <strong>VALUE BUILDING & SOLUTION ALIGNMENT:</strong> Connect their pains to your offering with proof points.
                                                            <div className="example-box mt-2">
                                                                <em>Example:</em><br />
                                                                [{formData.agentPersona.role}]: Many customers in similar situations have found our solution helps reduce costs while improving reliability. Would you like to learn more about how we can help?
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flow-step">
                                                        <div className="step-number">5</div>
                                                        <div className="step-content">
                                                            <strong>QUALIFICATION ASSESSMENT:</strong> Evaluate lead quality based on pain, budget, and timeline.
                                                        </div>
                                                    </div>

                                                    <div className="flow-step">
                                                        <div className="step-number">6</div>
                                                        <div className="step-content">
                                                            <strong>CLOSING & NEXT STEPS:</strong> For qualified leads, gather contact info and schedule follow-up.
                                                            <div className="example-box mt-2">
                                                                <em>Example:</em><br />
                                                                [{formData.agentPersona.role}]: Based on what you've shared, I'd love to connect you with our team. Could you provide your email and phone number so we can send you a personalized quote?
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Right Panel: Agent Preview */}
                                <div className="agent-preview-panel">
                                    <div className="preview-header">
                                        <div className="agent-info">
                                            <div className="agent-avatar">
                                                <Zap size={20} />
                                            </div>
                                            <div>
                                                <h4>{formData.agentPersona?.role || "AI Assistant"}</h4>
                                                <span className="agent-role-subtitle">Inbound Lead Qualification Agent</span>
                                            </div>
                                        </div>
                                        <button className="btn-clear" onClick={() => setSimulation([])}>
                                            <X size={16} />
                                            Clear
                                        </button>
                                    </div>

                                    <div className="preview-body">
                                        {simulation.length === 0 ? (
                                            <div className="preview-empty-state">
                                                <MessageCircle size={48} className="empty-icon" />
                                                <h4>Start a conversation with your agent</h4>
                                                <p>Type a message below to begin testing</p>
                                            </div>
                                        ) : (
                                            <div className="preview-messages">
                                                {simulation.map((msg, i) => (
                                                    <div key={i} className={`preview-message ${msg.sender}`}>
                                                        <div className="message-avatar">
                                                            {msg.sender === 'agent' ? <Zap size={14} /> : <User size={14} />}
                                                        </div>
                                                        <div className="message-bubble">
                                                            {msg.text}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="preview-input">
                                        <input
                                            type="text"
                                            placeholder="Type your test message..."
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && newMessage.trim()) {
                                                    setSimulation([...simulation, { sender: 'lead', text: newMessage }]);
                                                    setNewMessage('');
                                                    // Simulate agent response
                                                    setTimeout(() => {
                                                        setSimulation(prev => [...prev, {
                                                            sender: 'agent',
                                                            text: formData.agentPersona?.firstMessage || "Thank you for your message. How can I assist you today?"
                                                        }]);
                                                    }, 1000);
                                                }
                                            }}
                                        />
                                        <button
                                            className="btn-send"
                                            onClick={() => {
                                                if (newMessage.trim()) {
                                                    setSimulation([...simulation, { sender: 'lead', text: newMessage }]);
                                                    setNewMessage('');
                                                    setTimeout(() => {
                                                        setSimulation(prev => [...prev, {
                                                            sender: 'agent',
                                                            text: formData.agentPersona?.firstMessage || "Thank you for your message. How can I assist you today?"
                                                        }]);
                                                    }, 1000);
                                                }
                                            }}
                                        >
                                            Send
                                        </button>
                                    </div>

                                    <button className="btn-primary full-width mt-4" onClick={() => setStep(5)}>
                                        Continue to Channels
                                        <ArrowRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )
                }

                {/* STEP 5: CHANNELS */}
                {
                    step === 5 && (
                        <motion.div key="step5" variants={variants} initial="enter" animate="center" exit="exit" className="step-wrapper wide">
                            <div className="channel-selection-container">
                                <div className="text-center mb-12">
                                    <div className="inline-block bg-accent-subtle px-3 py-1 rounded-full text-xs font-medium text-accent mb-3">
                                        Channel Selection
                                    </div>
                                    <h2>Choose where to deploy your AI agent</h2>
                                    <p className="subtitle max-w-xl mx-auto">
                                        Select one or more channels to connect with your customers.
                                    </p>
                                </div>

                                <div className="channels-grid">
                                    {[
                                        { id: 'whatsapp', label: 'WhatsApp', desc: 'Engage leads via WhatsApp Business conversations.', icon: MessageCircle, available: true },
                                        { id: 'sms', label: 'SMS', desc: 'Send and receive SMS messages.', icon: Smartphone, available: true },
                                        { id: 'instagram', label: 'Instagram', desc: 'Connect with customers through Instagram Direct Messages.', icon: Instagram, available: false },
                                        { id: 'messenger', label: 'Meta', desc: 'Integrate with Messenger to provide instant support.', icon: Facebook, available: false },
                                        { id: 'email', label: 'Email', desc: 'Automate replies and follow-ups for customer emails.', icon: Mail, available: false },
                                        { id: 'webchat', label: 'Web Chat', desc: 'Add a live chat widget directly to your website.', icon: MessageSquare, available: false },
                                    ].map(channel => (
                                        <div key={channel.id} className={`channel-card ${!channel.available ? 'disabled' : ''}`}>
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="channel-icon-wrapper">
                                                    <channel.icon size={24} />
                                                </div>
                                                {channel.available ? (
                                                    <div
                                                        className={`toggle-switch ${formData.channels[channel.id] ? 'on' : 'off'}`}
                                                        onClick={() => setFormData(prev => ({
                                                            ...prev,
                                                            channels: { ...prev.channels, [channel.id]: !prev.channels[channel.id] }
                                                        }))}
                                                    ></div>
                                                ) : (
                                                    <span className="badge-coming-soon">Bientôt disponible</span>
                                                )}
                                            </div>
                                            <h3 className="channel-title">{channel.label}</h3>
                                            <p className="channel-desc">{channel.desc}</p>
                                        </div>
                                    ))}
                                </div>

                                <div className="channel-footer">
                                    <div className="footer-notes">
                                        <div className="note-item">
                                            <Check size={14} className="text-accent" /> We'll set up the integrations automatically.
                                        </div>
                                        <div className="note-item">
                                            <Check size={14} className="text-accent" /> Your agent will be ready to handle conversations.
                                        </div>
                                    </div>
                                    <div className="footer-actions">
                                        <button className="btn-secondary" onClick={() => setStep(4)}>Back</button>
                                        <button className="btn-primary" onClick={() => setStep(6)}>Continue to Integrations <ArrowRight size={16} /></button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )
                }

                {/* STEP 6: INTEGRATIONS */}
                {
                    step === 6 && (
                        <motion.div key="step6" variants={variants} initial="enter" animate="center" exit="exit" className="step-wrapper wide">
                            <div className="integration-container">
                                {/* Header with title and Launch button on same row */}
                                <div className="integration-header">
                                    <div className="integration-header-left">
                                        <div className="inline-block bg-accent-subtle px-3 py-1 rounded-full text-xs font-medium text-accent mb-2">
                                        Connect CRM
                                    </div>
                                        <h2 className="integration-title">Connect your agent to your CRM</h2>
                                        <p className="integration-subtitle">
                                        Link your CRM to automatically sync leads, conversations, and qualification data.
                                    </p>
                                    </div>
                                    <div className="integration-header-right">
                                        <button className="btn-primary btn-launch" onClick={() => setStep(7)}>
                                            Launch your Agent <ArrowRight size={16} />
                                        </button>
                                    </div>
                                </div>

                                <div className="integrations-grid">
                                    {/* Smart Caller - Connected */}
                                    <div className="integration-card connected">
                                        <div className="card-header">
                                            <div className="integration-card-title">
                                                <div className="integration-icon smart-caller">
                                                    <Rocket size={20} />
                                                </div>
                                                <h3>Smart Caller</h3>
                                            </div>
                                            <div className="status-badge connected">
                                                Connected <Check size={14} />
                                            </div>
                                        </div>
                                        <p className="card-desc">
                                            You already can manage your leads inside Smart Caller. All data is synced automatically.
                                        </p>
                                    </div>

                                    {/* Webhook */}
                                    <div className="integration-card">
                                        <div className="card-header">
                                            <div className="integration-card-title">
                                                <div className="integration-icon webhook">
                                                    <Zap size={20} />
                                                </div>
                                                <h3>Webhook</h3>
                                            </div>
                                            <button className="btn-outline-sm">Connect</button>
                                        </div>
                                        <p className="card-desc">
                                            Send leads to any external service via webhook.
                                        </p>
                                        <div className="webhook-input-wrapper">
                                            <input
                                                type="text"
                                                placeholder="https://your-webhook-url.com/..."
                                                className="webhook-input"
                                                value={formData.webhookUrl || ''}
                                                onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    {/* Other CRMs (Coming Soon) */}
                                    {[
                                        { name: 'HubSpot', icon: 'H' },
                                        { name: 'Salesforce', icon: 'S' },
                                        { name: 'Pipedrive', icon: 'P' },
                                        { name: 'ActiveCampaign', icon: 'A' },
                                        { name: 'Zoho CRM', icon: 'Z' },
                                        { name: 'Microsoft Dynamics', icon: 'M' }
                                    ].map(crm => (
                                        <div key={crm.name} className="integration-card disabled">
                                            <div className="card-header">
                                                <div className="integration-card-title">
                                                    <div className="integration-icon disabled">
                                                        {crm.icon}
                                                    </div>
                                                    <h3 className="text-muted">{crm.name}</h3>
                                                </div>
                                                <button className="btn-outline-sm disabled" disabled>Connect</button>
                                            </div>
                                            <p className="card-desc text-muted">
                                                Integration coming soon.
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div className="integration-footer">
                                    <button className="btn-secondary" onClick={() => setStep(5)}>
                                        <ArrowLeft size={16} /> Back
                                    </button>
                                        <button className="btn-text" onClick={() => window.open('https://smartcaller.ai/contact', '_blank')}>
                                            Lost? Talk to Sales <HelpCircle size={16} />
                                        </button>
                                </div>
                            </div>
                        </motion.div>
                    )
                }

                {/* STEP 7: ACTIVATION (Final) - Full Summary */}
                {
                    step === 7 && (
                        <motion.div key="step7" variants={variants} initial="enter" animate="center" exit="exit" className="step-wrapper wide">
                            <div className="activation-container">
                                {/* Header */}
                                <div className="activation-header">
                                    <div className="activation-header-left">
                                        <div className="activation-icon-wrapper">
                                            <Rocket size={28} />
                                        </div>
                                        <div>
                                            <h1 className="activation-title">Récapitulatif avant lancement</h1>
                                            <p className="activation-subtitle">
                                                Vérifiez les informations de votre agent avant de l'activer.
                                            </p>
                                                </div>
                                            </div>
                                    <button className="btn-primary btn-activate" onClick={() => setStep(8)} disabled={loading}>
                                        {loading ? <><Loader2 className="animate-spin" size={18} /> Activation...</> : <><Rocket size={18} /> Activer l'agent</>}
                                    </button>
                                            </div>

                                <div className="activation-layout">
                                    {/* Main Content */}
                                    <div className="activation-main">
                                        {/* Agent Identity Card */}
                                        <div className="summary-card">
                                            <div className="summary-card-header">
                                                <div className="summary-card-title">
                                                    <UserCircle size={20} />
                                                    <h3>Identité de l'agent</h3>
                                        </div>
                                                <button className="btn-edit" onClick={() => setStep(4)}>
                                                    <Edit2 size={14} /> Modifier
                                            </button>
                                        </div>
                                            <div className="agent-identity-preview">
                                                <div className="agent-avatar-large">
                                                    <Zap size={24} />
                                                </div>
                                                <div className="agent-identity-info">
                                                    <h4>{formData.agentPersona?.role || "Assistant IA"}</h4>
                                                    <p className="agent-goal">{formData.agentPersona?.goal || "Qualifier les leads entrants"}</p>
                                                    <div className="agent-tone-badge">
                                                        <MessageCircle size={12} />
                                                        Ton : {analysisData?.tone || "Professionnel"}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="first-message-preview">
                                                <span className="first-message-label">Premier message :</span>
                                                <p>"{formData.agentPersona?.firstMessage || "Bonjour ! Comment puis-je vous aider aujourd'hui ?"}"</p>
                                            </div>
                                        </div>

                                        {/* Business Info Card */}
                                        <div className="summary-card">
                                            <div className="summary-card-header">
                                                <div className="summary-card-title">
                                                    <Building2 size={20} />
                                                    <h3>Informations entreprise</h3>
                                                </div>
                                                <button className="btn-edit" onClick={() => setStep(1)}>
                                                    <Edit2 size={14} /> Modifier
                                                </button>
                                            </div>
                                            <div className="summary-grid">
                                                <div className="summary-item">
                                                    <span className="summary-label">Entreprise</span>
                                                    <span className="summary-value">{analysisData?.companyName || "Non défini"}</span>
                                                </div>
                                                <div className="summary-item">
                                                    <span className="summary-label">Secteur</span>
                                                    <span className="summary-value">{analysisData?.industry || "Non défini"}</span>
                                                </div>
                                                <div className="summary-item">
                                                    <span className="summary-label">Marché cible</span>
                                                    <span className="summary-value">{analysisData?.targetMarket || "Non défini"}</span>
                                                </div>
                                                <div className="summary-item">
                                                    <span className="summary-label">Langue</span>
                                                    <span className="summary-value">{analysisData?.language || formData.language}</span>
                                                </div>
                                            </div>
                                            <div className="summary-item full-width">
                                                <span className="summary-label">Proposition de valeur</span>
                                                <span className="summary-value">{analysisData?.valueProposition || "Non défini"}</span>
                                            </div>
                                        </div>

                                        {/* ICP Card */}
                                        <div className="summary-card">
                                            <div className="summary-card-header">
                                                <div className="summary-card-title">
                                                    <Target size={20} />
                                                    <h3>Profil client idéal (ICP)</h3>
                                                </div>
                                                <button className="btn-edit" onClick={() => setStep(2)}>
                                                    <Edit2 size={14} /> Modifier
                                                </button>
                                            </div>
                                            <div className="summary-grid">
                                                <div className="summary-item">
                                                    <span className="summary-label">Secteur cible</span>
                                                    <span className="summary-value">{formData.icpSector || "Non défini"}</span>
                                                </div>
                                                <div className="summary-item">
                                                    <span className="summary-label">Taille entreprise</span>
                                                    <span className="summary-value">{formData.icpSize || "Non défini"}</span>
                                                </div>
                                                <div className="summary-item">
                                                    <span className="summary-label">Décideur type</span>
                                                    <span className="summary-value">{formData.icpDecider || "Non défini"}</span>
                                                </div>
                                                <div className="summary-item">
                                                    <span className="summary-label">Budget</span>
                                                    <span className="summary-value">{formData.icpBudget || "Non défini"}</span>
                                                </div>
                                            </div>
                                            {formData.painPoints && formData.painPoints.length > 0 && (
                                                <div className="pain-points-summary">
                                                    <span className="summary-label">Points de douleur identifiés</span>
                                                    <div className="pain-tags">
                                                        {formData.painPoints.slice(0, 3).map((pain, idx) => (
                                                            <span key={idx} className="pain-tag">{pain}</span>
                                                        ))}
                                                        {formData.painPoints.length > 3 && (
                                                            <span className="pain-tag more">+{formData.painPoints.length - 3}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Channels & Integrations */}
                                        <div className="summary-row">
                                            <div className="summary-card half">
                                                <div className="summary-card-header">
                                                    <div className="summary-card-title">
                                                        <MessageSquare size={20} />
                                                        <h3>Canaux actifs</h3>
                                                    </div>
                                                    <button className="btn-edit" onClick={() => setStep(5)}>
                                                        <Edit2 size={14} /> Modifier
                                                    </button>
                                                </div>
                                                <div className="channels-summary">
                                                    {formData.channels?.sms && (
                                                        <div className="channel-badge active">
                                                            <Smartphone size={16} /> SMS
                                                        </div>
                                                    )}
                                                    {formData.channels?.whatsapp && (
                                                        <div className="channel-badge active">
                                                            <MessageCircle size={16} /> WhatsApp
                                                        </div>
                                                    )}
                                                    {formData.channels?.email && (
                                                        <div className="channel-badge active">
                                                            <Mail size={16} /> Email
                                                        </div>
                                                    )}
                                                    {formData.channels?.webchat && (
                                                        <div className="channel-badge active">
                                                            <MessageSquare size={16} /> Webchat
                                                        </div>
                                                    )}
                                                    {!formData.channels?.sms && !formData.channels?.whatsapp && !formData.channels?.email && !formData.channels?.webchat && (
                                                        <span className="text-muted">Aucun canal sélectionné</span>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="summary-card half">
                                                <div className="summary-card-header">
                                                    <div className="summary-card-title">
                                                        <Zap size={20} />
                                                        <h3>Intégrations</h3>
                                                    </div>
                                                    <button className="btn-edit" onClick={() => setStep(6)}>
                                                        <Edit2 size={14} /> Modifier
                                                    </button>
                                                </div>
                                                <div className="integrations-summary">
                                                    <div className="integration-badge connected">
                                                        <Rocket size={14} /> Smart Caller
                                                        <Check size={12} className="check-icon" />
                                                    </div>
                                                    {formData.webhookUrl && (
                                                        <div className="integration-badge connected">
                                                            <Zap size={14} /> Webhook
                                                            <Check size={12} className="check-icon" />
                                                        </div>
                                                    )}
                                                    {formData.crm && formData.crm !== 'none' && (
                                                        <div className="integration-badge connected">
                                                            <Briefcase size={14} /> {formData.crm}
                                                            <Check size={12} className="check-icon" />
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Contact Info */}
                                        {(analysisData?.contactEmail || analysisData?.contactPhone || analysisData?.businessHours) && (
                                            <div className="summary-card">
                                                <div className="summary-card-header">
                                                    <div className="summary-card-title">
                                                        <Phone size={20} />
                                                        <h3>Informations de contact</h3>
                                                    </div>
                                                    <button className="btn-edit" onClick={() => setStep(1)}>
                                                        <Edit2 size={14} /> Modifier
                                                    </button>
                                                </div>
                                                <div className="summary-grid three-cols">
                                                    {analysisData?.contactEmail && (
                                                        <div className="summary-item">
                                                            <span className="summary-label">Email</span>
                                                            <span className="summary-value">{analysisData.contactEmail}</span>
                                                        </div>
                                                    )}
                                                    {analysisData?.contactPhone && (
                                                        <div className="summary-item">
                                                            <span className="summary-label">Téléphone</span>
                                                            <span className="summary-value">{analysisData.contactPhone}</span>
                                                        </div>
                                                    )}
                                                    {analysisData?.businessHours && (
                                                        <div className="summary-item">
                                                            <span className="summary-label">Horaires</span>
                                                            <span className="summary-value">{analysisData.businessHours}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Sidebar */}
                                    <div className="activation-sidebar">
                                        <div className="activation-checklist">
                                            <h4>Checklist de lancement</h4>
                                            <div className="checklist-items">
                                                <div className={`checklist-item ${analysisData?.companyName ? 'checked' : ''}`}>
                                                    <CheckCircle2 size={18} />
                                                    <span>Informations entreprise</span>
                                                </div>
                                                <div className={`checklist-item ${formData.agentPersona?.role ? 'checked' : ''}`}>
                                                    <CheckCircle2 size={18} />
                                                    <span>Agent configuré</span>
                                                </div>
                                                <div className={`checklist-item ${formData.icpSector ? 'checked' : ''}`}>
                                                    <CheckCircle2 size={18} />
                                                    <span>ICP défini</span>
                                                </div>
                                                <div className={`checklist-item ${(formData.channels?.sms || formData.channels?.whatsapp) ? 'checked' : ''}`}>
                                                    <CheckCircle2 size={18} />
                                                    <span>Canaux sélectionnés</span>
                                                </div>
                                                <div className={`checklist-item checked`}>
                                                    <CheckCircle2 size={18} />
                                                    <span>Smart Caller connecté</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="activation-info-card">
                                            <div className="info-card-icon">
                                                <Shield size={20} />
                                            </div>
                                            <h4>Protection garantie</h4>
                                            <p>Votre agent ne dira que ce que vous avez validé. Aucune hallucination, aucune invention.</p>
                                        </div>

                                        <div className="activation-info-card highlight">
                                            <div className="info-card-icon">
                                                <Zap size={20} />
                                            </div>
                                            <h4>Prêt en 30 secondes</h4>
                                            <p>Une fois activé, votre agent sera immédiatement opérationnel pour traiter les leads.</p>
                                        </div>

                                        <div className="activation-help">
                                            <button className="btn-text" onClick={() => window.open('https://smartcaller.ai/contact', '_blank')}>
                                                <HelpCircle size={16} /> Besoin d'aide ?
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Footer */}
                                <div className="activation-footer">
                                    <button className="btn-secondary" onClick={() => setStep(6)}>
                                        <ArrowLeft size={16} /> Retour
                                    </button>
                                    <div className="activation-footer-right">
                                        <button className="btn-text" onClick={finishOnboarding}>
                                            Essayer en mode démo
                                        </button>
                                        <button className="btn-primary btn-activate-large" onClick={() => setStep(8)} disabled={loading}>
                                            {loading ? <><Loader2 className="animate-spin" size={18} /> Activation...</> : <><Rocket size={18} /> Activer mon agent</>}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )
                }

                {/* STEP 8: GET STARTED - Connect or Import */}
                {
                    step === 8 && (
                        <motion.div key="step8" variants={variants} initial="enter" animate="center" exit="exit" className="step-wrapper wide">
                            <div className="getstarted-container">
                                {/* Success Header */}
                                <div className="getstarted-header">
                                    <div className="success-celebration">
                                        <div className="success-icon-large">
                                            <PartyPopper size={32} />
                                        </div>
                                        <div className="confetti-dots">
                                            <span></span><span></span><span></span><span></span><span></span>
                                        </div>
                                    </div>
                                    <h1 className="getstarted-title">Votre agent est prêt ! 🎉</h1>
                                    <p className="getstarted-subtitle">
                                        Choisissez comment vous voulez commencer à utiliser votre agent IA.
                                    </p>
                                </div>

                                {/* Two Options */}
                                <div className="getstarted-options">
                                    {/* Option 1: Webhook Integration */}
                                    <div className="getstarted-card">
                                        <div className="card-icon-wrapper webhook-icon">
                                            <Link2 size={28} />
                                        </div>
                                        <div className="card-badge recommended">Recommandé</div>
                                        <h3>Connecter vos formulaires</h3>
                                        <p className="card-description">
                                            Intégrez Smart Caller à vos formulaires existants via webhook. 
                                            Chaque nouveau lead sera automatiquement contacté.
                                        </p>

                                        <div className="webhook-section">
                                            <label>Votre webhook Smart Caller :</label>
                                            <div className="webhook-url-box">
                                                <code>{webhookUrl}</code>
                                                <button className="btn-copy" onClick={copyWebhook}>
                                                    {webhookCopied ? <Check size={16} /> : <Copy size={16} />}
                                                    {webhookCopied ? 'Copié !' : 'Copier'}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="integration-examples">
                                            <span className="examples-label">Compatible avec :</span>
                                            <div className="examples-logos">
                                                <span className="logo-badge">Typeform</span>
                                                <span className="logo-badge">Webflow</span>
                                                <span className="logo-badge">WordPress</span>
                                                <span className="logo-badge">Zapier</span>
                                                <span className="logo-badge">+50</span>
                                            </div>
                                        </div>

                                        <div className="card-actions">
                                            <button className="btn-primary full-width" onClick={() => {
                                                finishOnboarding();
                                            }}>
                                                <Check size={18} /> C'est configuré, allons-y !
                                            </button>
                                            <a href="https://docs.smartcaller.ai/webhook" target="_blank" rel="noopener noreferrer" className="btn-text-link">
                                                <ExternalLink size={14} /> Voir la documentation
                                            </a>
                                        </div>
                                    </div>

                                    {/* Option 2: CSV Import */}
                                    <div className="getstarted-card">
                                        <div className="card-icon-wrapper csv-icon">
                                            <Upload size={28} />
                                        </div>
                                        <div className="card-badge free">100 leads gratuits</div>
                                        <h3>Tester avec vos leads</h3>
                                        <p className="card-description">
                                            Importez un fichier CSV avec vos leads existants. 
                                            Testez gratuitement sur 100 contacts pour voir la magie opérer.
                                        </p>

                                        <div className="csv-upload-section">
                                            {!csvFile ? (
                                                <label className="csv-dropzone">
                                                    <input 
                                                        type="file" 
                                                        accept=".csv" 
                                                        onChange={handleCsvUpload}
                                                        hidden 
                                                    />
                                                    <div className="dropzone-content">
                                                        <FileText size={32} />
                                                        <span className="dropzone-title">Glissez votre fichier CSV ici</span>
                                                        <span className="dropzone-subtitle">ou cliquez pour parcourir</span>
                                                    </div>
                                                </label>
                                            ) : (
                                                <div className="csv-preview">
                                                    <div className="csv-file-info">
                                                        <FileText size={20} />
                                                        <div>
                                                            <span className="file-name">{csvFile.name}</span>
                                                            <span className="file-rows">{csvPreview?.totalRows || 0} leads détectés</span>
                                                        </div>
                                                        <button className="btn-remove-file" onClick={() => { setCsvFile(null); setCsvPreview(null); }}>
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                    {csvPreview && (
                                                        <div className="csv-table-preview">
                                                            <table>
                                                                <thead>
                                                                    <tr>
                                                                        {csvPreview.headers.slice(0, 4).map((h, i) => (
                                                                            <th key={i}>{h}</th>
                                                                        ))}
                                                                        {csvPreview.headers.length > 4 && <th>...</th>}
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {csvPreview.rows.slice(0, 3).map((row, i) => (
                                                                        <tr key={i}>
                                                                            {row.slice(0, 4).map((cell, j) => (
                                                                                <td key={j}>{cell}</td>
                                                                            ))}
                                                                            {row.length > 4 && <td>...</td>}
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="csv-format-hint">
                                            <Info size={14} />
                                            <span>Colonnes requises : <strong>nom, téléphone</strong> (email optionnel)</span>
                                        </div>

                                        <div className="card-actions">
                                            <button 
                                                className={`btn-primary full-width ${!csvFile ? 'disabled' : ''}`} 
                                                onClick={startWithCsv}
                                                disabled={!csvFile || loading}
                                            >
                                                {loading ? (
                                                    <><Loader2 className="animate-spin" size={18} /> Import en cours...</>
                                                ) : (
                                                    <><Upload size={18} /> Importer et démarrer</>
                                                )}
                                            </button>
                                            <a href="/sample-leads.csv" download className="btn-text-link">
                                                <FileText size={14} /> Télécharger un exemple CSV
                                            </a>
                                        </div>
                                    </div>
                                </div>

                                {/* Skip Option */}
                                <div className="getstarted-footer">
                                    <p className="skip-text">
                                        Vous pouvez aussi configurer cela plus tard depuis le dashboard.
                                    </p>
                                    <button className="btn-text" onClick={() => {
                                        finishOnboarding();
                                    }}>
                                        Passer et aller au dashboard <ArrowRight size={16} />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    )
                }
            </AnimatePresence >
        </div >
    );
};

export default Onboarding;

