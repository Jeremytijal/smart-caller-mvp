import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, Rocket, Play } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { enableDemoMode } from '../data/demoData';
import './Auth.css';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isDemoLoading, setIsDemoLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await login(email, password);
            navigate('/');
        } catch (error) {
            console.error('Login failed', error);
            if (error.message.includes('Email not confirmed')) {
                setError('Veuillez confirmer votre email avant de vous connecter.');
            } else if (error.message.includes('Invalid login credentials')) {
                setError('Email ou mot de passe incorrect.');
            } else {
                setError(error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleDemoLogin = async () => {
        setIsDemoLoading(true);
        setError('');
        try {
            await login('demo@smartcaller.ai', 'emo123456');
            enableDemoMode();
            navigate('/');
        } catch (error) {
            console.error('Demo login failed', error);
            setError('Impossible de charger le compte démo. Veuillez réessayer.');
        } finally {
            setIsDemoLoading(false);
        }
    };

    return (
        <div className="auth-split-container">
            {/* Left Side - Form */}
            <div className="auth-form-side">
                <motion.div
                    className="auth-form-content"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <div className="auth-logo-section">
                        <div className="auth-logo-icon">
                            <Rocket size={24} />
                        </div>
                        <span className="auth-logo-text">Smart Caller</span>
                    </div>

                    <div className="auth-header-section">
                        <h1>Bon retour !</h1>
                        <p>Connectez-vous à votre agent Smart Caller</p>
                    </div>

                    {error && (
                        <div className="auth-error">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                placeholder="nom@entreprise.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="input-field-clean"
                            />
                        </div>

                        <div className="form-group">
                            <label>Mot de passe</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="input-field-clean"
                            />
                        </div>

                        <div className="form-options">
                            <Link to="/forgot-password" className="forgot-link">Mot de passe oublié ?</Link>
                        </div>

                        <button type="submit" className="btn-signup" disabled={isLoading}>
                            {isLoading ? (
                                <Loader2 size={20} className="animate-spin" />
                            ) : (
                                <>Se connecter <ArrowRight size={18} /></>
                            )}
                        </button>
                    </form>

                    <div className="auth-divider">
                        <span>ou</span>
                    </div>

                    <button 
                        type="button" 
                        className="btn-demo" 
                        onClick={handleDemoLogin}
                        disabled={isDemoLoading}
                    >
                        {isDemoLoading ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <>
                                <Play size={18} />
                                Voir la démo
                            </>
                        )}
                    </button>

                    <div className="auth-footer-section">
                        <p>Pas encore de compte ? <Link to="/signup" className="link-accent">S'inscrire</Link></p>
                    </div>
                </motion.div>
            </div>

            {/* Right Side - Testimonial */}
            <div className="auth-testimonial-side">
                <motion.div
                    className="testimonial-content"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <div className="testimonial-header">
                        <h2>La vitesse de réponse fait <span className="highlight">toute la différence</span></h2>
                    </div>

                    <div className="testimonial-card">
                        <div className="testimonial-photo">
                            <img 
                                src="https://www.acquisition.com/hubfs/ACQ_Web_Bio-AlexHormozi%202.png" 
                                alt="Alex Hormozi" 
                                className="photo-image" 
                            />
                            <div className="photo-accent"></div>
                        </div>
                        
                        <div className="testimonial-quote">
                            <div className="quote-mark">"</div>
                            <p className="quote-highlight">
                                Si vous mettez plus de 5 minutes à répondre à un lead, votre taux de closing chute de 80%.
                            </p>
                            <p className="quote-text">
                                Je connais des entrepreneurs qui payent plus de 60 000 $ par an quelqu'un dont le seul job est de répondre aux leads en moins de 5 minutes…
                            </p>
                            <p className="quote-text">
                                Parce que rien ne fait augmenter le revenu plus vite que la vitesse.
                            </p>
                            
                            <div className="quote-author">
                                <div className="author-info">
                                    <span className="author-name">Alex Hormozi</span>
                                    <span className="author-title">Entrepreneur & Auteur de $100M Offers</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="testimonial-stats">
                        <div className="stat-item">
                            <span className="stat-value">-80%</span>
                            <span className="stat-label">Taux de closing après 5 min</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">&lt;30s</span>
                            <span className="stat-label">Temps de réponse Smart Caller</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">24/7</span>
                            <span className="stat-label">Disponibilité de l'agent</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;
