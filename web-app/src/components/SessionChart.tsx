// components/SessionChart.tsx
"use client";

import { Chart, LinearScale, CategoryScale, LineController, LineElement, PointElement } from "chart.js";
import { useEffect, useRef } from "react";

Chart.register(LinearScale, CategoryScale, LineController, LineElement, PointElement);

interface SessionChartProps {
  wpmData: number[];
}

export const SessionChart = ({ wpmData }: SessionChartProps) => {
  const chartRef = useRef<Chart | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      if (chartRef.current) {
        chartRef.current.destroy();
      }

      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        chartRef.current = new Chart(ctx, {
          type: "line",
          data: {
            labels: wpmData.map((_, i) => `${(i + 1) * 5}s`),
            datasets: [
              {
                label: "Words Per Minute",
                data: wpmData,
                borderColor: "rgb(59, 130, 246)",
                tension: 0.1,
              },
            ],
          },
          options: {
            responsive: true,
            scales: {
              y: { beginAtZero: true, title: { display: true, text: "WPM" } },
              x: { title: { display: true, text: "Time Intervals (5 seconds)" } },
            },
          },
        });
      }
    }

    return () => {
      chartRef.current?.destroy();
    };
  }, [wpmData]);

  return <canvas ref={canvasRef}></canvas>;
};
