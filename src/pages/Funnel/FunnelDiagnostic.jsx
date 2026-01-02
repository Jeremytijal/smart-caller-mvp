import React, { useState } from 'react';
import { 
    ArrowLeft, ArrowRight, Users, Clock, 
    Globe, Target, TrendingUp, CheckCircle
} from 'lucide-react';

/**
 * PAGE 2 — DIAGNOSTIC (QUALIFICATION)
 * 
 * Questionnaire en 5 questions max
 * 1 question par écran
 * Progress bar
 * Réponses stockées pour personnalisation
 */

const FunnelDiagnostic = ({ data, onUpdate, onComplete, onBack }) => {
    const [currentQuestion, setCurrentQuestion] = useState(0);

    // Question configuration
    const questions = [
        {
            id: 'leadsPerMonth',
            icon: TrendingUp,
            title: 'Combien de leads entrants recevez-vous par mois ?',
            subtitle: 'Formulaires, appels, demandes de contact...',
            options: [
                { value: '<50', label: 'Moins de 50', emoji: '📊' },
                { value: '50-200', label: '50 à 200', emoji: '📈' },
                { value: '200-500', label: '200 à 500', emoji: '🚀' },
                { value: '500+', label: 'Plus de 500', emoji: '💎' }
            ]
        },
        {
            id: 'responseTime',
            icon: Clock,
            title: 'Quel est votre délai moyen de réponse ?',
            subtitle: 'Entre la réception du lead et le premier contact',
            options: [
                { value: '<5min', label: 'Moins de 5 min', emoji: '⚡' },
                { value: '5-30min', label: '5 à 30 min', emoji: '🕐' },
                { value: '30min-2h', label: '30 min à 2h', emoji: '⏰' },
                { value: '+2h', label: 'Plus de 2h', emoji: '😰' }
            ]
        },
        {
            id: 'leadSource',
            icon: Globe,
            title: 'D\'où viennent principalement vos leads ?',
            subtitle: 'Sélectionnez la source principale',
            options: [
                { value: 'website', label: 'Site web', emoji: '🌐' },
                { value: 'ads', label: 'Publicités (Meta, Google...)', emoji: '📢' },
                { value: 'crm', label: 'Base CRM existante', emoji: '📋' },
                { value: 'other', label: 'Autre', emoji: '🔗' }
            ]
        },
        {
            id: 'teamSize',
            icon: Users,
            title: 'Quelle est la taille de votre équipe commerciale ?',
            subtitle: 'Personnes qui traitent les leads',
            options: [
                { value: 'solo', label: 'Juste moi', emoji: '👤' },
                { value: '1-2', label: '1 à 2 personnes', emoji: '👥' },
                { value: '3-5', label: '3 à 5 personnes', emoji: '👨‍👩‍👧' },
                { value: '5+', label: 'Plus de 5', emoji: '🏢' }
            ]
        },
        {
            id: 'mainGoal',
            icon: Target,
            title: 'Quel est votre objectif principal ?',
            subtitle: 'Ce qui vous fait perdre le plus de temps/argent',
            options: [
                { value: 'speed', label: 'Répondre plus vite', emoji: '⚡' },
                { value: 'qualify', label: 'Qualifier automatiquement', emoji: '🎯' },
                { value: 'reactivate', label: 'Réactiver des leads dormants', emoji: '🔄' },
                { value: 'scale', label: 'Soulager les commerciaux', emoji: '💪' }
            ]
        }
    ];

    const currentQ = questions[currentQuestion];
    const Icon = currentQ.icon;
    const progress = ((currentQuestion + 1) / questions.length) * 100;

    const handleSelect = (value) => {
        onUpdate(currentQ.id, value);
        
        // Auto-advance after selection
        setTimeout(() => {
            if (currentQuestion < questions.length - 1) {
                setCurrentQuestion(prev => prev + 1);
            } else {
                onComplete();
            }
        }, 300);
    };

    const handleBack = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(prev => prev - 1);
        } else {
            onBack();
        }
    };

    return (
        <div className="funnel-diagnostic">
            {/* Progress */}
            <div className="diagnostic-progress">
                <div className="progress-bar">
                    <div 
                        className="progress-fill" 
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <span className="progress-text">
                    Question {currentQuestion + 1}/{questions.length}
                </span>
            </div>

            {/* Back button */}
            <button className="btn-back" onClick={handleBack}>
                <ArrowLeft size={20} />
                Retour
            </button>

            {/* Question Card */}
            <div className="question-card">
                <div className="question-icon">
                    <Icon size={32} />
                </div>
                
                <h2 className="question-title">{currentQ.title}</h2>
                <p className="question-subtitle">{currentQ.subtitle}</p>

                {/* Options */}
                <div className="question-options">
                    {currentQ.options.map((option) => {
                        const isSelected = data[currentQ.id] === option.value;
                        return (
                            <button
                                key={option.value}
                                className={`option-btn ${isSelected ? 'selected' : ''}`}
                                onClick={() => handleSelect(option.value)}
                            >
                                <span className="option-emoji">{option.emoji}</span>
                                <span className="option-label">{option.label}</span>
                                {isSelected && <CheckCircle size={20} className="option-check" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Skip option */}
            <button 
                className="btn-skip"
                onClick={() => {
                    if (currentQuestion < questions.length - 1) {
                        setCurrentQuestion(prev => prev + 1);
                    } else {
                        onComplete();
                    }
                }}
            >
                Passer cette question
            </button>
        </div>
    );
};

export default FunnelDiagnostic;





