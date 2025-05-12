import React from 'react';
import { BookMarked, ArrowRight } from 'lucide-react';
import { getColorClasses } from '../utils/colors';
import { featuredCollections } from '../constants/data';

export const FeaturedCollections = () => (
  <section className="py-16 bg-blue-50">
    <div className="max-w-6xl mx-auto px-6">
      <h2 className="text-3xl font-bold mb-10 text-center">Featured Collections</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {featuredCollections.map((collection) => {
          const colorClasses = getColorClasses(collection.color);
          return (
            <div 
              key={collection.id} 
              className={`rounded-xl border-2 shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl ${colorClasses.border}`}
            >
              <div className="h-40 bg-gray-200 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-gray-900/70"></div>
                <div className="absolute bottom-4 left-4 right-4 text-white">
                  <h3 className="text-xl font-bold">{collection.title}</h3>
                  <div className="flex items-center mt-1">
                    <BookMarked className="h-4 w-4 mr-1" />
                    <span className="text-sm">{collection.count} documents</span>
                  </div>
                </div>
              </div>
              <div className={`p-5 ${colorClasses.bg}`}>
                <p className="text-gray-700 mb-4">{collection.description}</p>
                <a 
                  href={`/collections/${collection.id}`}
                  className={`flex items-center justify-center w-full p-3 rounded-lg ${colorClasses.accent} text-white font-medium transition-transform hover:scale-105 shadow-md`}
                >
                  Explore Collection
                  <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  </section>
);