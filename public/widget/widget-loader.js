/**
 * SMART CALLER - Widget Loader Script
 * 
 * Ce script charge le widget de chat sur les sites externes.
 * Il crée une iframe isolée pour éviter les conflits CSS/JS.
 * 
 * Usage:
 * <script src="https://app.smart-caller.ai/widget/widget-loader.js" 
 *         data-agent-id="VOTRE_AGENT_ID"
 *         data-color="#FF470F"
 *         data-position="right">
 * </script>
 */

(function() {
    'use strict';

    // Configuration
    const WIDGET_URL = 'https://app.smart-caller.ai/widget';
    const API_URL = 'https://webhook.smart-caller.ai';

    // Get script attributes
    const currentScript = document.currentScript;
    const config = {
        agentId: currentScript.getAttribute('data-agent-id') || '',
        color: currentScript.getAttribute('data-color') || '#FF470F',
        position: currentScript.getAttribute('data-position') || 'right',
        greeting: currentScript.getAttribute('data-greeting') || '',
        placeholder: currentScript.getAttribute('data-placeholder') || 'Votre message...',
        name: currentScript.getAttribute('data-name') || 'Assistant',
        avatar: currentScript.getAttribute('data-avatar') || '',
        autoOpen: currentScript.getAttribute('data-auto-open') === 'true',
        delay: parseInt(currentScript.getAttribute('data-delay')) || 3000
    };

    if (!config.agentId) {
        console.error('[Smart Caller Widget] Missing data-agent-id attribute');
        return;
    }

    // Generate unique session ID
    const sessionId = 'sc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

    // State
    let isOpen = false;
    let hasInteracted = false;
    let messages = [];
    let isTyping = false;

    // Create widget container
    const container = document.createElement('div');
    container.id = 'smart-caller-widget';
    container.innerHTML = `
        <style>
            #smart-caller-widget {
                position: fixed;
                bottom: 20px;
                ${config.position === 'left' ? 'left: 20px;' : 'right: 20px;'}
                z-index: 999999;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }
            
            #sc-launcher {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: linear-gradient(135deg, ${config.color}, ${adjustColor(config.color, -20)});
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                position: relative;
            }
            
            #sc-launcher:hover {
                transform: scale(1.08);
                box-shadow: 0 12px 48px rgba(0, 0, 0, 0.2);
            }
            
            #sc-launcher.open {
                background: #1A1A1A;
            }
            
            #sc-launcher svg {
                width: 24px;
                height: 24px;
            }
            
            .sc-notification-dot {
                position: absolute;
                top: -2px;
                right: -2px;
                width: 16px;
                height: 16px;
                background: #EF4444;
                border-radius: 50%;
                border: 3px solid white;
                animation: sc-pulse 2s infinite;
            }
            
            @keyframes sc-pulse {
                0%, 100% { transform: scale(1); }
                50% { transform: scale(1.2); }
            }
            
            #sc-window {
                position: absolute;
                bottom: 80px;
                ${config.position === 'left' ? 'left: 0;' : 'right: 0;'}
                width: 380px;
                max-width: calc(100vw - 40px);
                height: 550px;
                max-height: calc(100vh - 120px);
                background: #FFFFFF;
                border-radius: 16px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
                display: none;
                flex-direction: column;
                overflow: hidden;
                animation: sc-slideUp 0.3s ease;
            }
            
            #sc-window.open {
                display: flex;
            }
            
            @keyframes sc-slideUp {
                from {
                    opacity: 0;
                    transform: translateY(20px) scale(0.95);
                }
                to {
                    opacity: 1;
                    transform: translateY(0) scale(1);
                }
            }
            
            .sc-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                padding: 16px 20px;
                background: linear-gradient(135deg, ${config.color}, ${adjustColor(config.color, -20)});
                color: white;
            }
            
            .sc-header-info {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .sc-avatar {
                width: 40px;
                height: 40px;
                background: rgba(255, 255, 255, 0.2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                overflow: hidden;
            }
            
            .sc-avatar img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            .sc-avatar svg {
                width: 20px;
                height: 20px;
            }
            
            .sc-header-text {
                display: flex;
                flex-direction: column;
            }
            
            .sc-name {
                font-weight: 600;
                font-size: 1rem;
            }
            
            .sc-status {
                font-size: 0.8rem;
                opacity: 0.9;
            }
            
            .sc-header-actions {
                display: flex;
                gap: 4px;
            }
            
            .sc-btn-icon {
                width: 32px;
                height: 32px;
                border: none;
                background: rgba(255, 255, 255, 0.1);
                border-radius: 8px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                transition: background 0.2s;
            }
            
            .sc-btn-icon:hover {
                background: rgba(255, 255, 255, 0.2);
            }
            
            .sc-btn-icon svg {
                width: 18px;
                height: 18px;
            }
            
            .sc-messages {
                flex: 1;
                overflow-y: auto;
                padding: 20px;
                display: flex;
                flex-direction: column;
                gap: 12px;
                background: #F8F9FA;
            }
            
            .sc-message {
                display: flex;
                gap: 8px;
                max-width: 85%;
                animation: sc-fadeIn 0.3s ease;
            }
            
            @keyframes sc-fadeIn {
                from {
                    opacity: 0;
                    transform: translateY(10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            .sc-message.user {
                align-self: flex-end;
                flex-direction: row-reverse;
            }
            
            .sc-message-avatar {
                width: 28px;
                height: 28px;
                min-width: 28px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                background: ${config.color}1A;
                color: ${config.color};
            }
            
            .sc-message-avatar svg {
                width: 14px;
                height: 14px;
            }
            
            .sc-message-bubble {
                padding: 12px 16px;
                border-radius: 16px;
                background: #FFFFFF;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
            }
            
            .sc-message.assistant .sc-message-bubble {
                border-bottom-left-radius: 4px;
            }
            
            .sc-message.user .sc-message-bubble {
                background: ${config.color};
                color: white;
                border-bottom-right-radius: 4px;
            }
            
            .sc-message-bubble p {
                margin: 0;
                font-size: 0.9rem;
                line-height: 1.5;
                white-space: pre-line;
                word-break: break-word;
            }
            
            .sc-typing-dots {
                display: flex;
                gap: 4px;
                padding: 4px 0;
            }
            
            .sc-typing-dots span {
                width: 8px;
                height: 8px;
                background: #6B7280;
                border-radius: 50%;
                animation: sc-typingDot 1.4s infinite;
            }
            
            .sc-typing-dots span:nth-child(2) { animation-delay: 0.2s; }
            .sc-typing-dots span:nth-child(3) { animation-delay: 0.4s; }
            
            @keyframes sc-typingDot {
                0%, 60%, 100% {
                    transform: translateY(0);
                    opacity: 0.4;
                }
                30% {
                    transform: translateY(-6px);
                    opacity: 1;
                }
            }
            
            .sc-input-area {
                display: flex;
                gap: 10px;
                padding: 16px 20px;
                background: #FFFFFF;
                border-top: 1px solid #E5E7EB;
            }
            
            .sc-input-area input {
                flex: 1;
                padding: 12px 16px;
                border: 1px solid #E5E7EB;
                border-radius: 24px;
                font-size: 0.9rem;
                font-family: inherit;
                color: #1A1A1A;
                background: #F8F9FA;
                outline: none;
                transition: border-color 0.2s, box-shadow 0.2s;
            }
            
            .sc-input-area input:focus {
                border-color: ${config.color};
                box-shadow: 0 0 0 3px ${config.color}1A;
            }
            
            .sc-input-area input::placeholder {
                color: #6B7280;
            }
            
            .sc-send-btn {
                width: 44px;
                height: 44px;
                min-width: 44px;
                border: none;
                border-radius: 50%;
                background: ${config.color};
                color: white;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
            }
            
            .sc-send-btn:hover:not(:disabled) {
                background: ${adjustColor(config.color, -20)};
                transform: scale(1.05);
            }
            
            .sc-send-btn:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .sc-send-btn svg {
                width: 18px;
                height: 18px;
            }
            
            .sc-footer {
                padding: 10px 20px;
                text-align: center;
                font-size: 0.75rem;
                color: #6B7280;
                background: #FFFFFF;
                border-top: 1px solid #E5E7EB;
            }
            
            .sc-footer a {
                color: ${config.color};
                text-decoration: none;
                font-weight: 600;
            }
            
            .sc-footer a:hover {
                text-decoration: underline;
            }
            
            @media (max-width: 480px) {
                #smart-caller-widget {
                    bottom: 16px;
                    ${config.position === 'left' ? 'left: 16px;' : 'right: 16px;'}
                }
                
                #sc-window {
                    width: calc(100vw - 32px);
                    height: calc(100vh - 100px);
                    bottom: 76px;
                }
                
                #sc-launcher {
                    width: 56px;
                    height: 56px;
                }
            }
        </style>
        
        <div id="sc-window">
            <div class="sc-header">
                <div class="sc-header-info">
                    <div class="sc-avatar">
                        ${config.avatar ? `<img src="${config.avatar}" alt="${config.name}">` : `
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M12 2a5 5 0 0 0-5 5v5a5 5 0 0 0 10 0V7a5 5 0 0 0-5-5Z"></path>
                            <path d="M17 11v3a5 5 0 0 1-10 0v-3"></path>
                            <path d="M12 19v3"></path>
                            <path d="M8 22h8"></path>
                        </svg>
                        `}
                    </div>
                    <div class="sc-header-text">
                        <span class="sc-name">${config.name}</span>
                        <span class="sc-status" id="sc-status">En ligne</span>
                    </div>
                </div>
                <div class="sc-header-actions">
                    <button class="sc-btn-icon" id="sc-close">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
            </div>
            
            <div class="sc-messages" id="sc-messages"></div>
            
            <div class="sc-input-area">
                <input type="text" id="sc-input" placeholder="${config.placeholder}">
                <button class="sc-send-btn" id="sc-send">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                </button>
            </div>
            
            <div class="sc-footer">
                <span>Propulsé par </span>
                <a href="https://smart-caller.ai" target="_blank" rel="noopener noreferrer">Smart Caller</a>
            </div>
        </div>
        
        <button id="sc-launcher">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" id="sc-icon-chat">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
            </svg>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" id="sc-icon-close" style="display: none;">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            <span class="sc-notification-dot" id="sc-dot"></span>
        </button>
    `;

    document.body.appendChild(container);

    // Elements
    const launcher = document.getElementById('sc-launcher');
    const window_el = document.getElementById('sc-window');
    const closeBtn = document.getElementById('sc-close');
    const messagesContainer = document.getElementById('sc-messages');
    const input = document.getElementById('sc-input');
    const sendBtn = document.getElementById('sc-send');
    const statusEl = document.getElementById('sc-status');
    const dotEl = document.getElementById('sc-dot');
    const iconChat = document.getElementById('sc-icon-chat');
    const iconClose = document.getElementById('sc-icon-close');

    // Toggle widget
    function toggleWidget() {
        hasInteracted = true;
        isOpen = !isOpen;
        
        window_el.classList.toggle('open', isOpen);
        launcher.classList.toggle('open', isOpen);
        iconChat.style.display = isOpen ? 'none' : 'block';
        iconClose.style.display = isOpen ? 'block' : 'none';
        dotEl.style.display = 'none';
        
        if (isOpen && messages.length === 0) {
            const greeting = config.greeting || `Bonjour ! 👋 Comment puis-je vous aider ?`;
            addMessage('assistant', greeting);
        }
        
        if (isOpen) {
            setTimeout(() => input.focus(), 100);
        }
    }

    // Add message to UI
    function addMessage(role, content) {
        messages.push({ role, content, timestamp: new Date() });
        
        const msgEl = document.createElement('div');
        msgEl.className = 'sc-message ' + role;
        msgEl.innerHTML = `
            ${role === 'assistant' ? `
                <div class="sc-message-avatar">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M12 2a5 5 0 0 0-5 5v5a5 5 0 0 0 10 0V7a5 5 0 0 0-5-5Z"></path>
                        <path d="M17 11v3a5 5 0 0 1-10 0v-3"></path>
                    </svg>
                </div>
            ` : ''}
            <div class="sc-message-bubble">
                <p>${escapeHtml(content)}</p>
            </div>
        `;
        
        messagesContainer.appendChild(msgEl);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Show typing indicator
    function showTyping() {
        isTyping = true;
        statusEl.textContent = 'écrit...';
        
        const typingEl = document.createElement('div');
        typingEl.className = 'sc-message assistant';
        typingEl.id = 'sc-typing';
        typingEl.innerHTML = `
            <div class="sc-message-avatar">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2a5 5 0 0 0-5 5v5a5 5 0 0 0 10 0V7a5 5 0 0 0-5-5Z"></path>
                    <path d="M17 11v3a5 5 0 0 1-10 0v-3"></path>
                </svg>
            </div>
            <div class="sc-message-bubble">
                <div class="sc-typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        
        messagesContainer.appendChild(typingEl);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    // Hide typing indicator
    function hideTyping() {
        isTyping = false;
        statusEl.textContent = 'En ligne';
        const typingEl = document.getElementById('sc-typing');
        if (typingEl) typingEl.remove();
    }

    // Send message
    async function sendMessage() {
        const text = input.value.trim();
        if (!text || isTyping) return;
        
        input.value = '';
        addMessage('user', text);
        showTyping();
        
        try {
            const response = await fetch(API_URL + '/api/widget/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agentId: config.agentId,
                    sessionId: sessionId,
                    message: text,
                    conversationHistory: messages.map(m => ({ role: m.role, content: m.content })),
                    visitorInfo: {
                        url: window.location.href,
                        referrer: document.referrer,
                        userAgent: navigator.userAgent
                    }
                })
            });
            
            const data = await response.json();
            
            setTimeout(() => {
                hideTyping();
                addMessage('assistant', data.response);
            }, 500 + Math.random() * 1000);
            
        } catch (error) {
            console.error('[Smart Caller Widget] Error:', error);
            hideTyping();
            addMessage('assistant', "Désolé, je rencontre un problème technique. Réessayez dans un instant.");
        }
    }

    // Event listeners
    launcher.addEventListener('click', toggleWidget);
    closeBtn.addEventListener('click', toggleWidget);
    sendBtn.addEventListener('click', sendMessage);
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    // Auto-open after delay
    if (config.autoOpen) {
        setTimeout(() => {
            if (!hasInteracted) {
                toggleWidget();
            }
        }, config.delay);
    }

    // Helper functions
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    function adjustColor(color, amount) {
        color = color.replace('#', '');
        const r = Math.min(255, Math.max(0, parseInt(color.substring(0, 2), 16) + amount));
        const g = Math.min(255, Math.max(0, parseInt(color.substring(2, 4), 16) + amount));
        const b = Math.min(255, Math.max(0, parseInt(color.substring(4, 6), 16) + amount));
        return '#' + r.toString(16).padStart(2, '0') + g.toString(16).padStart(2, '0') + b.toString(16).padStart(2, '0');
    }

    console.log('[Smart Caller Widget] Initialized for agent:', config.agentId);
})();

