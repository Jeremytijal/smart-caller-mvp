import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Bot, User, Loader, Calendar, Check, X, ExternalLink, CreditCard, Globe } from 'lucide-react';
import CalendarPicker from './CalendarPicker';
import { API_URL } from '../../config';

/**
 * SANDBOX CHAT - Composant principal de conversation IA
 * 
 * Features:
 * - UI type SMS mobile-first
 * - Qualification automatique par l'IA
 * - Prise de RDV intégrée si qualifié
 * - Gestion du state de conversation
 */

const SandboxChat = ({ onConversationEnd }) => {
    // Conversation state
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    
    // Qualification state
    const [qualificationData, setQualificationData] = useState({
        isQualified: false,
        score: 0,
        reasons: [],
        needDetected: '',
        urgency: 'low',
        rdvProposed: false,
        rdvAccepted: false,
        rdvSlot: null
    });
    
    // UI state
    const [showCalendar, setShowCalendar] = useState(false);
    const [conversationEnded, setConversationEnded] = useState(false);
    const [waitingForRdvResponse, setWaitingForRdvResponse] = useState(false);
    
    const chatEndRef = useRef(null);
    const inputRef = useRef(null);

    // Scroll to bottom on new message
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, showCalendar]);

    // Send initial message on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            addMessage('assistant', "Hey ! 👋 Bienvenue dans la démo Smart Caller.\n\nJoue le rôle d'un prospect et discute avec moi pour voir comment je qualifie. Vas-y, dis-moi ce qui t'amène !");
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    // Add message to conversation
    const addMessage = useCallback((role, content, metadata = {}) => {
        setMessages(prev => [...prev, {
            id: Date.now(),
            role,
            content,
            timestamp: new Date(),
            ...metadata
        }]);
    }, []);

    // Handle user message submission
    const handleSendMessage = async () => {
        if (!inputValue.trim() || isTyping || conversationEnded) return;

        const userMessage = inputValue.trim();
        setInputValue('');
        
        // Add user message
        addMessage('user', userMessage);
        setIsTyping(true);

        // Check if this is a response to RDV proposal
        if (waitingForRdvResponse) {
            await handleRdvResponse(userMessage);
            return;
        }

        try {
            // Call API for AI response
            const response = await fetch(`${API_URL}/api/funnel/chat-v2`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId,
                    message: userMessage,
                    conversationHistory: messages,
                    currentQualification: qualificationData
                })
            });

            const data = await response.json();

            // Update qualification data
            if (data.qualification) {
                setQualificationData(prev => ({
                    ...prev,
                    ...data.qualification
                }));
            }

            // Add AI response
            setTimeout(() => {
                addMessage('assistant', data.response);
                setIsTyping(false);

                // Check if AI is proposing RDV
                if (data.proposeRdv) {
                    setWaitingForRdvResponse(true);
                    setQualificationData(prev => ({
                        ...prev,
                        rdvProposed: true,
                        isQualified: true
                    }));
                }

                // Check if conversation should end (not qualified)
                if (data.endConversation && !data.proposeRdv) {
                    setTimeout(() => {
                        endConversation(false);
                    }, 2000);
                }
            }, 1000 + Math.random() * 1000);

        } catch (error) {
            console.error('Chat error:', error);
            setIsTyping(false);
            
            // Fallback response
            addMessage('assistant', "Je comprends. Pouvez-vous me donner plus de détails sur votre contexte professionnel ?");
        }
    };

    // Handle response to RDV proposal
    const handleRdvResponse = async (response) => {
        const lowerResponse = response.toLowerCase();
        const isPositive = /oui|ok|d'accord|bien sûr|volontiers|parfait|super|yes|je veux|accepte/i.test(lowerResponse);
        const isNegative = /non|pas maintenant|plus tard|pas intéressé|merci mais/i.test(lowerResponse);

        setWaitingForRdvResponse(false);

        if (isPositive) {
            setTimeout(() => {
                addMessage('assistant', "Parfait ! Voici les créneaux disponibles cette semaine. Lequel vous conviendrait le mieux ?");
                setIsTyping(false);
                setShowCalendar(true);
            }, 1000);
        } else if (isNegative) {
            setTimeout(() => {
                addMessage('assistant', "Je comprends. N'hésitez pas à revenir vers nous si vous changez d'avis. Bonne continuation !");
                setIsTyping(false);
                setTimeout(() => endConversation(true), 2000);
            }, 1000);
        } else {
            // Unclear response, ask again
            setTimeout(() => {
                addMessage('assistant', "Souhaitez-vous que je vous propose un créneau pour échanger avec un conseiller ? (Oui/Non)");
                setIsTyping(false);
                setWaitingForRdvResponse(true);
            }, 1000);
        }
    };

    // Handle calendar slot selection
    const handleSlotSelect = (slot) => {
        setShowCalendar(false);
        
        const slotText = `${slot.day} à ${slot.time}`;
        addMessage('user', `Je choisis ${slotText}`, { isSlotSelection: true });
        
        setIsTyping(true);
        
        setTimeout(() => {
            addMessage('assistant', `Parfait ! Votre rendez-vous est confirmé pour ${slotText}. 📅\n\nVous recevrez un rappel par SMS. À très bientôt !`, { isConfirmation: true });
            setIsTyping(false);
            
            setQualificationData(prev => ({
                ...prev,
                rdvAccepted: true,
                rdvSlot: slot
            }));
            
            setTimeout(() => endConversation(true), 2000);
        }, 1500);
    };

    // Handle calendar dismiss
    const handleCalendarDismiss = () => {
        setShowCalendar(false);
        addMessage('user', "Aucun créneau ne me convient");
        
        setIsTyping(true);
        setTimeout(() => {
            addMessage('assistant', "Je comprends. Nous vous recontacterons pour trouver un meilleur moment. Merci pour cet échange !");
            setIsTyping(false);
            setTimeout(() => endConversation(true), 2000);
        }, 1000);
    };

    // Save conversation to backend
    const saveConversation = async (ended = false) => {
        try {
            await fetch(`${API_URL}/api/sandbox/conversation`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sessionId,
                    messages: messages.map(m => ({
                        role: m.role,
                        content: m.content,
                        timestamp: m.timestamp
                    })),
                    qualification: qualificationData,
                    rdvProposed: qualificationData.rdvProposed,
                    rdvAccepted: qualificationData.rdvAccepted,
                    rdvSlot: qualificationData.rdvSlot,
                    ended,
                    userAgent: navigator.userAgent,
                    referrer: document.referrer
                })
            });
        } catch (error) {
            console.error('Error saving conversation:', error);
        }
    };

    // Save conversation periodically (after each AI response)
    useEffect(() => {
        if (messages.length > 1) {
            saveConversation(false);
        }
    }, [messages.length]);

    // End conversation and trigger callback
    const endConversation = (qualified) => {
        setConversationEnded(true);
        
        const finalData = {
            ...qualificationData,
            isQualified: qualified,
            messages: messages,
            sessionId
        };
        
        // Save final conversation state
        saveConversation(true);
        
        if (onConversationEnd) {
            onConversationEnd(finalData);
        }
    };

    // Handle Enter key
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="sandbox-chat">
            {/* Chat Header */}
            <div className="chat-header">
                <div className="header-avatar">
                    <Bot size={20} />
                </div>
                <div className="header-info">
                    <span className="header-name">Smart Caller</span>
                    <span className="header-status">
                        {isTyping ? 'écrit...' : 'En ligne'}
                    </span>
                </div>
                <div className="header-badge">
                    <span>SANDBOX</span>
                </div>
            </div>

            {/* Messages Container */}
            <div className="chat-messages">
                {/* Intro notice with links */}
                <div className="chat-notice">
                    <p>🚀 <strong>Testez l'IA en direct !</strong> Discutez avec moi ci-dessous pour voir comment Smart Caller qualifie vos leads.</p>
                    <div className="notice-links">
                        <a href="https://smart-caller.ai" target="_blank" rel="noopener noreferrer" className="notice-link">
                            <Globe size={14} />
                            Voir le site
                        </a>
                        <a href="https://agent.smart-caller.ai/subscription" target="_blank" rel="noopener noreferrer" className="notice-link primary">
                            <CreditCard size={14} />
                            Voir les tarifs
                        </a>
                    </div>
                </div>

                {messages.map((msg) => (
                    <div 
                        key={msg.id} 
                        className={`message ${msg.role}`}
                    >
                        <div className="message-avatar">
                            {msg.role === 'assistant' ? (
                                <Bot size={16} />
                            ) : (
                                <User size={16} />
                            )}
                        </div>
                        <div className="message-bubble">
                            <p>{msg.content}</p>
                            <span className="message-time">
                                {msg.timestamp.toLocaleTimeString('fr-FR', {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </span>
                        </div>
                    </div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                    <div className="message assistant">
                        <div className="message-avatar">
                            <Bot size={16} />
                        </div>
                        <div className="message-bubble typing">
                            <div className="typing-dots">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Calendar Picker */}
                {showCalendar && (
                    <div className="calendar-container">
                        <CalendarPicker 
                            onSelect={handleSlotSelect}
                            onDismiss={handleCalendarDismiss}
                        />
                    </div>
                )}

                <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className={`chat-input-area ${conversationEnded ? 'disabled' : ''}`}>
                {conversationEnded ? (
                    <div className="conversation-ended">
                        <Check size={18} />
                        <span>Conversation terminée</span>
                    </div>
                ) : (
                    <>
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={waitingForRdvResponse ? "Oui ou Non..." : "Votre message..."}
                            disabled={isTyping || showCalendar}
                        />
                        <button 
                            onClick={handleSendMessage}
                            disabled={!inputValue.trim() || isTyping || showCalendar}
                            className="send-button"
                        >
                            <Send size={20} />
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default SandboxChat;

