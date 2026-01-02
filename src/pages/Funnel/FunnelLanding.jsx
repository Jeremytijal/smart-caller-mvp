import React from 'react';
import { 
    Zap, MessageSquare, Clock, TrendingUp, 
    CheckCircle, ArrowRight, Shield, Users
} from 'lucide-react';

/**
 * PAGE 1 — LANDING META ADS
 * 
 * Objectif : Lancer un diagnostic, pas vendre le produit
 * Focus sur le résultat, pas les features
 */

const FunnelLanding = ({ onStart }) => {
    return (
        <div className="funnel-landing">
            {/* Hero Section */}
            <section className="landing-hero">
                <div className="hero-badge">
                    <Zap size={14} />
                    <span>Qualification IA par SMS</span>
                </div>
                
                <h1 className="hero-headline">
                    Vos leads vous contactent.
                    <span className="highlight"> Smart Caller leur répond instantanément.</span>
                </h1>
                
                <p className="hero-subheadline">
                    Testez comment notre IA qualifie un lead avant même de parler à un commercial.
                </p>

                <button className="cta-primary" onClick={onStart}>
                    Tester Smart Caller sur mon cas
                    <ArrowRight size={20} />
                </button>

                <div className="hero-reassurance">
                    <span><CheckCircle size={14} /> Gratuit</span>
                    <span><Clock size={14} /> 2 min</span>
                    <span><Shield size={14} /> Sans engagement</span>
                </div>
            </section>

            {/* Problem Agitation */}
            <section className="landing-problem">
                <h2>Chaque minute compte.</h2>
                <div className="problem-stats">
                    <div className="stat-card">
                        <span className="stat-number">78%</span>
                        <span className="stat-label">des leads achètent chez le premier à répondre</span>
                    </div>
                    <div className="stat-card warning">
                        <span className="stat-number">5 min</span>
                        <span className="stat-label">délai max pour 10x plus de chances de conversion</span>
                    </div>
                    <div className="stat-card danger">
                        <span className="stat-number">-60%</span>
                        <span className="stat-label">de conversion après 30 min de délai</span>
                    </div>
                </div>
            </section>

            {/* How it works - Simple */}
            <section className="landing-how">
                <h2>Comment ça marche ?</h2>
                <div className="how-steps">
                    <div className="how-step">
                        <div className="step-icon">
                            <MessageSquare size={24} />
                        </div>
                        <h3>1. Le lead vous contacte</h3>
                        <p>Formulaire, publicité, site web...</p>
                    </div>
                    <div className="step-arrow">→</div>
                    <div className="how-step">
                        <div className="step-icon">
                            <Zap size={24} />
                        </div>
                        <h3>2. Smart Caller répond</h3>
                        <p>SMS automatique en moins de 30 secondes</p>
                    </div>
                    <div className="step-arrow">→</div>
                    <div className="how-step">
                        <div className="step-icon">
                            <TrendingUp size={24} />
                        </div>
                        <h3>3. Lead qualifié</h3>
                        <p>L'IA pose les bonnes questions et score le lead</p>
                    </div>
                </div>
            </section>

            {/* Social Proof - Minimal */}
            <section className="landing-proof">
                <div className="proof-logos">
                    <span className="proof-text">Utilisé par des équipes sales B2B</span>
                </div>
                <div className="proof-testimonial">
                    <p>"On a réduit notre délai de réponse de 2h à 30 secondes. Le taux de prise de RDV a explosé."</p>
                    <div className="testimonial-author">
                        <div className="author-avatar">
                            <Users size={16} />
                        </div>
                        <div>
                            <strong>Directeur Commercial</strong>
                            <span>SaaS B2B, 150 leads/mois</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="landing-final-cta">
                <h2>Voyez l'impact sur VOTRE business</h2>
                <p>Répondez à 5 questions et testez l'IA par SMS</p>
                <button className="cta-primary large" onClick={onStart}>
                    Commencer le diagnostic
                    <ArrowRight size={20} />
                </button>
            </section>

            {/* Footer minimal */}
            <footer className="landing-footer">
                <img src="/smart-caller-logo.png" alt="Smart Caller" className="footer-logo" />
                <p>Qualification automatique par SMS</p>
            </footer>
        </div>
    );
};

export default FunnelLanding;





