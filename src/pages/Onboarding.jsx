import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, MessageSquare, Rocket, Zap, Globe, Briefcase, Target, Smartphone, CreditCard, ChevronRight, Edit2, Loader2, Play } from 'lucide-react';
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

    // --- API Calls ---

    const analyzeBusiness = async () => {
        if (!formData.website) return alert("Veuillez entrer une URL.");
        setLoading(true);
        setLoadingText("Analyse de votre site web...");
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
        setLoadingText("Génération de la conversation...");
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
        setLoadingText("Création de l'agent...");
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

    // --- UI Variants ---
    const variants = {
        enter: { opacity: 0, x: 20 },
        center: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 },
    };

    return (
        <div className="onboarding-container">
            {/* Header / Progress */}
            <div className="onboarding-header">
                <div className="logo-area">
                    <Rocket className="text-accent" size={24} />
                    <span className="font-bold text-xl text-white">Smart Caller</span>
                </div>
                <div className="progress-bar">
                    {[0, 1, 2, 3, 4, 5, 6, 7].map(s => (
                        <div key={s} className={`progress-dot ${step >= s ? 'active' : ''}`} />
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {/* STEP 0: WELCOME */}
                {step === 0 && (
                    <motion.div key="step0" variants={variants} initial="enter" animate="center" exit="exit" className="step-wrapper">
                        <div className="center-card glass-panel">
                            <h1 className="hero-title">Créez votre Agent IA en <span className="text-accent">60 secondes</span></h1>
                            <p className="subtitle">Votre agent qualifie les leads, détecte l'intention et prend des rendez-vous — automatiquement.</p>

                            <div className="input-group mt-8">
                                <label>Site Web de votre entreprise</label>
                                <div className="input-with-icon">
                                    <Globe size={20} />
                                    <input
                                        type="text"
                                        placeholder="https://votre-site.com"
                                        value={formData.website}
                                        onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                        onKeyDown={(e) => e.key === 'Enter' && analyzeBusiness()}
                                    />
                                </div>
                            </div>

                            <button className="btn-primary full-width mt-6" onClick={analyzeBusiness} disabled={loading}>
                                {loading ? <><Loader2 className="animate-spin" /> {loadingText}</> : "Commencer l'analyse"}
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* STEP 1: BUSINESS SUMMARY */}
                {step === 1 && (
                    <motion.div key="step1" variants={variants} initial="enter" animate="center" exit="exit" className="step-wrapper">
                        <div className="center-card glass-panel">
                            <h2>Analyse terminée ✅</h2>
                            <p className="subtitle">Voici ce que nous avons détecté sur votre activité.</p>

                            <div className="summary-list">
                                <div className="summary-item-card">
                                    <span className="label">Activité</span>
                                    <div className="value-row">
                                        <Briefcase size={16} className="text-accent" />
                                        <input
                                            value={formData.businessType}
                                            onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                                        />
                                        <Edit2 size={14} className="edit-icon" />
                                    </div>
                                </div>
                                <div className="summary-item-card">
                                    <span className="label">Questions fréquentes</span>
                                    {formData.commonQuestions.map((q, i) => (
                                        <div key={i} className="value-row small">
                                            <MessageSquare size={14} className="text-muted" />
                                            <span>{q}</span>
                                        </div>
                                    ))}
                                </div>
                                <div className="summary-item-card">
                                    <span className="label">Critères de qualification</span>
                                    {formData.qualificationCriteria.map((c, i) => (
                                        <div key={i} className="value-row small">
                                            <Check size={14} className="text-success" />
                                            <span>{c}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button className="btn-primary full-width mt-6" onClick={() => setStep(2)}>
                                Continuer <ArrowRight size={18} />
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* STEP 2: GOAL SELECTION */}
                {step === 2 && (
                    <motion.div key="step2" variants={variants} initial="enter" animate="center" exit="exit" className="step-wrapper">
                        <div className="center-card glass-panel">
                            <h2>Quel est votre objectif principal ?</h2>

                            <div className="goals-grid mt-6">
                                <div
                                    className={`goal-card ${formData.goal === 'qualify' ? 'active' : ''}`}
                                    onClick={() => setFormData({ ...formData, goal: 'qualify' })}
                                >
                                    <div className="goal-icon"><Zap size={24} /></div>
                                    <h3>Qualifier les leads entrants</h3>
                                    <p>Filtrer les curieux et identifier les vrais projets.</p>
                                </div>
                                <div
                                    className={`goal-card ${formData.goal === 'book' ? 'active' : ''}`}
                                    onClick={() => setFormData({ ...formData, goal: 'book' })}
                                >
                                    <div className="goal-icon"><Target size={24} /></div>
                                    <h3>Prise de rendez-vous</h3>
                                    <p>Remplir votre agenda automatiquement.</p>
                                </div>
                            </div>

                            <button className="btn-primary full-width mt-8" onClick={generatePreview} disabled={loading}>
                                {loading ? <><Loader2 className="animate-spin" /> {loadingText}</> : "Générer la preview"}
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* STEP 3: CONVERSATION PREVIEW */}
                {step === 3 && (
                    <motion.div key="step3" variants={variants} initial="enter" animate="center" exit="exit" className="step-wrapper wide">
                        <div className="preview-layout">
                            <div className="info-column">
                                <h2>L'Avantage Smart Caller</h2>
                                <p className="subtitle">Voici comment votre agent répondra à votre prochain lead.</p>
                                <div className="feature-list">
                                    <div className="feature-item">
                                        <Zap size={20} className="text-accent" />
                                        <div>
                                            <h4>Réponse Instantanée</h4>
                                            <p>Engage le lead en moins de 10 secondes.</p>
                                        </div>
                                    </div>
                                    <div className="feature-item">
                                        <Check size={20} className="text-accent" />
                                        <div>
                                            <h4>Qualification Naturelle</h4>
                                            <p>Pose les bonnes questions sans être robotique.</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="actions-row mt-8">
                                    <button className="btn-secondary" onClick={generatePreview}>
                                        <Loader2 size={16} /> Régénérer
                                    </button>
                                    <button className="btn-primary" onClick={generatePersona} disabled={loading}>
                                        {loading ? <><Loader2 className="animate-spin" /> {loadingText}</> : <>C'est parfait <ArrowRight size={18} /></>}
                                    </button>
                                </div>
                            </div>

                            <div className="phone-column">
                                <div className="iphone-mockup">
                                    <div className="screen">
                                        <div className="chat-header">
                                            <div className="avatar-small">IA</div>
                                            <span>Assistant {formData.businessType}</span>
                                        </div>
                                        <div className="chat-body scrollable">
                                            {simulation.map((msg, i) => (
                                                <div key={i} className={`message ${msg.sender === 'agent' ? 'received' : 'sent'}`}>
                                                    {msg.text}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <p className="text-center text-xs text-muted mt-4">★ Généré pour {formData.website}</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* STEP 4: AGENT PERSONA */}
                {step === 4 && formData.agentPersona && (
                    <motion.div key="step4" variants={variants} initial="enter" animate="center" exit="exit" className="step-wrapper">
                        <div className="center-card glass-panel">
                            <h2>Personnalité de l'Agent</h2>
                            <p className="subtitle">Optimisé pour être humain, rapide et utile.</p>

                            <div className="persona-card">
                                <div className="persona-header">
                                    <div className="avatar-placeholder">{formData.agentPersona.role[0]}</div>
                                    <div>
                                        <h3>{formData.agentPersona.role}</h3>
                                        <span className="tag">{formData.agentPersona.tone}</span>
                                    </div>
                                </div>
                                <div className="persona-section">
                                    <label>Premier Message</label>
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
                                    <label>Règles de comportement</label>
                                    <ul className="rules-list">
                                        {formData.agentPersona.behaviors.map((b, i) => (
                                            <li key={i}>• {b}</li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            <button className="btn-primary full-width mt-6" onClick={() => setStep(5)}>
                                Enregistrer & Continuer
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* STEP 5: CHANNELS */}
                {step === 5 && (
                    <motion.div key="step5" variants={variants} initial="enter" animate="center" exit="exit" className="step-wrapper">
                        <div className="center-card glass-panel">
                            <h2>Canaux de communication</h2>
                            <p className="subtitle">Où votre agent doit-il intervenir ?</p>

                            <div className="channels-list">
                                <div className="channel-item active">
                                    <div className="channel-info">
                                        <Smartphone size={24} />
                                        <div>
                                            <h3>SMS</h3>
                                            <p>Le canal le plus rapide (98% d'ouverture).</p>
                                        </div>
                                    </div>
                                    <div className="toggle-switch on"></div>
                                </div>
                                <div className="channel-item disabled">
                                    <div className="channel-info">
                                        <MessageSquare size={24} />
                                        <div>
                                            <h3>WhatsApp</h3>
                                            <p>Bientôt disponible.</p>
                                        </div>
                                    </div>
                                    <div className="toggle-switch off"></div>
                                </div>
                            </div>

                            <button className="btn-primary full-width mt-8" onClick={() => setStep(6)}>
                                Continuer
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* STEP 6: CRM */}
                {step === 6 && (
                    <motion.div key="step6" variants={variants} initial="enter" animate="center" exit="exit" className="step-wrapper">
                        <div className="center-card glass-panel">
                            <h2>Connecter votre CRM</h2>
                            <p className="subtitle">Synchronisez les leads qualifiés automatiquement.</p>

                            <div className="crm-grid">
                                {['HubSpot', 'Salesforce', 'Pipedrive'].map(crm => (
                                    <div key={crm} className="crm-card" onClick={() => alert("Intégration bientôt disponible !")}>
                                        <div className="crm-icon">{crm[0]}</div>
                                        <span>{crm}</span>
                                    </div>
                                ))}
                                <div className="crm-card active" onClick={() => setFormData({ ...formData, crm: 'none' })}>
                                    <div className="crm-icon"><Rocket size={16} /></div>
                                    <span>Smart Caller Inbox</span>
                                </div>
                            </div>

                            <button className="btn-primary full-width mt-8" onClick={() => setStep(7)}>
                                Continuer avec Smart Caller Inbox
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* STEP 7: FINAL */}
                {step === 7 && (
                    <motion.div key="step7" variants={variants} initial="enter" animate="center" exit="exit" className="step-wrapper">
                        <div className="center-card glass-panel text-center">
                            <div className="success-icon mb-4">
                                <Rocket size={48} className="text-accent" />
                            </div>
                            <h2>Votre Agent est prêt ! 🚀</h2>
                            <p className="subtitle">Il est configuré pour {formData.businessType} et prêt à qualifier.</p>

                            <div className="final-preview-card">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="avatar-small">IA</div>
                                    <div className="text-left">
                                        <div className="font-bold">{formData.agentPersona?.role}</div>
                                        <div className="text-xs text-success">● Actif sur SMS</div>
                                    </div>
                                </div>
                                <div className="bg-black/30 p-3 rounded text-left text-sm text-muted italic">
                                    "{formData.agentPersona?.firstMessage}"
                                </div>
                            </div>

                            <button className="btn-primary full-width mt-6" onClick={finishOnboarding} disabled={loading}>
                                {loading ? <Loader2 className="animate-spin" /> : "Ajouter un moyen de paiement pour activer"}
                            </button>
                            <button className="btn-text" onClick={finishOnboarding}>
                                Tester gratuitement (Mode Démo)
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Onboarding;

