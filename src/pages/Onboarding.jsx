import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, MessageSquare, Rocket, Zap, Globe, Briefcase, Target, Smartphone, CreditCard, ChevronRight, Edit2, Loader2, Play, User, HelpCircle, Shield, Info } from 'lucide-react';
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
        businessType: '',
        commonQuestions: [],
        qualificationCriteria: [],
        goal: 'qualify', // 'qualify' or 'book'
        agentPersona: null, // { role, goal, firstMessage, behaviors, constraints, tone }
        channels: { sms: true, whatsapp: false, email: false, webchat: false },
        crm: null, // 'hubspot', 'pipedrive', 'salesforce', 'none'
        crmApiKey: ''
    });

    const [simulation, setSimulation] = useState([]);

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
            why: "Votre agent doit se concentrer sur une mission principale pour rester efficace et prévisible.",
            how: "Objectif qualification → questionnement approfondi, validation du contexte. Objectif rendez-vous → messages plus courts, déclencheurs de planification. Le comportement de redirection change selon ce choix.",
            guarantee: [
                "Vous pouvez changer cela à tout moment",
                "Les deux stratégies suivent des standards éprouvés"
            ],
            note: "Définit la stratégie de conversion."
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
        "Analyse", "Résultats", "Objectif", "Simulation", "Identité", "Canaux", "CRM", "Activation"
    ];

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
                commonQuestions: data.commonQuestions,
                qualificationCriteria: data.qualificationCriteria
            }));
            setStep(1);
        } catch (error) {
            console.error("Error analyzing:", error);
            alert("Erreur d'analyse. Réessayez.");
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
            setStep(3);
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
            setStep(4);
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
                    <div className="progress-bar">
                        {[0, 1, 2, 3, 4, 5, 6, 7].map(s => (
                            <div key={s} className={`progress-step ${step === s ? 'active' : step > s ? 'completed' : ''}`} />
                        ))}
                    </div>
                    <Breadcrumbs />
                </div>
            </div>

            <AnimatePresence mode="wait">
                {/* STEP 3: PREVIEW (Special Layout) */}
                {step === 3 ? (
                    <motion.div key="step3" variants={variants} initial="enter" animate="center" exit="exit" className="step-wrapper wide">
                        <div className="preview-layout-integrated">
                            <div className="info-column">
                                <h2>Simulation</h2>
                                <p className="subtitle">Aperçu du comportement de l'agent.</p>

                                {/* Integrated Guide for Preview */}
                                <GuidePanel stepIndex={3} />

                                <div className="actions-row mt-8 flex gap-4">
                                    <button className="btn-secondary" onClick={generatePreview}>
                                        <Loader2 size={16} /> Régénérer
                                    </button>
                                    <button className="btn-primary" onClick={generatePersona} disabled={loading}>
                                        {loading ? <><Loader2 className="animate-spin" size={16} /> {loadingText}</> : "Valider et continuer"}
                                    </button>
                                </div>
                            </div>

                            <div className="chat-preview-container">
                                <div className="chat-header">
                                    <div className="avatar-small">IA</div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">Assistant {formData.businessType}</span>
                                        <span className="text-xs text-muted">En ligne</span>
                                    </div>
                                </div>
                                <div className="chat-body">
                                    {simulation.map((msg, i) => (
                                        <div key={i} className={`message ${msg.sender === 'agent' ? 'received' : 'sent'}`}>
                                            {msg.text}
                                        </div>
                                    ))}
                                </div>
                                <div className="micro-text pb-4">
                                    Généré pour {formData.website} sur la base de l'analyse d'activité.
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    /* ALL OTHER STEPS (Split Layout) */
                    <motion.div key={`step${step}`} variants={variants} initial="enter" animate="center" exit="exit" className="step-wrapper">
                        <div className="step-container-split">
                            <div className="center-card">
                                {/* STEP 0: WELCOME */}
                                {step === 0 && (
                                    <>
                                        <h1 className="hero-title">Configuration de votre assistant</h1>
                                        <p className="subtitle">Analysez votre site web pour générer un agent IA capable de qualifier vos leads.</p>
                                        <div className="input-group mt-8">
                                            <label>Site Web de l'entreprise</label>
                                            <div className="input-with-icon">
                                                <Globe />
                                                <input
                                                    type="text"
                                                    placeholder="exemple.com"
                                                    value={formData.website}
                                                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                                    onKeyDown={(e) => e.key === 'Enter' && analyzeBusiness()}
                                                />
                                            </div>
                                        </div>
                                        <button className="btn-primary full-width mt-6" onClick={analyzeBusiness} disabled={loading}>
                                            {loading ? <><Loader2 className="animate-spin" size={16} /> {loadingText}</> : "Lancer l'analyse"}
                                        </button>
                                    </>
                                )}

                                {/* STEP 1: BUSINESS SUMMARY */}
                                {step === 1 && (
                                    <>
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
                                            Continuer
                                        </button>
                                    </>
                                )}

                                {/* STEP 2: GOAL SELECTION */}
                                {step === 2 && (
                                    <>
                                        <h2>Objectif principal</h2>
                                        <p className="subtitle">Définissez la priorité de votre agent.</p>
                                        <div className="goals-grid">
                                            <div
                                                className={`goal-card ${formData.goal === 'qualify' ? 'active' : ''}`}
                                                onClick={() => setFormData({ ...formData, goal: 'qualify' })}
                                            >
                                                <div className="goal-icon"><Zap size={20} /></div>
                                                <h3>Qualification</h3>
                                                <p>Filtrer les leads et identifier les projets sérieux.</p>
                                            </div>
                                            <div
                                                className={`goal-card ${formData.goal === 'book' ? 'active' : ''}`}
                                                onClick={() => setFormData({ ...formData, goal: 'book' })}
                                            >
                                                <div className="goal-icon"><Target size={20} /></div>
                                                <h3>Rendez-vous</h3>
                                                <p>Maximiser le nombre de créneaux réservés.</p>
                                            </div>
                                        </div>
                                        <button className="btn-primary full-width mt-8" onClick={generatePreview} disabled={loading}>
                                            {loading ? <><Loader2 className="animate-spin" size={16} /> {loadingText}</> : "Générer la simulation"}
                                        </button>
                                    </>
                                )}

                                {/* STEP 4: AGENT PERSONA */}
                                {step === 4 && formData.agentPersona && (
                                    <>
                                        <h2>Identité de l'agent</h2>
                                        <p className="subtitle">Configuration du ton et des directives.</p>
                                        <div className="persona-card">
                                            <div className="persona-header">
                                                <div className="avatar-small"><User size={16} /></div>
                                                <div>
                                                    <h3>{formData.agentPersona.role}</h3>
                                                    <span className="tag">{formData.agentPersona.tone}</span>
                                                </div>
                                            </div>
                                            <div className="persona-section">
                                                <label>Message d'introduction</label>
                                                <textarea
                                                    value={formData.agentPersona.firstMessage}
                                                    onChange={(e) => setFormData({
                                                        ...formData,
                                                        agentPersona: { ...formData.agentPersona, firstMessage: e.target.value }
                                                    })}
                                                    rows={3}
                                                />
                                            </div>
                                            <div className="persona-section">
                                                <label>Directives comportementales</label>
                                                <ul className="rules-list">
                                                    {formData.agentPersona.behaviors.slice(0, 3).map((b, i) => (
                                                        <li key={i}>{b}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                        <button className="btn-primary full-width mt-6" onClick={() => setStep(5)}>
                                            Enregistrer et continuer
                                        </button>
                                    </>
                                )}

                                {/* STEP 5: CHANNELS */}
                                {step === 5 && (
                                    <>
                                        <h2>Canaux actifs</h2>
                                        <p className="subtitle">Sélectionnez les points de contact.</p>
                                        <div className="channels-list">
                                            <div className="channel-item active">
                                                <div className="channel-info">
                                                    <h3>SMS</h3>
                                                    <p>Canal prioritaire (98% d'ouverture).</p>
                                                </div>
                                                <div className="toggle-switch on"></div>
                                            </div>
                                            <div className="channel-item">
                                                <div className="channel-info">
                                                    <h3>WhatsApp</h3>
                                                    <p>Intégration à venir.</p>
                                                </div>
                                                <div className="toggle-switch off"></div>
                                            </div>
                                        </div>
                                        <button className="btn-primary full-width mt-8" onClick={() => setStep(6)}>
                                            Continuer
                                        </button>
                                    </>
                                )}

                                {/* STEP 6: CRM */}
                                {step === 6 && (
                                    <>
                                        <h2>Synchronisation CRM</h2>
                                        <p className="subtitle">Destination des leads qualifiés.</p>
                                        <div className="crm-grid">
                                            {['HubSpot', 'Salesforce', 'Pipedrive'].map(crm => (
                                                <div key={crm} className="crm-card" onClick={() => alert("Intégration bientôt disponible")}>
                                                    <div className="crm-icon">{crm[0]}</div>
                                                    <span>{crm}</span>
                                                </div>
                                            ))}
                                            <div className="crm-card active" onClick={() => setFormData({ ...formData, crm: 'none' })}>
                                                <div className="crm-icon"><Rocket size={16} /></div>
                                                <span>Smart Caller</span>
                                            </div>
                                        </div>
                                        <button className="btn-primary full-width mt-8" onClick={() => setStep(7)}>
                                            Finaliser la configuration
                                        </button>
                                    </>
                                )}

                                {/* STEP 7: FINAL */}
                                {step === 7 && (
                                    <>
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
                                            <button className="btn-primary full-width mt-6" onClick={finishOnboarding} disabled={loading}>
                                                {loading ? <Loader2 className="animate-spin" size={16} /> : "Activer l'agent"}
                                            </button>
                                            <button className="btn-text" onClick={finishOnboarding}>
                                                Essayer en mode démo
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* RIGHT PANEL: CONSULTANT GUIDE */}
                            <GuidePanel stepIndex={step} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Onboarding;

