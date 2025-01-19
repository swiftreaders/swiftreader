import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  Timestamp,
  addDoc,
} from "firebase/firestore/lite";
import { app } from "../../firebase.config";
import { Category, Difficulty } from "@/types/text";

export class TextService {
  private db;

  constructor() {
    this.db = getFirestore(app);
  }

  async getTexts() {
    const textsCol = collection(this.db, "Texts");
    const textsSnapshot = await getDocs(textsCol);
    const textsList = textsSnapshot.docs.map((doc) => doc.data());
    console.log(textsList);
    return textsList;
  }

  async getTextsByCategory(category: Category) {
    const q = query(
      collection(this.db, "Texts"),
      where("category", "==", category)
    );
    const querySnapshot = await getDocs(q);
    const textsList = querySnapshot.docs.map((doc) => doc.data());
    // console.log(textsList);
    textsList.forEach((text) => {
      console.log(text.title);
    });
    return textsList;
  }

  // async getTextsByUserId(userId: string) {}

  async getTextsByDifficulty(difficulty: Difficulty) {}

  async getRandomText(category: Category, difficulty: Difficulty) {}

  /// Add a text to the database
  async addText(
    category_: Category,
    content_: string,
    difficulty_: Difficulty,
    title_: string
  ) {
    const createdAt_ = Timestamp.now();
    const wordLength_ = content_.split(" ").length;

    try {
      const docRef = await addDoc(collection(this.db, "Texts"), {
        title: title_,
        content: content_,
        category: category_,
        createdAt: createdAt_,
        updatedAt: createdAt_,
        difficulty: difficulty_,
        status: "approved",
        wordLength: wordLength_,
      });
      console.log("Document written with ID: ", docRef.id);
    } catch (error) {
      console.error("Error adding document: ", error);
    }
  }

  async deleteText(textId: string) {}
}

const textServiceInstance = new TextService();

export default textServiceInstance;
