import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    Zap, MessageSquare, Clock, Target, BarChart3, Users, 
    CheckCircle, ArrowRight, Smartphone, RefreshCw, Calendar,
    Shield, TrendingUp, Play, Star, ChevronRight, Menu, X,
    ChevronDown, ExternalLink, Bot, UserCheck, Database,
    Send, Sparkles, Phone, Mail, Globe, Linkedin
} from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [openFaq, setOpenFaq] = useState(null);

    const successCases = [
        { company: "Getaround", metric: "+90%", label: "Réduction des coûts", color: "#10B981" },
        { company: "InnovTech", metric: "2×", label: "RDV qualifiés", color: "#3B82F6" },
        { company: "BoostT", metric: "+150", label: "Leads qualifiés/mois", color: "#8B5CF6" }
    ];

    const features = [
        {
            icon: <Clock size={24} />,
            title: "Réponses < 5 min, 24/7",
            description: "L'IA répond en moins de 5 minutes, garde le contexte et pose uniquement les questions qui font avancer le lead."
        },
        {
            icon: <Database size={24} />,
            title: "Connecté à votre stack",
            description: "Intégration facile avec vos outils. On lit/écrit les champs et déclenche vos workflows automatiquement."
        },
        {
            icon: <Target size={24} />,
            title: "Vos règles, appliquées",
            description: "Définissez ce qui doit être demandé, l'agent collecte les infos par SMS et score le lead selon vos critères."
        },
        {
            icon: <Calendar size={24} />,
            title: "Réservation automatique",
            description: "On propose des créneaux, réserve le RDV, met à jour le CRM, route vers un commercial et trace la source."
        }
    ];

    const faqs = [
        {
            question: "Un commercial peut-il reprendre la conversation ?",
            answer: "Oui, vos commerciaux peuvent reprendre la main instantanément dans le même thread SMS."
        },
        {
            question: "Y a-t-il des limites de volume ?",
            answer: "Non. Nous n'imposons pas de limites strictes sur le volume de conversations."
        },
        {
            question: "Que mettez-vous à jour dans le CRM ?",
            answer: "Tous les champs dont vous avez besoin : statut, propriétaire, source, score de qualification, notes et liens vers la conversation."
        },
        {
            question: "Comment réservez-vous les RDV ?",
            answer: "L'agent partage votre lien calendrier dans la conversation et peut directement intégrer avec votre agenda."
        },
        {
            question: "L'agent demande-t-il les infos manquantes ?",
            answer: "Oui. Il pose les questions requises, comble les lacunes, et ne marque qualifié qu'une fois vos conditions remplies."
        },
        {
            question: "Quelles règles de qualification peut-on définir ?",
            answer: "Toutes vos règles : rôle, région, taille de deal, mots-clés, champs personnalisés, critères de disqualification. On peut aussi produire un score (0-100)."
        }
    ];

    const conversationMessages = [
        { type: 'incoming', text: "Bonjour, je suis intéressé par vos services. Comment ça fonctionne ?" },
        { type: 'outgoing', text: "Bonjour ! Merci pour votre intérêt 🙂 Je suis Sophie de Smart Caller. Pour mieux vous orienter, combien de leads recevez-vous par mois actuellement ?" },
        { type: 'system', text: "Vérification des critères de qualification...", time: "230ms" },
        { type: 'incoming', text: "On gère environ 500 leads par mois." },
        { type: 'outgoing', text: "C'est un bon volume ! Êtes-vous la personne en charge du Marketing ou de la gestion des leads dans votre entreprise ?" },
        { type: 'system', text: "Critères Smart Caller vérifiés", time: "120ms" },
        { type: 'incoming', text: "Oui, je suis Directeur Commercial." },
        { type: 'outgoing', text: "Parfait ! Il semble que Smart Caller pourrait vraiment optimiser votre process. Voulez-vous qu'on planifie une démo de 15 min ?" }
    ];

    return (
        <div className="landing-page patagon-style">
            {/* Navigation */}
            <nav className="landing-nav">
                <div className="nav-container">
                    <Link to="/" className="nav-logo">
                        <div className="logo-icon">
                            <Zap size={18} />
                        </div>
                        <span>Smart Caller</span>
                    </Link>

                    <div className="nav-links desktop-only">
                        <a href="#features">Fonctionnalités</a>
                        <a href="#how-it-works">Comment ça marche</a>
                        <a href="#faq">FAQ</a>
                        <a href="#pricing">Tarifs</a>
                    </div>

                    <div className="nav-actions desktop-only">
                        <Link to="/login" className="btn-nav-text">Connexion</Link>
                        <Link to="/signup" className="btn-nav-primary">
                            Commencer maintenant
                        </Link>
                    </div>

                    <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {mobileMenuOpen && (
                    <div className="mobile-menu">
                        <a href="#features" onClick={() => setMobileMenuOpen(false)}>Fonctionnalités</a>
                        <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)}>Comment ça marche</a>
                        <a href="#faq" onClick={() => setMobileMenuOpen(false)}>FAQ</a>
                        <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>Tarifs</a>
                        <div className="mobile-menu-actions">
                            <Link to="/login">Connexion</Link>
                            <Link to="/signup" className="btn-nav-primary">Commencer</Link>
                        </div>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <span className="hero-eyebrow">Qualification de leads par SMS</span>
                    <h1>Qualifiez chaque lead<br />en quelques secondes</h1>
                    <p className="hero-description">
                        Déployez un agent IA qui qualifie vos leads en temps réel par SMS, 
                        planifie des rendez-vous et met à jour votre CRM automatiquement.
                    </p>
                    
                    <div className="hero-badges">
                        <div className="hero-badge">
                            <UserCheck size={16} />
                            <span>Reprise humaine</span>
                        </div>
                        <div className="hero-badge">
                            <MessageSquare size={16} />
                            <span>SMS → Qualification</span>
                        </div>
                        <div className="hero-badge">
                            <Calendar size={16} />
                            <span>Prise de RDV</span>
                        </div>
                        <div className="hero-badge">
                            <Database size={16} />
                            <span>Sync CRM</span>
                        </div>
                    </div>

                    <div className="hero-actions">
                        <Link to="/signup" className="btn-primary-large">
                            Commencer maintenant
                        </Link>
                        <a href="#demo" className="btn-secondary-large">
                            Réserver une démo
                        </a>
                    </div>
                </div>
            </section>

            {/* Success Cases */}
            <section className="success-section">
                <div className="success-container">
                    {successCases.map((item, index) => (
                        <div key={index} className="success-card">
                            <span className="success-company">{item.company}</span>
                            <span className="success-metric" style={{ color: item.color }}>{item.metric}</span>
                            <span className="success-label">{item.label}</span>
                            <a href="#" className="success-link">Lire l'histoire →</a>
                        </div>
                    ))}
                    <a href="#" className="more-cases-link">Plus de cas clients →</a>
                </div>
            </section>

            {/* Main Value Prop */}
            <section className="value-section">
                <div className="value-container">
                    <div className="value-header">
                        <h2>Pas un autre chatbot.<br />Un agent IA qui qualifie et agit.</h2>
                    </div>

                    <div className="value-grid">
                        <div className="features-list">
                            {features.map((feature, index) => (
                                <div key={index} className="feature-item">
                                    <div className="feature-icon">{feature.icon}</div>
                                    <div className="feature-content">
                                        <h3>{feature.title}</h3>
                                        <p>{feature.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="conversation-preview">
                            <div className="conversation-header">
                                <div className="conversation-title">
                                    <MessageSquare size={16} />
                                    Conversation avec un prospect
                                </div>
                            </div>
                            <div className="conversation-body">
                                {conversationMessages.map((msg, index) => (
                                    msg.type === 'system' ? (
                                        <div key={index} className="system-message">
                                            <Sparkles size={12} />
                                            <span>{msg.text}</span>
                                            <span className="system-time">{msg.time}</span>
                                        </div>
                                    ) : (
                                        <div key={index} className={`chat-bubble ${msg.type}`}>
                                            {msg.text}
                                        </div>
                                    )
                                ))}
                            </div>
                            <div className="conversation-footer">
                                <span className="demo-label">Exemple de conversation simulée</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Comparison */}
            <section className="comparison-section">
                <div className="comparison-container">
                    <div className="comparison-content">
                        <h2>Abandonnez les formulaires, passez au SMS</h2>
                        <p>Les utilisateurs convertissent dans les apps qu'ils utilisent déjà.</p>
                    </div>
                    <div className="comparison-stats">
                        <div className="stat-bar">
                            <div className="stat-bar-label">Formulaire</div>
                            <div className="stat-bar-track">
                                <div className="stat-bar-fill form" style={{ width: '4%' }}></div>
                            </div>
                            <div className="stat-bar-value">0.2%</div>
                        </div>
                        <div className="stat-bar">
                            <div className="stat-bar-label">SMS</div>
                            <div className="stat-bar-track">
                                <div className="stat-bar-fill sms" style={{ width: '98%' }}></div>
                            </div>
                            <div className="stat-bar-value highlight">4.9%</div>
                        </div>
                        <p className="comparison-note">Taux de conversion visiteur → lead qualifié d'après nos résultats.</p>
                    </div>
                </div>
            </section>

            {/* Dashboard Preview */}
            <section className="dashboard-section">
                <div className="dashboard-container">
                    <div className="dashboard-header">
                        <span className="section-eyebrow">Dashboard en temps réel</span>
                        <h2>Voyez d'où viennent vos meilleures conversations</h2>
                        <p>Suivez les conversations, le taux de qualification et de réservation par source, campagne et plus. Identifiez les canaux qui génèrent les leads de meilleure qualité.</p>
                    </div>

                    <div className="dashboard-preview">
                        <div className="dashboard-card">
                            <div className="dashboard-card-header">
                                <h4>Leads qualifiés par source</h4>
                                <span className="badge-live">Live</span>
                            </div>
                            <div className="dashboard-metrics">
                                <div className="metric-row">
                                    <span className="metric-source">Google Ads</span>
                                    <div className="metric-bar-container">
                                        <div className="metric-bar" style={{ width: '85%', background: '#FF470F' }}></div>
                                    </div>
                                    <span className="metric-value">127</span>
                                </div>
                                <div className="metric-row">
                                    <span className="metric-source">Facebook</span>
                                    <div className="metric-bar-container">
                                        <div className="metric-bar" style={{ width: '62%', background: '#3B82F6' }}></div>
                                    </div>
                                    <span className="metric-value">93</span>
                                </div>
                                <div className="metric-row">
                                    <span className="metric-source">LinkedIn</span>
                                    <div className="metric-bar-container">
                                        <div className="metric-bar" style={{ width: '45%', background: '#8B5CF6' }}></div>
                                    </div>
                                    <span className="metric-value">67</span>
                                </div>
                                <div className="metric-row">
                                    <span className="metric-source">Organique</span>
                                    <div className="metric-bar-container">
                                        <div className="metric-bar" style={{ width: '30%', background: '#10B981' }}></div>
                                    </div>
                                    <span className="metric-value">45</span>
                                </div>
                            </div>
                        </div>

                        <div className="dashboard-card">
                            <div className="dashboard-card-header">
                                <h4>Performance temps réel</h4>
                            </div>
                            <div className="kpi-grid">
                                <div className="kpi-item">
                                    <span className="kpi-value">342</span>
                                    <span className="kpi-label">Conversations</span>
                                </div>
                                <div className="kpi-item">
                                    <span className="kpi-value">68%</span>
                                    <span className="kpi-label">Taux qualifié</span>
                                </div>
                                <div className="kpi-item">
                                    <span className="kpi-value">< 3 min</span>
                                    <span className="kpi-label">Temps de réponse</span>
                                </div>
                                <div className="kpi-item">
                                    <span className="kpi-value">89</span>
                                    <span className="kpi-label">RDV réservés</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="dashboard-features">
                        <div className="dashboard-feature">
                            <CheckCircle size={18} />
                            <span>Leads qualifiés et réservations par source/campagne</span>
                        </div>
                        <div className="dashboard-feature">
                            <CheckCircle size={18} />
                            <span>Tendances de qualité et engagement</span>
                        </div>
                        <div className="dashboard-feature">
                            <CheckCircle size={18} />
                            <span>Temps de réponse par source</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Data Section */}
            <section className="data-section">
                <div className="data-container">
                    <div className="data-content">
                        <span className="section-eyebrow">Données structurées</span>
                        <h2>Chaque conversation devient de la donnée exploitable</h2>
                        <p>On capture UTM/referral, réponses aux questions, résultats de qualification et sentiment, puis on écrit des champs propres dans votre CRM.</p>
                        
                        <div className="data-benefits">
                            <div className="data-benefit">
                                <CheckCircle size={18} />
                                <span>Profil complet avec source et score</span>
                            </div>
                            <div className="data-benefit">
                                <CheckCircle size={18} />
                                <span>Follow-ups plus rapides, appels plus intelligents</span>
                            </div>
                            <div className="data-benefit">
                                <CheckCircle size={18} />
                                <span>Moins de trous vs formulaires, meilleurs handoffs</span>
                            </div>
                        </div>
                    </div>

                    <div className="data-visual">
                        <div className="lead-card">
                            <div className="lead-card-header">
                                <div className="lead-avatar">JD</div>
                                <div className="lead-info">
                                    <h4>Jean Dupont</h4>
                                    <span>Directeur Commercial</span>
                                </div>
                                <div className="lead-score">
                                    <span className="score-value">87</span>
                                    <span className="score-label">Score</span>
                                </div>
                            </div>
                            <div className="lead-card-body">
                                <div className="lead-field">
                                    <span className="field-label">Source</span>
                                    <span className="field-value">Google Ads - Campaign Q4</span>
                                </div>
                                <div className="lead-field">
                                    <span className="field-label">Volume leads</span>
                                    <span className="field-value">500/mois</span>
                                </div>
                                <div className="lead-field">
                                    <span className="field-label">Budget</span>
                                    <span className="field-value">2 000€ - 5 000€</span>
                                </div>
                                <div className="lead-field">
                                    <span className="field-label">Statut</span>
                                    <span className="field-value status-qualified">Qualifié</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section id="how-it-works" className="howitworks-section">
                <div className="howitworks-container">
                    <span className="section-eyebrow">Comment ça marche</span>
                    <h2>Opérationnel en 3 étapes</h2>

                    <div className="steps-grid">
                        <div className="step-card">
                            <div className="step-number">01</div>
                            <h3>Connectez Smart Caller</h3>
                            <p>Branchez votre CRM + sources de leads → on trace UTM & referrals dès le premier message.</p>
                        </div>
                        <div className="step-card">
                            <div className="step-number">02</div>
                            <h3>Recevez des leads qualifiés</h3>
                            <p>L'IA qualifie selon vos règles → réserve les RDV et synchronise directement avec votre CRM.</p>
                        </div>
                        <div className="step-card">
                            <div className="step-number">03</div>
                            <h3>Optimisation continue</h3>
                            <p>On envoie les événements lead qualifié + RDV → vos pubs s'optimisent pour le revenu, pas les clics.</p>
                        </div>
                    </div>

                    <div className="howitworks-cta">
                        <Link to="/signup" className="btn-primary-large">Commencer maintenant</Link>
                        <a href="#demo" className="btn-secondary-large">Réserver une démo</a>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="faq-section">
                <div className="faq-container">
                    <span className="section-eyebrow">FAQ</span>
                    <h2>Questions fréquentes</h2>
                    <p className="faq-subtitle">Des questions sur nos services ? Trouvez les réponses ici.</p>

                    <div className="faq-list">
                        {faqs.map((faq, index) => (
                            <div 
                                key={index} 
                                className={`faq-item ${openFaq === index ? 'open' : ''}`}
                                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                            >
                                <div className="faq-question">
                                    <span>{faq.question}</span>
                                    <ChevronDown size={20} className="faq-icon" />
                                </div>
                                {openFaq === index && (
                                    <div className="faq-answer">
                                        {faq.answer}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="faq-contact">
                        <p>Encore des questions ?</p>
                        <a href="#demo" className="btn-text-link">Contactez-nous →</a>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="cta-container">
                    <h2>Transformez vos SMS en canal de vente #1</h2>
                    <div className="cta-actions">
                        <Link to="/signup" className="btn-cta-primary">
                            Commencer maintenant
                        </Link>
                        <a href="#demo" className="btn-cta-secondary">
                            Réserver une démo
                        </a>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-container">
                    <div className="footer-main">
                        <div className="footer-brand">
                            <div className="footer-logo">
                                <div className="logo-icon">
                                    <Zap size={18} />
                                </div>
                                <span>Smart Caller</span>
                            </div>
                            <p>L'agent IA qui qualifie vos leads par SMS, 24/7.</p>
                            <div className="footer-social">
                                <a href="#" aria-label="LinkedIn"><Linkedin size={20} /></a>
                                <a href="#" aria-label="Website"><Globe size={20} /></a>
                                <a href="#" aria-label="Email"><Mail size={20} /></a>
                            </div>
                        </div>

                        <div className="footer-links">
                            <div className="footer-column">
                                <h4>Produit</h4>
                                <a href="#features">Fonctionnalités</a>
                                <a href="#pricing">Tarifs</a>
                                <a href="#how-it-works">Comment ça marche</a>
                            </div>
                            <div className="footer-column">
                                <h4>Ressources</h4>
                                <a href="#">Blog</a>
                                <a href="#">Documentation</a>
                                <a href="#">Calculateur ROI</a>
                            </div>
                            <div className="footer-column">
                                <h4>Entreprise</h4>
                                <a href="#">À propos</a>
                                <a href="#">Contact</a>
                                <a href="#">Carrières</a>
                            </div>
                        </div>
                    </div>

                    <div className="footer-bottom">
                        <p>© 2025 Smart Caller. Tous droits réservés.</p>
                        <div className="footer-legal">
                            <a href="#">Politique de confidentialité</a>
                            <a href="#">CGU</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
