"use client";

import { useState } from "react";
import { trainWebGazer } from "./TrainWebGazer"; // (Adjust import path)

export default function Calibration() {
  const [calibrating, setCalibrating] = useState(false);

  const startCalibration = async () => {
    // Make sure webgazer is loaded
    if (typeof window === "undefined" || !(window as any).webgazer) {
      alert("WebGazer not available. Make sure it's initialized first.");
      return;
    }

    setCalibrating(true);
    alert("Look at the red dots to calibrate your gaze.");

    const webgazer = (window as any).webgazer;
    const dots = document.querySelectorAll(".calibration-dot");
    console.log("Found dots:", dots.length);

    // For each dot, show it, record data, hide it, then move on
    for (let i = 0; i < dots.length; i++) {
      const dot = dots[i] as HTMLElement;
      dot.classList.add("active");

      // Get the dot's center on screen
      const rect = dot.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Repeatedly record this position for ~2 seconds
      const recordInterval = setInterval(() => {
        webgazer.recordScreenPosition(centerX, centerY);
      }, 50);

      // Wait 2 seconds while user stares at this dot
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Stop recording and hide dot
      clearInterval(recordInterval);
      dot.classList.remove("active");

      // Optional short pause before moving to the next dot
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    // Now call our helper to train the regression
    trainWebGazer();
    alert("Calibration complete!");
    setCalibrating(false);
  };

  return (
    <div>
      <button onClick={startCalibration} disabled={calibrating}>
        {calibrating ? "Calibrating..." : "Start Calibration"}
      </button>

      {/* Render the dot elements */}
      <div className="calibration-container">
        {[...Array(9)].map((_, i) => (
          <div key={i} className="calibration-dot" />
        ))}
      </div>

      <style jsx>{`
        .calibration-container {
          position: fixed;
          inset: 0; /* top: 0; right: 0; bottom: 0; left: 0; */
          pointer-events: none;
        }
        .calibration-dot {
          position: absolute;
          width: 20px;
          height: 20px;
          background: red;
          border-radius: 50%;
          opacity: 0;
          transition: opacity 0.3s;
        }
        .calibration-dot.active {
          opacity: 1;
        }

        /* Example positions */
        .calibration-dot:nth-child(1) {
          top: 10%;
          left: 10%;
        }
        .calibration-dot:nth-child(2) {
          top: 10%;
          left: 50%;
        }
        .calibration-dot:nth-child(3) {
          top: 10%;
          right: 10%;
        }
        .calibration-dot:nth-child(4) {
          top: 50%;
          left: 10%;
        }
        .calibration-dot:nth-child(5) {
          top: 50%;
          left: 50%;
        }
        .calibration-dot:nth-child(6) {
          top: 50%;
          right: 10%;
        }
        .calibration-dot:nth-child(7) {
          bottom: 10%;
          left: 10%;
        }
        .calibration-dot:nth-child(8) {
          bottom: 10%;
          left: 50%;
        }
        .calibration-dot:nth-child(9) {
          bottom: 10%;
          right: 10%;
        }
      `}</style>
    </div>
  );
}
