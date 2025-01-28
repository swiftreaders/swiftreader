import {
  getFirestore,
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { app } from "@/../firebase.config";
import { User } from "@/types/user";

const db = getFirestore(app);

export const userService = {
  getUsers: (onUpdate: (users: User[]) => void) => {
    const unsubscribe = onSnapshot(collection(db, "Users"), (snapshot) => {
      const users = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as User[];
      onUpdate(users);
    });
    return unsubscribe;
  },

  // getUser by id (filter the results of getUsers)
  getUser: async (id: string): Promise<User | null> => {
    const docRef = doc(db, "Users", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as User;
    } else {
      return null;
    }
  },

  removeUser: async (id: string): Promise<boolean> => {
    try {
      await deleteDoc(doc(db, "Users", id));
      return true;
    } catch (error) {
      console.error("Error removing user:", error);
      return false;
    }
  },

  updateUserName: async (name: string, id: string): Promise<boolean> => {
    try {
      await updateDoc(doc(db, "Users", id), { name });
      return true;
    } catch (error) {
      console.error("Error updating user:", error);
      return false;
    }
  },
};
