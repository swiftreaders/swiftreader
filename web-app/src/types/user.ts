import { Timestamp } from "firebase/firestore";

export class User {
    id: string;
    name: string;
    email: string;
    isAdmin: boolean;
    wpm: number;
    joinDate: Timestamp;
  
    constructor(
        id: string,
        name: string,
        email: string,
        isAdmin: boolean,
        wpm: number,
        joinDate: Timestamp,
    ) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.isAdmin = isAdmin; 
        this.wpm = wpm;
        this.joinDate = joinDate;
    }
  };