import { Text } from "@/types/text";

interface ExistingTextCardProps {
  text: Text;
  onUpdate: () => void;
  onRemove: () => void;
}

export const ExistingTextCard = ({ text, onUpdate, onRemove }: ExistingTextCardProps) => {

  const firstLine =
    (text.content.length > 100 ? text.content.slice(0, 100) + "..." : text.content);
  return (
    <div className="bg-white p-6 rounded-lg shadow-md border">
      <h3 className="text-xl font-semibold mb-2 text-gray-800">{text.title}</h3>
      <p className="mb-2 text-gray-700">{firstLine}</p>
      <p className="text-sm text-gray-600">
        <strong>Category:</strong> {text.category}
      </p>
      <p className="text-sm text-gray-600">
        <strong>Difficulty:</strong> {text.difficulty}
      </p>
      <p className="text-sm text-gray-600">
        <strong>Fiction:</strong> {text.isFiction ? "Yes" : "No"}
      </p>
      <p className="text-sm text-gray-600">
        <strong>Word Count:</strong> {text.wordLength.toString()}
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          onClick={onUpdate}
          className="py-2 px-4 bg-yellow-500 text-white rounded-md transition-all duration-200 hover:bg-yellow-600"
        >
          Update Text
        </button>
        <button
          onClick={onRemove}
          className="py-2 px-4 bg-red-500 text-white rounded-md transition-all duration-200 hover:bg-red-600"
        >
          Remove Text
        </button>
      </div>
    </div>
  );
};