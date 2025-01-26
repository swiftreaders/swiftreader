"use client";

import React from "react";
import {
  TestDashboardProvider,
  useTestDashboard,
} from "@/contexts/exampleContext";

const DashboardContent = () => {
  const { texts } = useTestDashboard();

  return (
    <div>
      <h1>Test Dashboard</h1>
      <ul>
        {texts.map((text) => (
          <li key={text.id}>
            <h2>{text.title}</h2>
            <p>{text.content}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

const TestDashboard = () => {
  return (
    <TestDashboardProvider>
      <DashboardContent />
    </TestDashboardProvider>
  );
};



export default TestDashboard;
