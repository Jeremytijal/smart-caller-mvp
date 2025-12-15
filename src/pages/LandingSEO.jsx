import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
    Zap, FileText, Clock, Target, BarChart3, Users, 
    CheckCircle, ArrowRight, Globe, RefreshCw, Calendar,
    Shield, TrendingUp, Play, Star, ChevronRight, Menu, X,
    ChevronDown, ExternalLink, Bot, Sparkles, Search,
    Send, PenTool, Layers, Upload, Check, Layout,
    Linkedin, Mail
} from 'lucide-react';
import { CALENDLY_URL } from '../config';
import './LandingSEO.css';

const LandingSEO = () => {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [openFaq, setOpenFaq] = useState(null);

    const successCases = [
        { company: "E-Commerce", metric: "+340%", label: "Trafic organique", color: "#10B981" },
        { company: "SaaS B2B", metric: "50+", label: "Articles/mois", color: "#3B82F6" },
        { company: "Agence", metric: "x8", label: "Productivité SEO", color: "#8B5CF6" }
    ];

    const features = [
        {
            icon: <Search size={24} />,
            title: "Recherche de mots-clés IA",
            description: "L'IA analyse votre niche, trouve les opportunités de mots-clés et crée un plan de contenu optimisé pour le ranking."
        },
        {
            icon: <PenTool size={24} />,
            title: "Rédaction SEO automatique",
            description: "Articles optimisés pour Google avec structure Hn, meta descriptions, liens internes et balisage schema automatique."
        },
        {
            icon: <Calendar size={24} />,
            title: "Planification intelligente",
            description: "Planifiez vos publications sur des semaines. L'IA suggère les meilleurs moments et maintient un calendrier éditorial."
        },
        {
            icon: <Upload size={24} />,
            title: "Publication automatique",
            description: "Publiez directement sur WordPress, Webflow, Framer ou Wix. Aucune intervention manuelle requise."
        }
    ];

    const cmsIntegrations = [
        { name: 'WordPress', logo: '🔵', popular: true },
        { name: 'Webflow', logo: '⚡' },
        { name: 'Framer', logo: '🎨' },
        { name: 'Wix', logo: '🌐' }
    ];

    const faqs = [
        {
            question: "Les articles sont-ils détectables comme IA ?",
            answer: "Non, notre IA produit du contenu unique et naturel qui passe tous les détecteurs. Chaque article est optimisé pour la lisibilité humaine."
        },
        {
            question: "Puis-je modifier les articles avant publication ?",
            answer: "Oui, vous avez un éditeur complet pour réviser, modifier ou approuver chaque article avant sa publication automatique."
        },
        {
            question: "Combien d'articles puis-je générer par mois ?",
            answer: "Selon votre plan : 30 articles/mois (Starter), 100 articles/mois (Growth), illimité (Scale)."
        },
        {
            question: "L'IA comprend-elle mon secteur d'activité ?",
            answer: "Oui, l'IA s'adapte à votre niche. Elle analyse votre site, vos concurrents et produit du contenu expert dans votre domaine."
        },
        {
            question: "Comment fonctionne la publication automatique ?",
            answer: "Connectez votre CMS une fois, planifiez vos articles, et l'IA publie automatiquement aux dates choisies avec images et formatage."
        },
        {
            question: "Puis-je cibler plusieurs langues ?",
            answer: "Oui, l'IA génère du contenu SEO optimisé en français, anglais, espagnol, allemand et 10+ autres langues."
        }
    ];

    return (
        <div className="landing-page seo-style">
            {/* Navigation */}
            <nav className="landing-nav">
                <div className="nav-container">
                    <Link to="/" className="nav-logo">
                        <div className="logo-icon seo">
                            <PenTool size={18} />
                        </div>
                        <span>SEO Writer AI</span>
                    </Link>

                    <div className="nav-links desktop-only">
                        <a href="#features">Fonctionnalités</a>
                        <a href="#how-it-works">Comment ça marche</a>
                        <a href="#cms">Intégrations</a>
                        <a href="#pricing">Tarifs</a>
                    </div>

                    <div className="nav-actions desktop-only">
                        <Link to="/login" className="btn-nav-text">Connexion</Link>
                        <Link to="/signup" className="btn-nav-primary">
                            Essai gratuit
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
                        <a href="#cms" onClick={() => setMobileMenuOpen(false)}>Intégrations</a>
                        <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>Tarifs</a>
                        <div className="mobile-menu-actions">
                            <Link to="/login">Connexion</Link>
                            <Link to="/signup" className="btn-nav-primary">Essai gratuit</Link>
                        </div>
                    </div>
                )}
            </nav>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <span className="hero-eyebrow">🚀 Agent IA SEO pour WordPress</span>
                    <h1>Le meilleur Agent IA SEO<br />pour WordPress</h1>
                    <p className="hero-description">
                        Générez des articles SEO optimisés, planifiez votre calendrier éditorial 
                        et publiez automatiquement sur votre CMS. 100% automatisé.
                    </p>
                    
                    <div className="hero-badges">
                        <div className="hero-badge">
                            <Search size={16} />
                            <span>Recherche mots-clés</span>
                        </div>
                        <div className="hero-badge">
                            <PenTool size={16} />
                            <span>Rédaction IA</span>
                        </div>
                        <div className="hero-badge">
                            <Calendar size={16} />
                            <span>Planification auto</span>
                        </div>
                        <div className="hero-badge">
                            <Upload size={16} />
                            <span>Publication CMS</span>
                        </div>
                    </div>

                    <div className="hero-actions">
                        <Link to="/signup" className="btn-primary-large">
                            Commencer gratuitement
                        </Link>
                        <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" className="btn-secondary-large">
                            Voir une démo
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
                        </div>
                    ))}
                </div>
            </section>

            {/* Main Value Prop */}
            <section id="features" className="value-section">
                <div className="value-container">
                    <div className="value-header">
                        <span className="section-eyebrow">Fonctionnalités</span>
                        <h2>Votre équipe SEO,<br />100% automatisée</h2>
                    </div>

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

            {/* Screenshot Section 1 - Planner Dashboard */}
            <section className="screenshot-section">
                <div className="screenshot-container">
                    <div className="screenshot-content">
                        <span className="section-eyebrow">Planification</span>
                        <h2>Votre calendrier éditorial intelligent</h2>
                        <p>Visualisez, planifiez et organisez tous vos articles à venir. L'IA suggère les meilleurs créneaux de publication pour maximiser votre impact SEO.</p>
                        
                        <div className="feature-list">
                            <div className="feature-check">
                                <CheckCircle size={18} />
                                <span>Vue calendrier semaine/mois</span>
                            </div>
                            <div className="feature-check">
                                <CheckCircle size={18} />
                                <span>Drag & drop pour réorganiser</span>
                            </div>
                            <div className="feature-check">
                                <CheckCircle size={18} />
                                <span>Suggestions IA de timing optimal</span>
                            </div>
                        </div>
                    </div>
                    <div className="screenshot-visual">
                        <div className="screenshot-placeholder planner">
                            <div className="placeholder-header">
                                <span>📅 Calendrier éditorial</span>
                                <div className="placeholder-tabs">
                                    <span className="active">Semaine</span>
                                    <span>Mois</span>
                                </div>
                            </div>
                            <div className="calendar-preview">
                                <div className="calendar-day">
                                    <span className="day-label">Lun 16</span>
                                    <div className="calendar-item green">Guide SEO 2025</div>
                                </div>
                                <div className="calendar-day">
                                    <span className="day-label">Mar 17</span>
                                    <div className="calendar-item blue">WordPress Tips</div>
                                </div>
                                <div className="calendar-day">
                                    <span className="day-label">Mer 18</span>
                                    <div className="calendar-item empty">+ Ajouter</div>
                                </div>
                                <div className="calendar-day">
                                    <span className="day-label">Jeu 19</span>
                                    <div className="calendar-item purple">Mots-clés longue traîne</div>
                                </div>
                                <div className="calendar-day">
                                    <span className="day-label">Ven 20</span>
                                    <div className="calendar-item orange">Optimisation images</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Screenshot Section 2 - Dashboard Analytics */}
            <section className="screenshot-section reverse">
                <div className="screenshot-container">
                    <div className="screenshot-visual">
                        <div className="screenshot-placeholder dashboard">
                            <div className="placeholder-header">
                                <span>📊 Dashboard</span>
                                <span className="live-badge">Live</span>
                            </div>
                            <div className="stats-grid">
                                <div className="stat-box">
                                    <span className="stat-number">47</span>
                                    <span className="stat-label">Articles ce mois</span>
                                </div>
                                <div className="stat-box">
                                    <span className="stat-number">+234%</span>
                                    <span className="stat-label">Trafic organique</span>
                                </div>
                                <div className="stat-box">
                                    <span className="stat-number">156</span>
                                    <span className="stat-label">Mots-clés rankés</span>
                                </div>
                                <div className="stat-box">
                                    <span className="stat-number">12</span>
                                    <span className="stat-label">Top 3 Google</span>
                                </div>
                            </div>
                            <div className="chart-placeholder">
                                <div className="chart-bar" style={{height: '40%'}}></div>
                                <div className="chart-bar" style={{height: '55%'}}></div>
                                <div className="chart-bar" style={{height: '45%'}}></div>
                                <div className="chart-bar" style={{height: '70%'}}></div>
                                <div className="chart-bar" style={{height: '85%'}}></div>
                                <div className="chart-bar" style={{height: '90%'}}></div>
                                <div className="chart-bar active" style={{height: '100%'}}></div>
                            </div>
                        </div>
                    </div>
                    <div className="screenshot-content">
                        <span className="section-eyebrow">Analytics</span>
                        <h2>Suivez vos performances SEO en temps réel</h2>
                        <p>Dashboard complet avec métriques clés : articles publiés, trafic organique, mots-clés positionnés et positions Google.</p>
                        
                        <div className="feature-list">
                            <div className="feature-check">
                                <CheckCircle size={18} />
                                <span>Métriques SEO en temps réel</span>
                            </div>
                            <div className="feature-check">
                                <CheckCircle size={18} />
                                <span>Suivi des positions Google</span>
                            </div>
                            <div className="feature-check">
                                <CheckCircle size={18} />
                                <span>Évolution du trafic organique</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Screenshot Section 3 - Article Creation */}
            <section className="screenshot-section">
                <div className="screenshot-container">
                    <div className="screenshot-content">
                        <span className="section-eyebrow">Création d'article</span>
                        <h2>Rédigez des articles SEO en 1 clic</h2>
                        <p>Entrez votre mot-clé, l'IA génère un article complet : titre optimisé, structure Hn, paragraphes, meta description et suggestions d'images.</p>
                        
                        <div className="feature-list">
                            <div className="feature-check">
                                <CheckCircle size={18} />
                                <span>Structure SEO automatique (H1, H2, H3)</span>
                            </div>
                            <div className="feature-check">
                                <CheckCircle size={18} />
                                <span>Meta title & description optimisés</span>
                            </div>
                            <div className="feature-check">
                                <CheckCircle size={18} />
                                <span>Suggestions de liens internes</span>
                            </div>
                            <div className="feature-check">
                                <CheckCircle size={18} />
                                <span>Images et alt-text inclus</span>
                            </div>
                        </div>
                    </div>
                    <div className="screenshot-visual">
                        <div className="screenshot-placeholder editor">
                            <div className="placeholder-header">
                                <span>✏️ Éditeur d'article</span>
                                <div className="editor-actions">
                                    <span className="btn-small">Prévisualiser</span>
                                    <span className="btn-small primary">Publier</span>
                                </div>
                            </div>
                            <div className="editor-preview">
                                <div className="editor-meta">
                                    <span className="meta-label">Mot-clé cible:</span>
                                    <span className="meta-value">optimisation seo wordpress</span>
                                </div>
                                <div className="editor-title">
                                    <span className="tag">H1</span>
                                    Guide complet : Optimisation SEO WordPress en 2025
                                </div>
                                <div className="editor-content">
                                    <div className="content-line"></div>
                                    <div className="content-line short"></div>
                                    <div className="editor-h2">
                                        <span className="tag">H2</span>
                                        Pourquoi le SEO est crucial pour WordPress
                                    </div>
                                    <div className="content-line"></div>
                                    <div className="content-line"></div>
                                    <div className="content-line short"></div>
                                </div>
                                <div className="seo-score">
                                    <div className="score-circle">92</div>
                                    <span>Score SEO</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CMS Integration Section */}
            <section id="cms" className="cms-section">
                <div className="cms-container">
                    <div className="cms-header">
                        <span className="section-eyebrow">Publication automatique</span>
                        <h2>Publiez directement sur votre CMS</h2>
                        <p>Connectez votre site une fois, publiez automatiquement pour toujours. Aucune copie manuelle requise.</p>
                    </div>

                    <div className="cms-grid">
                        {cmsIntegrations.map((cms, index) => (
                            <div key={index} className={`cms-card ${cms.popular ? 'popular' : ''}`}>
                                {cms.popular && <span className="cms-badge">Populaire</span>}
                                <div className="cms-logo">{cms.logo}</div>
                                <h4>{cms.name}</h4>
                                <div className="cms-features">
                                    <span><Check size={14} /> Publication auto</span>
                                    <span><Check size={14} /> Images incluses</span>
                                    <span><Check size={14} /> Formatage conservé</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="cms-workflow">
                        <div className="workflow-step">
                            <div className="workflow-icon">
                                <PenTool size={24} />
                            </div>
                            <span>L'IA rédige</span>
                        </div>
                        <div className="workflow-arrow">→</div>
                        <div className="workflow-step">
                            <div className="workflow-icon">
                                <CheckCircle size={24} />
                            </div>
                            <span>Vous validez</span>
                        </div>
                        <div className="workflow-arrow">→</div>
                        <div className="workflow-step">
                            <div className="workflow-icon">
                                <Upload size={24} />
                            </div>
                            <span>Publication auto</span>
                        </div>
                        <div className="workflow-arrow">→</div>
                        <div className="workflow-step">
                            <div className="workflow-icon">
                                <TrendingUp size={24} />
                            </div>
                            <span>Vous rankez</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* How it Works */}
            <section id="how-it-works" className="howitworks-section">
                <div className="howitworks-container">
                    <span className="section-eyebrow">Comment ça marche</span>
                    <h2>Du mot-clé à la publication en 3 étapes</h2>

                    <div className="steps-grid">
                        <div className="step-card">
                            <div className="step-number">01</div>
                            <h3>Entrez votre mot-clé</h3>
                            <p>Donnez un mot-clé ou laissez l'IA analyser votre niche pour trouver les meilleures opportunités SEO.</p>
                        </div>
                        <div className="step-card">
                            <div className="step-number">02</div>
                            <h3>L'IA rédige & optimise</h3>
                            <p>Article complet généré en 60 secondes : structure SEO, balises, meta, images et liens internes.</p>
                        </div>
                        <div className="step-card">
                            <div className="step-number">03</div>
                            <h3>Publication automatique</h3>
                            <p>Validez et planifiez. L'article est publié automatiquement sur votre WordPress, Webflow ou autre CMS.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="faq-section">
                <div className="faq-container">
                    <span className="section-eyebrow">FAQ</span>
                    <h2>Questions fréquentes</h2>

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
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="pricing-section">
                <div className="pricing-container">
                    <span className="section-eyebrow">Tarifs</span>
                    <h2>Choisissez votre volume de contenu</h2>

                    <div className="pricing-grid">
                        {/* Starter */}
                        <div className="pricing-card">
                            <div className="pricing-header">
                                <h3>Starter</h3>
                                <p className="pricing-desc">Pour blogs personnels</p>
                            </div>
                            <div className="pricing-price">
                                <div className="price-wrapper">
                                    <span className="price">49€</span>
                                    <span className="price-period">/mois</span>
                                </div>
                            </div>
                            <ul className="pricing-features">
                                <li><CheckCircle size={18} /> 30 articles/mois</li>
                                <li><CheckCircle size={18} /> 1 site connecté</li>
                                <li><CheckCircle size={18} /> Publication WordPress</li>
                                <li><CheckCircle size={18} /> Recherche mots-clés</li>
                                <li><CheckCircle size={18} /> Support email</li>
                            </ul>
                            <Link to="/signup" className="btn-pricing">
                                Commencer
                            </Link>
                        </div>

                        {/* Growth - Featured */}
                        <div className="pricing-card featured">
                            <div className="pricing-badge">Populaire</div>
                            <div className="pricing-header">
                                <h3>Growth</h3>
                                <p className="pricing-desc">Pour sites & agences</p>
                            </div>
                            <div className="pricing-price">
                                <div className="price-wrapper">
                                    <span className="price">149€</span>
                                    <span className="price-period">/mois</span>
                                </div>
                            </div>
                            <ul className="pricing-features">
                                <li><CheckCircle size={18} /> 100 articles/mois</li>
                                <li><CheckCircle size={18} /> 5 sites connectés</li>
                                <li><CheckCircle size={18} /> Tous CMS (WP, Webflow...)</li>
                                <li><CheckCircle size={18} /> Calendrier éditorial</li>
                                <li><CheckCircle size={18} /> Analytics SEO</li>
                                <li><CheckCircle size={18} /> Support prioritaire</li>
                            </ul>
                            <Link to="/signup" className="btn-pricing featured">
                                Commencer
                            </Link>
                        </div>

                        {/* Scale */}
                        <div className="pricing-card">
                            <div className="pricing-header">
                                <h3>Scale</h3>
                                <p className="pricing-desc">Volume illimité</p>
                            </div>
                            <div className="pricing-price">
                                <div className="price-wrapper">
                                    <span className="price">Sur mesure</span>
                                </div>
                            </div>
                            <ul className="pricing-features">
                                <li><CheckCircle size={18} /> Articles illimités</li>
                                <li><CheckCircle size={18} /> Sites illimités</li>
                                <li><CheckCircle size={18} /> API access</li>
                                <li><CheckCircle size={18} /> White-label</li>
                                <li><CheckCircle size={18} /> Account manager</li>
                            </ul>
                            <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" className="btn-pricing">
                                Nous contacter
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="cta-container">
                    <h2>Automatisez votre SEO dès aujourd'hui</h2>
                    <p>Rejoignez +500 sites qui génèrent du contenu SEO automatiquement</p>
                    <div className="cta-actions">
                        <Link to="/signup" className="btn-cta-primary">
                            Essai gratuit - 5 articles offerts
                        </Link>
                        <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer" className="btn-cta-secondary">
                            Voir une démo
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
                                <div className="logo-icon seo">
                                    <PenTool size={18} />
                                </div>
                                <span>SEO Writer AI</span>
                            </div>
                            <p>L'agent IA qui rédige et publie vos articles SEO automatiquement.</p>
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
                                <a href="#cms">Intégrations</a>
                                <a href="#pricing">Tarifs</a>
                            </div>
                            <div className="footer-column">
                                <h4>Ressources</h4>
                                <a href="#">Blog</a>
                                <a href="#">Documentation</a>
                                <a href="#">Guides SEO</a>
                            </div>
                            <div className="footer-column">
                                <h4>Entreprise</h4>
                                <a href="#">À propos</a>
                                <a href="#">Contact</a>
                                <a href="#">Affiliés</a>
                            </div>
                        </div>
                    </div>

                    <div className="footer-bottom">
                        <p>© 2025 SEO Writer AI. Tous droits réservés.</p>
                        <div className="footer-legal">
                            <a href="#">Confidentialité</a>
                            <a href="#">CGU</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingSEO;




