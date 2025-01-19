import { Timestamp } from "firebase/firestore";

export enum Difficulty {
  EASY = "easy",
  MEDIUM = "medium",
  HARD = "hard",
}

export enum Category {
  NATURE = "nature",
  SCIENCE = "science",
  TECHNOLOGY = "technology",
}

export class Text {
  id: string;
  title: string;
  category: Category;
  content: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  difficulty: Difficulty;
  isFiction: boolean;
  wordLength: Number;

  constructor(
    title: string,
    category: Category,
    content: string,
    difficulty: Difficulty,
    isFiction: boolean,
    // Default parameters for adding new texts
    id: string = "",
    createdAt: Timestamp = Timestamp.fromMillis(Date.now()),
    updatedAt: Timestamp = createdAt,
    wordLength: Number = content.split(" ").length
  ) {
    this.id = id;
    this.title = title;
    this.category = category;
    this.content = content;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.difficulty = difficulty;
    this.isFiction = isFiction;
    this.wordLength = wordLength
  }
  
  toJSON() {
    return {
      title: this.title,
      category: this.category,
      content: this.content,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      difficulty: this.difficulty,
      isFiction: this.isFiction,
      wordLength: this.wordLength,
    };
  }
}

export class User {
  id: string;
  name: string;
  email: string;
  role: string;
  wpm: number;
  joinDate: Date;

  constructor(
      id: string,
      name: string,
      email: string,
      role: string,
      wpm: number,
      joinDate: Date,
  ) {
      this.id = id;
      this.name = name;
      this.email = email;
      this.role = role; 
      this.wpm = wpm;
      this.joinDate = joinDate;
  }
};