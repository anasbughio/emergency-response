import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
// *** ASSUMPTIONS: ***
// 1. A global/shared Socket.IO client instance is available (e.g., from a context or utility).
import { socket } from '../socket.js'; 
// 2. You have a way to get the current user's ID (e.g., a custom hook).
import {useAuth} from '../context/AuthContext'; 

const IncidentDetails = ({ incidentId }) => {
    // State to hold all messages for the incident
    const [messages, setMessages] = useState([]);
    // State for the message input field
    const [newMessage, setNewMessage] = useState('');
    // Get the current user's ID and name/role for display and sending
    const { user } = useAuth(); // Assuming this hook provides the logged-in user object
    const userId = user?._id; 
    const userName = user?.name || 'Anonymous'; // Fallback for display
    
    // Ref for automatically scrolling to the latest message
    const messagesEndRef = useRef(null);

    // Function to scroll to the bottom of the chat window
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // --- 1. Fetch Initial Chat History ---
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                // Fetch the chat history using the protected REST API route
                const config = {
                    headers: {
                        // Assuming you store the JWT token in localStorage and need it for protected routes
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                };
                const { data } = await axios.get(`/api/messages/${incidentId}`, config);
                setMessages(data);
            } catch (error) {
                console.error('Error fetching chat history:', error.response?.data?.message || error.message);
                // Handle error (e.g., show a toast notification)
            }
        };

        if (incidentId) {
            fetchMessages();
        }
    }, [incidentId]);

    // --- 2. Join Incident Room & 4. Receive Message Listener ---
    useEffect(() => {
        if (!incidentId || !socket) return;
        
        // A. Join Incident Room
        console.log(`Joining room: ${incidentId}`);
        // Emit the event to subscribe the user to the specific chat room
        socket.emit('join_incident_room', incidentId);

        // B. Receive Message Listener
        // Implement a listener to instantly update the local chat state
        const handleNewMessage = (message) => {
            console.log('Received new message:', message);
            // Append the new message to the state
            setMessages((prevMessages) => [...prevMessages, message]);
        };

        socket.on('new_message', handleNewMessage);

        // Cleanup function: Leave the room and remove the listener when the component unmounts
        // or when incidentId changes.
        return () => {
            console.log(`Leaving room: ${incidentId}`);
            socket.emit('leave_incident_room', incidentId); // Assuming you have a server-side handler for this
            socket.off('new_message', handleNewMessage);
        };

    }, [incidentId]); // Rerun effect if the incidentId changes

    // Scroll to the bottom whenever messages state is updated
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // --- 3. Send Message Handler ---
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!newMessage.trim() || !userId) return;

        // Message object to send via socket
        const messagePayload = { 
            incidentId, 
            userId, 
            content: newMessage,
            // Include user data for immediate display without waiting for the server
            // Note: The server should still validate and populate the user data.
            user: { _id: userId, name: userName }
        };

        // Emit the message event instead of using a REST API
        socket.emit('send_message', messagePayload);
        
        // Optimistically add the message to the local state (optional but common for chat apps)
        // Since the server will broadcast the message back via 'new_message', this can cause duplicates
        // if not carefully handled. A safer approach is to wait for the 'new_message' event.
        // For simplicity, we'll rely on the server broadcast (`handleNewMessage`).

        setNewMessage(''); // Clear the input field
    };

    return (
        <div className="incident-detail-chat">
            <h3>💬 Incident Chat History</h3>
            {/* Chat Messages Display Area */}
            <div className="chat-history-box" style={{ height: '400px', overflowY: 'scroll', border: '1px solid #ccc', padding: '10px' }}>
                {messages.length > 0 ? (
                    messages.map((msg, index) => (
                        <div 
                            key={index} 
                            className={`message ${msg.user?._id === userId ? 'my-message' : 'other-message'}`}
                            style={{ 
                                margin: '5px 0', 
                                textAlign: msg.user?._id === userId ? 'right' : 'left' 
                            }}
                        >
                            <div style={{ 
                                display: 'inline-block', 
                                padding: '5px 10px', 
                                borderRadius: '10px', 
                                background: msg.user?._id === userId ? '#dcf8c6' : '#eee',
                                maxWidth: '70%'
                            }}>
                                <span style={{ fontWeight: 'bold', fontSize: '0.8em' }}>
                                    {msg.user?.name || 'System'}
                                </span>
                                <p style={{ margin: '2px 0 0 0' }}>{msg.content}</p>
                                <span style={{ fontSize: '0.7em', color: '#888' }}>
                                    {new Date(msg.createdAt || Date.now()).toLocaleTimeString()}
                                </span>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No messages yet. Start the conversation!</p>
                )}
                <div ref={messagesEndRef} /> {/* Scroll target */}
            </div>
            
            {/* Message Input Form */}
            <form onSubmit={handleSubmit} style={{ marginTop: '10px', display: 'flex' }}>
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message..."
                    required
                    style={{ flexGrow: 1, padding: '10px', border: '1px solid #ccc', borderRadius: '5px 0 0 5px' }}
                />
                <button 
                    type="submit"
                    style={{ padding: '10px 15px', border: 'none', background: '#007bff', color: 'white', borderRadius: '0 5px 5px 0', cursor: 'pointer' }}
                >
                    Send
                </button>
            </form>
        </div>
    );
};

export default IncidentDetails;