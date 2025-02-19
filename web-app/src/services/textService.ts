import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  deleteField,
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
    const textsMap = new Map<string, Text>();
    const unsubscribeMap = new Map<string, { quizzes: () => void, questions: () => void }>();
  
    const unsubscribeTexts = onSnapshot(collection(db, "Texts"), (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const docId = change.doc.id;
        const data = change.doc.data();
  
        if (change.type === 'added' || change.type === 'modified') {
          // Cleanup existing listeners
          if (unsubscribeMap.has(docId)) {
            const unsubs = unsubscribeMap.get(docId)!;
            unsubs.quizzes();
            unsubs.questions();
            unsubscribeMap.delete(docId);
          }
  
          // Listen to Quizzes collection
          const quizzesUnsub = listenToQuizzes(docId, data);
          unsubscribeMap.set(docId, { quizzes: quizzesUnsub, questions: () => {} });
        } 
        else if (change.type === 'removed') {
          if (unsubscribeMap.has(docId)) {
            const unsubs = unsubscribeMap.get(docId)!;
            unsubs.quizzes();
            unsubs.questions();
            unsubscribeMap.delete(docId);
          }
          textsMap.delete(docId);
          onUpdate(Array.from(textsMap.values()));
        }
      });
    });
  
    function listenToQuizzes(docId: string, data: any) {
      const quizzesCol = collection(db, "Texts", docId, "Quizzes");
      return onSnapshot(quizzesCol, (quizSnapshot) => {
        // Cleanup previous questions listener
        const existing = unsubscribeMap.get(docId);
        existing?.questions();
  
        if (!quizSnapshot.empty) {
          const quizDoc = quizSnapshot.docs[0];
          listenToQuestions(docId, data, quizDoc.id);
        } else {
          updateTextWithQuestions(docId, data, []);
        }
      });
    }
  
    function listenToQuestions(docId: string, data: any, quizId: string) {
      const questionsCol = collection(db, "Texts", docId, "Quizzes", quizId, "Questions");
      const unsub = onSnapshot(questionsCol, (questionsSnapshot) => {
        const questions = questionsSnapshot.docs.map(doc => ({
          question: doc.data().Question,
          choices: doc.data().Choices,
          answer: doc.data().Answer,
        }));
        updateTextWithQuestions(docId, data, questions);
      });
  
      // Update unsubscribe map with new questions listener
      const existing = unsubscribeMap.get(docId);
      unsubscribeMap.set(docId, { ...existing!, questions: unsub });
    }
  
    function updateTextWithQuestions(docId: string, data: any, questions: Question[]) {
      const text = new Text(
        data.title,
        data.content,
        data.difficulty,
        data.isFiction,
        data.isFiction ? data.genre : data.category,
        docId,
        data.createdAt,
        data.updatedAt,
        data.wordLength,
        questions
      );
      textsMap.set(docId, text);
      onUpdate(Array.from(textsMap.values()));
    }
  
    return () => {
      unsubscribeTexts();
      unsubscribeMap.forEach(unsubs => {
        unsubs.quizzes();
        unsubs.questions();
      });
      unsubscribeMap.clear();
      textsMap.clear();
    };
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
      console.log("questions:", questions);
      console.log("textData:", textData);
      const docRef = await addDoc(collection(db, "Texts"), textData);
      
      // If questions exist, create a new quiz document and add questions as a subcollection
      if (questions && Array.isArray(questions) && questions.length > 0) {
        // Create a new quiz document in the "Quizzes" subcollection
        const quizzesRef = collection(db, "Texts", docRef.id, "Quizzes");
        const newQuizRef = await addDoc(quizzesRef, {
          createdAt: new Date() // Store metadata if needed
        });
        console.log("New quiz document created with ID:", newQuizRef.id);
        
        // Add questions as a subcollection under the new quiz document
        const questionsRef = collection(db, "Texts", docRef.id, "Quizzes", newQuizRef.id, "Questions");
        for (const question of questions) {
          console.log("Adding question:", question);
          await addDoc(questionsRef, {
            Question: question.question,
            Choices: question.choices,       // Storing the choices under 'Choices'
            Answer: question.answer,           // Storing the correct answer
          });
        }
      }
      return true;
    } catch (error) {
      console.error("Error adding text:", error);
      return false;
    }
  },
  

  // addBook: async (book: Book): Promise<boolean> => {
  //   try {
      
  //   }

  //   return false;
  // },

  updateText: async (updatedText: Text): Promise<boolean> => {
    try {
      const wordLength = updatedText.content.split(/\s+/).length;
      const timestamp = Timestamp.fromMillis(Date.now());
      console.log(updatedText);
      await updateDoc(doc(db, "Texts", updatedText.id), {
        content: updatedText.content,
        wordLength: wordLength,
        updatedAt: timestamp,
        title: updatedText.title,
        difficulty: updatedText.difficulty,
        isFiction: updatedText.isFiction,
        genre: updatedText.isFiction ? updatedText.genre : deleteField(),
        category: updatedText.isFiction ? deleteField() : updatedText.category,
      });
      const quizzesRef = collection(db, "Texts", updatedText.id, "Quizzes");

      // Remove any existing quizzes
      const existingQuizDocs = await getDocs(quizzesRef);
      for (const quizDoc of existingQuizDocs.docs) {
        await deleteDoc(doc(db, "Texts", updatedText.id, "Quizzes", quizDoc.id));
      }
      
      // Add a new quiz document
      const newQuizRef = await addDoc(quizzesRef, {
        createdAt: new Date() // You can store metadata if needed
      });
      
      console.log("New quiz document created with ID:", newQuizRef.id);
      
      // Add questions as a subcollection under the new quiz document
      if (
        updatedText.questions &&
        Array.isArray(updatedText.questions) &&
        updatedText.questions.length > 0
      ) {
        const questionsRef = collection(db, "Texts", updatedText.id, "Quizzes", newQuizRef.id, "Questions");
      
        for (const question of updatedText.questions) {
          console.log("Adding question:", question);
          await addDoc(questionsRef, {
            Question: question.question,
            Choices: question.choices,       // Storing the choices under 'answers'
            Answer: question.answer, // Storing the correct answer
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
    // Implementation placeholder – return 0 until further logic is added.
    return 0;
  },

  getQuizForText: async (textId: string) => {
    try {
      // Get the quiz document (assuming only one quiz per text)
      console.log("text id right before fetching: " + textId);
      const quizzesCollection = collection(db, "Texts", textId, "Quizzes");
      const quizSnapshot = await getDocs(quizzesCollection);

      console.log("Quiz snapshot size:", quizSnapshot.size);

      quizSnapshot.forEach(doc => {
        console.log("Quiz found:", doc.id, doc.data());
      });

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

