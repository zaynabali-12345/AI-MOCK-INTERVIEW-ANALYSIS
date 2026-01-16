import React, { createContext, useState, useContext } from 'react';

const PanelContext = createContext();

export const usePanel = () => {
    return useContext(PanelContext);
};

export const PanelProvider = ({ children }) => {
    const [activePanel, setActivePanel] = useState(null); // 'features', 'about', or null

    const openPanel = (panelId) => {
        setActivePanel(panelId);
    };

    const closePanel = () => {
        setActivePanel(null);
    };

    const value = {
        activePanel,
        openPanel,
        closePanel,
    };

    return <PanelContext.Provider value={value}>{children}</PanelContext.Provider>;
};