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
    id: string,
    title: string,
    category: Category,
    content: string,
    difficulty: Difficulty,
    isFiction: boolean,
  ) {
    const timestamp = Timestamp.fromMillis(Date.now())
    this.id = id;
    this.title = title;
    this.category = category;
    this.content = content;
    this.createdAt = timestamp;
    this.updatedAt = timestamp;
    this.difficulty = difficulty;
    this.isFiction = isFiction;
    this.wordLength = this.content.split(" ").length
  }
  
  toJSON() {
    return {
      id: this.id,
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
