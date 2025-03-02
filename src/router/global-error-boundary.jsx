import React from "react";
import { useNavigate, useRouteError } from "react-router-dom";

const GlobalErrorBoundary = () => {
  const error = useRouteError();
 const navigate = useNavigate();
  if (error?.status === 404) {
    return (
      <div>
        <h1>Page Not Found!</h1>
        <p>The page you're looking for doesn't exist.</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }
  return (
    <div>
        <h1>Something went wrong!</h1>
        <p>An unexpected error occurred.</p>
        <button onClick={() => window.location.reload()}>Try again</button>
      </div>
  );
};

export default GlobalErrorBoundary;
