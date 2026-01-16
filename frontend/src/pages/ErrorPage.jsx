import React from 'react';
import { useRouteError, Link } from 'react-router-dom';
import './ErrorPage.css';

export default function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  return (
    <div id="error-page">
      <div className="error-content">
        <h1 className="error-status">{error.status || 'Oops!'}</h1>
        <p className="error-status-text">
          {error.statusText || 'Sorry, an unexpected error has occurred.'}
        </p>
        <p className="error-message">
          <i>{error.data || error.message}</i>
        </p>
        <Link to="/" className="home-link">
          Go back to the homepage
        </Link>
      </div>
    </div>
  );
}