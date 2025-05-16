import React from 'react';
import { FileText, RefreshCw } from 'lucide-react';

/**
 * Component displayed when API encounters an error
 */
const ApiErrorFallback = ({ retryAction, message }) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8 text-center">
      <div className="bg-red-100 inline-flex items-center justify-center w-12 h-12 rounded-full mb-4">
        <FileText className="h-6 w-6 text-red-500" />
      </div>
      
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {message || 'Unable to connect to the server'}
      </h3>
      
      <p className="text-gray-600 mb-4">
        We're experiencing some technical difficulties. Please try again later.
      </p>
      
      {retryAction && (
        <button
          onClick={retryAction}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry Connection
        </button>
      )}
    </div>
  );
};

export default ApiErrorFallback;