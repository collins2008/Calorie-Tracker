import { parseNaturalLanguage } from './src/lib/aiLogger';

const API_KEY = "AIzaSyAWamnvEUJruBMSssPoAnF7peRxNbG8njg";

const testCases = [
  "1 fist of Jollof rice with 2 pieces of chicken",
  "A large pepperoni pizza slice and a can of coke",
  "Ran for 45 minutes on the treadmill at a moderate pace",
  "3 slices of fried yam, 2 akara balls, and a big bowl of egusi soup with fish"
];

async function runTests() {
  console.log("Starting rigorous AI calorie estimation tests...\n");
  for (const query of testCases) {
    console.log(`================================`);
    console.log(`QUERY: "${query}"`);
    console.log(`================================`);
    try {
      // 80kg is our simulated user weight for the workout math
      const result = await parseNaturalLanguage(query, "2026-09-14", API_KEY, undefined, 80);
      console.log(JSON.stringify(result, null, 2));
    } catch (e: any) {
      console.error("Error:", e.message);
    }
    console.log("\n");
  }
}

runTests();
