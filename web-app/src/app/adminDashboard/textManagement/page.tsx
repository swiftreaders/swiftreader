"use client";

import { useState } from "react";
import {
  useAdminDashboard,
  AdminDashboardProvider,
} from "@/contexts/adminDashboardContext";
import { Text } from "@/types/text";
import { UpdateTextPopup } from "@/components/UpdateTextPopup";
import { ExistingTextCard } from "@/components/textManagement/ExistingTextCard";
import { useAuth } from "@/contexts/authContext";
import AccessDenied from "@/components/pages/errors/accessDenied";
import { TextManagementProvider, useTextManagementContext } from "@/contexts/textManagementContext";
import TextManagementSection from "@/components/textManagement/AddTextContainer";

const AdminDashboardContent = () => {
  const { removeText, updateText } = useAdminDashboard();
  const {
    texts,
  } = useTextManagementContext();

  const [selectedTextForUpdate, setSelectedTextForUpdate] = useState<Text | null>(null);
  const [updatePopupOpen, setUpdatePopupOpen] = useState(false);

  return (
    <div className="min-h-screen mt-[7vh] bg-background">
      {/* Hero Header */}
      <header className="bg-sr-gradient py-8 shadow-lg">
        <div className="container mx-auto px-4 text-left">
          <h1 className="text-4xl font-bold text-white">Text Management</h1>
          <p className="mt-2 text-lg text-gray-200">
            Manage and fine-tune your texts with ease
          </p>
        </div>
      </header>

      {/* Main Container */}
      <main className="container mx-auto px-4 py-8">
        <TextManagementSection />

        {/* Existing Texts Section */}
        <section>
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            Existing Texts
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {texts.map((text) => (
              <ExistingTextCard
                key={text.id}
                text={text}
                onUpdate={() => {
                  setSelectedTextForUpdate(text);
                  setUpdatePopupOpen(true);
                }}
                onRemove={() => {
                  if (
                    window.confirm(
                      `Are you sure you want to remove "${text.title}"?`
                    )
                  )
                    removeText(text.id);
                }}
              />
            ))}
          </div>
        </section>
      </main>

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
    </div>
  );
};

const TextManagement = () => {
  const { user } = useAuth();
  return (
    <div>
      {user?.isAdmin ? (
        <AdminDashboardProvider>
          <TextManagementProvider>
            <AdminDashboardContent />
          </TextManagementProvider>
        </AdminDashboardProvider>
      ) : (
        <AccessDenied />
      )}
    </div>
  );
};

export default TextManagement;