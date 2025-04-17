import React, { useEffect, useState, useRef } from 'react';
import { fetchMessages } from '../services/chatService';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';

const Chat = ({ username, otherUsername }) => {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
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
        const socket = new WebSocket(socketUrl);
        socketRef.current = socket;

        socket.onopen = () => console.log('WebSocket connected');

        socket.onmessage = (event) => {
            try {
                const incomingMessage = JSON.parse(event.data);

                if (incomingMessage.temp_id && sentMessageIds.current.includes(incomingMessage.temp_id)) {
                    sentMessageIds.current = sentMessageIds.current.filter(id => id !== incomingMessage.temp_id);
                    return;
                }

                setMessages(prevMessages => {
                    const isDuplicate = prevMessages.some(
                        msg =>
                            msg.sender === incomingMessage.sender &&
                            msg.content === incomingMessage.content &&
                            msg.timestamp === incomingMessage.timestamp
                    );

                    return isDuplicate ? prevMessages : [...prevMessages, incomingMessage];
                });
            } catch (error) {
                console.error('Error parsing WebSocket message:', error, event.data);
            }
        };

        socket.onclose = () => console.log('WebSocket closed');
        socket.onerror = (error) => console.error('WebSocket error:', error);

        return () => {
            if (socket.readyState === WebSocket.OPEN) {
                socket.close();
            }
        };
    }, [otherUsername, token]);

    useEffect(() => {
        const loadMessages = async () => {
            try {
                const data = await fetchMessages(otherUsername);
                setMessages(data);
            } catch (err) {
                console.error('Error fetching messages:', err);
            }
        };
        loadMessages();
    }, [otherUsername]);

    const sendMessage = () => {
        if (message.trim() && socketRef.current?.readyState === WebSocket.OPEN) {
            const tempId = `${Date.now()}-${Math.random()}`;
            const chatMessage = {
                content: message,
                temp_id: tempId,
            };
            sentMessageIds.current.push(tempId);
            socketRef.current.send(JSON.stringify(chatMessage));
            setMessage('');
        }
    };

    const handleChangeMessage = (e) => setMessage(e.target.value);

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    const handleEmojiClick = (emoji) => {
        setMessage(prev => prev + emoji.native);
        setShowEmojiPicker(false);
    };

    const formatTimestamp = (timestamp) => new Date(timestamp).toLocaleString();

    return (
        <div className="flex flex-col flex-1 h-full relative p-4">
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {messages.map((msg, index) => {
                    const senderName = typeof msg.sender === 'object' ? msg.sender.username : msg.sender;
                    const isSentByCurrentUser = senderName === username;

                    return (
                        <div
                            key={index}
                            className={`flex w-full ${isSentByCurrentUser ? 'justify-end' : 'justify-start'}`}
                        >
                            <div
                                className={`max-w-[75%] p-3 rounded-xl shadow-sm ${
                                    isSentByCurrentUser
                                        ? 'bg-blue-100 self-end text-right'
                                        : 'bg-gray-100 self-start text-left'
                                }`}
                            >
                                {!isSentByCurrentUser && (
                                    <div className="font-semibold text-sm text-gray-700">{senderName}</div>
                                )}
                                <div className="text-base whitespace-pre-wrap">{msg.content}</div>
                                {msg.timestamp && (
                                    <div className="text-xs text-gray-500 mt-1">
                                        {formatTimestamp(msg.timestamp)}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="mt-4 flex items-center gap-2">
                <textarea
                    rows={2}
                    value={message}
                    onChange={handleChangeMessage}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message"
                    className="flex-1 p-2 border border-gray-300 rounded-md resize-none focus:outline-none focus:ring focus:ring-blue-200"
                />
                <button
                    onClick={sendMessage}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
                >
                    Send
                </button>
                <button
                    onClick={() => setShowEmojiPicker(prev => !prev)}
                    className="bg-gray-200 px-2 py-2 rounded-md text-xl"
                >
                    😊
                </button>
            </div>

            {showEmojiPicker && (
                <div className="absolute bottom-20 right-4 z-50">
                    <Picker data={data} onEmojiSelect={handleEmojiClick} />
                </div>
            )}
        </div>
    );
};

export default Chat;
