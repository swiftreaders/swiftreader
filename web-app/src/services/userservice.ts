import {
  getFirestore,
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  getDoc,
  Timestamp,
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

  setReadingGoal: async (goal: number, id: string): Promise<boolean> => {
    try {
      await updateDoc(doc(db, "Users", id), { readingGoal: goal });
      return true;
    } catch (error) {
      console.error("Error setting reading goal:", error);
      return false;
    }
  },

  retrieveReadingAmount: async (id: string): Promise<number> => {
    try {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

      // Convert the JavaScript Date to a Firestore Timestamp
      const oneMonthAgoTimestamp = Timestamp.fromDate(oneMonthAgo);

      // Query reading sessions for the user within the last month
      const sessionsQuery = query(
        collection(db, "reading_sessions"),
        where("userId", "==", id),
        where("startTime", ">=", oneMonthAgoTimestamp)
      );

      const sessionsSnapshot = await getDocs(sessionsQuery);

      // Calculate the total reading amount
      let totalReadingAmount = 0;
      sessionsSnapshot.forEach((doc) => {
        const sessionData = doc.data();
        totalReadingAmount += sessionData.endTime - sessionData.startTime || 0;
      });

      return totalReadingAmount;
    } catch (error) {
      console.error("Error retrieving reading amount:", error);
      throw error;
    }
  },

  getReadingGoal: async (id: string): Promise<number> => {
    try {
      // Create a reference to the user document
      const userDocRef = doc(db, "Users", id);

      // Fetch the document data
      const userDocSnapshot = await getDoc(userDocRef);

      // Check if the document exists and return the reading goal
      if (userDocSnapshot.exists()) {
        const userData = userDocSnapshot.data();
        return userData.readingGoal || 0; // Default to 0 if readingGoal is not set
      } else {
        console.error("User document not found");
        return 0; // Return 0 if the document doesn't exist
      }
    } catch (error) {
      console.error("Error retrieving reading goal:", error);
      throw error; // Re-throw the error for handling upstream
    }
  },
};
