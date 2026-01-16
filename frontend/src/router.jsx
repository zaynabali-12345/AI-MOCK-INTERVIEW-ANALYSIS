import React from "react";
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import AnalysisPage from './pages/AnalysisPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import App from './App.jsx';
// Import the new components
import CreateRoom from './pages/GroupDiscussion/CreateRoom.jsx';
import HRForm from './pages/HRForm.jsx';
import HRInterview from './pages/HRInterview.jsx'; // Import the HR Interview component
import InterviewReview from './pages/InterviewReviewPage.jsx'; // Import the new page
import CompanyReviewDetails from './pages/CompanyReviewDetails.jsx'; // Import the details page
import CareerAdvisor from './pages/CareerAdvisor.jsx'; 
import JobPlatformRankings from './pages/JobTracker/JobPlatformRankings.jsx';
import GDRoom from './pages/GroupDiscussion/GroupDiscussionRoom.jsx'; // Corrected import path
import GDWaitingRoom from './pages/GroupDiscussion/GDWaitingRoom.jsx'; // Import the new waiting room
import GDFinalFeedback from './pages/GroupDiscussion/GDFinalFeedback.jsx'; // Import the new feedback page
import HRFinalFeedback from './pages/HRFinalFeedback.jsx'; // Import the new HR feedback page
import ErrorPage from './pages/ErrorPage.jsx'; // Import the Error Page

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />, // Add top-level error boundary
    children: [
      { index: true, element: <Home /> },
      { path: 'login', element: <Login /> },
      { path: 'signup', element: <Signup /> },
      { path: 'analyze', element: <AnalysisPage /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'gd', element: <CreateRoom /> }, // The GD lobby
      { path: 'gd/wait/:roomId', element: <GDWaitingRoom /> }, // The new waiting room
      { path: 'gd-room/:roomId', element: <GDRoom /> }, // The actual discussion room
      { path: 'gd-feedback', element: <GDFinalFeedback /> }, // The new feedback page
      { path: 'hr-form', element: <HRForm /> }, // Corrected route object syntax
      { path: 'hr-feedback/:interviewId', element: <HRFinalFeedback /> }, // The new HR feedback page
      { path: 'hr-interview', element: <HRInterview /> }, // Corrected path for the HR interview
      { path: 'interview-review', element: <InterviewReview /> }, // The main review page with company cards
      { path: 'interview-review/:companyName', element: <CompanyReviewDetails /> }, // The new details page
      { path: 'career-advisor', element: <CareerAdvisor /> }, // New route for Career Advisor
      { path: 'job-tracker', element: <JobPlatformRankings /> }, // New route for Job Tracker
    ],
  },
]);

const AppRouter = () => <RouterProvider router={router} />;

export default AppRouter;
