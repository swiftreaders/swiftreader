import React from 'react';

interface ProgressCirclesProps {
    progressStage: number;
}

const ProgressCircles: React.FC<ProgressCirclesProps> = ({ progressStage }) => {
    return (
        <div className="flex items-center justify-center mb-8">
            <div className="flex items-center space-x-4">
                <div className="flex flex-col items-center">
                    <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        progressStage >= 1 ? "bg-secondary text-white" : "bg-gray-300"
                        }`}
                    >
                        1
                    </div>
                    <span className="text-sm mt-2">Read</span>
                </div>
                <div className="h-1 w-12 bg-gray-300"></div>
                <div className="flex flex-col items-center">
                    <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        progressStage >= 2 ? "bg-secondary text-white" : "bg-gray-300"
                        }`}
                    >
                        2
                    </div>
                    <span className="text-sm mt-2">Quiz</span>
                </div>
                <div className="h-1 w-12 bg-gray-300"></div>
                <div className="flex flex-col items-center">
                    <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        progressStage >= 3 ? "bg-secondary text-white" : "bg-gray-300"
                        }`}
                    >
                        3
                    </div>
                    <span className="text-sm mt-2">Stats</span>
                </div>
            </div>
        </div>
    );
};

export default ProgressCircles;
