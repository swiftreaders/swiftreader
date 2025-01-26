export class Session {
  id: string;
  textId: string;  // - retrievable using Text Service
  userId: string;  
  title: string; // text-title 
  date: string;  // You could use `Date` if it's a Date object
  duration: number;  // [30 sec, 60secs, 120 secs]

  // Statistics
  wpm: Array<number>;  // wpm at 5 second intervals for the duration of the session
  average_wpm: number;
  sessionType: number;
  difficulty: string;
  text_average_performance: number;

  constructor(
    id: string,
    textId: string,
    userId: string,
    title: string,
    date: string,  
    duration: number,
    wpm: Array<number>,
    sessionType: number,
    difficulty: string,
  ) {
    this.id = id;
    this.textId = textId;
    this.userId = userId;
    this.title = title;
    this.date = date;
    this.duration = duration;
    this.wpm = wpm;
    this.average_wpm = wpm.reduce((a, b) => a + b, 0) / wpm.length;
    this.sessionType = sessionType;
    this.difficulty = difficulty;
    this.text_average_performance = 0;
  }

}