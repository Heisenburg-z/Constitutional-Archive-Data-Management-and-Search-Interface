import { getColorClasses, escapeRegExp } from '../../utils/colors';
import { BookMarked, ArrowRight } from 'lucide-react';

export const DocumentCard = ({ result, index, query }) => {
  const colors = ['blue', 'green', 'red', 'purple', 'amber', 'teal'];
  const color = colors[index % colors.length];
  const colorClasses = getColorClasses(color);
  const formattedDate = result.date ? new Date(result.date).toLocaleDateString() : '';

  const getFileIcon = (type) => {
    if (type?.includes('pdf')) return '📄';
    if (type?.includes('html')) return '🌐';
    if (type?.includes('word')) return '📝';
    return '📁';
  };

  const getFileCategory = (type, name) => {
    const lowerName = name.toLowerCase();
    if (type?.includes('pdf')) return 'PDF Document';
    if (type?.includes('html')) return 'Web Document';
    if (type?.includes('word')) return 'Word Document';
    if (lowerName.includes('amendment')) return 'Amendment';
    if (lowerName.includes('chapter')) return 'Chapter';
    if (lowerName.includes('schedule')) return 'Schedule';
    if (lowerName.includes('constitution')) return 'Constitution';
    return 'Document';
  };

  const category = getFileCategory(result.type, result.name);

  return (
    <div className={`group rounded-xl overflow-hidden border-2 transition-all duration-300 shadow-md hover:shadow-xl ${colorClasses.border}`}>
      <div className={`flex items-center justify-between p-4 ${colorClasses.bg}`}>
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${colorClasses.accent} text-white shadow-md`}>
            <BookMarked className="h-4 w-4" />
          </div>
          <h3 className="ml-2 font-bold truncate">{result.name}</h3>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${colorClasses.badge} shadow-sm`}>
          {category}
        </div>
      </div>

      <div className="bg-white p-5 relative">
        <div className="whitespace-pre-line text-gray-700 text-sm leading-relaxed mb-4 max-h-32 overflow-hidden relative">
          {result.snippet.split(new RegExp(`(${escapeRegExp(query)})`, 'gi')).map((part, i) =>
            i % 2 === 1 ? (
              <mark key={i} className="bg-yellow-200 px-1 rounded-sm">
                {part}
              </mark>
            ) : (
              part
            )
          )}
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white to-transparent" />
        </div>

        <div className="pt-2 mt-2 border-t flex items-center justify-between">
          <div className="flex items-center text-sm text-gray-500">
            <span className="mr-2">{getFileIcon(result.type)}</span>
            {formattedDate && <span>Last modified: {formattedDate}</span>}
          </div>
          <a
            href={result.url}
            className={`inline-flex items-center px-4 py-2 rounded-lg ${colorClasses.accent} text-white hover:opacity-90 transition-opacity text-sm font-medium shadow-md`}
          >
            View Document
            <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
};