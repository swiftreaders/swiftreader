import React from "react";
import { AccessibilitySettings } from "@/components/AccessibilitySettingsPanel";

const transformText = (
    text: string,
    settings: AccessibilitySettings
  ): React.ReactElement[] => {
    if (!text) return [];
    // Split text by spaces to get individual words.
    const words = text.split(" ");
    return words.map((word, index) => {
      if (word === "") return <span key={index}> </span>;
      // Bold first and/or last letter as per settings.
      const first = word.charAt(0);
      const middle = word.slice(1, word.length - 1);
      const last = word.length > 1 ? word.charAt(word.length - 1) : "";
      return (
        <span key={index}>
          {settings.boldFirst ? (
            <span style={{ fontWeight: "bold" }}>{first}</span>
          ) : (
            first
          )}
          {middle}
          {word.length > 1 && settings.boldLast ? (
            <span style={{ fontWeight: "bold" }}>{last}</span>
          ) : (
            last
          )}
          {index < words.length - 1 ? " " : ""}
        </span>
      );
    });
  };

export default transformText;