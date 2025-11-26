import React, { useState } from 'react';
import { Search, MoreVertical, Phone, Video, Send, Edit2, Check, Power } from 'lucide-react';
import './Conversations.css';

const Conversations = () => {
    const [selectedChat, setSelectedChat] = useState(1);
    const [isAutoPilot, setIsAutoPilot] = useState(true);
    const [draftMessage, setDraftMessage] = useState("Je peux vous proposer un rendez-vous mardi à 14h. Cela vous convient-il ?");

    const conversations = [
        {
            id: 1,
            name: 'Alice Smith',
            lastMessage: 'That sounds great, when can we schedule?',
            time: '2m',
            unread: 2,
            status: 'qualified',
            sentiment: 'positive',
            avatar: 'AS'
        },
        {
            id: 2,
            name: 'Bob Jones',
            lastMessage: 'I think it is out of my budget right now.',
            time: '1h',
            unread: 0,
            status: 'disqualified',
            sentiment: 'negative',
            avatar: 'BJ'
        },
        {
            id: 3,
            name: 'Charlie Brown',
            lastMessage: 'Can you send me more info?',
            time: '3h',
            unread: 0,
            status: 'pending',
            sentiment: 'neutral',
            avatar: 'CB'
        },
        {
            id: 4,
            name: 'David Wilson',
            lastMessage: 'Thanks for the help!',
            time: '1d',
            unread: 0,
            status: 'qualified',
            sentiment: 'positive',
            avatar: 'DW'
        },
    ];

    const messages = [
        { id: 1, sender: 'ai', text: 'Bonjour Alice ! J\'ai vu que vous étiez intéressé par notre plan premium. Avez-vous des questions spécifiques ?', time: '10:00 AM' },
        { id: 2, sender: 'user', text: 'Bonjour ! Oui, je me demandais quelles sont les limites de l\'API.', time: '10:02 AM' },
        { id: 3, sender: 'ai', text: 'Excellente question. Notre plan premium inclut 100k appels API par mois. Cela correspond-il à vos besoins ?', time: '10:03 AM' },
        { id: 4, sender: 'user', text: 'Cela semble parfait, quand pouvons-nous planifier une démo ?', time: '10:05 AM' },
    ];

    return (
        <div className="page-container conversations-page">
            <div className="glass-panel conversations-layout">
                {/* Sidebar List */}
                <div className="chat-sidebar">
                    <div className="chat-search">
                        <Search size={20} className="search-icon" />
                        <input type="text" placeholder="Rechercher..." />
                    </div>

                    <div className="conversations-list">
                        {conversations.map((chat) => (
                            <div
                                key={chat.id}
                                className={`conversation-item ${selectedChat === chat.id ? 'active' : ''}`}
                                onClick={() => setSelectedChat(chat.id)}
                            >
                                <div className={`avatar ${chat.status}`}>
                                    {chat.avatar}
                                    <div className={`sentiment-dot ${chat.sentiment}`} title={`Sentiment: ${chat.sentiment}`}></div>
                                </div>
                                <div className="conversation-info">
                                    <div className="conversation-header">
                                        <span className="user-name">{chat.name}</span>
                                        <span className="time">{chat.time}</span>
                                    </div>
                                    <p className="last-message">{chat.lastMessage}</p>
                                </div>
                                {chat.unread > 0 && (
                                    <span className="unread-badge">{chat.unread}</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="chat-area">
                    <div className="chat-header">
                        <div className="chat-user-info">
                            <div className="avatar qualified">AS</div>
                            <div>
                                <h3>Alice Smith</h3>
                                <span className="status-text">Lead Qualifié</span>
                            </div>
                        </div>
                        <div className="chat-actions">
                            <div className={`auto-pilot-toggle ${isAutoPilot ? 'active' : ''}`} onClick={() => setIsAutoPilot(!isAutoPilot)}>
                                <Power size={16} />
                                <span>{isAutoPilot ? 'Auto-Pilot ON' : 'Mode Manuel'}</span>
                            </div>
                            <div className="divider"></div>
                            <button className="icon-btn"><Phone size={20} /></button>
                            <button className="icon-btn"><Video size={20} /></button>
                            <button className="icon-btn"><MoreVertical size={20} /></button>
                        </div>
                    </div>

                    <div className="messages-container">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`message-wrapper ${msg.sender}`}>
                                <div className="message-bubble">
                                    {msg.text}
                                </div>
                                <span className="message-time">{msg.time}</span>
                            </div>
                        ))}

                        {/* Draft Message Ghost Bubble */}
                        {isAutoPilot && (
                            <div className="message-wrapper ai draft">
                                <div className="message-bubble ghost">
                                    <div className="typing-indicator">
                                        <span>AI is typing...</span>
                                    </div>
                                    <p>{draftMessage}</p>
                                    <div className="draft-actions">
                                        <button className="btn-xs approve"><Check size={14} /> Approuver</button>
                                        <button className="btn-xs edit"><Edit2 size={14} /> Modifier</button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className={`chat-input-area ${!isAutoPilot ? 'manual-mode' : ''}`}>
                        <input type="text" placeholder={isAutoPilot ? "L'IA gère cette conversation..." : "Écrivez un message..."} disabled={isAutoPilot} />
                        <button className="btn-primary send-btn" disabled={isAutoPilot}>
                            <Send size={20} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Conversations;
