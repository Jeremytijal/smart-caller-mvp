import React from 'react';
import { 
    ArrowLeft, ArrowRight, AlertTriangle, TrendingUp,
    Zap, MessageSquare, Clock, Target, CheckCircle
} from 'lucide-react';

/**
 * PAGE 3 — RÉSULTAT PERSONNALISÉ
 * 
 * Affiche un résumé basé sur les réponses du diagnostic
 * Estimation des pertes liées au délai
 * CTA vers le test SMS
 */

const FunnelResult = ({ data, estimatedLoss, onTestSms, onBack }) => {
    // Mapping for display
    const leadsLabels = {
        '<50': 'moins de 50',
        '50-200': '50 à 200',
        '200-500': '200 à 500',
        '500+': 'plus de 500'
    };

    const responseLabels = {
        '<5min': 'moins de 5 minutes',
        '5-30min': '5 à 30 minutes',
        '30min-2h': '30 minutes à 2 heures',
        '+2h': 'plus de 2 heures'
    };

    const goalLabels = {
        'speed': 'répondre plus vite',
        'qualify': 'qualifier automatiquement',
        'reactivate': 'réactiver des leads dormants',
        'scale': 'soulager vos commerciaux'
    };

    // Determine urgency level
    const getUrgencyLevel = () => {
        if (data.responseTime === '+2h') return 'critical';
        if (data.responseTime === '30min-2h') return 'high';
        if (data.responseTime === '5-30min') return 'medium';
        return 'low';
    };

    const urgency = getUrgencyLevel();

    // Get personalized insights
    const getInsights = () => {
        const insights = [];
        
        if (['200-500', '500+'].includes(data.leadsPerMonth)) {
            insights.push({
                icon: TrendingUp,
                text: 'Avec ce volume de leads, chaque minute de délai supplémentaire représente des milliers d\'euros perdus.',
                type: 'warning'
            });
        }

        if (['+2h', '30min-2h'].includes(data.responseTime)) {
            insights.push({
                icon: Clock,
                text: 'Un délai de réponse supérieur à 5 minutes divise par 10 vos chances de conversion.',
                type: 'danger'
            });
        }

        if (data.mainGoal === 'qualify') {
            insights.push({
                icon: Target,
                text: 'La qualification automatique peut libérer jusqu\'à 80% du temps de vos commerciaux.',
                type: 'success'
            });
        }

        if (['solo', '1-2'].includes(data.teamSize) && ['200-500', '500+'].includes(data.leadsPerMonth)) {
            insights.push({
                icon: Zap,
                text: 'Avec une petite équipe et beaucoup de leads, l\'automatisation est essentielle.',
                type: 'warning'
            });
        }

        return insights;
    };

    const insights = getInsights();

    return (
        <div className="funnel-result">
            {/* Back button */}
            <button className="btn-back" onClick={onBack}>
                <ArrowLeft size={20} />
                Retour
            </button>

            {/* Result Header */}
            <div className="result-header">
                <div className={`result-badge ${urgency}`}>
                    {urgency === 'critical' && <AlertTriangle size={16} />}
                    {urgency === 'high' && <Clock size={16} />}
                    {urgency === 'medium' && <TrendingUp size={16} />}
                    {urgency === 'low' && <CheckCircle size={16} />}
                    <span>
                        {urgency === 'critical' && 'Action urgente recommandée'}
                        {urgency === 'high' && 'Potentiel d\'amélioration élevé'}
                        {urgency === 'medium' && 'Optimisation possible'}
                        {urgency === 'low' && 'Bonne performance'}
                    </span>
                </div>
                
                <h1 className="result-title">Votre diagnostic</h1>
            </div>

            {/* Personalized Summary */}
            <div className="result-summary">
                <p className="summary-text">
                    Avec <strong>{leadsLabels[data.leadsPerMonth]} leads par mois</strong> et un délai 
                    de réponse de <strong>{responseLabels[data.responseTime]}</strong>, une qualification 
                    automatique par SMS peut avoir un impact significatif sur votre conversion.
                </p>
            </div>

            {/* Estimated Loss Card */}
            {estimatedLoss > 5000 && (
                <div className="loss-card">
                    <div className="loss-icon">
                        <AlertTriangle size={32} />
                    </div>
                    <div className="loss-content">
                        <span className="loss-label">Perte estimée par an</span>
                        <span className="loss-amount">
                            {estimatedLoss.toLocaleString('fr-FR')} €
                        </span>
                        <span className="loss-subtitle">
                            liée au délai de réponse et aux leads non qualifiés
                        </span>
                    </div>
                </div>
            )}

            {/* Insights */}
            {insights.length > 0 && (
                <div className="result-insights">
                    <h3>Ce que nous observons</h3>
                    <div className="insights-list">
                        {insights.map((insight, index) => {
                            const Icon = insight.icon;
                            return (
                                <div key={index} className={`insight-item ${insight.type}`}>
                                    <Icon size={20} />
                                    <p>{insight.text}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* What Smart Caller Can Do */}
            <div className="result-solution">
                <h3>Ce que Smart Caller peut faire pour vous</h3>
                <ul className="solution-list">
                    <li>
                        <CheckCircle size={18} />
                        <span>Répondre en <strong>moins de 30 secondes</strong></span>
                    </li>
                    <li>
                        <CheckCircle size={18} />
                        <span>Qualifier automatiquement vos leads par SMS</span>
                    </li>
                    <li>
                        <CheckCircle size={18} />
                        <span>
                            {data.mainGoal === 'speed' && 'Éliminer le délai de réponse'}
                            {data.mainGoal === 'qualify' && 'Scorer chaque lead avant le premier appel'}
                            {data.mainGoal === 'reactivate' && 'Relancer intelligemment vos leads dormants'}
                            {data.mainGoal === 'scale' && 'Automatiser les tâches répétitives'}
                            {!data.mainGoal && 'Augmenter votre taux de conversion'}
                        </span>
                    </li>
                </ul>
            </div>

            {/* CTA */}
            <div className="result-cta">
                <h2>Testez l'IA maintenant</h2>
                <p>
                    Recevez un SMS et discutez avec Smart Caller comme si vous étiez un lead.
                    Voyez comment l'IA qualifie une conversation.
                </p>
                <button className="cta-primary large" onClick={onTestSms}>
                    <MessageSquare size={20} />
                    Tester l'IA par SMS
                    <ArrowRight size={20} />
                </button>
                <span className="cta-reassurance">
                    Aucun message envoyé à vos vrais prospects
                </span>
            </div>
        </div>
    );
};

export default FunnelResult;

