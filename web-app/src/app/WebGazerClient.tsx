"use client";

import { useEffect, useState } from "react";
import Script from "next/script";

export default function WebGazerClient() {
  const [webGazerLoaded, setWebGazerLoaded] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && webGazerLoaded) {
      const wg = (window as any).webgazer;
      if (wg) {
        console.log("WebGazer initialized:", wg);
        wg.params.useMouseData = false;
        document.onmousemove = null; // Disable mouse-based fallback
        // Here we tell WebGazer to match the full browser window
        wg.params.videoViewerWidth = window.innerWidth;
        wg.params.videoViewerHeight = window.innerHeight;
        wg
          .setGazeListener((data: any) => {
            console.log("Gaze data:", data); // Debug gaze data
            if (data) {
              const highlight = document.getElementById("highlight");
              if (highlight) {
                highlight.style.left = data.x + "px";
                highlight.style.top = data.y + "px";
              }
            }
          })
          .begin()
          .then(() => console.log("WebGazer has started successfully!"))
          .catch((err: any) => console.error("WebGazer failed to start:", err));
        wg.showPredictionPoints(true);
        wg.showVideoPreview(false);
      } else {
        console.error("WebGazer is not available on window.");
      }
    }
  }, [webGazerLoaded]);

  return (
    <>
      <Script
        src="https://webgazer.cs.brown.edu/webgazer.js"
        strategy="lazyOnload"
        onLoad={() => {
          console.log("WebGazer script loaded successfully!");
          setWebGazerLoaded(true); // Indicate the script is ready
        }}
        onError={() => console.error("Failed to load WebGazer script.")}
      />
    </>
  );
}
