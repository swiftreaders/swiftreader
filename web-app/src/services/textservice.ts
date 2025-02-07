import {
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
import { app, db } from "@/firebaseConfig";
import { Category, Text } from "@/types/text";

// The textService object with Firebase CRUD functions
export const textService = {
  getTexts: (onUpdate: (texts: Text[]) => void) => {
    const unsubscribe = onSnapshot(collection(db, "Texts"), (snapshot) => {
      const texts = snapshot.docs.map((docSnapshot) => {
        const data = docSnapshot.data();
        return new Text(
          data.title,
          data.category,
          data.content,
          data.difficulty,
          data.isFiction,
          docSnapshot.id,
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
      console.log("Adding text to firestore: ", text.toJSON());
      // Save the text document (convert to JSON without the questions property)
      const { questions, ...textData } = text.toJSON();
      const docRef = await addDoc(collection(db, "Texts"), textData);
      
      // If questions exist, add each question to the "Quizzes" subcollection.
      if (questions && Array.isArray(questions) && questions.length > 0) {
        const quizzesCollectionRef = collection(doc(db, "Texts", docRef.id), "Quizzes");
        for (const question of questions) {
          await addDoc(quizzesCollectionRef, {
            question: question.question,
            answers: question.choices,       // Map your 'choices' to 'answers'
            correct_answer: question.answer,   // Map your 'answer' to 'correct_answer'
          });
        }
      }
      return true;
    } catch (error) {
      console.error("Error adding text:", error);
      return false;
    }
  },

  updateText: async (content: string, id: string): Promise<boolean> => {
    try {
      const wordLength = content.split(/\s+/).length;
      const timestamp = Timestamp.fromMillis(Date.now());
      await updateDoc(doc(db, "Texts", id), {
        content: content,
        wordLength: wordLength,
        updatedAt: timestamp
      });
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
    // Implementation placeholder – return 0 until further logic is added.
    return 0;
  }
};

export default textService;
