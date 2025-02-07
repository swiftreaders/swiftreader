import { useEffect, useState } from "react";
import textService from "@/services/textService";

const Quiz = ({ textId, onComplete }: { textId: string; onComplete: () => void }) => {
  const [questions, setQuestions] = useState<{ id: string; question: string; options: string[] }[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuiz = async () => {
      const quizData = await textService.getQuizForText(textId);
      if (quizData) {
        setQuestions(quizData.questions);
      }
      setLoading(false);
    };

    fetchQuiz();
  }, [textId]);

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  if (loading) {
    return <p>Loading quiz...</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Quiz Time!</h2>
      <p className="text-gray-800 mb-4">Answer the following questions based on the text.</p>
      <div className="w-full max-w-md bg-white p-6 rounded-lg shadow-md">
        {questions.map((q) => (
          <div key={q.id} className="mb-4">
            <p className="font-medium text-gray-900 mb-2">{q.question}</p>
            <div className="space-y-2">
              {q.options.map((option) => (
                <label key={option} className="block bg-gray-200 p-2 rounded cursor-pointer hover:bg-gray-300 text-gray-900">
                  <input
                    type="radio"
                    name={q.id}
                    value={option}
                    checked={answers[q.id] === option}
                    onChange={() => handleAnswerChange(q.id, option)}
                    className="mr-2"
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button
        className="bg-green-500 text-white px-6 py-3 rounded hover:bg-green-600 transition mt-4"
        onClick={onComplete}
      >
        Submit Quiz
      </button>
    </div>
  );
};

export default Quiz;
