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

import { Category, Text, Question } from "@/types/text";
import { db } from "@/../firebase.config";



// The textService object with Firebase CRUD functions
export const textService = {
  getTexts: (onUpdate: (texts: Text[]) => void) => {
    const unsubscribe = onSnapshot(collection(db, "Texts"), async (snapshot) => {
      const texts = await Promise.all(
        snapshot.docs.map(async (docSnapshot) => {
          const data = docSnapshot.data();
    
          // Fetch quiz questions
          const quizzesCollection = collection(db, "Texts", docSnapshot.id, "Quizzes");
          const quizSnapshot = await getDocs(quizzesCollection);
    
          let questions: Question[] = [];
          if (!quizSnapshot.empty) {
            const quizDoc = quizSnapshot.docs[0]; // Assuming one quiz per text
            const questionsCollection = collection(db, "Texts", docSnapshot.id, "Quizzes", quizDoc.id, "Questions");
            const questionsSnapshot = await getDocs(questionsCollection);
    
            questions = questionsSnapshot.docs.map((doc) => ({
              question: doc.data().Question,
              choices: doc.data().Choices,
              answer: doc.data().Answer,
            }));
          }
    
          return new Text(
            data.title,
            data.content,
            data.difficulty,
            data.isFiction,
            data.isFiction ? data.genre : data.category,
            docSnapshot.id,
            data.createdAt,
            data.updatedAt,
            data.wordLength,
            questions
          );
        })
      );
    
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
            answers: question.choices,       
            correct_answer: question.answer,   
          });
        }
      }
      return true;
    } catch (error) {
      console.error("Error adding text:", error);
      return false;
    }
  },

  updateText: async (updatedText: Text): Promise<boolean> => {
    try {
      const wordLength = updatedText.content.split(/\s+/).length;
      const timestamp = Timestamp.fromMillis(Date.now());
      await updateDoc(doc(db, "Texts", updatedText.id), {
        content: updatedText.content,
        wordLength: wordLength,
        updatedAt: timestamp,
        title: updatedText.title,
        difficulty: updatedText.difficulty,
        category: updatedText.category,
      });
      const quizzesRef = collection(db, "Texts", updatedText.id, "Quizzes");

      // Remove any existing questions from the subcollection
      const existingQuizDocs = await getDocs(quizzesRef);
      for (const quizDoc of existingQuizDocs.docs) {
        await deleteDoc(doc(db, "Texts", updatedText.id, "Quizzes", quizDoc.id));
      }

      // Add the updated questions if available
      if (
        updatedText.questions &&
        Array.isArray(updatedText.questions) &&
        updatedText.questions.length > 0
      ) {
        for (const question of updatedText.questions) {
          await addDoc(quizzesRef, {
            question: question.question,
            answers: question.choices,       // Storing the choices under 'answers'
            correct_answer: question.answer,   // Storing the correct answer
          });
        }
      }
      
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

