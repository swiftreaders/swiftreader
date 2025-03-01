import { Firestore, DocumentData, QuerySnapshot, DocumentSnapshot } from "firebase/firestore";

export const getFirestore = jest.fn((): Firestore => ({} as Firestore));

export const collection = jest.fn((db: Firestore, path: string) => ({ db, path }));

export const doc = jest.fn((db: Firestore, path: string, id?: string) => ({ db, path, id }));

export const onSnapshot = jest.fn(
  (query: any, callback: (snapshot: QuerySnapshot<DocumentData>) => void) => {
    callback({ docs: [] } as QuerySnapshot<DocumentData>);
    return jest.fn(); // Returns an unsubscribe function
  }
);

export const getDoc = jest.fn((docRef: any) =>
  Promise.resolve({
    exists: jest.fn(() => true),
    data: jest.fn(() => ({ title: "Mocked Document" })),
  } as DocumentSnapshot<DocumentData>)
);

export const getDocs = jest.fn((query: any) =>
  Promise.resolve({
    docs: [],
  } as QuerySnapshot<DocumentData>)
);

export const addDoc = jest.fn((collectionRef: any, data: any) =>
  Promise.resolve({ id: "mocked-doc-id" })
);

export const updateDoc = jest.fn(() => Promise.resolve());

export const deleteDoc = jest.fn(() => Promise.resolve());

export const query = jest.fn();

export const where = jest.fn();

export const orderBy = jest.fn();

export const limit = jest.fn();

export const Timestamp = {
  fromDate: jest.fn((date: Date) => date),
  fromMillis: jest.fn(() => new Date()),
};

export const deleteField = jest.fn();
