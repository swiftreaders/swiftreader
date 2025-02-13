import { Timestamp } from "firebase/firestore"
import { Question } from "./text";

export class Session {
  id: string;
  textId: string;
  userId: string;
  title: string;
  startTime: Timestamp;  
  endTime: Timestamp;
  duration: number;

  wpm: Array<number>;  // wpm at 5 second intervals for the duration of the session
  average_wpm: number; 
  sessionType: number;
  difficulty: string;  // easy, medium, hard
  text_average_performance: number;

  constructor(
    textId: string,
    userId: string,
    title: string,
    startTime: Timestamp,  // You could use `Date` if it's a Date object
    endTime: Timestamp, 
    wpm: any,  // Accept any type and check below
    sessionType: number,
    difficulty: string,
    // Default argument
    id: string = "",
    questions: Question[] = [],
    correct: boolean[] = [],
    
  ) {
    this.id = id;
    this.textId = textId;
    this.userId = userId;
    this.title = title;
    this.startTime = startTime;
    this.endTime = endTime;

    // Helper function to retrieve milliseconds regardless of type.
    const getMillis = (t: Timestamp | Date): number => {
      if (t && typeof (t as any).toMillis === "function") {
        return (t as any).toMillis();
      }
      if (t instanceof Date) {
        return t.getTime();
      }
      // Fallback (shouldn't occur if t is correct)
      return 0;
    };

    // Calculate duration in seconds.
    this.duration = (getMillis(endTime) - getMillis(startTime)) / 1000;

    // Ensure wpm is an array; if not, default to an empty array.
    this.wpm = Array.isArray(wpm) ? wpm : [];
    // Calculate average_wpm only if there are values in the array.
    this.average_wpm = this.wpm.length ? this.wpm.reduce((a, b) => a + b, 0) / this.wpm.length : 0;

    this.sessionType = sessionType;
    this.difficulty = difficulty;
    this.text_average_performance = 0;
  }
}
