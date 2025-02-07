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

export enum Genre {
  FANTASY = "fantasy",
  MYSTERY = "mystery",
  ROMANCE = "romance",
  SCIENCE_FICTION = "science fiction",
  DRAMA = "drama",
}

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

  constructor(
    title: string,
    content: string,
    difficulty: Difficulty,
    isFiction: boolean,
    // Use either genre or category depending on isFiction
    genreOrCategory: Genre | Category,
    // Default arguments
    id: string = "",
    createdAt: Timestamp = Timestamp.fromMillis(Date.now()),
    updatedAt: Timestamp = createdAt,
    wordLength: number = content.split(" ").length
  ) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.difficulty = difficulty;
    this.isFiction = isFiction;
    this.wordLength = wordLength;

    if (isFiction) {
      this.genre = genreOrCategory as Genre;
    } else {
      this.category = genreOrCategory as Category;
    }
  }

  toJSON() {
    return {
      title: this.title,
      content: this.content,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      difficulty: this.difficulty,
      isFiction: this.isFiction,
      wordLength: this.wordLength,
      ...(this.isFiction
        ? { genre: this.genre }
        : { category: this.category }),
    };
  }
}
