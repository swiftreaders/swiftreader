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
import { User } from "@/types/text";


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
}
