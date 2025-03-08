import React from 'react';

interface QuickStartGuideProps {
  mode: number;
}

const QuickStartGuide: React.FC<QuickStartGuideProps> = ({ mode }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold mb-4 flex items-center text-green-600">
        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.18 5 4.05 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
        </svg>
        Quick Start
      </h3>
      <ul className="space-y-3 text-sm text-gray-600">
        {mode === 2 || mode === 3 ? (
          <>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              1. Ensure a stable webcam setup and click Recalibrate
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              2. Configure your chosen text above
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              3. Click &quot;Start Session&quot;
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              4. Use keyboard controls during reading
            </li>
          </>
        ) : (
          <>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              1. Configure your chosen text above
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              2. Click &quot;Start Session&quot;
            </li>
            <li className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full" />
              3. Use keyboard controls during reading
            </li>
          </>
        )}
      </ul>
    </div>
  );
};

export default QuickStartGuide;
