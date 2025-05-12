import React from 'react';
import { BookMarked } from 'lucide-react';
import AnimatedNavMenu from './AnimatedNavMenu';

export const Header = () => (
  <header className="bg-gradient-to-r from-gray-900 to-blue-900 text-white py-6 shadow-lg">
    <nav className="max-w-6xl mx-auto px-6 flex justify-between items-center">
      <a href="/" className="flex items-center">
        <div className="bg-blue-600 p-2 rounded-lg mr-3">
          <BookMarked className="h-6 w-6" />
        </div>
        <h1 className="text-2xl font-bold">Constitutional Archive</h1>
      </a>
      <AnimatedNavMenu />
      <a href="/admin" className="bg-blue-600 px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition shadow-md">
        Admin Login
      </a>
    </nav>
  </header>
);