import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, ArrowRight, Loader2, Play } from 'lucide-react';
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
        try {
            await login(email, password);
            navigate('/');
        } catch (error) {
            console.error('Login failed', error);
            // Translate common Supabase errors
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
            // Use demo credentials
            await login('demo@smartcaller.ai', 'demo123456');
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
        <div className="auth-container">
            <div className="auth-background">
                <div className="glow-orb orb-1"></div>
                <div className="glow-orb orb-2"></div>
            </div>

            <motion.div
                className="auth-card glass-panel"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <div className="auth-header">
                    <div className="logo-container">
                        <img src="/smart-caller-logo.png" alt="Smart Caller" className="auth-logo" />
                    </div>
                    <h1>Bon retour</h1>
                    <p className="text-muted">Connectez-vous à votre agent Smart Caller</p>
                </div>

                {error && (
                    <div className="auth-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label>Adresse Email</label>
                        <div className="input-wrapper">
                            <Mail size={20} className="input-icon" />
                            <input
                                type="email"
                                placeholder="nom@entreprise.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="input-field"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Mot de passe</label>
                        <div className="input-wrapper">
                            <Lock size={20} className="input-icon" />
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="input-field"
                            />
                        </div>
                    </div>

                    <div className="form-footer">
                        <Link to="/forgot-password" class="forgot-link">Mot de passe oublié ?</Link>
                    </div>

                    <button type="submit" className="btn-primary btn-block" disabled={isLoading}>
                        {isLoading ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <>Se connecter <ArrowRight size={20} /></>
                        )}
                    </button>
                </form>

                <div className="auth-divider">
                    <span>ou</span>
                </div>

                <button 
                    type="button" 
                    className="btn-demo btn-block" 
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

                <div className="auth-footer">
                    <p>Pas encore de compte ? <Link to="/signup" className="link-highlight">S'inscrire</Link></p>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
