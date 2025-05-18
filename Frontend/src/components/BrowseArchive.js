import React from 'react';
import FileExplorer from './FileExplorer';

const BrowseArchive = () => {
  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <header className="bg-gradient-to-r from-blue-600 to-blue-800 text-white p-6 rounded-lg shadow-md">
        <h1 className="text-3xl font-bold">Browse Archive</h1>
        <p className="text-sm mt-2">Explore documents and folders in the archive.</p>
      </header>
      <section className="mt-6">
        <FileExplorer />
      </section>
    </main>
  );
};

export default BrowseArchive;