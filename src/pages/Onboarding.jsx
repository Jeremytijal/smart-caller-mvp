import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, MessageSquare, Sliders, Rocket, User, Zap, Briefcase } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import './Onboarding.css';

const Onboarding = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Step 1: Business Info
    const [businessInfo, setBusinessInfo] = useState({
        companyName: '',
        website: '',
        description: ''
    });

    // Step 2: Templates
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState(null);

    // Step 3: Refine & Preview (Config)
    const [agentConfig, setAgentConfig] = useState({
        name: '',
        role: '',
        company: '',
        tone: 50,
        politeness: 'vous',
        context: '',
        first_message: '',
        criteria: [],
        sms: { sid: '', token: '', phone: '' }
    });

    const handleAnalyze = async () => {
        if (!businessInfo.companyName && !businessInfo.website) return alert("Veuillez entrer au moins un nom d'entreprise ou un site web.");

        setLoading(true);
        try {
            // Call Backend API
            const response = await fetch('https://app-smart-caller-backend-production.up.railway.app/api/generate-templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(businessInfo)
            });

            const data = await response.json();
            if (data.templates) {
                setTemplates(data.templates);
                setStep(2);
            }
        } catch (error) {
            console.error("Error generating templates:", error);
            alert("Erreur lors de la génération. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    const selectTemplate = (template) => {
        setSelectedTemplate(template);
        setAgentConfig({
            ...agentConfig,
            name: template.name,
            role: template.role,
            company: businessInfo.companyName,
            tone: template.tone,
            politeness: template.politeness,
            context: template.context,
            first_message: template.first_message,
            criteria: template.criteria.map((c, i) => ({ id: i, text: c, type: 'must_have' })) // Convert strings to objects
        });
        setStep(3);
    };

    const finishOnboarding = async () => {
        try {
            if (!user) return alert("Utilisateur non connecté.");

            // Transform criteria back to string for storage if needed, or keep as JSONB
            // For now, let's save the structured config
            const configToSave = {
                ...agentConfig,
                quality_criteria: agentConfig.criteria,
                scoring_criteria: agentConfig.criteria.map(c => `- ${c.text}`).join('\n') // Simple text version
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
        }
    };

    const variants = {
        enter: { opacity: 0, x: 20 },
        center: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -20 },
    };

    return (
        <div className="onboarding-container">
            <div className="onboarding-header">
                <div className="logo-area">
                    <Rocket className="text-primary" size={24} />
                    <span className="font-bold text-xl">Smart Caller</span>
                </div>
                <div className="progress-bar">
                    <div className={`progress-step ${step >= 1 ? 'active' : ''}`}>1. Analyse</div>
                    <div className={`progress-line ${step >= 2 ? 'active' : ''}`}></div>
                    <div className={`progress-step ${step >= 2 ? 'active' : ''}`}>2. Sélection</div>
                    <div className={`progress-line ${step >= 3 ? 'active' : ''}`}></div>
                    <div className={`progress-step ${step >= 3 ? 'active' : ''}`}>3. Validation</div>
                </div>
            </div>

            <AnimatePresence mode="wait">
                {/* STEP 1: BUSINESS INFO */}
                {step === 1 && (
                    <motion.div key="step1" variants={variants} initial="enter" animate="center" exit="exit" className="step-wrapper">
                        <div className="center-card glass-panel">
                            <h2>Parlez-nous de votre activité</h2>
                            <p className="subtitle">Notre IA va analyser votre entreprise pour créer l'agent parfait.</p>

                            <div className="form-group">
                                <label>Site Web de l'entreprise</label>
                                <div className="input-with-icon">
                                    <Briefcase size={18} />
                                    <input
                                        type="text"
                                        placeholder="https://mon-entreprise.com"
                                        value={businessInfo.website}
                                        onChange={(e) => setBusinessInfo({ ...businessInfo, website: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Nom de l'entreprise</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Agence Immo 3000"
                                    value={businessInfo.companyName}
                                    onChange={(e) => setBusinessInfo({ ...businessInfo, companyName: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Description courte (Optionnel)</label>
                                <textarea
                                    placeholder="Ex: Nous vendons des appartements de luxe à Paris..."
                                    rows={3}
                                    value={businessInfo.description}
                                    onChange={(e) => setBusinessInfo({ ...businessInfo, description: e.target.value })}
                                />
                            </div>

                            <button className="btn-primary full-width mt-4" onClick={handleAnalyze} disabled={loading}>
                                {loading ? (
                                    <span className="flex items-center gap-2">
                                        <Zap className="animate-pulse" size={18} /> Analyse en cours...
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-2">
                                        <Zap size={18} /> Analyser mon business
                                    </span>
                                )}
                            </button>
                        </div>
                    </motion.div>
                )}

                {/* STEP 2: TEMPLATE SELECTION */}
                {step === 2 && (
                    <motion.div key="step2" variants={variants} initial="enter" animate="center" exit="exit" className="step-wrapper wide">
                        <div className="text-center mb-8">
                            <h2>Choisissez votre Agent</h2>
                            <p className="subtitle">Voici 3 profils optimisés pour {businessInfo.companyName || 'votre activité'}.</p>
                        </div>

                        <div className="templates-grid">
                            {templates.map((t, index) => (
                                <div key={index} className="glass-panel template-card" onClick={() => selectTemplate(t)}>
                                    <div className="template-header">
                                        <div className="avatar-placeholder">{t.name[0]}</div>
                                        <div>
                                            <h3>{t.name}</h3>
                                            <span className="role-badge">{t.role}</span>
                                        </div>
                                    </div>
                                    <div className="template-body">
                                        <p className="context-preview">"{t.context}"</p>
                                        <div className="msg-preview">
                                            <MessageSquare size={14} />
                                            <p>{t.first_message}</p>
                                        </div>
                                        <div className="tags">
                                            <span className="tag">{t.tone > 60 ? 'Offensif' : t.tone < 40 ? 'Doux' : 'Équilibré'}</span>
                                            <span className="tag">{t.politeness === 'tu' ? 'Tutoiement' : 'Vouvoiement'}</span>
                                        </div>
                                    </div>
                                    <button className="btn-secondary full-width mt-4">Choisir {t.name}</button>
                                </div>
                            ))}
                        </div>
                        <button className="btn-text mt-8" onClick={() => setStep(1)}>Retour</button>
                    </motion.div>
                )}

                {/* STEP 3: PREVIEW & CONFIRM */}
                {step === 3 && (
                    <motion.div key="step3" variants={variants} initial="enter" animate="center" exit="exit" className="step-wrapper wide">
                        <div className="preview-layout">
                            <div className="config-column">
                                <h2>Finalisation</h2>
                                <p className="subtitle">Vérifiez les réglages avant de lancer.</p>

                                <div className="glass-panel p-6">
                                    <div className="form-group">
                                        <label>Nom</label>
                                        <input
                                            type="text"
                                            value={agentConfig.name}
                                            onChange={(e) => setAgentConfig({ ...agentConfig, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Premier Message</label>
                                        <textarea
                                            rows={3}
                                            value={agentConfig.first_message}
                                            onChange={(e) => setAgentConfig({ ...agentConfig, first_message: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Critères de qualification</label>
                                        <div className="criteria-tags">
                                            {agentConfig.criteria.map(c => (
                                                <span key={c.id} className="criteria-tag">
                                                    <Check size={12} /> {c.text}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="actions-row mt-6">
                                    <button className="btn-secondary" onClick={() => setStep(2)}>Retour</button>
                                    <button className="btn-primary" onClick={finishOnboarding}>
                                        <Rocket size={18} /> Lancer mon Agent
                                    </button>
                                </div>
                            </div>

                            <div className="phone-column">
                                <div className="iphone-mockup">
                                    <div className="screen">
                                        <div className="chat-header">
                                            <div className="avatar-small">{agentConfig.name[0]}</div>
                                            <span>{agentConfig.name}</span>
                                        </div>
                                        <div className="chat-body">
                                            <div className="message received">
                                                {agentConfig.first_message}
                                            </div>
                                            <div className="message sent">
                                                Oui, je suis intéressé. C'est quoi le prix ?
                                            </div>
                                            <div className="message received typing">
                                                <span>.</span><span>.</span><span>.</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Onboarding;

export default Onboarding;
