import React, { useState, useEffect, useRef } from 'react';
import { 
    ArrowLeft, Send, Phone, Shield, MessageSquare,
    Loader, CheckCircle, Bot, User
} from 'lucide-react';
import { API_URL } from '../../config';

/**
 * PAGE 4 — TEST IA PAR SMS (SANDBOX)
 * 
 * Objectif : faire vivre l'expérience Smart Caller
 * 
 * Étapes :
 * A. Collecte du numéro
 * B. Déclenchement du SMS initial
 * C. Conversation libre avec l'IA
 */

const FunnelSmsTest = ({ 
    phone, 
    setPhone, 
    conversation, 
    addMessage, 
    onComplete, 
    onBack 
}) => {
    const [step, setStep] = useState('phone'); // 'phone' | 'waiting' | 'conversation' | 'complete'
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [userInput, setUserInput] = useState('');
    const [messageCount, setMessageCount] = useState(0);
    const chatEndRef = useRef(null);

    // Max messages before ending conversation
    const MAX_MESSAGES = 6;

    // Scroll to bottom on new message
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [conversation]);

    // Format phone number
    const formatPhone = (value) => {
        const cleaned = value.replace(/\D/g, '');
        if (cleaned.startsWith('33')) {
            return '+' + cleaned;
        } else if (cleaned.startsWith('0')) {
            return '+33' + cleaned.slice(1);
        }
        return '+33' + cleaned;
    };

    // Validate phone number
    const isValidPhone = (phoneNumber) => {
        const cleaned = phoneNumber.replace(/\D/g, '');
        return cleaned.length >= 10 && cleaned.length <= 12;
    };

    // Start SMS test - Send initial message
    const handleStartTest = async () => {
        if (!isValidPhone(phone)) {
            setError('Veuillez entrer un numéro de téléphone valide');
            return;
        }

        setLoading(true);
        setError(null);
        setStep('waiting');

        try {
            // Format phone number
            const formattedPhone = formatPhone(phone);
            setPhone(formattedPhone);

            // Call backend to send initial SMS
            const response = await fetch(`${API_URL}/api/funnel/start-test`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    phone: formattedPhone,
                    testType: 'sandbox'
                })
            });

            if (!response.ok) {
                throw new Error('Erreur lors de l\'envoi du SMS');
            }

            const data = await response.json();
            
            // Add initial AI message to conversation
            addMessage('assistant', data.initialMessage || "Bonjour ! J'ai vu votre offre sur votre site. Pouvez-vous m'en dire plus sur vos services ?");
            
            setStep('conversation');
            setMessageCount(1);

        } catch (err) {
            console.error('Error starting test:', err);
            setError('Erreur lors du démarrage du test. Veuillez réessayer.');
            setStep('phone');
        } finally {
            setLoading(false);
        }
    };

    // Send user message and get AI response
    const handleSendMessage = async () => {
        if (!userInput.trim()) return;

        const message = userInput.trim();
        setUserInput('');
        setLoading(true);

        // Add user message
        addMessage('user', message);
        setMessageCount(prev => prev + 1);

        try {
            // Call backend for AI response
            const response = await fetch(`${API_URL}/api/funnel/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    phone: phone,
                    message: message,
                    conversationHistory: conversation
                })
            });

            if (!response.ok) {
                throw new Error('Erreur de communication');
            }

            const data = await response.json();

            // Add AI response
            addMessage('assistant', data.response);
            setMessageCount(prev => prev + 1);

            // Check if conversation should end
            if (messageCount >= MAX_MESSAGES - 1 || data.shouldEnd) {
                setTimeout(() => {
                    setStep('complete');
                    onComplete(data.qualification || {
                        intent: 'interested',
                        maturity: 'medium',
                        nextAction: 'demo'
                    });
                }, 1500);
            }

        } catch (err) {
            console.error('Error sending message:', err);
            // Fallback: simulate AI response for demo
            const fallbackResponses = [
                "Je comprends. Quels sont vos principaux défis actuellement avec la gestion de vos leads ?",
                "C'est intéressant. Avez-vous une équipe commerciale dédiée ou gérez-vous cela seul ?",
                "Je vois. Quel serait l'impact pour vous si vous pouviez qualifier automatiquement vos leads entrants ?",
                "Parfait ! Je pense que nous pourrions vous aider. Souhaitez-vous en savoir plus sur notre solution ?",
                "Merci pour ces informations ! Je vous propose qu'on organise un appel pour voir comment on peut vous accompagner."
            ];
            const randomResponse = fallbackResponses[Math.min(messageCount, fallbackResponses.length - 1)];
            addMessage('assistant', randomResponse);
            setMessageCount(prev => prev + 1);

            if (messageCount >= MAX_MESSAGES - 1) {
                setTimeout(() => {
                    setStep('complete');
                    onComplete({
                        intent: 'interested',
                        maturity: 'medium',
                        nextAction: 'demo'
                    });
                }, 1500);
            }
        } finally {
            setLoading(false);
        }
    };

    // Handle Enter key
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey && !loading) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // End conversation manually
    const handleEndConversation = () => {
        setStep('complete');
        onComplete({
            intent: 'interested',
            maturity: 'high',
            nextAction: 'demo'
        });
    };

    return (
        <div className="funnel-sms-test">
            {/* Back button */}
            <button className="btn-back" onClick={onBack}>
                <ArrowLeft size={20} />
                Retour
            </button>

            {/* Step: Phone Input */}
            {step === 'phone' && (
                <div className="sms-phone-step">
                    <div className="phone-header">
                        <div className="phone-icon-wrapper">
                            <MessageSquare size={32} />
                        </div>
                        <h1>Testez l'IA par SMS</h1>
                        <p>
                            Recevez un message et discutez avec Smart Caller 
                            comme si vous étiez un prospect.
                        </p>
                    </div>

                    <div className="phone-form">
                        <label className="phone-label">Votre numéro de téléphone</label>
                        <div className="phone-input-wrapper">
                            <Phone size={20} />
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="06 12 34 56 78"
                                className="phone-input"
                            />
                        </div>
                        {error && <p className="phone-error">{error}</p>}
                    </div>

                    <div className="phone-reassurance">
                        <Shield size={16} />
                        <p>
                            <strong>Simulation contrôlée</strong><br />
                            Aucun message ne sera envoyé à de vrais prospects.
                            Vous discutez avec l'IA comme si vous étiez un lead.
                        </p>
                    </div>

                    <button 
                        className="cta-primary large"
                        onClick={handleStartTest}
                        disabled={loading || !phone}
                    >
                        {loading ? (
                            <>
                                <Loader size={20} className="spinner" />
                                Envoi en cours...
                            </>
                        ) : (
                            <>
                                Recevoir le SMS de test
                                <Send size={20} />
                            </>
                        )}
                    </button>
                </div>
            )}

            {/* Step: Waiting for SMS */}
            {step === 'waiting' && (
                <div className="sms-waiting-step">
                    <div className="waiting-animation">
                        <Loader size={48} className="spinner" />
                    </div>
                    <h2>Envoi du SMS en cours...</h2>
                    <p>Vous allez recevoir un message dans quelques secondes</p>
                </div>
            )}

            {/* Step: Conversation */}
            {step === 'conversation' && (
                <div className="sms-conversation-step">
                    <div className="conversation-header">
                        <div className="header-info">
                            <Bot size={24} />
                            <div>
                                <h3>Smart Caller IA</h3>
                                <span className="status">En conversation</span>
                            </div>
                        </div>
                        <button 
                            className="btn-end-conversation"
                            onClick={handleEndConversation}
                        >
                            Terminer
                        </button>
                    </div>

                    <div className="conversation-messages">
                        {conversation.map((msg, index) => (
                            <div 
                                key={index} 
                                className={`message ${msg.role === 'user' ? 'user' : 'assistant'}`}
                            >
                                <div className="message-avatar">
                                    {msg.role === 'user' ? (
                                        <User size={16} />
                                    ) : (
                                        <Bot size={16} />
                                    )}
                                </div>
                                <div className="message-content">
                                    <p>{msg.content}</p>
                                    <span className="message-time">
                                        {new Date(msg.timestamp).toLocaleTimeString('fr-FR', {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>
                            </div>
                        ))}
                        {loading && (
                            <div className="message assistant typing">
                                <div className="message-avatar">
                                    <Bot size={16} />
                                </div>
                                <div className="message-content">
                                    <div className="typing-indicator">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    <div className="conversation-input">
                        <div className="input-hint">
                            <span>Répondez comme si vous étiez un prospect intéressé</span>
                        </div>
                        <div className="input-wrapper">
                            <input
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Votre réponse..."
                                disabled={loading}
                            />
                            <button 
                                onClick={handleSendMessage}
                                disabled={loading || !userInput.trim()}
                                className="btn-send"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                        <span className="messages-remaining">
                            {MAX_MESSAGES - messageCount} messages restants
                        </span>
                    </div>
                </div>
            )}

            {/* Step: Complete */}
            {step === 'complete' && (
                <div className="sms-complete-step">
                    <div className="complete-icon">
                        <CheckCircle size={48} />
                    </div>
                    <h2>Conversation terminée !</h2>
                    <p>L'IA analyse maintenant la conversation...</p>
                    <Loader size={24} className="spinner" />
                </div>
            )}
        </div>
    );
};

export default FunnelSmsTest;





