import React from 'react';
import { 
    ArrowLeft, Calendar, CheckCircle, Target, 
    TrendingUp, MessageSquare, Clock, Star,
    AlertCircle, ArrowRight, Users, Zap, Mail
} from 'lucide-react';

/**
 * PAGE 5 — FIN DE TEST & QUALIFICATION
 * 
 * Affiche le résumé de qualification généré par l'IA
 * CTA adapté selon le profil (qualifié ou non)
 */

const FunnelQualification = ({ 
    diagnosticData,
    conversation,
    qualificationResult,
    isQualified,
    onBookDemo,
    onBack
}) => {
    // Default qualification if none provided
    const qualification = qualificationResult || {
        intent: 'interested',
        maturity: 'medium',
        nextAction: 'demo'
    };

    // Map intent to display
    const intentLabels = {
        'hot': { label: 'Très intéressé', color: 'success', icon: Star },
        'interested': { label: 'Intéressé', color: 'primary', icon: TrendingUp },
        'curious': { label: 'Curieux', color: 'warning', icon: Target },
        'cold': { label: 'Non prioritaire', color: 'neutral', icon: AlertCircle }
    };

    const maturityLabels = {
        'high': { label: 'Prêt à décider', score: '🔥🔥🔥' },
        'medium': { label: 'En réflexion', score: '🔥🔥' },
        'low': { label: 'Phase d\'exploration', score: '🔥' }
    };

    const intent = intentLabels[qualification.intent] || intentLabels['interested'];
    const maturity = maturityLabels[qualification.maturity] || maturityLabels['medium'];
    const IntentIcon = intent.icon;

    // Calculate qualification score
    const getQualificationScore = () => {
        let score = 50;
        
        // Based on leads volume
        if (diagnosticData.leadsPerMonth === '500+') score += 25;
        else if (diagnosticData.leadsPerMonth === '200-500') score += 20;
        else if (diagnosticData.leadsPerMonth === '50-200') score += 10;

        // Based on response time (problem urgency)
        if (diagnosticData.responseTime === '+2h') score += 20;
        else if (diagnosticData.responseTime === '30min-2h') score += 15;
        else if (diagnosticData.responseTime === '5-30min') score += 5;

        // Based on team size
        if (['3-5', '5+'].includes(diagnosticData.teamSize)) score += 10;

        return Math.min(100, score);
    };

    const qualScore = getQualificationScore();

    return (
        <div className="funnel-qualification">
            {/* Back button */}
            <button className="btn-back" onClick={onBack}>
                <ArrowLeft size={20} />
                Retour
            </button>

            {/* Header */}
            <div className="qualification-header">
                <div className="header-icon success">
                    <CheckCircle size={32} />
                </div>
                <h1>Analyse terminée !</h1>
                <p>Voici ce que Smart Caller a détecté</p>
            </div>

            {/* Qualification Summary Card */}
            <div className="qualification-card">
                <h3>Résumé de la qualification</h3>
                
                <div className="qual-metrics">
                    <div className="qual-metric">
                        <span className="metric-label">Intention détectée</span>
                        <div className={`metric-value ${intent.color}`}>
                            <IntentIcon size={18} />
                            {intent.label}
                        </div>
                    </div>
                    
                    <div className="qual-metric">
                        <span className="metric-label">Maturité du lead</span>
                        <div className="metric-value">
                            {maturity.score} {maturity.label}
                        </div>
                    </div>
                    
                    <div className="qual-metric">
                        <span className="metric-label">Score de qualification</span>
                        <div className="metric-score">
                            <div className="score-bar">
                                <div 
                                    className="score-fill"
                                    style={{ width: `${qualScore}%` }}
                                />
                            </div>
                            <span className="score-number">{qualScore}/100</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Conversation Summary */}
            <div className="conversation-summary">
                <h3>
                    <MessageSquare size={18} />
                    Résumé de la conversation
                </h3>
                <div className="summary-content">
                    <p>
                        En {conversation.length} messages, l'IA a identifié un prospect 
                        <strong> {intent.label.toLowerCase()}</strong> avec un potentiel 
                        de conversion <strong>{maturity.label.toLowerCase()}</strong>.
                    </p>
                    <div className="summary-tags">
                        <span className="tag">B2B</span>
                        <span className="tag">Qualification automatique</span>
                        <span className="tag">SMS</span>
                    </div>
                </div>
            </div>

            {/* Recommended Action */}
            <div className="recommended-action">
                <h3>Prochaine étape recommandée</h3>
                <div className={`action-card ${isQualified ? 'qualified' : 'nurture'}`}>
                    {isQualified ? (
                        <>
                            <Calendar size={24} />
                            <div>
                                <strong>Planifier une démo personnalisée</strong>
                                <p>15 min pour voir Smart Caller sur VOS leads</p>
                            </div>
                        </>
                    ) : (
                        <>
                            <Mail size={24} />
                            <div>
                                <strong>Recevoir du contenu éducatif</strong>
                                <p>Guides et cas d'usage pour mieux comprendre</p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* CTA Section */}
            {isQualified ? (
                <div className="cta-section qualified">
                    <div className="cta-content">
                        <Zap size={24} />
                        <div>
                            <h2>Voyez Smart Caller en action</h2>
                            <p>
                                Démonstration personnalisée de 15 minutes.<br />
                                On analyse votre cas et vos leads ensemble.
                            </p>
                        </div>
                    </div>
                    
                    <button className="cta-primary large" onClick={onBookDemo}>
                        <Calendar size={20} />
                        Réserver ma démo
                        <ArrowRight size={20} />
                    </button>
                    
                    <div className="cta-benefits">
                        <span><CheckCircle size={14} /> Personnalisé pour vous</span>
                        <span><Clock size={14} /> 15 min seulement</span>
                        <span><Users size={14} /> Pas d'engagement</span>
                    </div>
                </div>
            ) : (
                <div className="cta-section nurture">
                    <div className="cta-content">
                        <Mail size={24} />
                        <div>
                            <h2>Smart Caller n'est pas adapté à tout le monde</h2>
                            <p>
                                Avec moins de 50 leads par mois, notre solution peut ne pas être 
                                le meilleur investissement pour vous actuellement.
                            </p>
                        </div>
                    </div>
                    
                    <div className="nurture-options">
                        <button className="btn-secondary">
                            <Mail size={18} />
                            Recevoir nos guides gratuits
                        </button>
                        <button className="btn-text" onClick={onBookDemo}>
                            Je veux quand même une démo
                        </button>
                    </div>
                </div>
            )}

            {/* What happens next */}
            <div className="next-steps">
                <h3>Ce qui se passe ensuite</h3>
                <div className="steps-list">
                    <div className="step-item">
                        <div className="step-number">1</div>
                        <div>
                            <strong>Vous réservez un créneau</strong>
                            <p>Choisissez le moment qui vous arrange</p>
                        </div>
                    </div>
                    <div className="step-item">
                        <div className="step-number">2</div>
                        <div>
                            <strong>On analyse votre cas</strong>
                            <p>Vos réponses au diagnostic sont transmises</p>
                        </div>
                    </div>
                    <div className="step-item">
                        <div className="step-number">3</div>
                        <div>
                            <strong>Démo personnalisée</strong>
                            <p>On vous montre l'impact sur VOS leads</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="qualification-footer">
                <img src="/smart-caller-logo.png" alt="Smart Caller" />
                <p>Qualification automatique par SMS</p>
            </footer>
        </div>
    );
};

export default FunnelQualification;





