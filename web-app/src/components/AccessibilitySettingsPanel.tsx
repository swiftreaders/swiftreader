// Preview
import React from 'react';

interface AccessibilityPreviewProps {
  settings: AccessibilitySettings;
}

export const AccessibilityPreview = ({ settings }: AccessibilityPreviewProps) => {
  const sampleText = `Sample Text`;

  // Function to apply bold styling to the first and last letter of each word
  const formatText = (text: string) => {
    return text.split(' ').map((word, index) => {
      if (word.length === 0) return word; // Skip empty words (e.g., multiple spaces)

      const firstChar = settings.boldFirst ? <strong>{word[0]}</strong> : word[0];
      const lastChar = settings.boldLast ? <strong>{word[word.length - 1]}</strong> : word[word.length - 1];
      const middle = word.slice(1, -1);

      return (
        <span key={index}>
          {firstChar}
          {middle}
          {lastChar}
          {index < text.split(' ').length - 1 ? ' ' : ''} {/* Add space between words */}
        </span>
      );
    });
  };

  return (
    <div
      className="flex items-center justify-center p-4 rounded-lg"
      style={{
        padding: `${settings.readingBoxPadding}px`,
        backgroundColor: settings.readingBoxBackground,
        border: settings.readingBoxBorder,
      }}
    >
      <div
        style={{
          fontFamily: settings.fontFamily,
          fontSize: `${settings.fontSize}px`,
          lineHeight: settings.lineHeight,
          color: settings.textColor,
          textAlign: 'center', // Center text horizontally
        }}
      >
        <p>{formatText(sampleText)}</p>
      </div>
    </div>
  );
};

export interface AccessibilitySettings {
  boldFirst: boolean;
  boldLast: boolean;
  fontSize: number; // in pixels
  // New properties
  readingBoxPadding: number;
  readingBoxBackground: string;
  readingBoxBorder: string;
  fontFamily: string;
  lineHeight: number;
  textColor: string;
}

