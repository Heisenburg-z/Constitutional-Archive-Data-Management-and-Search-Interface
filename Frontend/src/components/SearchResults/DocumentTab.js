// components/SearchResults/DocumentTab.js
import { DocumentCard } from './DocumentCard';

export const DocumentTab = ({ results, query }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {results.map((result, index) => (
      <DocumentCard 
        key={result.id} 
        result={result} 
        index={index}
        query={query}
      />
    ))}
  </div>
);