import { Timestamp } from "firebase/firestore";

export enum Difficulty {
  EASY = "easy",
  MEDIUM = "medium",
  HARD = "hard",
}

export enum Category {
  SCIENCE = "science",
  NATURE = "nature",
  TECHNOLOGY = "technology",
  HISTORY = "history",
}

export interface Question {
  question: string;
  choices: string[];
  answer: string;
}

export interface Result {
  question: string;
  givenAnswer: string;
  correctAnswer: string;
}

export enum Genre {
  FANTASY = "fantasy",
  MYSTERY = "mystery",
  ROMANCE = "romance",
  SCIENCE_FICTION = "science fiction",
  DRAMA = "drama",
}

export interface NewTextType {
  title: string;
  content: string;
  difficulty: Difficulty; 
  isFiction: boolean;
  genre: Genre;
  category: Category;
  text_link: string;
  wordLength: number;
  questions: Question[];
  isValid: boolean;
  isAI: boolean;
}

/// Text class containing all fields related to the Firestore database texts collection
export class Text {
  id: string;
  title: string;
  category?: Category; // Optional, only used when isFiction is false
  genre?: Genre; // Optional, only used when isFiction is true
  content: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  difficulty: Difficulty;
  isFiction: boolean;
  wordLength: number;
  questions: Question[];

  constructor(
    title: string,
    content: string,
    difficulty: Difficulty,
    isFiction: boolean,
    // Use either genre or category depending on isFiction
    genreOrCategory: Genre | Category,
    questions: Question[] = [],
    
    // Default arguments
    id: string = "",
    createdAt: Timestamp = Timestamp.fromMillis(Date.now()),
    updatedAt: Timestamp = createdAt,
    wordLength: number = content.split(" ").length,
  ) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.difficulty = difficulty;
    this.isFiction = isFiction;
    this.wordLength = wordLength;
    this.questions = questions;

    if (isFiction) {
      this.genre = genreOrCategory as Genre;
    } else {
      this.category = genreOrCategory as Category;
    }
  }

  toJSON() {
    // Exclude questions from the main document since they are stored in a subcollection.
    return {
      title: this.title,
      content: this.content,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      difficulty: this.difficulty,
      isFiction: this.isFiction,
      wordLength: this.wordLength,
      questions: this.questions,
      ...(this.isFiction
        ? { genre: this.genre }
        : { category: this.category }),
    };
  }
}
