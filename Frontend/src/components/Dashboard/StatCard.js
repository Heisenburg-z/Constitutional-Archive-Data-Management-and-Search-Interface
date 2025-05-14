// src/components/Dashboard/StatCard.js

import React from 'react';

const StatCard = ({ title, value, icon: Icon }) => {
  return (
    <article className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <Icon className="text-blue-600 mb-4" size={24} />
      <h3 className="text-gray-500 text-sm mb-1">{title}</h3>
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
    </article>
  );
};

export default StatCard;