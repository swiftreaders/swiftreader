import {
  getFirestore,
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
  DocumentData,
  getDocs,
  query, 
  where
} from "firebase/firestore";
import { app, db } from "@/../firebase.config";
import { Category, Text } from "@/types/text";

// const db = getFirestore(app);

// function to get text from json query and return just the text


export const textService = {
  getTexts: (onUpdate: (texts: Text[]) => void) => {
    const unsubscribe = onSnapshot(collection(db, "Texts"), (snapshot) => {
      const texts = snapshot.docs.map((doc) => {
        const data = doc.data();
        return new Text(
          data.title,
          data.category,
          data.content,
          data.difficulty,
          data.isFiction,
          doc.id,
          data.createdAt,
          data.updatedAt,
          data.wordLength
        );
      });    
      onUpdate(texts);
    });

    return unsubscribe;
  },

  getTextsByCategory: async (category: Category): Promise<DocumentData[]> => {
    const q = query(
      collection(db, "Texts"),
      where("category", "==", category)
    );
    const querySnapshot = await getDocs(q);
    const textsList = querySnapshot.docs.map((doc) => doc.data());

    textsList.forEach((text) => {
      console.log(text.title);
    });
    return textsList;
  },

  addText: async (text: Text): Promise<boolean> => {
    try {
      await addDoc(collection(db, "Texts"), text.toJSON());
      return true;
    } catch (error) {
      console.error("Error adding text:", error);
      return false;
    }
  },

  updateText: async (content: string, id: string): Promise<boolean> => {
    try {
      const wordLength = content.split(/\s+/).length;
      const timestamp = Timestamp.fromMillis(Date.now())
      await updateDoc(doc(db, "Texts", id), { content: content, wordLength: wordLength, updatedAt: timestamp });
      return true;
    } catch (error) {
      console.error("Error updating text:", error);
      return false;
    }
  },

  removeText: async (id: string): Promise<boolean> => {
    try {
      await deleteDoc(doc(db, "Texts", id));
      return true;
    } catch (error) {
      console.error("Error removing text:", error);
      return false;
    }
  },

  findAveragePerformanceForText: async (textId: string): Promise<number> => {
    
    return 0;
  },

  getQuizForText: async (textId: string) => {
    try {
      // Get the quiz document (assuming only one quiz per text)
      const quizzesCollection = collection(db, "Texts", textId, "Quizzes");
      const quizSnapshot = await getDocs(quizzesCollection);

      if (quizSnapshot.empty) {
        console.warn("No quiz found for this text.");
        return null;
      }

      const quizDoc = quizSnapshot.docs[0]; // Assuming only one quiz per text
      const quizData = quizDoc.data();
      const quizId = quizDoc.id;

      // Get all questions under this quiz
      const questionsCollection = collection(db, "Texts", textId, "Quizzes", quizId, "Questions");
      const questionsSnapshot = await getDocs(questionsCollection);

      const questions = questionsSnapshot.docs.map((doc) => ({
        id: doc.id,
        question: doc.data().Question,
        options: doc.data().Choices,
        correctAnswer: doc.data().Answer, // Optional if needed for grading
      }));

      return {
        quizId,
        title: quizData.title,
        description: quizData.description,
        category: quizData.category,
        difficulty: quizData.difficulty,
        questions,
      };
    } catch (error) {
      console.error("Error fetching quiz:", error);
      return null;
    }
  }

}


export default textService;

