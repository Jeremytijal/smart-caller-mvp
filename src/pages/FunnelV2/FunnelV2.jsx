import React, { useState, useRef } from 'react';
import { 
    Zap, MessageSquare, Calendar, CheckCircle, 
    ArrowRight, ArrowDown, Shield, Clock, TrendingUp,
    Bot, Phone, Users, Star, Building2, Mail
} from 'lucide-react';
import SandboxChat from './SandboxChat';
import ConversationSummary from './ConversationSummary';
import './FunnelV2.css';

/**
 * FUNNEL V2 - ONE PAGE IMMERSIVE
 * 
 * Structure:
 * 1. Hero - Accroche directe
 * 2. Sandbox IA - Conversation live
 * 3. Résumé - Post-conversation
 * 4. CTA Business - Si qualifié + RDV accepté
 */

const FunnelV2 = () => {
    const [phase, setPhase] = useState('hero'); // 'hero' | 'sandbox' | 'summary' | 'form'
    const [conversationData, setConversationData] = useState(null);
    const [formData, setFormData] = useState({
        email: '',
        company: '',
        leadsPerMonth: ''
    });
    const [formSubmitted, setFormSubmitted] = useState(false);
    
    const sandboxRef = useRef(null);

    // Start the sandbox experience
    const handleStartSandbox = () => {
        setPhase('sandbox');
        setTimeout(() => {
            sandboxRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    // Handle conversation end
    const handleConversationEnd = (data) => {
        setConversationData(data);
        setTimeout(() => {
            setPhase('summary');
        }, 500);
    };

    // Handle demo request
    const handleRequestDemo = () => {
        setPhase('form');
    };

    // Handle form submission
    const handleFormSubmit = async (e) => {
        e.preventDefault();
        
        // In real implementation, send to backend/CRM
        console.log('Demo request:', {
            ...formData,
            conversationData,
            source: 'funnel_v2'
        });
        
        setFormSubmitted(true);
        
        // Redirect to Calendly after delay
        setTimeout(() => {
            window.open('https://zcal.co/i/CkMTM7p_', '_blank');
        }, 2000);
    };

    return (
        <div className="funnel-v2">
            {/* ============================================
                SECTION 1 — HERO
            ============================================ */}
            <section className="hero-section">
                <div className="hero-container">
                    {/* Badge */}
                    <div className="hero-badge">
                        <Bot size={14} />
                        <span>Qualification IA par SMS</span>
                    </div>

                    {/* Headline */}
                    <h1 className="hero-headline">
                        Cette IA répond à vos leads,
                        <span className="highlight"> les qualifie</span> et
                        <span className="highlight"> prend rendez-vous</span> pour vous.
                    </h1>

                    {/* Subheadline */}
                    <p className="hero-subheadline">
                        Testez en direct comment Smart Caller gère un lead entrant par SMS.
                        Jouez le rôle du prospect et voyez l'IA qualifier et proposer un RDV.
                    </p>

                    {/* CTA */}
                    <button 
                        className="hero-cta"
                        onClick={handleStartSandbox}
                    >
                        <MessageSquare size={20} />
                        Tester Smart Caller maintenant
                        <ArrowDown size={20} className="bounce" />
                    </button>

                    {/* Trust signals */}
                    <div className="hero-trust">
                        <span><Shield size={14} /> Simulation contrôlée</span>
                        <span><Clock size={14} /> 2 minutes</span>
                        <span><CheckCircle size={14} /> Sans engagement</span>
                    </div>
                </div>

                {/* Features preview */}
                <div className="hero-features">
                    <div className="feature-card">
                        <div className="feature-icon">
                            <Zap size={24} />
                        </div>
                        <h3>Réponse instantanée</h3>
                        <p>Moins de 30 secondes pour contacter vos leads</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">
                            <TrendingUp size={24} />
                        </div>
                        <h3>Qualification IA</h3>
                        <p>L'IA identifie les leads chauds automatiquement</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">
                            <Calendar size={24} />
                        </div>
                        <h3>Prise de RDV</h3>
                        <p>Vos meilleurs leads sont bookés sans effort</p>
                    </div>
                </div>
            </section>

            {/* ============================================
                SECTION 2 — SANDBOX IA
            ============================================ */}
            {(phase === 'sandbox' || phase === 'summary' || phase === 'form') && (
                <section className="sandbox-section" ref={sandboxRef}>
                    <div className="sandbox-container">
                        <div className="sandbox-header">
                            <h2>
                                <MessageSquare size={24} />
                                Sandbox Smart Caller
                            </h2>
                            <p>
                                🎭 Vous jouez le rôle d'un prospect qui contacte une entreprise.
                                L'IA va vous qualifier et, si pertinent, proposer un rendez-vous.
                            </p>
                        </div>

                        {/* Chat Interface */}
                        {phase === 'sandbox' && (
                            <SandboxChat onConversationEnd={handleConversationEnd} />
                        )}

                        {/* Conversation Summary */}
                        {phase === 'summary' && conversationData && (
                            <ConversationSummary 
                                data={conversationData}
                                onRequestDemo={handleRequestDemo}
                            />
                        )}

                        {/* Demo Request Form */}
                        {phase === 'form' && (
                            <div className="demo-form-container">
                                {!formSubmitted ? (
                                    <>
                                        <div className="form-header">
                                            <Zap size={32} />
                                            <h2>Smart Caller sur vos vrais leads</h2>
                                            <p>
                                                Vous avez vu comment l'IA qualifie et prend des RDV.
                                                Voyons maintenant sur VOS leads.
                                            </p>
                                        </div>

                                        <form onSubmit={handleFormSubmit} className="demo-form">
                                            <div className="form-group">
                                                <label>
                                                    <Mail size={16} />
                                                    Email professionnel
                                                </label>
                                                <input
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                                    placeholder="vous@entreprise.com"
                                                    required
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label>
                                                    <Building2 size={16} />
                                                    Nom de l'entreprise
                                                </label>
                                                <input
                                                    type="text"
                                                    value={formData.company}
                                                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                                                    placeholder="Votre entreprise"
                                                    required
                                                />
                                            </div>

                                            <div className="form-group">
                                                <label>
                                                    <Users size={16} />
                                                    Leads entrants / mois
                                                </label>
                                                <select
                                                    value={formData.leadsPerMonth}
                                                    onChange={(e) => setFormData({...formData, leadsPerMonth: e.target.value})}
                                                    required
                                                >
                                                    <option value="">Sélectionnez</option>
                                                    <option value="<50">Moins de 50</option>
                                                    <option value="50-200">50 à 200</option>
                                                    <option value="200-500">200 à 500</option>
                                                    <option value="500+">Plus de 500</option>
                                                </select>
                                            </div>

                                            <button type="submit" className="form-submit">
                                                <Calendar size={18} />
                                                Réserver ma démo (15 min)
                                                <ArrowRight size={18} />
                                            </button>

                                            <p className="form-disclaimer">
                                                Démo personnalisée de 15 minutes. On analyse votre cas ensemble.
                                            </p>
                                        </form>
                                    </>
                                ) : (
                                    <div className="form-success">
                                        <div className="success-icon">
                                            <CheckCircle size={48} />
                                        </div>
                                        <h2>Parfait !</h2>
                                        <p>Vous allez être redirigé vers notre calendrier pour choisir un créneau.</p>
                                        <div className="success-loader"></div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </section>
            )}

            {/* ============================================
                SOCIAL PROOF (Always visible)
            ============================================ */}
            <section className="proof-section">
                <div className="proof-container">
                    <h3>Utilisé par des équipes sales B2B</h3>
                    <div className="proof-stats">
                        <div className="stat">
                            <span className="stat-number">30s</span>
                            <span className="stat-label">Temps de réponse moyen</span>
                        </div>
                        <div className="stat">
                            <span className="stat-number">+45%</span>
                            <span className="stat-label">Taux de conversion</span>
                        </div>
                        <div className="stat">
                            <span className="stat-number">24/7</span>
                            <span className="stat-label">Disponibilité</span>
                        </div>
                    </div>
                    <div className="proof-testimonial">
                        <p>
                            "On a automatisé 80% de nos qualifications. 
                            Nos commerciaux ne parlent plus qu'à des leads chauds."
                        </p>
                        <div className="testimonial-author">
                            <Star size={16} />
                            <span>Directeur Commercial, SaaS B2B</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* ============================================
                FOOTER
            ============================================ */}
            <footer className="funnel-footer">
                <img src="/smart-caller-logo.png" alt="Smart Caller" />
                <p>Qualification automatique par SMS</p>
                <div className="footer-links">
                    <a href="/terms">CGU</a>
                    <span>•</span>
                    <a href="/privacy">Confidentialité</a>
                </div>
            </footer>
        </div>
    );
};

export default FunnelV2;

