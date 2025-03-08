"use client";

import React from "react";
import {
  useReadingContext,
  ReadingSessionProvider,
} from "@/contexts/readingSessionsContext";
import Quiz from "@/components/Quiz";
import { useState, useEffect, useRef } from "react";
import Script from "next/script";
import { Category, Difficulty, Genre, Text } from "@/types/text";
import { Session } from "@/types/sessions";
import { Timestamp } from "firebase/firestore";
import WebGazerClient from "./WebGazerClient"; // We'll keep a separate file
import Calibration, { CalibrationRef } from "./Calibration"; // Modified import to include ref type
import { SessionStats } from "@/components/SessionStats";
import { useAuth } from "@/contexts/authContext";
import { UserProvider } from "@/contexts/userContext";
import AccessDenied from "@/components/pages/errors/accessDenied";
import InfoPopup from "@/components/infoPopup"
import { useRouter } from "next/navigation";
import { summariseText } from "@/services/generateService";
import { AccessibilitySettings, 
  AccessibilitySettingsPanel,
  defaultAccessibilitySettings } from "@/components/AccessibilitySettingsPanel";
import WebGazerDisclaimer from "@/components/WebGazerDisclaimer";
import UserSessionContent from "./UserSessionContent";

const UserSession = () => {
  const { user } = useAuth();
  return (
    <div>
      {user ? (
        <UserProvider>
          <ReadingSessionProvider>
            <UserSessionContent />
          </ReadingSessionProvider>
        </UserProvider>
      ) : (
        <AccessDenied />
      )}
    </div>
  );
};

export default UserSession;
