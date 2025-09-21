import React, { useState, useEffect, useRef } from 'react';
import api from '../services/api';
import websocketService from '../services/websocket';

const Chat = ({ user }) => {
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    // Debug logging
    console.log('Chat component render - messages:', messages, 'type:', typeof messages, 'isArray:', Array.isArray(messages));
    console.log('Current user:', user, 'User ID:', user?.id);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                console.log('Fetching messages...');
                const response = await api.get('/messages');
                console.log('Messages response:', response.data);
                
                // Handle different response formats
                let messagesData = [];
                if (Array.isArray(response.data)) {
                    messagesData = response.data;
                } else if (Array.isArray(response.data.messages)) {
                    messagesData = response.data.messages;
                } else if (Array.isArray(response.data.data)) {
                    messagesData = response.data.data;
                } else {
                    console.warn('Unexpected messages response format:', response.data);
                    messagesData = [];
                }
                
                // Ensure each message has the proper structure
                const validMessages = messagesData.filter(msg => 
                    msg && (typeof msg.message === 'string' || typeof msg.content === 'string')
                );
                
                console.log('Processed messages data:', validMessages);
                setMessages(validMessages);
            } catch (error) {
                console.error('Error fetching messages:', error);
                // Set empty array on error to prevent map issues
                setMessages([]);
            }
        };

        const connectWebSocket = async () => {
            const token = localStorage.getItem('token');
            try {
                console.log('Attempting WebSocket connection...');
                setConnectionStatus('connecting');
                await websocketService.connect(token);
                console.log('WebSocket connected successfully');
                setConnectionStatus('connected');
            } catch (error) {
                console.error('Failed to connect to WebSocket:', error);
                setConnectionStatus('disconnected');
                
                // Try to reconnect after 5 seconds
                setTimeout(() => {
                    console.log('Retrying WebSocket connection...');
                    connectWebSocket();
                }, 5000);
            }
        };

        const handleMessage = (data) => {
            if (data.type === 'message') {
                // Ensure we have a properly formatted message
                const messageData = data.message || data;
                
                if (messageData) {
                    setMessages((prevMessages) => {
                        // Ensure prevMessages is always an array
                        const currentMessages = Array.isArray(prevMessages) ? prevMessages : [];
                        
                        // Simple duplicate check by ID or recent timestamp
                        const messageExists = currentMessages.some(existingMsg => 
                            existingMsg.id === messageData.id
                        );
                        
                        if (messageExists) {
                            return currentMessages;
                        }
                        
                        return [...currentMessages, messageData];
                    });
                }
            } else if (data.type === 'typing') {
                // Only show typing for other users, not yourself
                if (data.userId !== user.id) {
                    setIsTyping(data.isTyping);
                }
            }
        };

        const handleConnection = (status) => {
            setConnectionStatus(status);
        };

        fetchMessages();
        connectWebSocket();

        websocketService.addMessageHandler(handleMessage);
        websocketService.addConnectionHandler(handleConnection);

        return () => {
            websocketService.removeMessageHandler(handleMessage);
            websocketService.removeConnectionHandler(handleConnection);
            websocketService.disconnect();
        };
    }, [user.id]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        // Send via HTTP API for persistence (primary method)
        try {
            const response = await api.post('/messages', { 
                message: newMessage 
            });
            
            console.log('Message sent successfully:', response.data);
            
            // Extract the actual message data from the response
            const messageData = response.data.message || response.data;
            console.log('API response structure:', response.data);
            console.log('Extracted messageData:', messageData);
            console.log('messageData.message:', messageData.message);
            
            // DON'T add to local state here - let WebSocket handle it to avoid duplicates
            // This way all messages come through WebSocket consistently
            
            // Send via WebSocket for real-time delivery to all users (including yourself)
            websocketService.sendMessage({
                type: 'message',
                message: messageData
            });
            
            // Clear typing indicator after sending message
            websocketService.sendMessage({
                type: 'typing',
                userId: user.id,
                isTyping: false
            });
            
            setNewMessage('');
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    const handleTyping = (e) => {
        const value = e.target.value;
        setNewMessage(value);
        
        // Send typing indicator via WebSocket
        websocketService.sendMessage({
            type: 'typing',
            userId: user.id,
            isTyping: value.length > 0
        });
    };

    const formatTime = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: true 
        });
    };

    const getConnectionStatusColor = () => {
        switch (connectionStatus) {
            case 'connected': return '#4ade80';
            case 'connecting': return '#facc15';
            case 'disconnected': return '#ef4444';
            default: return '#6b7280';
        }
    };

    return (
        <div className="chat-container">
            {/* Header */}
            <div className="chat-header">
                <div className="header-content">
                    <h2>💬 Chat Room</h2>
                    <div className="connection-status">
                        <div 
                            className="status-indicator"
                            style={{ backgroundColor: getConnectionStatusColor() }}
                        ></div>
                        <span className="status-text">
                            {connectionStatus === 'connected' ? 'Online' : 
                             connectionStatus === 'connecting' ? 'Connecting...' : 'Offline'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="messages-container">
                {!Array.isArray(messages) || messages.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">💭</div>
                        <p>{!Array.isArray(messages) ? 'Loading messages...' : 'No messages yet. Start the conversation!'}</p>
                    </div>
                ) : (
                    messages.map((msg, index) => {
                        // Debug the message comparison
                        console.log('Message user_id:', msg.user_id, 'Current user id:', user?.id, 'Are equal:', msg.user_id === user?.id);
                        
                        // Ensure robust comparison by converting to strings
                        const isOwnMessage = String(msg.user_id) === String(user?.id);
                        const showAvatar = index === 0 || messages[index - 1].user_id !== msg.user_id;
                        
                        return (
                            <div 
                                key={msg._id || msg.id || index}
                                className={`message-wrapper ${isOwnMessage ? 'own-message' : 'other-message'}`}
                            >
                                {!isOwnMessage && showAvatar && (
                                    <div className="avatar">
                                        {(msg.user?.name || 'U')[0].toUpperCase()}
                                    </div>
                                )}
                                
                                <div className="message-content">
                                    {!isOwnMessage && showAvatar && (
                                        <div className="sender-name">
                                            {msg.user?.name || 'Unknown User'}
                                        </div>
                                    )}
                                    
                                    <div className={`message-bubble ${isOwnMessage ? 'own' : 'other'}`}>
                                        <span className="message-text">
                                            {(() => {
                                                // Add proper debugging to see the exact structure
                                                console.log('Message object:', msg);
                                                console.log('msg.message:', msg.message);
                                                console.log('typeof msg.message:', typeof msg.message);
                                                
                                                // Handle all possible cases safely
                                                if (typeof msg === 'string') {
                                                    return msg;
                                                }
                                                
                                                // Try different properties and ensure they're strings
                                                const messageText = msg.message || msg.content || msg.text;
                                                
                                                if (typeof messageText === 'string') {
                                                    return messageText;
                                                } else if (messageText && typeof messageText === 'object') {
                                                    // If message is nested deeper
                                                    return messageText.message || messageText.content || messageText.text || JSON.stringify(messageText);
                                                }
                                                
                                                return 'Message format not supported';
                                            })()}
                                        </span>
                                        <div className="message-time">
                                            {formatTime(msg.created_at || msg.timestamp)}
                                        </div>
                                    </div>
                                </div>
                                
                                {isOwnMessage && showAvatar && (
                                    <div className="avatar own">
                                        {(user?.name || 'Y')[0].toUpperCase()}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
                
                {isTyping && (
                    <div className="typing-indicator">
                        <div className="typing-dots">
                            <div className="dot"></div>
                            <div className="dot"></div>
                            <div className="dot"></div>
                        </div>
                        <span>Someone is typing...</span>
                    </div>
                )}
                
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="message-input-container">
                <div className="input-wrapper">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={handleTyping}
                        placeholder="Type your message..."
                        className="message-input"
                        disabled={connectionStatus !== 'connected'}
                    />
                    <button 
                        type="submit" 
                        className="send-button"
                        disabled={!newMessage.trim() || connectionStatus !== 'connected'}
                    >
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M2 21L23 12L2 3V10L17 12L2 14V21Z" fill="currentColor"/>
                        </svg>
                    </button>
                </div>
            </form>

            <style jsx>{`
                .chat-container {
                    display: flex;
                    flex-direction: column;
                    height: 100vh;
                    max-height: 600px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    border-radius: 20px;
                    overflow: hidden;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                    margin: 20px;
                }

                .chat-header {
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(10px);
                    padding: 20px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
                }

                .header-content {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }

                .header-content h2 {
                    margin: 0;
                    color: #1f2937;
                    font-size: 1.5rem;
                    font-weight: 600;
                }

                .connection-status {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .status-indicator {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    animation: pulse 2s infinite;
                }

                .status-text {
                    font-size: 0.875rem;
                    color: #6b7280;
                    font-weight: 500;
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }

                .messages-container {
                    flex: 1;
                    overflow-y: auto;
                    padding: 20px;
                    background: rgba(255, 255, 255, 0.9);
                    backdrop-filter: blur(10px);
                }

                .empty-state {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    text-align: center;
                    color: #6b7280;
                }

                .empty-icon {
                    font-size: 4rem;
                    margin-bottom: 1rem;
                    opacity: 0.5;
                }

                .message-wrapper {
                    display: flex;
                    margin-bottom: 16px;
                    align-items: flex-end;
                    gap: 8px;
                }

                .message-wrapper.own-message {
                    flex-direction: row-reverse;
                }

                .avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-weight: 600;
                    font-size: 1rem;
                    flex-shrink: 0;
                }

                .avatar.own {
                    background: linear-gradient(135deg, #4ade80, #22c55e);
                }

                .message-content {
                    max-width: 70%;
                }

                .sender-name {
                    font-size: 0.75rem;
                    color: #6b7280;
                    margin-bottom: 4px;
                    margin-left: 12px;
                    font-weight: 500;
                }

                .message-bubble {
                    padding: 12px 16px;
                    border-radius: 18px;
                    position: relative;
                    word-wrap: break-word;
                    max-width: 100%;
                }

                .message-bubble.other {
                    background: #f3f4f6;
                    color: #1f2937;
                    border-bottom-left-radius: 4px;
                }

                .message-bubble.own {
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    border-bottom-right-radius: 4px;
                }

                .message-text {
                    display: block;
                    line-height: 1.4;
                }

                .message-time {
                    font-size: 0.7rem;
                    opacity: 0.7;
                    margin-top: 4px;
                    text-align: right;
                }

                .typing-indicator {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 12px 16px;
                    color: #6b7280;
                    font-style: italic;
                    font-size: 0.875rem;
                }

                .typing-dots {
                    display: flex;
                    gap: 4px;
                }

                .dot {
                    width: 6px;
                    height: 6px;
                    background: #6b7280;
                    border-radius: 50%;
                    animation: typing 1.4s infinite ease-in-out;
                }

                .dot:nth-child(1) { animation-delay: -0.32s; }
                .dot:nth-child(2) { animation-delay: -0.16s; }

                @keyframes typing {
                    0%, 80%, 100% {
                        transform: scale(0);
                        opacity: 0.5;
                    }
                    40% {
                        transform: scale(1);
                        opacity: 1;
                    }
                }

                .message-input-container {
                    padding: 20px;
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(10px);
                    border-top: 1px solid rgba(255, 255, 255, 0.2);
                }

                .input-wrapper {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    background: white;
                    border-radius: 25px;
                    padding: 4px;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }

                .message-input {
                    flex: 1;
                    border: none;
                    outline: none;
                    padding: 12px 16px;
                    font-size: 1rem;
                    background: transparent;
                    color: #1f2937;
                }

                .message-input::placeholder {
                    color: #9ca3af;
                }

                .message-input:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .send-button {
                    width: 44px;
                    height: 44px;
                    border: none;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #667eea, #764ba2);
                    color: white;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }

                .send-button:hover:not(:disabled) {
                    transform: scale(1.05);
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
                }

                .send-button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    transform: none;
                }

                /* Scrollbar styling */
                .messages-container::-webkit-scrollbar {
                    width: 6px;
                }

                .messages-container::-webkit-scrollbar-track {
                    background: transparent;
                }

                .messages-container::-webkit-scrollbar-thumb {
                    background: rgba(102, 126, 234, 0.3);
                    border-radius: 3px;
                }

                .messages-container::-webkit-scrollbar-thumb:hover {
                    background: rgba(102, 126, 234, 0.5);
                }

                /* Responsive design */
                @media (max-width: 768px) {
                    .chat-container {
                        margin: 10px;
                        border-radius: 15px;
                    }

                    .message-content {
                        max-width: 85%;
                    }

                    .avatar {
                        width: 32px;
                        height: 32px;
                        font-size: 0.875rem;
                    }
                }
            `}</style>
        </div>
    );
};

export default Chat;