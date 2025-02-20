import { useEffect, useState } from "react";
import textService from "@/services/textService";
import sessionService from "@/services/sessionService";
import { Question } from "@/types/text";
import { Result } from "@/types/text";
import { Session } from "@/types/sessions";

const Quiz = ({ textId, session, onContinue }: { textId: string; session: Session; onContinue: () => void }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<Result[]>([]);
  const [submitted, setSubmitted] = useState(false); // Controls answer lock & button switch

  useEffect(() => {
    const fetchQuiz = async () => {
      console.log("Fetching questions for text with id:", textId);
      const quizData = await textService.getQuizForText(textId);
      if (quizData) {
        setQuestions(
          quizData.questions.map((q: any) => ({
            question: q.question,
            choices: q.options,
            answer: q.correctAnswer,
          }))
        );
      }
      setLoading(false);
    };

    fetchQuiz();
  }, [textId]);

  const handleAnswerChange = (question: string, answer: string) => {
    if (!submitted) {
      setAnswers((prev) => ({ ...prev, [question]: answer }));
    }
  };

  const handleSubmit = async () => {
    // Map user responses to Results type
    const quizResults: Result[] = questions.map((q) => ({
      question: q.question,
      givenAnswer: answers[q.question] || "", // Handle unanswered questions
      correctAnswer: q.answer,
    }));

    setResults(quizResults);
    setSubmitted(true); // Lock answers after submission

    // Update the session with the results
    session.results = quizResults;

    // Send results to backend
    await sendResults(session);
  };

  const sendResults = async (session: Session) => {
    console.log("Sending results:", session.results);

    try {
      // Call the backend service to update the session with the quiz results
      const success = await sessionService.storeQuizResults(session);
      
      if (success) {
        console.log("Results stored successfully!");
      } else {
        console.error("Failed to store results.");
      }
    } catch (error) {
      console.error("Error storing quiz results:", error);
    }
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
          <div key={q.question} className="mb-4">
            <p className="font-medium text-gray-900 mb-2">{q.question}</p>
            <div className="space-y-2">
              {q.choices.map((option) => (
                <label
                  key={option}
                  className={`block p-2 rounded cursor-pointer transition ${
                    submitted
                      ? answers[q.question] === option
                        ? "bg-blue-300" // Highlight selected answer
                        : "bg-gray-200"
                      : "bg-gray-200 hover:bg-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name={q.question}
                    value={option}
                    checked={answers[q.question] === option}
                    onChange={() => handleAnswerChange(q.question, option)}
                    className="mr-2"
                    disabled={submitted} // Prevent changes after submit
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      {!submitted ? (
        <button
          className="bg-green-500 text-white px-6 py-3 rounded hover:bg-green-600 transition mt-4"
          onClick={handleSubmit}
        >
          Submit Quiz
        </button>
      ) : (
        <button
          className="bg-blue-500 text-white px-6 py-3 rounded hover:bg-blue-600 transition mt-4"
          onClick={ onContinue }
        >
          Continue to Stats
        </button>
      )}

      {submitted && (
        <div className="mt-6 p-4 bg-white rounded shadow-md w-full max-w-md">
          <h3 className="text-lg font-bold mb-2">Results:</h3>
          {results.map((result, index) => (
            <p
              key={index}
              className={`p-2 ${
                result.givenAnswer === result.correctAnswer
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {`Q${index + 1}: ${
                result.givenAnswer === result.correctAnswer
                  ? "✅ Correct"
                  : "❌ Incorrect"
              } (You chose: "${result.givenAnswer || "No Answer"}")`}
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export default Quiz;
