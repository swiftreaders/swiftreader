// components/SessionStats.tsx
"use client";

import { Chart, LinearScale, CategoryScale, LineController, LineElement, PointElement } from 'chart.js';
import { useEffect, useRef } from 'react';
import { SavedSession } from '@/types/sessions';

// Register Chart.js components once
Chart.register(LinearScale, CategoryScale, LineController, LineElement, PointElement);

interface SessionStatsProps {
  session: SavedSession;
  onClose?: () => void; // Optional close handler for popup usage
}

export const SessionStats = ({ session, onClose }: SessionStatsProps) => {
  const chartRef = useRef<Chart | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (canvasRef.current) {
      // Destroy existing chart
      if (chartRef.current) {
        chartRef.current.destroy();
      }

      const ctx = canvasRef.current.getContext('2d');
      if (ctx) {
        chartRef.current = new Chart(ctx, {
          type: 'line',
          data: {
            labels: session.wpm.map((_, i) => `${(i + 1) * 5}s`),
            datasets: [{
              label: 'Words Per Minute',
              data: session.wpm,
              borderColor: 'rgb(59, 130, 246)',
              tension: 0.1
            }]
          },
          options: {
            responsive: true,
            scales: {
              y: { beginAtZero: true, title: { display: true, text: 'WPM' } },
              x: { title: { display: true, text: 'Time Intervals (5 seconds)' } }
            }
          }
        });
      }
    }

    return () => {
      chartRef.current?.destroy();
    };
  }, [session]);

  return (
    <div className="bg-white p-6 rounded-lg max-w-4xl w-full mx-4">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-2xl font-bold">{session.title}</h3>
        <p className="text-gray-600">{session.date}</p>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="col-span-2">
          <canvas ref={canvasRef}></canvas>
        </div>

        {/* Statistics Section */}
        <div className="space-y-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="text-sm font-semibold text-blue-800 mb-2">Session Statistics</h4>
            <div className="space-y-2">
              <StatItem label="Average WPM" value={session.average_wpm.toFixed(1)} />
              <StatItem label="Text Average" value={session.text_average_performance.toFixed(1)} />
              <StatItem label="Duration" value={`${session.duration} seconds`} />
              <StatItem label="Difficulty" value={session.difficulty} />
            </div>
          </div>
        </div>
      </div>

      {/* Questions and Results here */}

      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 w-full"
        >
          Close
        </button>
      )}
    </div>
  );
};

const StatItem = ({ label, value }: { label: string; value: string }) => (
  <p>
    <span className="font-medium">{label}:</span><br />
    {value}
  </p>
);