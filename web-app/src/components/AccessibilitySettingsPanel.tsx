export interface AccessibilitySettings {
  boldFirst: boolean;
  boldLast: boolean;
  fontSize: number; // in pixels
}

export const defaultAccessibilitySettings: AccessibilitySettings = {
  boldFirst: false,
  boldLast: false,
  fontSize: 32,
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
    setSettings((prev) => ({ ...prev, [name]: checked }));
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setSettings((prev) => ({ ...prev, fontSize: value }));
  };

  return (
    <div className="absolute top-20 right-6 bg-white shadow-md p-4 rounded-lg z-50">
      <h3 className="text-lg font-bold mb-2">Accessibility Settings</h3>
      <div className="mb-2">
        <label className="mr-2">
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
        <label className="mr-2">
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
        <label className="mr-2">Font Size:</label>
        <input
          type="number"
          value={settings.fontSize}
          onChange={handleFontSizeChange}
          className="border border-gray-300 rounded px-2 py-1 w-20"
        />
        <span className="ml-1">px</span>
      </div>
      <button
        className="mt-2 bg-secondary text-white px-4 py-2 rounded hover:bg-blue-600 transition"
        onClick={onClose}
      >
        Close
      </button>
    </div>
  );
};
