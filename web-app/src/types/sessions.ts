import { Timestamp } from "firebase/firestore"

export class Session {
  id: string;
  textId: string;
  userId: string;
  title: string;
  startTime: Timestamp;  
  endTime: Timestamp;
  duration: number

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
    wpm: Array<number>,
    sessionType: number,
    difficulty: string,
    // Default arguments
    id: string = "",
  ) {
    this.id = id;
    this.textId = textId;
    this.userId = userId;
    this.title = title;
    this.startTime = startTime;
    this.endTime = endTime;
    this.duration = (endTime.toMillis() - startTime.toMillis()) / 1000;
    this.wpm = wpm;
    this.average_wpm = wpm.reduce((a, b) => a + b, 0) / wpm.length;
    this.sessionType = sessionType;
    this.difficulty = difficulty;
    this.text_average_performance = 0;
  }

}