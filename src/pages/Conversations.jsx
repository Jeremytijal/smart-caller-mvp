import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, MoreVertical, Phone, Video, Send, Edit2, Check, Power, User, Download, FileText } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { isDemoMode, demoConversations } from '../data/demoData';
import './Conversations.css';

const Conversations = () => {
    const { user } = useAuth();
    const [searchParams] = useSearchParams();
    const phoneFromUrl = searchParams.get('phone');
    
    const [conversations, setConversations] = useState([]);
    const [selectedPhone, setSelectedPhone] = useState(phoneFromUrl || null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAutoPilot, setIsAutoPilot] = useState(true);
    const [isDemo, setIsDemo] = useState(false);

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
                
                // Real-time subscription filtered by agent_id
                const channel = supabase
                    .channel('public:messages')
                    .on('postgres_changes', { 
                        event: 'INSERT', 
                        schema: 'public', 
                        table: 'messages',
                        filter: `agent_id=eq.${user?.id}` 
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

    const loadDemoConversations = () => {
        // Transform demo conversations
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
            status: conv.contact.status
        }));

        setConversations(transformed);
        
        // Auto-select first or URL-specified conversation
        if (phoneFromUrl) {
            setSelectedPhone(phoneFromUrl);
        } else if (transformed.length > 0) {
            setSelectedPhone(transformed[0].phone);
        }
        
        setLoading(false);
    };

    // Normalize phone number to consistent format
    const normalizePhone = (phone) => {
        if (!phone) return '';
        // Remove all non-digit characters except leading +
        let cleaned = phone.replace(/[^\d+]/g, '');
        // If starts with 33, add + prefix
        if (cleaned.startsWith('33') && !cleaned.startsWith('+')) {
            cleaned = '+' + cleaned;
        }
        // If starts with 0, convert to +33
        if (cleaned.startsWith('0')) {
            cleaned = '+33' + cleaned.substring(1);
        }
        return cleaned;
    };

    const fetchConversations = async () => {
        if (!user) return;

        try {
            // Fetch messages only for this user's agent_id
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .eq('agent_id', user.id)
                .order('created_at', { ascending: true });

            if (error) throw error;

            // Group by normalized phone number to avoid duplicates
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
                        status: 'pending'
                    };
                }
                grouped[normalizedPhone].messages.push(msg);
                grouped[normalizedPhone].lastMessage = msg.content;
                grouped[normalizedPhone].time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            });

            // Convert to array and sort by latest message
            const sortedConversations = Object.values(grouped).sort((a, b) => {
                const lastA = a.messages[a.messages.length - 1].created_at;
                const lastB = b.messages[b.messages.length - 1].created_at;
                return new Date(lastB) - new Date(lastA);
            });

            setConversations(sortedConversations);

            // Select first conversation by default if none selected
            if (!selectedPhone && sortedConversations.length > 0) {
                setSelectedPhone(sortedConversations[0].phone);
            }

            setLoading(false);
        } catch (error) {
            console.error('Error fetching conversations:', error);
            setLoading(false);
        }
    };

    // Update displayed messages when selection changes or data updates
    useEffect(() => {
        if (selectedPhone) {
            const currentConv = conversations.find(c => c.phone === selectedPhone);
            if (currentConv) {
                setMessages(currentConv.messages);
            }
        }
    }, [selectedPhone, conversations]);

    const handleSendMessage = async (text) => {
        if (isDemo) {
            alert("Mode démo : l'envoi de messages est désactivé.");
            return;
        }
        alert("L'envoi manuel n'est pas encore connecté au backend.");
    };

    const getContactName = (phone) => {
        const conv = conversations.find(c => c.phone === phone);
        return conv?.contact?.name || phone;
    };

    const getContactStatus = (phone) => {
        const conv = conversations.find(c => c.phone === phone);
        return conv?.contact?.status || 'pending';
    };

    // Export conversation to text file
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

    if (loading) {
        return <div className="p-8 text-center">Chargement des conversations...</div>;
    }

    return (
        <div className="page-container conversations-page">
            {isDemo && (
                <div className="demo-banner">
                    <span>🎯 Mode Démo - Conversations simulées</span>
                </div>
            )}
            
            <div className="glass-panel conversations-layout">
                {/* Sidebar List */}
                <div className="chat-sidebar">
                    <div className="chat-search">
                        <Search size={20} className="search-icon" />
                        <input type="text" placeholder="Rechercher..." />
                    </div>

                    <div className="conversations-list">
                        {conversations.length === 0 ? (
                            <div className="p-4 text-center text-gray-400">Aucune conversation</div>
                        ) : (
                            conversations.map((chat) => (
                                <div
                                    key={chat.phone}
                                    className={`conversation-item ${selectedPhone === chat.phone ? 'active' : ''}`}
                                    onClick={() => setSelectedPhone(chat.phone)}
                                >
                                    <div className={`avatar ${chat.status}`}>
                                        {chat.contact ? (
                                            <span className="avatar-initials">
                                                {chat.contact.name.split(' ').map(n => n[0]).join('')}
                                            </span>
                                        ) : (
                                            <User size={20} />
                                        )}
                                    </div>
                                    <div className="conversation-info">
                                        <div className="conversation-header">
                                            <span className="user-name">{chat.contact?.name || chat.phone}</span>
                                            <span className="time">{chat.time}</span>
                                        </div>
                                        <p className="last-message truncate">{chat.lastMessage}</p>
                                        {chat.contact?.company && (
                                            <span className="company-name">{chat.contact.company}</span>
                                        )}
                                    </div>
                                    {chat.unread > 0 && (
                                        <div className="unread-badge">{chat.unread}</div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Chat Area */}
                <div className="chat-area">
                    {selectedPhone ? (
                        <>
                            <div className="chat-header">
                                <div className="chat-user-info">
                                    <div className={`avatar ${getContactStatus(selectedPhone)}`}>
                                        <span className="avatar-initials">
                                            {getContactName(selectedPhone).split(' ').map(n => n[0]).join('').substring(0, 2)}
                                        </span>
                                    </div>
                                    <div>
                                        <h3>{getContactName(selectedPhone)}</h3>
                                        <span className="status-text">
                                            {getContactStatus(selectedPhone) === 'qualified' ? '✅ Qualifié' : 
                                             getContactStatus(selectedPhone) === 'pending' ? '⏳ En attente' :
                                             getContactStatus(selectedPhone) === 'contacted' ? '📱 Contacté' : 'Lead'}
                                        </span>
                                    </div>
                                </div>
                                <div className="chat-actions">
                                    <button 
                                        className="btn-icon-sm" 
                                        title="Exporter la conversation"
                                        onClick={() => exportConversation(selectedPhone)}
                                    >
                                        <Download size={18} />
                                    </button>
                                    <div className={`auto-pilot-toggle ${isAutoPilot ? 'active' : ''}`} onClick={() => setIsAutoPilot(!isAutoPilot)}>
                                        <Power size={16} />
                                        <span>{isAutoPilot ? 'Auto-Pilot ON' : 'Mode Manuel'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="messages-container">
                                {messages.map((msg) => (
                                    <div key={msg.id} className={`message-wrapper ${msg.role === 'user' ? 'user' : 'ai'}`}>
                                        <div className="message-bubble">
                                            {msg.content}
                                        </div>
                                        <span className="message-time">
                                            {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                ))}
                            </div>

                            <div className={`chat-input-area ${!isAutoPilot ? 'manual-mode' : ''}`}>
                                <input 
                                    type="text" 
                                    placeholder={isAutoPilot ? "L'IA gère cette conversation..." : "Écrivez un message..."} 
                                    disabled={isAutoPilot} 
                                />
                                <button 
                                    className="btn-primary send-btn" 
                                    disabled={isAutoPilot} 
                                    onClick={() => handleSendMessage("Test")}
                                >
                                    <Send size={20} />
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            Sélectionnez une conversation
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Conversations;
