/*
 * Topic 1 · Programming & Logic Building — Problem 2 of 8
 * FizzBuzz   |   easy   |   Pattern: Conditionals in a loop
 *
 * JUDGE: https://leetcode.com/problems/fizz-buzz/
 *   This is the one problem in Topic 1 with an online judge. Think and iterate
 *   here, then paste fizzBuzz into LeetCode for the real verdict. There the
 *   method lives inside `class Solution` and is NOT static, so drop the
 *   `static` keyword when you paste.
 *
 * TASK
 *   Return a list of n strings, answer[i] for i from 1 to n, where:
 *     - "FizzBuzz"  if i is divisible by both 3 and 5
 *     - "Fizz"      if i is divisible by 3
 *     - "Buzz"      if i is divisible by 5
 *     - the number itself, as a string, otherwise
 *
 *   n = 15  ->  1, 2, Fizz, 4, Buzz, Fizz, 7, 8, Fizz, Buzz,
 *               11, Fizz, 13, 14, FizzBuzz
 *
 * BEFORE YOU WRITE CODE, ANSWER THESE OUT LOUD:
 *   1. How many strings does the returned list hold?
 *   2. Which condition must you test FIRST? Write the three tests in the wrong
 *      order on paper and trace i = 15 through them. What comes out, and why?
 *   3. The list is 0-indexed but the rules are stated for i from 1 to n.
 *      Which one does your loop counter follow, and where does the mismatch
 *      have to be absorbed?
 *   4. What is the time complexity?
 *   5. What is the space complexity? Careful — this one is NOT O(1), and the
 *      reason it differs from the star triangle is the whole lesson here.
 *
 * RULES
 *   - Think for 25 minutes before asking for hint 1.
 *   - Not done until you can state time AND space complexity.
 *
 * RUN:  java FizzBuzz.java
 */
import java.util.ArrayList;
import java.util.List;

public class FizzBuzz {

    /** Build the FizzBuzz list for 1..n. */
    static List<String> fizzBuzz(int n) {
        // YOUR CODE HERE
        return new ArrayList<>();
    }

    // ---------------------------------------------------------------
    // Test harness — do not edit. Run and compare against expected.
    // ---------------------------------------------------------------
    public static void main(String[] args) {
        check(15, "1, 2, Fizz, 4, Buzz, Fizz, 7, 8, Fizz, Buzz, 11, Fizz, 13, 14, FizzBuzz");
        check(5, "1, 2, Fizz, 4, Buzz");
        check(3, "1, 2, Fizz");
        check(1, "1");
        check(0, "");

        System.out.println("\n-- end --");
    }

    private static void check(int n, String expected) {
        String actual = String.join(", ", fizzBuzz(n));
        boolean pass = actual.equals(expected);
        System.out.println((pass ? "PASS" : "FAIL") + "  n = " + n);
        if (!pass) {
            System.out.println("      expected: " + expected);
            System.out.println("      actual:   " + actual);
        }
    }
}
