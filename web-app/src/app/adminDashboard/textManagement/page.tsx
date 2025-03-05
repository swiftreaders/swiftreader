"use client";

import { useAuth } from "@/contexts/authContext";
import AccessDenied from "@/components/pages/errors/accessDenied";
import { AdminDashboardProvider } from "@/contexts/adminDashboardContext";
import { TextManagementProvider } from "@/contexts/textManagementContext";
import TextManagementSection from "@/components/textManagement/AddTextContainer";
import ExistingTextsGrid from "@/components/textManagement/ExistingTextGrid";


const AdminDashboardContent = () => {
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
        <ExistingTextsGrid />
      </main>
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