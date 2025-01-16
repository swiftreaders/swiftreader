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
  category: string;
  content: string;
  createdAt: Date;
  difficulty: string;
  isFiction: boolean;

  constructor(
    id: string,
    title: string,
    category: string,
    content: string,
    createdAt: Date,
    difficulty: string,
    isFiction: boolean
  ) {
    this.id = id;
    this.title = title;
    this.category = category;
    this.content = content;
    this.createdAt = createdAt;
    this.difficulty = difficulty;
    this.isFiction = isFiction;
  }
}
