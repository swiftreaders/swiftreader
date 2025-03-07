import { performance } from "perf_hooks";
import { writeFileSync, appendFileSync } from "fs";

// Import your service functions and types
import { fetchBooks, fetchBookContent } from "@/services/bookService";
import { fetchGeneratedTexts, summariseText } from "@/services/generateService";
import { Difficulty, Genre, Category, NewTextType } from "@/types/text";

// ---------- Stress Test Runner ----------

interface StressTestOptions {
  iterations: number;      // Total number of test iterations
  concurrency: number;     // Number of concurrent requests per batch
  delayBetweenBatches?: number; // Optional delay (in ms) between each batch
}

class StressTestRunner {
  private results: number[] = [];
  private errors: number = 0;

  constructor(
    private testName: string,
    private testFunction: () => Promise<any>,
    private options: StressTestOptions
  ) {}

  async runTest(): Promise<void> {
    const startMsg = `Starting stress test for ${this.testName} with ${this.options.iterations} iterations at concurrency ${this.options.concurrency}\n`;
    console.log(startMsg);
    appendFileSync("stress-test-results.txt", startMsg);

    let iterationsLeft = this.options.iterations;
    while (iterationsLeft > 0) {
      const batchSize = Math.min(this.options.concurrency, iterationsLeft);
      const batchPromises: Promise<void>[] = [];

      for (let i = 0; i < batchSize; i++) {
        const startTime = performance.now();
        const p = this.testFunction()
          .then(() => {
            const duration = performance.now() - startTime;
            this.results.push(duration);
          })
          .catch((err) => {
            const errorMsg = `Error in ${this.testName}: ${err}\n`;
            console.error(errorMsg);
            appendFileSync("stress-test-results.txt", errorMsg);
            this.errors++;
          });
        batchPromises.push(p);
      }
      await Promise.all(batchPromises);
      iterationsLeft -= batchSize;

      if (this.options.delayBetweenBatches) {
        await new Promise((res) => setTimeout(res, this.options.delayBetweenBatches));
      }
    }

    this.printResults();
  }

  printResults() {
    const total = this.results.length;
    const sum = this.results.reduce((acc, curr) => acc + curr, 0);
    const avg = total > 0 ? sum / total : 0;
    const sorted = [...this.results].sort((a, b) => a - b);
    const p95 = total > 0 ? sorted[Math.floor(total * 0.95)] : 0;
    const p99 = total > 0 ? sorted[Math.floor(total * 0.99)] : 0;

    const output = `
--- Results for ${this.testName} ---
Total Iterations: ${this.options.iterations}
Successful Responses: ${total}
Errors: ${this.errors}
Average Response Time: ${avg.toFixed(2)} ms
95th Percentile Response Time: ${p95.toFixed(2)} ms
99th Percentile Response Time: ${p99.toFixed(2)} ms
--------------------------------------
`;
    console.log(output);
    appendFileSync("stress-test-results.txt", output);
  }
}

// ---------- Sample Service Test Functions ----------

// 1. Test the fetchBooks service
async function testFetchBooks() {
  // Use a fixed genre and an empty list for existing texts
  return fetchBooks(Genre.FANTASY, []);
}

// 2. Test the fetchBookContent service
async function testFetchBookContent() {
  // Create a dummy book for testing.
  // Ensure the text_link is valid (or use a known test endpoint) to avoid false negatives.
  const dummyBook: NewTextType = {
    title: "Dummy Book",
    genre: Genre.FANTASY,
    difficulty: Difficulty.EASY,
    text_link: "https://example.com/sample.txt",
    content: "",
    questions: [],
    isValid: false,
    isAI: false,
    isFiction: true,
    category: Category.SCIENCE,
    wordLength: 0,
  };
  return fetchBookContent(dummyBook, 100, 200);
}

// 3. Test the fetchGeneratedTexts service
async function testFetchGeneratedTexts() {
  return fetchGeneratedTexts(Category.SCIENCE, 100, 200);
}

// 4. Test the summariseText service
async function testSummariseText() {
  const dummyText =
    "This is a long text intended to test the summarisation service. It should be long enough to simulate a real passage and allow for proper summary generation.";
  const dummyTitle = "Test Title";
  return summariseText(dummyText, dummyTitle);
}

// ---------- Main Runner ----------

async function runAllStressTests() {
  // Clear previous results
  writeFileSync("stress-test-results.txt", "Stress Test Results\n\n");

  // Define the stress test parameters (iterations, concurrency, etc.)
  const testOptions: StressTestOptions = {
    iterations: 100,      // Change as needed
    concurrency: 100,      // Change as needed
    delayBetweenBatches: 50, // 50ms delay between batches (optional)
  };

  // Create test runners for each service
  const runners = [
    new StressTestRunner("fetchBooks", testFetchBooks, testOptions),
    new StressTestRunner("fetchBookContent", testFetchBookContent, testOptions),
    new StressTestRunner("fetchGeneratedTexts", testFetchGeneratedTexts, testOptions),
    //new StressTestRunner("summariseText", testSummariseText, testOptions),
  ];

  // Run tests sequentially (or you can run in parallel if desired)
  for (const runner of runners) {
    await runner.runTest();
  }
}

// Execute stress tests if this script is run directly
if (require.main === module) {
  runAllStressTests().catch((err) => console.error("Error running stress tests:", err));
}
// ---------- End of Stress Test Framework ----------