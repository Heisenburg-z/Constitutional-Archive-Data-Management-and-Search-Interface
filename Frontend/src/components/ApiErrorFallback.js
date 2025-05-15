import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Component to display when API calls fail
 * 
 * @param {Object} props
 * @param {Function} props.retryAction - Function to call when retry button is clicked
 * @param {string} props.message - Custom error message to display
 * @param {boolean} props.isHomePageError - Whether this is displayed on the homepage (affects styling)
 */
const ApiErrorFallback = ({ retryAction, message, isHomePageError = false }) => {
  return (
    <div className={`${isHomePageError ? 'w-full max-w-2xl mx-auto' : ''} bg-red-50 border border-red-200 rounded-lg p-4 shadow-sm`}>
      <div className="flex items-start">
        <AlertTriangle className="h-5 w-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-sm font-medium text-red-800">API Connection Error</h3>
          <div className="mt-1 text-sm text-red-700">
            <p>{message || "We're having trouble connecting to our API service."}</p>
            <p className="mt-1">Please check your network connection and API configuration.</p>
          </div>
          <div className="mt-3">
            <button
              type="button"
              onClick={retryAction}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiErrorFallback;