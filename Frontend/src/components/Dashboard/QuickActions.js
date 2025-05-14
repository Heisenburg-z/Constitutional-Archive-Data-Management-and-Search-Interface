// src/components/Dashboard/QuickActions.js

import React from 'react';
import { FileText, Upload } from 'lucide-react';

const QuickActions = ({ generateReport, setShowUploadModal }) => {
  return (
    <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
      <ul className="space-y-3">
        <li>
          <button 
            onClick={generateReport}
            className="w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <FileText size={18} className="text-blue-600" />
            Generate Report
          </button>
        </li>
        <li>
          <button 
            onClick={() => setShowUploadModal(true)}
            className="w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <Upload size={18} className="text-blue-600" />
            Upload Document
          </button>
        </li>
      </ul>
    </section>
  );
};

export default QuickActions;