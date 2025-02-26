import {
  getFirestore,
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
  Timestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { app } from "@/../firebase.config";
import { User } from "@/types/user";
import { Session } from "@/types/sessions";

import { db } from "@/../firebase.config";

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
    console.log("Getting user with id:", id);
    const docRef = doc(db, "Users", id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return new User(
        docSnap.id,
        docSnap.data().name,
        docSnap.data().email,
        docSnap.data().isAdmin,
        docSnap.data().wpm,
        docSnap.data().joinDate,
        docSnap.data().readingGoal
      );
    } else {
      return null;
    }
  },

  updateUser: async (id: string, field: string, value: any): Promise<boolean> => {
    try {
      await updateDoc(doc(db, "Users", id), { [field]: value });
      return true; 
    } catch (error) {
      console.error("Error updating user:", error);
      return false;
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
        return userData.readingGoal || 1000; // Default to 1000 if readingGoal is not set
      } else {
        console.error("User document not found");
        return 1000; // Return 1000 if the document doesn't exist
      }
    } catch (error) {
      console.error("Error retrieving reading goal:", error);
      throw error; // Re-throw the error for handling upstream
    }
  },

  toggleAdmin: async (id: string, val: boolean): Promise<boolean> => {
    try {
      await updateDoc(doc(db, "Users", id), { isAdmin: val });
      return true;
    } catch (error) {
      console.error("Error making user admin:", error);
      return false;
    }
  },

  getUserReadingSessions: async (id: string): Promise<Session[]> => { 
    try {
      const sessionsQuery = query(
        collection(db, "ReadingSessions"),
        where("userId", "==", id)
      );
      const sessionsSnapshot = await getDocs(sessionsQuery);

      const sessions = sessionsSnapshot.docs.map((doc) => {
        const data = doc.data();
        
        // Create a new `Session` instance using the constructor
        return new Session(
          data.textId,
          data.userId,
          data.title,
          data.startTime,
          data.endTime,
          data.wpm,
          data.sessionType,
          data.difficulty,
          doc.id,
          data.results,
        );
      });
      return sessions;
    } catch (error) {
      console.error("Error getting user reading sessions:", error);
      return [];
    }
  }


};
