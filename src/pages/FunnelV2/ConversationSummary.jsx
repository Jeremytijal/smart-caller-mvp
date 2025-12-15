import React from 'react';
import { 
    CheckCircle, XCircle, Target, Clock, Calendar, 
    MessageSquare, TrendingUp, AlertCircle, Zap,
    User, Building2, ArrowRight
} from 'lucide-react';

/**
 * CONVERSATION SUMMARY - Résumé post-conversation
 * 
 * Affiche ce que Smart Caller transmettrait à l'équipe commerciale :
 * - Statut de qualification
 * - Raisons
 * - Besoin détecté
 * - Urgence
 * - Score
 * - Statut RDV
 */

const ConversationSummary = ({ data, onRequestDemo }) => {
    const {
        isQualified,
        score = 0,
        reasons = [],
        needDetected = '',
        urgency = 'low',
        rdvProposed = false,
        rdvAccepted = false,
        rdvSlot = null,
        messages = []
    } = data;

    // Calculate score if not provided
    const displayScore = score || (isQualified ? 75 : 35);

    // Urgency labels
    const urgencyLabels = {
        high: { label: 'Élevée', color: 'danger', icon: '🔥' },
        medium: { label: 'Moyenne', color: 'warning', icon: '⚡' },
        low: { label: 'Faible', color: 'neutral', icon: '🌱' }
    };

    const urgencyInfo = urgencyLabels[urgency] || urgencyLabels.low;

    // Default reasons if none provided
    const displayReasons = reasons.length > 0 ? reasons : (
        isQualified 
            ? ['Besoin professionnel identifié', 'Intention d\'achat détectée', 'Contexte B2B confirmé']
            : ['Besoin non clairement défini', 'Intention exploratoire', 'Contexte insuffisant']
    );

    return (
        <div className="conversation-summary-container">
            {/* Header */}
            <div className="summary-header">
                <div className={`status-badge ${isQualified ? 'qualified' : 'not-qualified'}`}>
                    {isQualified ? (
                        <>
                            <CheckCircle size={20} />
                            <span>Lead Qualifié</span>
                        </>
                    ) : (
                        <>
                            <XCircle size={20} />
                            <span>Lead Non Qualifié</span>
                        </>
                    )}
                </div>
                <h2>Résumé de la conversation</h2>
                <p>Voici exactement ce que Smart Caller transmettrait à votre équipe commerciale.</p>
            </div>

            {/* Score Card */}
            <div className="summary-score-card">
                <div className="score-visual">
                    <svg viewBox="0 0 100 100" className="score-circle">
                        <circle 
                            cx="50" cy="50" r="45" 
                            fill="none" 
                            stroke="#E5E5E5" 
                            strokeWidth="8"
                        />
                        <circle 
                            cx="50" cy="50" r="45" 
                            fill="none" 
                            stroke={isQualified ? '#10B981' : '#EF4444'}
                            strokeWidth="8"
                            strokeDasharray={`${displayScore * 2.83} 283`}
                            strokeLinecap="round"
                            transform="rotate(-90 50 50)"
                        />
                    </svg>
                    <div className="score-value">
                        <span className="score-number">{displayScore}</span>
                        <span className="score-label">/ 100</span>
                    </div>
                </div>
                <div className="score-details">
                    <h3>Score de Qualification</h3>
                    <p>
                        {displayScore >= 70 
                            ? 'Ce lead présente un fort potentiel de conversion.'
                            : displayScore >= 40
                                ? 'Ce lead nécessite un suivi pour évaluer son potentiel.'
                                : 'Ce lead ne correspond pas au profil idéal actuellement.'
                        }
                    </p>
                </div>
            </div>

            {/* Details Grid */}
            <div className="summary-details-grid">
                {/* Besoin détecté */}
                <div className="detail-card">
                    <div className="detail-icon">
                        <Target size={18} />
                    </div>
                    <div className="detail-content">
                        <span className="detail-label">Besoin détecté</span>
                        <span className="detail-value">{needDetected || 'Qualification automatique des leads entrants'}</span>
                    </div>
                </div>

                {/* Urgence */}
                <div className="detail-card">
                    <div className="detail-icon">
                        <Clock size={18} />
                    </div>
                    <div className="detail-content">
                        <span className="detail-label">Urgence</span>
                        <span className={`detail-value urgency-${urgencyInfo.color}`}>
                            {urgencyInfo.icon} {urgencyInfo.label}
                        </span>
                    </div>
                </div>

                {/* RDV proposé */}
                <div className="detail-card">
                    <div className="detail-icon">
                        <Calendar size={18} />
                    </div>
                    <div className="detail-content">
                        <span className="detail-label">RDV proposé</span>
                        <span className={`detail-value ${rdvProposed ? 'positive' : 'neutral'}`}>
                            {rdvProposed ? '✅ Oui' : '❌ Non'}
                        </span>
                    </div>
                </div>

                {/* RDV accepté */}
                <div className="detail-card">
                    <div className="detail-icon">
                        <CheckCircle size={18} />
                    </div>
                    <div className="detail-content">
                        <span className="detail-label">RDV confirmé</span>
                        <span className={`detail-value ${rdvAccepted ? 'positive' : 'neutral'}`}>
                            {rdvAccepted ? `✅ ${rdvSlot?.day} à ${rdvSlot?.time}` : '—'}
                        </span>
                    </div>
                </div>

                {/* Messages échangés */}
                <div className="detail-card">
                    <div className="detail-icon">
                        <MessageSquare size={18} />
                    </div>
                    <div className="detail-content">
                        <span className="detail-label">Messages échangés</span>
                        <span className="detail-value">{messages.length}</span>
                    </div>
                </div>

                {/* Temps de réponse */}
                <div className="detail-card">
                    <div className="detail-icon">
                        <Zap size={18} />
                    </div>
                    <div className="detail-content">
                        <span className="detail-label">Temps de réponse moyen</span>
                        <span className="detail-value positive">{'< 2 secondes'}</span>
                    </div>
                </div>
            </div>

            {/* Qualification Reasons */}
            <div className="summary-reasons">
                <h3>
                    {isQualified ? (
                        <>
                            <CheckCircle size={18} />
                            Raisons de la qualification
                        </>
                    ) : (
                        <>
                            <AlertCircle size={18} />
                            Raisons de la non-qualification
                        </>
                    )}
                </h3>
                <ul>
                    {displayReasons.map((reason, index) => (
                        <li key={index}>
                            {isQualified ? '✓' : '•'} {reason}
                        </li>
                    ))}
                </ul>
            </div>

            {/* What Smart Caller Would Do */}
            <div className="summary-actions">
                <h3>
                    <TrendingUp size={18} />
                    Actions automatiques Smart Caller
                </h3>
                <div className="action-list">
                    {isQualified ? (
                        <>
                            <div className="action-item success">
                                <CheckCircle size={16} />
                                <span>Lead ajouté au CRM avec le score de qualification</span>
                            </div>
                            <div className="action-item success">
                                <CheckCircle size={16} />
                                <span>Notification envoyée à l'équipe commerciale</span>
                            </div>
                            {rdvAccepted && (
                                <div className="action-item success">
                                    <CheckCircle size={16} />
                                    <span>RDV créé dans le calendrier du commercial</span>
                                </div>
                            )}
                            <div className="action-item success">
                                <CheckCircle size={16} />
                                <span>Transcript de la conversation sauvegardé</span>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="action-item neutral">
                                <CheckCircle size={16} />
                                <span>Lead archivé avec le motif de non-qualification</span>
                            </div>
                            <div className="action-item neutral">
                                <CheckCircle size={16} />
                                <span>Ajouté à la liste de nurturing automatique</span>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* CTA Section - Only if qualified AND rdv accepted */}
            {isQualified && rdvAccepted && (
                <div className="summary-cta">
                    <div className="cta-content">
                        <Zap size={24} />
                        <div>
                            <h3>Impressionné par l'expérience ?</h3>
                            <p>Smart Caller peut faire exactement la même chose avec vos vrais leads, 24h/24.</p>
                        </div>
                    </div>
                    <button className="cta-button" onClick={onRequestDemo}>
                        Voir Smart Caller sur mes leads
                        <ArrowRight size={18} />
                    </button>
                </div>
            )}

            {/* Footer notice */}
            <div className="summary-footer">
                <p>
                    🔒 Cette démonstration était une simulation. Aucun SMS réel n'a été envoyé 
                    et aucun rendez-vous réel n'a été créé.
                </p>
            </div>
        </div>
    );
};

export default ConversationSummary;

