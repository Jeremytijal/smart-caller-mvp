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
                            <h2>Welcome to AI SMS Agent</h2>
                            <p>Let's get your automated qualification agent set up in just a few minutes.</p>
                            <button className="btn-primary mt-6" onClick={nextStep}>
                                Get Started <ArrowRight size={18} />
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
                            <h2>Connect SMS Provider</h2>
                            <p>Enter your Twilio credentials to enable SMS capabilities.</p>

                            <div className="form-group">
                                <input type="text" placeholder="Account SID" className="input-field" />
                                <input type="password" placeholder="Auth Token" className="input-field" />
                                <input type="text" placeholder="Phone Number" className="input-field" />
                            </div>

                            <button className="btn-primary mt-6" onClick={nextStep}>
                                Connect & Continue <ArrowRight size={18} />
                            </button>
                            <button className="btn-text" onClick={nextStep}>Skip for now</button>
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
                            <h2>Define Qualification Criteria</h2>
                            <p>What makes a lead qualified for your business?</p>

                            <div className="criteria-selection">
                                <label className="checkbox-card">
                                    <input type="checkbox" defaultChecked />
                                    <div className="checkbox-content">
                                        <span className="title">Budget Check</span>
                                        <span className="desc">Ask about their budget range</span>
                                    </div>
                                </label>
                                <label className="checkbox-card">
                                    <input type="checkbox" defaultChecked />
                                    <div className="checkbox-content">
                                        <span className="title">Timeline</span>
                                        <span className="desc">Ask when they want to start</span>
                                    </div>
                                </label>
                                <label className="checkbox-card">
                                    <input type="checkbox" />
                                    <div className="checkbox-content">
                                        <span className="title">Decision Maker</span>
                                        <span className="desc">Verify they can sign the contract</span>
                                    </div>
                                </label>
                            </div>

                            <button className="btn-primary mt-6" onClick={nextStep}>
                                Save Criteria <ArrowRight size={18} />
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
                            <h2>You're All Set!</h2>
                            <p>Your AI agent is ready to start qualifying leads.</p>

                            <div className="summary-box">
                                <div className="summary-item">
                                    <Check size={16} className="text-success" /> SMS Connected
                                </div>
                                <div className="summary-item">
                                    <Check size={16} className="text-success" /> Criteria Defined
                                </div>
                                <div className="summary-item">
                                    <Check size={16} className="text-success" /> Dashboard Ready
                                </div>
                            </div>

                            <button className="btn-primary mt-6" onClick={finishOnboarding}>
                                Go to Dashboard <ArrowRight size={18} />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default Onboarding;
