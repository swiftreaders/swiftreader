"use client";

import { useState } from "react";
import { Text } from "@/types/text";
import { UpdateTextPopup } from "@/components/UpdateTextPopup";
import { ExistingTextCard } from "@/components/textManagement/ExistingTextCard";
import { useAdminDashboard } from "@/contexts/adminDashboardContext";
import { useTextManagementContext } from "@/contexts/textManagementContext";

const ExistingTextsGrid: React.FC = () => {
  const { removeText, updateText } = useAdminDashboard();
  const { texts } = useTextManagementContext();

  const [selectedTextForUpdate, setSelectedTextForUpdate] = useState<Text | null>(null);
  const [updatePopupOpen, setUpdatePopupOpen] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const textsPerPage = 10; // Number of cards per page

  // Filter texts based on search query
  const filteredTexts = texts.filter(
    (text) =>
      text.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      text.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination logic
  const indexOfLastText = currentPage * textsPerPage;
  const indexOfFirstText = indexOfLastText - textsPerPage;
  const currentTexts = filteredTexts.slice(indexOfFirstText, indexOfLastText);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-6 text-gray-800">Existing Texts</h2>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by title or content..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1); // Reset to first page when searching
          }}
          className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Text Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2">
        {currentTexts.map((text) => (
          <ExistingTextCard
            key={text.id}
            text={text}
            onUpdate={() => {
              setSelectedTextForUpdate(text);
              setUpdatePopupOpen(true);
            }}
            onRemove={() => {
              if (window.confirm(`Are you sure you want to remove "${text.title}"?`)) {
                removeText(text.id);
              }
            }}
          />
        ))}
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center mt-6">
        {Array.from({ length: Math.ceil(filteredTexts.length / textsPerPage) }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => paginate(i + 1)}
            className={`mx-1 px-4 py-2 rounded-md ${
              currentPage === i + 1
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>

      {/* Update Text Popup */}
      {updatePopupOpen && selectedTextForUpdate && (
        <UpdateTextPopup
          text={selectedTextForUpdate}
          onClose={() => {
            setUpdatePopupOpen(false);
            setSelectedTextForUpdate(null);
          }}
          onSave={(updatedText) => {
            updateText(updatedText);
            setUpdatePopupOpen(false);
            setSelectedTextForUpdate(null);
          }}
        />
      )}
    </section>
  );
};

export default ExistingTextsGrid;