export class Session {
    id: string;
    textId: string;
    userId: string;
    title: string;
    date: string;  // You could use `Date` if it's a Date object
    duration: string;
    // + some statistics

    constructor(
      id: string,
      textId: string,
      userId: string,
      title: string,
      date: string,  // You could use `Date` if it's a Date object
      duration: string,
    ) {
      this.id = id;
      this.textId = textId;
      this.userId = userId;
      this.title = title;
      this.date = date;
      this.duration = duration;
    }

  }