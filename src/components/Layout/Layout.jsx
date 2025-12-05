import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import OnboardingTour from '../OnboardingTour/OnboardingTour';
import './Layout.css';

const Layout = () => {
    const location = useLocation();
    const [showTour, setShowTour] = useState(false);

    useEffect(() => {
        // Show tour only on first visit to dashboard
        const tourCompleted = localStorage.getItem('smartcaller_tour_completed');
        if (!tourCompleted && location.pathname === '/') {
            // Small delay to let the page render
            setTimeout(() => setShowTour(true), 500);
        }
    }, [location.pathname]);

    return (
        <div className="app-layout">
            <Sidebar />
            <main className="main-content">
                <Outlet />
            </main>
            {showTour && <OnboardingTour onComplete={() => setShowTour(false)} />}
        </div>
    );
};

export default Layout;
