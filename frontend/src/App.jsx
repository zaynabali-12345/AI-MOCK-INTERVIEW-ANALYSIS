import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Footer from './components/Footer.jsx';
import './App.css';
import CustomCursor from './components/CustomCursor.jsx'; // Import the CustomCursor component

function App() {
  const location = useLocation();

  // Define the paths where the Navbar and Footer should be hidden
  const hideOnPaths = [
    '/hr-interview',
    '/gd-room', // This will match any route starting with /gd-room/
  ];

  // Check if the current path starts with any of the paths in the hideOnPaths array
  const shouldHide = hideOnPaths.some(path => location.pathname.startsWith(path));

  return (
    <>
      <div className="page-background">
        <div className="page-background-orb"></div>
      </div>
      <div className="App">
        {!shouldHide && <Navbar />}
        <main className="main-content">
          <Outlet />
          <CustomCursor /> {/* Render the custom cursor here */}
        </main>
        {!shouldHide && <Footer />}
      </div>
    </>
  );
}

export default App;
