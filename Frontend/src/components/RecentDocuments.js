import React from 'react';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { getColorClasses } from '../utils/colors';
import { recentDocuments } from '../constants/data';

export const RecentDocuments = () => (
  <section className="py-16">
    <div className="max-w-6xl mx-auto px-6">
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-3xl font-bold">Recently Added Documents</h2>
        <a href="/documents" className="text-blue-600 hover:underline inline-flex items-center font-medium">
          View all
          <ArrowRight className="ml-1 h-4 w-4" />
        </a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recentDocuments.map((doc) => {
          const colorClasses = getColorClasses(doc.color);
          return (
            <div 
              key={doc.id}
              className={`flex rounded-xl border-2 shadow-md transition-all duration-300 hover:shadow-lg overflow-hidden ${colorClasses.border}`}
            >
              <div className={`w-16 ${colorClasses.accent} flex items-center justify-center`}>
                <div className="text-white text-2xl font-bold">
                  {new Date(doc.date).getDate()}
                </div>
              </div>
              <div className="flex-1 p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{doc.title}</h3>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${colorClasses.badge}`}>
                    {doc.category}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-3">{doc.description}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {new Date(doc.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric'
                    })}
                  </span>
                  <a 
                    href={`/documents/${doc.id}`}
                    className={`text-sm font-medium ${colorClasses.text} hover:underline flex items-center`}
                  >
                    View Document
                    <ExternalLink className="ml-1 h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);