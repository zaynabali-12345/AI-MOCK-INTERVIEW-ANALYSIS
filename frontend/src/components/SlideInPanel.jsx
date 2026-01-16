import React from 'react';
import './SlideInPanel.css';

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18"></line>
        <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
);

const SlideInPanel = ({ isOpen, onClose, title, children }) => {
    return (
        <div className={`slide-in-panel-overlay ${isOpen ? 'show' : ''}`} onClick={onClose}>
            <div className={`slide-in-panel ${isOpen ? 'show' : ''}`} onClick={(e) => e.stopPropagation()}>
                <button className="panel-close-btn" onClick={onClose}><CloseIcon /></button>
                <h2>{title}</h2>
                <div className="panel-content">{children}</div>
            </div>
        </div>
    );
};

export default SlideInPanel;