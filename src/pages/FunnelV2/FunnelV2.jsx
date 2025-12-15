import React, { useState } from 'react';
import { 
    Zap, MessageSquare, Calendar, CheckCircle, 
    ArrowRight, Mail, Building2, Users
} from 'lucide-react';
import SandboxChat from './SandboxChat';
import ConversationSummary from './ConversationSummary';
import './FunnelV2.css';

/**
 * FUNNEL V2 - SANDBOX ONLY
 * 
 * Structure simplifiée:
 * 1. Sandbox IA - Conversation live (démarre immédiatement)
 * 2. Résumé - Post-conversation
 * 3. CTA Business - Si qualifié + RDV accepté
 */

const FunnelV2 = () => {
    const [phase, setPhase] = useState('sandbox'); // Démarre directement en sandbox
    const [conversationData, setConversationData] = useState(null);
    const [formData, setFormData] = useState({
        email: '',
        company: '',
        leadsPerMonth: ''
    });
    const [formSubmitted, setFormSubmitted] = useState(false);

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
        <div className="funnel-v2 sandbox-only">
            {/* ============================================
                SANDBOX IA - Full Screen
            ============================================ */}
            <section className="sandbox-section-fullscreen">
                <div className="sandbox-container-fullscreen">
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
        </div>
    );
};

export default FunnelV2;
