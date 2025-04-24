import React, { useEffect, useState, useRef, useContext } from 'react';
import { fetchMessages } from '../services/chatService';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import { AuthContext } from '../context/AuthContext';

const Chat = ({ otherUsername }) => {
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const socketRef = useRef(null);
    const sentMessageIds = useRef([]);
    const messagesEndRef = useRef(null);
    const emojiPickerRef = useRef(null);
    const token = localStorage.getItem('access');
    const { user } = useContext(AuthContext);
    const username = user?.username;

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

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (showEmojiPicker && emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showEmojiPicker]);

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
    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    return (
        <div className="flex flex-col h-full bg-gray-900 text-gray-300 rounded-lg shadow-xl">

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {messages.map((msg, index) => {
                    const senderName = typeof msg.sender === 'object' ? msg.sender.username : msg.sender;
                    const isSentByCurrentUser = senderName === username;
                    const messageBg = isSentByCurrentUser ? 'bg-purple-600' : 'bg-gray-700';
                    const messageTextColor = 'text-gray-100';
                    const senderTextColor = isSentByCurrentUser ? 'text-indigo-300' : 'text-teal-300';
                    const timestampTextColor = isSentByCurrentUser ? 'text-gray-200' : 'text-gray-400';

                    return (
                        <div
                            key={msg.id || msg.temp_id || index}
                            className={`flex w-full ${isSentByCurrentUser ? 'justify-end' : 'justify-start'}`}
                        >
                            <div className={`max-w-[80%] p-3 rounded-lg shadow-md ${messageBg} ${messageTextColor}`}>
                                {!isSentByCurrentUser && (
                                    <div className={`font-semibold text-sm mb-1 ${senderTextColor}`}>{senderName}</div>
                                )}
                                <div className="text-base whitespace-pre-wrap">{msg.content}</div>
                                {msg.timestamp && (
                                    <div className={`text-xs ${timestampTextColor} mt-1 text-right`}>
                                        {formatTimestamp(msg.timestamp)}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area - fixed at bottom via flex layout */}
            <div className="p-4 border-t border-gray-700 bg-gray-800">
                <div className="flex items-center gap-3">
                    <div className="relative flex items-center gap-2">
                        <button
                            onClick={() => setShowEmojiPicker(prev => !prev)}
                            className="bg-gray-700 text-gray-300 hover:text-white px-3 py-2 rounded-md text-xl"
                        >
                            😊
                        </button>
                        {showEmojiPicker && (
                            <div className="absolute bottom-12 left-0 z-50" ref={emojiPickerRef}>
                                <Picker data={data} onEmojiSelect={handleEmojiClick} theme="dark" />
                            </div>
                        )}
                    </div>
                    <textarea
                        rows={1}
                        value={message}
                        onChange={handleChangeMessage}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your message..."
                        className="flex-1 p-3 border border-gray-700 bg-gray-900 text-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none shadow-sm placeholder-gray-500"
                    />
                    <button
                        onClick={sendMessage}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-semibold transition shadow"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Chat;
