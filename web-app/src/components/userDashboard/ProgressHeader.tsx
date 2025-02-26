import React from 'react';

interface ProgressHeaderProps {
    totalReadingTime: number;
    readingGoal: number;
    progressPercentage: number;
    onSetGoalClick: () => void;
    weeklyProgress: number;
  }
  
export const ProgressHeader = ({
    totalReadingTime,
    readingGoal,
    progressPercentage,
    onSetGoalClick,
    weeklyProgress,
  }: ProgressHeaderProps) => (
    <div className="mt-8 bg-widget shadow-md rounded-lg p-6 w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Reading Progress</h2>
        <button
          onClick={onSetGoalClick}
          className="px-4 py-2 bg-sr-gradient text-white font-bold rounded-md transition hover:bg-green-600"
        >
          Update Goal
        </button>
      </div>
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1">
          <p className="mb-2">Monthly Goal Progress</p>
          <p>
            <span className="font-bold text-lg">{totalReadingTime}</span>
            <span className="text-gray-500"> of {readingGoal} minutes</span>
          </p>
          <div className="w-full bg-gray-200 rounded-full h-4 mt-3">
            <div
              className="bg-secondary h-4 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <p className="text-right text-sm mt-1">{progressPercentage.toFixed(0)}%</p>
        </div>
        <div className="flex-1">
          <p className="mb-2">Weekly Progress</p>
          <p>
            <span className="font-bold text-lg">{weeklyProgress}</span>
            <span className="text-gray-500"> minutes this week</span>
          </p>
          <div className="w-full bg-gray-200 rounded-full h-4 mt-3">
            <div
              className="bg-green-500 h-4 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(((weeklyProgress / (readingGoal / 4)) * 100), 100).toFixed(0)}%` }}
            ></div>
          </div>
          <p className="text-right text-sm mt-1">
            {Math.min(((weeklyProgress / (readingGoal / 4)) * 100), 100).toFixed(0)}% of weekly target
          </p>
        </div>
      </div>
    </div>
  );