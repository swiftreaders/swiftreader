import React from 'react';
import { Question } from '@/types/text';

interface QuestionProps {
  question: Question;
  index: number;
  handleQuestionChange: (index: number, field: keyof Question, value: string) => void;
  handleRemoveQuestion: (index: number) => void;
}

export const QuestionCard = ({ question, index, handleQuestionChange, handleRemoveQuestion }: QuestionProps) => (
  <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200 relative hover:shadow-md transition-shadow">
    {/* Remove Button */}
    <button
      onClick={() => handleRemoveQuestion(index)}
      className="absolute top-2 right-2 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors duration-200"
      title="Remove Question"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fillRule="evenodd"
          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
          clipRule="evenodd"
        />
      </svg>
    </button>

    {/* Question Content */}
    <div className="space-y-3">
      {/* Question Text */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Question Text</label>
        <input
          value={question.question}
          onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm placeholder-gray-400"
          placeholder="What's the main idea of the text?"
        />
      </div>

      {/* Answer Options */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Answer Options</label>
        <div className="grid grid-cols-2 gap-2">
          {question.choices.map((choice, ci) => (
            <div key={ci} className="flex items-center gap-2 bg-gray-50 p-2 rounded-md hover:bg-gray-100 transition-colors">
              <span className="text-gray-500 text-sm font-medium">{String.fromCharCode(65 + ci)}.</span>
              <input
                value={choice}
                onChange={(e) => {
                  const newChoices = [...question.choices];
                  newChoices[ci] = e.target.value;
                  handleQuestionChange(index, 'choices', newChoices.join(','));
                }}
                className="flex-1 bg-transparent focus:outline-none text-sm placeholder-gray-400"
                placeholder={`Option ${ci + 1}`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Correct Answer */}
      <div>
        <label className="block text-xs font-medium text-gray-700 mb-1">Correct Answer</label>
        <select
          value={question.answer}
          onChange={(e) => handleQuestionChange(index, 'answer', e.target.value)}
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-indigo-500 text-sm"
        >
          {question.choices.map((choice, ci) => (
            <option key={ci} value={choice}>
              {String.fromCharCode(65 + ci)}. {choice}
            </option>
          ))}
        </select>
      </div>
    </div>
  </div>
);