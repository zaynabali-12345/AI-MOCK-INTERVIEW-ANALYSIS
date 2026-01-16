import React, { useState, useEffect, useRef } from 'react';
import chatbotService from '../services/chatbotService';
import CuteRobot from './CuteRobot'; // Import the 3D robot component
import './Chatbot.css';

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

const SendIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <line x1="22" y1="2" x2="11" y2="13"></line>
        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
    </svg>
);

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: "Hi! I'm Ace, your AI career coach. Ask me anything about interviews or resumes!" }
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        const userMessage = inputValue.trim();
        if (!userMessage) return;

        const newMessages = [...messages, { role: 'user', content: userMessage }];
        setMessages(newMessages);
        setInputValue('');
        setIsLoading(true);

        try {
            const history = newMessages.map(({ role, content }) => ({ role, content }));
            const response = await chatbotService.sendMessage(history);
            const aiMessage = response.data.text;
            setMessages(prev => [...prev, { role: 'assistant', content: aiMessage }]);
        } catch (error) {
            console.error("Error sending message:", error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting. Please try again later." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <div className={`chatbot-window ${isOpen ? 'open' : ''}`}>
                <div className="chatbot-header">
                    <h3>AI Career Coach</h3>
                    <button onClick={() => setIsOpen(false)} className="close-btn"><CloseIcon /></button>
                </div>
                <div className="message-list">
                    {messages.map((msg, index) => (
                        <div key={index} className={`message ${msg.role === 'user' ? 'user-message' : 'ai-message'}`}>
                            {msg.content}
                        </div>
                    ))}
                    {isLoading && <div className="typing-indicator"><span></span><span></span><span></span></div>}
                    <div ref={messagesEndRef} />
                </div>
                <form onSubmit={handleSendMessage} className="chat-input-container">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Ask for interview tips..."
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading}><SendIcon /></button>
                </form>
            </div>

            <button onClick={() => setIsOpen(true)} className="chatbot-fab">
                <span className="chatbot-tooltip">Ask Help</span>
                {/* Replace the SVG icon with the 3D Robot Component */}
                <CuteRobot />
            </button>
        </>
    );
};

export default Chatbot;