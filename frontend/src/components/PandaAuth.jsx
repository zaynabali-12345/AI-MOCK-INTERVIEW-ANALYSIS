import React, { useEffect, useState } from 'react';

const PandaAuth = ({ children, title, error }) => {
    const [isPasswordFocused, setPasswordFocused] = useState(false);
    const [isWrongEntry, setWrongEntry] = useState(false);

    useEffect(() => {
        // Panda Eye move
        const handleMouseMove = (event) => {
            const dw = document.documentElement.clientWidth / 15;
            const dh = document.documentElement.clientHeight / 15;
            const x = event.pageX / dw;
            const y = event.pageY / dh;
            const eyeBalls = document.querySelectorAll('.eye-ball');
            eyeBalls.forEach(eye => {
                eye.style.width = `${x}px`;
                eye.style.height = `${y}px`;
            });
        };

        document.addEventListener("mousemove", handleMouseMove);

        return () => {
            document.removeEventListener("mousemove", handleMouseMove);
        };
    }, []);

    useEffect(() => {
        if (error) {
            setWrongEntry(true);
            const timer = setTimeout(() => {
                setWrongEntry(false);
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [error]);

    return (
        <div className="panda-auth-container">
            <div className={`panda ${isWrongEntry ? 'wrong-entry' : ''}`}>
                <div className="ear"></div>
                <div className="face">
                    <div className="eye-shade"></div>
                    <div className="eye-white"><div className="eye-ball"></div></div>
                    <div className="eye-shade rgt"></div>
                    <div className="eye-white rgt"><div className="eye-ball"></div></div>
                    <div className="nose"></div>
                    <div className="mouth"></div>
                </div>
                <div className="body"></div>
                <div className="foot"><div className="finger"></div></div>
                <div className="foot rgt"><div className="finger"></div></div>
            </div>
            <div onFocus={() => setPasswordFocused(true)} onBlur={() => setPasswordFocused(false)}>
                <div className={`panda-form ${isPasswordFocused ? 'up' : ''} ${isWrongEntry ? 'wrong-entry' : ''}`}>
                    <div className="hand"></div>
                    <div className="hand rgt"></div>
                    <h1>{title}</h1>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default PandaAuth;