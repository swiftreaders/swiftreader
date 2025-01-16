import {
  getFirestore,
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { app } from "@/firebaseConfig";
import { Text } from "@/types/text";

const db = getFirestore(app);

const getTexts = (onUpdate: (texts: Text[]) => void) => {
  const unsubscribe = onSnapshot(collection(db, "Texts"), (snapshot) => {
    const texts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as Text[];
    onUpdate(texts);
  });

  return unsubscribe;
};

const addText = async (text: Text): Promise<boolean> => {
  try {
    await addDoc(collection(db, "Texts"), text);
    return true;
  } catch (error) {
    console.error("Error adding text:", error);
    return false;
  }
};

const updateText = async (content: string, id: string): Promise<boolean> => {
  try {
    await updateDoc(doc(db, "Texts", id), { content });
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
};
