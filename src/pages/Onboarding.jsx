import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, MessageSquare, Rocket, Zap, Globe, Briefcase, Target, Smartphone, CreditCard, ChevronRight, Edit2, Loader2, Play, User, HelpCircle, Shield, Info, Box, Star, Clock, Calendar, Instagram, Facebook, Mail, MessageCircle, RefreshCw, Send, Sun, Moon, Building2, Users, UserCircle, Euro, AlertCircle, MessageSquareWarning, CheckCircle2, X, Plus, ArrowLeft, Sparkles } from 'lucide-react';
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
        "Analyse", "Résultats", "Définition de l'ICP", "Sélection", "Configuration", "Canaux", "CRM", "Activation"
    ];

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
                            {[0, 1, 2, 3, 4, 5, 6, 7].map(s => (
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

                {/* STEP 1: BUSINESS SUMMARY */}
                {step === 1 && (
                    <motion.div key="step1" variants={variants} initial="enter" animate="center" exit="exit" className="step-wrapper">
                        <div className="step-container-split">
                            <div className="center-card">
                                <h2>Résultats de l'analyse</h2>
                                <p className="subtitle">Vérifiez les informations détectées.</p>
                                <div className="summary-list">
                                    <div className="summary-item-card">
                                        <span className="label">Activité détectée</span>
                                        <div className="value-row">
                                            <Briefcase size={14} className="text-muted" />
                                            <input
                                                value={formData.businessType}
                                                onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="summary-item-card">
                                        <span className="label">Questions fréquentes</span>
                                        {formData.commonQuestions.map((q, i) => (
                                            <div key={i} className="value-row">
                                                <MessageSquare size={14} className="text-muted" />
                                                <span>{q}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="summary-item-card">
                                        <span className="label">Critères de qualification</span>
                                        {formData.qualificationCriteria.map((c, i) => (
                                            <div key={i} className="value-row">
                                                <Check size={14} className="text-success" />
                                                <span>{c}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <button className="btn-primary full-width mt-6" onClick={() => setStep(2)}>
                                    Continuer vers la sélection
                                </button>
                            </div>
                            <GuidePanel stepIndex={1} />
                        </div>
                    </motion.div>
                )}

                {/* STEP 2: ICP DEFINITION - Enhanced Version */}
                {step === 2 && (
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
                )}

                {/* STEP 3: AGENT SELECTION */}
                {step === 3 && (
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
                )}

                {/* STEP 3.5: LOADING SCREEN - Building the Agent */}
                {step === 3.5 && (
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
                )}


                {/* STEP 4: AGENT CONFIGURATION & TEST - Combined Simulation + Identity */}
                {step === 4 && (
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
                )}

                {/* STEP 5: CHANNELS */}
                {step === 5 && (
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
                )}

                {/* STEP 6: INTEGRATIONS */}
                {step === 6 && (
                    <motion.div key="step6" variants={variants} initial="enter" animate="center" exit="exit" className="step-wrapper wide">
                        <div className="integration-container">
                            <div className="text-center mb-12">
                                <div className="inline-block bg-accent-subtle px-3 py-1 rounded-full text-xs font-medium text-accent mb-3">
                                    Connect CRM
                                </div>
                                <h2>Connect your agent to your CRM</h2>
                                <p className="subtitle max-w-xl mx-auto">
                                    Link your CRM to automatically sync leads, conversations, and qualification data.
                                </p>
                            </div>

                            <div className="integrations-grid">
                                {/* Smart Caller - Connected */}
                                <div className="integration-card connected">
                                    <div className="card-header">
                                        <div className="flex items-center gap-3">
                                            <div className="integration-icon smart-caller">
                                                <Rocket size={24} />
                                            </div>
                                            <h3 className="font-bold text-lg">Smart Caller</h3>
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
                                        <div className="flex items-center gap-3">
                                            <div className="integration-icon webhook">
                                                <Zap size={24} />
                                            </div>
                                            <h3 className="font-bold text-lg">Webhook</h3>
                                        </div>
                                        <button className="btn-outline-sm">Connect</button>
                                    </div>
                                    <p className="card-desc mb-4">
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
                                            <div className="flex items-center gap-3">
                                                <div className="integration-icon disabled">
                                                    {crm.icon}
                                                </div>
                                                <h3 className="font-bold text-lg text-muted">{crm.name}</h3>
                                            </div>
                                            <button className="btn-outline-sm disabled" disabled>Connect</button>
                                        </div>
                                        <p className="card-desc text-muted">
                                            Integration coming soon.
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="footer-actions mt-12">
                                <button className="btn-secondary" onClick={() => setStep(5)}>Back</button>
                                <div className="flex gap-4">
                                    <button className="btn-text" onClick={() => window.open('https://smartcaller.ai/contact', '_blank')}>
                                        Lost? Talk to Sales <HelpCircle size={16} />
                                    </button>
                                    <button className="btn-primary" onClick={() => setStep(7)}>
                                        Launch your Agent
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* STEP 7: ACTIVATION (Final) */}
                {step === 7 && (
                    <motion.div key="step7" variants={variants} initial="enter" animate="center" exit="exit" className="step-wrapper">
                        <div className="step-container-split">
                            <div className="center-card">
                                <div className="text-center">
                                    <div className="success-icon flex justify-center">
                                        <Rocket size={40} />
                                    </div>
                                    <h2>Configuration terminée</h2>
                                    <p className="subtitle">Votre agent est prêt à être déployé.</p>
                                    <div className="final-preview-card">
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="avatar-small">IA</div>
                                            <div className="text-left">
                                                <div className="font-bold text-sm">{formData.agentPersona?.role}</div>
                                                <div className="text-xs text-success">● Actif</div>
                                            </div>
                                        </div>
                                        <div className="text-sm text-muted italic">
                                            "{formData.agentPersona?.firstMessage}"
                                        </div>
                                    </div>
                                    <div className="flex gap-3 mt-6">
                                        <button className="btn-secondary" onClick={() => setStep(6)}>Retour</button>
                                        <button className="btn-primary flex-1" onClick={finishOnboarding} disabled={loading}>
                                            {loading ? <Loader2 className="animate-spin" size={16} /> : "Activer l'agent"}
                                        </button>
                                    </div>
                                    <button className="btn-text mt-4" onClick={finishOnboarding}>
                                        Essayer en mode démo
                                    </button>
                                </div>
                            </div>
                            <GuidePanel stepIndex={7} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Onboarding;

