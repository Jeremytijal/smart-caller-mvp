import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
    Search, Send, Power, User, Download, Loader, 
    Phone, Mail, Building2, Calendar, Tag, Megaphone,
    MessageCircle, Bot, Clock, MoreVertical, ThumbsUp, ThumbsDown,
    Copy, ExternalLink, ChevronRight, Zap, UserCheck, AlertCircle
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { isDemoMode, demoConversations } from '../data/demoData';
import { endpoints } from '../config';
import './Conversations.css';

const Conversations = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const phoneFromUrl = searchParams.get('phone');
    const messagesEndRef = useRef(null);
    
    const [conversations, setConversations] = useState([]);
    const [selectedPhone, setSelectedPhone] = useState(phoneFromUrl || null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAutoPilot, setIsAutoPilot] = useState(true);
    const [isDemo, setIsDemo] = useState(false);
    const [messageInput, setMessageInput] = useState('');
    const [sending, setSending] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [contactInfo, setContactInfo] = useState(null);
    const [showRightPanel, setShowRightPanel] = useState(true);

    const MAX_CHARS = 1600;

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Set phone from URL parameter when it changes
    useEffect(() => {
        if (phoneFromUrl) {
            setSelectedPhone(phoneFromUrl);
        }
    }, [phoneFromUrl]);

    // Fetch messages filtered by user's agent_id
    useEffect(() => {
        if (user) {
            const demoMode = isDemoMode(user);
            setIsDemo(demoMode);
            
            if (demoMode) {
                loadDemoConversations();
            } else {
                fetchConversations();
                
                // Real-time subscription
                const channel = supabase
                    .channel('public:messages')
                    .on('postgres_changes', { 
                        event: 'INSERT', 
                        schema: 'public', 
                        table: 'messages'
                    }, (payload) => {
                        console.log('New message received:', payload.new);
                        fetchConversations();
                    })
                    .subscribe();

                return () => {
                    supabase.removeChannel(channel);
                };
            }
        }
    }, [user]);

    // Fetch contact info when selection changes
    useEffect(() => {
        if (selectedPhone && !isDemo) {
            fetchContactInfo(selectedPhone);
        }
    }, [selectedPhone, isDemo]);

    const fetchContactInfo = async (phone) => {
        try {
            const { data, error } = await supabase
                .from('contacts')
                .select('*')
                .eq('phone', phone)
                .maybeSingle();

            if (!error && data) {
                setContactInfo(data);
            } else {
                // Create minimal contact info from conversation
                const conv = conversations.find(c => c.phone === phone);
                setContactInfo({
                    name: conv?.contact?.name || 'Unknown',
                    phone: phone,
                    email: conv?.contact?.email || null,
                    company: conv?.contact?.company || null,
                    status: conv?.status || 'pending'
                });
            }
        } catch (error) {
            console.error('Error fetching contact:', error);
        }
    };

    const loadDemoConversations = () => {
        const transformed = demoConversations.map(conv => ({
            phone: conv.phone,
            contact: conv.contact,
            messages: conv.messages.map((msg, idx) => ({
                id: idx,
                role: msg.role === 'user' ? 'user' : 'assistant',
                content: msg.content,
                created_at: msg.created_at
            })),
            lastMessage: conv.lastMessage,
            time: new Date(conv.messages[conv.messages.length - 1].created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            unread: conv.unread,
            status: conv.contact.status,
            messageCount: conv.messages.length,
            botMessages: conv.messages.filter(m => m.role === 'assistant').length
        }));

        setConversations(transformed);
        
        if (phoneFromUrl) {
            setSelectedPhone(phoneFromUrl);
        } else if (transformed.length > 0) {
            setSelectedPhone(transformed[0].phone);
        }
        
        setLoading(false);
    };

    const normalizePhone = (phone) => {
        if (!phone) return '';
        let cleaned = phone.replace(/[^\d+]/g, '');
        if (cleaned.startsWith('33') && !cleaned.startsWith('+')) {
            cleaned = '+' + cleaned;
        }
        if (cleaned.startsWith('0')) {
            cleaned = '+33' + cleaned.substring(1);
        }
        return cleaned;
    };

    const fetchConversations = async () => {
        if (!user) return;

        try {
            // Get default agent first
            const { data: agentData } = await supabase
                .from('agents')
                .select('id')
                .eq('user_id', user.id)
                .eq('is_default', true)
                .maybeSingle();

            const agentId = agentData?.id || user.id;

            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('agent_id', agentId)
                .order('created_at', { ascending: true });

            if (error) throw error;

            const grouped = {};
            (data || []).forEach(msg => {
                const normalizedPhone = normalizePhone(msg.phone_number);
                if (!normalizedPhone) return;
                
                if (!grouped[normalizedPhone]) {
                    grouped[normalizedPhone] = {
                        phone: normalizedPhone,
                        messages: [],
                        lastMessage: '',
                        time: '',
                        unread: 0,
                        status: 'pending',
                        messageCount: 0,
                        botMessages: 0,
                        lastActive: null
                    };
                }
                grouped[normalizedPhone].messages.push(msg);
                grouped[normalizedPhone].lastMessage = msg.content;
                grouped[normalizedPhone].time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                grouped[normalizedPhone].messageCount++;
                grouped[normalizedPhone].lastActive = msg.created_at;
                if (msg.role === 'assistant') {
                    grouped[normalizedPhone].botMessages++;
                }
            });

            const sortedConversations = Object.values(grouped).sort((a, b) => {
                const lastA = a.messages[a.messages.length - 1].created_at;
                const lastB = b.messages[b.messages.length - 1].created_at;
                return new Date(lastB) - new Date(lastA);
            });

            setConversations(sortedConversations);

            if (!selectedPhone && sortedConversations.length > 0) {
                setSelectedPhone(sortedConversations[0].phone);
            }

            setLoading(false);
        } catch (error) {
            console.error('Error fetching conversations:', error);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedPhone) {
            const currentConv = conversations.find(c => c.phone === selectedPhone);
            if (currentConv) {
                const dedupedMessages = currentConv.messages.filter((msg, index, arr) => {
                    const isDuplicate = arr.findIndex((m, i) => 
                        i < index && 
                        m.content === msg.content && 
                        m.role === msg.role &&
                        Math.abs(new Date(m.created_at) - new Date(msg.created_at)) < 60000
                    ) !== -1;
                    return !isDuplicate;
                });
                setMessages(dedupedMessages);
            }
        }
    }, [selectedPhone, conversations]);

    const handleSendMessage = async () => {
        if (isDemo) {
            alert("Mode démo : l'envoi de messages est désactivé.");
            return;
        }
        
        if (!messageInput.trim() || !selectedPhone) return;
        
        setSending(true);
        try {
            const response = await fetch(endpoints.sendManualMessage, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    agentId: user.id,
                    to: selectedPhone,
                    message: messageInput.trim(),
                    channel: 'sms'
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.error || 'Erreur lors de l\'envoi');
            }
            
            setMessageInput('');
            fetchConversations();
            
        } catch (error) {
            console.error('Error sending message:', error);
            alert(`Erreur: ${error.message}`);
        } finally {
            setSending(false);
        }
    };
    
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey && !isAutoPilot && !sending) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const getContactName = (phone) => {
        const conv = conversations.find(c => c.phone === phone);
        return conv?.contact?.name || phone;
    };

    const getContactStatus = (phone) => {
        const conv = conversations.find(c => c.phone === phone);
        return conv?.contact?.status || 'pending';
    };

    const getLastActive = (phone) => {
        const conv = conversations.find(c => c.phone === phone);
        if (!conv?.lastActive) return 'Inconnu';
        
        const diff = Date.now() - new Date(conv.lastActive);
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'À l\'instant';
        if (minutes < 60) return `il y a ${minutes} min`;
        if (hours < 24) return `il y a ${hours}h`;
        return `il y a ${days}j`;
    };

    const exportConversation = (phone) => {
        if (!phone || messages.length === 0) {
            alert('Aucun message à exporter');
            return;
        }

        const contactName = getContactName(phone);
        const lines = [
            `Conversation avec ${contactName}`,
            `Téléphone: ${phone}`,
            `Exporté le: ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}`,
            '—'.repeat(50),
            ''
        ];

        messages.forEach(msg => {
            const sender = msg.role === 'user' ? contactName : 'Smart Caller';
            const time = new Date(msg.created_at).toLocaleString('fr-FR');
            lines.push(`[${time}] ${sender}:`);
            lines.push(msg.content);
            lines.push('');
        });

        const content = lines.join('\n');
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `conversation_${contactName.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.txt`;
        link.click();
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
    };

    const filteredConversations = conversations.filter(conv => {
        if (!searchQuery) return true;
        const name = conv.contact?.name?.toLowerCase() || '';
        const phone = conv.phone.toLowerCase();
        const query = searchQuery.toLowerCase();
        return name.includes(query) || phone.includes(query);
    });

    const selectedConv = conversations.find(c => c.phone === selectedPhone);

    if (loading) {
        return (
            <div className="conversations-loading">
                <Loader size={32} className="spin" />
                <p>Chargement des conversations...</p>
            </div>
        );
    }

    return (
        <div className="conversations-page-v2">
            {isDemo && (
                <div className="demo-banner-v2">
                    <Zap size={16} />
                    <span>Mode Démo - Conversations simulées</span>
                </div>
            )}
            
            <div className="conversations-container">
                {/* Left Sidebar - Conversations List */}
                <aside className="conv-sidebar">
                    <div className="sidebar-search">
                        <Search size={18} />
                        <input 
                            type="text" 
                            placeholder="Rechercher..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="conversations-header">
                        <h3>All Chats</h3>
                        <span className="chat-count">{filteredConversations.length} Chats</span>
                    </div>

                    <div className="conv-list">
                        {filteredConversations.length === 0 ? (
                            <div className="empty-conversations">
                                <MessageCircle size={32} />
                                <p>Aucune conversation</p>
                            </div>
                        ) : (
                            filteredConversations.map((chat) => (
                                <div
                                    key={chat.phone}
                                    className={`conv-item ${selectedPhone === chat.phone ? 'active' : ''}`}
                                    onClick={() => setSelectedPhone(chat.phone)}
                                >
                                    <div className={`conv-avatar ${chat.status}`}>
                                        {chat.contact?.name ? (
                                            <span>{chat.contact.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()}</span>
                                        ) : (
                                            <User size={18} />
                                        )}
                                    </div>
                                    <div className="conv-content">
                                        <div className="conv-top">
                                            <span className="conv-name">{chat.contact?.name || chat.phone}</span>
                                            <span className="conv-time">{chat.time}</span>
                                        </div>
                                        <p className="conv-preview">{chat.lastMessage}</p>
                                        <div className="conv-badges">
                                            <span className="badge-bot" title="Messages IA">
                                                <Bot size={12} /> {chat.botMessages}
                                            </span>
                                            <span className="badge-total" title="Total messages">
                                                <MessageCircle size={12} /> {chat.messageCount}
                                            </span>
                                        </div>
                                    </div>
                                    {chat.unread > 0 && (
                                        <div className="unread-dot">{chat.unread}</div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </aside>

                {/* Center - Chat Area */}
                <main className="chat-main">
                    {selectedPhone ? (
                        <>
                            <header className="chat-header-v2">
                                <div className="header-left">
                                    <div className={`header-avatar ${getContactStatus(selectedPhone)}`}>
                                        <span>{getContactName(selectedPhone).substring(0, 2).toUpperCase()}</span>
                                    </div>
                                    <div className="header-info">
                                        <h2>{getContactName(selectedPhone)}</h2>
                                        <span className="last-active">
                                            <span className="active-dot"></span>
                                            Dernier actif: {getLastActive(selectedPhone)}
                                        </span>
                                    </div>
                                </div>
                                <div className="header-actions">
                                    <button 
                                        className="btn-icon" 
                                        title="Exporter"
                                        onClick={() => exportConversation(selectedPhone)}
                                    >
                                        <Download size={18} />
                                    </button>
                                    <button 
                                        className={`btn-autopilot ${isAutoPilot ? 'active' : ''}`}
                                        onClick={() => setIsAutoPilot(!isAutoPilot)}
                                    >
                                        <Power size={16} />
                                        <span>{isAutoPilot ? 'Auto-Pilot ON' : 'Auto-Pilot OFF'}</span>
                                    </button>
                                </div>
                            </header>

                            <div className="messages-area">
                                {messages.map((msg, idx) => (
                                    <div key={msg.id || idx} className={`msg-wrapper ${msg.role === 'user' ? 'incoming' : 'outgoing'}`}>
                                        <div className="msg-bubble">
                                            <p>{msg.content}</p>
                                            {msg.role === 'assistant' && (
                                                <div className="msg-actions">
                                                    <button className="msg-action-btn" title="Bon message">
                                                        <ThumbsUp size={14} />
                                                    </button>
                                                    <button className="msg-action-btn" title="Mauvais message">
                                                        <ThumbsDown size={14} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                        <span className="msg-time">
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            {msg.role === 'assistant' && <span className="msg-sent">✓✓</span>}
                                        </span>
                                    </div>
                                ))}
                                <div ref={messagesEndRef} />
                            </div>

                            {!isAutoPilot && (
                                <div className="pause-ai-banner">
                                    <AlertCircle size={16} />
                                    <span>Mode manuel activé - L'IA ne répond plus automatiquement</span>
                                </div>
                            )}

                            <div className="chat-input-v2">
                                <input 
                                    type="text" 
                                    placeholder={isAutoPilot ? "L'IA gère cette conversation..." : "Écrivez un message..."} 
                                    disabled={isAutoPilot || sending}
                                    value={messageInput}
                                    onChange={(e) => setMessageInput(e.target.value.substring(0, MAX_CHARS))}
                                    onKeyPress={handleKeyPress}
                                />
                                <div className="input-footer">
                                    <span className="char-count">{messageInput.length}/{MAX_CHARS}</span>
                                    <button 
                                        className="send-btn-v2" 
                                        disabled={isAutoPilot || sending || !messageInput.trim()} 
                                        onClick={handleSendMessage}
                                    >
                                        {sending ? <Loader size={18} className="spin" /> : <Send size={18} />}
                                    </button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="no-conversation">
                            <MessageCircle size={48} />
                            <h3>Sélectionnez une conversation</h3>
                            <p>Choisissez un contact dans la liste pour voir ses messages</p>
                        </div>
                    )}
                </main>

                {/* Right Panel - Contact Info */}
                {selectedPhone && showRightPanel && (
                    <aside className="info-panel">
                        {/* Chat Stats Widget */}
                        <div className="info-widget stats-widget">
                            <h4>Chat Widget</h4>
                            <div className="stat-row">
                                <span className="stat-dot green"></span>
                                <span>Bot Message Count:</span>
                                <strong>{selectedConv?.botMessages || 0}</strong>
                            </div>
                            <div className="stat-row">
                                <span>Total Messages:</span>
                                <strong>{selectedConv?.messageCount || 0}</strong>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="info-widget contact-widget">
                            <h4>Contact Information</h4>
                            <div className="contact-field">
                                <User size={16} />
                                <span>{contactInfo?.name || getContactName(selectedPhone)}</span>
                            </div>
                            <div className="contact-field">
                                <Phone size={16} />
                                <span>{selectedPhone}</span>
                                <button className="copy-btn" onClick={() => copyToClipboard(selectedPhone)}>
                                    <Copy size={14} />
                                </button>
                            </div>
                            {contactInfo?.email && (
                                <div className="contact-field">
                                    <Mail size={16} />
                                    <span>{contactInfo.email}</span>
                                </div>
                            )}
                            {contactInfo?.company && (
                                <div className="contact-field">
                                    <Building2 size={16} />
                                    <span>{contactInfo.company}</span>
                                </div>
                            )}
                            <div className="contact-field id-field">
                                <span className="field-label">ID:</span>
                                <span className="field-value">{contactInfo?.id?.substring(0, 8) || 'N/A'}...</span>
                            </div>
                        </div>

                        {/* Status Widget */}
                        <div className="info-widget status-widget">
                            <h4>Statut</h4>
                            <div className={`status-badge ${getContactStatus(selectedPhone)}`}>
                                <UserCheck size={14} />
                                <span>
                                    {getContactStatus(selectedPhone) === 'qualified' ? 'Qualifié' : 
                                     getContactStatus(selectedPhone) === 'pending' ? 'En attente' :
                                     getContactStatus(selectedPhone) === 'contacted' ? 'Contacté' : 'Nouveau'}
                                </span>
                            </div>
                        </div>

                        {/* Tags Widget */}
                        <div className="info-widget tags-widget">
                            <div className="widget-header">
                                <h4>Tags</h4>
                            </div>
                            <div className="tags-list">
                                {contactInfo?.tags?.length > 0 ? (
                                    contactInfo.tags.map((tag, idx) => (
                                        <span key={idx} className="tag-item">{tag}</span>
                                    ))
                                ) : (
                                    <span className="no-tags">Aucun tag</span>
                                )}
                            </div>
                        </div>

                        {/* Campaigns Widget */}
                        <div className="info-widget campaigns-widget">
                            <div className="widget-header">
                                <h4>Campaigns</h4>
                                <button className="widget-link" onClick={() => navigate('/campaigns')}>
                                    <ExternalLink size={14} />
                                </button>
                            </div>
                            <div className="campaigns-empty">
                                <Megaphone size={24} />
                                <p>No Campaigns Found</p>
                                <span>This contact is not part of any campaigns.</span>
                            </div>
                        </div>
                    </aside>
                )}
            </div>
        </div>
    );
};

export default Conversations;
