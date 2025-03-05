import React from 'react';
import { Genre } from '@/types/text';
import { useTextManagementContext } from '@/contexts/textManagementContext';
import NavigateFoundTextsSection from './NavigateDiscoveredTextsSection';

const FindTextSection: React.FC = () => {
  const {
    findTextOptions,
    setFindTextOptions,
    handleFindText,
    isFinding,
    getCurrentText
  } = useTextManagementContext();

  return (
    <div className="space-y-6">
      <label className="text-gray-600 text-sm">
        This feature enables you to search for books from Gutendex&apos;s
        open book library, select your preferred genre and specify the
        desired word count range. Once you click &quot;Find Text&quot;,
        the system will fetch matching book metadata and process the
        content so you can review and approve the text.
      </label>
      <div className="flex flex-wrap gap-4">
        {/* Genre Filter */}
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Genre
          </label>
          <select
            value={findTextOptions.genre}
            onChange={(e) =>
              setFindTextOptions({
                ...findTextOptions,
                genre: e.target.value as Genre,
              })
            }
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {Object.values(Genre).map((gen) => (
              <option key={gen} value={gen}>
                {gen.charAt(0).toUpperCase() + gen.slice(1)}
              </option>
            ))}
          </select>
        </div>
        {/* Word Range Filters */}
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Word Range
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={findTextOptions.minLength}
              onChange={(e) =>
                setFindTextOptions({
                  ...findTextOptions,
                  minLength: parseInt(e.target.value, 10),
                })
              }
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="number"
              placeholder="Max"
              value={findTextOptions.maxLength}
              onChange={(e) =>
                setFindTextOptions({
                  ...findTextOptions,
                  maxLength: parseInt(e.target.value, 10),
                })
              }
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>
      </div>
      <div>
        <button
          onClick={handleFindText}
          disabled={isFinding}
          className="w-full py-3 bg-green-600 text-white rounded-md transition-all duration-200 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isFinding ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Finding...
            </span>
          ) : (
            "Find Text"
          )}
        </button>
      </div>

      {/* Found Texts Navigation */}
      {getCurrentText() && <NavigateFoundTextsSection />}      
    </div>
  );
};

export default FindTextSection;