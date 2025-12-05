import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
    CheckCircle, Zap, Users, MessageSquare, Globe, 
    Headphones, Shield, ArrowRight, Loader2, Gift,
    Clock, CreditCard, Star
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { endpoints, CALENDLY_URL, STRIPE_PUBLIC_KEY } from '../config';
import './Subscription.css';

const Subscription = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const fromOnboarding = searchParams.get('from') === 'onboarding';
    
    const [selectedPlan, setSelectedPlan] = useState('growth');
    const [billingCycle, setBillingCycle] = useState('monthly');
    const [loading, setLoading] = useState(false);
    const [currentSubscription, setCurrentSubscription] = useState(null);
    const [spotsLeft, setSpotsLeft] = useState(7); // Simulated early bird spots

    useEffect(() => {
        if (user) {
            fetchCurrentSubscription();
        }
    }, [user]);

    const fetchCurrentSubscription = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('subscription_plan, subscription_status, trial_ends_at')
                .eq('id', user.id)
                .single();

            if (error) throw error;
            setCurrentSubscription(data);
        } catch (error) {
            console.error('Error fetching subscription:', error);
        }
    };

    const plans = [
        {
            id: 'starter',
            name: 'Starter',
            description: 'Pour petites boîtes / peu de leads',
            price: 290,
            priceDiscounted: 145,
            features: [
                'Jusqu\'à 150 leads/mois',
                '1 formulaire connecté',
                'Qualification IA automatique',
                'Dashboard temps réel',
                'Support email'
            ],
            popular: false,
            stripePriceId: 'price_1SajxUG7TquWCqOJa4tzeJAV' // À remplacer par votre Price ID Stripe
        },
        {
            id: 'growth',
            name: 'Growth',
            description: 'Pour boîtes avec volume plus sérieux',
            price: 590,
            priceDiscounted: 295,
            features: [
                'Jusqu\'à 500 leads/mois',
                '2 formulaires connectés',
                'Tout Starter +',
                'Campagnes de réactivation',
                'Intégrations CRM',
                'Support prioritaire'
            ],
            popular: true,
            stripePriceId: 'price_1SajxyG7TquWCqOJvzhiE9tL' // À remplacer par votre Price ID Stripe
        },
        {
            id: 'scale',
            name: 'Scale',
            description: 'Volume > 500 leads/mois',
            price: null,
            priceDiscounted: null,
            features: [
                'Leads illimités',
                'Formulaires illimités',
                'Tout Growth +',
                'Multi-pays / langues',
                'Intégrations CRM profondes',
                'SLA garanti',
                'Account manager dédié'
            ],
            popular: false,
            stripePriceId: null
        }
    ];

    const handleStartTrial = async (planId, stripePriceId) => {
        setLoading(true);
        setSelectedPlan(planId);
        
        try {
            // Call backend to create Stripe Checkout session
            const response = await fetch(endpoints.createCheckoutSession, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    userEmail: user.email,
                    planId: planId,
                    priceId: stripePriceId,
                    trialDays: 7,
                    successUrl: `${window.location.origin}/?activated=true`,
                    cancelUrl: `${window.location.origin}/subscription`
                })
            });

            const data = await response.json();
            
            if (data.url) {
                // Redirect to Stripe Checkout
                window.location.href = data.url;
            } else {
                throw new Error(data.error || 'Erreur lors de la création de la session de paiement');
            }
        } catch (error) {
            console.error('Error starting trial:', error);
            alert('Erreur lors de la redirection vers le paiement. Veuillez réessayer.');
            setLoading(false);
        }
    };

    const handleContactSales = () => {
        window.open(CALENDLY_URL, '_blank');
    };

    return (
        <div className="subscription-page">
            <div className="subscription-container">
                {/* Header */}
                <div className="subscription-header">
                    {fromOnboarding && (
                        <div className="success-badge">
                            <CheckCircle size={18} />
                            <span>Votre agent est configuré !</span>
                        </div>
                    )}
                    <h1>Activez votre agent IA</h1>
                    <p>Choisissez votre plan pour commencer à qualifier vos leads automatiquement</p>
                </div>

                {/* Early Bird Banner */}
                <div className="early-bird-banner">
                    <div className="early-bird-icon">
                        <Gift size={24} />
                    </div>
                    <div className="early-bird-content">
                        <div className="early-bird-title">
                            🎉 Offre Early Bird : -50% pendant 6 mois
                        </div>
                        <div className="early-bird-text">
                            Plus que <strong>{spotsLeft} places</strong> disponibles à ce tarif
                        </div>
                    </div>
                </div>

                {/* Trial Info */}
                <div className="trial-info">
                    <div className="trial-info-item">
                        <Clock size={18} />
                        <span><strong>7 jours d'essai gratuit</strong> • 10 leads offerts</span>
                    </div>
                    <div className="trial-info-item">
                        <CreditCard size={18} />
                        <span>Carte requise pour activer • Annulez à tout moment</span>
                    </div>
                </div>

                {/* Plans Grid */}
                <div className="plans-grid">
                    {plans.map((plan) => (
                        <div 
                            key={plan.id}
                            className={`plan-card ${plan.popular ? 'popular' : ''} ${selectedPlan === plan.id ? 'selected' : ''}`}
                            onClick={() => plan.price !== null && setSelectedPlan(plan.id)}
                        >
                            {plan.popular && (
                                <div className="popular-badge">
                                    <Star size={14} />
                                    Populaire
                                </div>
                            )}
                            
                            <div className="plan-header">
                                <h3>{plan.name}</h3>
                                <p>{plan.description}</p>
                            </div>

                            <div className="plan-price">
                                {plan.price !== null ? (
                                    <>
                                        <div className="price-row">
                                            <span className="price-old">{plan.price}€</span>
                                            <span className="price-current">{plan.priceDiscounted}€</span>
                                            <span className="price-period">/mois</span>
                                        </div>
                                        <span className="price-note">pendant 6 mois, puis {plan.price}€/mois</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="price-current">Sur mesure</span>
                                        <span className="price-note">Tarif adapté à vos besoins</span>
                                    </>
                                )}
                            </div>

                            <ul className="plan-features">
                                {plan.features.map((feature, index) => (
                                    <li key={index}>
                                        <CheckCircle size={16} />
                                        <span>{feature}</span>
                                    </li>
                                ))}
                            </ul>

                            {plan.price !== null ? (
                                <button 
                                    className={`btn-plan ${plan.popular ? 'primary' : 'secondary'}`}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleStartTrial(plan.id, plan.stripePriceId);
                                    }}
                                    disabled={loading && selectedPlan === plan.id}
                                >
                                    {loading && selectedPlan === plan.id ? (
                                        <Loader2 size={18} className="animate-spin" />
                                    ) : (
                                        <>
                                            Essayer 7 jours gratuit
                                            <ArrowRight size={16} />
                                        </>
                                    )}
                                </button>
                            ) : (
                                <button 
                                    className="btn-plan secondary"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleContactSales();
                                    }}
                                >
                                    Nous contacter
                                    <ArrowRight size={16} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>

                {/* Guarantees */}
                <div className="guarantees">
                    <div className="guarantee-item">
                        <Shield size={20} />
                        <span>Satisfait ou remboursé 14 jours</span>
                    </div>
                    <div className="guarantee-item">
                        <Zap size={20} />
                        <span>Activation instantanée</span>
                    </div>
                    <div className="guarantee-item">
                        <Headphones size={20} />
                        <span>Support réactif</span>
                    </div>
                </div>

                {/* FAQ Mini */}
                <div className="subscription-faq">
                    <h4>Questions fréquentes</h4>
                    <div className="faq-items">
                        <div className="faq-item">
                            <strong>Que se passe-t-il après les 7 jours d'essai ?</strong>
                            <p>Votre carte sera débitée du premier mois. Vous pouvez annuler à tout moment avant la fin de l'essai.</p>
                        </div>
                        <div className="faq-item">
                            <strong>Les 10 leads offerts sont-ils décomptés de mon quota ?</strong>
                            <p>Non, les 10 leads d'essai sont un bonus. Votre quota mensuel commence après l'activation.</p>
                        </div>
                        <div className="faq-item">
                            <strong>Puis-je changer de plan plus tard ?</strong>
                            <p>Oui, vous pouvez upgrader ou downgrader à tout moment depuis les paramètres.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Subscription;

