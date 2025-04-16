// chat.jsx
import React, { useEffect, useState, useRef } from 'react';

const Chat = ({ username, otherUsername }) => {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const socketRef = useRef(null);
    const sentMessageIds = useRef([]);
    const messagesEndRef = useRef(null);
    const token = localStorage.getItem('access');

    const getRoomName = (user1, user2) => [user1, user2].sort().join('_');
    const roomName = getRoomName(username, otherUsername);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    useEffect(() => {
        const socketUrl = `ws://localhost:8000/ws/chat/${otherUsername}/?token=${token}`;
        console.log('Connecting WebSocket to:', socketUrl);
        const socket = new WebSocket(socketUrl);
        socketRef.current = socket;

        socket.onopen = () => console.log('WebSocket connection opened');

        socket.onmessage = (event) => {
            try {
                console.log('WebSocket message received:', event.data);
                const incomingMessage = JSON.parse(event.data);
                console.log('Parsed incoming message:', incomingMessage);

                if (incomingMessage.temp_id && sentMessageIds.current.includes(incomingMessage.temp_id)) {
                    console.log('Ignoring echoed message with temp_id:', incomingMessage.temp_id);
                    sentMessageIds.current = sentMessageIds.current.filter(id => id !== incomingMessage.temp_id);
                    return;
                }

                setMessages(prev => {
                    const newMessages = [...prev, incomingMessage];
                    console.log('New messages state:', newMessages);
                    return newMessages;
                });
            } catch (error) {
                console.error('Error parsing WebSocket message:', error, event.data);
            }
        };

        socket.onclose = () => console.log('WebSocket connection closed');
        socket.onerror = (error) => console.error('WebSocket error:', error);

        return () => {
            if (socket.readyState === WebSocket.OPEN) {
                console.log('Closing WebSocket connection.');
                socket.close();
            }
        };
    }, [otherUsername, token]); // Changed dependency to otherUsername

    useEffect(() => {
        const fetchMessages = async () => {
            const fetchUrl = `http://localhost:8000/chat/conversation/${otherUsername}/`;
            console.log('Fetching historical messages from:', fetchUrl);
            try {
                const response = await fetch(fetchUrl, {
                    method: 'GET',
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (response.ok) {
                    const data = await response.json();
                    console.log('Historical messages fetched:', data);
                    setMessages(data);
                } else {
                    console.error('Failed to fetch messages:', response.status);
                }
            } catch (err) {
                console.error('Error fetching messages:', err);
            }
        };

        fetchMessages();
    }, [otherUsername, token]);

    const sendMessage = () => {
        if (message && socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
            const tempId = `${Date.now()}-${Math.random()}`;
            const chatMessage = {
                content: message,
                temp_id: tempId,
            };
            console.log('Sending WebSocket message:', chatMessage);
            sentMessageIds.current.push(tempId);

            socketRef.current.send(JSON.stringify(chatMessage));
            setMessage('');
        }
    };

    const formatTimestamp = (timestamp) => new Date(timestamp).toLocaleString();

    console.log('Rendering messages:', messages);

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1rem' }}>
            <h2>Chat with {otherUsername}</h2>
            <div
                style={{
                    height: '400px',
                    overflowY: 'auto',
                    border: '1px solid #ccc',
                    padding: '1rem',
                    backgroundColor: '#f9f9f9',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {messages.map((msg, index) => {
                    console.log('Rendering individual message:', msg);
                    const senderName = typeof msg.sender === 'object' ? msg.sender.username : msg.sender;
                    const isSentByCurrentUser = senderName === username;

                    return (
                        <div
                            key={index}
                            style={{
                                alignSelf: isSentByCurrentUser ? 'flex-end' : 'flex-start',
                                background: isSentByCurrentUser ? '#dcf8c6' : '#ffffff',
                                padding: '8px 12px',
                                borderRadius: '10px',
                                marginBottom: '10px',
                                maxWidth: '75%',
                                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
                            }}
                        >
                            <div style={{ fontWeight: 'bold' }}>{senderName}</div>
                            <div>{msg.content}</div>
                            {msg.timestamp && (
                                <div style={{ fontSize: '0.75rem', color: '#666', marginTop: '4px' }}>
                                    {formatTimestamp(msg.timestamp)}
                                </div>
                            )}
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            <div style={{ display: 'flex', marginTop: '1rem' }}>
                <textarea
                    rows={2}
                    style={{
                        flex: 1,
                        padding: '0.5rem',
                        borderRadius: '5px',
                        border: '1px solid #ccc',
                        resize: 'none',
                    }}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message"
                />
                <button
                    onClick={sendMessage}
                    style={{
                        marginLeft: '10px',
                        padding: '0 20px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '5px',
                        cursor: 'pointer',
                    }}
                >
                    Send
                </button>
            </div>
        </div>
    );
};

export default Chat;