function isDarkMode(): boolean {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export const defaultAccessibilitySettings: AccessibilitySettings = {
  boldFirst: false,
  boldLast: false,
  fontSize: 32,
  readingBoxPadding: 32,
  readingBoxBackground: isDarkMode() ? '#1f2937' : '#f3f4f6', // gray-800 for dark, gray-200 for light
  readingBoxBorder: `1px solid ${isDarkMode() ? '#374151' : '#e5e7eb'}`, // gray-700 for dark, gray-200 for light
  fontFamily: 'sans-serif',
  lineHeight: 1.5,
  textColor: isDarkMode() ? '#f5f5f5' : '#1f2937',
};

interface AccessibilitySettingsPanelProps {
  settings: AccessibilitySettings;
  setSettings: React.Dispatch<React.SetStateAction<AccessibilitySettings>>;
  onClose: () => void;
}

export const AccessibilitySettingsPanel = ({
  settings,
  setSettings,
  onClose,
}: AccessibilitySettingsPanelProps) => {
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setSettings(prev => ({ ...prev, [name]: checked }));
  };

  const handleNumberChange = (name: keyof AccessibilitySettings) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
  
      // Allow empty input or intermediate values (e.g., "1" when typing "16")
      // But don't update the state yet
      if (value === "" || /^\d+$/.test(value)) {
        // Store the raw value in the input without updating the state
        e.target.value = value;
      }
    };
  
  const handleNumberBlur = (name: keyof AccessibilitySettings) => 
    (e: React.FocusEvent<HTMLInputElement>) => {
      let value = parseInt(e.target.value, 10);
  
      // Clamp the value between 10 and 64 only when the input loses focus
      if (isNaN(value)) {
        value = 10; // Default to the lower bound if the input is empty or invalid
      } else {
        value = Math.max(10, Math.min(64, value));
      }
  
      // Update the state with the clamped value
      setSettings(prev => ({ ...prev, [name]: value }));
  
      // Update the input value to reflect the clamped value
      e.target.value = value.toString();
    };

  const handleColorChange = (name: keyof AccessibilitySettings) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSettings(prev => ({ ...prev, [name]: e.target.value }));
    };

  const handleSelectChange = (name: keyof AccessibilitySettings) => 
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSettings(prev => ({ ...prev, [name]: e.target.value }));
    };

    return (
      <div className="absolute top-24 right-6 bg-white dark:bg-black shadow-xl p-6 rounded-2xl z-50 min-w-[340px] border border-gray-100 dark:border-gray-800">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Accessibility Settings</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close settings"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <AccessibilityPreview settings={settings} />
        
        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Text Settings */}
          <div className="space-y-4">
            <h4 className="font-semibold border-b pb-2">Text Settings</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Font Family</label>
                <select
                  value={settings.fontFamily}
                  onChange={handleSelectChange('fontFamily')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="sans-serif">Sans Serif</option>
                  <option value="serif">Serif</option>
                  <option value="monospace">Monospace</option>
                  <option value="openDyslexic">OpenDyslexic</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">Text Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.textColor}
                    onChange={handleColorChange('textColor')}
                    className="w-10 h-10 rounded-md border border-gray-300 cursor-pointer"
                  />
                  <span className="text-sm">{settings.textColor}</span>
                </div>
              </div>
  
              <div className="space-y-2 col-span-2">
                <label className="block text-sm font-medium">
                  Line Height: {settings.lineHeight}x
                </label>
                <input
                  type="range"
                  min="1"
                  max="3"
                  step="0.1"
                  value={settings.lineHeight}
                  onChange={handleNumberChange('lineHeight')}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
  
          {/* Reading Box Settings */}
          <div className="space-y-4">
            <h4 className="font-semibold border-b pb-2">Reading Box</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Padding (px)</label>
                <input
                  type="number"
                  defaultValue={settings.readingBoxPadding}
                  onChange={handleNumberChange('readingBoxPadding')}
                  onBlur={handleNumberBlur('readingBoxPadding')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  min="10"
                  max="64"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">Background</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.readingBoxBackground}
                    onChange={handleColorChange('readingBoxBackground')}
                    className="w-10 h-10 rounded-md border border-gray-300 cursor-pointer"
                  />
                  <span className="text-sm">{settings.readingBoxBackground}</span>
                </div>
              </div>
  
              <div className="space-y-2 col-span-2">
                <label className="block text-sm font-medium">Border Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={settings.readingBoxBorder.split(' ')[2] || '#e5e7eb'}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      readingBoxBorder: `1px solid ${e.target.value}`
                    }))}
                    className="w-10 h-10 rounded-md border border-gray-300 cursor-pointer"
                  />
                  <span className="text-sm">
                    {settings.readingBoxBorder.split(' ')[2]}
                  </span>
                </div>
              </div>
            </div>
          </div>
  
          {/* Original Settings */}
          <div className="space-y-4">
            <h4 className="font-semibold border-b pb-2">Text Formatting</h4>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  name="boldFirst"
                  checked={settings.boldFirst}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm">Bold First Letter</span>
              </label>
              <label className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg">
                <input
                  type="checkbox"
                  name="boldLast"
                  checked={settings.boldLast}
                  onChange={handleCheckboxChange}
                  className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-sm">Bold Last Letter</span>
              </label>
              <div className="space-y-2">
                <label className="block text-sm font-medium">Font Size (px)</label>
                <input
                  type="number"
                  defaultValue={settings.fontSize}
                  onChange={handleNumberChange('fontSize')}
                  onBlur={handleNumberBlur('fontSize')}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                  min="10"
                  max="64"
                />
              </div>
            </div>
          </div>
        </div>
  
        <div className="mt-6 border-t pt-4">
          <button
            onClick={onClose}
            className="w-full bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Apply Settings
          </button>
        </div>
      </div>
    );
};
