import textService from "@/services/textService";
import { collection, doc, addDoc, updateDoc, deleteDoc, getDocs } from "firebase/firestore";

  describe("textService", () => {
    const text = {
      title: "New Text",
      content: "Some content",
      difficulty: "Medium",
      isFiction: true,
      genre: "Fantasy",
      createdAt: new Date(),
      updatedAt: new Date(),
      wordLength: 100,
      questions: [],
      toJSON: function () {
        return {
          title: this.title,
          content: this.content,
          difficulty: this.difficulty,
          isFiction: this.isFiction,
          genre: this.genre,
          createdAt: this.createdAt,
          updatedAt: this.updatedAt,
          wordLength: this.wordLength,
        };
      },
    };
  
    let consoleLogSpy: jest.SpyInstance;
    let consoleErrorSpy: jest.SpyInstance;
  
    beforeAll(() => {
      consoleLogSpy = jest.spyOn(console, "log").mockImplementation(() => {});
      consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
    });
  
    afterAll(() => {
      consoleLogSpy.mockRestore();
      consoleErrorSpy.mockRestore();
    });
  
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    test("should fetch texts by category", async () => {
      getDocs.mockResolvedValue({
        docs: [
          { id: "1", data: () => ({ title: "Text 1", category: "Science" }) },
          { id: "2", data: () => ({ title: "Text 2", category: "Science" }) },
        ],
      });
  
      const texts = await textService.getTextsByCategory("Science");
  
      expect(getDocs).toHaveBeenCalledTimes(1);
      expect(texts.length).toBe(2);
      expect(texts[0].title).toBe("Text 1");
    });
  
    test("should add a new text", async () => {
      addDoc.mockResolvedValue({ id: "12345" });
  
      const result = await textService.addText(text);
  
      expect(addDoc).toHaveBeenCalledTimes(1);
      expect(result).toBe(true);
    });
  
    test("should update text document", async () => {
      updateDoc.mockResolvedValue(undefined);
  
      const updatedText = {
        id: "12345",
        title: "Updated Title",
        content: "Updated content",
        difficulty: "Hard",
        isFiction: false,
        category: "History",
        updatedAt: new Date(),
        wordLength: 120,
        questions: [],
        toJSON: function () {
          return {
            title: this.title,
            content: this.content,
            difficulty: this.difficulty,
            isFiction: this.isFiction,
            genre: this.genre,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt,
            wordLength: this.wordLength,
          };
        },
      };
  
      const result = await textService.updateText(updatedText);
  
      expect(updateDoc).toHaveBeenCalledTimes(1);
      expect(result).toBe(true);
    });
  
    test("should delete a text document", async () => {
      deleteDoc.mockResolvedValue(undefined);
  
      const result = await textService.removeText("12345");
  
      expect(deleteDoc).toHaveBeenCalledTimes(1);
      expect(result).toBe(true);
    });
  
    test("should handle errors when adding text", async () => {
      addDoc.mockRejectedValue(new Error("Firestore error"));
  
      const result = await textService.addText(text);
  
      expect(addDoc).toHaveBeenCalledTimes(1);
      expect(result).toBe(false);
    });
  });
  