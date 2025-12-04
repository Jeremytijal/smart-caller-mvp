import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    Zap, MessageSquare, Clock, Target, BarChart3, Users, 
    CheckCircle, ArrowRight, Smartphone, RefreshCw, Calendar,
    Shield, TrendingUp, Play, Star, ChevronRight, Menu, X
} from 'lucide-react';
import './LandingPage.css';

const LandingPage = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const features = [
        {
            icon: <Clock size={28} />,
            title: "Réponse en < 5 minutes",
            description: "Vos leads reçoivent une réponse SMS instantanée, 24h/24. Multipliez vos chances de conversion par 21x."
        },
        {
            icon: <Target size={28} />,
            title: "Qualification automatique",
            description: "Notre IA qualifie chaque lead selon vos critères et score leur potentiel en temps réel."
        },
        {
            icon: <RefreshCw size={28} />,
            title: "Campagnes de réactivation",
            description: "Relancez vos leads dormants avec des séquences SMS personnalisées et automatisées."
        },
        {
            icon: <Calendar size={28} />,
            title: "Prise de RDV automatique",
            description: "L'agent propose directement des créneaux et remplit votre agenda commercial."
        }
    ];

    const stats = [
        { value: "< 5 min", label: "Temps de réponse moyen" },
        { value: "21x", label: "Plus de conversions" },
        { value: "80%", label: "Taux d'ouverture SMS" },
        { value: "24/7", label: "Disponibilité" }
    ];

    const useCases = [
        {
            icon: <Zap />,
            title: "Lead Response",
            subtitle: "Inbound",
            description: "Répondez instantanément à chaque lead entrant par SMS. Qualifiez automatiquement et prenez des RDV.",
            features: ["Réponse < 5 minutes", "Qualification IA", "Scoring automatique", "Sync CRM"],
            color: "orange"
        },
        {
            icon: <RefreshCw />,
            title: "Réactivation",
            subtitle: "Outbound",
            description: "Relancez vos leads dormants et bases de données avec des campagnes SMS personnalisées.",
            features: ["Séquences automatisées", "Personnalisation IA", "A/B Testing", "Nurturing"],
            color: "blue"
        }
    ];

    const testimonials = [
        {
            quote: "En 6 semaines, nous avons signé 3 nouveaux contrats grâce aux RDV générés par Smart Caller.",
            author: "Thomas Bellini",
            role: "Gérant, Assuretbiens",
            avatar: "TB"
        },
        {
            quote: "Smart Caller nous a permis de doubler notre nombre de RDV qualifiés tout en réduisant nos coûts de 60%.",
            author: "Olivier Marcho",
            role: "Responsable commercial, InnovTech",
            avatar: "OM"
        },
        {
            quote: "J'avais testé plusieurs outils avant. Là c'est simple : ils gèrent tout, je reçois les RDV.",
            author: "Michael Johnson",
            role: "CEO, BoostT",
            avatar: "MJ"
        }
    ];

    return (
        <div className="landing-page">
            {/* Navigation */}
            <nav className="landing-nav">
                <div className="nav-container">
                    <Link to="/" className="nav-logo">
                        <div className="logo-icon">
                            <Zap size={20} />
                        </div>
                        <span>Smart Caller</span>
                    </Link>

                    <div className="nav-links desktop-only">
                        <a href="#features">Fonctionnalités</a>
                        <a href="#use-cases">Cas d'usage</a>
                        <a href="#testimonials">Témoignages</a>
                        <a href="#pricing">Tarifs</a>
                    </div>

                    <div className="nav-actions desktop-only">
                        <Link to="/login" className="btn-nav-secondary">Connexion</Link>
                        <Link to="/signup" className="btn-nav-primary">
                            Essai gratuit <ArrowRight size={16} />
                        </Link>
                    </div>

                    <button className="mobile-menu-btn" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="mobile-menu">
                        <a href="#features" onClick={() => setMobileMenuOpen(false)}>Fonctionnalités</a>
                        <a href="#use-cases" onClick={() => setMobileMenuOpen(false)}>Cas d'usage</a>
                        <a href="#testimonials" onClick={() => setMobileMenuOpen(false)}>Témoignages</a>
                        <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>Tarifs</a>
                        <div className="mobile-menu-actions">
                            <Link to="/login" className="btn-nav-secondary">Connexion</Link>
                            <Link to="/signup" className="btn-nav-primary">Essai gratuit</Link>
                        </div>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-container">
                    <div className="hero-badge">
                        <Smartphone size={14} />
                        <span>Agent SMS propulsé par l'IA</span>
                    </div>
                    
                    <h1 className="hero-title">
                        Répondez à vos leads en 
                        <span className="highlight"> moins de 5 minutes</span>
                        <br />et multipliez vos ventes
                    </h1>
                    
                    <p className="hero-subtitle">
                        Smart Caller qualifie vos leads par SMS 24/7 et remplit votre agenda commercial automatiquement. 
                        <strong> +21x de chances de conversion</strong> avec une réponse rapide.
                    </p>

                    <div className="hero-actions">
                        <Link to="/signup" className="btn-hero-primary">
                            <Zap size={20} />
                            Démarrer gratuitement
                        </Link>
                        <a href="#demo" className="btn-hero-secondary">
                            <Play size={18} />
                            Voir la démo
                        </a>
                    </div>

                    <div className="hero-stats">
                        {stats.map((stat, index) => (
                            <div key={index} className="hero-stat">
                                <span className="stat-value">{stat.value}</span>
                                <span className="stat-label">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Hero Visual */}
                <div className="hero-visual">
                    <div className="phone-mockup">
                        <div className="phone-notch"></div>
                        <div className="phone-screen">
                            <div className="sms-conversation">
                                <div className="sms-bubble incoming">
                                    <span className="sms-time">14:32</span>
                                    Bonjour, je suis intéressé par vos services
                                </div>
                                <div className="sms-bubble outgoing">
                                    <span className="sms-time">14:32</span>
                                    Bonjour ! Merci pour votre intérêt 🙂 Je suis Sophie de Smart Caller. Puis-je vous poser quelques questions pour mieux comprendre vos besoins ?
                                </div>
                                <div className="sms-bubble incoming">
                                    <span className="sms-time">14:35</span>
                                    Oui bien sûr
                                </div>
                                <div className="sms-bubble outgoing">
                                    <span className="sms-time">14:35</span>
                                    Parfait ! Quel est votre volume de leads mensuel actuellement ?
                                </div>
                                <div className="typing-indicator">
                                    <span></span><span></span><span></span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="floating-card card-1">
                        <CheckCircle size={16} className="text-success" />
                        <span>Lead qualifié</span>
                    </div>
                    <div className="floating-card card-2">
                        <Clock size={16} className="text-orange" />
                        <span>Réponse en 32s</span>
                    </div>
                    <div className="floating-card card-3">
                        <Calendar size={16} className="text-blue" />
                        <span>RDV planifié</span>
                    </div>
                </div>
            </section>

            {/* Problem Section */}
            <section className="problem-section">
                <div className="section-container">
                    <div className="problem-content">
                        <span className="section-badge red">Le problème</span>
                        <h2>Chaque minute compte quand un lead vous contacte</h2>
                        <div className="problem-stats">
                            <div className="problem-stat">
                                <span className="big-number">78%</span>
                                <p>des leads achètent chez le premier à répondre</p>
                            </div>
                            <div className="problem-stat">
                                <span className="big-number">-80%</span>
                                <p>de chances de conversion après 5 minutes</p>
                            </div>
                        </div>
                        <p className="problem-text">
                            Vos commerciaux ne peuvent pas répondre 24/7. Les leads refroidissent, 
                            partent chez la concurrence, et votre coût d'acquisition explose.
                        </p>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="features-section">
                <div className="section-container">
                    <span className="section-badge">La solution</span>
                    <h2 className="section-title">Un agent SMS qui travaille pour vous 24/7</h2>
                    <p className="section-subtitle">
                        Smart Caller répond, qualifie et convertit vos leads automatiquement par SMS
                    </p>

                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <div key={index} className="feature-card">
                                <div className="feature-icon">{feature.icon}</div>
                                <h3>{feature.title}</h3>
                                <p>{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Use Cases Section */}
            <section id="use-cases" className="usecases-section">
                <div className="section-container">
                    <span className="section-badge">Cas d'usage</span>
                    <h2 className="section-title">2 façons d'utiliser Smart Caller</h2>

                    <div className="usecases-grid">
                        {useCases.map((useCase, index) => (
                            <div key={index} className={`usecase-card ${useCase.color}`}>
                                <div className="usecase-header">
                                    <div className="usecase-icon">{useCase.icon}</div>
                                    <div>
                                        <span className="usecase-subtitle">{useCase.subtitle}</span>
                                        <h3>{useCase.title}</h3>
                                    </div>
                                </div>
                                <p className="usecase-description">{useCase.description}</p>
                                <ul className="usecase-features">
                                    {useCase.features.map((feat, i) => (
                                        <li key={i}>
                                            <CheckCircle size={16} />
                                            {feat}
                                        </li>
                                    ))}
                                </ul>
                                <Link to="/signup" className="usecase-cta">
                                    Essayer gratuitement <ChevronRight size={18} />
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section className="howitworks-section">
                <div className="section-container">
                    <span className="section-badge">Comment ça marche</span>
                    <h2 className="section-title">Configurez votre agent en 5 minutes</h2>

                    <div className="steps-grid">
                        <div className="step-card">
                            <div className="step-number">1</div>
                            <h3>Connectez vos sources</h3>
                            <p>Intégrez Smart Caller à vos formulaires, CRM ou importez un fichier CSV</p>
                        </div>
                        <div className="step-connector"></div>
                        <div className="step-card">
                            <div className="step-number">2</div>
                            <h3>Configurez votre agent</h3>
                            <p>Définissez le ton, les objectifs et les critères de qualification</p>
                        </div>
                        <div className="step-connector"></div>
                        <div className="step-card">
                            <div className="step-number">3</div>
                            <h3>Recevez des RDV</h3>
                            <p>L'IA qualifie et planifie les rendez-vous directement dans votre agenda</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section id="testimonials" className="testimonials-section">
                <div className="section-container">
                    <span className="section-badge">Témoignages</span>
                    <h2 className="section-title">Ils ont boosté leur conversion avec Smart Caller</h2>

                    <div className="testimonials-grid">
                        {testimonials.map((testimonial, index) => (
                            <div key={index} className="testimonial-card">
                                <div className="testimonial-stars">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={16} fill="#FFB800" color="#FFB800" />
                                    ))}
                                </div>
                                <p className="testimonial-quote">"{testimonial.quote}"</p>
                                <div className="testimonial-author">
                                    <div className="author-avatar">{testimonial.avatar}</div>
                                    <div>
                                        <span className="author-name">{testimonial.author}</span>
                                        <span className="author-role">{testimonial.role}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="pricing-section">
                <div className="section-container">
                    <span className="section-badge">Tarifs</span>
                    <h2 className="section-title">Des offres adaptées à votre croissance</h2>
                    <p className="section-subtitle">Commencez gratuitement, évoluez selon vos besoins</p>

                    <div className="pricing-grid">
                        <div className="pricing-card">
                            <h3>Starter</h3>
                            <p className="pricing-desc">Idéal pour démarrer</p>
                            <div className="pricing-price">
                                <span className="price">299€</span>
                                <span className="period">/mois</span>
                            </div>
                            <ul className="pricing-features">
                                <li><CheckCircle size={16} /> Jusqu'à 500 leads/mois</li>
                                <li><CheckCircle size={16} /> Réponse SMS instantanée</li>
                                <li><CheckCircle size={16} /> Qualification IA</li>
                                <li><CheckCircle size={16} /> Dashboard temps réel</li>
                                <li><CheckCircle size={16} /> Support email</li>
                            </ul>
                            <Link to="/signup" className="btn-pricing">Commencer</Link>
                        </div>

                        <div className="pricing-card featured">
                            <div className="pricing-badge">Populaire</div>
                            <h3>Growth</h3>
                            <p className="pricing-desc">Pour scaler votre acquisition</p>
                            <div className="pricing-price">
                                <span className="price">599€</span>
                                <span className="period">/mois</span>
                            </div>
                            <ul className="pricing-features">
                                <li><CheckCircle size={16} /> Jusqu'à 2000 leads/mois</li>
                                <li><CheckCircle size={16} /> Tout Starter +</li>
                                <li><CheckCircle size={16} /> Campagnes de réactivation</li>
                                <li><CheckCircle size={16} /> Intégrations CRM</li>
                                <li><CheckCircle size={16} /> Account manager dédié</li>
                            </ul>
                            <Link to="/signup" className="btn-pricing featured">Commencer</Link>
                        </div>

                        <div className="pricing-card">
                            <h3>Entreprise</h3>
                            <p className="pricing-desc">Pour les gros volumes</p>
                            <div className="pricing-price">
                                <span className="price">Sur mesure</span>
                            </div>
                            <ul className="pricing-features">
                                <li><CheckCircle size={16} /> Leads illimités</li>
                                <li><CheckCircle size={16} /> Tout Growth +</li>
                                <li><CheckCircle size={16} /> API personnalisée</li>
                                <li><CheckCircle size={16} /> SLA garanti</li>
                                <li><CheckCircle size={16} /> Support prioritaire 24/7</li>
                            </ul>
                            <a href="https://calendly.com" target="_blank" rel="noopener noreferrer" className="btn-pricing">
                                Nous contacter
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="section-container">
                    <div className="cta-content">
                        <h2>Prêt à répondre plus vite à vos leads ?</h2>
                        <p>Rejoignez les entreprises qui ont choisi l'IA pour booster leur conversion</p>
                        <div className="cta-actions">
                            <Link to="/signup" className="btn-cta-primary">
                                <Zap size={20} />
                                Démarrer gratuitement
                            </Link>
                            <a href="https://calendly.com" target="_blank" rel="noopener noreferrer" className="btn-cta-secondary">
                                Réserver une démo
                            </a>
                        </div>
                        <p className="cta-note">✨ Essai gratuit • Aucune carte requise • Configuration en 5 min</p>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-container">
                    <div className="footer-brand">
                        <div className="footer-logo">
                            <div className="logo-icon">
                                <Zap size={20} />
                            </div>
                            <span>Smart Caller</span>
                        </div>
                        <p>L'agent IA qui qualifie vos leads par SMS, 24/7.</p>
                    </div>
                    <div className="footer-links">
                        <div className="footer-column">
                            <h4>Produit</h4>
                            <a href="#features">Fonctionnalités</a>
                            <a href="#pricing">Tarifs</a>
                            <a href="#use-cases">Cas d'usage</a>
                        </div>
                        <div className="footer-column">
                            <h4>Ressources</h4>
                            <a href="#">Documentation</a>
                            <a href="#">Blog</a>
                            <a href="#">FAQ</a>
                        </div>
                        <div className="footer-column">
                            <h4>Légal</h4>
                            <a href="#">Mentions légales</a>
                            <a href="#">CGU</a>
                            <a href="#">Confidentialité</a>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>© 2025 Smart Caller. Tous droits réservés.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;

