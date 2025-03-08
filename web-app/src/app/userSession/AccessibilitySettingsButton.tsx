import React, { useState } from 'react';
import { AccessibilitySettings, AccessibilitySettingsPanel, defaultAccessibilitySettings } from "@/components/AccessibilitySettingsPanel";

interface AccessibilitySettingsButtonProps {
  sessionStarted: boolean;
}

const AccessibilitySettingsButton: React.FC<AccessibilitySettingsButtonProps> = ({ sessionStarted }) => {
  const [showAccessibilityPanel, setShowAccessibilityPanel] = useState(false);
  const [accessibilitySettings, setAccessibilitySettings] = useState<AccessibilitySettings>(defaultAccessibilitySettings);

  return (
    <>
      <button
        onClick={() => {
          if (!sessionStarted) {
            setShowAccessibilityPanel(!showAccessibilityPanel);
          }
        }}
        className={`absolute top-6 left-6 bg-secondary text-white px-4 py-2 rounded transition ${
          sessionStarted ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
        }`}
        disabled={sessionStarted}
      >
        Accessibility Settings
      </button>
      {showAccessibilityPanel && (
        <AccessibilitySettingsPanel
          settings={accessibilitySettings}
          setSettings={setAccessibilitySettings}
          onClose={() => setShowAccessibilityPanel(false)}
        />
      )}
    </>
  );
};

export default AccessibilitySettingsButton;
