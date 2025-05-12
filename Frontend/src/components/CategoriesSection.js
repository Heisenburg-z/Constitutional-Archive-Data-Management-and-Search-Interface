import React from 'react';
import { getColorClasses } from '../utils/colors';
import { categories } from '../constants/data';

export const CategoriesSection = () => (
  <section className="py-16 bg-gradient-to-b from-blue-50 to-white">
    <div className="max-w-6xl mx-auto px-6">
      <h2 className="text-3xl font-bold mb-10 text-center">Browse By Category</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((category, index) => {
          const colors = ['blue', 'green', 'red', 'purple', 'amber', 'teal'];
          const colorIndex = index % colors.length;
          const color = colors[colorIndex];
          const colorClasses = getColorClasses(color);
          return (
            <a 
              key={category.name} 
              href={`/categories/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
              className={`rounded-xl border-2 p-4 flex flex-col items-center text-center ${colorClasses.border} ${colorClasses.bg} hover:shadow-lg transition-shadow duration-300`}
            >
              <div className="text-3xl mb-2">{category.icon}</div>
              <h3 className="font-bold mb-1">{category.name}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${colorClasses.badge}`}>
                {category.count} documents
              </span>
            </a>
          );
        })}
      </div>
    </div>
  </section>
);