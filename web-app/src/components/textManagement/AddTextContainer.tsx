import React from 'react';
import { useTextManagementContext } from '@/contexts/textManagementContext';
import ManualTextSection from './ManualTextSection';
import FindTextSection from './FindTextSection';
import GenerateTextSection from './GenerateTextSection';

const TextManagementSection: React.FC = () => {
  const { activeTab, setActiveTab } = useTextManagementContext();
  
  return (
    <section className="bg-white rounded-lg shadow-xl p-6 mb-8">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">
        Add New Text
      </h2>
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveTab("manual")}
          className={`flex-1 py-2 rounded-md transition-all duration-200 ${
            activeTab === "manual"
              ? "bg-indigo-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Manual
        </button>
        <button
          onClick={() => setActiveTab("find")}
          className={`flex-1 py-2 rounded-md transition-all duration-200 ${
            activeTab === "find"
              ? "bg-indigo-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Find
        </button>
        <button
          onClick={() => setActiveTab("generate")}
          className={`flex-1 py-2 rounded-md transition-all duration-200 ${
            activeTab === "generate"
              ? "bg-indigo-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          Generate
        </button>
      </div>


      {activeTab === "manual" ? (
        <ManualTextSection />
      ) : activeTab === "find" ? (
        <FindTextSection />
      ) : (
        <GenerateTextSection />
      )}
    </section>
  );
};

export default TextManagementSection;