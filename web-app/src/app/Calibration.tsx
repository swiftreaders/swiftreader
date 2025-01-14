"use client";
import { useState } from "react";

export default function Calibration() {
  const [calibrating, setCalibrating] = useState(false);

  const startCalibration = () => {
    setCalibrating(true);
    alert("Look at the red dots to calibrate your gaze.");

    // Select the dots
    const dots = document.querySelectorAll(".calibration-dot");
    console.log("Found dots:", dots.length); // Debug

    let index = 0;
    const intervalId = setInterval(() => {
      if (index < dots.length) {
        // Show this dot
        const dot = dots[index]; // capture at this moment
        dot.classList.add("active");

        setTimeout(() => {
            dot.classList.remove("active"); 
            console.log("removed dot!");
        }, 1000);


        index += 1;
      } else {
        clearInterval(intervalId);
        setCalibrating(false);
        alert("Calibration complete!");
      }
    }, 1500);
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
