import fetch from 'node-fetch';
import { GoogleGenerativeAI } from "@google/generative-ai";


class BookService {

    // Helper function to find the index of the second occurrence of ***
    static findSecondAsterisk(text) {
        const firstIndex = text.indexOf('***');  // Find the first occurrence of ***
        if (firstIndex === -1) return -1; // If not found, return -1

        const secondIndex = text.indexOf('***', firstIndex + 3);  // Find the second occurrence of ***
        return secondIndex;
    }

    static findTxtUrl(data) {
        const symbols = Object.getOwnPropertySymbols(data);  // Get all symbols in the object

        // Find the symbol that corresponds to the "Response internals"
        const responseInternalsSymbol = symbols.find(symbol => symbol.toString() === 'Symbol(Response internals)');

        // Now, you can access the url from the internals
        const txt_url = responseInternalsSymbol ? data[responseInternalsSymbol].url : "NOT_FOUND";
        return txt_url;
    }

    static getFirst1000Words(text) {
        // Find the position of the second occurrence of ***
        const secondAsteriskIndex = BookService.findSecondAsterisk(text);

        if (secondAsteriskIndex !== -1) {
            // Slice the string from just after the second ***
            text = text.slice(secondAsteriskIndex + 3).trim(); // +3 to remove `***`
        }

        // Split the text into an array of words using space as the delimiter
        const words = text.split(/\s+/); // This splits the text into words (by spaces or any whitespace)

        // Get the first 1000 words
        const first1000Words = words.slice(0, 1000).join(' '); // Join them back into a string
        
        return first1000Words;
    }


    /// Retrieves book content by id and from the Gutendex API
    /// Returns: The first 1000 words of the book as a string
    static async getBookById(id) {
        const url = `http://gutendex.com/books/${id}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! First Status: ${response.status}`);
            }
            const data = await response.json();
            const book_content_link = data.formats["text/plain; charset=us-ascii"] ?? "NOT_FOUND";
            console.log("response: ", data);

            if (book_content_link == "NOT_FOUND") {
                return;
            } else {
                console.log("book utf8 url: " + book_content_link);
            }

            const text_data = await fetch(book_content_link);
            
            const txt_url = BookService.findTxtUrl(text_data);
            console.log("txt_url: ", txt_url);
            
            // Fetch the content
            const text_response = await fetch(txt_url);

            // Check if the response is successful
            if (text_response.ok) {
                // Use .text() to read the body as a string
                const text = await text_response.text();
                
                return BookService.getFirst1000Words(text);
            } else {
                console.error('Failed to fetch the content:', response.status, response.statusText);
                return;
            }
            
        } catch (error) {
            console.error('Error fetching book data:', error);
            throw error;
        }
    }

    static async getBookByTopic(topic) {
        const url = `http://gutendex.com/books/?mime_type=text/plain&copyright=false&languages=en&charset=utf-8&topic=${encodeURIComponent(topic)}`;

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            const ids = data.results?.map(result => result.id) || [];

            if (ids.length === 0) {
                throw new Error('No books found for this topic.');
            }

            return String(ids[Math.floor(Math.random() * ids.length)]);
        } catch (error) {
            console.error('Error fetching book data:', error);
            throw error;
        }
    }

    static async getParagraphFromText(text) {
        const api_key = "AIzaSyDrCjKtJ9qSIndeOaZCawig7E23NzbYyqc";
        const genAI = new GoogleGenerativeAI(api_key);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        // const MAX_TOKENS = 1000000;
 
        // const x = "from this text copy word for word 2 paragraphs of approximately 200-300 words from the start of a random chapter: " + text;
        // const prompt = x.slice(0, MAX_TOKENS)
        const result = await model.generateContent("");
        console.log(result.response.text());
        return result;
    }
}

(async () => {
    try {
        const book_id = await BookService.getBookByTopic("nature");
        const bookData = await BookService.getBookById(100);
        console.log('Book content: ', bookData);
        console.log('-------------');

        const test_string = "Book content:  The Complete Works of William Shakespeare by William Shakespeare Contents THE SONNETS ALL’S WELL THAT ENDS WELL THE TRAGEDY OF ANTONY AND CLEOPATRA AS YOU LIKE IT THE COMEDY OF ERRORS THE TRAGEDY OF CORIOLANUS CYMBELINE THE TRAGEDY OF HAMLET, PRINCE OF DENMARK THE FIRST PART OF KING HENRY THE FOURTH THE SECOND PART OF KING HENRY THE FOURTH THE LIFE OF KING HENRY THE FIFTH THE FIRST PART OF HENRY THE SIXTH THE SECOND PART OF KING HENRY THE SIXTH THE THIRD PART OF KING HENRY THE SIXTH KING HENRY THE EIGHTH THE LIFE AND DEATH OF KING JOHN THE TRAGEDY OF JULIUS CAESAR THE TRAGEDY OF KING LEAR LOVE’S LABOUR’S LOST THE TRAGEDY OF MACBETH MEASURE FOR MEASURE THE MERCHANT OF VENICE THE MERRY WIVES OF WINDSOR A MIDSUMMER NIGHT’S DREAM MUCH ADO ABOUT NOTHING THE TRAGEDY OF OTHELLO, THE MOOR OF VENICE PERICLES, PRINCE OF TYRE KING RICHARD THE SECOND KING RICHARD THE THIRD THE TRAGEDY OF ROMEO AND JULIET THE TAMING OF THE SHREW THE TEMPEST THE LIFE OF TIMON OF ATHENS THE TRAGEDY OF TITUS ANDRONICUS TROILUS AND CRESSIDA TWELFTH NIGHT; OR, WHAT YOU WILL THE TWO GENTLEMEN OF VERONA THE TWO NOBLE KINSMEN THE WINTER’S TALE A LOVER’S COMPLAINT THE PASSIONATE PILGRIM THE PHOENIX AND THE TURTLE THE RAPE OF LUCRECE VENUS AND ADONIS THE SONNETS 1 From fairest creatures we desire increase, That thereby beauty’s rose might never die, But as the riper should by time decease, His tender heir might bear his memory: But thou contracted to thine own bright eyes, Feed’st thy light’s flame with self-substantial fuel, Making a famine where abundance lies, Thyself thy foe, to thy sweet self too cruel: Thou that art now the world’s fresh ornament, And only herald to the gaudy spring, Within thine own bud"

        // const paragraphs = await BookService.getParagraphFromText("");
        // console.log('Book data', paragraphs);
    } catch (error) {
        console.error('Error:', error);
    }
})();

export default BookService;