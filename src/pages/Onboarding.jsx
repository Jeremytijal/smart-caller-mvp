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
    const [agentConfig, setAgentConfig] = useState({
        name: '',
        role: '',
        company: '',
        tone: 50,
        politeness: 'vous',
        context: '',
        sms: { sid: '', token: '', phone: '' },
        criteria: { budget: true, timeline: true, decision: false }
    });

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    const finishOnboarding = async () => {
        try {
            if (!user) {
                console.error("No user found");
                return;
            }

            const { error } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    agent_config: agentConfig,
                    updated_at: new Date(),
                });

            if (error) throw error;
            navigate('/');
        } catch (error) {
            console.error('Error saving onboarding data:', error);
            alert('Erreur lors de la sauvegarde. Veuillez réessayer.');
        }
    };

    const getToneLabel = (value) => {
        if (value < 30) return "Empathique & Conseiller";
        if (value < 70) return "Professionnel & Équilibré";
        return "Offensif & Persuasif";
    };

    const variants = {
        enter: { opacity: 0, x: 50 },
        center: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -50 },
    };

    return (
        <div className="onboarding-container">
            <div className="onboarding-card glass-panel">
                <div className="steps-indicator">
                    {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                        <div key={i} className={`step-dot ${step >= i ? 'active' : ''}`} />
                    ))}
                </div>

                <AnimatePresence mode="wait">
                    {/* STEP 1: WELCOME */}
                    {step === 1 && (
                        <motion.div
                            key="step1"
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.3 }}
                            className="step-content"
                        >
                            <div className="step-icon">
                                <Rocket size={48} />
                            </div>
                            <h2>Bienvenue sur Smart Caller</h2>
                            <p>Configurons votre agent de qualification automatisé en quelques minutes.</p>
                            <button className="btn-primary mt-6" onClick={nextStep}>
                                Commencer <ArrowRight size={18} />
                            </button>
                        </motion.div>
                    )}

                    {/* STEP 2: IDENTITY */}
                    {step === 2 && (
                        <motion.div
                            key="step2"
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.3 }}
                            className="step-content"
                        >
                            <div className="step-icon">
                                <User size={48} />
                            </div>
                            <h2>Identité de l'Agent</h2>
                            <p>Qui est votre agent ? Donnez-lui un nom et un rôle.</p>

                            <div className="form-group">
                                <label>Nom de l'agent</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Thomas"
                                    className="input-field"
                                    value={agentConfig.name}
                                    onChange={(e) => setAgentConfig({ ...agentConfig, name: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Rôle / Poste</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Expert Produit"
                                    className="input-field"
                                    value={agentConfig.role}
                                    onChange={(e) => setAgentConfig({ ...agentConfig, role: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label>Entreprise</label>
                                <input
                                    type="text"
                                    placeholder="Ex: Ma Société"
                                    className="input-field"
                                    value={agentConfig.company}
                                    onChange={(e) => setAgentConfig({ ...agentConfig, company: e.target.value })}
                                />
                            </div>

                            <div className="step-actions">
                                <button className="btn-secondary" onClick={prevStep}>Retour</button>
                                <button className="btn-primary" onClick={nextStep}>
                                    Suivant <ArrowRight size={18} />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 3: BEHAVIOR */}
                    {step === 3 && (
                        <motion.div
                            key="step3"
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.3 }}
                            className="step-content"
                        >
                            <div className="step-icon">
                                <Sliders size={48} />
                            </div>
                            <h2>Comportement</h2>
                            <p>Comment votre agent doit-il s'exprimer ?</p>

                            <div className="form-group">
                                <label>Ton : {getToneLabel(agentConfig.tone)}</label>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={agentConfig.tone}
                                    onChange={(e) => setAgentConfig({ ...agentConfig, tone: parseInt(e.target.value) })}
                                    className="range-slider"
                                />
                                <div className="tone-labels">
                                    <span>Douceur</span>
                                    <span>Vente Hard</span>
                                </div>
                            </div>

                            <div className="form-group">
                                <label>Niveau de familiarité</label>
                                <div className="toggle-group">
                                    <button
                                        onClick={() => setAgentConfig({ ...agentConfig, politeness: 'vous' })}
                                        className={`toggle-btn ${agentConfig.politeness === 'vous' ? 'active' : ''}`}
                                    >
                                        Vouvoiement
                                    </button>
                                    <button
                                        onClick={() => setAgentConfig({ ...agentConfig, politeness: 'tu' })}
                                        className={`toggle-btn ${agentConfig.politeness === 'tu' ? 'active' : ''}`}
                                    >
                                        Tutoiement
                                    </button>
                                </div>
                            </div>

                            <div className="step-actions">
                                <button className="btn-secondary" onClick={prevStep}>Retour</button>
                                <button className="btn-primary" onClick={nextStep}>
                                    Suivant <ArrowRight size={18} />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 4: CONTEXT */}
                    {step === 4 && (
                        <motion.div
                            key="step4"
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.3 }}
                            className="step-content"
                        >
                            <div className="step-icon">
                                <Zap size={48} />
                            </div>
                            <h2>Mission & Contexte</h2>
                            <p>Expliquez à l'agent ce qu'il vend.</p>

                            <div className="form-group">
                                <label>Pitch du produit / Contexte</label>
                                <textarea
                                    rows={6}
                                    className="input-field textarea-field"
                                    placeholder="Ex: Nous aidons les agences immobilières à automatiser la prise de rendez-vous..."
                                    value={agentConfig.context}
                                    onChange={(e) => setAgentConfig({ ...agentConfig, context: e.target.value })}
                                />
                            </div>

                            <div className="step-actions">
                                <button className="btn-secondary" onClick={prevStep}>Retour</button>
                                <button className="btn-primary" onClick={nextStep}>
                                    Suivant <ArrowRight size={18} />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 5: SMS */}
                    {step === 5 && (
                        <motion.div
                            key="step5"
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.3 }}
                            className="step-content"
                        >
                            <div className="step-icon">
                                <MessageSquare size={48} />
                            </div>
                            <h2>Connecter le fournisseur SMS</h2>
                            <p>Entrez vos identifiants Twilio pour activer les capacités SMS.</p>

                            <div className="form-group">
                                <input type="text" placeholder="Account SID" className="input-field" />
                                <input type="password" placeholder="Auth Token" className="input-field" />
                                <input type="text" placeholder="Numéro de téléphone" className="input-field" />
                            </div>

                            <div className="step-actions">
                                <button className="btn-secondary" onClick={prevStep}>Retour</button>
                                <button className="btn-primary" onClick={nextStep}>
                                    Connecter & Continuer <ArrowRight size={18} />
                                </button>
                            </div>
                            <button className="btn-text" onClick={nextStep}>Passer pour l'instant</button>
                        </motion.div>
                    )}

                    {/* STEP 6: CRITERIA */}
                    {step === 6 && (
                        <motion.div
                            key="step6"
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.3 }}
                            className="step-content"
                        >
                            <div className="step-icon">
                                <Briefcase size={48} />
                            </div>
                            <h2>Définir les critères de qualification</h2>
                            <p>Qu'est-ce qui rend un lead qualifié pour votre entreprise ?</p>

                            <div className="criteria-selection">
                                <label className="checkbox-card">
                                    <input
                                        type="checkbox"
                                        checked={agentConfig.criteria.budget}
                                        onChange={(e) => setAgentConfig({ ...agentConfig, criteria: { ...agentConfig.criteria, budget: e.target.checked } })}
                                    />
                                    <div className="checkbox-content">
                                        <span className="title">Vérification du budget</span>
                                        <span className="desc">Demander leur fourchette budgétaire</span>
                                    </div>
                                </label>
                                <label className="checkbox-card">
                                    <input
                                        type="checkbox"
                                        checked={agentConfig.criteria.timeline}
                                        onChange={(e) => setAgentConfig({ ...agentConfig, criteria: { ...agentConfig.criteria, timeline: e.target.checked } })}
                                    />
                                    <div className="checkbox-content">
                                        <span className="title">Calendrier</span>
                                        <span className="desc">Demander quand ils souhaitent commencer</span>
                                    </div>
                                </label>
                                <label className="checkbox-card">
                                    <input
                                        type="checkbox"
                                        checked={agentConfig.criteria.decision}
                                        onChange={(e) => setAgentConfig({ ...agentConfig, criteria: { ...agentConfig.criteria, decision: e.target.checked } })}
                                    />
                                    <div className="checkbox-content">
                                        <span className="title">Décideur</span>
                                        <span className="desc">Vérifier s'ils peuvent signer le contrat</span>
                                    </div>
                                </label>
                            </div>

                            <div className="step-actions">
                                <button className="btn-secondary" onClick={prevStep}>Retour</button>
                                <button className="btn-primary" onClick={nextStep}>
                                    Enregistrer les critères <ArrowRight size={18} />
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* STEP 7: SUCCESS */}
                    {step === 7 && (
                        <motion.div
                            key="step7"
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{ duration: 0.3 }}
                            className="step-content"
                        >
                            <div className="step-icon success">
                                <Check size={48} />
                            </div>
                            <h2>Tout est prêt !</h2>
                            <p>Votre agent <strong>{agentConfig.name}</strong> est configuré et prêt à travailler.</p>

                            <div className="summary-box">
                                <div className="summary-item">
                                    <Check size={16} className="text-success" /> Identité configurée
                                </div>
                                <div className="summary-item">
                                    <Check size={16} className="text-success" /> Mission définie
                                </div>
                                <div className="summary-item">
                                    <Check size={16} className="text-success" /> SMS Connecté
                                </div>
                            </div>

                            <button className="btn-primary mt-6" onClick={finishOnboarding}>
                                Aller au tableau de bord <ArrowRight size={18} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Onboarding;
