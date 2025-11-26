import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Check, MessageSquare, Sliders, Rocket } from 'lucide-react';
import './Onboarding.css';

const Onboarding = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);

    const nextStep = () => setStep(step + 1);
    const finishOnboarding = () => navigate('/');

    const variants = {
        enter: { opacity: 0, x: 50 },
        center: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: -50 },
    };

    return (
        <div className="onboarding-container">
            <div className="onboarding-card glass-panel">
                <div className="steps-indicator">
                    {[1, 2, 3, 4].map((i) => (
                        <div key={i} className={`step-dot ${step >= i ? 'active' : ''}`} />
                    ))}
                </div>

                <AnimatePresence mode="wait">
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
                            <h2>Welcome to Smart Caller</h2>
                            <p>Configurons votre agent de qualification automatisé en quelques minutes.</p>
                            <button className="btn-primary mt-6" onClick={nextStep}>
                                Commencer <ArrowRight size={18} />
                            </button>
                        </motion.div>
                    )}

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
                                <MessageSquare size={48} />
                            </div>
                            <h2>Connecter le fournisseur SMS</h2>
                            <p>Entrez vos identifiants Twilio pour activer les capacités SMS.</p>

                            <div className="form-group">
                                <input type="text" placeholder="Account SID" className="input-field" />
                                <input type="password" placeholder="Auth Token" className="input-field" />
                                <input type="text" placeholder="Numéro de téléphone" className="input-field" />
                            </div>

                            <button className="btn-primary mt-6" onClick={nextStep}>
                                Connecter & Continuer <ArrowRight size={18} />
                            </button>
                            <button className="btn-text" onClick={nextStep}>Passer pour l'instant</button>
                        </motion.div>
                    )}

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
                            <h2>Définir les critères de qualification</h2>
                            <p>Qu'est-ce qui rend un lead qualifié pour votre entreprise ?</p>

                            <div className="criteria-selection">
                                <label className="checkbox-card">
                                    <input type="checkbox" defaultChecked />
                                    <div className="checkbox-content">
                                        <span className="title">Vérification du budget</span>
                                        <span className="desc">Demander leur fourchette budgétaire</span>
                                    </div>
                                </label>
                                <label className="checkbox-card">
                                    <input type="checkbox" defaultChecked />
                                    <div className="checkbox-content">
                                        <span className="title">Calendrier</span>
                                        <span className="desc">Demander quand ils souhaitent commencer</span>
                                    </div>
                                </label>
                                <label className="checkbox-card">
                                    <input type="checkbox" />
                                    <div className="checkbox-content">
                                        <span className="title">Décideur</span>
                                        <span className="desc">Vérifier s'ils peuvent signer le contrat</span>
                                    </div>
                                </label>
                            </div>

                            <button className="btn-primary mt-6" onClick={nextStep}>
                                Enregistrer les critères <ArrowRight size={18} />
                            </button>
                        </motion.div>
                    )}

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
                            <div className="step-icon success">
                                <Check size={48} />
                            </div>
                            <h2>Tout est prêt !</h2>
                            <p>Votre agent IA est prêt à commencer à qualifier des leads.</p>

                            <div className="summary-box">
                                <div className="summary-item">
                                    <Check size={16} className="text-success" /> SMS Connecté
                                </div>
                                <div className="summary-item">
                                    <Check size={16} className="text-success" /> Critères Définis
                                </div>
                                <div className="summary-item">
                                    <Check size={16} className="text-success" /> Tableau de bord prêt
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
