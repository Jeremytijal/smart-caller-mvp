import React, { useState, useEffect } from 'react';
import { Search, MoreVertical, Phone, Video, Send, Edit2, Check, Power, User } from 'lucide-react';
import { supabase } from '../supabaseClient';
import './Conversations.css';

const Conversations = () => {
    const [conversations, setConversations] = useState([]);
    const [selectedPhone, setSelectedPhone] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAutoPilot, setIsAutoPilot] = useState(true);

    // Fetch all messages and group them by phone number
    useEffect(() => {
        fetchConversations();

        // Real-time subscription
        const channel = supabase
            .channel('public:messages')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
                console.log('New message received:', payload.new);
                fetchConversations(); // Refresh list on new message
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    const fetchConversations = async () => {
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('*')
                .order('created_at', { ascending: true });

            if (error) throw error;

            // Group by phone number
            const grouped = {};
            data.forEach(msg => {
                if (!grouped[msg.phone_number]) {
                    grouped[msg.phone_number] = {
                        phone: msg.phone_number,
                        messages: [],
                        lastMessage: '',
                        time: '',
                        unread: 0, // TODO: Implement unread logic
                        status: 'pending', // TODO: Implement status logic
                        sentiment: 'neutral' // TODO: Implement sentiment logic
                    };
                }
                grouped[msg.phone_number].messages.push(msg);
                grouped[msg.phone_number].lastMessage = msg.content;
                grouped[msg.phone_number].time = new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
        // TODO: Implement manual send via Backend API
        alert("L'envoi manuel n'est pas encore connecté au backend.");
    };

    if (loading) {
        return <div className="p-8 text-center text-white">Chargement des conversations...</div>;
    }

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
                                        <User size={20} />
                                    </div>
                                    <div className="conversation-info">
                                        <div className="conversation-header">
                                            <span className="user-name">{chat.phone}</span>
                                            <span className="time">{chat.time}</span>
                                        </div>
                                        <p className="last-message truncate">{chat.lastMessage}</p>
                                    </div>
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
                                    <div className="avatar qualified"><User size={20} /></div>
                                    <div>
                                        <h3>{selectedPhone}</h3>
                                        <span className="status-text">Lead</span>
                                    </div>
                                </div>
                                <div className="chat-actions">
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
                                <input type="text" placeholder={isAutoPilot ? "L'IA gère cette conversation..." : "Écrivez un message..."} disabled={isAutoPilot} />
                                <button className="btn-primary send-btn" disabled={isAutoPilot} onClick={() => handleSendMessage("Test")}>
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
