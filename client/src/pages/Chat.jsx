import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './Chat.css';

let ws = null;

export default function Chat() {
    const { userId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [otherUser, setOtherUser] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [connected, setConnected] = useState(false);
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const bottomRef = useRef(null);

    useEffect(() => {
        if (!user) return navigate('/login');

        // Connect to FastAPI WebSocket
        const wsUrl = (import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000')
            .replace('http://', 'ws://')
            .replace('https://', 'wss://');

        ws = new WebSocket(`${wsUrl}/ws?userId=${user.id}`);

        ws.onopen = () => setConnected(true);
        ws.onclose = () => setConnected(false);

        const fetchConvos = () => {
            api.get('/messages/conversations/list')
                .then(res => setConversations(res.data))
                .catch(() => { });
        };
        fetchConvos();

        return () => {
            ws?.close();
            ws = null;
        };
    }, [user, navigate]);

    useEffect(() => {
        if (!user) return;
        if (!userId) {
            if (ws) {
                ws.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    if (data.type === 'online_users') {
                        setOnlineUsers(new Set(data.users));
                    } else if (data.type === 'status') {
                        setOnlineUsers(prev => {
                            const next = new Set(prev);
                            if (data.online) next.add(data.userId);
                            else next.delete(data.userId);
                            return next;
                        });
                    } else if (data.message) {
                        api.get('/messages/conversations/list').then(res => setConversations(res.data)).catch(() => { });
                    }
                };
            }
            return;
        }

        api.get(`/messages/${userId}`).then(res => setMessages(res.data)).catch(() => { });
        api.get(`/users/${userId}`).then(res => setOtherUser(res.data.user)).catch(() => { });

        if (ws) {
            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type === 'online_users') {
                    setOnlineUsers(new Set(data.users));
                } else if (data.type === 'status') {
                    setOnlineUsers(prev => {
                        const next = new Set(prev);
                        if (data.online) next.add(data.userId);
                        else next.delete(data.userId);
                        return next;
                    });
                } else if (data.message) {
                    if (data.message.sender_id === userId || data.message.receiver_id === userId) {
                        setMessages(prev => [...prev, data.message]);
                    }
                    api.get('/messages/conversations/list').then(res => setConversations(res.data)).catch(() => { });
                }
            };
        }
    }, [userId, user]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;

        const newMsg = {
            conversation_id: [user.id, userId].sort().join('_'),
            sender_id: user.id,
            receiver_id: userId,
            text,
            created_at: new Date(),
        };

        setMessages(prev => [...prev, newMsg]);
        setText('');

        // Send via WebSocket for real-time delivery
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ receiverId: userId, message: newMsg }));
        }

        // Persist to DB via REST
        await api.post('/messages', { receiver_id: userId, text }).catch(() => { });
    };

    const getOtherPerson = (msg) => {
        if (!msg || !user) return null;
        return msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;
    };

    return (
        <div className="chat-page">
            {/* Sidebar */}
            <div className="chat-sidebar">
                <div className="chat-sidebar-header">
                    <h3>Messages</h3>
                </div>
                <div className="chat-list">
                    {conversations.length === 0 && (
                        <p className="chat-empty">No conversations yet</p>
                    )}
                    {conversations.map((conv) => {
                        const otherId = conv.sender_id === user.id ? conv.receiver_id : conv.sender_id;
                        const isUnread = !conv.is_read && conv.receiver_id === user.id;
                        return (
                            <Link
                                key={conv.id}
                                to={`/chat/${otherId}`}
                                className={`chat-list-item ${userId === otherId ? 'active' : ''} ${isUnread ? 'has-unread' : ''}`}
                            >
                                <div className="chat-item-avatar">{otherId?.[0]?.toUpperCase()}</div>
                                <div className="chat-item-info">
                                    <span className="chat-item-name">
                                        {otherId}
                                        {isUnread && <span className="unread-dot">⬤</span>}
                                    </span>
                                    <span className={`chat-item-preview ${isUnread ? 'unread-text' : ''}`}>{conv.text?.slice(0, 30)}...</span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Main chat */}
            <div className="chat-container">
                {userId ? (
                    <>
                        <div className="chat-header">
                            <div className="chat-avatar">{otherUser?.name?.[0]?.toUpperCase()}</div>
                            <div>
                                <h3>{otherUser?.name || 'Loading...'}</h3>
                                <span className={`status-dot ${onlineUsers.has(userId) ? 'online' : 'offline'}`}>
                                    ● {onlineUsers.has(userId) ? 'Online' : 'Offline'}
                                </span>
                            </div>
                        </div>

                        <div className="chat-messages">
                            {messages.length === 0 && (
                                <div className="chat-no-messages">Send a message to start the conversation!</div>
                            )}
                            {messages.map((msg, i) => (
                                <div key={i} className={`message ${msg.sender_id === user.id ? 'mine' : 'theirs'}`}>
                                    <div className="message-bubble">{msg.text}</div>
                                    <span className="message-time">
                                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            ))}
                            <div ref={bottomRef} />
                        </div>

                        <form onSubmit={sendMessage} className="chat-input-area">
                            <input
                                value={text}
                                onChange={e => setText(e.target.value)}
                                placeholder="Type a message..."
                                autoFocus
                            />
                            <button type="submit" disabled={!text.trim()}>Send ↑</button>
                        </form>
                    </>
                ) : (
                    <div className="chat-placeholder">
                        <p>👈 Select a conversation to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
}
