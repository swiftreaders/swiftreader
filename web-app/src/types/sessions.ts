import { Timestamp } from "firebase/firestore"

export class Session {
    id: string;
    textId: string;
    userId: string;
    title: string;
    startTime: Timestamp;  // You could use `Date` if it's a Date object
    endTime: Timestamp;
    duration: number
    // + some statistics

    constructor(
      id: string,
      textId: string,
      userId: string,
      title: string,
      startTime: Timestamp,  // You could use `Date` if it's a Date object
      endTime: Timestamp,
    ) {
      this.id = id;
      this.textId = textId;
      this.userId = userId;
      this.title = title;
      this.startTime = startTime;
      this.endTime = endTime;
      this.duration = (endTime.toMillis() - startTime.toMillis()) / 1000
    }

  }