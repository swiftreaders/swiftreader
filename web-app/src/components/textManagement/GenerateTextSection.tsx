import React from 'react';
import { Category } from '@/types/text';
import NavigateFoundTextsSection from './NavigateDiscoveredTextsSection';
import { useTextManagementContext } from '@/contexts/textManagementContext';

const GenerateTextSection: React.FC = () => {
  const {
    generateTextOptions,
    setGenerateTextOptions,
    handleGenerateText,
    isGenerating,
    getCurrentText,
  } = useTextManagementContext();

  return (
    <div className="space-y-6">
      <p className="text-gray-600 text-sm">
        This feature generates AI-created non-fiction passages for reading comprehension. 
        Select the category and word range, then generate new texts.
      </p>
      <div className="flex flex-wrap gap-4">
        {/* Category Selection */}
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            value={generateTextOptions.category}
            onChange={(e) =>
              setGenerateTextOptions({
                ...generateTextOptions,
                category: e.target.value as Category,
              })
            }
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            {Object.values(Category).map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>
        {/* Word Range Selection */}
        <div className="flex-1 min-w-[150px]">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Word Range
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              placeholder="Min"
              value={generateTextOptions.minLength}
              onChange={(e) =>
                setGenerateTextOptions({
                  ...generateTextOptions,
                  minLength: parseInt(e.target.value, 10),
                })
              }
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
            <input
              type="number"
              placeholder="Max"
              value={generateTextOptions.maxLength}
              onChange={(e) =>
                setGenerateTextOptions({
                  ...generateTextOptions,
                  maxLength: parseInt(e.target.value, 10),
                })
              }
              className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>
      </div>
      <button
        onClick={handleGenerateText}
        disabled={isGenerating}
        className="w-full py-3 bg-green-600 text-white rounded-md transition-all duration-200 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isGenerating ? "Generating..." : "Generate Texts"}
      </button>
    
      {getCurrentText() && <NavigateFoundTextsSection />}
    </div>
  );
};

export default GenerateTextSection;