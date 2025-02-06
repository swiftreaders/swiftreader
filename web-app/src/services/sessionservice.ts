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
    orderBy,
    limit,
    getDocs,
    query,
    where
} from "firebase/firestore";
import { Session } from "@/types/sessions";
import { app } from "@/firebaseConfig";
import { Category, Text } from "@/types/text";

const db = getFirestore(app);

// get recent sessions (last 10 sessions)
const getRecentSessions = (onUpdate: (sessions: Session[]) => void) => {
  const stubUserId = "Ss4hOp2vmTZkbV2H0w68";
  // Query the `ReadingSessions` collection for the last 10 sessions for the stubbed user
  const recentSessionsQuery = query(
    collection(db, "ReadingSessions"),
    where("userId", "==", stubUserId), // Filter by userId
    orderBy("startTime", "desc"),     // Order by `startTime` in descending order
    limit(10)                         // Limit to 10 results
  );

  // Set up the Firestore real-time listener
  const unsubscribe = onSnapshot(recentSessionsQuery, (snapshot) => {

    const sessions = snapshot.docs.map((doc) => {
      const data = doc.data();
      
      // Create a new `Session` instance using the constructor
      return new Session(
        data.textId,
        data.userId,
        data.title, // Default to "Untitled" if `title` is missing
        data.startTime,
        data.endTime,
        data.wpm,
        data.sessionType,
        data.difficulty,
        doc.id
      );
    });

    // Invoke the callback with the list of `Session` objects
    onUpdate(sessions);
  });

  // Return the unsubscribe function
  return unsubscribe;
};

// Add new session (after a session has finished)
const addSession = async (
    textId: string,
    userId: string,
    title: string,
    startTime: Date,
    endTime: Date,
    mode: string
  ): Promise<string> => {
    try {
      // Reference to the `ReadingSessions` collection
      const sessionsCollection = collection(db, "ReadingSessions");
  
      // Prepare the session data
      const sessionData = {
        textId,
        userId,
        title,
        startTime: Timestamp.fromDate(startTime), // Convert Date to Firestore Timestamp
        endTime: Timestamp.fromDate(endTime),    // Convert Date to Firestore Timestamp
        mode,
      };
  
      // Add the new session document to the collection
      const docRef = await addDoc(sessionsCollection, sessionData);
  
      // Return the new session's document ID
      return docRef.id;
    } catch (error) {
      console.error("Error adding session:", error);
      throw new Error("Failed to add session");
    }
  };

// getText(constraints) - gets a random one
const getText = async (constraints: { [key: string]: any }): Promise<Text | null> => {
    try {
      // Build the Firestore query with constraints
      const textsCollection = collection(db, "Texts");
      let q = query(textsCollection);
  
      // Add constraints (e.g., category, difficulty, isFiction)
      for (const [field, value] of Object.entries(constraints)) {
        if (field === "wordLength") {
          // Handle word length range filtering
          q = query(
            q,
            where("wordLength", ">=", value - 100), // Minimum length
            where("wordLength", "<=", value + 100) // Maximum length
          );
        } else {
          q = query(q, where(field, "==", value));
        }
      }
  
      // Fetch documents that match the constraints
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs;
  
      // If no matching documents, return null
      if (docs.length === 0) {
        return null;
      }
  
      // Pick a random document
      const randomDoc = docs[Math.floor(Math.random() * docs.length)];
      const data = randomDoc.data();
  
      // Create and return a `Text` instance
      return new Text(
        data.title,
        data.content,
        data.difficulty,
        data.isFiction,
        (data.isFiction ? data.genre : data.category),
        randomDoc.id,
        data.createdAt,
        data.updatedAt,
        data.wordLength
      );
    } catch (error) {
      console.error("Error fetching text:", error);
      throw new Error("Failed to fetch a random text");
    }
  };


export const sessionService = {
    getRecentSessions,
    addSession,
    getText
}

export default sessionService;