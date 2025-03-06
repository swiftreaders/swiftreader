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

export const defaultAccessibilitySettings: AccessibilitySettings = {
  boldFirst: false,
  boldLast: false,
  fontSize: 32,
  readingBoxPadding: 32,
  readingBoxBackground: '#f3f4f6', // Default gray-200
  readingBoxBorder: '1px solid #e5e7eb', // Default gray-200 border
  fontFamily: 'sans-serif',
  lineHeight: 1.5,
  textColor: '#1f2937', // Default gray-800
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
      const value = parseInt(e.target.value, 10);
      setSettings(prev => ({ ...prev, [name]: value }));
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
    <div className="absolute top-20 right-6 bg-white shadow-md p-4 rounded-lg z-50 min-w-[300px]">
      <h3 className="text-lg font-bold mb-2">Accessibility Settings</h3>
      
      {/* Text Settings */}
      <div className="mb-4 border-b pb-4">
        <h4 className="font-medium mb-2">Text Settings</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Font Family</label>
            <select
              value={settings.fontFamily}
              onChange={handleSelectChange('fontFamily')}
              className="w-full border rounded p-1"
            >
              <option value="sans-serif">Sans Serif</option>
              <option value="serif">Serif</option>
              <option value="monospace">Monospace</option>
              <option value="arial">Arial</option>
              <option value="verdana">Verdana</option>
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Text Color</label>
            <input
              type="color"
              value={settings.textColor}
              onChange={handleColorChange('textColor')}
              className="w-full h-8"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Line Height</label>
            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={settings.lineHeight}
              onChange={handleNumberChange('lineHeight')}
              className="w-full"
            />
            <span className="text-xs">{settings.lineHeight}x</span>
          </div>
        </div>
      </div>

      {/* Reading Box Settings */}
      <div className="mb-4 border-b pb-4">
        <h4 className="font-medium mb-2">Reading Box</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">Padding (px)</label>
            <input
              type="number"
              value={settings.readingBoxPadding}
              onChange={handleNumberChange('readingBoxPadding')}
              className="w-full border rounded p-1"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Background</label>
            <input
              type="color"
              value={settings.readingBoxBackground}
              onChange={handleColorChange('readingBoxBackground')}
              className="w-full h-8"
            />
          </div>
          <div>
            <label className="block text-sm mb-1">Border</label>
            <input
              type="color"
              value={settings.readingBoxBorder?.split(' ')[2] || '#e5e7eb'}  // Extract color from border string
              onChange={(e) => setSettings(prev => ({
                ...prev,
                readingBoxBorder: `1px solid ${e.target.value}`
              }))}
              className="w-full h-8"
            />
          </div>
        </div>
      </div>

      {/* Original Settings */}
      <div className="mb-4">
        <div className="mb-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="boldFirst"
              checked={settings.boldFirst}
              onChange={handleCheckboxChange}
            />
            Bold First Letter
          </label>
        </div>
        <div className="mb-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="boldLast"
              checked={settings.boldLast}
              onChange={handleCheckboxChange}
            />
            Bold Last Letter
          </label>
        </div>
        <div className="mb-2">
          <label className="block text-sm mb-1">Font Size (px)</label>
          <input
            type="number"
            value={settings.fontSize}
            onChange={handleNumberChange('fontSize')}
            className="w-full border rounded p-1"
          />
        </div>
      </div>

      <button
        className="mt-2 bg-secondary text-white px-4 py-2 rounded hover:bg-blue-600 transition w-full"
        onClick={onClose}
      >
        Close
      </button>
    </div>
  );
};