import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import './Chat.css';

let socket;

export default function Chat() {
    const { userId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [text, setText] = useState('');
    const [otherUser, setOtherUser] = useState(null);
    const [conversations, setConversations] = useState([]);
    const [connected, setConnected] = useState(false);
    const bottomRef = useRef(null);

    useEffect(() => {
        if (!user) return navigate('/login');

        // Connect socket
        socket = io(import.meta.env.VITE_SOCKET_URL, { query: { userId: user._id } });
        socket.on('connect', () => setConnected(true));
        socket.on('disconnect', () => setConnected(false));
        socket.on('receiveMessage', (msg) => setMessages(prev => [...prev, msg]));

        // Load conversation list for sidebar
        api.get('/messages/conversations/list').then(res => setConversations(res.data)).catch(() => { });

        return () => socket.disconnect();
    }, []);

    useEffect(() => {
        if (!userId || !user) return;
        // Load history + other user info
        api.get(`/messages/${userId}`).then(res => setMessages(res.data)).catch(() => { });
        api.get(`/users/${userId}`).then(res => setOtherUser(res.data.user)).catch(() => { });
    }, [userId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!text.trim()) return;
        const newMsg = {
            conversationId: [user._id, userId].sort().join('_'),
            sender: user._id,
            receiver: userId,
            text,
            createdAt: new Date(),
        };
        setMessages(prev => [...prev, newMsg]);
        setText('');
        socket.emit('sendMessage', { receiverId: userId, message: newMsg });
        await api.post('/messages', { receiverId: userId, text }).catch(() => { });
    };

    const getOtherPerson = (msg) => {
        if (!msg || !user) return null;
        return msg.sender?._id === user._id ? msg.receiver : msg.sender;
    };

    return (
        <div className="chat-page">
            {/* Sidebar: conversation list */}
            <div className="chat-sidebar">
                <div className="chat-sidebar-header">
                    <h3>Messages</h3>
                </div>
                <div className="chat-list">
                    {conversations.length === 0 && (
                        <p className="chat-empty">No conversations yet</p>
                    )}
                    {conversations.map((conv) => {
                        const other = getOtherPerson(conv);
                        if (!other) return null;
                        return (
                            <Link
                                key={conv._id}
                                to={`/chat/${other._id}`}
                                className={`chat-list-item ${userId === other._id ? 'active' : ''}`}
                            >
                                <div className="chat-item-avatar">{other.name?.[0]?.toUpperCase()}</div>
                                <div className="chat-item-info">
                                    <span className="chat-item-name">{other.name}</span>
                                    <span className="chat-item-preview">{conv.text?.slice(0, 30)}...</span>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>

            {/* Main chat panel */}
            <div className="chat-container">
                {userId ? (
                    <>
                        <div className="chat-header">
                            <div className="chat-avatar">{otherUser?.name?.[0]?.toUpperCase()}</div>
                            <div>
                                <h3>{otherUser?.name || 'Loading...'}</h3>
                                <span className={`status-dot ${connected ? 'online' : 'offline'}`}>
                                    ● {connected ? 'Online' : 'Offline'}
                                </span>
                            </div>
                        </div>

                        <div className="chat-messages">
                            {messages.length === 0 && (
                                <div className="chat-no-messages">Send a message to start the conversation!</div>
                            )}
                            {messages.map((msg, i) => (
                                <div key={i} className={`message ${msg.sender === user._id || msg.sender?._id === user._id ? 'mine' : 'theirs'}`}>
                                    <div className="message-bubble">{msg.text}</div>
                                    <span className="message-time">
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
