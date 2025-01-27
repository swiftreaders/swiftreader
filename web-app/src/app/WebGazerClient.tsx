"use client";

import { useEffect } from "react";

export default function WebGazerClient() {
  useEffect(() => {
    const webgazer = (window as any).webgazer;
    if (webgazer) {
      // Configure your WebGazer parameters here
      console.log("Configuring WebGazer in WebGazerClient...");

      // For example, turn off the mouse fallback:
      webgazer.params.useMouseData = false;
      document.onmousemove = null;

      // If you want the built-in red predictions:
      webgazer.showPredictionPoints(true);

      // If you want to hide or show the camera video:
      webgazer.showVideoPreview(false);

      // You could also modify the in-browser video feed size:
      webgazer.params.videoViewerWidth = window.innerWidth;
      webgazer.params.videoViewerHeight = window.innerHeight;
    } else {
      console.log("WebGazer not yet defined in WebGazerClient.");
    }
  }, []);

  return (
    <p style={{ display: "none" }}>
      {/* This component is only for configuring WebGazer. */}
    </p>
  );
}
