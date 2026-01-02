import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Bot, User, X, MessageCircle, Minimize2 } from 'lucide-react';
import { API_URL } from '../../config';
import './ChatWidget.css';

/**
 * CHAT WIDGET - Widget de chat embeddable
 * 
 * Ce composant peut être intégré sur n'importe quel site externe
 * via un script JS. Il communique avec l'API Smart Caller pour
 * gérer les conversations avec l'agent IA.
 */

const ChatWidget = ({ 
    agentId, 
    primaryColor = '#FF470F',
    position = 'right',
    greeting = "Bonjour ! 👋 Comment puis-je vous aider ?",
    placeholder = "Votre message...",
    agentName = "Smart Caller",
    agentAvatar = null,
    autoOpen = false,
    delay = 3000
}) => {
    // Widget state
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [hasInteracted, setHasInteracted] = useState(false);
    
    // Conversation state
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [sessionId] = useState(() => `widget_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
    
    // Visitor info
    const [visitorInfo] = useState(() => ({
        url: window.location.href,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        language: navigator.language,
        timestamp: new Date().toISOString()
    }));

    const chatEndRef = useRef(null);
    const inputRef = useRef(null);

    // Auto-open widget after delay
    useEffect(() => {
        if (autoOpen && !hasInteracted) {
            const timer = setTimeout(() => {
                setIsOpen(true);
            }, delay);
            return () => clearTimeout(timer);
        }
    }, [autoOpen, delay, hasInteracted]);

    // Send initial greeting when widget opens
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            addMessage('assistant', greeting);
        }
    }, [isOpen, greeting]);

    // Scroll to bottom on new message
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input when widget opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [isOpen]);

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
        if (!inputValue.trim() || isTyping) return;

        const userMessage = inputValue.trim();
        setInputValue('');
        setHasInteracted(true);
        
        // Add user message
        addMessage('user', userMessage);
        setIsTyping(true);

        try {
            // Call API for AI response
            const response = await fetch(`${API_URL}/api/widget/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agentId,
                    sessionId,
                    message: userMessage,
                    conversationHistory: messages.map(m => ({
                        role: m.role,
                        content: m.content
                    })),
                    visitorInfo
                })
            });

            const data = await response.json();

            // Add AI response with typing delay
            setTimeout(() => {
                addMessage('assistant', data.response);
                setIsTyping(false);
            }, 500 + Math.random() * 1000);

        } catch (error) {
            console.error('Widget chat error:', error);
            setIsTyping(false);
            addMessage('assistant', "Désolé, je rencontre un problème technique. Réessayez dans un instant.");
        }
    };

    // Handle Enter key
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    // Toggle widget
    const toggleWidget = () => {
        setHasInteracted(true);
        setIsOpen(!isOpen);
        setIsMinimized(false);
    };

    // Minimize widget
    const minimizeWidget = () => {
        setIsMinimized(true);
        setIsOpen(false);
    };

    // CSS custom properties for theming
    const widgetStyle = {
        '--widget-primary': primaryColor,
        '--widget-primary-dark': adjustColor(primaryColor, -20),
        '--widget-primary-light': `${primaryColor}1A`
    };

    return (
        <div 
            className={`sc-widget-container ${position}`} 
            style={widgetStyle}
        >
            {/* Chat Window */}
            {isOpen && !isMinimized && (
                <div className="sc-widget-window">
                    {/* Header */}
                    <div className="sc-widget-header">
                        <div className="sc-widget-header-info">
                            <div className="sc-widget-avatar">
                                {agentAvatar ? (
                                    <img src={agentAvatar} alt={agentName} />
                                ) : (
                                    <Bot size={20} />
                                )}
                            </div>
                            <div className="sc-widget-header-text">
                                <span className="sc-widget-name">{agentName}</span>
                                <span className="sc-widget-status">
                                    {isTyping ? 'écrit...' : 'En ligne'}
                                </span>
                            </div>
                        </div>
                        <div className="sc-widget-header-actions">
                            <button 
                                className="sc-widget-btn-icon"
                                onClick={minimizeWidget}
                                title="Réduire"
                            >
                                <Minimize2 size={18} />
                            </button>
                            <button 
                                className="sc-widget-btn-icon"
                                onClick={toggleWidget}
                                title="Fermer"
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="sc-widget-messages">
                        {messages.map((msg) => (
                            <div 
                                key={msg.id} 
                                className={`sc-widget-message ${msg.role}`}
                            >
                                {msg.role === 'assistant' && (
                                    <div className="sc-widget-message-avatar">
                                        <Bot size={14} />
                                    </div>
                                )}
                                <div className="sc-widget-message-bubble">
                                    <p>{msg.content}</p>
                                </div>
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {isTyping && (
                            <div className="sc-widget-message assistant">
                                <div className="sc-widget-message-avatar">
                                    <Bot size={14} />
                                </div>
                                <div className="sc-widget-message-bubble typing">
                                    <div className="sc-widget-typing-dots">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={chatEndRef} />
                    </div>

                    {/* Input */}
                    <div className="sc-widget-input-area">
                        <input
                            ref={inputRef}
                            type="text"
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={placeholder}
                            disabled={isTyping}
                        />
                        <button 
                            onClick={handleSendMessage}
                            disabled={!inputValue.trim() || isTyping}
                            className="sc-widget-send-btn"
                        >
                            <Send size={18} />
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="sc-widget-footer">
                        <span>Propulsé par </span>
                        <a href="https://smart-caller.ai" target="_blank" rel="noopener noreferrer">
                            Smart Caller
                        </a>
                    </div>
                </div>
            )}

            {/* Launcher Button */}
            <button 
                className={`sc-widget-launcher ${isOpen ? 'open' : ''}`}
                onClick={toggleWidget}
                title={isOpen ? 'Fermer le chat' : 'Ouvrir le chat'}
            >
                {isOpen ? (
                    <X size={24} />
                ) : (
                    <>
                        <MessageCircle size={24} />
                        {!hasInteracted && (
                            <span className="sc-widget-notification-dot"></span>
                        )}
                    </>
                )}
            </button>
        </div>
    );
};

// Helper function to darken/lighten colors
function adjustColor(color, amount) {
    const clamp = (num) => Math.min(255, Math.max(0, num));
    
    // Remove # if present
    color = color.replace('#', '');
    
    // Parse RGB values
    const r = parseInt(color.substring(0, 2), 16);
    const g = parseInt(color.substring(2, 4), 16);
    const b = parseInt(color.substring(4, 6), 16);
    
    // Adjust and convert back to hex
    const newR = clamp(r + amount).toString(16).padStart(2, '0');
    const newG = clamp(g + amount).toString(16).padStart(2, '0');
    const newB = clamp(b + amount).toString(16).padStart(2, '0');
    
    return `#${newR}${newG}${newB}`;
}

export default ChatWidget;

