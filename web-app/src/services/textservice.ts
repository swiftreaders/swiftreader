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
import { app, db } from "@/firebaseConfig";
import { Category, Text } from "@/types/text";

// const db = getFirestore(app);

const getTexts = (onUpdate: (texts: Text[]) => void) => {
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
};

const getTextsByCategory = async (category: Category): Promise<DocumentData[]> => {
  const q = query(
    collection(db, "Texts"),
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

const addText = async (text: Text): Promise<boolean> => {
  try {
    await addDoc(collection(db, "Texts"), text.toJSON());
    return true;
  } catch (error) {
    console.error("Error adding text:", error);
    return false;
  }
};

const updateText = async (content: string, id: string): Promise<boolean> => {
  try {
    const wordLength = content.split(/\s+/).length;
    const timestamp = Timestamp.fromMillis(Date.now())
    await updateDoc(doc(db, "Texts", id), { content: content, wordLength: wordLength, updatedAt: timestamp });
    return true;
  } catch (error) {
    console.error("Error updating text:", error);
    return false;
  }
};

const removeText = async (id: string): Promise<boolean> => {
  try {
    await deleteDoc(doc(db, "Texts", id));
    return true;
  } catch (error) {
    console.error("Error removing text:", error);
    return false;
  }
};

export const textService = {
  getTexts,
  addText,
  updateText,
  removeText,
  getTextsByCategory,
};

export default textService;

