import React, { useState, useEffect } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles, CheckCircle } from 'lucide-react';
import './OnboardingTour.css';

const OnboardingTour = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    const steps = [
        {
            target: 'dashboard',
            title: 'Bienvenue sur Smart Caller ! 👋',
            content: 'Votre tableau de bord affiche toutes vos statistiques : leads, qualifications, taux de réponse...',
            position: 'center',
            highlight: null
        },
        {
            target: 'sidebar-contacts',
            title: 'Vos Contacts',
            content: 'Retrouvez ici tous vos leads avec leur score de qualification et historique de conversation.',
            position: 'right',
            highlight: '[href="/contacts"]'
        },
        {
            target: 'sidebar-campaigns',
            title: 'Campagnes',
            content: 'Créez des campagnes automatisées pour contacter vos leads. Testez vos messages avec l\'A/B Testing !',
            position: 'right',
            highlight: '[href="/campaigns"]'
        },
        {
            target: 'sidebar-conversations',
            title: 'Conversations',
            content: 'Suivez en temps réel les échanges de votre agent IA avec vos prospects.',
            position: 'right',
            highlight: '[href="/conversations"]'
        },
        {
            target: 'sidebar-integrations',
            title: 'Intégrations',
            content: 'Connectez vos formulaires via webhook et synchronisez votre CRM.',
            position: 'right',
            highlight: '[href="/integrations"]'
        },
        {
            target: 'sidebar-settings',
            title: 'Configuration',
            content: 'Personnalisez votre agent IA : ton, messages, horaires de réponse...',
            position: 'right',
            highlight: '[href="/settings"]'
        },
        {
            target: 'usage',
            title: 'Votre Utilisation',
            content: 'Suivez votre consommation de leads en temps réel. Upgradez si besoin !',
            position: 'right',
            highlight: '.usage-card'
        },
        {
            target: 'final',
            title: 'C\'est parti ! 🚀',
            content: 'Votre agent IA est prêt à qualifier vos leads. Commencez par ajouter des contacts ou créer votre première campagne.',
            position: 'center',
            highlight: null
        }
    ];

    useEffect(() => {
        // Check if user has already seen the tour
        const tourCompleted = localStorage.getItem('smartcaller_tour_completed');
        if (tourCompleted === 'true') {
            setIsVisible(false);
        }
    }, []);

    useEffect(() => {
        // Highlight the current element
        const step = steps[currentStep];
        if (step.highlight) {
            const element = document.querySelector(step.highlight);
            if (element) {
                element.classList.add('tour-highlight');
            }
        }

        return () => {
            // Remove highlight from all elements
            document.querySelectorAll('.tour-highlight').forEach(el => {
                el.classList.remove('tour-highlight');
            });
        };
    }, [currentStep]);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleComplete();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const handleComplete = () => {
        localStorage.setItem('smartcaller_tour_completed', 'true');
        setIsVisible(false);
        onComplete?.();
    };

    const handleSkip = () => {
        localStorage.setItem('smartcaller_tour_completed', 'true');
        setIsVisible(false);
        onComplete?.();
    };

    if (!isVisible) return null;

    const step = steps[currentStep];
    const isFirst = currentStep === 0;
    const isLast = currentStep === steps.length - 1;
    const isCentered = step.position === 'center';

    return (
        <>
            {/* Overlay */}
            <div className="tour-overlay" />

            {/* Tour Card */}
            <div className={`tour-card ${isCentered ? 'centered' : 'positioned'}`}>
                {/* Progress */}
                <div className="tour-progress">
                    {steps.map((_, idx) => (
                        <div 
                            key={idx} 
                            className={`progress-dot ${idx === currentStep ? 'active' : ''} ${idx < currentStep ? 'completed' : ''}`}
                        />
                    ))}
                </div>

                {/* Close button */}
                <button className="tour-close" onClick={handleSkip}>
                    <X size={18} />
                </button>

                {/* Content */}
                <div className="tour-content">
                    {isFirst && (
                        <div className="tour-icon">
                            <Sparkles size={32} />
                        </div>
                    )}
                    {isLast && (
                        <div className="tour-icon success">
                            <CheckCircle size={32} />
                        </div>
                    )}
                    <h3>{step.title}</h3>
                    <p>{step.content}</p>
                </div>

                {/* Actions */}
                <div className="tour-actions">
                    {!isFirst && (
                        <button className="tour-btn secondary" onClick={handlePrev}>
                            <ChevronLeft size={16} />
                            Précédent
                        </button>
                    )}
                    {isFirst && (
                        <button className="tour-btn text" onClick={handleSkip}>
                            Passer le tour
                        </button>
                    )}
                    <button className="tour-btn primary" onClick={handleNext}>
                        {isLast ? 'Commencer' : 'Suivant'}
                        {!isLast && <ChevronRight size={16} />}
                    </button>
                </div>

                {/* Step counter */}
                <div className="tour-counter">
                    {currentStep + 1} / {steps.length}
                </div>
            </div>
        </>
    );
};

export default OnboardingTour;

